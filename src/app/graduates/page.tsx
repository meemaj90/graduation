'use client'
import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Heart, Camera, Send, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useHallStore, HofGraduate, Wish } from '../../store/useHallStore'

const YEAR_GROUPS = ['All', 'UKG → Year 1', 'Year 6 → Year 7', 'Year 9 → Year 10'] as const

// Avatar with gold frame
function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const skins = ['#8D5524','#C68642','#4a2c17','#A0522D','#5C4033','#6B3A2A','#3D1C0E']
  const skin = skins[name.charCodeAt(0) % skins.length]
  const sz = size === 'lg' ? 'w-28 h-28 text-3xl' : size === 'md' ? 'w-20 h-20 text-xl' : 'w-12 h-12 text-sm'
  if (photoUrl) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt={name} className={`${sz} rounded-full object-cover`} />
  )
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white`}
      style={{ background: `radial-gradient(circle at 35% 35%, ${skin}dd, ${skin}88)` }}>
      {initials}
    </div>
  )
}

// ── Wish Form ─────────────────────────────────────────────────────────────────
function WishForm({ grad, onDone }: { grad: HofGraduate; onDone: () => void }) {
  const addWish = useHallStore(s => s.addWish)
  const [name, setName] = useState('')
  const [msg, setMsg]   = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickPhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const submit = () => {
    if (!name.trim() || !msg.trim()) return
    addWish({ id: `w-${Date.now()}`, gradId: grad.id, guestName: name.trim(), message: msg.trim(), photoUrl: photo, timestamp: Date.now() })
    setDone(true)
  }

  if (done) return (
    <div className="text-center py-6">
      <div className="text-4xl mb-2">💌</div>
      <p className="text-white font-bold">Wish sent to {grad.name}!</p>
      <p className="text-white/50 text-sm mt-1">They will treasure your message forever.</p>
      <button onClick={onDone} className="mt-4 text-xs text-white/30 underline">Close</button>
    </div>
  )

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Proud Parent, Mrs Johnson…"
          className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }} />
      </div>
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Wish</label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
          placeholder={`Write a personal message for ${grad.name}…`}
          className="w-full mt-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/30 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }} />
      </div>
      <div>
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Add a Photo (optional)</label>
        <div className="mt-1 flex items-center gap-3">
          {photo && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="preview" className="w-full h-full object-cover" />
              <button onClick={() => setPhoto(null)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button>
            </div>
          )}
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
            style={{ border: '1px dashed rgba(255,255,255,0.2)' }}>
            <Camera className="w-4 h-4" />{photo ? 'Change photo' : 'Upload / take photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />
        </div>
      </div>
      <button onClick={submit} disabled={!name.trim() || !msg.trim()}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#D4AF37,#f97316)', color: '#0a1440' }}>
        <Send className="w-4 h-4" /> Send My Wish to {grad.name.split(' ')[0]}
      </button>
    </div>
  )
}

function WishesList({ gradId }: { gradId: string }) {
  const wishes = useHallStore(s => s.wishes[gradId] ?? [])
  const [expanded, setExpanded] = useState(false)
  if (!wishes.length) return <p className="text-white/30 text-xs italic text-center py-2">Be the first to leave a wish!</p>
  const shown = expanded ? wishes : wishes.slice(0, 2)
  return (
    <div className="space-y-2">
      {shown.map(w => (
        <div key={w.id} className="flex gap-2.5 items-start p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {w.photoUrl
            ? <img src={w.photoUrl} alt={w.guestName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />  // eslint-disable-line @next/next/no-img-element
            : <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'rgba(212,175,55,0.25)' }}>{w.guestName[0]}</div>
          }
          <div className="min-w-0">
            <p className="text-white text-xs font-bold">{w.guestName}</p>
            <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{w.message}</p>
          </div>
        </div>
      ))}
      {wishes.length > 2 && (
        <button onClick={() => setExpanded(e => !e)} className="w-full text-xs text-white/40 hover:text-white/70 flex items-center justify-center gap-1 py-1">
          {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show {wishes.length - 2} more wishes</>}
        </button>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function GradModal({ grad, onClose }: { grad: HofGraduate; onClose: () => void }) {
  const wishes = useHallStore(s => s.wishes[grad.id] ?? [])
  const [tab, setTab] = useState<'about' | 'wishes'>('about')
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-4"
        style={{ background: 'linear-gradient(160deg,#0a1440,#0f2060)', border: '2px solid rgba(212,175,55,0.6)' }}>

        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 text-center"
          style={{ background: 'linear-gradient(160deg,rgba(212,175,55,0.12),transparent)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-center mb-3">
            <div className="rounded-full p-1" style={{ background: 'linear-gradient(135deg,#D4AF37,#FFD700)', boxShadow: '0 0 24px rgba(212,175,55,0.6)' }}>
              <div className="rounded-full p-0.5 bg-[#0a1440]">
                <Avatar name={grad.name} photoUrl={grad.photoUrl} size="lg" />
              </div>
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>⭐ Class of 2026 ⭐</p>
          <h2 className="text-2xl font-black text-white">{grad.name}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#f97316' }}>{grad.level}</p>
          <p className="text-white/40 text-xs">{grad.subject}</p>
          {grad.honors && (
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37' }}>
              <Star className="w-3 h-3" fill="currentColor" /> {grad.honors}
            </div>
          )}
        </div>

        <div className="flex mx-6 rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {(['about','wishes'] as const).map(t => (
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
              {[
                { label: 'Future Dream', val: grad.dream, col: '#D4AF37' },
                { label: 'Favourite Memory', val: grad.memory, col: '#60a5fa' },
              ].map(({ label, val, col }) => (
                <div key={label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: col }}>{label}</p>
                  <p className="text-white/80 text-sm italic">"{val}"</p>
                </div>
              ))}
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
                style={{ background: 'linear-gradient(135deg,#D4AF37,#f97316)', color: '#0a1440' }}>
                <Heart className="w-4 h-4" fill="currentColor" /> Leave Your Wishes for {grad.name.split(' ')[0]}
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

// ── Portrait medallion ────────────────────────────────────────────────────────
function Portrait({ grad, onClick, delay }: { grad: HofGraduate; onClick: () => void; delay: number }) {
  const wishCount = useHallStore(s => (s.wishes[grad.id] ?? []).length)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.08, y: -6 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer group">

      {/* Gold ring frame */}
      <div className="relative">
        <div className="rounded-full p-[3px]"
          style={{
            background: 'linear-gradient(135deg,#FFD700,#D4AF37,#B8960C,#FFD700)',
            boxShadow: '0 0 20px rgba(212,175,55,0.7), 0 0 40px rgba(212,175,55,0.3)',
          }}>
          <div className="rounded-full p-[3px]" style={{ background: '#0a2472' }}>
            <div className="rounded-full overflow-hidden w-20 h-20 sm:w-24 sm:h-24"
              style={{ background: 'linear-gradient(135deg,#1a3a8f,#0d2060)' }}>
              <Avatar name={grad.name} photoUrl={grad.photoUrl} size="md" />
            </div>
          </div>
        </div>
        {/* Gown graduation icon */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-base shadow-lg"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#B8960C)', border: '2px solid #0a2472' }}>🎓</div>
        {wishCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#f97316', border: '2px solid #0a2472', color: 'white' }}>
            {wishCount}
          </div>
        )}
      </div>

      {/* Name plate */}
      <div className="px-3 py-1 rounded-md text-center"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.5)', minWidth: 80 }}>
        <p className="text-white font-black text-xs sm:text-sm uppercase tracking-wide leading-tight">
          {grad.name.split(' ')[0]}
        </p>
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

  const byGroup = useMemo(() => {
    const groups: [string, HofGraduate[]][] = []
    ;(['UKG → Year 1','Year 6 → Year 7','Year 9 → Year 10'] as const).forEach(yg => {
      const grads = filtered.filter(g => g.level === yg)
      if (grads.length) groups.push([yg, grads])
    })
    return groups
  }, [filtered])

  return (
    <div className="min-h-screen select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a3a8f 0%, #0a1440 60%, #050e2e 100%)' }}>

      {/* TOP NAV */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(5,14,46,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
        <div className="flex items-center gap-3">
          <Link href="/lobby" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="w-px h-5 bg-white/15" />
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <p className="text-white font-black text-xs leading-none tracking-wider">NEXTORA ACADEMY</p>
              <p className="text-xs leading-none" style={{ color: '#f97316' }}>The Next Dawn of Education</p>
            </div>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: '#D4AF37', color: '#0a1440' }}>CLASS OF 2026</span>
      </div>

      {/* SEARCH + FILTER */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {YEAR_GROUPS.map(yg => (
            <button key={yg} onClick={() => setYearGroup(yg)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${yearGroup === yg ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={yearGroup === yg ? { background: 'rgba(212,175,55,0.2)', border: '1px solid #D4AF37' } : { border: '1px solid rgba(255,255,255,0.1)' }}>
              {yg}
            </button>
          ))}
        </div>
      </div>

      {/* ── THE WALL BOARD ── */}
      <div className="max-w-5xl mx-auto px-4 pb-16 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg,#0a2472 0%,#0d1f5c 60%,#081848 100%)',
            border: '3px solid #D4AF37',
            boxShadow: '0 0 60px rgba(212,175,55,0.25), inset 0 0 80px rgba(0,0,0,0.3)',
          }}>

          {/* Gold corner ornaments */}
          {['-top-1 -left-1','-top-1 -right-1','-bottom-1 -left-1','-bottom-1 -right-1'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8 rounded-full z-10`}
              style={{ background: 'radial-gradient(circle,#FFD700,#B8960C)', boxShadow: '0 0 12px #FFD700' }} />
          ))}

          {/* Side banners */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center w-16 h-48 rounded-r-xl text-center"
            style={{ background: 'linear-gradient(180deg,#0a2472,#1a3a8f)', border: '1px solid rgba(212,175,55,0.4)' }}>
            <Star className="w-4 h-4 mb-2" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
            {['DREAM','BELIEVE','ACHIEVE'].map(w => (
              <p key={w} className="text-xs font-black leading-tight py-0.5" style={{ color: '#D4AF37', letterSpacing: 1 }}>{w}</p>
            ))}
            <Star className="w-4 h-4 mt-2" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center w-16 h-48 rounded-l-xl text-center"
            style={{ background: 'linear-gradient(180deg,#0a2472,#1a3a8f)', border: '1px solid rgba(212,175,55,0.4)' }}>
            <Star className="w-4 h-4 mb-2" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
            {['INSPIRE','LEARN','SUCCEED'].map(w => (
              <p key={w} className="text-xs font-black leading-tight py-0.5" style={{ color: '#D4AF37', letterSpacing: 1 }}>{w}</p>
            ))}
            <Star className="w-4 h-4 mt-2" style={{ color: '#D4AF37', fill: '#D4AF37' }} />
          </div>

          {/* HEADER */}
          <div className="pt-8 pb-4 px-20 text-center">
            {/* Logo row */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '2px solid #D4AF37' }}>🎓</div>
              <div className="text-left">
                <p className="font-black text-xl leading-none" style={{ color: '#2563eb' }}>Nextora</p>
                <p className="font-black text-xl leading-none" style={{ color: '#f97316' }}>Academy</p>
                <p className="text-xs italic" style={{ color: '#D4AF37' }}>The Next Dawn of Education</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37)' }} />
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#D4AF37', fontSize: 14 }}>★</span>)}
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg,transparent,#D4AF37)' }} />
            </div>

            {/* Title */}
            <h1 className="font-black uppercase leading-none tracking-widest mb-1"
              style={{
                fontSize: 'clamp(28px,6vw,52px)',
                color: '#D4AF37',
                textShadow: '0 0 30px rgba(212,175,55,0.8), 0 2px 0 #8B6914',
                letterSpacing: '0.12em',
              }}>
              WALL OF FAME
            </h1>

            {/* Laurel decoration */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span style={{ color: '#D4AF37', fontSize: 20 }}>🌿</span>
              <div className="px-4 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212,175,55,0.5)' }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                  Celebrating Our Learners
                </p>
              </div>
              <span style={{ color: '#D4AF37', fontSize: 20 }}>🌿</span>
            </div>
            <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>
              2025 / 2026 ACADEMIC SESSION
            </p>
          </div>

          {/* Gold divider */}
          <div className="mx-6 mb-6 h-px" style={{ background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)' }} />

          {/* YEAR GROUP SECTIONS */}
          <div className="px-4 sm:px-8 lg:px-20 pb-8 space-y-6">
            {byGroup.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/40">No graduates found</p>
              </div>
            )}
            {byGroup.map(([yg, grads], gi) => (
              <div key={yg} className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.4)' }}>
                {/* Section label */}
                <div className="py-2 text-center"
                  style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest" style={{ color: '#D4AF37' }}>
                    {yg}
                  </p>
                </div>
                {/* Portraits row */}
                <div className="py-6 px-4 flex flex-wrap items-start justify-center gap-4 sm:gap-6">
                  {grads.map((grad, i) => (
                    <Portrait key={grad.id} grad={grad} onClick={() => setSelected(grad)}
                      delay={gi * 0.1 + i * 0.06} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mx-6 mb-6 pt-4" style={{ borderTop: '1px solid rgba(212,175,55,0.3)' }}>
            <p className="text-center text-xs font-semibold" style={{ color: 'rgba(212,175,55,0.5)' }}>
              🎓 Nextora Academy · Class of 2026 · The Next Dawn of Education 🎓
            </p>
          </div>
        </motion.div>

        <p className="text-center text-white/30 text-xs mt-4">Click any graduate to read their story and leave your wishes</p>
      </div>

      <AnimatePresence>
        {selected && <GradModal grad={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
