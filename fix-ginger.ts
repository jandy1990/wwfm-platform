// Quick fix: Remove ginger from apps_software
import { supabase } from './lib/database/client';

async function fixGinger() {
  console.log('Removing "ginger" from apps_software keywords...');

  const { data: before } = await supabase
    .from('category_keywords')
    .select('keywords')
    .eq('category', 'apps_software')
    .single();

  console.log('Before:', before?.keywords.includes('ginger') ? 'Has ginger' : 'No ginger');

  // Remove ginger from apps_software
  const { error } = await supabase.rpc('remove_keyword_from_category', {
    cat: 'apps_software',
    keyword_to_remove: 'ginger'
  });

  if (error) {
    console.error('RPC error, trying direct update...');

    // Direct SQL update
    const keywords = before?.keywords.filter((k: string) => k !== 'ginger') || [];
    const { error: updateError } = await supabase
      .from('category_keywords')
      .update({ keywords })
      .eq('category', 'apps_software');

    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
  }

  const { data: after } = await supabase
    .from('category_keywords')
    .select('keywords')
    .eq('category', 'apps_software')
    .single();

  console.log('After:', after?.keywords.includes('ginger') ? 'Has ginger' : 'No ginger');
  console.log('✅ Fix applied!');
}

fixGinger();
