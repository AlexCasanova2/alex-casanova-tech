import { createClient } from '@supabase/supabase-js'
import { defaultLeadPricing, normalizePricing } from '../src/config/leadPricing.js'
import { calculateLeadEstimate } from '../src/utils/leadEstimate.js'

const attempts = new Map()
const allowedLanguages = new Set(['es', 'ca'])
const allowedStatuses = new Set(['contact', 'configurator'])
const allowedProjectTypes = new Set(['new', 'redesign', 'other'])
const allowedPages = new Set(['one', 'small', 'medium', 'custom'])
const allowedExtras = new Set(['cms', 'blog', 'booking', 'integration', 'copywriting', 'branding'])
const allowedTimelines = new Set(['flexible', 'soon', 'urgent'])

const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
const validUrl = value => {
  if (!value) return true
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

function getServerClient() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || !process.env.CRM_OWNER_ID) throw new Error('Lead capture is not configured')
  return createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } })
}

async function activePricing(client) {
  const { data, error } = await client.from('lead_pricing_versions').select('id,version,config').eq('owner_id', process.env.CRM_OWNER_ID).eq('is_active', true).maybeSingle()
  if (error) throw error
  return data || { id:null, version:0, config:defaultLeadPricing }
}

function rateLimited(req) {
  const ip = clean(req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown', 80)
  const now = Date.now()
  const recent = (attempts.get(ip) || []).filter(time => now - time < 60 * 60 * 1000)
  recent.push(now)
  attempts.set(ip, recent)
  return recent.length > 8
}

async function sendNotification(lead, estimate) {
  if (!process.env.RESEND_API_KEY) return
  const from = process.env.LEADS_FROM_EMAIL || 'Portfolio <leads@alexcasanova.tech>'
  const ownerEmail = process.env.LEADS_NOTIFICATION_EMAIL || 'hola@alexcasanova.tech'
  const amount = estimate.custom ? 'Valoración personalizada' : `${estimate.netMin}–${estimate.netMax} EUR + IVA`
  const text = `Nuevo lead: ${lead.name}\nEmail: ${lead.email}\nOrigen: ${lead.source}\nEstimación: ${amount}\n\n${lead.message || 'Sin mensaje adicional.'}`
  const confirmation = lead.language === 'ca'
    ? `Hola ${lead.name},\n\nHe rebut la teva sol·licitud. La revisaré personalment i et respondré al més aviat possible.\n\nEstimació orientativa: ${amount}.\n\nÀlex Casanova`
    : `Hola ${lead.name},\n\nHe recibido tu solicitud. La revisaré personalmente y te responderé lo antes posible.\n\nEstimación orientativa: ${amount}.\n\nÀlex Casanova`
  const messages = [
    { from, to:[ownerEmail], subject:`Nuevo lead web: ${lead.name}`, text },
    { from, to:[lead.email], subject:lead.language === 'ca' ? 'He rebut la teva sol·licitud' : 'He recibido tu solicitud', text:confirmation }
  ]
  await Promise.all(messages.map(body => fetch('https://api.resend.com/emails', {
    method:'POST', headers:{ Authorization:`Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type':'application/json' }, body:JSON.stringify(body)
  }).then(response => { if (!response.ok) throw new Error(`Email delivery failed (${response.status})`) })))
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    const origin = req.headers.origin
    if (origin && !/^https:\/\/(www\.)?alexcasanova\.tech$/.test(origin) && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) && !/^http:\/\/localhost:\d+$/.test(origin) && !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return res.status(403).json({ error:'Origin not allowed' })
    const client = getServerClient()
    if (req.method === 'GET') {
      const pricing = await activePricing(client)
      return res.status(200).json({ version:pricing.version, config:normalizePricing(pricing.config) })
    }
    if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' })
    if (rateLimited(req)) return res.status(429).json({ error:'Too many requests' })

    const body = req.body && typeof req.body === 'object' ? req.body : {}
    if (clean(body.companyName)) return res.status(200).json({ ok:true })
    const elapsed = Date.now() - Number(body.startedAt)
    if (!Number.isFinite(elapsed) || elapsed < 1500 || elapsed > 86400000) return res.status(400).json({ error:'Invalid form session' })

    const name = clean(body.name, 120)
    const email = clean(body.email, 254).toLowerCase()
    const company = clean(body.company, 160)
    let website = clean(body.website, 500)
    const message = clean(body.message, 4000)
    const language = allowedLanguages.has(body.language) ? body.language : 'es'
    const source = allowedStatuses.has(body.source) ? body.source : 'contact'
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
    if (name.length < 2 || !validEmail(email) || !validUrl(website) || body.privacyAccepted !== true) return res.status(422).json({ error:'Invalid lead data' })

    const answers = source === 'configurator' ? {
      projectType:allowedProjectTypes.has(body.answers?.projectType) ? body.answers.projectType : 'new',
      pages:allowedPages.has(body.answers?.pages) ? body.answers.pages : 'one',
      extras:Array.isArray(body.answers?.extras) ? [...new Set(body.answers.extras.filter(value => allowedExtras.has(value)))] : [],
      extraLanguage:Boolean(body.answers?.extraLanguage),
      maintenance:Boolean(body.answers?.maintenance),
      timeline:allowedTimelines.has(body.answers?.timeline) ? body.answers.timeline : 'flexible'
    } : {}
    const pricing = await activePricing(client)
    const estimate = source === 'configurator' ? calculateLeadEstimate(answers, pricing.config) : { custom:true, items:[] }
    const lead = {
      owner_id:process.env.CRM_OWNER_ID,
      submission_key:clean(body.submissionKey, 100),
      source,
      language,
      name,
      email,
      company:company || null,
      website:website || null,
      message:message || null,
      project_data:answers,
      estimate_snapshot:{ ...estimate, pricingVersion:pricing.version },
      pricing_version_id:pricing.id,
      attribution:{
        landing:clean(body.attribution?.landing, 500),
        referrer:clean(body.attribution?.referrer, 500),
        utm_source:clean(body.attribution?.utm_source, 100),
        utm_medium:clean(body.attribution?.utm_medium, 100),
        utm_campaign:clean(body.attribution?.utm_campaign, 160)
      },
      privacy_accepted_at:new Date().toISOString()
    }
    if (lead.submission_key.length < 10) return res.status(422).json({ error:'Invalid submission key' })
    const { data, error } = await client.from('leads').upsert(lead, { onConflict:'owner_id,submission_key', ignoreDuplicates:true }).select('id').maybeSingle()
    if (error) throw error
    if (data && process.env.RESEND_API_KEY) {
      try {
        await sendNotification(lead, estimate)
        await client.from('leads').update({ email_delivery:{ status:'sent', attempted_at:new Date().toISOString() } }).eq('id', data.id)
      } catch (emailError) {
        console.error('Lead email error:', emailError)
        await client.from('leads').update({ email_delivery:{ status:'failed', attempted_at:new Date().toISOString(), error:emailError.message.slice(0, 200) } }).eq('id', data.id)
      }
    }
    return res.status(201).json({ ok:true, id:data?.id || null, estimate })
  } catch (error) {
    console.error('Lead capture error:', error)
    return res.status(500).json({ error:'Unable to process the request' })
  }
}
