'use client'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Environment, Float, Html, PerspectiveCamera, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'

// ── Types ──────────────────────────────────────────────────────────────────
interface RoomDoor {
  position: [number, number, number]
  rotation?: [number, number, number]
  label: string
  emoji: string
  href: string
  color: string
}

const DOORS: RoomDoor[] = [
  { position: [-8, 0, -14], label: 'Auditorium', emoji: '🎓', href: '/auditorium', color: '#D4AF37' },
  { position: [0,  0, -14], label: 'Graduates',  emoji: '👥', href: '/graduates',  color: '#3b82f6' },
  { position: [8,  0, -14], label: 'Networking', emoji: '🤝', href: '/networking', color: '#8b5cf6' },
  { position: [-8, 0, 0],   label: 'Photo Booth',emoji: '📸', href: '/photo-booth',color: '#ec4899' },
  { position: [0,  0, 0],   label: 'Programme',  emoji: '📋', href: '/program',    color: '#10b981' },
  { position: [8,  0, 0],   label: 'My Avatar',  emoji: '🧑‍🎓', href: '/avatar',     color: '#f59e0b' },
]

// ── Floor ──────────────────────────────────────────────────────────────────
function GrandFloor() {
  return (
    <group>
      {/* Main marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0d1022" roughness={0.1} metalness={0.4} />
      </mesh>
      {/* Gold tile grid lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16 + i * 4, 0, 0]}>
            <planeGeometry args={[0.05, 40]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.3} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -16 + i * 4]}>
            <planeGeometry args={[40, 0.05]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Walls & Ceiling ────────────────────────────────────────────────────────
function Hall() {
  const wallMat = <meshStandardMaterial color="#0a0e1e" roughness={0.7} metalness={0.1} />
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 5, -20]}>
        <boxGeometry args={[40, 12, 0.3]} />
        {wallMat}
      </mesh>
      {/* Side walls */}
      <mesh position={[-20, 5, 0]}>
        <boxGeometry args={[0.3, 12, 40]} />
        {wallMat}
      </mesh>
      <mesh position={[20, 5, 0]}>
        <boxGeometry args={[0.3, 12, 40]} />
        {wallMat}
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 11, 0]}>
        <boxGeometry args={[40, 0.3, 40]} />
        <meshStandardMaterial color="#080c18" roughness={0.9} />
      </mesh>
      {/* Gold trim on walls */}
      {[-20, 20].map((x, i) => (
        <mesh key={i} position={[x * 0.98, 0.2, 0]}>
          <boxGeometry args={[0.15, 0.4, 40]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Ceiling trim */}
      <mesh position={[0, 10.8, 0]}>
        <boxGeometry args={[40, 0.15, 40]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

// ── Columns ────────────────────────────────────────────────────────────────
function Columns() {
  const positions: [number, number, number][] = [
    [-16, 0, -16], [-16, 0, -8], [-16, 0, 0], [-16, 0, 8],
    [16, 0, -16],  [16, 0, -8],  [16, 0, 0],  [16, 0, 8],
  ]
  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Column shaft */}
          <mesh castShadow position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 9, 16]} />
            <meshStandardMaterial color="#141828" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.75, 0.75, 0.4, 16]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
          </mesh>
          {/* Capital */}
          <mesh position={[0, 9.2, 0]}>
            <boxGeometry args={[1.4, 0.4, 1.4]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Chandeliers ────────────────────────────────────────────────────────────
function Chandeliers() {
  return (
    <group>
      {[[-8, 0], [0, 0], [8, 0], [-8, -10], [8, -10]].map(([x, z], i) => (
        <group key={i} position={[x, 10, z]}>
          <pointLight color="#FFD700" intensity={1.5} distance={14} decay={2} />
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={3} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const angle = (j / 6) * Math.PI * 2
            return (
              <mesh key={j} position={[Math.cos(angle) * 0.6, -0.3, Math.sin(angle) * 0.6]}>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

// ── Door/Portal ────────────────────────────────────────────────────────────
function Door({ door, onEnter }: { door: RoomDoor; onEnter: (href: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (glowRef.current && (glowRef.current.material as THREE.MeshStandardMaterial)) {
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity = hovered
        ? 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        : 0.1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05
    }
  })

  const color = new THREE.Color(door.color)

  return (
    <group position={door.position} rotation={door.rotation}>
      {/* Door frame */}
      <mesh>
        <boxGeometry args={[3.2, 5.2, 0.15]} />
        <meshStandardMaterial color="#0a0c18" roughness={0.4} metalness={0.8}
          emissive={door.color} emissiveIntensity={hovered ? 0.4 : 0.1} />
      </mesh>
      {/* Door opening glow */}
      <mesh ref={glowRef} position={[0, 0, 0.05]}>
        <boxGeometry args={[2.8, 4.8, 0.05]} />
        <meshStandardMaterial color={door.color} transparent opacity={0.15}
          emissive={door.color} emissiveIntensity={2} />
      </mesh>
      {/* Gold frame border */}
      {[[-1.5, 0, 0.1], [1.5, 0, 0.1]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.12, 5.2, 0.12]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={hovered ? 1 : 0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0.1]}>
        <boxGeometry args={[3.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={hovered ? 1 : 0.4} />
      </mesh>

      {/* Invisible click target */}
      <mesh
        position={[0, 0, 0.2]}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        onClick={() => onEnter(door.href)}
      >
        <boxGeometry args={[2.8, 4.8, 0.3]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Point light inside door */}
      <pointLight color={door.color} intensity={hovered ? 3 : 1} distance={6} decay={2} position={[0, 0, 0.5]} />

      {/* HTML label */}
      <Html position={[0, -3.2, 0.5]} center>
        <div
          className={`text-center transition-all duration-200 pointer-events-none select-none ${hovered ? 'scale-110' : 'scale-100'}`}
        >
          <div className="text-2xl mb-1">{door.emoji}</div>
          <div className="text-white font-bold text-sm tracking-wide drop-shadow-lg" style={{ textShadow: `0 0 12px ${door.color}` }}>
            {door.label}
          </div>
          {hovered && (
            <div className="text-xs mt-1" style={{ color: door.color }}>Click to enter →</div>
          )}
        </div>
      </Html>
    </group>
  )
}

// ── Grand Stage (back of hall) ─────────────────────────────────────────────
function GrandStage() {
  return (
    <group position={[0, 0, -18]}>
      {/* Stage platform */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[18, 1.2, 4]} />
        <meshStandardMaterial color="#0d1030" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Stage front trim */}
      <mesh position={[0, 0.6, 2]}>
        <boxGeometry args={[18, 0.1, 0.1]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1} />
      </mesh>
      {/* Podium */}
      <group position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 1.4, 0.7]} />
          <meshStandardMaterial color="#0a0c20" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.4, 0.08, 0.9]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.6} />
        </mesh>
      </group>
      {/* University name on back wall */}
      <Text
        position={[0, 6, 1.5]}
        fontSize={1.2}
        color="#D4AF37"
        font={undefined}
        anchorX="center"
        anchorY="middle"
        outlineColor="#000"
        outlineWidth={0.02}
      >
        Excellence University
      </Text>
      <Text
        position={[0, 4.8, 1.5]}
        fontSize={0.5}
        color="rgba(255,255,255,0.5)"
        anchorX="center"
        anchorY="middle"
      >
        Graduation Ceremony 2026
      </Text>
      {/* Stage spotlights */}
      <spotLight position={[-4, 8, 2]} target-position={[0, 1.2, 0]} angle={0.4}
        penumbra={0.5} intensity={20} color="#fff5d0" castShadow />
      <spotLight position={[4, 8, 2]} target-position={[0, 1.2, 0]} angle={0.4}
        penumbra={0.5} intensity={20} color="#fff5d0" castShadow />
      {/* Red carpet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 8]}>
        <planeGeometry args={[3, 20]} />
        <meshStandardMaterial color="#8B0000" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── Floating graduation caps ───────────────────────────────────────────────
function FloatingCaps() {
  return (
    <>
      {[[-12, 8, -10], [12, 9, -8], [0, 10, -5], [-6, 7, -15], [6, 8, -12]].map(([x, y, z], i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.5}>
          <group position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[0.6, 0.1, 0.08, 8]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[1.1, 0.08, 1.1]} />
              <meshStandardMaterial color="#1a237e" roughness={0.5} />
            </mesh>
            {/* Tassel */}
            <mesh position={[0.4, -0.1, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#D4AF37" />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  )
}

// ── Avatar crowd (seated) ──────────────────────────────────────────────────
function AvatarCrowd() {
  const positions: [number, number, number][] = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      positions.push([-12 + col * 4, 0, -4 - row * 2.5])
    }
  }
  return (
    <group>
      {positions.map(([x, y, z], i) => (
        <Html key={i} position={[x, 0.5, z]} center>
          <div style={{ pointerEvents: 'none', transform: 'scale(0.4)', transformOrigin: 'bottom center' }}>
            <svg width="60" height="80" viewBox="0 0 60 80">
              {/* Simple silhouette avatar */}
              <circle cx="30" cy="20" r="12" fill={`hsl(${i * 37 % 360},40%,${30 + (i % 3) * 10}%)`} />
              <ellipse cx="30" cy="55" rx="18" ry="22" fill="#1a237e" />
              <rect x="20" y="8" width="20" height="6" rx="2" fill="#1a237e" />
              <rect x="25" y="4" width="10" height="6" rx="2" fill="#1a237e" />
            </svg>
          </div>
        </Html>
      ))}
    </group>
  )
}

// ── Camera controller (WASD + mouse look) ─────────────────────────────────
function CameraController({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const mouse = useRef({ x: 0, y: 0, isDown: false })
  const vel = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!enabled) return
    camera.position.set(0, 2.2, 10)
    camera.lookAt(0, 2.2, -14)

    const onKey = (e: KeyboardEvent, down: boolean) => { keys.current[e.code] = down }
    const onDown = (e: MouseEvent) => { mouse.current.isDown = true; mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    const onUp = () => { mouse.current.isDown = false }
    const onMove = (e: MouseEvent) => {
      if (!mouse.current.isDown) return
      const dx = e.clientX - mouse.current.x
      const dy = e.clientY - mouse.current.y
      camera.rotation.y -= dx * 0.003
      camera.rotation.x = Math.max(-0.6, Math.min(0.6, camera.rotation.x - dy * 0.003))
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    window.addEventListener('keydown', (e) => onKey(e, true))
    window.addEventListener('keyup', (e) => onKey(e, false))
    gl.domElement.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('keydown', (e) => onKey(e, true))
      window.removeEventListener('keyup', (e) => onKey(e, false))
      gl.domElement.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
    }
  }, [enabled, camera, gl])

  useFrame((_, delta) => {
    if (!enabled) return
    const speed = 6
    const dir = new THREE.Vector3()
    const forward = new THREE.Vector3(-Math.sin(camera.rotation.y), 0, -Math.cos(camera.rotation.y))
    const right = new THREE.Vector3(Math.cos(camera.rotation.y), 0, -Math.sin(camera.rotation.y))

    if (keys.current['KeyW'] || keys.current['ArrowUp']) dir.add(forward)
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dir.sub(forward)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dir.sub(right)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir.add(right)

    if (dir.length() > 0) dir.normalize()
    vel.current.lerp(dir.multiplyScalar(speed), 0.15)
    camera.position.addScaledVector(vel.current, delta)
    // Clamp to hall bounds
    camera.position.x = Math.max(-17, Math.min(17, camera.position.x))
    camera.position.z = Math.max(-17, Math.min(12, camera.position.z))
    camera.position.y = 2.2
  })

  return null
}

// ── Main Scene ─────────────────────────────────────────────────────────────
function Scene({ onEnter }: { onEnter: (href: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} color="#1a2040" />
      <CameraController enabled />
      <GrandFloor />
      <Hall />
      <Columns />
      <Chandeliers />
      <GrandStage />
      <FloatingCaps />
      <AvatarCrowd />

      {DOORS.map((door, i) => (
        <Door key={i} door={door} onEnter={onEnter} />
      ))}

      {/* Ambient gold glow from floor */}
      <pointLight color="#D4AF37" intensity={0.5} distance={30} position={[0, 0.5, -7]} />
    </>
  )
}

// ── MetaverseLobby (exported) ──────────────────────────────────────────────
export default function MetaverseLobby() {
  const router = useRouter()
  const { myAvatar, myName } = useGraduationStore()
  const [entered, setEntered] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState('')

  const handleEnter = (href: string) => {
    setNavigatingTo(href)
    setTimeout(() => router.push(href), 600)
  }

  if (!entered) {
    return (
      <div className="fixed inset-0 bg-navy flex flex-col items-center justify-center z-50">
        {/* Preview of the 3D hall as background hint */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={75} />
            <ambientLight intensity={0.4} />
            <GrandFloor />
            <Hall />
            <Columns />
            <Chandeliers />
            <GrandStage />
          </Canvas>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center px-6">
          <div className="text-7xl mb-6">🎓</div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-3">
            Welcome to <span className="gold-text">Graduation 2026</span>
          </h1>
          <p className="text-white/50 mb-2 max-w-md mx-auto">
            You&apos;re about to enter a 3D virtual graduation hall.
          </p>
          <p className="text-xs text-white/30 mb-8">Use <kbd className="px-2 py-0.5 glass rounded text-white/50">W A S D</kbd> or arrow keys to walk · drag mouse to look around · click doors to enter rooms</p>

          {myName && (
            <div className="flex items-center justify-center gap-3 mb-6 glass-gold rounded-2xl px-5 py-3 w-fit mx-auto">
              <div className="scale-75 -my-2">
                <AvatarDisplay avatar={myAvatar} size={60} />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">{myName}</p>
                <p className="text-gold/60 text-xs">Your avatar is ready</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setEntered(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gold to-gold-light text-navy font-bold text-lg shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-shadow"
            >
              Enter Hall →
            </motion.button>
            {!myName && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/avatar')}
                className="px-6 py-4 rounded-2xl glass border border-gold/20 text-gold font-semibold"
              >
                Create Avatar First
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0">
      {/* Navigation fade overlay */}
      {navigatingTo && (
        <div className="absolute inset-0 bg-black z-50 animate-pulse" style={{ animation: 'fadeIn 0.6s forwards' }} />
      )}

      <Canvas shadows gl={{ antialias: true, alpha: false }} style={{ background: '#040610' }}>
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={200} />
        <Suspense fallback={null}>
          <Scene onEnter={handleEnter} />
        </Suspense>
      </Canvas>

      {/* HUD overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none">
        <div className="glass rounded-2xl px-5 py-3 text-center">
          <p className="text-xs text-white/40 mb-1">Navigation</p>
          <div className="flex gap-2 items-center text-xs text-white/60">
            <span className="glass px-2 py-1 rounded">W</span>
            <span className="glass px-2 py-1 rounded">A</span>
            <span className="glass px-2 py-1 rounded">S</span>
            <span className="glass px-2 py-1 rounded">D</span>
            <span className="text-white/30">move</span>
            <span className="ml-2 text-white/30">drag to look</span>
          </div>
        </div>
        {myName && (
          <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-white/60">{myName}</span>
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => setEntered(false)}
        className="absolute top-20 left-4 glass rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
      >
        ← Exit Hall
      </button>
    </div>
  )
}
