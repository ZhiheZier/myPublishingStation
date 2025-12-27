<template>
  <canvas ref="canvas" class="particle-canvas"></canvas>
</template>

<script>
export default {
  name: 'ParticleBg',
  props: { count: { type: Number, default: 60 }, color: { type: String, default: '255,255,255' } },
  data() {
    return { ctx: null, particles: [], raf: 0, w: 0, h: 0 }
  },
  mounted() {
    this.init()
    window.addEventListener('resize', this.resize)
  },
  beforeUnmount() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    init() {
      const canvas = this.$refs.canvas
      this.w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth
      this.h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight
      canvas.width = this.w
      canvas.height = this.h
      this.ctx = canvas.getContext('2d')
      this.particles = Array.from({ length: this.count }).map(() => this.makeParticle())
      this.loop()
    },
    resize() {
      const canvas = this.$refs.canvas
      this.w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth
      this.h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight
      canvas.width = this.w
      canvas.height = this.h
    },
    makeParticle() {
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 2 + Math.random() * 2
      }
    },
    step(p) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > this.w) p.vx *= -1
      if (p.y < 0 || p.y > this.h) p.vy *= -1
    },
    draw() {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.w, this.h)
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color},0.8)`
        ctx.fill()
        for (let j = i + 1; j < this.particles.length; j++) {
          const q = this.particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.strokeStyle = `rgba(${this.color},${1 - d / 120})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }
    },
    loop() {
      this.particles.forEach(this.step)
      this.draw()
      this.raf = requestAnimationFrame(this.loop)
    }
  }
}
</script>

<style scoped>
.particle-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>
