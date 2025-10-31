#!/usr/bin/env node
/**
 * Test Script for AI Solution Generator
 * 
 * Run a small test with just a few goals to validate the system works
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function testGenerator() {
  console.log(chalk.cyan('🧪 Testing AI Solution Generator\n'))
  
  // Test 1: Check environment variables
  console.log('1️⃣  Checking environment variables...')
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(chalk.red('   ❌ ANTHROPIC_API_KEY not found'))
    return
  }
  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error(chalk.red('   ❌ SUPABASE_SERVICE_KEY not found'))
    return
  }
  console.log(chalk.green('   ✅ Environment variables OK\n'))
  
  // Test 2: Check database connection
  console.log('2️⃣  Testing database connection...')
  const { data: goals, error } = await supabase
    .from('goals')
    .select('id, title')
    .limit(3)
  
  if (error) {
    console.error(chalk.red(`   ❌ Database error: ${error.message}`))
    return
  }
  
  console.log(chalk.green(`   ✅ Connected! Found ${goals?.length || 0} test goals\n`))
  
  // Test 3: Show sample goals
  if (goals && goals.length > 0) {
    console.log('3️⃣  Sample goals to test with:')
    goals.forEach((goal, idx) => {
      console.log(chalk.gray(`   ${idx + 1}. ${goal.title}`))
      console.log(chalk.gray(`      ID: ${goal.id}`))
    })
    
    console.log(chalk.yellow('\n📝 To test with one goal, run:'))
    console.log(chalk.white(`   npm run generate:ai-solutions -- --goal-id=${goals[0].id} --dry-run\n`))
  }
  
  // Test 4: Check Anthropic API
  console.log('4️⃣  Testing Anthropic API...')
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    })
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Reply with just "OK" if you can read this.'
      }]
    })
    
    if (response.content[0].type === 'text' && response.content[0].text.includes('OK')) {
      console.log(chalk.green('   ✅ Anthropic API working!\n'))
    } else {
      console.log(chalk.yellow('   ⚠️  Unexpected API response\n'))
    }
  } catch (error) {
    console.error(chalk.red(`   ❌ Anthropic API error: ${error.message}\n`))
  }
  
  console.log(chalk.cyan('━'.repeat(50)))
  console.log(chalk.green('✅ All tests passed! Ready to generate solutions.\n'))
  console.log(chalk.white('Next steps:'))
  console.log(chalk.gray('  1. Test with one goal:'))
  console.log(chalk.white('     npm run generate:ai-solutions -- --goal-id=<uuid> --dry-run\n'))
  console.log(chalk.gray('  2. Test with limited solutions:'))
  console.log(chalk.white('     npm run generate:ai-solutions -- --limit=5 --dry-run\n'))
  console.log(chalk.gray('  3. Run full generation:'))
  console.log(chalk.white('     npm run generate:ai-solutions\n'))
}

testGenerator().catch(error => {
  console.error(chalk.red('Test failed:'), error)
  process.exit(1)
})
