#!/usr/bin/env node

/**
 * Repair Script: Fix Missing Aggregated Fields
 * 
 * This script transforms solution_fields into the aggregated_fields format
 * that the UI expects for 3,911 goal_implementation_links with empty aggregated_fields.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

async function repairAggregatedFields() {
  console.log(chalk.cyan('🔧 WWFM Aggregated Fields Repair Script'))
  console.log(chalk.cyan('====================================='))
  
  // Step 1: Count records that need repair
  console.log(chalk.gray('📊 Analyzing records that need repair...'))
  
  const { data: countData, error: countError } = await supabase
    .from('goal_implementation_links')
    .select('id', { count: 'exact' })
    .eq('aggregated_fields', '{}')
    .not('solution_fields', 'is', null)
  
  if (countError) {
    console.error(chalk.red('❌ Error counting records:'), countError)
    process.exit(1)
  }
  
  const totalRecords = countData?.length || 0
  console.log(chalk.yellow(`⚠️  Found ${totalRecords} records with empty aggregated_fields`))
  
  if (totalRecords === 0) {
    console.log(chalk.green('✅ No records need repair!'))
    return
  }
  
  // Step 2: Process records in batches
  const BATCH_SIZE = 100
  let processedCount = 0
  let successCount = 0
  let errorCount = 0
  
  console.log(chalk.gray(`🔄 Processing ${totalRecords} records in batches of ${BATCH_SIZE}...`))
  
  for (let offset = 0; offset < totalRecords; offset += BATCH_SIZE) {
    const batchEnd = Math.min(offset + BATCH_SIZE, totalRecords)
    console.log(chalk.gray(`   Processing batch ${Math.floor(offset/BATCH_SIZE) + 1}/${Math.ceil(totalRecords/BATCH_SIZE)} (records ${offset + 1}-${batchEnd})`))
    
    // Fetch batch of records
    const { data: records, error: fetchError } = await supabase
      .from('goal_implementation_links')
      .select('id, solution_fields')
      .eq('aggregated_fields', '{}')
      .not('solution_fields', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1)
    
    if (fetchError) {
      console.error(chalk.red(`❌ Error fetching batch: ${fetchError.message}`))
      errorCount += BATCH_SIZE
      continue
    }
    
    if (!records || records.length === 0) {
      break
    }
    
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
        
        // Progress indicator
        if (processedCount % 50 === 0) {
          const progress = Math.round((processedCount / totalRecords) * 100)
          console.log(chalk.blue(`   Progress: ${processedCount}/${totalRecords} (${progress}%)`))
        }
        
      } catch (error: any) {
        console.error(chalk.red(`❌ Error processing record ${record.id}: ${error.message}`))
        errorCount++
      }
    }
  }
  
  // Step 3: Final verification
  console.log(chalk.gray('\n🔍 Verifying repair results...'))
  
  const { data: verifyData, error: verifyError } = await supabase
    .from('goal_implementation_links')
    .select('id', { count: 'exact' })
    .eq('aggregated_fields', '{}')
    .not('solution_fields', 'is', null)
  
  const remainingEmpty = verifyData?.length || 0
  
  // Final summary
  console.log(chalk.cyan('\n📋 Repair Summary:'))
  console.log(chalk.cyan('=================='))
  console.log(chalk.green(`✅ Successfully repaired: ${successCount} records`))
  console.log(chalk.red(`❌ Errors: ${errorCount} records`))
  console.log(chalk.yellow(`📊 Total processed: ${processedCount} records`))
  console.log(chalk.blue(`🔍 Remaining empty: ${remainingEmpty} records`))
  
  if (remainingEmpty === 0) {
    console.log(chalk.green('\n🎉 All aggregated_fields have been successfully repaired!'))
    console.log(chalk.green('✨ The platform should now display all solution data correctly.'))
  } else {
    console.log(chalk.yellow(`\n⚠️  ${remainingEmpty} records still need attention.`))
  }
}

// Run the repair
repairAggregatedFields().catch(error => {
  console.error(chalk.red('💥 Fatal error:'), error)
  process.exit(1)
})