'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Menu, X, Home, Users, Camera, Calendar, Network, Tv, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const UNI_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME || 'Nextora Academy'
const YEAR = process.env.NEXT_PUBLIC_CEREMONY_YEAR || '2026'

const navLinks = [
  { href: '/lobby', label: 'Lobby', icon: Home },
  { href: '/auditorium', label: 'Auditorium', icon: Tv },
  { href: '/graduates', label: 'Graduates', icon: Users },
  { href: '/photo-booth', label: 'Photo Booth', icon: Camera },
  { href: '/program', label: 'Program', icon: Calendar },
  { href: '/networking', label: 'Networking', icon: Network },
  { href: '/admin', label: 'Admin', icon: Settings },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy/95 backdrop-blur-md border-b border-white/10 shadow-2xl'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/40 group-hover:border-gold transition-colors duration-300">
                  <GraduationCap className="w-5 h-5 text-gold" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold animate-pulse-gold" />
              </div>
              <div>
                <span className="font-playfair text-lg font-bold text-white leading-none block">
                  {UNI_NAME}
                </span>
                <span className="text-xs text-gray-400 tracking-widest uppercase">Class of {YEAR}</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.slice(0, -1).map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'text-gold bg-gold/10 border border-gold/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-2',
                  pathname === '/admin'
                    ? 'text-gold bg-gold/10 border border-gold/20'
                    : 'text-gray-400 hover:text-gold hover:bg-gold/5 border border-white/5'
                )}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-navy-light border-l border-white/10 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-6 h-6 text-gold" />
                    <span className="font-playfair text-lg font-bold text-white">
                      {UNI_NAME}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'text-gold bg-gold/10 border border-gold/20'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                <div className="p-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">© {YEAR} {UNI_NAME}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
