/**
 * Version 2 Prompts - Direct category-to-field mapping
 * 
 * Instead of examples, we provide a clear mapping table
 * so Gemini knows exactly which fields to use for each category
 */

import { CATEGORY_FIELDS } from '../config/category-fields'

/**
 * Build a clear category-to-fields mapping table
 */
export function buildCategoryFieldsTable(): string {
  let table = 'CATEGORY -> REQUIRED FIELDS MAPPING:\n\n'
  
  for (const [category, config] of Object.entries(CATEGORY_FIELDS)) {
    table += `${category}:\n`
    table += `  Required fields: ${config.required.join(', ')}\n`
    if (config.arrayField) {
      table += `  Array field: ${config.arrayField}\n`
    }
    if (config.needsVariants) {
      table += `  Needs variants: YES (with amount, unit, form)\n`
    }
    table += '\n'
  }
  
  return table
}

/**
 * Direct solution generation prompt with mapping table
 */
export const V2_SOLUTION_PROMPT = `Based on your training data from medical literature, clinical studies, consumer research, and general knowledge, generate {{LIMIT}} evidence-based solutions for this goal:

Goal: {{GOAL_TITLE}}
Description: {{GOAL_DESCRIPTION}}
Arena: {{ARENA}}

🚨 CRITICAL SPECIFICITY REQUIREMENT:
Every solution MUST be a SPECIFIC product/app/book/method, NOT a generic category.
- ❌ WRONG: "meditation" → ✅ RIGHT: "Headspace anxiety pack"
- ❌ WRONG: "therapy" → ✅ RIGHT: "BetterHelp online CBT"
- ❌ WRONG: "vitamins" → ✅ RIGHT: "Nature Made Vitamin D3 2000 IU"

Solutions MUST be googleable and include brand names, app names, authors, or protocol names.

🎯 FIRST-PERSON SOLUTION NAMING:
- Title each solution exactly the way a real WWFM member would record it for themselves.
- Use the precise product/practice name only: "Sertraline (Zoloft)", "Hatha yoga".
- Never prepend generic descriptors like "Prescription antidepressant", "Yoga practice", "Therapy program".
- Avoid adding words such as "session", "plan", "program", "practice" unless they are part of the official name.
- DO NOT use phrases like "I tried", "I used", "I started" - just the product/method name.
- Examples: "Headspace App" NOT "I tried Headspace App", "BetterHelp" NOT "I used BetterHelp for therapy"

{{CATEGORY_FIELDS_TABLE}}

CRITICAL INSTRUCTIONS:
1. Every solution MUST be a specific implementation that exists and can be googled
2. Include brand names, app names, author names, or specific protocol names
3. Be specific about effectiveness ratings based on actual data you've seen
4. Include both conventional AND alternative approaches where evidence exists
5. Rate effectiveness (3.0-5.0) based on actual research and clinical evidence:
   - 4.5-5.0: Strong evidence (RCTs, meta-analyses, widely recommended, high success rates)
   - 4.0-4.4: Good evidence (multiple studies, commonly effective, reliable results)
   - 3.5-3.9: Moderate evidence (some studies, works for many, mixed results)
   - 3.0-3.4: Limited evidence (anecdotal, works for some, variable results)
   - Below 3.0: Don't include - insufficient evidence
6. Include effectiveness_rationale to ensure ratings are evidence-based (not random)
7. Ensure diversity across categories - not all from one type
8. Include what your training data indicates ACTUALLY WORKS
9. Include ALL required fields for each category (see table above)

Return a JSON array with this structure for each solution:
{
  "title": "Solution name",
  "description": "Brief description",
  "category": "category_name_from_table",
  "effectiveness": 3.0-5.0,
  "effectiveness_rationale": "Evidence basis",
  "fields": {
    // MUST contain EXACTLY the fields from the table for this category
  },
  "variants": [] // Only for medications/supplements_vitamins/natural_remedies/beauty_skincare
}

CATEGORIES - Use EXACT strings from this list:
medications, supplements_vitamins, natural_remedies, beauty_skincare,
therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners,
professional_services, medical_procedures, crisis_resources,
meditation_mindfulness, exercise_movement, habits_routines,
diet_nutrition, sleep, products_devices, books_courses,
apps_software, groups_communities, support_groups,
hobbies_activities, financial_products

🚨 CRITICAL: For dosage categories (medications/supplements_vitamins/natural_remedies/beauty_skincare), you MUST include variants array:
"variants": [
  {"amount": 25, "unit": "mg", "form": "tablet"},
  {"amount": 50, "unit": "mg", "form": "tablet"},
  {"amount": 100, "unit": "mg", "form": "capsule"}
]

DOSAGE CATEGORY RULES (MANDATORY):
- medications: Include 3-5 common dosage variants based on actual prescribing data
  Example: Lexapro → [{"amount": 5, "unit": "mg", "form": "tablet"}, {"amount": 10, "unit": "mg", "form": "tablet"}, {"amount": 20, "unit": "mg", "form": "tablet"}]
- supplements_vitamins: Include 2-4 common dosages
  Example: Vitamin D3 → [{"amount": 1000, "unit": "IU", "form": "softgel"}, {"amount": 2000, "unit": "IU", "form": "softgel"}]
- natural_remedies: Include 2-3 typical strengths
- beauty_skincare: Include concentration percentages
  Example: Retinol Serum → [{"amount": 0.5, "unit": "%", "form": "serum"}, {"amount": 1, "unit": "%", "form": "serum"}]

For NON-dosage categories, use empty array: "variants": []

Example for category "habits_routines" (which requires: startup_cost, ongoing_cost, time_to_results, time_commitment):
{
  "title": "Morning Routine",
  "category": "habits_routines",
  "effectiveness": 4.2,
  "effectiveness_rationale": "Multiple studies show improved productivity and mood",
  "fields": {
    "startup_cost": "Free/No startup cost",
    "ongoing_cost": "Free/No ongoing cost", 
    "time_to_results": "1-2 weeks",
    "time_commitment": "20-30 minutes",
    "challenges": ["Consistency", "Early wake times"]
  },
  "variants": []
}

Example for category "financial_products" (which requires: cost_type, financial_benefit, time_to_results, access_time):
{
  "title": "Index Fund Investment",
  "category": "financial_products",
  "effectiveness": 4.7,
  "effectiveness_rationale": "60-year historical data shows consistent 7-10% annual returns",
  "fields": {
    "cost_type": "Transaction/usage fees",
    "financial_benefit": "$100-250/month saved/earned",
    "time_to_results": "6+ months",
    "access_time": "1-3 business days",
    "challenges": ["Market volatility", "Initial capital"]
  },
  "variants": []
}

Return ONLY valid JSON array. No markdown, no explanations.`

/**
 * Get V2 solution generation prompt
 */
export function getV2SolutionPrompt(
  goalTitle: string,
  goalDescription: string,
  arena: string,
  category: string,
  limit: number
): string {
  const categoryFieldsTable = buildCategoryFieldsTable()
  
  return V2_SOLUTION_PROMPT
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{GOAL_DESCRIPTION}}', goalDescription || '')
    .replace('{{ARENA}}', arena)
    .replace('{{LIMIT}}', limit.toString())
    .replace('{{CATEGORY_FIELDS_TABLE}}', categoryFieldsTable)
}

/**
 * V2 distribution prompt - simpler and clearer
 */
export const V2_DISTRIBUTION_PROMPT = `Based on your training data about real-world usage patterns, clinical data, and user experiences, generate realistic prevalence distributions for this solution.

Solution: {{SOLUTION_TITLE}}
Category: {{CATEGORY}}
Current fields: {{FIELDS}}

Create distributions that reflect:
1. How these actually distribute in practice (from studies, trials, user reports)
2. Common vs rare occurrences based on your training data
3. Typical vs atypical experiences
4. NOT random percentages - use actual patterns you've seen in research

For each field, create a distribution showing how values vary in real-world usage.
Return a JSON object where each field maps to an array of distributions:

{
  "field_name": [
    {"name": "Most common value", "percentage": 40},
    {"name": "Second most common", "percentage": 30},
    {"name": "Third option", "percentage": 20},
    {"name": "Less common", "percentage": 10}
  ]
}

CRITICAL RULES:
- Each field's percentages MUST sum to exactly 100
- Include 3-5 items per field (based on what's common in your training data)
- Use realistic distributions (not uniform) - based on actual patterns from research
- For array fields (side_effects, challenges, barriers, issues):
  * You MUST include the EXACT values from the solution fields
  * These items must appear in the distribution with their exact names
  * Add additional realistic items to reach 100% total
- Base all percentages on actual data patterns you've seen, not arbitrary numbers

Return ONLY valid JSON. No markdown, no explanations.`

/**
 * Get V2 distribution prompt
 */
export function getV2DistributionPrompt(
  solutionTitle: string,
  goalTitle: string,
  fields: any,
  category: string
): string {
  return V2_DISTRIBUTION_PROMPT
    .replace('{{SOLUTION_TITLE}}', solutionTitle)
    .replace('{{CATEGORY}}', category)
    .replace('{{FIELDS}}', JSON.stringify(fields, null, 2))
}
