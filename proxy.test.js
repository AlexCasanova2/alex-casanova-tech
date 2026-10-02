import { describe, expect, it, vi } from 'vitest'
import proxy from './proxy.js'
import { verifyAdminToken } from './api/admin-auth.js'
import { next } from '@vercel/functions'

vi.mock('./api/admin-auth.js', async importOriginal => ({ ...(await importOriginal()), verifyAdminToken:vi.fn() }))
vi.mock('@vercel/functions', () => ({ next:vi.fn(() => new Response('private admin')) }))

describe('admin route gate', () => {
  it('returns noindex 404 without a verified owner', async () => {
    vi.mocked(verifyAdminToken).mockResolvedValue(false)
    const response = await proxy(new Request('https://alexcasanova.es/admin'))
    expect(response.status).toBe(404)
    expect(response.headers.get('X-Robots-Tag')).toContain('noindex')
    expect(response.headers.get('Cache-Control')).toContain('no-store')
    expect(next).not.toHaveBeenCalled()
  })

  it('continues only for a verified owner with private noindex headers', async () => {
    vi.mocked(verifyAdminToken).mockResolvedValue(true)
    const response = await proxy(new Request('https://alexcasanova.es/admin', {headers:{cookie:'__Host-admin_session=header.payload.signature'}}))
    expect(response.status).toBe(200)
    expect(verifyAdminToken).toHaveBeenLastCalledWith('header.payload.signature')
    expect(next).toHaveBeenCalledWith({headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive'}})
  })
})
