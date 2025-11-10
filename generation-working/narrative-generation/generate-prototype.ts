/**
 * Prototype Generation Script
 *
 * Generates 8-10 posts for "Reduce anxiety" goal as proof-of-concept
 * Validates each with quality checker and saves to JSON
 */

import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generatePostBatch, extractUsedDetails } from './generate-commentary';
import { generateQualityReport, validateAuthenticity } from './quality-validator';
import { GeneratedPost } from './pattern-templates';
import { validateDetailVariety, generateVarietyReport } from './detail-variety-validator';

const GOAL_TITLE = 'Reduce anxiety';
const GOAL_TYPE = 'mental_health';
const POST_COUNT = 10;
const BATCH_SIZE = 5; // Generate 5 posts per API call
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `${GOAL_TITLE.toLowerCase().replace(/\s+/g, '-')}-posts.json`);
const REPORT_FILE = path.join(OUTPUT_DIR, `${GOAL_TITLE.toLowerCase().replace(/\s+/g, '-')}-quality-report.md`);

async function main() {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  WWFM Narrative Generation - Prototype                     │
│  Goal: "${GOAL_TITLE}"                                      │
│  Target: ${POST_COUNT} posts                                     │
└─────────────────────────────────────────────────────────────┘
`);

  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create output directory:', error);
    process.exit(1);
  }

  // Generate posts in 2 batches of 5
  console.log('\n📝 Generating posts in 2 batches...\n');
  let posts: GeneratedPost[] = [];

  try {
    // Batch 1: First 5 posts
    console.log('🔄 Batch 1/2: Generating first 5 posts...');
    const batch1 = await generatePostBatch(GOAL_TITLE, GOAL_TYPE, BATCH_SIZE);
    console.log(`✅ Batch 1 complete: ${batch1.length} posts generated\n`);
    posts.push(...batch1);

    // Extract details from Batch 1 to exclude from Batch 2
    console.log('📊 Extracting used details from Batch 1 for exclusion...');
    const usedDetails = extractUsedDetails(batch1);
    console.log(`   - Therapist names: ${usedDetails.therapists.length}`);
    console.log(`   - Therapy types: ${usedDetails.therapyTypes.join(', ')}`);
    console.log(`   - Medications: ${usedDetails.medications.length}`);
    console.log(`   - Apps: ${usedDetails.apps.join(', ')}\n`);

    // Batch 2: Second 5 posts (with exclusions)
    console.log('🔄 Batch 2/2: Generating second 5 posts with exclusions...');
    const batch2 = await generatePostBatch(GOAL_TITLE, GOAL_TYPE, BATCH_SIZE, 2, usedDetails);
    console.log(`✅ Batch 2 complete: ${batch2.length} posts generated\n`);
    posts.push(...batch2);

    console.log(`\n✨ Total posts generated: ${posts.length}/${POST_COUNT}\n`);
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }

  // Validate and generate quality reports
  console.log('\n\n🔍 Validating authenticity...\n');

  let qualityReport = `# Quality Report: ${GOAL_TITLE}\n`;
  qualityReport += `**Generated:** ${new Date().toISOString()}\n`;
  qualityReport += `**Post Count:** ${posts.length}\n\n`;
  qualityReport += `---\n\n`;

  const validationResults = posts.map((post, index) => {
    const validation = validateAuthenticity(post.content);

    console.log(`\nPost ${index + 1} (${post.flairTypes.join(' + ')}): ${validation.score}/10`);
    console.log(`  Core ingredients: ${validation.coreIngredients.count}/3`);
    console.log(`  ${validation.recommendation}`);

    // Add to quality report
    qualityReport += `## Post ${index + 1}: ${post.flairTypes.map(f => formatFlairName(f)).join(' + ')}\n\n`;
    qualityReport += `**Score:** ${validation.score}/10 (${validation.passed ? '✅ PASS' : '❌ FAIL'})\n`;
    qualityReport += `**Word Count:** ${post.metadata.word_count}\n`;
    qualityReport += `**Core Ingredients:** ${validation.coreIngredients.count}/3\n\n`;

    qualityReport += '### Content Preview\n\n';
    const preview = post.content.split('\n').slice(0, 5).join('\n');
    qualityReport += `\`\`\`\n${preview}\n...\n\`\`\`\n\n`;

    qualityReport += '### Checklist Results\n\n';
    validation.details.forEach((item, i) => {
      qualityReport += `${i + 1}. ${item.passed ? '✅' : '❌'} ${item.criterion}\n`;
      if (item.evidence) {
        qualityReport += `   - Evidence: ${item.evidence}\n`;
      }
      if (item.suggestion) {
        qualityReport += `   - 💡 ${item.suggestion}\n`;
      }
    });

    qualityReport += '\n---\n\n';

    return { post, validation };
  });

  // Summary statistics
  const passCount = validationResults.filter(r => r.validation.passed).length;
  const avgScore = validationResults.reduce((sum, r) => sum + r.validation.score, 0) / posts.length;

  // Validate detail variety to catch template detection risk
  console.log('\n\n🔍 Validating detail variety...\n');
  const varietyResult = validateDetailVariety(posts, GOAL_TITLE);
  const varietyReport = generateVarietyReport(varietyResult, posts);

  console.log(`Detail Variety: ${varietyResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  ${varietyResult.recommendation}`);
  console.log(`  Violations: ${varietyResult.violations.length}`);
  console.log(`  Warnings: ${varietyResult.warnings.length}`);
  console.log(`  Repetition Rate: ${(varietyResult.repetitionRate * 100).toFixed(1)}%`);

  // Add variety report to quality report
  qualityReport = `${qualityReport.split('---')[0]}**Summary:**
- Total Posts: ${posts.length}
- Passed (7+/10): ${passCount}
- Failed: ${posts.length - passCount}
- Average Score: ${avgScore.toFixed(1)}/10
- Pass Rate: ${((passCount / posts.length) * 100).toFixed(0)}%
- Detail Variety: ${varietyResult.passed ? '✅ PASSED' : '❌ FAILED'}
- Template Detection Risk: ${varietyResult.violations.length > 0 ? '⚠️ HIGH' : varietyResult.warnings.length > 0 ? '⚠️ MEDIUM' : '✅ LOW'}

---

${qualityReport.split('---').slice(1).join('---')}

---

${varietyReport}
`;

  // Save posts to JSON
  console.log(`\n\n💾 Saving posts to ${OUTPUT_FILE}...`);

  try {
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(posts, null, 2), 'utf-8');
    console.log(`✅ Saved ${posts.length} posts`);
  } catch (error) {
    console.error('❌ Failed to save posts:', error);
    process.exit(1);
  }

  // Save quality report
  console.log(`\n💾 Saving quality report to ${REPORT_FILE}...`);

  try {
    await fs.writeFile(REPORT_FILE, qualityReport, 'utf-8');
    console.log(`✅ Saved quality report`);
  } catch (error) {
    console.error('❌ Failed to save report:', error);
  }

  // Final summary
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  GENERATION COMPLETE                                        │
├─────────────────────────────────────────────────────────────┤
│  Posts Generated: ${posts.length.toString().padEnd(43)}│
│  Authenticity Pass Rate: ${(((passCount / posts.length) * 100).toFixed(0) + '%').padEnd(35)}│
│  Average Score: ${(avgScore.toFixed(1) + '/10').padEnd(42)}│
│  Detail Variety: ${(varietyResult.passed ? '✅ PASSED' : '❌ FAILED').padEnd(45)}│
│  Template Risk: ${(varietyResult.violations.length > 0 ? '⚠️ HIGH' : varietyResult.warnings.length > 0 ? '⚠️ MEDIUM' : '✅ LOW').padEnd(47)}│
├─────────────────────────────────────────────────────────────┤
│  Output Files:                                              │
│  📄 ${path.basename(OUTPUT_FILE).padEnd(54)}│
│  📊 ${path.basename(REPORT_FILE).padEnd(54)}│
└─────────────────────────────────────────────────────────────┘

Next steps:
1. Review the posts in ${path.basename(OUTPUT_FILE)}
2. Check quality report in ${path.basename(REPORT_FILE)}
3. ${varietyResult.passed && passCount >= posts.length * 0.7 ? 'Insert into database:' : '⚠️ FIX ISSUES BEFORE INSERTING:'}
   npx tsx insert-discussions.ts insert "${GOAL_TITLE}" ${OUTPUT_FILE}
`);

  // Exit with success if quality checks passed
  const qualityPassed = passCount >= posts.length * 0.7;
  const varietyPassed = varietyResult.passed;

  if (qualityPassed && varietyPassed) {
    console.log('✅ All quality checks passed - ready for insertion!\n');
    process.exit(0);
  } else {
    if (!qualityPassed) {
      console.error('\n⚠️ Warning: Less than 70% of posts passed authenticity check');
    }
    if (!varietyPassed) {
      console.error('⚠️ Warning: Detail variety check failed - template detection risk!');
      console.error(`   Violations: ${varietyResult.violations.length}`);
      console.error('   Action: Regenerate affected posts with different details');
    }
    console.error('\n❌ Quality checks failed - fix issues before inserting into database\n');
    process.exit(1);
  }
}

function formatFlairName(flair: string): string {
  const names: Record<string, string> = {
    'what_to_expect': 'What to Expect',
    'mindset_shift': 'The Mindset Shift',
    'lessons_learned': 'Lessons Learned',
    'my_story': 'My Story',
    'practical_tips': 'Practical Tips'
  };
  return names[flair] || flair;
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
