import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const today = new Date().toISOString().split('T')[0]
    const stats = {
      created: 0,
      reminders: 0,
      expired: 0
    }
    
    // 1. Create mailbox items for due retrospectives
    const { data: dueSchedules } = await supabase
      .from('retrospective_schedules')
      .select(`
        *,
        goals (title),
        solutions (title),
        ratings (created_at)
      `)
      .eq('status', 'pending')
      .lte('scheduled_date', today)
    
    for (const schedule of dueSchedules || []) {
      // Check if mailbox item exists
      const { data: existing } = await supabase
        .from('mailbox_items')
        .select('id')
        .eq('retrospective_schedule_id', schedule.id)
        .single()
      
      if (!existing) {
        // Create mailbox item
        await supabase
          .from('mailbox_items')
          .insert({
            user_id: schedule.user_id,
            retrospective_schedule_id: schedule.id,
            goal_title: schedule.goals?.title || 'Unknown Goal',
            solution_title: schedule.solutions?.title || 'Unknown Solution',
            achievement_date: schedule.ratings?.created_at || schedule.created_at,
            priority: 1
          })
        
        // Update schedule status
        await supabase
          .from('retrospective_schedules')
          .update({ 
            status: 'sent',
            notification_sent_at: new Date().toISOString()
          })
          .eq('id', schedule.id)
        
        stats.created++
      }
    }
    
    // 2. Send reminders (day 1 and day 7)
    const { data: needsReminder } = await supabase
      .from('retrospective_schedules')
      .select('*')
      .eq('status', 'sent')
      .lt('reminder_count', 2)
    
    for (const schedule of needsReminder || []) {
      const daysSinceSent = Math.floor(
        (Date.now() - new Date(schedule.notification_sent_at).getTime()) / 86400000
      )
      
      const shouldRemind = 
        (daysSinceSent >= 1 && schedule.reminder_count === 0) ||
        (daysSinceSent >= 7 && schedule.reminder_count === 1)
      
      if (shouldRemind) {
        await supabase
          .from('retrospective_schedules')
          .update({
            reminder_count: schedule.reminder_count + 1,
            last_reminder_at: new Date().toISOString()
          })
          .eq('id', schedule.id)
        
        stats.reminders++
        
        // In future, trigger email here
      }
    }
    
    // 3. Expire old retrospectives (30+ days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: toExpire } = await supabase
      .from('retrospective_schedules')
      .update({ 
        status: 'expired',
        expired_at: new Date().toISOString()
      })
      .eq('status', 'sent')
      .lt('notification_sent_at', thirtyDaysAgo.toISOString())
      .select()
    
    stats.expired = toExpire?.length || 0
    
    // Also dismiss expired mailbox items
    if (toExpire && toExpire.length > 0) {
      const expiredIds = toExpire.map(s => s.id)
      await supabase
        .from('mailbox_items')
        .update({ is_dismissed: true })
        .in('retrospective_schedule_id', expiredIds)
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      stats,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})