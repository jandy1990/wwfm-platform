#!/usr/bin/env tsx
/**
 * Check for duplicates in aggregated_fields (UI display layer)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://wqxkhxdbxdtpuvuvgirx.supabase.co', process.env.SUPABASE_SERVICE_KEY!)

async function checkForDuplicatesInAggregated() {
  console.log('🔍 Checking aggregated_fields for duplicates...')

  const { data: records } = await supabase
    .from('goal_implementation_links')
    .select('aggregated_fields')
    .not('aggregated_fields', 'is', null)
    .limit(500)

  if (!records) {
    console.log('❌ No records found')
    return
  }

  let duplicatesFound = 0
  let totalChecked = 0
  let examplesShown = 0

  for (const record of records) {
    const fields = record.aggregated_fields

    for (const [fieldName, fieldData] of Object.entries(fields)) {
      if (fieldName === '_metadata') continue

      const values = (fieldData as any).values || []
      const valueNames = values.map((v: any) => v.value)
      const uniqueNames = new Set(valueNames)

      if (valueNames.length !== uniqueNames.size) {
        if (examplesShown < 5) {
          console.log(`❌ Duplicates in ${fieldName}:`, valueNames)
          examplesShown++
        }
        duplicatesFound++
      }
      totalChecked++
    }
  }

  console.log(`📊 Checked ${totalChecked} fields, found ${duplicatesFound} with duplicates`)

  if (duplicatesFound === 0) {
    console.log('✅ SUCCESS: No duplicates found in UI display layer!')
  } else {
    console.log(`⚠️ Found ${duplicatesFound} fields with duplicates still remaining`)
  }
}

// Execute
checkForDuplicatesInAggregated()