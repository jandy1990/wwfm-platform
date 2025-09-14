#!/usr/bin/env tsx
/**
 * Find records that still need value mapping
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://wqxkhxdbxdtpuvuvgirx.supabase.co', process.env.SUPABASE_SERVICE_KEY!)

async function findUnmappedRecords() {
  console.log('🔍 Finding records that still need value mapping...')

  // Find records without the new mapping metadata
  const { data: unmappedRecords, error } = await supabase
    .from('goal_implementation_links')
    .select('implementation_id, goal_id, aggregated_fields')
    .not('aggregated_fields', 'is', null)
    .not('aggregated_fields', 'cs', '{"_metadata":{"value_mapped":true}}')
    .limit(10)

  if (error) {
    console.error('❌ Error fetching unmapped records:', error)
    return
  }

  console.log(`📊 Found ${unmappedRecords.length} records still using old mapping`)

  // Check some for duplicates
  let duplicatesFound = 0
  let totalChecked = 0

  for (const record of unmappedRecords.slice(0, 5)) {
    const fields = record.aggregated_fields

    for (const [fieldName, fieldData] of Object.entries(fields)) {
      if (fieldName === '_metadata') continue

      const values = (fieldData as any).values || []
      const valueNames = values.map((v: any) => v.value)
      const uniqueNames = new Set(valueNames)

      if (valueNames.length !== uniqueNames.size) {
        console.log(`❌ Duplicates in ${fieldName}:`, valueNames)
        duplicatesFound++
      }
      totalChecked++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`- ${unmappedRecords.length} records still need mapping`)
  console.log(`- ${duplicatesFound} fields with duplicates found in sample`)
  console.log(`- Transfer script needs to complete to fix remaining ${unmappedRecords.length} records`)

  return unmappedRecords.length
}

findUnmappedRecords()