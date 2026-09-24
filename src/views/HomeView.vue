<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { supabase } from '../config/supabase'
import { userData } from '../config/userData'
import ProjectGridCard from '../components/ProjectGridCard.vue'

const SLIDE_DURATION = 6000
const { t, locale } = useI18n()
const projects = ref([])
const loading = ref(true)
const failed = ref(false)
const active = ref(0)
const paused = ref(false)
const touchStart = ref(null)
const moreWork = ref(null)
let timer

const current = computed(() => projects.value[active.value])
const copy = computed(() => ({
  es:{ role:'Diseño web · Desarrollo · UX/UI', title:'Webs con identidad.', intro:'Diseño y desarrollo experiencias digitales que hacen visible lo que hace diferente a cada negocio.', view:'Ver proyecto', selected:'Proyectos seleccionados', previous:'Proyecto anterior', next:'Proyecto siguiente', pause:'Pausar reproducción', play:'Reanudar reproducción', unavailable:'Los proyectos no están disponibles ahora.', retry:'Volver a cargar', aboutLabel:'Sobre mí', aboutTitle:'Diseño y código, sin intermediarios.', aboutText:`Soy Àlex, diseñador y desarrollador frontend con más de ${userData.experienceYears} años de experiencia. Trabajo directamente con cada cliente para convertir ideas complejas en webs claras, rápidas y con carácter.`, services:'Cómo trabajo', contact:'Hablemos', all:'Ver todos los proyectos', closing:'El próximo proyecto podría ser el tuyo.', budget:'Cuéntame tu idea' },
  ca:{ role:'Disseny web · Desenvolupament · UX/UI', title:'Webs amb identitat.', intro:'Dissenyo i desenvolupo experiències digitals que fan visible allò que diferencia cada negoci.', view:'Veure projecte', selected:'Projectes seleccionats', previous:'Projecte anterior', next:'Projecte següent', pause:'Pausar reproducció', play:'Reprendre reproducció', unavailable:'Els projectes no estan disponibles ara.', retry:'Tornar a carregar', aboutLabel:'Sobre mi', aboutTitle:'Disseny i codi, sense intermediaris.', aboutText:`Soc l’Àlex, dissenyador i desenvolupador frontend amb més de ${userData.experienceYears} anys d’experiència. Treballo directament amb cada client per convertir idees complexes en webs clares, ràpides i amb caràcter.`, services:'Com treballo', contact:'Parlem', all:'Veure tots els projectes', closing:'El pròxim projecte podria ser el teu.', budget:'Explica’m la teva idea' },
  en:{ role:'Web design · Development · UX/UI', title:'Websites with identity.', intro:'I design and develop digital experiences that make every business’s difference visible.', view:'View project', selected:'Selected projects', previous:'Previous project', next:'Next project', pause:'Pause autoplay', play:'Resume autoplay', unavailable:'Projects are currently unavailable.', retry:'Try again', aboutLabel:'About me', aboutTitle:'Design and code, no middlemen.', aboutText:`I’m Àlex, a frontend designer and developer with over ${userData.experienceYears} years of experience. I work directly with every client to turn complex ideas into clear, fast websites with character.`, services:'How I work', contact:'Let’s talk', all:'View all projects', closing:'Your project could be next.', budget:'Tell me about your idea' }
}[locale.value] || {}))
const budgetPath = computed(() => locale.value === 'ca' ? '/ca/pressupost-web' : '/es/presupuesto-web')
const servicePath = computed(() => locale.value === 'ca' ? '/ca/disseny-web-empreses' : '/es/diseno-web-empresas')
const projectPath = project => `/project/${project.slug || project.id}`
const metadata = project => [...new Set([project.category, ...(project.tags || [])].filter(Boolean))].slice(0, 4)

function goTo(index) {
  if (!projects.value.length) return
  active.value = (index + projects.value.length) % projects.value.length
  restartTimer()
}
function restartTimer() {
  clearInterval(timer)
  if (!paused.value && projects.value.length > 1) timer = setInterval(() => goTo(active.value + 1), SLIDE_DURATION)
}
function togglePause() { paused.value = !paused.value }
function onVisibility() { paused.value = document.hidden }
function onTouchStart(event) { touchStart.value = event.touches[0]?.clientX ?? null }
function onTouchEnd(event) {
  if (touchStart.value === null) return
  const distance = (event.changedTouches[0]?.clientX ?? touchStart.value) - touchStart.value
  if (Math.abs(distance) > 45) goTo(active.value + (distance < 0 ? 1 : -1))
  touchStart.value = null
}
async function fetchProjects() {
  loading.value = true; failed.value = false
  try {
    const { data, error } = await supabase.from('projects').select('id,slug,title,description,category,tags,image').eq('show_on_homepage', true).or('is_deleted.is.null,is_deleted.eq.false').order('sort_order', { ascending:true }).order('id').limit(8)
    if (error) throw error
    projects.value = data || []
    active.value = 0
  } catch { failed.value = true }
  finally { loading.value = false; restartTimer() }
}

watch(paused, restartTimer)
onMounted(() => { fetchProjects(); document.addEventListener('visibilitychange', onVisibility) })
onUnmounted(() => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisibility) })
</script>

<template>
  <main class="home-cinema">
    <section class="hero-slider" :aria-label="t('home.selectedWork')" @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <template v-if="current">
        <Transition name="cinema" mode="out-in">
          <div :key="current.id" class="slide">
            <img v-if="current.image" :src="current.image" :alt="current.title" fetchpriority="high">
            <div v-else class="slide-fallback">{{ current.title }}</div>
            <div class="slide-wash"></div>
          </div>
        </Transition>
        <div class="hero-copy">
          <span class="hero-role">{{ copy.role }}</span>
          <Transition name="copy-shift" mode="out-in">
            <div :key="current.id" class="project-copy">
              <span class="project-count">{{ String(active + 1).padStart(2,'0') }} / {{ String(projects.length).padStart(2,'0') }}</span>
              <h1>{{ current.title }}</h1>
              <p>{{ metadata(current).join(' · ') }}</p>
              <router-link :to="projectPath(current)" class="view-project">{{ copy.view }} <span>↗</span></router-link>
            </div>
          </Transition>
        </div>
        <div class="hero-manifesto"><strong>{{ copy.title }}</strong><span>{{ copy.intro }}</span></div>
        <div class="slider-ui">
          <div class="slider-tabs">
            <button v-for="(project,index) in projects" :key="project.id" type="button" :class="{active:index === active}" :aria-label="project.title" :aria-current="index === active ? 'true' : undefined" @click="goTo(index)">
              <span class="tab-number">{{ String(index + 1).padStart(2,'0') }}</span><span class="tab-line"><i :key="index === active && !paused ? `run-${active}` : `idle-${index}`" :class="{running:index === active && !paused}"></i></span>
            </button>
          </div>
          <div class="slider-actions"><button type="button" :aria-label="copy.previous" @click="goTo(active - 1)">←</button><button type="button" :aria-label="paused ? copy.play : copy.pause" @click="togglePause">{{ paused ? '▶' : 'Ⅱ' }}</button><button type="button" :aria-label="copy.next" @click="goTo(active + 1)">→</button></div>
        </div>
        <button type="button" class="scroll-cue" aria-label="Scroll" @click="moreWork?.scrollIntoView({ behavior:'smooth' })">SCROLL <i></i></button>
      </template>
      <div v-else class="hero-empty"><p>{{ loading ? t('home.loading') : copy.unavailable }}</p><button v-if="failed" class="btn btn-outline" @click="fetchProjects">{{ copy.retry }}</button></div>
    </section>

    <section ref="moreWork" class="about-strip container">
      <span class="about-label">01 / {{ copy.aboutLabel }}</span>
      <div class="about-main"><h2>{{ copy.aboutTitle }}</h2><div><p>{{ copy.aboutText }}</p><div class="about-actions"><router-link to="/contact">{{ copy.contact }} ↗</router-link><router-link :to="servicePath">{{ copy.services }} ↗</router-link></div></div></div>
      <div class="about-facts"><div><strong>{{ userData.experienceYears }}+</strong><span>{{ locale === 'ca' ? 'anys d’experiència' : locale === 'en' ? 'years of experience' : 'años de experiencia' }}</span></div><div><strong>{{ userData.projectsCount }}+</strong><span>{{ locale === 'ca' ? 'projectes realitzats' : locale === 'en' ? 'projects delivered' : 'proyectos realizados' }}</span></div><div><strong>01</strong><span>{{ locale === 'ca' ? 'contacte directe' : locale === 'en' ? 'direct contact' : 'contacto directo' }}</span></div></div>
    </section>

    <section v-if="projects.length" class="more-work container">
      <header><span>02 / {{ copy.selected }}</span><router-link to="/projects">{{ copy.all }} ↗</router-link></header>
      <div class="project-grid">
        <ProjectGridCard v-for="(project,index) in projects" :key="project.id" :project="project" :index="index" />
      </div>
    </section>
    <section class="home-closing container"><span>ÀLEX CASANOVA / INDEPENDENT DESIGN & DEVELOPMENT</span><h2>{{ copy.closing }}</h2><router-link :to="budgetPath">{{ copy.budget }} <b>↗</b></router-link></section>
  </main>
</template>

<style scoped>
.home-cinema{background:var(--bg-color)}.hero-slider{position:relative;height:100svh;min-height:620px;overflow:hidden;background:#111;color:#fff;isolation:isolate}.slide{position:absolute;inset:0}.slide img,.slide-fallback{width:100%;height:100%;object-fit:cover}.slide img{display:block;transform:scale(1.035);animation:slow-push 7s linear forwards}.slide-fallback{display:grid;place-items:center;font-size:clamp(3rem,10vw,10rem);background:#252925}.slide-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,6,4,.72) 0%,rgba(4,6,4,.2) 56%,rgba(4,6,4,.38) 100%),linear-gradient(0deg,rgba(4,6,4,.7),transparent 44%)}.hero-copy{position:absolute;z-index:2;left:clamp(20px,7vw,110px);top:50%;max-width:min(750px,72vw);transform:translateY(-44%)}.hero-role{display:block;font-size:.67rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:clamp(40px,8vh,90px)}.project-count{font-size:.65rem;letter-spacing:.12em;color:rgba(255,255,255,.7)}.project-copy h1{font-size:clamp(2.8rem,7vw,7.5rem);line-height:.88;letter-spacing:-.065em;color:#fff;margin:14px 0 20px;max-width:1050px;text-wrap:balance}.project-copy p{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.78)}.view-project{display:inline-flex;align-items:center;gap:38px;margin-top:32px;padding-bottom:9px;border-bottom:1px solid rgba(255,255,255,.65);font-size:.82rem;color:#fff}.view-project span{font-size:1.35rem;transition:transform .25s}.view-project:hover span{transform:translate(5px,-5px)}.hero-manifesto{position:absolute;z-index:2;right:clamp(20px,5vw,80px);top:22%;width:min(280px,24vw);border-top:1px solid rgba(255,255,255,.5);padding-top:14px}.hero-manifesto strong,.hero-manifesto span{display:block}.hero-manifesto strong{font-size:.8rem;margin-bottom:10px}.hero-manifesto span{font-size:.7rem;line-height:1.6;color:rgba(255,255,255,.72)}.slider-ui{position:absolute;z-index:3;left:clamp(20px,4vw,64px);right:clamp(20px,4vw,64px);bottom:24px;display:flex;align-items:flex-end;gap:28px}.slider-tabs{display:flex;gap:10px;flex:1}.slider-tabs button{flex:1;padding:0;border:0;background:none;color:#fff;text-align:left;cursor:pointer}.tab-number{font-size:.6rem;color:rgba(255,255,255,.55)}.tab-line{display:block;height:18px;padding-top:9px}.tab-line:before,.tab-line i{content:'';display:block;height:1px}.tab-line:before{background:rgba(255,255,255,.3)}.tab-line i{width:0;margin-top:-1px;background:#fff}.tab-line i.running{animation:progress 6s linear forwards}.slider-actions{display:flex;gap:6px}.slider-actions button{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(255,255,255,.42);border-radius:50%;background:rgba(0,0,0,.14);color:#fff;cursor:pointer;backdrop-filter:blur(8px)}.scroll-cue{position:absolute;z-index:2;right:clamp(20px,4vw,64px);bottom:88px;display:flex;gap:10px;align-items:center;font-size:.55rem;letter-spacing:.14em;color:rgba(255,255,255,.7);writing-mode:vertical-rl}.scroll-cue i{width:1px;height:38px;background:rgba(255,255,255,.55)}.hero-empty{height:100%;display:grid;place-content:center;justify-items:center;gap:20px}.more-work{padding-top:80px;padding-bottom:20px}.more-work>header{display:flex;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid var(--border-color);margin-bottom:10px;font-size:.67rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-secondary)}.home-closing{padding-block:clamp(70px,10vw,140px)}.home-closing>span{font-size:.63rem;letter-spacing:.1em;color:var(--text-secondary)}.home-closing h2{font-size:clamp(2.2rem,5vw,5rem);letter-spacing:-.055em;max-width:850px;margin:24px 0 34px}.home-closing a{display:inline-flex;align-items:center;gap:50px;padding-bottom:8px;border-bottom:1px solid var(--text-primary)}.home-closing b{font-size:1.4rem;font-weight:400}.cinema-enter-active,.cinema-leave-active{transition:opacity .65s ease}.cinema-enter-from,.cinema-leave-to{opacity:0}.copy-shift-enter-active,.copy-shift-leave-active{transition:opacity .4s ease,transform .55s cubic-bezier(.2,.7,.2,1)}.copy-shift-enter-from{opacity:0;transform:translateY(22px)}.copy-shift-leave-to{opacity:0;transform:translateY(-14px)}@keyframes progress{to{width:100%}}@keyframes slow-push{to{transform:scale(1.09)}}@media(max-width:700px){.hero-slider{min-height:620px}.slide-wash{background:linear-gradient(0deg,rgba(4,6,4,.82),rgba(4,6,4,.08) 76%)}.hero-copy{left:20px;right:20px;top:auto;bottom:155px;max-width:none;transform:none}.hero-role{margin-bottom:24px}.project-copy h1{font-size:clamp(2.5rem,13vw,4.2rem);line-height:.92}.project-copy p{line-height:1.6;max-width:75%}.view-project{margin-top:20px}.hero-manifesto,.scroll-cue{display:none}.slider-ui{left:20px;right:20px;bottom:18px;display:block}.slider-tabs{gap:6px}.slider-actions{position:absolute;right:0;bottom:28px}.slider-actions button{width:38px;height:38px}.more-work{padding-top:54px}.more-work>header{font-size:.6rem}.more-work :deep(.work-story){margin-bottom:42px}.more-work :deep(.work-frame){aspect-ratio:4/3}.home-closing{padding-block:64px}}@media(prefers-reduced-motion:reduce){.slide img,.tab-line i.running{animation:none}.cinema-enter-active,.cinema-leave-active,.copy-shift-enter-active,.copy-shift-leave-active{transition:none}}
.scroll-cue{border:0;background:none;padding:0;color:rgba(255,255,255,.7);cursor:pointer;font-family:inherit}.about-strip{padding-top:clamp(70px,10vw,140px);padding-bottom:clamp(64px,9vw,120px)}.about-label{display:block;padding-bottom:18px;border-bottom:1px solid var(--border-color);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-secondary)}.about-main{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(40px,8vw,110px);padding:54px 0 64px}.about-main h2{font-size:clamp(2rem,4vw,4rem);line-height:1.08;letter-spacing:-.055em;max-width:640px}.about-main p{font-size:clamp(1rem,1.35vw,1.2rem);line-height:1.8}.about-actions{display:flex;gap:28px;flex-wrap:wrap;margin-top:30px}.about-actions a{display:inline-flex;align-items:center;min-height:42px;padding-bottom:6px;border-bottom:1px solid var(--border-color);font-size:.82rem}.about-actions a:hover{border-color:var(--text-primary)}.about-facts{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--border-color)}.about-facts>div{display:flex;align-items:baseline;gap:14px;padding:24px 20px 0 0}.about-facts strong{font-size:clamp(1.8rem,3vw,3rem);font-weight:500;letter-spacing:-.05em}.about-facts span{font-size:.68rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.06em}.more-work{padding-top:0;padding-bottom:30px}.more-work>header{display:flex;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid var(--border-color);margin-bottom:28px;font-size:.67rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-secondary)}.project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(32px,6vw,82px) clamp(20px,3vw,42px)}.grid-project:nth-child(even){margin-top:clamp(40px,7vw,100px)}.grid-image{position:relative;overflow:hidden;aspect-ratio:4/3;background:var(--bg-secondary)}.grid-image img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.grid-image>span{height:100%;display:grid;place-items:center;padding:30px;font-size:2rem}.grid-image i{position:absolute;right:18px;bottom:18px;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#f8f7f3;color:#20221f;font-style:normal;font-size:1.2rem;transform:translateY(8px);opacity:0;transition:.3s}.grid-copy{display:grid;grid-template-columns:36px 1fr;gap:12px;padding-top:16px}.grid-copy>span{font-size:.65rem;color:var(--text-secondary)}.grid-copy h3{font-size:clamp(1.1rem,1.6vw,1.45rem);line-height:1.25}.grid-copy p{margin-top:7px;font-size:.6rem;letter-spacing:.07em;text-transform:uppercase;line-height:1.6}@media(hover:hover){.grid-project:hover img{transform:scale(1.04)}.grid-project:hover .grid-image i{opacity:1;transform:none}}@media(max-width:700px){.about-main{grid-template-columns:1fr;gap:24px;padding:36px 0 44px}.about-facts{grid-template-columns:1fr}.about-facts>div{padding:16px 0;border-bottom:1px solid var(--border-color)}.more-work>header{font-size:.58rem}.project-grid{grid-template-columns:1fr;gap:42px}.grid-project:nth-child(even){margin-top:0}.grid-image i{opacity:1;transform:none}.grid-copy{grid-template-columns:28px 1fr}}
</style>
