<script setup>
import { userData } from '../config/userData'
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div class="contact-grid">
      <div class="contact-info">
        <h1>Let's build <br>something great.</h1>
        <p>Currently accepting new projects and strategic collaborations.</p>
        
        <div class="contact-details">
          <div class="detail-item">
            <span class="label">Email</span>
            <a :href="'mailto:' + userData.email" class="value">{{ userData.email }}</a>
          </div>
          <div class="detail-item">
            <span class="label">Socials</span>
            <div class="social-links">
              <a :href="userData.linkedin" target="_blank">LinkedIn</a>
              <a :href="userData.github" target="_blank">GitHub</a>
            </div>
          </div>
        </div>
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
</style>
