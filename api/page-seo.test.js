import { describe, expect, it } from 'vitest'
import { renderSeoHtml } from './page-seo.js'
import { weddingLanding } from '../src/config/weddingLanding.js'

const html = `<!DOCTYPE html><html lang="es"><head>
<title>Inicio</title><meta name="title" content="Inicio"><meta name="description" content="Inicio">
<link rel="canonical" href="https://alexcasanova.es/">
<meta property="og:url" content="https://alexcasanova.es/"><meta property="og:title" content="Inicio"><meta property="og:description" content="Inicio">
<meta property="twitter:url" content="https://alexcasanova.es/"><meta property="twitter:title" content="Inicio"><meta property="twitter:description" content="Inicio">
</head><body><div id="app"></div></body></html>`

describe('commercial page SEO', () => {
  it('renders the wedding landing with a canonical, description, full crawlable content and service schema', () => {
    const result = renderSeoHtml(html, '/es/web-para-bodas')
    expect(result).toContain(`<title>${weddingLanding.title}</title>`)
    expect(result).toContain('<html lang="es" data-theme="light">')
    expect(result).toContain(`content="${weddingLanding.description}"`)
    expect(result).toContain('rel="canonical" href="https://alexcasanova.es/es/web-para-bodas"')
    expect(result).toContain(`property="og:url" content="https://alexcasanova.es/es/web-para-bodas"`)
    expect(result).toContain(`<h1>${weddingLanding.heading}</h1>`)
    for (const feature of weddingLanding.features) expect(result).toContain(`<h3>${feature.title}</h3>`)
    expect(result).toContain(`<h2>${weddingLanding.example.title}</h2>`)
    expect(result).toContain(`href="${weddingLanding.example.url}"`)
    expect(result).toContain(weddingLanding.example.note)
    for (const faq of weddingLanding.faqs) expect(result).toContain(`<h3>${faq.question}</h3>`)
    expect(result).toContain('"@type":"Service"')
    expect(result).not.toContain('rel="alternate"')
  })

  it('keeps alternate language links for existing bilingual pages', () => {
    const result = renderSeoHtml(html, '/es/diseno-web-empresas')
    expect(result).toContain('hreflang="ca" href="https://alexcasanova.es/ca/disseny-web-empreses"')
  })

  it('does not render unknown pages', () => {
    expect(renderSeoHtml(html, '/es/no-existe')).toBeNull()
  })
})
