<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)

let ctx
let particles = []
let animationFrameId
let mouse = { x: null, y: null }

const PARTICLE_COUNT = 80
const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899']

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight)
  }

  reset(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.size = Math.random() * 3 + 1
    this.speedX = (Math.random() - 0.5) * 0.5
    this.speedY = (Math.random() - 0.5) * 0.5
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
    this.opacity = Math.random() * 0.5 + 0.2
  }

  update(w, h) {
    // Basic movement
    this.x += this.speedX
    this.y += this.speedY

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x
      let dy = mouse.y - this.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 150) {
        let force = (150 - distance) / 150
        this.x -= dx * force * 0.02
        this.y -= dy * force * 0.02
      }
    }

    // Bounds check
    if (this.x < 0) this.x = w
    if (this.x > w) this.x = 0
    if (this.y < 0) this.y = h
    if (this.y > h) this.y = 0
  }

  draw() {
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.opacity
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    
    // Add glow
    ctx.shadowBlur = 15
    ctx.shadowColor = this.color
  }
}

const init = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  ctx = canvas.getContext('2d')
  resize()
  
  particles = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(canvas.width, canvas.height))
  }
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const animate = () => {
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  particles.forEach(p => {
    p.update(canvasRef.value.width, canvasRef.value.height)
    p.draw()
  })
  
  // Reset shadow for performance on next cycles
  ctx.shadowBlur = 0
  
  animationFrameId = requestAnimationFrame(animate)
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const handleMouseLeave = () => {
  mouse.x = null
  mouse.y = null
}

onMounted(() => {
  init()
  animate()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <canvas ref="canvasRef" class="flow-background"></canvas>
</template>

<style scoped>
.flow-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: #030303;
  pointer-events: none;
}

/* Atmospheric overlay for a smoother look */
.flow-background::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent, #030303 90%);
  pointer-events: none;
}
</style>
