<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { supabase } from '../config/supabase'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const { t, locale } = useI18n()
const route = useRoute()
const project = ref(null)
const nextProject = ref(null)
const loading = ref(true)
const userSession = ref(null)
const budgetLink = computed(() => ({ path:locale.value === 'ca' ? '/ca/pressupost-web' : '/es/presupuesto-web', query:{ project:project.value?.slug || project.value?.id } }))
const renderedContent = computed(() => DOMPurify.sanitize(marked.parse(project.value?.content || '')))

onMounted(async () => {
  supabase.auth.getSession().then(({ data }) => {
    userSession.value = data.session
  })
})

watch(() => route.params.id, async (projectId, _, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  loading.value = true
  project.value = null
  nextProject.value = null
  if (!projectId) { loading.value = false; return }
  let query = supabase.from('projects').select('*').or('is_deleted.is.null,is_deleted.eq.false')

  if (/^\d+$/.test(projectId)) {
    query = query.eq('id', projectId)
  } else if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(projectId)) {
    query = query.eq('id', projectId)
  } else {
    query = query.eq('slug', projectId)
  }
  
  const { data, error } = await query.single()
  if (cancelled) return
    
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
    const { data:ordered } = await supabase.from('projects').select('id,slug,title,image,category').or('is_deleted.is.null,is_deleted.eq.false').order('sort_order', { ascending:true }).order('id')
    if (cancelled) return
    if (ordered?.length > 1) {
      const index = ordered.findIndex(item => item.id === data.id)
      nextProject.value = ordered[(index + 1) % ordered.length]
    }
  }
  loading.value = false
}, { immediate:true })
</script>

<template>
  <main v-if="loading" class="page-wrapper container fade-in">
    <h1 style="color: var(--text-secondary);">{{ t('project.loading') }}</h1>
  </main>
  
  <main class="case-study page-wrapper container fade-in" v-else-if="project">
    <div class="project-header">
      <div class="project-navigation">
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
      <section v-if="project.description" class="case-context"><span>{{ locale === 'ca' ? 'El projecte' : locale === 'en' ? 'The project' : 'El proyecto' }}</span><p>{{ project.description }}</p></section>
      
      <div v-if="project.content" class="article markdown-body" v-html="renderedContent"></div>
      
    </div>

    <!-- CTA Section -->
    <div class="project-cta fade-in delay-2">
      <div class="cta-content">
        <h2>{{ t('project.ctaTitle') }}</h2>
        <p>{{ t('project.ctaDesc') }}</p>
        <router-link :to="budgetLink" class="btn btn-primary cta-btn">
          {{ locale === 'ca' ? 'Calcula una web com aquesta' : locale === 'en' ? 'Estimate a website like this' : 'Calcula una web como esta' }}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </router-link>
      </div>
    </div>

    <router-link v-if="nextProject" :to="`/project/${nextProject.slug || nextProject.id}`" class="next-case">
      <div class="next-case-label"><span>{{ locale === 'ca' ? 'Següent projecte' : locale === 'en' ? 'Next project' : 'Siguiente proyecto' }}</span><span aria-hidden="true">↗</span></div>
      <h2>{{ nextProject.title }}</h2>
      <div v-if="nextProject.image" class="next-case-image"><img :src="nextProject.image" :alt="nextProject.title" loading="lazy"></div>
    </router-link>
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
.project-navigation{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:32px}
.project-navigation a{min-height:44px}
.article{width:100%;min-width:0;overflow-wrap:anywhere}
.markdown-body :deep(pre){max-width:100%;overflow-x:auto;padding:16px;border-radius:10px;background:var(--bg-secondary);font-size:.9rem;white-space:pre;overflow-wrap:normal}
.markdown-body :deep(table){display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;margin-block:24px}
.markdown-body :deep(th),.markdown-body :deep(td){padding:10px;border:1px solid var(--border-color)}
.markdown-body :deep(iframe),.markdown-body :deep(video){max-width:100%}
.tag{max-width:100%;overflow-wrap:anywhere}
@media(max-width:650px){
  .project-header,.hero-image{margin-bottom:32px}
  .description{font-size:1.05rem;margin-bottom:24px}
  .tags{gap:8px}.tag{font-size:.85rem;padding:6px 12px}
  .markdown-body :deep(h2),.cta-content h2{font-size:clamp(1.6rem,6vw,2rem)}
  .markdown-body :deep(p),.markdown-body :deep(ul),.markdown-body :deep(ol){font-size:1rem}
  .markdown-body :deep(img){margin-block:24px}
  .project-cta{margin-top:48px;padding-top:32px}
  .project-actions .btn,.cta-btn{width:100%;padding:12px 20px}
}
.case-study.container{max-width:1920px;padding-inline:clamp(16px,3vw,48px)}
.case-study .project-header{margin-bottom:36px}
.case-study .project-header h1{font-size:clamp(2.25rem,5.8vw,6rem);max-width:1200px;line-height:1.08;letter-spacing:-.055em}
.case-study .project-navigation{margin-bottom:40px;font-size:.75rem}
.case-study .meta{font-size:.65rem;letter-spacing:.1em}
.case-study .tag{padding:0;border:0;border-radius:0;font-size:.65rem;letter-spacing:.07em;text-transform:uppercase}
.case-study .tag+.tag::before{content:'·';margin-right:12px;color:var(--text-secondary)}
.case-study .project-actions{margin-top:20px!important}
.case-study .hero-image{border-radius:0;margin-bottom:0}
.case-study .hero-image img{max-height:90svh;object-fit:contain;background:var(--bg-secondary)}
.case-context{display:grid;grid-template-columns:1fr 2fr;gap:60px;max-width:1100px;margin:70px auto}
.case-context>span{font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;padding-top:6px}
.case-context p{font-size:clamp(1.1rem,1.6vw,1.5rem);line-height:1.75}
.case-study .article{max-width:1400px;margin:60px auto}
.case-study .markdown-body :deep(p),.case-study .markdown-body :deep(h2),.case-study .markdown-body :deep(h3),.case-study .markdown-body :deep(ul),.case-study .markdown-body :deep(ol){max-width:760px;margin-inline:auto}
.case-study .markdown-body :deep(h2){font-size:clamp(1.6rem,3vw,2.5rem);font-weight:500}
.case-study .markdown-body :deep(p:has(img)),.case-study .markdown-body :deep(p:has(video)){max-width:none}
.case-study .markdown-body :deep(img){border-radius:0;margin:48px auto}
.case-study .project-cta{max-width:1100px;margin:70px auto;padding:40px 24px;border-radius:0;background:transparent}
.next-case{display:block;border-top:1px solid var(--border-color);padding-top:24px;margin-top:64px}
.next-case-label{display:flex;justify-content:space-between;font-size:.7rem;text-transform:uppercase;letter-spacing:.09em;color:var(--text-secondary)}
.next-case h2{font-size:clamp(2rem,4vw,4rem);margin:24px 0;line-height:1.15}
.next-case-image{height:clamp(240px,50svh,620px);overflow:hidden;background:var(--bg-secondary)}
.next-case-image img{width:100%;height:100%;object-fit:cover;transition:transform .8s ease}
@media(hover:hover) and (prefers-reduced-motion:no-preference){.next-case:hover img{transform:scale(1.035)}}
@media(max-width:700px){.case-context{grid-template-columns:1fr;gap:16px;margin-block:36px}.case-study .project-navigation{margin-bottom:24px}.case-study .article{margin-block:36px}.case-study .hero-image img{max-height:none}.case-study .project-cta{margin-block:40px}.next-case{margin-top:40px}}
</style>
