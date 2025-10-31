export const ARTICLES_REGEX = /^(the|a|an)\s+/i

const GENERIC_TITLE_TOKENS = new Set([
  'and',
  'for',
  'with',
  'to',
  'the',
  'a',
  'an',
  'my',
  'your',
  'our',
  'their',
  'practice',
  'practices',
  'session',
  'sessions',
  'program',
  'programs',
  'therapy',
  'therapies',
  'treatment',
  'treatments',
  'routine',
  'routines',
  'prescription',
  'plan',
  'plans',
  'protocol',
  'protocols',
  'course',
  'courses',
  'class',
  'classes',
  'series',
  'guide',
  'guides',
  'method',
  'methods',
  'approach',
  'approaches',
  'technique',
  'techniques',
  'support',
  'group',
  'groups',
  'club',
  'clubs',
  'community',
  'communities',
  'program',
  'programs',
  'coaching',
  'cohort',
  'package',
  'packages',
  'bundle',
  'bundles',
  'track',
  'tracks',
  'habit',
  'habits',
  'session',
  'sessions',
  'lesson',
  'lessons',
  'module',
  'modules',
  'practice',
  'practices',
  'workshop',
  'workshops',
  'tutor',
  'tutoring',
  'homework',
  'coursework',
  'supplement',
  'supplements',
  'medication',
  'medications',
  'antidepressant',
  'antidepressants',
  'prescription',
  'antianxiety',
  'remedy',
  'remedies',
  'product',
  'products',
  'app',
  'apps',
  'application',
  'applications',
  'tool',
  'tools',
  'solution',
  'solutions',
  'resource',
  'resources',
  'kit',
  'kits',
  'session',
  'sessions',
  'daily',
  'weekly',
  'monthly',
  'online',
  'virtual',
  'digital',
  'therapy',
  'therapist',
  'therapists',
  'coach',
  'coaches',
  'trainer',
  'trainers',
  'training',
  'clinic',
  'clinics',
  'center',
  'centers'
])

const GENERIC_SUFFIXES = new Set([
  'practice',
  'practices',
  'session',
  'sessions',
  'program',
  'programs',
  'therapy',
  'therapies',
  'treatment',
  'treatments',
  'routine',
  'routines',
  'plan',
  'plans',
  'protocol',
  'protocols',
  'course',
  'courses',
  'class',
  'classes',
  'series',
  'guide',
  'guides',
  'method',
  'methods',
  'approach',
  'approaches',
  'technique',
  'techniques',
  'support group',
  'support groups',
  'group',
  'groups',
  'community',
  'communities',
  'package',
  'packages',
  'bundle',
  'bundles',
  'track',
  'tracks',
  'habit',
  'habits',
  'routine',
  'routines',
  'app',
  'apps',
  'application',
  'applications',
  'product',
  'products',
  'supplement',
  'supplements',
  'medication',
  'medications',
  'antidepressant',
  'antidepressants',
  'prescription',
  'remedy',
  'remedies'
])

const TOKEN_ALIAS_MAP: Record<string, string> = {
  sertoline: 'sertraline',
  sertralina: 'sertraline',
  fluoxetine: 'fluoxetine',
  prozac: 'fluoxetine',
  lexapro: 'escitalopram',
  escitalopram: 'escitalopram',
  zoloft: 'sertraline',
  hatha: 'hatha',
  vinyasa: 'vinyasa',
  acupuncture: 'acupuncture',
  mindfulness: 'mindfulness',
  meditation: 'meditation'
}

export interface TitleSignature {
  normalized: string
  canonical: string
  tokens: string[]
}

export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function enforceFirstPersonTitle(rawTitle: string): string {
  if (!rawTitle) return rawTitle

  let title = collapseWhitespace(rawTitle)

  const parenMatch = title.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (parenMatch) {
    const prefix = parenMatch[1].trim()
    const suffix = parenMatch[2].trim()

    if (isGenericDescriptor(prefix)) {
      const formatted = formatSuffix(suffix)
      if (formatted) {
        return formatted
      }
    }
  }

  return title
}

export function createTitleSignature(title: string): TitleSignature {
  const normalized = normalizeSolutionTitle(title)
  const tokens = tokenizeTitle(title)
  const canonical = tokens.length > 0 ? [...tokens].sort().join('|') : normalized

  return {
    normalized,
    canonical,
    tokens
  }
}

export function computeTokenOverlapScore(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0

  const setA = new Set(tokensA)
  const setB = new Set(tokensB)
  let intersectionCount = 0

  setA.forEach(token => {
    if (setB.has(token)) {
      intersectionCount++
    }
  })

  if (intersectionCount === 0) {
    return 0
  }

  const minSize = Math.min(setA.size, setB.size)
  const unionSize = new Set([...setA, ...setB]).size

  const jaccard = intersectionCount / unionSize
  const overlap = intersectionCount / minSize

  return Math.max(jaccard, overlap)
}

export function normalizeSolutionTitle(title: string): string {
  return collapseWhitespace(
    title
      .trim()
      .toLowerCase()
      .replace(ARTICLES_REGEX, '')
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
  )
}

function tokenizeTitle(title: string): string[] {
  const cleaned = title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[(),/]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) {
    return []
  }

  const tokens = cleaned.split(' ').filter(Boolean)

  const canonicalTokens = tokens
    .map(token => TOKEN_ALIAS_MAP[token] ?? token)
    .filter(Boolean)
    .filter(token => !GENERIC_TITLE_TOKENS.has(token))

  return Array.from(new Set(canonicalTokens))
}

function isGenericDescriptor(prefix: string): boolean {
  const collapsed = collapseWhitespace(prefix)
  if (!collapsed) {
    return true
  }

  const lower = collapsed.toLowerCase()
  const words = lower.split(' ').filter(Boolean)
  const lastWord = words[words.length - 1] ?? ''
  const lastTwo = words.slice(-2).join(' ')

  if (GENERIC_SUFFIXES.has(lastWord) || (lastTwo && GENERIC_SUFFIXES.has(lastTwo))) {
    return true
  }

  const tokens = tokenizeTitle(prefix)
  if (tokens.length === 0) {
    return true
  }

  if (tokens.every(token => GENERIC_TITLE_TOKENS.has(token))) {
    return true
  }

  return false
}

function formatSuffix(rawSuffix: string): string | null {
  const suffix = collapseWhitespace(rawSuffix)
  if (!suffix) return null

  const parts = suffix
    .split(/\/|,| or /i)
    .map(part => collapseWhitespace(part))
    .filter(Boolean)

  if (parts.length === 0) {
    return null
  }

  if (parts.length === 1) {
    return parts[0]
  }

  const [primary, ...aliases] = parts
  const uniqueAliases = Array.from(new Set(aliases.filter(alias => alias.toLowerCase() !== primary.toLowerCase())))

  if (uniqueAliases.length === 0) {
    return primary
  }

  return `${primary} (${uniqueAliases.join(', ')})`
}
