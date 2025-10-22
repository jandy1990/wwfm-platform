import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const categories = (process.env.CATEGORY ?? process.env.CATEGORIES ?? '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)

if (!categories.length) {
  console.error('Set CATEGORY=<single> or CATEGORIES=a,b,c before running')
  process.exit(1)
}

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function main() {
  const counts = new Map()
  const pageSize = 1000

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from('goal_implementation_links')
      .select(
        'goal_id, goal:goals!inner(title), solution_variants!inner(solutions!inner(solution_category))'
      )
      .eq('data_display_mode', 'ai')
      .in('solution_variants.solutions.solution_category', categories)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(error)
      process.exit(1)
    }

    if (!data?.length) {
      break
    }

    for (const row of data) {
      const key = `${row.goal_id}|${row.goal.title}`
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    if (data.length < pageSize) {
      break
    }
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])

  let cumulative = 0
  sorted.forEach(([key, count], index) => {
    const [goalId, title] = key.split('|')
    cumulative += count
    console.log(
      `${(index + 1).toString().padStart(2, '0')} ${count.toString().padStart(3, ' ')} - ${title} - ${goalId} - cumulative ${cumulative}`
    )
  })

  const total = sorted.reduce((sum, [, count]) => sum + count, 0)
  console.log(`Total goals ${sorted.length}`)
  console.log(`Total solutions ${total}`)
}

main()
