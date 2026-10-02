import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './admin-session.js'
import { verifyAdminToken } from './admin-auth.js'

vi.mock('./admin-auth.js', async importOriginal => ({ ...(await importOriginal()), verifyAdminToken:vi.fn() }))

const response = () => {
  const res = { headers:{}, statusCode:200 }
  res.setHeader = (name, value) => { res.headers[name] = value }
  res.status = code => { res.statusCode = code; return res }
  res.json = body => { res.body = body; return res }
  res.end = () => res
  return res
}

describe('admin session endpoint', () => {
  beforeEach(() => vi.mocked(verifyAdminToken).mockReset())

  it('rejects public requests without a valid owner cookie', async () => {
    vi.mocked(verifyAdminToken).mockResolvedValue(false)
    const res = response()
    await handler({method:'GET',headers:{}}, res)
    expect(res.statusCode).toBe(401)
    expect(res.headers['X-Robots-Tag']).toContain('noindex')
    expect(res.headers['Cache-Control']).toContain('no-store')
  })

  it('requires a same-origin, verified owner token before setting a secure cookie', async () => {
    vi.mocked(verifyAdminToken).mockResolvedValue(true)
    const invalid = response()
    await handler({method:'POST',headers:{origin:'https://attacker.test',host:'alexcasanova.es'},body:{accessToken:'header.payload.signature'}}, invalid)
    expect(invalid.statusCode).toBe(403)
    expect(verifyAdminToken).not.toHaveBeenCalled()

    const valid = response()
    await handler({method:'POST',headers:{origin:'https://alexcasanova.es',host:'alexcasanova.es'},body:{accessToken:'header.payload.signature'}}, valid)
    expect(valid.statusCode).toBe(200)
    expect(valid.headers['Set-Cookie']).toMatch(/HttpOnly; Secure; SameSite=Strict/)
  })

  it('removes the cookie on logout', async () => {
    const res = response()
    await handler({method:'DELETE',headers:{}}, res)
    expect(res.statusCode).toBe(204)
    expect(res.headers['Set-Cookie']).toContain('Max-Age=0')
  })
})
