import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/database/server'

interface Solution {
  id: string
  title: string
  description: string
  solution_category: string
  solution_model: string
  parent_concept: string
  source_type: string
  is_approved: boolean
  search_keywords: string
  created_at: string
  updated_at: string
}

interface SolutionVariant {
  id: string
  variant_name: string
  amount: string
  unit: string
  form: string
  is_default: boolean
  solutions: Solution
}

interface GoalLink {
  id: string
  avg_effectiveness: number | null
  rating_count: number | null
  solution_fields: Record<string, unknown> | null
  typical_application: string | null
  contraindications: string | null
  notes: string | null
  created_at: string
  updated_at: string
  solution_variants: SolutionVariant
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First, find anxiety-related goals
    const { data: goals, error: goalError } = await supabase
      .from('goals')
      .select('id, title, description')
      .or('title.ilike.%anxiety%,description.ilike.%anxiety%')
      .order('title')

    if (goalError) {
      return NextResponse.json({ error: 'Error fetching goals', details: goalError }, { status: 500 })
    }

    // Find the specific "Calm My Anxiety" goal
    const calmAnxietyGoal = goals.find(g => 
      g.title.toLowerCase().includes('calm') && 
      g.title.toLowerCase().includes('anxiety')
    ) || goals[0] // Fall back to first anxiety goal if exact match not found

    if (!calmAnxietyGoal) {
      return NextResponse.json({ error: 'No anxiety goals found' }, { status: 404 })
    }

    // Get the first 10 solutions for this goal with all details
    const { data: goalLinks, error: linksError } = await supabase
      .from('goal_implementation_links')
      .select(`
        id,
        avg_effectiveness,
        rating_count,
        solution_fields,
        typical_application,
        contraindications,
        notes,
        created_at,
        updated_at,
        solution_variants!implementation_id (
          id,
          variant_name,
          amount,
          unit,
          form,
          is_default,
          display_order,
          solutions!solution_variants_solution_id_fkey (
            id,
            title,
            description,
            solution_category,
            solution_model,
            parent_concept,
            source_type,
            is_approved,
            search_keywords,
            created_at,
            updated_at
          )
        )
      `)
      .eq('goal_id', calmAnxietyGoal.id)
      .eq('solution_variants.solutions.is_approved', true)
      .order('avg_effectiveness', { ascending: false })
      .limit(10)

    if (linksError) {
      return NextResponse.json({ error: 'Error fetching solutions', details: linksError }, { status: 500 })
    }

    // Transform the data for easier reading
    const solutions = (goalLinks as GoalLink[])
      .filter((link: GoalLink) => link.solution_variants?.solutions) // Filter out invalid entries
      .map((link: GoalLink, index: number) => {
        const variant = link.solution_variants
        const solution = variant.solutions
        
        return {
          rank: index + 1,
          solution_name: solution.title,
          category: solution.solution_category,
          effectiveness_rating: link.avg_effectiveness || 'Not rated',
          rating_count: link.rating_count || 0,
          source_type: solution.source_type,
          variant_info: {
            name: variant.variant_name,
            amount: variant.amount,
            unit: variant.unit,
            form: variant.form,
            is_default: variant.is_default
          },
          solution_fields: link.solution_fields || {},
          typical_application: link.typical_application,
          contraindications: link.contraindications,
          notes: link.notes,
          description: solution.description,
          parent_concept: solution.parent_concept,
          search_keywords: solution.search_keywords,
          created_at: link.created_at,
          updated_at: link.updated_at
        }
      })

    return NextResponse.json({
      goal: {
        id: calmAnxietyGoal.id,
        title: calmAnxietyGoal.title,
        description: calmAnxietyGoal.description
      },
      total_anxiety_goals_found: goals.length,
      solutions_count: solutions.length,
      solutions: solutions
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error occurred', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}