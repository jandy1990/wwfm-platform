#!/usr/bin/env node

/**
 * COMPREHENSIVE Repair Script: Fix ALL Missing Aggregated Fields
 * 
 * This script transforms solution_fields into the aggregated_fields format
 * for ALL goal_implementation_links with empty aggregated_fields (3,911+ records).
 * 
 * Critical: Run after stopping all AI generation processes to prevent
 * new empty records from being created during repair.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// FIXED: Ensure we have the correct service key (not anon key)
if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY - cannot proceed without write permissions')
  process.exit(1)
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

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

async function comprehensiveRepair() {
  console.log(chalk.cyan('🚀 WWFM COMPREHENSIVE Aggregated Fields Repair'))
  console.log(chalk.cyan('================================================'))
  console.log(chalk.yellow('⚠️  This repairs ALL empty aggregated_fields records'))
  console.log('')
  
  // Step 1: Count ALL records that need repair using proper count query
  console.log(chalk.gray('📊 Analyzing ALL records that need repair...'))
  
  const { count: totalRecords, error: countError } = await supabase
    .from('goal_implementation_links')
    .select('*', { count: 'exact', head: true })
    .eq('aggregated_fields', '{}')
    .not('solution_fields', 'is', null)
  
  if (countError) {
    console.error(chalk.red('❌ Error counting records:'), countError)
    process.exit(1)
  }
  console.log(chalk.yellow(`🎯 Found ${totalRecords} records with empty aggregated_fields`))
  
  if (totalRecords === 0) {
    console.log(chalk.green('✅ No records need repair!'))
    return
  }
  
  // Step 2: Process ALL records using continuous batching
  const BATCH_SIZE = 250 // Smaller batches to avoid timeouts
  let processedCount = 0
  let successCount = 0
  let errorCount = 0
  let batchNum = 0
  
  console.log(chalk.gray(`🔄 Processing ${totalRecords} records in batches of ${BATCH_SIZE}...`))
  console.log(chalk.yellow('⚠️  Using continuous batching to handle ALL records'))
  console.log('')
  
  // Continue processing until no more empty records are found
  while (true) {
    batchNum++
    console.log(chalk.blue(`📦 Processing batch ${batchNum} (up to ${BATCH_SIZE} records)`))
    
    // Fetch next batch of records with empty aggregated_fields
    const { data: records, error: fetchError } = await supabase
      .from('goal_implementation_links')
      .select('id, solution_fields')
      .eq('aggregated_fields', '{}')
      .not('solution_fields', 'is', null)
      .limit(BATCH_SIZE)
    
    if (fetchError) {
      console.error(chalk.red(`❌ Error fetching batch ${batchNum}: ${fetchError.message}`))
      errorCount += BATCH_SIZE
      continue
    }
    
    if (!records || records.length === 0) {
      console.log(chalk.green(`   ✅ No more empty records found! All batches complete.`))
      break
    }
    
    console.log(chalk.gray(`   Found ${records.length} records to process in this batch`))
    
    // Process each record in the batch
    for (const record of records) {
      try {
        const solutionFields = record.solution_fields as Record<string, any>
        if (!solutionFields || Object.keys(solutionFields).length === 0) {
          continue
        }
        
        // Transform solution_fields to aggregated_fields format
        const aggregatedFields = transformToAggregatedFields(solutionFields)
        
        // Update the record
        const { error: updateError } = await supabase
          .from('goal_implementation_links')
          .update({ aggregated_fields: aggregatedFields })
          .eq('id', record.id)
        
        if (updateError) {
          console.error(chalk.red(`❌ Error updating record ${record.id}: ${updateError.message}`))
          errorCount++
        } else {
          successCount++
        }
        
        processedCount++
        
      } catch (error: any) {
        console.error(chalk.red(`❌ Error processing record ${record.id}: ${error.message}`))
        errorCount++
      }
    }
    
    // Progress indicator for each batch
    const progress = totalRecords > 0 ? Math.round((successCount / totalRecords) * 100) : 0
    console.log(chalk.green(`   ✅ Batch ${batchNum} complete. Repaired: ${successCount}, Errors: ${errorCount}`))
    console.log(chalk.blue(`   📊 Estimated progress: ~${progress}% (${successCount} successful repairs)`))
    console.log('')
  }
  
  // Step 3: Final verification
  console.log(chalk.gray('🔍 Verifying comprehensive repair results...'))
  
  const { data: verifyData, error: verifyError } = await supabase
    .from('goal_implementation_links')
    .select('id', { count: 'exact' })
    .eq('aggregated_fields', '{}')
    .not('solution_fields', 'is', null)
  
  const remainingEmpty = verifyData?.length || 0
  
  // Final summary
  console.log(chalk.cyan('🎯 COMPREHENSIVE Repair Summary:'))
  console.log(chalk.cyan('================================'))
  console.log(chalk.green(`✅ Successfully repaired: ${successCount} records`))
  console.log(chalk.red(`❌ Errors: ${errorCount} records`))
  console.log(chalk.yellow(`📊 Total processed: ${processedCount} records`))
  console.log(chalk.blue(`🔍 Remaining empty: ${remainingEmpty} records`))
  console.log('')
  
  if (remainingEmpty === 0) {
    console.log(chalk.green('🎉 MISSION ACCOMPLISHED!'))
    console.log(chalk.green('✨ ALL aggregated_fields have been successfully repaired!'))
    console.log(chalk.green('🚀 The platform should now display all solution data correctly.'))
    console.log(chalk.green('💡 No more blank solution cards!'))
  } else if (remainingEmpty < 50) {
    console.log(chalk.yellow(`⚠️  Only ${remainingEmpty} records still need attention - excellent progress!`))
    console.log(chalk.blue('💡 Remaining records may be edge cases or newly created during repair.'))
  } else {
    console.log(chalk.red(`⚠️  ${remainingEmpty} records still need attention.`))
    console.log(chalk.blue('💡 Consider running the script again or investigating specific issues.'))
  }
  
  console.log('')
  console.log(chalk.cyan('🔄 Ready for Phase 3: Testing the fix with new AI generation!'))
}

// Run the comprehensive repair
comprehensiveRepair().catch(error => {
  console.error(chalk.red('💥 Fatal error:'), error)
  process.exit(1)
})