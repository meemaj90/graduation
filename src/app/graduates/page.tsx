'use client'
import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Star, Heart, Camera, Send, ChevronDown, ChevronUp, ArrowLeft, Share2, Download } from 'lucide-react'
import Link from 'next/link'
import { useHallStore, HofGraduate } from '../../store/useHallStore'

const YEAR_GROUPS = ['All', 'UKG → Year 1', 'Year 6 → Year 7', 'Year 9 → Year 10'] as const

const WALL_IMAGE_URL = 'https://i.ibb.co/q3vsvZk5/Chat-GPT-Image-Jul-1-2026-12-41-41-PM.png'

// Avatar with gold frame
function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const skins = ['#8D5524','#C68642','#4a2c17','#A0522D','#5C4033','#6B3A2A','#3D1C0E']
  const skin = skins[name.charCodeAt(0) % skins.length]
  const sz = size === 'lg' ? 'w-28 h-28 text-3xl' : size === 'md' ? 'w-20 h-20 text-xl' : 'w-12 h-12 text-sm'
  const capSz = size === 'lg' ? 'text-2xl -top-1 -right-1' : size === 'md' ? 'text-lg -top-0.5 -right-0.5' : 'text-sm -top-0.5 -right-0.5'
  if (photoUrl) return (
    <div className="relative inline-block flex-shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt={name} className={`${sz} rounded-full object-cover`} />
      <span className={`absolute ${capSz} drop-shadow-md`}>🎓</span>
    </div>
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
        style={{ background: 'linear-gradient(135deg,#E8720C,#f97316)', color: '#0a1440' }}>
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

// ── Share card generator ──────────────────────────────────────────────────────
async function downloadShareCard(grad: HofGraduate, wishes: { guestName: string; message: string }[]) {
  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d1f5c'); bg.addColorStop(1, '#081030')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Orange stripe top
  ctx.fillStyle = '#E8720C'; ctx.fillRect(0, 0, W, 12)

  // School name
  ctx.fillStyle = '#E8720C'; ctx.font = 'bold 36px Georgia, serif'
  ctx.textAlign = 'center'; ctx.fillText('NEXTORA ACADEMY · CLASS OF 2026', W / 2, 70)

  // Photo circle
  const cx = W / 2, cy = 260, r = 160
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip()
  if (grad.photoUrl && !grad.photoUrl.startsWith('https://api.dicebear')) {
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.crossOrigin = 'anonymous'
        i.onload = () => res(i); i.onerror = rej; i.src = grad.photoUrl!
      })
      ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
    } catch { ctx.fillStyle = '#1a3a8f'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2) }
  } else {
    ctx.fillStyle = '#1a3a8f'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    ctx.restore(); ctx.save()
    ctx.fillStyle = '#fff'; ctx.font = 'bold 100px Georgia'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(grad.name.split(' ').map(n => n[0]).join('').slice(0,2), cx, cy)
  }
  ctx.restore()

  // Ring around photo
  ctx.strokeStyle = '#E8720C'; ctx.lineWidth = 8
  ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2); ctx.stroke()

  // Name + level
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 72px Georgia, serif'
  ctx.textAlign = 'center'; ctx.fillText(grad.name, W / 2, 490)
  ctx.fillStyle = '#f97316'; ctx.font = '36px Georgia, serif'
  ctx.fillText(grad.level, W / 2, 540)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '30px Arial, sans-serif'
  ctx.fillText(`Favourite Subject: ${grad.subject}`, W / 2, 585)

  const drawCard = (title: string, text: string, y: number, color: string) => {
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    roundRect(ctx, 60, y, W - 120, 140, 20); ctx.fill()
    ctx.fillStyle = color; ctx.font = 'bold 26px Arial, sans-serif'
    ctx.textAlign = 'left'; ctx.fillText(title, 90, y + 38)
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'italic 28px Georgia, serif'
    wrapText(ctx, `"${text}"`, 90, y + 78, W - 180, 34)
  }

  drawCard('🌟 I want to become...', grad.dream, 615, '#E8720C')
  drawCard('💛 My favourite memory', grad.memory, 775, '#60a5fa')

  // Wishes strip
  if (wishes.length > 0) {
    ctx.fillStyle = 'rgba(232,114,12,0.12)'
    roundRect(ctx, 60, 935, W - 120, 330, 20); ctx.fill()
    ctx.fillStyle = '#E8720C'; ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'; ctx.fillText(`💌 ${wishes.length} Well Wish${wishes.length !== 1 ? 'es' : ''}`, W / 2, 975)
    const shown = wishes.slice(0, 3)
    shown.forEach((w, i) => {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'; ctx.fillText(w.guestName, 90, 1015 + i * 82)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '22px Arial'
      wrapText(ctx, w.message, 90, 1042 + i * 82, W - 180, 26)
    })
  }

  // Footer
  ctx.fillStyle = '#E8720C'; ctx.fillRect(0, H - 12, W, 12)

  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a'); a.href = url
  a.download = `${grad.name.replace(/\s+/g,'-')}-graduation-2026.png`; a.click()

  // Also try Web Share API for mobile (WhatsApp/Instagram etc.)
  try {
    const blob = await (await fetch(url)).blob()
    const file = new File([blob], `${grad.name}-graduation.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: `${grad.name} - Nextora Academy 2026`, text: `🎓 Congratulations to ${grad.name}! Class of 2026, Nextora Academy.`, files: [file] })
    }
  } catch { /* share not available or cancelled — download already triggered */ }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' '); let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y); y += lineH; line = word
    } else { line = test }
  }
  if (line) ctx.fillText(line, x, y)
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function GradModal({ grad, initialTab = 'about', onClose }: { grad: HofGraduate; initialTab?: 'about' | 'wishes'; onClose: () => void }) {
  const wishes = useHallStore(s => s.wishes[grad.id] ?? [])
  const [tab, setTab] = useState<'about' | 'wishes'>(initialTab)
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try { await downloadShareCard(grad, wishes) } finally { setSharing(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-[280px_1fr]"
        style={{ background: 'linear-gradient(160deg,#0a1440,#0f2060)', border: '2px solid rgba(212,175,55,0.6)' }}>

        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
          <X className="w-4 h-4" />
        </button>

        {/* Profile sidebar */}
        <div className="relative px-6 py-8 text-center flex flex-col items-center justify-center md:border-r"
          style={{ background: 'linear-gradient(160deg,rgba(212,175,55,0.14),transparent)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="rounded-full p-1 mb-4" style={{ background: 'linear-gradient(135deg,#E8720C,#F97316)', boxShadow: '0 0 28px rgba(212,175,55,0.6)' }}>
            <div className="rounded-full p-0.5 bg-[#0a1440]">
              <Avatar name={grad.name} photoUrl={grad.photoUrl} size="lg" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#E8720C' }}>⭐ Class of 2026 ⭐</p>
          <h2 className="text-2xl font-black text-white">{grad.name}</h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#f97316' }}>{grad.level}</p>
          <p className="text-white/40 text-xs">{grad.subject}</p>

          {/* Share / Download card */}
          <button onClick={handleShare} disabled={sharing}
            className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#E8720C,#f97316)', color: '#0a1440' }}>
            <Share2 className="w-4 h-4" />
            {sharing ? 'Generating…' : 'Share / Download Card'}
          </button>
          <p className="text-white/25 text-xs mt-2 px-2">Save as image · share on WhatsApp, Instagram & more</p>
        </div>

        {/* Content */}
        <div className="flex flex-col min-h-0">
          <div className="flex mx-6 mt-6 rounded-xl overflow-hidden mb-4 flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {(['about','wishes'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold capitalize transition-all ${tab === t ? 'text-white' : 'text-white/40'}`}
                style={tab === t ? { background: 'rgba(255,255,255,0.1)' } : {}}>
                {t === 'wishes' ? `💌 Wishes (${wishes.length})` : '📖 About'}
              </button>
            ))}
          </div>

          <div className="px-6 pb-6 flex-1 overflow-y-auto">
            {tab === 'about' ? (
              <div className="space-y-3">
                {[
                  { label: '🌟 What I Want to Become', val: grad.dream, col: '#E8720C' },
                  { label: '💛 My Favourite Memory in Class', val: grad.memory, col: '#60a5fa' },
                ].map(({ label, val, col }) => (
                  <div key={label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: col }}>{label}</p>
                    <p className="text-white/80 text-sm italic">"{val}"</p>
                  </div>
                ))}
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-blue-300">📝 Teacher&apos;s Message</p>
                  <p className="text-white/70 text-sm italic">"{grad.teacherMsg}"</p>
                </div>
                <div className="p-4 rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#E8720C' }}>❤️ Family&apos;s Message</p>
                  <p className="text-white/70 text-sm italic">"{grad.parentMsg}"</p>
                </div>
                <button onClick={() => setTab('wishes')}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg,#E8720C,#f97316)', color: '#0a1440' }}>
                  <Heart className="w-4 h-4" fill="currentColor" /> Drop a Well Wish for {grad.name.split(' ')[0]}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <WishForm grad={grad} onDone={() => setTab('about')} />
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                      {wishes.length > 0 ? `${wishes.length} wish${wishes.length !== 1 ? 'es' : ''} received` : 'No wishes yet'}
                    </p>
                    {wishes.length > 0 && (
                      <button onClick={handleShare} disabled={sharing}
                        className="flex items-center gap-1 text-xs font-semibold disabled:opacity-50 transition-colors"
                        style={{ color: '#E8720C' }}>
                        <Download className="w-3 h-3" />{sharing ? 'Saving…' : 'Save Card with Wishes'}
                      </button>
                    )}
                  </div>
                  <WishesList gradId={grad.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Well-wish graduate picker ──────────────────────────────────────────────────
function WishPicker({ graduates, onPick, onClose }: { graduates: HofGraduate[]; onPick: (g: HofGraduate) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() =>
    graduates.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase())),
  [graduates, search])

  const grouped = useMemo(() => {
    const groups: [string, HofGraduate[]][] = []
    ;(['UKG → Year 1','Year 6 → Year 7','Year 9 → Year 10'] as const).forEach(yg => {
      const grads = filtered.filter(g => g.level === yg)
      if (grads.length) groups.push([yg, grads])
    })
    return groups
  }, [filtered])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-[28px] overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        style={{
          background: 'linear-gradient(160deg,#0d1f5c 0%,#0a1440 55%,#081030 100%)',
          border: '1px solid rgba(212,175,55,0.5)',
          boxShadow: '0 0 0 1px rgba(212,175,55,0.15), 0 25px 80px -10px rgba(0,0,0,0.7), 0 0 60px rgba(232,114,12,0.18)',
        }}>

        {/* Gold corner glints */}
        {['-top-1 -left-1','-top-1 -right-1'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-10 h-10 rounded-full pointer-events-none`}
            style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.5), transparent 70%)' }} />
        ))}

        {/* Header banner */}
        <div className="relative px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(160deg, rgba(232,114,12,0.22), rgba(212,175,55,0.07) 60%, transparent)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg,#F97316,#E8720C)', boxShadow: '0 0 36px rgba(232,114,12,0.6)' }}>
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Drop a Well Wish</h2>
          <p className="text-white/40 text-sm mt-1.5">Choose a graduate to send your congratulations to</p>
        </div>

        {/* Search */}
        <div className="px-8 -mt-1 mb-3 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" autoFocus
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 outline-none transition-all focus:ring-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.25)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 space-y-5">
          {grouped.map(([yg, grads]) => (
            <div key={yg}>
              <p className="text-[11px] font-black uppercase tracking-widest mb-2.5 px-1" style={{ color: 'rgba(212,175,55,0.7)' }}>{yg}</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {grads.map(g => (
                  <motion.button key={g.id} onClick={() => onPick(g)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-colors group"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="rounded-full p-0.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#F97316,#E8720C)' }}>
                      <div className="rounded-full p-0.5" style={{ background: '#0a1440' }}>
                        <Avatar name={g.name} photoUrl={g.photoUrl} size="sm" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-bold group-hover:text-orange-200 transition-colors truncate">{g.name}</p>
                      <p className="text-white/35 text-xs truncate">{g.subject}</p>
                    </div>
                    <Heart className="w-4 h-4 text-white/0 group-hover:text-orange-400/70 transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-white/30 text-sm text-center py-12">No graduates found</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GraduatesPage() {
  const graduates = useHallStore(s => s.graduates)
  const [picking, setPicking] = useState(false)
  const [selected, setSelected] = useState<HofGraduate | null>(null)
  const [selectedTab, setSelectedTab] = useState<'about' | 'wishes'>('about')

  const pickGraduate = (g: HofGraduate) => {
    setPicking(false)
    setSelectedTab('wishes')
    setSelected(g)
  }

  return (
    <div className="min-h-screen select-none" style={{ background: '#050e2e' }}>

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
        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: '#E8720C', color: '#0a1440' }}>CLASS OF 2026</span>
      </div>

      {/* ── THE WALL OF FAME (image only, full width, no crop) ── */}
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={WALL_IMAGE_URL} alt="Wall of Fame" className="w-full h-auto block" />

        {/* Floating well-wish CTA */}
        <button onClick={() => setPicking(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-white shadow-2xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E8720C, #E8720C)', boxShadow: '0 8px 30px rgba(232,114,12,0.55)' }}>
          <Heart className="w-4 h-4" fill="currentColor" /> Drop a Well Wish
        </button>
      </div>

      <AnimatePresence>
        {picking && (
          <WishPicker graduates={graduates} onPick={pickGraduate} onClose={() => setPicking(false)} />
        )}
        {selected && (
          <GradModal grad={selected} initialTab={selectedTab} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
