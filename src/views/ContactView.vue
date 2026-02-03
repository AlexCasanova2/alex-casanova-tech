<script setup>
import { ref } from 'vue'
import { userData } from '../config/userData'

const form = ref({ name: '', email: '', message: '' })
const isSending = ref(false)

const submitForm = () => {
  isSending.value = true
  setTimeout(() => {
    alert('¡Mensaje enviado con éxito!')
    form.value = { name: '', email: '', message: '' }
    isSending.value = false
  }, 1000)
}
</script>

<template>
  <div class="contact-page page-full">
    <div class="section-header">
      <div class="header-text">
        <router-link to="/" class="back-link">← Volver a inicio</router-link>
        <h1>Hablemos de tu próximo proyecto</h1>
      </div>
    </div>

    <section class="contact-section no-border">
      <div class="contact-grid">
        <div class="contact-info">
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

        <form @submit.prevent="submitForm" class="contact-form">
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
            {{ isSending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  margin-top: 40px;
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

@media (min-width: 850px) {
  .contact-page {
    margin-top: 60px;
  }
}
</style>
