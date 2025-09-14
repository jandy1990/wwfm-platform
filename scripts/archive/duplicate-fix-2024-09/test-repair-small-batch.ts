#!/usr/bin/env node

/**
 * Test Script: Fix Repair on Small Batch (5 records)
 * 
 * This script tests that we can properly repair aggregated_fields
 * by fixing the authentication issue and testing on just 5 records.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// FIXED: Remove fallback to anon key and ensure we have service role key
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required credentials:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

console.log('✅ Using service role key (not anon key)')
const supabase = createClient(supabaseUrl, supabaseServiceKey!)

interface DistributionValue {
  value: string
  count: number
  percentage: number
}

interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
}

/**
 * Transform solution_fields into aggregated_fields format
 */
function transformToAggregatedFields(fields: Record<string, any>): Record<string, any> {
  const aggregated: any = {
    _metadata: {
      computed_at: new Date().toISOString(),
      last_aggregated: new Date().toISOString(),
      total_ratings: 1,
      data_source: 'ai',
      confidence: 'ai_generated'
    }
  }
  
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === '') {
      continue // Skip empty values
    }
    
    if (Array.isArray(value) && value.length > 0) {
      // Array fields: distribute percentage equally among items
      const percentage = Math.round(100 / value.length)
      aggregated[key] = {
        mode: value[0],
        values: value.map((v: any, index: number) => ({
          value: String(v),
          count: 1,
          percentage: index === value.length - 1 ? 
            100 - (percentage * (value.length - 1)) : // Last item gets remainder
            percentage
        })),
        totalReports: 1
      } as DistributionData
    } else {
      // Single values: 100% distribution
      aggregated[key] = {
        mode: String(value),
        values: [{
          value: String(value),
          count: 1,
          percentage: 100
        }],
        totalReports: 1
      } as DistributionData
    }
  }
  
  return aggregated
}

async function testSmallBatchRepair() {
  console.log(chalk.cyan('🧪 Testing Repair on Small Batch (5 records)'))
  console.log(chalk.cyan('==============================================='))
  
  // Step 1: Get exactly 5 empty records
  console.log(chalk.gray('📊 Fetching 5 records for testing...'))
  
  const { data: testRecords, error: fetchError } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields, aggregated_fields')
    .eq('aggregated_fields', '{}')
    .not('solution_fields', 'is', null)
    .limit(5)
  
  if (fetchError) {
    console.error(chalk.red('❌ Error fetching test records:'), fetchError)
    process.exit(1)
  }
  
  if (!testRecords || testRecords.length === 0) {
    console.log(chalk.green('✅ No empty records found - all already repaired!'))
    return
  }
  
  console.log(chalk.blue(`🎯 Found ${testRecords.length} test records`))
  
  // Step 2: Transform and update each record
  let successCount = 0
  let errorCount = 0
  
  for (const record of testRecords) {
    console.log(chalk.gray(`\n📝 Processing record: ${record.id}`))
    
    try {
      const solutionFields = record.solution_fields as Record<string, any>
      if (!solutionFields || Object.keys(solutionFields).length === 0) {
        console.log(chalk.yellow('   ⚠️  Empty solution_fields, skipping'))
        continue
      }
      
      console.log(chalk.gray(`   📁 Solution fields: ${Object.keys(solutionFields).join(', ')}`))
      
      // Transform solution_fields to aggregated_fields format
      const aggregatedFields = transformToAggregatedFields(solutionFields)
      console.log(chalk.gray(`   📊 Generated aggregated fields: ${Object.keys(aggregatedFields).filter(k => k !== '_metadata').join(', ')}`))
      
      // Update the record
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ aggregated_fields: aggregatedFields })
        .eq('id', record.id)
      
      if (updateError) {
        console.error(chalk.red(`   ❌ Error updating record: ${updateError.message}`))
        errorCount++
      } else {
        console.log(chalk.green(`   ✅ Successfully updated`))
        successCount++
      }
      
    } catch (error: any) {
      console.error(chalk.red(`   ❌ Error processing record: ${error.message}`))
      errorCount++
    }
  }
  
  // Step 3: Verify the updates persisted
  console.log(chalk.cyan('\n🔍 Verifying updates persisted...'))
  
  const { data: verifyRecords, error: verifyError } = await supabase
    .from('goal_implementation_links')
    .select('id, aggregated_fields')
    .in('id', testRecords.map(r => r.id))
  
  if (verifyError) {
    console.error(chalk.red('❌ Error verifying updates:'), verifyError)
    process.exit(1)
  }
  
  let actuallyFixed = 0
  for (const record of verifyRecords || []) {
    const isEmpty = JSON.stringify(record.aggregated_fields) === '{}'
    if (isEmpty) {
      console.log(chalk.red(`   ❌ Record ${record.id} still empty!`))
    } else {
      console.log(chalk.green(`   ✅ Record ${record.id} successfully populated`))
      actuallyFixed++
    }
  }
  
  // Step 4: Final results
  console.log(chalk.cyan('\n🎯 Test Results:'))
  console.log(chalk.cyan('================'))
  console.log(chalk.green(`✅ Updates attempted: ${successCount}`))
  console.log(chalk.red(`❌ Errors: ${errorCount}`))
  console.log(chalk.blue(`🔍 Actually persisted: ${actuallyFixed}`))
  
  if (actuallyFixed === successCount && successCount > 0) {
    console.log(chalk.green('\n🎉 SUCCESS! The repair fix is working correctly!'))
    console.log(chalk.green('✅ Authentication issue resolved'))
    console.log(chalk.green('✅ Updates are persisting to database'))
    console.log(chalk.green('✅ Ready to run on all 3,911 records'))
  } else if (actuallyFixed === 0) {
    console.log(chalk.red('\n❌ FAILURE! Updates are not persisting!'))
    console.log(chalk.red('⚠️  The authentication fix did not work'))
    console.log(chalk.yellow('💡 Check RLS policies or service key permissions'))
  } else {
    console.log(chalk.yellow('\n⚠️  PARTIAL SUCCESS'))
    console.log(chalk.yellow(`Only ${actuallyFixed}/${successCount} updates persisted`))
    console.log(chalk.yellow('💡 There may be RLS or permission issues'))
  }
}

// Run the test
testSmallBatchRepair().catch(error => {
  console.error(chalk.red('💥 Test failed:'), error)
  process.exit(1)
})