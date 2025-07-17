import { GoalSolutionWithVariants } from '@/lib/solutions/goal-solutions';
import { DistributionData } from '@/components/molecules/DistributionField';

// Helper to extract real distribution data from actual user ratings
export const getRealDistributionForField = async (
  goalId: string, 
  fieldName: string
): Promise<DistributionData | null> => {
  // TODO: This would query the database for actual user ratings
  // For now, return null to fall back to single value display
  return null;
};

// Helper to get field value from solution_fields JSONB
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
  
  const value = allFields[fieldName];
  if (value === null || value === undefined || value === '') return null;
  
  return Array.isArray(value) ? value.join(' • ') : (value?.toString() || '');
};

// Create distribution data when we have multiple solutions for the same goal+field
export const createDistributionFromSolutions = (
  solutions: GoalSolutionWithVariants[],
  fieldName: string
): DistributionData | null => {
  // Collect all values for this field across solutions
  const fieldValues: Array<{ value: string; solution: GoalSolutionWithVariants }> = [];
  
  solutions.forEach(solution => {
    const value = getFieldValueFromSolution(solution, fieldName);
    if (value) {
      fieldValues.push({ value, solution });
    }
  });
  
  if (fieldValues.length < 2) {
    // Not enough data for a distribution
    return null;
  }
  
  // Count occurrences of each value
  const valueCounts = new Map<string, { count: number; totalRatings: number }>();
  
  fieldValues.forEach(({ value, solution }) => {
    const totalRatings = solution.variants.reduce((sum, variant) => {
      return sum + (variant.goal_links[0]?.rating_count || 1); // Default to 1 for AI data
    }, 0);
    
    if (valueCounts.has(value)) {
      const existing = valueCounts.get(value)!;
      valueCounts.set(value, {
        count: existing.count + 1,
        totalRatings: existing.totalRatings + totalRatings
      });
    } else {
      valueCounts.set(value, { count: 1, totalRatings });
    }
  });
  
  // Calculate total reports and percentages
  const totalReports = Array.from(valueCounts.values()).reduce((sum, { totalRatings }) => sum + totalRatings, 0);
  
  // Convert to distribution format
  const values = Array.from(valueCounts.entries()).map(([value, { totalRatings }]) => ({
    value,
    count: totalRatings,
    percentage: Math.round((totalRatings / totalReports) * 100)
  }));
  
  // Sort by count descending
  values.sort((a, b) => b.count - a.count);
  
  // Find the mode (most common value)
  const mode = values[0]?.value || '';
  
  return {
    mode,
    values,
    totalReports
  };
};

// Main function to get distribution for a field in the context of a specific goal
export const getGoalFieldDistribution = async (
  goalId: string,
  allGoalSolutions: GoalSolutionWithVariants[],
  fieldName: string
): Promise<DistributionData | null> => {
  // First try to get real distribution from database
  const realDistribution = await getRealDistributionForField(goalId, fieldName);
  if (realDistribution) {
    return realDistribution;
  }
  
  // Fall back to creating distribution from current solutions
  return createDistributionFromSolutions(allGoalSolutions, fieldName);
};
