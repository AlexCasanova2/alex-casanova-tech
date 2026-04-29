<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="page-wrapper container fade-in not-found">
    <div class="content">
      <div class="glitch-wrapper delay-1 fade-in">
        <h1 class="title">{{ t('notFound.title') }}</h1>
      </div>
      <h2 class="subtitle delay-2 fade-in">{{ t('notFound.subtitle') }}</h2>
      <p class="desc delay-3 fade-in">{{ t('notFound.desc') }}</p>
      
      <div class="action fade-in delay-3" style="animation-delay: 0.4s;">
        <router-link to="/" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          {{ t('notFound.btn') }}
        </router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(100vh - 200px);
}

.content {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 800;
  line-height: 1;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--text-primary) 0%, rgba(255,255,255,0.2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 10px 30px rgba(255, 255, 255, 0.05);
  letter-spacing: -0.05em;
}

:root[data-theme="light"] .title {
  background: linear-gradient(135deg, var(--text-primary) 0%, rgba(0,0,0,0.3) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.subtitle {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.desc {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 480px;
}

.action {
  display: flex;
  justify-content: center;
}

.btn {
  gap: 12px;
  padding: 16px 32px;
  font-size: 1.125rem;
}

/* Optional Glitch effect for 404 */
.glitch-wrapper {
  position: relative;
}
</style>
