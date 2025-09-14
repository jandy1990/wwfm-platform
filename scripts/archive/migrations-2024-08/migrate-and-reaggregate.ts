#!/usr/bin/env node

/**
 * Migration Script: Re-aggregate all existing data
 * 
 * This script:
 * 1. Migrates dose_amount → dosage_amount field names
 * 2. Re-aggregates all data with new field aggregations
 * 3. Updates all goal_implementation_links
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey!)

// Import our aggregator types
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

async function migrateFieldNames() {
  console.log('🔄 Step 1: Migrating field names (dose_amount → dosage_amount)...')
  
  // Fetch all ratings with dose_amount or dose_unit fields
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('id, solution_fields')
    .not('solution_fields', 'is', null)
  
  if (error) {
    console.error('Error fetching ratings:', error)
    return
  }
  
  let migratedCount = 0
  
  for (const rating of ratings || []) {
    const fields = rating.solution_fields as Record<string, any>
    
    if (fields && (fields.dose_amount !== undefined || fields.dose_unit !== undefined)) {
      // Create new fields object with migrated names
      const updatedFields = { ...fields }
      
      if (fields.dose_amount !== undefined) {
        updatedFields.dosage_amount = fields.dose_amount
        delete updatedFields.dose_amount
      }
      
      if (fields.dose_unit !== undefined) {
        updatedFields.dosage_unit = fields.dose_unit
        delete updatedFields.dose_unit
      }
      
      // Update the rating
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ solution_fields: updatedFields })
        .eq('id', rating.id)
      
      if (updateError) {
        console.error(`Error updating rating ${rating.id}:`, updateError)
      } else {
        migratedCount++
      }
    }
  }
  
  console.log(`✅ Migrated ${migratedCount} ratings with dose_amount/dose_unit fields`)
}

function aggregateValueField(ratings: any[], fieldName: string): DistributionData | undefined {
  const valueCounts: Record<string, number> = {}
  let ratingsWithField = 0
  
  for (const rating of ratings) {
    const fields = rating.solution_fields as Record<string, any>
    if (fields && fields[fieldName] && fields[fieldName] !== '') {
      ratingsWithField++
      const value = String(fields[fieldName])
      valueCounts[value] = (valueCounts[value] || 0) + 1
    }
  }
  
  if (Object.keys(valueCounts).length === 0) return undefined
  
  const values: DistributionValue[] = Object.entries(valueCounts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / ratingsWithField) * 100)
    }))
    .sort((a, b) => b.count - a.count)
  
  const mode = values[0].value
  
  return {
    mode,
    values,
    totalReports: ratingsWithField
  }
}

function aggregateArrayField(ratings: any[], fieldName: string): DistributionData | undefined {
  const valueCounts: Record<string, number> = {}
  let ratingsWithField = 0
  
  for (const rating of ratings) {
    const fields = rating.solution_fields as Record<string, any>
    if (fields && fields[fieldName] && Array.isArray(fields[fieldName])) {
      ratingsWithField++
      for (const value of fields[fieldName]) {
        valueCounts[value] = (valueCounts[value] || 0) + 1
      }
    }
  }
  
  if (Object.keys(valueCounts).length === 0) return undefined
  
  const values: DistributionValue[] = Object.entries(valueCounts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / ratingsWithField) * 100)
    }))
    .sort((a, b) => b.count - a.count)
  
  const mode = values[0].value
  
  return {
    mode,
    values,
    totalReports: ratingsWithField
  }
}

function aggregateBooleanField(ratings: any[], fieldName: string): DistributionData | undefined {
  const valueCounts: Record<string, number> = { 'true': 0, 'false': 0 }
  let ratingsWithField = 0
  
  for (const rating of ratings) {
    const fields = rating.solution_fields as Record<string, any>
    if (fields && fieldName in fields && fields[fieldName] !== null && fields[fieldName] !== undefined) {
      ratingsWithField++
      const value = String(fields[fieldName])
      valueCounts[value] = (valueCounts[value] || 0) + 1
    }
  }
  
  if (ratingsWithField === 0) return undefined
  
  const values: DistributionValue[] = Object.entries(valueCounts)
    .filter(([_, count]) => count > 0)
    .map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / ratingsWithField) * 100)
    }))
    .sort((a, b) => b.count - a.count)
  
  const mode = values[0]?.value || 'false'
  
  return {
    mode,
    values,
    totalReports: ratingsWithField
  }
}

async function reaggregateAllData() {
  console.log('🔄 Step 2: Re-aggregating all data with new field aggregations...')
  
  // Fetch all goal_implementation_links
  const { data: links, error } = await supabase
    .from('goal_implementation_links')
    .select('id, goal_id, implementation_id')
  
  if (error) {
    console.error('Error fetching links:', error)
    return
  }
  
  console.log(`Found ${links?.length || 0} goal-implementation links to process`)
  
  let processedCount = 0
  let errorCount = 0
  
  for (const link of links || []) {
    // Fetch all ratings for this goal-implementation combo
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('solution_fields')
      .eq('goal_id', link.goal_id)
      .eq('implementation_id', link.implementation_id)
    
    if (ratingsError) {
      console.error(`Error fetching ratings for link ${link.id}:`, ratingsError)
      errorCount++
      continue
    }
    
    if (!ratings || ratings.length === 0) {
      // No ratings, skip
      continue
    }
    
    // Compute aggregated fields
    const aggregated: any = {}
    
    // Add metadata
    const userRatings = ratings.length
    aggregated._metadata = {
      computed_at: new Date().toISOString(),
      total_ratings: userRatings,
      data_source: 'user',
      confidence: userRatings >= 10 ? 'high' : userRatings >= 3 ? 'medium' : 'low'
    }
    
    // Aggregate all fields (comprehensive list from Phase 1)
    
    // Array fields
    aggregated.side_effects = aggregateArrayField(ratings, 'side_effects')
    aggregated.challenges = aggregateArrayField(ratings, 'challenges')
    aggregated.availability = aggregateArrayField(ratings, 'availability')
    aggregated.minimum_requirements = aggregateArrayField(ratings, 'minimum_requirements')
    
    // Boolean fields
    aggregated.still_following = aggregateBooleanField(ratings, 'still_following')
    
    // Value fields - Cost
    aggregated.cost = aggregateValueField(ratings, 'cost')
    aggregated.startup_cost = aggregateValueField(ratings, 'startup_cost')
    aggregated.ongoing_cost = aggregateValueField(ratings, 'ongoing_cost')
    aggregated.cost_impact = aggregateValueField(ratings, 'cost_impact')
    aggregated.cost_range = aggregateValueField(ratings, 'cost_range')
    aggregated.purchase_cost_type = aggregateValueField(ratings, 'purchase_cost_type')
    
    // Value fields - Time/Duration
    aggregated.time_to_results = aggregateValueField(ratings, 'time_to_results')
    aggregated.length_of_use = aggregateValueField(ratings, 'length_of_use')
    aggregated.practice_length = aggregateValueField(ratings, 'practice_length')
    aggregated.session_length = aggregateValueField(ratings, 'session_length')
    aggregated.time_commitment = aggregateValueField(ratings, 'time_commitment')
    aggregated.wait_time = aggregateValueField(ratings, 'wait_time')
    aggregated.duration = aggregateValueField(ratings, 'duration')
    aggregated.typical_length = aggregateValueField(ratings, 'typical_length')
    aggregated.access_time = aggregateValueField(ratings, 'access_time')
    
    // Value fields - Frequency
    aggregated.frequency = aggregateValueField(ratings, 'frequency')
    aggregated.session_frequency = aggregateValueField(ratings, 'session_frequency')
    aggregated.skincare_frequency = aggregateValueField(ratings, 'skincare_frequency')
    aggregated.meeting_frequency = aggregateValueField(ratings, 'meeting_frequency')
    aggregated.usage_frequency = aggregateValueField(ratings, 'usage_frequency')
    
    // Value fields - Dosage (new naming)
    aggregated.dosage_amount = aggregateValueField(ratings, 'dosage_amount')
    aggregated.dosage_unit = aggregateValueField(ratings, 'dosage_unit')
    
    // Value fields - Categories/Types
    aggregated.format = aggregateValueField(ratings, 'format')
    aggregated.brand = aggregateValueField(ratings, 'brand')
    aggregated.subscription_type = aggregateValueField(ratings, 'subscription_type')
    aggregated.product_type = aggregateValueField(ratings, 'product_type')
    aggregated.commitment_type = aggregateValueField(ratings, 'commitment_type')
    aggregated.payment_frequency = aggregateValueField(ratings, 'payment_frequency')
    
    // Value fields - Descriptive
    aggregated.insurance_coverage = aggregateValueField(ratings, 'insurance_coverage')
    aggregated.platform = aggregateValueField(ratings, 'platform')
    aggregated.location = aggregateValueField(ratings, 'location')
    aggregated.best_time = aggregateValueField(ratings, 'best_time')
    aggregated.ease_of_use = aggregateValueField(ratings, 'ease_of_use')
    aggregated.learning_difficulty = aggregateValueField(ratings, 'learning_difficulty')
    aggregated.completion_status = aggregateValueField(ratings, 'completion_status')
    aggregated.group_size = aggregateValueField(ratings, 'group_size')
    aggregated.accessibility_level = aggregateValueField(ratings, 'accessibility_level')
    aggregated.leadership_style = aggregateValueField(ratings, 'leadership_style')
    aggregated.financial_benefit = aggregateValueField(ratings, 'financial_benefit')
    aggregated.provider = aggregateValueField(ratings, 'provider')
    aggregated.specialty = aggregateValueField(ratings, 'specialty')
    aggregated.response_time = aggregateValueField(ratings, 'response_time')
    aggregated.completed_treatment = aggregateValueField(ratings, 'completed_treatment')
    aggregated.notes = aggregateValueField(ratings, 'notes')
    
    // Value fields - Lifestyle specific
    aggregated.weekly_prep_time = aggregateValueField(ratings, 'weekly_prep_time')
    aggregated.previous_sleep_hours = aggregateValueField(ratings, 'previous_sleep_hours')
    aggregated.sustainability_reason = aggregateValueField(ratings, 'sustainability_reason')
    aggregated.social_impact = aggregateValueField(ratings, 'social_impact')
    aggregated.sleep_quality_change = aggregateValueField(ratings, 'sleep_quality_change')
    aggregated.specific_approach = aggregateValueField(ratings, 'specific_approach')
    
    // Update the link with aggregated data
    const { error: updateError } = await supabase
      .from('goal_implementation_links')
      .update({ aggregated_fields: aggregated })
      .eq('id', link.id)
    
    if (updateError) {
      console.error(`Error updating link ${link.id}:`, updateError)
      errorCount++
    } else {
      processedCount++
      if (processedCount % 10 === 0) {
        console.log(`  Processed ${processedCount} links...`)
      }
    }
  }
  
  console.log(`✅ Re-aggregated ${processedCount} links successfully`)
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} links had errors`)
  }
}

async function main() {
  console.log('🚀 Starting data migration and re-aggregation...')
  console.log('================================================')
  
  try {
    // Step 1: Migrate field names
    await migrateFieldNames()
    
    // Step 2: Re-aggregate all data
    await reaggregateAllData()
    
    console.log('================================================')
    console.log('✅ Migration and re-aggregation complete!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Test the UI to verify fields are displaying')
    console.log('2. Check that dosage information now appears correctly')
    console.log('3. Verify all forms show complete data')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
main()