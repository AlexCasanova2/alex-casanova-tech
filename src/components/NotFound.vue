<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="page-wrapper container fade-in not-found">
    <div class="content">
      <span class="eyebrow">ERROR / 404</span>
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
  justify-content: flex-start;
  text-align: left;
  min-height: calc(100vh - 200px);
}

.content {
  max-width: 820px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title {
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 800;
  line-height: 1;
  margin-bottom: 16px;
  color: var(--text-primary);
  letter-spacing: -0.05em;
}

.eyebrow{margin-bottom:clamp(30px,6vw,70px);font-size:.65rem;letter-spacing:.14em;color:var(--text-secondary)}

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
  justify-content: flex-start;
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
.content{min-width:0;width:100%}
@media(max-width:650px){.not-found{min-height:60svh}.desc{font-size:1rem;margin-bottom:24px}.btn{padding:12px 20px;font-size:1rem}}
</style>
