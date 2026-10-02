import { ADMIN_COOKIE, readAdminCookie, verifyAdminToken } from './admin-auth.js'

const privateHeaders = res => {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
}

export default async function handler(req, res) {
  privateHeaders(res)
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)
    return res.status(204).end()
  }
  if (req.method === 'GET') {
    const authorized = await verifyAdminToken(readAdminCookie(req.headers.cookie))
    return res.status(authorized ? 200 : 401).json({ ok:authorized })
  }
  if (req.method !== 'POST') return res.status(405).json({ ok:false })

  // Only the site itself may exchange a Supabase access token for this cookie.
  let sameOrigin = false
  try { sameOrigin = new URL(req.headers.origin).host === req.headers.host } catch { /* Reject missing or invalid origins. */ }
  if (!sameOrigin) return res.status(403).json({ ok:false })
  const token = typeof req.body?.accessToken === 'string' ? req.body.accessToken : ''
  if (!await verifyAdminToken(token)) return res.status(403).json({ ok:false })
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
  return res.status(200).json({ ok:true })
}
