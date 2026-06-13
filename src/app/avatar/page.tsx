'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import AvatarCreator from '../../components/AvatarCreator'
import AvatarDisplay from '../../components/AvatarDisplay'
import { useGraduationStore } from '../../store/useGraduationStore'
import { AvatarCustomization } from '../../types'

export default function AvatarPage() {
  const router = useRouter()
  const { myAvatar, myName, myRole, setMyAvatar, setMyName, setMyRole } = useGraduationStore()
  const [nameInput, setNameInput] = useState(myName)
  const [roleInput, setRoleInput] = useState<'graduate' | 'guest' | 'faculty'>(myRole)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (avatar: AvatarCustomization) => {
    setMyAvatar(avatar)
    setMyName(nameInput)
    setMyRole(roleInput)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-white">Your Avatar</h1>
          <p className="text-white/50 mt-2">Customise how you appear in the virtual ceremony — Virtway and ibentos style</p>
        </motion.div>

        <div className="glass rounded-3xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-8">
          <div className="relative">
            <AvatarDisplay avatar={myAvatar} size={160} />
            {saved && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</motion.div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-1">{myName || 'Anonymous'}</h2>
            <p className="text-gold/70 capitalize text-sm mb-4">{myRole}</p>
            <div className="space-y-3 mb-6">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-gold/40 text-sm"
              />
              <div className="flex gap-2">
                {(['graduate', 'guest', 'faculty'] as const).map((r) => (
                  <button key={r} onClick={() => setRoleInput(r)}
                    className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${roleInput === r ? 'bg-gold text-navy font-semibold' : 'glass text-white/50 hover:text-white'}`}>
                    {r === 'graduate' ? '🎓' : r === 'faculty' ? '👨‍🏫' : '👤'} {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-center sm:justify-start">
              <button onClick={() => setEditing(true)} className="px-6 py-2.5 rounded-xl bg-gold text-navy font-semibold text-sm hover:bg-gold-light transition-colors">
                ✏️ Customise Avatar
              </button>
              <button onClick={() => { setMyName(nameInput); setMyRole(roleInput); setSaved(true); setTimeout(() => setSaved(false), 2500) }}
                className="px-6 py-2.5 rounded-xl glass text-white/60 hover:text-white text-sm transition-colors">
                Save Name
              </button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Ready to join the ceremony?</h3>
            <p className="text-sm text-white/40 mt-1">Enter the auditorium to see your avatar on the virtual stage</p>
          </div>
          <button onClick={() => router.push('/auditorium')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light text-navy font-bold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all">
            Enter Auditorium →
          </button>
        </div>
      </div>

      {editing && <AvatarCreator initial={myAvatar} onSave={handleSave} onClose={() => setEditing(false)} />}
    </div>
  )
}
