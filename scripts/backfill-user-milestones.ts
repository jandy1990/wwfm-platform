#!/usr/bin/env tsx

/**
 * Backfill milestone records for a specific user or all users
 *
 * Usage:
 *   npx tsx scripts/backfill-user-milestones.ts <user_email>
 *   npx tsx scripts/backfill-user-milestones.ts all
 */

import { getServiceSupabaseClient } from '../lib/database'
import { backfillUserMilestones, backfillAllUsersMilestones } from '../app/actions/backfill-milestones'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/backfill-user-milestones.ts <user_email_or_id>')
    console.error('   or: npx tsx scripts/backfill-user-milestones.ts all')
    process.exit(1)
  }

  const input = args[0]

  if (input === 'all') {
    console.log('🚀 Backfilling milestones for ALL users...\n')

    const result = await backfillAllUsersMilestones()

    console.log('\n✅ Backfill complete!')
    console.log(`   Users processed: ${result.usersProcessed}`)
    console.log(`   Total milestones added: ${result.totalMilestonesAdded}`)
    console.log(`   Errors: ${result.errors}`)

    process.exit(result.success ? 0 : 1)
  }

  // Single user backfill
  const supabase = getServiceSupabaseClient()

  // Check if input is email or UUID
  const isEmail = input.includes('@')

  let userId: string

  if (isEmail) {
    console.log(`🔍 Looking up user: ${input}...\n`)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, contribution_points')
      .eq('email', input)
      .single()

    if (error || !user) {
      console.error(`❌ User not found: ${input}`)
      process.exit(1)
    }

    userId = user.id
    console.log(`✓ Found user with ${user.contribution_points} points\n`)
  } else {
    userId = input
    console.log(`🔍 Using user ID: ${userId}...\n`)
  }

  console.log('🚀 Backfilling milestones...\n')

  const result = await backfillUserMilestones(userId)

  if (result.success) {
    console.log(`✅ Success! Added ${result.milestonesAdded} milestone(s)`)

    if (result.milestonesAdded === 0) {
      console.log('   (User already has all earned milestones)')
    }
  } else {
    console.error(`❌ Failed: ${result.error}`)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
