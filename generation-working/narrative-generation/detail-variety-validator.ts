/**
 * Category-Aware Detail Variety Validator
 *
 * Prevents template detection by ensuring no specific details are repeated
 * across multiple posts in a batch. Extracts different details based on
 * narrative category.
 */

import { GeneratedPost } from './pattern-templates';
import { NarrativeCategory } from './narrative-categories';
import { getGoalCategory } from './goal-category-map';

export interface DetailViolation {
  detail: string;
  count: number;
  posts: number[];
  type: 'name' | 'timestamp' | 'medication' | 'supplement' | 'product' | 'cost' | 'therapy' | 'app' | 'wearable' | 'other';
}

export interface DetailVarietyResult {
  passed: boolean;
  violations: DetailViolation[];
  warnings: DetailViolation[];
  totalDetails: number;
  uniqueDetails: number;
  repetitionRate: number;
  recommendation: string;
  category: NarrativeCategory;
}

/**
 * Extract category-appropriate details from posts
 */
export const extractDetailsByCategory = (
  content: string,
  category: NarrativeCategory
): Map<string, string[]> => {
  const details = new Map<string, string[]>();

  // Universal extractors (all categories)
  extractNames(content, details);
  extractCosts(content, details);
  extractTimestamps(content, details);

  // Category-specific extractors
  switch (category) {
    case 'mental_health':
      extractMedications(content, details);
      extractTherapyTypes(content, details);
      extractMentalHealthApps(content, details);
      break;

    case 'physical_health':
    case 'weight_fitness':
      extractSupplements(content, details);
      extractExerciseTypes(content, details);
      extractFitnessApps(content, details);
      extractWearables(content, details);
      break;

    case 'beauty_skincare':
      extractSkincareProducts(content, details);
      extractActiveIngredients(content, details);
      break;

    case 'womens_health':
      extractMedications(content, details); // HRT, birth control
      extractSupplements(content, details);
      break;

    case 'life_skills':
      extractProductivityApps(content, details);
      extractFinancialApps(content, details);
      extractBookTitles(content, details);
      break;
  }

  return details;
};

/**
 * Universal extractors
 */

function extractNames(content: string, details: Map<string, string[]>): void {
  // Extract Dr. names or therapist/coach names
  const namePattern = /(?:Dr\.|Doctor|therapist|coach|derm(?:atologist)?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
  const names: string[] = [];
  let match;
  while ((match = namePattern.exec(content)) !== null) {
    names.push(match[0]);
  }
  if (names.length > 0) details.set('names', names);
}

function extractTimestamps(content: string, details: Map<string, string[]>): void {
  const timestampPattern = /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/g;
  const timestamps = content.match(timestampPattern) || [];
  if (timestamps.length > 0) details.set('timestamps', timestamps);
}

function extractCosts(content: string, details: Map<string, string[]>): void {
  const costPattern = /\$\d+(?:,\d{3})*(?:\.\d{2})?(?:\/(?:session|month|week|year|hour))?/g;
  const costs = content.match(costPattern) || [];
  if (costs.length > 0) details.set('costs', costs);
}

/**
 * Mental Health extractors
 */

function extractMedications(content: string, details: Map<string, string[]>): void {
  // Generic medication pattern: CapitalizedWord + dosage
  // Matches: "Lexapro 10mg", "Zoloft 50mg", "Estradiol 1mg", etc.
  const medPattern = /\b[A-Z][a-z]+(?:ol|ex|in|am|one|ide|ate|ine|pam)\b\s+\d+\s*(?:mg|mcg|IU)/gi;
  const medications = content.match(medPattern) || [];
  if (medications.length > 0) details.set('medications', medications);
}

function extractTherapyTypes(content: string, details: Map<string, string[]>): void {
  const therapyPattern = /\b(?:CBT|DBT|EMDR|ACT|psychodynamic|somatic|cognitive[- ]behavioral|schema|interpersonal|exposure)\s*(?:therapy)?/gi;
  const therapies = content.match(therapyPattern) || [];
  if (therapies.length > 0) details.set('therapies', therapies);
}

function extractMentalHealthApps(content: string, details: Map<string, string[]>): void {
  // Generic app pattern: Capitalized word + "app" or known mental health apps
  const appPattern = /\b(?:Calm|Headspace|BetterHelp|Talkspace|Sanvello|Rootd|Wysa|MindShift|Youper)\b/gi;
  const apps = content.match(appPattern) || [];
  if (apps.length > 0) details.set('apps', apps);
}

/**
 * Physical Health / Fitness extractors
 */

function extractSupplements(content: string, details: Map<string, string[]>): void {
  // Supplement pattern: Common supplement names + dosage
  const suppPattern = /\b(?:Magnesium|Melatonin|Vitamin\s+[A-Z]\d*|CoQ10|Ashwagandha|Omega[- ]?3|Zinc|B12|D3|Calcium|Iron|Biotin|Collagen)\b[^.]{0,20}?\d+\s*(?:mg|mcg|IU)/gi;
  const supplements = content.match(suppPattern) || [];
  if (supplements.length > 0) details.set('supplements', supplements);
}

function extractExerciseTypes(content: string, details: Map<string, string[]>): void {
  const exercisePattern = /\b(?:yoga|running|cycling|swimming|weightlifting|HIIT|Pilates|boxing|CrossFit|walking|hiking|dance|strength training)\b/gi;
  const exercises = content.match(exercisePattern) || [];
  if (exercises.length > 0) details.set('exercises', exercises);
}

function extractFitnessApps(content: string, details: Map<string, string[]>): void {
  const appPattern = /\b(?:MyFitnessPal|Strava|Peloton|Nike\s+Training|Apple\s+Fitness|Fitbod|Strong|Couch\s+to\s+5K)\b/gi;
  const apps = content.match(appPattern) || [];
  if (apps.length > 0) details.set('fitness_apps', apps);
}

function extractWearables(content: string, details: Map<string, string[]>): void {
  const wearablePattern = /\b(?:Fitbit|Oura\s+Ring|Apple\s+Watch|Whoop|Garmin|Amazfit)\b/gi;
  const wearables = content.match(wearablePattern) || [];
  if (wearables.length > 0) details.set('wearables', wearables);
}

/**
 * Beauty/Skincare extractors
 */

function extractSkincareProducts(content: string, details: Map<string, string[]>): void {
  const productPattern = /\b(?:CeraVe|The\s+Ordinary|Neutrogena|La\s+Roche[- ]Posay|Paula'?s?\s+Choice|Tretinoin|Differin|Olaplex|K18|Redken|Briogeo)\b/gi;
  const products = content.match(productPattern) || [];
  if (products.length > 0) details.set('skincare_products', products);
}

function extractActiveIngredients(content: string, details: Map<string, string[]>): void {
  const ingredientPattern = /\b(?:retinol|niacinamide|hyaluronic\s+acid|vitamin\s+C|salicylic\s+acid|benzoyl\s+peroxide|azelaic\s+acid|glycolic\s+acid)\b[^.]{0,20}?\d+(?:\.\d+)?\s*%/gi;
  const ingredients = content.match(ingredientPattern) || [];
  if (ingredients.length > 0) details.set('active_ingredients', ingredients);
}

/**
 * Life Skills extractors
 */

function extractProductivityApps(content: string, details: Map<string, string[]>): void {
  const appPattern = /\b(?:Notion|Todoist|Habitica|Forest|RescueTime|Trello|Asana|TickTick|Any\.do|Evernote)\b/gi;
  const apps = content.match(appPattern) || [];
  if (apps.length > 0) details.set('productivity_apps', apps);
}

function extractFinancialApps(content: string, details: Map<string, string[]>): void {
  const appPattern = /\b(?:YNAB|Mint|EveryDollar|Personal\s+Capital|Acorns|Digit|Qapital|PocketGuard)\b/gi;
  const apps = content.match(appPattern) || [];
  if (apps.length > 0) details.set('financial_apps', apps);
}

function extractBookTitles(content: string, details: Map<string, string[]>): void {
  // Extract quoted book titles
  const bookPattern = /"([^"]+)"\s*(?:by|Book|\(|\n|$)/gi;
  const books: string[] = [];
  let match;
  while ((match = bookPattern.exec(content)) !== null) {
    books.push(`"${match[1]}"`);
  }
  if (books.length > 0) details.set('books', books);
}

/**
 * Validate detail variety across a batch of posts
 */
export const validateDetailVariety = (
  posts: GeneratedPost[],
  goalTitle?: string
): DetailVarietyResult => {

  // Determine category from goal title if provided
  let category: NarrativeCategory = 'mental_health'; // default
  if (goalTitle) {
    try {
      category = getGoalCategory(goalTitle);
    } catch (error) {
      console.warn(`Could not determine category for "${goalTitle}", using mental_health as default`);
    }
  }

  // Track all details and which posts they appear in
  const detailOccurrences = new Map<string, number[]>();

  posts.forEach((post, index) => {
    const details = extractDetailsByCategory(post.content, category);

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
    recommendation,
    category
  };
};

/**
 * Categorize a detail by type
 */
const categorizeDetail = (detail: string): DetailViolation['type'] => {
  if (detail.includes('dr.') || detail.includes('doctor') || detail.includes('therapist')) return 'name';
  if (/\d{1,2}:\d{2}/.test(detail)) return 'timestamp';
  if (/\d+\s*(?:mg|mcg|IU)/.test(detail) && /(?:lexapro|zoloft|prozac|wellbutrin|buspar|sertraline|celexa|paxil|effexor|cymbalta)/i.test(detail)) return 'medication';
  if (/\d+\s*(?:mg|mcg|IU)/.test(detail) && /(?:magnesium|melatonin|vitamin|coq10|ashwagandha|omega|zinc|b12)/i.test(detail)) return 'supplement';
  if (detail.startsWith('$')) return 'cost';
  if (/(?:calm|headspace|betterhelp|notion|todoist|fitbit|oura|apple watch|whoop)/i.test(detail)) return 'product';
  if (/(?:cbt|dbt|emdr|act|psychodynamic|somatic)/i.test(detail)) return 'therapy';
  if (/(?:cerave|ordinary|neutrogena|olaplex|k18)/i.test(detail)) return 'product';
  return 'other';
};

/**
 * Generate a detailed variety report
 */
export const generateVarietyReport = (
  result: DetailVarietyResult,
  posts: GeneratedPost[]
): string => {
  let report = '# Detail Variety Report\\n\\n';

  report += `**Category:** ${result.category}\\n`;
  report += `**Overall Result:** ${result.recommendation}\\n\\n`;
  report += `**Statistics:**\\n`;
  report += `- Total Details Extracted: ${result.totalDetails}\\n`;
  report += `- Unique Details: ${result.uniqueDetails}\\n`;
  report += `- Repetition Rate: ${(result.repetitionRate * 100).toFixed(1)}%\\n`;
  report += `- Critical Violations: ${result.violations.length}\\n`;
  report += `- Warnings: ${result.warnings.length}\\n\\n`;

  if (result.violations.length > 0) {
    report += '## 🚨 Critical Violations (Detail appears in >2 posts)\\n\\n';
    result.violations.forEach((violation, index) => {
      report += `${index + 1}. **"${violation.detail}"** (${violation.type})\\n`;
      report += `   - Appears in ${violation.count} posts: ${violation.posts.join(', ')}\\n`;
      report += `   - Action: Regenerate these posts with different details\\n\\n`;
    });
  }

  if (result.warnings.length > 0) {
    report += '## ⚠️ Warnings (Detail appears in 2 posts)\\n\\n';
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. **"${warning.detail}"** (${warning.type})\\n`;
      report += `   - Appears in posts: ${warning.posts.join(', ')}\\n`;
      report += `   - Status: Acceptable but monitor\\n\\n`;
    });
  }

  if (result.passed) {
    report += '## ✅ All Checks Passed\\n\\n';
    report += 'No details are repeated across more than 2 posts. ';
    report += 'This batch has good variety and low template detection risk.\\n';
  }

  // Add detail extraction summary by post
  report += '\\n## Detail Extraction by Post\\n\\n';
  posts.forEach((post, index) => {
    const details = extractDetailsByCategory(post.content, result.category);
    const detailCount = Array.from(details.values()).reduce((sum, arr) => sum + arr.length, 0);

    report += `**Post ${index + 1}** (${post.flairTypes.join(' + ')}): ${detailCount} details extracted\\n`;
    details.forEach((values, type) => {
      report += `- ${type}: ${values.join(', ')}\\n`;
    });
    report += '\\n';
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
  const violationsByType = result.violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(violationsByType).forEach(([type, count]) => {
    recommendations.push(`🔧 Fix ${count} repeated ${type} detail${count > 1 ? 's' : ''} - ensure AI uses different values from training data`);
  });

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
