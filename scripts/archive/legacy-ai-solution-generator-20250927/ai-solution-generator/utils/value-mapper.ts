/**
 * Intelligent Value Mapper
 * 
 * Maps natural AI-generated values to exact dropdown options
 * Uses smart logic to find the best matching dropdown value
 */

import { DROPDOWN_OPTIONS, getDropdownOptionsForField } from '../config/dropdown-options'

/**
 * Map a natural cost value to the appropriate dropdown option
 * Examples:
 *   "$18/month" → "$10-25/month"
 *   "$75" → "$50-100"
 *   "free" → "Free"
 */
export function mapCostToDropdown(value: string, options: string[]): string {
  const cleaned = normalizeNumericString(value)
  const lower = cleaned.toLowerCase()

  // Handle free/no cost
  if (lower.includes('free') || cleaned === '0' || cleaned === '$0' || cleaned === '$0.00') {
    return options.find(opt => opt.toLowerCase().includes('free')) || options[0]
  }

  const rangeMatch = cleaned.match(/\$?(\d+(?:\.\d+)?)\s*[-–]\s*\$?(\d+(?:\.\d+)?)/)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1])
    const max = parseFloat(rangeMatch[2])
    for (const option of options) {
      const optLower = option.toLowerCase()
      const optRange = option.match(/\$?(\d+(?:\.\d+)?)-\$?(\d+(?:\.\d+)?)/)
      if (optLower.includes('under')) {
        const underMatch = option.match(/Under \$?(\d+(?:\.\d+)?)/)
        if (underMatch && max < parseFloat(underMatch[1])) return option
      }
      if (optLower.includes('over')) {
        const overMatch = option.match(/Over \$?(\d+(?:\.\d+)?)/)
        if (overMatch && min > parseFloat(overMatch[1])) return option
      }
      if (optRange) {
        const optMin = parseFloat(optRange[1])
        const optMax = parseFloat(optRange[2])
        if ((min >= optMin && min <= optMax) || (max >= optMin && max <= optMax) || (min <= optMin && max >= optMax)) {
          return option
        }
      }
    }
    const midpoint = (min + max) / 2
    return findClosestCostOption(midpoint, options)
  }

  // Extract numeric value
  const match = cleaned.match(/\$?(\d+(?:\.\d+)?)/)
  if (!match) return options[0]

  const amount = parseFloat(match[1])
  for (const option of options) {
    const optLower = option.toLowerCase()
    if (optLower.includes('under')) {
      const underMatch = option.match(/Under \$?(\d+(?:\.\d+)?)/)
      if (underMatch && amount < parseFloat(underMatch[1])) return option
    }
    if (optLower.includes('over')) {
      const overMatch = option.match(/Over \$?(\d+(?:\.\d+)?)/)
      if (overMatch && amount > parseFloat(overMatch[1])) return option
    }
    const optRange = option.match(/\$?(\d+(?:\.\d+)?)-\$?(\d+(?:\.\d+)?)/)
    if (optRange) {
      const optMin = parseFloat(optRange[1])
      const optMax = parseFloat(optRange[2])
      if (amount >= optMin && amount <= optMax) return option
    }
  }

  return findClosestCostOption(amount, options)
}

function normalizeNumericString(value: string): string {
  return value
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+-\s+/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalizeFieldString(fieldName: string, rawValue: string): string {
  const trimmed = normalizeNumericString(rawValue)
  const lower = trimmed.toLowerCase()

  if (!trimmed) return trimmed

  if (fieldName === 'subscription_type') {
    if (lower.includes('annual') || lower.includes('year')) return 'Annual subscription'
    if (lower.includes('one-time') || lower.includes('one time') || lower.includes('lifetime')) {
      return 'One-time purchase'
    }
    if (lower.includes('free') || lower.includes('trial')) return 'Free version'
    return 'Monthly subscription'
  }

  if (fieldName === 'length_of_use') {
    if (lower.includes('short')) return 'Less than 1 month'
    if (lower.includes('long') || lower.includes('ongoing') || lower.includes('indefinite')) {
      if (lower.includes('as needed')) return 'As needed'
      if (lower.includes('long-term') || lower.includes('long term')) return 'Over 2 years'
      return 'Still using'
    }
    if (lower.includes('as needed')) return 'As needed'
  }

  if (fieldName === 'format') {
    if (lower.includes('hybrid') || (lower.includes('both') && (lower.includes('online') || lower.includes('in-person')))) {
      return 'Hybrid (both)'
    }
    if (lower.includes('virtual') || lower.includes('online') || lower.includes('video') || lower.includes('messaging') || lower.includes('digital')) {
      return 'Virtual/Online'
    }
    if (lower.includes('text') || lower.includes('chat')) {
      return 'Text/Chat'
    }
    if (lower.includes('phone')) {
      return 'Phone'
    }
    if (lower.includes('in-person') || lower.includes('office') || lower.includes('clinic')) {
      return 'In-person'
    }
  }

  if (fieldName === 'response_time') {
    if (lower.includes('immediate')) return 'Immediate'
    if (lower.includes('5 minute')) return 'Within 5 minutes'
    if (lower.includes('30 minute') || lower.includes('half hour')) return 'Within 30 minutes'
    if (lower.includes('hour')) return 'Within hours'
    if (lower.includes('24 hour') || lower.includes('day')) return 'Within 24 hours'
    if (lower.includes('couple of days') || lower.includes('few days')) return 'Within a couple of days'
    if (lower.includes('week') || lower.includes('longer')) return 'More than a couple of days'
  }

  return trimmed
}

/**
 * Find the closest cost option when exact range not found
 */
function findClosestCostOption(amount: number, options: string[]): string {
  let closest = options[0]
  let minDiff = Infinity
  
  for (const option of options) {
    // Extract the midpoint of each range
    const rangeMatch = option.match(/\$?(\d+(?:\.\d+)?)-?\$?(\d+(?:\.\d+)?)?/)
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1])
      const max = rangeMatch[2] ? parseFloat(rangeMatch[2]) : min
      const midpoint = (min + max) / 2
      const diff = Math.abs(amount - midpoint)
      
      if (diff < minDiff) {
        minDiff = diff
        closest = option
      }
    }
  }
  
  return closest
}

/**
 * Map a natural time value to the appropriate dropdown option
 * Examples:
 *   "2 weeks" → "1-2 weeks"
 *   "immediately" → "Immediately"
 *   "about a month" → "1-2 months"
 */
export function mapTimeToDropdown(value: string, options: string[]): string {
  const cleaned = normalizeNumericString(value)
  const prepared = cleaned.replace(/\bto\b/gi, '-')
  const lowerValue = prepared.toLowerCase()

  // Direct matches
  if (lowerValue.includes('immediate')) {
    return options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  if (lowerValue.includes('instant')) {
    return options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  if (lowerValue.includes('minute')) {
    const minuteOption = options.find(opt => opt.toLowerCase().includes('minute'))
    if (minuteOption) return minuteOption
    return options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  if (lowerValue.includes('hour')) {
    const hourOption = options.find(opt => opt.toLowerCase().includes('hour'))
    if (hourOption) return hourOption
    return options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  if (lowerValue.includes('couple of days') || lowerValue.includes('few days')) {
    return options.find(opt => opt.toLowerCase().includes('couple of days')) ||
      options.find(opt => opt.toLowerCase().includes('days')) ||
      options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  // Extract numeric value and unit
  const rangeMatch = prepared.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years|hour|hours)/i)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1])
    const max = parseFloat(rangeMatch[2])
    const unit = rangeMatch[3].toLowerCase()
    const avg = (min + max) / 2
    return mapTimeToDropdown(`${avg} ${unit}`, options)
  }

  const match = prepared.match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years|hour|hours)/i)
  if (!match) {
    // Try to find a fuzzy match
    return options.find(opt => 
      opt.toLowerCase().includes(lowerValue.split(' ')[0])
    ) || options[0]
  }
  
  const amount = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  
  // Convert to a consistent unit (weeks)
  let weeks: number
  switch (unit) {
    case 'day':
    case 'days':
      weeks = amount / 7
      break
    case 'week':
    case 'weeks':
      weeks = amount
      break
    case 'month':
    case 'months':
      weeks = amount * 4.33
      break
    case 'year':
    case 'years':
      weeks = amount * 52
      break
    default:
      weeks = amount
  }
  
  // Map to appropriate option
  if (weeks < 0.5) return options.find(opt => opt.includes('Immediately')) || options[0]
  if (weeks < 1) return options.find(opt => opt.includes('Within days')) || options[0]
  if (weeks <= 2) return options.find(opt => opt.includes('1-2 weeks')) || options[0]
  if (weeks <= 4) return options.find(opt => opt.includes('3-4 weeks')) || options[0]
  if (weeks <= 8) return options.find(opt => opt.includes('1-2 months')) || options[0]
  if (weeks <= 26) return options.find(opt => opt.includes('3-6 months')) || options[0]
  
  return options.find(opt => opt.includes('6+ months')) || options[options.length - 1]
}

/**
 * Map a time commitment value to the appropriate dropdown option
 * Examples:
 *   "30-60 minutes daily" → "30-60 minutes"
 *   "2 hours per week" → "1-2 hours"
 *   "5 minutes" → "Under 5 minutes"
 */
export function mapTimeCommitmentToDropdown(value: string, options: string[]): string {
  const lowerValue = value.toLowerCase()
  
  // Extract numeric value and unit
  const match = value.match(/(\d+)(?:-(\d+))?\s*(minute|hour|second)/i)
  if (!match) {
    // Check for patterns like "Ongoing", "Variable", "Background"
    if (lowerValue.includes('ongoing') || lowerValue.includes('background')) {
      return options.find(opt => opt.toLowerCase().includes('ongoing')) ||
             options.find(opt => opt.toLowerCase().includes('background')) || options[0]
    }
    if (lowerValue.includes('variable') || lowerValue.includes('varies')) {
      return options[0] // Default to first option for variable
    }
    return options[0]
  }
  
  const minAmount = parseInt(match[1])
  const maxAmount = match[2] ? parseInt(match[2]) : minAmount
  const unit = match[3].toLowerCase()
  
  // Convert to minutes for comparison
  let minutes: number
  if (unit.includes('hour')) {
    minutes = (minAmount + maxAmount) / 2 * 60
  } else if (unit.includes('second')) {
    minutes = (minAmount + maxAmount) / 2 / 60
  } else {
    minutes = (minAmount + maxAmount) / 2
  }
  
  // Map to appropriate option based on actual time ranges
  if (minutes < 5) {
    return options.find(opt => opt.includes('Under 5 minutes')) || options[0]
  } else if (minutes <= 10) {
    return options.find(opt => opt.includes('5-10 minutes')) || 
           options.find(opt => opt.includes('10 minutes')) || options[0]
  } else if (minutes <= 20) {
    return options.find(opt => opt.includes('10-20 minutes')) ||
           options.find(opt => opt.includes('15-30 minutes')) || options[0]
  } else if (minutes <= 30) {
    return options.find(opt => opt.includes('15-30 minutes')) ||
           options.find(opt => opt.includes('20-30 minutes')) || options[0]
  } else if (minutes <= 60) {
    return options.find(opt => opt.includes('30-60 minutes')) ||
           options.find(opt => opt.includes('Under 1 hour')) || options[0]
  } else if (minutes <= 120) {
    return options.find(opt => opt.includes('1-2 hours')) || options[0]
  } else {
    return options.find(opt => opt.includes('2+ hours')) ||
           options.find(opt => opt.includes('Over 2 hours')) || 
           options[options.length - 1]
  }
}

/**
 * Map a natural frequency value to the appropriate dropdown option
 * Examples:
 *   "twice a day" → "twice daily"
 *   "every day" → "Daily"
 *   "3 times per week" → "Few times a week"
 *   "Twice daily (AM & PM)" → "Twice daily"
 *   "every other day" → "Every other day"
 */
export function mapFrequencyToDropdown(value: string, options: string[]): string {
  const cleaned = normalizeNumericString(value).replace(/[()]/g, '').trim()
  const lowerValue = cleaned.toLowerCase()
  const numbers = lowerValue.match(/\d+/g)?.map(n => parseInt(n, 10)) || []

  // Handle exact lowercase issues found in the data first
  // Map to the EXACT values that exist in dropdown options
  if (lowerValue === 'once daily') {
    return options.find(opt => opt === 'once daily') ||
           options.find(opt => opt === 'Daily') ||
           options.find(opt => opt.toLowerCase() === 'daily') || options[0]
  }

  if (lowerValue === 'twice daily') {
    return options.find(opt => opt === 'twice daily') ||
           options.find(opt => opt === 'Twice daily') ||
           options.find(opt => opt.toLowerCase().includes('twice daily')) || options[0]
  }

  if (lowerValue === 'every other day') {
    return options.find(opt => opt === 'every other day') ||
           options.find(opt => opt === 'Every other day') ||
           options.find(opt => opt.toLowerCase().includes('every other day')) ||
           options.find(opt => opt.toLowerCase().includes('alternate')) || options[0]
  }

  if (lowerValue === 'every few days') {
    return options.find(opt => opt === 'every few days') ||
           options.find(opt => opt === 'Every few days') ||
           options.find(opt => opt.toLowerCase().includes('every few days')) || options[0]
  }

  // Handle special edge cases
  if (lowerValue.includes('every other day') || lowerValue.includes('alternating days')) {
    return options.find(opt => opt === 'every other day') ||
           options.find(opt => opt === 'Every other day') ||
           options.find(opt => opt.toLowerCase().includes('every other day')) ||
           options.find(opt => opt.toLowerCase().includes('alternate')) || options[0]
  }

  if (lowerValue.includes('varies') || lowerValue.includes('variable') || lowerValue.includes('as directed')) {
    return options.find(opt => opt.toLowerCase().includes('as needed')) ||
           options.find(opt => opt.toLowerCase().includes('variable')) ||
           options.find(opt => opt.toLowerCase().includes('varies')) || options[0]
  }

  // Handle daily variations - now with AM/PM pattern recognition
  if (lowerValue.includes('every day') || lowerValue.includes('daily') || lowerValue.includes('per day') || lowerValue.includes('am') || lowerValue.includes('pm')) {
    const multipleDaily = options.find(opt => opt.toLowerCase().includes('multiple times daily'))
    if (numbers.some(n => n >= 3) || (lowerValue.includes('am') && lowerValue.includes('pm'))) {
      const threeDaily = options.find(opt => opt.toLowerCase().includes('three times daily'))
      if (threeDaily) return threeDaily
      if (multipleDaily) return multipleDaily
    }
    if (numbers.some(n => n >= 2) || lowerValue.includes('twice')) {
      const twiceDaily = options.find(opt => opt.toLowerCase().includes('twice daily'))
      if (twiceDaily) return twiceDaily
      if (multipleDaily) return multipleDaily
    }
    const dailyOption = options.find(opt => opt.toLowerCase() === 'daily') ||
      options.find(opt => opt.toLowerCase() === 'once daily') ||
      options.find(opt => opt.toLowerCase().includes('daily'))
    if (dailyOption) return dailyOption
    return options[0]
  }

  // Handle weekly variations
  if (lowerValue.includes('week')) {
    // Handle "X times per week" pattern more precisely
    const timesMatch = lowerValue.match(/(\d+)(?:-(\d+))?\s*times?\s*(?:per|a)?\s*week/)
    if (timesMatch) {
      const minTimes = parseInt(timesMatch[1])
      const maxTimes = timesMatch[2] ? parseInt(timesMatch[2]) : minTimes
      const avgTimes = (minTimes + maxTimes) / 2

      const multipleWeeklyOption = options.find(opt => opt.toLowerCase().includes('multiple times per week'))
      if (avgTimes > 1 && multipleWeeklyOption) {
        return multipleWeeklyOption
      }

      const fewWeeklyOption = options.find(opt => opt.toLowerCase().includes('few times a week'))
      if (avgTimes > 1 && fewWeeklyOption) {
        return fewWeeklyOption
      }

      // Map to the most appropriate weekly frequency
      if (avgTimes === 1) {
        return options.find(opt => opt.toLowerCase() === 'weekly') ||
               options.find(opt => opt.toLowerCase() === 'once weekly') || options[0]
      } else if (avgTimes <= 3) {
        return options.find(opt => opt.toLowerCase().includes('few times a week')) ||
               options.find(opt => opt.toLowerCase().includes('2-3 times')) ||
               options.find(opt => opt.toLowerCase() === 'weekly') || options[0]
      } else if (avgTimes <= 5) {
        // Look for weekly options, NOT daily options
        return options.find(opt => opt.toLowerCase().includes('several times a week')) ||
               options.find(opt => opt.toLowerCase().includes('4-5 times')) ||
               options.find(opt => opt.toLowerCase().includes('few times a week')) ||
               options.find(opt => opt.toLowerCase() === 'weekly') || options[0]
      } else {
        // 6-7 times per week might map to daily
        return options.find(opt => opt.toLowerCase() === 'daily') ||
               options.find(opt => opt.toLowerCase() === 'once daily') || options[0]
      }
    }

    // Handle other weekly patterns
    if (lowerValue.includes('once')) {
      return options.find(opt => opt.toLowerCase() === 'weekly') || options[0]
    }
  }

  // Handle monthly
  if (lowerValue.includes('month')) {
    return options.find(opt => opt.toLowerCase() === 'monthly') || options[0]
  }

  // Handle as needed
  if (lowerValue.includes('as needed') || lowerValue.includes('when needed')) {
    return options.find(opt => opt.toLowerCase().includes('as needed')) || options[0]
  }

  // Fallback: try to find any partial match
  const words = lowerValue.split(' ')
  for (const option of options) {
    const optLower = option.toLowerCase()
    if (words.some(word => optLower.includes(word))) {
      return option
    }
  }

  return options[0]
}

/**
 * Map diet/nutrition specific fields with enhanced logic
 */
export function mapDietNutritionFields(fieldName: string, value: string, options: string[]): string {
  const lowerValue = value.toLowerCase()

  if (fieldName === 'still_following') {
    // Handle the 490 problematic cases in diet_nutrition
    if (lowerValue.includes('yes') || lowerValue.includes('continuing') || lowerValue.includes('maintain')) {
      return options.find(opt => opt.toLowerCase() === 'yes') || options[0]
    }
    if (lowerValue.includes('no') || lowerValue.includes('stopped') || lowerValue.includes('discontinued')) {
      return options.find(opt => opt.toLowerCase() === 'no') || options[0]
    }
    if (lowerValue.includes('modified') || lowerValue.includes('adapted') || lowerValue.includes('changed')) {
      return options.find(opt => opt.toLowerCase().includes('modified')) ||
             options.find(opt => opt.toLowerCase().includes('partially')) || options[0]
    }
  }

  return fuzzyMatchDropdown(value, options)
}

/**
 * Map beauty/skincare specific fields with enhanced logic
 */
export function mapBeautySkincareFields(fieldName: string, value: string, options: string[]): string {
  const lowerValue = value.toLowerCase().replace(/[()&]/g, '').trim()

  if (fieldName === 'skincare_frequency') {
    // Handle the 775 problematic cases like "Twice daily (AM & PM)"
    if (lowerValue.includes('twice') && (lowerValue.includes('am') || lowerValue.includes('pm'))) {
      return options.find(opt => opt.toLowerCase().includes('twice daily')) || options[0]
    }
    if (lowerValue.includes('morning') && lowerValue.includes('evening')) {
      return options.find(opt => opt.toLowerCase().includes('twice daily')) || options[0]
    }
    if (lowerValue.includes('once') || lowerValue.includes('single application')) {
      return options.find(opt => opt.toLowerCase().includes('once daily')) ||
             options.find(opt => opt.toLowerCase().includes('daily')) || options[0]
    }

    // Use the general frequency mapping for other patterns
    return mapFrequencyToDropdown(value, options)
  }

  return fuzzyMatchDropdown(value, options)
}

/**
 * Map supplement/medication specific fields with enhanced logic
 */
export function mapSupplementMedicationFields(fieldName: string, value: string, options: string[]): string {
  const lowerValue = value.toLowerCase()

  if (fieldName === 'side_effects') {
    // Handle the 346 problematic cases in supplements
    // Extract key side effects from descriptive text
    const sideEffectMap = {
      'stomach': 'Stomach upset',
      'nausea': 'Nausea',
      'headache': 'Headaches',
      'dizziness': 'Dizziness',
      'fatigue': 'Fatigue',
      'skin': 'Skin irritation',
      'allergic': 'Allergic reactions',
      'drowsiness': 'Drowsiness',
      'insomnia': 'Sleep issues',
      'digestive': 'Digestive issues'
    }

    for (const [keyword, sideEffect] of Object.entries(sideEffectMap)) {
      if (lowerValue.includes(keyword)) {
        const match = options.find(opt => opt.toLowerCase().includes(sideEffect.toLowerCase()))
        if (match) return match
      }
    }

    // Default to "None" if no specific side effect found and "none" is mentioned
    if (lowerValue.includes('none') || lowerValue.includes('minimal')) {
      return options.find(opt => opt.toLowerCase().includes('none')) ||
             options.find(opt => opt.toLowerCase().includes('minimal')) || options[0]
    }
  }

  return fuzzyMatchDropdown(value, options)
}

/**
 * Main function to intelligently map any field value to its dropdown option
 */
export function mapToDropdownValue(
  fieldName: string,
  naturalValue: string,
  category: string
): string {
  // Get the allowed options for this field
  const options = getDropdownOptionsForField(category, fieldName)

  // If no dropdown options, return as-is (free text field)
  if (!options || options.length === 0) {
    return naturalValue
  }

  // First check for exact match (case-insensitive)
  const exactMatch = options.find(opt =>
    opt.toLowerCase() === naturalValue.toLowerCase()
  )
  if (exactMatch) return exactMatch

  // Apply category-specific enhanced mappings first
  if (category === 'diet_nutrition') {
    const dietResult = mapDietNutritionFields(fieldName, naturalValue, options)
    if (dietResult !== options[0] || naturalValue.toLowerCase() === dietResult.toLowerCase()) {
      return dietResult
    }
  }

  if (category === 'beauty_skincare') {
    const beautyResult = mapBeautySkincareFields(fieldName, naturalValue, options)
    if (beautyResult !== options[0] || naturalValue.toLowerCase() === beautyResult.toLowerCase()) {
      return beautyResult
    }
  }

  if (category === 'supplements_vitamins' || category === 'medications' || category === 'natural_remedies') {
    const supplementResult = mapSupplementMedicationFields(fieldName, naturalValue, options)
    if (supplementResult !== options[0] || naturalValue.toLowerCase() === supplementResult.toLowerCase()) {
      return supplementResult
    }
  }

  // Apply intelligent mapping based on field type
  if (fieldName.includes('cost') || fieldName.includes('price')) {
    return mapCostToDropdown(naturalValue, options)
  }

  if (fieldName.includes('time_to_results') || fieldName.includes('duration')) {
    return mapTimeToDropdown(naturalValue, options)
  }

  // Handle time_commitment separately - it's about daily/weekly time investment
  if (fieldName === 'time_commitment') {
    return mapTimeCommitmentToDropdown(naturalValue, options)
  }

  if (fieldName.includes('frequency')) {
    return mapFrequencyToDropdown(naturalValue, options)
  }

  // For other fields, try fuzzy matching
  return fuzzyMatchDropdown(naturalValue, options)
}

/**
 * Fuzzy match for general fields
 */
export function fuzzyMatchDropdown(value: string, options: string[]): string {
  const lowerValue = value.toLowerCase()
  
  // Try to find option containing the value
  const containsMatch = options.find(opt => 
    opt.toLowerCase().includes(lowerValue) || 
    lowerValue.includes(opt.toLowerCase())
  )
  if (containsMatch) return containsMatch
  
  // Try word-by-word matching
  const words = lowerValue.split(/\s+/)
  let bestMatch = options[0]
  let maxMatches = 0
  
  for (const option of options) {
    const optLower = option.toLowerCase()
    const matches = words.filter(word => optLower.includes(word)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = option
    }
  }
  
  return bestMatch
}

/**
 * Process all fields in a solution to map to dropdown values
 */
export function mapAllFieldsToDropdowns(
  fields: Record<string, any>,
  category: string
): Record<string, any> {
  const mappedFields: Record<string, any> = {}

  for (const [fieldName, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      mappedFields[fieldName] = normalizeArrayField(fieldName, value, category)
      continue
    }

    if (typeof value === 'string') {
      const normalized = normalizeFieldString(fieldName, value)
      mappedFields[fieldName] = mapToDropdownValue(fieldName, normalized, category)
      continue
    }

    // Preserve non-string/array values (numbers, objects) as-is
    mappedFields[fieldName] = value
  }

  return mappedFields
}

/**
 * Normalize array-based fields by mapping values to dropdowns and removing duplicates.
 */
function normalizeArrayField(
  fieldName: string,
  rawValues: any[],
  category: string
): string[] {
  if (!rawValues || rawValues.length === 0) {
    return []
  }

  const normalized: string[] = []
  const seen = new Set<string>()

  for (const raw of rawValues) {
    if (raw === null || raw === undefined) continue

    const valueAsString = String(raw).trim()
    if (!valueAsString) continue

    const mappedValue = mapToDropdownValue(fieldName, valueAsString, category)
    const dedupeKey = mappedValue.toLowerCase()

    if (seen.has(dedupeKey)) continue

    seen.add(dedupeKey)
    normalized.push(mappedValue)
  }

  return normalized
}
