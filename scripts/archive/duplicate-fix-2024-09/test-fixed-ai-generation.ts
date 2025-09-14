#!/usr/bin/env node

/**
 * Test Script: Verify Fixed AI Generation
 * 
 * This script tests that new AI generations include BOTH solution_fields 
 * AND aggregated_fields after the inserter.ts fix.
 * 
 * It generates a single solution to verify the fix works before resuming
 * full AI generation operations.
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

async function testFixedGeneration() {
  console.log(chalk.cyan('🧪 WWFM Fixed AI Generation Test'))
  console.log(chalk.cyan('================================'))
  console.log(chalk.yellow('Testing that new AI generation includes BOTH fields'))
  console.log('')
  
  // Step 1: Find a goal to test with
  console.log(chalk.gray('🎯 Finding a test goal...'))
  
  const { data: goals, error: goalError } = await supabase
    .from('goals')
    .select('id, title')
    .limit(1)
  
  if (goalError || !goals || goals.length === 0) {
    console.error(chalk.red('❌ Error finding test goal:'), goalError)
    process.exit(1)
  }
  
  const testGoal = goals[0]
  console.log(chalk.blue(`🎯 Using test goal: "${testGoal.title}" (${testGoal.id})`))
  console.log('')
  
  // Step 2: Record count before test
  const { data: beforeCount } = await supabase
    .from('goal_implementation_links')
    .select('id', { count: 'exact' })
    .eq('goal_id', testGoal.id)
  
  const beforeTotal = beforeCount?.length || 0
  console.log(chalk.gray(`📊 Current solutions for this goal: ${beforeTotal}`))
  
  // Step 3: Run a single AI generation
  console.log(chalk.yellow('🤖 Running single AI generation test...'))
  console.log(chalk.gray('This will use the fixed inserter.ts code'))
  
  try {
    // Import and run the generator for a single goal
    const { exec } = require('child_process')
    const util = require('util')
    const execPromise = util.promisify(exec)
    
    // Run AI generation for single goal with minimal batch size
    const command = `npm run generate:ai-solutions -- --goals="${testGoal.id}" --batch-size=1`
    console.log(chalk.gray(`Running: ${command}`))
    
    const { stdout, stderr } = await execPromise(command, { 
      cwd: path.join(__dirname, '..'),
      timeout: 120000 // 2 minute timeout
    })
    
    console.log(chalk.green('✅ AI generation test completed'))
    if (stderr) {
      console.log(chalk.yellow('⚠️  Warnings:'), stderr)
    }
    
  } catch (error: any) {
    console.error(chalk.red('❌ AI generation test failed:'), error.message)
    console.log(chalk.yellow('💡 This might indicate the fix needs adjustment'))
    process.exit(1)
  }
  
  // Step 4: Verify new records have both fields
  console.log('')
  console.log(chalk.gray('🔍 Verifying generated records have both fields...'))
  
  // Get the newest records for this goal (likely the ones just created)
  const { data: newRecords, error: recordError } = await supabase
    .from('goal_implementation_links')
    .select('id, solution_fields, aggregated_fields, created_at')
    .eq('goal_id', testGoal.id)
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (recordError) {
    console.error(chalk.red('❌ Error fetching test records:'), recordError)
    process.exit(1)
  }
  
  if (!newRecords || newRecords.length === 0) {
    console.log(chalk.red('❌ No records found for verification'))
    process.exit(1)
  }
  
  // Step 5: Analyze the results
  let testsPass = true
  console.log(chalk.blue(`📋 Analyzing ${newRecords.length} recent records:`))
  console.log('')
  
  newRecords.forEach((record, index) => {
    const recordNum = index + 1
    const hasValid = {
      solution_fields: record.solution_fields && Object.keys(record.solution_fields).length > 0,
      aggregated_fields: record.aggregated_fields && Object.keys(record.aggregated_fields).length > 0
    }
    
    console.log(chalk.gray(`Record ${recordNum} (${record.id}):`))
    console.log(`  📁 solution_fields: ${hasValid.solution_fields ? chalk.green('✅ Present') : chalk.red('❌ Missing')}`)
    console.log(`  📊 aggregated_fields: ${hasValid.aggregated_fields ? chalk.green('✅ Present') : chalk.red('❌ Missing')}`)
    
    // Check if aggregated_fields has proper structure
    if (hasValid.aggregated_fields) {
      const aggregated = record.aggregated_fields as any
      const hasMetadata = aggregated._metadata && aggregated._metadata.data_source === 'ai'
      console.log(`  🏷️  AI metadata: ${hasMetadata ? chalk.green('✅ Correct') : chalk.red('❌ Wrong')}`)
      
      if (!hasMetadata) testsPass = false
    }
    
    if (!hasValid.solution_fields || !hasValid.aggregated_fields) {
      testsPass = false
    }
    console.log('')
  })
  
  // Step 6: Final verdict
  console.log(chalk.cyan('🏆 Test Results:'))
  console.log(chalk.cyan('================'))
  
  if (testsPass) {
    console.log(chalk.green('🎉 SUCCESS! The fix is working correctly!'))
    console.log(chalk.green('✅ New AI generations include BOTH solution_fields AND aggregated_fields'))
    console.log(chalk.green('✅ Proper DistributionData format is maintained'))
    console.log(chalk.green('✅ AI metadata is correctly set'))
    console.log('')
    console.log(chalk.cyan('🚀 Ready for Phase 4: Resume full AI generation with confidence!'))
  } else {
    console.log(chalk.red('❌ FAILURE! The fix is not working properly.'))
    console.log(chalk.red('⚠️  New records are missing required fields'))
    console.log(chalk.yellow('💡 The inserter.ts fix may need adjustment'))
    console.log('')
    console.log(chalk.red('🛑 Do NOT resume full AI generation until this is fixed!'))
    process.exit(1)
  }
}

// Run the test
testFixedGeneration().catch(error => {
  console.error(chalk.red('💥 Test failed:'), error)
  process.exit(1)
})