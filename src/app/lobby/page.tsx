'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useGraduationStore } from '../../store/useGraduationStore'
import AvatarOnboarding from '../../components/AvatarOnboarding'

const VirtualTour = dynamic(() => import('../../components/VirtualTour'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0a1440' }}>
      <div className="text-6xl mb-4 animate-bounce">🎓</div>
      <p className="text-white font-bold text-lg">Nextora Academy</p>
      <p className="text-white/40 text-sm mt-1">Loading Graduation World 2026…</p>
      <div className="mt-4 w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full animate-pulse" style={{ width: '70%', background: '#D4AF37' }} />
      </div>
    </div>
  ),
})

export default function LobbyPage() {
  const myName = useGraduationStore(s => s.myName)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Show onboarding only if name hasn't been set yet
    if (!myName) setShowOnboarding(true)
  }, [myName])

  return (
    <>
      {showOnboarding && (
        <AvatarOnboarding onComplete={() => setShowOnboarding(false)} />
      )}
      <VirtualTour initialScene="lobby" />
    </>
  )
}
