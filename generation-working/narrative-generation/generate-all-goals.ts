/**
 * Production Batch Generation Script
 *
 * Generates 10 narrative posts for all 33 high-traffic goals
 * Uses dual-batch approach (5+5) with exclusion tracking
 */

import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generatePostBatch, extractUsedDetails } from './generate-commentary';
import { validateAuthenticity } from './quality-validator';
import { GeneratedPost, PatternIngredients } from './pattern-templates';
import { validateDetailVariety } from './detail-variety-validator';
import { getAllMappedGoals } from './goal-category-map';

const POST_COUNT = 10;
const BATCH_SIZE = 5;
const OUTPUT_DIR = path.join(__dirname, 'output/all-goals');
const SUMMARY_FILE = path.join(OUTPUT_DIR, '_GENERATION_SUMMARY.md');

// Goal type mapping
const GOAL_TYPE_MAP: Record<string, PatternIngredients['goalType']> = {
  'Reduce anxiety': 'mental_health',
  'Manage stress': 'mental_health',
  'Improve emotional regulation': 'mental_health',
  'Channel anger productively': 'mental_health',
  'Live with ADHD': 'mental_health',
  'Live with depression': 'mental_health',
  'Navigate autism challenges': 'mental_health',
  'Live with social anxiety': 'mental_health',
  'Build confidence': 'mental_health',
  'Quit drinking': 'mental_health',
  'Stop emotional eating': 'mental_health',
  'Get over dating anxiety': 'mental_health',
  'Sleep better': 'physical_health',
  'Fall asleep faster': 'physical_health',
  'Beat afternoon slump': 'physical_health',
  'Find exercise I enjoy': 'physical_health',
  'Start exercising': 'physical_health',
  'Bike long distances': 'physical_health',
  'Manage chronic pain': 'physical_health',
  'Clear up acne': 'physical_health',
  'Fix dry skin': 'physical_health',
  'Have healthier hair': 'physical_health',
  'Have healthy nails': 'physical_health',
  'Lose weight sustainably': 'weight_management',
  'Lose belly fat': 'weight_management',
  'Navigate menopause': 'physical_health',
  'Reduce menopause hot flashes': 'physical_health',
  'Manage painful periods': 'physical_health',
  'Manage PCOS': 'physical_health',
  'Develop morning routine': 'life_optimization',
  'Overcome procrastination': 'mental_health',
  'Save money': 'life_optimization',
  'Improve credit score': 'life_optimization'
};

interface GenerationResult {
  goalTitle: string;
  success: boolean;
  postsGenerated: number;
  authenticityPassRate: number;
  avgScore: number;
  detailVarietyPassed: boolean;
  violations: number;
  repetitionRate: number;
  outputFile?: string;
  error?: string;
}

async function generateForGoal(goalTitle: string): Promise<GenerationResult> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎯 GOAL: "${goalTitle}"`);
  console.log(`${'='.repeat(70)}\n`);

  const goalType = GOAL_TYPE_MAP[goalTitle];
  if (!goalType) {
    return {
      goalTitle,
      success: false,
      postsGenerated: 0,
      authenticityPassRate: 0,
      avgScore: 0,
      detailVarietyPassed: false,
      violations: 0,
      repetitionRate: 0,
      error: 'Goal type mapping not found'
    };
  }

  try {
    let posts: GeneratedPost[] = [];

    // Batch 1: First 5 posts
    console.log('🔄 Batch 1/2: Generating first 5 posts...');
    const batch1 = await generatePostBatch(goalTitle, goalType, BATCH_SIZE);
    console.log(`✅ Batch 1 complete: ${batch1.length} posts\n`);
    posts.push(...batch1);

    // Extract details for exclusion
    const usedDetails = extractUsedDetails(batch1);
    console.log(`📊 Excluding: ${usedDetails.therapyTypes.length} therapy types, ${usedDetails.therapists.length} therapists\n`);

    // Batch 2: Second 5 posts with exclusions
    console.log('🔄 Batch 2/2: Generating second 5 posts with exclusions...');
    const batch2 = await generatePostBatch(goalTitle, goalType, BATCH_SIZE, 2, usedDetails);
    console.log(`✅ Batch 2 complete: ${batch2.length} posts\n`);
    posts.push(...batch2);

    console.log(`✨ Total: ${posts.length}/${POST_COUNT} posts generated\n`);

    // Validate quality
    console.log('🔍 Validating quality...');
    const validationResults = posts.map(post => validateAuthenticity(post.content));
    const passCount = validationResults.filter(r => r.passed).length;
    const avgScore = validationResults.reduce((sum, r) => sum + r.score, 0) / posts.length;
    const passRate = (passCount / posts.length) * 100;

    const varietyResult = validateDetailVariety(posts, goalTitle);

    console.log(`   Authenticity: ${passCount}/${posts.length} passed (${passRate.toFixed(0)}%)`);
    console.log(`   Average score: ${avgScore.toFixed(1)}/10`);
    console.log(`   Detail variety: ${varietyResult.passed ? '✅ PASSED' : '❌ FAILED'} (${varietyResult.violations.length} violations)\n`);

    // Save to file
    const filename = `${goalTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    const outputFile = path.join(OUTPUT_DIR, filename);
    await fs.writeFile(outputFile, JSON.stringify(posts, null, 2), 'utf-8');
    console.log(`💾 Saved to: ${filename}`);

    return {
      goalTitle,
      success: true,
      postsGenerated: posts.length,
      authenticityPassRate: passRate,
      avgScore,
      detailVarietyPassed: varietyResult.passed,
      violations: varietyResult.violations.length,
      repetitionRate: varietyResult.repetitionRate,
      outputFile: filename
    };

  } catch (error) {
    console.error(`❌ Failed:`, error instanceof Error ? error.message : String(error));
    return {
      goalTitle,
      success: false,
      postsGenerated: 0,
      authenticityPassRate: 0,
      avgScore: 0,
      detailVarietyPassed: false,
      violations: 0,
      repetitionRate: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  console.log(`
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🚀 WWFM NARRATIVE GENERATION - PRODUCTION BATCH                   │
│                                                                     │
│  Generating 10 posts for 33 high-traffic goals                    │
│  Total target: 330 narrative posts                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`);

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const allGoals = getAllMappedGoals();
  console.log(`📋 Goals to process: ${allGoals.length}\n`);

  const results: GenerationResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < allGoals.length; i++) {
    const goal = allGoals[i];
    console.log(`\n[${i + 1}/${allGoals.length}] Processing: "${goal}"`);

    const result = await generateForGoal(goal);
    results.push(result);

    // Brief pause between goals to avoid rate limiting
    if (i < allGoals.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const endTime = Date.now();
  const durationMinutes = ((endTime - startTime) / 1000 / 60).toFixed(1);

  // Generate summary report
  const successCount = results.filter(r => r.success).length;
  const totalPosts = results.reduce((sum, r) => sum + r.postsGenerated, 0);
  const avgAuthPass = results.filter(r => r.success).reduce((sum, r) => sum + r.authenticityPassRate, 0) / successCount;
  const avgScore = results.filter(r => r.success).reduce((sum, r) => sum + r.avgScore, 0) / successCount;
  const varietyPassCount = results.filter(r => r.detailVarietyPassed).length;

  let summary = `# WWFM Narrative Generation - Batch Summary\n\n`;
  summary += `**Generated:** ${new Date().toISOString()}\n`;
  summary += `**Duration:** ${durationMinutes} minutes\n\n`;
  summary += `## Overall Statistics\n\n`;
  summary += `- **Goals Processed:** ${allGoals.length}\n`;
  summary += `- **Successful:** ${successCount} (${((successCount / allGoals.length) * 100).toFixed(0)}%)\n`;
  summary += `- **Failed:** ${allGoals.length - successCount}\n`;
  summary += `- **Total Posts Generated:** ${totalPosts}\n`;
  summary += `- **Average Authenticity Pass Rate:** ${avgAuthPass.toFixed(1)}%\n`;
  summary += `- **Average Quality Score:** ${avgScore.toFixed(1)}/10\n`;
  summary += `- **Detail Variety Pass Rate:** ${((varietyPassCount / successCount) * 100).toFixed(0)}%\n\n`;

  summary += `## Results by Goal\n\n`;
  summary += `| Goal | Status | Posts | Auth % | Score | Variety | Violations |\n`;
  summary += `|------|--------|-------|--------|-------|---------|------------|\n`;

  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const variety = r.detailVarietyPassed ? '✅' : '❌';
    summary += `| ${r.goalTitle} | ${status} | ${r.postsGenerated} | ${r.authenticityPassRate.toFixed(0)}% | ${r.avgScore.toFixed(1)} | ${variety} | ${r.violations} |\n`;
  });

  if (results.some(r => !r.success)) {
    summary += `\n## Failures\n\n`;
    results.filter(r => !r.success).forEach(r => {
      summary += `- **${r.goalTitle}**: ${r.error}\n`;
    });
  }

  await fs.writeFile(SUMMARY_FILE, summary, 'utf-8');

  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`🎉 GENERATION COMPLETE`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`✅ Successfully generated: ${successCount}/${allGoals.length} goals`);
  console.log(`📝 Total posts: ${totalPosts}`);
  console.log(`⏱️  Duration: ${durationMinutes} minutes`);
  console.log(`📊 Summary saved to: _GENERATION_SUMMARY.md\n`);

  process.exit(successCount === allGoals.length ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
