import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertRemaining3() {
  const filePath = path.join(__dirname, 'final-output.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  const goalId = '56e2801e-0d78-4abd-a795-869e5b780ae7';

  // Find the 3 solutions from final-output.json
  const lexapro = data.solutions.find((s: any) => s.title === 'Lexapro (escitalopram)');
  const ashwagandha = data.solutions.find((s: any) => s.title === 'Ashwagandha');
  const workbook = data.solutions.find((s: any) => s.title === 'The Anxiety and Phobia Workbook by Edmund Bourne');

  console.log('Handling 3 remaining solutions...\n');

  // 1. Lexapro - Create variant for existing solution (created earlier)
  console.log('[1/3] Lexapro - Creating variant and link');
  const lexaproSolutionId = '3b3123e9-198d-4779-905c-f26f584d9f63';

  const { data: lexaproVariant, error: lexaproVariantError } = await supabase
    .from('solution_variants')
    .insert({ solution_id: lexaproSolutionId, variant_name: 'Standard' })
    .select('id')
    .single();

  if (lexaproVariantError) {
    console.error(`  ✗ Lexapro variant failed: ${lexaproVariantError.message}`);
  } else {
    console.log(`  ✓ Variant created: ${lexaproVariant.id}`);

    const { error: lexaproLinkError } = await supabase
      .from('goal_implementation_links')
      .insert({
        goal_id: goalId,
        implementation_id: lexaproVariant.id,
        avg_effectiveness: lexapro.avg_effectiveness,
        aggregated_fields: lexapro.aggregated_fields
      });

    if (lexaproLinkError) {
      console.error(`  ✗ Lexapro link failed: ${lexaproLinkError.message}`);
    } else {
      console.log(`  ✓ Link created\n`);
    }
  }

  // 2. Ashwagandha - Create Standard variant for existing solution
  console.log('[2/3] Ashwagandha - Creating Standard variant and link');
  const ashwagandhaSolutionId = '96d5e41f-6c69-4375-a512-050d15f18538';

  const { data: ashwagandhaVariant, error: ashwagandhaVariantError } = await supabase
    .from('solution_variants')
    .insert({ solution_id: ashwagandhaSolutionId, variant_name: 'Standard' })
    .select('id')
    .single();

  if (ashwagandhaVariantError) {
    console.error(`  ✗ Ashwagandha variant failed: ${ashwagandhaVariantError.message}`);
  } else {
    console.log(`  ✓ Variant created: ${ashwagandhaVariant.id}`);

    const { error: ashwagandhaLinkError } = await supabase
      .from('goal_implementation_links')
      .insert({
        goal_id: goalId,
        implementation_id: ashwagandhaVariant.id,
        avg_effectiveness: ashwagandha.avg_effectiveness,
        aggregated_fields: ashwagandha.aggregated_fields
      });

    if (ashwagandhaLinkError) {
      console.error(`  ✗ Ashwagandha link failed: ${ashwagandhaLinkError.message}`);
    } else {
      console.log(`  ✓ Link created\n`);
    }
  }

  // 3. The Anxiety and Phobia Workbook - Use existing variant
  console.log('[3/3] The Anxiety and Phobia Workbook - Creating link with existing variant');
  const workbookVariantId = 'a3a972cd-d96c-4220-9641-7d32cc5bb425';

  const { error: workbookLinkError } = await supabase
    .from('goal_implementation_links')
    .insert({
      goal_id: goalId,
      implementation_id: workbookVariantId,
      avg_effectiveness: workbook.avg_effectiveness,
      aggregated_fields: workbook.aggregated_fields
    });

  if (workbookLinkError) {
    console.error(`  ✗ Workbook link failed: ${workbookLinkError.message}`);
  } else {
    console.log(`  ✓ Link created\n`);
  }

  // Final validation
  console.log('='.repeat(60));
  console.log('VALIDATION');
  console.log('='.repeat(60));

  const { count, error: countError } = await supabase
    .from('goal_implementation_links')
    .select('*', { count: 'exact', head: true })
    .eq('goal_id', goalId);

  if (countError) {
    console.error(`Validation query failed: ${countError.message}`);
  } else {
    console.log(`Solutions in database for goal: ${count}`);
    console.log(`Expected: 45`);
    console.log(`Match: ${count === 45 ? '✓ YES' : '✗ NO'}`);
  }
}

insertRemaining3()
  .then(() => console.log('\n✓ Remaining 3 solutions completed!'))
  .catch(error => console.error('\n✗ Error:', error));
