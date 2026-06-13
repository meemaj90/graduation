'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Download, Printer, Clock, User } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useGraduationStore } from '@/store/useGraduationStore'
import { ProgramItem } from '@/types'

function generateICS(items: ProgramItem[]): string {
  const ceremonyDate = process.env.NEXT_PUBLIC_CEREMONY_DATE || '2026-07-15T10:00:00'
  const baseDate = new Date(ceremonyDate)

  const parseTime = (timeStr: string, base: Date): Date => {
    const d = new Date(base)
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return d
    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3].toUpperCase()
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  const formatDT = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const events = items.map((item) => {
    const start = parseTime(item.time, baseDate)
    const end = new Date(start.getTime() + item.duration * 60 * 1000)
    return [
      'BEGIN:VEVENT',
      `DTSTART:${formatDT(start)}`,
      `DTEND:${formatDT(end)}`,
      `SUMMARY:${item.title}`,
      `DESCRIPTION:${item.description.replace(/\n/g, '\\n')} — Speaker: ${item.speaker}`,
      `ORGANIZER;CN=Excellence University:mailto:ceremony@excellence.edu`,
      'END:VEVENT',
    ].join('\r\n')
  }).join('\r\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Excellence University//Graduation 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export default function ProgramPage() {
  const { programItems, currentProgramItemIndex } = useGraduationStore()
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const currentItem = programItems[currentProgramItemIndex]

  const handleDownloadCalendar = () => {
    const ics = generateICS(programItems)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'graduation-2026.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold mb-4">
            <Calendar className="w-4 h-4 text-gold" />
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">July 15, 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Ceremony <span className="gold-text">Program</span>
          </h1>
          <p className="text-white/50">Follow the schedule of events for Graduation 2026</p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-10"
        >
          <button
            onClick={handleDownloadCalendar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-sm text-white/70 hover:text-white hover:border-gold/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Add to Calendar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 text-sm text-white/70 hover:text-white hover:border-gold/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Program
          </button>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent" />

          <div className="space-y-2">
            {programItems.map((item: ProgramItem, i: number) => {
              const isCurrent = item.id === currentItem?.id
              const isPast = i < currentProgramItemIndex
              const isHighlighted = highlighted === item.id

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setHighlighted(isHighlighted ? null : item.id)}
                  className={`relative pl-20 cursor-pointer group transition-all duration-200`}
                >
                  {/* Time bubble */}
                  <div className={`absolute left-0 top-4 w-16 h-16 rounded-full flex items-center justify-center text-center border-2 transition-all duration-200
                    ${isCurrent
                      ? 'border-gold bg-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : isPast
                      ? 'border-white/20 bg-white/5'
                      : 'border-white/10 bg-navy'
                    } ${isHighlighted ? 'scale-110' : 'group-hover:scale-105'}`}
                  >
                    <div className="text-center">
                      <div className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-gold' : isPast ? 'text-white/30' : 'text-white/50'}`}>
                        {item.time.split(' ')[0]}
                      </div>
                      <div className={`text-[9px] ${isCurrent ? 'text-gold/70' : 'text-white/20'}`}>
                        {item.time.split(' ')[1]}
                      </div>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className={`rounded-2xl p-5 border transition-all duration-200 mb-3
                    ${isCurrent
                      ? 'glass-gold border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.08)]'
                      : isPast
                      ? 'border-white/5 bg-white/2 opacity-60'
                      : 'glass border-white/5 group-hover:border-gold/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-semibold text-base leading-tight ${isCurrent ? 'text-gold' : isPast ? 'text-white/40' : 'text-white'}`}>
                        {item.title}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] text-red-400 font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            Now
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-white/30 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}m</span>
                      </div>
                    </div>

                    {item.speaker && (
                      <div className="flex items-center gap-1.5 text-xs text-gold/60 mb-2">
                        <User className="w-3 h-3" />
                        <span>{item.speaker}</span>
                      </div>
                    )}

                    <p className={`text-sm leading-relaxed ${isPast ? 'text-white/25' : 'text-white/50'}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-white/20 mt-10"
        >
          Times are approximate and subject to change. All times in local time.
        </motion.p>
      </div>
    </div>
  )
}
