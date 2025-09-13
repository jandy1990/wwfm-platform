#!/usr/bin/env node

/**
 * Map Empty Links Script
 * 
 * Creates a comprehensive mapping of all 130 affected goal-solution relationships
 * that have empty fields, so we can restore them properly after deletion.
 * 
 * This preserves the exact goal-solution pairs discovered by the AI generator
 * before we delete and regenerate them with proper field variations.
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

interface EmptyLinkMapping {
  linkId: string
  goalId: string
  goalTitle: string
  goalDescription?: string
  goalArenaName?: string
  goalCategoryName?: string
  solutionTitle: string
  solutionCategory: string
  variantId: string
  variantName: string
  effectiveness: number
  dataSource: 'empty' | 'template_injected'
  createdAt: string
}

async function mapEmptyLinks() {
  console.log(chalk.cyan('📋 WWFM Empty Links Mapping Script'))
  console.log(chalk.gray('=' .repeat(50)))
  
  // Get all links with empty solution_fields AND aggregated_fields using raw SQL
  const { data: emptyLinksRaw, error: emptyError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      implementation_id,
      avg_effectiveness,
      created_at,
      solution_fields,
      aggregated_fields
    `)
    .eq('solution_fields', '{}')
    .eq('aggregated_fields', '{}')
  
  if (emptyError) {
    console.error(chalk.red('❌ Error fetching empty links:'), emptyError)
    return
  }
  
  console.log(chalk.yellow(`📭 Found ${emptyLinksRaw.length} empty links to map`))
  
  // Get template-injected links with metadata check
  const { data: templateLinksRaw, error: templateError } = await supabase
    .from('goal_implementation_links')
    .select(`
      id,
      goal_id,
      implementation_id,
      avg_effectiveness,
      created_at,
      solution_fields,
      aggregated_fields
    `)
    .not('aggregated_fields', 'eq', '{}')
    .filter('aggregated_fields->_metadata->>data_source', 'eq', 'template_injected')
  
  if (templateError) {
    console.log(chalk.yellow(`⚠️  Could not fetch template-injected links: ${templateError.message}`))
    console.log(chalk.gray('   Will try alternative method...'))
  }
  
  const templateCount = templateLinksRaw?.length || 0
  if (templateCount > 0) {
    console.log(chalk.yellow(`🍪 Found ${templateCount} template-injected links to map`))
  }
  
  // Combine both types of problematic links
  const allProblematicLinksRaw = [
    ...emptyLinksRaw,
    ...(templateLinksRaw || [])
  ]
  
  console.log(chalk.cyan(`📊 Total problematic links: ${allProblematicLinksRaw.length}`))
  
  // Now get the related data for each link
  const allProblematicLinks = []
  for (const link of allProblematicLinksRaw) {
    // Get goal details
    const { data: goal } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        description,
        arena_id,
        arenas(name),
        categories(name)
      `)
      .eq('id', link.goal_id)
      .single()
    
    // Get variant and solution details
    const { data: variant } = await supabase
      .from('solution_variants')
      .select(`
        id,
        variant_name,
        solutions!inner(
          title,
          solution_category
        )
      `)
      .eq('id', link.implementation_id)
      .single()
    
    if (goal && variant) {
      allProblematicLinks.push({
        ...link,
        goals: goal,
        solution_variants: variant
      })
    }
  }
  
  console.log(chalk.cyan(`📊 Total problematic links: ${allProblematicLinks.length}`))
  
  // Create mapping array
  const mappings: EmptyLinkMapping[] = []
  const goalSolutionPairs = new Set<string>()
  const uniqueGoals = new Set<string>()
  const solutionCounts = new Map<string, number>()
  
  for (const link of allProblematicLinks) {
    const isTemplateInjected = link.aggregated_fields && 
      link.aggregated_fields._metadata?.data_source === 'template_injected'
    
    const mapping: EmptyLinkMapping = {
      linkId: link.id,
      goalId: link.goal_id,
      goalTitle: link.goals.title,
      goalDescription: link.goals.description,
      goalArenaName: link.goals.arenas?.name,
      goalCategoryName: link.goals.categories?.name,
      solutionTitle: link.solution_variants.solutions.title,
      solutionCategory: link.solution_variants.solutions.solution_category,
      variantId: link.implementation_id,
      variantName: link.solution_variants.variant_name,
      effectiveness: link.avg_effectiveness,
      dataSource: isTemplateInjected ? 'template_injected' : 'empty',
      createdAt: link.created_at
    }
    
    mappings.push(mapping)
    
    // Track unique pairs and counts
    const pairKey = `${link.goal_id}:${link.solution_variants.solutions.title}`
    goalSolutionPairs.add(pairKey)
    uniqueGoals.add(link.goal_id)
    
    const solutionTitle = link.solution_variants.solutions.title
    solutionCounts.set(solutionTitle, (solutionCounts.get(solutionTitle) || 0) + 1)
  }
  
  // Sort mappings by solution title for easier reading
  mappings.sort((a, b) => a.solutionTitle.localeCompare(b.solutionTitle))
  
  // Create summary statistics
  const stats = {
    totalAffectedLinks: mappings.length,
    emptyLinks: mappings.filter(m => m.dataSource === 'empty').length,
    templateInjectedLinks: mappings.filter(m => m.dataSource === 'template_injected').length,
    uniqueGoalSolutionPairs: goalSolutionPairs.size,
    uniqueGoalsAffected: uniqueGoals.size,
    mostAffectedSolutions: Array.from(solutionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    createdAt: new Date().toISOString(),
    purpose: 'Pre-deletion mapping to ensure all goal-solution relationships are restored after regeneration'
  }
  
  // Create goals list for regeneration
  const goalsToRegenerate = Array.from(uniqueGoals).map(goalId => {
    const sampleMapping = mappings.find(m => m.goalId === goalId)!
    return {
      goalId,
      goalTitle: sampleMapping.goalTitle,
      goalDescription: sampleMapping.goalDescription,
      goalArenaName: sampleMapping.goalArenaName,
      goalCategoryName: sampleMapping.goalCategoryName,
      affectedSolutions: mappings
        .filter(m => m.goalId === goalId)
        .map(m => ({
          solutionTitle: m.solutionTitle,
          solutionCategory: m.solutionCategory,
          effectiveness: m.effectiveness
        }))
    }
  })
  
  // Save mapping files
  const mappingFile = path.join(__dirname, 'empty-links-mapping.json')
  const statsFile = path.join(__dirname, 'empty-links-stats.json')
  const goalsFile = path.join(__dirname, 'goals-to-regenerate.json')
  
  try {
    fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2))
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2))
    fs.writeFileSync(goalsFile, JSON.stringify(goalsToRegenerate, null, 2))
    
    console.log(chalk.green('\n📁 Mapping files created:'))
    console.log(chalk.green(`   ✅ ${mappingFile}`))
    console.log(chalk.green(`   ✅ ${statsFile}`))
    console.log(chalk.green(`   ✅ ${goalsFile}`))
    
  } catch (error) {
    console.error(chalk.red('❌ Error writing mapping files:'), error)
    return
  }
  
  // Display summary
  console.log(chalk.cyan('\n📊 Mapping Summary:'))
  console.log(chalk.cyan(`   🔗 Total affected links: ${stats.totalAffectedLinks}`))
  console.log(chalk.red(`     📭 Empty links: ${stats.emptyLinks}`))
  console.log(chalk.yellow(`     🍪 Template-injected: ${stats.templateInjectedLinks}`))
  console.log(chalk.cyan(`   🎯 Unique goal-solution pairs: ${stats.uniqueGoalSolutionPairs}`))
  console.log(chalk.cyan(`   🎯 Unique goals affected: ${stats.uniqueGoalsAffected}`))
  
  console.log(chalk.cyan('\n🔝 Most affected solutions:'))
  stats.mostAffectedSolutions.forEach(([ solution, count ], index) => {
    console.log(chalk.gray(`   ${index + 1}. ${solution}: ${count} links`))
  })
  
  // Verify mapping integrity
  console.log(chalk.cyan('\n🔍 Verification:'))
  const linkIds = new Set(mappings.map(m => m.linkId))
  console.log(chalk.green(`   ✅ All ${mappings.length} links have unique IDs: ${linkIds.size === mappings.length}`))
  
  const allGoalIds = mappings.map(m => m.goalId)
  const allSolutionTitles = mappings.map(m => m.solutionTitle)
  console.log(chalk.green(`   ✅ Goals range: ${Math.min(...allGoalIds.map(id => parseInt(id)))} to ${Math.max(...allGoalIds.map(id => parseInt(id)))}`))
  console.log(chalk.green(`   ✅ Solution variety: ${new Set(allSolutionTitles).size} unique solutions`))
  
  console.log(chalk.cyan('\n🎉 Mapping complete! Ready for Phase 3: Cleanup and Regeneration'))
  console.log(chalk.gray('   💡 Next steps:'))
  console.log(chalk.gray('     1. Delete all mapped links'))
  console.log(chalk.gray('     2. Run AI generator on each affected goal'))
  console.log(chalk.gray('     3. Verify all relationships restored'))
}

mapEmptyLinks().catch(console.error)