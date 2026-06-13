'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Send, Radio, UserCircle2, MonitorPlay } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import BBBPlayer from '../../components/BBBPlayer'
import ReactionBar from '../../components/ReactionBar'
import VirtualStage from '../../components/VirtualStage'
import { useGraduationStore } from '../../store/useGraduationStore'

interface ChatMessage {
  id: string
  author: string
  text: string
  time: string
}

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', author: 'Sarah M.', text: 'So proud of everyone! 🎓', time: '10:02' },
  { id: '2', author: 'Dr. Hassan', text: 'Congratulations to the class of 2026!', time: '10:04' },
  { id: '3', author: 'Family of Marcus', text: 'We love you Marcus!! 👏👏', time: '10:06' },
  { id: '4', author: 'Alumni Network', text: 'Welcome to the alumni family everyone!', time: '10:08' },
  { id: '5', author: 'Guest', text: 'This is incredible! 🎉', time: '10:09' },
]

export default function AuditoriumPage() {
  const { bbbJoinUrl, ceremonyStatus, attendeeCount, myName, setMyName } = useGraduationStore()
  const userName = myName
  const setUserName = setMyName
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState(userName || '')
  const [showNamePrompt, setShowNamePrompt] = useState(!userName)
  const [chatOpen, setChatOpen] = useState(true)

  const joinUrl = bbbJoinUrl || process.env.NEXT_PUBLIC_BBB_JOIN_URL || ''

  const sendMessage = () => {
    if (!input.trim()) return
    const msg: ChatMessage = {
      id: Math.random().toString(),
      author: userName || 'Guest',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, msg])
    setInput('')
  }

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim())
      setShowNamePrompt(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-16 h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 glass">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              ${ceremonyStatus === 'live' ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-white/5 border border-white/10 text-white/40'}`}>
              <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
              {ceremonyStatus === 'live' ? 'LIVE' : ceremonyStatus === 'before' ? 'Starting Soon' : 'Ended'}
            </div>
            <span className="text-sm text-white/60 hidden sm:block">Graduation Ceremony 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Users className="w-4 h-4" />
              <span>{attendeeCount.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-gold/20 text-gold' : 'hover:bg-white/5 text-white/50'}`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Stream */}
          <div className="flex-1 flex flex-col min-w-0 p-4 gap-4">
            <div className="flex-1 min-h-0">
              <BBBPlayer joinUrl={joinUrl} />
            </div>

            {/* Reaction bar */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 uppercase tracking-wider">Send a Reaction</span>
                <Link href="/avatar" className="flex items-center gap-1.5 text-xs text-gold/60 hover:text-gold transition-colors">
                  <UserCircle2 className="w-3.5 h-3.5" /> My Avatar
                </Link>
              </div>
              <ReactionBar />
            </div>

            {/* Virtual Stage (Virtway-style) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MonitorPlay className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-white">Virtual Stage</span>
                <span className="text-xs text-white/30">— powered by avatar technology</span>
              </div>
              <VirtualStage />
            </div>
          </div>

          {/* Chat sidebar */}
          {chatOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-80 border-l border-white/5 flex flex-col hidden lg:flex"
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="font-semibold text-white text-sm">Live Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gold">{msg.author}</span>
                      <span className="text-xs text-white/20">{msg.time}</span>
                    </div>
                    <p className="text-sm text-white/70">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Say something..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-gold rounded-xl text-navy hover:bg-gold-light transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Name prompt */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl p-8 max-w-sm w-full border border-gold/20"
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome!</h2>
              <p className="text-white/50 text-sm">Enter your name to join the ceremony</p>
            </div>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold/40 mb-4"
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="w-full py-3 rounded-xl bg-gold text-navy font-semibold hover:bg-gold-light transition-colors"
            >
              Join Ceremony
            </button>
            <button
              onClick={() => setShowNamePrompt(false)}
              className="w-full py-2 mt-2 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              Continue as Guest
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
