'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../../store/useGraduationStore'
import AvatarOnboarding from '../../components/AvatarOnboarding'
import { Users, Map, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Hotspot positions as % of video frame (x, y)
// Adjust these to match where each door appears in YOUR video
const HOTSPOTS = [
  { id: 'aud',   label: 'Auditorium',  sub: 'Live Ceremony',        icon: '🎭', x: 12,  y: 52, color: '#2563eb', href: '/auditorium' },
  { id: 'grads', label: 'Graduates',   sub: 'Wall of Fame',         icon: '🎓', x: 28,  y: 50, color: '#9333ea', href: '/graduates'  },
  { id: 'photo', label: 'Photo Booth', sub: 'Capture Memories',     icon: '📷', x: 42,  y: 48, color: '#ec4899', href: '/photo-booth'},
  { id: 'prog',  label: 'Programme',   sub: "Today's Schedule",     icon: '📋', x: 58,  y: 48, color: '#22c55e', href: '/program'    },
  { id: 'awd',   label: 'Awards Hall', sub: 'Celebrate Excellence', icon: '🏆', x: 72,  y: 50, color: '#D4AF37', href: '/graduates'  },
  { id: 'mem',   label: 'Memory Lane', sub: 'Our Journey',          icon: '❤️', x: 87,  y: 52, color: '#ef4444', href: '/networking' },
]

const SCHEDULE = [
  { time: '10:00 AM', title: 'Welcome Address' },
  { time: '10:30 AM', title: 'Student Awards' },
  { time: '11:00 AM', title: 'Graduation Ceremony', live: true },
  { time: '12:30 PM', title: 'Photo Session' },
  { time: '1:00 PM',  title: 'Closing Ceremony' },
]

function VideoLobby() {
  const router = useRouter()
  const { myName, attendeeCount } = useGraduationStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [zooming, setZooming] = useState<{ x: number; y: number } | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play().catch(() => {})
  }, [])

  const navigate = (href: string, x: number, y: number) => {
    setZooming({ x, y })
    setTimeout(() => router.push(href), 650)
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">

      {/* ── Full-screen video background ── */}
      <video
        ref={videoRef}
        src="/images/lobby-video.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        loop muted playsInline autoPlay
        onCanPlay={() => setVideoReady(true)}
      />

      {/* Dark vignette overlay for readability */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(8,16,60,0.45) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(8,16,60,0.6) 100%)' }} />

      {/* Zoom-in transition circle */}
      <AnimatePresence>
        {zooming && (
          <motion.div
            className="fixed rounded-full z-50 pointer-events-none"
            style={{
              left: `${zooming.x}%`,
              top: `${zooming.y}%`,
              width: 20,
              height: 20,
              background: 'rgba(8,16,60,0.9)',
              transform: 'translate(-50%,-50%)',
            }}
            animate={{ scale: 200, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* ── Floating confetti ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div key={i}
            style={{
              position: 'absolute',
              left: `${5 + i * 4.5}%`,
              top: -16,
              width: 8, height: 8,
              background: ['#2563eb','#D4AF37','#fff','#9333ea','#ec4899','#22c55e'][i % 6],
              borderRadius: 2,
            }}
            animate={{ y: ['0vh', '105vh'], rotate: [0, 540], opacity: [0.9, 0.2] }}
            transition={{ duration: 5 + (i % 4), delay: i * 0.4, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* ── Floating graduation caps ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[8, 22, 38, 55, 70, 84].map((x, i) => (
          <motion.div key={i} className="absolute text-3xl"
            style={{ left: `${x}%`, top: '100%' }}
            animate={{ y: [0, -900], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 5 + i * 0.7, delay: i * 1.2, repeat: Infinity, ease: 'easeInOut' }}>
            🎓
          </motion.div>
        ))}
      </div>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(8,16,60,0.82)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
          <div>
            <p className="text-white font-bold text-xs leading-none">NEXTORA ACADEMY</p>
            <p className="text-xs leading-none" style={{ color: '#D4AF37' }}>GRADUATION WORLD 2026</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/55">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            {attendeeCount} online
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPanel(v => !v)}
            className={`p-2 rounded-lg transition-colors ${showPanel ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>
            <Map className="w-4 h-4" />
          </button>
          <Link href="/auditorium"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: 'rgba(37,99,235,0.6)', border: '1px solid rgba(37,99,235,0.8)' }}>
            🎭 Enter Ceremony
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
              {myName ? myName[0].toUpperCase() : '?'}
            </div>
            <span className="text-white text-xs font-semibold">{myName || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* ── Welcome banner (centre, mid-screen) ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <div className="px-6 py-3 rounded-2xl"
          style={{ background: 'rgba(8,16,60,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.35)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#D4AF37' }}>⭐ Welcome to ⭐</p>
          <p className="text-white font-black text-xl leading-tight">NEXTORA GRADUATION WORLD 2026</p>
          <p className="text-white/50 text-xs mt-0.5">Celebrating Our Stars of Tomorrow</p>
        </div>
      </motion.div>

      {/* ── HOTSPOTS — fixed positions over video ── */}
      {HOTSPOTS.map((hs, i) => (
        <motion.div
          key={hs.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
          className="absolute z-20"
          style={{ left: `${hs.x}%`, top: `${hs.y}%`, transform: 'translate(-50%,-50%)' }}>
          <button
            onClick={() => navigate(hs.href, hs.x, hs.y)}
            onMouseEnter={() => setHovered(hs.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex flex-col items-center gap-1.5 group">

            {/* Outer pulse */}
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.3 }}
              className="absolute rounded-full pointer-events-none"
              style={{ width: 48, height: 48, top: -4, left: -4, background: hs.color }}
            />

            {/* Main button */}
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl z-10 shadow-2xl transition-transform duration-200 group-hover:scale-125"
              style={{
                background: hs.color,
                border: '3px solid white',
                boxShadow: `0 0 24px ${hs.color}, 0 4px 12px rgba(0,0,0,0.4)`,
              }}>
              {hs.icon}
            </div>

            {/* Label */}
            <div className="px-2.5 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-lg transition-all duration-200 group-hover:scale-105"
              style={{ background: 'rgba(8,16,60,0.9)', border: `1px solid ${hs.color}80`, backdropFilter: 'blur(8px)' }}>
              {hs.label}
            </div>
          </button>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hovered === hs.id && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -4 }} exit={{ opacity: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-2 rounded-xl text-center whitespace-nowrap pointer-events-none"
                style={{ background: 'rgba(8,16,60,0.97)', border: `1px solid ${hs.color}`, boxShadow: `0 0 16px ${hs.color}60`, backdropFilter: 'blur(12px)' }}>
                <p className="text-white text-xs font-bold">{hs.label}</p>
                <p className="text-xs mt-0.5" style={{ color: hs.color }}>{hs.sub}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* ── TOUR GUIDE robot ── */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
        className="absolute bottom-20 left-4 z-30 flex items-end gap-3" style={{ maxWidth: 280 }}>
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '3px solid #D4AF37' }}>🤖</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
        </div>
        <div className="rounded-2xl rounded-bl-none px-3 py-2.5"
          style={{ background: 'rgba(8,16,60,0.95)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(12px)' }}>
          <p className="text-white text-xs leading-relaxed">
            Welcome! 🎓 Click any glowing button to explore a room.<br />
            Head to <span style={{ color: '#2563eb' }}>Auditorium</span> for the live ceremony!
          </p>
        </div>
      </motion.div>

      {/* ── BOTTOM action bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 px-4 py-3"
        style={{ background: 'rgba(8,16,60,0.88)', backdropFilter: 'blur(14px)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        {[
          { icon: '😊', label: 'Emotes' },
          { icon: '🗺️', label: 'Map' },
          { icon: '👥', label: 'Friends' },
          { icon: '📷', label: 'Camera' },
          { icon: '🎤', label: 'Audio' },
        ].map(b => (
          <button key={b.label} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-white/45 hover:text-white hover:bg-white/8 transition-colors">
            <span className="text-lg">{b.icon}</span>
            <span className="text-xs">{b.label}</span>
          </button>
        ))}
        <Link href="/auditorium"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm ml-4"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#f0c040)', color: '#0a1440' }}>
          🏠 Teleport to Lobby
        </Link>
      </div>

      {/* ── Schedule side panel ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }}
            className="absolute top-12 right-0 bottom-14 w-64 z-30 flex flex-col overflow-y-auto"
            style={{ background: 'rgba(8,16,60,0.96)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-bold text-sm">Today's Events</p>
              <button onClick={() => setShowPanel(false)} className="text-white/30 hover:text-white/60 text-xl">×</button>
            </div>
            <div className="p-3 space-y-1.5">
              {SCHEDULE.map(s => (
                <div key={s.time} className={`flex items-center gap-2 p-2 rounded-lg ${s.live ? 'bg-blue-600/20' : ''}`}>
                  <span className="text-xs text-white/40 w-16 shrink-0">{s.time}</span>
                  <span className={`text-xs font-semibold flex-1 ${s.live ? 'text-white' : 'text-white/50'}`}>{s.title}</span>
                  {s.live && <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-bold">LIVE</span>}
                </div>
              ))}
            </div>
            <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/40 text-xs font-bold uppercase mb-2">Explore Campus</p>
              {HOTSPOTS.map(hs => (
                <Link key={hs.id} href={hs.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                  <span>{hs.icon}</span>
                  <span className="text-sm font-semibold flex-1">{hs.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LobbyPage() {
  const myName = useGraduationStore(s => s.myName)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!myName) setShowOnboarding(true)
  }, [myName])

  return (
    <>
      {showOnboarding && (
        <AvatarOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
      <VideoLobby />
    </>
  )
}
