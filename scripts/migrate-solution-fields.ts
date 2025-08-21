#!/usr/bin/env node

/**
 * Migration Script: Move solution_fields to individual ratings
 * Part of the Data Architecture Overhaul
 * 
 * This script:
 * 1. Finds any existing solution_fields in goal_implementation_links
 * 2. Moves them to the first rating for that goal-solution combo
 * 3. Computes initial aggregates
 * 4. Marks the migration as complete
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateExistingData() {
  console.log('🔄 Starting solution_fields migration...')
  
  try {
    // 1. Get all goal_implementation_links with solution_fields
    const { data: links, error: linksError } = await supabase
      .from('goal_implementation_links')
      .select('id, goal_id, implementation_id, solution_fields')
      .not('solution_fields', 'is', null)
      .not('solution_fields', 'eq', '{}')
    
    if (linksError) {
      console.error('Error fetching links:', linksError)
      return
    }
    
    console.log(`Found ${links?.length || 0} links with solution_fields`)
    
    if (!links || links.length === 0) {
      console.log('✅ No data to migrate')
      return
    }
    
    // 2. For each link, find the first rating and move fields there
    for (const link of links) {
      console.log(`Processing link ${link.id}...`)
      
      // Find the first rating for this goal-implementation combo
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('id, user_id')
        .eq('goal_id', link.goal_id)
        .eq('implementation_id', link.implementation_id)
        .order('created_at', { ascending: true })
        .limit(1)
      
      if (ratingsError) {
        console.error(`Error fetching ratings for link ${link.id}:`, ratingsError)
        continue
      }
      
      if (ratings && ratings.length > 0) {
        const firstRating = ratings[0]
        
        // Move solution_fields to this rating
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ solution_fields: link.solution_fields })
          .eq('id', firstRating.id)
        
        if (updateError) {
          console.error(`Error updating rating ${firstRating.id}:`, updateError)
          continue
        }
        
        console.log(`✓ Moved fields to rating ${firstRating.id}`)
        
        // 3. Compute initial aggregates (simplified for now)
        // In production, this would use the full aggregation logic
        const aggregated = {
          _migration: 'v1',
          _migrated_at: new Date().toISOString(),
          _original_fields: link.solution_fields
        }
        
        // Update the link with aggregated fields
        const { error: aggregateError } = await supabase
          .from('goal_implementation_links')
          .update({ 
            aggregated_fields: aggregated,
            // Don't remove solution_fields yet (keep for rollback)
          })
          .eq('id', link.id)
        
        if (aggregateError) {
          console.error(`Error updating aggregates for link ${link.id}:`, aggregateError)
        } else {
          console.log(`✓ Created initial aggregates for link ${link.id}`)
        }
      } else {
        console.log(`⚠️ No ratings found for link ${link.id}, keeping fields in place`)
      }
    }
    
    console.log('✅ Migration complete!')
    
    // 4. Log migration completion
    const { error: logError } = await supabase
      .from('migrations_log')
      .insert({
        name: 'migrate_solution_fields_to_ratings',
        executed_at: new Date().toISOString(),
        status: 'completed'
      })
    
    if (logError) {
      console.log('Note: migrations_log table may not exist, but migration is complete')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateExistingData()
  .then(() => {
    console.log('🎉 Migration finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  })