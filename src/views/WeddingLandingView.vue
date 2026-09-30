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
    <section class="wedding-hero container">
      <div class="hero-copy">
        <span class="eyebrow">WEBS PARA BODAS · INVITACIONES DIGITALES</span>
        <h1>{{ weddingLanding.heading }}</h1>
        <p class="hero-intro">{{ weddingLanding.intro }}</p>
        <p class="hero-detail">Una web de boda personalizada para contar vuestra historia, organizar el gran día y reunir a las personas que lo hacen especial.</p>
        <div class="hero-actions">
          <router-link :to="contactPath" class="wedding-button">Hablemos de vuestra boda <span aria-hidden="true">↗</span></router-link>
          <a href="#que-incluye" class="underlined-link">Descubrid qué puede incluir <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="invitation-preview" aria-hidden="true">
        <div class="invitation-sheet">
          <span class="invitation-kicker">CASANOVA STUDIO <span>·</span> BODAS</span>
          <span class="invitation-folio">01 — EL COMIENZO</span>
          <span class="invitation-title">Una historia<br>para recordar.</span>
          <span class="invitation-rule"></span>
          <span class="invitation-caption">Una invitación hecha para compartir</span>
        </div>
        <span class="preview-label">01 / UNA INVITACIÓN PERSONAL</span>
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

    <section class="story-section">
      <div class="container story-layout">
        <div class="story-visual" aria-hidden="true"><span class="story-visual-label">ANTES DEL «SÍ, QUIERO»</span><span class="story-visual-quote">El día es vuestro.<br>La historia, de todos.</span></div>
        <div class="story-copy" data-reveal>
          <span class="section-index">03 / DISEÑO A VUESTRA MEDIDA</span>
          <h2>Tan personal como vuestra historia.</h2>
          <p>Desde el primer mensaje hasta la última foto compartida, cada elemento puede adaptarse al estilo de vuestra celebración. Sin plantillas que os obliguen a encajar: primero escuchamos vuestra idea y después diseñamos la experiencia.</p>
          <router-link :to="contactPath" class="underlined-link">Contadme vuestra idea <span aria-hidden="true">↗</span></router-link>
        </div>
      </div>
    </section>

    <section class="faq-section container" aria-labelledby="faq-title">
      <div class="section-heading" data-reveal>
        <span class="section-index">04 / DUDAS HABITUALES</span>
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
.eyebrow, .section-index, .feature-number, .preview-label {
  font-size: .65rem;
  font-weight: 600;
  letter-spacing: .16em;
  line-height: 1.5;
}
.eyebrow, .section-index, .feature-number { color: var(--wedding-muted); }
.wedding-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(330px, .9fr);
  gap: clamp(44px, 8vw, 124px);
  align-items: center;
  min-height: 740px;
  padding-block: clamp(76px, 8vw, 120px);
}
.hero-copy { animation: wedding-enter .85s ease-out both; }
.hero-copy h1 {
  max-width: 750px;
  font: normal clamp(3.15rem, 5.1vw, 5.2rem)/1.07 Georgia, 'Times New Roman', serif;
  letter-spacing: -.055em;
  margin: 29px 0 30px;
  text-wrap: balance;
}
.hero-intro { max-width: 580px; color: var(--wedding-ink); font-size: clamp(1.08rem, 1.55vw, 1.35rem); line-height: 1.6; }
.hero-detail { max-width: 530px; margin-top: 18px; color: var(--wedding-muted); font-size: .92rem; line-height: 1.8; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; margin-top: 34px; }
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
.wedding-button span, .underlined-link span { transition: transform .25s ease; }
.wedding-button:hover span, .underlined-link:hover span { transform: translate(3px, -3px); }
.underlined-link { display: inline-flex; align-items: center; gap: 12px; padding-block: 9px; border-bottom: 1px solid currentColor; color: var(--wedding-ink); font-size: .8rem; font-weight: 600; }
.invitation-preview { position: relative; padding: 14px; border: 1px solid var(--wedding-line); background: url('/images/paper-grain.svg') repeat, #f4f0e8; box-shadow: 0 28px 65px -46px #615a50; animation: wedding-enter .95s .15s ease-out both; }
.invitation-sheet {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 495px;
  padding: clamp(30px, 4vw, 48px);
  border: 1px solid var(--wedding-line);
  background: url('/images/paper-grain.svg') repeat, var(--wedding-background);
  color: var(--wedding-ink);
  text-align: left;
}
.invitation-kicker, .invitation-folio, .invitation-caption { font-size: .59rem; letter-spacing: .16em; line-height: 1.8; }
.invitation-kicker span { padding-inline: 5px; }
.invitation-folio { margin-top: auto; color: var(--wedding-muted); }
.invitation-title { margin-top: 18px; font: italic clamp(2.9rem, 5vw, 4.6rem)/1.07 Georgia, 'Times New Roman', serif; letter-spacing: -.05em; }
.invitation-rule { width: 100%; height: 1px; margin: 33px 0 17px; background: var(--wedding-line); }
.invitation-caption { color: var(--wedding-muted); }
.preview-label { position: absolute; right: 0; bottom: -24px; color: var(--wedding-muted); font-size: .56rem; }
.intro-band {
  padding-block: clamp(68px, 9vw, 125px);
  background: linear-gradient(90deg, #eee9df 0%, rgb(238 233 223 / 95%) 58%, rgb(238 233 223 / 69%) 100%), url('/images/wedding-details.jpg') right 44% / auto 115% no-repeat, var(--wedding-paper);
}
.intro-layout { display: grid; grid-template-columns: minmax(150px, .32fr) minmax(0, 1fr); gap: 48px; }
.intro-layout h2, .section-heading h2, .story-copy h2, .closing-inner h2 { font: normal clamp(2.15rem, 3.8vw, 3.8rem)/1.16 Georgia, 'Times New Roman', serif; letter-spacing: -.045em; text-wrap: balance; }
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
  .hero-copy, .invitation-preview { animation: none; }
  .wedding-button span, .underlined-link span, .reveal-ready.is-visible { transition: none; }
  .reveal-ready { opacity: 1; transform: none; }
}
@media (max-width: 900px) {
  .wedding-hero { grid-template-columns: 1fr; min-height: auto; }
  .invitation-preview { max-width: 600px; width: 100%; margin-inline: auto; }
  .intro-layout { grid-template-columns: 1fr; gap: 20px; }
  .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .feature-card { padding-left: 0 !important; padding-right: 20px; border-right: 0 !important; }
  .feature-card:nth-child(odd) { border-right: 1px solid var(--wedding-line) !important; }
  .feature-card:nth-child(even) { padding-left: 20px !important; }
  .story-layout { grid-template-columns: 1fr; }
  .story-visual { min-height: 320px; }
}
@media (max-width: 600px) {
  .intro-band { background: linear-gradient(90deg, rgb(238 233 223 / 94%), rgb(238 233 223 / 85%)), url('/images/wedding-details.jpg') center / cover no-repeat; }
  .wedding-hero { padding-block: 60px 80px; gap: 55px; }
  .hero-copy h1 { font-size: clamp(2.85rem, 12vw, 4.5rem); }
  .hero-actions { align-items: stretch; flex-direction: column; }
  .wedding-button { width: 100%; }
  .invitation-preview { padding: 15px; }
  .invitation-sheet { min-height: 390px; }
  .preview-label { right: 15px; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card, .feature-card:nth-child(odd), .feature-card:nth-child(even) { min-height: 0; padding: 24px 0 30px !important; border-right: 0 !important; }
  .feature-card h3 { margin-top: 24px; }
  .story-copy { padding: 65px 0; }
}
</style>
