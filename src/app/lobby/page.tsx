'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Users, Camera, Calendar, Wifi, Trophy, GraduationCap, ChevronRight } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { useGraduationStore } from '../../store/useGraduationStore'

const booths = [
  {
    icon: Play,
    label: 'Auditorium',
    desc: 'Watch the live ceremony',
    href: '/auditorium',
    gradient: 'from-red-600 to-rose-700',
    badge: 'LIVE',
    badgeColor: 'bg-red-500',
    size: 'large',
  },
  {
    icon: GraduationCap,
    label: 'Graduates',
    desc: 'Browse graduating class',
    href: '/graduates',
    gradient: 'from-gold-dark to-yellow-500',
    size: 'normal',
  },
  {
    icon: Users,
    label: 'Networking',
    desc: 'Connect with peers',
    href: '/networking',
    gradient: 'from-blue-600 to-cyan-600',
    size: 'normal',
  },
  {
    icon: Camera,
    label: 'Photo Booth',
    desc: 'Capture the moment',
    href: '/photo-booth',
    gradient: 'from-purple-600 to-pink-600',
    size: 'normal',
  },
  {
    icon: Calendar,
    label: 'Program',
    desc: 'Ceremony schedule',
    href: '/program',
    gradient: 'from-green-600 to-teal-600',
    size: 'normal',
  },
  {
    icon: Trophy,
    label: 'Honours',
    desc: 'Top achievers',
    href: '/graduates?filter=honors',
    gradient: 'from-amber-500 to-orange-600',
    size: 'normal',
  },
]

export default function LobbyPage() {
  const { ceremonyStatus, attendeeCount, graduates } = useGraduationStore()

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      {/* Hero banner */}
      <div className="relative pt-20 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-8 pb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-4">
              <Wifi className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">
                {ceremonyStatus === 'live' ? 'Ceremony is Live Now!' : ceremonyStatus === 'ended' ? 'Ceremony Concluded' : 'Welcome to the Lobby'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-3">
              Graduation <span className="gold-text">2026</span>
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Welcome, graduate! Choose where you&apos;d like to go.
            </p>
          </motion.div>

          {/* Live stats strip */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>{attendeeCount.toLocaleString()} attending</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="text-sm text-white/50">
              {graduates.length} graduates
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="text-sm text-white/50">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Booths Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 auto-rows-fr">
          {booths.map((booth, i) => (
            <motion.div
              key={booth.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={booth.size === 'large' ? 'col-span-2 sm:col-span-3 lg:col-span-1 row-span-1 lg:row-span-2' : ''}
              whileHover={{ scale: 1.02 }}
            >
              <Link href={booth.href} className="block h-full">
                <div
                  className={`relative h-full min-h-[160px] rounded-3xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300 group cursor-pointer
                    ${booth.size === 'large' ? 'min-h-[200px] lg:min-h-[340px]' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${booth.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div>
                      {booth.badge && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white mb-3 ${booth.badgeColor}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          {booth.badge}
                        </span>
                      )}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${booth.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <booth.icon className="w-7 h-7 text-white" />
                      </div>
                      <h2 className={`font-bold text-white group-hover:text-gold transition-colors ${booth.size === 'large' ? 'text-2xl' : 'text-xl'}`}>
                        {booth.label}
                      </h2>
                      <p className="text-sm text-white/40 mt-1">{booth.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gold/60 group-hover:text-gold transition-colors text-sm font-medium mt-4">
                      Enter <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
