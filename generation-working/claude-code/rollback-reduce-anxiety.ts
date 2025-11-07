import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Rollback the "Reduce anxiety" solution insertions
 *
 * Strategy:
 * 1. Delete all goal_implementation_links for this goal created today
 * 2. Keep solutions and variants (they may be used by other goals)
 */
async function rollbackReduceAnxiety() {
  console.log('='.repeat(60));
  console.log('ROLLBACK: Reduce anxiety solutions');
  console.log('='.repeat(60));

  const goalId = '56e2801e-0d78-4abd-a795-869e5b780ae7';

  // Step 1: Count current links
  const { data: currentLinks, error: countError } = await supabase
    .from('goal_implementation_links')
    .select('id')
    .eq('goal_id', goalId);

  if (countError) {
    console.error('Error counting links:', countError);
    throw countError;
  }

  console.log(`\nCurrent links for "Reduce anxiety": ${currentLinks?.length || 0}`);

  if (!currentLinks || currentLinks.length === 0) {
    console.log('\n✓ No links to delete');
    return;
  }

  // Step 2: Delete all goal_implementation_links for this goal
  const { error: deleteError } = await supabase
    .from('goal_implementation_links')
    .delete()
    .eq('goal_id', goalId);

  if (deleteError) {
    console.error('Error deleting links:', deleteError);
    throw deleteError;
  }

  console.log(`✓ Deleted ${currentLinks.length} goal_implementation_links`);

  // Step 3: Verify deletion
  const { data: remainingLinks } = await supabase
    .from('goal_implementation_links')
    .select('id')
    .eq('goal_id', goalId);

  console.log(`\nRemaining links: ${remainingLinks?.length || 0}`);

  console.log('\n' + '='.repeat(60));
  console.log('ROLLBACK COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNote: Solutions and variants were preserved in database.');
  console.log('They may be linked to other goals or reused in future.');
  console.log('\nNext steps:');
  console.log('1. Clear Next.js cache: rm -rf .next');
  console.log('2. Restart dev server: npm run dev');
  console.log('3. Hard refresh browser');
}

rollbackReduceAnxiety()
  .then(() => {
    console.log('\n✓ Rollback successful');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Rollback failed:', error);
    process.exit(1);
  });
