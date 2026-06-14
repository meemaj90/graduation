'use client'
import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Float, Environment, Sparkles, PerspectiveCamera } from '@react-three/drei'
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
// ─────────────────────────────────────────────────────────────────────────────
function paintAuditorium(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2
  const horizon = h * 0.38
  const vp = { x: cx, y: horizon }

  // ── Ceiling/sky ──
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  ceilGrad.addColorStop(0, '#030610')
  ceilGrad.addColorStop(0.5, '#07091e')
  ceilGrad.addColorStop(1, '#0c0e28')
  ctx.fillStyle = ceilGrad
  ctx.fillRect(0, 0, w, h)

  // ── Floor ──
  const floorGrad = ctx.createLinearGradient(0, h * 0.55, 0, h)
  floorGrad.addColorStop(0, '#0a0d22')
  floorGrad.addColorStop(0.5, '#0d1030')
  floorGrad.addColorStop(1, '#060818')
  ctx.fillStyle = floorGrad
  ctx.fillRect(0, h * 0.55, w, h * 0.45)

  // Floor marble sheen
  const sheen = ctx.createLinearGradient(0, h * 0.55, 0, h)
  sheen.addColorStop(0, 'rgba(212,175,55,0.09)')
  sheen.addColorStop(0.3, 'rgba(80,80,180,0.04)')
  sheen.addColorStop(1, 'transparent')
  ctx.fillStyle = sheen
  ctx.fillRect(0, h * 0.55, w, h * 0.45)

  // Floor perspective grid
  ctx.strokeStyle = 'rgba(212,175,55,0.13)'
  ctx.lineWidth = 0.8
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    const x = w * t
    ctx.beginPath()
    ctx.moveTo(vp.x + (x - vp.x) * 0.05, horizon + 2)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let i = 0; i <= 7; i++) {
    const t = i / 7
    const y = horizon + (h - horizon) * (t * t)
    ctx.globalAlpha = 0.06 + t * 0.08
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Red carpet
  const carpetW0 = w * 0.04, carpetW1 = w * 0.15
  const cg = ctx.createLinearGradient(0, horizon, 0, h)
  cg.addColorStop(0, 'rgba(100,0,0,0)')
  cg.addColorStop(0.3, 'rgba(120,5,5,0.88)')
  cg.addColorStop(1, 'rgba(100,0,0,0.92)')
  ctx.fillStyle = cg
  ctx.beginPath()
  ctx.moveTo(cx - carpetW0, horizon); ctx.lineTo(cx + carpetW0, horizon)
  ctx.lineTo(cx + carpetW1, h); ctx.lineTo(cx - carpetW1, h)
  ctx.closePath(); ctx.fill()
  ctx.strokeStyle = 'rgba(212,175,55,0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(cx - carpetW0, horizon); ctx.lineTo(cx - carpetW1, h); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + carpetW0, horizon); ctx.lineTo(cx + carpetW1, h); ctx.stroke()

  // Side walls
  const lwg = ctx.createLinearGradient(0, 0, w * 0.22, 0)
  lwg.addColorStop(0, '#05071a'); lwg.addColorStop(1, '#0c0f28')
  ctx.fillStyle = lwg
  ctx.beginPath()
  ctx.moveTo(0, 0); ctx.lineTo(w * 0.22, horizon); ctx.lineTo(w * 0.16, h); ctx.lineTo(0, h)
  ctx.closePath(); ctx.fill()
  const rwg = ctx.createLinearGradient(w, 0, w * 0.78, 0)
  rwg.addColorStop(0, '#05071a'); rwg.addColorStop(1, '#0c0f28')
  ctx.fillStyle = rwg
  ctx.beginPath()
  ctx.moveTo(w, 0); ctx.lineTo(w * 0.78, horizon); ctx.lineTo(w * 0.84, h); ctx.lineTo(w, h)
  ctx.closePath(); ctx.fill()

  // Pilasters helper
  const drawPilaster = (xTop: number, xBot: number, sconce: boolean) => {
    const pg = ctx.createLinearGradient(xTop, 0, xTop + 20, 0)
    pg.addColorStop(0, '#0a0c22'); pg.addColorStop(0.5, sconce ? '#181c38' : '#0e1028'); pg.addColorStop(1, '#08091c')
    ctx.fillStyle = pg
    ctx.beginPath()
    ctx.moveTo(xTop - 6, 0); ctx.lineTo(xTop + 6, 0)
    ctx.lineTo(xBot + 14, h); ctx.lineTo(xBot - 14, h)
    ctx.closePath(); ctx.fill()
    ctx.strokeStyle = `rgba(212,175,55,${sconce ? 0.65 : 0.35})`
    ctx.lineWidth = sconce ? 1.8 : 1
    ctx.beginPath(); ctx.moveTo(xTop - 8, 2); ctx.lineTo(xTop + 8, 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(xBot - 16, h - 4); ctx.lineTo(xBot + 16, h - 4); ctx.stroke()
    if (sconce) {
      const sx = (xTop + xBot) / 2 + (xTop < cx ? 35 : -35)
      const sy = h * 0.54
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 90)
      sg.addColorStop(0, 'rgba(255,210,80,0.38)'); sg.addColorStop(0.4, 'rgba(255,180,50,0.1)'); sg.addColorStop(1, 'transparent')
      ctx.fillStyle = sg; ctx.fillRect(sx - 90, sy - 90, 180, 180)
      ctx.fillStyle = 'rgba(255,245,150,0.95)'
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill()
    }
  }
  drawPilaster(w * 0.065, w * 0.025, false)
  drawPilaster(w * 0.12, w * 0.075, true)
  drawPilaster(w * 0.175, w * 0.125, false)
  drawPilaster(w * 0.935, w * 0.975, false)
  drawPilaster(w * 0.88, w * 0.925, true)
  drawPilaster(w * 0.825, w * 0.875, false)

  // Ceiling coffers
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const cw = w * 0.09
      const ch = h * 0.038
      const y = h * 0.03 + row * h * 0.09
      const x = w * 0.22 + col * (w * 0.57 / 5)
      ctx.strokeStyle = `rgba(212,175,55,${0.13 - row * 0.03})`
      ctx.lineWidth = 0.8
      ctx.strokeRect(x + 4, y + 4, cw - 8, ch - 8)
    }
  }
  // Chandeliers on ceiling
  ;[[w * 0.35, h * 0.1],[w * 0.5, h * 0.09],[w * 0.65, h * 0.1]].forEach(([lx, ly]) => {
    const lg = ctx.createRadialGradient(lx, ly + 20, 1, lx, ly + 20, 55)
    lg.addColorStop(0, 'rgba(255,230,100,0.88)'); lg.addColorStop(0.4, 'rgba(255,200,60,0.3)'); lg.addColorStop(1, 'transparent')
    ctx.fillStyle = lg; ctx.fillRect(lx - 55, ly - 10, 110, 70)
    ctx.strokeStyle = 'rgba(212,175,55,0.5)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx, ly + 18); ctx.stroke()
    ctx.fillStyle = 'rgba(255,245,160,0.95)'
    ctx.beginPath(); ctx.ellipse(lx, ly + 22, 10, 5, 0, 0, Math.PI * 2); ctx.fill()
  })

  // Crown moulding
  ctx.strokeStyle = 'rgba(212,175,55,0.3)'; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(0, h * 0.27); ctx.lineTo(w * 0.22, horizon - 8); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(w, h * 0.27); ctx.lineTo(w * 0.78, horizon - 8); ctx.stroke()

  // Back wall fill
  const bwg = ctx.createLinearGradient(0, horizon - 70, 0, horizon + 60)
  bwg.addColorStop(0, '#040614'); bwg.addColorStop(0.5, '#07091c'); bwg.addColorStop(1, '#0a0c22')
  ctx.fillStyle = bwg; ctx.fillRect(w * 0.22, 0, w * 0.56, h * 0.55)

  // Proscenium arch
  const archL = w * 0.22, archR = w * 0.78
  const archTop = h * 0.03, archBot = h * 0.51
  const pilW = w * 0.045
  ctx.fillStyle = '#0a0c22'
  ctx.fillRect(archL, archTop, pilW, archBot - archTop)
  ctx.fillRect(archR - pilW, archTop, pilW, archBot - archTop)
  ctx.strokeStyle = 'rgba(212,175,55,0.88)'; ctx.lineWidth = 2.5
  ctx.strokeRect(archL + 0.5, archTop, archR - archL - 1, archBot - archTop)
  ctx.strokeStyle = 'rgba(212,175,55,0.3)'; ctx.lineWidth = 1
  ctx.strokeRect(archL + pilW + 4, archTop + 6, archR - archL - pilW * 2 - 8, archBot - archTop - 6)

  // Stage
  const stageTop = h * 0.465
  const stageL = archL + pilW, stageR = archR - pilW
  const sg = ctx.createLinearGradient(0, stageTop, 0, stageTop + h * 0.08)
  sg.addColorStop(0, '#111428'); sg.addColorStop(1, '#0c0e22')
  ctx.fillStyle = sg; ctx.fillRect(stageL, stageTop, stageR - stageL, h * 0.08)
  ctx.fillStyle = 'rgba(212,175,55,0.92)'; ctx.fillRect(stageL, stageTop, stageR - stageL, 2)
  const srg = ctx.createLinearGradient(0, stageTop + 2, 0, stageTop + h * 0.08)
  srg.addColorStop(0, 'rgba(140,120,60,0.2)'); srg.addColorStop(1, 'transparent')
  ctx.fillStyle = srg; ctx.fillRect(stageL, stageTop + 2, stageR - stageL, h * 0.08 - 2)

  // Curtains
  const drawCurtain = (fromX: number, toX: number) => {
    const folds = 10
    for (let i = 0; i < folds; i++) {
      const t = i / (folds - 1)
      const x = fromX + (toX - fromX) * t
      const sw = (toX - fromX) / folds + 1
      const b = 0.32 + (i % 2) * 0.14
      const rr = Math.round(b * 115), gg = Math.round(b * 6), bb2 = Math.round(b * 6)
      ctx.fillStyle = `rgb(${rr},${gg},${bb2})`
      ctx.fillRect(x, archTop + 10, sw, archBot - archTop - 10)
    }
    ctx.strokeStyle = 'rgba(212,175,55,0.48)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(fromX, archTop + 10); ctx.lineTo(fromX, archBot); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(toX, archTop + 10); ctx.lineTo(toX, archBot); ctx.stroke()
  }
  const curtW = (archR - archL) * 0.2
  drawCurtain(archL + pilW, archL + pilW + curtW)
  drawCurtain(archR - pilW - curtW, archR - pilW)

  // Valance
  const valg = ctx.createLinearGradient(0, archTop, 0, archTop + 28)
  valg.addColorStop(0, '#6b0a0a'); valg.addColorStop(1, '#3d0505')
  ctx.fillStyle = valg; ctx.fillRect(archL + pilW, archTop, archR - archL - pilW * 2, 28)
  ctx.strokeStyle = 'rgba(212,175,55,0.8)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(archL + pilW, archTop + 28); ctx.lineTo(archR - pilW, archTop + 28); ctx.stroke()

  // Spotlights beams
  const drawBeam = (x0: number, y0: number, x1: number, y1: number, col: string, a: number) => {
    const ang = Math.atan2(y1 - y0, x1 - x0)
    const len = Math.hypot(x1 - x0, y1 - y0)
    const sp = 0.18
    ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang)
    const bg = ctx.createLinearGradient(0, 0, len, 0)
    bg.addColorStop(0, `${col}${Math.round(a * 255).toString(16).padStart(2, '0')}`)
    bg.addColorStop(1, `${col}00`)
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, -len * sp); ctx.lineTo(len, len * sp); ctx.closePath(); ctx.fill()
    ctx.restore()
  }
  drawBeam(cx - 55, h * 0.08, cx - 15, stageTop + 8, '#fff8e0', 0.13)
  drawBeam(cx + 55, h * 0.08, cx + 15, stageTop + 8, '#fff0d0', 0.11)
  drawBeam(cx - 80, h * 0.06, cx - 35, stageTop + 5, '#9966ff', 0.09)
  drawBeam(cx + 80, h * 0.06, cx + 35, stageTop + 5, '#ff3366', 0.09)

  // Podium
  const podW = w * 0.048, podH = h * 0.045
  const podX = cx - podW / 2, podY = stageTop - podH + 2
  const podg = ctx.createLinearGradient(podX, 0, podX + podW, 0)
  podg.addColorStop(0, '#06070f'); podg.addColorStop(0.5, '#0e1025'); podg.addColorStop(1, '#060710')
  ctx.fillStyle = podg; ctx.fillRect(podX, podY, podW, podH)
  ctx.fillStyle = 'rgba(212,175,55,0.9)'; ctx.fillRect(podX - 2, podY, podW + 4, 2)
  const fpg = ctx.createLinearGradient(0, podY, 0, podY + podH)
  fpg.addColorStop(0, 'rgba(212,175,55,0.32)'); fpg.addColorStop(1, 'rgba(212,175,55,0.05)')
  ctx.fillStyle = fpg; ctx.fillRect(podX + podW * 0.18, podY + podH * 0.15, podW * 0.64, podH * 0.6)
  ctx.strokeStyle = 'rgba(160,160,160,0.65)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx, podY); ctx.lineTo(cx, podY - h * 0.025); ctx.stroke()
  ctx.fillStyle = 'rgba(100,100,100,0.8)'
  ctx.beginPath(); ctx.arc(cx, podY - h * 0.027, 2.5, 0, Math.PI * 2); ctx.fill()

  // Backdrop text
  const bdL = archL + pilW + curtW + 4
  const bdR = archR - pilW - curtW - 4
  const bdCx = (bdL + bdR) / 2
  const bdTop = archTop + 35
  const bdH = stageTop - archTop - 35

  ctx.textAlign = 'center'
  ctx.fillStyle = '#D4AF37'
  ctx.shadowColor = '#D4AF37'; ctx.shadowBlur = 22
  const fontSize = Math.max(14, Math.round(bdH * 0.15))
  ctx.font = `bold ${fontSize}px Georgia, serif`
  ctx.fillText('Nextora School', bdCx, bdTop + bdH * 0.34)
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.52)'
  const subSize = Math.max(9, Math.round(bdH * 0.063))
  ctx.font = `${subSize}px Georgia, serif`
  ctx.fillText('GRADUATION CEREMONY  ·  CLASS OF 2026', bdCx, bdTop + bdH * 0.52)
  const dvW = (bdR - bdL) * 0.42
  ctx.fillStyle = 'rgba(212,175,55,0.7)'; ctx.shadowColor = '#D4AF37'; ctx.shadowBlur = 8
  ctx.fillRect(bdCx - dvW / 2, bdTop + bdH * 0.57, dvW, 1.5)
  ctx.shadowBlur = 0
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.font = `italic ${Math.max(8, Math.round(bdH * 0.052))}px Georgia, serif`
  ctx.fillText('✦  In Excellence We Achieve  ✦', bdCx, bdTop + bdH * 0.67)

  // Audience silhouettes
  const drawRow = (yBase: number, count: number, rowW: number, scale: number, alpha: number) => {
    const spacing = rowW / count
    for (let i = 0; i < count; i++) {
      const x = cx - rowW / 2 + i * spacing + spacing / 2
      const hue = 220 + (i * 13) % 30
      ctx.globalAlpha = alpha
      ctx.fillStyle = `hsl(${hue},55%,12%)`
      ctx.beginPath(); ctx.ellipse(x, yBase + 6 * scale * 4, 6 * scale * 1.6, 6 * scale * 3.5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = `hsl(${20 + (i * 37) % 40},42%,${50 + (i % 3) * 8}%)`
      ctx.beginPath(); ctx.arc(x, yBase, 6 * scale, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1a237e'
      ctx.fillRect(x - 6 * scale * 0.9, yBase - 6 * scale * 1.4, 6 * scale * 1.8, 6 * scale * 0.4)
      ctx.globalAlpha = 1
    }
  }
  const aisleW = w * 0.14
  for (let r = 0; r < 6; r++) {
    const t = r / 6
    const y = h * 0.88 - t * h * 0.3
    const sc = 0.38 + (1 - t) * 0.5
    const al = 0.45 + (1 - t) * 0.4
    const cnt = Math.round(9 + (1 - t) * 4)
    drawRow(y, cnt, w * 0.32, sc, al)
    ctx.save(); ctx.scale(-1, 1); ctx.translate(-w, 0)
    drawRow(y, cnt, w * 0.32, sc, al)
    ctx.restore()
  }

  // Ceiling ambient halos
  [[w * 0.28, h * 0.17], [w * 0.42, h * 0.15], [w * 0.58, h * 0.15], [w * 0.72, h * 0.17]].forEach(([lx, ly]) => {
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 65)
    lg.addColorStop(0, 'rgba(255,215,80,0.14)'); lg.addColorStop(1, 'transparent')
    ctx.fillStyle = lg; ctx.fillRect(lx - 65, ly - 65, 130, 130)
  })

  // Final vignette
  const vg = ctx.createRadialGradient(cx, h / 2, h * 0.15, cx, h / 2, h * 0.88)
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.6, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.78)')
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h)
}

// ── Renders the auditorium to a data URL once (client-side only) ────────────
function useAuditoriumBg() {
  const [bgUrl, setBgUrl] = useState<string>('')

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    paintAuditorium(ctx, w, h)
    setBgUrl(canvas.toDataURL('image/jpeg', 0.92))
  }, [])

  return bgUrl
}

// ── Twinkling star canvas (CSS layer) ──────────────────────────────────────
function StarField({ style }: { style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    let raf: number
    c.width = window.innerWidth
    c.height = window.innerHeight
    const stars = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height * 0.5,
      r: Math.random() * 1.1 + 0.3,
      sp: Math.random() * 0.3 + 0.05,
    }))
    const draw = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height)
      stars.forEach(s => {
        ctx.globalAlpha = 0.12 + 0.32 * Math.abs(Math.sin(t * 0.001 * s.sp + s.x))
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'; ctx.fill()
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%', ...style }} />
}

// ── Three.js scene — floating caps + sparkles only ──────────────────────────
function FloatingScene() {
  return (
    <>
      <ambientLight intensity={0.4} color="#2030a0" />
      <pointLight position={[0, 3, 2]} color="#D4AF37" intensity={2} />
      <Environment preset="city" />

      {/* Floating graduation caps */}
      {[[-3.2,1.6,-2],[3.2,1.9,-2.5],[0,2.4,-3],[-5,1.4,-1.5],[5,1.5,-2],[-1.5,2.8,-3.5],[1.5,2.6,-3.2]].map(([x,y,z],i) => (
        <Float key={i} speed={0.5+i*0.12} rotationIntensity={0.28} floatIntensity={0.4}>
          <group position={[x as number,y as number,z as number]}>
            {/* Cap brim */}
            <mesh>
              <cylinderGeometry args={[0.28, 0.04, 0.04, 10]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2.5} metalness={0.7} />
            </mesh>
            {/* Cap board */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.55, 0.04, 0.55]} />
              <meshStandardMaterial color="#1a237e" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Tassel */}
            <mesh position={[0.21, -0.06, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 5]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2} />
            </mesh>
            <pointLight color="#D4AF37" intensity={0.6} distance={1.2} />
          </group>
        </Float>
      ))}

      {/* Gold sparkle particles */}
      <Sparkles count={120} scale={[14, 8, 6]} size={2.2} speed={0.18} color="#D4AF37" position={[0,1.5,-1]} opacity={0.7} />
      <Sparkles count={55}  scale={[10, 5, 5]} size={1.5} speed={0.3}  color="#a855f7" position={[0,1,-0.5]} opacity={0.45} />
    </>
  )
}

// ── Nav room buttons ────────────────────────────────────────────────────────
function NavButtons({ onEnter }: { onEnter: (href: string) => void }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Left rooms */}
      <div className="absolute left-3 top-1/3 flex flex-col gap-2.5 pointer-events-auto">
        {ROOMS.slice(0, 3).map(room => (
          <motion.button key={room.href} onClick={() => onEnter(room.href)}
            whileHover={{ scale: 1.06, x: 4 }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left group"
            style={{ background: 'rgba(5,6,20,0.72)', backdropFilter: 'blur(14px)', border: `1px solid ${room.color}35` }}>
            <span className="text-lg leading-none">{room.emoji}</span>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{room.label}</p>
              <p className="text-xs leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: room.color }}>Enter →</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: room.color, boxShadow: `0 0 6px ${room.color}` }} />
          </motion.button>
        ))}
      </div>

      {/* Right rooms */}
      <div className="absolute right-3 top-1/3 flex flex-col gap-2.5 pointer-events-auto">
        {ROOMS.slice(3).map(room => (
          <motion.button key={room.href} onClick={() => onEnter(room.href)}
            whileHover={{ scale: 1.06, x: -4 }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-right group"
            style={{ background: 'rgba(5,6,20,0.72)', backdropFilter: 'blur(14px)', border: `1px solid ${room.color}35` }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: room.color, boxShadow: `0 0 6px ${room.color}` }} />
            <div>
              <p className="text-xs font-bold text-white leading-tight">{room.label}</p>
              <p className="text-xs leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: room.color }}>Enter →</p>
            </div>
            <span className="text-lg leading-none">{room.emoji}</span>
          </motion.button>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
        <motion.button onClick={() => onEnter('/auditorium')}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-7 py-3.5 rounded-2xl font-bold text-white text-base"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5,#D4AF37)', boxShadow: '0 0 36px rgba(139,92,246,0.55)' }}>
          🎓 Enter Ceremony Hall
        </motion.button>
      </div>
    </div>
  )
}

// ── Main lobby view ─────────────────────────────────────────────────────────
function LobbyView({ myName, myAvatar, onLeave, onNavigate }: {
  myName: string
  myAvatar: import('../types').AvatarCustomization
  onLeave: () => void
  onNavigate: (href: string) => void
}) {
  const bgUrl = useAuditoriumBg()

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#03040f' }}>

      {/* Layer 1: painted auditorium (CSS background-image from data URL) */}
      {bgUrl && (
        <div className="absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      {/* Fallback dark gradient while painting */}
      {!bgUrl && <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#07091c,#0a0d24)' }} />}

      {/* Layer 2: animated stars */}
      <StarField />

      {/* Layer 3: Three.js floating caps (transparent canvas, no postprocessing) */}
      <Canvas
        className="absolute inset-0"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ pointerEvents: 'none' }}
      >
        <PerspectiveCamera makeDefault fov={60} position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <FloatingScene />
        </Suspense>
      </Canvas>

      {/* Layer 4: nav hotspots */}
      <NavButtons onEnter={onNavigate} />

      {/* Top chips */}
      {myName && (
        <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/65 text-xs">{myName}</span>
        </div>
      )}
      <button onClick={onLeave}
        className="absolute top-5 left-5 text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
        ← Exit
      </button>
    </div>
  )
}

// ── Entry screen ────────────────────────────────────────────────────────────
function EntryScreen({ onEnter }: { onEnter: () => void }) {
  const { myAvatar, myName } = useGraduationStore()
  const router = useRouter()
  const bgUrl = useAuditoriumBg()

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden" style={{ background: '#03040f' }}>

      {/* Background painting */}
      {bgUrl && (
        <div className="absolute inset-0 transition-opacity duration-700"
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.42 }} />
      )}

      <StarField style={{ opacity: 0.6 }} />

      {/* Floating caps Three.js */}
      <Canvas className="absolute inset-0" gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]} style={{ pointerEvents: 'none' }}>
        <PerspectiveCamera makeDefault fov={60} position={[0, 0, 5]} />
        <Suspense fallback={null}>
          <FloatingScene />
        </Suspense>
      </Canvas>

      {/* Centre vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 72% 72% at 50% 50%, transparent 10%, rgba(3,4,15,0.9) 100%)' }} />

      <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6 max-w-lg w-full">

        <div className="text-6xl mb-5">🎓</div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-3 leading-tight">
          Virtual Graduation<br />
          <span style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#f0d060 40%,#a855f7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Hall · 2026
          </span>
        </h1>
        <p className="text-white/30 text-xs mb-8 tracking-widest uppercase">Nextora School · Virtual Ceremony</p>

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
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5,#D4AF37)', boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}>
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

// ── Exported ────────────────────────────────────────────────────────────────
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
        : <LobbyView myName={myName} myAvatar={myAvatar} onLeave={() => setEntered(false)} onNavigate={handleNavigate} />
      }
    </>
  )
}
