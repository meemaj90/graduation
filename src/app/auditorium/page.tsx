'use client'
import dynamic from 'next/dynamic'

const VirtualTour = dynamic(() => import('../../components/VirtualTour'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0a1440' }}>
      <div className="text-6xl mb-4 animate-bounce">🎭</div>
      <p className="text-white font-bold text-lg">Graduation Hall</p>
      <p className="text-white/40 text-sm mt-1">Loading ceremony…</p>
      <div className="mt-4 w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full animate-pulse" style={{ width: '80%', background: '#D4AF37' }} />
      </div>
    </div>
  ),
})

export default function AuditoriumPage() {
  return <VirtualTour initialScene="auditorium" />
}
