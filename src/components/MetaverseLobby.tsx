'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'

const ROOMS = [
  { id: 'auditorium', label: 'Ceremony Hall',  emoji: '🎓', href: '/auditorium',  color: '#1a3a8f', desc: 'Live ceremony & BBB stream' },
  { id: 'graduates',  label: 'Graduate Wall',  emoji: '👥', href: '/graduates',   color: '#1a3a8f', desc: 'Browse all graduates' },
  { id: 'networking', label: 'Family Lounge',  emoji: '🤝', href: '/networking',  color: '#1a3a8f', desc: 'Meet & celebrate together' },
  { id: 'photobooth', label: 'Photo Booth',    emoji: '📸', href: '/photo-booth', color: '#1a3a8f', desc: 'Take your graduation photos' },
  { id: 'programme',  label: 'Programme',      emoji: '📋', href: '/program',     color: '#1a3a8f', desc: "Today's schedule" },
  { id: 'avatar',     label: 'My Avatar',      emoji: '🧑‍🎓', href: '/avatar',     color: '#D4AF37', desc: 'Customise your avatar' },
]

// ── Lobby painter — bright modern entrance hall (image 2 style) ──────────────
function paintLobby(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)

  const cx = W / 2
  const vy = H * 0.44  // vanishing point Y
  const vx = cx         // vanishing point X (centre)

  // Helper: point on a line from vanishing point
  const vLine = (edgeX: number, edgeY: number, t: number): [number, number] => [
    vx + (edgeX - vx) * t,
    vy + (edgeY - vy) * t,
  ]

  // ── Ceiling ────────────────────────────────────────────────────────────────
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, vy)
  ceilGrad.addColorStop(0, '#e8e8ee')
  ceilGrad.addColorStop(1, '#f0f0f5')
  ctx.fillStyle = ceilGrad
  ctx.beginPath()
  ctx.moveTo(0, 0); ctx.lineTo(W, 0)
  ctx.lineTo(W, vy); ctx.lineTo(0, vy)
  ctx.fill()

  // Recessed ceiling panels
  const panelCols = 4, panelRows = 3
  for (let row = 0; row < panelRows; row++) {
    for (let col = 0; col < panelCols; col++) {
      const t0 = 0.08 + row * 0.28, t1 = t0 + 0.22
      const x0 = W * (0.18 + col * 0.21), x1 = x0 + W * 0.17
      const [px0, py0] = vLine(x0, 0, t0)
      const [px1, py1] = vLine(x1, 0, t0)
      const [px2, py2] = vLine(x1, 0, t1)
      const [px3, py3] = vLine(x0, 0, t1)
      ctx.fillStyle = 'rgba(220,220,230,0.6)'
      ctx.beginPath(); ctx.moveTo(px0,py0); ctx.lineTo(px1,py1); ctx.lineTo(px2,py2); ctx.lineTo(px3,py3); ctx.closePath(); ctx.fill()
      ctx.strokeStyle = 'rgba(180,180,195,0.7)'; ctx.lineWidth = 0.8
      ctx.stroke()

      // Recessed light strips inside some panels
      if (row < 2) {
        const lg = ctx.createLinearGradient(px0, py0, px1, py1)
        lg.addColorStop(0,'rgba(255,255,220,0)'); lg.addColorStop(0.5,'rgba(255,255,200,0.55)'); lg.addColorStop(1,'rgba(255,255,220,0)')
        ctx.fillStyle = lg
        const midY = (py0+py2)/2 - 2
        ctx.fillRect(Math.min(px0,px1), midY, Math.abs(px1-px0), 4)

        // Light glow on floor
        const floorGlowX = (px0+px1)/2
        const floorGlowY = H - (H-vy)*(0.08+row*0.28) + 20
        const fg = ctx.createRadialGradient(floorGlowX, H*0.7, 0, floorGlowX, H*0.7, 80)
        fg.addColorStop(0,'rgba(240,240,255,0.15)'); fg.addColorStop(1,'transparent')
        ctx.fillStyle = fg; ctx.fillRect(floorGlowX-80, H*0.55, 160, H*0.45)
      }
    }
  }

  // ── Floor ──────────────────────────────────────────────────────────────────
  // Terrazzo / polished marble — light gray with blue/gray flecks
  const floorGrad = ctx.createLinearGradient(0, vy, 0, H)
  floorGrad.addColorStop(0, '#d8d9e0')
  floorGrad.addColorStop(0.3, '#cfd0d9')
  floorGrad.addColorStop(1, '#c8c9d2')
  ctx.fillStyle = floorGrad
  ctx.fillRect(0, vy, W, H - vy)

  // Terrazzo flecks
  for (let i = 0; i < 280; i++) {
    const fx = Math.random() * W
    const fy = vy + Math.random() * (H - vy)
    const size = Math.random() * 3 + 0.5
    const gray = Math.round(140 + Math.random() * 60)
    const isBlue = Math.random() < 0.12
    ctx.fillStyle = isBlue ? `rgba(80,100,180,0.25)` : `rgba(${gray},${gray},${gray+5},0.4)`
    ctx.beginPath(); ctx.arc(fx, fy, size, 0, Math.PI*2); ctx.fill()
  }

  // Floor reflection strip (glossy)
  const reflGrad = ctx.createLinearGradient(0, vy, 0, vy + (H-vy)*0.35)
  reflGrad.addColorStop(0,'rgba(255,255,255,0.45)'); reflGrad.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle = reflGrad; ctx.fillRect(0, vy, W, (H-vy)*0.35)

  // Floor grid lines (perspective)
  ctx.strokeStyle = 'rgba(160,162,175,0.35)'; ctx.lineWidth = 0.8
  for (let i = 1; i <= 8; i++) {
    const t = i / 9
    const y = vy + (H - vy) * t
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  // Vertical convergence lines
  for (let i = 0; i <= 5; i++) {
    const x = W * (i / 5)
    ctx.beginPath(); ctx.moveTo(vx + (x-vx)*0.05, vy+2); ctx.lineTo(x, H); ctx.stroke()
  }

  // Centre aisle highlight
  const aisleGrad = ctx.createLinearGradient(0, vy, 0, H)
  aisleGrad.addColorStop(0,'rgba(200,205,225,0.5)'); aisleGrad.addColorStop(1,'rgba(190,195,215,0)')
  ctx.fillStyle = aisleGrad
  ctx.beginPath()
  ctx.moveTo(cx - 8, vy); ctx.lineTo(cx + 8, vy); ctx.lineTo(cx + W*0.22, H); ctx.lineTo(cx - W*0.22, H)
  ctx.fill()

  // ── Left wall ──────────────────────────────────────────────────────────────
  const lwGrad = ctx.createLinearGradient(0, 0, W*0.18, 0)
  lwGrad.addColorStop(0,'#b8bcc8'); lwGrad.addColorStop(1,'#d5d7e0')
  ctx.fillStyle = lwGrad
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.18, vy); ctx.lineTo(W*0.12, H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()

  // ── Right wall ─────────────────────────────────────────────────────────────
  const rwGrad = ctx.createLinearGradient(W, 0, W*0.82, 0)
  rwGrad.addColorStop(0,'#b8bcc8'); rwGrad.addColorStop(1,'#d5d7e0')
  ctx.fillStyle = rwGrad
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W*0.82, vy); ctx.lineTo(W*0.88, H); ctx.lineTo(W,H); ctx.closePath(); ctx.fill()

  // Wall trim lines
  ctx.strokeStyle = 'rgba(150,152,168,0.5)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H*0.05); ctx.lineTo(W*0.18, vy*0.12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(W, H*0.05); ctx.lineTo(W*0.82, vy*0.12); ctx.stroke()

  // ── Back wall ──────────────────────────────────────────────────────────────
  const bwGrad = ctx.createLinearGradient(0, 0, 0, vy)
  bwGrad.addColorStop(0,'#e2e3ea'); bwGrad.addColorStop(1,'#dddee6')
  ctx.fillStyle = bwGrad
  ctx.beginPath()
  ctx.moveTo(W*0.18, vy); ctx.lineTo(W*0.82, vy)
  ctx.lineTo(W*0.82, 0); ctx.lineTo(W*0.18, 0)
  ctx.closePath(); ctx.fill()

  // Back wall windows (natural light)
  const winW = W * 0.13, winH = vy * 0.48
  const winY = vy * 0.3
  ;[W*0.28, W*0.44, W*0.59, W*0.72 - winW*0.3].forEach((wx, i) => {
    if (i === 1 || i === 2) {
      // Centre windows (where door is)
      const wg = ctx.createLinearGradient(wx, winY, wx, winY+winH)
      wg.addColorStop(0,'rgba(180,210,255,0.9)'); wg.addColorStop(1,'rgba(220,235,255,0.7)')
      ctx.fillStyle = wg; ctx.fillRect(wx, winY, winW*0.5, winH*1.1)
      ctx.strokeStyle='rgba(140,160,200,0.6)'; ctx.lineWidth=1
      ctx.strokeRect(wx, winY, winW*0.5, winH*1.1)
      // Light spill
      const lg2 = ctx.createRadialGradient(wx+winW*0.25, vy, 0, wx+winW*0.25, vy, 60)
      lg2.addColorStop(0,'rgba(200,220,255,0.3)'); lg2.addColorStop(1,'transparent')
      ctx.fillStyle = lg2; ctx.fillRect(wx-20, vy-5, winW*0.5+40, 80)
    }
  })

  // Back wall floor-to-ceiling panels (architectural detail)
  for (let i = 0; i < 5; i++) {
    const px = W*0.19 + i * (W*0.63/5)
    ctx.strokeStyle='rgba(160,162,175,0.3)'; ctx.lineWidth=0.6
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, vy); ctx.stroke()
  }

  // ── School crest — centre back wall ────────────────────────────────────────
  const crestX = cx, crestY = vy * 0.5, crestR = Math.min(W, H) * 0.055
  // Shield shape
  ctx.fillStyle = '#1a3a8f'
  ctx.beginPath()
  ctx.moveTo(crestX, crestY - crestR)
  ctx.lineTo(crestX + crestR*0.85, crestY - crestR*0.6)
  ctx.lineTo(crestX + crestR*0.85, crestY + crestR*0.2)
  ctx.bezierCurveTo(crestX + crestR*0.85, crestY + crestR*0.9, crestX, crestY + crestR*1.1, crestX, crestY + crestR*1.1)
  ctx.bezierCurveTo(crestX, crestY + crestR*1.1, crestX - crestR*0.85, crestY + crestR*0.9, crestX - crestR*0.85, crestY + crestR*0.2)
  ctx.lineTo(crestX - crestR*0.85, crestY - crestR*0.6)
  ctx.closePath(); ctx.fill()
  // Crest inner
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(crestX - crestR*0.5, crestY - crestR*0.3, crestR, crestR*0.9)
  // Crest symbol
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.textAlign = 'center'; ctx.font = `bold ${crestR*0.7}px serif`
  ctx.fillText('🎓', crestX, crestY + crestR*0.35)

  // Crest shadow/frame
  ctx.strokeStyle = 'rgba(212,175,55,0.6)'; ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(crestX, crestY + crestR*0.05, crestR*1.25, 0, Math.PI*2)
  ctx.stroke()

  // ── Hanging banners ────────────────────────────────────────────────────────
  // 4 tall navy banners with "Class of 2026" hanging from ceiling
  const bannerPositions = [
    { x: W*0.26, fromTop: 0, toBottom: H*0.58 },
    { x: W*0.4,  fromTop: 0, toBottom: H*0.5 },
    { x: W*0.6,  fromTop: 0, toBottom: H*0.5 },
    { x: W*0.74, fromTop: 0, toBottom: H*0.58 },
  ]

  bannerPositions.forEach(({ x, fromTop, toBottom }) => {
    const bW = W * 0.055
    const bH = toBottom - fromTop
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    ctx.fillRect(x - bW/2 + 4, fromTop + 4, bW, bH)
    // Banner body
    const bg = ctx.createLinearGradient(x-bW/2, 0, x+bW/2, 0)
    bg.addColorStop(0,'#0f2566'); bg.addColorStop(0.4,'#1a3a8f'); bg.addColorStop(0.6,'#1a3a8f'); bg.addColorStop(1,'#0f2566')
    ctx.fillStyle = bg; ctx.fillRect(x - bW/2, fromTop, bW, bH)
    // Gold trim edges
    ctx.fillStyle = '#D4AF37'; ctx.fillRect(x-bW/2, fromTop, 3, bH)
    ctx.fillRect(x+bW/2-3, fromTop, 3, bH)
    // Top rod
    ctx.fillStyle = '#ccc'; ctx.fillRect(x-bW/2-4, fromTop, bW+8, 6)
    // Graduation cap icon
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.textAlign='center'
    ctx.font = `${bW*0.5}px serif`
    ctx.fillText('🎓', x, fromTop + bH*0.22)
    // Class of 2026 text
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${bW*0.2}px Arial, sans-serif`
    ctx.fillText('Class', x, fromTop + bH*0.42)
    ctx.fillText('of', x, fromTop + bH*0.53)
    ctx.fillText('2026', x, fromTop + bH*0.65)
    // Bottom V-notch
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.moveTo(x-bW/2, toBottom)
    ctx.lineTo(x, toBottom + bH*0.08)
    ctx.lineTo(x+bW/2, toBottom)
    ctx.fill()
    ctx.fillStyle = '#D4AF37'
    ctx.beginPath()
    ctx.moveTo(x-bW/2, toBottom)
    ctx.lineTo(x, toBottom + bH*0.08)
    ctx.lineTo(x+bW/2, toBottom)
    ctx.strokeStyle='#D4AF37'; ctx.lineWidth=2; ctx.stroke()
  })

  // ── Interactive kiosk stations ─────────────────────────────────────────────
  // Left kiosk
  const drawKiosk = (kx: number, ky: number, flip: boolean) => {
    const kW = W * 0.12, kH = H * 0.22
    const sx = flip ? kx - kW : kx
    // Base / stand
    ctx.fillStyle = '#e0e1e8'
    ctx.fillRect(sx + kW*0.35, ky + kH, kW*0.3, H*0.06)
    ctx.fillRect(sx + kW*0.2, ky + kH + H*0.055, kW*0.6, H*0.015)
    // Screen body (angled)
    ctx.fillStyle = '#f0f1f5'
    ctx.beginPath()
    ctx.moveTo(sx, ky + kH*0.2)
    ctx.lineTo(sx+kW, ky)
    ctx.lineTo(sx+kW, ky+kH)
    ctx.lineTo(sx, ky+kH)
    ctx.closePath(); ctx.fill()
    ctx.strokeStyle='rgba(100,110,150,0.3)'; ctx.lineWidth=1; ctx.stroke()
    // Screen glow
    const sg = ctx.createLinearGradient(sx, ky, sx+kW, ky+kH*0.6)
    sg.addColorStop(0,'rgba(80,120,220,0.35)'); sg.addColorStop(1,'rgba(40,80,180,0.15)')
    ctx.fillStyle=sg; ctx.fillRect(sx+8, ky+6, kW-16, kH*0.65)
    // Screen text lines
    ctx.fillStyle='rgba(255,255,255,0.9)'
    ctx.textAlign='center'; ctx.font=`bold ${kW*0.13}px Arial`
    ctx.fillText('ENTER', sx+kW/2, ky+kH*0.28)
    ctx.font=`${kW*0.1}px Arial`
    ctx.fillStyle='rgba(212,200,255,0.8)'
    ctx.fillText('Ceremony →', sx+kW/2, ky+kH*0.42)
    ctx.fillText('Graduates →', sx+kW/2, ky+kH*0.55)
    // Screen edge glow
    ctx.strokeStyle='rgba(100,140,255,0.5)'; ctx.lineWidth=1.5
    ctx.strokeRect(sx+8, ky+6, kW-16, kH*0.65)
  }

  drawKiosk(W*0.06, H*0.52, false)
  drawKiosk(W*0.88, H*0.52, true)

  // ── Wall signage ────────────────────────────────────────────────────────────
  // Left wall signs
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(W*0.01, H*0.38, W*0.07, H*0.14)
  ctx.strokeStyle='rgba(26,58,143,0.3)'; ctx.lineWidth=1
  ctx.strokeRect(W*0.01, H*0.38, W*0.07, H*0.14)
  ctx.fillStyle='#1a3a8f'; ctx.textAlign='left'; ctx.font=`bold ${W*0.008}px Arial`
  ctx.fillText('→', W*0.015, H*0.43)
  ctx.font=`${W*0.007}px Arial`; ctx.fillStyle='#333'
  ctx.fillText('Ceremony', W*0.025, H*0.43)
  ctx.fillText('→', W*0.015, H*0.46); ctx.fillText('Graduates', W*0.025, H*0.46)
  ctx.fillText('→', W*0.015, H*0.49); ctx.fillText('Photo Booth', W*0.025, H*0.49)

  // Right wall signs
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(W*0.92, H*0.38, W*0.07, H*0.14)
  ctx.strokeStyle='rgba(26,58,143,0.3)'; ctx.lineWidth=1
  ctx.strokeRect(W*0.92, H*0.38, W*0.07, H*0.14)
  ctx.fillStyle='#1a3a8f'; ctx.textAlign='left'; ctx.font=`bold ${W*0.008}px Arial`
  ctx.fillText('←', W*0.923, H*0.43)
  ctx.font=`${W*0.007}px Arial`; ctx.fillStyle='#333'
  ctx.fillText('Networking', W*0.933, H*0.43)
  ctx.fillText('←', W*0.923, H*0.46); ctx.fillText('Programme', W*0.933, H*0.46)
  ctx.fillText('←', W*0.923, H*0.49); ctx.fillText('My Avatar', W*0.933, H*0.49)

  // ── Subtle pillars ──────────────────────────────────────────────────────────
  ;[[W*0.18, vy, W*0.12, H], [W*0.82, vy, W*0.88, H]].forEach(([tx, ty, bx, by]) => {
    const pg = ctx.createLinearGradient(tx-8, 0, tx+8, 0)
    pg.addColorStop(0,'rgba(140,145,165,0.5)'); pg.addColorStop(0.5,'rgba(180,183,195,0.4)'); pg.addColorStop(1,'rgba(140,145,165,0.5)')
    ctx.fillStyle = pg
    ctx.beginPath()
    ctx.moveTo(tx-10, ty); ctx.lineTo(tx+10, ty)
    ctx.lineTo(bx+18, by); ctx.lineTo(bx-18, by)
    ctx.closePath(); ctx.fill()
    // Gold base strip
    ctx.fillStyle='rgba(212,175,55,0.35)'; ctx.fillRect(bx-18, by-6, 36, 6)
  })

  // ── Floor reflection of banners ─────────────────────────────────────────────
  bannerPositions.forEach(({ x }) => {
    const rg = ctx.createLinearGradient(0, vy, 0, vy + (H-vy)*0.3)
    rg.addColorStop(0,'rgba(26,58,143,0.12)'); rg.addColorStop(1,'transparent')
    ctx.fillStyle=rg; ctx.fillRect(x-W*0.03, vy, W*0.06, (H-vy)*0.3)
  })

  ctx.textAlign = 'left' // reset
}

// ── Return hotspot screen positions ──────────────────────────────────────────
function getLobbyHotspots(W: number, H: number) {
  const vy = H * 0.44
  return {
    auditorium: { x: W*0.5, y: vy*0.8 },
    graduates:  { x: W*0.14, y: H*0.63 },
    networking: { x: W*0.14, y: H*0.74 },
    photobooth: { x: W*0.86, y: H*0.63 },
    programme:  { x: W*0.86, y: H*0.74 },
    avatar:     { x: W*0.86, y: H*0.85 },
  }
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MetaverseLobby() {
  const router = useRouter()
  const { myName, myAvatar } = useGraduationStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [hotspots, setHotspots] = useState<Record<string, { x: number; y: number }>>({})
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number } | null>(null)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const paint = () => {
      const W = window.innerWidth, H = window.innerHeight
      c.width = W; c.height = H
      c.style.width = `${W}px`; c.style.height = `${H}px`
      const ctx = c.getContext('2d')!
      paintLobby(ctx, W, H)
      setHotspots(getLobbyHotspots(W, H))
      setReady(true)
    }
    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  const handleEnter = useCallback((room: typeof ROOMS[0]) => {
    const hs = hotspots[room.id]
    setZoomTarget(hs ?? { x: window.innerWidth/2, y: window.innerHeight/2 })
    setTimeout(() => router.push(room.href), 850)
  }, [hotspots, router])

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">

      {/* Lobby canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ zIndex: 1 }} />

      {/* Hotspot markers */}
      {ready && (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {ROOMS.map(room => {
            const hs = hotspots[room.id]
            if (!hs) return null
            const isHov = hoveredRoom === room.id
            return (
              <div key={room.id} className="absolute" style={{ left: hs.x, top: hs.y, transform: 'translate(-50%,-50%)' }}>
                {/* Pulse ring */}
                <div className="absolute rounded-full animate-ping"
                  style={{ width:52, height:52, left:-26, top:-26, background:'rgba(26,58,143,0.08)', border:'1.5px solid rgba(26,58,143,0.3)', animationDuration:'2.2s' }} />

                <button
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => handleEnter(room)}
                  className="relative flex flex-col items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    width:48, height:48,
                    background: isHov ? 'rgba(26,58,143,0.92)' : 'rgba(255,255,255,0.92)',
                    border: `2px solid ${isHov ? '#D4AF37' : 'rgba(26,58,143,0.5)'}`,
                    boxShadow: isHov
                      ? '0 0 22px rgba(26,58,143,0.5), 0 4px 16px rgba(0,0,0,0.15)'
                      : '0 2px 12px rgba(0,0,0,0.12)',
                    transform: isHov ? 'scale(1.15)' : 'scale(1)',
                  }}>
                  <span className="text-lg leading-none">{room.emoji}</span>
                </button>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHov && (
                    <motion.div
                      initial={{ opacity:0, y:8, scale:0.9 }}
                      animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:4 }}
                      className="absolute pointer-events-none"
                      style={{ bottom:58, left:'50%', transform:'translateX(-50%)', width:160, zIndex:20 }}>
                      <div className="rounded-xl px-3 py-2 text-center shadow-xl"
                        style={{ background:'#fff', border:'1.5px solid rgba(26,58,143,0.25)' }}>
                        <p className="font-bold text-xs text-gray-800">{room.label}</p>
                        <p className="text-xs text-blue-700 mt-0.5">{room.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Click to enter →</p>
                      </div>
                      <div className="mx-auto w-2 h-2 rotate-45 -mt-1 bg-white border-r border-b"
                        style={{ borderColor:'rgba(26,58,143,0.25)' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {/* Zoom transition */}
      <AnimatePresence>
        {zoomTarget && (
          <motion.div
            initial={{ opacity:0, scale:0.05 }}
            animate={{ opacity:1, scale:12 }}
            transition={{ duration:0.85, ease:[0.4,0,0.1,1] }}
            className="fixed pointer-events-none"
            style={{
              zIndex:100,
              width:80, height:80,
              borderRadius:'50%',
              background:'white',
              left: zoomTarget.x - 40,
              top: zoomTarget.y - 40,
              transformOrigin:'center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3"
        style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(26,58,143,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#1a3a8f'}}>
            <span className="text-white text-base">🏫</span>
          </div>
          <div>
            <p className="text-gray-800 font-bold text-sm leading-tight">Nextora School</p>
            <p className="text-blue-700 text-xs opacity-70">Virtual Graduation · Class of 2026</p>
          </div>
        </div>
        {myName ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{ background:'rgba(26,58,143,0.05)', borderColor:'rgba(26,58,143,0.15)' }}>
            <AvatarDisplay avatar={myAvatar} size={28} />
            <span className="text-gray-700 text-xs font-medium">{myName}</span>
          </div>
        ) : (
          <button onClick={() => router.push('/avatar')}
            className="text-xs px-4 py-2 rounded-xl font-semibold text-white"
            style={{ background:'linear-gradient(135deg,#1a3a8f,#D4AF37)' }}>
            Set up Avatar
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-4 py-2 rounded-xl text-xs text-gray-600 flex items-center gap-2 shadow"
          style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(8px)', border:'1px solid rgba(26,58,143,0.12)' }}>
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Click any glowing marker to enter a room</span>
        </div>
      </div>

      {/* Intro welcome overlay */}
      <AnimatePresence>
        {showIntro && ready && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)'}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.95,opacity:0}}
              className="text-center px-8 py-10 rounded-3xl shadow-2xl max-w-md w-full"
              style={{background:'#fff', border:'2px solid rgba(26,58,143,0.15)'}}>
              <div className="text-6xl mb-4">🎓</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome to</h1>
              <h2 className="text-xl font-bold mb-1" style={{color:'#1a3a8f'}}>Nextora School</h2>
              <p className="text-sm font-semibold mb-1" style={{color:'#D4AF37'}}>Virtual Graduation · Class of 2026</p>
              <p className="text-xs text-gray-400 mb-2">UKG → Year 1  ·  Year 6 → 7  ·  Year 9 → 10</p>
              <div className="w-16 h-0.5 mx-auto mb-5" style={{background:'rgba(212,175,55,0.5)'}} />
              {myName ? (
                <p className="text-sm text-gray-600 mb-5">Welcome back, <strong>{myName}</strong>! 🎉</p>
              ) : (
                <p className="text-sm text-gray-500 mb-5">Enter the hall and click a room to get started</p>
              )}
              <button onClick={() => setShowIntro(false)}
                className="w-full py-3 rounded-2xl font-bold text-white text-base"
                style={{background:'linear-gradient(135deg,#1a3a8f,#1e50c8)', boxShadow:'0 8px 24px rgba(26,58,143,0.35)'}}>
                Enter Hall →
              </button>
              {!myName && (
                <button onClick={() => { setShowIntro(false); router.push('/avatar') }}
                  className="mt-2 w-full py-2 text-xs text-blue-700 hover:text-blue-900">
                  Set up my avatar first
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
