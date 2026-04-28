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
    .order('created_at', { ascending: false })
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
      <div class="availability">
        <span class="dot"></span>
        {{ t('home.availability') }}
      </div>
      <h1>{{ userData.name }}</h1>
      <p class="hero-desc">
        {{ t('home.desc', { name: userData.name, years: userData.experienceYears }) }}
      </p>
      <div class="hero-actions">
        <router-link to="/contact" class="btn btn-primary">{{ t('home.getInTouch') }}</router-link>
        <a :href="userData.github" target="_blank" class="btn btn-outline">{{ t('home.viewGithub') }}</a>
      </div>
    </section>

    <section class="featured-work fade-in delay-2">
      <div class="section-header">
        <h2>{{ t('home.selectedWork') }}</h2>
        <router-link to="/projects" class="view-all">{{ t('home.viewAll') }} →</router-link>
      </div>

      <div v-if="loading" style="color: var(--text-secondary); margin-top: 24px;">{{ t('home.loading') }}</div>
      <div v-else class="grid projects-grid">
        <router-link :to="`/project/${project.id}`" v-for="project in featuredProjects" :key="project.id" class="project-card">
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
  padding: 80px 0;
  max-width: 800px;
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
  margin: 32px 0 40px;
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  max-width: 600px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
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
