<script setup>
import { onMounted } from 'vue'
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import LeadContactForm from '../components/LeadContactForm.vue'
import { redesignLanding as copy } from '../config/redesignLanding'
import { trackLeadEvent } from '../utils/leadCapture'

onMounted(() => trackLeadEvent('lead_landing_view', {language:'es',page:'web-redesign'}))
</script>

<template>
  <main class="redesign-page page-wrapper">
    <section class="container redesign-hero">
      <div><span class="eyebrow">{{ copy.eyebrow }}</span><h1>{{ copy.heading }}</h1><p>{{ copy.intro }}</p>
        <div class="hero-actions"><a href="#contacto-rediseno" class="btn btn-primary">{{ copy.cta }} <ArrowUpRight :size="18" aria-hidden="true" /></a><router-link to="/projects" class="text-link">Ver proyectos <ArrowRight :size="18" aria-hidden="true" /></router-link></div>
      </div>
      <aside class="redesign-note"><span>DE TU WEB ACTUAL A TU SIGUIENTE ETAPA</span><strong>Conservar.<br>Mejorar.<br>Transformar.</strong><p>Una propuesta a medida, no un cambio de plantilla.</p></aside>
    </section>
    <section class="container landing-section"><h2>{{ copy.signalsTitle }}</h2><div class="signal-grid"><article v-for="(signal,index) in copy.signals" :key="signal.title"><span class="eyebrow">0{{ index + 1 }}</span><h3>{{ signal.title }}</h3><p>{{ signal.text }}</p></article></div></section>
    <section class="scope-band"><div class="container landing-section"><h2>{{ copy.scopeTitle }}</h2><div class="scope-grid"><article v-for="item in copy.scope" :key="item[0]"><h3>{{ item[0] }}</h3><p>{{ item[1] }}</p></article></div></div></section>
    <section class="container landing-section process"><h2>{{ copy.processTitle }}</h2><ol><li v-for="(step,index) in copy.process" :key="step[0]"><span class="eyebrow">0{{ index + 1 }}</span><div><h3>{{ step[0] }}</h3><p>{{ step[1] }}</p></div></li></ol></section>
    <section class="container landing-section portfolio"><span class="eyebrow">PROYECTOS, NO PROMESAS</span><h2>{{ copy.projectsTitle }}</h2><p>{{ copy.projectsText }}</p><router-link to="/projects" class="text-link">Explorar el portfolio <ArrowRight :size="18" aria-hidden="true" /></router-link></section>
    <section class="container landing-section faq"><h2>{{ copy.faqTitle }}</h2><details v-for="faq in copy.faqs" :key="faq.question"><summary>{{ faq.question }}</summary><p>{{ faq.answer }}</p></details></section>
    <section id="contacto-rediseno" class="container landing-section contact-section"><div><span class="eyebrow">HABLEMOS DE TU PROYECTO</span><h2>{{ copy.contactTitle }}</h2><p>{{ copy.contactText }}</p></div><LeadContactForm context="web-redesign" /></section>
  </main>
</template>

<style scoped>
.redesign-page{--signal:#ff785a}.redesign-hero{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:64px;padding-block:clamp(40px,7vw,90px)}
.eyebrow{font-size:.68rem;letter-spacing:.12em;font-weight:600;color:var(--text-secondary)}
h1{font-size:clamp(2.5rem,5vw,4.9rem);line-height:1.04;letter-spacing:-.055em;text-wrap:balance;max-width:800px;margin:24px 0}
h2{font-size:clamp(1.8rem,3vw,2.7rem);line-height:1.15;letter-spacing:-.035em;text-wrap:balance;max-width:760px;margin-bottom:32px}
h3{font-size:1.2rem;margin-bottom:12px}p{line-height:1.75;max-width:680px}.hero-actions{display:flex;flex-wrap:wrap;gap:20px;margin-top:32px}.btn,.text-link{display:inline-flex;align-items:center;gap:10px}.text-link{min-height:44px;border-bottom:1px solid var(--border-color)}
.redesign-note{align-self:center;border-left:2px solid var(--signal);padding-left:28px}.redesign-note>span{font-size:.65rem;letter-spacing:.1em}.redesign-note strong{display:block;font-size:2.3rem;line-height:1.2;letter-spacing:-.04em;margin:24px 0}.redesign-note p{font-size:.9rem}
.landing-section{padding-block:64px}.signal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}.signal-grid article{border-top:1px solid var(--border-color);padding-top:24px}.signal-grid h3{margin-top:24px}
.scope-band{background:var(--bg-secondary);border-block:1px solid var(--border-color)}.scope-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px 64px}.scope-grid article{border-top:1px solid var(--border-color);padding-top:24px}
.process{display:grid;grid-template-columns:1fr 1fr;gap:64px}.process ol{list-style:none;padding:0;margin:0}.process li{display:flex;gap:24px;border-top:1px solid var(--border-color);padding:24px 0}.process li>span{color:var(--signal)}.process li p{margin:0}
.portfolio{border-block:1px solid var(--border-color)}.portfolio h2{margin-top:20px}.faq details{border-top:1px solid var(--border-color);padding:22px 0}.faq details:last-child{border-bottom:1px solid var(--border-color)}.faq summary{cursor:pointer;font-weight:600;line-height:1.5}.faq details p{margin-top:20px}
.contact-section{display:grid;grid-template-columns:1fr 1fr;gap:64px;scroll-margin-top:100px}.contact-section h2{margin-top:20px}
@media(max-width:800px){.redesign-hero,.process,.contact-section{grid-template-columns:minmax(0,1fr);gap:32px}.redesign-note{display:none}.signal-grid,.scope-grid{grid-template-columns:minmax(0,1fr);gap:24px}.landing-section{padding-block:44px}h1{font-size:clamp(2.3rem,9vw,3.8rem)}}
@media(max-width:480px){.hero-actions .btn{width:100%;justify-content:center;text-align:center}.hero-actions{gap:12px}.process li{gap:16px}}
</style>
