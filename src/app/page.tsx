'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import CountdownTimer from '../components/CountdownTimer'

const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Nextora School'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

// ── Starfield canvas ────────────────────────────────────────────────────────
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let raf: number
    const stars: { x: number; y: number; r: number; o: number; speed: number }[] = []

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        o: Math.random(),
        speed: Math.random() * 0.3 + 0.05,
      })
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height)
      stars.forEach((s) => {
        s.o = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.001 * s.speed + s.x))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" />
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #05040f 0%, #0d0820 25%, #120a2e 50%, #0a0d22 75%, #050410 100%)'
    }}>
      <Starfield />

      {/* Huge radial glow — violet/purple centre */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(139,92,246,0.18) 0%, rgba(212,175,55,0.06) 55%, transparent 100%)' }} />

      {/* Subtle horizontal light band */}
      <div className="fixed left-0 right-0 pointer-events-none z-0"
        style={{ top: '38%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), rgba(139,92,246,0.4), rgba(212,175,55,0.3), transparent)' }} />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #8B5CF6)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-white text-base sm:text-lg tracking-wide">{UNI_NAME}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/program" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">Programme</Link>
          <Link href="/graduates" className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors">Graduates</Link>
          <Link href="/lobby"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #D4AF37)' }}>
            Enter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-8 pb-20 min-h-[85vh]">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 border"
          style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.35)' }}>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-purple-300">
            Virtual Graduation · Class of {YEAR}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}
          className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold leading-tight mb-6 max-w-5xl"
        >
          <span className="text-white">Your </span>
          <span style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #f0d060 40%, #a855f7 70%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            backgroundSize: '200% auto', animation: 'shimmerText 4s linear infinite'
          }}>
            Graduation
          </span>
          <br />
          <span className="text-white">Awaits.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-12 leading-relaxed">
          Step into a breathtaking 3D virtual hall, create your avatar, watch the live ceremony,
          and celebrate this milestone — wherever you are in the world.
        </motion.p>

        {/* Countdown */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4 mb-12">
          <p className="text-xs text-white/25 uppercase tracking-[0.2em]">Ceremony begins in</p>
          <CountdownTimer />
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/lobby"
            className="group relative px-8 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #D4AF37 100%)', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
            <span className="relative z-10 flex items-center gap-2">
              🎓 Enter 3D Hall
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <Link href="/avatar"
            className="px-8 py-4 rounded-2xl font-semibold text-white text-lg border transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.3)', backdropFilter: 'blur(12px)' }}>
            🧑‍🎓 Create Avatar
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-14 text-xs text-white/20">
          {['🎥 Live BigBlueButton Stream', '🌍 Accessible Worldwide', '📸 Photo Booth', '🤝 Networking Rooms', '🏆 Graduate Profiles'].map(f => (
            <span key={f}>{f}</span>
          ))}
        </motion.div>
      </section>

      {/* ── Feature strip ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { emoji: '🏛️', title: '3D Virtual Hall', desc: 'Walk through a stunning graduation hall. Navigate with WASD, look around, click doors to enter rooms.', color: '#7c3aed' },
            { emoji: '🎓', title: 'Avatar System', desc: 'Create your avatar with your photo. Graduates get an automatic gown. Walk on stage and deliver your speech.', color: '#D4AF37' },
            { emoji: '📡', title: 'Live BBB Stream', desc: 'Watch the full ceremony on a giant screen inside the 3D auditorium via BigBlueButton.', color: '#ec4899' },
            { emoji: '👥', title: 'Graduate Profiles', desc: 'Browse every graduate, read their story, leave congratulatory messages and view their digital certificate.', color: '#3b82f6' },
            { emoji: '📸', title: 'Photo Booth', desc: 'Take graduation photos with custom frames and stickers, download and share instantly.', color: '#10b981' },
            { emoji: '🤝', title: 'Networking Lounge', desc: 'Join themed virtual tables and connect with graduates, faculty, and guests via BBB breakouts.', color: '#f59e0b' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:border-opacity-60 cursor-default"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${f.color}25`, backdropFilter: 'blur(10px)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${f.color}60`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${f.color}25`)}>
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sponsor strip */}
      <section className="relative z-10 border-t py-8 px-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-white/15 uppercase tracking-widest mb-5">Proud sponsors</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['TechCorp Global', 'Meridian Bank', 'HealthFirst', 'InnoVentures', 'GreenFuture', 'EduTech'].map(s => (
              <span key={s} className="text-white/15 hover:text-white/35 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-5 px-4 text-center text-xs text-white/15" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        © {YEAR} {UNI_NAME} · Virtual Graduation Ceremony
      </footer>

      <style jsx global>{`
        @keyframes shimmerText {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
