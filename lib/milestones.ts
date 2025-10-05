// Milestone definitions and types
// Shared between client and server code

export interface Milestone {
  key: string
  name: string
  emoji: string
  threshold: number
  description: string
}

// Thematic milestone progression (WWFM journey metaphor)
export const MILESTONES: Milestone[] = [
  {
    key: 'seeker',
    name: 'Seeker',
    emoji: '🌱',
    threshold: 100,
    description: 'Just starting the journey'
  },
  {
    key: 'explorer',
    name: 'Explorer',
    emoji: '🔍',
    threshold: 250,
    description: 'Actively discovering solutions'
  },
  {
    key: 'guide',
    name: 'Guide',
    emoji: '🗺️',
    threshold: 500,
    description: 'Helping others navigate their path'
  },
  {
    key: 'pathfinder',
    name: 'Pathfinder',
    emoji: '🧭',
    threshold: 1000,
    description: 'Clearing the way for others'
  },
  {
    key: 'trailblazer',
    name: 'Trailblazer',
    emoji: '🏔️',
    threshold: 2000,
    description: 'Breaking new ground'
  },
  {
    key: 'mentor',
    name: 'Mentor',
    emoji: '🌟',
    threshold: 3500,
    description: 'Sharing wisdom with the community'
  },
  {
    key: 'sage',
    name: 'Sage',
    emoji: '💎',
    threshold: 5000,
    description: 'Deep expertise and insight'
  },
  {
    key: 'oracle',
    name: 'Oracle',
    emoji: '👑',
    threshold: 7500,
    description: 'Legendary status achieved'
  },
  {
    key: 'luminary',
    name: 'Luminary',
    emoji: '✨',
    threshold: 10000,
    description: 'Enlightening the entire community'
  }
]
