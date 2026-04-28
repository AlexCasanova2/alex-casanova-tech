<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { userData } from './config/userData'
import { supabase } from './config/supabase'

const route = useRoute()

const isDarkMode = ref(true)
const userSession = ref(null)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  userSession.value = null
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
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
    <nav class="navbar">
      <div class="container nav-content">
        <router-link to="/" class="logo">{{ userData.name }}</router-link>
        <div class="nav-links">
          <router-link to="/">Work</router-link>
          <router-link to="/projects">Archive</router-link>
          <router-link to="/contact">Contact</router-link>
          
          <div class="nav-actions">
            <!-- Admin / Web Toggle -->
            <router-link v-if="userSession && route.path !== '/admin'" to="/admin" class="theme-toggle" title="Go to Dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </router-link>

            <router-link v-if="userSession && route.path === '/admin'" to="/" class="theme-toggle" title="View Website">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </router-link>

            <!-- Logout Shortcut -->
            <button v-if="userSession" @click="handleLogout" class="theme-toggle" title="Sign Out" style="color: #ef4444;">
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
  padding: 24px 0;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid var(--border-color);
  padding-left: 20px;
  margin-left: 8px;
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
</style>
