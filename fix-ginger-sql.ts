// Direct SQL fix for ginger keyword
import { supabase } from './lib/database/client';

async function fixGingerSQL() {
  console.log('Executing SQL to remove ginger from apps_software...');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      UPDATE category_keywords
      SET keywords = array_remove(keywords, 'ginger')
      WHERE category = 'apps_software'
      RETURNING category, keywords;
    `
  });

  if (error) {
    console.error('Error:', error);
    console.log('\nTrying alternative method...');

    // Get current keywords
    const { data: current } = await supabase
      .from('category_keywords')
      .select('keywords')
      .eq('category', 'apps_software')
      .single();

    if (current) {
      const newKeywords = current.keywords.filter((k: string) => k !== 'ginger');
      console.log('Current keywords:', current.keywords.length);
      console.log('New keywords:', newKeywords.length);

      const { error: updateError } = await supabase
        .from('category_keywords')
        .update({ keywords: newKeywords })
        .eq('category', 'apps_software');

      if (updateError) {
        console.error('Update failed:', updateError);
      } else {
        console.log('✅ Successfully removed ginger from apps_software');
      }
    }
  } else {
    console.log('✅ Success!');
    console.log('Result:', data);
  }
}

fixGingerSQL();
