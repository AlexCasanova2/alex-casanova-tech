import { describe, expect, it } from 'vitest'
import { renderSeoHtml } from './page-seo.js'
import { weddingLanding, weddingLandings } from '../src/config/weddingLanding.js'

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
    expect(result).toContain('<section id="contacto-bodas">')
    expect(result).toContain('href="#contacto-bodas"')
    for (const faq of weddingLanding.faqs) expect(result).toContain(`<h3>${faq.question}</h3>`)
    expect(result).toContain('"@type":"Service"')
    expect(result).toContain('hreflang="ca" href="https://alexcasanova.es/ca/webs-per-a-casaments"')
    expect(result).toContain('hreflang="en" href="https://alexcasanova.es/en/wedding-websites"')
  })

  for (const [lang, copy] of Object.entries(weddingLandings)) {
    it(`renders ${lang} wedding content, canonical and alternate languages`, () => {
      const result = renderSeoHtml(html, copy.path)
      expect(result).toContain(`<html lang="${lang}" data-theme="light">`)
      expect(result).toContain(`<title>${copy.title}</title>`)
      expect(result).toContain(`rel="canonical" href="https://alexcasanova.es${copy.path}"`)
      expect(result).toContain(`<h2>${copy.labels.featuresTitle}</h2>`)
      expect(result).toContain(`<h2>${copy.labels.faqTitle}</h2>`)
      expect(result).toContain(`<h2>${copy.labels.closingTitle}</h2>`)
      expect(result).toContain(copy.example.note)
      for (const feature of copy.features) expect(result).toContain(`<h3>${feature.title}</h3>`)
      for (const faq of copy.faqs) expect(result).toContain(`<h3>${faq.question}</h3>`)
      for (const [otherLang, otherCopy] of Object.entries(weddingLandings)) {
        if (lang !== otherLang) expect(result).toContain(`hreflang="${otherLang}" href="https://alexcasanova.es${otherCopy.path}"`)
      }
      expect(result).not.toContain('hreflang="' + lang + '"')
    })
  }

  it('keeps alternate language links for existing bilingual pages', () => {
    const result = renderSeoHtml(html, '/es/diseno-web-empresas')
    expect(result).toContain('hreflang="ca" href="https://alexcasanova.es/ca/disseny-web-empreses"')
  })

  it.each(['/es/presupuesto-web', '/ca/pressupost-web'])('describes a personal proposal rather than an instant estimate on %s', path => {
    const result = renderSeoHtml(html, path)
    expect(result).toMatch(/propuesta personalizada|proposta personalitzada/)
    expect(result).not.toMatch(/estimación orientativa|estimació orientativa|antes de IVA|abans d’IVA/)
  })

  it('does not render unknown pages', () => {
    expect(renderSeoHtml(html, '/es/no-existe')).toBeNull()
  })
})
