'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import {
  Users, MessageSquare, Map, Home, ChevronRight,
  Radio, Mic, Camera, Smile, Hand,
} from 'lucide-react'

// ── Scene definitions ─────────────────────────────────────────────────────────
export type SceneId = 'lobby' | 'auditorium'

interface Hotspot {
  id: string
  label: string
  sublabel?: string
  icon: string
  // Spherical coords: yaw = horizontal (-180 to 180), pitch = vertical (-90 to 90)
  yaw: number
  pitch: number
  action: 'scene' | 'route'
  target: string   // scene id or route path
  color: string
}

const SCENES: Record<SceneId, { image: string; title: string; hotspots: Hotspot[] }> = {
  lobby: {
    image: 'https://i.ibb.co/3ymTcPJf/Chat-GPT-Image-Jun-15-2026-07-28-23-AM.png',
    title: 'Welcome Lobby',
    hotspots: [
      { id: 'aud',   label: 'Auditorium',  sublabel: 'Live Ceremony',          icon: '🎭', yaw: -155, pitch: -8,  action: 'scene', target: 'auditorium', color: '#2563eb' },
      { id: 'grads', label: 'Graduates',   sublabel: 'Class of 2026',           icon: '🎓', yaw: -95,  pitch: -8,  action: 'route', target: '/graduates', color: '#9333ea' },
      { id: 'photo', label: 'Photo Booth', sublabel: 'Capture Memories',        icon: '📷', yaw: -42,  pitch: -8,  action: 'route', target: '/photo-booth', color: '#ec4899' },
      { id: 'prog',  label: 'Programme',   sublabel: "Today's Schedule",        icon: '📋', yaw:  55,  pitch: -8,  action: 'route', target: '/program',    color: '#22c55e' },
      { id: 'awd',   label: 'Awards Hall', sublabel: 'Celebrate Excellence',    icon: '🏆', yaw:  105, pitch: -8,  action: 'route', target: '/graduates',  color: '#D4AF37' },
      { id: 'mem',   label: 'Memory Lane', sublabel: 'Our Journey',             icon: '❤️', yaw:  155, pitch: -8,  action: 'route', target: '/networking', color: '#ef4444' },
    ],
  },
  auditorium: {
    image: 'https://i.ibb.co/h1KSNWWV/Chat-GPT-Image-Jun-15-2026-07-34-27-AM.png',
    title: 'Graduation Ceremony Hall',
    hotspots: [
      { id: 'back',  label: 'Back to Lobby', sublabel: 'Exit Hall',            icon: '🚪', yaw: 175,  pitch: -5,  action: 'scene', target: 'lobby',      color: '#6b7280' },
      { id: 'chat',  label: 'Live Chat',      sublabel: 'Join conversation',    icon: '💬', yaw: -160, pitch: -5,  action: 'route', target: '#chat',      color: '#2563eb' },
    ],
  },
}

// ── 360° Three.js viewer hook ─────────────────────────────────────────────────
function use360Viewer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageUrl: string,
  onReady: () => void,
) {
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null
    scene: THREE.Scene | null
    camera: THREE.PerspectiveCamera | null
    rafId: number
    isDragging: boolean
    lastX: number
    lastY: number
    yaw: number
    pitch: number
    targetYaw: number
    targetPitch: number
  }>({
    renderer: null, scene: null, camera: null,
    rafId: 0, isDragging: false,
    lastX: 0, lastY: 0,
    yaw: 0, pitch: 0,
    targetYaw: 0, targetPitch: 0,
  })

  // Convert spherical (yaw, pitch) to a screen position percentage
  const projectToScreen = (yaw: number, pitch: number): { x: number; y: number; visible: boolean } => {
    const s = stateRef.current
    if (!s.camera) return { x: 0, y: 0, visible: false }

    const pitchRad = THREE.MathUtils.degToRad(pitch)
    const yawRad = THREE.MathUtils.degToRad(yaw - s.yaw)

    // Point on unit sphere
    const vec = new THREE.Vector3(
      Math.cos(pitchRad) * Math.sin(yawRad),
      Math.sin(pitchRad),
      -Math.cos(pitchRad) * Math.cos(yawRad),
    )

    // Check if in front of camera
    const cameraDir = new THREE.Vector3(0, 0, -1)
    cameraDir.applyEuler(s.camera.rotation)
    const dot = vec.dot(cameraDir)
    if (dot < 0.2) return { x: 0, y: 0, visible: false }

    // Project
    vec.project(s.camera)
    return {
      x: (vec.x * 0.5 + 0.5) * 100,
      y: (-vec.y * 0.5 + 0.5) * 100,
      visible: true,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    s.renderer = renderer

    // Scene + camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(90, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    s.scene = scene; s.camera = camera

    // Sphere geometry (inside facing)
    const geo = new THREE.SphereGeometry(500, 60, 40)
    geo.scale(-1, 1, 1)

    // Load texture
    const loader = new THREE.TextureLoader()
    loader.load(
      imageUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        const mat = new THREE.MeshBasicMaterial({ map: texture })
        const mesh = new THREE.Mesh(geo, mat)
        scene.add(mesh)
        onReady()
      },
      undefined,
      () => {
        // Fallback: solid color sphere
        const mat = new THREE.MeshBasicMaterial({ color: 0x1a3a8f })
        const mesh = new THREE.Mesh(geo, mat)
        scene.add(mesh)
        onReady()
      }
    )

    // Animate
    const animate = () => {
      s.rafId = requestAnimationFrame(animate)
      // Smooth camera
      s.yaw += (s.targetYaw - s.yaw) * 0.08
      s.pitch += (s.targetPitch - s.pitch) * 0.08
      camera.rotation.order = 'YXZ'
      camera.rotation.y = THREE.MathUtils.degToRad(-s.yaw)
      camera.rotation.x = THREE.MathUtils.degToRad(s.pitch)
      renderer.render(scene, camera)
    }
    animate()

    // Mouse/touch drag
    const onDown = (e: MouseEvent | TouchEvent) => {
      s.isDragging = true
      const pos = 'touches' in e ? e.touches[0] : e
      s.lastX = pos.clientX; s.lastY = pos.clientY
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!s.isDragging) return
      const pos = 'touches' in e ? e.touches[0] : e
      const dx = pos.clientX - s.lastX
      const dy = pos.clientY - s.lastY
      s.targetYaw += dx * 0.2
      s.targetPitch = Math.max(-85, Math.min(85, s.targetPitch - dy * 0.2))
      s.lastX = pos.clientX; s.lastY = pos.clientY
    }
    const onUp = () => { s.isDragging = false }
    const onWheel = (e: WheelEvent) => {
      camera.fov = Math.max(40, Math.min(100, camera.fov + e.deltaY * 0.05))
      camera.updateProjectionMatrix()
    }
    const onResize = () => {
      if (!canvas) return
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
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
      cancelAnimationFrame(s.rafId)
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
    "Welcome to Nextora Academy Graduation 2026! 🎓 Click any door to explore!",
    "Head through the Auditorium door to watch the live ceremony! 🎭",
    "Visit the Graduates wall to see Class of 2026 profiles! 🏆",
    "Look around by clicking and dragging — it's a full 360° tour!",
  ],
  auditorium: [
    "You're in the Graduation Hall! The live ceremony plays on the big screen. 🎉",
    "When the ceremony is live, the BBB stream appears on stage!",
    "Use the reaction buttons to cheer on our graduates! 👏",
    "Head back to the lobby to explore other rooms!",
  ],
}

function TourGuide({ scene }: { scene: SceneId }) {
  const [tipIdx, setTipIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const tips = GUIDE_TIPS[scene]

  useEffect(() => {
    setTipIdx(0)
    setVisible(true)
  }, [scene])

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 6000)
    return () => clearInterval(t)
  }, [tips.length])

  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-20 left-4 z-30 flex items-end gap-3"
      style={{ maxWidth: 320 }}>
      {/* Guide character */}
      <div className="flex-shrink-0 relative">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl"
          style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '3px solid #D4AF37' }}>
          🤖
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
      </div>
      {/* Speech bubble */}
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
        {/* Bubble tail */}
        <div className="absolute -left-2 bottom-3 w-0 h-0"
          style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '10px solid rgba(10,20,70,0.95)' }} />
      </motion.div>
    </motion.div>
  )
}

// ── Schedule panel ────────────────────────────────────────────────────────────
const SCHEDULE = [
  { time: '10:00 AM', title: 'Welcome Address' },
  { time: '10:30 AM', title: 'Student Awards' },
  { time: '11:00 AM', title: 'Graduation Ceremony', live: true },
  { time: '12:30 PM', title: 'Photo Session' },
  { time: '1:00 PM',  title: 'Closing Ceremony' },
]

// ── Main Virtual Tour Component ───────────────────────────────────────────────
interface VirtualTourProps {
  initialScene?: SceneId
}

export default function VirtualTour({ initialScene = 'lobby' }: VirtualTourProps) {
  const router = useRouter()
  const { myName, attendeeCount, bbbJoinUrl, ceremonyStatus, reactions, addReaction } =
    useGraduationStore()

  const [scene, setScene] = useState<SceneId>(initialScene)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [tick, setTick] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stateRef, projectToScreen } = use360Viewer(
    canvasRef,
    SCENES[scene].image,
    () => setLoading(false),
  )

  // Re-render hotspots every frame
  useEffect(() => {
    let raf: number
    const loop = () => { setTick(t => t + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const goToScene = (targetScene: string) => {
    if (transitioning) return
    setTransitioning(true)
    setLoading(true)
    setTimeout(() => {
      setScene(targetScene as SceneId)
      stateRef.current.targetYaw = 0
      stateRef.current.targetPitch = 0
      setTransitioning(false)
    }, 600)
  }

  const handleHotspot = (hs: Hotspot) => {
    if (hs.action === 'scene') {
      goToScene(hs.target)
    } else if (hs.target === '#chat') {
      setShowChat(v => !v)
    } else {
      router.push(hs.target)
    }
  }

  const currentScene = SCENES[scene]

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">

      {/* ── 360° canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
        style={{ cursor: 'grab', touchAction: 'none' }} />

      {/* Loading overlay */}
      <AnimatePresence>
        {(loading || transitioning) && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,20,70,0.95)' }}>
            <div className="text-5xl mb-4 animate-bounce">🎓</div>
            <p className="text-white font-bold text-lg">Nextora Academy</p>
            <p className="text-white/50 text-sm mt-1">Loading {currentScene.title}…</p>
            <div className="mt-4 w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#D4AF37' }}
                animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hotspots (positioned via projection) ── */}
      {!loading && currentScene.hotspots.map(hs => {
        const pos = projectToScreen(hs.yaw, hs.pitch)
        if (!pos.visible) return null
        return (
          <div key={hs.id} className="absolute z-20 pointer-events-auto"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>
            <button
              onClick={() => handleHotspot(hs)}
              onMouseEnter={() => setHoveredHotspot(hs.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              className="relative flex flex-col items-center">
              {/* Pulse rings */}
              <motion.div animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute w-10 h-10 rounded-full"
                style={{ background: hs.color, top: 0, left: 0 }} />
              {/* Main button */}
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-xl text-xl z-10"
                style={{ background: hs.color, border: '2px solid white', boxShadow: `0 0 20px ${hs.color}80` }}>
                {hs.icon}
              </div>
              {/* Label */}
              <div className="mt-1 px-2 py-0.5 rounded-lg text-xs font-bold text-white whitespace-nowrap"
                style={{ background: 'rgba(10,20,70,0.85)', border: `1px solid ${hs.color}50` }}>
                {hs.label}
              </div>
            </button>

            {/* Tooltip on hover */}
            <AnimatePresence>
              {hoveredHotspot === hs.id && hs.sublabel && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: -4 }} exit={{ opacity: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 rounded-xl whitespace-nowrap"
                  style={{ background: 'rgba(10,20,70,0.95)', border: `1px solid ${hs.color}`, boxShadow: `0 0 12px ${hs.color}40` }}>
                  <p className="text-white text-xs font-bold">{hs.label}</p>
                  <p className="text-xs" style={{ color: hs.color }}>{hs.sublabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* BBB iframe — only in auditorium, center of screen */}
      {scene === 'auditorium' && !loading && (() => {
        const pos = projectToScreen(0, 8)
        if (!pos.visible) return null
        const w = 480, h = 270
        return (
          <div className="absolute z-10 pointer-events-auto rounded-xl overflow-hidden shadow-2xl"
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              width: w, height: h,
              transform: 'translate(-50%,-50%)',
              border: '3px solid rgba(212,175,55,0.6)',
              boxShadow: '0 0 40px rgba(37,99,235,0.5)',
            }}>
            {bbbJoinUrl ? (
              <iframe src={bbbJoinUrl} className="w-full h-full"
                allow="camera; microphone; display-capture; autoplay"
                style={{ border: 'none' }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4"
                style={{ background: 'linear-gradient(135deg,#0a1440,#1a3a8f)' }}>
                <div className="text-3xl mb-2">🎓</div>
                <p className="text-white font-bold">NEXTORA ACADEMY</p>
                <p className="font-black text-xl" style={{ color: '#D4AF37' }}>GRADUATION CEREMONY 2026</p>
                <p className="text-white/40 text-xs mt-2">Live stream appears here</p>
                <p className="text-white/25 text-xs">Celebrating Excellence · Inspiring Futures</p>
              </div>
            )}
          </div>
        )
      })()}

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(10,20,70,0.85)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>
            🎓
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-none">NEXTORA ACADEMY</p>
            <p className="text-xs leading-none" style={{ color: '#D4AF37' }}>GRADUATION WORLD 2026</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {attendeeCount} online
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-white/50">📍</span>
            <span className="text-white/70 font-semibold">{currentScene.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scene === 'auditorium' && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
              ceremonyStatus === 'live' ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-white/8 text-white/40'}`}>
              <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
              {ceremonyStatus === 'live' ? 'LIVE' : 'Soon'}
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
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
              {myName ? myName[0].toUpperCase() : '?'}
            </div>
            <span className="text-white text-xs font-semibold">{myName || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* ── SCENE SWITCHER — breadcrumb ── */}
      <div className="absolute top-14 left-4 z-20 flex items-center gap-2">
        {(['lobby', 'auditorium'] as SceneId[]).map((s, i) => (
          <button key={s} onClick={() => goToScene(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              scene === s
                ? 'text-white shadow-lg'
                : 'text-white/40 hover:text-white/70 hover:bg-white/10'}`}
            style={scene === s ? { background: 'rgba(37,99,235,0.6)', border: '1px solid rgba(37,99,235,0.8)' } : {}}>
            {s === 'lobby' ? '🏛️' : '🎭'} {s === 'lobby' ? 'Lobby' : 'Auditorium'}
          </button>
        ))}
      </div>

      {/* ── DRAG HINT ── */}
      {!loading && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-1.5 rounded-full text-xs text-white/50"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
            👆 Click & drag to look around · Scroll to zoom
          </motion.div>
        </div>
      )}

      {/* ── TOUR GUIDE ── */}
      {!loading && <TourGuide scene={scene} />}

      {/* ── REACTION BAR ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 px-3 py-2 rounded-2xl"
          style={{ background: 'rgba(10,20,70,0.88)', backdropFilter: 'blur(14px)', border: '1px solid rgba(212,175,55,0.18)' }}>
          {['🎓','👏','❤️','🎉','⭐','😭','🏆'].map(emoji => (
            <button key={emoji} onClick={() => addReaction(emoji)}
              className="text-xl px-2 py-1 rounded-xl hover:bg-white/10 active:scale-90 transition-all">
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
        {reactions.map(r => (
          <motion.div key={r.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -200, scale: 1.8 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-16 text-3xl"
            style={{ left: `${r.x}vw` }}>
            {r.type}
          </motion.div>
        ))}
      </div>

      {/* ── SCHEDULE PANEL ── */}
      <AnimatePresence>
        {showSchedule && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="absolute top-12 right-0 bottom-16 w-72 z-30 flex flex-col"
            style={{ background: 'rgba(8,16,60,0.95)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-bold">Today's Events</p>
              <button onClick={() => setShowSchedule(false)} className="text-white/30 hover:text-white/60 text-xl">×</button>
            </div>
            <div className="p-4 space-y-2">
              {SCHEDULE.map(s => (
                <div key={s.time} className={`flex items-center gap-3 p-2 rounded-xl ${s.live ? 'bg-blue-600/20' : ''}`}>
                  <span className="text-xs text-white/40 w-16 shrink-0">{s.time}</span>
                  <span className={`text-sm font-semibold flex-1 ${s.live ? 'text-white' : 'text-white/55'}`}>{s.title}</span>
                  {s.live && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">LIVE</span>}
                </div>
              ))}
            </div>
            <div className="p-4 mt-auto">
              <p className="text-white/30 text-xs text-center">UKG→Y1 · Y6→Y7 · Y9→Y10</p>
            </div>

            {/* Room navigator */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} className="p-4 space-y-1">
              <p className="text-white/50 text-xs font-bold mb-2 uppercase">Explore Campus</p>
              {[
                { label: 'Lobby', icon: '🏛️', action: () => goToScene('lobby') },
                { label: 'Auditorium', icon: '🎭', action: () => goToScene('auditorium') },
                { label: 'Graduates', icon: '🎓', href: '/graduates' },
                { label: 'Photo Booth', icon: '📷', href: '/photo-booth' },
                { label: 'Programme', icon: '📋', href: '/program' },
              ].map(r => (
                r.href
                  ? <Link key={r.label} href={r.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                      <span>{r.icon}</span>
                      <span className="text-sm font-semibold">{r.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                    </Link>
                  : <button key={r.label} onClick={r.action}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                      <span>{r.icon}</span>
                      <span className="text-sm font-semibold">{r.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                    </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
