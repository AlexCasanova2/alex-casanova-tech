export const submissionKey = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function leadAttribution() {
  const params = new URLSearchParams(window.location.search)
  return {
    landing:window.location.href,
    referrer:document.referrer,
    utm_source:params.get('utm_source') || '',
    utm_medium:params.get('utm_medium') || '',
    utm_campaign:params.get('utm_campaign') || ''
  }
}

export function trackLeadEvent(name, parameters = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', name, parameters)
}

export async function submitLead(payload) {
  const response = await fetch('/api/leads', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Accept:'application/json' },
    body:JSON.stringify(payload)
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Unable to submit lead')
  return result
}
