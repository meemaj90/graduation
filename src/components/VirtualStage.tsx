'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ChevronRight, Users } from 'lucide-react'
import AvatarDisplay from './AvatarDisplay'
import { useGraduationStore } from '../store/useGraduationStore'

export default function VirtualStage() {
  const {
    virtualAttendees,
    currentSpeakerId,
    speakerQueue,
    myName,
    myAvatar,
    myRole,
    stageRequestSent,
    joinVirtualStage,
    nextSpeaker,
    dismissSpeaker,
    isAdminAuthenticated,
  } = useGraduationStore()

  const [tick, setTick] = useState(0)
  const currentSpeaker = virtualAttendees.find((a) => a.id === currentSpeakerId)

  // Animate attendee positions subtly
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000)
    return () => clearInterval(id)
  }, [])

  const audience = virtualAttendees.filter((a) => !a.isSpeaking)

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/5">
      {/* Stage area */}
      <div
        className="relative h-72 overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #0a0e2a 0%, #111830 40%, #1a2040 60%, #2a1a10 100%)',
        }}
      >
        {/* Stage floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 rounded-t-3xl border-t border-gold/20"
          style={{ background: 'linear-gradient(to top, rgba(212,175,55,0.08), transparent)' }}
        />

        {/* Spotlight on speaker */}
        {currentSpeaker && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-72 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.18) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Podium */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Podium block */}
          <div
            className="w-20 h-12 rounded-t-lg border border-gold/30 flex items-center justify-center"
            style={{ background: 'linear-gradient(to bottom, #2c2010, #1a1408)' }}
          >
            <span className="text-gold/50 text-xs font-serif">PODIUM</span>
          </div>
          {/* Mic stand */}
          <div className="w-px h-8 bg-gold/30" />
          {/* Speaker avatar at podium */}
          {currentSpeaker ? (
            <motion.div
              key={currentSpeaker.id}
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="absolute -top-28 left-1/2 -translate-x-1/2"
            >
              <AvatarDisplay
                avatar={currentSpeaker.avatar}
                size={80}
                speaking={true}
                name={currentSpeaker.name}
              />
            </motion.div>
          ) : (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center">
              <MicOff className="w-5 h-5 text-white/20" />
            </div>
          )}
        </div>

        {/* University banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <div className="text-xs font-serif text-gold/60 uppercase tracking-widest">Excellence University</div>
          <div className="text-xs text-white/25 mt-0.5">Graduation Ceremony 2026</div>
        </div>

        {/* Audience avatars (left side) */}
        <div className="absolute bottom-16 left-4 right-1/3 flex items-end gap-2 overflow-hidden">
          {audience.slice(0, 6).map((attendee, i) => (
            <motion.div
              key={attendee.id}
              animate={{
                y: tick % 2 === 0 && i % 2 === 0 ? -2 : 0,
              }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <AvatarDisplay
                avatar={attendee.avatar}
                size={44}
                name={attendee.name?.split(' ')[0]}
              />
            </motion.div>
          ))}
          {audience.length > 6 && (
            <div className="text-xs text-white/30 ml-1 pb-4">+{audience.length - 6}</div>
          )}
        </div>

        {/* Attendee count */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
          <Users className="w-3 h-3 text-gold" />
          <span className="text-xs text-white/60">{virtualAttendees.length} in room</span>
        </div>
      </div>

      {/* Controls below stage */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Speaker info */}
          <div>
            {currentSpeaker ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Now Speaking</span>
                </div>
                <p className="text-gold text-sm font-medium mt-0.5">{currentSpeaker.name}</p>
                <p className="text-xs text-white/30 capitalize">{currentSpeaker.role}</p>
              </div>
            ) : (
              <div className="text-sm text-white/40">No one on stage</div>
            )}
            {speakerQueue.length > 0 && (
              <p className="text-xs text-white/30 mt-1">{speakerQueue.length} in queue</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!stageRequestSent ? (
              <button
                onClick={joinVirtualStage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-navy font-semibold text-sm hover:shadow-lg hover:shadow-gold/20 transition-all"
              >
                <Mic className="w-4 h-4" />
                Request to Speak
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-gold/20 text-sm text-gold/70">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                In Queue ({speakerQueue.indexOf('me') + 1 || '—'})
              </div>
            )}

            {isAdminAuthenticated && (
              <>
                {currentSpeaker && (
                  <button
                    onClick={dismissSpeaker}
                    className="px-4 py-2.5 rounded-xl glass border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                  >
                    End Turn
                  </button>
                )}
                {speakerQueue.length > 0 && (
                  <button
                    onClick={nextSpeaker}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
