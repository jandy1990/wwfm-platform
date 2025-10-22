// Force remove ginger from apps_software using array operations
import { supabase } from './lib/database/client';

async function forceRemoveGinger() {
  console.log('Step 1: Fetching current apps_software keywords...');

  const { data: row, error: fetchError } = await supabase
    .from('category_keywords')
    .select('*')
    .eq('category', 'apps_software')
    .single();

  if (fetchError || !row) {
    console.error('Fetch error:', fetchError);
    return;
  }

  console.log('Current keyword count:', row.keywords.length);
  console.log('Has ginger?', row.keywords.includes('ginger'));

  console.log('\nStep 2: Creating new keyword array without ginger...');
  const newKeywords = row.keywords.filter((k: string) => k !== 'ginger');
  console.log('New keyword count:', newKeywords.length);
  console.log('Removed:', row.keywords.length - newKeywords.length, 'keywords');

  console.log('\nStep 3: Updating database...');
  const { error: updateError, data: updated } = await supabase
    .from('category_keywords')
    .update({ keywords: newKeywords })
    .eq('category', 'apps_software')
    .select();

  if (updateError) {
    console.error('Update error:', updateError);
    return;
  }

  console.log('\nStep 4: Verifying update...');
  const { data: verification } = await supabase
    .from('category_keywords')
    .select('keywords')
    .eq('category', 'apps_software')
    .single();

  console.log('Final keyword count:', verification?.keywords.length);
  console.log('Still has ginger?', verification?.keywords.includes('ginger'));

  if (verification?.keywords.includes('ginger')) {
    console.log('❌ FAILED: Ginger still present after update!');
  } else {
    console.log('✅ SUCCESS: Ginger removed from apps_software!');
  }
}

forceRemoveGinger();
