/**
 * JSON Repair Utility
 * Fixes common JSON formatting issues from AI responses
 */

/**
 * Attempt to repair malformed JSON
 */
export function repairJSON(jsonString: string): string {
  let repaired = jsonString
  
  // Remove any markdown code blocks
  repaired = repaired.replace(/```json\s*/gi, '')
  repaired = repaired.replace(/```\s*/g, '')
  
  // Remove any leading/trailing text before/after JSON
  const arrayMatch = repaired.match(/\[[\s\S]*\]/)
  const objectMatch = repaired.match(/\{[\s\S]*\}/)
  
  if (arrayMatch) {
    repaired = arrayMatch[0]
  } else if (objectMatch) {
    repaired = objectMatch[0]
  }
  
  // Fix common issues
  // 1. Remove comments
  repaired = repaired.replace(/\/\/[^\n]*/g, '')
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // 2. Fix trailing commas
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1')
  
  // 3. Add missing commas between array elements
  repaired = repaired.replace(/\}(\s*)\{/g, '},$1{')
  
  // 4. Fix missing quotes around property names
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
  
  // 5. Fix single quotes to double quotes
  repaired = repaired.replace(/'/g, '"')
  
  // 6. Remove any control characters
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, '')
  
  // 7. Fix escaped quotes that might be double-escaped
  repaired = repaired.replace(/\\\\"/g, '\\"')
  
  return repaired
}

/**
 * Try to parse JSON with repair fallback
 */
export function parseJSONSafely(jsonString: string): any {
  // First try parsing as-is
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    // Try repairing and parsing again
    try {
      const repaired = repairJSON(jsonString)
      return JSON.parse(repaired)
    } catch (repairError) {
      // Log both errors for debugging
      console.error('Original parse error:', error)
      console.error('Repair parse error:', repairError)
      throw new Error(`Failed to parse JSON even after repair: ${repairError.message}`)
    }
  }
}