import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const titleQuery = process.argv.slice(2).join(' ')
if (!titleQuery) {
  console.error('Usage: node scripts/analytics/inspect-goal.js "Goal title"')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title')
    .ilike('title', `%${titleQuery}%`)

  if (error) {
    console.error('Goal lookup error', error)
    process.exit(1)
  }

  if (!goals || goals.length === 0) {
    console.log(`No goals match "${titleQuery}"`)
    return
  }

  for (const goal of goals) {
    console.log(`\nGoal: ${goal.title} (${goal.id})`)

    const { data: links, error: linkError } = await supabase
      .from('goal_implementation_links')
      .select(`id, data_display_mode, aggregated_fields, solution_variants!inner(
        solutions!inner(id, title, solution_category)
      )`)
      .eq('goal_id', goal.id)

    if (linkError) {
      console.error('Link lookup error', linkError)
      continue
    }

    if (!links || links.length === 0) {
      console.log('  No linked solutions.')
      continue
    }

    console.log(`  Linked solutions: ${links.length}`)
    for (const link of links) {
      const solution = link.solution_variants?.solutions
      const aggregated = link.aggregated_fields ?? {}
      console.log(`    - ${solution?.title ?? 'Unknown'} [${solution?.solution_category ?? 'unknown'}] mode=${link.data_display_mode}`)
      const cost = aggregated?.cost
      if (!cost) {
        console.log('        cost: missing')
      }
      const startup = aggregated?.startup_cost
      const ongoing = aggregated?.ongoing_cost
      if (!startup) {
        console.log('        startup_cost: missing')
      }
      if (!ongoing) {
        console.log('        ongoing_cost: missing')
      }
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
