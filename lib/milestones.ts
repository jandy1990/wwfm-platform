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
// Hero's journey from first steps to legendary status and beyond
export const MILESTONES: Milestone[] = [
  // Early Journey (100-1000) - More frequent milestones for new users
  {
    key: 'seeker',
    name: 'Seeker',
    emoji: '🌱',
    threshold: 100,
    description: 'Taking your first steps on the journey'
  },
  {
    key: 'contributor',
    name: 'Contributor',
    emoji: '🌿',
    threshold: 150,
    description: 'Making meaningful contributions'
  },
  {
    key: 'explorer',
    name: 'Explorer',
    emoji: '🔍',
    threshold: 250,
    description: 'Actively discovering and sharing solutions'
  },
  {
    key: 'adventurer',
    name: 'Adventurer',
    emoji: '⛺',
    threshold: 400,
    description: 'Venturing into new territories'
  },
  {
    key: 'guide',
    name: 'Guide',
    emoji: '🗺️',
    threshold: 500,
    description: 'Helping others navigate their challenges'
  },
  {
    key: 'navigator',
    name: 'Navigator',
    emoji: '🚢',
    threshold: 750,
    description: 'Charting courses through difficult waters'
  },
  {
    key: 'pathfinder',
    name: 'Pathfinder',
    emoji: '🧭',
    threshold: 1000,
    description: 'Clearing new paths for the community'
  },

  // Mid Journey (1000-5000) - Establishing expertise
  {
    key: 'pioneer',
    name: 'Pioneer',
    emoji: '🚀',
    threshold: 1500,
    description: 'Breaking new ground with innovation'
  },
  {
    key: 'trailblazer',
    name: 'Trailblazer',
    emoji: '⛰️',
    threshold: 2000,
    description: 'Leading others to new discoveries'
  },
  {
    key: 'champion',
    name: 'Champion',
    emoji: '🏆',
    threshold: 2500,
    description: 'A champion of the community'
  },
  {
    key: 'leader',
    name: 'Leader',
    emoji: '💪',
    threshold: 3000,
    description: 'Inspiring others through your contributions'
  },
  {
    key: 'mentor',
    name: 'Mentor',
    emoji: '🌟',
    threshold: 3500,
    description: 'Sharing profound wisdom with others'
  },
  {
    key: 'expert',
    name: 'Expert',
    emoji: '💡',
    threshold: 4000,
    description: 'Deep knowledge that lights the way'
  },
  {
    key: 'sage',
    name: 'Sage',
    emoji: '💎',
    threshold: 5000,
    description: 'Wisdom refined like a precious gem'
  },

  // Advanced Journey (5000-10000) - Elite status
  {
    key: 'master',
    name: 'Master',
    emoji: '⚡',
    threshold: 6000,
    description: 'Mastery of helping others find solutions'
  },
  {
    key: 'oracle',
    name: 'Oracle',
    emoji: '👑',
    threshold: 7500,
    description: 'A legendary source of wisdom'
  },
  {
    key: 'luminary',
    name: 'Luminary',
    emoji: '✨',
    threshold: 10000,
    description: 'Your light illuminates the entire community'
  },

  // Legendary Journey (10000+) - Stretch goals for dedicated contributors
  {
    key: 'legend',
    name: 'Legend',
    emoji: '🌠',
    threshold: 15000,
    description: 'Your contributions have become legendary'
  },
  {
    key: 'icon',
    name: 'Icon',
    emoji: '🔥',
    threshold: 25000,
    description: 'An iconic pillar of the community'
  },
  {
    key: 'titan',
    name: 'Titan',
    emoji: '💫',
    threshold: 50000,
    description: 'Titanic impact across countless lives'
  },
  {
    key: 'immortal',
    name: 'Immortal',
    emoji: '🌌',
    threshold: 100000,
    description: 'Your legacy will inspire for generations'
  },
  {
    key: 'transcendent',
    name: 'Transcendent',
    emoji: '⭐',
    threshold: 250000,
    description: 'Beyond mortal comprehension'
  },
  {
    key: 'cosmic',
    name: 'Cosmic',
    emoji: '🌊',
    threshold: 500000,
    description: 'A cosmic force of positive change'
  },
  {
    key: 'infinite',
    name: 'Infinite',
    emoji: '♾️',
    threshold: 1000000,
    description: 'Infinite wisdom, infinite impact'
  }
]
