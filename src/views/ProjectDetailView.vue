<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../config/supabase'
import { marked } from 'marked'

const { t } = useI18n()
const route = useRoute()
const projectId = route.params.id

const project = ref(null)
const loading = ref(true)
const userSession = ref(null)

onMounted(async () => {
  supabase.auth.getSession().then(({ data }) => {
    userSession.value = data.session
  })
  
  let query = supabase.from('projects').select('*')
  
  if (/^\d+$/.test(projectId)) {
    query = query.eq('id', projectId)
  } else {
    query = query.eq('slug', projectId)
  }
  
  const { data, error } = await query.single()
    
  if (!error && data) {
    project.value = data
    
    // SEO Update
    document.title = data.seo_title 
      ? `${data.seo_title} | Àlex Casanova` 
      : `${data.title} | Àlex Casanova`
      
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = data.seo_description || data.description
  }
  loading.value = false
})
</script>

<template>
  <main v-if="loading" class="page-wrapper container fade-in">
    <h1 style="color: var(--text-secondary);">{{ t('project.loading') }}</h1>
  </main>
  
  <main class="page-wrapper container fade-in" v-else-if="project">
    <div class="project-header">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 40px;">
        <router-link to="/projects" class="back-link" style="margin-bottom: 0; display: inline-flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          {{ t('project.backArchive') }}
        </router-link>
        
        <router-link v-if="userSession" :to="`/admin?edit=${project.id}`" class="edit-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          Editar Proyecto
        </router-link>
      </div>

      <div class="meta fade-in delay-1">
        <span>{{ project.category }}</span>
      </div>
      <h1>{{ project.title }}</h1>
      <p class="description">{{ project.description }}</p>
      
      <div class="tags">
        <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="project-actions" v-if="project.url" style="margin-top: 32px;">
        <a :href="project.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary">{{ t('project.live') }}</a>
      </div>
    </div>

    <div class="project-content">
      <div class="hero-image">
        <img :src="project.image" :alt="project.title" />
      </div>
      
      <div v-if="project.content" class="article markdown-body" v-html="marked.parse(project.content)"></div>
      
      <div v-else class="article">
        <h2>Overview</h2>
        <p>No detailed case study available for this project.</p>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="project-cta fade-in delay-2">
      <div class="cta-content">
        <h2>{{ t('project.ctaTitle') }}</h2>
        <p>{{ t('project.ctaDesc') }}</p>
        <router-link to="/contact" class="btn btn-primary cta-btn">
          {{ t('project.ctaBtn') }}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </router-link>
      </div>
    </div>
  </main>
  
  <main class="page-wrapper container fade-in" v-else>
    <h1>{{ t('project.notFound') }}</h1>
    <router-link to="/projects" class="btn btn-primary" style="margin-top: 24px;">{{ t('project.backArchive') }}</router-link>
  </main>
</template>

<style scoped>
.project-header {
  margin-bottom: 60px;
  max-width: 100%;
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
  font-size: 1rem;
  transition: color var(--transition-fast);
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.edit-btn:hover {
  background: var(--text-primary);
  color: var(--bg-color);
  border-color: var(--text-primary);
}

.project-title-wrapper {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 60px;
  background: var(--bg-secondary);
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

/* Markdown Specific Overrides */
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 40px 0;
  display: block;
}

.markdown-body :deep(h2) {
  margin: 48px 0 24px;
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.markdown-body :deep(h3) {
  margin: 32px 0 16px;
  font-size: 1.5rem;
  font-weight: 500;
}

.markdown-body :deep(p) {
  margin-bottom: 24px;
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  margin-bottom: 24px;
  padding-left: 24px;
  color: var(--text-secondary);
  font-size: 1.125rem;
  line-height: 1.8;
}

.markdown-body :deep(li) {
  margin-bottom: 8px;
}

.markdown-body :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--border-color);
  padding-left: 20px;
  margin: 32px 0;
  font-style: italic;
  color: var(--text-primary);
}

.markdown-body :deep(a) {
  color: var(--text-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* CTA Section */
.project-cta {
  margin-top: 100px;
  padding: 60px 0 20px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.cta-content p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta-btn {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  font-size: 1.1rem;
}
</style>
