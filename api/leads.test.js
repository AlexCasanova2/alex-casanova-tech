import { describe, expect, it, vi } from 'vitest'
import nodemailer from 'nodemailer'
import { isAllowedOrigin, sendNotification, smtpSettings } from './leads.js'

vi.mock('nodemailer', () => ({ default:{ createTransport:vi.fn() } }))

describe('lead origin validation', () => {
  it('allows the new domain with and without www', () => {
    expect(isAllowedOrigin('https://alexcasanova.es')).toBe(true)
    expect(isAllowedOrigin('https://www.alexcasanova.es')).toBe(true)
  })

  it('rejects the old domain and unrelated origins', () => {
    expect(isAllowedOrigin('https://alexcasanova.tech')).toBe(false)
    expect(isAllowedOrigin('https://other.example')).toBe(false)
  })

  it('preserves local and preview requests', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('https://portfolio-preview.vercel.app')).toBe(true)
    expect(isAllowedOrigin(undefined)).toBe(true)
  })
})

describe('SMTP configuration', () => {
  it('does not send when no SMTP server is configured', () => {
    expect(smtpSettings({})).toBeNull()
  })

  it('uses implicit TLS on port 465 and STARTTLS on port 587', () => {
    const env = { SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }
    expect(smtpSettings({ ...env, SMTP_PORT:'465' })).toEqual({ host:env.SMTP_HOST, port:465, secure:true, auth:{ user:env.SMTP_USER, pass:env.SMTP_PASSWORD } })
    expect(smtpSettings(env).secure).toBe(false)
  })

  it('rejects incomplete or invalid configuration', () => {
    expect(() => smtpSettings({ SMTP_HOST:'smtp.example.com' })).toThrow('Incomplete SMTP configuration')
    expect(() => smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret', SMTP_PORT:'invalid' })).toThrow('Invalid SMTP port')
  })

  it('sends owner notification and visitor confirmation through SMTP', async () => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['test@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    const settings = smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' })
    await sendNotification({ name:'Ana', email:'ana@example.com', source:'contact', language:'es', message:'Hola' }, { custom:true }, settings)
    expect(nodemailer.createTransport).toHaveBeenCalledWith(settings)
    expect(sendMail).toHaveBeenCalledTimes(2)
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to:['hola@alexcasanova.es'], replyTo:'ana@example.com' }))
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to:['ana@example.com'] }))
  })

  it('sends English enquiries an English confirmation', async () => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['guest@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    await sendNotification({ name:'Sam', email:'guest@example.com', source:'contact', language:'en', message:'Wedding website' }, { custom:true }, smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }))
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to:['guest@example.com'], subject:'I have received your enquiry', text:expect.stringContaining('I will review it personally')
    }))
  })
  it.each(['contact', 'configurator'].flatMap(source => ['es', 'ca', 'en'].map(language => [source, language])))('includes a linked HTML signature and plain text alternative for %s in %s', async (source, language) => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['ana@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    await sendNotification({ name:'Ana', email:'ana@example.com', source, language, message:'' }, { custom:true }, smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }))
    const visitorMessage = sendMail.mock.calls.find(([message]) => message.to.includes('ana@example.com'))[0]
    expect(visitorMessage.text).toContain('Àlex Casanova\nDesarrollador Web Freelance\n\n🌐 www.alexcasanova.es\n✉️ hola@alexcasanova.es\n\nDiseño · Desarrollo · SEO · Automatización')
    expect(visitorMessage.html).toContain('<strong>Àlex Casanova</strong><br>Desarrollador Web Freelance')
    expect(visitorMessage.html).toContain('<a href="https://www.alexcasanova.es">www.alexcasanova.es</a>')
    expect(visitorMessage.html).toContain('<a href="mailto:hola@alexcasanova.es">hola@alexcasanova.es</a>')
    expect(visitorMessage.html).toContain('<em>Diseño · Desarrollo · SEO · Automatización</em>')
    expect(visitorMessage.html.match(/Àlex Casanova/g)).toHaveLength(1)
  })
  it('escapes visitor names in the HTML confirmation', async () => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['ana@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    const name = 'Ana <img src=x> & "equipo" \'web\''
    await sendNotification({ name, email:'ana@example.com', source:'contact', language:'es', message:'' }, { custom:true }, smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }))
    const visitorMessage = sendMail.mock.calls.find(([message]) => message.to.includes('ana@example.com'))[0]
    expect(visitorMessage.text).toContain(name)
    expect(visitorMessage.html).toContain('Ana &lt;img src=x&gt; &amp; &quot;equipo&quot; &#39;web&#39;')
    expect(visitorMessage.html).not.toContain('<img')
  })
  it.each(['es', 'ca', 'en'])('does not send estimates to contact visitors in %s', async language => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['ana@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    await sendNotification({ name:'Ana', email:'ana@example.com', source:'contact', language, message:'' }, { custom:true }, smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }))
    const ownerMessage = sendMail.mock.calls.find(([message]) => message.to.includes('hola@alexcasanova.es'))[0]
    const visitorMessage = sendMail.mock.calls.find(([message]) => message.to.includes('ana@example.com'))[0]
    expect(ownerMessage.text).toContain('Estimación:')
    expect(visitorMessage.text).not.toMatch(/estimaci[oó]|estimate|valoraci[oó]|personalised estimate/i)
    expect(visitorMessage.html).not.toMatch(/estimaci[oó]|estimate|valoraci[oó]|personalised estimate/i)
    expect(visitorMessage.text).toContain('Àlex Casanova')
  })
  it.each(['es', 'ca'])('does not send indicative prices to configurator visitors in %s', async language => {
    const sendMail = vi.fn().mockResolvedValue({ accepted:['ana@example.com'] })
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail })
    await sendNotification({ name:'Ana', email:'ana@example.com', source:'configurator', language, message:'' }, { custom:false, netMin:700, netMax:1000 }, smtpSettings({ SMTP_HOST:'smtp.example.com', SMTP_USER:'test@example.com', SMTP_PASSWORD:'secret' }))
    const ownerMessage = sendMail.mock.calls.find(([message]) => message.to.includes('hola@alexcasanova.es'))[0]
    const visitorMessage = sendMail.mock.calls.find(([message]) => message.to.includes('ana@example.com'))[0]
    expect(ownerMessage.text).toContain('700–1000 EUR')
    expect(visitorMessage.text).not.toMatch(/700|1000|estimaci[oó]|forquilla|horquilla/i)
    expect(visitorMessage.text).toMatch(/propuesta personalizada|proposta personalitzada/)
  })
})
