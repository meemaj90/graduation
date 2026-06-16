import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HofGraduate {
  id: string
  name: string
  level: 'UKG → Year 1' | 'Year 6 → Year 7' | 'Year 9 → Year 10'
  subject: string
  photoUrl: string | null
  dream: string
  memory: string
  teacherMsg: string
  parentMsg: string
  honors: string
}

export interface Wish {
  id: string
  gradId: string
  guestName: string
  message: string
  photoUrl: string | null
  timestamp: number
}

interface HallState {
  graduates: HofGraduate[]
  wishes: Record<string, Wish[]>
  addGraduate: (g: HofGraduate) => void
  updateGraduate: (id: string, updates: Partial<HofGraduate>) => void
  removeGraduate: (id: string) => void
  addWish: (wish: Wish) => void
}

const defaultGraduates: HofGraduate[] = [
  // UKG → Year 1
  { id: 'g1', name: 'Phanuel', level: 'UKG → Year 1', subject: 'Literacy & Numeracy', photoUrl: null, dream: 'To become a doctor and help people', memory: 'Learning to read my very first book all by myself', teacherMsg: 'Phanuel is a shining star — always eager to learn and grow!', parentMsg: 'We are so proud of you Phanuel! Keep shining! 💛', honors: 'Star Reader Award' },
  { id: 'g2', name: 'Jesse', level: 'UKG → Year 1', subject: 'Creative Arts', photoUrl: null, dream: 'To be an amazing footballer and artist', memory: 'Drawing my first big picture and seeing it on the classroom wall', teacherMsg: 'Jesse brings energy and creativity to everything he does. The world needs your joy!', parentMsg: 'Our little champion! We love you so much, Jesse!', honors: 'Creative Star Award' },
  { id: 'g3', name: 'Royalty', level: 'UKG → Year 1', subject: 'Science & Discovery', photoUrl: null, dream: 'To explore space and discover new planets', memory: 'Our first science experiment making a volcano erupt', teacherMsg: 'Royalty asks the most wonderful questions. She is going to do great things!', parentMsg: 'You are our greatest treasure, Royalty. Keep reaching for the stars! ✨', honors: 'Curious Mind Award' },
  { id: 'g4', name: 'Yushroh', level: 'UKG → Year 1', subject: 'Mathematics & Games', photoUrl: null, dream: 'To build big buildings one day', memory: 'Winning our class counting competition and getting a gold star', teacherMsg: 'Yushroh has a natural gift for numbers and a wonderful kind heart.', parentMsg: 'Yushroh we are so proud. You worked hard and it shows! Love you always 🌟', honors: 'Maths Star Award' },
  // Year 6 → Year 7
  { id: 'g5', name: 'Precious', level: 'Year 6 → Year 7', subject: 'English & Literature', photoUrl: null, dream: 'To be a writer and publish books that inspire children across Africa', memory: 'Writing my first short story and reading it to the whole school', teacherMsg: 'Precious has a gift for words that moves everyone who reads her work. Secondary school is gaining a gem.', parentMsg: 'Precious, you truly are precious to us. We love you and believe in you so much! 📖', honors: 'Young Author Award' },
  { id: 'g6', name: 'Marie', level: 'Year 6 → Year 7', subject: 'Mathematics & Science', photoUrl: null, dream: 'To become an engineer and build bridges in Africa', memory: 'Winning the Year 6 inter-school maths competition', teacherMsg: 'Marie is a brilliant mathematical mind. She is going to be extraordinary.', parentMsg: 'Marie, you have made us so incredibly proud. Keep dreaming big! 🌟', honors: 'Academic Excellence' },
  { id: 'g7', name: 'Edem', level: 'Year 6 → Year 7', subject: 'Drama & Performing Arts', photoUrl: null, dream: 'To be a famous actor and tell African stories to the world', memory: 'Playing the lead role in our Year 6 production of The Lion King', teacherMsg: 'Edem has a stage presence that lights up the room. Destined for greatness.', parentMsg: 'Our star performer! We could not stop smiling. We love you, son!', honors: 'Performing Arts Award' },
  { id: 'g8', name: 'Peter', level: 'Year 6 → Year 7', subject: 'History & Geography', photoUrl: null, dream: 'To be a journalist and travel the world reporting the truth', memory: 'Our class trip and writing a report that was published in the school newsletter', teacherMsg: 'Peter has a sharp analytical mind and a passion for truth. Watch out, world!', parentMsg: 'Peter, your voice matters more than you know. Keep going! 📰', honors: 'Young Journalist Award' },
  // Year 9 → Year 10
  { id: 'g9', name: 'Daniel', level: 'Year 9 → Year 10', subject: 'STEM & Technology', photoUrl: null, dream: 'To build the next great African tech company', memory: 'Coding our first app and presenting it at the school science fair', teacherMsg: 'Daniel combines technical brilliance with genuine kindness. He is already a leader.', parentMsg: 'Son, you have shown us what dedication looks like. The world is yours! 💪', honors: 'STEM Innovation Award' },
  { id: 'g10', name: 'Nimatallah', level: 'Year 9 → Year 10', subject: 'Biology & Chemistry', photoUrl: null, dream: 'To become a doctor and find cures that save lives', memory: 'Our biology field trip and discovering my passion for science', teacherMsg: 'Nimatallah has the heart of a healer and the mind of a scientist. She will change the world.', parentMsg: 'Our pride and joy. Study hard and remember — you can do anything! 🌺', honors: 'Science Excellence Award' },
  { id: 'g11', name: 'Joshua', level: 'Year 9 → Year 10', subject: 'Business & Economics', photoUrl: null, dream: 'To become a successful entrepreneur and create jobs in his community', memory: 'Running the school mini-enterprise and making our first profit', teacherMsg: 'Joshua has an entrepreneurial spirit and exceptional people skills. Watch this space.', parentMsg: 'Joshua, you have worked so hard. Year 10 is going to be amazing. We believe in you! 🚀', honors: 'Young Entrepreneur Award' },
]

export const useHallStore = create<HallState>()(
  persist(
    (set) => ({
      graduates: defaultGraduates,
      wishes: {},

      addGraduate: (g) =>
        set((state) => ({ graduates: [...state.graduates, g] })),

      updateGraduate: (id, updates) =>
        set((state) => ({
          graduates: state.graduates.map((grad) =>
            grad.id === id ? { ...grad, ...updates } : grad
          ),
        })),

      removeGraduate: (id) =>
        set((state) => ({
          graduates: state.graduates.filter((grad) => grad.id !== id),
        })),

      addWish: (wish) =>
        set((state) => ({
          wishes: {
            ...state.wishes,
            [wish.gradId]: [...(state.wishes[wish.gradId] ?? []), wish],
          },
        })),
    }),
    { name: 'hall-store-v2' }
  )
)
