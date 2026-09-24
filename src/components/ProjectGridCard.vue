<script setup>
import { computed } from 'vue'
const props = defineProps({ project:{ type:Object, required:true }, index:{ type:Number, default:0 } })
const path = computed(() => `/project/${props.project.slug || props.project.id}`)
const metadata = computed(() => [...new Set([props.project.category, ...(props.project.tags || [])].filter(Boolean))].slice(0,4).join(' · '))
</script>
<template>
  <router-link :to="path" class="grid-project">
    <div class="grid-image"><img v-if="project.image" :src="project.image" :alt="project.title" loading="lazy"><span v-else>{{ project.title }}</span><i aria-hidden="true">↗</i></div>
    <div class="grid-copy"><span>{{ String(index + 1).padStart(2,'0') }}</span><div><h2>{{ project.title }}</h2><p>{{ metadata }}</p></div></div>
  </router-link>
</template>
<style scoped>
.grid-project{display:block;min-width:0}.grid-image{position:relative;overflow:hidden;aspect-ratio:4/3;background:var(--bg-secondary)}.grid-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.grid-image>span{height:100%;display:grid;place-items:center;padding:30px;font-size:2rem}.grid-image i{position:absolute;right:18px;bottom:18px;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#f8f7f3;color:#20221f;font-style:normal;font-size:1.2rem;transform:translateY(8px);opacity:0;transition:.3s}.grid-copy{display:grid;grid-template-columns:36px 1fr;gap:12px;padding-top:16px}.grid-copy>span{font-size:.65rem;color:var(--text-secondary)}.grid-copy h2{font-size:clamp(1.1rem,1.6vw,1.45rem);line-height:1.25}.grid-copy p{margin-top:7px;font-size:.6rem;letter-spacing:.07em;text-transform:uppercase;line-height:1.6}@media(hover:hover){.grid-project:hover img{transform:scale(1.04)}.grid-project:hover .grid-image i{opacity:1;transform:none}}@media(max-width:700px){.grid-image i{opacity:1;transform:none}.grid-copy{grid-template-columns:28px 1fr}}
</style>
