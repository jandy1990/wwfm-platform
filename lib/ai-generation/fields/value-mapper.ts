/**
 * Intelligent Value Mapper
 *
 * Maps natural AI-generated values to exact dropdown options
 * Uses smart logic to find the best matching dropdown value
 */

import { DROPDOWN_OPTIONS, getDropdownOptionsForField } from '../../config/solution-dropdown-options'

export function mapCostToDropdown(value: string, options: string[]): string {
  if (value.toLowerCase().includes('free') || value === '0' || value === '$0') {
    return options.find(opt => opt.toLowerCase().includes('free')) || options[0]
  }

  const match = value.match(/\$?(\d+(?:\.\d+)?)/)
  if (!match) return options[0]

  const amount = parseFloat(match[1])

  for (const option of options) {
    if (option.includes('Under')) {
      const underMatch = option.match(/Under \$?(\d+)/)
      if (underMatch) {
        const threshold = parseFloat(underMatch[1])
        if (amount < threshold) return option
      }
    } else if (option.includes('Over')) {
      const overMatch = option.match(/Over \$?(\d+)/)
      if (overMatch) {
        const threshold = parseFloat(overMatch[1])
        if (amount > threshold) return option
      }
    } else if (option.includes('-')) {
      const rangeMatch = option.match(/\$?(\d+(?:\.\d+)?)-\$?(\d+(?:\.\d+)?)/)
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1])
        const max = parseFloat(rangeMatch[2])
        if (amount >= min && amount <= max) return option
      }
    }
  }

  return findClosestCostOption(amount, options)
}

function findClosestCostOption(amount: number, options: string[]): string {
  let closest = options[0]
  let minDiff = Infinity

  for (const option of options) {
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

export function mapTimeToDropdown(value: string, options: string[]): string {
  const lowerValue = value.toLowerCase()

  if (lowerValue.includes('immediate')) {
    return options.find(opt => opt.toLowerCase().includes('immediate')) || options[0]
  }

  const match = value.match(/(\d+(?:\.\d+)?)\s*(day|week|month|year|hour)/i)
  if (!match) {
    return options.find(opt => opt.toLowerCase().includes(lowerValue.split(' ')[0])) || options[0]
  }

  const amount = parseFloat(match[1])
  const unit = match[2].toLowerCase()

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
      weeks = amount * 4
      break
    case 'year':
    case 'years':
      weeks = amount * 52
      break
    case 'hour':
    case 'hours':
      weeks = amount / (24 * 7)
      break
    default:
      weeks = amount
  }

  const normalizedValue = weeks

  const rangeMap: Array<{ option: string; min: number; max: number }> = options.map(option => {
    if (option.includes('Immediately')) {
      return { option, min: 0, max: 0.1 }
    }
    if (option.includes('days')) {
      const nums = option.match(/(\d+)-(\d+)/)
      if (nums) {
        return {
          option,
          min: parseInt(nums[1]) / 7,
          max: parseInt(nums[2]) / 7
        }
      }
    }
    if (option.includes('weeks')) {
      const nums = option.match(/(\d+)-(\d+)/)
      if (nums) {
        return {
          option,
          min: parseInt(nums[1]),
          max: parseInt(nums[2])
        }
      }
    }
    if (option.includes('months')) {
      const nums = option.match(/(\d+)-(\d+)/)
      if (nums) {
        return {
          option,
          min: parseInt(nums[1]) * 4,
          max: parseInt(nums[2]) * 4
        }
      }
    }
    if (option.includes('year')) {
      return { option, min: 52, max: 104 }
    }
    return { option, min: 0, max: Infinity }
  })

  for (const { option, min, max } of rangeMap) {
    if (normalizedValue >= min && normalizedValue <= max) {
      return option
    }
  }

  return options[0]
}

export function mapFieldToDropdown(
  category: string,
  field: string,
  value: string
): string {
  const options = getDropdownOptionsForField(category, field) ?? DROPDOWN_OPTIONS[field]

  if (!options || options.length === 0) {
    return value
  }

  const normalizedValue = value.trim()
  const lowerValue = normalizedValue.toLowerCase()

  const aliasMappings: Record<string, Record<string, string>> = {
    frequency: {
      'once daily': 'Daily',
      'twice daily': 'Daily',
      'three times daily': '5-6 times per week',
      'daily practice': 'Daily',
      'daily sessions': 'Daily',
      'weekly practice': 'Weekly',
      'weekly sessions': 'Weekly',
      'three-four times per week': '3-4 times per week',
      'three times per week': '3-4 times per week',
      'four times per week': '3-4 times per week',
      'five times per week': '5-6 times per week',
      'six times per week': '5-6 times per week',
      'multiple times per day': 'Daily',
      'as-needed practice': 'As needed'
    },
    session_frequency: {
      'weekly sessions': 'Weekly',
      'once weekly': 'Weekly',
      'weekly therapy': 'Weekly',
      'weekly check-ins': 'Weekly',
      'bi-weekly': 'Fortnightly',
      'biweekly': 'Fortnightly',
      'every other week': 'Fortnightly',
      'twice per month': 'Fortnightly',
      'monthly check-ins': 'Monthly',
      'monthly sessions': 'Monthly',
      'daily check-ins': 'Multiple times per week',
      'two times per week': 'Multiple times per week',
      'twice weekly': 'Multiple times per week',
      'multiple weekly sessions': 'Multiple times per week',
      'as-needed sessions': 'As needed',
      'on demand': 'As needed',
      'one off': 'One-time only',
      'single session': 'One-time only'
    },
    format: {
      'video/online': 'Virtual/Online',
      'online (video)': 'Virtual/Online',
      'online only': 'Virtual/Online',
      'in-person only': 'In-person',
      'phone call': 'Phone',
      'phone session': 'Phone'
    }
  }

  switch (field) {
    case 'cost':
    case 'startup_cost':
    case 'ongoing_cost':
    case 'cost_impact':
      return mapCostToDropdown(value, options)
    case 'time_to_results':
    case 'time_to_complete':
    case 'access_time':
    case 'recovery_time':
      return mapTimeToDropdown(value, options)
    default:
      const directMatch = options.find(opt => opt.toLowerCase() === lowerValue)
      if (directMatch) {
        return directMatch
      }

      const fieldAliases = aliasMappings[field]
      if (fieldAliases) {
        const alias = fieldAliases[lowerValue]
        if (alias && options.includes(alias)) {
          return alias
        }
      }

      return options[0]
  }
}

export function mapAllFieldsToDropdowns(
  fields: Record<string, any>,
  category: string
): Record<string, any> {
  const mappedFields: Record<string, any> = {}

  for (const [field, value] of Object.entries(fields)) {
    if (value === null || value === undefined) {
      mappedFields[field] = value
      continue
    }

    if (typeof value === 'string') {
      mappedFields[field] = mapFieldToDropdown(category, field, value)
    } else if (Array.isArray(value)) {
      mappedFields[field] = value.map(item =>
        typeof item === 'string' ? mapFieldToDropdown(category, field, item) : item
      )
    } else if (typeof value === 'object' && value !== null && 'mode' in value && 'values' in value) {
      mappedFields[field] = {
        ...value,
        mode: mapFieldToDropdown(category, field, value.mode),
        values: Array.isArray(value.values)
          ? value.values.map(entry => ({
              ...entry,
              value: mapFieldToDropdown(category, field, entry.value)
            }))
          : value.values
      }
    } else {
      mappedFields[field] = value
    }
  }

  return mappedFields
}

export { DROPDOWN_OPTIONS, getDropdownOptionsForField }
