'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowLeft, Download, X, Star } from 'lucide-react'
import Link from 'next/link'

// ── Demo graduates (mostly Black African names) ──────────────────────────────
const DEMO_GRADUATES = [
  // UKG → Year 1
  {
    id: 'g1', name: 'Amara Osei', level: 'UKG → Year 1', subject: 'Literacy & Numeracy',
    photo: null, dream: 'To become a doctor and heal people in my community',
    memory: 'Learning to read my first book and performing in our end-of-year show',
    teacherMsg: 'Amara has the brightest smile and an even brighter future. Her curiosity is infectious!',
    parentMsg: 'We are so proud of you my darling. You have grown so much this year. Keep shining! 💛',
    honors: 'Star Reader Award',
  },
  {
    id: 'g2', name: 'Kofi Mensah', level: 'UKG → Year 1', subject: 'Creative Arts',
    photo: null, dream: 'To be an artist and paint beautiful pictures of Africa',
    memory: 'Making our first art project and seeing my painting on the wall',
    teacherMsg: 'Kofi brings colour and joy to every classroom. His imagination knows no limits.',
    parentMsg: 'Our little artist! You make us smile every day. We love you so much, Kofi!',
    honors: 'Creative Star',
  },
  {
    id: 'g3', name: 'Fatima Diallo', level: 'UKG → Year 1', subject: 'Science Discovery',
    photo: null, dream: 'To explore space and discover new planets',
    memory: 'Our first science experiment — making volcanoes with baking soda!',
    teacherMsg: 'Fatima asks the most wonderful questions. She will go far in whatever she chooses.',
    parentMsg: 'Little scientist! Your father and I are beyond proud. The sky is just the beginning! ✨',
    honors: 'Curious Mind Award',
  },
  // Year 6 → Year 7
  {
    id: 'g4', name: 'Zara Adeyemi', level: 'Year 6 → Year 7', subject: 'Mathematics & Science',
    photo: null, dream: 'To become an engineer and build bridges across Africa',
    memory: 'Winning the inter-school maths competition and celebrating with my class',
    teacherMsg: 'Zara is a natural leader and a brilliant mathematical mind. Secondary school is lucky to have her.',
    parentMsg: 'Zara, you have made us so incredibly proud. Never stop asking questions and dreaming big! 🌟',
    honors: 'Academic Excellence',
  },
  {
    id: 'g5', name: 'Emmanuel Boateng', level: 'Year 6 → Year 7', subject: 'English & Drama',
    photo: null, dream: 'To be a famous actor and tell African stories to the world',
    memory: 'Playing the lead role in our Year 6 production of The Lion King',
    teacherMsg: 'Emmanuel has a stage presence that lights up the room. He is destined for greatness.',
    parentMsg: 'Our star performer! We could not stop smiling watching you on stage. We love you, son!',
    honors: 'Performing Arts Award',
  },
  {
    id: 'g6', name: 'Nia Kamara', level: 'Year 6 → Year 7', subject: 'History & Geography',
    photo: null, dream: 'To be a journalist and tell the stories of Africa to the world',
    memory: 'Our class trip and writing the school newspaper together',
    teacherMsg: 'Nia has a gift for words and a passion for truth. She will be an incredible journalist.',
    parentMsg: 'Sweet Nia, your voice matters. Keep writing, keep questioning, keep shining. We love you! 📰',
    honors: 'Young Journalist Award',
  },
  // Year 9 → Year 10
  {
    id: 'g7', name: 'David Okonkwo', level: 'Year 9 → Year 10', subject: 'STEM & Technology',
    photo: null, dream: 'To build the next great African tech company',
    memory: 'Coding our first app and presenting it at the school science fair',
    teacherMsg: 'David combines technical brilliance with genuine kindness. He is already a leader.',
    parentMsg: 'Son, you have shown us what dedication looks like. Year 10 and beyond — the world is yours! 💪',
    honors: 'STEM Innovation Award',
  },
  {
    id: 'g8', name: 'Aisha Nwosu', level: 'Year 9 → Year 10', subject: 'Biology & Chemistry',
    photo: null, dream: 'To find a cure for malaria and save millions of lives',
    memory: 'Our biology field trip and discovering just how much I love science',
    teacherMsg: 'Aisha has the heart of a healer and the mind of a scientist. She will change the world.',
    parentMsg: 'Our Aisha, you are our greatest achievement. Study hard and remember — you can do anything! 🌺',
    honors: 'Science Excellence Award',
  },
  {
    id: 'g9', name: 'Marcus Asante', level: 'Year 9 → Year 10', subject: 'Business & Economics',
    photo: null, dream: 'To become a successful entrepreneur and create jobs in Ghana',
    memory: 'Running our school mini-enterprise and making our first profit',
    teacherMsg: 'Marcus has an entrepreneurial spirit and exceptional people skills. Watch this space.',
    parentMsg: 'Marcus, you have worked so hard. Year 10 is going to be amazing. We believe in you completely! 🚀',
    honors: 'Young Entrepreneur Award',
  },
]

const YEAR_GROUPS = ['All', 'UKG → Year 1', 'Year 6 → Year 7', 'Year 9 → Year 10']

const GROUP_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  'UKG → Year 1':      { bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.5)',  label: '#f97316' },
  'Year 6 → Year 7':  { bg: 'rgba(37,99,235,0.15)',   border: 'rgba(37,99,235,0.5)',   label: '#60a5fa' },
  'Year 9 → Year 10': { bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.5)',  label: '#D4AF37' },
}

type Graduate = typeof DEMO_GRADUATES[0]

// Avatar initials with skin-tone placeholder
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2)
  const skins = ['#8D5524','#C68642','#4a2c17','#FDBCB4','#A0522D']
  const skin = skins[name.charCodeAt(0) % skins.length]
  const sz = size === 'lg' ? 'w-24 h-24 text-3xl' : size === 'md' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background: skin, border: `3px solid ${skin === '#FDBCB4' ? '#C68642' : '#D4AF37'}` }}>
      {initials}
    </div>
  )
}

function GradCard({ grad, onClick }: { grad: Graduate; onClick: () => void }) {
  const c = GROUP_COLORS[grad.level]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.border}`, backdropFilter: 'blur(12px)' }}>

      {/* Top accent */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${c.label}, transparent)` }} />

      <div className="p-4 flex flex-col items-center text-center gap-3">
        {/* Photo / avatar */}
        <div className="relative">
          {grad.photo ? (
            <img src={grad.photo} alt={grad.name} className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: '#D4AF37' }} />
          ) : (
            <Avatar name={grad.name} size="md" />
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: c.label }}>
            🎓
          </div>
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
      </div>
    </motion.div>
  )
}

function GradModal({ grad, onClose }: { grad: Graduate; onClose: () => void }) {
  const c = GROUP_COLORS[grad.level]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-4"
        style={{ background: 'linear-gradient(160deg,#0a1440,#0f2060,#0a1440)', border: `2px solid ${c.border}` }}>

        {/* Header gradient */}
        <div className="relative px-6 pt-8 pb-6 text-center"
          style={{ background: `linear-gradient(160deg, ${c.bg}, transparent)` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <X className="w-4 h-4" />
          </button>

          {/* Photo */}
          <div className="flex justify-center mb-3">
            {grad.photo ? (
              <img src={grad.photo} alt={grad.name} className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: '#D4AF37' }} />
            ) : (
              <Avatar name={grad.name} size="lg" />
            )}
          </div>

          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: c.label }}>
            ⭐ Class of 2026 ⭐
          </div>
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

        <div className="px-6 pb-6 space-y-4">
          {/* Dream */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: c.label }}>Future Dream</p>
            <p className="text-white/80 text-sm italic">"{grad.dream}"</p>
          </div>

          {/* Favourite Memory */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: c.label }}>Favourite Memory</p>
            <p className="text-white/70 text-sm">{grad.memory}</p>
          </div>

          {/* Teacher message */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-blue-300">Message from Teacher</p>
            <p className="text-white/70 text-sm italic">"{grad.teacherMsg}"</p>
          </div>

          {/* Parent message */}
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#D4AF37' }}>Message from Family</p>
            <p className="text-white/70 text-sm italic">"{grad.parentMsg}"</p>
          </div>

          {/* Certificate download */}
          <button className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${c.label}, #D4AF37)`, color: '#0a1440' }}
            onClick={() => alert('Certificate download coming soon!')}>
            <Download className="w-4 h-4" />
            Download Certificate
          </button>

          {/* Screenshot prompt */}
          <div className="py-3 rounded-xl text-center"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>📸 Take a screenshot to share!</p>
            <p className="text-white/30 text-xs mt-0.5">Nextora Academy Graduation 2026</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function GraduatesPage() {
  const [search, setSearch] = useState('')
  const [yearGroup, setYearGroup] = useState('All')
  const [selected, setSelected] = useState<Graduate | null>(null)

  const filtered = useMemo(() =>
    DEMO_GRADUATES.filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase())
      const matchYear = yearGroup === 'All' || g.level === yearGroup
      return matchSearch && matchYear
    }),
  [search, yearGroup])

  const grouped = useMemo(() => {
    const groups: Record<string, Graduate[]> = {}
    YEAR_GROUPS.slice(1).forEach(yg => {
      const grads = filtered.filter(g => g.level === yg)
      if (grads.length) groups[yg] = grads
    })
    return groups
  }, [filtered])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#0a1440 0%,#0f2060 50%,#0a1440 100%)' }}>

      {/* ── TOP BAR ── */}
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
        <span className="text-white/40 text-xs">{DEMO_GRADUATES.length} graduates</span>
      </div>

      {/* ── HERO ── */}
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
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">
            Hall of Fame
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Celebrating the achievements of our graduating students across three milestone transitions
          </p>
        </motion.div>
      </div>

      {/* ── FILTERS ── */}
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

      {/* ── SECTIONS BY YEAR GROUP ── */}
      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
        {Object.entries(grouped).map(([yg, grads]) => {
          const c = GROUP_COLORS[yg]
          return (
            <section key={yg}>
              {/* Section header */}
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
            <p className="text-white/40">No graduates found — try a different search</p>
          </div>
        )}

        {/* Footer banner */}
        {filtered.length > 0 && (
          <div className="py-4 px-6 rounded-2xl text-center"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.12),transparent)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: '#D4AF37' }}>
              🎉 Congratulations to all {DEMO_GRADUATES.length} graduates of Nextora Academy Class of 2026! 🎉
            </p>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selected && <GradModal grad={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
