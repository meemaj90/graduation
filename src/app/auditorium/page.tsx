'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MessageSquare, Send, X, Trophy, Image, Camera,
  Heart, HelpCircle, Hand, Smile, Eye, Mic, Home, Map,
  ChevronRight, Star, Radio,
} from 'lucide-react'
import Link from 'next/link'
import { useGraduationStore } from '../../store/useGraduationStore'

interface ChatMessage { id: string; author: string; text: string; time: string }

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', author: 'Sophia Martinez', text: 'So proud of everyone! 🎉', time: '11:02' },
  { id: '2', author: 'Daniel Lee', text: 'Congratulations Class of 2026! 🎓', time: '11:03' },
  { id: '3', author: 'Isabella Thomas', text: 'This is such a special day! 💙', time: '11:05' },
  { id: '4', author: 'William Anderson', text: 'You all did amazing! ⭐', time: '11:06' },
  { id: '5', author: 'Mrs Rahman', text: 'Our stars of tomorrow! 🌟', time: '11:07' },
]

const SCHEDULE = [
  { time: '10:00 AM', title: 'Welcome Address', live: false },
  { time: '10:15 AM', title: 'Student Awards', live: false },
  { time: '11:00 AM', title: 'Graduation Ceremony', live: true },
  { time: '12:00 PM', title: 'Speeches', live: false },
  { time: '12:30 PM', title: 'Photo Session', live: false },
  { time: '1:00 PM', title: 'Closing Ceremony', live: false },
]

const ROOMS = [
  { label: 'Auditorium', sub: 'Join Ceremony', icon: '🎭', href: '/auditorium', active: true },
  { label: 'Awards Hall', sub: 'Celebrate Achievements', icon: '🏆', href: '/graduates' },
  { label: 'Student Gallery', sub: 'Inspire & Create', icon: '🖼️', href: '/graduates' },
  { label: 'Memory Lane', sub: 'Our Journey', icon: '📸', href: '/photo-booth' },
  { label: 'Photo Booth', sub: 'Capture Moments', icon: '📷', href: '/photo-booth' },
  { label: 'Appreciation Wall', sub: 'Share Your Love', icon: '❤️', href: '/networking' },
  { label: 'Networking Lounge', sub: 'Meet & Connect', icon: '👥', href: '/networking' },
  { label: 'Help Center', sub: 'Get Support', icon: '❓', href: '/' },
]

// ── Bright K-12 auditorium background ──────────────────────────────────────
function paintAuditorium(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.clearRect(0, 0, W, H)

  // White/cream walls background
  const wallG = ctx.createLinearGradient(0, 0, 0, H)
  wallG.addColorStop(0, '#e8f0fe')
  wallG.addColorStop(0.4, '#dce8fd')
  wallG.addColorStop(1, '#c5d8fc')
  ctx.fillStyle = wallG
  ctx.fillRect(0, 0, W, H)

  // Ceiling — white with gold ring light
  const ceilG = ctx.createLinearGradient(0, 0, 0, H * 0.18)
  ceilG.addColorStop(0, '#ffffff')
  ceilG.addColorStop(1, '#f0f4ff')
  ctx.fillStyle = ceilG
  ctx.fillRect(0, 0, W, H * 0.18)

  // Central ceiling ring light
  const ringX = W / 2, ringY = H * 0.08
  const ringG = ctx.createRadialGradient(ringX, ringY, 20, ringX, ringY, 120)
  ringG.addColorStop(0, 'rgba(255,220,80,0.6)')
  ringG.addColorStop(0.4, 'rgba(255,200,50,0.2)')
  ringG.addColorStop(1, 'transparent')
  ctx.fillStyle = ringG; ctx.beginPath(); ctx.arc(ringX, ringY, 120, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = 'rgba(212,175,55,0.7)'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.arc(ringX, ringY, 70, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(212,175,55,0.4)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(ringX, ringY, 90, 0, Math.PI * 2); ctx.stroke()

  // Ceiling spotlights
  ;[W * 0.2, W * 0.35, W * 0.5, W * 0.65, W * 0.8].forEach(sx => {
    const sg = ctx.createRadialGradient(sx, 0, 0, sx, 0, 80)
    sg.addColorStop(0, 'rgba(255,240,150,0.4)')
    sg.addColorStop(1, 'transparent')
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, 0, 80, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#d4d4d4'; ctx.beginPath(); ctx.arc(sx, 6, 10, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx, 6, 6, 0, Math.PI * 2); ctx.fill()
  })

  // Left wall banner — "DREAM BELIEVE ACHIEVE"
  ctx.fillStyle = '#1a3a8f'
  ctx.fillRect(W * 0.01, H * 0.2, W * 0.08, H * 0.45)
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2
  ctx.strokeRect(W * 0.01, H * 0.2, W * 0.08, H * 0.45)
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W * 0.012)}px sans-serif`
  ctx.textAlign = 'center'
  ;['DREAM', 'BELIEVE', 'ACHIEVE'].forEach((word, i) => {
    ctx.fillText(word, W * 0.05, H * 0.31 + i * H * 0.13)
  })
  // Stars on banner
  ;[0, 1, 2].forEach(i => {
    ctx.fillStyle = '#D4AF37'; ctx.font = `${Math.round(W * 0.015)}px sans-serif`
    ctx.fillText('⭐', W * 0.05, H * 0.25 + i * H * 0.13)
  })

  // Right wall banner — "PROUD OF OUR NEXTORA STARS!"
  ctx.fillStyle = '#1a3a8f'
  ctx.fillRect(W * 0.91, H * 0.2, W * 0.08, H * 0.45)
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2
  ctx.strokeRect(W * 0.91, H * 0.2, W * 0.08, H * 0.45)
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W * 0.011)}px sans-serif`
  ;['PROUD', 'OF OUR', 'NEXTORA', 'STARS!'].forEach((word, i) => {
    ctx.fillText(word, W * 0.95, H * 0.29 + i * H * 0.1)
  })
  ctx.fillStyle = '#D4AF37'; ctx.font = `${Math.round(W * 0.015)}px sans-serif`
  ctx.fillText('⭐', W * 0.95, H * 0.25)

  // ── STAGE AREA ──────────────────────────────────────────────────────────
  const stageTop = H * 0.14
  const stageBot = H * 0.68
  const stageL = W * 0.1
  const stageR = W * 0.9

  // Stage floor (royal blue)
  const sfG = ctx.createLinearGradient(0, stageTop, 0, stageBot)
  sfG.addColorStop(0, '#1a3a8f')
  sfG.addColorStop(0.5, '#1e4099')
  sfG.addColorStop(1, '#0f2060')
  ctx.fillStyle = sfG
  ctx.fillRect(stageL, stageTop, stageR - stageL, stageBot - stageTop)

  // Stage border gold
  ctx.fillStyle = '#D4AF37'; ctx.fillRect(stageL, stageBot - 8, stageR - stageL, 8)
  ctx.fillStyle = 'rgba(212,175,55,0.5)'; ctx.fillRect(stageL, stageTop, stageR - stageL, 3)

  // Stage platform (raised oval/circle)
  const platCX = W / 2, platCY = stageBot - H * 0.04
  const platRX = W * 0.22, platRY = H * 0.045
  const platG = ctx.createRadialGradient(platCX, platCY, 0, platCX, platCY, platRX)
  platG.addColorStop(0, '#2855c0')
  platG.addColorStop(1, '#1a3a8f')
  ctx.fillStyle = platG
  ctx.beginPath(); ctx.ellipse(platCX, platCY, platRX, platRY, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.ellipse(platCX, platCY, platRX, platRY, 0, 0, Math.PI * 2); ctx.stroke()

  // Stage glow
  const glowG = ctx.createRadialGradient(platCX, platCY, 0, platCX, platCY, platRX * 1.5)
  glowG.addColorStop(0, 'rgba(100,140,255,0.25)')
  glowG.addColorStop(1, 'transparent')
  ctx.fillStyle = glowG
  ctx.beginPath(); ctx.ellipse(platCX, platCY, platRX * 1.5, platRY * 2, 0, 0, Math.PI * 2); ctx.fill()

  // Podium
  const podX = W * 0.3, podY = stageBot - H * 0.17
  ctx.fillStyle = '#0d2060'
  ctx.fillRect(podX - W * 0.04, podY, W * 0.08, H * 0.1)
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(podX - W * 0.04, podY, W * 0.08, H * 0.018)
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 1.5
  ctx.strokeRect(podX - W * 0.04, podY, W * 0.08, H * 0.1)
  // School crest on podium
  ctx.fillStyle = '#D4AF37'; ctx.font = `${Math.round(H * 0.04)}px sans-serif`
  ctx.textAlign = 'center'; ctx.fillText('🎓', podX, podY + H * 0.065)

  // Balloons (left side)
  const balloons = [
    { x: W * 0.13, y: stageBot - H * 0.25, color: '#2563eb' },
    { x: W * 0.16, y: stageBot - H * 0.32, color: '#D4AF37' },
    { x: W * 0.11, y: stageBot - H * 0.18, color: '#ffffff' },
    { x: W * 0.87, y: stageBot - H * 0.25, color: '#2563eb' },
    { x: W * 0.84, y: stageBot - H * 0.32, color: '#D4AF37' },
    { x: W * 0.89, y: stageBot - H * 0.18, color: '#9333ea' },
  ]
  balloons.forEach(b => {
    ctx.fillStyle = b.color
    ctx.beginPath(); ctx.ellipse(b.x, b.y, W * 0.018, H * 0.032, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.ellipse(b.x, b.y, W * 0.018, H * 0.032, 0, 0, Math.PI * 2); ctx.stroke()
    // String
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(b.x, b.y + H * 0.032); ctx.lineTo(b.x, b.y + H * 0.08); ctx.stroke()
  })

  // ── SEATED AUDIENCE ─────────────────────────────────────────────────────
  const audTop = stageBot
  const rowCount = 6
  const seatCols = 18

  for (let row = 0; row < rowCount; row++) {
    const prog = row / (rowCount - 1)
    const rowY = audTop + H * 0.04 + row * (H - audTop - H * 0.05) / rowCount
    const scale = 0.55 + prog * 0.5
    const rowW = W * 0.75 * (0.6 + prog * 0.4)
    const startX = (W - rowW) / 2
    const cols = Math.round(seatCols * (0.6 + prog * 0.4))
    const colW = rowW / cols

    for (let col = 0; col < cols; col++) {
      const cx = startX + col * colW + colW / 2
      const sW = colW * 0.7 * scale
      const sH = H * 0.055 * scale

      // Seat (navy/blue)
      const sG = ctx.createLinearGradient(cx - sW / 2, rowY, cx + sW / 2, rowY + sH)
      sG.addColorStop(0, '#1e3a8a'); sG.addColorStop(1, '#1e2d6b')
      ctx.fillStyle = sG
      ctx.beginPath(); ctx.roundRect(cx - sW / 2, rowY + sH * 0.3, sW, sH * 0.7, 3); ctx.fill()

      // Gown
      const gH = sH * 0.95, gW = sW * 0.65
      ctx.fillStyle = '#1e3a8a'
      ctx.beginPath(); ctx.roundRect(cx - gW / 2, rowY - gH * 0.55, gW, gH * 0.85, [gW * 0.15, gW * 0.15, 0, 0]); ctx.fill()
      // Gold trim on gown
      ctx.fillStyle = '#D4AF37'
      ctx.fillRect(cx - gW / 2, rowY - gH * 0.55, gW, gH * 0.06)

      // Head
      const skins = ['#FDBCB4', '#F5CBA7', '#C68642', '#8D5524', '#FDBCB4']
      ctx.fillStyle = skins[(row * 5 + col * 3) % skins.length]
      ctx.beginPath(); ctx.arc(cx, rowY - gH * 0.62, gW * 0.26, 0, Math.PI * 2); ctx.fill()

      // Cap
      ctx.fillStyle = '#1e2d6b'
      ctx.fillRect(cx - gW * 0.35, rowY - gH * 0.98, gW * 0.7, gH * 0.08)
      ctx.fillRect(cx - gW * 0.42, rowY - gH * 1.02, gW * 0.84, gH * 0.07)
      // Gold tassel
      ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx + gW * 0.2, rowY - gH * 1.0); ctx.lineTo(cx + gW * 0.2, rowY - gH * 0.82); ctx.stroke()
    }
  }

  // Confetti particles
  const confettiColors = ['#2563eb', '#D4AF37', '#ffffff', '#9333ea', '#ec4899', '#22c55e']
  for (let i = 0; i < 80; i++) {
    const cx = Math.random() * W
    const cy = Math.random() * H * 0.7
    const size = 3 + Math.random() * 6
    ctx.fillStyle = confettiColors[Math.floor(Math.random() * confettiColors.length)]
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.random() * Math.PI)
    ctx.fillRect(-size / 2, -size / 4, size, size / 2)
    ctx.restore()
  }

  ctx.textAlign = 'left'
}

function useAuditoriumBg() {
  const [bgUrl, setBgUrl] = useState('')
  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    paintAuditorium(ctx, w, h)
    setBgUrl(canvas.toDataURL('image/jpeg', 0.92))
  }, [])
  return bgUrl
}

// Confetti animation component
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#2563eb', '#D4AF37', '#fff', '#9333ea', '#ec4899'][i % 5],
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 3,
  }))
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {pieces.map(p => (
        <motion.div key={p.id}
          style={{ position: 'absolute', left: `${p.x}%`, top: -20, width: 8, height: 8, background: p.color, borderRadius: 2 }}
          animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

export default function AuditoriumPage() {
  const { bbbJoinUrl, ceremonyStatus, attendeeCount, myName, setMyName, reactions, addReaction } =
    useGraduationStore()
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState(myName || '')
  const [showNamePrompt, setShowNamePrompt] = useState(!myName)
  const chatRef = useRef<HTMLDivElement>(null)

  const bgUrl = useAuditoriumBg()
  const joinUrl = bbbJoinUrl || process.env.NEXT_PUBLIC_BBB_JOIN_URL || ''

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      author: myName || 'Guest',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed inset-0 overflow-hidden select-none" style={{ background: '#1a3a8f' }}>

      {/* Background */}
      {bgUrl && (
        <div className="absolute inset-0" style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover' }} />
      )}

      {/* Confetti */}
      <Confetti />

      {/* BBB screen iframe — positioned over stage screen */}
      <div className="absolute" style={{ left: '27%', top: '14%', width: '46%', height: '43%', zIndex: 5, borderRadius: 8, overflow: 'hidden' }}>
        {joinUrl ? (
          <iframe src={joinUrl} className="w-full h-full"
            allow="camera; microphone; display-capture; autoplay"
            style={{ border: 'none', background: '#000' }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb,#1a3a8f)' }}>
            <div className="text-center px-4">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-white font-bold text-lg leading-tight">CELEBRATING</p>
              <p className="font-black text-2xl leading-tight" style={{ color: '#D4AF37' }}>OUR STARS</p>
              <p className="font-black text-2xl leading-tight" style={{ color: '#D4AF37' }}>OF TOMORROW</p>
              <p className="text-white/70 text-xs mt-2">NEXTORA ACADEMY</p>
              <p className="text-white/50 text-xs">GRADUATION CEREMONY 2026</p>
              <div className="mt-3 flex justify-center gap-1">
                {['⭐','🎓','⭐','🌟','⭐'].map((e,i)=>(
                  <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i*0.15}s` }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2"
        style={{ background: 'rgba(10,20,70,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
            <div>
              <p className="text-white font-bold text-xs leading-none">NEXTORA ACADEMY</p>
              <p className="text-xs leading-none" style={{ color: '#D4AF37' }}>GRADUATION WORLD 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            {attendeeCount} Users Online
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
            ceremonyStatus === 'live' ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-white/10 text-white/50'}`}>
            <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
            {ceremonyStatus === 'live' ? 'LIVE' : 'Soon'}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
              {myName ? myName[0].toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">{myName || 'Guest'}</p>
              <p className="text-white/50 text-xs leading-none">Student</p>
            </div>
          </div>
          <button className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"><Users className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10"><MessageSquare className="w-4 h-4" /></button>
          <Link href="/lobby" className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10">
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── LEFT SIDEBAR — EXPLORE CAMPUS ── */}
      <div className="absolute top-12 left-0 bottom-16 w-52 z-20 flex flex-col"
        style={{ background: 'rgba(8,16,60,0.88)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white font-bold text-sm tracking-wide">EXPLORE CAMPUS</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {ROOMS.map(room => (
            <Link key={room.label} href={room.href}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${room.active
                ? 'text-white'
                : 'text-white/55 hover:text-white/80 hover:bg-white/5'}`}
              style={room.active ? { background: 'rgba(37,99,235,0.35)', borderRight: '3px solid #2563eb' } : {}}>
              <span className="text-base w-5 text-center">{room.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight truncate">{room.label}</p>
                <p className="text-xs leading-tight opacity-50 truncate">{room.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Congratulations card */}
        <div className="m-3 rounded-xl p-3" style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.4),rgba(147,51,234,0.3))', border: '1px solid rgba(212,175,55,0.3)' }}>
          <p className="text-xs font-bold text-white leading-tight">Congratulations</p>
          <p className="text-xs font-black leading-tight" style={{ color: '#D4AF37' }}>Class of 2026!</p>
          <p className="text-lg mt-1">🎉🎓🌟</p>
        </div>

        {/* UP NEXT */}
        <div className="mx-3 mb-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold text-white/60 uppercase mb-1">Up Next</p>
          <p className="text-xs font-semibold text-white leading-tight">Graduation Ceremony</p>
          <p className="text-xs font-bold" style={{ color: '#22c55e' }}>Live Now</p>
          <Link href="/program" className="mt-2 block text-center py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ background: '#2563eb' }}>
            VIEW FULL SCHEDULE
          </Link>
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="absolute top-12 right-0 bottom-16 w-72 z-20 flex flex-col overflow-hidden"
        style={{ background: 'rgba(8,16,60,0.88)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>

        {/* Event Schedule */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between">
            <p className="text-white font-bold text-sm">EVENT SCHEDULE</p>
          </div>
          <div className="px-4 pb-3 space-y-1.5">
            {SCHEDULE.map(s => (
              <div key={s.time} className={`flex items-center gap-3 py-1 px-2 rounded-lg ${s.live ? 'bg-yellow-500/10' : ''}`}>
                <span className="text-xs text-white/40 w-16 shrink-0">{s.time}</span>
                <span className={`text-xs font-semibold flex-1 ${s.live ? 'text-white' : 'text-white/55'}`}>{s.title}</span>
                {s.live && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">LIVE</span>}
              </div>
            ))}
          </div>
          <Link href="/program" className="block text-center text-xs font-semibold pb-2.5" style={{ color: '#2563eb' }}>
            VIEW FULL SCHEDULE
          </Link>
        </div>

        {/* Live Chat */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-white font-bold text-sm">LIVE CHAT</p>
          <span className="flex items-center gap-1 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />{attendeeCount} online
          </span>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5" style={{ minHeight: 0 }}>
          {messages.map(msg => (
            <div key={msg.id}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                  {msg.author[0]}
                </div>
                <span className="text-xs font-bold text-white/80">{msg.author}</span>
                <span className="text-xs text-white/25">{msg.time}</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed pl-7">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 px-3 py-1.5 rounded-xl text-xs text-white placeholder-white/25 outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
            <button onClick={sendMessage} className="px-3 py-1.5 rounded-xl"
              style={{ background: '#2563eb' }}>
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Live Reactions */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-2">
            <p className="text-white font-bold text-xs">LIVE REACTIONS</p>
            <p className="text-white/40 text-xs">Show your excitement!</p>
          </div>
          <div className="px-4 pb-3 grid grid-cols-4 gap-2">
            {[['👏', 'Applause'], ['😊', 'Cheer'], ['🎉', 'Confetti'], ['❤️', 'Heart']].map(([emoji, label]) => (
              <button key={label} onClick={() => addReaction(emoji)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-white/10 transition-colors active:scale-90"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-xl">{emoji}</span>
                <span className="text-xs text-white/40">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auditorium Map */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-4 py-2 flex items-center justify-between">
            <p className="text-white font-bold text-xs">AUDITORIUM MAP</p>
            <button className="text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="mx-3 mb-3 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ height: 80, background: 'radial-gradient(circle,#0a1850,#060e30)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full opacity-20" style={{ border: '2px solid #2563eb' }} />
                <div className="absolute w-10 h-10 rounded-full opacity-30" style={{ border: '2px solid #2563eb' }} />
              </div>
              <div className="absolute top-2 left-8 text-xs text-white/60">Stage</div>
              <div className="absolute bottom-2 right-8 text-xs text-white/60">Exit</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 25 }}>
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -200, scale: 1.8 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-20 text-3xl"
            style={{ left: `${r.x}vw` }}>
            {r.type}
          </motion.div>
        ))}
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="absolute bottom-0 left-52 right-72 z-30 flex items-center justify-between px-6 py-2.5"
        style={{ background: 'rgba(8,16,60,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex items-center gap-1">
          {[
            [Hand, 'Raise Hand'],
            [Smile, 'Emotes'],
            [Eye, 'View'],
            [Users, 'Friends'],
            [Mic, 'Audio'],
          ].map(([Icon, label]) => (
            <button key={label as string}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label as string}</span>
            </button>
          ))}
        </div>
        <Link href="/lobby"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#f0c040)', color: '#0a1440' }}>
          <Home className="w-4 h-4" />
          Teleport to Lobby
        </Link>
      </div>

      {/* Name prompt */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{ background: 'linear-gradient(135deg,#0a1440,#1a3a8f)', border: '2px solid rgba(212,175,55,0.4)' }}>
              <div className="text-5xl mb-3">🎓</div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome to Graduation!</h2>
              <p className="text-white/50 text-sm mb-5">Enter your name to join the celebration</p>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nameInput.trim() && (setMyName(nameInput.trim()), setShowNamePrompt(false))}
                placeholder="Your name…" autoFocus
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(212,175,55,0.35)' }}
              />
              <button onClick={() => { if (nameInput.trim()) { setMyName(nameInput.trim()); setShowNamePrompt(false) } }}
                className="w-full py-3 rounded-xl font-bold text-sm mb-2"
                style={{ background: 'linear-gradient(135deg,#2563eb,#D4AF37)', color: '#fff' }}>
                Join Ceremony 🎉
              </button>
              <button onClick={() => setShowNamePrompt(false)} className="text-xs text-white/30 hover:text-white/60">
                Continue as guest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
