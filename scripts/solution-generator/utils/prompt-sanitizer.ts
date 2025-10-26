/**
 * Prompt Sanitization Utilities
 *
 * Gemini has a relatively small context window. These helpers
 * normalise free-text inputs and trim overly long strings so that
 * downstream prompt builders can stay within the model limits.
 */

const DEFAULT_MAX_LENGTH = 800

interface SanitizeOptions {
  maxLength?: number
  preserveNewlines?: boolean
}

export function sanitizeTextForPrompt(
  input: string | null | undefined,
  options: SanitizeOptions = {}
): string {
  if (!input) return ''

  const { maxLength = DEFAULT_MAX_LENGTH, preserveNewlines = false } = options

  const normalised = preserveNewlines
    ? input
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : input.replace(/\s+/g, ' ').trim()

  if (normalised.length <= maxLength) {
    return normalised
  }

  const truncated = normalised.slice(0, Math.max(0, maxLength - 3)).trimEnd()
  return `${truncated}...`
}

export function clampFieldRequirements(requirements: string, maxLength = 2400): string {
  if (!requirements) return ''
  if (requirements.length <= maxLength) {
    return requirements
  }

  const trimmed = requirements.slice(0, Math.max(0, maxLength - 3)).trimEnd()
  return `${trimmed}...`
}
