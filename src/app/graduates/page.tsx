'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, GraduationCap } from 'lucide-react'
import Navigation from '../../components/Navigation'
import GraduateCard from '../../components/GraduateCard'
import { useGraduationStore } from '../../store/useGraduationStore'

const DEPARTMENTS = ['All', 'Computer Science', 'Business Administration', 'Biomedical Engineering', 'Architecture', 'Data Science', 'Political Science', 'Fine Arts', 'Mechanical Engineering']
const HONORS = ['All', 'Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude']

export default function GraduatesPage() {
  const { graduates } = useGraduationStore()
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [honors, setHonors] = useState('All')

  const filtered = useMemo(() => {
    return graduates.filter((g) => {
      const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase()) ||
        g.department?.toLowerCase().includes(search.toLowerCase()) ||
        g.degree?.toLowerCase().includes(search.toLowerCase())
      const matchDept = dept === 'All' || g.department === dept
      const matchHonors = honors === 'All' || g.honors === honors
      return matchSearch && matchDept && matchHonors
    })
  }, [graduates, search, dept, honors])

  return (
    <div className="min-h-screen bg-navy">
      <Navigation />

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-gold" />
            <span className="text-sm text-gold uppercase tracking-widest font-semibold">Class of 2026</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white">Graduate Directory</h1>
          <p className="text-white/50 mt-2">{graduates.length} graduates celebrating their achievement</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, department, or degree..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 cursor-pointer"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-navy">{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
            <select
              value={honors}
              onChange={(e) => setHonors(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold/40 cursor-pointer"
            >
              {HONORS.map((h) => <option key={h} value={h} className="bg-navy">{h === 'All' ? 'All Honours' : h}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Results count */}
        {search || dept !== 'All' || honors !== 'All' ? (
          <p className="text-sm text-white/40 mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
        ) : null}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No graduates found</h3>
            <p className="text-white/40">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((grad, i) => (
              <GraduateCard key={grad.id} graduate={grad} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
