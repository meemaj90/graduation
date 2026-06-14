'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'

// ── Room hotspots ────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'auditorium', label: 'Ceremony Hall',  emoji: '🎓', href: '/auditorium',  color: '#D4AF37', desc: 'Live BBB stream + stage' },
  { id: 'graduates',  label: 'Graduate Wall',  emoji: '👥', href: '/graduates',   color: '#60a5fa', desc: 'Browse all graduates' },
  { id: 'networking', label: 'Family Lounge',  emoji: '🤝', href: '/networking',  color: '#a78bfa', desc: 'Meet & celebrate' },
  { id: 'photobooth', label: 'Photo Booth',    emoji: '📸', href: '/photo-booth', color: '#f472b6', desc: 'Take your photos' },
  { id: 'programme',  label: 'Programme',      emoji: '📋', href: '/program',     color: '#34d399', desc: 'Today\'s schedule' },
  { id: 'avatar',     label: 'My Avatar',      emoji: '🧑‍🎓', href: '/avatar',     color: '#fbbf24', desc: 'Customise your look' },
]

// ── Isometric hall painter ────────────────────────────────────────────────────
// Elevated 3/4 perspective looking at the hall from upper-right — vFairs style
// Returns hotspot screen positions for each room
function paintHall(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
): Record<string, { x: number; y: number }> {

  ctx.clearRect(0, 0, W, H)

  // ── Isometric helpers ──────────────────────────────────────────────────────
  // Map 3D coords [right, up, depth] → screen [x, y]
  // We use an oblique/cabinet projection (simple but looks great)
  const OX = W * 0.18   // origin screen X (left wall bottom)
  const OY = H * 0.82   // origin screen Y (floor front)
  const RX = W * 0.62   // right axis screen X extent
  const RY = H * -0.04  // right axis screen Y (slight downward)
  const DX = W * -0.01  // depth axis X (going back)
  const DY = H * -0.42  // depth axis Y (going up)
  const UX = W * 0.00   // up axis X
  const UY = H * -0.22  // up axis Y (going up on screen)

  const p = (r: number, d: number, u: number): [number, number] => [
    OX + r * RX + d * DX + u * UX,
    OY + r * RY + d * DY + u * UY,
  ]

  const poly = (pts: [number, number][], fill: string | CanvasGradient, stroke?: string, lw = 1) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
    ctx.closePath()
    ctx.fillStyle = fill; ctx.fill()
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke() }
  }

  const line = (x0: number, y0: number, x1: number, y1: number, col: string, lw = 1) => {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke()
  }

  // Hall dimensions in "world" units
  const W3 = 1   // width (right axis, 0→1)
  const D3 = 1   // depth (depth axis, 0→1)
  const H3 = 0.7 // height (up axis)

  // Corners
  const fl = [p(0,0,0), p(1,0,0), p(1,1,0), p(0,1,0)] // floor quad

  // ── Deep space background ──────────────────────────────────────────────────
  const bg = ctx.createRadialGradient(W*0.5, H*0.35, 50, W*0.5, H*0.35, W*0.8)
  bg.addColorStop(0, '#0d0a2e'); bg.addColorStop(0.5, '#080618'); bg.addColorStop(1, '#030410')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // ── Ceiling ───────────────────────────────────────────────────────────────
  const ceil = [p(0,0,H3), p(1,0,H3), p(1,1,H3), p(0,1,H3)]
  const ceilG = ctx.createLinearGradient(...p(0,0,H3), ...p(0,1,H3))
  ceilG.addColorStop(0, '#0a0c24'); ceilG.addColorStop(1, '#070918')
  poly(ceil, ceilG)

  // Ceiling gold trim lines
  ctx.strokeStyle = 'rgba(212,175,55,0.2)'; ctx.lineWidth = 1
  for (let i = 1; i <= 3; i++) {
    const t = i / 4
    const a = p(t, 0, H3), b = p(t, 1, H3)
    line(a[0], a[1], b[0], b[1], 'rgba(212,175,55,0.15)')
    const c = p(0, t, H3), d = p(1, t, H3)
    line(c[0], c[1], d[0], d[1], 'rgba(212,175,55,0.15)')
  }

  // Ceiling light panels (coffers)
  ;[0.25, 0.5, 0.75].forEach(r => {
    ;[0.25, 0.75].forEach(d => {
      const c0 = p(r-0.08, d-0.1, H3-0.01), c1 = p(r+0.08, d-0.1, H3-0.01)
      const c2 = p(r+0.08, d+0.1, H3-0.01), c3 = p(r-0.08, d+0.1, H3-0.01)
      poly([c0,c1,c2,c3], 'rgba(255,220,100,0.08)')
      ctx.strokeStyle = 'rgba(212,175,55,0.25)'; ctx.lineWidth = 0.8
      ctx.stroke()
      // Light glow
      const [lx, ly] = p(r, d, H3)
      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 55)
      lg.addColorStop(0, 'rgba(255,220,80,0.28)'); lg.addColorStop(1, 'rgba(255,200,60,0)')
      ctx.fillStyle = lg; ctx.fillRect(lx-55, ly-30, 110, 70)
      ctx.fillStyle = 'rgba(255,248,180,0.95)'
      ctx.beginPath(); ctx.arc(lx, ly+8, 4, 0, Math.PI*2); ctx.fill()
    })
  })

  // ── Back wall ─────────────────────────────────────────────────────────────
  const bwPts = [p(0,1,0), p(1,1,0), p(1,1,H3), p(0,1,H3)]
  const bwG = ctx.createLinearGradient(...p(0,1,H3), ...p(0,1,0))
  bwG.addColorStop(0, '#060820'); bwG.addColorStop(1, '#0a0d28')
  poly(bwPts, bwG)
  // Back wall gold trim
  ctx.strokeStyle = 'rgba(212,175,55,0.4)'; ctx.lineWidth = 1.5
  const [btl] = [p(0,1,H3)]; const btr = p(1,1,H3)
  line(bwPts[0][0], bwPts[0][1], bwPts[3][0], bwPts[3][1], 'rgba(212,175,55,0.4)', 1.5)
  line(bwPts[1][0], bwPts[1][1], bwPts[2][0], bwPts[2][1], 'rgba(212,175,55,0.4)', 1.5)
  line(bwPts[2][0], bwPts[2][1], bwPts[3][0], bwPts[3][1], 'rgba(212,175,55,0.4)', 1.5)

  // ── Right wall ────────────────────────────────────────────────────────────
  const rwPts = [p(1,0,0), p(1,1,0), p(1,1,H3), p(1,0,H3)]
  const rwG = ctx.createLinearGradient(rwPts[0][0], rwPts[0][1], rwPts[1][0], rwPts[1][1])
  rwG.addColorStop(0, '#0a0d26'); rwG.addColorStop(1, '#080b20')
  poly(rwPts, rwG)
  // Right wall pilasters
  ;[0.2, 0.5, 0.8].forEach(d => {
    const pl = [p(1,d-0.03,0), p(1,d+0.03,0), p(1,d+0.03,H3*0.9), p(1,d-0.03,H3*0.9)]
    poly(pl, '#0e1232', 'rgba(212,175,55,0.3)', 0.8)
    // Sconce
    const [sx, sy] = p(1, d, H3*0.5)
    const sg = ctx.createRadialGradient(sx-10, sy, 0, sx-10, sy, 50)
    sg.addColorStop(0, 'rgba(255,200,80,0.4)'); sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg; ctx.fillRect(sx-60, sy-50, 90, 100)
    ctx.fillStyle = 'rgba(255,240,160,0.9)'
    ctx.beginPath(); ctx.arc(sx-12, sy, 3.5, 0, Math.PI*2); ctx.fill()
  })

  // ── Left wall ─────────────────────────────────────────────────────────────
  const lwPts = [p(0,0,0), p(0,1,0), p(0,1,H3), p(0,0,H3)]
  const lwG = ctx.createLinearGradient(lwPts[0][0], lwPts[0][1], lwPts[1][0], lwPts[1][1])
  lwG.addColorStop(0, '#0e1130'); lwG.addColorStop(1, '#0a0e24')
  poly(lwPts, lwG)
  // Left wall pilasters
  ;[0.2, 0.5, 0.8].forEach(d => {
    const pl = [p(0,d-0.03,0), p(0,d+0.03,0), p(0,d+0.03,H3*0.9), p(0,d-0.03,H3*0.9)]
    poly(pl, '#0e1232', 'rgba(212,175,55,0.3)', 0.8)
    const [sx, sy] = p(0, d, H3*0.5)
    const sg = ctx.createRadialGradient(sx+10, sy, 0, sx+10, sy, 50)
    sg.addColorStop(0, 'rgba(255,200,80,0.4)'); sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg; ctx.fillRect(sx-30, sy-50, 90, 100)
    ctx.fillStyle = 'rgba(255,240,160,0.9)'
    ctx.beginPath(); ctx.arc(sx+12, sy, 3.5, 0, Math.PI*2); ctx.fill()
  })

  // ── Floor ─────────────────────────────────────────────────────────────────
  const floorG = ctx.createLinearGradient(fl[0][0], fl[0][1], fl[2][0], fl[2][1])
  floorG.addColorStop(0, '#0c0e28'); floorG.addColorStop(0.5, '#0f1230'); floorG.addColorStop(1, '#090b20')
  poly(fl, floorG)

  // Floor grid
  for (let i = 1; i <= 7; i++) {
    const t = i / 8
    const a = p(t,0,0), b = p(t,1,0)
    line(a[0],a[1],b[0],b[1], `rgba(212,175,55,${i%2===0?0.1:0.06})`)
    const c = p(0,t,0), d = p(1,t,0)
    line(c[0],c[1],d[0],d[1], `rgba(212,175,55,${i%2===0?0.1:0.06})`)
  }

  // Centre carpet (from front to stage)
  const carpet = [p(0.43,0,0.01), p(0.57,0,0.01), p(0.57,1,0.01), p(0.43,1,0.01)]
  const carpG = ctx.createLinearGradient(carpet[0][0],carpet[0][1],carpet[2][0],carpet[2][1])
  carpG.addColorStop(0,'rgba(100,5,5,0.7)'); carpG.addColorStop(1,'rgba(80,3,3,0.9)')
  poly(carpet, carpG)
  // Gold carpet trim
  for (const xr of [0.43, 0.57]) {
    const a = p(xr,0,0.015), b = p(xr,1,0.015)
    line(a[0],a[1],b[0],b[1],'rgba(212,175,55,0.65)',1.5)
  }

  // ── Audience seats ────────────────────────────────────────────────────────
  const seatColors = ['#1a1050','#1e1460','#180e48','#22185a']
  const rows = 6, cols = 10
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Two blocks of seats either side of centre aisle
      for (const side of [-1, 1]) {
        if (side === -1 && col > 4) continue
        if (side === 1 && col < 5) continue
        const dr = side === -1 ? 0.06 + col * 0.08 : 0.56 + (col - 5) * 0.08
        const dd = 0.08 + row * 0.14
        if (dd > 0.95 || dr > 0.92 || dr < 0.04) continue

        const sc = seatColors[(row+col)%4]
        // Seat back
        const sb = [p(dr,dd,0.06), p(dr+0.065,dd,0.06), p(dr+0.065,dd+0.001,0.12), p(dr,dd+0.001,0.12)]
        poly(sb, sc, 'rgba(0,0,0,0.3)', 0.4)
        // Seat cushion
        const scush = [p(dr,dd,0.06), p(dr+0.065,dd,0.06), p(dr+0.065,dd+0.085,0.06), p(dr,dd+0.085,0.06)]
        poly(scush, side===-1 ? '#1a1055':'#1a1055', 'rgba(0,0,0,0.2)', 0.3)

        // Person head (graduates in gowns!)
        const [hx, hy] = p(dr+0.033, dd+0.04, 0.14)
        const headCol = `hsl(${15+(row*37+col*13)%40},38%,${45+(col%3)*9}%)`
        ctx.fillStyle = headCol
        ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI*2); ctx.fill()
        // Tiny graduation cap on some
        if ((row+col)%3===0) {
          ctx.fillStyle='#1a237e'
          ctx.fillRect(hx-4, hy-6, 8, 2)
          ctx.fillStyle='rgba(212,175,55,0.9)'
          ctx.beginPath(); ctx.arc(hx, hy-5, 2, 0, Math.PI*2); ctx.fill()
        }
      }
    }
  }

  // ── Stage ─────────────────────────────────────────────────────────────────
  // Stage platform (raised)
  const stageFloor = [p(0.1,0.88,0.04), p(0.9,0.88,0.04), p(0.9,1.0,0.04), p(0.1,1.0,0.04)]
  const stgG = ctx.createLinearGradient(stageFloor[0][0], stageFloor[0][1], stageFloor[2][0], stageFloor[2][1])
  stgG.addColorStop(0,'#0e1535'); stgG.addColorStop(1,'#0a1028')
  poly(stageFloor, stgG)
  // Stage front edge gold
  const stageFront = [p(0.1,0.88,0), p(0.9,0.88,0), p(0.9,0.88,0.04), p(0.1,0.88,0.04)]
  poly(stageFront, '#1a1c35', 'rgba(212,175,55,0.8)', 1)
  const [sfl0x,sfl0y] = p(0.1,0.88,0.04), [sfl1x,sfl1y] = p(0.9,0.88,0.04)
  line(sfl0x,sfl0y,sfl1x,sfl1y,'rgba(212,175,55,0.9)',2)

  // Stage spotlight glow on floor
  const [spx, spy] = p(0.5, 0.97, 0.045)
  const spg = ctx.createRadialGradient(spx, spy, 0, spx, spy, 90)
  spg.addColorStop(0,'rgba(255,240,160,0.35)'); spg.addColorStop(0.4,'rgba(255,200,80,0.1)'); spg.addColorStop(1,'transparent')
  ctx.fillStyle = spg; ctx.fillRect(spx-90, spy-40, 180, 80)

  // Podium
  const pod = [p(0.48,0.94,0.04), p(0.52,0.94,0.04), p(0.52,0.98,0.04), p(0.48,0.98,0.04)]
  poly(pod, '#0a0c22', 'rgba(212,175,55,0.7)', 1)
  const podTop = [p(0.48,0.94,0.1), p(0.52,0.94,0.1), p(0.52,0.98,0.1), p(0.48,0.98,0.1)]
  poly(podTop, '#D4AF37', undefined)
  const podFront = [p(0.48,0.94,0.04), p(0.52,0.94,0.04), p(0.52,0.94,0.1), p(0.48,0.94,0.1)]
  const pfG = ctx.createLinearGradient(podFront[0][0],podFront[0][1],podFront[2][0],podFront[2][1])
  pfG.addColorStop(0,'rgba(10,10,35,0.9)'); pfG.addColorStop(1,'rgba(212,175,55,0.3)')
  poly(podFront, pfG, 'rgba(212,175,55,0.6)', 0.8)

  // Big screen on back wall
  const scrL = 0.18, scrR = 0.82, scrB = 0.12, scrT = 0.58
  const scr = [p(scrL,1,scrB), p(scrR,1,scrB), p(scrR,1,scrT), p(scrL,1,scrT)]
  // Screen dark fill + glow
  poly(scr, '#000814', 'rgba(212,175,55,0.6)', 1.5)
  const [scrCx, scrCy] = p(0.5, 1, (scrB+scrT)/2)
  const scrGlow = ctx.createRadialGradient(scrCx, scrCy-10, 10, scrCx, scrCy-10, 80)
  scrGlow.addColorStop(0,'rgba(40,80,220,0.25)'); scrGlow.addColorStop(1,'transparent')
  ctx.fillStyle = scrGlow; ctx.fillRect(scrCx-80, scrCy-70, 160, 100)

  // Screen content preview (blue gradient to simulate video)
  const scrGrad = ctx.createLinearGradient(scr[0][0], scr[0][1], scr[2][0], scr[2][1])
  scrGrad.addColorStop(0,'rgba(10,20,80,0.9)'); scrGrad.addColorStop(0.5,'rgba(5,12,50,0.95)'); scrGrad.addColorStop(1,'rgba(2,8,30,0.9)')
  poly(scr, scrGrad)

  // Screen label
  ctx.save(); ctx.textAlign='center'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = `bold ${Math.round(W*0.012)}px Georgia, serif`
  ctx.fillText('🎓 LIVE CEREMONY', scrCx, scrCy - 6)
  ctx.font = `${Math.round(W*0.008)}px Georgia, serif`
  ctx.fillStyle = 'rgba(212,175,55,0.5)'
  ctx.fillText('Nextora School · Class of 2026', scrCx, scrCy + 10)
  ctx.restore()

  // Curtains on back wall
  for (const side of [
    { x0: 0.04, x1: scrL - 0.01 },
    { x0: scrR + 0.01, x1: 0.96 },
  ]) {
    const folds = 6
    for (let i = 0; i < folds; i++) {
      const t = i / (folds-1)
      const xr = side.x0 + (side.x1 - side.x0) * t
      const b = 0.28 + (i%2)*0.15
      const cpts = [p(xr,1,scrB-0.02), p(xr+0.02,1,scrB-0.02), p(xr+0.02,1,H3), p(xr,1,H3)]
      poly(cpts, `rgb(${Math.round(b*105)},${Math.round(b*5)},${Math.round(b*5)})`)
    }
  }
  // Valance
  const val = [p(0.04,1,H3*0.82), p(0.96,1,H3*0.82), p(0.96,1,H3), p(0.04,1,H3)]
  poly(val, '#5a0a0a', 'rgba(212,175,55,0.6)', 1)
  const [vtx, vty] = p(0.04,1,H3*0.82), [vbx, vby] = p(0.96,1,H3*0.82)
  line(vtx,vty,vbx,vby,'rgba(212,175,55,0.7)',1.5)

  // Stage spotlights (from ceiling)
  ;[[0.35,0.6],[0.5,0.6],[0.65,0.6]].forEach(([r,d]) => {
    const [sx,sy] = p(r,1,H3*0.95), [tx,ty] = p(r,0.95,0.08)
    const bg2 = ctx.createLinearGradient(sx,sy,tx,ty)
    bg2.addColorStop(0,'rgba(255,240,180,0.22)'); bg2.addColorStop(1,'rgba(255,240,180,0)')
    ctx.fillStyle = bg2
    ctx.beginPath(); ctx.moveTo(sx-4,sy); ctx.lineTo(sx+4,sy); ctx.lineTo(tx+18,ty); ctx.lineTo(tx-18,ty); ctx.closePath(); ctx.fill()
  })

  // ── Banners hanging on left wall ──────────────────────────────────────────
  ;[0.25, 0.55, 0.8].forEach((d, i) => {
    const bp = [p(0.02,d,H3*0.3), p(0.02,d+0.12,H3*0.3), p(0.02,d+0.12,H3*0.75), p(0.02,d,H3*0.75)]
    const bannerG = ctx.createLinearGradient(bp[0][0],bp[0][1],bp[2][0],bp[2][1])
    bannerG.addColorStop(0,'#1a0a2e'); bannerG.addColorStop(1,'#120820')
    poly(bp, bannerG, 'rgba(212,175,55,0.5)', 0.8)
    const [bcx,bcy] = p(0.02, d+0.06, H3*0.52)
    ctx.fillStyle='rgba(212,175,55,0.7)'; ctx.textAlign='center'
    ctx.font=`bold ${Math.round(W*0.007)}px Georgia, serif`
    ctx.save(); ctx.fillText(['2026','🎓','K-12'][i], bcx, bcy); ctx.restore()
  })

  // ── Floating confetti ────────────────────────────────────────────────────
  // Pre-baked confetti so it looks alive
  const confettiColors = ['#D4AF37','#7c3aed','#ec4899','#60a5fa','#34d399','#f97316']
  for (let i = 0; i < 60; i++) {
    const r = 0.1 + (i * 0.137) % 0.85
    const d = 0.05 + (i * 0.211) % 0.9
    const u = 0.1 + (i * 0.317) % (H3 * 0.85)
    const [cx2, cy2] = p(r, d, u)
    if (cx2 < 0 || cx2 > W || cy2 < 0 || cy2 > H) continue
    ctx.fillStyle = confettiColors[i % confettiColors.length]
    ctx.globalAlpha = 0.45 + (i%3)*0.15
    const size = 2 + (i%3)
    ctx.save()
    ctx.translate(cx2, cy2)
    ctx.rotate(i * 0.8)
    ctx.fillRect(-size/2, -size/2, size, size*0.5)
    ctx.restore()
    ctx.globalAlpha = 1
  }

  // ── Compute and return hotspot screen positions ───────────────────────────
  return {
    auditorium: { x: p(0.5, 1, 0.35)[0],  y: p(0.5, 1, 0.35)[1] },
    graduates:  { x: p(0.0, 0.85, 0.3)[0], y: p(0.0, 0.85, 0.3)[1] },
    networking: { x: p(0.0, 0.4, 0.25)[0], y: p(0.0, 0.4, 0.25)[1] },
    photobooth: { x: p(1.0, 0.4, 0.25)[0], y: p(1.0, 0.4, 0.25)[1] },
    programme:  { x: p(1.0, 0.85, 0.3)[0], y: p(1.0, 0.85, 0.3)[1] },
    avatar:     { x: p(0.5, 0.08, 0.08)[0], y: p(0.5, 0.08, 0.08)[1] },
  }
}

// ── Animated confetti canvas ─────────────────────────────────────────────────
function ConfettiLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    c.width = window.innerWidth; c.height = window.innerHeight
    c.style.width=`${c.width}px`; c.style.height=`${c.height}px`
    const pieces = Array.from({length:80},(_,i)=>({
      x: Math.random()*c.width, y: Math.random()*c.height,
      vx: (Math.random()-0.5)*0.5, vy: Math.random()*0.4+0.1,
      rot: Math.random()*Math.PI*2, rotV: (Math.random()-0.5)*0.04,
      w: 5+Math.random()*6, h: 3+Math.random()*4,
      col: ['#D4AF37','#7c3aed','#ec4899','#60a5fa','#34d399'][i%5],
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height)
      pieces.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotV
        if(p.y>c.height) p.y=-10
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot)
        ctx.fillStyle=p.col; ctx.globalAlpha=0.5
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h)
        ctx.restore()
      })
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(raf)
  },[])
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{zIndex:4}} />
}

// ── Main MetaverseLobby ──────────────────────────────────────────────────────
export default function MetaverseLobby() {
  const router = useRouter()
  const { myName, myAvatar } = useGraduationStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hotspots, setHotspots] = useState<Record<string,(typeof ROOMS[0])&{x:number;y:number}>>({})
  const [hoveredRoom, setHoveredRoom] = useState<string|null>(null)
  const [zoomTarget, setZoomTarget] = useState<{x:number;y:number;href:string}|null>(null)

  // Paint hall and compute hotspot positions
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const paint = () => {
      const W = window.innerWidth, H = window.innerHeight
      c.width = W; c.height = H
      c.style.width=`${W}px`; c.style.height=`${H}px`
      const ctx = c.getContext('2d')!
      const positions = paintHall(ctx, W, H)
      const hs: Record<string,(typeof ROOMS[0])&{x:number;y:number}> = {}
      ROOMS.forEach(r => { hs[r.id] = { ...r, x: positions[r.id]?.x??0, y: positions[r.id]?.y??0 } })
      setHotspots(hs)
    }
    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  const handleEnter = useCallback((room: typeof ROOMS[0], x: number, y: number) => {
    setZoomTarget({ x, y, href: room.href })
    setTimeout(() => router.push(room.href), 900)
  }, [router])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{background:'#02020c'}}>

      {/* Layer 1: Isometric hall canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{zIndex:1}} />

      {/* Layer 2: Animated confetti */}
      <ConfettiLayer />

      {/* Layer 3: Hotspot markers */}
      <div className="absolute inset-0" style={{zIndex:10}}>
        {Object.values(hotspots).map(room => {
          const isHovered = hoveredRoom === room.id
          return (
            <div key={room.id}
              className="absolute"
              style={{ left: room.x, top: room.y, transform: 'translate(-50%,-50%)' }}>

              {/* Pulsing outer ring */}
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{
                  width: 56, height: 56,
                  left: -28, top: -28,
                  background: `${room.color}22`,
                  border: `1px solid ${room.color}55`,
                  animationDuration: '2s',
                }} />

              {/* Main button */}
              <button
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                onClick={() => handleEnter(room, room.x, room.y)}
                className="relative flex flex-col items-center justify-center rounded-full cursor-pointer transition-all duration-200"
                style={{
                  width: 52, height: 52,
                  background: isHovered ? `${room.color}30` : 'rgba(5,5,20,0.75)',
                  border: `2px solid ${room.color}${isHovered ? 'cc':'70'}`,
                  backdropFilter: 'blur(8px)',
                  boxShadow: isHovered ? `0 0 24px ${room.color}60, 0 0 8px ${room.color}40` : `0 0 10px ${room.color}25`,
                  transform: isHovered ? 'scale(1.18)' : 'scale(1)',
                }}>
                <span className="text-xl leading-none">{room.emoji}</span>
              </button>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity:0, y:6, scale:0.92 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:4, scale:0.92 }}
                    className="absolute pointer-events-none"
                    style={{ bottom: 58, left: '50%', transform: 'translateX(-50%)', width: 150, zIndex: 20 }}>
                    <div className="rounded-xl px-3 py-2 text-center"
                      style={{ background:'rgba(3,4,16,0.92)', border:`1px solid ${room.color}50`, backdropFilter:'blur(12px)' }}>
                      <p className="text-white font-bold text-xs">{room.label}</p>
                      <p className="text-xs mt-0.5" style={{color: room.color, opacity:0.8}}>{room.desc}</p>
                      <p className="text-white/30 text-xs mt-0.5">Click to enter →</p>
                    </div>
                    {/* Arrow */}
                    <div className="mx-auto w-2 h-2 rotate-45 -mt-1"
                      style={{background:'rgba(3,4,16,0.92)', border:`1px solid ${room.color}50`}} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Layer 4: Zoom-into-room transition */}
      <AnimatePresence>
        {zoomTarget && (
          <motion.div
            initial={{ opacity:0, scale:0.1, x: zoomTarget.x - window.innerWidth/2, y: zoomTarget.y - window.innerHeight/2 }}
            animate={{ opacity:1, scale:8, x: 0, y: 0 }}
            transition={{ duration:0.85, ease:[0.4,0,0.2,1] }}
            className="fixed inset-0 bg-black z-50 pointer-events-none origin-center"
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3"
        style={{background:'rgba(2,2,12,0.6)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <div className="flex items-center gap-3">
          <span className="text-lg">🏫</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Nextora School</p>
            <p className="text-white/35 text-xs">Virtual Graduation · Class of 2026</p>
          </div>
        </div>
        {myName ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)'}}>
            <AvatarDisplay avatar={myAvatar} size={28} />
            <span className="text-white/70 text-xs font-medium">{myName}</span>
          </div>
        ) : (
          <button onClick={() => router.push('/avatar')}
            className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
            style={{background:'linear-gradient(135deg,#7c3aed,#D4AF37)'}}>
            Create Avatar
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-4 py-2 rounded-xl text-xs text-white/35 flex items-center gap-2"
          style={{background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.05)'}}>
          <span className="animate-pulse">●</span>
          <span>Click any glowing marker to enter that room</span>
        </div>
      </div>
    </div>
  )
}
