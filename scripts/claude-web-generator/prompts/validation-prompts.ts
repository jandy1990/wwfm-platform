/**
 * Validation Prompts for Claude Web
 *
 * Comprehensive validation checks run BEFORE inserting solutions to database:
 * 1. Laugh Test - Title quality ("friend test")
 * 2. Evidence Check - Effectiveness rating justification
 * 3. Category Check - Correct categorization
 * 4. Duplication Check - Similar existing solutions
 */

export interface LaughTestResult {
  passes: boolean
  issues: string[]
  suggestedFix?: string
}

export interface EvidenceCheckResult {
  passes: boolean
  rating: number
  hasRationale: boolean
  rationaleQuality: 'strong' | 'moderate' | 'weak' | 'missing'
  issues: string[]
}

export interface CategoryCheckResult {
  passes: boolean
  suggestedCategory: string
  confidence: number
  reasoning: string
}

/**
 * Laugh Test Validation
 *
 * The "friend test": Would you actually say this title to a friend?
 */
export function getLaughTestPrompt(title: string): string {
  return `# Laugh Test Validation

Evaluate if this solution title passes the "friend test":

**Title**: "${title}"

## The Friend Test
Would you naturally say this to a friend?

**❌ FAILS**: "Prescription antidepressant (Sertraline)", "Therapy like CBT", "I tried Headspace", "e.g. meditation app", "Yoga" (too generic)

**✅ PASSES**: "Sertraline (Zoloft)", "CBT with therapist", "Headspace App", "Hatha yoga", "Couch to 5K"

## Validation Checklist:

Check for these **automatic failures**:
- [ ] Contains "like", "such as", "e.g.", "for example", "including"
- [ ] Contains "I tried", "I used", "I started", "I'm using"
- [ ] Contains "(via X)", "(by X)" placeholder patterns
- [ ] Has generic descriptor prefix: "Prescription X", "Therapy Y", "App for Z", "Book:", "Medication:"
- [ ] Has parentheses pattern: "Generic (Specific)"
- [ ] Single word solution: "Yoga", "Journaling", "Meditation" (needs specificity)
- [ ] Too verbose or conversational
- [ ] Multiple solutions in one title (should be separate solutions)

## Your Task:

Respond with JSON:

\`\`\`json
{
  "passes": true/false,
  "issues": ["List any issues found"],
  "suggestedFix": "Corrected title (if fails)"
}
\`\`\`

### Examples:

**Input**: "Nicotine replacement therapy like Nicoderm CQ"
**Output**:
\`\`\`json
{
  "passes": false,
  "issues": [
    "Contains 'like' pattern - fails friend test",
    "Generic descriptor prefix: 'Nicotine replacement therapy'"
  ],
  "suggestedFix": "Nicoderm CQ patches"
}
\`\`\`

**Input**: "Headspace App"
**Output**:
\`\`\`json
{
  "passes": true,
  "issues": [],
  "suggestedFix": null
}
\`\`\`

Now validate: "${title}"`
}

/**
 * Evidence Check Validation
 *
 * Verify effectiveness rating is backed by actual evidence
 */
export function getEvidenceCheckPrompt(
  title: string,
  effectiveness: number,
  rationale?: string
): string {
  return `# Evidence Check Validation

Evaluate if this effectiveness rating is justified by evidence:

**Solution**: "${title}"
**Effectiveness Rating**: ${effectiveness}/5.0
**Rationale**: "${rationale || 'MISSING'}"

## Evidence Standards:

- **4.5-5.0**: RCTs, meta-analyses, >70% success rates, widely recommended
- **4.0-4.4**: Multiple studies, commonly effective, 50-70% success rates
- **3.5-3.9**: Some studies, works for many, 30-50% success rates
- **3.0-3.4**: Anecdotal/emerging, works for some, <30% success rates

## CRITICAL: Generic vs Specific Solution Rating Caps

**GENERIC = No brand/program name = Max 4.0**
- Therapy types: "CBT", "EMDR", "Psychotherapy"
- Product types: "Weighted blanket", "White noise machine"
- Practice types: "Yoga", "Meditation", "Journaling"
- Platform only: "BetterHelp", "Therapy with licensed therapist"

**SPECIFIC = Has brand/program/dosage = Can exceed 4.0**
- Named programs: "Sleepio", "Headspace App"
- Medications with dosage: "Sertraline 50mg", "Melatonin 3mg"
- Products with brand: "YnM Weighted Blanket", "Hatch Restore"
- Specific techniques: "4-7-8 breathing", "Morning Pages"

**Key Test: Can you buy/sign up for THIS EXACT thing?**
- ❌ No → Generic → 4.0 max
- ✅ Yes → Specific → 4.5+ OK if evidence supports it

## Rationale Quality:

**✅ Strong**: Cites studies/trials/data, mentions success rates, matches rating level
**❌ Weak**: Vague ("seems effective"), no evidence, speculative ("should work")

## Your Task:

Respond with JSON:

\`\`\`json
{
  "passes": true/false,
  "rating": ${effectiveness},
  "hasRationale": true/false,
  "rationaleQuality": "strong"/"moderate"/"weak"/"missing",
  "issues": ["List any issues"]
}
\`\`\`

### Examples:

**Input**:
- Title: "Sertraline (Zoloft)"
- Rating: 4.3
- Rationale: "Multiple RCTs show 60-70% response rate. Widely prescribed first-line treatment with decades of safety data."

**Output**:
\`\`\`json
{
  "passes": true,
  "rating": 4.3,
  "hasRationale": true,
  "rationaleQuality": "strong",
  "issues": []
}
\`\`\`

**Input**:
- Title: "Random supplement"
- Rating: 4.8
- Rationale: "Seems like it would help"

**Output**:
\`\`\`json
{
  "passes": false,
  "rating": 4.8,
  "hasRationale": true,
  "rationaleQuality": "weak",
  "issues": [
    "Rating 4.8 requires strong evidence (RCTs, meta-analyses)",
    "Rationale is speculative, no specific evidence cited",
    "Vague language ('seems like') not acceptable for high rating"
  ]
}
\`\`\`

Now validate the solution above.`
}

/**
 * Category Check Validation
 *
 * Verify solution is in the correct category
 */
export function getCategoryCheckPrompt(
  title: string,
  description: string,
  assignedCategory: string
): string {
  return `# Category Check Validation

Verify if this solution is in the correct category:

**Solution**: "${title}"
**Description**: "${description}"
**Assigned Category**: "${assignedCategory}"

## Common Miscategorizations:

**Products you buy → Use product category** (not habits_routines):
- NRT patches → medications | Skincare regimen → beauty_skincare | Journal book → books_courses

**Primary focus determines category**:
- Mindful walking → meditation_mindfulness (focus is meditation, not exercise)

## Key Categories:

**You take**: medications, supplements_vitamins, natural_remedies
**You see**: therapists_counselors, doctors_specialists, coaches_mentors
**You do**: meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep
**You buy**: products_devices, beauty_skincare, apps_software, books_courses, financial_products
**You join**: groups_communities, support_groups, hobbies_activities

## Your Task:

Respond with JSON:

\`\`\`json
{
  "passes": true/false,
  "suggestedCategory": "correct_category",
  "confidence": 0.0-1.0,
  "reasoning": "Explanation of why"
}
\`\`\`

### Examples:

**Input**:
- Title: "Nicotine Replacement Therapy patches"
- Description: "FDA-approved medication patches that deliver nicotine transdermally"
- Assigned: "habits_routines"

**Output**:
\`\`\`json
{
  "passes": false,
  "suggestedCategory": "medications",
  "confidence": 0.95,
  "reasoning": "NRT patches are FDA-approved medications you purchase and use, not a self-directed habit. Product you buy = product category."
}
\`\`\`

**Input**:
- Title: "Morning Pages journaling"
- Description: "Daily freewriting practice of 3 pages each morning"
- Assigned: "habits_routines"

**Output**:
\`\`\`json
{
  "passes": true,
  "suggestedCategory": "habits_routines",
  "confidence": 1.0,
  "reasoning": "Self-directed daily practice with no product purchase. Correctly categorized as habit/routine."
}
\`\`\`

Now validate the solution above.`
}

/**
 * Duplication Check Query
 *
 * Generate database query to check for similar solutions
 */
export function getDuplicationCheckQuery(
  title: string,
  category: string
): string {
  // This will be used with MCP Supabase to check for duplicates
  return `
SELECT
  s.id,
  s.title,
  s.solution_category,
  s.description
FROM solutions s
WHERE s.solution_category = '${category}'
AND (
  LOWER(s.title) LIKE '%${title.toLowerCase().split(' ').slice(0, 3).join('%')}%'
  OR SIMILARITY(LOWER(s.title), LOWER('${title}')) > 0.6
)
LIMIT 5;
`.trim()
}

/**
 * Generate comprehensive validation report
 */
export function getValidationReportPrompt(results: {
  laughTest: LaughTestResult[]
  evidenceCheck: EvidenceCheckResult[]
  categoryCheck: CategoryCheckResult[]
  duplicates: any[]
}): string {
  const totalSolutions = results.laughTest.length
  const laughTestFailures = results.laughTest.filter(r => !r.passes).length
  const evidenceCheckFailures = results.evidenceCheck.filter(r => !r.passes).length
  const categoryCheckFailures = results.categoryCheck.filter(r => !r.passes).length
  const duplicatesFound = results.duplicates.length

  return `
# Validation Report

## Summary
- **Total Solutions**: ${totalSolutions}
- **Laugh Test Failures**: ${laughTestFailures}
- **Evidence Check Failures**: ${evidenceCheckFailures}
- **Category Check Failures**: ${categoryCheckFailures}
- **Duplicates Found**: ${duplicatesFound}

## Pass Rate
- **Overall**: ${((totalSolutions - laughTestFailures - evidenceCheckFailures - categoryCheckFailures) / totalSolutions * 100).toFixed(1)}%
${laughTestFailures > 0 ? `\n### Laugh Test Failures:\n${results.laughTest.filter(r => !r.passes).map(r => `- Issues: ${r.issues.join(', ')}\n  Suggested Fix: ${r.suggestedFix}`).join('\n')}` : ''}
${evidenceCheckFailures > 0 ? `\n### Evidence Check Failures:\n${results.evidenceCheck.filter(r => !r.passes).map(r => `- Issues: ${r.issues.join(', ')}`).join('\n')}` : ''}
${categoryCheckFailures > 0 ? `\n### Category Check Failures:\n${results.categoryCheck.filter(r => !r.passes).map((r, i) => `- ${results.laughTest[i]} → Suggested: ${r.suggestedCategory}`).join('\n')}` : ''}
${duplicatesFound > 0 ? `\n### Duplicates Found:\n${results.duplicates.map(d => `- ${d.title} (ID: ${d.id})`).join('\n')}` : ''}

## Action Required
${laughTestFailures + evidenceCheckFailures + categoryCheckFailures + duplicatesFound === 0
  ? '✅ All solutions pass validation. Ready to insert to database.'
  : `⚠️  ${laughTestFailures + evidenceCheckFailures + categoryCheckFailures + duplicatesFound} issues found. Fix before inserting.`}
`
}
