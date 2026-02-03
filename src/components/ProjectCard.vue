<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="project-card">
    <div class="project-img">
      <img :src="project.image" :alt="project.title" loading="lazy">
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
</template>

<style scoped>
.project-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 28px;
  overflow: hidden;
  transition: var(--transition);
  height: 100%;
}

@media (min-width: 768px) {
  .project-card {
    border-radius: 32px;
  }
}

.project-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
}

.project-img {
  height: 200px;
  background: #111;
  overflow: hidden;
}

@media (min-width: 768px) {
  .project-img {
    height: 220px;
  }
}

.project-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
  transition: var(--transition);
}

.project-card:hover .project-img img {
  opacity: 1;
  transform: scale(1.05);
}

.project-content {
  padding: 24px;
}

@media (min-width: 768px) {
  .project-content {
    padding: 32px;
  }
}

.project-cat {
  font-size: 0.75rem;
  color: var(--accent-2);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

h3 {
  margin-bottom: 12px;
  font-size: 1.25rem;
}

p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.project-tags {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.project-tags span {
  font-size: 0.7rem;
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.2);
  padding: 4px 10px;
  border-radius: 8px;
  color: var(--text-muted);
}
</style>
