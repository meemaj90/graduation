'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Award, BookOpen, ChevronRight } from 'lucide-react'
import { Graduate } from '@/types'
import { cn, generateInitials, getHonorsBadgeColor } from '@/lib/utils'

interface GraduateCardProps {
  graduate: Graduate
  index?: number
}

export default function GraduateCard({ graduate, index = 0 }: GraduateCardProps) {
  const initials = generateInitials(graduate.name ?? '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/graduates/${graduate.id}`}>
        <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 group-hover:border-gold/30 group-hover:bg-white/8 overflow-hidden">
          {/* Background glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent rounded-2xl" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Avatar */}
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30 group-hover:border-gold/60 transition-colors duration-300 flex-shrink-0">
                  {graduate.photoUrl ? (
                    <Image
                      src={graduate.photoUrl}
                      alt={graduate.name ?? ''}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-navy-mid flex items-center justify-center">
                      <span className="font-playfair text-lg font-bold text-gold">{initials}</span>
                    </div>
                  )}
                </div>
                {graduate.honors && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Award className="w-3 h-3 text-navy" />
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Name & Info */}
            <h3 className="font-playfair text-lg font-bold text-white group-hover:text-gold transition-colors duration-300 mb-1 line-clamp-1">
              {graduate.name}
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{graduate.degree}</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">{graduate.department}</p>

            {/* Honors Badge */}
            {graduate.honors && (
              <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                getHonorsBadgeColor(graduate.honors)
              )}>
                <Award className="w-3 h-3" />
                {graduate.honors}
              </span>
            )}

            {!graduate.honors && (
              <div className="h-6" />
            )}

            {/* Achievements preview */}
            {graduate.achievements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-gray-500 truncate">
                  🏆 {graduate.achievements[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
