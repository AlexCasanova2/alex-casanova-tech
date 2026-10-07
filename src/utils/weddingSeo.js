import { weddingLandings } from '../config/weddingLanding.js'

export const weddingAlternates = Object.entries(weddingLandings).map(([lang, copy]) => [lang, copy.path])

export function weddingServiceSchema(lang) {
  const copy = weddingLandings[lang] || weddingLandings.es
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: copy.labels.serviceName,
    serviceType: copy.labels.serviceType,
    description: copy.description,
    url: `https://alexcasanova.es${copy.path}`,
    provider: { '@type': 'ProfessionalService', name: 'Casanova studio', url: 'https://alexcasanova.es/' },
    areaServed: { '@type': 'Country', name: 'España' }
  }
}
