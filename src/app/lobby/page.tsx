'use client'
import dynamic from 'next/dynamic'

const MetaverseLobby = dynamic(() => import('../../components/MetaverseLobby'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-navy flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🎓</div>
        <p className="text-white/50 text-sm">Loading 3D Graduation Hall...</p>
        <div className="mt-4 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gold rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  ),
})

export default function LobbyPage() {
  return <MetaverseLobby />
}
