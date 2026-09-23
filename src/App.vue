<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { userData } from './config/userData'
import { supabase } from './config/supabase'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const isDarkMode = ref(true)
const userSession = ref(null)
const menuOpen = ref(false)
const menuButton = ref(null)
const closeMenu = () => {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const switchLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  document.documentElement.lang = lang
  if (route.meta.locale && lang === 'en') {
    router.push('/')
    return
  }
  if (route.meta.locale && ['es', 'ca'].includes(lang)) {
    const target = lang === route.meta.locale ? route.path : route.meta.alternate
    if (target) router.push(target)
  }
}

const commercialLocale = computed(() => ['ca', 'es'].includes(locale.value) ? locale.value : 'es')
const servicePath = computed(() => commercialLocale.value === 'ca' ? '/ca/disseny-web-empreses' : '/es/diseno-web-empresas')
const budgetPath = computed(() => commercialLocale.value === 'ca' ? '/ca/pressupost-web' : '/es/presupuesto-web')
const commercialLabels = computed(() => commercialLocale.value === 'ca' ? { service:'Disseny web', budget:'Pressupost' } : { service:'Diseño web', budget:'Presupuesto' })

const handleLogout = async () => {
  await supabase.auth.signOut()
  userSession.value = null
}

const updateGlobalSEO = () => {
  let title = 'Àlex Casanova · Product Designer & Developer'
  let desc = 'Portfolio of Àlex Casanova, specializing in creating high-impact, premium digital experiences.'
  
  if (route.name === 'home') {
    title = `Àlex Casanova · Product Designer & Developer`
    desc = t('home.desc', { name: userData.name, years: userData.experienceYears }).replace(/<[^>]*>?/gm, '')
  } else if (route.name === 'projects') {
    title = `${t('nav.archive')} | Àlex Casanova`
  } else if (route.name === 'contact') {
    title = `${t('nav.contact')} | Àlex Casanova`
  } else if (route.name === 'admin') {
    title = `Admin | Àlex Casanova`
  } else if (route.meta.title) {
    title = `${route.meta.title} | Àlex Casanova`
    desc = route.meta.description || desc
  }
  
  // Project detail handles its own SEO dynamically
  if (route.name !== 'project-detail') {
    document.title = title
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = desc
    const canonicalUrl = `https://alexcasanova.tech${route.path}`
    const setMeta = (selector, attribute, content) => {
      const element = document.querySelector(selector)
      if (element) element.setAttribute(attribute, content)
    }
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', canonicalUrl)
    setMeta('meta[property="twitter:title"]', 'content', title)
    setMeta('meta[property="twitter:description"]', 'content', desc)
    setMeta('meta[property="twitter:url"]', 'content', canonicalUrl)
    setMeta('link[rel="canonical"]', 'href', canonicalUrl)
  }
}

watch([() => route.path, locale], () => {
  menuOpen.value = false
  if (route.meta.locale && locale.value !== route.meta.locale) {
    locale.value = route.meta.locale
    localStorage.setItem('locale', route.meta.locale)
  }
  document.documentElement.lang = route.meta.locale || locale.value
  updateGlobalSEO()
})

onMounted(() => {
  document.documentElement.lang = route.meta.locale || locale.value
  updateGlobalSEO()
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    // Set initial html lang attribute
  document.documentElement.lang = locale.value

  // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }

  // Auth State Listener
  supabase.auth.getSession().then(({ data }) => {
    userSession.value = data.session
  })
  supabase.auth.onAuthStateChange((_, session) => {
    userSession.value = session
  })
})
</script>

<template>
  <div class="app-container">
    <nav class="navbar" @keydown.esc="closeMenu">
      <div class="container nav-content">
        <router-link to="/" class="logo">{{ userData.name }}</router-link>
        <button ref="menuButton" class="menu-toggle" type="button" aria-controls="main-navigation" :aria-expanded="menuOpen" :aria-label="locale === 'en' ? 'Navigation menu' : locale === 'ca' ? 'Menú de navegació' : 'Menú de navegación'" @click="menuOpen = !menuOpen">
          <span>{{ locale === 'en' ? 'Menu' : 'Menú' }}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path v-if="menuOpen" d="m6 6 12 12M6 18 18 6"/><path v-else d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
        <div id="main-navigation" :class="['nav-links', { 'is-open': menuOpen }]">
          <router-link to="/">{{ t('nav.work') }}</router-link>
          <router-link to="/projects">{{ t('nav.archive') }}</router-link>
          <router-link :to="servicePath">{{ commercialLabels.service }}</router-link>
          <router-link :to="budgetPath" class="nav-budget">{{ commercialLabels.budget }}</router-link>
          <router-link to="/contact">{{ t('nav.contact') }}</router-link>
          
          <div class="nav-actions">
            <!-- Language Switcher -->
            <div class="lang-switcher">
              <button :class="{ active: locale === 'es' }" @click="switchLanguage('es')">ES</button>
              <button :class="{ active: locale === 'ca' }" @click="switchLanguage('ca')">CA</button>
              <button :class="{ active: locale === 'en' }" @click="switchLanguage('en')">EN</button>
            </div>

            <!-- Admin / Web Toggle -->
            <router-link v-if="userSession && route.path !== '/admin'" to="/admin" class="theme-toggle" :title="t('nav.admin')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </router-link>

            <router-link v-if="userSession && route.path === '/admin'" to="/" class="theme-toggle" :title="t('nav.viewWeb')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </router-link>

            <!-- Logout Shortcut -->
            <button v-if="userSession" @click="handleLogout" class="theme-toggle" :title="t('nav.logout')" style="color: #ef4444;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>

            <!-- Theme Toggle -->
            <button @click="toggleTheme" class="theme-toggle" :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
              <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <footer class="footer">
      <div class="container footer-content">
        <p>© {{ new Date().getFullYear() }} {{ userData.name }}. All rights reserved.</p>
        <div class="social-links">
          <router-link :to="commercialLocale === 'ca' ? '/ca/privacitat' : '/es/privacidad'">{{ commercialLocale === 'ca' ? 'Privacitat' : 'Privacidad' }}</router-link>
          <a :href="userData.linkedin" target="_blank">LinkedIn</a>
          <a :href="userData.github" target="_blank">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 16px 0;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

@media (min-width: 768px) {
  .navbar {
    padding: 24px 0;
  }
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

@media (min-width: 768px) {
  .nav-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.logo {
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 768px) {
  .nav-links {
    gap: 32px;
  }
}

.nav-links a {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-primary);
}
.nav-links .nav-budget{border:1px solid var(--border-color);border-radius:100px;padding-left:14px;padding-right:14px}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 768px) {
  .nav-actions {
    border-left: 1px solid var(--border-color);
    padding-left: 20px;
    margin-left: 8px;
  }
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-left: 8px;
  transition: color var(--transition-fast);
}

.theme-toggle:hover {
  color: var(--text-primary);
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-color);
  padding: 4px;
  border-radius: 100px;
  border: 1px solid var(--border-color);
  margin-right: 8px;
}

.lang-switcher button {
  background: transparent;
  border: none;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 100px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lang-switcher button:hover {
  color: var(--text-primary);
}

.lang-switcher button.active {
  background: var(--text-primary);
  color: var(--bg-color);
}

.footer {
  margin-top: auto;
  padding: 48px 0;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
  }
}

.footer p {
  font-size: 0.875rem;
  margin: 0;
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  gap: 24px;
}

.social-links a {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.social-links a:hover {
  color: var(--text-primary);
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
/* A flow-based sticky header avoids guessed offsets when language or auth changes. */
.app-container{min-height:100svh;min-width:0}
.navbar{position:sticky;top:0;left:auto;padding:12px 0;border-color:var(--border-color)}
.nav-content{flex-direction:row;flex-wrap:wrap;justify-content:space-between;gap:12px}
.logo{min-height:44px;display:inline-flex;align-items:center}
.nav-links{gap:20px}
.nav-links>a{display:inline-flex;align-items:center;min-height:44px}
.nav-actions{gap:4px;flex-wrap:wrap}
.theme-toggle{width:44px;height:44px;flex-shrink:0;padding:10px;margin:0}
.lang-switcher{gap:0;margin-right:4px;padding:2px}
.lang-switcher button{min-width:40px;min-height:40px;font-size:.75rem}
.menu-toggle{display:none}
.footer-content{text-align:center;gap:16px}
.social-links a{display:inline-flex;align-items:center;min-height:44px}
@media(max-width:899px){
  .navbar{padding:8px 0}
  .menu-toggle{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:44px;padding:8px 12px;border:1px solid var(--border-color);border-radius:100px;background:var(--bg-secondary);color:var(--text-primary);font:inherit;cursor:pointer}
  .nav-links{display:none;width:100%;flex-basis:100%;padding:8px 0;gap:4px;max-height:calc(100dvh - 84px);overflow-y:auto;overscroll-behavior:contain}
  .nav-links.is-open{display:flex;flex-direction:column;align-items:stretch}
  .nav-links>a{padding:8px 12px;border-radius:8px;font-size:1rem}
  .nav-links>a.router-link-exact-active{background:var(--bg-secondary)}
  .nav-actions{justify-content:space-between;gap:4px;padding:12px 0 0;margin:8px 0 0;border-left:0;border-top:1px solid var(--border-color)}
  .footer{padding:28px 0}
}
@media(min-width:900px){.nav-content{flex-wrap:nowrap}.nav-actions{flex-wrap:nowrap}.footer-content{text-align:left}}
</style>
