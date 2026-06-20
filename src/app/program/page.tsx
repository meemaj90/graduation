'use client'

import { useGraduationStore } from '@/store/useGraduationStore'
import Navigation from '@/components/Navigation'

export default function ProgramPage() {
  const { programItems } = useGraduationStore()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a1628 0%,#0d1f4c 50%,#0a1628 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '104px 16px 60px' }}>
      <Navigation />
      {/* Booklet */}
      <div style={{ width: '100%', maxWidth: 720, background: 'linear-gradient(170deg,#fdf8ef 0%,#f5ead5 40%,#fdf3e0 100%)', borderRadius: 8, boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 0 1px #c8a84b55', overflow: 'hidden', fontFamily: 'Georgia, "Times New Roman", serif' }}>

        {/* Gold top bar */}
        <div style={{ height: 10, background: 'linear-gradient(90deg,#8b6914,#D4AF37,#FFD700,#D4AF37,#8b6914)' }} />

        {/* Header section */}
        <div style={{ background: 'linear-gradient(160deg,#0a2472,#0d1f5c,#081848)', padding: '40px 48px 36px', textAlign: 'center', position: 'relative' }}>
          {/* Corner ornaments */}
          {['topleft','topright','botleft','botright'].map((pos) => (
            <div key={pos} style={{ position: 'absolute', width: 32, height: 32, top: pos.startsWith('top') ? 12 : undefined, bottom: pos.startsWith('bot') ? 12 : undefined, left: pos.endsWith('left') ? 12 : undefined, right: pos.endsWith('right') ? 12 : undefined, borderTop: pos.startsWith('top') ? '2px solid #D4AF37' : 'none', borderBottom: pos.startsWith('bot') ? '2px solid #D4AF37' : 'none', borderLeft: pos.endsWith('left') ? '2px solid #D4AF37' : 'none', borderRight: pos.endsWith('right') ? '2px solid #D4AF37' : 'none' }} />
          ))}
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#D4AF37', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'Georgia,serif' }}>Nextora Academy</div>
          <div style={{ fontSize: 13, letterSpacing: 2, color: '#D4AF37aa', marginBottom: 8, fontFamily: 'Georgia,serif' }}>Presents</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#FFD700', letterSpacing: 2, textShadow: '0 2px 16px #D4AF3780', marginBottom: 6 }}>GRADUATION CEREMONY</div>
          <div style={{ fontSize: 17, color: '#D4AF37cc', letterSpacing: 1, marginBottom: 4 }}>2025 / 2026 Academic Session</div>
          <div style={{ color: '#ffffff88', fontSize: 13, marginTop: 16, letterSpacing: 1 }}>UKG → Year 1 &nbsp;|&nbsp; Year 6 → Year 7 &nbsp;|&nbsp; Year 9 → Year 10</div>
        </div>

        {/* Gold divider */}
        <div style={{ height: 6, background: 'linear-gradient(90deg,#8b6914,#D4AF37,#FFD700,#D4AF37,#8b6914)' }} />

        {/* Programme body */}
        <div style={{ padding: '36px 48px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: '#8b6914', marginBottom: 6 }}>Order of Events</div>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#D4AF37,transparent)' }} />
          </div>

          {/* Programme items */}
          <div>
            {programItems.map((item, i) => (
              <div key={item.id} style={{ display: 'flex', gap: 20, marginBottom: 28, paddingBottom: 28, borderBottom: i < programItems.length - 1 ? '1px solid #D4AF3730' : 'none' }}>
                {/* Time column */}
                <div style={{ minWidth: 72, textAlign: 'right', paddingTop: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#8b6914', letterSpacing: 0.5 }}>{item.time}</div>
                  <div style={{ fontSize: 10, color: '#8b691488', marginTop: 2 }}>{item.duration} min</div>
                </div>

                {/* Dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#D4AF37,#FFD700)', boxShadow: '0 0 0 3px #D4AF3720', flexShrink: 0 }} />
                  <div style={{ flex: 1, width: 1, background: 'linear-gradient(#D4AF3740,transparent)', marginTop: 4 }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1005', marginBottom: 4, lineHeight: 1.3 }}>{item.title}</div>
                  {item.speaker && (
                    <div style={{ fontSize: 12, color: '#8b6914', fontStyle: 'italic', marginBottom: 6 }}>{item.speaker}</div>
                  )}
                  <div style={{ fontSize: 13, color: '#4a3a1e', lineHeight: 1.7 }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 16, padding: '16px 24px', background: '#D4AF3712', border: '1px solid #D4AF3730', borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8b6914', fontStyle: 'italic', lineHeight: 1.7 }}>
              Times are approximate and may be subject to adjustment on the day.<br />
              All guests are kindly requested to be seated by 9:15 AM.
            </div>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div style={{ height: 10, background: 'linear-gradient(90deg,#8b6914,#D4AF37,#FFD700,#D4AF37,#8b6914)' }} />
      </div>
    </div>
  )
}
