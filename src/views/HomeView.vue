<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userData } from '../config/userData'
import { supabase } from '../config/supabase'

const { t } = useI18n()
const featuredProjects = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .limit(3)
    
  if (!error && data) {
    featuredProjects.value = data
  }
  loading.value = false
})
</script>

<template>
  <main class="page-wrapper container">
    <section class="hero fade-in">
      <div class="hero-content">
        <div class="availability">
          <span class="dot"></span>
          {{ t('home.availability') }}
        </div>
        <h1>{{ userData.name }}</h1>
        <p class="hero-desc">
          {{ t('home.desc', { name: userData.name, years: userData.experienceYears }) }}
        </p>
        <div class="hero-actions">
          <router-link to="/contact" class="hero-btn btn-filled">
            <span class="btn-content">
              {{ t('home.getInTouch') }}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <div class="btn-glow"></div>
          </router-link>
          
          <a :href="userData.github" target="_blank" class="hero-btn btn-glass">
            <span class="btn-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.49C9.339 21.582 9.52 21.272 9.52 21.006C9.52 20.766 9.511 19.954 9.506 19.062C6.726 19.665 6.139 17.92 6.139 17.92C5.684 16.764 5.028 16.456 5.028 16.456C4.12 15.836 5.097 15.848 5.097 15.848C6.102 15.918 6.629 16.88 6.629 16.88C7.521 18.409 8.966 17.967 9.539 17.708C9.629 17.061 9.889 16.62 10.177 16.368C7.96 16.116 5.626 15.26 5.626 11.476C5.626 10.398 6.011 9.516 6.638 8.824C6.537 8.572 6.196 7.568 6.735 6.208C6.735 6.208 7.56 5.944 9.497 7.256C10.281 7.038 11.129 6.929 11.974 6.925C12.818 6.929 13.666 7.038 14.451 7.256C16.387 5.944 17.211 6.208 17.211 6.208C17.751 7.568 17.41 8.572 17.31 8.824C17.939 9.516 18.322 10.398 18.322 11.476C18.322 15.271 15.985 16.113 13.761 16.358C14.121 16.669 14.443 17.283 14.443 18.236C14.443 19.601 14.43 20.702 14.43 21.006C14.43 21.275 14.609 21.588 15.115 21.488C19.132 20.162 22 16.416 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
              </svg>
              {{ t('home.viewGithub') }}
            </span>
          </a>
        </div>
      </div>

      <div class="hero-visual">
        <div class="tech-art-container">
          <!-- Ambient core -->
          <div class="core-glow"></div>
          
          <!-- Concentric rotating rings -->
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
          
          <!-- Floating UI Cards -->
          <div class="art-card card-code">
            <div class="code-line short"></div>
            <div class="code-line long"></div>
            <div class="code-line medium"></div>
            <div class="code-line purple"></div>
          </div>
          
          <div class="art-card card-design">
            <div class="design-circle"></div>
            <div class="design-bar"></div>
            <div class="design-bar" style="width: 60%"></div>
          </div>
          
          <!-- Floating Tags -->
          <div class="floating-tag tag-1">VUE.JS</div>
          <div class="floating-tag tag-2">UX / UI</div>
        </div>
      </div>
    </section>

    <section class="featured-work fade-in delay-2">
      <div class="section-header">
        <h2>{{ t('home.selectedWork') }}</h2>
        <router-link to="/projects" class="view-all">{{ t('home.viewAll') }} →</router-link>
      </div>

      <div v-if="loading" style="color: var(--text-secondary); margin-top: 24px;">{{ t('home.loading') }}</div>
      <div v-else class="grid projects-grid">
        <router-link :to="`/project/${project.slug || project.id}`" v-for="project in featuredProjects" :key="project.id" class="project-card">
          <div class="project-image">
            <img :src="project.image" :alt="project.title" />
            <div class="overlay">
               <span class="view-btn">{{ t('home.viewProject') }}</span>
            </div>
          </div>
          <div class="project-info">
            <div class="project-meta">
              <span class="category">{{ project.category }}</span>
            </div>
            <h3>{{ project.title }}</h3>
          </div>
        </router-link>
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  padding: 60px 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  align-items: center;
}

@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    padding: 100px 0;
  }
}

.hero-content {
  max-width: 600px;
}

.availability {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #10B981;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

.text-muted {
  color: var(--text-secondary);
}

.hero-desc {
  margin: 32px 0 48px;
  font-size: clamp(1.125rem, 2vw, 1.4rem);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.hero-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-filled {
  background: var(--text-primary);
  color: var(--bg-color);
  border: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn-filled svg {
  transition: transform 0.3s ease;
}

.btn-filled:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

:root[data-theme="light"] .btn-filled:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.btn-filled:hover svg {
  transform: translateX(4px);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: skewX(-20deg);
  animation: shine 4s infinite;
}

:root[data-theme="light"] .btn-glow {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
}

@keyframes shine {
  0% { left: -100%; }
  20%, 100% { left: 200%; }
}

.btn-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

:root[data-theme="light"] .btn-glass {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}

.btn-glass:hover {
  background: var(--text-primary) !important;
  color: var(--bg-color) !important;
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.btn-glass:hover .btn-content,
.btn-glass:hover svg {
  color: var(--bg-color) !important;
}

/* Premium Tech Art Visual */
.hero-visual {
  position: relative;
  height: 500px;
  display: none;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .hero-visual {
    display: flex;
  }
}

.tech-art-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(120, 119, 198, 0.3) 0%, rgba(16, 185, 129, 0.15) 40%, transparent 70%);
  filter: blur(50px);
  z-index: 0;
  animation: pulse-glow 8s infinite alternate ease-in-out;
}

:root[data-theme="light"] .core-glow {
  background: radial-gradient(circle, rgba(120, 119, 198, 0.2) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%);
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  z-index: 1;
}

:root[data-theme="light"] .ring {
  border-color: rgba(0, 0, 0, 0.1);
}

.ring-1 { width: 420px; height: 420px; animation: spin-slow 30s linear infinite; }
.ring-2 { width: 280px; height: 280px; border: 1px solid rgba(255, 255, 255, 0.05); animation: spin-slow-reverse 20s linear infinite; }
.ring-3 { width: 140px; height: 140px; animation: spin-slow 15s linear infinite; }

:root[data-theme="light"] .ring-2 { border-color: rgba(0, 0, 0, 0.05); }

/* Floating cards to simulate UI/Code elements */
.art-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  z-index: 2;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:root[data-theme="light"] .art-card {
  background: rgba(255, 255, 255, 0.6);
  border-color: rgba(0, 0, 0, 0.06);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
}

.card-code {
  width: 180px;
  height: 120px;
  top: 15%;
  right: 5%;
  animation: float-complex 8s infinite ease-in-out;
  padding: 16px;
  gap: 8px;
}

.card-design {
  width: 140px;
  height: 160px;
  bottom: 15%;
  left: 10%;
  animation: float-complex 7s infinite ease-in-out;
  animation-delay: -3s;
  padding: 16px;
}

/* Internal elements to make cards look like real UI */
.code-line {
  height: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

:root[data-theme="light"] .code-line { background: rgba(0, 0, 0, 0.08); }

.code-line.short { width: 40%; background: #10B981; opacity: 0.8; }
.code-line.medium { width: 70%; }
.code-line.long { width: 90%; }
.code-line.purple { background: #8B5CF6; width: 50%; opacity: 0.8; }

.design-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  margin-bottom: auto;
}

.design-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}
:root[data-theme="light"] .design-bar { background: rgba(0, 0, 0, 0.08); }

.floating-tag {
  position: absolute;
  background: var(--text-primary);
  color: var(--bg-color);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  z-index: 3;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.tag-1 {
  top: 45%;
  left: 0%;
  animation: float 5s infinite ease-in-out;
  animation-delay: -1s;
}

.tag-2 {
  bottom: 30%;
  right: 5%;
  animation: float 6s infinite ease-in-out;
  animation-delay: -4s;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
}

@keyframes spin-slow { 100% { transform: rotate(360deg); } }
@keyframes spin-slow-reverse { 100% { transform: rotate(-360deg); } }
@keyframes pulse-glow { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.1); opacity: 0.8; } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes float-complex { 
  0%, 100% { transform: translateY(0px) rotate(0deg); } 
  50% { transform: translateY(-15px) rotate(2deg); } 
}

/* Featured Work */
.featured-work {
  margin-top: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 24px;
}

.view-all {
  color: var(--text-secondary);
  font-size: 1rem;
}

.view-all:hover {
  color: var(--text-primary);
}

.projects-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  cursor: pointer;
  text-decoration: none;
}

.project-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover .project-image img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-smooth);
}

.project-card:hover .overlay {
  opacity: 1;
}

.view-btn {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  transform: translateY(10px);
  transition: all var(--transition-smooth);
}

.project-card:hover .view-btn {
  transform: translateY(0);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.project-card h3 {
  font-size: 1.5rem;
}
</style>
