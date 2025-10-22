// Check if "ginger" keyword is in the correct category
import { supabase } from './lib/database/client';

async function checkGingerKeyword() {
  const { data, error } = await supabase
    .from('category_keywords')
    .select('category, keywords')
    .or('keywords.cs.{ginger}');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Categories containing "ginger" keyword:');
  data?.forEach(row => {
    console.log(`  - ${row.category}: ${row.keywords.includes('ginger') ? '✅ HAS ginger' : '❌ NO ginger'}`);
  });
}

checkGingerKeyword();
