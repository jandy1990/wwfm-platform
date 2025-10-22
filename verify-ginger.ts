// Verify ginger keyword status
import { supabase } from './lib/database/client';

async function verifyGinger() {
  const { data } = await supabase
    .from('category_keywords')
    .select('category, keywords')
    .in('category', ['apps_software', 'natural_remedies']);

  console.log('Ginger keyword status:\n');
  data?.forEach(row => {
    const hasGinger = row.keywords.includes('ginger');
    console.log(`${row.category}: ${hasGinger ? '❌ HAS ginger' : '✅ NO ginger'}`);
    if (hasGinger) {
      const index = row.keywords.indexOf('ginger');
      console.log(`  (Found at index ${index} of ${row.keywords.length} keywords)`);
    }
  });
}

verifyGinger();
