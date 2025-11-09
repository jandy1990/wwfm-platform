/**
 * Search scoring utility for goal titles
 *
 * Calculates relevance scores for search results based on how well
 * the query matches the goal title. Higher scores indicate better matches.
 *
 * Scoring algorithm:
 * - Exact match: 100
 * - Starts with query: 90
 * - Word starts with query: 80
 * - Contains query after space: 70
 * - Contains query anywhere: 60
 * - First word matches query (action verb): +20 bonus
 *
 * @param title - The goal title to score
 * @param query - The search query
 * @returns Score from 0-120, where 0 means no match
 *
 * @example
 * calculateSearchScore('Reduce anxiety', 'anxiety') // Returns 60
 * calculateSearchScore('Reduce anxiety', 'reduce') // Returns 110 (90 + 20 bonus)
 * calculateSearchScore('Reduce anxiety', 'reduce anxiety') // Returns 100
 */
export function calculateSearchScore(title: string, query: string): number {
  const titleLower = title.toLowerCase()
  const queryLower = query.toLowerCase()
  let score = 0

  // Exact match
  if (titleLower === queryLower) {
    score = 100
  }
  // Starts with query
  else if (titleLower.startsWith(queryLower)) {
    score = 90
  }
  // Word starts with query
  else if (titleLower.split(' ').some(word => word.startsWith(queryLower))) {
    score = 80
  }
  // Contains query after space (word boundary)
  else if (titleLower.includes(' ' + queryLower)) {
    score = 70
  }
  // Contains query anywhere
  else if (titleLower.includes(queryLower)) {
    score = 60
  }

  // Bonus for matching action verb (first word)
  const actionVerb = title.split(' ')[0].toLowerCase()
  if (actionVerb === queryLower && score > 0) {
    score += 20
  }

  return score
}

/**
 * Helper to check if a goal title matches a search query
 *
 * @param title - The goal title
 * @param query - The search query
 * @returns true if title matches query (score > 0)
 */
export function isSearchMatch(title: string, query: string): boolean {
  return calculateSearchScore(title, query) > 0
}
