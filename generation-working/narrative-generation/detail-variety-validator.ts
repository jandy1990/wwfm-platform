/**
 * Detail Variety Validator
 *
 * Prevents template detection by ensuring no specific details are repeated
 * across multiple posts in a batch.
 */

import { GeneratedPost } from './pattern-templates';

export interface DetailViolation {
  detail: string;
  count: number;
  posts: number[];
  type: 'name' | 'timestamp' | 'medication' | 'cost' | 'product' | 'other';
}

export interface DetailVarietyResult {
  passed: boolean;
  violations: DetailViolation[];
  warnings: DetailViolation[];
  totalDetails: number;
  uniqueDetails: number;
  repetitionRate: number;
  recommendation: string;
}

/**
 * Extract named entities and specific details from posts
 */
export const extractDetails = (content: string): Map<string, string[]> => {
  const details = new Map<string, string[]>();

  // Extract person names (Dr. [Name], therapist names)
  const namePattern = /(?:Dr\.|Doctor)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const names: string[] = [];
  let match;
  while ((match = namePattern.exec(content)) !== null) {
    names.push(match[0]); // Full match including "Dr."
  }
  if (names.length > 0) details.set('names', names);

  // Extract timestamps
  const timestampPattern = /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/g;
  const timestamps = content.match(timestampPattern) || [];
  if (timestamps.length > 0) details.set('timestamps', timestamps);

  // Extract medications (word + dosage)
  const medicationPattern = /(?:Lexapro|Zoloft|Prozac|Wellbutrin|Buspar|Sertraline|Celexa|Paxil|Effexor|Cymbalta)\s+\d+\s*mg/gi;
  const medications = content.match(medicationPattern) || [];
  if (medications.length > 0) details.set('medications', medications);

  // Extract therapy costs
  const costPattern = /\$\d+(?:,\d{3})*(?:\.\d{2})?(?:\/(?:session|month|week|year))?/g;
  const costs = content.match(costPattern) || [];
  if (costs.length > 0) details.set('costs', costs);

  // Extract product names (apps, books, brands)
  const productPattern = /(?:Calm|Headspace|BetterHelp|Talkspace|CeraVe|Neutrogena|MyFitnessPal|Notion|Evernote)\s*(?:app|App)?/gi;
  const products = content.match(productPattern) || [];
  if (products.length > 0) details.set('products', products);

  // Extract therapy types
  const therapyPattern = /\b(?:CBT|DBT|EMDR|ACT|psychodynamic|somatic|cognitive[- ]behavioral)\s*(?:therapy)?/gi;
  const therapies = content.match(therapyPattern) || [];
  if (therapies.length > 0) details.set('therapies', therapies);

  return details;
};

/**
 * Validate detail variety across a batch of posts
 */
export const validateDetailVariety = (posts: GeneratedPost[]): DetailVarietyResult => {
  // Track all details and which posts they appear in
  const detailOccurrences = new Map<string, number[]>();

  posts.forEach((post, index) => {
    const details = extractDetails(post.content);

    details.forEach((values, type) => {
      values.forEach(detail => {
        const normalizedDetail = detail.trim().toLowerCase();
        if (!detailOccurrences.has(normalizedDetail)) {
          detailOccurrences.set(normalizedDetail, []);
        }
        detailOccurrences.get(normalizedDetail)!.push(index + 1);
      });
    });
  });

  // Identify violations (appears in >2 posts) and warnings (appears in 2 posts)
  const violations: DetailViolation[] = [];
  const warnings: DetailViolation[] = [];

  detailOccurrences.forEach((postIndices, detail) => {
    const count = postIndices.length;
    const uniquePosts = [...new Set(postIndices)];

    if (uniquePosts.length > 2) {
      violations.push({
        detail,
        count: uniquePosts.length,
        posts: uniquePosts.sort((a, b) => a - b),
        type: categorizeDetail(detail)
      });
    } else if (uniquePosts.length === 2) {
      warnings.push({
        detail,
        count: uniquePosts.length,
        posts: uniquePosts.sort((a, b) => a - b),
        type: categorizeDetail(detail)
      });
    }
  });

  // Sort by severity (most repeated first)
  violations.sort((a, b) => b.count - a.count);
  warnings.sort((a, b) => b.count - a.count);

  const totalDetails = detailOccurrences.size;
  const uniqueDetails = Array.from(detailOccurrences.values()).filter(posts => posts.length === 1).length;
  const repetitionRate = totalDetails > 0 ? (totalDetails - uniqueDetails) / totalDetails : 0;

  // Generate recommendation
  let recommendation: string;
  if (violations.length === 0 && warnings.length === 0) {
    recommendation = '✅ EXCELLENT - All details are unique across posts';
  } else if (violations.length === 0) {
    recommendation = `⚠️ ACCEPTABLE - ${warnings.length} details appear in 2 posts (monitor but okay)`;
  } else if (violations.length <= 2) {
    recommendation = `❌ NEEDS FIX - ${violations.length} critical violations (regenerate affected posts)`;
  } else {
    recommendation = `❌ REGENERATE BATCH - ${violations.length} violations indicate template detection risk`;
  }

  return {
    passed: violations.length === 0,
    violations,
    warnings,
    totalDetails,
    uniqueDetails,
    repetitionRate,
    recommendation
  };
};

/**
 * Categorize a detail by type
 */
const categorizeDetail = (detail: string): DetailViolation['type'] => {
  if (detail.includes('dr.') || detail.includes('doctor')) return 'name';
  if (/\d{1,2}:\d{2}/.test(detail)) return 'timestamp';
  if (/(?:lexapro|zoloft|prozac|wellbutrin|buspar|sertraline)/i.test(detail)) return 'medication';
  if (detail.startsWith('$')) return 'cost';
  if (/(?:calm|headspace|cerave|notion)/i.test(detail)) return 'product';
  return 'other';
};

/**
 * Generate a detailed variety report
 */
export const generateVarietyReport = (result: DetailVarietyResult, posts: GeneratedPost[]): string => {
  let report = '# Detail Variety Report\n\n';

  report += `**Overall Result:** ${result.recommendation}\n\n`;
  report += `**Statistics:**\n`;
  report += `- Total Details Extracted: ${result.totalDetails}\n`;
  report += `- Unique Details: ${result.uniqueDetails}\n`;
  report += `- Repetition Rate: ${(result.repetitionRate * 100).toFixed(1)}%\n`;
  report += `- Critical Violations: ${result.violations.length}\n`;
  report += `- Warnings: ${result.warnings.length}\n\n`;

  if (result.violations.length > 0) {
    report += '## 🚨 Critical Violations (Detail appears in >2 posts)\n\n';
    result.violations.forEach((violation, index) => {
      report += `${index + 1}. **"${violation.detail}"** (${violation.type})\n`;
      report += `   - Appears in ${violation.count} posts: ${violation.posts.join(', ')}\n`;
      report += `   - Action: Regenerate these posts with different details\n\n`;
    });
  }

  if (result.warnings.length > 0) {
    report += '## ⚠️ Warnings (Detail appears in 2 posts)\n\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. **"${warning.detail}"** (${warning.type})\n`;
      report += `   - Appears in posts: ${warning.posts.join(', ')}\n`;
      report += `   - Status: Acceptable but monitor\n\n`;
    });
  }

  if (result.passed) {
    report += '## ✅ All Checks Passed\n\n';
    report += 'No details are repeated across more than 2 posts. ';
    report += 'This batch has good variety and low template detection risk.\n';
  }

  // Add detail extraction summary by post
  report += '\n## Detail Extraction by Post\n\n';
  posts.forEach((post, index) => {
    const details = extractDetails(post.content);
    const detailCount = Array.from(details.values()).reduce((sum, arr) => sum + arr.length, 0);

    report += `**Post ${index + 1}** (${post.flairTypes.join(' + ')}): ${detailCount} details extracted\n`;
    details.forEach((values, type) => {
      report += `- ${type}: ${values.join(', ')}\n`;
    });
    report += '\n';
  });

  return report;
};

/**
 * Get recommendations for fixing violations
 */
export const getFixRecommendations = (result: DetailVarietyResult): string[] => {
  const recommendations: string[] = [];

  if (result.violations.length === 0) {
    return ['✅ No fixes needed - detail variety is excellent'];
  }

  // Group violations by type
  const nameViolations = result.violations.filter(v => v.type === 'name');
  const timestampViolations = result.violations.filter(v => v.type === 'timestamp');
  const medicationViolations = result.violations.filter(v => v.type === 'medication');
  const costViolations = result.violations.filter(v => v.type === 'cost');

  if (nameViolations.length > 0) {
    recommendations.push(
      `🔧 Fix ${nameViolations.length} repeated names: Use variety pool - Dr. Sarah Chen, Dr. Marcus Williams, Dr. Elena Rodriguez, Dr. James Thompson, Dr. Priya Patel`
    );
  }

  if (timestampViolations.length > 0) {
    recommendations.push(
      `🔧 Fix ${timestampViolations.length} repeated timestamps: Use variety pool - 2:47 AM, 3:15 AM, 4:23 AM, 11:47 PM, 1:34 AM`
    );
  }

  if (medicationViolations.length > 0) {
    recommendations.push(
      `🔧 Fix ${medicationViolations.length} repeated medications: Use variety pool - Lexapro, Zoloft, Prozac, Wellbutrin, Buspar, Sertraline`
    );
  }

  if (costViolations.length > 0) {
    recommendations.push(
      `🔧 Fix ${costViolations.length} repeated costs: Vary therapy costs ($80-$250/session range), medication costs ($12-$45/month)`
    );
  }

  // Add specific post regeneration guidance
  const postsToRegenerate = new Set<number>();
  result.violations.forEach(v => v.posts.forEach(p => postsToRegenerate.add(p)));

  if (postsToRegenerate.size > 0) {
    recommendations.push(
      `📝 Regenerate posts: ${Array.from(postsToRegenerate).sort((a, b) => a - b).join(', ')}`
    );
  }

  return recommendations;
};
