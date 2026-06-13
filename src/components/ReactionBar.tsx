'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGraduationStore } from '../store/useGraduationStore'

const REACTIONS = ['👏', '🎉', '❤️', '🎓', '⭐', '🔥', '😭', '🥳']

interface FloatingReaction {
  id: string
  type: string
  x: number
}

export default function ReactionBar() {
  const { addReaction } = useGraduationStore()
  const [floating, setFloating] = useState<FloatingReaction[]>([])

  const fire = (type: string) => {
    addReaction(type)
    const id = Math.random().toString()
    const x = Math.random() * 60 + 20
    setFloating((prev) => [...prev.slice(-8), { id, type, x }])
    setTimeout(() => setFloating((prev) => prev.filter((r) => r.id !== id)), 2200)
  }

  return (
    <div className="relative">
      {/* Floating reactions */}
      <div className="absolute bottom-full left-0 right-0 h-48 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floating.map((r) => (
            <motion.span
              key={r.id}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -180, opacity: 0, scale: 1.6 }}
              exit={{}}
              transition={{ duration: 2, ease: 'easeOut' }}
              style={{ left: `${r.x}%`, position: 'absolute', bottom: 0 }}
              className="text-2xl"
            >
              {r.type}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => fire(emoji)}
            className="text-xl p-2 rounded-xl glass hover:bg-white/10 hover:scale-110 transition-all active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
