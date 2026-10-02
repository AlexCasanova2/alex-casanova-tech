import { describe, expect, it, vi } from 'vitest'
import { ADMIN_COOKIE, readAdminCookie, verifyAdminToken } from './admin-auth.js'

const token = 'header.payload.signature'
const env = { SUPABASE_URL:'https://project.supabase.co', VITE_SUPABASE_ANON_KEY:'public-key', CRM_OWNER_ID:'owner-id' }

describe('private admin authentication', () => {
  it('accepts only a validated token belonging to the configured owner', async () => {
    const request = vi.fn().mockResolvedValue({ ok:true, json:async () => ({ id:'owner-id' }) })
    expect(await verifyAdminToken(token, env, request)).toBe(true)
    expect(request).toHaveBeenCalledWith(new URL('https://project.supabase.co/auth/v1/user'), expect.objectContaining({
      headers:{ apikey:'public-key', Authorization:`Bearer ${token}` }, cache:'no-store'
    }))
    request.mockResolvedValue({ ok:true, json:async () => ({ id:'someone-else' }) })
    expect(await verifyAdminToken(token, env, request)).toBe(false)
  })

  it('fails closed for invalid, expired or unconfigured sessions', async () => {
    const request = vi.fn().mockResolvedValue({ ok:false })
    expect(await verifyAdminToken(token, env, request)).toBe(false)
    expect(await verifyAdminToken('forged;cookie', env, request)).toBe(false)
    expect(await verifyAdminToken(token, { ...env, CRM_OWNER_ID:'' }, request)).toBe(false)
    expect(request).toHaveBeenCalledOnce()
  })

  it('reads only the exact admin cookie', () => {
    expect(readAdminCookie(`other=abc; ${ADMIN_COOKIE}=${token}; another=xyz`)).toBe(token)
    expect(readAdminCookie(`other${ADMIN_COOKIE}=${token}`)).toBe('')
  })
})
