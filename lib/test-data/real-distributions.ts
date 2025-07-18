import { GoalSolutionWithVariants } from '@/lib/solutions/goal-solutions';

// Helper to get field value from solution_fields JSONB with field name mapping
export const getFieldValueFromSolution = (
  solution: GoalSolutionWithVariants, 
  fieldName: string
): string | null => {
  // Check solution_fields from goal_implementation_links
  const solutionFields = solution.solution_fields as Record<string, unknown> || {};
  
  // Also check variant category_fields if available
  const bestVariant = solution.variants[0];
  const variantFields = bestVariant?.category_fields as Record<string, unknown> || {};
  
  // Merge fields, with variant fields taking precedence
  const allFields = { ...solutionFields, ...variantFields };
  
  // Field name mapping for mismatches between UI and database
  const fieldNameMapping: Record<string, string[]> = {
    'prep_time': ['prep_time', 'daily_prep_time', 'preparation_adjustment_time'],
    'sustainability': ['sustainability', 'long_term_sustainability'],
    'cost_impact': ['cost_impact'],
    'time_to_results': ['time_to_results'],
    'challenges': ['challenges', 'challenges_experienced'],
    'adjustment_period': ['adjustment_period'],
    'previous_sleep_hours': ['previous_sleep_hours'],
    'most_valuable_feature': ['most_valuable_feature', 'valuable_feature'],
    'usage_frequency': ['usage_frequency', 'usage']
  };
  
  // Try mapped field names first
  const possibleFieldNames = fieldNameMapping[fieldName] || [fieldName];
  
  for (const possibleName of possibleFieldNames) {
    const value = allFields[possibleName];
    if (value !== null && value !== undefined && value !== '') {
      return Array.isArray(value) ? value.join(' • ') : (value?.toString() || '');
    }
  }
  
  // Special handling for cost fields
  if (fieldName === 'cost' && !allFields.cost) {
    // Check for startup_cost, ongoing_cost, etc.
    if (allFields.startup_cost || allFields.ongoing_cost) {
      const parts = [];
      if (allFields.startup_cost && allFields.startup_cost !== 'Free/No startup cost') {
        parts.push(`${allFields.startup_cost} startup`);
      }
      if (allFields.ongoing_cost && allFields.ongoing_cost !== 'Free/No ongoing cost') {
        parts.push(`${allFields.ongoing_cost} ongoing`);
      }
      return parts.length > 0 ? parts.join(', ') : 'Free';
    }
  }
  
  return null;
};