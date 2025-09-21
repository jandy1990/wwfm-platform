/**
 * Expansion-Specific Prompts for Solution-to-Goal Mapping
 *
 * These prompts are designed for mapping existing solutions to new goals
 * with strict credibility requirements to prevent nonsensical connections.
 */

import { CATEGORY_FIELDS } from '../config/category-fields'
import { buildFieldRequirementsForCategory } from './master-prompts'

export interface SolutionData {
  title: string
  description: string
  category: string
  effectiveness: number
  current_goal: string
}

export interface TargetGoal {
  title: string
  description: string
  arena: string
  category: string
}

/**
 * Generate Gemini prompt for solution-to-goal mapping
 */
export function createSolutionToGoalPrompt(
  solution: SolutionData,
  targetGoals: TargetGoal[],
  options: {
    strictMode?: boolean
    minEffectiveness?: number
  } = {}
): string {
  const { strictMode = true, minEffectiveness = 4.0 } = options

  const fieldRequirements = buildFieldRequirementsForCategory(solution.category)

  return `
SOLUTION-TO-GOAL EXPANSION ANALYSIS
==================================

You are expanding an existing proven solution to evaluate its credibility for new goals.

EXISTING SOLUTION:
Title: "${solution.title}"
Category: ${solution.category}
Description: ${solution.description}
Current Effectiveness: ${solution.effectiveness}/5.0
Currently Helps With: "${solution.current_goal}"

CRITICAL CREDIBILITY REQUIREMENTS:
=================================
1. MEDICAL/EXPERT CREDIBILITY: A domain expert (doctor, trainer, therapist) would recommend this
2. EVIDENCE-BASED: The connection must be supported by research or established practice
3. LEGITIMATE PRACTICE: The connection reflects real-world professional practice
4. MINIMUM EFFECTIVENESS: Only suggest connections with effectiveness >= ${Math.max(3.5, minEffectiveness - 0.5)}

SPECIAL NOTE FOR MEDICAL SPECIALISTS:
- Medical connections can be indirect (e.g., gut health → skin health)
- Consider referral patterns (dermatologists refer to gastroenterologists)
- Trust established medical knowledge (gut-skin axis, hormone-mood connections)

CREDIBILITY TEST QUESTIONS:
==========================
For each goal, ask yourself:
- "Would a relevant expert recommend '${solution.title}' for this specific goal?"
- "Is there DIRECT causality between this solution and achieving this goal?"
- "Can I find research or established practice supporting this connection?"
- "Would users find this recommendation obvious and helpful?"

If ALL answers are "No", return { "credible": false }

TARGET GOALS TO EVALUATE:
========================
${targetGoals.map((goal, index) => `
${index + 1}. Goal: "${goal.title}"
   Description: ${goal.description}
   Arena: ${goal.arena}
   Category: ${goal.category}
`).join('')}

${fieldRequirements}

RESPONSE FORMAT:
===============
Return a JSON array with one object per goal. For each goal, either:

CREDIBLE CONNECTION:
{
  "goal_id": "${targetGoals[0]?.title || 'goal_title'}",
  "credible": true,
  "effectiveness": 4.2,
  "effectiveness_rationale": "Specific evidence why this effectiveness rating",
  "goal_specific_adaptation": "How this solution specifically helps with this goal",
  "fields": {
    // MUST include EXACTLY the fields specified for category: ${solution.category}
    // Adapt field values to be goal-specific where relevant
  }
}

NOT CREDIBLE:
{
  "goal_id": "${targetGoals[0]?.title || 'goal_title'}",
  "credible": false,
  "reason": "Specific reason why this connection lacks credibility"
}

EXAMPLE GOOD CONNECTIONS:
- "Heavy Resistance Training" → "Build muscle mass"
  ✅ Direct causality (resistance training causes muscle hypertrophy)
  ✅ Expert recommended (all trainers recommend this)
  ✅ Evidence-based (thousands of studies)
  ✅ Obvious connection (users expect this)

- "Consultation with a Gastroenterologist" → "Get glowing skin"
  ✅ Medical connection (gut-skin axis is well-established)
  ✅ Expert recommended (dermatologists refer to GI specialists)
  ✅ Evidence-based (gut microbiome affects skin health)
  ✅ Legitimate medical practice

- "Consultation with a Dermatologist" → "Clear up acne"
  ✅ Direct medical expertise (dermatologists specialize in skin conditions)
  ✅ Expert recommended (primary treatment for acne)
  ✅ Evidence-based (standard medical practice)
  ✅ Obvious connection (users expect this)

EXAMPLE BAD CONNECTION:
- "Ashwagandha Supplement" → "Save money"
  ❌ No direct causality (supplement doesn't affect finances)
  ❌ No expert would recommend this
  ❌ No evidence base
  ❌ Users would find this nonsensical

STRICT MODE: ${strictMode ? 'ENABLED - Be conservative but fair.' : 'DISABLED - Be more permissive with connections.'}

For each goal, provide thorough analysis. Focus on legitimate expert recommendations and evidence-based connections.

Return ONLY the JSON array, no markdown formatting.`
}

/**
 * Generate field-specific adaptation prompt for goal customization
 */
export function createFieldAdaptationPrompt(
  solution: SolutionData,
  goal: TargetGoal,
  baseFields: Record<string, any>
): string {
  return `
FIELD ADAPTATION FOR GOAL-SPECIFIC APPLICATION
=============================================

SOLUTION: "${solution.title}"
CURRENT GOAL: "${solution.current_goal}"
NEW GOAL: "${goal.title}"

CURRENT FIELD VALUES:
${JSON.stringify(baseFields, null, 2)}

ADAPTATION TASK:
===============
Adapt the field values to be specific for the new goal while maintaining accuracy.

Consider:
1. Time to results may be different for different goals
2. Challenges/side effects might be goal-specific
3. Costs and frequency should remain realistic
4. Effectiveness should reflect goal-specific application

ADAPTATION GUIDELINES:
=====================
- time_to_results: Consider what's realistic for achieving the new goal
- challenges/side_effects: Include challenges specific to this goal application
- frequency: Adjust if goal requires different application frequency
- cost: Keep realistic, adjust only if goal requires different approach

Return adapted fields as JSON object with same structure but goal-optimized values.
`
}

/**
 * Generate aggregated fields structure for new goal connection
 */
export function createAggregatedFieldsTemplate(
  solution: SolutionData,
  goal: TargetGoal,
  fields: Record<string, any>
): Record<string, any> {
  return {
    _metadata: {
      confidence: 'high',
      ai_enhanced: true,
      computed_at: new Date().toISOString(),
      data_source: 'ai_expansion',
      user_ratings: 0,
      value_mapped: true,
      mapping_version: 'v3_expansion_system',
      source_solution: solution.title,
      source_goal: solution.current_goal,
      target_goal: goal.title,
      expansion_method: 'conservative_mapping'
    },
    ...this.generateFieldDistributions(fields)
  }
}

/**
 * Generate realistic field distributions for aggregated_fields
 */
function generateFieldDistributions(fields: Record<string, any>): Record<string, any> {
  const distributions: Record<string, any> = {}

  for (const [fieldName, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      // Handle array fields (like challenges, side_effects)
      distributions[fieldName] = {
        mode: value[0] || 'None',
        values: value.map((item: any, index: number) => ({
          count: 1,
          value: item,
          percentage: index === 0 ? 60 : Math.max(5, 40 / (value.length - 1))
        })),
        totalReports: 1
      }
    } else {
      // Handle single value fields
      distributions[fieldName] = {
        mode: value,
        values: [
          { count: 1, value: value, percentage: 80 },
          { count: 1, value: generateAlternativeValue(fieldName, value), percentage: 20 }
        ],
        totalReports: 1
      }
    }
  }

  return distributions
}

/**
 * Generate realistic alternative values for distributions
 */
function generateAlternativeValue(fieldName: string, primaryValue: any): any {
  // Time-related fields
  if (fieldName.includes('time') || fieldName === 'duration') {
    const timeMap: Record<string, string> = {
      'immediately': '1-2 weeks',
      '1-2 weeks': '1 month',
      '1 month': '3 months',
      '3 months': '6+ months',
      '6+ months': '3 months'
    }
    return timeMap[primaryValue] || 'varies'
  }

  // Frequency fields
  if (fieldName.includes('frequency')) {
    const frequencyMap: Record<string, string> = {
      'daily': 'twice daily',
      'twice daily': 'daily',
      'weekly': 'daily',
      'monthly': 'weekly'
    }
    return frequencyMap[primaryValue] || 'as needed'
  }

  // Cost fields
  if (fieldName.includes('cost')) {
    if (primaryValue === 'Free') return 'Under $10'
    if (primaryValue.includes('Under')) return 'Free'
    return 'varies by location'
  }

  // Default fallback
  return 'varies'
}

/**
 * Generate quality validation prompt for Gemini self-check
 */
export function createQualityValidationPrompt(
  mappingResults: any[],
  solution: SolutionData
): string {
  return `
QUALITY VALIDATION: SOLUTION-TO-GOAL MAPPINGS
=============================================

SOLUTION: "${solution.title}"
CATEGORY: ${solution.category}

PROPOSED MAPPINGS:
${JSON.stringify(mappingResults, null, 2)}

VALIDATION CHECKLIST:
====================
For each proposed mapping, verify:

1. CREDIBILITY TEST:
   - Would a domain expert recommend this solution for this goal?
   - Is there direct causality between solution and goal?
   - Is the effectiveness rating realistic?

2. CONSISTENCY CHECK:
   - Are effectiveness ratings logical relative to each other?
   - Do time_to_results make sense for each goal?
   - Are challenges/side_effects appropriately adapted?

3. USER VALUE TEST:
   - Would users find this recommendation helpful?
   - Does it pass the "laugh test" (not ridiculous)?
   - Would they trust this recommendation?

RESPONSE FORMAT:
===============
{
  "overall_quality": "high|medium|low",
  "recommendations": [
    {
      "goal": "goal_title",
      "action": "approve|revise|reject",
      "reason": "explanation",
      "suggested_changes": { /* if action is revise */ }
    }
  ],
  "summary": "Overall assessment and recommendations"
}

Be ruthless in quality assessment. Better to reject questionable connections than approve mediocre ones.
`
}