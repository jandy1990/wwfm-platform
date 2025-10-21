/**
 * Rollback Script: Cost Dropdown Values Migration
 *
 * Purpose: Rollback cost format migrations if issues are detected
 *
 * Strategy: Creates a backup before migration, allows restoration
 *
 * Usage:
 *   1. Before migration: npx tsx scripts/rollback-cost-migration.ts --backup
 *   2. After migration (if needed): npx tsx scripts/rollback-cost-migration.ts --restore
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BACKUP_FILE = path.join(__dirname, '../.backups/cost-migration-backup.json')

interface BackupRecord {
  id: string
  aggregated_fields: any
  backed_up_at: string
}

async function createBackup() {
  console.log('\n=== Creating Migration Backup ===\n')

  // Get all records that might be affected
  const { data: records, error } = await supabase
    .from('goal_implementation_links')
    .select('id, aggregated_fields')
    .or('aggregated_fields->>cost.cs."$10-25/month",' +
        'aggregated_fields->>cost.cs."$50-100",' +
        'aggregated_fields->>cost.cs."$25-50/month",' +
        'aggregated_fields->>cost.cs."$100-250",' +
        'aggregated_fields->>cost.cs."$50-100/month",' +
        'aggregated_fields->>cost.cs."$500-1000",' +
        'aggregated_fields->>cost.cs."Over $1000"')

  if (error) {
    console.error('Error fetching records for backup:', error)
    return
  }

  const backup: BackupRecord[] = (records || []).map(r => ({
    id: r.id,
    aggregated_fields: r.aggregated_fields,
    backed_up_at: new Date().toISOString()
  }))

  // Ensure backup directory exists
  const backupDir = path.dirname(BACKUP_FILE)
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  // Write backup file
  fs.writeFileSync(
    BACKUP_FILE,
    JSON.stringify({
      created_at: new Date().toISOString(),
      record_count: backup.length,
      records: backup
    }, null, 2)
  )

  console.log(`✅ Backup created: ${BACKUP_FILE}`)
  console.log(`   Records backed up: ${backup.length}`)
  console.log(`   Timestamp: ${new Date().toISOString()}\n`)
}

async function restoreFromBackup() {
  console.log('\n=== Restoring from Backup ===\n')

  if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`❌ Backup file not found: ${BACKUP_FILE}`)
    console.error('   Cannot restore without a backup.')
    return
  }

  const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'))
  const records: BackupRecord[] = backupData.records

  console.log(`Backup created: ${backupData.created_at}`)
  console.log(`Records to restore: ${records.length}\n`)

  let restored = 0
  let failed = 0

  for (const record of records) {
    const { error } = await supabase
      .from('goal_implementation_links')
      .update({ aggregated_fields: record.aggregated_fields })
      .eq('id', record.id)

    if (error) {
      console.error(`Failed to restore record ${record.id}:`, error)
      failed++
    } else {
      restored++
    }

    if ((restored + failed) % 100 === 0) {
      console.log(`Progress: ${restored + failed}/${records.length}`)
    }
  }

  console.log('\n=== Restore Summary ===')
  console.log(`Successfully restored: ${restored}`)
  console.log(`Failed: ${failed}`)

  if (failed === 0) {
    console.log('\n✅ All records restored successfully!')
  } else {
    console.log(`\n⚠️  ${failed} records failed to restore - check logs above`)
  }
}

async function verifyBackup() {
  console.log('\n=== Verifying Backup ===\n')

  if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`❌ Backup file not found: ${BACKUP_FILE}`)
    return
  }

  const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'))
  console.log(`Backup created: ${backupData.created_at}`)
  console.log(`Records in backup: ${backupData.record_count}`)
  console.log(`\nSample record (first in backup):`)
  if (backupData.records.length > 0) {
    console.log(JSON.stringify(backupData.records[0], null, 2))
  }
  console.log()
}

// Main execution
const args = process.argv.slice(2)

if (args.includes('--backup')) {
  createBackup().catch(console.error)
} else if (args.includes('--restore')) {
  restoreFromBackup().catch(console.error)
} else if (args.includes('--verify')) {
  verifyBackup().catch(console.error)
} else {
  console.log(`
Usage:
  Create backup:  npx tsx scripts/rollback-cost-migration.ts --backup
  Verify backup:  npx tsx scripts/rollback-cost-migration.ts --verify
  Restore backup: npx tsx scripts/rollback-cost-migration.ts --restore
  `)
}
