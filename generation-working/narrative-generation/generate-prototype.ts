/**
 * Prototype Generation Script
 *
 * Generates 8-10 posts for "Reduce anxiety" goal as proof-of-concept
 * Validates each with quality checker and saves to JSON
 */

import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generatePostBatch } from './generate-commentary';
import { generateQualityReport, validateAuthenticity } from './quality-validator';
import { GeneratedPost } from './pattern-templates';

const GOAL_TITLE = 'Reduce anxiety';
const GOAL_TYPE = 'mental_health';
const POST_COUNT = 10;
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

  // Generate posts
  console.log('\n📝 Generating posts...\n');
  let posts: GeneratedPost[];

  try {
    posts = await generatePostBatch(GOAL_TITLE, GOAL_TYPE, POST_COUNT);
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

  qualityReport = `${qualityReport.split('---')[0]}**Summary:**
- Total Posts: ${posts.length}
- Passed (7+/10): ${passCount}
- Failed: ${posts.length - passCount}
- Average Score: ${avgScore.toFixed(1)}/10
- Pass Rate: ${((passCount / posts.length) * 100).toFixed(0)}%

---

${qualityReport.split('---').slice(1).join('---')}`;

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
├─────────────────────────────────────────────────────────────┤
│  Output Files:                                              │
│  📄 ${path.basename(OUTPUT_FILE).padEnd(54)}│
│  📊 ${path.basename(REPORT_FILE).padEnd(54)}│
└─────────────────────────────────────────────────────────────┘

Next steps:
1. Review the posts in ${path.basename(OUTPUT_FILE)}
2. Check quality report in ${path.basename(REPORT_FILE)}
3. If satisfied, insert into database:
   npx tsx insert-discussions.ts insert "${GOAL_TITLE}" ${OUTPUT_FILE}
`);

  // Exit with success if most posts passed
  if (passCount >= posts.length * 0.7) {
    process.exit(0);
  } else {
    console.error('\n⚠️ Warning: Less than 70% of posts passed authenticity check');
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
