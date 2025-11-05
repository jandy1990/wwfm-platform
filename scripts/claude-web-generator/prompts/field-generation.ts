/**
 * Rich Field Distribution Prompts for Claude Web
 *
 * These prompts generate high-quality distribution data for each field
 * with comprehensive context and examples (not terse like Gemini).
 */

import { getKeyFields, getArrayField } from '../../../lib/config/solution-fields'

export interface FieldDistributionContext {
  fieldName: string
  category: string
  solutionTitle: string
  goalTitle: string
  includeExamples?: boolean
}

/**
 * Generate rich field distribution prompt
 */
export function getRichFieldDistributionPrompt(context: FieldDistributionContext): string {
  const { fieldName, category, solutionTitle, goalTitle, includeExamples = true } = context

  return `# Field Distribution Generation

Generate a realistic distribution for this field based on **actual patterns from your training data** (medical literature, clinical studies, user research).

## Context
- **Solution**: ${solutionTitle}
- **Goal**: ${goalTitle}
- **Category**: ${category}
- **Field**: ${fieldName}

## Core Principle: EVIDENCE-BASED DISTRIBUTIONS

All distributions must reflect **actual patterns you've seen** in:
- Clinical trials and research studies
- User surveys and real-world data
- Medical literature and treatment guidelines
- Consumer research and product reviews

❌ **NEVER** generate random percentages
❌ **NEVER** use equal splits (25%/25%/25%/25%)
❌ **NEVER** use mechanistic templates (40%/30%/20%/10%)
✅ **ALWAYS** base on actual data patterns from your training

## Field-Specific Guidance

${getFieldGuidance(fieldName, category, solutionTitle)}

## Distribution Requirements

### Option Count:
- **Target**: 5-8 options (rich diversity)
- **Minimum**: 4 options (acceptable)
- **Maximum**: 10 options (avoid overwhelming)

### Percentage Distribution:
- Must sum to exactly 100%
- Reflect realistic patterns (not uniform)
- Most common option: typically 30-50%
- Least common option: typically 5-15%
- Use whole numbers (no decimals)

### Value Requirements:
- Must match form dropdown options EXACTLY
- Correct capitalization (e.g., "Weekly" not "weekly")
- Correct format (e.g., "Free/No cost" not "$0")
- Include realistic variety

${includeExamples ? getFieldExamples(fieldName, category) : ''}

## Output Format

Return ONLY valid JSON (no markdown, no explanations):

\`\`\`json
[
  {"name": "Most common value", "percentage": 35},
  {"name": "Second common value", "percentage": 25},
  {"name": "Third option", "percentage": 20},
  {"name": "Fourth option", "percentage": 12},
  {"name": "Least common", "percentage": 8}
]
\`\`\`

## Validation Checklist

Before submitting, verify:
- [ ] Percentages sum to exactly 100
- [ ] 5-8 options included (target)
- [ ] Values match dropdown options exactly
- [ ] Distribution reflects actual data patterns
- [ ] Most common option is realistic (30-50%)
- [ ] Valid JSON format

Now generate the distribution for **${fieldName}**.`
}

/**
 * Get field-specific guidance based on field name and category
 */
function getFieldGuidance(fieldName: string, category: string, solutionTitle: string): string {
  const guidance: Record<string, string> = {
    time_to_results: `
### Time to Results - Base on clinical/user data:
**Medications**: Most 2-4 weeks, secondary 4-8 weeks
**Therapy**: Most 4-8 weeks, secondary 2-3 months
**Apps**: Most 1-2 weeks, secondary 2-4 weeks
**Exercise**: Most 2-4 weeks, secondary 1-2 weeks
`,
    cost: `
### Cost - Base on actual market prices for ${solutionTitle}:
**Medications**: $20-50 to $50-100 common (generic w/ insurance), $100-200+ less common
**Therapy**: $100-150 to $150-200/session common (US avg), Free or $200+ less common
**Apps**: Free or $5-10/month common, $10-20+ less common
`,
    frequency: `
### Frequency - Base on prescribing guidelines/research:
**Medications**: Most "Once daily", secondary "Twice daily"
**Therapy**: Most "Weekly", secondary "Bi-weekly"
**Practice**: Distribute across "2-3 times per week", "3-5 times per week", "Daily"
`,
    side_effects: `
### Side Effects - Base on clinical trials/user reports for ${solutionTitle}:
**Most common**: 30-40% (e.g., nausea, headaches) | **Moderate**: 15-25% | **Less common**: 5-10%
Only include documented side effects for this specific solution.
`,
    session_length: `
### Session Length - Base on standard durations:
**Therapy**: Most "45-60 minutes", secondary "60-90 minutes"
**Coaching**: "30-60 minutes" or "60-90 minutes"
**Alternative**: "60-90 minutes"
`,
    session_frequency: `
### Session Frequency - Base on clinical guidelines:
**Mental Health**: Most "Weekly", secondary "Bi-weekly"
**Medical**: Most "Monthly" or "Every 3-6 months"
**Coaching**: Most "Bi-weekly" or "Weekly"
`
  }

  return guidance[fieldName] || `
### ${fieldName} - General Guidance

Generate distribution based on typical patterns for this field in the **${category}** category.

Research actual data for ${solutionTitle} and reflect realistic usage/experience patterns.
`
}

/**
 * Get field-specific examples (consolidated)
 */
function getFieldExamples(fieldName: string, category: string): string {
  // Consolidated single example showing pattern
  return `
## Example Pattern:
✅ **Evidence-Based**: [{"name": "Most common value", "percentage": 40}, {"name": "Secondary", "percentage": 30}, {"name": "Third", "percentage": 20}, {"name": "Fourth", "percentage": 10}]
❌ **Avoid**: Equal splits (25/25/25/25), single option at 100%, wrong case/format
`
}

/**
 * Get array field distribution prompt (for side_effects, challenges, etc.)
 */
export function getArrayFieldDistributionPrompt(context: FieldDistributionContext): string {
  const { fieldName, category, solutionTitle, goalTitle } = context

  return `# Array Field Distribution Generation

Generate a realistic distribution for **${fieldName}** (an array field with multiple possible values).

## Context
- **Solution**: ${solutionTitle}
- **Goal**: ${goalTitle}
- **Category**: ${category}
- **Field**: ${fieldName}

## 🚨 CRITICAL: Array Field Requirements

For ${fieldName}, users can report MULTIPLE values (e.g., multiple side effects, multiple challenges).

**MANDATORY REQUIREMENTS (Will be validated):**
1. ✅ EVERY value MUST have a percentage
2. ✅ Percentages MUST sum to exactly 100%
3. ✅ Minimum 4 options (target 5-8)
4. ✅ NO single value at 100%
5. ✅ NO equal splits (e.g., 25%/25%/25%/25%)

**These requirements are NON-NEGOTIABLE. Solutions missing percentages will be REJECTED.**

### Base Distribution On:
- **Clinical Data**: If medications/treatments, use trial data
- **User Reports**: If apps/practices, use review data
- **Research**: If established solutions, use published studies

### Common Patterns:

**Side Effects** (medications/supplements):
- Include 5-8 most commonly reported side effects
- Most common: 30-45% of users report this
- Moderate: 15-25% of users
- Less common: 5-15% of users

**Challenges** (practices/habits):
- Include 5-7 common barriers/obstacles
- Most common: 35-50% encounter this challenge
- Moderate: 20-30%
- Less common: 10-20%

## Output Format

\`\`\`json
[
  {"name": "Most common value", "percentage": 38},
  {"name": "Second common", "percentage": 28},
  {"name": "Third option", "percentage": 18},
  {"name": "Fourth option", "percentage": 10},
  {"name": "Least common", "percentage": 6}
]
\`\`\`

## Example: side_effects for Sertraline (Zoloft)

### ✅ Evidence-Based Distribution:
\`\`\`json
[
  {"name": "Nausea", "percentage": 35},
  {"name": "Headaches", "percentage": 25},
  {"name": "Sleep changes", "percentage": 20},
  {"name": "Digestive issues", "percentage": 12},
  {"name": "Fatigue", "percentage": 8}
]
\`\`\`
**Why**: Based on actual clinical trial data for Sertraline.

### ❌ Poor Distribution:
\`\`\`json
[
  {"name": "Side effects", "percentage": 100}
]
\`\`\`
**Why**: Too vague, single option, not specific values.

Now generate distribution for **${fieldName}** for ${solutionTitle}.`
}

/**
 * Get validation-specific field prompt
 */
export function getFieldValidationPrompt(
  fieldName: string,
  category: string,
  proposedValues: Array<{ name: string; percentage: number }>
): string {
  const total = proposedValues.reduce((sum, v) => sum + v.percentage, 0)
  const optionCount = proposedValues.length

  return `# Field Distribution Validation

Validate this proposed distribution:

**Field**: ${fieldName}
**Category**: ${category}

## Proposed Distribution:
${proposedValues.map(v => `- ${v.name}: ${v.percentage}%`).join('\n')}

## Validation Checks:

1. **Percentage Sum**: ${total}% ${total === 100 ? '✅' : `❌ (must be 100%)`}
2. **Option Count**: ${optionCount} ${optionCount >= 4 ? '✅' : `❌ (minimum 4 options)`}
3. **Value Format**: Check each value matches dropdown options
4. **Realistic Distribution**: Does this reflect actual data patterns?

${total !== 100 || optionCount < 4 ? `
## Issues Found:
${total !== 100 ? `- Percentages sum to ${total}%, must be exactly 100%` : ''}
${optionCount < 4 ? `- Only ${optionCount} options, need at least 4 for diversity` : ''}

## Action Required:
Regenerate this field distribution to fix the issues above.
` : `
## ✅ Validation Passed

All checks passed. Distribution is ready to use.
`}
`
}
