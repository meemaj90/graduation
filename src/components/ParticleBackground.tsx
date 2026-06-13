'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface ParticleBackgroundProps {
  className?: string
  count?: number
}

export default function ParticleBackground({ className, count = 80 }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['#D4AF37', '#F0D060', '#A88A20', '#ffffff', '#D4AF3780']

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2,
      size: Math.random() * 3 + 0.5,
      opacity: Math.random() * 0.8 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 100,
    })

    particlesRef.current = Array.from({ length: count }, createParticle)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p, i) => {
        p.life++
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle()
          return
        }
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const lifeFrac = p.life / p.maxLife
        const fadeOpacity = lifeFrac < 0.2 ? lifeFrac / 0.2 : lifeFrac > 0.8 ? (1 - lifeFrac) / 0.2 : 1
        const pulse = Math.sin(p.life * 0.05) * 0.3 + 0.7

        ctx.save()
        ctx.globalAlpha = p.opacity * fadeOpacity * pulse
        ctx.fillStyle = p.color

        // Draw star shape for larger particles
        if (p.size > 2) {
          ctx.beginPath()
          const spikes = 4
          const outerRadius = p.size
          const innerRadius = p.size * 0.5
          for (let s = 0; s < spikes * 2; s++) {
            const r = s % 2 === 0 ? outerRadius : innerRadius
            const angle = (s * Math.PI) / spikes
            ctx.lineTo(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()

        // Draw glow
        if (p.size > 1.5 && p.color.includes('D4AF37')) {
          ctx.save()
          ctx.globalAlpha = p.opacity * fadeOpacity * 0.15
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
          gradient.addColorStop(0, '#D4AF37')
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full', className)}
      style={{ pointerEvents: 'none' }}
    />
  )
}
