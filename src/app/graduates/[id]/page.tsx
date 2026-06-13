'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Award, Trophy, Linkedin, Twitter, Globe, Send, Download } from 'lucide-react'
import Navigation from '../../../components/Navigation'
import { useGraduationStore } from '../../../store/useGraduationStore'
import { generateInitials, getHonorsBadgeColor } from '../../../lib/utils'

export default function GraduateProfile({ params }: { params: { id: string } }) {
  const { graduates, addCongratulatoryMessage, myName: userName } = useGraduationStore()
  const graduate = graduates.find((g) => g.id === params.id)
  const [msgAuthor, setMsgAuthor] = useState(userName || '')
  const [msgText, setMsgText] = useState('')
  const [sent, setSent] = useState(false)

  if (!graduate) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-white mb-4">Graduate not found</h2>
          <Link href="/graduates" className="text-gold hover:underline">← Back to Directory</Link>
        </div>
      </div>
    )
  }

  const initials = generateInitials(graduate.name ?? '')
  const deptGradients: Record<string, string> = {
    'Computer Science': 'from-blue-600 to-cyan-600',
    'Business Administration': 'from-purple-600 to-pink-600',
    'Biomedical Engineering': 'from-green-600 to-teal-600',
    'Architecture': 'from-orange-500 to-amber-600',
    'Data Science': 'from-blue-500 to-indigo-600',
    'Political Science': 'from-red-600 to-rose-600',
    'Fine Arts': 'from-pink-500 to-purple-600',
    'Mechanical Engineering': 'from-slate-500 to-blue-600',
  }
  const gradient = deptGradients[graduate.department] ?? 'from-gold-dark to-gold'

  const submitMessage = () => {
    if (!msgText.trim()) return
    addCongratulatoryMessage(graduate.id, {
      author: msgAuthor.trim() || 'Anonymous',
      content: msgText.trim(),
      timestamp: new Date().toISOString(),
    })
    setMsgText('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-20 pb-24 max-w-4xl mx-auto px-4">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link href="/graduates" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl overflow-hidden mb-6">
          <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
          </div>
          <div className="px-8 pb-8 -mt-16 relative">
            <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center border-4 border-navy shadow-2xl mb-4`}>
              {graduate.photoUrl ? (
                <img src={graduate.photoUrl} alt={graduate.name} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                <span className="text-4xl font-bold text-white font-serif">{initials}</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-white">{graduate.name}</h1>
                <p className="text-white/60 mt-1">{graduate.degree}</p>
                <p className="text-gold/80 text-sm mt-0.5">{graduate.department}</p>
                {graduate.honors && graduate.honors !== 'none' && (
                  <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm border ${getHonorsBadgeColor(graduate.honors)}`}>
                    <Trophy className="w-3.5 h-3.5" />
                    {graduate.honors}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {graduate.socialLinks?.linkedin && (
                  <a href={graduate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors">
                    <Linkedin className="w-4 h-4 text-white/60" />
                  </a>
                )}
                {graduate.socialLinks?.twitter && (
                  <a href={graduate.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors">
                    <Twitter className="w-4 h-4 text-white/60" />
                  </a>
                )}
                {graduate.socialLinks?.website && (
                  <a href={graduate.socialLinks.website} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors">
                    <Globe className="w-4 h-4 text-white/60" />
                  </a>
                )}
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/20 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/30 transition-colors">
                  <Download className="w-4 h-4" />
                  Certificate
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Bio */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-xs">📖</span>
              Biography
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">{graduate.bio}</p>
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" />
              Achievements
            </h2>
            <ul className="space-y-2">
              {graduate.achievements.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-gold mt-0.5">✦</span>
                  {a}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Messages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 mt-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <span className="text-lg">💬</span>
            Congratulatory Messages
            <span className="text-xs text-white/30 ml-1">({graduate.messages.length})</span>
          </h2>

          {/* Existing messages */}
          {graduate.messages.length > 0 ? (
            <div className="space-y-4 mb-6">
              {graduate.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
                    {msg.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{msg.author}</span>
                      <span className="text-xs text-white/25">{new Date(msg.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-white/60">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm mb-6">Be the first to leave a message!</p>
          )}

          {/* Add message */}
          <div className="border-t border-white/5 pt-5 space-y-3">
            <input
              value={msgAuthor}
              onChange={(e) => setMsgAuthor(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40"
            />
            <div className="flex gap-3">
              <input
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitMessage()}
                placeholder="Write a congratulatory message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40"
              />
              <button
                onClick={submitMessage}
                className="px-4 py-2.5 rounded-xl bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sent ? 'Sent!' : 'Send'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
