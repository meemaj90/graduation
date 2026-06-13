'use client'
import { motion } from 'framer-motion'
import { Users, Wifi } from 'lucide-react'
import Navigation from '../../components/Navigation'
import NetworkingTableCard from '../../components/NetworkingTableCard'
import { useGraduationStore } from '../../store/useGraduationStore'

export default function NetworkingPage() {
  const { networkingTables, attendeeCount } = useGraduationStore()

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-gold" />
            <span className="text-sm text-gold uppercase tracking-widest font-semibold">Networking Lounge</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white">Connect with Peers</h1>
          <p className="text-white/50 mt-2">Join a virtual table and connect via BigBlueButton breakout rooms</p>
        </motion.div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold mb-8"
        >
          <Wifi className="w-4 h-4 text-gold" />
          <span className="text-sm text-gold">{attendeeCount} people online right now</span>
        </motion.div>

        {/* Info banner */}
        <div className="glass rounded-2xl p-5 mb-8 border border-white/5 flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-semibold text-white mb-1">How it works</h3>
            <p className="text-sm text-white/50">
              Each table is a themed virtual room powered by BigBlueButton. Click <strong className="text-white/70">Join Table</strong> to enter 
              the video call with other attendees at that table. You can move between tables freely.
            </p>
          </div>
        </div>

        {/* Tables grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {networkingTables.map((table, i) => (
            <NetworkingTableCard key={table.id} table={table} index={i} />
          ))}
        </div>

        {/* Etiquette */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 glass rounded-2xl p-6 border border-white/5"
        >
          <h3 className="font-semibold text-white mb-4">🤝 Networking Etiquette</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🎙️', title: 'Introduce yourself', desc: 'Start with your name, degree, and one thing you\'re excited about after graduation.' },
              { icon: '👂', title: 'Listen actively', desc: 'Be genuinely curious about others\' journeys. Great connections start with great listening.' },
              { icon: '📲', title: 'Exchange contacts', desc: 'Use the LinkedIn profiles on graduate pages to connect and keep in touch afterward.' },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{tip.title}</p>
                  <p className="text-xs text-white/40 mt-1">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
