import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SceneId = 'lobby' | 'lobby-image' | 'auditorium'

export interface Hotspot {
  id: string
  label: string
  sublabel: string
  icon: string
  yaw: number
  pitch: number
  action: 'scene' | 'route' | 'external'
  target: string
  color: string
}

export interface SceneConfig {
  id: SceneId
  type: 'image' | 'video'
  src: string
  title: string
  initialYaw: number
  initialPitch: number
  initialFov?: number
  hotspots: Hotspot[]
}

interface VenueState {
  scenes: SceneConfig[]
  bbbUrl: string
  bbbYaw: number
  bbbPitch: number
  bbbWidth: number
  bbbHeight: number
  hasSeenIntro: boolean
  markIntroSeen: () => void
  updateScene: (id: SceneId, updates: Partial<Omit<SceneConfig, 'id'>>) => void
  updateHotspot: (sceneId: SceneId, hotspotId: string, updates: Partial<Hotspot>) => void
  addHotspot: (sceneId: SceneId, hotspot: Hotspot) => void
  removeHotspot: (sceneId: SceneId, hotspotId: string) => void
  setBbbUrl: (url: string) => void
  setBbbPosition: (yaw: number, pitch: number) => void
  setBbbSize: (w: number, h: number) => void
}

// PASTE YOUR IMGBB URLS HERE (or update via Admin → Venue tab):
const LOBBY_IMAGE_URL = 'https://i.ibb.co/MxhZ4SFs/Nextora-Lobby-8192x4096.png'
const AUDITORIUM_IMAGE_URL = 'https://i.ibb.co/6RWC5FgC/Chat-GPT-Image-Jun-20-2026-11-34-32-PM.png'
// Temporary welcome-lobby image, used until a finished welcome video is ready.
const WELCOME_IMAGE_URL = 'https://i.ibb.co/5XDrKg3g/Chat-GPT-Image-Jun-20-2026-10-39-55-PM.png'

const defaultScenes: SceneConfig[] = [
  {
    id: 'lobby',
    type: 'image',
    src: WELCOME_IMAGE_URL,
    title: 'Welcome Lobby',
    initialYaw: -92,
    initialPitch: -23,
    initialFov: 115,
    hotspots: [
      { id: 'aud',   label: 'Auditorium',   sublabel: 'Live Ceremony',        icon: '🎭', yaw: -150, pitch: 10, action: 'scene', target: 'auditorium',   color: '#2563eb' },
      { id: 'grads', label: 'Hall of Fame', sublabel: 'Wall of Fame',         icon: '🎓', yaw:  130, pitch:  1, action: 'route', target: '/graduates',   color: '#9333ea' },
      { id: 'photo', label: 'Photo Booth',  sublabel: 'Capture Memories',     icon: '📷', yaw:   46, pitch: -2, action: 'route', target: '/photo-booth', color: '#ec4899' },
      { id: 'prog',  label: 'Programme',    sublabel: "Today's Schedule",     icon: '📋', yaw:  174, pitch: -1, action: 'route', target: '/program',     color: '#22c55e' },
    ],
  },
  {
    id: 'lobby-image',
    type: 'image',
    src: LOBBY_IMAGE_URL,
    title: 'Welcome Lobby',
    initialYaw: -92,
    initialPitch: -23,
    initialFov: 115,
    hotspots: [
      { id: 'helpdesk', label: 'Help Desk',     sublabel: 'Chat with us on WhatsApp', icon: '💬', yaw: -92, pitch: -23, action: 'external', target: 'https://wa.me/1234567890', color: '#25D366' },
      { id: 'grads2',   label: 'Hall of Fame',  sublabel: 'Wall of Fame',             icon: '🎓', yaw:  130, pitch:  1, action: 'route',    target: '/graduates',              color: '#9333ea' },
      { id: 'photo2',   label: 'Photo Booth',   sublabel: 'Capture Memories',         icon: '📷', yaw:   46, pitch: -2, action: 'route',    target: '/photo-booth',            color: '#ec4899' },
      { id: 'prog2',    label: 'Programme',     sublabel: "Today's Schedule",         icon: '📋', yaw:  174, pitch: -1, action: 'route',    target: '/program',                color: '#22c55e' },
    ],
  },
  {
    id: 'auditorium',
    type: 'image',
    src: AUDITORIUM_IMAGE_URL,
    title: 'Graduation Ceremony Hall',
    initialYaw: -91,
    initialPitch: 21,
    initialFov: 100,
    hotspots: [
      { id: 'back', label: 'Back to Lobby', sublabel: 'Exit Hall', icon: '🚪', yaw: 89, pitch: 10, action: 'scene', target: 'lobby-image', color: '#6b7280' },
    ],
  },
]

export const useVenueStore = create<VenueState>()(
  persist(
    (set) => ({
      scenes: defaultScenes,
      bbbUrl: '',
      bbbYaw: -91,
      bbbPitch: 19,
      bbbWidth: 64,
      bbbHeight: 31,
      hasSeenIntro: false,

      markIntroSeen: () => set({ hasSeenIntro: true }),

      updateScene: (id, updates) =>
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === id ? { ...scene, ...updates } : scene
          ),
        })),

      updateHotspot: (sceneId, hotspotId, updates) =>
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  hotspots: scene.hotspots.map((hs) =>
                    hs.id === hotspotId ? { ...hs, ...updates } : hs
                  ),
                }
              : scene
          ),
        })),

      addHotspot: (sceneId, hotspot) =>
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === sceneId
              ? { ...scene, hotspots: [...scene.hotspots, hotspot] }
              : scene
          ),
        })),

      removeHotspot: (sceneId, hotspotId) =>
        set((state) => ({
          scenes: state.scenes.map((scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  hotspots: scene.hotspots.filter((hs) => hs.id !== hotspotId),
                }
              : scene
          ),
        })),

      setBbbUrl: (url) => set({ bbbUrl: url }),

      setBbbPosition: (yaw, pitch) => set({ bbbYaw: yaw, bbbPitch: pitch }),

      setBbbSize: (w, h) => set({ bbbWidth: w, bbbHeight: h }),
    }),
    { name: 'venue-store-v33' }
  )
)
