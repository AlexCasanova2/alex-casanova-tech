<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ project:{ type:Object, required:true }, index:{ type:Number, default:0 }, immersive:{ type:Boolean, default:false } })
const { locale } = useI18n()
const frame = ref(null)
const imageFailed = ref(false)
const path = computed(() => `/project/${props.project.slug || props.project.id}`)
const labels = computed(() => locale.value === 'ca' ? { project:'Projecte', view:'Explora el projecte' } : locale.value === 'en' ? { project:'Project', view:'Explore project' } : { project:'Proyecto', view:'Explora el proyecto' })
const metadata = computed(() => [...new Set([props.project.category, ...(props.project.tags || [])].filter(Boolean))].slice(0, 5))
let observer, preference, visible = false, raf = 0
const updatePosition = () => {
  raf = 0
  if (!frame.value || preference?.matches) return
  const box = frame.value.getBoundingClientRect()
  const progress = Math.max(0, Math.min(1, (window.innerHeight - box.top) / (window.innerHeight + box.height)))
  frame.value.style.setProperty('--image-position', `${progress * 100}%`)
}
const onScroll = () => { if (visible && !raf) raf = requestAnimationFrame(updatePosition) }
const onPointerMove = event => {
  if (!props.immersive || preference?.matches || !frame.value) return
  const box = frame.value.getBoundingClientRect()
  frame.value.style.setProperty('--pointer-x', `${((event.clientX - box.left) / box.width - .5) * 12}px`)
  frame.value.style.setProperty('--pointer-y', `${((event.clientY - box.top) / box.height - .5) * 12}px`)
}
const resetPointer = () => {
  frame.value?.style.setProperty('--pointer-x', '0px')
  frame.value?.style.setProperty('--pointer-y', '0px')
}
const onPreference = () => {
  if (preference.matches) frame.value?.style.removeProperty('--image-position')
  else onScroll()
}
onMounted(() => {
  preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  preference.addEventListener('change', onPreference)
  observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) onScroll() }, { rootMargin:'100px' })
  if (frame.value) observer.observe(frame.value)
  window.addEventListener('scroll', onScroll, { passive:true })
  window.addEventListener('resize', onScroll, { passive:true })
})
onUnmounted(() => {
  observer?.disconnect()
  preference?.removeEventListener('change', onPreference)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <article :class="['work-story',{ immersive }]">
    <header class="work-heading">
      <span class="work-index">{{ labels.project }} {{ String(index + 1).padStart(2, '0') }}</span>
      <h2><router-link :to="path">{{ project.title }}</router-link></h2>
      <span class="work-arrow" aria-hidden="true">↗</span>
    </header>
    <router-link :to="path" class="work-link" :aria-label="`${labels.view}: ${project.title}`">
      <div ref="frame" class="work-frame" @pointermove="onPointerMove" @pointerleave="resetPointer">
        <img v-if="project.image && !imageFailed" :src="project.image" :alt="project.title" :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async" @error="imageFailed = true">
        <span v-else class="image-fallback">{{ project.title }}</span>
        <span v-if="immersive" class="image-shade" aria-hidden="true"></span>
        <span class="work-action">{{ labels.view }} <span aria-hidden="true">↗</span></span>
      </div>
    </router-link>
    <footer class="work-meta"><p>{{ metadata.join(' · ') }}</p><span>{{ String(index + 1).padStart(2, '0') }} / AC</span></footer>
  </article>
</template>

<style scoped>
.work-story{margin-bottom:clamp(36px,7vw,100px)}.work-heading{display:flex;gap:24px;align-items:baseline;padding:20px 0}.work-index,.work-meta{font:500 .65rem/1.7 'Manrope',sans-serif;letter-spacing:.09em;text-transform:uppercase}.work-index{min-width:105px;color:var(--text-secondary)}.work-heading h2{font-size:clamp(1.25rem,2.1vw,2rem);letter-spacing:-.04em;line-height:1.25}.work-arrow{margin-left:auto;font-size:1.5rem}.work-link{display:block}.work-frame{position:relative;overflow:hidden;height:clamp(340px,73svh,920px);background:var(--bg-secondary);--image-position:50%}.work-frame img{display:block;width:100%;height:100%;object-fit:cover;object-position:center var(--image-position);transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}.work-action{position:absolute;right:28px;bottom:28px;display:flex;align-items:center;gap:30px;background:#f8f7f3;color:#20221f;border-radius:2px;padding:16px 20px;font-size:.75rem;transform:translateY(12px);opacity:0;transition:opacity .3s,transform .3s}.work-action>span{font-size:1.2rem}.work-link:focus-visible .work-action{transform:none;opacity:1}.work-meta{display:flex;justify-content:space-between;gap:28px;padding:16px 0;border-bottom:1px solid var(--border-color);color:var(--text-secondary)}.work-meta p{font:inherit;max-width:85%}.work-meta>span{white-space:nowrap}.image-fallback{height:100%;display:grid;place-items:center;padding:30px;font-size:clamp(2rem,5vw,5rem);text-align:center}@media(hover:hover) and (prefers-reduced-motion:no-preference){.work-link:hover img{transform:scale(1.035)}.work-link:hover .work-action{opacity:1;transform:none}}@media(max-width:700px){.work-heading{gap:12px;flex-wrap:wrap;padding:16px 0}.work-index{min-width:0;width:100%}.work-heading h2{max-width:85%}.work-frame{height:auto;aspect-ratio:4/3}.work-action{opacity:1;transform:none;right:12px;bottom:12px;padding:10px 12px;gap:12px;font-size:.65rem}.work-meta{font-size:.58rem;gap:16px}.work-meta p{max-width:80%}}@media(prefers-reduced-motion:reduce){.work-frame img{transform:none!important;object-position:center!important}.work-action{transition:none}}
.work-story.immersive{position:relative;height:125svh;margin:0;color:#fff}.immersive .work-link{position:sticky;top:69px;display:block;height:calc(100svh - 69px);overflow:hidden;background:#111}.immersive .work-frame{height:100%;--pointer-x:0px;--pointer-y:0px}.immersive .work-frame img{object-position:center var(--image-position);transform:scale(1.075) translate(var(--pointer-x),var(--pointer-y));transition:transform .7s cubic-bezier(.2,.7,.2,1)}.immersive .image-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.2) 0%,transparent 34%,rgba(0,0,0,.72) 100%);pointer-events:none}.immersive .work-heading{position:sticky;top:69px;z-index:3;height:0;padding:0 4vw;transform:translateY(38px);align-items:flex-start;color:#fff;pointer-events:none}.immersive .work-heading a{color:#fff;pointer-events:auto}.immersive .work-index{min-width:110px;color:rgba(255,255,255,.7)}.immersive .work-heading h2{font-size:clamp(1.4rem,2.6vw,2.8rem);line-height:1.05;text-shadow:0 2px 24px rgba(0,0,0,.3)}.immersive .work-arrow{color:#fff}.immersive .work-meta{position:sticky;z-index:3;bottom:30px;width:calc(100% - 8vw);margin:-72px 4vw 0;padding:18px 0 0;border-top:1px solid rgba(255,255,255,.45);border-bottom:0;color:rgba(255,255,255,.82);pointer-events:none}.immersive .work-meta p{color:inherit}.immersive .work-action{z-index:4;right:4vw;bottom:70px;border-radius:100%;width:104px;height:104px;justify-content:center;flex-direction:column;gap:2px;text-align:center;padding:12px}.immersive .work-action>span{font-size:1rem}.immersive+.immersive{margin-top:-1px}@media(hover:hover) and (prefers-reduced-motion:no-preference){.immersive .work-link:hover img{transform:scale(1.105) translate(var(--pointer-x),var(--pointer-y))}}@media(max-width:700px){.work-story.immersive{height:105svh}.immersive .work-link{top:61px;height:calc(100svh - 61px)}.immersive .work-heading{top:61px;transform:translateY(24px);padding-inline:20px}.immersive .work-index{width:100%;color:rgba(255,255,255,.78)}.immersive .work-heading h2{font-size:1.65rem;max-width:88%}.immersive .work-frame{aspect-ratio:auto;height:100%}.immersive .work-frame img{transform:scale(1.04);object-position:center center}.immersive .work-meta{bottom:20px;width:calc(100% - 40px);margin:-92px 20px 0;padding-top:12px}.immersive .work-meta p{max-width:75%}.immersive .work-action{right:18px;bottom:78px;width:72px;height:72px;font-size:0}.immersive .work-action>span{font-size:1.4rem}}@media(prefers-reduced-motion:reduce){.work-story.immersive{height:auto;min-height:calc(100svh - 69px)}.immersive .work-link,.immersive .work-heading,.immersive .work-meta{position:relative;top:auto;bottom:auto}.immersive .work-link{height:calc(100svh - 69px)}.immersive .work-heading{position:absolute;top:0;width:100%}.immersive .work-meta{position:absolute;bottom:20px}.immersive .work-frame img{object-position:center}}
@media (prefers-reduced-motion: reduce) {
  .work-action { opacity: 1; transform: none; }
}
</style>
