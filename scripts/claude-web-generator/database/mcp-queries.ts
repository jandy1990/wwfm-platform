/**
 * MCP Supabase Queries for Claude Web Generator
 *
 * Direct database queries using Model Context Protocol (MCP).
 * Claude Web can execute these queries natively via MCP integration.
 */

/**
 * Get goals needing generation (no solutions or <5 solutions)
 */
export const GET_GOALS_NEEDING_GENERATION = `
SELECT
  g.id,
  g.title,
  g.description,
  a.name as arena_name,
  c.name as category_name,
  COUNT(gil.solution_id) as solution_count
FROM goals g
LEFT JOIN arenas a ON g.arena_id = a.id
LEFT JOIN categories c ON g.category_id = c.id
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
GROUP BY g.id, g.title, g.description, a.name, c.name
HAVING COUNT(gil.solution_id) < 5
ORDER BY COUNT(gil.solution_id) ASC, g.title ASC
LIMIT 200;
`

/**
 * Get high-priority goals (based on predefined list)
 */
export function getHighPriorityGoalsQuery(priorityTitles: string[]): string {
  const titleList = priorityTitles.map(t => `'${t}'`).join(', ')

  return `
SELECT
  g.id,
  g.title,
  g.description,
  a.name as arena_name,
  c.name as category_name,
  COUNT(gil.solution_id) as solution_count
FROM goals g
LEFT JOIN arenas a ON g.arena_id = a.id
LEFT JOIN categories c ON g.category_id = c.id
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
WHERE g.title IN (${titleList})
GROUP BY g.id, g.title, g.description, a.name, c.name
ORDER BY COUNT(gil.solution_id) ASC
LIMIT 50;
`
}

/**
 * Check for duplicate solutions (by title and category)
 */
export function getDuplicateCheckQuery(title: string, category: string): string {
  // Tokenize title for similarity search
  const tokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)

  const ilikeConditions = tokens.map(token => `title ILIKE '%${token}%'`).join(' OR ')

  return `
SELECT
  id,
  title,
  solution_category,
  description
FROM solutions
WHERE solution_category = '${category}'
AND (${ilikeConditions})
LIMIT 10;
`
}

/**
 * Get solution count by goal
 */
export const GET_SOLUTION_COUNTS_BY_GOAL = `
SELECT
  g.id as goal_id,
  g.title as goal_title,
  COUNT(gil.solution_id) as solution_count
FROM goals g
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
GROUP BY g.id, g.title
ORDER BY solution_count ASC, g.title ASC;
`

/**
 * Get solution count by category
 */
export const GET_SOLUTION_COUNTS_BY_CATEGORY = `
SELECT
  solution_category,
  COUNT(*) as count
FROM solutions
GROUP BY solution_category
ORDER BY count DESC;
`

/**
 * Check data quality for a goal
 */
export function getDataQualityCheckQuery(goalId: string): string {
  return `
SELECT
  s.title as solution_title,
  s.solution_category,
  gil.aggregated_fields,
  gil.data_display_mode,
  jsonb_array_length(
    COALESCE(
      (gil.aggregated_fields->>CASE
        WHEN s.solution_category = 'medications' THEN 'side_effects'
        WHEN s.solution_category IN ('supplements_vitamins', 'natural_remedies', 'beauty_skincare') THEN 'side_effects'
        ELSE 'challenges'
      END)::jsonb,
      '[]'::jsonb
    )
  ) as array_field_count
FROM goal_implementation_links gil
JOIN solutions s ON gil.solution_id = s.id
WHERE gil.goal_id = '${goalId}'
AND gil.aggregated_fields IS NOT NULL;
`
}

/**
 * Get all goals with their current solution counts
 */
export const GET_ALL_GOALS_WITH_COUNTS = `
SELECT
  g.id,
  g.title,
  g.description,
  a.name as arena_name,
  COUNT(gil.solution_id) as solution_count
FROM goals g
LEFT JOIN arenas a ON g.arena_id = a.id
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
GROUP BY g.id, g.title, g.description, a.name
ORDER BY g.title ASC;
`

/**
 * Get goals by arena
 */
export function getGoalsByArenaQuery(arenaName: string): string {
  return `
SELECT
  g.id,
  g.title,
  g.description,
  COUNT(gil.solution_id) as solution_count
FROM goals g
JOIN arenas a ON g.arena_id = a.id
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
WHERE a.name = '${arenaName}'
GROUP BY g.id, g.title, g.description
ORDER BY COUNT(gil.solution_id) ASC, g.title ASC;
`
}

/**
 * Verify solution was inserted correctly
 */
export function verifySolutionInsertionQuery(solutionId: string): string {
  return `
SELECT
  s.id,
  s.title,
  s.solution_category,
  s.description,
  COUNT(gil.id) as goal_link_count
FROM solutions s
LEFT JOIN goal_implementation_links gil ON s.id = gil.solution_id
WHERE s.id = '${solutionId}'
GROUP BY s.id, s.title, s.solution_category, s.description;
`
}

/**
 * Get generation statistics
 */
export const GET_GENERATION_STATS = `
SELECT
  COUNT(DISTINCT g.id) as total_goals,
  COUNT(DISTINCT s.id) as total_solutions,
  COUNT(gil.id) as total_links,
  AVG(gil.effectiveness) as avg_effectiveness,
  COUNT(CASE WHEN gil.data_display_mode = 'ai' THEN 1 END) as ai_generated_count,
  COUNT(CASE WHEN gil.data_display_mode = 'human' THEN 1 END) as human_verified_count
FROM goals g
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
LEFT JOIN solutions s ON gil.solution_id = s.id;
`

/**
 * Get goals with zero solutions (highest priority)
 */
export const GET_ZERO_SOLUTION_GOALS = `
SELECT
  g.id,
  g.title,
  g.description,
  a.name as arena_name
FROM goals g
LEFT JOIN arenas a ON g.arena_id = a.id
LEFT JOIN goal_implementation_links gil ON g.id = gil.goal_id
WHERE gil.id IS NULL
ORDER BY g.title ASC;
`
