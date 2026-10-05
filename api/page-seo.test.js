import { describe, expect, it } from 'vitest'
import { renderSeoHtml } from './page-seo.js'
import { weddingLanding, weddingLandings } from '../src/config/weddingLanding.js'
import { redesignLanding } from '../src/config/redesignLanding.js'
import { readFileSync } from 'node:fs'
import { leadPageCopy } from '../src/config/leadPages.js'

const html = `<!DOCTYPE html><html lang="es"><head>
<title>Inicio</title><meta name="title" content="Inicio"><meta name="description" content="Inicio">
<link rel="canonical" href="https://alexcasanova.es/">
<meta property="og:url" content="https://alexcasanova.es/"><meta property="og:title" content="Inicio"><meta property="og:description" content="Inicio">
<meta property="twitter:url" content="https://alexcasanova.es/"><meta property="twitter:title" content="Inicio"><meta property="twitter:description" content="Inicio">
</head><body><div id="app"></div></body></html>`

describe('commercial page SEO', () => {
  it.each(['/es/diseno-web-empresas','/ca/disseny-web-empreses','/es/precio-pagina-web','/ca/preu-pagina-web','/es/presupuesto-web','/ca/pressupost-web','/es/rediseno-web-empresas','/es/web-para-bodas','/ca/webs-per-a-casaments','/en/wedding-websites'])('does not publish prices in HTML, metadata or structured data on %s', path => {
    expect(renderSeoHtml(html,path)).not.toMatch(/€|\bEUR\b|700|priceRange|"price"/)
  })
  it('keeps public landing copy and templates free of price rendering', () => {
    expect(JSON.stringify(leadPageCopy)).not.toMatch(/€|700|antes de IVA|abans d’IVA/)
    const view = readFileSync(new URL('../src/views/LeadLandingView.vue',import.meta.url),'utf8')
    expect(view).not.toMatch(/money\(|basePrice|defaultLeadPricing|fetch\(/)
  })
  it('renders redesign content and service metadata without requiring JavaScript or pricing', () => {
    const result = renderSeoHtml(html, redesignLanding.path)
    expect(result).toContain(`<title>${redesignLanding.title}</title>`)
    expect(result).toContain(`rel="canonical" href="https://alexcasanova.es${redesignLanding.path}"`)
    expect(result).toContain(`<h1>${redesignLanding.heading}</h1>`)
    for (const faq of redesignLanding.faqs) expect(result).toContain(faq.question)
    for (const item of redesignLanding.scope) expect(result).toContain(`<h3>${item[0]}</h3>`)
    expect(result).toContain('href="/projects"')
    expect(result).toContain('id="contacto-rediseno"')
    expect(result).toContain('"@type":"Service"')
    expect(result).not.toMatch(/700|hreflang=/)
  })
  it('includes the redesign landing in deployment rewrites and the sitemap', () => {
    const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
    expect(config.rewrites.some(rule => rule.source.includes('rediseno-web-empresas') && rule.destination.includes('page-seo'))).toBe(true)
    expect(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')).toContain(`<loc>https://alexcasanova.es${redesignLanding.path}</loc>`)
  })
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
