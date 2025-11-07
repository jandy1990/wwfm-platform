import * as fs from 'fs';
import * as path from 'path';

interface Solution {
  index: number;
  title: string;
  solution_category: string;
  avg_effectiveness?: number;
}

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total: number;
    with_errors: number;
    with_warnings: number;
  };
}

// Generic terms that indicate lack of specificity
const GENERIC_TERMS = [
  'general', 'basic', 'regular', 'standard',
  'strength training', 'running', 'walking', 'meditation',
  'breathing exercises', 'journaling', 'therapy', 'counseling'
];

// Category names that shouldn't appear in titles
const CATEGORY_WORDS = [
  'medication', 'supplement', 'app', 'software',
  'therapist', 'counselor', 'practitioner',
  'program', 'course', 'book', 'device', 'product'
];

// Exceptions - these are OK even though they contain category words
const ALLOWED_EXCEPTIONS = [
  'meditation', // Can be specific like "Loving-kindness meditation"
  'therapy', // Can be specific like "EMDR therapy"
  'app' // Can be part of brand like "Calm app"
];

function validateTitle(solution: Solution): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const titleLower = solution.title.toLowerCase();

  // Check for generic terms
  for (const term of GENERIC_TERMS) {
    if (titleLower === term || titleLower.startsWith(term + ' ')) {
      errors.push(`Too generic: "${solution.title}" - need specific program/method/brand`);
      break;
    }
  }

  // Check for category words in title (with exceptions)
  for (const word of CATEGORY_WORDS) {
    if (titleLower.includes(word)) {
      // Check if it's an allowed exception pattern
      const isException = ALLOWED_EXCEPTIONS.some(exception =>
        titleLower.includes(exception) && titleLower.includes(word)
      );

      if (!isException) {
        warnings.push(`Category name in title: "${solution.title}" - contains "${word}" (redundant with category: ${solution.solution_category})`);
      }
    }
  }

  // Check for "or" in title (indicates multiple options, should pick one)
  if (titleLower.includes(' or ')) {
    errors.push(`Multiple options in title: "${solution.title}" - choose one specific option`);
  }

  // Check for very short titles (might be too generic)
  if (solution.title.length < 3) {
    errors.push(`Title too short: "${solution.title}" - need more specific name`);
  }

  // Check for excessive length (might include redundant qualifiers)
  if (solution.title.length > 80) {
    warnings.push(`Title very long: "${solution.title}" - consider simplifying`);
  }

  return { errors, warnings };
}

function validateSolutionList(filePath: string): ValidationResult {
  console.log(`Validating solution titles from: ${filePath}\n`);

  // Read file
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContent);

  const solutions: Solution[] = data.solutions || [];
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  let solutionsWithErrors = 0;
  let solutionsWithWarnings = 0;

  // Validate each solution
  solutions.forEach(solution => {
    const { errors, warnings } = validateTitle(solution);

    if (errors.length > 0) {
      solutionsWithErrors++;
      errors.forEach(error => {
        allErrors.push(`[${solution.index}] ${error}`);
      });
    }

    if (warnings.length > 0) {
      solutionsWithWarnings++;
      warnings.forEach(warning => {
        allWarnings.push(`[${solution.index}] ${warning}`);
      });
    }
  });

  // Report results
  console.log('='.repeat(60));
  console.log('TITLE VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Total solutions: ${solutions.length}`);
  console.log(`Solutions with errors: ${solutionsWithErrors}`);
  console.log(`Solutions with warnings: ${solutionsWithWarnings}\n`);

  if (allErrors.length > 0) {
    console.log('❌ ERRORS (must fix before proceeding):');
    allErrors.forEach(error => console.log(`  ${error}`));
    console.log();
  }

  if (allWarnings.length > 0) {
    console.log('⚠️  WARNINGS (recommend fixing):');
    allWarnings.forEach(warning => console.log(`  ${warning}`));
    console.log();
  }

  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log('✅ All titles passed validation!');
  }

  const passed = allErrors.length === 0;
  console.log('\n' + '='.repeat(60));
  console.log(passed ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED');
  console.log('='.repeat(60));

  return {
    passed,
    errors: allErrors,
    warnings: allWarnings,
    stats: {
      total: solutions.length,
      with_errors: solutionsWithErrors,
      with_warnings: solutionsWithWarnings
    }
  };
}

// Run validation
const filePath = process.argv[2] || path.join(__dirname, '../solution-list.json');

try {
  const result = validateSolutionList(filePath);
  process.exit(result.passed ? 0 : 1);
} catch (error) {
  console.error('\n✗ Fatal error:', error);
  process.exit(1);
}
