/**
 * Quick script to apply the human_rating_count fix
 * Run with: node apply-fix.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Applying human_rating_count fix to production database\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('\nPlease add to .env.local:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// The fixed function SQL
const fixSql = `
CREATE OR REPLACE FUNCTION public.increment_human_rating_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.data_source = 'human' THEN
    INSERT INTO goal_implementation_links (
      goal_id,
      implementation_id,
      human_rating_count,
      rating_count,
      avg_effectiveness,
      last_rating_at,
      needs_aggregation,
      data_display_mode,
      transition_threshold
    )
    VALUES (
      NEW.goal_id,
      NEW.implementation_id,
      1,
      1,
      NEW.effectiveness_score,
      NOW(),
      TRUE,
      'ai',
      3
    )
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      human_rating_count = goal_implementation_links.human_rating_count + 1,
      last_rating_at = NOW(),
      needs_aggregation = TRUE;

    INSERT INTO aggregation_queue (goal_id, implementation_id)
    VALUES (NEW.goal_id, NEW.implementation_id)
    ON CONFLICT (goal_id, implementation_id) DO UPDATE SET
      queued_at = NOW(),
      processing = FALSE;
  END IF;

  RETURN NEW;
END;
$function$;
`;

try {
  console.log('📤 Executing SQL...\n');

  // Try using Supabase SQL editor approach
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      query: fixSql
    })
  });

  if (response.ok) {
    console.log('✅ Function updated successfully!\n');
  } else {
    console.log('⚠️  Could not apply via API. Manual application needed:\n');
    console.log('1. Go to: https://wqxkhxdbxdtpuvuvgirx.supabase.co');
    console.log('2. Click "SQL Editor"');
    console.log('3. Copy/paste the SQL from: supabase/migrations/20251016000000_fix_human_rating_count_race_condition.sql');
    console.log('4. Click "Run"\n');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n📋 Manual Application Required:');
  console.log('1. Go to: https://wqxkhxdbxdtpuvuvgirx.supabase.co');
  console.log('2. Click "SQL Editor"');
  console.log('3. Copy/paste from: supabase/migrations/20251016000000_fix_human_rating_count_race_condition.sql');
  console.log('4. Click "Run"\n');
}
