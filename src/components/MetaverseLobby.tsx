'use client'
import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Float, Text, Environment, Sparkles, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'

// ── Room destinations ───────────────────────────────────────────────────────
const ROOMS = [
  { label: 'Auditorium',  emoji: '🎓', href: '/auditorium',  color: '#D4AF37' },
  { label: 'Graduates',   emoji: '👥', href: '/graduates',   color: '#60a5fa' },
  { label: 'Networking',  emoji: '🤝', href: '/networking',  color: '#a78bfa' },
  { label: 'Photo Booth', emoji: '📸', href: '/photo-booth', color: '#f472b6' },
  { label: 'Programme',   emoji: '📋', href: '/program',     color: '#34d399' },
  { label: 'My Avatar',   emoji: '🧑‍🎓', href: '/avatar',     color: '#fbbf24' },
]

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS PAINTER — draws a photorealistic auditorium background
// This is the technique used by ibentos / vFair: a stunning painted backdrop
// ─────────────────────────────────────────────────────────────────────────────
function paintAuditorium(canvas: HTMLCanvasElement, w: number, h: number) {
  const ctx = canvas.getContext('2d')!
  // canvas size is set by the caller — just clear and paint
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const horizon = h * 0.38   // vanishing point y
  const vp = { x: cx, y: horizon }  // single-point perspective

  // ── Sky / ceiling fill ──
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  ceilGrad.addColorStop(0, '#030610')
  ceilGrad.addColorStop(0.5, '#07091e')
  ceilGrad.addColorStop(1, '#0c0e28')
  ctx.fillStyle = ceilGrad
  ctx.fillRect(0, 0, w, h)

  // ── Floor ──
  const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h)
  floorGrad.addColorStop(0, '#0a0d22')
  floorGrad.addColorStop(0.4, '#0d1030')
  floorGrad.addColorStop(1, '#060818')
  ctx.fillStyle = floorGrad
  ctx.fillRect(0, h * 0.55, w, h * 0.45)

  // ── Floor reflection / marble sheen ──
  const sheen = ctx.createLinearGradient(0, h * 0.55, 0, h)
  sheen.addColorStop(0, 'rgba(212,175,55,0.08)')
  sheen.addColorStop(0.3, 'rgba(100,100,200,0.04)')
  sheen.addColorStop(1, 'transparent')
  ctx.fillStyle = sheen
  ctx.fillRect(0, h * 0.55, w, h * 0.45)

  // ── Floor grid lines (perspective) ──
  ctx.strokeStyle = 'rgba(212,175,55,0.12)'
  ctx.lineWidth = 0.8
  const gridLines = 12
  for (let i = 0; i <= gridLines; i++) {
    const t = i / gridLines
    const x = w * t
    ctx.beginPath()
    ctx.moveTo(vp.x + (x - vp.x) * 0.05, horizon + 2)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  // horizontal floor lines
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    const y = horizon + (h - horizon) * (t * t)
    ctx.globalAlpha = 0.08 + t * 0.08
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // ── Red carpet center aisle ──
  const carpetGrad = ctx.createLinearGradient(0, horizon, 0, h)
  carpetGrad.addColorStop(0, 'rgba(100,0,0,0)')
  carpetGrad.addColorStop(0.3, 'rgba(120,5,5,0.85)')
  carpetGrad.addColorStop(1, 'rgba(100,0,0,0.9)')
  ctx.fillStyle = carpetGrad

  const carpetW0 = w * 0.04
  const carpetW1 = w * 0.14
  ctx.beginPath()
  ctx.moveTo(cx - carpetW0, horizon)
  ctx.lineTo(cx + carpetW0, horizon)
  ctx.lineTo(cx + carpetW1, h)
  ctx.lineTo(cx - carpetW1, h)
  ctx.closePath()
  ctx.fill()

  // Gold carpet edge
  ctx.strokeStyle = 'rgba(212,175,55,0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - carpetW0, horizon)
  ctx.lineTo(cx - carpetW1, h)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + carpetW0, horizon)
  ctx.lineTo(cx + carpetW1, h)
  ctx.stroke()

  // ── Side walls with depth ──
  // Left wall
  const lwGrad = ctx.createLinearGradient(0, 0, w * 0.22, 0)
  lwGrad.addColorStop(0, '#06081a')
  lwGrad.addColorStop(1, '#0c0f26')
  ctx.fillStyle = lwGrad
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w * 0.22, horizon)
  ctx.lineTo(w * 0.16, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  // Right wall
  const rwGrad = ctx.createLinearGradient(w, 0, w * 0.78, 0)
  rwGrad.addColorStop(0, '#06081a')
  rwGrad.addColorStop(1, '#0c0f26')
  ctx.fillStyle = rwGrad
  ctx.beginPath()
  ctx.moveTo(w, 0)
  ctx.lineTo(w * 0.78, horizon)
  ctx.lineTo(w * 0.84, h)
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()

  // ── Left-wall pilasters ──
  const drawPilaster = (xTop: number, xBot: number, light: boolean) => {
    const pilGrad = ctx.createLinearGradient(xTop, 0, xBot, 0)
    pilGrad.addColorStop(0, light ? '#141630' : '#0a0c20')
    pilGrad.addColorStop(0.5, light ? '#1c2040' : '#0c0e24')
    pilGrad.addColorStop(1, '#08091c')
    ctx.fillStyle = pilGrad
    ctx.beginPath()
    ctx.moveTo(xTop - 8, 0)
    ctx.lineTo(xTop + 8, 0)
    ctx.lineTo(xBot + 16, h)
    ctx.lineTo(xBot - 16, h)
    ctx.closePath()
    ctx.fill()
    // Gold cap line
    ctx.strokeStyle = `rgba(212,175,55,${light ? 0.7 : 0.4})`
    ctx.lineWidth = light ? 2 : 1
    ctx.beginPath()
    ctx.moveTo(xTop - 10, 2)
    ctx.lineTo(xTop + 10, 2)
    ctx.stroke()
    // Gold base
    ctx.beginPath()
    ctx.moveTo(xBot - 18, h - 4)
    ctx.lineTo(xBot + 18, h - 4)
    ctx.stroke()
    // Sconce glow
    if (light) {
      const gx = (xTop + xBot) / 2 + 30
      const gy = h * 0.55
      const sg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 80)
      sg.addColorStop(0, 'rgba(255,210,80,0.35)')
      sg.addColorStop(0.4, 'rgba(255,180,50,0.12)')
      sg.addColorStop(1, 'rgba(255,180,50,0)')
      ctx.fillStyle = sg
      ctx.fillRect(gx - 80, gy - 80, 160, 160)
      // Bulb
      ctx.fillStyle = 'rgba(255,240,150,0.9)'
      ctx.beginPath()
      ctx.arc(gx, gy, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  drawPilaster(w * 0.065, w * 0.02, false)
  drawPilaster(w * 0.12, w * 0.07, true)
  drawPilaster(w * 0.175, w * 0.12, false)
  drawPilaster(w * 0.935, w * 0.98, false)
  drawPilaster(w * 0.88, w * 0.93, true)
  drawPilaster(w * 0.825, w * 0.88, false)

  // ── Ceiling coffers ──
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const t = (row + 1) / 4
      const cw = w * (0.08 + t * 0.04)
      const ch = h * 0.04
      const y = h * 0.04 + row * h * 0.1
      const x = w * 0.22 + col * (w * 0.56 / 4) + (w * 0.56 / 4) / 2 - cw / 2
      ctx.strokeStyle = `rgba(212,175,55,${0.12 - row * 0.03})`
      ctx.lineWidth = 0.8
      ctx.strokeRect(x, y, cw * (4 - col * 0.1), ch)

      // Chandelier at intersection
      if (row === 0 && col % 2 === 1) {
        const chx = x + cw / 2
        const chy = y + ch + 20
        // Chain
        ctx.strokeStyle = 'rgba(212,175,55,0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(chx, y + ch)
        ctx.lineTo(chx, chy)
        ctx.stroke()
        // Body
        const cg = ctx.createRadialGradient(chx, chy + 12, 2, chx, chy + 12, 28)
        cg.addColorStop(0, 'rgba(255,230,100,0.9)')
        cg.addColorStop(0.3, 'rgba(255,200,60,0.4)')
        cg.addColorStop(1, 'rgba(255,180,40,0)')
        ctx.fillStyle = cg
        ctx.fillRect(chx - 28, chy, 56, 30)
        ctx.fillStyle = 'rgba(255,240,150,0.95)'
        ctx.beginPath()
        ctx.ellipse(chx, chy + 12, 10, 5, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // ── Crown moulding ──
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, h * 0.28)
  ctx.lineTo(w * 0.22, horizon - 8)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(w, h * 0.28)
  ctx.lineTo(w * 0.78, horizon - 8)
  ctx.stroke()

  // ── Back wall / stage area ──
  const stageGrad = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 60)
  stageGrad.addColorStop(0, '#040614')
  stageGrad.addColorStop(0.5, '#07091c')
  stageGrad.addColorStop(1, '#0a0c22')
  ctx.fillStyle = stageGrad
  ctx.fillRect(w * 0.22, 0, w * 0.56, h * 0.55)

  // ── Proscenium arch ──
  const archLeft = w * 0.22
  const archRight = w * 0.78
  const archTop = h * 0.04
  const archBottom = h * 0.52

  // Arch pillars
  const pilWidth = w * 0.045
  ctx.fillStyle = '#0a0c22'
  ctx.fillRect(archLeft, archTop, pilWidth, archBottom - archTop)
  ctx.fillRect(archRight - pilWidth, archTop, pilWidth, archBottom - archTop)

  // Gold arch lines
  ctx.strokeStyle = 'rgba(212,175,55,0.85)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(archLeft + 1, archTop, archRight - archLeft - 2, archBottom - archTop)
  // Inner arch line
  ctx.strokeStyle = 'rgba(212,175,55,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(archLeft + pilWidth, archTop + 8, archRight - archLeft - pilWidth * 2, archBottom - archTop - 8)

  // ── Stage platform ──
  const stageTop = h * 0.47
  const stageLeft = archLeft + pilWidth
  const stageRight = archRight - pilWidth
  const stageH = h * 0.08

  const sGrad = ctx.createLinearGradient(0, stageTop, 0, stageTop + stageH)
  sGrad.addColorStop(0, '#111428')
  sGrad.addColorStop(1, '#0c0e22')
  ctx.fillStyle = sGrad
  ctx.fillRect(stageLeft, stageTop, stageRight - stageLeft, stageH)

  // Stage front edge gold
  ctx.fillStyle = 'rgba(212,175,55,0.9)'
  ctx.fillRect(stageLeft, stageTop, stageRight - stageLeft, 2)

  // Stage floor subtle reflection
  const srGrad = ctx.createLinearGradient(0, stageTop + 2, 0, stageTop + stageH)
  srGrad.addColorStop(0, 'rgba(140,120,60,0.18)')
  srGrad.addColorStop(1, 'rgba(100,80,40,0)')
  ctx.fillStyle = srGrad
  ctx.fillRect(stageLeft, stageTop + 2, stageRight - stageLeft, stageH - 2)

  // ── Curtains ──
  const drawCurtain = (fromX: number, toX: number, facing: number) => {
    const folds = 10
    for (let i = 0; i < folds; i++) {
      const t = i / (folds - 1)
      const x = fromX + (toX - fromX) * t
      const brightness = 0.3 + (i % 2) * 0.12 + t * facing * 0.1
      const rVal = Math.round(brightness * 110)
      const gVal = Math.round(brightness * 8)
      const bVal = Math.round(brightness * 8)
      const sw = (toX - fromX) / folds + 1
      const foldGrad = ctx.createLinearGradient(x, archTop + 10, x + sw, archTop + 10)
      foldGrad.addColorStop(0, `rgb(${rVal},${gVal},${bVal})`)
      foldGrad.addColorStop(0.5, `rgb(${Math.min(255, rVal + 20)},${gVal},${bVal})`)
      foldGrad.addColorStop(1, `rgb(${rVal},${gVal},${bVal})`)
      ctx.fillStyle = foldGrad
      ctx.fillRect(x, archTop + 10, sw, archBottom - archTop - 10)
    }
    // Gold trim on outer edge
    ctx.strokeStyle = 'rgba(212,175,55,0.5)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(facing > 0 ? fromX : toX, archTop + 10)
    ctx.lineTo(facing > 0 ? fromX : toX, archBottom)
    ctx.stroke()
  }
  const curtainW = (archRight - archLeft) * 0.21
  drawCurtain(archLeft + pilWidth, archLeft + pilWidth + curtainW, 1)
  drawCurtain(archRight - pilWidth - curtainW, archRight - pilWidth, -1)

  // Valance top
  const valGrad = ctx.createLinearGradient(archLeft, archTop, archLeft, archTop + 28)
  valGrad.addColorStop(0, '#6b0a0a')
  valGrad.addColorStop(1, '#3d0505')
  ctx.fillStyle = valGrad
  ctx.fillRect(archLeft + pilWidth, archTop, archRight - archLeft - pilWidth * 2, 28)
  ctx.strokeStyle = 'rgba(212,175,55,0.8)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(archLeft + pilWidth, archTop + 28)
  ctx.lineTo(archRight - pilWidth, archTop + 28)
  ctx.stroke()

  // ── Spotlights ──
  const drawSpot = (fromX: number, fromY: number, toX: number, toY: number, color: string, alpha: number) => {
    const angle = Math.atan2(toY - fromY, toX - fromX)
    const len = Math.hypot(toX - fromX, toY - fromY)
    const spread = 0.18
    ctx.save()
    ctx.translate(fromX, fromY)
    ctx.rotate(angle)
    const sg = ctx.createLinearGradient(0, 0, len, 0)
    sg.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`)
    sg.addColorStop(1, `${color}00`)
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(len, -len * spread)
    ctx.lineTo(len, len * spread)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  drawSpot(cx - 60, h * 0.08, cx - 20, stageTop + 10, '#fff8e0', 0.12)
  drawSpot(cx + 60, h * 0.08, cx + 20, stageTop + 10, '#fff0d0', 0.10)
  drawSpot(cx - 80, h * 0.06, cx - 40, stageTop + 5, '#9966ff', 0.08)
  drawSpot(cx + 80, h * 0.06, cx + 40, stageTop + 5, '#ff3366', 0.08)

  // ── Podium ──
  const podW = w * 0.05
  const podH = stageH * 0.55
  const podX = cx - podW / 2
  const podY = stageTop - podH + 2

  const podGrad = ctx.createLinearGradient(podX, 0, podX + podW, 0)
  podGrad.addColorStop(0, '#06070f')
  podGrad.addColorStop(0.5, '#0e1025')
  podGrad.addColorStop(1, '#060710')
  ctx.fillStyle = podGrad
  ctx.fillRect(podX, podY, podW, podH)
  // Gold top
  ctx.fillStyle = 'rgba(212,175,55,0.9)'
  ctx.fillRect(podX - 2, podY, podW + 4, 2)
  // Front panel
  const panelGrad = ctx.createLinearGradient(0, podY, 0, podY + podH)
  panelGrad.addColorStop(0, 'rgba(212,175,55,0.3)')
  panelGrad.addColorStop(1, 'rgba(212,175,55,0.05)')
  ctx.fillStyle = panelGrad
  ctx.fillRect(podX + podW * 0.15, podY + podH * 0.15, podW * 0.7, podH * 0.6)
  // Mic
  ctx.strokeStyle = 'rgba(160,160,160,0.7)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, podY)
  ctx.lineTo(cx, podY - 14)
  ctx.stroke()
  ctx.fillStyle = 'rgba(100,100,100,0.8)'
  ctx.beginPath()
  ctx.arc(cx, podY - 16, 3, 0, Math.PI * 2)
  ctx.fill()

  // ── University name on backdrop ──
  const backdropLeft = archLeft + pilWidth + curtainW
  const backdropRight = archRight - pilWidth - curtainW
  const backdropCx = (backdropLeft + backdropRight) / 2
  const backdropTop = archTop + 35
  const backdropH = stageTop - archTop - 35

  ctx.textAlign = 'center'
  ctx.fillStyle = '#D4AF37'
  ctx.shadowColor = '#D4AF37'
  ctx.shadowBlur = 18
  ctx.font = `bold ${Math.round(backdropH * 0.14)}px Georgia, serif`
  ctx.fillText('Excellence University', backdropCx, backdropTop + backdropH * 0.34)

  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `${Math.round(backdropH * 0.06)}px Georgia, serif`
  ctx.fillText('GRADUATION CEREMONY  ·  CLASS OF 2026', backdropCx, backdropTop + backdropH * 0.52)

  // Gold divider
  const dvW = (backdropRight - backdropLeft) * 0.45
  ctx.fillStyle = 'rgba(212,175,55,0.7)'
  ctx.shadowColor = '#D4AF37'
  ctx.shadowBlur = 8
  ctx.fillRect(backdropCx - dvW / 2, backdropTop + backdropH * 0.57, dvW, 1.5)
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.font = `italic ${Math.round(backdropH * 0.05)}px Georgia, serif`
  ctx.fillText('✦  In Excellence We Achieve  ✦', backdropCx, backdropTop + backdropH * 0.66)

  // ── Audience silhouettes ──
  const drawAudienceRow = (yBase: number, count: number, rowW: number, scale: number, alpha: number) => {
    const spacing = rowW / count
    for (let i = 0; i < count; i++) {
      const x = cx - rowW / 2 + i * spacing + spacing / 2
      const hue = 220 + (i * 13) % 30
      const headR = 6 * scale
      // Gown
      ctx.globalAlpha = alpha
      ctx.fillStyle = `hsl(${hue},50%,12%)`
      ctx.beginPath()
      ctx.ellipse(x, yBase + headR * 4, headR * 1.6, headR * 3.5, 0, 0, Math.PI * 2)
      ctx.fill()
      // Head
      ctx.fillStyle = `hsl(${20 + (i * 37) % 40},40%,${50 + (i % 3) * 8}%)`
      ctx.beginPath()
      ctx.arc(x, yBase, headR, 0, Math.PI * 2)
      ctx.fill()
      // Cap
      ctx.fillStyle = '#1a237e'
      ctx.fillRect(x - headR * 0.9, yBase - headR * 1.4, headR * 1.8, headR * 0.4)
      ctx.globalAlpha = 1
    }
  }

  // Draw rows of audience going up toward horizon
  const aisleHalf = w * 0.16
  const seatRowW = (w * 0.35)
  const totalRows = 6
  for (let r = 0; r < totalRows; r++) {
    const t = r / totalRows
    const y = h * 0.88 - t * h * 0.32
    const rowScale = 0.4 + (1 - t) * 0.5
    const alpha = 0.5 + (1 - t) * 0.4
    const count = Math.round(10 + (1 - t) * 4)
    // Left bloc
    drawAudienceRow(y, count, seatRowW, rowScale, alpha)
    // Right bloc
    ctx.save()
    ctx.scale(-1, 1)
    ctx.translate(-w, 0)
    drawAudienceRow(y, count, seatRowW, rowScale, alpha)
    ctx.restore()
  }

  // ── Ambient light halos on ceiling ──
  for (let i = 0; i < 4; i++) {
    const lx = w * (0.25 + i * 0.17)
    const ly = h * 0.18
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60)
    lg.addColorStop(0, 'rgba(255,220,80,0.12)')
    lg.addColorStop(1, 'rgba(255,200,60,0)')
    ctx.fillStyle = lg
    ctx.fillRect(lx - 60, ly - 60, 120, 120)
  }

  // ── Vignette ──
  const vg = ctx.createRadialGradient(cx, h / 2, h * 0.2, cx, h / 2, h * 0.85)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(0.65, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.75)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, w, h)
}

// ── Background canvas component ─────────────────────────────────────────────
function AuditoriumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      // Set pixel buffer size
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // Set CSS display size
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      // Scale context so paint coordinates are in CSS pixels
      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)
      paintAuditorium(canvas, w, h)
    }

    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}

// ── 3D overlay: floating caps, lights, name tag, avatars ───────────────────
// These float OVER the painted background for depth and interaction

function FloatingCaps() {
  return (
    <>
      {[
        [-3.5, 2.8, -3], [3.5, 3.2, -3.5],
        [0, 3.8, -4], [-5.5, 2.4, -2], [5.5, 2.6, -2.5],
      ].map(([x, y, z], i) => (
        <Float key={i} speed={0.5 + i * 0.15} rotationIntensity={0.3} floatIntensity={0.4}>
          <group position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.04, 0.045, 10]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <boxGeometry args={[0.6, 0.04, 0.6]} />
              <meshStandardMaterial color="#1a237e" roughness={0.4} metalness={0.4} />
            </mesh>
            <mesh position={[0.22, -0.06, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.22, 5]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1.5} />
            </mesh>
            <pointLight color="#D4AF37" intensity={0.8} distance={1.5} />
          </group>
        </Float>
      ))}
    </>
  )
}

function GoldParticles() {
  return (
    <>
      <Sparkles count={180} scale={[16, 9, 8]} size={2.5} speed={0.2} color="#D4AF37" position={[0, 2, -2]} opacity={0.7} />
      <Sparkles count={80} scale={[12, 6, 6]} size={1.5} speed={0.35} color="#a855f7" position={[0, 1.5, 0]} opacity={0.5} />
    </>
  )
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom intensity={2.2} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur radius={0.85} />
      <Vignette eskil={false} offset={0.25} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}

// ── Navigation hotspots (HTML overlaid on canvas, not Three.js) ─────────────
function NavHotspots({ onEnter }: { onEnter: (href: string) => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Left wall rooms */}
      <div className="absolute pointer-events-auto" style={{ left: '3%', top: '30%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROOMS.slice(0, 3).map((room) => (
          <button key={room.href} onClick={() => onEnter(room.href)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: `1px solid ${room.color}40` }}>
            <span className="text-lg">{room.emoji}</span>
            <div>
              <p className="text-xs font-bold text-white">{room.label}</p>
              <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: room.color }}>Enter →</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: room.color, boxShadow: `0 0 6px ${room.color}` }} />
          </button>
        ))}
      </div>

      {/* Right wall rooms */}
      <div className="absolute pointer-events-auto" style={{ right: '3%', top: '30%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROOMS.slice(3).map((room) => (
          <button key={room.href} onClick={() => onEnter(room.href)}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: `1px solid ${room.color}40` }}>
            <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ background: room.color, boxShadow: `0 0 6px ${room.color}` }} />
            <div>
              <p className="text-xs font-bold text-white">{room.label}</p>
              <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: room.color }}>Enter →</p>
            </div>
            <span className="text-lg">{room.emoji}</span>
          </button>
        ))}
      </div>

      {/* Centre bottom: enter auditorium CTA */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto" style={{ bottom: '12%' }}>
        <motion.button onClick={() => onEnter('/auditorium')}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #D4AF37)', boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}>
          🎓 Enter Ceremony
        </motion.button>
      </div>
    </div>
  )
}

// ── Interactive 3D layer on top of the painted background ───────────────────
function ThreeDOverlay() {
  return (
    <Canvas
      className="absolute inset-0"
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <PerspectiveCamera makeDefault fov={60} position={[0, 0, 5]} />
      <ambientLight intensity={0.3} color="#1a2060" />
      <Environment preset="city" />
      <Suspense fallback={null}>
        <FloatingCaps />
        <GoldParticles />
        <PostFX />
      </Suspense>
    </Canvas>
  )
}

// ── Animated background particles (CSS layer) ───────────────────────────────
function StarParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
    }))
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        const o = 0.15 + 0.35 * Math.abs(Math.sin(t * 0.001 * p.speed + p.x))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${o})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

// ── Lobby (in-hall view) ────────────────────────────────────────────────────
function LobbyView({ myName, myAvatar, onLeave, onNavigate }: {
  myName: string
  myAvatar: import('../types').AvatarCustomization
  onLeave: () => void
  onNavigate: (href: string) => void
}) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#030510' }}>
      {/* Layer 1: painted auditorium */}
      <AuditoriumBackground />

      {/* Layer 2: subtle star particles above seating */}
      <StarParticles />

      {/* Layer 3: Three.js floating 3D caps + sparkles */}
      <ThreeDOverlay />

      {/* Layer 4: Nav hotspots */}
      <NavHotspots onEnter={onNavigate} />

      {/* HUD: bottom */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-4 py-1.5 rounded-xl text-xs text-white/35 flex gap-3"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span>Click any room on the left/right to enter</span>
        </div>
      </div>

      {/* HUD: top right — user chip */}
      {myName && (
        <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/65 text-xs">{myName}</span>
        </div>
      )}

      {/* Back button */}
      <button onClick={onLeave}
        className="absolute top-5 left-5 text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
        ← Exit
      </button>
    </div>
  )
}

// ── Entry screen ─────────────────────────────────────────────────────────────
function EntryScreen({ onEnter }: { onEnter: () => void }) {
  const { myAvatar, myName } = useGraduationStore()
  const router = useRouter()

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: '#030510' }}>

      {/* Background: same painted hall at 45% opacity */}
      <div className="absolute inset-0" style={{ opacity: 0.45 }}>
        <AuditoriumBackground />
      </div>

      {/* Stars */}
      <div className="absolute inset-0 opacity-60">
        <StarParticles />
      </div>

      {/* 3D caps floating */}
      <div className="absolute inset-0 opacity-80">
        <ThreeDOverlay />
      </div>

      {/* Dark vignette to focus on centre */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 10%, rgba(3,5,16,0.88) 100%)' }} />

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 max-w-lg w-full">

        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-6xl mb-5">🎓</motion.div>

        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-3 leading-tight">
          Virtual Graduation
          <br />
          <span style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #f0d060 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Hall · 2026
          </span>
        </h1>
        <p className="text-white/30 text-xs mb-8 tracking-wide uppercase">
          Excellence University · Virtual Ceremony
        </p>

        {myName && (
          <div className="flex items-center justify-center gap-3 mb-7 px-5 py-3 rounded-2xl w-fit mx-auto"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <AvatarDisplay avatar={myAvatar} size={50} />
            <div className="text-left">
              <p className="text-white font-semibold text-sm">{myName}</p>
              <p className="text-xs" style={{ color: '#D4AF37', opacity: 0.7 }}>Ready to enter ✓</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onEnter}
            className="px-9 py-4 rounded-2xl font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #D4AF37)', boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}>
            Enter Hall →
          </motion.button>
          {!myName && (
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => router.push('/avatar')}
              className="px-6 py-4 rounded-2xl font-semibold text-white border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.3)' }}>
              Create Avatar
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Exported MetaverseLobby ──────────────────────────────────────────────────
export default function MetaverseLobby() {
  const router = useRouter()
  const { myName, myAvatar } = useGraduationStore()
  const [entered, setEntered] = useState(false)
  const [fadingTo, setFadingTo] = useState('')

  const handleNavigate = useCallback((href: string) => {
    setFadingTo(href)
    setTimeout(() => router.push(href), 700)
  }, [router])

  return (
    <>
      <AnimatePresence>
        {fadingTo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[9999]" />
        )}
      </AnimatePresence>

      {!entered
        ? <EntryScreen onEnter={() => setEntered(true)} />
        : <LobbyView
            myName={myName}
            myAvatar={myAvatar}
            onLeave={() => setEntered(false)}
            onNavigate={handleNavigate}
          />
      }
    </>
  )
}
