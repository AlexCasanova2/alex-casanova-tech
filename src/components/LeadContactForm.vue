<script setup>
import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { leadAttribution, submissionKey, submitLead, trackLeadEvent } from '../utils/leadCapture'

const props = defineProps({ context: { type:String, default:'contact' } })
const { t, locale } = useI18n()
const form = ref({ name:'', email:'', message:'', privacyAccepted:false, companyName:'' })
const startedAt = Date.now()
let currentSubmissionKey = submissionKey()
let successTimeout
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const fieldId = name => `${props.context === 'wedding-landing' ? 'wedding' : 'contact'}-${name}`

async function submitForm() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await submitLead({ ...form.value, source:'contact', language:['es','ca'].includes(locale.value) ? locale.value : 'es', startedAt, submissionKey:currentSubmissionKey, attribution:leadAttribution() })
    isSuccess.value = true
    trackLeadEvent('generate_lead', { source:props.context })
    currentSubmissionKey = submissionKey()
    form.value = { name:'', email:'', message:'', privacyAccepted:false, companyName:'' }
    clearTimeout(successTimeout)
    successTimeout = setTimeout(() => { isSuccess.value = false }, 5000)
  } catch {
    errorMessage.value = t('contact.error')
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(() => clearTimeout(successTimeout))
</script>

<template>
  <form class="contact-form" @submit.prevent="submitForm">
    <div class="input-group">
      <label :for="fieldId('name')">{{ t('contact.name') }}</label>
      <input :id="fieldId('name')" v-model="form.name" type="text" required autocomplete="name">
    </div>
    <div class="input-group">
      <label :for="fieldId('email')">{{ t('contact.email') }}</label>
      <input :id="fieldId('email')" v-model="form.email" type="email" required autocomplete="email">
    </div>
    <div class="input-group">
      <label :for="fieldId('message')">{{ t('contact.message') }}</label>
      <textarea :id="fieldId('message')" v-model="form.message" rows="5" required :placeholder="context === 'wedding-landing' ? 'Contadme cuándo será la boda y qué os gustaría incluir en vuestra web.' : ''"></textarea>
    </div>
    <div class="honeypot" aria-hidden="true"><label>Company name<input v-model="form.companyName" tabindex="-1" autocomplete="off"></label></div>
    <label class="privacy-check"><input v-model="form.privacyAccepted" type="checkbox" :aria-label="locale === 'ca' ? 'Acceptació de privacitat' : locale === 'en' ? 'Privacy acceptance' : 'Aceptación de privacidad'" required><span>{{ locale === 'ca' ? 'Accepto que s’utilitzin les meves dades per respondre aquesta sol·licitud.' : locale === 'en' ? 'I agree that my data may be used to answer this request.' : 'Acepto que se usen mis datos para responder a esta solicitud.' }} <router-link :to="locale === 'ca' ? '/ca/privacitat' : '/es/privacidad'" target="_blank" rel="noopener noreferrer">{{ locale === 'ca' ? 'Més informació' : locale === 'en' ? 'More information' : 'Más información' }}</router-link>.</span></label>

    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
      {{ isSubmitting ? t('contact.sending') : context === 'wedding-landing' ? 'Solicitar propuesta para nuestra boda' : t('contact.send') }}
    </button>
    <div v-if="isSuccess" class="success-msg" role="status">{{ context === 'wedding-landing' ? 'Hemos recibido vuestra consulta. Os responderé pronto.' : t('contact.success') }}</div>
    <div v-if="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</div>
  </form>
</template>

<style scoped>
.contact-form { display:flex; flex-direction:column; }
.input-group { display:flex; flex-direction:column; gap:8px; padding:20px 0; border-bottom:1px solid var(--border-color); }
.input-group:first-child { border-top:1px solid var(--border-color); }
.input-group label { color:var(--text-secondary); font-size:.65rem; letter-spacing:.08em; text-transform:uppercase; }
.input-group input, .input-group textarea { width:100%; min-width:0; border:0; background:transparent; padding:10px 0 0; color:var(--text-primary); font:inherit; font-size:1rem; }
.input-group input:focus-visible, .input-group textarea:focus-visible { outline:2px solid var(--text-primary); outline-offset:4px; }
.honeypot { position:absolute; left:-10000px; }
.privacy-check { display:flex; align-items:flex-start; gap:10px; margin-top:20px; color:var(--text-secondary); font-size:.8rem; line-height:1.6; }
.privacy-check input { margin-top:3px; accent-color:var(--text-primary); }
.privacy-check a { text-decoration:underline; text-underline-offset:3px; }
.contact-form > .btn { width:auto; align-self:flex-start; margin-top:28px; }
.success-msg, .error-msg { margin-top:16px; padding:16px; border-radius:4px; font-size:.95rem; text-align:left; color:var(--text-primary); }
.success-msg { background:rgb(16 185 129 / 12%); border:1px solid rgb(16 185 129 / 40%); }
.error-msg { background:rgb(239 68 68 / 12%); border:1px solid rgb(239 68 68 / 40%); }
@media (max-width:480px) { .contact-form > .btn { width:100%; } }
</style>
