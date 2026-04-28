<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../config/supabase'

const route = useRoute()
const projectId = route.params.id

const project = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
    
  if (!error && data) {
    project.value = data
  }
  loading.value = false
})
</script>

<template>
  <main v-if="loading" class="page-wrapper container fade-in">
    <h1 style="color: var(--text-secondary);">Loading project...</h1>
  </main>
  
  <main class="page-wrapper container fade-in" v-else-if="project">
    <div class="project-header">
      <router-link to="/projects" class="back-link">← Back to Archive</router-link>
      <div class="meta">
        <span>{{ project.category }}</span>
        <span>2024</span>
      </div>
      <h1>{{ project.title }}</h1>
      <p class="description">{{ project.description }}</p>
      
      <div class="tags">
        <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="project-content">
      <div class="hero-image">
        <img :src="project.image" :alt="project.title" />
      </div>
      
      <div class="article">
        <h2>Overview</h2>
        <p>This is a simulated case study for <strong>{{ project.title }}</strong>. In a real-world scenario, this section would detail the problem statement, the approach taken, and the final results achieved. It would showcase the design process, technical architecture, and key learnings.</p>
        
        <h2>Challenges</h2>
        <p>Building high-performance interfaces requires a deep understanding of both aesthetics and engineering. The main challenge was to deliver a smooth, accessible, and fast experience without compromising the premium look and feel.</p>
      </div>
    </div>
  </main>
  
  <main class="page-wrapper container fade-in" v-else>
    <h1>Project not found.</h1>
    <router-link to="/projects" class="btn btn-primary" style="margin-top: 24px;">Return to Archive</router-link>
  </main>
</template>

<style scoped>
.project-header {
  margin-bottom: 60px;
  max-width: 800px;
}

.back-link {
  display: inline-block;
  margin-bottom: 40px;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.back-link:hover {
  color: var(--text-primary);
}

.meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-header h1 {
  margin-bottom: 24px;
}

.description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.hero-image {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 60px;
  background: var(--bg-secondary);
}

.hero-image img {
  width: 100%;
  height: auto;
  display: block;
}

.article {
  max-width: 700px;
  margin: 0 auto;
}

.article h2 {
  margin: 48px 0 24px;
  font-size: 2rem;
}

.article p {
  margin-bottom: 24px;
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
}
</style>
