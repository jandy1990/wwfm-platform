// Category icon mapping for consistent visual design
export const CATEGORY_ICONS: Record<string, string> = {
  // Health & Wellness
  'health-conditions': '🩺',
  'appearance-skin': '✨',
  'exercise-fitness': '💪',
  'food-nutrition': '🥗',
  'sleep-energy': '😴',
  'rest-recovery': '🧘',
  'weight-body': '⚖️',
  'movement-mobility': '🚶',
  'wellness-self-care': '🌿',
  'hair-grooming': '💇',
  'body-fitness-appearance': '🏋️',

  // Feeling & Emotion
  'anxiety-worry': '😰',
  'anger-frustration': '😤',
  'sadness-depression': '😢',
  'emotional-growth': '🌱',
  'overwhelm-stress': '😵‍💫',
  'mindset-beliefs': '🧠',
  'breaking-destructive-patterns': '❤️‍🩹',
  'grief-healing': '💝',
  'social-anxiety': '😅',

  // Money & Finance
  'debt-management': '💳',
  'building-wealth': '💰',
  'financial-goals': '🎯',
  'financial-security': '🛡️',
  'money-management': '💵',
  'financial-crisis': '🚨',
  'income-earnings': '💼',
  'money-growth': '📈',

  // Work & Career
  'job-hunting': '🔍',
  'job-dissatisfaction': '😞',
  'job-security': '🔒',
  'career-changes': '🔄',
  'professional-skills': '🎓',
  'modern-work': '💻',
  'creative-career': '🎨',
  'side-hustles': '🚀',
  'professional-socialising': '🤝',

  // Relationships & Social
  'dating-romance': '💕',
  'romantic-relationships': '❤️',
  'friendships': '👫',
  'family-relationships': '👨‍👩‍👧‍👦',
  'breakups-healing': '💔',
  'communication-social': '💬',
  'social-confidence': '😎',
  'conversation-skills': '🗣️',
  'social-skills': '👥',
  'social-events': '🎉',
  'online-relationships': '📱',

  // Home & Living
  'home-management': '🏠',
  'cleaning-organization': '🧹',
  'space-management': '📦',
  'home-atmosphere': '🕯️',
  'home-economics': '🏡',
  'hosting-hospitality': '🍽️',
  'family-living': '👨‍👩‍👧‍👦',

  // Personal Growth
  'self-improvement': '📚',
  'character-discipline': '💎',
  'learning-development': '🎓',
  'wisdom-philosophy': '🦉',
  'life-transitions': '🌉',
  'taking-control': '🎯',
  'time-productivity': '⏰',

  // Creative & Hobbies
  'creative-expression': '🎨',
  'music-performance': '🎵',
  'visual-arts': '🖼️',
  'crafts-making': '✂️',
  'writing-words': '✍️',

  // Technology & Modern Life
  'ai-future-tech': '🤖',
  'digital-life-management': '📱',
  'phone-screen-time': '📵',
  'social-media': '📲',
  'family-tech': '👨‍👩‍👧‍👦',
  'modern-life-challenges': '🌐',

  // Community & Purpose
  'building-community': '🤝',
  'local-involvement': '🏘️',
  'making-difference': '🌟',
  'social-issues': '⚖️',
  'sustainable-living': '🌍',

  // Family & Life Stages
  'parenthood': '👶',
  'aging-parents': '👴',
  'youth-education': '🎒',

  // Style & Appearance
  'style-presentation': '👔',
  'quick-improvements': '⚡',
} as const

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || '📂'
}