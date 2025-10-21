/**
 * Migration Script: Cost Dropdown Values
 *
 * Purpose: Migrate old cost format values to new SSOT-aligned formats
 *
 * Context: Phase 1 fixed the validation logic to use context-aware cost options.
 *          Phase 2 updated SSOT documentation to match code.
 *          Phase 3 (this script) migrates existing AI data to use new formats.
 *
 * Strategy: Conservative mapping - choose lower bound when ambiguous
 *
 * Affected fields: cost, startup_cost, ongoing_cost in aggregated_fields
 * Affected records: ~1,505 goal_implementation_links
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MigrationMapping {
  oldValue: string
  newValue: string
  rationale: string
}

// Conservative mappings based on SSOT alignment
const COST_MIGRATIONS: MigrationMapping[] = [
  // AppForm subscription costs (monthly) - most common
  {
    oldValue: '$10-25/month',
    newValue: '$10-$19.99/month',
    rationale: 'Conservative: choose lower bound of range'
  },
  {
    oldValue: '$25-50/month',
    newValue: '$20-$49.99/month',
    rationale: 'Maps to overlapping new range'
  },
  {
    oldValue: '$50-100/month',
    newValue: '$50-$99.99/month',
    rationale: 'Direct mapping with decimal precision'
  },

  // One-time costs (AppForm, HobbyForm, etc.)
  {
    oldValue: '$50-100',
    newValue: '$50-$99.99',
    rationale: 'Direct mapping with decimal precision'
  },
  {
    oldValue: '$100-250',
    newValue: '$100-$249.99',
    rationale: 'Direct mapping with decimal precision'
  },
  {
    oldValue: '$500-1000',
    newValue: '$500-$999.99',
    rationale: 'Direct mapping - could be one-time or monthly, context will determine'
  },
  {
    oldValue: 'Over $1000',
    newValue: '$1000+',
    rationale: 'New format for upper bound - could be one-time or monthly'
  }
]

interface DistributionValue {
  value: string
  count: number
  percentage: number
  source: string
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  dataSource: string
  totalReports: number
}

async function migrateFieldValue(
  fieldName: string,
  fieldData: DistributionData,
  mapping: MigrationMapping
): Promise<DistributionData> {
  // Update the mode if it matches
  const newMode = fieldData.mode === mapping.oldValue ? mapping.newValue : fieldData.mode

  // Update all values in the distribution
  const newValues = fieldData.values.map(v => ({
    ...v,
    value: v.value === mapping.oldValue ? mapping.newValue : v.value
  }))

  return {
    ...fieldData,
    mode: newMode,
    values: newValues
  }
}

async function migrateRecord(
  recordId: string,
  aggregatedFields: any,
  dryRun: boolean = true
): Promise<{ updated: boolean; changes: string[] }> {
  const changes: string[] = []
  const updatedFields = { ...aggregatedFields }

  // Check each field that might have cost data
  for (const fieldName of ['cost', 'startup_cost', 'ongoing_cost']) {
    const fieldData = aggregatedFields[fieldName] as DistributionData | undefined

    if (!fieldData || typeof fieldData !== 'object' || !fieldData.mode) {
      continue
    }

    // Check if this field needs migration
    for (const mapping of COST_MIGRATIONS) {
      if (fieldData.mode === mapping.oldValue) {
        updatedFields[fieldName] = await migrateFieldValue(fieldName, fieldData, mapping)
        changes.push(`${fieldName}: "${mapping.oldValue}" → "${mapping.newValue}"`)
        break
      }
    }
  }

  // If changes were made, update the record
  if (changes.length > 0 && !dryRun) {
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({ aggregated_fields: updatedFields })
      .eq('id', recordId)

    if (error) {
      console.error(`Error updating record ${recordId}:`, error)
      return { updated: false, changes: [] }
    }
  }

  return { updated: changes.length > 0, changes }
}

async function runMigration(dryRun: boolean = true) {
  console.log('\n=== Cost Dropdown Value Migration ===')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}\n`)

  // Get all records with old cost format values
  const { data: records, error } = await supabase
    .from('goal_implementation_links')
    .select('id, aggregated_fields')
    .or(
      COST_MIGRATIONS
        .map(m => `aggregated_fields->>cost.cs."${m.oldValue}"`)
        .join(',')
    )

  if (error) {
    console.error('Error fetching records:', error)
    return
  }

  console.log(`Found ${records?.length || 0} records to process\n`)

  let updated = 0
  let skipped = 0
  const changesByMapping: Record<string, number> = {}

  for (const record of records || []) {
    const result = await migrateRecord(record.id, record.aggregated_fields, dryRun)

    if (result.updated) {
      updated++
      for (const change of result.changes) {
        const mapping = change.split('→')[1].trim().replace(/"/g, '')
        changesByMapping[mapping] = (changesByMapping[mapping] || 0) + 1
      }

      if (updated <= 5) {
        console.log(`Record ${record.id}:`)
        result.changes.forEach(c => console.log(`  - ${c}`))
        console.log()
      }
    } else {
      skipped++
    }
  }

  console.log('\n=== Migration Summary ===')
  console.log(`Total processed: ${records?.length || 0}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)

  if (Object.keys(changesByMapping).length > 0) {
    console.log('\nChanges by new value:')
    Object.entries(changesByMapping)
      .sort((a, b) => b[1] - a[1])
      .forEach(([newValue, count]) => {
        console.log(`  ${newValue}: ${count} updates`)
      })
  }

  if (dryRun) {
    console.log('\n⚠️  This was a DRY RUN - no changes were made')
    console.log('Run with --live flag to execute migration')
  } else {
    console.log('\n✅ Migration completed!')
  }
}

// Run migration
const isDryRun = !process.argv.includes('--live')
runMigration(isDryRun).catch(console.error)
