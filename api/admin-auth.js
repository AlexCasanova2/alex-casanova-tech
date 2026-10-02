export const ADMIN_COOKIE = '__Host-admin_session'

export function readAdminCookie(header = '') {
  const entry = (header || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${ADMIN_COOKIE}=`))
  return entry?.slice(ADMIN_COOKIE.length + 1) || ''
}

export async function verifyAdminToken(token, env = process.env, request = fetch) {
  if (!token || token.length > 8192 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
    || !env.SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.CRM_OWNER_ID) return false
  try {
    const response = await request(new URL('/auth/v1/user', env.SUPABASE_URL), {
      headers:{ apikey:env.VITE_SUPABASE_ANON_KEY, Authorization:`Bearer ${token}` },
      signal:AbortSignal.timeout(5000),
      cache:'no-store'
    })
    if (!response.ok) return false
    const user = await response.json()
    return user.id === env.CRM_OWNER_ID
  } catch {
    return false
  }
}
