import { next } from '@vercel/functions'
import { readAdminCookie, verifyAdminToken } from './api/admin-auth.js'

export default async function proxy(request) {
  const authorized = await verifyAdminToken(readAdminCookie(request.headers.get('cookie')))
  if (!authorized) return new Response('Not Found', {
    status:404,
    headers:{ 'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive' }
  })
  return next({ headers:{ 'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive' } })
}
