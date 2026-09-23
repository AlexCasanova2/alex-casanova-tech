import { createClient } from '@supabase/supabase-js'

const pages = {
  '/es/diseno-web-empresas': { lang:'es', alternate:'/ca/disseny-web-empreses', title:'Diseño web para empresas | Àlex Casanova', description:'Diseño y desarrollo de webs corporativas a medida para empresas. Proyectos desde 700 € antes de IVA.', heading:'Una web corporativa que trabaja tan bien como tu negocio.', body:'Diseño web a medida, rápido y preparado para convertir visitas en oportunidades.' },
  '/ca/disseny-web-empreses': { lang:'ca', alternate:'/es/diseno-web-empresas', title:'Disseny web per a empreses | Àlex Casanova', description:'Disseny i desenvolupament de webs corporatives a mida per a empreses. Projectes des de 700 € abans d’IVA.', heading:'Una web corporativa que treballa tan bé com el teu negoci.', body:'Disseny web a mida, ràpid i preparat per convertir visites en oportunitats.' },
  '/es/precio-pagina-web': { lang:'es', alternate:'/ca/preu-pagina-web', title:'Precio de una página web corporativa | Àlex Casanova', description:'Descubre cuánto cuesta una web corporativa y calcula una estimación según páginas, idiomas y funcionalidades.', heading:'¿Cuánto cuesta una web corporativa?', body:'Una web sencilla parte de 700 € antes de IVA. Calcula una horquilla según el alcance.' },
  '/ca/preu-pagina-web': { lang:'ca', alternate:'/es/precio-pagina-web', title:'Preu d’una pàgina web corporativa | Àlex Casanova', description:'Descobreix quant costa una web corporativa i calcula una estimació segons pàgines, idiomes i funcionalitats.', heading:'Quant costa una web corporativa?', body:'Una web senzilla parteix de 700 € abans d’IVA. Calcula una forquilla segons l’abast.' },
  '/es/presupuesto-web': { lang:'es', alternate:'/ca/pressupost-web', title:'Calcula el presupuesto de tu página web | Àlex Casanova', description:'Configura tu web corporativa y obtén al momento una estimación orientativa antes de IVA.', heading:'Ponle números a tu próxima web.', body:'Configura el alcance y obtén una estimación orientativa al momento.' },
  '/ca/pressupost-web': { lang:'ca', alternate:'/es/presupuesto-web', title:'Calcula el pressupost de la teva pàgina web | Àlex Casanova', description:'Configura la teva web corporativa i obtén al moment una estimació orientativa abans d’IVA.', heading:'Posa números a la teva pròxima web.', body:'Configura l’abast i obtén una estimació orientativa al moment.' }
}

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]))

export default async function handler(req, res) {
  const path = `/${String(req.query.path || '').replace(/^\/+|\/+$/g, '')}`
  const page = pages[path]
  if (!page) return res.status(404).send('Not found')
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const response = await fetch(`${protocol}://${host}/index.html`)
    let html = await response.text()
    let basePrice = 700
    if (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.CRM_OWNER_ID) {
      const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false } })
      const { data } = await supabase.from('lead_pricing_versions').select('config').eq('owner_id', process.env.CRM_OWNER_ID).eq('is_active', true).maybeSingle()
      if (Number.isFinite(Number(data?.config?.basePrice))) basePrice = Number(data.config.basePrice)
    }
    const localizedPrice = new Intl.NumberFormat(page.lang === 'ca' ? 'ca-ES' : 'es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(basePrice)
    const description = page.description.replace('700 €', localizedPrice)
    const body = page.body.replace('700 €', localizedPrice)
    const canonical = `https://alexcasanova.tech${path}`
    const alternate = `https://alexcasanova.tech${page.alternate}`
    html = html.replace('<html lang="es">', `<html lang="${page.lang}">`)
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
      .replace(/(<meta name="description"\s+content=")([^"]*)("\s*\/?>)/i, `$1${escapeHtml(description)}$3`)
      .replace(/(<link rel="canonical" href=")([^"]*)("\s*\/?>)/i, `$1${canonical}$3`)
      .replace(/(property="og:url"\s+content=")([^"]*)(")/gi, `$1${canonical}$3`)
      .replace(/(property="og:title"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(page.title)}$3`)
      .replace(/(property="og:description"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(description)}$3`)
      .replace(/(property="twitter:url"\s+content=")([^"]*)(")/gi, `$1${canonical}$3`)
      .replace(/(property="twitter:title"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(page.title)}$3`)
      .replace(/(property="twitter:description"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(description)}$3`)
      .replace('</head>', `<link rel="alternate" hreflang="${page.lang === 'es' ? 'ca' : 'es'}" href="${alternate}"><script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'ProfessionalService', name:'Àlex Casanova · Diseño web', url:canonical, areaServed:['ES','Catalunya'], priceRange:'€€' })}</script></head>`)
      .replace('<div id="app"></div>', `<div id="app"><main><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(body)}</p></main></div>`)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
    return res.status(200).send(html)
  } catch (error) {
    console.error('Static SEO error:', error)
    return res.status(500).send('Unable to render page')
  }
}
