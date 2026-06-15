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
  // Equirectangular coords: yaw=horizontal (0=image-centre), pitch=vertical (0=horizon,+=up)
  yaw: number
  pitch: number
  action: 'scene' | 'route'
  target: string
  color: string
}

// ── Yaw calibration: pixel x of each label in a 1536-wide equirectangular image
// formula: yaw = (x/1536 - 0.5) * 360
// Pitch: labels are at ~y=250 in 670-tall image → (0.5 - 250/670)*180 ≈ +22°
const SCENES: Record<SceneId, { image: string; title: string; hotspots: Hotspot[] }> = {
  lobby: {
    image: 'https://i.ibb.co/3ymTcPJf/Chat-GPT-Image-Jun-15-2026-07-28-23-AM.png',
    title: 'Welcome Lobby',
    hotspots: [
      { id: 'aud',   label: 'Auditorium',  sublabel: 'Live Ceremony',        icon: '🎭', yaw: -163, pitch: 22, action: 'scene', target: 'auditorium',  color: '#2563eb' },
      { id: 'grads', label: 'Graduates',   sublabel: 'Wall of Fame',         icon: '🎓', yaw: -110, pitch: 22, action: 'route', target: '/graduates',  color: '#9333ea' },
      { id: 'photo', label: 'Photo Booth', sublabel: 'Capture Memories',     icon: '📷', yaw:  -72, pitch: 22, action: 'route', target: '/photo-booth',color: '#ec4899' },
      { id: 'prog',  label: 'Programme',   sublabel: "Today's Schedule",     icon: '📋', yaw:   73, pitch: 22, action: 'route', target: '/program',    color: '#22c55e' },
      { id: 'awd',   label: 'Awards Hall', sublabel: 'Celebrate Excellence', icon: '🏆', yaw:  113, pitch: 22, action: 'route', target: '/graduates',  color: '#D4AF37' },
      { id: 'mem',   label: 'Memory Lane', sublabel: 'Our Journey',          icon: '❤️', yaw:  164, pitch: 22, action: 'route', target: '/networking', color: '#ef4444' },
    ],
  },
  auditorium: {
    image: 'https://i.ibb.co/h1KSNWWV/Chat-GPT-Image-Jun-15-2026-07-34-27-AM.png',
    title: 'Graduation Ceremony Hall',
    hotspots: [
      { id: 'back', label: 'Back to Lobby', sublabel: 'Exit Hall', icon: '🚪', yaw: 178, pitch: 5, action: 'scene', target: 'lobby', color: '#6b7280' },
    ],
  },
}

// ── 360° viewer ───────────────────────────────────────────────────────────────
function use360Viewer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageUrl: string,
  onReady: () => void,
) {
  const stateRef = useRef({
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    dragging: false,
    lastX: 0, lastY: 0,
    yaw: 0, pitch: 0,
    targetYaw: 0, targetPitch: 0,
    fov: 80,
  })

  // Convert equirectangular (yaw, pitch) → screen position (%).
  // Uses actual Three.js world-space projection — rock solid, no drift.
  const projectToScreen = useCallback((hotYaw: number, hotPitch: number) => {
    const s = stateRef.current
    if (!s.camera) return { x: 0, y: 0, visible: false }

    const yRad = THREE.MathUtils.degToRad(hotYaw)
    const pRad = THREE.MathUtils.degToRad(hotPitch)

    // World position on the inner sphere for this (yaw, pitch)
    const wp = new THREE.Vector3(
      Math.sin(yRad) * Math.cos(pRad),
      Math.sin(pRad),
      -Math.cos(yRad) * Math.cos(pRad),
    ).multiplyScalar(500)

    // Visibility check: must be in front of camera
    const camFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(s.camera.quaternion)
    if (wp.clone().normalize().dot(camFwd) < 0.12) return { x: 0, y: 0, visible: false }

    // Project to NDC → screen %
    const ndc = wp.clone().project(s.camera)
    return {
      x: (ndc.x * 0.5 + 0.5) * 100,
      y: (-ndc.y * 0.5 + 0.5) * 100,
      visible: true,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    const W = window.innerWidth
    const H = window.innerHeight

    // Renderer — setSize without false so it sets both canvas buffer AND css size
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)  // sets css width/height too
    s.renderer = renderer

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(s.fov, W / H, 0.1, 1000)
    camera.rotation.order = 'YXZ'
    s.camera = camera

    // Inner sphere (flip normals so texture shows from inside)
    const geo = new THREE.SphereGeometry(500, 80, 60)
    geo.scale(-1, 1, 1)

    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
        tex.generateMipmaps = true
        scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })))
        onReady()
      },
      undefined,
      () => {
        scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x1a3a8f })))
        onReady()
      },
    )

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      // Smooth lerp — fast enough to feel responsive, stable on stop
      s.yaw   += (s.targetYaw   - s.yaw)   * 0.12
      s.pitch += (s.targetPitch - s.pitch) * 0.12
      camera.rotation.y = THREE.MathUtils.degToRad(-s.yaw)
      camera.rotation.x = THREE.MathUtils.degToRad(s.pitch)
      renderer.render(scene, camera)
    }
    animate()

    const onDown = (e: MouseEvent | TouchEvent) => {
      s.dragging = true
      const p = 'touches' in e ? e.touches[0] : e
      s.lastX = p.clientX; s.lastY = p.clientY
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!s.dragging) return
      const p = 'touches' in e ? e.touches[0] : e
      s.targetYaw   += (p.clientX - s.lastX) * 0.2
      s.targetPitch  = Math.max(-80, Math.min(80, s.targetPitch - (p.clientY - s.lastY) * 0.2))
      s.lastX = p.clientX; s.lastY = p.clientY
    }
    const onUp = () => { s.dragging = false }
    const onWheel = (e: WheelEvent) => {
      s.fov = Math.max(40, Math.min(100, s.fov + e.deltaY * 0.04))
      camera.fov = s.fov; camera.updateProjectionMatrix()
    }
    const onResize = () => {
      const W2 = window.innerWidth, H2 = window.innerHeight
      renderer.setSize(W2, H2)
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
const TIPS: Record<SceneId, string[]> = {
  lobby: [
    'Welcome! 🎓 Drag left & right to look around the full lobby.',
    'Click the AUDITORIUM door to watch the live ceremony on the big screen!',
    'Visit GRADUATES to see the Wall of Fame — take a screenshot to share!',
    'Check PROGRAMME to see today\'s full schedule. 📋',
  ],
  auditorium: [
    'You\'re in the Graduation Hall! The live stream plays on the big screen. 🎉',
    'Drag to look around the 360° ceremony hall!',
    'Use the reactions below to cheer on our graduates! 👏🎓',
  ],
}

function TourGuide({ scene }: { scene: SceneId }) {
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(true)
  const tips = TIPS[scene]
  useEffect(() => { setIdx(0); setShow(true) }, [scene])
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % tips.length), 6000)
    return () => clearInterval(t)
  }, [tips.length])
  if (!show) return null
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-20 left-4 z-30 flex items-end gap-3" style={{ maxWidth: 300 }}>
      <div className="flex-shrink-0 relative">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl"
          style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '3px solid #D4AF37' }}>🤖</div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
      </div>
      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl rounded-bl-none px-3 py-2.5 shadow-xl"
        style={{ background: 'rgba(8,16,60,0.95)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white text-xs leading-relaxed">{tips[idx]}</p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex gap-1">
            {tips.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-yellow-400' : 'bg-white/20'}`} />)}
          </div>
          <button onClick={() => setShow(false)} className="text-white/30 text-xs ml-3">dismiss</button>
        </div>
        <div className="absolute -left-2 bottom-3 w-0 h-0"
          style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid rgba(8,16,60,0.95)' }} />
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VirtualTour({ initialScene = 'lobby' as SceneId }) {
  const router = useRouter()
  const { myName, attendeeCount, bbbJoinUrl, ceremonyStatus, reactions, addReaction } =
    useGraduationStore()

  const [scene, setScene]         = useState<SceneId>(initialScene)
  const [loading, setLoading]     = useState(true)
  const [transitioning, setTrans] = useState(false)
  const [hoveredHs, setHoveredHs] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [, tick]                  = useState(0)   // force re-render for hotspot projection

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stateRef, projectToScreen } = use360Viewer(
    canvasRef,
    SCENES[scene].image,
    () => setLoading(false),
  )

  // Re-project hotspots every animation frame
  useEffect(() => {
    let raf: number
    const loop = () => { tick(n => n + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const goScene = (id: string) => {
    if (transitioning || id === scene) return
    setTrans(true); setLoading(true)
    setTimeout(() => {
      setScene(id as SceneId)
      stateRef.current.targetYaw = 0; stateRef.current.targetPitch = 0
      setTrans(false)
    }, 500)
  }

  const handleHotspot = (hs: Hotspot) => {
    if (hs.action === 'scene') goScene(hs.target)
    else router.push(hs.target)
  }

  const cur = SCENES[scene]

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">

      {/* Canvas — no inline size; renderer.setSize() handles everything */}
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'grab', touchAction: 'none' }} />

      {/* Loading */}
      <AnimatePresence>
        {(loading || transitioning) && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(8,16,60,0.97)' }}>
            <div className="text-6xl mb-4 animate-bounce">🎓</div>
            <p className="text-white font-bold text-xl">Nextora Academy</p>
            <p className="text-white/40 text-sm mt-1">Loading {cur.title}…</p>
            <div className="mt-4 w-52 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full" style={{ background: '#D4AF37' }}
                animate={{ width: ['0%', '100%'] }} transition={{ duration: 1.2 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hotspots — pinned to sphere, no drift ── */}
      {!loading && cur.hotspots.map(hs => {
        const pos = projectToScreen(hs.yaw, hs.pitch)
        if (!pos.visible) return null
        return (
          <div key={hs.id} className="absolute z-20 pointer-events-auto"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>
            <button
              onClick={() => handleHotspot(hs)}
              onMouseEnter={() => setHoveredHs(hs.id)}
              onMouseLeave={() => setHoveredHs(null)}
              className="relative flex flex-col items-center gap-1 group">
              {/* Pulse ring */}
              <motion.div animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute rounded-full pointer-events-none"
                style={{ width: 44, height: 44, top: -2, left: -2, background: hs.color }} />
              {/* Button */}
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 shadow-2xl group-hover:scale-115 transition-transform"
                style={{ background: hs.color, border: '3px solid white', boxShadow: `0 0 20px ${hs.color}` }}>
                {hs.icon}
              </div>
              {/* Label — always visible, stays put */}
              <div className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-lg"
                style={{ background: 'rgba(8,16,60,0.9)', border: `1px solid ${hs.color}70` }}>
                {hs.label}
              </div>
            </button>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredHs === hs.id && hs.sublabel && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: -8 }} exit={{ opacity: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 rounded-xl text-center whitespace-nowrap pointer-events-none"
                  style={{ background: 'rgba(8,16,60,0.97)', border: `1px solid ${hs.color}`, boxShadow: `0 0 14px ${hs.color}60` }}>
                  <p className="text-white text-xs font-bold">{hs.label}</p>
                  <p className="text-xs" style={{ color: hs.color }}>{hs.sublabel}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* BBB screen overlay — auditorium only */}
      {scene === 'auditorium' && !loading && (() => {
        const pos = projectToScreen(0, 12)
        if (!pos.visible) return null
        return (
          <div className="absolute z-10 rounded-xl overflow-hidden pointer-events-auto"
            style={{
              left: `${pos.x}%`, top: `${pos.y}%`,
              width: 520, height: 300,
              transform: 'translate(-50%,-50%)',
              border: '3px solid rgba(212,175,55,0.8)',
              boxShadow: '0 0 60px rgba(37,99,235,0.6), 0 0 20px rgba(212,175,55,0.4)',
            }}>
            {bbbJoinUrl ? (
              <iframe src={bbbJoinUrl} className="w-full h-full"
                allow="camera; microphone; display-capture; autoplay"
                style={{ border: 'none' }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6"
                style={{ background: 'linear-gradient(135deg,#060e30,#0f2060,#060e30)' }}>
                <div className="text-4xl mb-2">🎓</div>
                <p className="text-white font-bold">NEXTORA ACADEMY</p>
                <p className="font-black text-2xl" style={{ color: '#D4AF37' }}>GRADUATION CEREMONY 2026</p>
                <p className="text-white/30 text-xs mt-3">Live stream appears here</p>
              </div>
            )}
            {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((c,i)=>(
              <div key={i} className={`absolute ${c} w-3 h-3`} style={{ background:'#D4AF37', boxShadow:'0 0 8px #D4AF37' }} />
            ))}
          </div>
        )
      })()}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(8,16,60,0.88)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(212,175,55,0.18)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '1px solid #D4AF37' }}>🎓</div>
          <div>
            <p className="text-white font-bold text-xs leading-none">NEXTORA ACADEMY</p>
            <p className="text-xs leading-none" style={{ color: '#D4AF37' }}>GRADUATION WORLD 2026</p>
          </div>
          <span className="hidden sm:flex items-center gap-1 text-xs text-white/50">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />{attendeeCount} online
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs text-white/50"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            📍 {cur.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {scene === 'auditorium' && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${ceremonyStatus === 'live' ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'text-white/35'}`}>
              <Radio className={`w-3 h-3 ${ceremonyStatus === 'live' ? 'animate-pulse' : ''}`} />
              {ceremonyStatus === 'live' ? 'LIVE' : 'Soon'}
            </span>
          )}
          <button onClick={() => setShowPanel(v => !v)}
            className={`p-2 rounded-lg ${showPanel ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>
            <Map className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${scene === s ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            style={scene === s ? { background: 'rgba(37,99,235,0.55)', border: '1px solid #2563eb' } : {}}>
            {s === 'lobby' ? '🏛️ Lobby' : '🎭 Auditorium'}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      {!loading && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-10 text-xs text-white/40 px-3 py-1 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          👆 Drag to look around · Scroll to zoom
        </motion.p>
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 25 }}>
        {reactions.map(r => (
          <motion.div key={r.id} className="absolute bottom-16 text-3xl"
            style={{ left: `${r.x}vw` }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -200, scale: 1.8 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}>
            {r.type}
          </motion.div>
        ))}
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            className="absolute top-12 right-0 bottom-16 w-64 z-30 flex flex-col overflow-y-auto"
            style={{ background: 'rgba(8,16,60,0.96)', backdropFilter: 'blur(16px)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white font-bold text-sm">Today's Events</p>
              <button onClick={() => setShowPanel(false)} className="text-white/30 hover:text-white/60 text-xl leading-none">×</button>
            </div>
            <div className="p-3 space-y-1.5">
              {SCHEDULE.map(s => (
                <div key={s.time} className={`flex items-center gap-2 p-2 rounded-lg ${s.live ? 'bg-blue-600/20' : ''}`}>
                  <span className="text-xs text-white/40 w-16 shrink-0">{s.time}</span>
                  <span className={`text-xs font-semibold flex-1 ${s.live ? 'text-white' : 'text-white/50'}`}>{s.title}</span>
                  {s.live && <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-bold">LIVE</span>}
                </div>
              ))}
            </div>
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/40 text-xs font-bold uppercase mb-2">Explore Campus</p>
              {[
                { label: 'Lobby',       icon: '🏛️', fn: () => { goScene('lobby'); setShowPanel(false) } },
                { label: 'Auditorium',  icon: '🎭', fn: () => { goScene('auditorium'); setShowPanel(false) } },
              ].map(r => (
                <button key={r.label} onClick={r.fn}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors text-left">
                  <span>{r.icon}</span>
                  <span className="text-sm font-semibold flex-1">{r.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              ))}
              {[
                { label: 'Graduates',   icon: '🎓', href: '/graduates' },
                { label: 'Photo Booth', icon: '📷', href: '/photo-booth' },
                { label: 'Programme',   icon: '📋', href: '/program' },
                { label: 'Networking',  icon: '👥', href: '/networking' },
              ].map(r => (
                <Link key={r.label} href={r.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                  <span>{r.icon}</span>
                  <span className="text-sm font-semibold flex-1">{r.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
            </div>
            <div className="p-4 mt-auto text-center">
              <p className="text-white/20 text-xs">UKG→Y1 · Y6→Y7 · Y9→Y10</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
