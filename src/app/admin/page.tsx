'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Settings, Users, Radio, Link as LinkIcon, Trash2, Plus, LogOut, ChevronRight, Mic } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { useGraduationStore } from '../../store/useGraduationStore'

export default function AdminPage() {
  const {
    isAdminAuthenticated, loginAdmin, logoutAdmin,
    ceremonyStatus, setCeremonyStatus,
    bbbJoinUrl, setBbbJoinUrl,
    attendeeCount, setAttendeeCount,
    graduates, deleteGraduate,
    virtualAttendees, nextSpeaker, dismissSpeaker, currentSpeakerId, speakerQueue,
  } = useGraduationStore()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [bbbInput, setBbbInput] = useState(bbbJoinUrl)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'ceremony' | 'graduates' | 'stage'>('ceremony')

  const handleLogin = () => {
    if (loginAdmin(password)) {
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  const saveBbb = () => {
    setBbbJoinUrl(bbbInput)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const statusColors = {
    before: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    live: 'bg-red-500/20 border-red-500/40 text-red-400',
    ended: 'bg-gray-500/20 border-gray-500/40 text-gray-400',
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-gold" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Access</h2>
            <p className="text-white/40 text-sm mt-1">Ceremony management portal</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold/40 mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gold text-navy font-bold hover:bg-gold-light transition-colors">
            Sign In
          </button>
          <p className="text-center text-xs text-white/20 mt-4">Default: admin123</p>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'ceremony', label: 'Ceremony', icon: Settings },
    { id: 'graduates', label: 'Graduates', icon: Users },
    { id: 'stage', label: 'Virtual Stage', icon: Mic },
  ] as const

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-24 pb-20 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage your graduation ceremony</p>
          </div>
          <button onClick={logoutAdmin} className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-white/50 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gold text-navy' : 'glass text-white/50 hover:text-white'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ceremony tab */}
        {activeTab === 'ceremony' && (
          <div className="space-y-5">
            {/* Status */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-gold" /> Ceremony Status
              </h2>
              <div className="flex gap-3 flex-wrap">
                {(['before', 'live', 'ended'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setCeremonyStatus(s)}
                    className={`px-6 py-3 rounded-xl border font-semibold text-sm capitalize transition-all ${ceremonyStatus === s ? statusColors[s] : 'glass text-white/40 hover:text-white border-white/5'}`}
                  >
                    {s === 'before' ? '⏳ Before' : s === 'live' ? '🔴 Live' : '✅ Ended'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/25 mt-3">Current status: <span className="capitalize text-white/40">{ceremonyStatus}</span></p>
            </div>

            {/* BBB URL */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gold" /> BigBlueButton Meeting URL
              </h2>
              <p className="text-xs text-white/35 mb-4">Paste your BBB join URL. It will be embedded in the Auditorium for all attendees.</p>
              <div className="flex gap-3">
                <input
                  value={bbbInput}
                  onChange={(e) => setBbbInput(e.target.value)}
                  placeholder="https://your-bbb-server.com/bigbluebutton/api/join?..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold/40"
                />
                <button onClick={saveBbb} className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-gold text-navy hover:bg-gold-light'}`}>
                  {saved ? '✓ Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Attendee count */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" /> Live Stats
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gold-text">{attendeeCount}</div>
                  <div className="text-xs text-white/40 mt-1">Attendees</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gold-text">{graduates.length}</div>
                  <div className="text-xs text-white/40 mt-1">Graduates</div>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold gold-text">{virtualAttendees.length}</div>
                  <div className="text-xs text-white/40 mt-1">On Stage</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-white/40">Adjust count:</span>
                <button onClick={() => setAttendeeCount(attendeeCount - 1)} className="w-8 h-8 glass rounded-lg text-white/60 hover:text-white transition-colors">−</button>
                <span className="text-white text-sm w-12 text-center">{attendeeCount}</span>
                <button onClick={() => setAttendeeCount(attendeeCount + 1)} className="w-8 h-8 glass rounded-lg text-white/60 hover:text-white transition-colors">+</button>
              </div>
            </div>
          </div>
        )}

        {/* Graduates tab */}
        {activeTab === 'graduates' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-semibold text-white">Graduate List ({graduates.length})</h2>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/20 transition-colors">
                <Plus className="w-4 h-4" /> Add Graduate
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {graduates.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center text-sm font-bold text-gold">
                      {g.name?.split(' ')?.map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{g.name}</p>
                      <p className="text-xs text-white/40">{g.department} · {g.degree}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      g.honors === 'summa' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                      g.honors === 'magna' ? 'text-gray-300 border-gray-300/30 bg-gray-300/10' :
                      g.honors === 'cum' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                      'text-white/20 border-white/10'
                    }`}>
                      {g.honors === 'summa' ? 'Summa' : g.honors === 'magna' ? 'Magna' : g.honors === 'cum' ? 'Cum Laude' : 'No Honors'}
                    </span>
                    <button onClick={() => deleteGraduate(g.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Virtual stage tab */}
        {activeTab === 'stage' && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">🎤 Stage Control</h2>
              
              {currentSpeakerId ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-red-400">Currently Speaking</p>
                    <p className="text-white">{virtualAttendees.find(a => a.id === currentSpeakerId)?.name}</p>
                  </div>
                  <button onClick={dismissSpeaker} className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                    End Turn
                  </button>
                </div>
              ) : (
                <p className="text-white/40 text-sm mb-4">No one currently on stage</p>
              )}

              {speakerQueue.length > 0 && (
                <div>
                  <p className="text-sm text-white/50 mb-2">Speaker Queue ({speakerQueue.length})</p>
                  <div className="space-y-2 mb-4">
                    {speakerQueue.map((id, i) => {
                      const attendee = virtualAttendees.find(a => a.id === id)
                      return attendee ? (
                        <div key={id} className="flex items-center gap-3 p-3 glass rounded-xl">
                          <span className="text-white/30 text-sm w-5">{i + 1}</span>
                          <span className="text-white text-sm">{attendee.name}</span>
                          <span className="text-xs text-white/30 capitalize">{attendee.role}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                  <button onClick={nextSpeaker} className="w-full py-3 rounded-xl bg-gold text-navy font-bold text-sm hover:bg-gold-light transition-colors">
                    Call Next Speaker →
                  </button>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4">Virtual Attendees ({virtualAttendees.length})</h2>
              <div className="space-y-2">
                {virtualAttendees.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${a.isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                    <span className="text-white text-sm">{a.name}</span>
                    <span className="text-xs text-white/30 capitalize">{a.role}</span>
                    {a.isSpeaking && <span className="ml-auto text-xs text-red-400">🎤 Speaking</span>}
                    {a.isStagePending && <span className="ml-auto text-xs text-gold/60">⏳ Queued</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
