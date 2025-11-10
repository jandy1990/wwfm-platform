import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { validateAuthenticity } from './quality-validator';
import { GeneratedPost } from './pattern-templates';
import { validateDetailVariety, generateVarietyReport } from './detail-variety-validator';

async function main() {
  const postsFile = path.join(__dirname, 'output/claude-written-reduce-anxiety.json');
  const posts: GeneratedPost[] = JSON.parse(await fs.readFile(postsFile, 'utf-8'));

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 QUALITY ASSESSMENT: Claude-Written Posts`);
  console.log(`Goal: "Reduce anxiety"`);
  console.log(`Posts: ${posts.length}`);
  console.log(`${'='.repeat(70)}\n`);

  console.log('🔍 Authenticity Validation:\n');

  const validationResults = posts.map((post, index) => {
    const validation = validateAuthenticity(post.content);

    console.log(`Post ${index + 1} (${post.flairTypes.join(' + ')}): ${validation.score}/10`);
    console.log(`  Core ingredients: ${validation.coreIngredients.count}/3`);
    console.log(`  ${validation.passed ? '✅ PASS' : '❌ FAIL'} - ${validation.recommendation}\n`);

    return { post, validation };
  });

  // Summary
  const passCount = validationResults.filter(r => r.validation.passed).length;
  const avgScore = validationResults.reduce((sum, r) => sum + r.validation.score, 0) / posts.length;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📈 AUTHENTICITY SUMMARY`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Pass Rate: ${passCount}/${posts.length} (${((passCount / posts.length) * 100).toFixed(0)}%)`);
  console.log(`Average Score: ${avgScore.toFixed(1)}/10`);
  console.log(`Target: 70% pass rate (7+/10 score)\n`);

  // Detail variety
  console.log(`${'='.repeat(70)}`);
  console.log(`🔍 DETAIL VARIETY VALIDATION`);
  console.log(`${'='.repeat(70)}\n`);

  const varietyResult = validateDetailVariety(posts, 'Reduce anxiety');
  const varietyReport = generateVarietyReport(varietyResult, posts);

  console.log(`Result: ${varietyResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Violations: ${varietyResult.violations.length}`);
  console.log(`Warnings: ${varietyResult.warnings.length}`);
  console.log(`Repetition Rate: ${(varietyResult.repetitionRate * 100).toFixed(1)}%\n`);

  if (varietyResult.violations.length > 0) {
    console.log('Critical Violations:');
    varietyResult.violations.forEach(v => {
      console.log(`  - "${v.detail}" appears in ${v.postIndices.length} posts: ${v.postIndices.map(i => i + 1).join(', ')}`);
    });
    console.log('');
  }

  // Final verdict
  console.log(`${'='.repeat(70)}`);
  console.log(`🎯 FINAL VERDICT`);
  console.log(`${'='.repeat(70)}`);

  const qualityPassed = passCount >= posts.length * 0.7;
  const varietyPassed = varietyResult.passed;

  if (qualityPassed && varietyPassed) {
    console.log(`\n✅ READY FOR PRODUCTION`);
    console.log(`   - Authenticity: ${((passCount / posts.length) * 100).toFixed(0)}% pass rate`);
    console.log(`   - Detail variety: PASSED`);
    console.log(`   - All quality criteria met!\n`);
  } else {
    console.log(`\n⚠️ NEEDS IMPROVEMENT`);
    if (!qualityPassed) {
      console.log(`   - Authenticity: ${((passCount / posts.length) * 100).toFixed(0)}% (need 70%+)`);
    }
    if (!varietyPassed) {
      console.log(`   - Detail variety: ${varietyResult.violations.length} violations`);
    }
    console.log('');
  }

  // Save detailed report
  let report = `# Quality Report: Claude-Written "Reduce anxiety" Posts\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Posts:** ${posts.length}\n\n`;
  report += `## Authenticity Summary\n\n`;
  report += `- Pass Rate: ${passCount}/${posts.length} (${((passCount / posts.length) * 100).toFixed(0)}%)\n`;
  report += `- Average Score: ${avgScore.toFixed(1)}/10\n`;
  report += `- Target: 70% pass rate (7+/10)\n\n`;
  report += `## Detail Variety Summary\n\n`;
  report += `- Result: ${varietyResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `- Violations: ${varietyResult.violations.length}\n`;
  report += `- Warnings: ${varietyResult.warnings.length}\n`;
  report += `- Repetition Rate: ${(varietyResult.repetitionRate * 100).toFixed(1)}%\n\n`;
  report += `---\n\n`;
  report += varietyReport;

  const reportFile = path.join(__dirname, 'output/claude-written-quality-report.md');
  await fs.writeFile(reportFile, report, 'utf-8');

  console.log(`📄 Detailed report saved to: claude-written-quality-report.md\n`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
