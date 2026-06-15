'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Star, Camera } from 'lucide-react'
import Link from 'next/link'
import { useGraduationStore } from '../../store/useGraduationStore'

const YEAR_GROUPS = ['All', 'UKG → Year 1', 'Year 6 → Year 7', 'Year 9 → Year 10']

// Assign graduating class based on grad index (mock)
function getYearGroup(idx: number) {
  return YEAR_GROUPS[1 + (idx % 3)]
}

export default function GraduatesPage() {
  const { graduates } = useGraduationStore()
  const [search, setSearch] = useState('')
  const [yearGroup, setYearGroup] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() =>
    graduates.filter(g => {
      const matchSearch = !search || g.name?.toLowerCase().includes(search.toLowerCase())
      const yg = getYearGroup(graduates.indexOf(g))
      const matchYear = yearGroup === 'All' || yg === yearGroup
      return matchSearch && matchYear
    }),
  [graduates, search, yearGroup])

  const selectedGrad = selected ? graduates.find(g => g.id === selected) : null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a1440 0%,#1a3a8f 50%,#0a1440 100%)' }}>

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,16,60,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <Link href="/lobby" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Lobby
          </Link>
          <div className="w-px h-5 bg-white/15" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
            <span className="text-white font-bold text-sm">NEXTORA ACADEMY</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#D4AF37', color: '#0a1440' }}>
              CLASS OF 2026
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-sm">
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Screenshot to share!</span>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden py-10 px-4 text-center"
        style={{ background: 'linear-gradient(180deg,rgba(37,99,235,0.2),transparent)' }}>
        {/* Floating caps */}
        {['10%','25%','40%','60%','75%','90%'].map((l, i) => (
          <motion.div key={i} className="absolute text-2xl pointer-events-none"
            style={{ left: l, top: '10%' }}
            animate={{ y: [-8, 8, -8], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}>
            🎓
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#D4AF37' }}>
            ⭐ Wall of Fame ⭐
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">
            Our Graduating Stars
          </h1>
          <p className="text-white/50 text-sm">
            UKG → Year 1 &nbsp;·&nbsp; Year 6 → Year 7 &nbsp;·&nbsp; Year 9 → Year 10
          </p>
          <p className="text-white/30 text-xs mt-1">{graduates.length} graduates celebrating their achievement</p>
        </motion.div>
      </div>

      {/* ── FILTERS ── */}
      <div className="max-w-5xl mx-auto px-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>
        <div className="flex gap-2">
          {YEAR_GROUPS.map(yg => (
            <button key={yg} onClick={() => setYearGroup(yg)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${yearGroup === yg ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={yearGroup === yg ? { background: 'rgba(37,99,235,0.5)', border: '1px solid #2563eb' } : { border: '1px solid rgba(255,255,255,0.1)' }}>
              {yg}
            </button>
          ))}
        </div>
      </div>

      {/* ── WALL OF FAME GRID ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Gold banner strip */}
        <div className="mb-6 py-2 px-6 rounded-2xl text-center"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.15),transparent)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>
            🎉 Congratulations to all our graduates! Take a screenshot to share their special moment! 🎉
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((grad, i) => {
            const yg = getYearGroup(i)
            const initials = grad.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
            // Skin tone variety for avatar placeholder
            const skins = ['#FDBCB4','#F5CBA7','#C68642','#8D5524','#4a2c17']
            const skin = skins[i % skins.length]
            return (
              <motion.div key={grad.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(grad.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                whileHover={{ scale: 1.04, y: -4 }}>

                {/* Photo / Avatar */}
                <div className="relative aspect-square overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)' }}>
                  {grad.photoUrl ? (
                    <img src={grad.photoUrl} alt={grad.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      {/* Avatar silhouette */}
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white"
                        style={{ background: skin }}>
                        {initials}
                      </div>
                      {/* Graduation gown hint */}
                      <div className="text-2xl">🎓</div>
                    </div>
                  )}
                  {/* Gold overlay shimmer on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.15),transparent)' }} />
                  {/* Year group badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-xs font-bold"
                    style={{ background: 'rgba(8,16,60,0.85)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}>
                    {yg.split('→')[1].trim()}
                  </div>
                  {/* Star */}
                  <div className="absolute top-2 right-2">
                    <Star className="w-4 h-4" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
                  </div>
                </div>

                {/* Name + info */}
                <div className="p-3 text-center">
                  <p className="text-white font-bold text-sm leading-tight truncate">{grad.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#D4AF37' }}>{yg}</p>
                  {grad.honors && (
                    <p className="text-xs text-white/40 mt-0.5 truncate">{grad.honors}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40">No graduates found — try a different search</p>
          </div>
        )}
      </div>

      {/* ── GRADUATE SPOTLIGHT MODAL ── */}
      <AnimatePresenceShim>
        {selectedGrad && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#0f2060,#1a3a8f)', border: '2px solid rgba(212,175,55,0.5)' }}>

              {/* Photo area */}
              <div className="relative h-56 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)' }}>
                {selectedGrad.photoUrl ? (
                  <img src={selectedGrad.photoUrl} alt={selectedGrad.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white"
                      style={{ background: '#C68642', border: '4px solid #D4AF37' }}>
                      {selectedGrad.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <div className="text-4xl">🎓</div>
                  </div>
                )}
                {/* Confetti overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {['🎉','⭐','🎊','🌟','✨'].map((e, i) => (
                    <motion.span key={i} className="absolute text-xl"
                      style={{ left: `${15 + i * 18}%`, top: '10%' }}
                      animate={{ y: [0, 60, 120], opacity: [1, 0.5, 0] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}>
                      {e}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>
                  ⭐ Class of 2026 ⭐
                </p>
                <h2 className="text-2xl font-black text-white mb-1">{selectedGrad.name}</h2>
                <p className="text-sm font-semibold mb-1" style={{ color: '#D4AF37' }}>
                  {getYearGroup(graduates.indexOf(selectedGrad))}
                </p>
                {selectedGrad.honors && (
                  <p className="text-white/50 text-xs mb-1">{selectedGrad.honors}</p>
                )}
                {(selectedGrad as any).quote && (
                  <p className="text-white/60 text-sm italic mt-3 px-2">"{(selectedGrad as any).quote}"</p>
                )}

                <div className="mt-4 py-3 rounded-xl text-center"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>📸 Take a screenshot to share!</p>
                  <p className="text-white/30 text-xs mt-0.5">Nextora Academy Graduation 2026</p>
                </div>

                <button onClick={() => setSelected(null)}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresenceShim>
    </div>
  )
}

// Wrapper to use AnimatePresence without importing at top level conflict
import { AnimatePresence } from 'framer-motion'
function AnimatePresenceShim({ children }: { children: React.ReactNode }) {
  return <AnimatePresence>{children}</AnimatePresence>
}
