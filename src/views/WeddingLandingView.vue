<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { weddingLanding } from '../config/weddingLanding'

const contactPath = '/contact?utm_source=web-bodas'
const page = ref(null)
let revealObserver

onMounted(() => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      revealObserver.unobserve(entry.target)
    })
  }, { threshold: .08, rootMargin: '0px 0px 40px 0px' })

  page.value?.querySelectorAll('[data-reveal]').forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight) return
    element.classList.add('reveal-ready')
    revealObserver.observe(element)
  })
})

onUnmounted(() => revealObserver?.disconnect())
</script>

<template>
  <main ref="page" class="wedding-page">
    <section class="wedding-hero">
      <div class="hero-media" aria-hidden="true">
        <img src="/images/wedding-hero.jpg" alt="" width="2000" height="1333" fetchpriority="high" decoding="async">
      </div>
      <div class="container hero-layout">
        <div class="hero-copy">
          <span class="eyebrow">CASANOVA STUDIO / WEBS PARA BODAS</span>
          <h1>{{ weddingLanding.heading }}</h1>
          <p class="hero-intro">{{ weddingLanding.intro }}</p>
          <div class="hero-actions">
            <router-link :to="contactPath" class="wedding-button">Hablemos de vuestra boda <span aria-hidden="true">↗</span></router-link>
            <a href="#que-incluye" class="underlined-link">Descubrid la experiencia <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </div>
      <div class="container hero-footer" aria-hidden="true">
        <span>VUESTRA HISTORIA, EN UNA WEB ÚNICA</span>
        <span>01 / INVITACIONES DIGITALES</span>
      </div>
    </section>

    <section class="intro-band">
      <div class="container intro-layout" data-reveal>
        <span class="section-index">01 / LA IDEA</span>
        <div>
          <h2>Una invitación digital que también es el lugar donde empieza vuestra boda.</h2>
          <p>Mucho más que anunciar una fecha: una web para bodas permite compartir los detalles importantes con claridad y dejar espacio para que vuestros invitados participen. Todo con un diseño que se sienta vuestro.</p>
        </div>
      </div>
    </section>

    <section id="que-incluye" class="features-section container" aria-labelledby="features-title">
      <div class="section-heading" data-reveal>
        <span class="section-index">02 / CADA DETALLE CUENTA</span>
        <h2 id="features-title">¿Qué puede incluir vuestra web de boda?</h2>
        <p>Una experiencia hecha a medida para acompañar a los invitados antes y durante la celebración.</p>
      </div>
      <div class="features-grid">
        <article v-for="feature in weddingLanding.features" :key="feature.number" class="feature-card" data-reveal>
          <span class="feature-number">{{ feature.number }} / 06</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </section>

    <section id="ejemplo-boda" class="example-section" aria-labelledby="example-title">
      <div class="container example-layout">
        <div class="example-copy" data-reveal>
          <span class="section-index">03 / UNA INVITACIÓN DE MUESTRA</span>
          <h2 id="example-title">{{ weddingLanding.example.title }}</h2>
          <p>{{ weddingLanding.example.description }}</p>
          <a :href="weddingLanding.example.url" class="underlined-link" target="_blank" rel="noopener noreferrer" aria-label="Ver la invitación de muestra de Clara y Mateo (se abre en una nueva pestaña)">Ver la invitación de muestra <span aria-hidden="true">↗</span></a>
          <small>{{ weddingLanding.example.note }}</small>
        </div>
        <a :href="weddingLanding.example.url" class="example-preview" target="_blank" rel="noopener noreferrer" aria-label="Abrir la invitación de muestra de Clara y Mateo en una nueva pestaña">
          <img src="/images/wedding-demo-clara-mateo.jpg" alt="Portada de la invitación de muestra de Clara y Mateo" width="1500" height="937" loading="lazy" decoding="async">
          <span aria-hidden="true">CLARA &amp; MATEO <span>↗</span></span>
        </a>
      </div>
    </section>

    <section class="story-section">
      <div class="container story-layout">
        <div class="story-visual" aria-hidden="true"><span class="story-visual-label">ANTES DEL «SÍ, QUIERO»</span><span class="story-visual-quote">El día es vuestro.<br>La historia, de todos.</span></div>
        <div class="story-copy" data-reveal>
          <span class="section-index">04 / DISEÑO A VUESTRA MEDIDA</span>
          <h2>Tan personal como vuestra historia.</h2>
          <p>Desde el primer mensaje hasta la última foto compartida, cada elemento puede adaptarse al estilo de vuestra celebración. Sin plantillas que os obliguen a encajar: primero escuchamos vuestra idea y después diseñamos la experiencia.</p>
          <router-link :to="contactPath" class="underlined-link">Contadme vuestra idea <span aria-hidden="true">↗</span></router-link>
        </div>
      </div>
    </section>

    <section class="faq-section container" aria-labelledby="faq-title">
      <div class="section-heading" data-reveal>
        <span class="section-index">05 / DUDAS HABITUALES</span>
        <h2 id="faq-title">Preguntas frecuentes sobre webs para bodas</h2>
      </div>
      <div class="faq-list" data-reveal>
        <details v-for="faq in weddingLanding.faqs" :key="faq.question">
          <summary>{{ faq.question }} <span aria-hidden="true">+</span></summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="closing-section">
      <div class="container closing-inner" data-reveal>
        <span class="section-index">VUESTRA HISTORIA EMPIEZA AQUÍ</span>
        <h2>Una web para compartir lo que viene.</h2>
        <p>Contadme cómo imagináis vuestra boda y diseñemos una invitación digital a la altura del momento.</p>
        <router-link :to="contactPath" class="wedding-button">Hablemos de vuestra boda <span aria-hidden="true">↗</span></router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.wedding-page {
  --wedding-ink: #272925;
  --wedding-muted: #686a64;
  --wedding-line: #d8d7d0;
  --wedding-paper: #eee9df;
  --wedding-background: #faf8f3;
  background: url('/images/paper-grain.svg') repeat, var(--wedding-background);
  color: var(--wedding-ink);
}
.wedding-page .container { max-width: 1200px; }
.wedding-page h1, .wedding-page h2, .wedding-page h3 { color: inherit; }
.eyebrow, .section-index, .feature-number {
  font-size: .65rem;
  font-weight: 600;
  letter-spacing: .16em;
  line-height: 1.5;
}
.eyebrow, .section-index, .feature-number { color: var(--wedding-muted); }
.wedding-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: min(900px, 100svh);
  overflow: hidden;
  isolation: isolate;
  background: #2e3530;
  color: #faf8f3;
}
.hero-media, .hero-media::after, .hero-media img { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-media { z-index: -1; }
/* Foto: https://images.unsplash.com/photo-1532712938310-34cb3982ef74 (licencia Unsplash). */
.hero-media img { object-fit: cover; object-position: center 59%; }
.hero-media::after {
  content: '';
  background: linear-gradient(90deg, rgb(20 27 24 / 88%) 0%, rgb(20 27 24 / 71%) 36%, rgb(20 27 24 / 32%) 70%, rgb(20 27 24 / 10%) 100%), linear-gradient(0deg, rgb(20 27 24 / 35%), transparent 35%);
}
.hero-layout { display: flex; align-items: center; width: 100%; flex: 1; padding-block: clamp(72px, 10vw, 125px); }
.hero-copy { animation: wedding-enter .85s ease-out both; }
.hero-copy .eyebrow { color: #e9e3d7; }
.hero-copy h1 {
  max-width: 720px;
  font: normal clamp(3.3rem, 5.3vw, 5.5rem)/1.05 Georgia, 'Times New Roman', serif;
  letter-spacing: -.05em;
  margin: 30px 0 28px;
  text-wrap: balance;
}
.hero-intro { max-width: 530px; color: #f4eee4; font-size: clamp(1.12rem, 1.55vw, 1.4rem); line-height: 1.6; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 30px; margin-top: 40px; }
.hero-footer { display: flex; justify-content: space-between; width: 100%; padding-block: 22px 28px; border-top: 1px solid rgb(255 255 255 / 48%); color: #f4eee4; font-size: .62rem; font-weight: 600; letter-spacing: .17em; }
.wedding-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  min-height: 52px;
  padding: 14px 22px;
  background: var(--wedding-ink);
  color: var(--wedding-background);
  font-size: .82rem;
  font-weight: 600;
  border-radius: 0;
}
.wedding-button:hover { background: #44463f; color: #fff; }
.wedding-hero .wedding-button { background: #f5efe5; color: #272925; }
.wedding-hero .wedding-button:hover { background: #fff; color: #272925; }
.wedding-button span, .underlined-link span { transition: transform .25s ease; }
.wedding-button:hover span, .underlined-link:hover span { transform: translate(3px, -3px); }
.underlined-link { display: inline-flex; align-items: center; gap: 12px; padding-block: 9px; border-bottom: 1px solid currentColor; color: var(--wedding-ink); font-size: .8rem; font-weight: 600; }
.wedding-hero .underlined-link { color: #fff; }
.intro-band {
  padding-block: clamp(68px, 9vw, 125px);
  background: linear-gradient(90deg, #eee9df 0%, rgb(238 233 223 / 95%) 58%, rgb(238 233 223 / 69%) 100%), url('/images/wedding-details.jpg') right 44% / auto 115% no-repeat, var(--wedding-paper);
}
.intro-layout { display: grid; grid-template-columns: minmax(150px, .32fr) minmax(0, 1fr); gap: 48px; }
.intro-layout h2, .section-heading h2, .example-copy h2, .story-copy h2, .closing-inner h2 { font: normal clamp(2.15rem, 3.8vw, 3.8rem)/1.16 Georgia, 'Times New Roman', serif; letter-spacing: -.045em; text-wrap: balance; }
.intro-layout h2 { max-width: 790px; }
.intro-layout p { max-width: 620px; margin-top: 28px; color: var(--wedding-muted); line-height: 1.8; font-size: 1rem; }
.features-section { padding-block: clamp(82px, 10vw, 145px); scroll-margin-top: 90px; }
.section-heading { max-width: 720px; margin-bottom: 44px; }
.section-heading h2 { margin-top: 18px; }
.section-heading > p { max-width: 580px; margin-top: 20px; color: var(--wedding-muted); line-height: 1.7; font-size: .96rem; }
.features-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--wedding-line); }
.feature-card { display: flex; flex-direction: column; min-height: 245px; padding: 24px 26px 30px 0; border-bottom: 1px solid var(--wedding-line); }
.feature-card:hover .feature-number { color: #8c695c; }
.feature-card:not(:nth-child(3n)) { border-right: 1px solid var(--wedding-line); }
.feature-card:nth-child(3n+2), .feature-card:nth-child(3n+3) { padding-left: 26px; }
.feature-card h3 { margin: 34px 0 12px; font: normal clamp(1.38rem, 1.9vw, 1.8rem)/1.25 Georgia, 'Times New Roman', serif; }
.feature-card p { color: var(--wedding-muted); font-size: .87rem; line-height: 1.75; }
.example-section { padding-block: clamp(75px, 9vw, 135px); background: url('/images/paper-grain.svg') repeat, var(--wedding-paper); scroll-margin-top: 90px; }
.example-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: clamp(42px, 7vw, 105px); }
.example-copy h2 { margin: 20px 0 25px; }
.example-copy p { max-width: 470px; color: var(--wedding-muted); line-height: 1.8; }
.example-copy .underlined-link { margin-top: 27px; }
.example-copy small { display: block; max-width: 430px; margin-top: 25px; color: var(--wedding-muted); font-size: .75rem; line-height: 1.6; }
.example-preview { display: block; padding: 10px; border: 1px solid var(--wedding-line); background: #faf8f3; box-shadow: 0 26px 50px -38px #605951; transition: transform .3s ease, box-shadow .3s ease; }
.example-preview:hover { transform: translateY(-5px); box-shadow: 0 32px 58px -36px #605951; }
.example-preview img { display: block; width: 100%; height: auto; border: 1px solid var(--wedding-line); }
.example-preview > span { display: flex; justify-content: space-between; padding: 13px 4px 3px; color: var(--wedding-muted); font-size: .64rem; font-weight: 600; letter-spacing: .16em; }
.story-section { background: var(--wedding-paper); }
.story-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 510px; }
.story-visual {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(30px, 5vw, 65px);
  background: linear-gradient(180deg, rgb(18 21 18 / 36%) 0%, rgb(18 21 18 / 6%) 45%, rgb(18 21 18 / 70%) 100%), url('/images/wedding-celebration.jpg') center / cover no-repeat;
  color: #fff;
}
.story-visual-label { color: #fff; font-size: .63rem; font-weight: 600; letter-spacing: .16em; }
.story-visual-quote { font: italic clamp(2.4rem, 4.2vw, 4.7rem)/1.1 Georgia, serif; letter-spacing: -.05em; }
.story-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(36px, 6vw, 90px); background: url('/images/paper-grain.svg') repeat, var(--wedding-paper); }
.story-copy h2 { margin: 18px 0 22px; }
.story-copy p { max-width: 480px; color: var(--wedding-muted); font-size: .96rem; line-height: 1.85; }
.story-copy .underlined-link { margin-top: 25px; }
.faq-section { padding-block: clamp(82px, 10vw, 145px); }
.faq-list { border-top: 1px solid var(--wedding-line); }
.faq-list details { border-bottom: 1px solid var(--wedding-line); }
.faq-list summary { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 25px 0; cursor: pointer; font-size: 1.03rem; font-weight: 600; list-style: none; }
.faq-list summary::-webkit-details-marker { display: none; }
.faq-list summary span { color: var(--wedding-muted); font-size: 1.5rem; font-weight: 400; }
.faq-list details[open] summary span { transform: rotate(45deg); }
.faq-list details p { max-width: 740px; padding: 0 36px 26px 0; color: var(--wedding-muted); font-size: .96rem; line-height: 1.8; }
.closing-section { padding-block: clamp(80px, 10vw, 135px); border-top: 1px solid var(--wedding-line); background: url('/images/paper-grain.svg') repeat, var(--wedding-background); color: var(--wedding-ink); }
.closing-inner { display: flex; flex-direction: column; align-items: flex-start; }
.closing-inner .section-index, .closing-inner p { color: var(--wedding-muted); }
.closing-inner h2 { max-width: 790px; margin: 22px 0; }
.closing-inner p { max-width: 600px; line-height: 1.7; }
.closing-inner .wedding-button { margin-top: 32px; }
.reveal-ready { opacity: 0; transform: translateY(22px); }
.reveal-ready.is-visible { opacity: 1; transform: translateY(0); transition: opacity .65s ease, transform .65s ease; }
@keyframes wedding-enter {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-copy { animation: none; }
  .wedding-button span, .underlined-link span, .example-preview, .reveal-ready.is-visible { transition: none; }
  .reveal-ready { opacity: 1; transform: none; }
}
@media (max-width: 900px) {
  .wedding-hero { min-height: 730px; }
  .hero-media img { object-position: 57% center; }
  .intro-layout { grid-template-columns: 1fr; gap: 20px; }
  .example-layout { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .feature-card { padding-left: 0 !important; padding-right: 20px; border-right: 0 !important; }
  .feature-card:nth-child(odd) { border-right: 1px solid var(--wedding-line) !important; }
  .feature-card:nth-child(even) { padding-left: 20px !important; }
  .story-layout { grid-template-columns: 1fr; }
  .story-visual { min-height: 320px; }
}
@media (max-width: 600px) {
  .intro-band { background: linear-gradient(90deg, rgb(238 233 223 / 94%), rgb(238 233 223 / 85%)), url('/images/wedding-details.jpg') center / cover no-repeat; }
  .wedding-hero { min-height: min(940px, 100svh); }
  .hero-media img { object-position: 51% center; }
  .hero-media::after { background: linear-gradient(180deg, rgb(20 27 24 / 84%) 0%, rgb(20 27 24 / 68%) 45%, rgb(20 27 24 / 18%) 85%, rgb(20 27 24 / 44%) 100%); }
  .hero-layout { align-items: flex-start; padding-block: clamp(62px, 10vh, 100px) 50px; }
  .hero-copy h1 { font-size: clamp(2.85rem, 11.5vw, 4.5rem); }
  .hero-actions { align-items: stretch; flex-direction: column; }
  .wedding-button { width: 100%; }
  .hero-footer { padding-block: 16px 20px; font-size: .52rem; }
  .hero-footer span:last-child { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card, .feature-card:nth-child(odd), .feature-card:nth-child(even) { min-height: 0; padding: 24px 0 30px !important; border-right: 0 !important; }
  .feature-card h3 { margin-top: 24px; }
  .story-copy { padding: 65px 0; }
}
</style>
