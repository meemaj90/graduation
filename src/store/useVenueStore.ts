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
  hotspots: Hotspot[]
}

interface VenueState {
  scenes: SceneConfig[]
  bbbUrl: string
  bbbYaw: number
  bbbPitch: number
  bbbWidth: number
  bbbHeight: number
  updateScene: (id: SceneId, updates: Partial<Omit<SceneConfig, 'id'>>) => void
  updateHotspot: (sceneId: SceneId, hotspotId: string, updates: Partial<Hotspot>) => void
  addHotspot: (sceneId: SceneId, hotspot: Hotspot) => void
  removeHotspot: (sceneId: SceneId, hotspotId: string) => void
  setBbbUrl: (url: string) => void
  setBbbPosition: (yaw: number, pitch: number) => void
  setBbbSize: (w: number, h: number) => void
}

// PASTE YOUR IMGBB URLS HERE (or update via Admin → Venue tab):
const LOBBY_IMAGE_URL = 'https://i.ibb.co/Zp4DCmcd/Chat-GPT-Image-Jun-16-2026-10-50-40-PM.png'
const AUDITORIUM_IMAGE_URL = 'https://i.ibb.co/SDP66t9K/Chat-GPT-Image-Jun-16-2026-10-49-45-PM.png'

const defaultScenes: SceneConfig[] = [
  {
    id: 'lobby',
    type: 'video',
    src: '/images/lobby-video.mp4',
    title: 'Welcome Lobby',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { id: 'aud',   label: 'Auditorium',   sublabel: 'Live Ceremony',        icon: '🎭', yaw: -163, pitch: 22, action: 'scene', target: 'auditorium',   color: '#2563eb' },
      { id: 'grads', label: 'Hall of Fame', sublabel: 'Wall of Fame',         icon: '🎓', yaw: -110, pitch: 22, action: 'route', target: '/graduates',   color: '#9333ea' },
      { id: 'photo', label: 'Photo Booth',  sublabel: 'Capture Memories',     icon: '📷', yaw:  -72, pitch: 22, action: 'route', target: '/photo-booth', color: '#ec4899' },
      { id: 'prog',  label: 'Programme',    sublabel: "Today's Schedule",     icon: '📋', yaw:   73, pitch: 22, action: 'route', target: '/program',     color: '#22c55e' },
      { id: 'awd',   label: 'Awards Hall',  sublabel: 'Celebrate Excellence', icon: '🏆', yaw:  113, pitch: 22, action: 'route', target: '/graduates',   color: '#D4AF37' },
      { id: 'mem',   label: 'Memory Lane',  sublabel: 'Our Journey',          icon: '❤️', yaw:  164, pitch: 22, action: 'route', target: '/networking',  color: '#ef4444' },
    ],
  },
  {
    id: 'lobby-image',
    type: 'image',
    src: LOBBY_IMAGE_URL,
    title: 'Welcome Lobby',
    initialYaw: 0,
    initialPitch: 0,
    hotspots: [
      { id: 'helpdesk', label: 'Help Desk',     sublabel: 'Chat with us on WhatsApp', icon: '💬', yaw: 0,    pitch: -8, action: 'external', target: 'https://wa.me/1234567890', color: '#25D366' },
      { id: 'aud2',     label: 'Auditorium',    sublabel: 'Live Ceremony',            icon: '🎭', yaw: -150, pitch: 10, action: 'scene',    target: 'auditorium',              color: '#2563eb' },
      { id: 'grads2',   label: 'Hall of Fame',  sublabel: 'Wall of Fame',             icon: '🎓', yaw: -100, pitch: 10, action: 'route',    target: '/graduates',              color: '#9333ea' },
      { id: 'photo2',   label: 'Photo Booth',   sublabel: 'Capture Memories',         icon: '📷', yaw:  -50, pitch: 10, action: 'route',    target: '/photo-booth',            color: '#ec4899' },
      { id: 'prog2',    label: 'Programme',     sublabel: "Today's Schedule",         icon: '📋', yaw:   60, pitch: 10, action: 'route',    target: '/program',                color: '#22c55e' },
      { id: 'awd2',     label: 'Awards Hall',   sublabel: 'Celebrate Excellence',     icon: '🏆', yaw:  110, pitch: 10, action: 'route',    target: '/graduates',              color: '#D4AF37' },
      { id: 'mem2',     label: 'Memory Lane',   sublabel: 'Our Journey',              icon: '❤️', yaw:  160, pitch: 10, action: 'route',    target: '/networking',             color: '#ef4444' },
    ],
  },
  {
    id: 'auditorium',
    type: 'image',
    src: AUDITORIUM_IMAGE_URL,
    title: 'Graduation Ceremony Hall',
    initialYaw: -90,
    initialPitch: 18,
    hotspots: [
      { id: 'back', label: 'Back to Lobby', sublabel: 'Exit Hall', icon: '🚪', yaw: 90, pitch: 5, action: 'scene', target: 'lobby-image', color: '#6b7280' },
    ],
  },
]

export const useVenueStore = create<VenueState>()(
  persist(
    (set) => ({
      scenes: defaultScenes,
      bbbUrl: '',
      bbbYaw: -90,
      bbbPitch: 18,
      bbbWidth: 820,
      bbbHeight: 338,

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
    { name: 'venue-store-v10' }
  )
)
