'use client'
import { motion } from 'framer-motion'
import { Users, Video, Lock } from 'lucide-react'
import { NetworkingTable } from '../types'

const gradients = [
  'from-blue-600 to-cyan-600',
  'from-purple-600 to-pink-600',
  'from-green-600 to-teal-600',
  'from-orange-500 to-red-600',
  'from-yellow-500 to-amber-600',
  'from-gold-dark to-gold',
]

export default function NetworkingTableCard({ table, index }: { table: NetworkingTable; index: number }) {
  const isFull = table.occupants.length >= table.seats
  const gradient = gradients[index % gradients.length]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
    >
      <div className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-300">
        {/* Header gradient */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white">{table.name}</h3>
              <p className="text-xs text-gold/70 mt-0.5">{table.theme}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users className="w-3.5 h-3.5" />
              <span>{table.occupants.length}/{table.seats}</span>
            </div>
          </div>

          {/* Seats */}
          <div className="flex gap-1.5 my-4">
            {Array.from({ length: table.seats }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < table.occupants.length
                    ? `bg-gradient-to-r ${gradient}`
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-white/40 mb-4 line-clamp-2">
            {table.seats - table.occupants.length > 0
              ? `${table.seats - table.occupants.length} seats available`
              : 'Table is full'}
          </p>

          {table.bbbLink ? (
            <a
              href={table.bbbLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isFull ? 'bg-white/5 text-white/30 cursor-not-allowed' : `bg-gradient-to-r ${gradient} text-white hover:opacity-90 hover:shadow-lg`}`}
              onClick={isFull ? (e) => e.preventDefault() : undefined}
            >
              {isFull ? (
                <>
                  <Lock className="w-4 h-4" />
                  Table Full
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Join Table
                </>
              )}
            </a>
          ) : (
            <button className="w-full py-2.5 rounded-xl text-sm text-white/30 glass cursor-not-allowed">
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
