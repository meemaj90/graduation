'use client'
import { AvatarCustomization } from '../types'

interface AvatarDisplayProps {
  avatar: AvatarCustomization
  size?: number
  speaking?: boolean
  name?: string
  className?: string
}

export default function AvatarDisplay({ avatar, size = 80, speaking = false, name, className = '' }: AvatarDisplayProps) {
  const s = size
  const cx = s / 2
  const mouthOpen = speaking

  // Gown shape based on outfit
  const gownPath = avatar.outfit === 'gown'
    ? `M${cx - s * 0.22} ${s * 0.55} L${cx - s * 0.30} ${s * 0.95} L${cx + s * 0.30} ${s * 0.95} L${cx + s * 0.22} ${s * 0.55} Z`
    : avatar.outfit === 'suit'
    ? `M${cx - s * 0.18} ${s * 0.55} L${cx - s * 0.26} ${s * 0.95} L${cx + s * 0.26} ${s * 0.95} L${cx + s * 0.18} ${s * 0.55} Z`
    : `M${cx - s * 0.20} ${s * 0.55} L${cx - s * 0.28} ${s * 0.95} L${cx + s * 0.28} ${s * 0.95} L${cx + s * 0.20} ${s * 0.55} Z`

  // Hair paths
  const getHair = () => {
    const headTop = s * 0.18
    const headR = s * 0.19
    switch (avatar.hairStyle) {
      case 'long':
        return <ellipse cx={cx} cy={headTop + headR * 0.3} rx={headR * 1.15} ry={headR * 1.2} fill={avatar.hairColor} />
      case 'curly':
        return (
          <g fill={avatar.hairColor}>
            {[-1, 0, 1].map((i) => (
              <circle key={i} cx={cx + i * headR * 0.7} cy={headTop} r={headR * 0.5} />
            ))}
          </g>
        )
      case 'afro':
        return <circle cx={cx} cy={headTop + headR * 0.2} r={headR * 1.3} fill={avatar.hairColor} />
      case 'bun':
        return (
          <g fill={avatar.hairColor}>
            <ellipse cx={cx} cy={headTop + headR * 0.1} rx={headR * 1.05} ry={headR * 0.7} />
            <circle cx={cx} cy={headTop - headR * 0.4} r={headR * 0.35} />
          </g>
        )
      case 'bald':
        return null
      default: // short
        return <ellipse cx={cx} cy={headTop + headR * 0.1} rx={headR * 1.05} ry={headR * 0.65} fill={avatar.hairColor} />
    }
  }

  return (
    <div className={`relative inline-block ${className}`} style={{ width: s, height: s + (name ? 24 : 0) }}>
      {/* Speaking ring */}
      {speaking && (
        <div
          className="absolute rounded-full border-2 border-gold animate-ping"
          style={{ inset: -4, borderRadius: '50%' }}
        />
      )}

      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="overflow-visible">
        {/* If using photo, mask it into the head circle */}
        {avatar.usePhoto && avatar.photoUrl ? (
          <>
            <defs>
              <clipPath id={`face-clip-${s}`}>
                <circle cx={cx} cy={s * 0.35} r={s * 0.19} />
              </clipPath>
            </defs>
            {/* Body */}
            <path d={gownPath} fill={avatar.outfitColor} />
            {/* Photo face */}
            <image href={avatar.photoUrl} x={cx - s * 0.19} y={s * 0.16} width={s * 0.38} height={s * 0.38} clipPath={`url(#face-clip-${s})`} preserveAspectRatio="xMidYMid slice" />
            {/* Cap */}
            <rect x={cx - s * 0.22} y={s * 0.13} width={s * 0.44} height={s * 0.05} rx={2} fill={avatar.capColor} />
            <rect x={cx - s * 0.08} y={s * 0.06} width={s * 0.16} height={s * 0.10} rx={2} fill={avatar.capColor} />
            <line x1={cx + s * 0.07} y1={s * 0.10} x2={cx + s * 0.18} y2={s * 0.22} stroke="#D4AF37" strokeWidth={s * 0.018} />
          </>
        ) : (
          <>
            {/* Body / outfit */}
            <path d={gownPath} fill={avatar.outfitColor} />
            {/* Neck */}
            <rect x={cx - s * 0.05} y={s * 0.50} width={s * 0.10} height={s * 0.08} fill={avatar.skinTone} />
            {/* Head (behind hair) */}
            <circle cx={cx} cy={s * 0.35} r={s * 0.19} fill={avatar.skinTone} />
            {/* Hair (behind head for long/afro) */}
            {getHair()}
            {/* Face on top */}
            <circle cx={cx} cy={s * 0.35} r={s * 0.19} fill={avatar.skinTone} />
            {/* Eyes */}
            <ellipse cx={cx - s * 0.07} cy={s * 0.33} rx={s * 0.025} ry={s * 0.028} fill="#2C1810" />
            <ellipse cx={cx + s * 0.07} cy={s * 0.33} rx={s * 0.025} ry={s * 0.028} fill="#2C1810" />
            {/* Eyebrows */}
            <path d={`M${cx - s * 0.10} ${s * 0.29} Q${cx - s * 0.07} ${s * 0.27} ${cx - s * 0.04} ${s * 0.29}`} stroke="#2C1810" strokeWidth={s * 0.013} fill="none" />
            <path d={`M${cx + s * 0.04} ${s * 0.29} Q${cx + s * 0.07} ${s * 0.27} ${cx + s * 0.10} ${s * 0.29}`} stroke="#2C1810" strokeWidth={s * 0.013} fill="none" />
            {/* Mouth */}
            {mouthOpen ? (
              <ellipse cx={cx} cy={s * 0.41} rx={s * 0.05} ry={s * 0.035} fill="#8B3A3A" />
            ) : (
              <path d={`M${cx - s * 0.06} ${s * 0.40} Q${cx} ${s * 0.43} ${cx + s * 0.06} ${s * 0.40}`} stroke="#8B3A3A" strokeWidth={s * 0.015} fill="none" />
            )}
            {/* Accessory */}
            {avatar.accessory === 'glasses' && (
              <g stroke="#888" strokeWidth={s * 0.015} fill="none">
                <circle cx={cx - s * 0.07} cy={s * 0.33} r={s * 0.04} />
                <circle cx={cx + s * 0.07} cy={s * 0.33} r={s * 0.04} />
                <line x1={cx - s * 0.03} y1={s * 0.33} x2={cx + s * 0.03} y2={s * 0.33} />
              </g>
            )}
            {avatar.accessory === 'sunglasses' && (
              <g>
                <rect x={cx - s * 0.13} y={s * 0.295} width={s * 0.11} height={s * 0.06} rx={s * 0.02} fill="#222" opacity={0.9} />
                <rect x={cx + s * 0.02} y={s * 0.295} width={s * 0.11} height={s * 0.06} rx={s * 0.02} fill="#222" opacity={0.9} />
                <line x1={cx - s * 0.02} y1={s * 0.325} x2={cx + s * 0.02} y2={s * 0.325} stroke="#555" strokeWidth={s * 0.012} />
              </g>
            )}
            {/* Graduation cap */}
            <rect x={cx - s * 0.22} y={s * 0.155} width={s * 0.44} height={s * 0.05} rx={2} fill={avatar.capColor} />
            <rect x={cx - s * 0.09} y={s * 0.07} width={s * 0.18} height={s * 0.10} rx={2} fill={avatar.capColor} />
            {/* Tassel */}
            <line x1={cx + s * 0.08} y1={s * 0.10} x2={cx + s * 0.20} y2={s * 0.24} stroke="#D4AF37" strokeWidth={s * 0.018} />
            <circle cx={cx + s * 0.20} cy={s * 0.24} r={s * 0.02} fill="#D4AF37" />
          </>
        )}
      </svg>

      {/* Name label */}
      {name && (
        <div
          className={`text-center text-xs font-medium truncate mt-0.5 px-1 rounded ${speaking ? 'text-gold' : 'text-white/70'}`}
          style={{ maxWidth: s, fontSize: Math.max(9, s * 0.11) }}
        >
          {name}
        </div>
      )}

      {/* Speaking badge */}
      {speaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold text-navy text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ fontSize: 9 }}>
          🎤 Speaking
        </div>
      )}
    </div>
  )
}
