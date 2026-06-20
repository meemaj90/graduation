'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'

const HIDDEN_ON = ['/admin', '/lobby', '/auditorium']

export default function FloatingWishButton() {
  const pathname = usePathname()
  if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null

  return (
    <Link
      href="/graduates"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-white shadow-2xl transition-all hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, #E8720C, #E8720C)',
        boxShadow: '0 8px 24px rgba(232,114,12,0.45)',
      }}
    >
      <Heart className="w-4 h-4" />
      <span>Write a Well Wish</span>
    </Link>
  )
}
