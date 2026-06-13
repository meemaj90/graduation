'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Clock, Users, Wifi } from 'lucide-react'
import { useGraduationStore } from '@/store/useGraduationStore'

interface BBBPlayerProps {
  joinUrl?: string
  className?: string
}

export default function BBBPlayer({ joinUrl, className = '' }: BBBPlayerProps) {
  const [currentTime, setCurrentTime] = useState('')
  const { bbbJoinUrl: storeBbbUrl, attendeeCount } = useGraduationStore()
  const effectiveUrl = joinUrl || storeBbbUrl || ''

  useEffect(() => {
    const update = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  if (effectiveUrl) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          src={effectiveUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          title="Graduation Ceremony Live Stream"
        />
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full bg-navy-mid flex items-center justify-center ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-mid to-navy-light" />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            className="absolute rounded-full border border-gold/20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center p-8">
        {/* Main icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <Video className="w-10 h-10 text-gold" />
          </div>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </motion.div>
        </motion.div>

        <div>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-2">
            Ceremony Starting Soon
          </h2>
          <p className="text-gray-400 text-sm max-w-md">
            The live ceremony will begin shortly. Please ensure your audio is enabled and enjoy the experience.
          </p>
        </div>

        {/* Status indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300 font-mono">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Users className="w-4 h-4 text-gold" />
            <span className="text-sm text-gray-300">{attendeeCount} attendees waiting</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Stream Ready</span>
          </div>
        </div>

        {/* Ceremony date */}
        <div className="px-6 py-4 rounded-2xl bg-gold/5 border border-gold/20 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ceremony Date</p>
          <p className="font-playfair text-lg text-gold font-semibold">
            {new Date(process.env.NEXT_PUBLIC_CEREMONY_DATE || '2026-07-15T10:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(process.env.NEXT_PUBLIC_CEREMONY_DATE || '2026-07-15T10:00:00').toLocaleTimeString('en-US', {
              hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
