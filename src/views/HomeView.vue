<script setup>
import { ref } from 'vue'
import { userData } from '../config/userData'
import projectsData from '../projects.json'
import ProjectCard from '../components/ProjectCard.vue'

// Mostrar solo los 3 primeros proyectos en la home
const featuredProjects = ref(projectsData.slice(0, 3))
</script>

<template>
  <div class="home-wrapper">
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
          <router-link to="/contact" class="btn btn-primary">Hablemos de tu proyecto</router-link>
          <router-link to="/projects" class="btn btn-secondary">Ver todos los trabajos</router-link>
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

    <!-- Sección de Proyectos Destacados -->
    <section id="work" class="work-section">
      <div class="section-header">
        <h2>Proyectos Seleccionados</h2>
        <router-link to="/projects" class="view-all-link">Ver todo →</router-link>
      </div>

      <div class="projects-grid">
        <ProjectCard 
          v-for="project in featuredProjects" 
          :key="project.id" 
          :project="project" 
        />
      </div>
    </section>

    <!-- Call to Action Final -->
    <section class="final-cta">
      <h3>¿Listo para empezar algo grande?</h3>
      <router-link to="/contact" class="btn btn-primary">Empezar conversación</router-link>
    </section>
  </div>
</template>

<style scoped>
.view-all-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
}
.view-all-link:hover {
  color: var(--text-main);
  transform: translateX(5px);
}

.final-cta {
  margin-top: 80px;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), transparent);
  border: 1px solid var(--border);
  border-radius: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.final-cta h3 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  letter-spacing: -0.02em;
}

@media (min-width: 1024px) {
  .final-cta {
    margin-top: 120px;
    padding: 100px;
  }
}
</style>
