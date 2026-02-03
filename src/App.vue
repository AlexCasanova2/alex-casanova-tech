<template>
  <div class="bg-blobs">
    <div class="blob"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>

  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-box">AC</div>
        <div class="logo-info">
          <h2>Àlex Casanova</h2>
          <p>Product Designer & Dev</p>
        </div>
      </div>

      <nav>
        <a href="#work">Proyectos</a>
        <a href="#about">Sobre mí</a>
        <a href="#contact">Contacto</a>
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
          Diseño y desarrollo interfaces que no solo se ven increíbles, sino que funcionan a la perfección.
          Especializado en convertir ideas complejas en productos sencillos y memorables.
        </p>

        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary">Hablemos de tu proyecto</a>
          <a href="#work" class="btn btn-secondary">Ver trabajos</a>
        </div>

        <div class="stack-mini">
          <span class="stack-tag">React / Next.js</span>
          <span class="stack-tag">TypeScript</span>
          <span class="stack-tag">Tailwind CSS</span>
          <span class="stack-tag">Framer Motion</span>
          <span class="stack-tag">UI/UX Design</span>
        </div>
      </section>

      <aside class="profile-card">
        <div class="avatar-area">
          <div class="avatar-main">ÀC</div>
          <div>
            <h3 style="font-size: 1.1rem;">Àlex Casanova</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">@alextandem</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <h3>+20</h3>
            <p>Proyectos</p>
          </div>
          <div class="stat-box">
            <h3>+4y</h3>
            <p>Experiencia</p>
          </div>
        </div>

        <div class="project-preview">
          <span class="project-label">Trabajo Actual</span>
          <div class="project-info">
            <h4>Evolución SaaS Dashboard</h4>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 12px;">
            Optimizando flujos de usuario y rendimiento core.
          </p>
        </div>
      </aside>
    </main>

    <footer>
      <p>&copy; 2026 Àlex Casanova. Creado con carácter.</p>
      <div class="social-links">
        <a href="#" class="social-btn" title="LinkedIn">in</a>
        <a href="#" class="social-btn" title="GitHub">gh</a>
        <a href="mailto:alex@ejemplo.com" class="social-btn" title="Email">✉</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Fondo dinámico animado */
.bg-blobs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  filter: blur(100px);
  opacity: 0.5;
}

.blob {
  position: absolute;
  width: 40vw;
  height: 40vw;
  border-radius: 50%;
  background: var(--accent);
  animation: move 20s infinite alternate;
}

.blob-2 {
  background: var(--accent-2);
  width: 30vw;
  height: 30vw;
  right: -10%;
  top: -10%;
  animation-delay: -5s;
}

.blob-3 {
  background: #ec4899;
  width: 25vw;
  height: 25vw;
  bottom: -10%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes move {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(10vw, 10vw) rotate(90deg); }
}

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
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

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

.logo-info h2 {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.logo-info p {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

nav {
  display: flex;
  gap: 24px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 24px;
  border-radius: 100px;
  border: 1px solid var(--border);
}

nav a {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  transition: var(--transition);
  cursor: pointer;
}

nav a:hover {
  color: var(--text-main);
}

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
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

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

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.btn {
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.btn-primary {
  background: var(--text-main);
  color: var(--bg);
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-main);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-4px);
}

.stack-mini {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stack-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--surface);
}

/* Tarjeta Perfil Derecha */
.profile-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.profile-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, var(--accent-glow) 0%, transparent 60%);
  opacity: 0.1;
  pointer-events: none;
}

.avatar-area {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.avatar-main {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 1px solid var(--border);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-box {
  background: var(--surface);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid var(--border);
}

.stat-box h3 {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.stat-box p {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-preview {
  background: var(--surface);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid var(--border);
  position: relative;
}

.project-label {
  font-size: 0.75rem;
  color: var(--accent-2);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

.project-info h4 {
  font-size: 1rem;
  margin-bottom: 12px;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--accent), var(--accent-2));
  width: 85%;
}

footer {
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  text-decoration: none;
  transition: var(--transition);
  cursor: pointer;
}

.social-btn:hover {
  background: var(--text-main);
  color: var(--bg);
  transform: translateY(-4px);
}

@media (max-width: 1024px) {
  main {
    grid-template-columns: 1fr;
  }

  .profile-card {
    display: none;
  }

  .hero-content h1 {
    font-size: 3.5rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 24px;
    border-radius: 24px;
  }

  header {
    flex-direction: column;
    gap: 24px;
  }

  nav {
    width: 100%;
    justify-content: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-actions {
    flex-direction: column;
  }
}
</style>
