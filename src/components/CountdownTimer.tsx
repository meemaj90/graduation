'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLive, setIsLive] = useState(false)
  const [prevTime, setPrevTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const ceremonyDate = new Date(process.env.NEXT_PUBLIC_CEREMONY_DATE || '2026-07-15T10:00:00')

    const calculate = () => {
      const now = new Date()
      const diff = ceremonyDate.getTime() - now.getTime()

      if (diff <= 0) {
        setIsLive(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setPrevTime(timeLeft)
      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
          <div className="relative px-8 py-4 rounded-full bg-gold/10 border border-gold/40 backdrop-blur-sm">
            <span className="font-playfair text-2xl md:text-3xl font-bold text-gold">
              🎓 Ceremony is Live!
            </span>
          </div>
        </div>
        <p className="text-gray-300 text-sm">Join the ceremony now</p>
      </motion.div>
    )
  }

  const units = [
    { label: 'Days', value: timeLeft.days, prev: prevTime.days },
    { label: 'Hours', value: timeLeft.hours, prev: prevTime.hours },
    { label: 'Minutes', value: timeLeft.minutes, prev: prevTime.minutes },
    { label: 'Seconds', value: timeLeft.seconds, prev: prevTime.seconds },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
      {units.map(({ label, value, prev }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 border border-gold/30 backdrop-blur-sm flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={value}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="font-playfair text-2xl md:text-3xl font-bold text-gold relative z-10"
              >
                {String(value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  )
}
