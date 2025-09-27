#!/usr/bin/env tsx
/**
 * Fix Beauty Skincare Distribution Mappings - Test Single Category
 *
 * This script applies the value mapper to fix beauty_skincare distribution data
 * to ensure all values match the expected dropdown options.
 */

import { createClient } from '@supabase/supabase-js'
import { mapToDropdownValue } from './utils/value-mapper'
import { getDropdownOptionsForField } from './config/dropdown-options'

// Supabase connection
const supabaseUrl = 'https://wqxkhxdbxdtpuvuvgirx.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface DistributionItem {
  name: string
  percentage: number
}

interface FieldDistribution {
  solution_id: string
  goal_id: string
  field_name: string
  distributions: DistributionItem[]
}

/**
 * Map distribution values to dropdown options
 */
function mapDistributionValues(
  distributions: DistributionItem[],
  fieldName: string,
  category: string
): DistributionItem[] {
  const validOptions = getDropdownOptionsForField(category, fieldName)
  if (!validOptions) {
    console.warn(`⚠️  No dropdown options found for ${category}.${fieldName}`)
    return distributions
  }

  console.log(`📋 Valid options for ${fieldName}:`, validOptions)

  return distributions.map(item => {
    const mappedValue = mapToDropdownValue(fieldName, item.name, category)

    if (mappedValue !== item.name) {
      console.log(`🔄 Mapping: "${item.name}" → "${mappedValue}"`)
    } else {
      console.log(`✅ Already valid: "${item.name}"`)
    }

    return {
      name: mappedValue,
      percentage: item.percentage
    }
  })
}

/**
 * Fix distribution mappings for beauty_skincare category
 */
async function fixBeautySkincareDistributions() {
  console.log('🎯 Starting beauty_skincare distribution mapping fix...\n')

  // Get all beauty_skincare distribution data
  const { data: distributions, error } = await supabase
    .from('ai_field_distributions')
    .select(`
      solution_id,
      goal_id,
      field_name,
      distributions,
      solutions!inner (
        title,
        solution_category,
        source_type
      )
    `)
    .eq('solutions.solution_category', 'beauty_skincare')
    .eq('solutions.source_type', 'ai_foundation')

  if (error) {
    console.error('❌ Error fetching distributions:', error)
    return
  }

  console.log(`📊 Found ${distributions.length} field distributions for beauty_skincare\n`)

  let updatedCount = 0
  let totalProcessed = 0

  for (const dist of distributions) {
    totalProcessed++
    const fieldDistribution = dist as any

    console.log(`\n📝 Processing: ${fieldDistribution.solutions.title}`)
    console.log(`   Field: ${fieldDistribution.field_name}`)
    console.log(`   Original distributions:`, fieldDistribution.distributions)

    // Map the distribution values
    const mappedDistributions = mapDistributionValues(
      fieldDistribution.distributions,
      fieldDistribution.field_name,
      'beauty_skincare'
    )

    // Check if any values changed
    const hasChanges = JSON.stringify(fieldDistribution.distributions) !== JSON.stringify(mappedDistributions)

    if (hasChanges) {
      console.log(`   ✨ Mapped distributions:`, mappedDistributions)

      // Update the database
      const { error: updateError } = await supabase
        .from('ai_field_distributions')
        .update({ distributions: mappedDistributions })
        .eq('solution_id', fieldDistribution.solution_id)
        .eq('goal_id', fieldDistribution.goal_id)
        .eq('field_name', fieldDistribution.field_name)

      if (updateError) {
        console.error(`❌ Error updating distribution:`, updateError)
      } else {
        console.log(`✅ Updated distribution in database`)
        updatedCount++
      }
    } else {
      console.log(`   ℹ️  No mapping needed`)
    }
  }

  console.log(`\n🎉 Mapping complete!`)
  console.log(`📊 Processed: ${totalProcessed} distributions`)
  console.log(`✅ Updated: ${updatedCount} distributions`)
  console.log(`➡️  No changes needed: ${totalProcessed - updatedCount} distributions`)

  if (updatedCount > 0) {
    console.log('\n🔄 Now updating aggregated_fields in goal_implementation_links...')
    await updateAggregatedFields()
  }
}

/**
 * Update aggregated fields to reflect the new mappings
 */
async function updateAggregatedFields() {
  // This would run the aggregation process to update goal_implementation_links.aggregated_fields
  // For now, let's just notify that this step is needed
  console.log('⚠️  Note: Run the aggregation service to update aggregated_fields with new mappings')
  console.log('   Command: npm run aggregate-fields or similar')
}

// Run the script
if (require.main === module) {
  fixBeautySkincareDistributions()
    .then(() => {
      console.log('\n🏁 Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error)
      process.exit(1)
    })
}

export { fixBeautySkincareDistributions }