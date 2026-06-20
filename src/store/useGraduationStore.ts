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
} from '../types'
import {
  graduates,
  programItems,
  networkingTables,
  sponsors,
} from '../lib/mockData'

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
  myName: string

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
  setMyName: (name: string) => void
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
      myName: '',

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

      setMyName: (name) => set({ myName: name }),
    }),
    {
      name: 'graduation-store',
    }
  )
)
