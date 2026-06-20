export type Honors = 'summa' | 'magna' | 'cum' | 'none'

export interface CongratulatoryMessage {
  id: string
  graduateId?: string
  author: string
  content: string
  timestamp: string
}

export interface Graduate {
  id: string
  name?: string
  department: string
  degree: string
  honors?: Honors
  bio: string
  photoUrl?: string
  achievements: string[]
  messages: CongratulatoryMessage[]
  photos: string[]
  socialLinks?: { linkedin?: string; twitter?: string; website?: string }
}

export interface ProgramItem {
  id: string
  time: string
  title: string
  speaker?: string
  description: string
  duration: number
}

export interface NetworkingTable {
  id: string
  name?: string
  theme: string
  seats: number
  occupants: string[]
  bbbLink: string
  description?: string
  color?: string
}

export type SponsorTier = 'gold' | 'silver' | 'bronze'

export interface Sponsor {
  id: string
  name?: string
  logo: string
  url: string
  tier: SponsorTier
}

export interface Reaction {
  id: string
  type: string
  timestamp: number
  x: number
}

export type CeremonyStatus = 'before' | 'live' | 'ended'
