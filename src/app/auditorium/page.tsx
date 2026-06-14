'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageSquare, Send, Radio, X } from 'lucide-react'
import Link from 'next/link'
import { useGraduationStore } from '../../store/useGraduationStore'

interface ChatMessage {
  id: string
  author: string
  text: string
  time: string
}

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', author: 'Sarah (Mum)', text: 'So proud of you sweetheart! 🎓❤️', time: '10:02' },
  { id: '2', author: 'Mr Hassan', text: 'Congratulations to all our graduates!', time: '10:04' },
  { id: '3', author: 'James family', text: 'Go James!! We love you!! 👏👏', time: '10:06' },
  { id: '4', author: 'Year 6 Parent', text: 'All grown up — so fast! 😭🎉', time: '10:07' },
  { id: '5', author: 'Principal', text: 'Welcome to the next chapter, Year 9!', time: '10:08' },
  { id: '6', author: 'Alumni', text: 'Class of 2026! One of us! 🙌', time: '10:09' },
]

// ── Isometric auditorium painter — matches the purple/gold illustrated reference ──
function paintIsometricAuditorium(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
): { scrX: number; scrY: number; scrW: number; scrH: number } {

  ctx.clearRect(0, 0, W, H)

  // ── BACKGROUND GRADIENT (purple ceiling/walls) ──────────────────────────
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#2a0a4a')
  bg.addColorStop(0.45, '#3d1260')
  bg.addColorStop(0.7, '#4a1878')
  bg.addColorStop(1, '#1a0a2e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // ── CEILING decorative coffers ──────────────────────────────────────────
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 3; r++) {
      const cx = W * 0.08 + c * W * 0.14
      const cy = H * 0.03 + r * H * 0.07
      ctx.strokeStyle = `rgba(212,175,55,${0.18 - r * 0.04})`
      ctx.lineWidth = 1
      ctx.strokeRect(cx, cy, W * 0.12, H * 0.055)
    }
  }

  // Ceiling spotlights
  const spotXs = [W * 0.22, W * 0.38, W * 0.55, W * 0.7, W * 0.82]
  spotXs.forEach(sx => {
    const sg = ctx.createRadialGradient(sx, H * 0.04, 0, sx, H * 0.04, 60)
    sg.addColorStop(0, 'rgba(255,230,120,0.55)')
    sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.arc(sx, H * 0.04, 60, 0, Math.PI * 2)
    ctx.fill()
    // Pendant housing
    ctx.fillStyle = '#1a0a2e'
    ctx.beginPath()
    ctx.arc(sx, H * 0.04, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,240,150,0.95)'
    ctx.beginPath()
    ctx.arc(sx, H * 0.04, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  // ── LEFT WALL (purple with gold trim) ──────────────────────────────────
  const wallLG = ctx.createLinearGradient(0, 0, W * 0.18, 0)
  wallLG.addColorStop(0, '#1a0535')
  wallLG.addColorStop(1, '#3d1260')
  ctx.fillStyle = wallLG
  ctx.beginPath()
  ctx.moveTo(0, 0); ctx.lineTo(W * 0.18, 0)
  ctx.lineTo(W * 0.18, H * 0.78); ctx.lineTo(0, H)
  ctx.closePath(); ctx.fill()

  // Wall panels (left)
  for (let p = 0; p < 4; p++) {
    const py = H * 0.07 + p * H * 0.17
    ctx.strokeStyle = 'rgba(212,175,55,0.35)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(W * 0.02, py, W * 0.12, H * 0.13)
    // Inner panel highlight
    ctx.strokeStyle = 'rgba(212,175,55,0.15)'
    ctx.lineWidth = 0.8
    ctx.strokeRect(W * 0.03, py + H * 0.01, W * 0.10, H * 0.11)
  }

  // ── RIGHT WALL ─────────────────────────────────────────────────────────
  const wallRG = ctx.createLinearGradient(W, 0, W * 0.82, 0)
  wallRG.addColorStop(0, '#1a0535')
  wallRG.addColorStop(1, '#3d1260')
  ctx.fillStyle = wallRG
  ctx.beginPath()
  ctx.moveTo(W, 0); ctx.lineTo(W * 0.82, 0)
  ctx.lineTo(W * 0.82, H * 0.78); ctx.lineTo(W, H)
  ctx.closePath(); ctx.fill()

  // Wall panels (right)
  for (let p = 0; p < 4; p++) {
    const py = H * 0.07 + p * H * 0.17
    ctx.strokeStyle = 'rgba(212,175,55,0.35)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(W * 0.86, py, W * 0.12, H * 0.13)
    ctx.strokeStyle = 'rgba(212,175,55,0.15)'
    ctx.lineWidth = 0.8
    ctx.strokeRect(W * 0.87, py + H * 0.01, W * 0.10, H * 0.11)
  }

  // Gold pilasters
  ;[W * 0.18, W * 0.82].forEach((px, idx) => {
    const pg = ctx.createLinearGradient(px - 6, 0, px + 6, 0)
    pg.addColorStop(0, 'rgba(212,175,55,0.15)')
    pg.addColorStop(0.5, 'rgba(212,175,55,0.65)')
    pg.addColorStop(1, 'rgba(212,175,55,0.15)')
    ctx.fillStyle = pg
    ctx.fillRect(px - 6, 0, 12, H * 0.82)
  })

  // ── STAGE PLATFORM ─────────────────────────────────────────────────────
  const stageTop = H * 0.24
  const stageBot = H * 0.72
  const stageL = W * 0.18
  const stageR = W * 0.82

  // Stage floor (purple/dark)
  const sflG = ctx.createLinearGradient(0, stageTop, 0, stageBot)
  sflG.addColorStop(0, '#1e0940')
  sflG.addColorStop(1, '#160630')
  ctx.fillStyle = sflG
  ctx.fillRect(stageL, stageTop, stageR - stageL, stageBot - stageTop)

  // Stage carpet (deep red/maroon strip at bottom of stage)
  const carpG = ctx.createLinearGradient(0, stageBot - H * 0.06, 0, stageBot)
  carpG.addColorStop(0, '#5a0a14')
  carpG.addColorStop(1, '#3d0009')
  ctx.fillStyle = carpG
  ctx.fillRect(stageL, stageBot - H * 0.06, stageR - stageL, H * 0.06)

  // Gold stage border top
  ctx.fillStyle = 'rgba(212,175,55,0.9)'
  ctx.fillRect(stageL, stageTop - 2, stageR - stageL, 3)

  // ── RED VELVET CURTAINS ─────────────────────────────────────────────────
  const curtW = W * 0.085
  const curtainDraw = (x0: number, x1: number) => {
    const folds = 10
    for (let i = 0; i < folds; i++) {
      const t = i / (folds - 1)
      const brightness = 0.25 + (Math.sin(t * Math.PI * folds) * 0.5 + 0.5) * 0.35
      ctx.fillStyle = `rgb(${Math.round(brightness * 160)},${Math.round(brightness * 8)},${Math.round(brightness * 8)})`
      ctx.fillRect(x0 + (x1 - x0) * t, stageTop, (x1 - x0) / folds + 1, stageBot - stageTop - H * 0.06)
    }
    // Gold fringe along bottom
    ctx.fillStyle = 'rgba(212,175,55,0.7)'
    ctx.fillRect(x0, stageBot - H * 0.065, x1 - x0, 4)
    // Gold tassel rope
    ctx.strokeStyle = 'rgba(212,175,55,0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo((x0 + x1) / 2, stageTop + H * 0.1)
    ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.8, stageTop + H * 0.18, (x0 + x1) / 2, stageTop + H * 0.22)
    ctx.stroke()
  }
  curtainDraw(stageL, stageL + curtW)
  curtainDraw(stageR - curtW, stageR)

  // Valance (ornate top border over curtains)
  const valG = ctx.createLinearGradient(0, stageTop - 10, 0, stageTop + 30)
  valG.addColorStop(0, '#6b0000')
  valG.addColorStop(1, '#3d0000')
  ctx.fillStyle = valG
  ctx.fillRect(stageL, stageTop - 10, stageR - stageL, 36)
  ctx.strokeStyle = 'rgba(212,175,55,0.8)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(stageL + 2, stageTop - 8, stageR - stageL - 4, 32)
  // Scallop edge
  const scX = stageL + curtW; const scW = stageR - stageL - curtW * 2
  for (let s = 0; s < 8; s++) {
    const sx = scX + s * scW / 8
    ctx.fillStyle = '#5a0000'
    ctx.beginPath()
    ctx.arc(sx + scW / 16, stageTop + 22, scW / 17, 0, Math.PI)
    ctx.fill()
  }

  // ── BIG SCREEN (where BBB iframe goes) ─────────────────────────────────
  const scrX = stageL + curtW + 4
  const scrW = stageR - stageL - curtW * 2 - 8
  const scrY = stageTop + 26
  const scrH = stageBot - H * 0.065 - scrY - 4

  // Outer bezel
  ctx.fillStyle = '#0d0416'
  ctx.fillRect(scrX - 10, scrY - 6, scrW + 20, scrH + 16)
  ctx.strokeStyle = 'rgba(212,175,55,0.8)'
  ctx.lineWidth = 2.5
  ctx.strokeRect(scrX - 8, scrY - 4, scrW + 16, scrH + 12)
  // Screen background (blue-tinted, will sit under iframe)
  const scrBg = ctx.createLinearGradient(scrX, scrY, scrX, scrY + scrH)
  scrBg.addColorStop(0, '#0a1040')
  scrBg.addColorStop(1, '#060820')
  ctx.fillStyle = scrBg
  ctx.fillRect(scrX, scrY, scrW, scrH)

  // Screen text (visible when no BBB — drawn but iframe covers it)
  ctx.fillStyle = 'rgba(212,175,55,0.9)'
  ctx.font = `bold ${Math.round(scrH * 0.12)}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.fillText('CLASS OF 2026', scrX + scrW / 2, scrY + scrH * 0.38)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `${Math.round(scrH * 0.07)}px Georgia, serif`
  ctx.fillText('GRADUATION · CONGRATULATIONS!', scrX + scrW / 2, scrY + scrH * 0.54)
  ctx.fillStyle = 'rgba(212,175,55,0.5)'
  ctx.font = `${Math.round(scrH * 0.055)}px sans-serif`
  ctx.fillText('UKG → Year 1  ·  Year 6 → Year 7  ·  Year 9 → Year 10', scrX + scrW / 2, scrY + scrH * 0.68)
  ctx.textAlign = 'left'

  // Screen glow spilling onto stage
  const sGlow = ctx.createRadialGradient(scrX + scrW / 2, scrY + scrH, 0, scrX + scrW / 2, scrY + scrH, scrW * 0.6)
  sGlow.addColorStop(0, 'rgba(80,100,220,0.3)')
  sGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = sGlow
  ctx.fillRect(scrX - scrW * 0.2, scrY + scrH, scrW * 1.4, H * 0.1)

  // ── PODIUM (stage left) ─────────────────────────────────────────────────
  const podX = stageL + curtW + scrW * 0.06
  const podY = stageBot - H * 0.17
  const podW = scrW * 0.09, podH = H * 0.1
  const podG = ctx.createLinearGradient(podX, podY, podX + podW, podY)
  podG.addColorStop(0, '#1e0940'); podG.addColorStop(0.5, '#2e1258'); podG.addColorStop(1, '#1e0940')
  ctx.fillStyle = podG
  ctx.fillRect(podX, podY, podW, podH)
  ctx.strokeStyle = 'rgba(212,175,55,0.6)'; ctx.lineWidth = 1.5
  ctx.strokeRect(podX, podY, podW, podH)
  // Podium top surface
  ctx.fillStyle = 'rgba(212,175,55,0.15)'
  ctx.fillRect(podX - 4, podY, podW + 8, 6)
  // Microphone
  ctx.fillStyle = '#aaa'
  ctx.fillRect(podX + podW / 2 - 1, podY - H * 0.035, 2, H * 0.035)
  ctx.fillStyle = '#888'
  ctx.beginPath()
  ctx.arc(podX + podW / 2, podY - H * 0.037, 5, 0, Math.PI * 2)
  ctx.fill()

  // ── AUDIENCE SEATS FLOOR ───────────────────────────────────────────────
  // Floor perspective trapezoid (terrazzo/carpet)
  const floorG = ctx.createLinearGradient(0, stageBot, 0, H)
  floorG.addColorStop(0, '#150830')
  floorG.addColorStop(1, '#0d0520')
  ctx.fillStyle = floorG
  ctx.beginPath()
  ctx.moveTo(0, stageBot); ctx.lineTo(W, stageBot)
  ctx.lineTo(W, H); ctx.lineTo(0, H)
  ctx.closePath(); ctx.fill()

  // Floor grid (perspective lines)
  ctx.strokeStyle = 'rgba(212,175,55,0.08)'; ctx.lineWidth = 0.8
  for (let r = 0; r < 8; r++) {
    const y = stageBot + r * (H - stageBot) / 7
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // ── AUDIENCE SEAT ROWS (isometric view — drawn directly onto background) ──
  const rowCount = 8
  const seatCols = 22
  const rowHeight = (H - stageBot - H * 0.04) / rowCount

  for (let row = 0; row < rowCount; row++) {
    const rowProgress = row / (rowCount - 1)
    // Perspective: rows get wider and taller toward bottom
    const rowY = stageBot + H * 0.02 + row * rowHeight
    const rowScale = 0.65 + rowProgress * 0.5
    const seatW = W * 0.033 * rowScale
    const seatH = H * 0.055 * rowScale
    const totalRowW = seatCols * seatW * 1.05
    const rowStartX = (W - totalRowW) / 2

    for (let col = 0; col < seatCols; col++) {
      const seatX = rowStartX + col * seatW * 1.06
      const seatCenterX = seatX + seatW / 2

      // SEAT BACK (blue/navy gradient)
      const seatG = ctx.createLinearGradient(seatX, rowY, seatX + seatW, rowY + seatH * 0.65)
      seatG.addColorStop(0, '#1a3a6e')
      seatG.addColorStop(0.4, '#1e4080')
      seatG.addColorStop(1, '#122a52')
      ctx.fillStyle = seatG
      ctx.beginPath()
      const rx = seatW * 0.18
      ctx.roundRect(seatX + 1, rowY + seatH * 0.3, seatW - 2, seatH * 0.65, [rx, rx, 2, 2])
      ctx.fill()
      // Seat highlight
      ctx.fillStyle = 'rgba(100,160,255,0.12)'
      ctx.fillRect(seatX + 2, rowY + seatH * 0.3, seatW - 4, seatH * 0.18)

      // SEAT BOTTOM (darker blue)
      ctx.fillStyle = '#0f2040'
      ctx.fillRect(seatX + 1, rowY + seatH * 0.92, seatW - 2, seatH * 0.12)

      // GOWN (navy/dark blue) — graduate silhouette
      const gownH = seatH * 1.05
      const gownW = seatW * 0.72
      const gownX = seatCenterX - gownW / 2
      const gownY = rowY - gownH * 0.75

      // Body
      const gownG = ctx.createLinearGradient(gownX, gownY, gownX + gownW, gownY + gownH)
      gownG.addColorStop(0, '#1a237e')
      gownG.addColorStop(0.5, '#1e28a0')
      gownG.addColorStop(1, '#111660')
      ctx.fillStyle = gownG
      ctx.beginPath()
      ctx.roundRect(gownX, gownY + gownH * 0.3, gownW, gownH * 0.7, [gownW * 0.12, gownW * 0.12, 0, 0])
      ctx.fill()

      // Head (skin tone — varied)
      const skinTones = ['#FDBCB4', '#F5CBA7', '#C68642', '#8D5524', '#4a2c17']
      const skinIdx = (row * 7 + col * 3) % skinTones.length
      ctx.fillStyle = skinTones[skinIdx]
      ctx.beginPath()
      ctx.arc(seatCenterX, gownY + gownH * 0.25, gownW * 0.27, 0, Math.PI * 2)
      ctx.fill()

      // Graduation cap (flat top)
      const capY = gownY + gownH * 0.04
      // Cap base
      ctx.fillStyle = '#0d1550'
      ctx.fillRect(seatCenterX - gownW * 0.32, capY + gownH * 0.06, gownW * 0.64, gownH * 0.07)
      // Cap board (square mortarboard top)
      ctx.fillStyle = '#1a237e'
      ctx.fillRect(seatCenterX - gownW * 0.38, capY, gownW * 0.76, gownH * 0.07)
      // Gold tassel
      ctx.strokeStyle = 'rgba(212,175,55,0.85)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(seatCenterX + gownW * 0.2, capY)
      ctx.lineTo(seatCenterX + gownW * 0.2, capY + gownH * 0.18)
      ctx.stroke()
      ctx.fillStyle = 'rgba(212,175,55,0.85)'
      ctx.beginPath()
      ctx.arc(seatCenterX + gownW * 0.2, capY + gownH * 0.19, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ── AISLE PATHS ───────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(21,8,48,0.6)'
  ctx.fillRect(W * 0.47, stageBot, W * 0.06, H - stageBot)

  // ── STAGE FLOOR SPOTLIGHTS (beams from ceiling) ────────────────────────
  ;[W * 0.3, W * 0.5, W * 0.7].forEach(sx => {
    const beamG = ctx.createLinearGradient(sx, H * 0.02, sx, stageBot)
    beamG.addColorStop(0, 'rgba(255,240,180,0.15)')
    beamG.addColorStop(1, 'rgba(255,240,180,0.02)')
    ctx.fillStyle = beamG
    ctx.beginPath()
    ctx.moveTo(sx - 4, H * 0.02)
    ctx.lineTo(sx + 4, H * 0.02)
    ctx.lineTo(sx + 40, stageBot)
    ctx.lineTo(sx - 40, stageBot)
    ctx.closePath()
    ctx.fill()
  })

  // ── VIGNETTE ──────────────────────────────────────────────────────────
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.8)
  vg.addColorStop(0, 'transparent')
  vg.addColorStop(0.7, 'transparent')
  vg.addColorStop(1, 'rgba(5,0,15,0.7)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  return { scrX, scrY, scrW, scrH }
}

function useAuditoriumBg() {
  const [bgUrl, setBgUrl] = useState('')
  const [screenRect, setScreenRect] = useState({ scrX: 0, scrY: 0, scrW: 0, scrH: 0 })

  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = paintIsometricAuditorium(ctx, w, h)
    setScreenRect(rect)
    setBgUrl(canvas.toDataURL('image/jpeg', 0.94))
  }, [])

  return { bgUrl, screenRect }
}

export default function AuditoriumPage() {
  const { bbbJoinUrl, ceremonyStatus, attendeeCount, myName, setMyName, reactions, addReaction } =
    useGraduationStore()
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const [nameInput, setNameInput] = useState(myName || '')
  const [showNamePrompt, setShowNamePrompt] = useState(!myName)
  const chatRef = useRef<HTMLDivElement>(null)

  const { bgUrl, screenRect } = useAuditoriumBg()
  const joinUrl = bbbJoinUrl || process.env.NEXT_PUBLIC_BBB_JOIN_URL || ''

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        author: myName || 'Guest',
        text: input.trim(),
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setInput('')
  }

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#150830' }}>

      {/* Auditorium background */}
      {bgUrl && (
        <div className="absolute inset-0"
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}

      {/* BBB iframe — positioned exactly over the painted screen */}
      {screenRect.scrW > 0 && (
        <div className="absolute" style={{
          left: screenRect.scrX,
          top: screenRect.scrY,
          width: screenRect.scrW,
          height: screenRect.scrH,
          zIndex: 5,
        }}>
          {joinUrl ? (
            <iframe
              src={joinUrl}
              className="w-full h-full"
              allow="camera; microphone; display-capture; autoplay"
              style={{ border: 'none', background: '#000' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0a1040,#060820)' }}>
              <div className="text-center">
                <div className="text-5xl mb-3">🎓</div>
                <p className="text-white font-bold text-xl mb-1">CLASS OF 2026</p>
                <p className="text-white/50 text-sm mb-3">GRADUATION · CONGRATULATIONS!</p>
                <div className="px-4 py-2 rounded-xl mx-auto w-fit"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)' }}>
                  <p className="text-xs" style={{ color: '#D4AF37' }}>
                    UKG → Year 1 · Year 6 → Year 7 · Year 9 → Year 10
                  </p>
                </div>
                <p className="text-white/30 text-xs mt-4">Live stream will appear here</p>
                <div className="mt-3 flex gap-2 justify-center">
                  {['🏫', '🎓', '⭐', '🎉', '📚'].map((e, i) => (
                    <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Screen corner accents */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-3 h-3`}
              style={{ background: '#D4AF37', boxShadow: '0 0 10px #D4AF37', opacity: 0.85 }} />
          ))}
        </div>
      )}

      {/* Floating emoji reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -220, scale: 1.6 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-28 text-3xl pointer-events-none"
            style={{ left: `${r.x}vw` }}>
            {r.type}
          </motion.div>
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(10,4,30,0.75)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="flex items-center gap-3">
          <Link href="/lobby" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Hall</Link>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            ceremonyStatus === 'live'
              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
              : 'bg-white/5 border border-white/10 text-white/35'}`}>
            <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
            {ceremonyStatus === 'live' ? 'LIVE NOW' : ceremonyStatus === 'before' ? 'Starting Soon' : 'Ended'}
          </div>
          <span className="text-white/40 text-xs hidden sm:block">Nextora School · Graduation 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />{attendeeCount.toLocaleString()} watching
          </div>
          <button onClick={() => setChatOpen(v => !v)}
            className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/60'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reaction bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
        <div className="px-4 py-2 rounded-2xl flex items-center gap-1"
          style={{ background: 'rgba(10,4,30,0.8)', backdropFilter: 'blur(14px)', border: '1px solid rgba(212,175,55,0.18)' }}>
          {['🎓', '👏', '❤️', '🎉', '⭐', '😭', '🏆'].map(emoji => (
            <button key={emoji} onClick={() => addReaction(emoji)}
              className="text-xl px-1.5 py-1 rounded-lg hover:bg-white/10 active:scale-90"
              style={{ transition: 'all 0.15s' }}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Chat sidebar */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }}
            className="absolute top-0 right-0 bottom-0 w-80 z-30 flex flex-col"
            style={{ background: 'rgba(8,4,24,0.9)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white font-semibold text-sm">Live Chat</p>
              <button onClick={() => setChatOpen(false)} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: '#D4AF37' }}>{msg.author}</span>
                    <span className="text-xs text-white/20">{msg.time}</span>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={myName ? `Message as ${myName}…` : 'Say something…'}
                  className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/25 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
                />
                <button onClick={sendMessage} className="px-3 py-2 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#f0d060)', color: '#0a0c1e' }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name prompt */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{ background: 'linear-gradient(135deg,#150535,#1e0840)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome to Graduation!</h2>
              <p className="text-white/40 text-sm mb-6">Enter your name to join the ceremony chat</p>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nameInput.trim() && (setMyName(nameInput.trim()), setShowNamePrompt(false))}
                placeholder="Your name…" autoFocus
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(212,175,55,0.3)' }}
              />
              <button
                onClick={() => { if (nameInput.trim()) { setMyName(nameInput.trim()); setShowNamePrompt(false) } }}
                className="w-full py-3 rounded-xl font-bold text-sm mb-2"
                style={{ background: 'linear-gradient(135deg,#4a1878,#D4AF37)', color: '#fff' }}>
                Join Ceremony
              </button>
              <button onClick={() => setShowNamePrompt(false)} className="text-xs text-white/25 hover:text-white/50">
                Continue as guest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
