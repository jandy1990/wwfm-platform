import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { CATEGORY_FIELD_CONFIG } from '../../lib/config/solution-fields'

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

type Counts = {
  totalRequired: number
  missing: number
  categories: Map<string, { totalRequired: number; missing: number }>
}

const startupStats: Counts = {
  totalRequired: 0,
  missing: 0,
  categories: new Map()
}

const ongoingStats: Counts = {
  totalRequired: 0,
  missing: 0,
  categories: new Map()
}

const startupRequiredCategories = new Set(
  Object.entries(CATEGORY_FIELD_CONFIG)
    .filter(([, cfg]) => cfg.requiredFields.includes('startup_cost'))
    .map(([category]) => category)
)

const ongoingRequiredCategories = new Set(
  Object.entries(CATEGORY_FIELD_CONFIG)
    .filter(([, cfg]) => cfg.requiredFields.includes('ongoing_cost'))
    .map(([category]) => category)
)

async function main() {
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('goal_implementation_links')
      .select(
        `aggregated_fields, solution_variants!inner(solutions!inner(solution_category))`
      )
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(error)
      process.exit(1)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      const category = row.solution_variants?.solutions?.solution_category as string | undefined
      if (!category) continue

      const aggregated = row.aggregated_fields as Record<string, unknown> | null

      if (startupRequiredCategories.has(category)) {
        startupStats.totalRequired += 1
        const missing = !aggregated || aggregated.startup_cost == null
        if (missing) startupStats.missing += 1
        const entry = startupStats.categories.get(category) ?? { totalRequired: 0, missing: 0 }
        entry.totalRequired += 1
        if (missing) entry.missing += 1
        startupStats.categories.set(category, entry)
      }

      if (ongoingRequiredCategories.has(category)) {
        ongoingStats.totalRequired += 1
        const missing = !aggregated || aggregated.ongoing_cost == null
        if (missing) ongoingStats.missing += 1
        const entry = ongoingStats.categories.get(category) ?? { totalRequired: 0, missing: 0 }
        entry.totalRequired += 1
        if (missing) entry.missing += 1
        ongoingStats.categories.set(category, entry)
      }
    }

    if (data.length < pageSize) break
  }

  const formatSummary = (label: string, stats: Counts) => {
    console.log(`\n${label}`)
    console.log(`  Total required solutions: ${stats.totalRequired}`)
    console.log(`  Missing: ${stats.missing}`)
    const pct = stats.totalRequired === 0 ? 0 : (stats.missing / stats.totalRequired) * 100
    console.log(`  Missing %: ${pct.toFixed(1)}%`)
    console.log('  By category:')
    const sorted = Array.from(stats.categories.entries()).sort((a, b) => b[1].missing - a[1].missing)
    for (const [category, counts] of sorted) {
      const catPct = counts.totalRequired === 0 ? 0 : (counts.missing / counts.totalRequired) * 100
      console.log(`    - ${category}: ${counts.missing}/${counts.totalRequired} missing (${catPct.toFixed(1)}%)`)
    }
  }

  formatSummary('Startup Cost', startupStats)
  formatSummary('Ongoing Cost', ongoingStats)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
