'use client'
import { motion } from 'framer-motion'
import { Clock, User, CheckCircle2, Circle, PlayCircle } from 'lucide-react'
import { ProgramItem } from '../types'

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(' ')
  const [h, m] = time.split(':').map(Number)
  let hours = h
  if (period === 'PM' && h !== 12) hours += 12
  if (period === 'AM' && h === 12) hours = 0
  return hours * 60 + m
}

export default function ProgramTimeline({ items }: { items: ProgramItem[] }) {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />

      <div className="space-y-6">
        {items.map((item, i) => {
          const start = parseTime(item.time)
          const end = start + item.duration
          const isPast = currentMinutes > end
          const isCurrent = currentMinutes >= start && currentMinutes <= end
          const isFuture = currentMinutes < start

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative pl-16 ${isCurrent ? 'scale-[1.01]' : ''}`}
            >
              {/* Icon */}
              <div
                className={`absolute left-3 top-3 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCurrent ? 'bg-gold border-gold shadow-lg shadow-gold/30' : isPast ? 'bg-green-600/20 border-green-600/50' : 'bg-navy-mid border-white/10'}`}
              >
                {isCurrent ? (
                  <PlayCircle className="w-4 h-4 text-navy" />
                ) : isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Circle className="w-3 h-3 text-white/20" />
                )}
              </div>

              {/* Card */}
              <div
                className={`glass rounded-2xl p-5 border transition-all duration-300
                  ${isCurrent ? 'border-gold/40 bg-gold/5 shadow-lg shadow-gold/10' : isPast ? 'border-white/5 opacity-60' : 'border-white/5'}`}
              >
                {isCurrent && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Now</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${isCurrent ? 'text-gold' : 'text-white'}`}>{item.title}</h3>
                    <p className="text-sm text-white/50 mt-1">{item.description}</p>
                    {item.speaker && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <User className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs text-white/40">{item.speaker}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-medium ${isCurrent ? 'text-gold' : 'text-white/60'}`}>{item.time}</div>
                    <div className="flex items-center gap-1 text-xs text-white/30 mt-1">
                      <Clock className="w-3 h-3" />
                      {item.duration} min
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
