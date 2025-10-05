import { createServerSupabaseClient } from '@/lib/database/server'
import { SolutionV2 } from '@/types/solution'

export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified' | 'ai_foundation';

// Updated type for the new schema with AI transition support
export interface GoalSolutionWithVariants extends SolutionV2 {
  solution_fields?: Record<string, unknown> | null
  aggregated_fields?: Record<string, unknown> | null // Added for aligned display data
  variants: {
    id: string
    variant_name: string
    amount?: string | number | null
    unit?: string | null
    form?: string | null
    is_default?: boolean | null
    category_fields?: Record<string, unknown> | null
    effectiveness?: number | null
    time_to_results?: string | null
    cost_range?: string | null
    created_at?: string
    updated_at?: string
    goal_links: Array<{
      goal_id: string
      implementation_id?: string
      avg_effectiveness: number | null
      rating_count: number | null
      typical_application?: string | null
      contraindications?: string | null
      notes?: string | null
      created_at?: string
      human_rating_count?: number | null
      data_display_mode?: 'ai' | 'human' | null
      transition_threshold?: number | null
      ai_snapshot?: Record<string, unknown> | null
      transitioned_at?: string | null
      variant_name?: string
    }>
  }[]
}

const DEFAULT_TRANSITION_THRESHOLD = 10

type SolutionRow = {
  id: string
  title: string
  description: string | null
  solution_category: string
  solution_model: string
  parent_concept: string | null
  source_type: SourceType
  is_approved: boolean
}

type SolutionVariantRow = {
  id: string
  variant_name: string
  amount: string | null
  unit: string | null
  form: string | null
  is_default: boolean
  category_fields?: Record<string, unknown> | null
  time_to_results?: string | null
  cost_range?: string | null
  created_at: string
  updated_at: string
  solutions: SolutionRow | null
}

type GoalLinkRow = {
  id: string
  avg_effectiveness: number | null
  rating_count: number | null
  solution_fields: Record<string, unknown> | null
  aggregated_fields: Record<string, unknown> | null
  human_rating_count: number | null
  data_display_mode: 'ai' | 'human' | null
  transition_threshold: number | null
  ai_snapshot: Record<string, unknown> | null
  transitioned_at: string | null
  typical_application: string | null
  contraindications: string | null
  notes: string | null
  created_at: string
  solution_variants: SolutionVariantRow | null
}

export async function getGoalSolutions(goalId: string): Promise<GoalSolutionWithVariants[]> {
  const supabase = await createServerSupabaseClient()

  console.log(`[DEBUG] Fetching solutions for goal: ${goalId}`)

  // Get all goal implementation links with their variants and solutions + transition data
  const { data: goalLinks, error } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      avg_effectiveness,
      rating_count,
      solution_fields,
      aggregated_fields,
      human_rating_count,
      data_display_mode,
      transition_threshold,
      ai_snapshot,
      transitioned_at,
      typical_application,
      contraindications,
      notes,
      created_at,
      solution_variants!implementation_id (
        id,
        variant_name,
        amount,
        unit,
        form,
        is_default,
        category_fields,
        time_to_results,
        cost_range,
        created_at,
        updated_at,
        solutions (
          id,
          title,
          description,
          solution_category,
          solution_model,
          parent_concept,
          source_type,
          is_approved,
          created_at,
          updated_at
        )
      )
    `)
    .eq('goal_id', goalId)
    .eq('solution_variants.solutions.is_approved', true)

  if (error) {
    console.error('[DEBUG] Error fetching goal links:', error)
    console.error('[DEBUG] Error details:', JSON.stringify(error, null, 2))
    console.error('[DEBUG] Error message:', error?.message)
    console.error('[DEBUG] Error hint:', error?.hint)
    console.error('[DEBUG] Error details:', error?.details)
  }

  console.log(`[DEBUG] Goal links fetched:`, goalLinks?.length || 0)
  console.log('[DEBUG] Sample goal link:', goalLinks?.[0])

  // Transform the data to group by solution
  const solutionsMap = new Map<string, GoalSolutionWithVariants>();

  const linkRows: GoalLinkRow[] = Array.isArray(goalLinks)
    ? (goalLinks as unknown as GoalLinkRow[])
    : []

  linkRows.forEach((link) => {
    const variant = Array.isArray(link.solution_variants)
      ? link.solution_variants[0]
      : link.solution_variants;
    const solution = variant && Array.isArray(variant.solutions)
      ? variant.solutions[0]
      : variant?.solutions;

    // Skip if no variant, solution, or solution is not approved
    if (!variant || !solution || !solution.is_approved) {
      return;
    }

    if (!solutionsMap.has(solution.id)) {
      solutionsMap.set(solution.id, {
        ...solution,
        solution_fields: link.solution_fields,
        aggregated_fields: link.aggregated_fields,
        variants: []
      });
    }

    const solutionEntry = solutionsMap.get(solution.id);
    if (!solutionEntry) return;

    solutionEntry.variants.push({
      id: variant.id,
      variant_name: variant.variant_name,
      amount: variant.amount,
      unit: variant.unit,
      form: variant.form,
      is_default: variant.is_default,
      category_fields: variant.category_fields ?? null,
      effectiveness: link.avg_effectiveness,
      time_to_results: variant.time_to_results ?? null,
      cost_range: variant.cost_range ?? null,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      goal_links: [{
        goal_id: goalId,
        implementation_id: variant.id,
        avg_effectiveness: link.avg_effectiveness,
        rating_count: link.rating_count,
        typical_application: link.typical_application,
        contraindications: link.contraindications,
        notes: link.notes,
        created_at: link.created_at,
        human_rating_count: link.human_rating_count ?? 0,
        data_display_mode: link.data_display_mode ?? 'ai',
        transition_threshold: link.transition_threshold ?? DEFAULT_TRANSITION_THRESHOLD,
        ai_snapshot: link.ai_snapshot,
        transitioned_at: link.transitioned_at,
        variant_name: variant.variant_name
      }]
    });
  });

  const solutions = Array.from(solutionsMap.values())
  console.log(`[DEBUG] Total unique solutions: ${solutions.length}`)
  
  return solutions
}
