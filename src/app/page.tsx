'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GraduationCap, Play, Users, Camera, Calendar, Wifi } from 'lucide-react'
import ParticleBackground from '../components/ParticleBackground'
import CountdownTimer from '../components/CountdownTimer'

const CEREMONY_DATE = process.env.NEXT_PUBLIC_CEREMONY_DATE || '2026-07-15T10:00:00'
const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Excellence University'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

const features = [
  { icon: Play, title: 'Live Auditorium', desc: 'Watch the ceremony live via BigBlueButton — together in real time.', href: '/auditorium', color: 'from-red-600 to-rose-600' },
  { icon: GraduationCap, title: 'Graduate Showcase', desc: 'Browse every graduate\'s profile, achievements, and personal messages.', href: '/graduates', color: 'from-gold-dark to-gold' },
  { icon: Users, title: 'Networking Lounge', desc: 'Join virtual tables and connect with fellow graduates and alumni.', href: '/networking', color: 'from-blue-600 to-cyan-600' },
  { icon: Camera, title: 'Photo Booth', desc: 'Take and share graduation photos with custom frames and filters.', href: '/photo-booth', color: 'from-purple-600 to-pink-600' },
  { icon: Calendar, title: 'Program', desc: 'Follow the ceremony schedule and never miss a moment.', href: '/program', color: 'from-green-600 to-teal-600' },
  { icon: Wifi, title: 'Live Reactions', desc: 'Send real-time emoji reactions during the ceremony.', href: '/auditorium', color: 'from-orange-500 to-amber-500' },
]

const stats = [
  { value: '8', label: 'Graduates' },
  { value: '2026', label: 'Class Year' },
  { value: '10', label: 'Program Items' },
  { value: '6', label: 'Network Tables' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy relative overflow-hidden">
      <ParticleBackground />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-navy" />
          </div>
          <span className="font-serif font-bold text-white text-lg">
            {UNI_NAME}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/program" className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors">
            Program
          </Link>
          <Link
            href="/lobby"
            className="px-5 py-2 rounded-xl bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors"
          >
            Enter Ceremony
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">
              Virtual Graduation Ceremony {YEAR}
            </span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Celebrating the{' '}
            <span className="gold-text">Class of {YEAR}</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join us for an unforgettable virtual graduation ceremony. Wherever you are in the world,
            celebrate this milestone with your fellow graduates, family, and friends.
          </p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 mb-12"
          >
            <p className="text-sm text-white/40 uppercase tracking-widest">Ceremony begins in</p>
            <CountdownTimer />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/lobby"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold to-gold-light text-navy font-bold text-lg hover:shadow-2xl hover:shadow-gold/30 transition-all hover:-translate-y-0.5"
            >
              🎓 Enter the Ceremony
            </Link>
            <Link
              href="/graduates"
              className="px-8 py-3.5 rounded-2xl glass text-white font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 hover:border-gold/40"
            >
              Browse Graduates
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-3xl font-bold gold-text">{s.value}</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
            Everything in one place
          </h2>
          <p className="text-white/50">A complete premium virtual graduation experience</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link href={f.href}>
                <div className="glass rounded-2xl p-6 border border-white/5 hover:border-gold/30 transition-all group h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="relative z-10 border-t border-white/5 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-8">Proud sponsors</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['TechCorp Global', 'Meridian Bank', 'HealthFirst', 'InnoVentures', 'GreenFuture', 'EduTech'].map((s) => (
              <div key={s} className="text-white/20 hover:text-white/50 transition-colors font-semibold text-sm uppercase tracking-wider cursor-pointer">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 px-4 text-center text-xs text-white/20">
        © {YEAR} {UNI_NAME} · Virtual Graduation Ceremony
      </footer>
    </div>
  )
}
