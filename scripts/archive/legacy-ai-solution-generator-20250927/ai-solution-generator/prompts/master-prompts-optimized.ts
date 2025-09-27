/**
 * Master Prompts for AI Solution Generation - OPTIMIZED VERSION
 * 
 * Updated with Brand Name First strategy to force specificity
 * Based on experimental results showing 70%+ success rate
 */

import { DROPDOWN_OPTIONS, CATEGORY_COST_MAPPING, getDropdownOptionsForField } from '../config/dropdown-options'
import { CATEGORY_FIELDS } from '../config/category-fields'

/**
 * Build the field requirements section with exact dropdown options
 */
export function buildFieldRequirementsForCategory(category: string): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return ''
  
  let requirements = `\nFor category "${category}", include these fields:\n\n`
  
  // Add each required field with guidance for natural values
  for (const field of config.required) {
    const options = getDropdownOptionsForField(category, field)
    requirements += `- ${field}: `
    
    if (field.includes('cost')) {
      requirements += `Realistic cost value (e.g., "$15/month", "$100 one-time", "free")\n`
    } else if (field.includes('time') || field === 'duration') {
      requirements += `Time duration (e.g., "2 weeks", "immediately", "3-4 months")\n`
    } else if (field.includes('frequency')) {
      requirements += `How often (e.g., "twice daily", "3 times per week", "as needed")\n`
    } else {
      requirements += `Appropriate value for this field\n`
    }
  }
  
  // Add array field if present
  if (config.arrayField) {
    requirements += `- ${config.arrayField}: Array with 2-4 items. Common options include: `
    
    // Provide common options for array fields
    const arrayOptions = {
      'side_effects': ['Nausea', 'Headache', 'Dizziness', 'Fatigue', 'Dry mouth', 'Insomnia', 'Weight changes', 'None'],
      'challenges': ['Time constraints', 'Cost', 'Motivation', 'Consistency', 'Technical issues', 'None'],
      'barriers': ['Finding the right provider', 'Cost without insurance', 'Time commitment', 'Location/access', 'None'],
      'issues': ['Quality concerns', 'Durability', 'Customer service', 'Setup difficulty', 'None']
    }
    
    requirements += `${JSON.stringify(arrayOptions[config.arrayField] || ['Item1', 'Item2', 'None'])}\n`
  }
  
  requirements += '\n'
  return requirements
}

/**
 * Build complete field requirements for all categories
 */
export function buildAllFieldRequirements(): string {
  let allRequirements = `
GUIDELINES FOR FIELD VALUES:
============================
1. Provide realistic, natural values based on your training data
2. For costs: Use actual prices (e.g., "$18/month", "$150", "free")
3. For time: Use natural durations (e.g., "2 weeks", "immediately", "about a month")
4. For frequency: Use common expressions (e.g., "twice a day", "every morning", "3 times per week")
5. For array fields: Include 2-4 realistic, commonly reported items

Field Requirements by Category:
================================
`
  
  // Add requirements for each category
  const categories = Object.keys(CATEGORY_FIELDS)
  for (const category of categories) {
    allRequirements += buildFieldRequirementsForCategory(category)
  }
  
  return allRequirements
}

/**
 * BRAND NAME FIRST STRATEGY - Forces specificity through structural constraint
 * This prompt achieves 70%+ specificity by requiring brand/author/creator attribution
 */
export const MASTER_PROMPT_BRAND_FIRST = `
Generate {{LIMIT}} solutions for: {{GOAL_TITLE}}
Context: {{GOAL_DESCRIPTION}} ({{ARENA}})

MANDATORY FORMAT RULE:
Every solution MUST start with [Brand/Author/Creator Name] followed by their [Specific Product/Method]

STRUCTURE: "Brand's Product" or "Author's Method" or "Company's Service"

CORRECT EXAMPLES:
✅ "Nike Run Club app" - Nike (brand) + Run Club app (product)
✅ "Tim Ferriss's 4-Hour Body" - Tim Ferriss (author) + 4-Hour Body (book)
✅ "BetterHelp's online therapy" - BetterHelp (company) + online therapy (service)
✅ "Dr. Weil's 4-7-8 breathing" - Dr. Weil (creator) + 4-7-8 breathing (method)
✅ "Headspace's Focus pack" - Headspace (brand) + Focus pack (product)
✅ "Tony Robbins's Priming Exercise" - Tony Robbins (creator) + Priming Exercise (method)

WRONG EXAMPLES:
❌ "meditation app" - no brand name
❌ "breathing exercises" - no creator attribution
❌ "online therapy" - no company specified
❌ "self-help book" - no author
❌ "workout program" - no brand/creator

CRITICAL RULES:
1. Start with a proper noun (person, company, or brand name)
2. Follow with their specific product, method, or service
3. If you cannot name the creator/brand, do not include that solution
4. Never use generic categories without attribution

{{FIELD_REQUIREMENTS}}

Return {{LIMIT}} solutions as a JSON array:

[
  {
    "title": "Brand/Creator's Specific Product (must follow format)",
    "description": "Brief description of what it does",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0,
    "effectiveness_rationale": "Based on evidence",
    "variants": [only for medications/supplements/natural_remedies/beauty_skincare],
    "fields": {
      // Required fields for the category (see above)
    }
  }
]

Remember: EVERY title must have a brand/author/creator name FIRST.

Categories (use exact strings):
medications, supplements_vitamins, natural_remedies, beauty_skincare,
therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners,
professional_services, medical_procedures, crisis_resources,
meditation_mindfulness, exercise_movement, habits_routines,
diet_nutrition, sleep, products_devices, books_courses,
apps_software, groups_communities, support_groups,
hobbies_activities, financial_products

Return only the JSON array.`

/**
 * SHOPPING CART STRATEGY - Backup prompt for even more specificity
 * Use this for categories that fail with Brand First approach
 */
export const MASTER_PROMPT_SHOPPING_CART = `
You're helping me fill my Amazon cart and bookmark specific websites.

For goal: {{GOAL_TITLE}} ({{GOAL_DESCRIPTION}})

List {{LIMIT}} items where you could:
1. Add to Amazon cart with one click OR
2. Download from App Store today OR  
3. Sign up on their website right now

Think of this as reading from an actual order history or app download list.
Use EXACT product names as they appear on receipts or in app stores.

GOOD EXAMPLES (actual purchasable items):
✅ "Headspace" - can download from App Store
✅ "Atomic Habits" - can add to Amazon cart
✅ "Peloton Digital" - can sign up on website
✅ "Nature Made Vitamin D3 2000IU" - specific product on Amazon

BAD EXAMPLES (just categories):
❌ "meditation app" - which one specifically?
❌ "self-help book" - what's the title?
❌ "fitness app" - name the actual app
❌ "vitamin supplement" - what brand and type?

{{FIELD_REQUIREMENTS}}

Return as JSON array:
[
  {
    "title": "exact product name from store/website",
    "description": "what it does",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0,
    "effectiveness_rationale": "why it works",
    "fields": { /* required fields */ }
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

Return only the JSON array.`

/**
 * Original prompt for backwards compatibility
 */
export const MASTER_PROMPT_ORIGINAL = `
Generate {{LIMIT}} solutions for: {{GOAL_TITLE}}
Context: {{GOAL_DESCRIPTION}} ({{ARENA}})

CORE REQUIREMENT: Only recommend real products, services, books, or apps that actually exist.

Think of this task like making a shopping list or gift registry - you need to name the ACTUAL items, not categories.
When someone searches Google for your solution, they should find that exact product/service.

EXAMPLES OF WHAT WE WANT:
✅ "Headspace" - specific meditation app
✅ "BetterHelp" - specific therapy platform
✅ "Couch to 5K" - specific running program
✅ "Atomic Habits by James Clear" - book with author
✅ "Nature Made Vitamin D3" - brand and product
✅ "YNAB (You Need A Budget)" - specific software

EXAMPLES OF WHAT WE DON'T WANT:
❌ "meditation app" - just a category
❌ "online therapy" - too generic
❌ "running program" - not specific
❌ "self-help book" - no actual title
❌ "vitamin D supplement" - no brand
❌ "budgeting software" - no product name

SIMPLE RULE: Every solution must include a proper name - either:
• Brand (Nike, Nature Made, BetterHelp)
• App (Headspace, MyFitnessPal, Duolingo)  
• Author (James Clear, Tim Ferriss)
• Specific protocol (Pomodoro Technique, 5x5 StrongLifts)

CRITICAL: Never use parentheses with examples. If tempted to write "X (e.g., Y)", just write "Y" instead.
Wrong: "Active Listening Training (e.g., workshops)" → Right: "Chris Voss MasterClass"

{{FIELD_REQUIREMENTS}}

Return {{LIMIT}} solutions as a JSON array:

[
  {
    "title": "Actual product/service/book name (must be googleable)",
    "description": "Brief description",
    "category": "from_list_below",
    "effectiveness": 3.0-5.0,
    "effectiveness_rationale": "Based on evidence",
    "variants": [only for medications/supplements/natural_remedies/beauty_skincare],
    "fields": {
      // Required fields for the category (see above)
      // Use realistic values (e.g., "$18/month", "2 weeks", "twice daily")
    }
  }
]

BEFORE ADDING EACH SOLUTION, TEST IT:
"If I Google this title, will I find this exact product/service?"
If no → replace with something real that exists.

Categories (use exact strings):
medications, supplements_vitamins, natural_remedies, beauty_skincare,
therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners,
professional_services, medical_procedures, crisis_resources,
meditation_mindfulness, exercise_movement, habits_routines,
diet_nutrition, sleep, products_devices, books_courses,
apps_software, groups_communities, support_groups,
hobbies_activities, financial_products

Effectiveness ratings: 3.0-3.4 (some evidence), 3.5-3.9 (moderate), 4.0-4.4 (good), 4.5-5.0 (strong)

For dosage categories, include variants like: [{"amount": 200, "unit": "mg", "form": "capsule"}]

Return only the JSON array.`

// Use Brand First as default
export const MASTER_PROMPT = MASTER_PROMPT_BRAND_FIRST

// Keep original distribution prompt unchanged
export const DISTRIBUTION_PROMPT = `
For the solution "{{SOLUTION_TITLE}}" used for "{{GOAL_TITLE}}", provide realistic prevalence distributions based on your training data about real-world usage patterns, clinical data, and user experiences.

Solution fields: {{FIELDS}}
Category: {{CATEGORY}}

Create distributions that reflect:
1. How these actually distribute in practice (from studies, trials, user reports)
2. Common vs rare occurrences
3. Typical vs atypical experiences

You MUST provide distributions for EXACTLY these fields:
{{REQUIRED_FIELDS}}

{{DROPDOWN_OPTIONS_FOR_FIELDS}}

CRITICAL RULES:
===============
1. For dropdown fields, you MUST use ONLY the exact values from the provided options
2. For array fields (side_effects, challenges, barriers, issues):
   - You MUST include the exact values from the solution fields
   - Array field items must appear in the distribution with their exact names
   - Add additional realistic items to reach 100% total
3. Each distribution must have percentages that sum to exactly 100%
4. Use realistic distributions based on your training data (not uniform)

Return JSON with this exact structure:
{
  "field_name": [
    {"name": "exact_dropdown_value", "percentage": 40},
    {"name": "another_exact_value", "percentage": 35},
    {"name": "third_exact_value", "percentage": 25}
  ]
}

Example for time_to_results field:
{
  "time_to_results": [
    {"name": "3-4 weeks", "percentage": 40},
    {"name": "1-2 weeks", "percentage": 25},
    {"name": "1-2 months", "percentage": 20},
    {"name": "Within days", "percentage": 10},
    {"name": "3-6 months", "percentage": 5}
  ]
}

Example for side_effects field with ["Nausea", "Headache"]:
{
  "side_effects": [
    {"name": "Nausea", "percentage": 31},
    {"name": "Headache", "percentage": 24},
    {"name": "Dizziness", "percentage": 20},
    {"name": "Fatigue", "percentage": 15},
    {"name": "None", "percentage": 10}
  ]
}

Return ONLY the JSON object, no markdown, no explanations.`

/**
 * Post-processing function to clean Gemini output
 * Removes problematic parenthetical patterns that Gemini tends to add
 */
export function cleanGeminiOutput(solution: string): string {
  return solution
    .replace(/\s*\(e\.g\.,.*?\)/g, '')      // Remove (e.g., ...)
    .replace(/\s*\(such as.*?\)/g, '')      // Remove (such as ...)
    .replace(/\s*\(using.*?\)/g, '')        // Remove (using ...)
    .replace(/\s*\(via.*?\)/g, '')          // Remove (via ...)
    .replace(/\s*\(including.*?\)/g, '')    // Remove (including ...)
    .replace(/\s*\(like.*?\)/g, '')         // Remove (like ...)
    .replace(/\s*\(for example.*?\)/g, '')  // Remove (for example ...)
    .trim()
}

/**
 * Get the complete prompt for solution generation with strategy selection
 */
export function getSolutionGenerationPrompt(
  goalTitle: string,
  goalDescription: string,
  arena: string,
  category: string,
  limit: number,
  strategy: 'brand-first' | 'shopping-cart' | 'original' = 'brand-first'
): string {
  const fieldRequirements = buildAllFieldRequirements()
  
  let prompt: string
  switch (strategy) {
    case 'brand-first':
      prompt = MASTER_PROMPT_BRAND_FIRST
      break
    case 'shopping-cart':
      prompt = MASTER_PROMPT_SHOPPING_CART
      break
    case 'original':
    default:
      prompt = MASTER_PROMPT_ORIGINAL
      break
  }
  
  return prompt
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{GOAL_DESCRIPTION}}', goalDescription || '')
    .replace('{{ARENA}}', arena)
    .replace('{{CATEGORY}}', category)
    .replace(/{{LIMIT}}/g, limit.toString()) // Replace all occurrences
    .replace('{{FIELD_REQUIREMENTS}}', fieldRequirements)
}

/**
 * Get the distribution prompt with dropdown options
 */
export function getDistributionPrompt(
  solutionTitle: string,
  goalTitle: string,
  fields: any,
  category: string
): string {
  const config = CATEGORY_FIELDS[category]
  if (!config) return DISTRIBUTION_PROMPT
  
  // Build list of required fields
  const requiredFields = [...config.required]
  if (config.arrayField) {
    requiredFields.push(config.arrayField)
  }
  
  // Build dropdown options section
  let dropdownSection = '\nDropdown Options for Fields:\n============================\n'
  for (const field of requiredFields) {
    const options = getDropdownOptionsForField(category, field)
    if (options && options.length > 0) {
      dropdownSection += `${field}: You MUST use ONLY these exact values:\n`
      dropdownSection += JSON.stringify(options, null, 2) + '\n\n'
    }
  }
  
  return DISTRIBUTION_PROMPT
    .replace('{{SOLUTION_TITLE}}', solutionTitle)
    .replace('{{GOAL_TITLE}}', goalTitle)
    .replace('{{FIELDS}}', JSON.stringify(fields))
    .replace('{{CATEGORY}}', category)
    .replace('{{REQUIRED_FIELDS}}', requiredFields.join(', '))
    .replace('{{DROPDOWN_OPTIONS_FOR_FIELDS}}', dropdownSection)
}

/**
 * Validate that a solution uses correct dropdown values
 */
export function validateDropdownValues(category: string, fields: Record<string, any>): string[] {
  const errors: string[] = []
  
  for (const [fieldName, value] of Object.entries(fields)) {
    // Skip array fields for this validation
    if (Array.isArray(value)) continue
    
    const allowedOptions = getDropdownOptionsForField(category, fieldName)
    if (allowedOptions && !allowedOptions.includes(value)) {
      errors.push(`Field "${fieldName}" has invalid value "${value}". Must be one of: ${allowedOptions.join(', ')}`)
    }
  }
  
  return errors
}
