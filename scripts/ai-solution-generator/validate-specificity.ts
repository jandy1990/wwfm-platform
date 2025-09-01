/**
 * Validation module to ensure AI-generated solutions meet specificity requirements
 * and will pass the platform's search filters
 */

import { categorizeSearchTerm, isValidSolution } from '../../lib/solutions/categorization';

// Terms that MUST NOT appear alone (from categorization.ts)
const BLOCKED_GENERIC_TERMS = [
  // Therapy & counseling generics
  'therapy', 'counseling', 'counselor', 'therapist', 'psychotherapy',
  'talk therapy', 'mental health support', 'professional help',
  
  // Medical generics  
  'medication', 'medicine', 'prescription', 'drug', 'pharmaceutical',
  'doctor', 'physician', 'psychiatrist', 'medical professional',
  
  // Wellness generics
  'meditation', 'mindfulness', 'breathing', 'relaxation', 'yoga',
  'exercise', 'workout', 'fitness', 'physical activity',
  
  // Supplement generics
  'supplement', 'vitamin', 'mineral', 'nutrient', 'natural remedy',
  'herb', 'herbal', 'holistic', 'alternative medicine',
  
  // Support generics
  'support group', 'community', 'group therapy', 'peer support',
  'online community', 'forum', 'social support',
  
  // Self-help generics
  'self-help', 'self-care', 'personal development', 'self-improvement',
  'journaling', 'reflection', 'introspection', 'awareness',
  
  // Diet generics
  'diet', 'nutrition', 'eating plan', 'meal plan', 'food',
  'healthy eating', 'dietary changes', 'nutritional support'
];

/**
 * Examples of good specific solutions that should pass
 */
const GOOD_EXAMPLES = [
  'Headspace anxiety pack',
  'Calm app 7-day anxiety program',
  'BetterHelp online CBT therapy',
  'Talkspace couples counseling',
  'Couch to 5K running app',
  'StrongLifts 5x5 program',
  'You Need A Budget (YNAB) app',
  'The Five Minute Journal',
  '4-7-8 breathing technique',
  'Wim Hof Method breathing exercises',
  'Nature Made Vitamin D3 2000 IU',
  'NOW Foods Magnesium Glycinate 200mg',
  'The 7 Habits of Highly Effective People',
  'Atomic Habits by James Clear',
  'Crucial Conversations workshop',
  'Dale Carnegie public speaking course'
];

/**
 * Examples of bad vague solutions that should fail
 */
const BAD_EXAMPLES = [
  'meditation',
  'therapy',
  'exercise',
  'mindfulness practice',
  'breathing exercises',
  'support groups',
  'journaling',
  'yoga',
  'counseling',
  'medication',
  'supplements',
  'self-care',
  'stress management',
  'relaxation techniques',
  'healthy diet'
];

export interface SpecificityCheck {
  isSpecific: boolean;
  isGoogleable: boolean;
  passesFilters: boolean;
  failureReasons: string[];
}

/**
 * Comprehensive check for solution specificity
 */
export function checkSpecificity(solution: string): SpecificityCheck {
  const result: SpecificityCheck = {
    isSpecific: true,
    isGoogleable: true,
    passesFilters: true,
    failureReasons: []
  };

  const lowerSolution = solution.toLowerCase().trim();

  // Check 1: Is it just a blocked generic term?
  for (const generic of BLOCKED_GENERIC_TERMS) {
    if (lowerSolution === generic || 
        lowerSolution === `try ${generic}` ||
        lowerSolution === `practice ${generic}` ||
        lowerSolution === `${generic} practice` ||
        lowerSolution === `${generic} exercises` ||
        lowerSolution === `${generic} techniques`) {
      result.isSpecific = false;
      result.failureReasons.push(`Too generic: "${generic}" needs specifics`);
    }
  }

  // Check 2: Does it have specificity indicators?
  const hasNumbers = /\d/.test(solution);
  const hasProperNoun = /[A-Z][a-z]+/.test(solution) && solution !== solution.charAt(0).toUpperCase() + solution.slice(1).toLowerCase();
  const hasBrandOrApp = /\b(app|App|APP)\b/.test(solution) || hasProperNoun;
  const hasAuthor = /\bby\s+[A-Z]/.test(solution);
  const hasSpecificProtocol = /\d+[-x]\d+/.test(solution) || /\d+\s*(minute|hour|day|week)s?/.test(solution);

  const specificityScore = [hasNumbers, hasProperNoun, hasBrandOrApp, hasAuthor, hasSpecificProtocol]
    .filter(Boolean).length;

  if (specificityScore === 0) {
    result.isSpecific = false;
    result.isGoogleable = false;
    result.failureReasons.push('No specificity indicators (numbers, brands, authors, etc.)');
  }

  // Check 3: Would it be googleable?
  if (!hasProperNoun && !hasNumbers && !hasAuthor) {
    result.isGoogleable = false;
    result.failureReasons.push('Not googleable - needs proper nouns, numbers, or authors');
  }

  // Check 4: Does it pass the actual platform filters?
  if (!isValidSolution(solution)) {
    result.passesFilters = false;
    result.failureReasons.push('Blocked by platform quality filters');
  }

  // Additional quality checks
  if (solution.length < 5) {
    result.isSpecific = false;
    result.failureReasons.push('Too short - needs more detail');
  }

  if (solution.split(' ').length > 10) {
    result.isSpecific = false;
    result.failureReasons.push('Too long - should be a concise product/method name');
  }

  return result;
}

/**
 * Batch validate an array of solutions
 */
export function validateSolutions(solutions: string[]): {
  valid: string[];
  invalid: Array<{ solution: string; reasons: string[] }>;
  stats: {
    total: number;
    valid: number;
    invalid: number;
    passRate: number;
  };
} {
  const valid: string[] = [];
  const invalid: Array<{ solution: string; reasons: string[] }> = [];

  for (const solution of solutions) {
    const check = checkSpecificity(solution);
    
    if (check.isSpecific && check.isGoogleable && check.passesFilters) {
      valid.push(solution);
    } else {
      invalid.push({
        solution,
        reasons: check.failureReasons
      });
    }
  }

  return {
    valid,
    invalid,
    stats: {
      total: solutions.length,
      valid: valid.length,
      invalid: invalid.length,
      passRate: (valid.length / solutions.length) * 100
    }
  };
}

/**
 * Test the validator with known good and bad examples
 */
export function runValidationTests(): void {
  console.log('🧪 Testing Specificity Validator\n');
  console.log('=' .repeat(50));
  
  console.log('\n✅ Testing GOOD examples (should pass):\n');
  let goodPassed = 0;
  for (const example of GOOD_EXAMPLES) {
    const check = checkSpecificity(example);
    const passed = check.isSpecific && check.isGoogleable && check.passesFilters;
    goodPassed += passed ? 1 : 0;
    
    console.log(`${passed ? '✅' : '❌'} "${example}"`);
    if (!passed) {
      console.log(`   Failures: ${check.failureReasons.join(', ')}`);
    }
  }
  
  console.log('\n❌ Testing BAD examples (should fail):\n');
  let badFailed = 0;
  for (const example of BAD_EXAMPLES) {
    const check = checkSpecificity(example);
    const passed = check.isSpecific && check.isGoogleable && check.passesFilters;
    badFailed += !passed ? 1 : 0;
    
    console.log(`${!passed ? '✅' : '❌'} "${example}" correctly rejected`);
    if (!passed) {
      console.log(`   Reasons: ${check.failureReasons.join(', ')}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Results:');
  console.log(`Good examples: ${goodPassed}/${GOOD_EXAMPLES.length} passed`);
  console.log(`Bad examples: ${badFailed}/${BAD_EXAMPLES.length} correctly rejected`);
  
  const totalScore = ((goodPassed + badFailed) / (GOOD_EXAMPLES.length + BAD_EXAMPLES.length)) * 100;
  console.log(`\nOverall accuracy: ${totalScore.toFixed(1)}%`);
}

// Run tests if called directly
if (require.main === module) {
  runValidationTests();
}