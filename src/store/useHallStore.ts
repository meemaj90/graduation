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
  {
    id: 'g1',
    name: 'Amara Osei',
    level: 'UKG → Year 1',
    subject: 'Literacy & Numeracy',
    photoUrl: null,
    dream: 'To become a doctor and heal people in my community',
    memory: 'Learning to read my first book and performing in our end-of-year show',
    teacherMsg: 'Amara has the brightest smile and an even brighter future. Her curiosity is infectious!',
    parentMsg: 'We are so proud of you my darling. You have grown so much this year. Keep shining! 💛',
    honors: 'Star Reader Award',
  },
  {
    id: 'g2',
    name: 'Kofi Mensah',
    level: 'UKG → Year 1',
    subject: 'Creative Arts',
    photoUrl: null,
    dream: 'To be an artist and paint beautiful pictures of Africa',
    memory: 'Making our first art project and seeing my painting on the wall',
    teacherMsg: 'Kofi brings colour and joy to every classroom. His imagination knows no limits.',
    parentMsg: 'Our little artist! You make us smile every day. We love you so much, Kofi!',
    honors: 'Creative Star',
  },
  {
    id: 'g3',
    name: 'Fatima Diallo',
    level: 'UKG → Year 1',
    subject: 'Science Discovery',
    photoUrl: null,
    dream: 'To explore space and discover new planets',
    memory: 'Our first science experiment — making volcanoes with baking soda!',
    teacherMsg: 'Fatima asks the most wonderful questions. She will go far in whatever she chooses.',
    parentMsg: 'Little scientist! Your father and I are beyond proud. The sky is just the beginning! ✨',
    honors: 'Curious Mind Award',
  },
  {
    id: 'g4',
    name: 'Zara Adeyemi',
    level: 'Year 6 → Year 7',
    subject: 'Mathematics & Science',
    photoUrl: null,
    dream: 'To become an engineer and build bridges across Africa',
    memory: 'Winning the inter-school maths competition and celebrating with my class',
    teacherMsg: 'Zara is a natural leader and a brilliant mathematical mind. Secondary school is lucky to have her.',
    parentMsg: 'Zara, you have made us so incredibly proud. Never stop asking questions and dreaming big! 🌟',
    honors: 'Academic Excellence',
  },
  {
    id: 'g5',
    name: 'Emmanuel Boateng',
    level: 'Year 6 → Year 7',
    subject: 'English & Drama',
    photoUrl: null,
    dream: 'To be a famous actor and tell African stories to the world',
    memory: 'Playing the lead role in our Year 6 production of The Lion King',
    teacherMsg: 'Emmanuel has a stage presence that lights up the room. He is destined for greatness.',
    parentMsg: 'Our star performer! We could not stop smiling watching you on stage. We love you, son!',
    honors: 'Performing Arts Award',
  },
  {
    id: 'g6',
    name: 'Nia Kamara',
    level: 'Year 6 → Year 7',
    subject: 'History & Geography',
    photoUrl: null,
    dream: 'To be a journalist and tell the stories of Africa to the world',
    memory: 'Our class trip and writing the school newspaper together',
    teacherMsg: 'Nia has a gift for words and a passion for truth. She will be an incredible journalist.',
    parentMsg: 'Sweet Nia, your voice matters. Keep writing, keep questioning, keep shining. We love you! 📰',
    honors: 'Young Journalist Award',
  },
  {
    id: 'g7',
    name: 'David Okonkwo',
    level: 'Year 9 → Year 10',
    subject: 'STEM & Technology',
    photoUrl: null,
    dream: 'To build the next great African tech company',
    memory: 'Coding our first app and presenting it at the school science fair',
    teacherMsg: 'David combines technical brilliance with genuine kindness. He is already a leader.',
    parentMsg: 'Son, you have shown us what dedication looks like. Year 10 and beyond — the world is yours! 💪',
    honors: 'STEM Innovation Award',
  },
  {
    id: 'g8',
    name: 'Aisha Nwosu',
    level: 'Year 9 → Year 10',
    subject: 'Biology & Chemistry',
    photoUrl: null,
    dream: 'To find a cure for malaria and save millions of lives',
    memory: 'Our biology field trip and discovering just how much I love science',
    teacherMsg: 'Aisha has the heart of a healer and the mind of a scientist. She will change the world.',
    parentMsg: 'Our Aisha, you are our greatest achievement. Study hard and remember — you can do anything! 🌺',
    honors: 'Science Excellence Award',
  },
  {
    id: 'g9',
    name: 'Marcus Asante',
    level: 'Year 9 → Year 10',
    subject: 'Business & Economics',
    photoUrl: null,
    dream: 'To become a successful entrepreneur and create jobs in Ghana',
    memory: 'Running our school mini-enterprise and making our first profit',
    teacherMsg: 'Marcus has an entrepreneurial spirit and exceptional people skills. Watch this space.',
    parentMsg: 'Marcus, you have worked so hard. Year 10 is going to be amazing. We believe in you completely! 🚀',
    honors: 'Young Entrepreneur Award',
  },
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
    { name: 'hall-store' }
  )
)
