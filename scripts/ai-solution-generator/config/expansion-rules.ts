/**
 * Expansion Rules Configuration
 *
 * Defines strict credibility rules for solution-to-goal mapping.
 * These rules prevent nonsensical connections like "Ashwagandha for saving money".
 */

export interface ExpansionRule {
  // Goals that this solution category can credibly address
  allowed_goal_patterns: string[]

  // Goals this solution should never be connected to
  forbidden_goal_patterns: string[]

  // Required arenas for credible connections
  allowed_arenas: string[]

  // Goal categories that make sense for this solution
  allowed_goal_categories: string[]

  // Minimum effectiveness threshold for new connections
  min_effectiveness: number

  // Maximum number of new goals to connect per solution
  max_expansions: number
}

export const EXPANSION_RULES: Record<string, ExpansionRule> = {
  // EXERCISE & MOVEMENT - Broader impact including mental health benefits
  exercise_movement: {
    allowed_goal_patterns: [
      'muscle', 'strength', 'fitness', 'weight', 'endurance', 'tone', 'build',
      'lift', 'run', 'athletic', 'body', 'physical', 'cardio', 'flexibility',
      'balance', 'coordination', 'stamina', 'pull.*up', 'push.*up', 'confidence',
      'stress', 'anxiety', 'mood', 'energy', 'discipline', 'habit', 'routine'
    ],
    forbidden_goal_patterns: [
      'save.*money', 'start.*business', 'learn.*instrument', 'learn.*pottery'
    ],
    allowed_arenas: ['Physical Health', 'Beauty & Wellness', 'Feeling & Emotion', 'Personal Growth'],
    allowed_goal_categories: [
      'Exercise & Fitness', 'Weight & Body', 'Body & Fitness Appearance',
      'Physical Performance', 'Mental Health', 'Stress Management', 'Character & Discipline',
      'Self-Improvement', 'Energy & Vitality'
    ],
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // MEDITATION & MINDFULNESS - Expanded mental/emotional/performance results
  meditation_mindfulness: {
    allowed_goal_patterns: [
      'stress', 'anxiety', 'calm', 'relax', 'focus', 'mindful', 'peace',
      'meditation', 'breathe', 'mental', 'emotional', 'mood', 'worry',
      'overwhelm', 'mindset', 'present', 'awareness', 'clarity', 'sleep',
      'concentration', 'productivity', 'performance', 'discipline', 'habit'
    ],
    forbidden_goal_patterns: [
      'save.*money', 'start.*business', 'learn.*instrument', 'physical.*injury'
    ],
    allowed_arenas: ['Feeling & Emotion', 'Personal Growth', 'Relationships', 'Work & Career', 'Physical Health'],
    allowed_goal_categories: [
      'Mental Health', 'Emotional Growth', 'Stress Management', 'Self-Improvement',
      'Sleep & Energy', 'Productivity', 'Character & Discipline', 'Mindset & Beliefs'
    ],
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // HABITS & ROUTINES - Universal life improvement patterns
  habits_routines: {
    allowed_goal_patterns: [
      'habit', 'routine', 'consistent', 'daily', 'practice', 'regular',
      'discipline', 'schedule', 'organization', 'productivity', 'time',
      'morning', 'evening', 'system', 'process', 'structure', 'exercise',
      'training', 'workout', 'fitness', 'pull.*up', 'run', 'bike', 'swim',
      'improve', 'develop', 'build', 'create', 'maintain', 'manage'
    ],
    forbidden_goal_patterns: [
      'surgery', 'medical.*procedure'
    ],
    allowed_arenas: ['Personal Growth', 'Work & Career', 'Physical Health', 'Technology & Modern Life',
                     'Feeling & Emotion', 'Beauty & Wellness', 'Finances', 'House & Home'],
    allowed_goal_categories: [
      'Habits & Routine', 'Productivity', 'Self-Improvement', 'Time Management',
      'Exercise & Fitness', 'Character & Discipline', 'Learning & Development',
      'Stress Management', 'Financial Security', 'Health & Wellness'
    ],
    min_effectiveness: 3.5,
    max_expansions: 20
  },

  // DIET & NUTRITION - Broader health and wellness impact
  diet_nutrition: {
    allowed_goal_patterns: [
      'weight', 'eat', 'diet', 'nutrition', 'food', 'meal', 'healthy',
      'energy', 'digestive', 'gut', 'cholesterol', 'blood.*pressure',
      'sugar', 'diabetes', 'metabolic', 'appetite', 'crave', 'mood',
      'skin', 'appearance', 'performance', 'focus', 'brain'
    ],
    forbidden_goal_patterns: [
      'surgery', 'medical.*procedure'
    ],
    allowed_arenas: ['Physical Health', 'Beauty & Wellness', 'Feeling & Emotion', 'Personal Growth'],
    allowed_goal_categories: [
      'Diet & Nutrition', 'Weight & Body', 'Health & Wellness',
      'Digestive Health', 'Energy & Vitality', 'Appearance & Skin',
      'Mental Health', 'Exercise & Fitness'
    ],
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // MEDICATIONS - Medical treatments with potential broader wellness impact
  medications: {
    allowed_goal_patterns: [
      'pain', 'condition', 'symptom', 'medical', 'health', 'treatment',
      'disorder', 'disease', 'manage', 'control', 'reduce', 'prevent',
      'blood.*pressure', 'cholesterol', 'diabetes', 'arthritis', 'migraine',
      'acne', 'skin', 'breakout', 'clear', 'rosacea', 'eczema', 'psoriasis',
      'anxiety', 'depression', 'mood', 'sleep', 'energy'
    ],
    forbidden_goal_patterns: [
      '^learn.*instrument', '^learn.*pottery', '^start.*business'
    ],
    allowed_arenas: ['Physical Health', 'Beauty & Wellness', 'Feeling & Emotion'],
    allowed_goal_categories: [
      'Health Conditions', 'Appearance & Skin', 'Wellness & Self-Care',
      'Mental Health', 'Sleep & Energy', 'Anxiety & Worry', 'Sadness & Depression'
    ],
    min_effectiveness: 3.8,
    max_expansions: 10
  },

  // SUPPLEMENTS & VITAMINS - Health optimization
  supplements_vitamins: {
    allowed_goal_patterns: [
      'health', 'energy', 'immune', 'deficiency', 'vitamin', 'mineral',
      'wellness', 'optimize', 'support', 'boost', 'enhance', 'improve',
      'bone', 'heart', 'brain', 'mood', 'sleep', 'recovery'
    ],
    forbidden_goal_patterns: [
      'career.*advance', 'make.*money', 'save.*money', 'relationship',
      'social.*skills', 'public.*speaking', 'learn.*instrument'
    ],
    allowed_arenas: ['Physical Health', 'Beauty & Wellness'],
    allowed_goal_categories: [
      'Health & Wellness', 'Nutrition', 'Energy & Vitality',
      'Immune Support', 'Anti-Aging'
    ],
    min_effectiveness: 3.5,
    max_expansions: 5
  },

  // NATURAL REMEDIES - Natural health solutions
  natural_remedies: {
    allowed_goal_patterns: [
      'natural', 'herbal', 'remedy', 'alternative', 'holistic', 'wellness',
      'heal', 'soothe', 'calm', 'relieve', 'support', 'balance',
      'inflammation', 'pain', 'stress', 'sleep', 'digestive'
    ],
    forbidden_goal_patterns: [
      'career', 'money', 'financial', 'business', 'academic', 'learn',
      'study', 'athletic.*performance', 'muscle.*building'
    ],
    allowed_arenas: ['Physical Health', 'Beauty & Wellness', 'Feeling & Emotion'],
    allowed_goal_categories: [
      'Natural Health', 'Alternative Medicine', 'Health & Wellness',
      'Pain Relief', 'Stress Management'
    ],
    min_effectiveness: 3.5,
    max_expansions: 4
  },

  // SLEEP - Sleep and recovery focused
  sleep: {
    allowed_goal_patterns: [
      'sleep', 'rest', 'tired', 'fatigue', 'insomnia', 'bedtime',
      'wake', 'dream', 'recovery', 'energy', 'alert', 'circadian'
    ],
    forbidden_goal_patterns: [
      'muscle.*building', 'weight.*loss', 'career', 'money', 'relationship',
      'learn', 'study', 'business', 'financial'
    ],
    allowed_arenas: ['Physical Health', 'Feeling & Emotion'],
    allowed_goal_categories: [
      'Sleep Health', 'Energy & Vitality', 'Recovery',
      'Health & Wellness'
    ],
    min_effectiveness: 4.0,
    max_expansions: 3
  },

  // APPS & SOFTWARE - Digital tools for life optimization across domains
  apps_software: {
    allowed_goal_patterns: [
      'track', 'monitor', 'organize', 'manage', 'plan', 'schedule',
      'productive', 'efficient', 'digital', 'online', 'mobile',
      'app', 'software', 'tool', 'system', 'platform', 'learn', 'code',
      'improve', 'control', 'build', 'create', 'habit', 'routine'
    ],
    forbidden_goal_patterns: [
      'surgery', 'medical.*procedure'
    ],
    allowed_arenas: ['Work & Career', 'Personal Growth', 'Physical Health', 'Technology & Modern Life',
                     'Feeling & Emotion', 'Beauty & Wellness', 'Finances', 'House & Home'],
    allowed_goal_categories: [
      'Productivity', 'Digital Tools', 'Organization', 'Tracking',
      'Technology', 'Self-Improvement', 'Learning & Development',
      'Financial Security', 'Health & Wellness', 'Time Management', 'Habits & Routine'
    ],
    min_effectiveness: 3.5,
    max_expansions: 15
  },

  // BOOKS & COURSES - Universal knowledge application across all life domains
  books_courses: {
    allowed_goal_patterns: [
      'learn', 'study', 'knowledge', 'skill', 'education', 'training',
      'develop', 'improve', 'understand', 'master', 'course', 'book',
      'read', 'teach', 'guide', 'instruction', 'method', 'build', 'create',
      'manage', 'control', 'handle', 'overcome', 'achieve', 'practice'
    ],
    forbidden_goal_patterns: [
      'surgery', 'medical.*procedure'
    ],
    allowed_arenas: ['Personal Growth', 'Work & Career', 'Relationships', 'Feeling & Emotion',
                     'Physical Health', 'Beauty & Wellness', 'Finances', 'Technology & Modern Life',
                     'House & Home', 'Creativity', 'Community', 'Socialising', 'Life Direction'],
    allowed_goal_categories: [
      'Education', 'Skill Development', 'Self-Improvement', 'Learning',
      'Professional Development', 'Personal Development', 'Mental Health',
      'Stress Management', 'Character & Discipline', 'Mindset & Beliefs',
      'Productivity', 'Financial Security', 'Communication Skills',
      'Exercise & Fitness', 'Weight & Body', 'Anxiety & Worry', 'Sadness & Depression',
      'Emotional Growth', 'Career Changes', 'Job Hunting', 'Time Management',
      'Building Wealth', 'Money Management', 'Social Confidence', 'Dating & Romance',
      'Breaking Destructive Patterns', 'Visual Arts', 'Writing & Words', 'Music & Performance'
    ],
    min_effectiveness: 3.5,
    max_expansions: 20
  },

  // DOCTORS & SPECIALISTS - Medical/health conditions only
  doctors_specialists: {
    allowed_goal_patterns: [
      'health', 'medical', 'pain', 'chronic', 'disease', 'condition',
      'symptoms', 'diagnosis', 'treatment', 'therapy', 'mental health',
      'physical', 'wellness', 'manage', 'control', 'reduce', 'improve',
      'depression', 'anxiety', 'blood pressure', 'diabetes', 'arthritis',
      'autoimmune', 'fibromyalgia', 'thyroid', 'PCOS', 'IBS', 'ADHD',
      'autism', 'PTSD', 'OCD', 'eating disorder', 'addiction', 'reflux',
      'skin', 'acne', 'rosacea', 'eczema', 'psoriasis', 'hair', 'nails',
      'sweating', 'odor', 'age spots', 'wrinkles', 'breakouts', 'glowing'
    ],
    forbidden_goal_patterns: [
      '^learn.*instrument', '^learn.*pottery', '^learn.*draw', '^learn.*paint',
      '^change.*career', '^save.*money', '^update.*wardrobe', '^dating.*',
      '^network.*effectively', '^master.*photography', '^write.*music', '^start.*business'
    ],
    allowed_arenas: ['Physical Health', 'Feeling & Emotion', 'Beauty & Wellness', 'Finances'],
    allowed_goal_categories: [
      'Health Conditions', 'Anxiety & Worry', 'Sadness & Depression',
      'Breaking Destructive Patterns', 'Wellness & Self-Care',
      'Rest & Recovery', 'Emotional Growth', 'Appearance & Skin',
      'Hair & Grooming', 'Sleep & Energy', 'Movement & Mobility',
      'Weight & Body', 'Food & Nutrition', 'Exercise & Fitness',
      'Financial Security'  // For insurance/healthcare cost goals
    ],
    min_effectiveness: 4.0,
    max_expansions: 10
  }
}

/**
 * Check if a solution-goal connection is credible based on expansion rules
 * NOTE: With laugh test validator, these rules are much more permissive
 */
export function isCredibleConnection(
  solutionCategory: string,
  goalTitle: string,
  goalArena: string,
  goalCategory: string,
  projectedEffectiveness: number
): { credible: boolean; reason?: string } {
  const rule = EXPANSION_RULES[solutionCategory]

  if (!rule) {
    return { credible: false, reason: `No expansion rules defined for category: ${solutionCategory}` }
  }

  // Check effectiveness threshold
  if (projectedEffectiveness < rule.min_effectiveness) {
    return {
      credible: false,
      reason: `Effectiveness ${projectedEffectiveness} below minimum ${rule.min_effectiveness}`
    }
  }

  // Check forbidden patterns first (immediate disqualification)
  const goalTitleLower = goalTitle.toLowerCase()
  for (const forbiddenPattern of rule.forbidden_goal_patterns) {
    if (goalTitleLower.match(new RegExp(forbiddenPattern, 'i'))) {
      return {
        credible: false,
        reason: `Goal matches forbidden pattern: ${forbiddenPattern}`
      }
    }
  }

  // RELAXED VALIDATION: Skip arena and category checks, rely on laugh test
  // The laugh test validator will catch spurious connections

  // Check allowed patterns (at least one must match)
  const hasAllowedPattern = rule.allowed_goal_patterns.some(pattern =>
    goalTitleLower.match(new RegExp(pattern, 'i'))
  )

  if (!hasAllowedPattern) {
    return {
      credible: false,
      reason: `Goal title doesn't match any allowed patterns`
    }
  }

  return { credible: true }
}

/**
 * Get maximum allowed expansions for a solution category
 */
export function getMaxExpansions(solutionCategory: string): number {
  const rule = EXPANSION_RULES[solutionCategory]
  return rule ? rule.max_expansions : 3 // Conservative default
}

/**
 * Get minimum effectiveness threshold for a solution category
 */
export function getMinEffectiveness(solutionCategory: string): number {
  const rule = EXPANSION_RULES[solutionCategory]
  return rule ? rule.min_effectiveness : 4.0 // Conservative default
}