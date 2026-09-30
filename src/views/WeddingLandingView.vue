<script setup>
import { weddingLanding } from '../config/weddingLanding'

const contactPath = '/contact?utm_source=web-bodas'
</script>

<template>
  <main class="wedding-page">
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
          <span class="invitation-kicker">UNA HISTORIA · UN DÍA · TODOS VOSOTROS</span>
          <div class="rings"><i></i><i></i></div>
          <span class="invitation-title">Nuestra<br>historia</span>
          <span class="invitation-rule"></span>
          <span class="invitation-caption">El principio de un día inolvidable</span>
        </div>
        <span class="preview-label">UNA INVITACIÓN TAN ÚNICA COMO VOSOTROS</span>
      </div>
    </section>

    <section class="intro-band">
      <div class="container intro-layout">
        <span class="section-index">01 / LA IDEA</span>
        <div>
          <h2>Una invitación digital que también es el lugar donde empieza vuestra boda.</h2>
          <p>Mucho más que anunciar una fecha: una web para bodas permite compartir los detalles importantes con claridad y dejar espacio para que vuestros invitados participen. Todo con un diseño que se sienta vuestro.</p>
        </div>
      </div>
    </section>

    <section id="que-incluye" class="features-section container" aria-labelledby="features-title">
      <div class="section-heading">
        <span class="section-index">02 / CADA DETALLE CUENTA</span>
        <h2 id="features-title">¿Qué puede incluir vuestra web de boda?</h2>
        <p>Una experiencia hecha a medida para acompañar a los invitados antes y durante la celebración.</p>
      </div>
      <div class="features-grid">
        <article v-for="feature in weddingLanding.features" :key="feature.number" class="feature-card">
          <span class="feature-number">{{ feature.number }} / 06</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.text }}</p>
        </article>
      </div>
    </section>

    <section class="story-section">
      <div class="container story-layout">
        <div class="story-visual" aria-hidden="true"><span>El día es vuestro.<br>La historia, de todos.</span></div>
        <div class="story-copy">
          <span class="section-index">03 / DISEÑO A VUESTRA MEDIDA</span>
          <h2>Tan personal como vuestra historia.</h2>
          <p>Desde el primer mensaje hasta la última foto compartida, cada elemento puede adaptarse al estilo de vuestra celebración. Sin plantillas que os obliguen a encajar: primero escuchamos vuestra idea y después diseñamos la experiencia.</p>
          <router-link :to="contactPath" class="underlined-link">Contadme vuestra idea <span aria-hidden="true">↗</span></router-link>
        </div>
      </div>
    </section>

    <section class="faq-section container" aria-labelledby="faq-title">
      <div class="section-heading">
        <span class="section-index">04 / DUDAS HABITUALES</span>
        <h2 id="faq-title">Preguntas frecuentes sobre webs para bodas</h2>
      </div>
      <div class="faq-list">
        <details v-for="faq in weddingLanding.faqs" :key="faq.question">
          <summary>{{ faq.question }} <span aria-hidden="true">+</span></summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <section class="closing-section">
      <div class="container closing-inner">
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
  --wedding-accent: #c79584;
  --wedding-paper: #f1e8dc;
  --wedding-ink: #302922;
  --wedding-muted: #735e51;
  background: var(--bg-color);
  color: var(--text-primary);
}
.wedding-page .container { max-width: 1200px; }
.wedding-page h1, .wedding-page h2, .wedding-page h3 { color: inherit; }
.eyebrow, .section-index, .feature-number, .preview-label {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .17em;
  line-height: 1.5;
}
.eyebrow, .section-index, .feature-number { color: var(--text-secondary); }
.wedding-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(330px, .95fr);
  gap: clamp(36px, 7vw, 110px);
  align-items: center;
  min-height: min(800px, 90svh);
  padding-block: clamp(70px, 9vw, 128px);
}
.hero-copy h1 {
  max-width: 760px;
  font-size: clamp(3.2rem, 4.8vw, 5rem);
  letter-spacing: -.065em;
  line-height: 1.04;
  margin: 24px 0 28px;
  text-wrap: balance;
}
.hero-intro { max-width: 580px; color: var(--text-primary); font-size: clamp(1.2rem, 1.8vw, 1.55rem); line-height: 1.5; }
.hero-detail { max-width: 540px; margin-top: 20px; font-size: 1rem; line-height: 1.75; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-top: 38px; }
.wedding-button {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  min-height: 52px;
  padding: 14px 22px;
  background: var(--text-primary);
  color: var(--bg-color);
  font-size: .88rem;
  font-weight: 700;
  border-radius: 3px;
}
.wedding-button:hover { background: var(--wedding-accent); color: var(--wedding-ink); }
.underlined-link { display: inline-flex; align-items: center; gap: 12px; padding-block: 9px; border-bottom: 1px solid currentColor; font-size: .82rem; font-weight: 700; }
.invitation-preview { position: relative; padding: 25px; background: color-mix(in srgb, var(--wedding-accent) 19%, var(--bg-secondary)); }
.invitation-sheet {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 510px;
  padding: 45px 24px;
  border: 1px solid #cdb9a3;
  background: var(--wedding-paper);
  color: var(--wedding-ink);
  text-align: center;
}
.invitation-kicker, .invitation-caption { font-size: .59rem; letter-spacing: .18em; line-height: 1.8; }
.invitation-kicker { max-width: 260px; }
.rings { display: flex; justify-content: center; width: 65px; margin: 52px 0 26px; }
.rings i { display: block; width: 31px; height: 31px; border: 1px solid var(--wedding-muted); border-radius: 50%; }
.rings i + i { margin-left: -8px; }
.invitation-title { font-family: Georgia, serif; font-style: italic; font-size: clamp(3.5rem, 6vw, 6rem); letter-spacing: -.06em; line-height: .95; }
.invitation-rule { width: 46px; height: 1px; margin: 36px auto 22px; background: var(--wedding-muted); }
.preview-label { position: absolute; right: 25px; bottom: -24px; color: var(--text-secondary); font-size: .55rem; }
.intro-band { padding-block: clamp(68px, 9vw, 125px); background: var(--bg-secondary); }
.intro-layout { display: grid; grid-template-columns: minmax(150px, .32fr) minmax(0, 1fr); gap: 48px; }
.intro-layout h2, .section-heading h2, .story-copy h2, .closing-inner h2 { font-size: clamp(2.2rem, 4vw, 4.2rem); letter-spacing: -.055em; line-height: 1.15; text-wrap: balance; }
.intro-layout h2 { max-width: 790px; }
.intro-layout p { max-width: 620px; margin-top: 28px; line-height: 1.8; font-size: 1.06rem; }
.features-section { padding-block: clamp(82px, 10vw, 145px); scroll-margin-top: 90px; }
.section-heading { max-width: 720px; margin-bottom: 44px; }
.section-heading h2 { margin-top: 18px; }
.section-heading > p { max-width: 580px; margin-top: 20px; line-height: 1.7; font-size: 1rem; }
.features-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--border-color); }
.feature-card { display: flex; flex-direction: column; min-height: 245px; padding: 24px 26px 30px 0; border-bottom: 1px solid var(--border-color); }
.feature-card:not(:nth-child(3n)) { border-right: 1px solid var(--border-color); }
.feature-card:nth-child(3n+2), .feature-card:nth-child(3n+3) { padding-left: 26px; }
.feature-card h3 { margin: 34px 0 12px; font-size: clamp(1.25rem, 1.7vw, 1.55rem); line-height: 1.3; }
.feature-card p { font-size: .89rem; line-height: 1.7; }
.story-section { background: var(--bg-secondary); }
.story-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 510px; }
.story-visual { display: flex; align-items: flex-end; padding: clamp(30px, 5vw, 65px); background: var(--wedding-paper); color: var(--wedding-ink); }
.story-visual span { font: italic clamp(2.4rem, 4.5vw, 5rem)/1.1 Georgia, serif; letter-spacing: -.05em; }
.story-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(36px, 6vw, 90px); }
.story-copy h2 { margin: 18px 0 22px; }
.story-copy p { max-width: 480px; font-size: .98rem; line-height: 1.85; }
.story-copy .underlined-link { margin-top: 25px; }
.faq-section { padding-block: clamp(82px, 10vw, 145px); }
.faq-list { border-top: 1px solid var(--border-color); }
.faq-list details { border-bottom: 1px solid var(--border-color); }
.faq-list summary { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 25px 0; cursor: pointer; font-size: 1.03rem; font-weight: 600; list-style: none; }
.faq-list summary::-webkit-details-marker { display: none; }
.faq-list summary span { color: var(--text-secondary); font-size: 1.5rem; font-weight: 400; }
.faq-list details[open] summary span { transform: rotate(45deg); }
.faq-list details p { max-width: 740px; padding: 0 36px 26px 0; font-size: .96rem; line-height: 1.8; }
.closing-section { padding-block: clamp(80px, 10vw, 135px); background: var(--wedding-paper); color: var(--wedding-ink); }
.closing-inner { display: flex; flex-direction: column; align-items: flex-start; }
.closing-inner .section-index, .closing-inner p { color: var(--wedding-muted); }
.closing-inner h2 { max-width: 790px; margin: 22px 0; }
.closing-inner p { max-width: 600px; line-height: 1.7; }
.closing-inner .wedding-button { margin-top: 32px; background: var(--wedding-ink); color: var(--wedding-paper); }
.closing-inner .wedding-button:hover { background: var(--wedding-muted); color: #fff; }
@media (max-width: 900px) {
  .wedding-hero { grid-template-columns: 1fr; min-height: auto; }
  .invitation-preview { max-width: 600px; width: 100%; margin-inline: auto; }
  .intro-layout { grid-template-columns: 1fr; gap: 20px; }
  .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .feature-card { padding-left: 0 !important; padding-right: 20px; border-right: 0 !important; }
  .feature-card:nth-child(odd) { border-right: 1px solid var(--border-color) !important; }
  .feature-card:nth-child(even) { padding-left: 20px !important; }
  .story-layout { grid-template-columns: 1fr; }
  .story-visual { min-height: 320px; }
}
@media (max-width: 600px) {
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
