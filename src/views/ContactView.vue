<script setup>
import { ref } from 'vue'
import emailjs from '@emailjs/browser'
import { userData } from '../config/userData'

const form = ref({ name: '', email: '', message: '' })
const isSending = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const submitForm = () => {
  if (userData.emailjs.serviceId === 'YOUR_SERVICE_ID') {
    errorMessage.value = 'Por favor, configura tus credenciales de EmailJS en src/config/userData.js'
    return
  }

  isSending.value = true
  errorMessage.value = ''
  
  const templateParams = {
    from_name: form.value.name,
    from_email: form.value.email,
    message: form.value.message,
    to_name: userData.name,
    to_email: userData.email
  }

  emailjs.send(
    userData.emailjs.serviceId,
    userData.emailjs.templateId,
    templateParams,
    userData.emailjs.publicKey
  )
    .then(() => {
      showSuccess.value = true
      form.value = { name: '', email: '', message: '' }
    })
    .catch((error) => {
      console.error('Error al enviar el correo:', error)
      errorMessage.value = 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.'
    })
    .finally(() => {
      isSending.value = false
    })
}

const resetForm = () => {
  showSuccess.value = false
  errorMessage.value = ''
}

</script>

<template>
  <div class="contact-page page-full">
    <div class="section-header reveal">
      <div class="header-text">
        <router-link to="/" class="back-link">← Volver a inicio</router-link>
        <h1>Hablemos de tu próximo proyecto</h1>
      </div>
    </div>

    <section class="contact-section no-border">
      <div class="contact-grid">
        <div class="contact-info reveal-side delay-1">
          <h2>¿Tienes una idea?<br><span>Hagámosla realidad.</span></h2>
          <p>Actualmente aceptando proyectos de alto impacto y colaboraciones estratégicas.</p>
          <div class="contact-links">
            <a :href="'mailto:' + userData.email" class="email-link">{{ userData.email }}</a>
            <div class="social-row">
              <a :href="userData.linkedin" target="_blank" title="LinkedIn">
                <svg viewBox="0 0 24 24" class="icon-contact">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="currentColor"/>
                </svg>
              </a>
              <a :href="userData.github" target="_blank" title="GitHub">
                <svg viewBox="0 0 24 24" class="icon-contact">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="form-container reveal-scale delay-2">
          <Transition name="fade-slide" mode="out-in">
            <div v-if="showSuccess" class="success-state" key="success">
              <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h3>¡Mensaje enviado!</h3>
              <p>Gracias por contactar. Te responderé lo antes posible.</p>
              <button @click="resetForm" class="btn btn-outline">Enviar otro mensaje</button>
            </div>

            <form v-else @submit.prevent="submitForm" class="contact-form" key="form">
              <div v-if="errorMessage" class="error-banner">
                {{ errorMessage }}
              </div>
              <div class="input-group">
                <label>Nombre</label>
                <input v-model="form.name" type="text" placeholder="Tu nombre" required>
              </div>
              <div class="input-group">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="hola@ejemplo.com" required>
              </div>
              <div class="input-group">
                <label>Mensaje</label>
                <textarea v-model="form.message" rows="6" placeholder="Cuéntame sobre tu proyecto..." required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="isSending">
                <span v-if="isSending" class="loader"></span>
                <span>{{ isSending ? 'Enviando...' : 'Enviar mensaje' }}</span>
              </button>
            </form>
          </Transition>
        </div>

      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  margin-top: 0;
  min-height: 80vh;
}

.no-border {
  border: none !important;
  margin-top: 0 !important;
  padding-top: 20px !important;
}

.header-text h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-top: 10px;
  letter-spacing: -0.02em;
}

.back-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: var(--transition);
}

.back-link:hover {
  color: var(--accent);
}

.icon-contact {
  width: 24px;
  height: 24px;
  display: block;
}

.social-row a {
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-muted);
  transition: var(--transition);
}

.social-row a:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  border-color: var(--accent);
}

.form-container {
  position: relative;
  min-height: 400px;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  height: 100%;
}

.success-icon {
  width: 80px;
  height: 80px;
  color: var(--accent);
  margin-bottom: 24px;
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-state h3 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: var(--text-main);
}

.success-state p {
  color: var(--text-muted);
  margin-bottom: 32px;
}

.error-banner {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.2);
  color: #ff4444;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-outline:hover {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  margin-right: 10px;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (min-width: 850px) {
  .contact-page {
    margin-top: 60px;
  }
}

</style>
