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
  // Secondary-only fields (Year 6→7 and Year 9→10)
  achievement?: string
  quote?: string
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

// Demo placeholder face avatars (deterministic per name) — replace with real
// photos via the Admin → Graduates tab whenever you have them.
const demoPhoto = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1a3a8f,0d2060&radius=50`

const defaultGraduates: HofGraduate[] = [
  // UKG → Year 1
  { id: 'g1', name: 'Phanuel', level: 'UKG → Year 1', subject: 'Literacy & Numeracy', photoUrl: demoPhoto('Phanuel'), dream: 'To become a doctor and help people', memory: 'Learning to read my very first book all by myself', teacherMsg: 'Phanuel is a shining star — always eager to learn and grow!', parentMsg: 'We are so proud of you Phanuel! Keep shining! 💛' },
  { id: 'g2', name: 'Jesse', level: 'UKG → Year 1', subject: 'Creative Arts', photoUrl: demoPhoto('Jesse'), dream: 'To be an amazing footballer and artist', memory: 'Drawing my first big picture and seeing it on the classroom wall', teacherMsg: 'Jesse brings energy and creativity to everything he does. The world needs your joy!', parentMsg: 'Our little champion! We love you so much, Jesse!' },
  { id: 'g3', name: 'Royalty', level: 'UKG → Year 1', subject: 'Science & Discovery', photoUrl: demoPhoto('Royalty'), dream: 'To explore space and discover new planets', memory: 'Our first science experiment making a volcano erupt', teacherMsg: 'Royalty asks the most wonderful questions. She is going to do great things!', parentMsg: 'You are our greatest treasure, Royalty. Keep reaching for the stars! ✨'  },
  { id: 'g4', name: 'Yushroh', level: 'UKG → Year 1', subject: 'Mathematics & Games', photoUrl: demoPhoto('Yushroh'), dream: 'To build big buildings one day', memory: 'Winning our class counting competition and getting a gold star', teacherMsg: 'Yushroh has a natural gift for numbers and a wonderful kind heart.', parentMsg: 'Yushroh we are so proud. You worked hard and it shows! Love you always 🌟'  },
  // Year 6 → Year 7
  { id: 'g5', name: 'Precious', level: 'Year 6 → Year 7', subject: 'English & Literature', photoUrl: demoPhoto('Precious'), dream: 'To be a writer and publish books that inspire children across Africa', memory: 'Writing my first short story and reading it to the whole school', teacherMsg: 'Precious has a gift for words that moves everyone who reads her work. Secondary school is gaining a gem.', parentMsg: 'Precious, you truly are precious to us. We love you and believe in you so much! 📖'  },
  { id: 'g6', name: 'Marie', level: 'Year 6 → Year 7', subject: 'Mathematics & Science', photoUrl: demoPhoto('Marie'), dream: 'To become an engineer and build bridges in Africa', memory: 'Winning the Year 6 inter-school maths competition', teacherMsg: 'Marie is a brilliant mathematical mind. She is going to be extraordinary.', parentMsg: 'Marie, you have made us so incredibly proud. Keep dreaming big! 🌟'  },
  { id: 'g7', name: 'Edem', level: 'Year 6 → Year 7', subject: 'Drama & Performing Arts', photoUrl: demoPhoto('Edem'), dream: 'To be a famous actor and tell African stories to the world', memory: 'Playing the lead role in our Year 6 production of The Lion King', teacherMsg: 'Edem has a stage presence that lights up the room. Destined for greatness.', parentMsg: 'Our star performer! We could not stop smiling. We love you, son!'  },
  { id: 'g8', name: 'Peter', level: 'Year 6 → Year 7', subject: 'History & Geography', photoUrl: demoPhoto('Peter'), dream: 'To be a journalist and travel the world reporting the truth', memory: 'Our class trip and writing a report that was published in the school newsletter', teacherMsg: 'Peter has a sharp analytical mind and a passion for truth. Watch out, world!', parentMsg: 'Peter, your voice matters more than you know. Keep going! 📰'  },
  // Year 9 → Year 10
  { id: 'g9', name: 'Daniel', level: 'Year 9 → Year 10', subject: 'STEM & Technology', photoUrl: demoPhoto('Daniel'), dream: 'To build the next great African tech company', memory: 'Coding our first app and presenting it at the school science fair', teacherMsg: 'Daniel combines technical brilliance with genuine kindness. He is already a leader.', parentMsg: 'Son, you have shown us what dedication looks like. The world is yours! 💪'  },
  { id: 'g10', name: 'Nimatallah', level: 'Year 9 → Year 10', subject: 'Biology & Chemistry', photoUrl: demoPhoto('Nimatallah'), dream: 'To become a doctor and find cures that save lives', memory: 'Our biology field trip and discovering my passion for science', teacherMsg: 'Nimatallah has the heart of a healer and the mind of a scientist. She will change the world.', parentMsg: 'Our pride and joy. Study hard and remember — you can do anything! 🌺'  },
  { id: 'g11', name: 'Joshua', level: 'Year 9 → Year 10', subject: 'Business & Economics', photoUrl: demoPhoto('Joshua'), dream: 'To become a successful entrepreneur and create jobs in his community', memory: 'Running the school mini-enterprise and making our first profit', teacherMsg: 'Joshua has an entrepreneurial spirit and exceptional people skills. Watch this space.', parentMsg: 'Joshua, you have worked so hard. Year 10 is going to be amazing. We believe in you! 🚀'  },
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
    {
      name: 'hall-store-v4',
      version: 1,
      migrate: (s: any) => s,
    }
  )
)
