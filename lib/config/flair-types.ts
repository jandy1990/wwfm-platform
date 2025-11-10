/**
 * Flair Type Configuration
 *
 * Defines the 5 research-validated narrative patterns for Community posts.
 * Based on persuasive storytelling research for user-generated content.
 */

export const FLAIR_TYPES = {
  my_story: {
    label: 'My Story',
    emoji: '📖',
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-800 dark:text-orange-200',
    borderClass: 'border-orange-300 dark:border-orange-700',
    description: 'Share your personal journey',
    example: "I didn't expect this to work, but after 3 weeks I started noticing small changes. The first sign was..."
  },
  tips_techniques: {
    label: 'Tips & Techniques',
    emoji: '💡',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    textClass: 'text-yellow-800 dark:text-yellow-200',
    borderClass: 'border-yellow-300 dark:border-yellow-700',
    description: 'Share specific methods that worked',
    example: "Here's exactly how I do this: I set aside 15 minutes in the morning, and the key thing that made it work was..."
  },
  lessons_learned: {
    label: 'Lessons Learned',
    emoji: '📚',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-800 dark:text-blue-200',
    borderClass: 'border-blue-300 dark:border-blue-700',
    description: 'Share what you wish you knew earlier',
    example: "If I could go back to the start and do it again I'd..."
  },
  what_to_expect: {
    label: 'What to Expect',
    emoji: '🎯',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-800 dark:text-green-200',
    borderClass: 'border-green-300 dark:border-green-700',
    description: 'Share timeline and progression',
    example: "Week 1 was rough - I almost gave up. Week 3 is when things started to click. By week 6..."
  },
  mistakes_to_avoid: {
    label: 'Mistakes to Avoid',
    emoji: '⚠️',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-800 dark:text-red-200',
    borderClass: 'border-red-300 dark:border-red-700',
    description: 'Share common pitfalls',
    example: "Don't jump between solutions too quickly like I did. I tried 5 different things in 2 weeks, which meant I never gave anything a real..."
  }
} as const;

export type FlairType = keyof typeof FLAIR_TYPES;

export const FLAIR_TYPE_KEYS = Object.keys(FLAIR_TYPES) as FlairType[];

/**
 * Get flair configuration by key
 */
export function getFlairConfig(flairType: FlairType) {
  return FLAIR_TYPES[flairType];
}

/**
 * Get all flair configurations as array
 */
export function getAllFlairConfigs() {
  return FLAIR_TYPE_KEYS.map(key => ({
    key,
    ...FLAIR_TYPES[key]
  }));
}

/**
 * Validate if a string is a valid flair type
 */
export function isValidFlairType(value: string): value is FlairType {
  return FLAIR_TYPE_KEYS.includes(value as FlairType);
}
