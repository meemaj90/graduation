'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import { MessageSquare, Map, ChevronRight, Radio } from 'lucide-react'

export type SceneId = 'lobby' | 'auditorium'

interface Hotspot {
  id: string
  label: string
  sublabel?: string
  icon: string
  yaw: number    // horizontal degrees: 0=centre of image, negative=left, positive=right
  pitch: number  // vertical degrees: 0=horizon, positive=up, negative=down
  action: 'scene' | 'route'
  target: string
  color: string
}

// Yaw is calibrated against the actual pixel positions in the panorama images:
// lobby image doors (L→R): Auditorium≈-166°, Graduates≈-95°, PhotoBooth≈-50°,
//   Centre fountain≈0°, Programme≈+60°, Awards Hall≈+108°, MemoryLane≈+165°
// auditorium: big screen is dead centre (0°), back exits at ±175°
const SCENES: Record<SceneId, { image: string; title: string; hotspots: Hotspot[] }> = {
  lobby: {
    image: 'https://i.ibb.co/3ymTcPJf/Chat-GPT-Image-Jun-15-2026-07-28-23-AM.png',
    title: 'Welcome Lobby',
    hotspots: [
      { id: 'aud',   label: 'Auditorium',  sublabel: 'Live Ceremony',       icon: '🎭', yaw: -166, pitch: -6, action: 'scene', target: 'auditorium',  color: '#2563eb' },
      { id: 'grads', label: 'Graduates',   sublabel: 'Wall of Fame',        icon: '🎓', yaw:  -95, pitch: -6, action: 'route', target: '/graduates',  color: '#9333ea' },
      { id: 'photo', label: 'Photo Booth', sublabel: 'Capture Memories',    icon: '📷', yaw:  -50, pitch: -6, action: 'route', target: '/photo-booth',color: '#ec4899' },
      { id: 'prog',  label: 'Programme',   sublabel: "Today's Schedule",    icon: '📋', yaw:   60, pitch: -6, action: 'route', target: '/program',    color: '#22c55e' },
      { id: 'awd',   label: 'Awards Hall', sublabel: 'Celebrate Excellence',icon: '🏆', yaw:  108, pitch: -6, action: 'route', target: '/graduates',  color: '#D4AF37' },
      { id: 'mem',   label: 'Memory Lane', sublabel: 'Our Journey',         icon: '❤️', yaw:  165, pitch: -6, action: 'route', target: '/networking', color: '#ef4444' },
    ],
  },
  auditorium: {
    image: 'https://i.ibb.co/h1KSNWWV/Chat-GPT-Image-Jun-15-2026-07-34-27-AM.png',
    title: 'Graduation Ceremony Hall',
    hotspots: [
      { id: 'back', label: 'Back to Lobby', sublabel: 'Exit Hall', icon: '🚪', yaw: 178, pitch: -5, action: 'scene', target: 'lobby', color: '#6b7280' },
    ],
  },
}

// ── Viewer hook ───────────────────────────────────────────────────────────────
function use360Viewer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageUrl: string,
  onReady: () => void,
) {
  const stateRef = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    camera: null as THREE.PerspectiveCamera | null,
    scene: null as THREE.Scene | null,
    rafId: 0,
    dragging: false,
    lastX: 0, lastY: 0,
    yaw: 0, pitch: 0,
    targetYaw: 0, targetPitch: 0,
    fov: 85,
  })

  // Project a (yaw, pitch) sphere point to screen % coords
  const projectToScreen = useCallback((yaw: number, pitch: number) => {
    const s = stateRef.current
    if (!s.camera) return { x: 0, y: 0, visible: false }
    const pitchRad = THREE.MathUtils.degToRad(pitch)
    const yawRad   = THREE.MathUtils.degToRad(yaw - s.yaw)
    const vec = new THREE.Vector3(
      Math.cos(pitchRad) * Math.sin(yawRad),
      Math.sin(pitchRad),
      -Math.cos(pitchRad) * Math.cos(yawRad),
    )
    const camDir = new THREE.Vector3(0, 0, -1).applyEuler(s.camera.rotation)
    if (vec.dot(camDir) < 0.25) return { x: 0, y: 0, visible: false }
    vec.project(s.camera)
    return { x: (vec.x * 0.5 + 0.5) * 100, y: (-vec.y * 0.5 + 0.5) * 100, visible: true }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    // Size canvas to full display pixels for sharpness
    const W = canvas.clientWidth, H = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio, 2)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(dpr)
    renderer.setSize(W, H, false)
    s.renderer = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(s.fov, W / H, 0.1, 1000)
    s.scene = scene; s.camera = camera

    // Sphere — inside facing
    const geo = new THREE.SphereGeometry(500, 80, 60)
    geo.scale(-1, 1, 1)

    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        // Max anisotropy = sharpest possible texture at angles
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.generateMipmaps = true
        scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })))
        onReady()
      },
      undefined,
      () => {
        scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x1a3a8f })))
        onReady()
      }
    )

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      s.yaw   += (s.targetYaw   - s.yaw)   * 0.09
      s.pitch += (s.targetPitch - s.pitch) * 0.09
      camera.rotation.order = 'YXZ'
      camera.rotation.y = THREE.MathUtils.degToRad(-s.yaw)
      camera.rotation.x = THREE.MathUtils.degToRad(s.pitch)
      renderer.render(scene, camera)
    }
    animate()
    s.rafId = rafId

    const onDown = (e: MouseEvent | TouchEvent) => {
      s.dragging = true
      const p = 'touches' in e ? e.touches[0] : e
      s.lastX = p.clientX; s.lastY = p.clientY
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!s.dragging) return
      const p = 'touches' in e ? e.touches[0] : e
      s.targetYaw   += (p.clientX - s.lastX) * 0.18
      s.targetPitch  = Math.max(-80, Math.min(80, s.targetPitch - (p.clientY - s.lastY) * 0.18))
      s.lastX = p.clientX; s.lastY = p.clientY
    }
    const onUp = () => { s.dragging = false }
    const onWheel = (e: WheelEvent) => {
      s.fov = Math.max(40, Math.min(100, s.fov + e.deltaY * 0.04))
      camera.fov = s.fov; camera.updateProjectionMatrix()
    }
    const onResize = () => {
      const W2 = canvas.clientWidth, H2 = canvas.clientHeight
      renderer.setSize(W2, H2, false)
      camera.aspect = W2 / H2; camera.updateProjectionMatrix()
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
    }
  }, [imageUrl])

  return { stateRef, projectToScreen }
}

// ── Tour Guide ────────────────────────────────────────────────────────────────
const GUIDE_TIPS: Record<SceneId, string[]> = {
  lobby: [
    "Welcome to Nextora Academy Graduation 2026! 🎓 Drag to look around!",
    "Click the AUDITORIUM door to watch the live ceremony on stage! 🎭",
    "Visit the GRADUATES wall — see photos of our Class of 2026! 🏆",
    "Head to PHOTO BOOTH to capture your graduation memories! 📷",
    "Check PROGRAMME to see today's full event schedule! 📋",
  ],
  auditorium: [
    "You're in the Graduation Hall! The live stream plays on the big screen. 🎉",
    "Click and drag to look around the full 360° ceremony hall!",
    "Use the reaction buttons below to cheer our graduates! 👏🎓",
    "Head back to the lobby to explore other rooms! 🏛️",
  ],
}

function TourGuide({ scene }: { scene: SceneId }) {
  const [tipIdx, setTipIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const tips = GUIDE_TIPS[scene]

  useEffect(() => { setTipIdx(0); setVisible(true) }, [scene])
  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 6000)
    return () => clearInterval(t)
  }, [tips.length])

  if (!visible) return null
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-20 left-4 z-30 flex items-end gap-3" style={{ maxWidth: 320 }}>
      <div className="flex-shrink-0 relative">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl"
          style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '3px solid #D4AF37' }}>
          🤖
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
      </div>
      <motion.div key={tipIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl rounded-bl-none px-4 py-3 shadow-xl"
        style={{ background: 'rgba(10,20,70,0.95)', border: '1px solid rgba(212,175,55,0.35)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white text-sm leading-relaxed">{tips[tipIdx]}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {tips.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === tipIdx ? 'bg-yellow-400' : 'bg-white/25'}`} />
            ))}
          </div>
          <button onClick={() => setVisible(false)} className="text-white/30 hover:text-white/60 text-xs ml-4">dismiss</button>
        </div>
        <div className="absolute -left-2 bottom-3 w-0 h-0"
          style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '10px solid rgba(10,20,70,0.95)' }} />
      </motion.div>
    </motion.div>
  )
}

const SCHEDULE = [
  { time: '10:00 AM', title: 'Welcome Address' },
  { time: '10:30 AM', title: 'Student Awards' },
  { time: '11:00 AM', title: 'Graduation Ceremony', live: true },
  { time: '12:30 PM', title: 'Photo Session' },
  { time: '1:00 PM',  title: 'Closing Ceremony' },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function VirtualTour({ initialScene = 'lobby' as SceneId }) {
  const router = useRouter()
  const { myName, attendeeCount, bbbJoinUrl, ceremonyStatus, reactions, addReaction } =
    useGraduationStore()

  const [scene, setScene]           = useState<SceneId>(initialScene)
  const [loading, setLoading]       = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [hoveredHs, setHoveredHs]   = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showChat, setShowChat]     = useState(false)
  const [, forceRender]             = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stateRef, projectToScreen } = use360Viewer(
    canvasRef,
    SCENES[scene].image,
    () => setLoading(false),
  )

  // Re-project hotspots every animation frame
  useEffect(() => {
    let raf: number
    const loop = () => { forceRender(n => n + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const goScene = (id: string) => {
    if (transitioning || id === scene) return
    setTransitioning(true)
    setLoading(true)
    setTimeout(() => {
      setScene(id as SceneId)
      stateRef.current.targetYaw = 0
      stateRef.current.targetPitch = 0
      setTransitioning(false)
    }, 500)
  }

  const handleHotspot = (hs: Hotspot) => {
    if (hs.action === 'scene') goScene(hs.target)
    else if (hs.target === '#chat') setShowChat(v => !v)
    else router.push(hs.target)
  }

  const cur = SCENES[scene]

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">

      {/* 360° canvas — explicit width/height for sharpness */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
      />

      {/* Loading screen */}
      <AnimatePresence>
        {(loading || transitioning) && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,20,70,0.96)' }}>
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
            <p className="text-white font-bold text-xl">Nextora Academy</p>
            <p className="text-white/50 text-sm mt-1">Loading {cur.title}…</p>
            <div className="mt-5 w-52 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#D4AF37' }}
                animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hotspots — pinned to sphere coords, move with panorama ── */}
      {!loading && cur.hotspots.map(hs => {
        const pos = projectToScreen(hs.yaw, hs.pitch)
        if (!pos.visible) return null
        return (
          <div key={hs.id} className="absolute z-20"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>
            <button
              onClick={() => handleHotspot(hs)}
              onMouseEnter={() => setHoveredHs(hs.id)}
              onMouseLeave={() => setHoveredHs(null)}
              className="flex flex-col items-center group">
              {/* Outer pulse */}
              <motion.div
                animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-12 h-12 rounded-full"
                style={{ background: hs.color, top: -4, left: -4 }}
              />
              {/* Button */}
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 shadow-xl transition-transform group-hover:scale-110"
                style={{ background: hs.color, border: '2.5px solid white', boxShadow: `0 0 18px ${hs.color}90` }}>
                {hs.icon}
              </div>
              {/* Label badge */}
              <div className="mt-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow"
                style={{ background: 'rgba(8,16,60,0.88)', border: `1px solid ${hs.color}60` }}>
                {hs.label}
              </div>
            </button>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredHs === hs.id && hs.sublabel && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: -6 }} exit={{ opacity: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-2 rounded-xl whitespace-nowrap text-center"
                  style={{ background: 'rgba(8,16,60,0.96)', border: `1px solid ${hs.color}`, boxShadow: `0 0 16px ${hs.color}50` }}>
                  <p className="text-white text-xs font-bold">{hs.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: hs.color }}>{hs.sublabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* ── BBB live screen — auditorium only, overlaid on stage screen ── */}
      {scene === 'auditorium' && !loading && (() => {
        // Stage screen is dead centre of the auditorium image
        const pos = projectToScreen(0, 10)
        if (!pos.visible) return null
        return (
          <div className="absolute z-10 rounded-xl overflow-hidden shadow-2xl pointer-events-auto"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: 500,
              height: 290,
              transform: 'translate(-50%,-50%)',
              border: '3px solid rgba(212,175,55,0.7)',
              boxShadow: '0 0 50px rgba(37,99,235,0.5), 0 0 20px rgba(212,175,55,0.3)',
            }}>
            {bbbJoinUrl ? (
              <iframe src={bbbJoinUrl} className="w-full h-full"
                allow="camera; microphone; display-capture; autoplay"
                style={{ border: 'none' }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6"
                style={{ background: 'linear-gradient(135deg,#071030,#0f2060,#071030)' }}>
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-white font-bold text-base">NEXTORA ACADEMY</p>
                <p className="font-black text-2xl mt-1" style={{ color: '#D4AF37' }}>GRADUATION CEREMONY</p>
                <p className="font-black text-2xl" style={{ color: '#D4AF37' }}>2026</p>
                <p className="text-white/40 text-xs mt-3">Celebrating Excellence · Inspiring Futures</p>
                <p className="text-white/25 text-xs mt-1">Live stream will appear here</p>
              </div>
            )}
            {/* Gold corner accents */}
            {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((c,i) => (
              <div key={i} className={`absolute ${c} w-3 h-3`}
                style={{ background: '#D4AF37', boxShadow: '0 0 8px #D4AF37' }} />
            ))}
          </div>
        )
      })()}

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(8,16,60,0.85)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
          <div>
            <p className="text-white font-bold text-xs leading-none">NEXTORA ACADEMY</p>
            <p className="text-xs leading-none" style={{ color: '#D4AF37' }}>GRADUATION WORLD 2026</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{attendeeCount} online
          </div>
          <div className="px-2.5 py-1 rounded-full text-xs text-white/60"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            📍 {cur.title}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scene === 'auditorium' && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${ceremonyStatus === 'live' ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'text-white/35'}`}>
              <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
              {ceremonyStatus === 'live' ? 'LIVE' : 'Starting Soon'}
            </div>
          )}
          <button onClick={() => setShowSchedule(v => !v)}
            className={`p-2 rounded-lg transition-colors ${showSchedule ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>
            <Map className="w-4 h-4" />
          </button>
          <button onClick={() => setShowChat(v => !v)}
            className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/70'}`}>
            <MessageSquare className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
              {myName ? myName[0].toUpperCase() : '?'}
            </div>
            <span className="text-white text-xs font-semibold">{myName || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* Scene tabs */}
      <div className="absolute top-14 left-4 z-20 flex gap-2">
        {(['lobby','auditorium'] as SceneId[]).map(s => (
          <button key={s} onClick={() => goScene(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${scene === s ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/10'}`}
            style={scene === s ? { background: 'rgba(37,99,235,0.6)', border: '1px solid #2563eb' } : {}}>
            {s === 'lobby' ? '🏛️ Lobby' : '🎭 Auditorium'}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs text-white/40 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          👆 Drag to look around · Scroll to zoom
        </motion.div>
      )}

      {/* Tour guide */}
      {!loading && <TourGuide scene={scene} />}

      {/* Reactions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl"
          style={{ background: 'rgba(8,16,60,0.88)', backdropFilter: 'blur(14px)', border: '1px solid rgba(212,175,55,0.18)' }}>
          {['🎓','👏','❤️','🎉','⭐','😭','🏆'].map(e => (
            <button key={e} onClick={() => addReaction(e)}
              className="text-xl px-2 py-1 rounded-xl hover:bg-white/10 active:scale-90 transition-all">{e}</button>
          ))}
        </div>
      </div>

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -220, scale: 1.8 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-16 text-3xl"
            style={{ left: `${r.x}vw` }}>{r.type}</motion.div>
        ))}
      </div>

      {/* Schedule side panel */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="absolute top-12 right-0 bottom-16 w-72 z-30 flex flex-col"
            style={{ background: 'rgba(8,16,60,0.96)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-bold">Today's Events</p>
              <button onClick={() => setShowSchedule(false)} className="text-white/30 hover:text-white/60 text-xl leading-none">×</button>
            </div>
            <div className="p-4 space-y-2">
              {SCHEDULE.map(s => (
                <div key={s.time} className={`flex items-center gap-3 p-2.5 rounded-xl ${s.live ? 'bg-blue-600/20' : ''}`}>
                  <span className="text-xs text-white/40 w-16 shrink-0">{s.time}</span>
                  <span className={`text-sm font-semibold flex-1 ${s.live ? 'text-white' : 'text-white/55'}`}>{s.title}</span>
                  {s.live && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">LIVE</span>}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} className="p-4 space-y-1">
              <p className="text-white/40 text-xs font-bold uppercase mb-2">Explore Campus</p>
              {[
                { label: 'Lobby',        icon: '🏛️', action: () => { goScene('lobby'); setShowSchedule(false) } },
                { label: 'Auditorium',   icon: '🎭', action: () => { goScene('auditorium'); setShowSchedule(false) } },
                { label: 'Graduates',    icon: '🎓', href: '/graduates' },
                { label: 'Photo Booth',  icon: '📷', href: '/photo-booth' },
                { label: 'Programme',    icon: '📋', href: '/program' },
                { label: 'Networking',   icon: '👥', href: '/networking' },
              ].map(r => r.href
                ? <Link key={r.label} href={r.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                    <span>{r.icon}</span><span className="text-sm font-semibold flex-1">{r.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                : <button key={r.label} onClick={r.action}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                    <span>{r.icon}</span><span className="text-sm font-semibold flex-1">{r.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>
              )}
            </div>
            <div className="p-4 mt-auto">
              <p className="text-white/25 text-xs text-center">UKG→Y1 · Y6→Y7 · Y9→Y10</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
