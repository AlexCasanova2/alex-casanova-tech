<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { userData } from '../config/userData'

const { t } = useI18n()

const form = ref({
  name: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

const submitForm = async () => {
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    // Usamos FormSubmit.co para enviar el email de forma gratuita y sin backend
    const response = await fetch("https://formsubmit.co/ajax/hola@alexcasanova.tech", {
      method: "POST",
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Nombre: form.value.name,
        Email: form.value.email,
        Mensaje: form.value.message,
        _subject: "✨ Nuevo mensaje desde el Portfolio"
      })
    })

    if (!response.ok) throw new Error('Error de red')

    isSuccess.value = true
    form.value = { name: '', email: '', message: '' }
    
    setTimeout(() => {
      isSuccess.value = false
    }, 5000)
    
  } catch (err) {
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
            <input type="text" v-model="form.name" required />
          </div>
          <div class="input-group">
            <label>{{ t('contact.email') }}</label>
            <input type="email" v-model="form.email" required />
          </div>
          <div class="input-group">
            <label>{{ t('contact.message') }}</label>
            <textarea v-model="form.message" rows="5" required></textarea>
          </div>
          
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
</style>
