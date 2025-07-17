import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // First, check current state
    const { data: beforeStats, error: beforeError } = await supabase
      .from('goal_implementation_links')
      .select('avg_effectiveness')
      .not('avg_effectiveness', 'is', null)
    
    if (beforeError) {
      return NextResponse.json({ error: 'Failed to fetch current ratings' }, { status: 500 })
    }
    
    const beforeAnalysis = {
      total: beforeStats.length,
      needsUpdate: beforeStats.filter(r => r.avg_effectiveness && r.avg_effectiveness <= 5).length,
      min: Math.min(...beforeStats.map(r => r.avg_effectiveness || 0)),
      max: Math.max(...beforeStats.map(r => r.avg_effectiveness || 0)),
      avg: beforeStats.reduce((sum, r) => sum + (r.avg_effectiveness || 0), 0) / beforeStats.length
    }
    
    // Get records that need updating
    const { data: recordsToUpdate, error: fetchError } = await supabase
      .from('goal_implementation_links')
      .select('id, avg_effectiveness')
      .not('avg_effectiveness', 'is', null)
      .lte('avg_effectiveness', 5)
    
    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch records to update' }, { status: 500 })
    }
    
    // Update each record
    let updatedCount = 0
    const errors = []
    
    for (const record of recordsToUpdate || []) {
      const { error: updateError } = await supabase
        .from('goal_implementation_links')
        .update({ 
          avg_effectiveness: record.avg_effectiveness * 2,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id)
      
      if (updateError) {
        errors.push({ id: record.id, error: updateError.message })
      } else {
        updatedCount++
      }
    }
    
    // Check final state
    const { data: afterStats, error: afterError } = await supabase
      .from('goal_implementation_links')
      .select('avg_effectiveness')
      .not('avg_effectiveness', 'is', null)
    
    if (afterError) {
      return NextResponse.json({ 
        warning: 'Updates completed but failed to fetch final stats',
        updatedCount,
        errors
      }, { status: 200 })
    }
    
    const afterAnalysis = {
      total: afterStats.length,
      stillNeedsUpdate: afterStats.filter(r => r.avg_effectiveness && r.avg_effectiveness <= 5).length,
      min: Math.min(...afterStats.map(r => r.avg_effectiveness || 0)),
      max: Math.max(...afterStats.map(r => r.avg_effectiveness || 0)),
      avg: afterStats.reduce((sum, r) => sum + (r.avg_effectiveness || 0), 0) / afterStats.length
    }
    
    return NextResponse.json({
      success: true,
      before: beforeAnalysis,
      after: afterAnalysis,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check current state without making changes
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: stats, error } = await supabase
      .from('goal_implementation_links')
      .select('avg_effectiveness')
      .not('avg_effectiveness', 'is', null)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
    }
    
    const analysis = {
      total: stats.length,
      needsUpdate: stats.filter(r => r.avg_effectiveness && r.avg_effectiveness <= 5).length,
      alreadyUpdated: stats.filter(r => r.avg_effectiveness && r.avg_effectiveness > 5).length,
      distribution: {
        '0-2': stats.filter(r => r.avg_effectiveness && r.avg_effectiveness <= 2).length,
        '2-4': stats.filter(r => r.avg_effectiveness && r.avg_effectiveness > 2 && r.avg_effectiveness <= 4).length,
        '4-5': stats.filter(r => r.avg_effectiveness && r.avg_effectiveness > 4 && r.avg_effectiveness <= 5).length,
        '5-10': stats.filter(r => r.avg_effectiveness && r.avg_effectiveness > 5).length,
      },
      min: Math.min(...stats.map(r => r.avg_effectiveness || 0)),
      max: Math.max(...stats.map(r => r.avg_effectiveness || 0)),
      avg: stats.reduce((sum, r) => sum + (r.avg_effectiveness || 0), 0) / stats.length
    }
    
    return NextResponse.json(analysis)
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}