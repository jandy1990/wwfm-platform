#!/usr/bin/env node

/**
 * Check Generation Progress
 * 
 * Shows current coverage and recommends next steps
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { GenerationManager } from './generation-manager'
import chalk from 'chalk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function main() {
  const manager = new GenerationManager(supabase)
  
  // Update and display progress
  const progress = await manager.updateProgress()
  manager.displayProgress(progress)
  
  // Get recommendation
  const recommendation = await manager.getRecommendation()
  console.log(chalk.cyan('\n📋 Recommendation:'))
  console.log(chalk.white(recommendation))
}

main().catch(error => {
  console.error(chalk.red('Error:'), error)
  process.exit(1)
})