'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GraduationCap, Play, Users, Camera, Calendar, Wifi } from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'
import CountdownTimer from '../components/CountdownTimer'

const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Excellence University'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

const features = [
  { icon: Play, title: 'Live Auditorium', desc: 'Watch the ceremony live — BBB stream on a 3D virtual stage.', href: '/auditorium', color: 'from-red-600 to-rose-600' },
  { icon: GraduationCap, title: 'Graduate Showcase', desc: 'Browse every graduate\'s profile, achievements, and messages.', href: '/graduates', color: 'from-yellow-600 to-amber-500' },
  { icon: Users, title: 'Networking Lounge', desc: 'Join virtual tables and connect with fellow graduates.', href: '/networking', color: 'from-blue-600 to-cyan-600' },
  { icon: Camera, title: 'Photo Booth', desc: 'Graduation photos with custom frames and stickers.', href: '/photo-booth', color: 'from-purple-600 to-pink-600' },
  { icon: Calendar, title: 'Programme', desc: 'Follow the ceremony schedule live.', href: '/program', color: 'from-green-600 to-teal-600' },
  { icon: Wifi, title: 'Live Reactions', desc: 'Send real-time emoji reactions during the ceremony.', href: '/auditorium', color: 'from-orange-500 to-amber-500' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy relative overflow-hidden">
      <ParticleBackground />

      {/* Deep radial glow behind hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-navy" />
          </div>
          <span className="font-serif font-bold text-white text-lg">{UNI_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/program" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors">Programme</Link>
          <Link href="/lobby" className="px-5 py-2 rounded-xl bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors">
            Enter Ceremony
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-12 pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Virtual Graduation Ceremony {YEAR}</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold text-white leading-tight mb-6">
            Celebrating the{' '}
            <span className="gold-text">Class of {YEAR}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            A premium immersive virtual graduation experience. Step into the 3D auditorium,
            create your avatar, and celebrate this milestone together — wherever you are in the world.
          </p>

          {/* Countdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 mb-12">
            <p className="text-sm text-white/30 uppercase tracking-widest">Ceremony begins in</p>
            <CountdownTimer />
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/lobby"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gold to-gold-light text-navy font-bold text-lg hover:shadow-2xl hover:shadow-gold/30 transition-all hover:-translate-y-1">
              🎓 Enter 3D Ceremony
            </Link>
            <Link href="/avatar"
              className="px-8 py-4 rounded-2xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 hover:border-gold/40">
              🧑‍🎓 Create Your Avatar
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">Everything in one place</h2>
          <p className="text-white/40">A complete premium virtual graduation experience</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}>
              <Link href={f.href}>
                <div className="glass rounded-2xl p-6 border border-white/5 hover:border-gold/30 transition-all group h-full">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-gold transition-colors mb-1">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="relative z-10 border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-white/20 uppercase tracking-widest mb-6">Proud sponsors</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['TechCorp Global', 'Meridian Bank', 'HealthFirst', 'InnoVentures', 'GreenFuture', 'EduTech'].map((s) => (
              <div key={s} className="text-white/20 hover:text-white/40 transition-colors font-semibold text-sm uppercase tracking-wider cursor-pointer">{s}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-5 px-4 text-center text-xs text-white/20">
        © {YEAR} {UNI_NAME} · Virtual Graduation Ceremony
      </footer>
    </div>
  )
}
