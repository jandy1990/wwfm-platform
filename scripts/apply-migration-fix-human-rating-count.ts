/**
 * Apply Migration: Fix human_rating_count Race Condition
 * Run with: npx tsx scripts/apply-migration-fix-human-rating-count.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying migration: Fix human_rating_count Race Condition\n');

  // Read the migration SQL
  const migrationPath = path.join(
    __dirname,
    '../supabase/migrations/20251016000000_fix_human_rating_count_race_condition.sql'
  );

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration SQL loaded\n');
  console.log('🔄 Executing migration...\n');

  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    });

    if (error) {
      // If RPC doesn't exist, try direct execution via REST API
      console.log('ℹ️  RPC not available, using direct SQL execution...\n');

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: migrationSql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('✅ Migration applied successfully via REST API!\n');
    } else {
      console.log('✅ Migration applied successfully!\n');
    }

    // Verify the function was updated
    console.log('🔍 Verifying function update...\n');

    const { data: funcData, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'increment_human_rating_count')
      .single();

    if (funcError) {
      console.log('⚠️  Could not verify function (this is normal for some setups)');
    } else {
      console.log('✅ Function verified:', funcData);
    }

    console.log('\n✨ Migration complete!\n');
    console.log('Next steps:');
    console.log('1. Test with a new form submission');
    console.log('2. Run data sync script to fix existing records');
    console.log('3. Verify solutions display on frontend\n');

  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    console.error('\n📋 Manual Application Instructions:');
    console.error('1. Go to https://wqxkhxdbxdtpuvuvgirx.supabase.co');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Paste the contents of:');
    console.error('   supabase/migrations/20251016000000_fix_human_rating_count_race_condition.sql');
    console.error('4. Click Run\n');
    process.exit(1);
  }
}

applyMigration();
