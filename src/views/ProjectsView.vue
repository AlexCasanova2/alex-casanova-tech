<script setup>
import { ref, computed } from 'vue'
import projectsData from '../projects.json'
import ProjectCard from '../components/ProjectCard.vue'

const projects = ref(projectsData)
const categories = ['Todos', 'SaaS', 'E-commerce', 'Landing']
const activeCategory = ref('Todos')

const filteredProjects = computed(() => {
  if (activeCategory.value === 'Todos') return projects.value
  return projects.value.filter(p => p.category === activeCategory.value)
})
</script>

<template>
  <div class="projects-page page-full">
    <div class="section-header">
      <div class="header-text">
        <router-link to="/" class="back-link">← Volver a inicio</router-link>
        <h1>Todos los Proyectos</h1>
      </div>
      <div class="filters">
        <button 
          v-for="cat in categories" 
          :key="cat"
          @click="activeCategory = cat"
          :class="{ active: activeCategory === cat }"
        >{{ cat }}</button>
      </div>
    </div>

    <div class="projects-grid">
      <ProjectCard 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :project="project" 
      />
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  margin-top: 0;
  min-height: 80vh;
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

@media (min-width: 850px) {
  .page-full {
    margin-top: 60px;
  }
}

.filters button {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  transition: var(--transition);
  white-space: nowrap;
  cursor: pointer;
}

@media (min-width: 768px) {
  .filters button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

.filters button.active {
  background: var(--text-main);
  color: var(--bg);
  border-color: var(--text-main);
}
</style>
