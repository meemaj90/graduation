'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageSquare, Send, Radio, X, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useGraduationStore } from '../../store/useGraduationStore'
import ReactionBar from '../../components/ReactionBar'

interface ChatMessage {
  id: string
  author: string
  text: string
  time: string
}

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', author: 'Sarah (Mum)', text: 'So proud of you sweetheart! 🎓❤️', time: '10:02' },
  { id: '2', author: 'Mr Hassan', text: 'Congratulations to all our graduates!', time: '10:04' },
  { id: '3', author: 'James family', text: 'Go James!! We love you!! 👏👏', time: '10:06' },
  { id: '4', author: 'Year 6 Parent', text: 'All grown up — so fast! 😭🎉', time: '10:07' },
  { id: '5', author: 'Principal', text: 'Welcome to the next chapter, Year 9!', time: '10:08' },
  { id: '6', author: 'Alumni', text: 'Class of 2026! One of us! 🙌', time: '10:09' },
]

// ── Canvas-painted auditorium background (audience POV) ─────────────────────
function paintAuditoriumBG(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2

  // Deep dark ceiling
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45)
  ceilGrad.addColorStop(0, '#020408')
  ceilGrad.addColorStop(1, '#06090f')
  ctx.fillStyle = ceilGrad; ctx.fillRect(0, 0, w, h)

  // Floor / aisle
  const floorGrad = ctx.createLinearGradient(0, h * 0.72, 0, h)
  floorGrad.addColorStop(0, '#08091a'); floorGrad.addColorStop(1, '#050610')
  ctx.fillStyle = floorGrad; ctx.fillRect(0, h * 0.72, w, h * 0.28)

  // Side walls
  ;[
    { pts: [[0,0],[w*0.14,0],[w*0.18,h],[0,h]] as [number,number][], light: false },
    { pts: [[w,0],[w*0.86,0],[w*0.82,h],[w,h]] as [number,number][], light: false },
  ].forEach(({ pts, light }) => {
    const wg = ctx.createLinearGradient(pts[0][0], 0, pts[1][0], 0)
    wg.addColorStop(0, '#040610'); wg.addColorStop(1, '#090c1e')
    ctx.fillStyle = wg
    ctx.beginPath(); pts.forEach(([x,y], i) => i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y))
    ctx.closePath(); ctx.fill()
  })

  // Wall pilasters
  const pilasterXs = [w*0.06, w*0.12, w*0.88, w*0.94]
  pilasterXs.forEach((px, i) => {
    const isLeft = i < 2
    const gx = ctx.createLinearGradient(px - 8, 0, px + 8, 0)
    gx.addColorStop(0, '#0a0c22'); gx.addColorStop(0.5, '#141730'); gx.addColorStop(1, '#0a0c22')
    ctx.fillStyle = gx
    ctx.fillRect(px - 8, 0, 16, h * 0.75)
    // Gold trim
    ctx.fillStyle = 'rgba(212,175,55,0.5)'; ctx.fillRect(px - 9, 0, 2, h * 0.75)
    ctx.fillStyle = 'rgba(212,175,55,0.5)'; ctx.fillRect(px + 7, 0, 2, h * 0.75)
    // Sconce
    if (i === 1 || i === 2) {
      const sy = h * 0.38
      const sg = ctx.createRadialGradient(isLeft ? px + 30 : px - 30, sy, 0, isLeft ? px + 30 : px - 30, sy, 80)
      sg.addColorStop(0, 'rgba(255,200,80,0.35)'); sg.addColorStop(1, 'transparent')
      ctx.fillStyle = sg; ctx.fillRect((isLeft ? px + 30 : px - 110), sy - 80, 110, 160)
      ctx.fillStyle = 'rgba(255,245,150,0.95)'
      ctx.beginPath(); ctx.arc(isLeft ? px + 24 : px - 24, sy, 4, 0, Math.PI * 2); ctx.fill()
    }
  })

  // Ceiling coffers
  for (let i = 0; i < 4; i++) {
    const x = w * 0.2 + i * w * 0.16
    for (let j = 0; j < 3; j++) {
      ctx.strokeStyle = `rgba(212,175,55,${0.12 - j*0.03})`; ctx.lineWidth = 0.8
      ctx.strokeRect(x, h * 0.03 + j * h * 0.07, w * 0.12, h * 0.055)
    }
  }
  // Ceiling light halos
  ;[w*0.28, w*0.42, w*0.58, w*0.72].forEach(lx => {
    const ly = h * 0.08
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60)
    lg.addColorStop(0, 'rgba(255,220,80,0.18)'); lg.addColorStop(1, 'transparent')
    ctx.fillStyle = lg; ctx.fillRect(lx-60,ly-30,120,90)
    ctx.fillStyle = 'rgba(255,245,160,0.9)'
    ctx.beginPath(); ctx.arc(lx, ly+12, 5, 0, Math.PI * 2); ctx.fill()
  })

  // Crown moulding
  ctx.strokeStyle = 'rgba(212,175,55,0.3)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, h*0.22); ctx.lineTo(w*0.18, h*0.26); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(w, h*0.22); ctx.lineTo(w*0.82, h*0.26); ctx.stroke()

  // ── STAGE FRONT ──
  const stageY = h * 0.72
  const stageL = w * 0.06
  const stageR = w * 0.94

  // Stage platform
  const stagePg = ctx.createLinearGradient(0, stageY - 30, 0, stageY + 40)
  stagePg.addColorStop(0, '#0e1228'); stagePg.addColorStop(1, '#070919')
  ctx.fillStyle = stagePg; ctx.fillRect(stageL, stageY - 30, stageR - stageL, 60)
  // Gold stage edge
  ctx.fillStyle = 'rgba(212,175,55,0.95)'; ctx.fillRect(stageL, stageY - 30, stageR - stageL, 2.5)
  // Stage reflection
  const srg = ctx.createLinearGradient(0, stageY-28, 0, stageY+20)
  srg.addColorStop(0,'rgba(180,150,60,0.15)'); srg.addColorStop(1,'transparent')
  ctx.fillStyle = srg; ctx.fillRect(stageL, stageY-28, stageR-stageL, 50)

  // Proscenium arch pillars
  ctx.fillStyle = '#080a1e'
  ctx.fillRect(stageL, 0, w * 0.06, stageY - 20)
  ctx.fillRect(stageR - w * 0.06, 0, w * 0.06, stageY - 20)
  // Gold arch edges
  ctx.fillStyle = 'rgba(212,175,55,0.8)'; ctx.fillRect(stageL + w*0.06, 0, 2, stageY)
  ctx.fillStyle = 'rgba(212,175,55,0.8)'; ctx.fillRect(stageR - w*0.06 - 2, 0, 2, stageY)
  ctx.fillStyle = 'rgba(212,175,55,0.6)'; ctx.fillRect(stageL + w*0.06, stageY - 32, stageR - stageL - w*0.12, 2)

  // Curtains
  const curtDraw = (x0: number, x1: number) => {
    const folds = 8
    for (let i = 0; i < folds; i++) {
      const t = i / (folds - 1)
      const b = 0.28 + (i % 2) * 0.16
      ctx.fillStyle = `rgb(${Math.round(b*110)},${Math.round(b*5)},${Math.round(b*5)})`
      ctx.fillRect(x0 + (x1 - x0) * t, 0, (x1 - x0) / folds + 1, stageY - 34)
    }
  }
  const curtW = w * 0.12
  curtDraw(stageL + w*0.06, stageL + w*0.06 + curtW)
  curtDraw(stageR - w*0.06 - curtW, stageR - w*0.06)
  // Valance
  ctx.fillStyle = '#5a0a0a'; ctx.fillRect(stageL+w*0.06, 0, stageR-stageL-w*0.12, 28)
  ctx.strokeStyle='rgba(212,175,55,0.8)';ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(stageL+w*0.06,28);ctx.lineTo(stageR-w*0.06,28);ctx.stroke()

  // ── BIG SCREEN placeholder (will be replaced by iframe) ──
  // Draw screen frame only — the actual screen is an iframe overlay
  const scrX = stageL + w*0.06 + curtW + 4
  const scrW = stageR - stageL - w*0.12 - curtW*2 - 8
  const scrY = 30
  const scrH = stageY - 68

  // Screen bezel/frame
  ctx.fillStyle = '#0a0a10'; ctx.fillRect(scrX - 8, scrY - 4, scrW + 16, scrH + 14)
  ctx.strokeStyle = 'rgba(212,175,55,0.7)'; ctx.lineWidth = 2
  ctx.strokeRect(scrX - 6, scrY - 2, scrW + 12, scrH + 10)
  // Inner dark screen (behind iframe)
  ctx.fillStyle = '#000'; ctx.fillRect(scrX, scrY, scrW, scrH)

  // Screen glow on stage floor
  const glow = ctx.createRadialGradient(cx, stageY - 10, 0, cx, stageY - 10, w * 0.35)
  glow.addColorStop(0, 'rgba(60,80,200,0.25)'); glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow; ctx.fillRect(cx - w*0.35, stageY - 80, w*0.7, 80)

  // Spotlights from above
  ;[-1, 0, 1].forEach(side => {
    const sx = cx + side * w * 0.18
    const bg = ctx.createRadialGradient(sx, h*0.05, 0, sx, stageY - 40, 80)
    bg.addColorStop(0, 'rgba(255,250,220,0.25)'); bg.addColorStop(1, 'transparent')
    ctx.fillStyle = bg; ctx.fillRect(sx-80, h*0.05, 160, stageY - 40 - h*0.05 + 80)
  })

  // Vignette
  const vg = ctx.createRadialGradient(cx, h*0.5, h*0.2, cx, h*0.5, h*0.85)
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(0.55,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.82)')
  ctx.fillStyle = vg; ctx.fillRect(0,0,w,h)

  // Return screen position for iframe overlay
  return { scrX, scrY, scrW, scrH }
}

function useAuditoriumBg() {
  const [bgUrl, setBgUrl] = useState('')
  const [screenRect, setScreenRect] = useState({ scrX: 0, scrY: 30, scrW: 800, scrH: 400 })

  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = paintAuditoriumBG(ctx, w, h)
    setScreenRect(rect)
    setBgUrl(canvas.toDataURL('image/jpeg', 0.92))
  }, [])

  return { bgUrl, screenRect }
}

// ── Audience seat rows (CSS) ────────────────────────────────────────────────
function AudienceRows() {
  const rows = 4
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '32%' }}>
      {Array.from({ length: rows }).map((_, row) => {
        const fromBottom = row * (100 / rows)
        const scale = 0.55 + row * 0.1
        const opacity = 0.5 + row * 0.12
        const seats = 16 - row * 2
        return (
          <div key={row} className="absolute w-full flex justify-center items-end gap-0.5"
            style={{ bottom: `${fromBottom}%`, opacity, transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
            {/* Left block */}
            <div className="flex gap-0.5">
              {Array.from({ length: Math.floor(seats * 0.4) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  {/* Seat back */}
                  <div className="w-8 h-9 rounded-t-lg" style={{ background: 'linear-gradient(180deg,#1a1040,#0e0a28)' }} />
                  {/* Head */}
                  <div className="w-5 h-5 rounded-full -mt-3"
                    style={{ background: `hsl(${15 + (i*37)%40},38%,${46+(i%3)*9}%)`, marginBottom: -2 }} />
                </div>
              ))}
            </div>
            {/* Centre aisle */}
            <div className="w-10" />
            {/* Right block */}
            <div className="flex gap-0.5">
              {Array.from({ length: Math.floor(seats * 0.4) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-9 rounded-t-lg" style={{ background: 'linear-gradient(180deg,#1a1040,#0e0a28)' }} />
                  <div className="w-5 h-5 rounded-full -mt-3"
                    style={{ background: `hsl(${20 + (i*53)%45},36%,${44+(i%4)*8}%)`, marginBottom: -2 }} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AuditoriumPage() {
  const { bbbJoinUrl, ceremonyStatus, attendeeCount, myName, setMyName, reactions, addReaction } = useGraduationStore()
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const [nameInput, setNameInput] = useState(myName || '')
  const [showNamePrompt, setShowNamePrompt] = useState(!myName)
  const chatRef = useRef<HTMLDivElement>(null)

  const { bgUrl, screenRect } = useAuditoriumBg()

  const joinUrl = bbbJoinUrl || process.env.NEXT_PUBLIC_BBB_JOIN_URL || ''

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      author: myName || 'Guest',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#02030a' }}>

      {/* ── Auditorium background painting ── */}
      {bgUrl && (
        <div className="absolute inset-0"
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}

      {/* ── BBB big screen iframe — positioned exactly over the painted screen ── */}
      {screenRect.scrW > 0 && (
        <div className="absolute" style={{
          left: screenRect.scrX,
          top: screenRect.scrY,
          width: screenRect.scrW,
          height: screenRect.scrH,
          zIndex: 5,
        }}>
          {joinUrl ? (
            <iframe
              src={joinUrl}
              className="w-full h-full"
              allow="camera; microphone; display-capture; autoplay"
              style={{ border: 'none', background: '#000' }}
            />
          ) : (
            // "Starting soon" placeholder
            <div className="w-full h-full flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#04061a,#080c24,#04061a)' }}>
              <div className="text-center">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-white font-bold text-lg mb-1">Ceremony Starting Soon</p>
                <p className="text-white/40 text-sm mb-4">The live stream will appear here</p>
                {/* School logo placeholder */}
                <div className="px-4 py-2 rounded-xl mx-auto w-fit"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#D4AF37' }}>Class of 2026</p>
                  <p className="text-white/30 text-xs">UKG · Year 1 · Year 6 · Year 7 · Year 9 · Year 10</p>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  {['🏫','🎓','⭐','🎉','📚'].map((e,i) => (
                    <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i*0.15}s` }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Screen corner glows */}
          {[['top-0 left-0','#D4AF37'],['top-0 right-0','#D4AF37'],['bottom-0 left-0','#D4AF37'],['bottom-0 right-0','#D4AF37']].map(([pos,col],i)=>(
            <div key={i} className={`absolute ${pos} w-3 h-3`}
              style={{ background: col, boxShadow: `0 0 12px ${col}`, opacity: 0.8 }} />
          ))}
        </div>
      )}

      {/* ── Audience seat rows ── */}
      <AudienceRows />

      {/* ── Floating reaction emojis ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, y: 0, x: `${r.x}vw`, scale: 1 }}
            animate={{ opacity: 0, y: -200, scale: 1.5 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-28 text-3xl pointer-events-none"
            style={{ left: 0 }}>
            {r.type}
          </motion.div>
        ))}
      </div>

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(2,3,10,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <Link href="/lobby" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Hall</Link>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            ceremonyStatus === 'live'
              ? 'bg-red-500/20 border border-red-500/40 text-red-400'
              : 'bg-white/5 border border-white/10 text-white/35'}`}>
            <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
            {ceremonyStatus === 'live' ? 'LIVE NOW' : ceremonyStatus === 'before' ? 'Starting Soon' : 'Ended'}
          </div>
          <span className="text-white/40 text-xs hidden sm:block">School Graduation · Class of 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />{attendeeCount.toLocaleString()} watching
          </div>
          <button onClick={() => setChatOpen(v => !v)}
            className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/60'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Reaction bar — bottom centre ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
        <div className="px-4 py-2 rounded-2xl flex items-center gap-1"
          style={{ background: 'rgba(2,3,10,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['🎓','👏','❤️','🎉','⭐','😭','🏆'].map(emoji => (
            <button key={emoji} onClick={() => addReaction(emoji)}
              className="text-xl px-1.5 py-1 rounded-lg hover:bg-white/10 transition-colors hover:scale-125 active:scale-90"
              style={{ transition: 'all 0.15s' }}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat sidebar ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }}
            className="absolute top-0 right-0 bottom-0 w-80 z-30 flex flex-col"
            style={{ background: 'rgba(3,4,14,0.88)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white font-semibold text-sm">Live Chat</p>
              <button onClick={() => setChatOpen(false)} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold" style={{ color: '#D4AF37' }}>{msg.author}</span>
                    <span className="text-xs text-white/20">{msg.time}</span>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={myName ? `Message as ${myName}…` : 'Say something…'}
                  className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-white/25 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                />
                <button onClick={sendMessage} className="px-3 py-2 rounded-xl font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg,#D4AF37,#f0d060)', color: '#0a0c1e' }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Name prompt ── */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl p-8 text-center"
              style={{ background: 'linear-gradient(135deg,#0d0820,#120a2e)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-white mb-1">Welcome to Graduation!</h2>
              <p className="text-white/40 text-sm mb-6">Enter your name to join the ceremony chat</p>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nameInput.trim() && (setMyName(nameInput.trim()), setShowNamePrompt(false))}
                placeholder="Your name…" autoFocus
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none mb-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(139,92,246,0.35)' }}
              />
              <button onClick={() => { if (nameInput.trim()) { setMyName(nameInput.trim()); setShowNamePrompt(false) }}}
                className="w-full py-3 rounded-xl font-bold text-sm mb-2"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#D4AF37)', color: '#fff' }}>
                Join Ceremony
              </button>
              <button onClick={() => setShowNamePrompt(false)} className="text-xs text-white/25 hover:text-white/50">
                Continue as guest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
