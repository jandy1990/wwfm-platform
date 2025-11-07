import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BackupLink {
  id: string;
  goal_id: string;
  implementation_id: string;
  avg_effectiveness: string;
  rating_count: number;
  human_rating_count: number;
  data_display_mode: string;
  created_at: string;
  updated_at: string;
}

/**
 * Restore the original 22 solutions for "Reduce anxiety" from backup
 */
async function restoreOriginalSolutions() {
  console.log('='.repeat(60));
  console.log('RESTORE: Original "Reduce anxiety" solutions');
  console.log('='.repeat(60));

  // Read backup file
  const backupPath = path.join(__dirname, '../backup/link-ids-before-deletion.json');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  console.log(`\nBackup date: ${backupData.backup_date}`);
  console.log(`Goal: ${backupData.goal_title}`);
  console.log(`Links to restore: ${backupData.total_links}\n`);

  const links: BackupLink[] = backupData.links;

  // For each link, get the full data and reinsert
  let restored = 0;
  let errors = 0;

  for (const link of links) {
    try {
      // Get the full link data including aggregated_fields
      // We need to query from an existing record with this implementation_id
      const { data: existingData, error: fetchError } = await supabase
        .from('goal_implementation_links')
        .select('*')
        .eq('implementation_id', link.implementation_id)
        .limit(1)
        .single();

      if (fetchError || !existingData) {
        // If no existing data, create minimal link
        const { error: insertError } = await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: link.goal_id,
            implementation_id: link.implementation_id,
            avg_effectiveness: parseFloat(link.avg_effectiveness),
            rating_count: link.rating_count,
            human_rating_count: link.human_rating_count,
            data_display_mode: link.data_display_mode
          });

        if (insertError) {
          console.error(`✗ Error inserting ${link.id}:`, insertError.message);
          errors++;
        } else {
          console.log(`✓ Restored link (minimal): ${link.implementation_id}`);
          restored++;
        }
      } else {
        // We found existing data from another goal with same variant
        // Use its aggregated_fields but with this goal's effectiveness
        const { error: insertError } = await supabase
          .from('goal_implementation_links')
          .insert({
            goal_id: link.goal_id,
            implementation_id: link.implementation_id,
            avg_effectiveness: parseFloat(link.avg_effectiveness),
            rating_count: link.rating_count,
            human_rating_count: link.human_rating_count,
            data_display_mode: link.data_display_mode,
            aggregated_fields: existingData.aggregated_fields,
            solution_fields: existingData.solution_fields,
            ai_snapshot: existingData.ai_snapshot
          });

        if (insertError) {
          console.error(`✗ Error inserting ${link.id}:`, insertError.message);
          errors++;
        } else {
          console.log(`✓ Restored link (full): ${link.implementation_id}`);
          restored++;
        }
      }
    } catch (error: any) {
      console.error(`✗ Error processing ${link.id}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RESTORATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successfully restored: ${restored} links`);
  console.log(`✗ Errors: ${errors} links`);
  console.log(`Total: ${restored + errors}/${backupData.total_links}`);

  // Verify restoration
  const { data: verifyLinks } = await supabase
    .from('goal_implementation_links')
    .select('id')
    .eq('goal_id', backupData.goal_id);

  console.log(`\n✓ Current links in database: ${verifyLinks?.length || 0}`);
  console.log('\nNext steps:');
  console.log('1. Clear Next.js cache: rm -rf .next');
  console.log('2. Restart dev server: npm run dev');
  console.log('3. Hard refresh browser');
}

restoreOriginalSolutions()
  .then(() => {
    console.log('\n✓ Restoration complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Restoration failed:', error);
    process.exit(1);
  });
