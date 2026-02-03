<script setup>
import { useRouter } from 'vue-router'
import { userData } from './config/userData'

const router = useRouter()
</script>

<template>
  <div class="bg-blobs">
    <div class="blob"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <nav class="nav-fixed">
    <router-link to="/">Inicio</router-link>
    <router-link to="/projects">Proyectos</router-link>
    <router-link to="/contact">Contacto</router-link>
    <a :href="userData.github" target="_blank" class="icon-link" title="GitHub">
      <svg viewBox="0 0 24 24" class="icon-svg">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
      </svg>
    </a>
  </nav>

  <div class="container" id="top">
    <!-- El Header ahora solo se muestra en la Home o se maneja por vista si el usuario prefiere -->
    <header v-if="$route.path === '/'" class="app-header">
      <router-link to="/" class="logo">
        <div class="logo-box">AC</div>
        <div class="logo-info">
          <h2>{{ userData.name }}</h2>
          <p>Product Designer & Dev</p>
        </div>
      </router-link>

      <div class="availability">
        <div class="dot-pulse"></div>
        <span>Disponible para nuevos proyectos</span>
      </div>
    </header>

    <router-view :key="$route.fullPath" />

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} {{ userData.name }}. v2.2.0</p>
      <div class="social-links">
        <a :href="userData.linkedin" target="_blank" class="social-btn" title="LinkedIn">
          <svg viewBox="0 0 24 24" class="icon-svg-btn">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="currentColor"/>
          </svg>
        </a>
        <a :href="userData.github" target="_blank" class="social-btn" title="GitHub">
          <svg viewBox="0 0 24 24" class="icon-svg-btn">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </footer>
  </div>
</template>

<style>
/* Animaciones de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
/* Contenedor Principal */
.container {
  width: 100%;
  max-width: 1200px;
  position: relative;
  background: var(--glass);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 24px 20px;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5);
  animation: fadeIn 1s ease-out;
  margin: 70px auto 20px; /* Espacio para el nav fijo en mobile */
  overflow: hidden;
}

@media (min-width: 768px) {
  .container {
    padding: 40px;
    border-radius: 40px;
    margin-top: 80px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 60px;
    margin-top: 100px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header & Logo */
.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
  text-align: center;
}

@media (min-width: 850px) {
  .app-header {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 60px;
    text-align: left;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
}

.logo:hover {
  transform: translateX(5px);
}

.logo-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 20px var(--accent-glow);
}

.logo-info h2 { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
.logo-info p { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

/* Navegación Fija */
.nav-fixed {
  display: flex;
  gap: 8px;
  background: rgba(15, 15, 20, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 6px 12px;
  border-radius: 100px;
  border: 1px solid var(--border);
  width: fit-content;
  max-width: calc(100% - 40px); /* Margen lateral en mobile */
  justify-content: center;
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5);
  transition: var(--transition);
}

@media (min-width: 850px) {
  .nav-fixed {
    gap: 24px;
    padding: 10px 32px;
    top: 30px;
    max-width: none;
  }
}

.nav-fixed a { 
  text-decoration: none; 
  color: var(--text-muted); 
  font-size: 0.8rem; 
  font-weight: 600; 
  transition: var(--transition); 
  cursor: pointer; 
  position: relative;
  padding: 8px 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-fixed a.router-link-active {
  color: var(--text-main);
}

@media (min-width: 768px) {
  .nav-fixed a { font-size: 0.85rem; }
}

.nav-fixed a:hover { color: var(--text-main); }

.icon-svg { width: 18px; height: 18px; display: block; }
.icon-svg-btn { width: 20px; height: 20px; display: block; }
.icon-link { display: flex !important; align-items: center; justify-content: center; }

.nav-fixed a::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  width: 150%;
  height: 40px;
  background: radial-gradient(circle at bottom, var(--accent), transparent 70%);
  transform: translateX(-50%) scale(0.5);
  transition: var(--transition);
  opacity: 0;
  filter: blur(12px);
  z-index: -1;
  pointer-events: none;
}

.nav-fixed a:hover::after,
.nav-fixed a.router-link-active::after {
  transform: translateX(-50%) scale(1);
  opacity: 0.6;
}

.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  white-space: nowrap;
}

.dot-pulse {
  width: 6px; height: 6px; background: #10b981; border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

footer {
  margin-top: 60px; padding-top: 32px; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 24px; align-items: center; color: var(--text-muted); font-size: 0.9rem; text-align: center;
}

@media (min-width: 768px) {
  footer {
    margin-top: 80px; padding-top: 40px;
    flex-direction: row; justify-content: space-between;
    font-size: 1rem;
    text-align: left;
  }
}

.social-links { display: flex; gap: 16px; }

@media (min-width: 768px) {
  .social-links { gap: 20px; }
}

.social-btn {
  width: 44px; height: 44px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; color: var(--text-main); text-decoration: none; transition: var(--transition);
}

@media (min-width: 768px) {
  .social-btn { width: 48px; height: 48px; border-radius: 14px; }
}

.social-btn:hover { background: var(--text-main); color: var(--bg); transform: translateY(-4px); }

.bg-blobs { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; filter: blur(60px); opacity: 0.4; }

@media (min-width: 768px) {
  .bg-blobs { filter: blur(100px); opacity: 0.5; }
}

.blob { position: absolute; width: 60vw; height: 60vw; border-radius: 50%; background: var(--accent); animation: move 20s infinite alternate; }

@media (min-width: 768px) {
  .blob { width: 40vw; height: 40vw; }
}

.blob-2 { background: var(--accent-2); width: 50vw; height: 50vw; right: -20%; top: -10%; animation-delay: -5s; }

@media (min-width: 768px) {
  .blob-2 { width: 30vw; height: 30vw; right: -10%; }
}

.blob-3 { background: #ec4899; width: 40vw; height: 40vw; bottom: -10%; left: 10%; animation-delay: -10s; }

@media (min-width: 768px) {
  .blob-3 { width: 25vw; height: 25vw; left: 20%; }
}

@keyframes move { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(10vw, 10vw) rotate(90deg); } }
</style>
