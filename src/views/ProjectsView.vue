<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../config/supabase'
import ProjectGridCard from '../components/ProjectGridCard.vue'

const { t } = useI18n()

const categories = ref(['All'])
const activeCategory = ref('All')
const projectsData = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or('is_deleted.is.null,is_deleted.eq.false')
    .order('sort_order', { ascending: true })
    .order('id')
    
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
  <main class="archive-page page-wrapper container fade-in">
    <div class="page-header">
      <h1>{{ t('archive.title') }}</h1>
      <p>{{ t('archive.subtitle') }}</p>
    </div>

    <div class="filters">
      <button 
        v-for="cat in categories" 
        :key="cat"
        @click="activeCategory = cat"
        :class="['filter-btn', { active: activeCategory === cat }]"
      >
        {{ cat === 'All' ? t('archive.all') : cat }}
      </button>
    </div>

    <div v-if="loading" style="color: var(--text-secondary); margin-top: 24px;">{{ t('home.loading') }}</div>
    <div v-else class="archive-grid">
      <ProjectGridCard v-for="(project,index) in filteredProjects" :key="project.id" :project="project" :index="index" />
      <p v-if="!filteredProjects.length">{{ t('archive.empty') }}</p>
    </div>
  </main>
</template>

<style scoped>
.archive-page{padding-top:clamp(42px,7vw,90px)}.page-header{display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:end;padding-bottom:34px;margin-bottom:22px;border-bottom:1px solid var(--border-color)}.page-header h1{font-size:clamp(2.3rem,5vw,5rem);letter-spacing:-.055em}.page-header p{font-size:1rem;line-height:1.75;max-width:470px}.filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:48px}.filter-btn{min-height:40px;padding:8px 13px;background:transparent;border:1px solid var(--border-color);border-radius:4px;color:var(--text-secondary);font:inherit;font-size:.72rem;cursor:pointer}.filter-btn.active{background:var(--text-primary);border-color:var(--text-primary);color:var(--bg-color)}.archive-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(38px,7vw,90px) clamp(20px,3vw,42px)}.archive-grid :deep(.grid-project:nth-child(even)){margin-top:clamp(40px,7vw,100px)}@media(max-width:700px){.page-header{grid-template-columns:1fr;gap:18px}.filters{margin-bottom:32px}.archive-grid{grid-template-columns:1fr;gap:44px}.archive-grid :deep(.grid-project:nth-child(even)){margin-top:0}}
</style>
