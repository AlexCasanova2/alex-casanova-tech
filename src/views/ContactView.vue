<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userData } from '../config/userData'
import { leadAttribution, submissionKey, submitLead, trackLeadEvent } from '../utils/leadCapture'

const { t, locale } = useI18n()

const form = ref({
  name: '',
  email: '',
  message: '',
  privacyAccepted: false,
  companyName: ''
})
const startedAt = Date.now()
let currentSubmissionKey = submissionKey()

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    await submitLead({ ...form.value, source:'contact', language:['es','ca'].includes(locale.value) ? locale.value : 'es', startedAt, submissionKey:currentSubmissionKey, attribution:leadAttribution() })

    isSuccess.value = true
    trackLeadEvent('generate_lead', { source:'contact' })
    currentSubmissionKey = submissionKey()
    form.value = { name: '', email: '', message: '', privacyAccepted:false, companyName:'' }
    
    setTimeout(() => {
      isSuccess.value = false
    }, 5000)
    
  } catch {
    errorMessage.value = t('contact.error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div class="contact-grid">
      <div class="contact-info">
        <h1 v-html="t('contact.title')"></h1>
        <p>{{ t('contact.subtitle') }}</p>
        
        <div class="contact-details">
          <div class="detail-item">
            <span class="label">{{ t('contact.emailLabel') }}</span>
            <a :href="'mailto:' + userData.email" class="value">{{ userData.email }}</a>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('contact.socialsLabel') }}</span>
            <div class="social-links">
              <a :href="userData.linkedin" target="_blank">LinkedIn</a>
              <a :href="userData.github" target="_blank">GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-form-wrapper">
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="input-group">
            <label>{{ t('contact.name') }}</label>
            <input type="text" v-model="form.name" :aria-label="t('contact.name')" required />
          </div>
          <div class="input-group">
            <label>{{ t('contact.email') }}</label>
            <input type="email" v-model="form.email" :aria-label="t('contact.email')" required />
          </div>
          <div class="input-group">
            <label>{{ t('contact.message') }}</label>
            <textarea v-model="form.message" :aria-label="t('contact.message')" rows="5" required></textarea>
          </div>
          <div class="honeypot" aria-hidden="true"><label>Company name<input v-model="form.companyName" tabindex="-1" autocomplete="off" /></label></div>
          <label class="privacy-check"><input v-model="form.privacyAccepted" type="checkbox" aria-label="Aceptación de privacidad" required /><span>{{ locale === 'ca' ? 'Accepto que s’utilitzin les meves dades per respondre aquesta sol·licitud.' : locale === 'en' ? 'I agree that my data may be used to answer this request.' : 'Acepto que se usen mis datos para responder a esta solicitud.' }} <router-link :to="locale === 'ca' ? '/ca/privacitat' : '/es/privacidad'" target="_blank">{{ locale === 'ca' ? 'Més informació' : locale === 'en' ? 'More information' : 'Más información' }}</router-link>.</span></label>
          
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting" style="width: 100%; margin-top: 16px;">
            {{ isSubmitting ? t('contact.sending') : t('contact.send') }}
          </button>
          
          <transition name="fade">
            <div v-if="isSuccess" class="success-msg">
              {{ t('contact.success') }}
            </div>
          </transition>
          
          <transition name="fade">
            <div v-if="errorMessage" class="error-msg" style="margin-top: 16px;">
              {{ errorMessage }}
            </div>
          </transition>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  padding-top: 40px;
}

@media (min-width: 850px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
    gap: 100px;
  }
}

.contact-info h1 {
  margin-bottom: 24px;
}

.contact-info p {
  margin-bottom: 48px;
  max-width: 500px;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.value:hover {
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  gap: 24px;
}

.social-links a {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.social-links a:hover {
  color: var(--text-secondary);
}

.contact-form-wrapper {
  background: var(--bg-secondary);
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.honeypot{position:absolute;left:-10000px}.privacy-check{display:flex;align-items:flex-start;gap:10px;color:var(--text-secondary);font-size:.8rem}.privacy-check input{margin-top:3px;accent-color:var(--text-primary)}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.input-group input,
.input-group textarea {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color var(--transition-fast);
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: var(--text-primary);
}

.success-msg {
  margin-top: 16px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  text-align: center;
}

.error-msg {
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.contact-grid{gap:clamp(28px,5vw,60px);padding-top:0;grid-template-columns:minmax(0,1fr)}
.contact-info,.contact-form-wrapper,.input-group{min-width:0}
.contact-form-wrapper{padding:clamp(20px,3vw,40px)}
.input-group input,.input-group textarea{width:100%;font-size:1rem}
.value{overflow-wrap:anywhere;font-size:clamp(1rem,2vw,1.25rem)}
.social-links{flex-wrap:wrap;gap:12px 24px}
.social-links a{display:inline-flex;align-items:center;min-height:44px}
@media(min-width:900px){.contact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:599px){.contact-info p{margin-bottom:24px}.contact-details{gap:20px}.contact-info h1{font-size:clamp(2.1rem,8vw,3rem)}}
</style>
