import { leadPageCopy } from '../src/config/leadPages.js'
import { weddingLandings } from '../src/config/weddingLanding.js'
import { redesignLanding } from '../src/config/redesignLanding.js'

const pages = {
  [redesignLanding.path]: {lang:'es',title:redesignLanding.title,description:redesignLanding.description,heading:redesignLanding.heading,body:redesignLanding.intro,redesign:true},
  '/es/diseno-web-empresas': { lang:'es', alternate:'/ca/disseny-web-empreses', title:'Diseño web para empresas | Àlex Casanova', description:'Diseño y desarrollo de webs corporativas a medida para empresas. Solicita una propuesta personalizada según el alcance.', heading:'Una web corporativa que trabaja tan bien como tu negocio.', body:'Diseño web a medida, rápido y preparado para convertir visitas en oportunidades.' },
  '/ca/disseny-web-empreses': { lang:'ca', alternate:'/es/diseno-web-empresas', title:'Disseny web per a empreses | Àlex Casanova', description:'Disseny i desenvolupament de webs corporatives a mida per a empreses. Sol·licita una proposta personalitzada segons l’abast.', heading:'Una web corporativa que treballa tan bé com el teu negoci.', body:'Disseny web a mida, ràpid i preparat per convertir visites en oportunitats.' },
  '/es/precio-pagina-web': { lang:'es', alternate:'/ca/preu-pagina-web', title:'Precio de una página web corporativa | Àlex Casanova', description:'Descubre qué influye en el precio de una web corporativa y solicita una propuesta personalizada.', heading:'¿Cuánto cuesta una web corporativa?', body:leadPageCopy.es.pricing.intro },
  '/ca/preu-pagina-web': { lang:'ca', alternate:'/es/precio-pagina-web', title:'Preu d’una pàgina web corporativa | Àlex Casanova', description:'Descobreix què influeix en el preu d’una web corporativa i sol·licita una proposta personalitzada.', heading:'Quant costa una web corporativa?', body:leadPageCopy.ca.pricing.intro },
  '/es/presupuesto-web': { lang:'es', alternate:'/ca/pressupost-web', title:'Solicita presupuesto para tu página web | Àlex Casanova', description:'Cuéntame qué necesita tu web corporativa y recibirás una propuesta personalizada tras revisar el alcance.', heading:'Cuéntame cómo será tu próxima web.', body:'Define el alcance de tu proyecto y te responderé con una propuesta personalizada.' },
  '/ca/pressupost-web': { lang:'ca', alternate:'/es/presupuesto-web', title:'Sol·licita pressupost per a la teva pàgina web | Àlex Casanova', description:'Explica’m què necessita la teva web corporativa i rebràs una proposta personalitzada després de revisar l’abast.', heading:'Explica’m com serà la teva pròxima web.', body:'Defineix l’abast del projecte i et respondré amb una proposta personalitzada.' },
  ...Object.fromEntries(Object.entries(weddingLandings).map(([lang, copy]) => [copy.path, { lang, title:copy.title, description:copy.description, heading:copy.heading, body:copy.intro, wedding:true }]))
}

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]))

export function renderSeoHtml(html, path) {
  const page = pages[path]
  if (!page) return null
  const description = page.description
  const body = page.body
  const canonical = `https://alexcasanova.es${path}`
  const copy = page.wedding ? weddingLandings[page.lang] : null
  const structuredData = page.redesign
    ? { '@context':'https://schema.org', '@type':'Service', name:'Rediseño web para empresas', serviceType:'Rediseño de páginas web', description:page.description, url:canonical, provider:{'@type':'ProfessionalService',name:'Casanova studio',url:'https://alexcasanova.es/'} }
    : page.wedding
    ? { '@context':'https://schema.org', '@type':'Service', name:copy.labels.serviceName, serviceType:copy.labels.serviceType, description:page.description, url:canonical, provider:{ '@type':'ProfessionalService', name:'Casanova studio', url:'https://alexcasanova.es/' }, areaServed:{ '@type':'Country', name:'España' } }
    : { '@context':'https://schema.org', '@type':'ProfessionalService', name:'Àlex Casanova · Diseño web', url:canonical, areaServed:['ES','Catalunya'] }
  const alternate = copy
    ? Object.entries(weddingLandings).filter(([lang]) => lang !== page.lang).map(([lang, variant]) => `<link rel="alternate" hreflang="${lang}" href="https://alexcasanova.es${variant.path}">`).join('')
    : page.alternate ? `<link rel="alternate" hreflang="${page.lang === 'es' ? 'ca' : 'es'}" href="https://alexcasanova.es${page.alternate}">` : ''
  const redesignContent = page.redesign ? [
    `<p>${escapeHtml(redesignLanding.intro)}</p><a href="#contacto-rediseno">${escapeHtml(redesignLanding.cta)}</a>`,
    `<section><h2>${escapeHtml(redesignLanding.signalsTitle)}</h2>${redesignLanding.signals.map(item => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')}</section>`,
    ...[[redesignLanding.scopeTitle,redesignLanding.scope],[redesignLanding.processTitle,redesignLanding.process]].map(([title,items]) => `<section><h2>${escapeHtml(title)}</h2>${items.map(item => `<article><h3>${escapeHtml(item[0])}</h3><p>${escapeHtml(item[1])}</p></article>`).join('')}</section>`),
    `<section><h2>${escapeHtml(redesignLanding.projectsTitle)}</h2><p>${escapeHtml(redesignLanding.projectsText)}</p><a href="/projects">Explorar el portfolio</a></section>`,
    `<section><h2>${escapeHtml(redesignLanding.faqTitle)}</h2>${redesignLanding.faqs.map(faq => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join('')}</section>`,
    `<section id="contacto-rediseno"><h2>${escapeHtml(redesignLanding.contactTitle)}</h2><p>${escapeHtml(redesignLanding.contactText)}</p><a href="/contact">Contactar con Casanova studio</a></section>`
  ].join('') : ''
  const weddingContent = page.redesign ? redesignContent : page.wedding
    ? [
        `<section><h2>${escapeHtml(copy.labels.ideaTitle)}</h2><p>${escapeHtml(copy.labels.ideaText)}</p></section>`,
        `<section><h2>${escapeHtml(copy.labels.featuresTitle)}</h2>${copy.features.map(feature => `<article><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></article>`).join('')}</section>`,
        `<section><h2>${escapeHtml(copy.example.title)}</h2><p>${escapeHtml(copy.example.description)}</p><p>${escapeHtml(copy.example.note)}</p><a href="${escapeHtml(copy.example.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.labels.exampleLink)}</a></section>`,
        `<section><h2>${escapeHtml(copy.labels.faqTitle)}</h2>${copy.faqs.map(faq => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join('')}</section>`,
        `<section id="contacto-bodas"><h2>${escapeHtml(copy.labels.closingTitle)}</h2><p>${escapeHtml(copy.labels.closingText)}</p><a href="#contacto-bodas">${escapeHtml(copy.labels.contact)}</a></section>`
      ].join('')
    : `<p>${escapeHtml(body)}</p>`
  return html.replace('<html lang="es">', `<html lang="${page.lang}"${page.wedding ? ' data-theme="light"' : ''}>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/(<meta name="title"\s+content=")([^"]*)("\s*\/?>)/i, `$1${escapeHtml(page.title)}$3`)
    .replace(/(<meta name="description"\s+content=")([^"]*)("\s*\/?>)/i, `$1${escapeHtml(description)}$3`)
    .replace(/(<link rel="canonical" href=")([^"]*)("\s*\/?>)/i, `$1${canonical}$3`)
    .replace(/(property="og:url"\s+content=")([^"]*)(")/gi, `$1${canonical}$3`)
    .replace(/(property="og:title"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(page.title)}$3`)
    .replace(/(property="og:description"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(description)}$3`)
    .replace(/(property="twitter:url"\s+content=")([^"]*)(")/gi, `$1${canonical}$3`)
    .replace(/(property="twitter:title"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(page.title)}$3`)
    .replace(/(property="twitter:description"\s+content=")([^"]*)(")/gi, `$1${escapeHtml(description)}$3`)
    .replace('</head>', `${alternate}<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script></head>`)
    .replace('<div id="app"></div>', `<div id="app"><main><h1>${escapeHtml(page.heading)}</h1>${weddingContent}</main></div>`)
}

export default async function handler(req, res) {
  const path = `/${String(req.query.path || '').replace(/^\/+|\/+$/g, '')}`
  const page = pages[path]
  if (!page) return res.status(404).send('Not found')
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const response = await fetch(`${protocol}://${host}/index.html`)
    let html = await response.text()
    html = renderSeoHtml(html, path)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
    return res.status(200).send(html)
  } catch (error) {
    console.error('Static SEO error:', error)
    return res.status(500).send('Unable to render page')
  }
}
