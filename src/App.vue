<script setup>
import { ref, computed } from 'vue'
import projectsData from './projects.json'

// Datos del usuario
const userData = {
  name: 'Àlex Casanova',
  github: 'https://github.com/AlexCasanova2/',
  linkedin: 'https://www.linkedin.com/in/alex-casanova-val/',
  email: 'alex.casanova@tandemprojects.es',
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
            <p style="color: var(--text-muted); font-size: 0.85rem;">@alextandem</p>
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
      <p>&copy; {{ new Date().getFullYear() }} {{ userData.name }}. Creado con carácter.</p>
      <div class="social-links">
        <a :href="userData.linkedin" target="_blank" class="social-btn">in</a>
        <a :href="userData.github" target="_blank" class="social-btn">gh</a>
      </div>
    </footer>
  </div>
</template>

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
  border-radius: 40px;
  padding: 40px;
  box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header & Logo */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 20px var(--accent-glow);
}

.logo-info h2 { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; }
.logo-info p { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

nav {
  display: flex;
  gap: 24px;
  background: rgba(255,255,255,0.03);
  padding: 8px 24px;
  border-radius: 100px;
  border: 1px solid var(--border);
}

nav a { text-decoration: none; color: var(--text-muted); font-size: 0.85rem; font-weight: 500; transition: var(--transition); cursor: pointer; }
nav a:hover { color: var(--text-main); }

.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 14px;
  border-radius: 100px;
  border: 1px solid rgba(16, 185, 129, 0.2);
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
  grid-template-columns: 1fr 400px;
  gap: 60px;
  align-items: center;
}

.hero-content h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 4.5rem;
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
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 540px;
  margin-bottom: 32px;
}

.hero-actions { display: flex; gap: 16px; margin-bottom: 40px; }

.btn {
  padding: 14px 28px; border-radius: 14px; font-size: 0.95rem; font-weight: 600;
  text-decoration: none; transition: var(--transition); display: flex; align-items: center; gap: 10px; cursor: pointer;
}
.btn-primary { background: var(--text-main); color: var(--bg); }
.btn-primary:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(255,255,255,0.2); }
.btn-secondary { background: var(--surface); border: 1px solid var(--border); color: var(--text-main); }
.btn-secondary:hover { background: rgba(255,255,255,0.06); transform: translateY(-4px); }

.stack-mini { display: flex; gap: 12px; flex-wrap: wrap; }
.stack-tag { font-size: 0.75rem; color: var(--text-muted); border: 1px solid var(--border); padding: 4px 12px; border-radius: 8px; background: var(--surface); }

/* Profile Card Area */
.profile-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.avatar-area { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
.avatar-main {
  width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 1px solid var(--border);
}

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
.stat-box { background: var(--surface); padding: 20px; border-radius: 20px; border: 1px solid var(--border); }
.stat-box h3 { font-size: 1.5rem; margin-bottom: 4px; }
.stat-box p { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.project-preview { background: var(--surface); border-radius: 20px; padding: 20px; border: 1px solid var(--border); }
.project-label { font-size: 0.75rem; color: var(--accent-2); font-weight: 700; text-transform: uppercase; margin-bottom: 8px; display: block; }

.progress-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-top: 10px; }
.progress-fill { height: 100%; background: linear-gradient(to right, var(--accent), var(--accent-2)); width: 85%; }

/* Work Section (Filtros y Grid) */
.work-section { margin-top: 100px; padding-top: 60px; border-top: 1px solid var(--border); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.filters { display: flex; gap: 10px; }
.filters button {
  background: var(--surface); border: 1px solid var(--border); color: var(--text-muted); padding: 8px 16px;
  border-radius: 100px; font-size: 0.85rem; transition: var(--transition);
}
.filters button.active { background: var(--text-main); color: var(--bg); border-color: var(--text-main); }

.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.project-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; transition: var(--transition); }
.project-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); }
.project-img { height: 200px; background: #111; overflow: hidden; }
.project-img img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: var(--transition); }
.project-card:hover .project-img img { opacity: 1; transform: scale(1.05); }
.project-content { padding: 24px; }
.project-cat { font-size: 0.7rem; color: var(--accent-2); text-transform: uppercase; font-weight: 700; margin-bottom: 8px; display: block; }
.project-tags { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.project-tags span { font-size: 0.65rem; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; color: var(--text-muted); }

/* Contact Section */
.contact-section { margin-top: 120px; padding: 80px 0; border-top: 1px solid var(--border); }
.contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; }
.contact-info h2 { font-size: 3.5rem; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.04em; }
.contact-info h2 span { color: var(--text-muted); }
.contact-links { margin-top: 40px; }
.email-link { font-size: 1.5rem; color: var(--text-main); text-decoration: none; font-weight: 600; transition: var(--transition); }
.email-link:hover { color: var(--accent); }
.social-row { display: flex; gap: 20px; margin-top: 16px; }
.social-row a { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: var(--transition); }
.social-row a:hover { color: var(--text-main); }

.contact-form { background: var(--surface); padding: 40px; border-radius: 32px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 20px; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
.input-group input, .input-group textarea {
  background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px;
  color: white; font-family: inherit; transition: var(--transition);
}
.input-group input:focus, .input-group textarea:focus { outline: none; border-color: var(--accent); background: rgba(0,0,0,0.4); }

/* Footer */
footer {
  margin-top: 60px; padding-top: 32px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.85rem;
}
.social-links { display: flex; gap: 16px; }
.social-btn {
  width: 40px; height: 40px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; color: var(--text-main); text-decoration: none; transition: var(--transition);
}
.social-btn:hover { background: var(--text-main); color: var(--bg); transform: translateY(-4px); }

/* Fondos Animados (Globales) */
.bg-blobs { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; overflow: hidden; filter: blur(100px); opacity: 0.5; }
.blob { position: absolute; width: 40vw; height: 40vw; border-radius: 50%; background: var(--accent); animation: move 20s infinite alternate; }
.blob-2 { background: var(--accent-2); width: 30vw; height: 30vw; right: -10%; top: -10%; animation-delay: -5s; }
.blob-3 { background: #ec4899; width: 25vw; height: 25vw; bottom: -10%; left: 20%; animation-delay: -10s; }
@keyframes move { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(10vw, 10vw) rotate(90deg); } }

/* Media Queries */
@media (max-width: 1024px) {
  main { grid-template-columns: 1fr; gap: 40px; }
  .profile-card { margin-top: 20px; }
  .hero-content h1 { font-size: 3.5rem; }
  .contact-grid { grid-template-columns: 1fr; gap: 40px; }
}
@media (max-width: 640px) {
  .container { padding: 20px; border-radius: 20px; }
  header { flex-direction: column; gap: 20px; align-items: flex-start; }
  nav { width: 100%; justify-content: center; }
  .hero-content h1 { font-size: 2.5rem; }
  .contact-info h2 { font-size: 2.5rem; }
}
</style>
