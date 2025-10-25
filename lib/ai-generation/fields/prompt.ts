/**
 * Context-Aware AI Prompt Generator
 *
 * Creates intelligent prompts for field generation that:
 * - Include specific goal context
 * - Reference appropriate knowledge sources
 * - Specify exact dropdown options
 * - Emphasize authentic user experience patterns
 * - Prevent mechanistic distributions
 */

import { getContextSources, getDropdownSource } from './category'
import { DROPDOWN_OPTIONS } from '../../config/solution-dropdown-options'

/**
 * Generate a context-aware prompt for field generation
 */
export function generateContextAwarePrompt(
  fieldName: string,
  solutionName: string,
  category: string,
  goalTitle: string
): string {
  const dropdownSource = getDropdownSource(fieldName, category)
  const dropdownOptions = DROPDOWN_OPTIONS[dropdownSource]

  if (!dropdownOptions || dropdownOptions.length === 0) {
    throw new Error(`No dropdown options found for ${fieldName} in category ${category}`)
  }

  const contextSources = getContextSources(category)

  const prompt = `Based on your training data about how people actually use "${solutionName}" specifically for "${goalTitle}", generate a realistic distribution for the ${fieldName} field.

CRITICAL CONTEXT:
- Solution: ${solutionName}
- Category: ${category}
- Goal: "${goalTitle}" (THIS IS THE KEY CONTEXT - not general use!)

Draw from your knowledge of:
${contextSources.map(source => `• ${source}`).join('\n')}

IMPORTANT: This distribution should reflect how people experience "${solutionName}" when used specifically for "${goalTitle}". For example:
- If this is "Sertraline" for "Reduce anxiety", reflect anxiety treatment patterns (not depression)
- If this is "Yoga" for "Improve sleep", focus on sleep-focused yoga experiences (not general fitness)
- If this is "Budgeting app" for "Save money", show savings-focused usage (not general budgeting)

You MUST use ONLY these exact values (preserve exact case and punctuation):
${dropdownOptions.map((opt, index) => `${index + 1}. "${opt}"`).join('\n')}

Generate a distribution that feels authentic - like it came from aggregating hundreds of real user reports about "${solutionName}" specifically for "${goalTitle}".

Requirements:
- Use 5-8 options from the list above
- Create varied percentages (NO equal splits like 20%, 20%, 20%)
- The most common option should typically be 25-45%
- Use realistic source attributions that match the category
- Make the mode (most common value) reflect typical user experience

Return ONLY a JSON object in this exact format:
{
  "mode": "most_common_value_from_dropdown_list",
  "values": [
    {"value": "exact_dropdown_value_1", "count": 40, "percentage": 40, "source": "appropriate_source"},
    {"value": "exact_dropdown_value_2", "count": 25, "percentage": 25, "source": "appropriate_source"},
    {"value": "exact_dropdown_value_3", "count": 20, "percentage": 20, "source": "appropriate_source"},
    {"value": "exact_dropdown_value_4", "count": 10, "percentage": 10, "source": "appropriate_source"},
    {"value": "exact_dropdown_value_5", "count": 5, "percentage": 5, "source": "appropriate_source"}
  ],
  "totalReports": 100,
  "dataSource": "ai_training_data"
}`

  return prompt
}

export function getSourceAttribution(category: string): string[] {
  const sourceMap: Record<string, string[]> = {
    medications: ['research', 'studies', 'clinical_trials', 'medical_literature'],
    supplements_vitamins: ['research', 'studies', 'consumer_reports', 'user_reviews'],
    natural_remedies: ['studies', 'user_experiences', 'community_feedback', 'research'],
    beauty_skincare: ['user_reviews', 'beauty_experts', 'consumer_reports', 'community_feedback'],
    meditation_mindfulness: ['user_experiences', 'studies', 'community_feedback', 'expert_analysis'],
    exercise_movement: ['fitness_communities', 'trainer_recommendations', 'user_experiences', 'studies'],
    habits_routines: ['user_experiences', 'community_feedback', 'expert_analysis', 'case_studies'],
    books_courses: ['user_reviews', 'expert_analysis', 'community_feedback', 'case_studies'],
    apps_software: ['app_reviews', 'user_ratings', 'tech_reviews', 'community_feedback'],
    diet_nutrition: ['user_experiences', 'studies', 'expert_analysis', 'community_feedback'],
    sleep: ['user_experiences', 'studies', 'community_feedback', 'expert_analysis'],
    products_devices: ['user_reviews', 'consumer_reports', 'tech_reviews', 'community_feedback'],
    hobbies_activities: ['community_feedback', 'user_experiences', 'expert_analysis', 'enthusiast_forums'],
    groups_communities: ['community_feedback', 'user_experiences', 'case_studies', 'expert_analysis'],
    financial_products: ['user_reports', 'financial_advisors', 'case_studies', 'expert_analysis'],
    therapists_counselors: ['user_experiences', 'studies', 'expert_analysis', 'case_studies'],
    coaches_mentors: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback'],
    alternative_practitioners: ['user_experiences', 'community_feedback', 'case_studies', 'studies'],
    doctors_specialists: ['studies', 'expert_analysis', 'user_experiences', 'medical_literature'],
    medical_procedures: ['studies', 'medical_literature', 'user_experiences', 'expert_analysis'],
    crisis_resources: ['user_experiences', 'case_studies', 'expert_analysis', 'studies'],
    professional_services: ['user_experiences', 'case_studies', 'expert_analysis', 'community_feedback']
  }

  return sourceMap[category] || ['user_experiences', 'community_feedback', 'expert_analysis', 'case_studies']
}

export function getFieldContextHints(fieldName: string, category: string, goalTitle: string): string {
  const hints: Record<string, string> = {
    frequency: `Focus on how often people typically use this solution when specifically trying to achieve "${goalTitle}". Consider whether daily use is common, or if people use it more sporadically.`,
    time_to_results: `Think about realistic timelines for seeing results with this solution for "${goalTitle}". Some solutions work immediately, others take weeks or months.`,
    cost: `Consider the actual costs people report for this solution when using it for "${goalTitle}". Include any ongoing costs, not just initial purchase.`,
    side_effects: `Focus on side effects that people actually experience when using this solution for "${goalTitle}". Many people may report no side effects.`,
    length_of_use: `Think about how long people typically continue using this solution for "${goalTitle}". Some are short-term, others become long-term habits.`,
    practice_length: `Consider typical session lengths that people find effective for "${goalTitle}". Beginners often start shorter, experienced practitioners may go longer.`,
    session_frequency: `Think about realistic appointment or session frequencies for this type of service when addressing "${goalTitle}".`,
    session_length: `Consider typical session durations for this service when specifically addressing "${goalTitle}".`,
    format: `Think about which formats people prefer for this type of content when working on "${goalTitle}".`,
    learning_difficulty: `Consider how challenging people find this solution when specifically using it for "${goalTitle}".`,
    usage_frequency: `Think about how often people open/use this app when actively working on "${goalTitle}".`,
    subscription_type: `Consider which subscription model people typically choose for this type of solution for "${goalTitle}".`
  }

  return hints[fieldName] || `Consider how people typically experience this aspect of the solution when specifically using it for "${goalTitle}".`
}

export function generateEnhancedPrompt(
  fieldName: string,
  solutionName: string,
  category: string,
  goalTitle: string
): string {
  const basePrompt = generateContextAwarePrompt(fieldName, solutionName, category, goalTitle)
  const fieldHints = getFieldContextHints(fieldName, category, goalTitle)
  const sourceOptions = getSourceAttribution(category)

  const enhancedPrompt = basePrompt.replace(
    'Generate a distribution that feels authentic',
    `${fieldHints}

Generate a distribution that feels authentic`
  )

  const sourceGuidance = `\n\nFor source attribution, use sources appropriate for ${category}: ${sourceOptions.join(', ')}`

  return enhancedPrompt + sourceGuidance
}

export function generateFallbackPrompt(
  fieldName: string,
  solutionName: string,
  category: string,
  goalTitle: string,
  previousError: string
): string {
  const dropdownSource = getDropdownSource(fieldName, category)
  const dropdownOptions = DROPDOWN_OPTIONS[dropdownSource]

  return `The previous generation failed with error: ${previousError}

Let's try again with a simpler approach. Based on general knowledge about "${solutionName}" for "${goalTitle}", create a realistic distribution for ${fieldName}.

STRICT REQUIREMENTS:
- Use ONLY these exact values: ${dropdownOptions.join(', ')}
- Return valid JSON only
- Include 4-6 options with varied percentages
- Most common option should be 30-50%

JSON format:
{
  "mode": "most_common_option",
  "values": [
    {"value": "option1", "count": 40, "percentage": 40, "source": "user_experiences"},
    {"value": "option2", "count": 35, "percentage": 35, "source": "community_feedback"}
  ],
  "totalReports": 100,
  "dataSource": "ai_training_data"
}`
}
