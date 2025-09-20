/**
 * Super-Category Navigation Mapping
 * 
 * Groups existing categories into logical super-categories for improved UX
 * without modifying database structure. Used for UI display only.
 */

export interface SuperCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  categories: string[] // Array of category names that belong to this super-category
}

export interface CategoryGroup {
  superCategory: SuperCategory
  categories: Array<{
    id: string
    name: string
    slug: string
    goalCount: number
    goals?: any[]
  }>
  totalGoals: number
}

export const SUPER_CATEGORIES: SuperCategory[] = [
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    description: 'Physical health, medical conditions, fitness, and appearance',
    icon: '🏥',
    color: 'emerald',
    categories: [
      // Physical Health (47 goals)
      'Health Conditions',           // 17 goals
      'Exercise & Fitness',          // 14 goals  
      'Weight & Body',               // 5 goals
      'Movement & Mobility',         // 5 goals
      'Sleep & Energy',              // 3 goals
      'Food & Nutrition',            // 3 goals
      // Beauty & Wellness (32 goals)
      'Appearance & Skin',           // 15 goals
      'Hair & Grooming',             // 7 goals
      'Body & Fitness Appearance',   // 5 goals
      'Style & Presentation',        // 3 goals
      'Wellness & Self-Care',        // 2 goals
      'Quick Improvements'           // 2 goals
    ]
  },
  {
    id: 'mental-growth',
    name: 'Mental Health & Growth',
    description: 'Mental health support, addiction recovery, and personal development',
    icon: '🧠',
    color: 'purple',
    categories: [
      // Mental Health (35 goals)
      'Breaking Destructive Patterns', // 18 goals
      'Anger & Frustration',          // 5 goals
      'Emotional Growth',             // 4 goals
      'Rest & Recovery',              // 3 goals
      'Anxiety & Worry',              // 2 goals
      'Sadness & Depression',         // 2 goals
      'Grief & Healing',              // 1 goal
      // Personal Growth (21 goals)
      'Character & Discipline',       // 5 goals
      'Learning & Development',       // 4 goals
      'Self-Improvement',            // 3 goals
      'Mindset & Beliefs',           // 3 goals
      'Time & Productivity',         // 3 goals
      'Wisdom & Philosophy'          // 3 goals
    ]
  },
  {
    id: 'money-career',
    name: 'Money & Career',
    description: 'Career development, job hunting, finances, and wealth building',
    icon: '💰',
    color: 'blue',
    categories: [
      // Finance & Money (25 goals)
      'Financial Security',          // 9 goals
      'Money Management',            // 8 goals
      'Debt Management',             // 3 goals
      'Building Wealth',             // 3 goals
      'Financial Goals',             // 1 goal
      'Income & Earnings',           // 1 goal
      // Career & Work (17 goals)
      'Job Hunting',                 // 6 goals
      'Job Security',                // 5 goals
      'Career Changes',              // 4 goals
      'Side Hustles'                 // 2 goals
    ]
  },
  {
    id: 'social-relationships',
    name: 'Social & Relationships',
    description: 'Dating, social skills, community building, and relationships',
    icon: '🤝',
    color: 'rose',
    categories: [
      // Community & Impact (8 goals)
      'Youth & Education',           // 4 goals
      'Making a Difference',         // 2 goals
      'Building Community',          // 2 goals
      // Social Skills (5 goals)
      'Social Confidence',           // 4 goals
      'Social Anxiety',              // 1 goal
      // Relationships (5 goals)
      'Dating & Romance'             // 5 goals
    ]
  },
  {
    id: 'creativity-skills',
    name: 'Learning & Creativity',
    description: 'Creative arts, technology skills, and digital life',
    icon: '🎨',
    color: 'amber',
    categories: [
      // Creative Arts (7 goals)
      'Visual Arts',                 // 4 goals
      'Music & Performance',         // 2 goals
      'Writing & Words',             // 1 goal
      // Technology & Skills (5 goals)
      'AI & Future Tech',            // 2 goals
      'Social Media',                // 2 goals
      'Modern Life Challenges'       // 1 goal
    ]
  },
  {
    id: 'home-lifestyle',
    name: 'Home & Lifestyle',
    description: 'Home management, hosting, and sustainable living',
    icon: '🏠',
    color: 'orange',
    categories: [
      'Home Economics',              // 5 goals
      'Hosting & Hospitality',       // 3 goals
      'Home Atmosphere',             // 2 goals
      'Sustainable Living',          // 2 goals
      'Taking Control'               // 1 goal - from Life Direction
    ]
  }
]

/**
 * Maps a category name to its super-category
 */
export function getSuperCategoryForCategory(categoryName: string): SuperCategory | null {
  return SUPER_CATEGORIES.find(sc => 
    sc.categories.includes(categoryName)
  ) || null
}

/**
 * Groups categories by super-category for UI display
 */
export function groupCategoriesBySuperCategory(
  arenas: any[]
): CategoryGroup[] {
  const superCategoryMap = new Map<string, {
    superCategory: SuperCategory
    categories: any[]
    totalGoals: number
  }>()

  // Initialize super-categories
  SUPER_CATEGORIES.forEach(sc => {
    superCategoryMap.set(sc.id, {
      superCategory: sc,
      categories: [],
      totalGoals: 0
    })
  })

  // Group categories from existing arena structure
  arenas.forEach(arena => {
    arena.categories?.forEach(category => {
      const superCategory = getSuperCategoryForCategory(category.name)
      if (superCategory && superCategoryMap.has(superCategory.id)) {
        const group = superCategoryMap.get(superCategory.id)!
        group.categories.push({
          ...category,
          goalCount: category.goals?.length || 0
        })
        group.totalGoals += category.goals?.length || 0
      }
    })
  })

  // Convert to array and filter out empty super-categories
  return Array.from(superCategoryMap.values())
    .filter(group => group.totalGoals > 0)
    .sort((a, b) => b.totalGoals - a.totalGoals) // Sort by goal count
}

/**
 * Determines if a super-category should skip the category layer and go directly to goals
 */
export function shouldSkipCategoryLayer(group: CategoryGroup): boolean {
  const { totalGoals, categories } = group

  // Rule 1: Skip if total goals <= 15
  if (totalGoals <= 15) {
    return true
  }

  // Rule 2: Skip if ≥70% of categories have ≤3 goals each
  const smallCategories = categories.filter(cat => cat.goalCount <= 3)
  const fragmentationRatio = smallCategories.length / categories.length
  if (fragmentationRatio >= 0.7) {
    return true
  }

  // Rule 3: Skip if only 1-2 meaningful categories (others have ≤2 goals)
  const meaningfulCategories = categories.filter(cat => cat.goalCount >= 3)
  if (meaningfulCategories.length <= 2 && categories.length > 3) {
    return true
  }

  // Otherwise, keep category layer
  return false
}

/**
 * Color variants for Tailwind classes
 */
export const SUPER_CATEGORY_COLORS = {
  emerald: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    icon: 'text-emerald-500',
    hover: 'hover:bg-emerald-50'
  },
  purple: {
    bg: 'bg-purple-50/50',
    border: 'border-purple-100',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    hover: 'hover:bg-purple-50'
  },
  blue: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    hover: 'hover:bg-blue-50'
  },
  rose: {
    bg: 'bg-rose-50/50',
    border: 'border-rose-100',
    text: 'text-rose-600',
    icon: 'text-rose-500',
    hover: 'hover:bg-rose-50'
  },
  amber: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    icon: 'text-amber-500',
    hover: 'hover:bg-amber-50'
  },
  green: {
    bg: 'bg-green-50/50',
    border: 'border-green-100',
    text: 'text-green-600',
    icon: 'text-green-500',
    hover: 'hover:bg-green-50'
  },
  orange: {
    bg: 'bg-orange-50/50',
    border: 'border-orange-100',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    hover: 'hover:bg-orange-50'
  }
}