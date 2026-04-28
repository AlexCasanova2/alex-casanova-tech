<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../config/supabase'

const categories = ref(['All'])
const activeCategory = ref('All')
const projectsData = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (!error && data) {
    projectsData.value = data
    // Extract unique categories dynamically
    const uniqueCats = [...new Set(data.map(p => p.category))].filter(Boolean)
    categories.value = ['All', ...uniqueCats]
  }
  loading.value = false
})

const filteredProjects = computed(() => {
  if (activeCategory.value === 'All') return projectsData.value
  return projectsData.value.filter(p => p.category === activeCategory.value)
})
</script>

<template>
  <main class="page-wrapper container fade-in">
    <div class="page-header">
      <h1>Archive</h1>
      <p>A collection of selected works and experiments.</p>
    </div>

    <div class="filters">
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="activeCategory = cat"
        :class="['filter-btn', { active: activeCategory === cat }]"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--text-secondary); margin-top: 24px;">Loading projects...</div>
    <div v-else class="grid projects-grid">
      <router-link :to="`/project/${project.id}`" v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-image">
          <img :src="project.image" :alt="project.title" loading="lazy" />
          <div class="overlay">
             <span class="view-btn">View Project</span>
          </div>
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="category">{{ project.category }}</span>
          </div>
          <h3>{{ project.title }}</h3>
          <p class="description">{{ project.description }}</p>
        </div>
      </router-link>
    </div>
  </main>
</template>

<style scoped>
.page-header {
  margin-bottom: 48px;
}

.page-header p {
  margin-top: 16px;
  max-width: 600px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.filter-btn.active {
  background: var(--text-primary);
  color: var(--bg-color);
  border-color: var(--text-primary);
}

.projects-grid {
  grid-template-columns: 1fr;
  gap: 40px;
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

.description {
  font-size: 1rem;
  margin-top: 4px;
}
</style>
