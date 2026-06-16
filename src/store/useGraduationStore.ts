import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Graduate,
  ProgramItem,
  NetworkingTable,
  Sponsor,
  Reaction,
  CeremonyStatus,
  CongratulatoryMessage,
  AvatarCustomization,
  VirtualAttendee,
} from '../types'
import {
  graduates,
  programItems,
  networkingTables,
  sponsors,
} from '../lib/mockData'

const DEFAULT_AVATAR: AvatarCustomization = {
  skinTone: '#F5CBA7',
  hairStyle: 'short',
  hairColor: '#2C1810',
  outfit: 'gown',
  outfitColor: '#1a237e',
  accessory: 'none',
  capColor: '#1a237e',
  usePhoto: false,
}

interface GraduationState {
  graduates: Graduate[]
  programItems: ProgramItem[]
  networkingTables: NetworkingTable[]
  sponsors: Sponsor[]
  ceremonyStatus: CeremonyStatus
  attendeeCount: number
  reactions: Reaction[]
  bbbJoinUrl: string
  currentProgramItemIndex: number
  isAdminAuthenticated: boolean
  // Avatar & virtual stage
  myAvatar: AvatarCustomization
  myName: string
  myRole: 'graduate' | 'guest' | 'faculty'
  virtualAttendees: VirtualAttendee[]
  speakerQueue: string[]   // attendee IDs queued to speak
  currentSpeakerId: string | null
  stageRequestSent: boolean

  addReaction: (type: string) => void
  clearOldReactions: () => void
  setAttendeeCount: (count: number) => void
  setCeremonyStatus: (status: CeremonyStatus) => void
  setBbbJoinUrl: (url: string) => void
  updateGraduate: (id: string, updates: Partial<Graduate>) => void
  addGraduate: (graduate: Graduate) => void
  deleteGraduate: (id: string) => void
  addCongratulatoryMessage: (graduateId: string, msg: Omit<CongratulatoryMessage, 'id'>) => void
  addProgramItem: (item: ProgramItem) => void
  updateProgramItem: (id: string, updates: Partial<ProgramItem>) => void
  deleteProgramItem: (id: string) => void
  loginAdmin: (password: string) => boolean
  logoutAdmin: () => void
  // Avatar actions
  setMyAvatar: (avatar: AvatarCustomization) => void
  setMyName: (name: string) => void
  setMyRole: (role: 'graduate' | 'guest' | 'faculty') => void
  joinVirtualStage: () => void
  nextSpeaker: () => void
  dismissSpeaker: () => void
}

export const useGraduationStore = create<GraduationState>()(
  persist(
    (set) => ({
      graduates: graduates,
      programItems: programItems,
      networkingTables: networkingTables,
      sponsors: sponsors,
      ceremonyStatus: 'before',
      attendeeCount: 247,
      reactions: [],
      bbbJoinUrl: '',
      currentProgramItemIndex: 0,
      isAdminAuthenticated: false,
      myAvatar: DEFAULT_AVATAR,
      myName: '',
      myRole: 'guest',
      virtualAttendees: [
        { id: 'demo1', name: 'Alexandra Chen', role: 'graduate', avatar: { ...DEFAULT_AVATAR, hairStyle: 'long', hairColor: '#8B4513', outfitColor: '#1a237e', capColor: '#1a237e', skinTone: '#FDBCB4', usePhoto: false }, position: { x: 20, y: 60 }, isSpeaking: false, isStagePending: false },
        { id: 'demo2', name: 'Marcus Johnson', role: 'graduate', avatar: { ...DEFAULT_AVATAR, skinTone: '#8D5524', hairColor: '#1a0a00', outfitColor: '#1a237e', capColor: '#1a237e', usePhoto: false }, position: { x: 35, y: 65 }, isSpeaking: false, isStagePending: false },
        { id: 'demo3', name: 'Sofia Reyes', role: 'graduate', avatar: { ...DEFAULT_AVATAR, skinTone: '#C68642', hairStyle: 'long', hairColor: '#1C1008', outfitColor: '#1a237e', capColor: '#1a237e', usePhoto: false }, position: { x: 55, y: 58 }, isSpeaking: false, isStagePending: false },
        { id: 'demo4', name: 'Dr. Eleanor Hayes', role: 'faculty', avatar: { ...DEFAULT_AVATAR, skinTone: '#FDBCB4', hairStyle: 'short', hairColor: '#808080', outfit: 'suit', outfitColor: '#2c2c2c', accessory: 'glasses', capColor: '#000', usePhoto: false }, position: { x: 72, y: 62 }, isSpeaking: true, isStagePending: false },
        { id: 'demo5', name: 'Proud Parent', role: 'guest', avatar: { ...DEFAULT_AVATAR, skinTone: '#F5CBA7', outfit: 'suit', outfitColor: '#1a3a5c', capColor: '#1a237e', usePhoto: false }, position: { x: 85, y: 70 }, isSpeaking: false, isStagePending: false },
      ],
      speakerQueue: [],
      currentSpeakerId: 'demo4',
      stageRequestSent: false,

      addReaction: (type: string) =>
        set((state) => ({
          reactions: [
            ...state.reactions,
            {
              id: `reaction-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type,
              timestamp: Date.now(),
              x: Math.random() * 100,
            },
          ],
        })),

      clearOldReactions: () => {
        const now = Date.now()
        set((state) => ({
          reactions: state.reactions.filter((r) => now - r.timestamp < 3000),
        }))
      },

      setAttendeeCount: (count: number) => set({ attendeeCount: count }),

      setCeremonyStatus: (status: CeremonyStatus) => set({ ceremonyStatus: status }),

      setBbbJoinUrl: (url: string) => set({ bbbJoinUrl: url }),

      updateGraduate: (id: string, updates: Partial<Graduate>) =>
        set((state) => ({
          graduates: state.graduates.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      addGraduate: (graduate: Graduate) =>
        set((state) => ({ graduates: [...state.graduates, graduate] })),

      deleteGraduate: (id: string) =>
        set((state) => ({
          graduates: state.graduates.filter((g) => g.id !== id),
        })),

      addCongratulatoryMessage: (
        graduateId: string,
        msg: Omit<CongratulatoryMessage, 'id' | 'graduateId'>
      ) =>
        set((state) => ({
          graduates: state.graduates.map((g) =>
            g.id === graduateId
              ? {
                  ...g,
                  messages: [
                    ...g.messages,
                    {
                      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                      graduateId,
                      ...msg,
                    },
                  ],
                }
              : g
          ),
        })),

      addProgramItem: (item) =>
        set((state) => ({ programItems: [...state.programItems, item] })),

      updateProgramItem: (id, updates) =>
        set((state) => ({
          programItems: state.programItems.map((p) => p.id === id ? { ...p, ...updates } : p),
        })),

      deleteProgramItem: (id) =>
        set((state) => ({
          programItems: state.programItems.filter((p) => p.id !== id),
        })),

      loginAdmin: (password: string): boolean => {
        if (password === 'admin123') {
          set({ isAdminAuthenticated: true })
          return true
        }
        return false
      },

      logoutAdmin: () => set({ isAdminAuthenticated: false }),

      setMyAvatar: (avatar) => set({ myAvatar: avatar }),
      setMyName: (name) => set({ myName: name }),
      setMyRole: (role) => set({ myRole: role }),

      joinVirtualStage: () =>
        set((state) => {
          const myId = `me-${Date.now()}`
          const me: VirtualAttendee = {
            id: myId,
            name: state.myName || 'You',
            role: state.myRole,
            avatar: state.myAvatar,
            position: { x: Math.random() * 60 + 10, y: Math.random() * 20 + 60 },
            isSpeaking: false,
            isStagePending: true,
          }
          return {
            virtualAttendees: [...state.virtualAttendees, me],
            speakerQueue: [...state.speakerQueue, myId],
            stageRequestSent: true,
          }
        }),

      nextSpeaker: () =>
        set((state) => {
          const [next, ...rest] = state.speakerQueue
          return {
            currentSpeakerId: next ?? null,
            speakerQueue: rest,
            virtualAttendees: state.virtualAttendees.map((a) => ({
              ...a,
              isSpeaking: a.id === next,
              isStagePending: rest.includes(a.id),
            })),
          }
        }),

      dismissSpeaker: () =>
        set((state) => ({
          currentSpeakerId: null,
          virtualAttendees: state.virtualAttendees.map((a) => ({ ...a, isSpeaking: false })),
        })),
    }),
    {
      name: 'graduation-store',
    }
  )
)
