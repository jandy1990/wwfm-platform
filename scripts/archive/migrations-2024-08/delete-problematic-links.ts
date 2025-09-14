#!/usr/bin/env node

/**
 * Delete Problematic Links Script
 * 
 * Safely deletes all 130 problematic links (66 empty + 64 template-injected)
 * that were mapped in the previous step. This clears the way for proper
 * regeneration with goal-specific field variations.
 * 
 * SAFETY: Only deletes links that are in our mapping files to ensure
 * we don't accidentally delete good records.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MappedLink {
  linkId: string
  goalId: string
  goalTitle: string
  solutionTitle: string
  solutionCategory: string
  variantId: string
  variantName: string
  effectiveness: number
  dataSource: 'empty' | 'template_injected'
  createdAt: string
}

async function deleteProblematicLinks() {
  console.log(chalk.cyan('🗑️  WWFM Problematic Links Deletion Script'))
  console.log(chalk.gray('=' .repeat(50)))
  
  // Load the mapping to know exactly which links to delete
  const mappingFile = path.join(__dirname, 'empty-links-mapping.json')
  
  if (!fs.existsSync(mappingFile)) {
    console.error(chalk.red('❌ Mapping file not found. Run map-empty-links.ts first!'))
    process.exit(1)
  }
  
  const mappings: MappedLink[] = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))
  
  console.log(chalk.yellow(`📋 Loaded mapping for ${mappings.length} problematic links`))
  
  // Separate by type for reporting
  const emptyLinks = mappings.filter(m => m.dataSource === 'empty')
  const templateLinks = mappings.filter(m => m.dataSource === 'template_injected')
  
  console.log(chalk.red(`   📭 Empty links to delete: ${emptyLinks.length}`))
  console.log(chalk.yellow(`   🍪 Template-injected links to delete: ${templateLinks.length}`))
  
  // Safety verification - double check these are the problematic ones
  console.log(chalk.cyan('\n🔍 Safety verification...'))
  
  let verifiedCount = 0
  let safetyErrors = 0
  
  for (const mapping of mappings) {
    // Verify this link actually exists and has the expected problem
    const { data: link, error } = await supabase
      .from('goal_implementation_links')
      .select('id, solution_fields, aggregated_fields')
      .eq('id', mapping.linkId)
      .single()
    
    if (error) {
      console.log(chalk.red(`   ❌ Link ${mapping.linkId} not found: ${error.message}`))
      safetyErrors++
      continue
    }
    
    const isEmpty = JSON.stringify(link.solution_fields) === '{}' && 
                   JSON.stringify(link.aggregated_fields) === '{}'
    
    const isTemplate = link.aggregated_fields && 
                      link.aggregated_fields._metadata?.data_source === 'template_injected'
    
    if ((mapping.dataSource === 'empty' && isEmpty) || 
        (mapping.dataSource === 'template_injected' && isTemplate)) {
      verifiedCount++
    } else {
      console.log(chalk.red(`   ❌ Link ${mapping.linkId} doesn't match expected type: ${mapping.dataSource}`))
      safetyErrors++
    }
  }
  
  console.log(chalk.green(`   ✅ Verified ${verifiedCount} links match expected problems`))
  
  if (safetyErrors > 0) {
    console.error(chalk.red(`❌ Safety verification failed! ${safetyErrors} links don't match expectations.`))
    console.error(chalk.red('Aborting deletion to prevent data loss.'))
    process.exit(1)
  }
  
  if (verifiedCount !== mappings.length) {
    console.error(chalk.red(`❌ Verification mismatch! Expected ${mappings.length}, verified ${verifiedCount}`))
    process.exit(1)
  }
  
  console.log(chalk.green('✅ All links verified safe for deletion'))
  
  // Proceed with deletion
  console.log(chalk.cyan('\n🗑️  Beginning deletion process...'))
  
  let deletedCount = 0
  let deleteErrors = 0
  
  // Delete in batches for better performance
  const batchSize = 50
  const linkIds = mappings.map(m => m.linkId)
  
  for (let i = 0; i < linkIds.length; i += batchSize) {
    const batch = linkIds.slice(i, i + batchSize)
    
    console.log(chalk.gray(`   🗑️  Deleting batch ${Math.floor(i / batchSize) + 1} (${batch.length} links)...`))
    
    const { error: batchError } = await supabase
      .from('goal_implementation_links')
      .delete()
      .in('id', batch)
    
    if (batchError) {
      console.error(chalk.red(`   ❌ Batch deletion error: ${batchError.message}`))
      deleteErrors += batch.length
    } else {
      deletedCount += batch.length
      console.log(chalk.green(`   ✅ Deleted ${batch.length} links in this batch`))
    }
  }
  
  // Final verification - check that all mapped links are gone
  console.log(chalk.cyan('\n🔍 Verifying deletion...'))
  
  const { data: remainingLinks, error: checkError } = await supabase
    .from('goal_implementation_links')
    .select('id')
    .in('id', linkIds)
  
  if (checkError) {
    console.log(chalk.yellow(`⚠️  Could not verify deletion: ${checkError.message}`))
  } else {
    const remainingCount = remainingLinks?.length || 0
    if (remainingCount === 0) {
      console.log(chalk.green('   ✅ All mapped links successfully deleted'))
    } else {
      console.log(chalk.red(`   ❌ ${remainingCount} links still exist after deletion`))
    }
  }
  
  // Create deletion log
  const deletionLog = {
    deletedAt: new Date().toISOString(),
    totalMapped: mappings.length,
    successfullyDeleted: deletedCount,
    errors: deleteErrors,
    emptyLinksDeleted: emptyLinks.length,
    templateLinksDeleted: templateLinks.length,
    purpose: 'Clear problematic links before regeneration',
    nextStep: 'Run AI generator on affected goals to restore proper links'
  }
  
  const logFile = path.join(__dirname, 'deletion-log.json')
  fs.writeFileSync(logFile, JSON.stringify(deletionLog, null, 2))
  
  // Summary
  console.log(chalk.green('\n📊 Deletion Summary:'))
  console.log(chalk.green(`   ✅ Successfully deleted: ${deletedCount} links`))
  if (deleteErrors > 0) {
    console.log(chalk.red(`   ❌ Deletion errors: ${deleteErrors} links`))
  }
  console.log(chalk.red(`   📭 Empty links removed: ${emptyLinks.length}`))
  console.log(chalk.yellow(`   🍪 Template links removed: ${templateLinks.length}`))
  
  console.log(chalk.cyan(`\n📁 Deletion log saved: ${logFile}`))
  
  console.log(chalk.cyan('\n🎉 Cleanup complete! Ready for regeneration phase'))
  console.log(chalk.gray('   💡 Next steps:'))
  console.log(chalk.gray('     1. Run AI generator on each of the 72 affected goals'))
  console.log(chalk.gray('     2. Verify all 130 relationships are restored'))
  console.log(chalk.gray('     3. Check for proper goal-specific field variations'))
  
  if (deletedCount === mappings.length && deleteErrors === 0) {
    console.log(chalk.green('\n✨ Perfect cleanup - ready to proceed with regeneration!'))
  } else {
    console.log(chalk.yellow('\n⚠️  Some issues during cleanup - review logs before regeneration'))
  }
}

deleteProblematicLinks().catch(console.error)