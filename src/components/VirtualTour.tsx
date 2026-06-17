'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import { useVenueStore, SceneId, SceneConfig, Hotspot } from '../store/useVenueStore'
import { Map, ChevronRight, Radio, Volume2, VolumeX } from 'lucide-react'

// ── 360° viewer — used only for image scenes (auditorium) ────────────────────
function use360Viewer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  sceneConfig: SceneConfig,
  onReady: () => void,
  onFrame: (project: (yaw: number, pitch: number) => { x: number; y: number; visible: boolean }) => void,
  enabled: boolean,
) {
  // Keep a ref so the RAF loop always calls the latest onFrame without restarting
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame
  const st = useRef({
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    dragging: false,
    lastX: 0, lastY: 0,
    yaw: sceneConfig.initialYaw,
    pitch: sceneConfig.initialPitch,
    targetYaw: sceneConfig.initialYaw,
    targetPitch: sceneConfig.initialPitch,
    fov: 75,
  })

  const project = useCallback((hotYaw: number, hotPitch: number) => {
    const s = st.current
    if (!s.camera) return { x: 0, y: 0, visible: false }
    const yr = THREE.MathUtils.degToRad(hotYaw)
    const pr = THREE.MathUtils.degToRad(hotPitch)
    const wp = new THREE.Vector3(
      Math.sin(yr) * Math.cos(pr),
      Math.sin(pr),
      -Math.cos(yr) * Math.cos(pr),
    ).multiplyScalar(500)
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(s.camera.quaternion)
    if (wp.clone().normalize().dot(fwd) < 0.12) return { x: 0, y: 0, visible: false }
    const ndc = wp.clone().project(s.camera)
    return { x: (ndc.x * 0.5 + 0.5) * 100, y: (-ndc.y * 0.5 + 0.5) * 100, visible: true }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const s = st.current
    s.yaw = sceneConfig.initialYaw
    s.pitch = sceneConfig.initialPitch
    s.targetYaw = sceneConfig.initialYaw
    s.targetPitch = sceneConfig.initialPitch

    const W = window.innerWidth, H = window.innerHeight
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    s.renderer = renderer

    const threeScene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(s.fov, W / H, 0.1, 1000)
    camera.rotation.order = 'YXZ'
    s.camera = camera

    const geo = new THREE.SphereGeometry(500, 80, 60)
    geo.scale(-1, 1, 1)

    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    loader.load(
      sceneConfig.src,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
        tex.generateMipmaps = true
        threeScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })))
        onReady()
      },
      undefined,
      () => {
        threeScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x1a3a8f })))
        onReady()
      },
    )

    const wrap180 = (deg: number) => ((deg % 360) + 540) % 360 - 180

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      s.yaw   += (s.targetYaw   - s.yaw)   * 0.12
      s.pitch += (s.targetPitch - s.pitch) * 0.12
      // Keep yaw/targetYaw bounded so drag deltas and readouts stay consistent
      // across long sessions instead of accumulating without limit.
      const wrapped = wrap180(s.yaw)
      const shift = wrapped - s.yaw
      if (Math.abs(shift) > 0.001) {
        s.yaw = wrapped
        s.targetYaw += shift
      }
      camera.rotation.y = THREE.MathUtils.degToRad(-s.yaw)
      camera.rotation.x = THREE.MathUtils.degToRad(s.pitch)
      renderer.render(threeScene, camera)
      onFrameRef.current(project)
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
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
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
  }, [sceneConfig.id, sceneConfig.src, enabled])

  return { stRef: st, project }
}

// ── Video Lobby — full-bleed video with overlay hotspots ─────────────────────
// Hotspot screen positions (% from left, % from top) for the lobby layout.
// Spread across the width at a natural eye level.
const LOBBY_HOTSPOT_SCREEN: Record<string, { x: number; y: number }> = {
  aud:   { x: 14, y: 52 },
  grads: { x: 28, y: 52 },
  photo: { x: 42, y: 52 },
  prog:  { x: 58, y: 52 },
  awd:   { x: 72, y: 52 },
  mem:   { x: 86, y: 52 },
}

function VideoLobby({
  src, hotspots, onHotspot, muted, onToggleMute,
}: {
  src: string
  hotspots: Hotspot[]
  onHotspot: (hs: Hotspot) => void
  muted: boolean
  onToggleMute: () => void
}) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return
    vid.muted = muted
  }, [muted])

  return (
    <div className="absolute inset-0">
      {/* Full-bleed video — object-fit cover keeps correct aspect ratio */}
      <video
        ref={vidRef}
        src={src}
        autoPlay
        loop
        muted        // start muted (browser policy), user can unmute
        playsInline
        onCanPlay={() => setLoaded(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',   // fills screen without stretching
          objectPosition: 'center',
          filter: 'contrast(1.08) saturate(1.15) brightness(1.02)',
        }}
      />

      {/* Subtle dark vignette so hotspots are readable */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
      {/* Bottom gradient for bottom bar legibility */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(8,16,60,0.8), transparent)' }} />
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(8,16,60,0.6), transparent)' }} />

      {/* Hotspots — fixed positions spread across the screen */}
      {loaded && hotspots.map((hs, i) => {
        const pos = LOBBY_HOTSPOT_SCREEN[hs.id] ?? { x: 15 + i * 15, y: 55 }
        return (
          <motion.div
            key={hs.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="absolute"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>
            <button
              onClick={() => onHotspot(hs)}
              className="flex flex-col items-center gap-1 group relative">
              <span className="absolute rounded-full pointer-events-none animate-ping"
                style={{ width: 48, height: 48, top: -4, left: -4, background: hs.color, opacity: 0.35 }} />
              <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl z-10 shadow-2xl transition-transform duration-150 group-hover:scale-125"
                style={{ background: hs.color, border: '3px solid white', boxShadow: `0 0 22px ${hs.color}` }}>
                {hs.icon}
              </div>
              <div className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-lg"
                style={{ background: 'rgba(8,16,60,0.92)', border: `1px solid ${hs.color}80`, backdropFilter: 'blur(8px)' }}>
                {hs.label}
              </div>
              {hs.sublabel && (
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 rounded-xl text-center whitespace-nowrap"
                  style={{ background: 'rgba(8,16,60,0.97)', border: `1px solid ${hs.color}`, boxShadow: `0 0 14px ${hs.color}60` }}>
                  <p className="text-white text-xs font-bold">{hs.label}</p>
                  <p className="text-xs" style={{ color: hs.color }}>{hs.sublabel}</p>
                </div>
              )}
            </button>
          </motion.div>
        )
      })}

      {/* Mute toggle */}
      <button onClick={onToggleMute}
        className="absolute bottom-20 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
        style={{ background: 'rgba(8,16,60,0.7)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  )
}

// ── Tour Guide ────────────────────────────────────────────────────────────────
const TIPS: Record<SceneId, string[]> = {
  lobby: [
    'Welcome to Nextora Academy! 🎓 Click any hotspot to explore.',
    'Head to AUDITORIUM to watch the live graduation ceremony!',
    'Visit HALL OF FAME to see all our graduating stars and leave wishes!',
    'Check PROGRAMME for today\'s full schedule. 📋',
  ],
  'lobby-image': [
    'Welcome back to the lobby! 🏛️ Explore using the hotspots around you.',
    'Visit the HELP DESK straight ahead for assistance — we\'re on WhatsApp!',
    'Drag to look around the lobby and click any door to explore.',
  ],
  auditorium: [
    'You\'re facing the stage! 🎉 The live stream is playing on the big screen ahead.',
    'Audio from the ceremony continues even when you look away!',
    'Drag to explore the hall — look behind you to exit back to the lobby.',
    'React with the emoji buttons below! 👏🎓',
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
      className="absolute bottom-20 left-4 z-30 flex items-end gap-2 pointer-events-auto"
      style={{ maxWidth: 280 }}>
      <div className="flex-shrink-0 relative">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-xl"
          style={{ background: 'linear-gradient(135deg,#1a3a8f,#2563eb)', border: '2px solid #D4AF37' }}>🤖</div>
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
      </div>
      <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl rounded-bl-none px-3 py-2.5 shadow-xl"
        style={{ background: 'rgba(8,16,60,0.95)', border: '1px solid rgba(212,175,55,0.3)', backdropFilter: 'blur(12px)' }}>
        <p className="text-white text-xs leading-relaxed">{tips[idx]}</p>
        <div className="flex justify-between items-center mt-1.5">
          <div className="flex gap-1">
            {tips.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-yellow-400' : 'bg-white/20'}`} />)}
          </div>
          <button onClick={() => setShow(false)} className="text-white/30 text-xs ml-3">dismiss</button>
        </div>
        <div className="absolute -left-1.5 bottom-3 w-0 h-0"
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

// ── Main Virtual Tour ─────────────────────────────────────────────────────────
export default function VirtualTour({ initialScene = 'lobby' as SceneId }) {
  const router = useRouter()
  const { myName, attendeeCount, ceremonyStatus, reactions, addReaction } = useGraduationStore()
  const { scenes, bbbUrl, bbbYaw, bbbPitch, bbbWidth, bbbHeight } = useVenueStore()

  const [scene, setScene]         = useState<SceneId>(initialScene)
  const [loading, setLoading]     = useState(true)
  const [transitioning, setTrans] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [muted, setMuted]         = useState(true)
  const [showCalib, setShowCalib] = useState(false)
  const [calibYaw, setCalibYaw]   = useState(0)
  const [calibPitch, setCalibPitch] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hsRefs    = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const bbbRef    = useRef<HTMLDivElement>(null)

  const cur = scenes.find(s => s.id === scene) ?? scenes[0]
  const isVideoLobby = cur.type === 'video'

  // onFrame only used for the 360° sphere (auditorium)
  const onFrame = useCallback((project: (y: number, p: number) => { x: number; y: number; visible: boolean }) => {
    cur.hotspots.forEach(hs => {
      const el = hsRefs.current[hs.id]
      if (!el) return
      const pos = project(hs.yaw, hs.pitch)
      if (pos.visible) {
        el.style.display = 'block'
        el.style.left = pos.x + '%'
        el.style.top  = pos.y + '%'
      } else {
        el.style.display = 'none'
      }
    })
    if (bbbRef.current && scene === 'auditorium') {
      const pos = project(bbbYaw, bbbPitch)
      if (pos.visible) {
        bbbRef.current.style.display = 'block'
        bbbRef.current.style.left = pos.x + '%'
        bbbRef.current.style.top  = pos.y + '%'
      } else {
        bbbRef.current.style.display = 'none'
      }
    }
    setCalibYaw(Math.round(stRef.current.yaw))
    setCalibPitch(Math.round(stRef.current.pitch))
  }, [scene, cur.hotspots, bbbYaw, bbbPitch])

  // 360° viewer only active for image scenes
  const { stRef } = use360Viewer(canvasRef, cur, () => setLoading(false), onFrame, !isVideoLobby)

  // Lobby video loads instantly
  useEffect(() => {
    if (isVideoLobby) setLoading(false)
  }, [isVideoLobby])

  const goScene = (id: string) => {
    if (transitioning || id === scene) return
    setTrans(true); setLoading(true)
    setTimeout(() => {
      const targetScene = id as SceneId
      const targetConfig = scenes.find(s => s.id === targetScene)
      if (targetConfig && targetConfig.type !== 'video') {
        stRef.current.targetYaw   = targetConfig.initialYaw
        stRef.current.targetPitch = targetConfig.initialPitch
      }
      setScene(targetScene)
      setTrans(false)
    }, 500)
  }

  const handleHotspot = (hs: Hotspot) => {
    if (hs.action === 'scene') goScene(hs.target)
    else if (hs.action === 'external') window.open(hs.target, '_blank', 'noopener,noreferrer')
    else router.push(hs.target)
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">

      {/* VIDEO LOBBY — natural full-bleed, correct aspect ratio */}
      {isVideoLobby && (
        <VideoLobby
          src={cur.src}
          hotspots={cur.hotspots}
          onHotspot={handleHotspot}
          muted={muted}
          onToggleMute={() => setMuted(m => !m)}
        />
      )}

      {/* 360° CANVAS — only for image scenes (auditorium) */}
      <canvas
        ref={canvasRef}
        style={{
          display: isVideoLobby ? 'none' : 'block',
          cursor: 'grab',
          touchAction: 'none',
        }}
      />

      {/* Loading overlay */}
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

      {/* HOTSPOTS for 360° scenes — direct DOM positioning */}
      {!isVideoLobby && cur.hotspots.map(hs => (
        <div
          key={hs.id}
          ref={el => { hsRefs.current[hs.id] = el }}
          className="absolute z-20 pointer-events-auto"
          style={{ display: 'none', transform: 'translate(-50%,-50%)' }}>
          <button onClick={() => handleHotspot(hs)} className="flex flex-col items-center gap-1 group relative">
            <span className="absolute rounded-full pointer-events-none animate-ping"
              style={{ width: 48, height: 48, top: -4, left: -4, background: hs.color, opacity: 0.4 }} />
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl z-10 shadow-2xl transition-transform duration-150 group-hover:scale-125"
              style={{ background: hs.color, border: '3px solid white', boxShadow: `0 0 22px ${hs.color}` }}>
              {hs.icon}
            </div>
            <div className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white whitespace-nowrap shadow-lg"
              style={{ background: 'rgba(8,16,60,0.92)', border: `1px solid ${hs.color}80`, backdropFilter: 'blur(8px)' }}>
              {hs.label}
            </div>
            {hs.sublabel && (
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1.5 rounded-xl text-center whitespace-nowrap"
                style={{ background: 'rgba(8,16,60,0.97)', border: `1px solid ${hs.color}`, boxShadow: `0 0 14px ${hs.color}60` }}>
                <p className="text-white text-xs font-bold">{hs.label}</p>
                <p className="text-xs" style={{ color: hs.color }}>{hs.sublabel}</p>
              </div>
            )}
          </button>
        </div>
      ))}

      {/* BBB SCREEN — auditorium only */}
      {scene === 'auditorium' && (
        <div ref={bbbRef} className="absolute z-10 pointer-events-auto"
          style={{
            display: 'none', transform: 'translate(-50%,-50%)',
            width: bbbWidth, height: bbbHeight,
            borderRadius: 12, overflow: 'hidden',
            border: '3px solid rgba(212,175,55,0.8)',
            boxShadow: '0 0 60px rgba(37,99,235,0.6), 0 0 20px rgba(212,175,55,0.4)',
          }}>
          {bbbUrl ? (
            <iframe
              src={bbbUrl}
              className="w-full h-full"
              allow="camera; microphone; display-capture; autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6"
              style={{ background: 'linear-gradient(135deg,#060e30,#0f2060,#060e30)' }}>
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-white font-bold">NEXTORA ACADEMY</p>
              <p className="font-black text-2xl" style={{ color: '#D4AF37' }}>GRADUATION CEREMONY 2026</p>
              <p className="text-white/30 text-xs mt-3">Live stream will appear here</p>
              <p className="text-white/20 text-xs">Set BBB URL in admin panel to go live</p>
            </div>
          )}
          {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((c,i) => (
            <div key={i} className={`absolute ${c} w-3 h-3`} style={{ background: '#D4AF37', boxShadow: '0 0 8px #D4AF37' }} />
          ))}
        </div>
      )}

      {/* TOP BAR */}
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
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />{attendeeCount} online
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs text-white/50 hidden sm:inline-block"
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
          {!isVideoLobby && (
            <button onClick={() => setShowCalib(v => !v)}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold ${showCalib ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>
              📐 Calibrate
            </button>
          )}
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
        {([['lobby','🏛️ Lobby'],['auditorium','🎭 Auditorium']] as [SceneId,string][]).map(([s,label]) => {
          const isActive = scene === s || (s === 'lobby' && scene === 'lobby-image')
          return (
            <button key={s} onClick={() => goScene(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={isActive ? { background: 'rgba(37,99,235,0.55)', border: '1px solid #2563eb' } : {}}>
              {label}
            </button>
          )
        })}
      </div>

      {!loading && <TourGuide scene={scene} />}

      {/* Calibration HUD — drag to center crosshair on the target, read off yaw/pitch */}
      {showCalib && !isVideoLobby && (
        <>
          <div className="absolute top-1/2 left-1/2 z-40 pointer-events-none"
            style={{ transform: 'translate(-50%,-50%)' }}>
            <div style={{ width: 28, height: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#FFD700', transform: 'translateY(-1px)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: '#FFD700', transform: 'translateX(-1px)' }} />
            </div>
          </div>
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl text-center"
            style={{ background: 'rgba(8,16,60,0.95)', border: '1px solid #FFD700' }}>
            <p className="text-white text-xs">Drag until the gold crosshair sits at the exact center of the screen, then read these values:</p>
            <p className="font-bold text-lg" style={{ color: '#FFD700' }}>Yaw: {calibYaw}° &nbsp; Pitch: {calibPitch}°</p>
          </div>
        </>
      )}

      {/* Reactions bar */}
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
          <motion.div key={r.id} className="absolute bottom-16 text-3xl" style={{ left: `${r.x}vw` }}
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
          <motion.div initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }}
            className="absolute top-12 right-0 bottom-14 w-64 z-30 flex flex-col overflow-y-auto"
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
            <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-white/40 text-xs font-bold uppercase mb-2">Explore Campus</p>
              {[
                { label: 'Lobby',      icon: '🏛️', fn: () => { goScene(scene === 'auditorium' ? 'lobby-image' : 'lobby'); setShowPanel(false) } },
                { label: 'Auditorium', icon: '🎭', fn: () => { goScene('auditorium'); setShowPanel(false) } },
              ].map(r => (
                <button key={r.label} onClick={r.fn}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                  <span>{r.icon}</span><span className="text-sm font-semibold flex-1">{r.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              ))}
              {[
                { label: 'Hall of Fame', icon: '🏆', href: '/graduates' },
                { label: 'Photo Booth',  icon: '📷', href: '/photo-booth' },
                { label: 'Programme',    icon: '📋', href: '/program' },
                { label: 'Networking',   icon: '👥', href: '/networking' },
              ].map(r => (
                <Link key={r.label} href={r.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/5 transition-colors">
                  <span>{r.icon}</span><span className="text-sm font-semibold flex-1">{r.label}</span>
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
