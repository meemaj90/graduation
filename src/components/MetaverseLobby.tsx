'use client'
import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import {
  Text, Environment, Float, Html, PerspectiveCamera,
  MeshReflectorMaterial, Sparkles, Stars, ContactShadows,
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGraduationStore } from '../store/useGraduationStore'
import AvatarDisplay from './AvatarDisplay'

// ── Room navigation destinations ───────────────────────────────────────────
interface RoomDoor {
  position: [number, number, number]
  label: string
  emoji: string
  href: string
  color: string
}

const DOORS: RoomDoor[] = [
  { position: [-14, 0, -8],  label: 'Auditorium',  emoji: '🎓', href: '/auditorium',  color: '#D4AF37' },
  { position: [-14, 0,  4],  label: 'Graduates',   emoji: '👥', href: '/graduates',   color: '#3b82f6' },
  { position: [ 14, 0, -8],  label: 'Networking',  emoji: '🤝', href: '/networking',  color: '#8b5cf6' },
  { position: [ 14, 0,  4],  label: 'Photo Booth', emoji: '📸', href: '/photo-booth', color: '#ec4899' },
  { position: [  0, 0, 14],  label: 'Programme',   emoji: '📋', href: '/program',     color: '#10b981' },
  { position: [  6, 0, 14],  label: 'My Avatar',   emoji: '🧑‍🎓', href: '/avatar',     color: '#f59e0b' },
]

// ── Polished marble floor with real reflections ─────────────────────────────
function MarbleFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60, 1, 1]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={1024}
        mixBlur={1}
        mixStrength={60}
        roughness={0.15}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0d1228"
        metalness={0.5}
        mirror={0.8}
      />
    </mesh>
  )
}

// ── Tiered audience seating (rows going up toward back) ─────────────────────
function AudienceSeating() {
  const seatColor = '#1a1035'
  const seatAccent = '#2a1a5e'
  const rows = 7
  const seatsPerRow = 12
  const rowDepth = 2.2

  return (
    <group position={[0, 0, 4]}>
      {Array.from({ length: rows }).map((_, row) => {
        const z = row * rowDepth
        const elevation = row * 0.35
        const rowWidth = 22 + row * 0.5

        return (
          <group key={row} position={[0, elevation, z]}>
            {/* Row platform riser */}
            <mesh position={[0, -0.18, 0]} receiveShadow>
              <boxGeometry args={[rowWidth + 1, 0.35, rowDepth - 0.1]} />
              <meshStandardMaterial color="#0d0f22" roughness={0.8} />
            </mesh>
            {/* Row step front face */}
            <mesh position={[0, -0.35, -rowDepth / 2 + 0.05]}>
              <boxGeometry args={[rowWidth + 1, 0.35, 0.12]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.3} />
            </mesh>

            {/* Individual seats */}
            {Array.from({ length: seatsPerRow }).map((_, col) => {
              const x = -((seatsPerRow - 1) / 2) * 1.8 + col * 1.8
              return (
                <group key={col} position={[x, 0, 0]}>
                  {/* Seat back */}
                  <mesh position={[0, 0.42, -0.28]} castShadow>
                    <boxGeometry args={[1.4, 0.85, 0.1]} />
                    <meshStandardMaterial color={seatColor} roughness={0.6} metalness={0.2} />
                  </mesh>
                  {/* Seat cushion */}
                  <mesh position={[0, 0.1, 0.1]}>
                    <boxGeometry args={[1.35, 0.12, 0.55]} />
                    <meshStandardMaterial color={seatAccent} roughness={0.7} />
                  </mesh>
                  {/* Armrests */}
                  {[-0.63, 0.63].map((ax, ai) => (
                    <mesh key={ai} position={[ax, 0.26, 0]}>
                      <boxGeometry args={[0.1, 0.06, 0.6]} />
                      <meshStandardMaterial color="#0a0c20" metalness={0.6} roughness={0.3} />
                    </mesh>
                  ))}
                </group>
              )
            })}

            {/* Aisle lights on each row edge */}
            <pointLight position={[-rowWidth / 2 - 0.5, 0.1, 0]} color="#4040ff" intensity={0.3} distance={3} />
            <pointLight position={[ rowWidth / 2 + 0.5, 0.1, 0]} color="#4040ff" intensity={0.3} distance={3} />
          </group>
        )
      })}
    </group>
  )
}

// ── Stage with curtains, arch, podium ──────────────────────────────────────
function GrandStage() {
  const curtainRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (curtainRef.current) {
      curtainRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.position.x += Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.0005
        }
      })
    }
  })

  // Curtain folds — multiple thin planes to simulate fabric
  const curtainFolds = 14
  const curtainWidth = 6
  const foldDepth = 0.18

  return (
    <group position={[0, 0, -22]}>
      {/* ── Stage floor platform ── */}
      <mesh position={[0, 0.7, 1]} receiveShadow castShadow>
        <boxGeometry args={[26, 1.4, 8]} />
        <meshStandardMaterial color="#0d0f28" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Stage floor surface — polished dark wood look */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.41, 1]}>
        <planeGeometry args={[26, 8]} />
        <meshStandardMaterial color="#0a1020" roughness={0.2} metalness={0.6} />
      </mesh>

      {/* Stage front gold edge trim */}
      <mesh position={[0, 0.72, 5.05]}>
        <boxGeometry args={[26, 0.12, 0.18]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1.2} />
      </mesh>

      {/* Stage step down to hall floor */}
      <mesh position={[0, 0.35, 5.4]}>
        <boxGeometry args={[8, 0.7, 0.6]} />
        <meshStandardMaterial color="#0d0f28" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.36, 5.4]}>
        <boxGeometry args={[8, 0.04, 0.6]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>

      {/* ── Proscenium arch ── */}
      {/* Left arch pillar */}
      <mesh position={[-13.5, 7, 4.5]} castShadow>
        <boxGeometry args={[1.2, 14, 1.2]} />
        <meshStandardMaterial color="#0c0e24" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Right arch pillar */}
      <mesh position={[13.5, 7, 4.5]} castShadow>
        <boxGeometry args={[1.2, 14, 1.2]} />
        <meshStandardMaterial color="#0c0e24" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Arch top beam */}
      <mesh position={[0, 14.4, 4.5]}>
        <boxGeometry args={[28, 1.5, 1.5]} />
        <meshStandardMaterial color="#0c0e24" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Gold arch trim */}
      <mesh position={[-13.5, 7, 4.7]}>
        <boxGeometry args={[0.12, 14, 0.12]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[13.5, 7, 4.7]}>
        <boxGeometry args={[0.12, 14, 0.12]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 14.7, 4.7]}>
        <boxGeometry args={[28, 0.12, 0.12]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
      </mesh>

      {/* ── Left curtain cluster ── */}
      <group ref={curtainRef} position={[-10, 7.5, 3.5]}>
        {Array.from({ length: curtainFolds }).map((_, i) => {
          const x = -curtainWidth / 2 + (i / (curtainFolds - 1)) * curtainWidth
          const zOffset = Math.sin((i / curtainFolds) * Math.PI) * foldDepth
          const brightness = 0.4 + (i % 2) * 0.15
          return (
            <mesh key={i} position={[x, 0, zOffset]}>
              <planeGeometry args={[curtainWidth / curtainFolds + 0.05, 15]} />
              <meshStandardMaterial
                color={`rgb(${Math.round(brightness * 120)}, ${Math.round(brightness * 10)}, ${Math.round(brightness * 10)})`}
                roughness={0.9} side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>

      {/* ── Right curtain cluster ── */}
      <group position={[10, 7.5, 3.5]}>
        {Array.from({ length: curtainFolds }).map((_, i) => {
          const x = -curtainWidth / 2 + (i / (curtainFolds - 1)) * curtainWidth
          const zOffset = Math.sin((i / curtainFolds) * Math.PI) * foldDepth
          const brightness = 0.4 + (i % 2) * 0.15
          return (
            <mesh key={i} position={[x, 0, zOffset]}>
              <planeGeometry args={[curtainWidth / curtainFolds + 0.05, 15]} />
              <meshStandardMaterial
                color={`rgb(${Math.round(brightness * 120)}, ${Math.round(brightness * 10)}, ${Math.round(brightness * 10)})`}
                roughness={0.9} side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>

      {/* Valance (top curtain swagged) */}
      <mesh position={[0, 13.5, 4]}>
        <boxGeometry args={[26, 1.8, 0.6]} />
        <meshStandardMaterial color="#6b0f0f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 14.3, 4]}>
        <boxGeometry args={[26, 0.1, 0.65]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1} />
      </mesh>

      {/* ── Backdrop wall ── */}
      <mesh position={[0, 7, -3.5]}>
        <boxGeometry args={[26, 16, 0.3]} />
        <meshStandardMaterial color="#060818" roughness={0.8} />
      </mesh>

      {/* ── University name ── */}
      <Text
        position={[0, 9, -3]}
        fontSize={1.6}
        color="#D4AF37"
        anchorX="center"
        anchorY="middle"
        outlineColor="#000"
        outlineWidth={0.03}
        letterSpacing={0.05}
      >
        Excellence University
      </Text>
      <Text
        position={[0, 7.2, -3]}
        fontSize={0.65}
        color="rgba(255,255,255,0.55)"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        GRADUATION CEREMONY · CLASS OF 2026
      </Text>

      {/* Gold divider line under text */}
      <mesh position={[0, 6.7, -2.95]}>
        <boxGeometry args={[12, 0.06, 0.04]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={2} />
      </mesh>

      {/* ── Podium ── */}
      <group position={[0, 1.42, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.6, 0.8]} />
          <meshStandardMaterial color="#080b1e" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.86, 0]}>
          <boxGeometry args={[1.7, 0.08, 1.1]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} />
        </mesh>
        {/* Podium front logo */}
        <mesh position={[0, 0, 0.42]}>
          <boxGeometry args={[0.9, 0.7, 0.03]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
        </mesh>
        {/* Mic stand */}
        <mesh position={[0, 1.5, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.85, 0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Stage spotlights ── */}
      <spotLight position={[-6, 14, 6]} angle={0.35} penumbra={0.4} intensity={60}
        color="#fff8e0" castShadow target-position={[0, 1.5, 0]} />
      <spotLight position={[6, 14, 6]} angle={0.35} penumbra={0.4} intensity={60}
        color="#fff0d0" castShadow target-position={[0, 1.5, 0]} />
      <spotLight position={[0, 14, 8]} angle={0.25} penumbra={0.6} intensity={40}
        color="#ffe8c0" target-position={[0, 3, -3]} />

      {/* Color wash lights */}
      <pointLight position={[-8, 5, 2]} color="#5533cc" intensity={8} distance={12} />
      <pointLight position={[8, 5, 2]} color="#cc3355" intensity={8} distance={12} />

      {/* Red carpet up to podium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.42, 4.5]}>
        <planeGeometry args={[3.5, 8]} />
        <meshStandardMaterial color="#6b0000" roughness={0.95} />
      </mesh>
    </group>
  )
}

// ── Auditorium walls with pilasters and arched windows ─────────────────────
function AuditoriumWalls() {
  const wallMat = <meshStandardMaterial color="#09091e" roughness={0.75} metalness={0.05} />

  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 8, 20]} receiveShadow>
        <boxGeometry args={[32, 18, 0.5]} />
        {wallMat}
      </mesh>

      {/* Left wall */}
      <mesh position={[-15, 8, -2]} receiveShadow>
        <boxGeometry args={[0.5, 18, 44]} />
        {wallMat}
      </mesh>
      {/* Right wall */}
      <mesh position={[15, 8, -2]}>
        <boxGeometry args={[0.5, 18, 44]} />
        {wallMat}
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 17, -2]}>
        <boxGeometry args={[30, 0.4, 44]} />
        <meshStandardMaterial color="#07091c" roughness={0.9} />
      </mesh>

      {/* ── Side pilasters (left) ── */}
      {[-16, -8, 0, 8].map((z, i) => (
        <group key={`lp${i}`} position={[-14.7, 0, z]}>
          <mesh position={[0, 8, 0]} castShadow>
            <boxGeometry args={[0.5, 16, 1.0]} />
            <meshStandardMaterial color="#0c0e22" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Gold cap */}
          <mesh position={[0, 16.2, 0]}>
            <boxGeometry args={[0.7, 0.4, 1.3]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
          </mesh>
          {/* Gold base */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.7, 0.6, 1.3]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
          </mesh>
          {/* Sconce light between pilasters */}
          <pointLight position={[0.8, 6, 0]} color="#ffd080" intensity={3} distance={8} />
          <mesh position={[0.6, 5.8, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}

      {/* ── Side pilasters (right) ── */}
      {[-16, -8, 0, 8].map((z, i) => (
        <group key={`rp${i}`} position={[14.7, 0, z]}>
          <mesh position={[0, 8, 0]} castShadow>
            <boxGeometry args={[0.5, 16, 1.0]} />
            <meshStandardMaterial color="#0c0e22" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 16.2, 0]}>
            <boxGeometry args={[0.7, 0.4, 1.3]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.7, 0.6, 1.3]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.4} />
          </mesh>
          <pointLight position={[-0.8, 6, 0]} color="#ffd080" intensity={3} distance={8} />
          <mesh position={[-0.6, 5.8, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={3} />
          </mesh>
        </group>
      ))}

      {/* ── Ceiling coffers ── */}
      {[-12, -6, 0, 6].map((z, zi) =>
        [-8, 0, 8].map((x, xi) => (
          <mesh key={`coffer${zi}-${xi}`} position={[x, 16.8, z]}>
            <boxGeometry args={[4.5, 0.15, 4.5]} />
            <meshStandardMaterial color="#0a0c20" roughness={0.8} />
          </mesh>
        ))
      )}

      {/* Gold base board (skirting) */}
      <mesh position={[0, 0.25, -2]}>
        <boxGeometry args={[30, 0.5, 0.1]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.3} />
      </mesh>

      {/* Ceiling crown molding */}
      <mesh position={[0, 16.6, -2]}>
        <boxGeometry args={[30, 0.3, 0.3]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

// ── Grand chandeliers ───────────────────────────────────────────────────────
function Chandeliers() {
  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame((state) => {
    refs.current.forEach((ref, i) => {
      if (ref) {
        ref.rotation.y = Math.sin(state.clock.elapsedTime * 0.05 + i) * 0.02
      }
    })
  })

  const positions: [number, number, number][] = [
    [0, 16, -8], [-8, 16, -4], [8, 16, -4], [0, 16, 4],
  ]

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }} position={[x, y, z]}>
          {/* Ceiling rose */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
            <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Chain */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 6]} />
            <meshStandardMaterial color="#C0A030" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Main body */}
          <group position={[0, -1.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.5, 0.8, 12]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Arms with bulbs */}
            {Array.from({ length: 8 }).map((_, j) => {
              const angle = (j / 8) * Math.PI * 2
              const r = 1.1
              return (
                <group key={j} position={[Math.cos(angle) * r, -0.3, Math.sin(angle) * r]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
                    <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
                  </mesh>
                  <mesh position={[0, -0.5, 0]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshStandardMaterial color="#FFFDE7" emissive="#FFD700" emissiveIntensity={4} />
                  </mesh>
                  <pointLight position={[0, -0.5, 0]} color="#FFE080" intensity={2} distance={6} decay={2} />
                </group>
              )
            })}
            {/* Inner glow orb */}
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial color="#FFFDE7" emissive="#FFD060" emissiveIntensity={5} transparent opacity={0.9} />
            </mesh>
            <pointLight color="#FFD060" intensity={12} distance={18} decay={2} position={[0, -0.3, 0]} />
          </group>
        </group>
      ))}
    </>
  )
}

// ── Navigation portal doors on side walls ──────────────────────────────────
function NavPortal({ door, onEnter }: { door: RoomDoor; onEnter: (href: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef<THREE.Mesh>(null)
  const isLeft = door.position[0] < 0
  const rotation: [number, number, number] = [0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = hovered
        ? 2 + Math.sin(state.clock.elapsedTime * 4) * 0.8
        : 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2
    }
  })

  return (
    <group position={door.position} rotation={rotation}>
      {/* Archway shape */}
      <mesh castShadow>
        <boxGeometry args={[3.4, 5.4, 0.25]} />
        <meshStandardMaterial color="#0a0c1e" roughness={0.4} metalness={0.7}
          emissive={door.color} emissiveIntensity={hovered ? 0.3 : 0.05} />
      </mesh>
      {/* Interior glow surface */}
      <mesh ref={glowRef} position={[0, 0, 0.14]}>
        <boxGeometry args={[2.8, 4.8, 0.04]} />
        <meshStandardMaterial color={door.color} emissive={door.color}
          emissiveIntensity={0.5} transparent opacity={0.18} />
      </mesh>
      {/* Gold frame */}
      {[[-1.55, 0], [1.55, 0]].map(([x, _], i) => (
        <mesh key={i} position={[x, 0, 0.15]}>
          <boxGeometry args={[0.1, 5.4, 0.1]} />
          <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={hovered ? 1.5 : 0.6} />
        </mesh>
      ))}
      <mesh position={[0, 2.65, 0.15]}>
        <boxGeometry args={[3.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={hovered ? 1.5 : 0.6} />
      </mesh>
      <mesh position={[0, -2.65, 0.15]}>
        <boxGeometry args={[3.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={hovered ? 1.5 : 0.6} />
      </mesh>

      {/* Click target */}
      <mesh position={[0, 0, 0.3]}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
        onClick={() => onEnter(door.href)}>
        <boxGeometry args={[2.8, 4.8, 0.4]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      <pointLight color={door.color} intensity={hovered ? 6 : 1.5} distance={5} decay={2} position={[0, 0, 1]} />

      <Html position={[0, -3.2, 1]} center>
        <div className="pointer-events-none select-none text-center" style={{ transform: `scale(${hovered ? 1.12 : 1})`, transition: 'transform 0.2s' }}>
          <div className="text-2xl mb-0.5">{door.emoji}</div>
          <div className="text-white font-bold text-sm" style={{ textShadow: `0 0 12px ${door.color}, 0 2px 4px #000` }}>{door.label}</div>
          {hovered && <div className="text-xs mt-0.5" style={{ color: door.color }}>Click to enter →</div>}
        </div>
      </Html>
    </group>
  )
}

// ── Back of hall doors ──────────────────────────────────────────────────────
function BackDoors({ onEnter }: { onEnter: (href: string) => void }) {
  const backDoors = DOORS.filter(d => d.position[2] === 14)
  return (
    <group>
      {backDoors.map((door, i) => {
        const [hovered, setHovered] = useState(false)
        return (
          <group key={i} position={door.position}>
            <mesh castShadow>
              <boxGeometry args={[3, 5, 0.3]} />
              <meshStandardMaterial color="#09091e" roughness={0.4} metalness={0.7}
                emissive={door.color} emissiveIntensity={hovered ? 0.3 : 0.08} />
            </mesh>
            <mesh position={[0, 0, 0.18]}
              onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
              onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
              onClick={() => onEnter(door.href)}>
              <boxGeometry args={[2.8, 4.8, 0.1]} />
              <meshStandardMaterial transparent opacity={0} />
            </mesh>
            <Html position={[0, -3, 0.4]} center>
              <div className="pointer-events-none text-center select-none">
                <div className="text-2xl">{door.emoji}</div>
                <div className="text-white font-bold text-xs mt-0.5" style={{ textShadow: `0 0 10px ${door.color}` }}>{door.label}</div>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

// ── Floating confetti / sparkles around the hall ────────────────────────────
function CelebrationParticles() {
  return (
    <>
      <Sparkles count={120} scale={[28, 14, 36]} size={2} speed={0.3} color="#D4AF37" position={[0, 6, -2]} />
      <Sparkles count={60} scale={[20, 8, 20]} size={1.5} speed={0.5} color="#8B5CF6" position={[0, 3, 0]} />
    </>
  )
}

// ── Floating graduation caps ────────────────────────────────────────────────
function FloatingCaps() {
  return (
    <>
      {[[-10, 13, -14], [10, 14, -12], [0, 15, -10], [-5, 12, -18], [5, 13, -16]].map(([x, y, z], i) => (
        <Float key={i} speed={0.8 + i * 0.2} rotationIntensity={0.4} floatIntensity={0.6}>
          <group position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.08, 0.07, 10]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.8} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[1.0, 0.07, 1.0]} />
              <meshStandardMaterial color="#1a237e" roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0.35, -0.12, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.35, 5]} />
              <meshStandardMaterial color="#D4AF37" />
            </mesh>
          </group>
        </Float>
      ))}
    </>
  )
}

// ── Seated avatar crowd ─────────────────────────────────────────────────────
function SeatedCrowd() {
  const avatars = useMemo(() => {
    const items = []
    const rows = 5
    const cols = 10
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -((cols - 1) / 2) * 1.8 + c * 1.8
        const z = 5 + r * 2.2
        const elevation = r * 0.35
        const seed = r * cols + c
        items.push({ x, z: z - 22, y: elevation + 0.9, seed })
      }
    }
    return items
  }, [])

  return (
    <group>
      {avatars.map((a, i) => (
        <Html key={i} position={[a.x, a.y, a.z]} center>
          <div style={{ pointerEvents: 'none', transform: 'scale(0.28)', transformOrigin: 'bottom center', opacity: 0.85 }}>
            <svg width="60" height="90" viewBox="0 0 60 90">
              {/* Graduation gown body */}
              <ellipse cx="30" cy="72" rx="20" ry="24" fill={`hsl(${230 + (a.seed % 20)},60%,${16 + (a.seed % 3) * 3}%)`} />
              {/* Head */}
              <circle cx="30" cy="26" r="14" fill={`hsl(${20 + (a.seed * 17) % 30},45%,${50 + (a.seed % 4) * 8}%)`} />
              {/* Cap */}
              <rect x="16" y="12" width="28" height="5" rx="1" fill="#1a237e" />
              <ellipse cx="30" cy="12" rx="10" ry="3" fill="#1a237e" />
              {/* Tassel */}
              <line x1="42" y1="12" x2="46" y2="22" stroke="#D4AF37" strokeWidth="1.5" />
            </svg>
          </div>
        </Html>
      ))}
    </group>
  )
}

// ── WASD + mouse look camera controller ────────────────────────────────────
function CameraController({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const mouse = useRef({ x: 0, y: 0, down: false })
  const yaw = useRef(-Math.PI)
  const pitch = useRef(-0.18)
  const vel = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!enabled) return
    camera.position.set(0, 2.8, 14)
    yaw.current = -Math.PI
    pitch.current = -0.18

    const onKey = (e: KeyboardEvent, v: boolean) => { keys.current[e.code] = v }
    const onDown = (e: MouseEvent) => { mouse.current.down = true; mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    const onUp = () => { mouse.current.down = false }
    const onMove = (e: MouseEvent) => {
      if (!mouse.current.down) return
      yaw.current -= (e.clientX - mouse.current.x) * 0.003
      pitch.current = Math.max(-0.7, Math.min(0.4, pitch.current - (e.clientY - mouse.current.y) * 0.003))
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    window.addEventListener('keydown', e => onKey(e, true))
    window.addEventListener('keyup', e => onKey(e, false))
    gl.domElement.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('keydown', e => onKey(e, true))
      window.removeEventListener('keyup', e => onKey(e, false))
      gl.domElement.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
    }
  }, [enabled, camera, gl])

  useFrame((_, delta) => {
    if (!enabled) return
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)

    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
    const dir = new THREE.Vector3()

    if (keys.current['KeyW'] || keys.current['ArrowUp']) dir.add(forward)
    if (keys.current['KeyS'] || keys.current['ArrowDown']) dir.sub(forward)
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) dir.sub(right)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir.add(right)

    if (dir.lengthSq() > 0) dir.normalize()
    vel.current.lerp(dir.multiplyScalar(7), 0.12)
    camera.position.addScaledVector(vel.current, delta)
    camera.position.x = Math.max(-13.5, Math.min(13.5, camera.position.x))
    camera.position.z = Math.max(-20, Math.min(18, camera.position.z))
    camera.position.y = 2.8
  })

  return null
}

// ── Full scene ──────────────────────────────────────────────────────────────
function AuditoriumScene({ onEnter }: { onEnter: (href: string) => void }) {
  const sideDoors = DOORS.filter(d => Math.abs(d.position[0]) === 14)

  return (
    <>
      <fog attach="fog" args={['#060816', 30, 70]} />
      <ambientLight intensity={0.25} color="#1a2050" />

      <Environment preset="city" />

      <CameraController enabled />

      <MarbleFloor />
      <AuditoriumWalls />
      <AudienceSeating />
      <GrandStage />
      <Chandeliers />
      <FloatingCaps />
      <SeatedCrowd />
      <CelebrationParticles />

      {/* Side wall portals */}
      {sideDoors.map((door, i) => (
        <NavPortal key={i} door={door} onEnter={onEnter} />
      ))}

      {/* Back doors */}
      <BackDoors onEnter={onEnter} />

      {/* Floor ambient gold glow */}
      <pointLight color="#D4AF37" intensity={1.5} distance={25} position={[0, 0.5, -10]} />
      <pointLight color="#3333aa" intensity={0.8} distance={20} position={[0, 1, 10]} />
    </>
  )
}

// ── Entry screen ────────────────────────────────────────────────────────────
function EntryScreen({ onEnter }: { onEnter: () => void }) {
  const { myAvatar, myName } = useGraduationStore()
  const router = useRouter()

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #05040f, #0d0820, #120a2e)' }}>

      {/* Background 3D preview */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={70} />
          <fog attach="fog" args={['#060816', 20, 55]} />
          <ambientLight intensity={0.3} color="#1a2050" />
          <Environment preset="city" />
          <MarbleFloor />
          <AuditoriumWalls />
          <GrandStage />
          <Chandeliers />
          <AudienceSeating />
        </Canvas>
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-6 max-w-lg">

        <div className="text-6xl mb-5">🎓</div>

        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-3 leading-tight">
          Virtual Graduation
          <br />
          <span style={{ background: 'linear-gradient(135deg, #D4AF37, #f0d060, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Hall · 2026
          </span>
        </h1>

        <p className="text-white/40 text-sm mb-8">
          Use <kbd className="bg-white/10 px-2 py-0.5 rounded text-white/60 text-xs">W A S D</kbd> to walk &nbsp;·&nbsp; drag to look around &nbsp;·&nbsp; click doors to navigate
        </p>

        {myName && (
          <div className="flex items-center justify-center gap-3 mb-6 px-5 py-3 rounded-2xl w-fit mx-auto"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <AvatarDisplay avatar={myAvatar} size={52} />
            <div className="text-left">
              <p className="text-white font-semibold text-sm">{myName}</p>
              <p className="text-xs" style={{ color: '#D4AF37', opacity: 0.7 }}>Avatar ready ✓</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onEnter}
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5, #D4AF37)', boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}>
            Enter Auditorium →
          </motion.button>
          {!myName && (
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => router.push('/avatar')}
              className="px-6 py-4 rounded-2xl font-semibold text-white border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(212,175,55,0.3)' }}>
              Create Avatar
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Exported component ──────────────────────────────────────────────────────
export default function MetaverseLobby() {
  const router = useRouter()
  const { myName, myAvatar } = useGraduationStore()
  const [entered, setEntered] = useState(false)
  const [fadingTo, setFadingTo] = useState('')

  const handleEnter = (href: string) => {
    setFadingTo(href)
    setTimeout(() => router.push(href), 700)
  }

  if (!entered) return <EntryScreen onEnter={() => setEntered(true)} />

  return (
    <div className="fixed inset-0" style={{ background: '#060816' }}>
      <AnimatePresence>
        {fadingTo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black z-50" />
        )}
      </AnimatePresence>

      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <PerspectiveCamera makeDefault fov={72} near={0.1} far={120} />
        <Suspense fallback={null}>
          <AuditoriumScene onEnter={handleEnter} />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <div className="px-4 py-2 rounded-xl text-xs text-white/50 flex gap-3"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span>⬆⬇⬅➡ or W A S D move</span>
          <span>·</span>
          <span>🖱 drag to look</span>
          <span>·</span>
          <span>click doors to navigate</span>
        </div>
      </div>

      {myName && (
        <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white/70 text-xs">{myName}</span>
        </div>
      )}

      <button onClick={() => setEntered(false)}
        className="absolute top-5 left-5 text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
        ← Exit
      </button>
    </div>
  )
}
