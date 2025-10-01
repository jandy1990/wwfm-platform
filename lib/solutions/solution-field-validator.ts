import {
  getRequiredFields,
  getDropdownSource,
  isValidCategory
} from '@/lib/config/solution-fields'
import {
  DROPDOWN_OPTIONS,
  getDropdownOptionsForField
} from '@/lib/config/solution-dropdown-options'

export interface ValidateOptions {
  allowPartial?: boolean
}

export interface SolutionFieldValidationResult {
  isValid: boolean
  errors: string[]
  normalizedFields: Record<string, unknown>
}

const PLACEHOLDER_VALUES = new Set([
  '',
  'n/a',
  "don't remember",
  'prefer not to say'
])

const ARRAY_FIELDS_ALLOWING_CUSTOM = new Set(['challenges', 'side_effects'])

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  const lower = trimmed.toLowerCase()
  if (PLACEHOLDER_VALUES.has(lower)) return undefined
  return trimmed
}

function normalizeArray(values: unknown): string[] | undefined {
  if (!Array.isArray(values)) return undefined
  const normalized = values
    .map((val) => (typeof val === 'string' ? val.trim() : ''))
    .filter((val) => val.length > 0)
    // Don't filter out "None" - it's a valid option meaning no challenges/side effects

  return normalized.length > 0 ? normalized : undefined
}

function canonicalizeDropdownValue(value: string, validOptions: string[]): { value?: string; error?: string } {
  if (value === 'Unknown') {
    return { value }
  }

  if (validOptions.includes(value)) {
    return { value }
  }

  const match = validOptions.find((option) => option.toLowerCase() === value.toLowerCase())
  if (match) {
    return { value: match }
  }

  return {
    error: `Value "${value}" is not permitted. Expected one of: ${validOptions.slice(0, 5).join(', ')}${
      validOptions.length > 5 ? '…' : ''
    }`
  }
}

export function validateAndNormalizeSolutionFields(
  category: string,
  fields: Record<string, unknown>,
  options: ValidateOptions = {}
): SolutionFieldValidationResult {
  const errors: string[] = []

  if (!isValidCategory(category)) {
    return {
      isValid: false,
      errors: [`Unknown category: ${category}`],
      normalizedFields: {}
    }
  }

  const normalized: Record<string, unknown> = {}

  for (const [fieldName, rawValue] of Object.entries(fields || {})) {
    let normalizedValue: unknown

    if (Array.isArray(rawValue)) {
      const arr = normalizeArray(rawValue)
      if (!arr) continue

      const dropdownKey = safeGetDropdownSource(fieldName, category)
      if (dropdownKey) {
        const validOptions = DROPDOWN_OPTIONS[dropdownKey]
        if (validOptions) {
          const cleaned: string[] = []
          for (const entry of arr) {
            const { value, error } = canonicalizeDropdownValue(entry, validOptions)
            if (error) {
              if (ARRAY_FIELDS_ALLOWING_CUSTOM.has(fieldName)) {
                cleaned.push(entry)
              } else {
                errors.push(`${fieldName}: ${error}`)
              }
            } else if (value) {
              cleaned.push(value)
            }
          }
          if (cleaned.length > 0) {
            normalizedValue = cleaned
          }
        } else {
          normalizedValue = arr
        }
      } else {
        normalizedValue = arr
      }
    } else if (typeof rawValue === 'string') {
      const str = normalizeString(rawValue)
      if (!str) continue

      const dropdownKey = safeGetDropdownSource(fieldName, category)
      if (dropdownKey) {
        const validOptions = DROPDOWN_OPTIONS[dropdownKey]
        if (validOptions) {
          const { value, error } = canonicalizeDropdownValue(str, validOptions)
          if (error) {
            errors.push(`${fieldName}: ${error}`)
            continue
          }
          normalizedValue = value
        } else {
          normalizedValue = str
        }
      } else {
        normalizedValue = str
      }
    } else if (rawValue != null) {
      normalizedValue = rawValue
    }

    if (normalizedValue !== undefined) {
      normalized[fieldName] = normalizedValue
    }
  }

  if (!options.allowPartial) {
    const requiredFields = getRequiredFields(category)
    for (const requiredField of requiredFields) {
      const value = normalized[requiredField]
      if (
        value === undefined ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push(`Missing required field: ${requiredField}`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedFields: normalized
  }
}

function safeGetDropdownSource(fieldName: string, category: string): string | undefined {
  try {
    return getDropdownSource(fieldName, category)
  } catch {
    return undefined
  }
}
