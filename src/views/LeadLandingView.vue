<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defaultLeadPricing } from '../config/leadPricing'
import { leadPageCopy } from '../config/leadPages'
import { trackLeadEvent } from '../utils/leadCapture'

const route = useRoute()
const lang = computed(() => route.meta.locale || 'es')
const page = computed(() => route.meta.leadPage || 'service')
const copy = computed(() => leadPageCopy[lang.value][page.value])
const pricing = ref(defaultLeadPricing)
const budgetPath = computed(() => lang.value === 'ca' ? '/ca/pressupost-web' : '/es/presupuesto-web')
const pricePath = computed(() => lang.value === 'ca' ? '/ca/preu-pagina-web' : '/es/precio-pagina-web')
const money = value => new Intl.NumberFormat(lang.value === 'ca' ? 'ca-ES' : 'es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(value)

onMounted(async () => {
  trackLeadEvent('lead_landing_view', { language:lang.value, page:page.value })
  try {
    const response = await fetch('/api/leads')
    if (response.ok) pricing.value = (await response.json()).config
  } catch { /* The published fallback remains visible when the API is unavailable. */ }
})
</script>

<template>
  <main class="lead-page page-wrapper fade-in">
    <section class="lead-hero container">
      <div class="hero-index">AC / {{ page === 'service' ? '01' : '02' }}</div>
      <div class="hero-copy">
        <span class="eyebrow">{{ copy.eyebrow }}</span>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.intro }}</p>
        <div class="actions"><router-link :to="budgetPath" class="btn btn-primary">{{ copy.cta }} <span>↗</span></router-link><router-link v-if="page === 'service'" :to="pricePath" class="text-link">{{ copy.secondary }} →</router-link></div>
      </div>
      <aside v-if="page === 'service'" class="proof"><strong>150+</strong><span>{{ lang === 'ca' ? 'projectes' : 'proyectos' }}</span><p>{{ copy.proof }}</p></aside>
      <aside v-else class="price-stamp"><span>{{ copy.base }}</span><strong>{{ money(pricing.basePrice) }}</strong><small>+ IVA</small></aside>
    </section>

    <template v-if="page === 'service'">
      <section class="container lead-section"><h2>{{ copy.section }}</h2><div class="service-grid"><article v-for="card in copy.cards" :key="card[0]"><span>{{ card[0] }}</span><h3>{{ card[1] }}</h3><p>{{ card[2] }}</p></article></div></section>
      <section class="process-band"><div class="container process-grid"><h2>{{ copy.processTitle }}</h2><ol><li v-for="(item,index) in copy.process" :key="item"><span>0{{ index + 1 }}</span>{{ item }}</li></ol></div></section>
      <section class="container final-cta"><span>700 € + IVA</span><h2>{{ copy.final }}</h2><p>{{ copy.finalText }}</p><router-link :to="budgetPath" class="btn btn-primary">{{ copy.cta }} →</router-link></section>
    </template>
    <template v-else>
      <section class="container pricing-layout"><div class="included"><span class="eyebrow">BASE / 700</span><h2>{{ copy.included }}</h2><ul><li v-for="item in copy.includedItems" :key="item">{{ item }}<span>Incluido</span></li></ul></div><div class="price-factors"><h2>{{ copy.factors }}</h2><article v-for="(factor,index) in copy.factorItems" :key="factor[0]"><span>0{{ index + 1 }}</span><div><h3>{{ factor[0] }}</h3><p>{{ factor[1] }}</p></div></article><p class="price-note">{{ copy.note }}</p></div></section>
      <section class="container final-cta"><span>{{ money(pricing.basePrice) }} + IVA</span><h2>{{ copy.cta }}</h2><router-link :to="budgetPath" class="btn btn-primary">{{ copy.cta }} →</router-link></section>
    </template>
  </main>
</template>

<style scoped>
.lead-page{--signal:#d7ff4f;padding-top:0}.lead-hero{min-height:72svh;display:grid;grid-template-columns:80px minmax(0,1fr) 220px;gap:40px;align-items:center;padding-top:clamp(50px,9vw,120px);padding-bottom:80px}.hero-index,.eyebrow{font:700 .68rem/1.2 monospace;letter-spacing:.15em;color:var(--text-secondary)}.hero-index{align-self:start}.hero-copy h1{max-width:850px;font-size:clamp(3rem,7.5vw,7.2rem);line-height:.93;margin:20px 0 30px}.hero-copy>p{max-width:690px;font-size:clamp(1.1rem,2vw,1.4rem)}.actions{display:flex;align-items:center;gap:24px;margin-top:36px}.text-link{padding:12px 0;border-bottom:1px solid var(--border-color)}.proof,.price-stamp{align-self:end;border-top:1px solid var(--text-primary);padding-top:18px}.proof strong,.price-stamp strong{display:block;font-size:3.2rem;line-height:1}.proof span,.price-stamp span,.price-stamp small{font:700 .7rem monospace;text-transform:uppercase;color:var(--text-secondary)}.proof p{font-size:.85rem;margin-top:24px}.price-stamp strong{font-size:clamp(2.8rem,5vw,4.5rem);margin:8px 0}.lead-section{padding-top:100px;padding-bottom:120px}.lead-section>h2{max-width:700px;margin-bottom:58px}.service-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border-color)}.service-grid article{padding:26px 28px 50px 0;border-right:1px solid var(--border-color)}.service-grid article+article{padding-left:28px}.service-grid article:last-child{border-right:0}.service-grid article>span,.process-grid li>span{color:var(--signal);font:700 .7rem monospace}.service-grid h3{margin:55px 0 15px}.service-grid p{font-size:.95rem}.process-band{background:var(--text-primary);color:var(--bg-color);padding:100px 0}.process-band h2,.process-band li{color:var(--bg-color)}.process-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:70px}.process-grid ol{list-style:none}.process-grid li{display:grid;grid-template-columns:50px 1fr;padding:24px 0;border-top:1px solid color-mix(in srgb,var(--bg-color) 30%,transparent);font-size:1.2rem}.process-grid li>span{color:var(--bg-color);opacity:.55}.final-cta{padding-top:120px;padding-bottom:120px;text-align:center}.final-cta>span{display:inline-block;padding:7px 11px;background:var(--signal);color:#111;font:700 .72rem monospace}.final-cta h2{font-size:clamp(2.8rem,7vw,6.5rem);max-width:850px;margin:25px auto}.final-cta p{max-width:620px;margin:0 auto 30px}.pricing-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:90px;padding-top:100px;padding-bottom:80px}.included{background:var(--signal);color:#111;padding:38px;border-radius:2px;transform:rotate(-1deg)}.included h2,.included .eyebrow{color:#111}.included h2{margin:25px 0 35px}.included ul{list-style:none}.included li{display:flex;justify-content:space-between;gap:15px;padding:16px 0;border-top:1px solid rgba(0,0,0,.22)}.included li span{font:700 .65rem monospace;text-transform:uppercase}.price-factors>h2{margin-bottom:30px}.price-factors article{display:grid;grid-template-columns:44px 1fr;gap:18px;padding:24px 0;border-top:1px solid var(--border-color)}.price-factors article>span{font:700 .7rem monospace;color:var(--text-secondary)}.price-factors p{font-size:.95rem}.price-note{margin-top:28px;padding-left:20px;border-left:3px solid var(--signal)}
@media(max-width:800px){.lead-hero{grid-template-columns:1fr;min-height:auto;gap:30px;padding-top:55px}.hero-index{display:none}.proof,.price-stamp{align-self:auto;max-width:260px}.service-grid,.pricing-layout,.process-grid{grid-template-columns:1fr}.service-grid article,.service-grid article+article{padding:28px 0;border-right:0;border-bottom:1px solid var(--border-color)}.pricing-layout{gap:45px}.included{transform:none}.actions{align-items:flex-start;flex-direction:column}.lead-section{padding-top:70px;padding-bottom:80px}}
</style>
