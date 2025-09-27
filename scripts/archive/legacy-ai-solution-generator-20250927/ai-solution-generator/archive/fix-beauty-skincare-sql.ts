#!/usr/bin/env tsx
/**
 * Beauty Skincare Mapping Fix - SQL Generation
 *
 * This script generates the SQL updates needed to fix beauty_skincare distribution mappings.
 * The SQL can then be executed via MCP Supabase tools.
 */

import { mapToDropdownValue } from './utils/value-mapper'

interface DistributionItem {
  name: string
  percentage: number
}

/**
 * Sample beauty_skincare data (from our earlier query)
 */
const sampleDistributions = [
  {
    solution_id: "77320bd4-e2f9-4873-a23f-c5d09db45a86",
    title: "St. Tropez Self Tan Express Bronzing Mousse",
    field_name: "cost",
    distributions: [
      { name: "$15-30 per application/bottle", percentage: 50 },
      { name: "$25-50/month", percentage: 30 },
      { name: "Less than $15 per application", percentage: 15 },
      { name: "More than $50/month", percentage: 5 }
    ]
  },
  {
    solution_id: "77320bd4-e2f9-4873-a23f-c5d09db45a86",
    title: "St. Tropez Self Tan Express Bronzing Mousse",
    field_name: "time_to_results",
    distributions: [
      { name: "Immediate to 1 hour (for initial color)", percentage: 60 },
      { name: "3-8 hours (for full development)", percentage: 35 },
      { name: "1-2 months", percentage: 5 }
    ]
  },
  {
    solution_id: "77320bd4-e2f9-4873-a23f-c5d09db45a86",
    title: "St. Tropez Self Tan Express Bronzing Mousse",
    field_name: "skincare_frequency",
    distributions: [
      { name: "As needed (for touch-ups or events)", percentage: 55 },
      { name: "Weekly (for maintaining color)", percentage: 30 },
      { name: "Daily (for intense color)", percentage: 10 },
      { name: "As needed (spot treatment)", percentage: 5 }
    ]
  }
]

/**
 * Map distribution values and generate SQL
 */
function generateMappingSQL() {
  console.log('🎯 Generating beauty_skincare mapping SQL...\n')

  for (const dist of sampleDistributions) {
    console.log(`📝 Processing: ${dist.title} - ${dist.field_name}`)
    console.log(`   Original:`, dist.distributions)

    // Map each distribution item
    const mappedDistributions = dist.distributions.map(item => {
      const mappedValue = mapToDropdownValue(dist.field_name, item.name, 'beauty_skincare')

      if (mappedValue !== item.name) {
        console.log(`   🔄 "${item.name}" → "${mappedValue}"`)
      } else {
        console.log(`   ✅ "${item.name}" (no change needed)`)
      }

      return {
        name: mappedValue,
        percentage: item.percentage
      }
    })

    console.log(`   Mapped:`, mappedDistributions)

    // Generate SQL update
    const sqlUpdate = `
UPDATE ai_field_distributions
SET distributions = '${JSON.stringify(mappedDistributions)}'::jsonb
WHERE solution_id = '${dist.solution_id}'
  AND field_name = '${dist.field_name}';`

    console.log(`   SQL:`, sqlUpdate)
    console.log('\n' + '='.repeat(80) + '\n')
  }
}

// Run the mapping demonstration
generateMappingSQL()

export { generateMappingSQL }