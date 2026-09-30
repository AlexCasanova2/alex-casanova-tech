<script setup>
import { useI18n } from 'vue-i18n'
import LeadContactForm from '../components/LeadContactForm.vue'
import { userData } from '../config/userData'

const { t, locale } = useI18n()
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div class="contact-grid">
      <div class="contact-info">
        <span class="contact-eyebrow">{{ locale === 'ca' ? 'COMENCEM UN PROJECTE' : locale === 'en' ? 'START A PROJECT' : 'EMPECEMOS UN PROYECTO' }}</span>
        <h1>{{ t('contact.title') }}</h1>
        <p>{{ t('contact.subtitle') }}</p>
        
        <div class="contact-details">
          <div class="detail-item">
            <span class="label">{{ t('contact.emailLabel') }}</span>
            <a :href="'mailto:' + userData.email" class="value">{{ userData.email }}</a>
          </div>
          <div class="detail-item">
            <span class="label">{{ t('contact.socialsLabel') }}</span>
            <div class="social-links">
              <a :href="userData.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a :href="userData.github" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-form-wrapper">
        <LeadContactForm />
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

.contact-grid{gap:clamp(28px,5vw,60px);padding-top:0;grid-template-columns:minmax(0,1fr)}
.contact-info,.contact-form-wrapper{min-width:0}
.contact-form-wrapper{padding:clamp(20px,3vw,40px)}
.value{overflow-wrap:anywhere;font-size:clamp(1rem,2vw,1.25rem)}
.social-links{flex-wrap:wrap;gap:12px 24px}
.social-links a{display:inline-flex;align-items:center;min-height:44px}
@media(min-width:900px){.contact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:599px){.contact-info p{margin-bottom:24px}.contact-details{gap:20px}.contact-info h1{font-size:clamp(2.1rem,8vw,3rem)}}
.contact-grid{grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr);gap:clamp(50px,10vw,140px);padding-block:clamp(35px,7vw,90px)}
.contact-eyebrow{display:block;font-size:.65rem;letter-spacing:.12em;color:var(--text-secondary);margin-bottom:24px}
.contact-info h1{font-size:clamp(2.5rem,5.5vw,5.5rem);line-height:.98;letter-spacing:-.06em;max-width:700px}
.contact-info p{font-size:1rem;line-height:1.75;max-width:470px;margin:30px 0 64px}
.contact-details{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding-top:20px;border-top:1px solid var(--border-color)}
.label{font-size:.62rem}
.value,.social-links a{font-size:.9rem}
.contact-form-wrapper{background:transparent;border:0;border-radius:0;padding:0}
@media(max-width:800px){.contact-grid{grid-template-columns:1fr;gap:50px}.contact-info h1{font-size:clamp(2.4rem,12vw,4.2rem)}.contact-info p{margin-bottom:38px}.contact-details{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.contact-details{grid-template-columns:1fr}}
</style>
