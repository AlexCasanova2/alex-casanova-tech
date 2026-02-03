<script setup>
// Deployment trigger: Correct remote sync
import { ref, computed } from 'vue'
import projectsData from './projects.json'

// Datos del usuario
const userData = {
  name: 'Àlex Casanova',
  github: 'https://github.com/AlexCasanova2/',
  linkedin: 'https://www.linkedin.com/in/alex-casanova-val/',
  email: 'hola@alexcasanova.tech',
  experienceYears: 10,
  projectsCount: 150
}

// Filtros de proyectos
const projects = ref(projectsData)
const categories = ['Todos', 'SaaS', 'E-commerce', 'Landing']
const activeCategory = ref('Todos')

const filteredProjects = computed(() => {
  if (activeCategory.value === 'Todos') return projects.value
  return projects.value.filter(p => p.category === activeCategory.value)
})

// Formulario de contacto
const form = ref({ name: '', email: '', message: '' })
const isSending = ref(false)

const submitForm = () => {
  isSending.value = true
  setTimeout(() => {
    alert('¡Mensaje enviado con éxito!')
    form.value = { name: '', email: '', message: '' }
    isSending.value = false
  }, 1000)
}
</script>

<template>
  <div class="bg-blobs">
    <div class="blob"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <div class="container" id="top">
    <header>
      <div class="logo">
        <div class="logo-box">AC</div>
        <div class="logo-info">
          <h2>{{ userData.name }}</h2>
          <p>Product Designer & Dev</p>
        </div>
      </div>

      <nav>
        <a href="#work">Proyectos</a>
        <a href="#contact">Contacto</a>
        <a :href="userData.github" target="_blank">GitHub</a>
      </nav>

      <div class="availability">
        <div class="dot-pulse"></div>
        <span>Disponible</span>
      </div>
    </header>

    <main>
      <section class="hero-content">
        <h1>
          <span>Esculpiendo</span><br>
          el futuro digital.
        </h1>
        <p class="lead">
          Con <strong>{{ userData.experienceYears }} años de experiencia</strong> y más de <strong>{{ userData.projectsCount }} proyectos</strong>, diseño y desarrollo interfaces que no solo se ven increíbles, sino que funcionan a la perfección.
        </p>
        
        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary">Hablemos de tu proyecto</a>
          <a href="#work" class="btn btn-secondary">Ver trabajos</a>
        </div>

        <div class="stack-mini">
          <span class="stack-tag">Vue / Nuxt</span>
          <span class="stack-tag">Node.js</span>
          <span class="stack-tag">Tailwind</span>
          <span class="stack-tag">TypeScript</span>
        </div>
      </section>

      <aside class="profile-card">
        <div class="avatar-area">
          <div class="avatar-main">ÀC</div>
          <div>
            <h3>{{ userData.name }}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">@alexcasanova</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <h3>+{{ userData.projectsCount }}</h3>
            <p>Proyectos</p>
          </div>
          <div class="stat-box">
            <h3>+{{ userData.experienceYears }}y</h3>
            <p>Experiencia</p>
          </div>
        </div>

        <div class="project-preview">
          <span class="project-label">Proyecto Actual</span>
          <div class="project-info">
            <h4>Evolucionando Dashboards</h4>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- Sección de Proyectos -->
    <section id="work" class="work-section">
      <div class="section-header">
        <h2>Proyectos Seleccionados</h2>
        <div class="filters">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="activeCategory = cat"
            :class="{ active: activeCategory === cat }"
          >{{ cat }}</button>
        </div>
      </div>

      <div class="projects-grid">
        <div v-for="project in filteredProjects" :key="project.id" class="project-card">
          <div class="project-img">
             <img :src="project.image" :alt="project.title">
          </div>
          <div class="project-content">
            <span class="project-cat">{{ project.category }}</span>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <div class="project-tags">
              <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección de Contacto -->
    <section id="contact" class="contact-section">
      <div class="contact-grid">
        <div class="contact-info">
          <h2>¿Tienes una idea?<br><span>Hagámosla realidad.</span></h2>
          <p>Actualmente aceptando proyectos de alto impacto.</p>
          <div class="contact-links">
            <a :href="'mailto:' + userData.email" class="email-link">{{ userData.email }}</a>
            <div class="social-row">
              <a :href="userData.linkedin" target="_blank">LinkedIn</a>
              <a :href="userData.github" target="_blank">GitHub</a>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitForm" class="contact-form">
          <div class="input-group">
            <label>Nombre</label>
            <input v-model="form.name" type="text" placeholder="Tu nombre" required>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="hola@ejemplo.com" required>
          </div>
          <div class="input-group">
            <label>Mensaje</label>
            <textarea v-model="form.message" rows="4" placeholder="Cuéntame sobre tu proyecto..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="isSending">
            {{ isSending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>
    </section>

    <footer>
      <p>&copy; {{ new Date().getFullYear() }} {{ userData.name }}. v1.0.1</p>
      <div class="social-links">
        <a :href="userData.linkedin" target="_blank" class="social-btn">in</a>
        <a :href="userData.github" target="_blank" class="social-btn">gh</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Contenedor Principal - Mobile First */
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
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    padding: 40px;
    border-radius: 40px;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 60px;
    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header & Logo */
header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  gap: 24px;
  text-align: center;
  padding-top: 60px;
}

@media (min-width: 850px) {
  header {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 80px;
    text-align: left;
    gap: 20px;
    padding-top: 0;
  }
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

@media (min-width: 850px) {
  .logo {
    flex-direction: row;
  }
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

nav {
  display: flex;
  gap: 16px;
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid var(--border);
  width: calc(100% - 64px);
  max-width: 400px;
  justify-content: space-around;
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  box-shadow: 0 15px 35px -5px rgba(0,0,0,0.5);
}

@media (min-width: 850px) {
  nav {
    width: auto;
    max-width: none;
    gap: 24px;
    padding: 10px 28px;
    justify-content: flex-start;
    position: static;
    transform: none;
    left: auto;
    box-shadow: none;
  }
}

nav a { text-decoration: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 500; transition: var(--transition); cursor: pointer; }

@media (min-width: 768px) {
  nav a { font-size: 0.9rem; }
}

nav a:hover { color: var(--text-main); }

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

/* Hero Section */
main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 80px;
  text-align: center;
}

@media (min-width: 1100px) {
  main {
    grid-template-columns: 1fr 380px;
    gap: 80px;
    text-align: left;
    margin-bottom: 120px;
  }
}

.hero-content h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1;
  margin-bottom: 24px;
  letter-spacing: -0.04em;
}

.hero-content h1 span {
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p.lead {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 32px;
}

@media (min-width: 1100px) {
  .hero-content p.lead {
    margin: 0 0 40px;
  }
}

.hero-actions { 
  display: flex; 
  flex-direction: column;
  gap: 16px; 
  margin-bottom: 40px; 
}

@media (min-width: 600px) {
  .hero-actions {
    flex-direction: row;
    justify-content: center;
    gap: 20px;
  }
}

@media (min-width: 1100px) {
  .hero-actions {
    justify-content: flex-start;
    margin-bottom: 48px;
  }
}

.btn {
  padding: 16px 32px; border-radius: 16px; font-size: 1rem; font-weight: 600;
  text-decoration: none; transition: var(--transition); display: flex; align-items: center; gap: 12px; cursor: pointer;
  justify-content: center;
}

@media (min-width: 600px) {
  .btn {
    width: auto;
  }
}

.btn-primary { background: var(--text-main); color: var(--bg); }
.btn-primary:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(255,255,255,0.2); }
.btn-secondary { background: var(--surface); border: 1px solid var(--border); color: var(--text-main); }
.btn-secondary:hover { background: rgba(255,255,255,0.06); transform: translateY(-4px); }

.stack-mini { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }

@media (min-width: 1100px) {
  .stack-mini {
    justify-content: flex-start;
    gap: 12px;
  }
}

.stack-tag { font-size: 0.75rem; color: var(--text-muted); border: 1px solid var(--border); padding: 4px 12px; border-radius: 10px; background: var(--surface); }

@media (min-width: 768px) {
  .stack-tag { font-size: 0.8rem; padding: 6px 16px; }
}

/* Profile Card Area */
.profile-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .profile-card {
    padding: 40px;
    border-radius: 32px;
  }
}

.avatar-area { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }

@media (min-width: 768px) {
  .avatar-area {
    gap: 24px;
    margin-bottom: 40px;
  }
}

.avatar-main {
  width: 70px; height: 70px; border-radius: 20px; background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border);
}

@media (min-width: 768px) {
  .avatar-main {
    width: 90px; height: 90px; border-radius: 28px; font-size: 1.8rem;
  }
}

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }

@media (min-width: 768px) {
  .stats-grid {
    gap: 20px;
    margin-bottom: 40px;
  }
}

.stat-box { background: var(--surface); padding: 16px; border-radius: 20px; border: 1px solid var(--border); }

@media (min-width: 768px) {
  .stat-box {
    padding: 24px;
    border-radius: 24px;
  }
}

.stat-box h3 { font-size: 1.4rem; margin-bottom: 4px; }

@media (min-width: 768px) {
  .stat-box h3 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }
}

.stat-box p { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

@media (min-width: 768px) {
  .stat-box p { font-size: 0.8rem; }
}

.project-preview { background: var(--surface); border-radius: 20px; padding: 20px; border: 1px solid var(--border); }

@media (min-width: 768px) {
  .project-preview {
    border-radius: 24px;
    padding: 24px;
  }
}

.project-label { font-size: 0.75rem; color: var(--accent-2); font-weight: 700; text-transform: uppercase; margin-bottom: 12px; display: block; }
.progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 12px; }
.progress-fill { height: 100%; background: linear-gradient(to right, var(--accent), var(--accent-2)); width: 85%; }

/* Work Section */
.work-section { margin-top: 60px; padding-top: 60px; border-top: 1px solid var(--border); }

@media (min-width: 1024px) {
  .work-section {
    margin-top: 120px;
    padding-top: 80px;
  }
}

.section-header { 
  display: flex; 
  flex-direction: column;
  gap: 24px;
  align-items: center; 
  margin-bottom: 40px; 
}

@media (min-width: 850px) {
  .section-header {
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 50px;
  }
}

.filters { 
  display: flex; 
  gap: 8px; 
  width: 100%;
  overflow-x: auto;
  padding-bottom: 12px;
  justify-content: center;
  scrollbar-width: none;
}
.filters::-webkit-scrollbar { display: none; }

@media (min-width: 768px) {
  .filters {
    gap: 12px;
    padding-bottom: 0;
    overflow: visible;
  }
}

.filters button {
  background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); padding: 8px 16px;
  border-radius: 100px; font-size: 0.85rem; transition: var(--transition); white-space: nowrap;
}

@media (min-width: 768px) {
  .filters button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

.filters button.active { background: var(--text-main); color: var(--bg); border-color: var(--text-main); }

.projects-grid { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 24px; 
}

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
  }
}

.project-card { background: var(--surface); border: 1px solid var(--border); border-radius: 28px; overflow: hidden; transition: var(--transition); }

@media (min-width: 768px) {
  .project-card {
    border-radius: 32px;
  }
}

.project-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
.project-img { height: 200px; background: #111; overflow: hidden; }

@media (min-width: 768px) {
  .project-img { height: 220px; }
}

.project-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: var(--transition); }
.project-card:hover .project-img img { opacity: 1; transform: scale(1.05); }
.project-content { padding: 24px; }

@media (min-width: 768px) {
  .project-content { padding: 32px; }
}

.project-cat { font-size: 0.75rem; color: var(--accent-2); text-transform: uppercase; font-weight: 700; margin-bottom: 8px; display: block; }
.project-tags { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.project-tags span { font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 8px; color: var(--text-muted); }

/* Contact Section */
.contact-section { 
  margin-top: 60px; 
  padding: 60px 0; 
  border-top: 1px solid var(--border); 
}

@media (min-width: 1024px) {
  .contact-section {
    margin-top: 120px;
    padding: 100px 0;
  }
}

.contact-grid { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 48px; 
}

@media (min-width: 850px) {
  .contact-grid {
    grid-template-columns: 1fr 1.2fr;
    gap: 100px;
  }
}

.contact-info { text-align: center; }

@media (min-width: 850px) {
  .contact-info {
    text-align: left;
  }
}

.contact-info h2 { font-size: clamp(2rem, 5vw, 4rem); line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.04em; }
.contact-info h2 span { color: var(--text-muted); }
.contact-links { margin-top: 32px; }

@media (min-width: 850px) {
  .contact-links {
    margin-top: 48px;
  }
}

.email-link { font-size: clamp(1.2rem, 4vw, 2rem); color: var(--text-main); text-decoration: none; font-weight: 600; transition: var(--transition); }
.email-link:hover { color: var(--accent); }
.social-row { display: flex; gap: 20px; margin-top: 24px; justify-content: center; }

@media (min-width: 850px) {
  .social-row {
    justify-content: flex-start;
    gap: 24px;
  }
}

.social-row a { color: var(--text-muted); text-decoration: none; font-size: 0.95rem; transition: var(--transition); }
.social-row a:hover { color: var(--text-main); }

.contact-form { 
  background: var(--surface); 
  padding: 24px; 
  border-radius: 32px; 
  border: 1px solid var(--border); 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

@media (min-width: 768px) {
  .contact-form {
    padding: 48px;
    border-radius: 40px;
    gap: 24px;
  }
}

.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
.input-group input, .input-group textarea {
  background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 18px;
  color: white; font-family: inherit; transition: var(--transition); font-size: 0.95rem;
}

@media (min-width: 768px) {
  .input-group input, .input-group textarea {
    border-radius: 16px;
    padding: 16px 20px;
    font-size: 1rem;
  }
}

.input-group input:focus, .input-group textarea:focus { outline: none; border-color: var(--accent); background: rgba(0,0,0,0.4); }

/* Footer */
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
  .social-links {
    gap: 20px;
  }
}

.social-btn {
  width: 44px; height: 44px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; color: var(--text-main); text-decoration: none; transition: var(--transition);
}

@media (min-width: 768px) {
  .social-btn {
    width: 48px; height: 48px; border-radius: 14px;
  }
}

.social-btn:hover { background: var(--text-main); color: var(--bg); transform: translateY(-4px); }

/* Fondos Animados - Optimización para móvil */
.bg-blobs { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; filter: blur(60px); opacity: 0.4; }

@media (min-width: 768px) {
  .bg-blobs {
    filter: blur(100px);
    opacity: 0.5;
  }
}

.blob { position: absolute; width: 60vw; height: 60vw; border-radius: 50%; background: var(--accent); animation: move 20s infinite alternate; }

@media (min-width: 768px) {
  .blob {
    width: 40vw; height: 40vw;
  }
}

.blob-2 { background: var(--accent-2); width: 50vw; height: 50vw; right: -20%; top: -10%; animation-delay: -5s; }

@media (min-width: 768px) {
  .blob-2 {
    width: 30vw; height: 30vw;
    right: -10%;
  }
}

.blob-3 { background: #ec4899; width: 40vw; height: 40vw; bottom: -10%; left: 10%; animation-delay: -10s; }

@media (min-width: 768px) {
  .blob-3 {
    width: 25vw; height: 25vw;
    left: 20%;
  }
}

@keyframes move { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(10vw, 10vw) rotate(90deg); } }
</style>
