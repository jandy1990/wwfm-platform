/**
 * Laugh Test Validation Prompts
 *
 * These prompts implement a "common sense" filter to catch solution-goal
 * connections that are technically valid but fail basic intuition.
 */

import { sanitizeTextForPrompt } from '../utils/prompt-sanitizer'

export interface LaughTestCandidate {
  solution_title: string
  solution_category: string
  goal_title: string
  goal_arena: string
  goal_category: string
  effectiveness: number
  rationale: string
}

/**
 * Generate laugh test validation prompt for a batch of connections
 */
export function createLaughTestPrompt(candidates: LaughTestCandidate[]): string {
  const sanitisedCandidates = candidates.map(candidate => ({
    solution_title: sanitizeTextForPrompt(candidate.solution_title, { maxLength: 180 }),
    solution_category: sanitizeTextForPrompt(candidate.solution_category, { maxLength: 120 }),
    goal_title: sanitizeTextForPrompt(candidate.goal_title, { maxLength: 180 }),
    goal_arena: sanitizeTextForPrompt(candidate.goal_arena, { maxLength: 120 }),
    goal_category: sanitizeTextForPrompt(candidate.goal_category, { maxLength: 120 }),
    effectiveness: candidate.effectiveness,
    rationale: sanitizeTextForPrompt(candidate.rationale, { maxLength: 600 })
  }))

  return `
LAUGH TEST: SOLUTION-GOAL CONNECTION VALIDATOR
============================================

You are a skeptical user reviewing solution recommendations. Your job is to identify
connections that technically pass validation but fail the "laugh test" - connections
that would make users confused, amused, or lose trust in the platform.

EVALUATION CRITERIA (100 point scale):
=====================================

1. DIRECT CAUSALITY (30 points):
   - Does this solution logically lead to achieving this goal?
   - Is there a clear cause-and-effect relationship?
   - Example: "Strength training → Build muscle" = 30 points
   - Example: "Skin analysis → Emotional regulation" = 5 points

2. USER EXPECTATION (30 points):
   - Would users find this recommendation helpful vs confusing?
   - Does it match what normal people would expect?
   - Example: "Meditation app → Reduce stress" = 30 points
   - Example: "Cardiologist → Learn hairstyling" = 2 points

3. PROFESSIONAL CREDIBILITY (20 points):
   - Would a relevant expert recommend this specific solution for this goal?
   - Does it reflect real-world professional practice?
   - Example: "Dermatologist → Clear acne" = 20 points
   - Example: "Endocrinologist → Master photography" = 0 points

4. COMMON SENSE CHECK (20 points):
   - If your friend suggested this, would you take it seriously?
   - Does it pass basic logic without mental gymnastics?
   - Example: "Budget app → Save money" = 20 points
   - Example: "Heavy weights → Improve finances" = 1 point

SCORING GUIDELINES:
==================
- 90-100: Excellent, obvious connection
- 80-89: Good, makes sense
- 70-79: Acceptable, requires explanation but reasonable
- 60-69: Questionable, users might be confused
- 50-59: Poor, requires significant mental gymnastics
- 0-49: Fails laugh test, would damage platform credibility

SPECIAL CONSIDERATIONS:
======================
- Medical connections can be indirect (gut health → skin health)
- Consider referral patterns (dermatologist → gastroenterologist)
- Some connections are research-backed but not intuitive
- When in doubt, ask: "Would I share this with my skeptical friend?"

CONNECTIONS TO EVALUATE:
=======================
${sanitisedCandidates.map((candidate, index) => `
${index + 1}. SOLUTION: "${candidate.solution_title}" (${candidate.solution_category})
   GOAL: "${candidate.goal_title}" (${candidate.goal_arena})
   EFFECTIVENESS: ${candidate.effectiveness}/5
   RATIONALE: "${candidate.rationale}"
`).join('')}

RESPONSE FORMAT:
===============
Return a JSON array with one object per connection:

[
  {
    "connection_id": 1,
    "solution": "${sanitisedCandidates[0]?.solution_title || 'Example Solution'}",
    "goal": "${sanitisedCandidates[0]?.goal_title || 'Example Goal'}",
    "overall_score": 75,
    "breakdown": {
      "direct_causality": 25,
      "user_expectation": 20,
      "professional_credibility": 15,
      "common_sense": 15
    },
    "passes_laugh_test": true,
    "reasoning": "Specific explanation of why this score was given",
    "user_confidence": "Would users trust this recommendation? Why/why not?"
  }
]

EXAMPLE EVALUATIONS:
===================

GOOD CONNECTION (Score: 85):
"Consultation with Dermatologist" → "Clear up acne"
- Direct causality: 30 (dermatologists treat skin conditions)
- User expectation: 30 (exactly what users expect)
- Professional credibility: 20 (primary medical treatment)
- Common sense: 5 (slight deduction for not being free)
Score: 85 - Clear, obvious, trustworthy connection

BAD CONNECTION (Score: 25):
"Visia Skin Analysis" → "Improve emotional regulation"
- Direct causality: 5 (no clear mechanism)
- User expectation: 5 (users would be confused)
- Professional credibility: 10 (some indirect hormone connections)
- Common sense: 5 (requires mental gymnastics)
Score: 25 - Fails laugh test, would confuse users

Be thorough but decisive. When in doubt, ask yourself: "Would I stake my reputation on recommending this?"

Return ONLY the JSON array, no additional text or markdown.`
}

/**
 * Generate a single-connection focused prompt for detailed analysis
 */
export function createSingleConnectionLaughTestPrompt(
  solution: string,
  goal: string,
  rationale: string,
  category: string
): string {
  const sanitisedSolution = sanitizeTextForPrompt(solution, { maxLength: 180 })
  const sanitisedGoal = sanitizeTextForPrompt(goal, { maxLength: 200 })
  const sanitisedRationale = sanitizeTextForPrompt(rationale, { maxLength: 600, preserveNewlines: true })
  const sanitisedCategory = sanitizeTextForPrompt(category, { maxLength: 120 })

  return `
DETAILED LAUGH TEST ANALYSIS
============================

SOLUTION: "${sanitisedSolution}" (${sanitisedCategory})
GOAL: "${sanitisedGoal}"
RATIONALE: "${sanitisedRationale}"

TASK: Perform a detailed "laugh test" analysis of this connection.

Ask yourself these critical questions:

1. INTUITION CHECK:
   - If someone told you they used "${solution}" to achieve "${goal}",
     what would your immediate reaction be?
   - Would you nod in understanding or be confused?

2. EXPERTISE TEST:
   - Would a relevant expert (doctor, trainer, therapist) recommend this?
   - Is this a standard, recognized approach?

3. USER EXPERIENCE:
   - Would users find this helpful or would it damage platform credibility?
   - Does this match what normal people would expect?

4. LOGICAL PATHWAY:
   - Can you clearly explain how "${solution}" leads to "${goal}"?
   - Does it require mental gymnastics or is it straightforward?

RESPONSE FORMAT:
===============
{
  "passes_laugh_test": true/false,
  "confidence": "high|medium|low",
  "score": 0-100,
  "immediate_reaction": "Your gut reaction to this connection",
  "logical_pathway": "Step-by-step explanation of how this would work",
  "potential_concerns": ["List of things that make this questionable"],
  "recommendation": "approve|flag_for_review|reject",
  "reasoning": "Detailed explanation of your decision"
}

Be honest and direct. Trust your instincts about what feels right vs wrong.`
}

/**
 * Generate quality assurance prompt for batch validation results
 */
export function createQualityAssurancePrompt(
  validationResults: any[],
  originalCount: number
): string {
  const rejectedCount = validationResults.filter(r => !r.passes_laugh_test).length
  const rejectionRate = (rejectedCount / originalCount * 100).toFixed(1)

  return `
QUALITY ASSURANCE: LAUGH TEST VALIDATION REVIEW
===============================================

VALIDATION SUMMARY:
- Original connections: ${originalCount}
- Rejected by laugh test: ${rejectedCount}
- Rejection rate: ${rejectionRate}%

REJECTED CONNECTIONS:
${validationResults
  .filter(r => !r.passes_laugh_test)
  .map(r => `- "${r.solution}" → "${r.goal}" (Score: ${r.overall_score})`)
  .join('\n')}

QUALITY CHECK QUESTIONS:
=======================
1. Is the rejection rate reasonable? (expect 20-40% for first runs)
2. Are the rejections legitimate or is the system too strict?
3. Did any obviously good connections get rejected?
4. Did any obviously bad connections slip through?

RESPONSE FORMAT:
===============
{
  "quality_assessment": "high|medium|low",
  "rejection_rate_appropriate": true/false,
  "false_positives": ["connections that should have been approved"],
  "false_negatives": ["approved connections that should have been rejected"],
  "recommended_threshold_adjustment": 70, // suggest new threshold
  "overall_confidence": "high|medium|low",
  "summary": "Brief assessment of validation quality"
}

Focus on protecting platform credibility while avoiding over-rejection of legitimate connections.`
}
