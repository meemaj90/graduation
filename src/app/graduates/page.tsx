'use client'
import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, X, Star, Heart, Camera, Send, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useHallStore, HofGraduate, Wish } from '../../store/useHallStore'

const YEAR_GROUPS = ['All', 'UKG → Year 1', 'Year 6 → Year 7', 'Year 9 → Year 10'] as const

const GROUP_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  'UKG → Year 1':      { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.5)',  label: '#f97316' },
  'Year 6 → Year 7':  { bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.5)',   label: '#60a5fa' },
  'Year 9 → Year 10': { bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.5)',  label: '#D4AF37' },
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  const skins = ['#8D5524','#C68642','#4a2c17','#A0522D','#5C4033']
  const skin = skins[name.charCodeAt(0) % skins.length]
  const sz = size === 'lg' ? 'w-28 h-28 text-4xl' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background: skin, border: `3px solid #D4AF37` }}>
      {initials}
    </div>
  )
}

// ── Wish Form ─────────────────────────────────────────────────────────────────
function WishForm({ grad, onDone }: { grad: HofGraduate; onDone: () => void }) {
  const addWish = useHallStore(s => s.addWish)
  const [name, setName]       = useState('')
  const [msg, setMsg]         = useState('')
  const [photo, setPhoto]     = useState<string | null>(null)
  const [submitting, setSub]  = useState(false)
  const [done, setDone]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickPhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const submit = () => {
    if (!name.trim() || !msg.trim()) return
    setSub(true)
    const wish: Wish = {
      id: `w-${Date.now()}`,
      gradId: grad.id,
      guestName: name.trim(),
      message: msg.trim(),
      photoUrl: photo,
      timestamp: Date.now(),
    }
    addWish(wish)
    setTimeout(() => { setDone(true); setSub(false) }, 400)
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">💌</div>
        <p className="text-white font-bold">Wish sent to {grad.name}!</p>
        <p className="text-white/50 text-sm mt-1">They will treasure your message forever.</p>
        <button onClick={onDone} className="mt-4 text-xs text-white/30 underline">Close</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Name</label>
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Proud Parent, Mrs Johnson…"
          className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Wish / Message</label>
        <textarea
          value={msg} onChange={e => setMsg(e.target.value)}
          rows={3}
          placeholder={`Write a personal message for ${grad.name}…`}
          className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
        />
      </div>

      {/* Photo upload */}
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Add a Photo (optional)</label>
        <div className="mt-1 flex items-center gap-3">
          {photo ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setPhoto(null)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : null}
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
            style={{ border: '1px dashed rgba(255,255,255,0.2)' }}>
            <Camera className="w-4 h-4" />
            {photo ? 'Change photo' : 'Upload or take a photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!name.trim() || !msg.trim() || submitting}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#D4AF37,#f97316)', color: '#0a1440' }}>
        <Send className="w-4 h-4" />
        Send My Wish to {grad.name.split(' ')[0]}
      </button>
    </div>
  )
}

// ── Wishes List ───────────────────────────────────────────────────────────────
function WishesList({ gradId }: { gradId: string }) {
  const wishes = useHallStore(s => s.wishes[gradId] ?? [])
  const [expanded, setExpanded] = useState(false)
  if (wishes.length === 0) {
    return <p className="text-white/30 text-xs italic text-center py-2">Be the first to leave a wish!</p>
  }
  const shown = expanded ? wishes : wishes.slice(0, 2)
  return (
    <div className="space-y-2">
      {shown.map(w => (
        <div key={w.id} className="flex gap-2.5 items-start p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {w.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.photoUrl} alt={w.guestName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.25)' }}>
              {w.guestName[0]}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-xs font-bold">{w.guestName}</p>
            <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{w.message}</p>
          </div>
        </div>
      ))}
      {wishes.length > 2 && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full text-xs text-white/40 hover:text-white/70 flex items-center justify-center gap-1 py-1">
          {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show {wishes.length - 2} more wishes</>}
        </button>
      )}
    </div>
  )
}

// ── Graduate Modal ────────────────────────────────────────────────────────────
function GradModal({ grad, onClose }: { grad: HofGraduate; onClose: () => void }) {
  const wishes = useHallStore(s => s.wishes[grad.id] ?? [])
  const c = GROUP_COLORS[grad.level]
  const [tab, setTab] = useState<'about' | 'wishes'>('about')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-4"
        style={{ background: 'linear-gradient(160deg,#0a1440,#0f2060,#0a1440)', border: `2px solid ${c.border}` }}>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center"
          style={{ background: `linear-gradient(160deg, ${c.bg}, transparent)` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-3">
            {grad.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={grad.photoUrl} alt={grad.name} className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: '#D4AF37' }} />
            ) : (
              <Avatar name={grad.name} size="lg" />
            )}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c.label }}>⭐ Class of 2026 ⭐</p>
          <h2 className="text-2xl font-black text-white">{grad.name}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: c.label }}>{grad.level}</p>
          <p className="text-white/40 text-xs mt-0.5">{grad.subject}</p>
          {grad.honors && (
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.label }}>
              <Star className="w-3 h-3" fill="currentColor" /> {grad.honors}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mx-6 rounded-xl overflow-hidden mt-1 mb-4"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {(['about', 'wishes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-xs font-bold capitalize transition-all ${tab === t ? 'text-white' : 'text-white/40'}`}
              style={tab === t ? { background: 'rgba(255,255,255,0.1)' } : {}}>
              {t === 'wishes' ? `💌 Wishes (${wishes.length})` : '📖 About'}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6">
          {tab === 'about' ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: c.label }}>Future Dream</p>
                <p className="text-white/80 text-sm italic">"{grad.dream}"</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: c.label }}>Favourite Memory</p>
                <p className="text-white/70 text-sm">{grad.memory}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-blue-300">Message from Teacher</p>
                <p className="text-white/70 text-sm italic">"{grad.teacherMsg}"</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#D4AF37' }}>Message from Family</p>
                <p className="text-white/70 text-sm italic">"{grad.parentMsg}"</p>
              </div>
              <button onClick={() => setTab('wishes')}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
                style={{ background: `linear-gradient(135deg,${c.label},#D4AF37)`, color: '#0a1440' }}>
                <Heart className="w-4 h-4" fill="currentColor" />
                Leave Your Wishes for {grad.name.split(' ')[0]}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <WishForm grad={grad} onDone={() => setTab('about')} />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                  {wishes.length > 0 ? `${wishes.length} wish${wishes.length !== 1 ? 'es' : ''} received` : 'No wishes yet'}
                </p>
                <WishesList gradId={grad.id} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Graduate Card ─────────────────────────────────────────────────────────────
function GradCard({ grad, onClick }: { grad: HofGraduate; onClick: () => void }) {
  const wishCount = useHallStore(s => (s.wishes[grad.id] ?? []).length)
  const c = GROUP_COLORS[grad.level]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${c.label}, transparent)` }} />
      <div className="p-4 flex flex-col items-center text-center gap-3">
        <div className="relative">
          {grad.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={grad.photoUrl} alt={grad.name} className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: '#D4AF37' }} />
          ) : (
            <Avatar name={grad.name} size="md" />
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: c.label }}>🎓</div>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">{grad.name}</p>
          <p className="text-xs mt-0.5" style={{ color: c.label }}>{grad.level}</p>
          {grad.honors && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.label }}>
              <Star className="w-2.5 h-2.5" /> {grad.honors}
            </div>
          )}
        </div>
        <p className="text-white/40 text-xs line-clamp-2 italic">"{grad.dream}"</p>
        {wishCount > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: '#D4AF37' }}>
            <Heart className="w-3 h-3" fill="currentColor" /> {wishCount} wish{wishCount !== 1 ? 'es' : ''}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GraduatesPage() {
  const graduates = useHallStore(s => s.graduates)
  const [search, setSearch]     = useState('')
  const [yearGroup, setYearGroup] = useState<string>('All')
  const [selected, setSelected] = useState<HofGraduate | null>(null)

  const filtered = useMemo(() =>
    graduates.filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
      const matchYear   = yearGroup === 'All' || g.level === yearGroup
      return matchSearch && matchYear
    }),
  [graduates, search, yearGroup])

  const grouped = useMemo(() => {
    const groups: Record<string, HofGraduate[]> = {}
    YEAR_GROUPS.slice(1).forEach(yg => {
      const grads = filtered.filter(g => g.level === yg)
      if (grads.length) groups[yg] = grads
    })
    return groups
  }, [filtered])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a1440 0%,#0f2060 50%,#0a1440 100%)' }}>

      {/* TOP BAR */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,16,60,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <Link href="/lobby" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-white/15" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#1a3a8f,#f97316)', border: '1px solid #D4AF37' }}>🎓</div>
            <span className="text-white font-bold text-sm">NEXTORA ACADEMY</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold hidden sm:inline" style={{ background: '#D4AF37', color: '#0a1440' }}>
              CLASS OF 2026
            </span>
          </div>
        </div>
        <span className="text-white/40 text-xs">{graduates.length} graduates</span>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden py-12 px-4 text-center"
        style={{ background: 'linear-gradient(180deg,rgba(249,115,22,0.08),rgba(37,99,235,0.08),transparent)' }}>
        {['5%','18%','32%','50%','68%','82%','95%'].map((l, i) => (
          <motion.div key={i} className="absolute text-2xl pointer-events-none select-none"
            style={{ left: l, top: '15%' }}
            animate={{ y: [-10, 10, -10], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
            🎓
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>
            Nextora Academy · 2026
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Hall of Fame</h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Click a graduate to read their story and leave your personal wishes
          </p>
        </motion.div>
      </div>

      {/* FILTERS */}
      <div className="max-w-4xl mx-auto px-4 mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {YEAR_GROUPS.map(yg => (
            <button key={yg} onClick={() => setYearGroup(yg)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${yearGroup === yg ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={yearGroup === yg
                ? { background: 'rgba(249,115,22,0.25)', border: '1px solid #f97316' }
                : { border: '1px solid rgba(255,255,255,0.1)' }}>
              {yg}
            </button>
          ))}
        </div>
      </div>

      {/* GRID BY YEAR GROUP */}
      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
        {Object.entries(grouped).map(([yg, grads]) => {
          const c = GROUP_COLORS[yg]
          return (
            <section key={yg}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${c.label}, transparent)` }} />
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="text-lg">🎓</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: c.label }}>{yg}</p>
                    <p className="text-white/40 text-xs">{grads.length} graduate{grads.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${c.label}, transparent)` }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {grads.map(grad => (
                  <GradCard key={grad.id} grad={grad} onClick={() => setSelected(grad)} />
                ))}
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white/40">No graduates found</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="py-4 px-6 rounded-2xl text-center"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.12),transparent)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>
              🎉 Congratulations to all {graduates.length} graduates of Nextora Academy Class of 2026! 🎉
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <GradModal grad={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
