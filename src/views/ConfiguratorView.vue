<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { defaultLeadPricing } from '../config/leadPricing'
import { calculateLeadEstimate } from '../utils/leadEstimate'
import { leadAttribution, submissionKey, submitLead, trackLeadEvent } from '../utils/leadCapture'

const route = useRoute()
const lang = computed(() => route.meta.locale || 'es')
const copy = computed(() => texts[lang.value])
const pricing = ref(defaultLeadPricing)
const pricingVersion = ref(0)
const step = ref(0)
const startedAt = Date.now()
const key = ref(submissionKey())
const isSubmitting = ref(false)
const sent = ref(false)
const error = ref('')
const questionHeading = ref(null)
const answers = ref({ projectType:'new', pages:'one', extras:[], extraLanguage:false, maintenance:false, timeline:'flexible' })
const contact = ref({ name:'', email:'', company:'', website:'', message:'', privacyAccepted:false, companyName:'' })
const estimate = computed(() => calculateLeadEstimate(answers.value, pricing.value))
const money = value => new Intl.NumberFormat(lang.value === 'ca' ? 'ca-ES' : 'es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(value || 0)

const texts = {
  es:{ eyebrow:'ESTIMADOR DE PROYECTO', title:'Ponle números a tu próxima web.', intro:'Cinco decisiones. Una primera horquilla. Sin compromiso.', back:'Atrás', next:'Continuar', send:'Solicitar propuesta', sending:'Enviando…', custom:'Este proyecto necesita una valoración personalizada.', beforeVat:'antes de IVA', tax:'Con IVA', monthly:'/ mes de mantenimiento', estimate:'Estimación actual', orientation:'Horquilla orientativa. El presupuesto definitivo se confirma tras revisar el alcance.', steps:[
    { title:'¿Qué quieres construir?', help:'El punto de partida define el tipo de trabajo.', key:'projectType', options:[['new','Una web nueva','Partimos de cero'],['redesign','Renovar mi web','Replanteamos una web existente'],['other','Otro proyecto','Ecommerce, aplicación o caso especial']] },
    { title:'¿Qué tamaño tendrá?', help:'Cuenta las páginas o secciones principales.', key:'pages', options:[['one','Una página','Landing o web compacta'],['small','Hasta 5 páginas','La opción corporativa habitual'],['medium','Hasta 10 páginas','Más servicios y contenidos'],['custom','Más de 10','Alcance personalizado']] },
    { title:'Añade lo que necesitas', help:'Puedes seleccionar varias opciones.', key:'extras', multiple:true, options:[['cms','Gestor de contenidos','Edita la web sin tocar código'],['blog','Blog','Publicación y categorías'],['booking','Reservas','Agenda o solicitud de citas'],['integration','Integración','Conecta una herramienta externa'],['copywriting','Textos','Ayuda para redactar contenidos'],['branding','Identidad visual','Una base visual para tu marca']] },
    { title:'Completa el alcance', help:'Idiomas, soporte y tiempos.', key:'scope' },
    { title:'¿Te encaja la estimación?', help:'Envíame la configuración y revisaré personalmente el proyecto.', key:'contact' }
  ], labels:{ language:'Necesito un idioma adicional', maintenance:'Quiero mantenimiento mensual', timeline:'Plazo', flexible:'Flexible', soon:'En 1–2 meses', urgent:'Es urgente', name:'Nombre', email:'Email', company:'Empresa (opcional)', website:'Web actual (opcional)', message:'Algo que deba saber (opcional)', privacy:'Acepto que se usen mis datos para responder a esta solicitud.', success:'Solicitud recibida', successText:'Revisaré el alcance y te responderé lo antes posible.' }},
  ca:{ eyebrow:'ESTIMADOR DE PROJECTE', title:'Posa números a la teva pròxima web.', intro:'Cinc decisions. Una primera forquilla. Sense compromís.', back:'Enrere', next:'Continuar', send:'Sol·licitar proposta', sending:'Enviant…', custom:'Aquest projecte necessita una valoració personalitzada.', beforeVat:'abans d’IVA', tax:'Amb IVA', monthly:'/ mes de manteniment', estimate:'Estimació actual', orientation:'Forquilla orientativa. El pressupost definitiu es confirma després de revisar l’abast.', steps:[
    { title:'Què vols construir?', help:'El punt de partida defineix el tipus de feina.', key:'projectType', options:[['new','Una web nova','Partim de zero'],['redesign','Renovar la meva web','Replantegem una web existent'],['other','Un altre projecte','Ecommerce, aplicació o cas especial']] },
    { title:'Quina mida tindrà?', help:'Compta les pàgines o seccions principals.', key:'pages', options:[['one','Una pàgina','Landing o web compacta'],['small','Fins a 5 pàgines','L’opció corporativa habitual'],['medium','Fins a 10 pàgines','Més serveis i continguts'],['custom','Més de 10','Abast personalitzat']] },
    { title:'Afegeix el que necessites', help:'Pots seleccionar diverses opcions.', key:'extras', multiple:true, options:[['cms','Gestor de continguts','Edita la web sense tocar codi'],['blog','Blog','Publicació i categories'],['booking','Reserves','Agenda o sol·licitud de cites'],['integration','Integració','Connecta una eina externa'],['copywriting','Textos','Ajuda per redactar continguts'],['branding','Identitat visual','Una base visual per a la teva marca']] },
    { title:'Completa l’abast', help:'Idiomes, suport i terminis.', key:'scope' },
    { title:'T’encaixa l’estimació?', help:'Envia’m la configuració i revisaré personalment el projecte.', key:'contact' }
  ], labels:{ language:'Necessito un idioma addicional', maintenance:'Vull manteniment mensual', timeline:'Termini', flexible:'Flexible', soon:'En 1–2 mesos', urgent:'És urgent', name:'Nom', email:'Email', company:'Empresa (opcional)', website:'Web actual (opcional)', message:'Alguna cosa que hagi de saber (opcional)', privacy:'Accepto que s’utilitzin les meves dades per respondre aquesta sol·licitud.', success:'Sol·licitud rebuda', successText:'Revisaré l’abast i et respondré al més aviat possible.' }}
}

const selectOption = value => {
  const current = copy.value.steps[step.value]
  if (current.multiple) {
    const selected = answers.value.extras
    answers.value.extras = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]
  } else answers.value[current.key] = value
}
const isSelected = value => copy.value.steps[step.value].multiple ? answers.value.extras.includes(value) : answers.value[copy.value.steps[step.value].key] === value
const move = direction => {
  step.value = Math.min(4, Math.max(0, step.value + direction))
  trackLeadEvent('configurator_step', { step:step.value + 1, language:lang.value })
  window.scrollTo({ top:0, behavior:'smooth' })
  nextTick(() => questionHeading.value?.focus())
}
const submit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true; error.value = ''
  try {
    await submitLead({ ...contact.value, language:lang.value, source:'configurator', answers:answers.value, startedAt, submissionKey:key.value, attribution:leadAttribution() })
    sent.value = true
    trackLeadEvent('generate_lead', { language:lang.value, value:estimate.value.netMin || 0, currency:'EUR' })
  } catch { error.value = lang.value === 'ca' ? 'No s’ha pogut enviar. Torna-ho a provar.' : 'No se ha podido enviar. Inténtalo de nuevo.' }
  finally { isSubmitting.value = false }
}

onMounted(async () => {
  trackLeadEvent('configurator_start', { language:lang.value })
  try { const response = await fetch('/api/leads'); if (response.ok) { const data = await response.json(); pricing.value = data.config; pricingVersion.value = data.version } } catch { /* Local defaults keep the estimator usable. */ }
})
</script>

<template>
  <main class="configurator page-wrapper container fade-in">
    <header class="config-head"><div><span class="eyebrow">{{ copy.eyebrow }}</span><h1>{{ copy.title }}</h1><p>{{ copy.intro }}</p></div><div class="progress" role="progressbar" :aria-label="lang === 'ca' ? 'Progrés del configurador' : 'Progreso del configurador'" aria-valuemin="1" aria-valuemax="5" :aria-valuenow="step + 1"><span v-for="index in 5" :key="index" :class="{ active:index - 1 <= step }"></span><small>0{{ step + 1 }} / 05</small></div></header>
    <div class="config-grid">
      <section class="question-panel">
        <div v-if="!sent" class="question-copy"><span class="step-number">0{{ step + 1 }}</span><h2 ref="questionHeading" tabindex="-1">{{ copy.steps[step].title }}</h2><p>{{ copy.steps[step].help }}</p></div>
        <div v-if="!sent && step < 3" class="option-grid">
          <button v-for="option in copy.steps[step].options" :key="option[0]" type="button" :class="['option', { selected:isSelected(option[0]) }]" :aria-pressed="isSelected(option[0])" @click="selectOption(option[0])"><span class="option-check">{{ isSelected(option[0]) ? '✓' : '+' }}</span><strong>{{ option[1] }}</strong><small>{{ option[2] }}</small></button>
        </div>
        <div v-else-if="!sent && step === 3" class="scope-fields">
          <label class="switch-row"><input v-model="answers.extraLanguage" type="checkbox" :aria-label="copy.labels.language"><span><strong>{{ copy.labels.language }}</strong><small>+ {{ money(pricing.extras.extraLanguage) }}</small></span></label>
          <label class="switch-row"><input v-model="answers.maintenance" type="checkbox" :aria-label="copy.labels.maintenance"><span><strong>{{ copy.labels.maintenance }}</strong><small>{{ money(pricing.maintenanceMonthly) }} {{ copy.monthly }}</small></span></label>
          <fieldset><legend>{{ copy.labels.timeline }}</legend><label v-for="item in [['flexible',copy.labels.flexible],['soon',copy.labels.soon],['urgent',copy.labels.urgent]]" :key="item[0]"><input v-model="answers.timeline" type="radio" :value="item[0]" :aria-label="item[1]"> {{ item[1] }}</label></fieldset>
        </div>
        <form v-else-if="!sent" class="lead-form" @submit.prevent="submit">
          <div class="field"><label for="lead-name">{{ copy.labels.name }}</label><input id="lead-name" v-model="contact.name" required minlength="2" autocomplete="name"></div><div class="field"><label for="lead-email">{{ copy.labels.email }}</label><input id="lead-email" v-model="contact.email" required type="email" autocomplete="email"></div><div class="field"><label for="lead-company">{{ copy.labels.company }}</label><input id="lead-company" v-model="contact.company" autocomplete="organization"></div><div class="field"><label for="lead-website">{{ copy.labels.website }}</label><input id="lead-website" v-model="contact.website" inputmode="url" placeholder="https://"></div><div class="field wide"><label for="lead-message">{{ copy.labels.message }}</label><textarea id="lead-message" v-model="contact.message" rows="3"></textarea></div><div class="trap" aria-hidden="true"><label>Company name<input v-model="contact.companyName" tabindex="-1" autocomplete="off"></label></div><label class="privacy wide"><input v-model="contact.privacyAccepted" type="checkbox" :aria-label="copy.labels.privacy" required> <span>{{ copy.labels.privacy }} <router-link :to="lang === 'ca' ? '/ca/privacitat' : '/es/privacidad'" target="_blank" rel="noopener noreferrer">{{ lang === 'ca' ? 'Més informació' : 'Más información' }}</router-link>.</span></label><p v-if="error" class="form-error wide" role="alert">{{ error }}</p><button class="btn btn-primary wide" :disabled="isSubmitting">{{ isSubmitting ? copy.sending : copy.send }} →</button>
        </form>
        <div v-else class="success-panel" role="status"><span>✓</span><h2>{{ copy.labels.success }}</h2><p>{{ copy.labels.successText }}</p><router-link to="/" class="btn btn-outline">Portfolio</router-link></div>
        <footer v-if="!sent" class="step-actions"><button v-if="step > 0" type="button" class="back" @click="move(-1)">← {{ copy.back }}</button><button v-if="step < 4" type="button" class="btn btn-primary" @click="move(1)">{{ copy.next }} →</button></footer>
      </section>
      <aside class="estimate-card" aria-live="polite"><span class="eyebrow">{{ copy.estimate }}</span><template v-if="estimate.custom"><strong class="custom-price">{{ copy.custom }}</strong></template><template v-else><div class="price-range"><strong>{{ money(estimate.netMin) }}</strong><span>—</span><strong>{{ money(estimate.netMax) }}</strong></div><small>{{ copy.beforeVat }}</small><div class="tax-line"><span>{{ copy.tax }}</span><span>{{ money(estimate.totalMin) }} — {{ money(estimate.totalMax) }}</span></div><div v-if="estimate.monthly" class="tax-line"><span>{{ lang === 'ca' ? 'Manteniment' : 'Mantenimiento' }}</span><span>{{ money(estimate.monthly) }} {{ copy.monthly }}</span></div><ul><li v-for="item in estimate.items" :key="item.code"><span>{{ item.label }}</span><span>{{ money(item.amount) }}</span></li></ul></template><p>{{ copy.orientation }}</p><small class="version">TARIFA / {{ pricingVersion || 'BASE' }}</small></aside>
    </div>
  </main>
</template>

<style scoped>
.configurator{--signal:#d7ff4f}.eyebrow{font:700 .68rem monospace;letter-spacing:.16em;color:var(--text-secondary)}.config-head{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;margin-bottom:55px}.config-head h1{font-size:clamp(2.8rem,6vw,5.8rem);max-width:780px;margin:14px 0 20px}.config-head p{max-width:560px}.progress{display:grid;grid-template-columns:repeat(5,28px);gap:5px;flex:none}.progress span{height:3px;background:var(--border-color)}.progress span.active{background:var(--signal)}.progress small{grid-column:1/-1;text-align:right;margin-top:8px;font:700 .65rem monospace}.config-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}.question-panel,.estimate-card{border:1px solid var(--border-color);background:var(--bg-secondary);border-radius:18px}.question-panel{padding:clamp(22px,4vw,46px)}.step-number{display:inline-grid;place-items:center;width:38px;height:25px;background:var(--signal);color:#111;font:700 .7rem monospace;clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}.question-copy h2{font-size:clamp(2rem,4vw,3.5rem);margin:20px 0 12px}.question-copy p{font-size:1rem}.option-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:35px}.option{position:relative;display:flex;flex-direction:column;align-items:flex-start;min-height:145px;padding:22px;background:var(--bg-color);color:var(--text-primary);border:1px solid var(--border-color);border-radius:12px;text-align:left;cursor:pointer;transition:.2s}.option:hover{transform:translateY(-2px);border-color:var(--text-secondary)}.option.selected{border-color:var(--signal);box-shadow:inset 0 0 0 1px var(--signal)}.option-check{position:absolute;right:16px;top:14px;color:var(--signal);font-weight:800}.option strong{margin-top:auto;font-size:1rem}.option small{margin-top:5px;color:var(--text-secondary)}.step-actions{display:flex;justify-content:space-between;align-items:center;margin-top:36px}.back{border:0;background:transparent;color:var(--text-secondary);padding:12px 0;cursor:pointer}.estimate-card{position:sticky;top:100px;padding:28px;overflow:hidden}.estimate-card:before{content:'';display:block;height:5px;background:var(--signal);margin:-28px -28px 25px}.price-range{display:flex;align-items:center;gap:8px;margin:25px 0 3px}.price-range strong{font-size:2rem}.price-range span{color:var(--text-secondary)}.estimate-card>small{color:var(--text-secondary)}.tax-line{display:flex;justify-content:space-between;gap:15px;padding:13px 0;border-top:1px solid var(--border-color);font-size:.78rem}.tax-line:first-of-type{margin-top:24px}.estimate-card ul{list-style:none;margin-top:18px}.estimate-card li{display:flex;justify-content:space-between;gap:16px;padding:8px 0;color:var(--text-secondary);font-size:.75rem}.estimate-card>p{font-size:.75rem;margin-top:22px}.version{display:block;margin-top:18px;font:700 .6rem monospace}.custom-price{display:block;font-size:1.5rem;line-height:1.2;margin:30px 0}.scope-fields{display:grid;gap:12px;margin-top:35px}.switch-row,fieldset{display:flex;gap:15px;padding:18px;background:var(--bg-color);border:1px solid var(--border-color);border-radius:11px}.switch-row input{accent-color:var(--signal);width:20px}.switch-row span{display:flex;justify-content:space-between;gap:18px;width:100%}.switch-row small{color:var(--text-secondary)}fieldset{flex-wrap:wrap;margin:0}legend{padding:0 8px;font-weight:700}fieldset label{margin-right:16px}fieldset input{accent-color:var(--signal)}.lead-form{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px}.field{display:flex;flex-direction:column;gap:7px}.field label{font-size:.75rem;color:var(--text-secondary)}.field input,.field textarea{background:var(--bg-color);border:1px solid var(--border-color);border-radius:9px;padding:13px;color:var(--text-primary);font:inherit}.wide{grid-column:1/-1}.privacy{display:flex;align-items:flex-start;gap:10px;font-size:.78rem;color:var(--text-secondary)}.privacy input{margin-top:3px;accent-color:var(--signal)}.trap{position:absolute;left:-10000px}.form-error{color:#ef4444;font-size:.85rem}.success-panel{text-align:center;padding:60px 10px}.success-panel>span{display:grid;place-items:center;width:55px;height:55px;margin:0 auto 25px;border-radius:50%;background:var(--signal);color:#111;font-size:1.5rem}.success-panel p{margin:15px auto 28px}.success-panel .btn{display:inline-flex}
@media(max-width:850px){.config-head{align-items:flex-start;flex-direction:column}.config-grid{grid-template-columns:1fr}.estimate-card{position:static;grid-row:1}.question-panel{grid-row:2}.progress{align-self:stretch;grid-template-columns:repeat(5,1fr)}.price-range strong{font-size:clamp(1.5rem,7vw,2rem)}}@media(max-width:560px){.option-grid,.lead-form{grid-template-columns:1fr}.option{min-height:120px}.switch-row span{flex-direction:column;gap:3px}.step-actions{gap:15px}.step-actions .btn{margin-left:auto}}
.config-head { gap: 24px; margin-bottom: 32px; }
.config-head h1 {
  max-width: 760px;
  font-size: clamp(2rem, 3.5vw, 3.1rem);
  line-height: 1.15;
  text-wrap: balance;
  margin: 14px 0 16px;
}
.config-head p { font-size: 1rem; line-height: 1.65; }
.question-copy h2 { font-size: clamp(1.5rem, 2.5vw, 2.1rem); line-height: 1.2; text-wrap: balance; }
.question-copy p { line-height: 1.65; }
.option-grid { margin-top: 24px; }
.success-panel h2 { font-size: clamp(1.7rem, 2.7vw, 2.3rem); line-height: 1.2; }
.configurator{--signal:#ff785a}.eyebrow,.progress small,.step-number{font-family:inherit}.question-panel,.estimate-card{border-radius:0;background:transparent}.question-panel{border-width:1px 0 0;padding-inline:0}.estimate-card{border-width:1px 0;padding-inline:0}.step-number{background:transparent;color:var(--text-secondary);clip-path:none;display:inline;padding:0}.question-copy h2:focus{outline:none}.option{border-radius:0;background:transparent}.option.selected{background:var(--text-primary);color:var(--bg-color);box-shadow:none}.option.selected small{color:color-mix(in srgb,var(--bg-color) 70%,transparent)}.option.selected .option-check{color:var(--signal)}
@media (max-width: 850px) {
  .config-head { gap: 20px; }
  .question-panel { grid-row: 1; }
  .estimate-card { grid-row: 2; }
}
</style>
