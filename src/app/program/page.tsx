'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useGraduationStore } from '@/store/useGraduationStore'
import Navigation from '@/components/Navigation'

const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Nextora Academy'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

export default function ProgramPage() {
  const { programItems, currentProgramItemIndex, ceremonyStatus } = useGraduationStore()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(232,114,12,0.14) 0%, rgba(212,175,55,0.05) 45%, transparent 75%), linear-gradient(135deg,#050b1f 0%,#0a1628 30%,#0d1f4c 60%,#0a1628 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '96px 16px 60px', position: 'relative', overflow: 'hidden',
    }}>
      <Navigation />

      {/* ambient glow band */}
      <div className="fixed left-0 right-0 pointer-events-none" style={{ top: '20%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.35),rgba(232,114,12,0.4),rgba(212,175,55,0.35),transparent)', zIndex: 0 }} />

      {/* Page heading */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-7 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 border"
          style={{ background: 'rgba(232,114,12,0.12)', borderColor: 'rgba(232,114,12,0.35)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            {ceremonyStatus === 'live' ? '🔴 Ceremony Live Now' : ceremonyStatus === 'ended' ? '🎓 Ceremony Concluded' : `Order of Events · ${YEAR}`}
          </span>
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white mb-2">The Programme</h1>
        <p className="text-white/40 text-sm">Everything happening, minute by minute, on graduation day.</p>
        {ceremonyStatus === 'live' && (
          <Link href="/auditorium"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#E8720C)' }}>
            🎭 Watch Live in the Auditorium
          </Link>
        )}
      </motion.div>

      {/* Booklet */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{
          width: '100%', maxWidth: 720, position: 'relative', zIndex: 10,
          background: 'linear-gradient(170deg,#fdf8ef 0%,#f5ead5 40%,#fdf3e0 100%)',
          borderRadius: 16,
          boxShadow: '0 30px 90px -10px rgba(0,0,0,0.65), 0 0 0 1px #d9824a55, 0 0 80px rgba(212,175,55,0.12)',
          overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif',
        }}>

        {/* Gold top bar */}
        <div style={{ height: 10, background: 'linear-gradient(90deg,#9a3412,#E8720C,#F97316,#E8720C,#9a3412)' }} />

        {/* Header section */}
        <div style={{ background: 'linear-gradient(160deg,#0a2472,#0d1f5c,#081848)', padding: '44px 48px 38px', textAlign: 'center', position: 'relative' }}>
          {/* Corner ornaments */}
          {['topleft','topright','botleft','botright'].map((pos) => (
            <div key={pos} style={{ position: 'absolute', width: 32, height: 32, top: pos.startsWith('top') ? 12 : undefined, bottom: pos.startsWith('bot') ? 12 : undefined, left: pos.endsWith('left') ? 12 : undefined, right: pos.endsWith('right') ? 12 : undefined, borderTop: pos.startsWith('top') ? '2px solid #E8720C' : 'none', borderBottom: pos.startsWith('bot') ? '2px solid #E8720C' : 'none', borderLeft: pos.endsWith('left') ? '2px solid #E8720C' : 'none', borderRight: pos.endsWith('right') ? '2px solid #E8720C' : 'none' }} />
          ))}
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#E8720C', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Georgia,serif' }}>{UNI_NAME}</div>
          <div style={{ fontSize: 13, letterSpacing: 2, color: '#E8720Caa', marginBottom: 8, fontFamily: 'Georgia,serif' }}>Presents</div>
          <div style={{
            fontSize: 32, fontWeight: 700, letterSpacing: 2, marginBottom: 6,
            backgroundImage: 'linear-gradient(135deg, #E8720C 0%, #F97316 40%, #E8720C 70%, #E8720C 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            backgroundSize: '200% auto', animation: 'shimmerGold 5s linear infinite',
            textShadow: '0 2px 16px rgba(212,175,55,0.4)',
          }}>GRADUATION CEREMONY</div>
          <div style={{ fontSize: 17, color: '#E8720Ccc', letterSpacing: 1, marginBottom: 4 }}>2025 / 2026 Academic Session</div>
          <div style={{ color: '#ffffff88', fontSize: 13, marginTop: 16, letterSpacing: 1 }}>UKG → Year 1 &nbsp;|&nbsp; Year 6 → Year 7 &nbsp;|&nbsp; Year 9 → Year 10</div>
        </div>

        {/* Gold divider */}
        <div style={{ height: 6, background: 'linear-gradient(90deg,#9a3412,#E8720C,#F97316,#E8720C,#9a3412)' }} />

        {/* Programme body */}
        <div style={{ padding: '36px 48px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: '#9a3412', marginBottom: 6 }}>Order of Events</div>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8720C,transparent)' }} />
          </div>

          {/* Programme items */}
          <div>
            {programItems.map((item, i) => {
              const isCurrent = ceremonyStatus === 'live' && i === currentProgramItemIndex
              const isPast = ceremonyStatus !== 'before' && i < currentProgramItemIndex
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }} transition={{ delay: Math.min(i * 0.06, 0.5) }}
                  style={{
                    display: 'flex', gap: 20, marginBottom: 28, paddingBottom: 28,
                    borderBottom: i < programItems.length - 1 ? '1px solid #E8720C30' : 'none',
                    position: 'relative',
                  }}>
                  {isCurrent && (
                    <div style={{ position: 'absolute', left: -48, top: 0, bottom: 28, width: 4, borderRadius: 4, background: 'linear-gradient(180deg,#E8720C,#E8720C)' }} />
                  )}
                  {/* Time column */}
                  <div style={{ minWidth: 72, textAlign: 'right', paddingTop: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isCurrent ? '#E8720C' : '#9a3412', letterSpacing: 0.5 }}>{item.time}</div>
                    <div style={{ fontSize: 10, color: '#9a341288', marginTop: 2 }}>{item.duration} min</div>
                  </div>

                  {/* Dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                    <div style={{
                      width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: '50%',
                      background: isCurrent ? 'linear-gradient(135deg,#E8720C,#F97316)' : isPast ? 'linear-gradient(135deg,#9a3412,#c2620f)' : 'linear-gradient(135deg,#E8720C,#F97316)',
                      boxShadow: isCurrent ? '0 0 0 5px rgba(232,114,12,0.25), 0 0 16px rgba(232,114,12,0.6)' : '0 0 0 3px #E8720C20',
                      flexShrink: 0, transition: 'all 0.3s',
                    }} />
                    <div style={{ flex: 1, width: 1, background: 'linear-gradient(#E8720C40,transparent)', marginTop: 4 }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1005', lineHeight: 1.3 }}>{item.title}</div>
                      {isCurrent && (
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: 'white', background: '#E8720C', padding: '2px 8px', borderRadius: 999 }}>NOW</span>
                      )}
                    </div>
                    {item.speaker && (
                      <div style={{ fontSize: 12, color: '#9a3412', fontStyle: 'italic', marginBottom: 6 }}>{item.speaker}</div>
                    )}
                    <div style={{ fontSize: 13, color: '#4a3a1e', lineHeight: 1.7 }}>{item.description}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 16, padding: '16px 24px', background: '#E8720C12', border: '1px solid #E8720C30', borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#9a3412', fontStyle: 'italic', lineHeight: 1.7 }}>
              Times are approximate and may be subject to adjustment on the day.<br />
              All guests are kindly requested to be seated by 9:15 AM.
            </div>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div style={{ height: 10, background: 'linear-gradient(90deg,#9a3412,#E8720C,#F97316,#E8720C,#9a3412)' }} />
      </motion.div>

      <style jsx global>{`
        @keyframes shimmerGold {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
