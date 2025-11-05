/**
 * Validation Pipeline for Claude Web Generator
 *
 * Real-time validation BEFORE inserting solutions to database.
 * Five comprehensive checks:
 * 1. Laugh Test - Title quality
 * 2. Evidence Check - Effectiveness justification
 * 3. Category Check - Correct categorization
 * 4. Array Field Check - side_effects/challenges percentages (HIGH PRIORITY)
 * 5. Duplicate Check - Similar existing solutions
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  getLaughTestPrompt,
  getEvidenceCheckPrompt,
  getCategoryCheckPrompt,
  getDuplicationCheckQuery,
  LaughTestResult,
  EvidenceCheckResult,
  CategoryCheckResult
} from '../prompts/validation-prompts'
import {
  validateArrayField,
  ArrayFieldValidationResult
} from './array-field-validator'

export interface Solution {
  title: string
  description: string
  category: string
  effectiveness: number
  effectiveness_rationale?: string
  fields?: Record<string, any>
}

export interface ValidationResult {
  passed: boolean
  solution: Solution
  laughTest: LaughTestResult
  evidenceCheck: EvidenceCheckResult
  categoryCheck: CategoryCheckResult
  arrayFieldCheck: ArrayFieldValidationResult
  duplicates: any[]
  issues: string[]
}

export interface ValidationSummary {
  totalSolutions: number
  passed: number
  failed: number
  laughTestFailures: number
  evidenceCheckFailures: number
  categoryCheckFailures: number
  arrayFieldFailures: number
  duplicatesFound: number
  results: ValidationResult[]
}

/**
 * Validate a single solution through all checks
 */
export async function validateSolution(
  solution: Solution,
  supabase: SupabaseClient,
  claudeGenerateContent: (prompt: string) => Promise<string>
): Promise<ValidationResult> {
  const issues: string[] = []

  // 1. Laugh Test (Title Quality)
  const laughTest = await runLaughTest(solution.title, claudeGenerateContent)
  if (!laughTest.passes) {
    issues.push(`Laugh Test: ${laughTest.issues.join(', ')}`)
  }

  // 2. Evidence Check (Effectiveness Justification)
  const evidenceCheck = await runEvidenceCheck(
    solution.title,
    solution.effectiveness,
    solution.effectiveness_rationale,
    claudeGenerateContent
  )
  if (!evidenceCheck.passes) {
    issues.push(`Evidence Check: ${evidenceCheck.issues.join(', ')}`)
  }

  // 3. Category Check (Correct Categorization)
  const categoryCheck = await runCategoryCheck(
    solution.title,
    solution.description,
    solution.category,
    claudeGenerateContent
  )
  if (!categoryCheck.passes) {
    issues.push(`Category Check: Should be "${categoryCheck.suggestedCategory}" not "${solution.category}"`)
  }

  // 4. Array Field Check (HIGH PRIORITY - side_effects/challenges percentages)
  const arrayFieldCheck = validateArrayField({
    title: solution.title,
    category: solution.category,
    fields: solution.fields || {}
  })
  if (!arrayFieldCheck.passed) {
    issues.push(`Array Field: ${arrayFieldCheck.issues.join(', ')}`)
  }

  // 5. Duplicate Check (Similar Solutions)
  const duplicates = await runDuplicateCheck(solution.title, solution.category, supabase)
  if (duplicates.length > 0) {
    issues.push(`Duplicates: Found ${duplicates.length} similar solutions`)
  }

  const passed =
    laughTest.passes &&
    evidenceCheck.passes &&
    categoryCheck.passes &&
    arrayFieldCheck.passed &&
    duplicates.length === 0

  return {
    passed,
    solution,
    laughTest,
    evidenceCheck,
    categoryCheck,
    arrayFieldCheck,
    duplicates,
    issues
  }
}

/**
 * Validate a batch of solutions
 */
export async function validateSolutionBatch(
  solutions: Solution[],
  supabase: SupabaseClient,
  claudeGenerateContent: (prompt: string) => Promise<string>
): Promise<ValidationSummary> {
  console.log(`\n🔍 Validating ${solutions.length} solutions...`)

  const results: ValidationResult[] = []

  for (const solution of solutions) {
    console.log(`   Validating: ${solution.title}`)
    const result = await validateSolution(solution, supabase, claudeGenerateContent)

    if (result.passed) {
      console.log(`   ✅ Passed all checks`)
    } else {
      console.log(`   ⚠️  Issues: ${result.issues.join('; ')}`)
    }

    results.push(result)
  }

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const laughTestFailures = results.filter(r => !r.laughTest.passes).length
  const evidenceCheckFailures = results.filter(r => !r.evidenceCheck.passes).length
  const categoryCheckFailures = results.filter(r => !r.categoryCheck.passes).length
  const arrayFieldFailures = results.filter(r => !r.arrayFieldCheck.passed).length
  const duplicatesFound = results.reduce((sum, r) => sum + r.duplicates.length, 0)

  console.log(`\n📊 Validation Summary:`)
  console.log(`   Total: ${solutions.length}`)
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ⚠️  Failed: ${failed}`)
  if (laughTestFailures > 0) console.log(`   👎 Laugh Test Failures: ${laughTestFailures}`)
  if (evidenceCheckFailures > 0) console.log(`   📉 Evidence Check Failures: ${evidenceCheckFailures}`)
  if (categoryCheckFailures > 0) console.log(`   🏷️  Category Check Failures: ${categoryCheckFailures}`)
  if (arrayFieldFailures > 0) console.log(`   🔢 Array Field Failures: ${arrayFieldFailures} (missing percentages)`)
  if (duplicatesFound > 0) console.log(`   👥 Duplicates Found: ${duplicatesFound}`)

  return {
    totalSolutions: solutions.length,
    passed,
    failed,
    laughTestFailures,
    evidenceCheckFailures,
    categoryCheckFailures,
    arrayFieldFailures,
    duplicatesFound,
    results
  }
}

/**
 * Run Laugh Test validation
 */
async function runLaughTest(
  title: string,
  claudeGenerateContent: (prompt: string) => Promise<string>
): Promise<LaughTestResult> {
  try {
    const prompt = getLaughTestPrompt(title)
    const response = await claudeGenerateContent(prompt)
    return JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
  } catch (error) {
    console.error(`   ❌ Laugh test error: ${(error as Error).message}`)
    // Fail-safe: Basic pattern checks
    return runBasicLaughTest(title)
  }
}

/**
 * Run Evidence Check validation
 */
async function runEvidenceCheck(
  title: string,
  effectiveness: number,
  rationale: string | undefined,
  claudeGenerateContent: (prompt: string) => Promise<string>
): Promise<EvidenceCheckResult> {
  try {
    const prompt = getEvidenceCheckPrompt(title, effectiveness, rationale)
    const response = await claudeGenerateContent(prompt)
    return JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
  } catch (error) {
    console.error(`   ❌ Evidence check error: ${(error as Error).message}`)
    // Fail-safe: Basic checks
    return {
      passes: effectiveness >= 3.0 && !!rationale && rationale.length > 20,
      rating: effectiveness,
      hasRationale: !!rationale,
      rationaleQuality: rationale && rationale.length > 50 ? 'moderate' : 'weak',
      issues: []
    }
  }
}

/**
 * Run Category Check validation
 */
async function runCategoryCheck(
  title: string,
  description: string,
  assignedCategory: string,
  claudeGenerateContent: (prompt: string) => Promise<string>
): Promise<CategoryCheckResult> {
  try {
    const prompt = getCategoryCheckPrompt(title, description, assignedCategory)
    const response = await claudeGenerateContent(prompt)
    return JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
  } catch (error) {
    console.error(`   ❌ Category check error: ${(error as Error).message}`)
    // Fail-safe: Accept assigned category
    return {
      passes: true,
      suggestedCategory: assignedCategory,
      confidence: 0.5,
      reasoning: 'Failed to validate, accepting assigned category'
    }
  }
}

/**
 * Run Duplicate Check via database query
 */
async function runDuplicateCheck(
  title: string,
  category: string,
  supabase: SupabaseClient
): Promise<any[]> {
  try {
    // Tokenize title for similarity search
    const tokens = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3) // Use first 3 meaningful words

    if (tokens.length === 0) return []

    // Query for similar solutions in same category
    const { data, error } = await supabase
      .from('solutions')
      .select('id, title, solution_category, description')
      .eq('solution_category', category)
      .or(
        tokens.map(token => `title.ilike.%${token}%`).join(',')
      )
      .limit(5)

    if (error) {
      console.error(`   ❌ Duplicate check query error: ${error.message}`)
      return []
    }

    // Filter for actual duplicates (not just partial matches)
    const duplicates = (data || []).filter(existing => {
      const existingTokens = existing.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)

      // Check for significant overlap
      const overlap = tokens.filter(t => existingTokens.includes(t)).length
      return overlap >= Math.min(2, tokens.length * 0.6)
    })

    return duplicates
  } catch (error) {
    console.error(`   ❌ Duplicate check error: ${(error as Error).message}`)
    return []
  }
}

/**
 * Basic laugh test (fail-safe when Claude API fails)
 */
function runBasicLaughTest(title: string): LaughTestResult {
  const issues: string[] = []
  const bannedPatterns = [
    /\blike\b/i,
    /\bsuch as\b/i,
    /\be\.?g\.?\b/i,
    /\bfor example\b/i,
    /\bincluding\b/i,
    /\bI tried\b/i,
    /\bI used\b/i,
    /\bI started\b/i,
    /^(Prescription|Therapy|App for|Program for|Treatment for)\b/i
  ]

  for (const pattern of bannedPatterns) {
    if (pattern.test(title)) {
      issues.push(`Contains banned pattern: ${pattern.source}`)
    }
  }

  const passes = issues.length === 0
  let suggestedFix: string | undefined

  if (!passes) {
    // Basic cleanup
    suggestedFix = title
      .replace(/\b(like|such as|e\.?g\.?|for example|including)\b.+$/i, '')
      .replace(/^(Prescription|Therapy|App for|Program for|Treatment for)\s+/i, '')
      .replace(/\bI (tried|used|started)\s+/i, '')
      .trim()
  }

  return { passes, issues, suggestedFix }
}

/**
 * Auto-fix solutions that fail validation
 */
export function autoFixSolution(solution: Solution, validationResult: ValidationResult): Solution {
  let fixed = { ...solution }

  // Fix title if laugh test failed
  if (!validationResult.laughTest.passes && validationResult.laughTest.suggestedFix) {
    console.log(`   🔧 Auto-fixing title: "${fixed.title}" → "${validationResult.laughTest.suggestedFix}"`)
    fixed.title = validationResult.laughTest.suggestedFix
  }

  // Fix category if check failed
  if (!validationResult.categoryCheck.passes && validationResult.categoryCheck.confidence > 0.8) {
    console.log(
      `   🔧 Auto-fixing category: "${fixed.category}" → "${validationResult.categoryCheck.suggestedCategory}"`
    )
    fixed.category = validationResult.categoryCheck.suggestedCategory
  }

  return fixed
}

/**
 * Filter out solutions with unfixable issues
 */
export function filterValidSolutions(
  validationSummary: ValidationSummary,
  autoFix: boolean = true
): Solution[] {
  const valid: Solution[] = []

  for (const result of validationSummary.results) {
    // Skip duplicates (unfixable)
    if (result.duplicates.length > 0) {
      console.log(`   ⏭️  Skipping duplicate: ${result.solution.title}`)
      continue
    }

    // Auto-fix if enabled
    if (autoFix && !result.passed) {
      const fixed = autoFixSolution(result.solution, result)
      valid.push(fixed)
    } else if (result.passed) {
      valid.push(result.solution)
    } else {
      console.log(`   ⏭️  Skipping unfixable solution: ${result.solution.title}`)
    }
  }

  console.log(`\n✅ ${valid.length}/${validationSummary.totalSolutions} solutions ready for insertion`)

  return valid
}
