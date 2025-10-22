// Mock distribution data generator for testing
// In production, this would come from aggregating user_ratings

import { FieldDistribution } from '@/components/solutions/DistributionDisplay'

type SolutionFields = Record<string, string | string[] | null | undefined>

interface SolutionLike {
  solution_fields?: SolutionFields | null
}

interface CategoryConfigLike {
  keyFields: string[]
}

export function generateMockDistributions(
  _solution: SolutionLike,
  fieldName: string,
  currentValue: string | null
): FieldDistribution | null {
  if (!currentValue) return null
  
  // Mock data based on field type
  const mockDistributions: Record<string, () => FieldDistribution> = {
    cost: () => ({
      fieldName: 'cost',
      displayLabel: 'COST',
      mode: currentValue,
      totalReports: 142,
      values: [
        { value: currentValue, count: 95, percentage: 67 },
        { value: 'Under $10/month', count: 40, percentage: 28 },
        { value: '$25-50/month', count: 7, percentage: 5 }
      ]
    }),
    
    side_effects: () => ({
      fieldName: 'side_effects',
      displayLabel: 'SIDE EFFECTS',
      mode: 'None reported',
      totalReports: 156,
      values: [
        { value: 'None reported', count: 112, percentage: 72 },
        { value: 'Mild headache', count: 28, percentage: 18 },
        { value: 'Vivid dreams', count: 11, percentage: 7 },
        { value: 'Drowsiness', count: 5, percentage: 3 }
      ]
    }),
    
    time_to_results: () => ({
      fieldName: 'time_to_results',
      displayLabel: 'TIME TO RESULTS',
      mode: currentValue,
      totalReports: 138,
      values: [
        { value: currentValue, count: 75, percentage: 54 },
        { value: 'Within days', count: 43, percentage: 31 },
        { value: '1-2 weeks', count: 20, percentage: 15 }
      ]
    }),
    
    session_frequency: () => ({
      fieldName: 'session_frequency',
      displayLabel: 'SESSION FREQUENCY',
      mode: currentValue,
      totalReports: 89,
      values: [
        { value: currentValue, count: 55, percentage: 62 },
        { value: 'Fortnightly', count: 21, percentage: 24 },
        { value: 'As needed', count: 13, percentage: 14 }
      ]
    }),
    
    format: () => ({
      fieldName: 'format',
      displayLabel: 'FORMAT',
      mode: currentValue,
      totalReports: 78,
      values: [
        { value: currentValue, count: 45, percentage: 58 },
        { value: 'Virtual/Online', count: 25, percentage: 32 },
        { value: 'Hybrid', count: 8, percentage: 10 }
      ]
    }),
    
    challenges: () => ({
      fieldName: 'challenges',
      displayLabel: 'CHALLENGES',
      mode: currentValue,
      totalReports: 92,
      values: [
        { value: 'Difficulty concentrating', count: 42, percentage: 46 },
        { value: 'Physical discomfort', count: 28, percentage: 30 },
        { value: 'Time management', count: 22, percentage: 24 }
      ]
    }),
    
    // Default for any other field
    default: () => ({
      fieldName,
      displayLabel: fieldName.toUpperCase().replace(/_/g, ' '),
      mode: currentValue,
      totalReports: 1,
      values: [
        { value: currentValue, count: 1, percentage: 100 }
      ]
    })
  }
  
  const generator = mockDistributions[fieldName] || mockDistributions.default
  return generator()
}

// Get distributions for all fields of a solution
export function getMockDistributionsForSolution(
  solution: SolutionLike,
  categoryConfig: CategoryConfigLike
): FieldDistribution[] {
  const distributions: FieldDistribution[] = []
  
  // Get distributions for each key field
  categoryConfig.keyFields.forEach((fieldName: string) => {
    const value = solution.solution_fields?.[fieldName]
    if (typeof value === 'string') {
      const distribution = generateMockDistributions(solution, fieldName, value)
      if (distribution) {
        distributions.push(distribution)
      }
    }
  })
  
  // Add additional fields in detailed view
  const additionalFields = ['frequency', 'dosage', 'brand_manufacturer', 'wait_time']
  additionalFields.forEach(fieldName => {
    if (!categoryConfig.keyFields.includes(fieldName)) {
      const value = solution.solution_fields?.[fieldName]
      if (typeof value === 'string') {
        const distribution = generateMockDistributions(solution, fieldName, value)
        if (distribution) {
          distributions.push(distribution)
        }
      }
    }
  })
  
  return distributions
}
