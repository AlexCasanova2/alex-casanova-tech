<script setup>
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Parece que te has perdido en el vacío digital.</p>
    <a href="/" class="btn btn-primary">Volver al inicio</a>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: #030303;
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
h1 { font-size: 8rem; margin: 0; background: linear-gradient(to right, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { font-size: 1.2rem; color: #94a3b8; margin-bottom: 32px; }
</style>
