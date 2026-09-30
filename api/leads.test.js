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
})
