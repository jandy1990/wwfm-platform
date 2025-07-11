import { DistributionData } from '../components/distributions/DistributionField';

// Mock distribution data generator for testing
export const generateMockDistribution = (
  field: string, 
  totalReports: number = 50
): DistributionData => {
  const distributions: Record<string, { values: string[], weights: number[] }> = {
    cost: {
      values: ['$10-25/month', 'Under $10/month', '$25-50/month', '$50-100/month'],
      weights: [40, 30, 20, 10]
    },
    side_effects: {
      values: ['None reported', 'Mild headache', 'Drowsiness', 'Nausea', 'Vivid dreams'],
      weights: [50, 25, 15, 7, 3]
    },
    time_to_results: {
      values: ['1-2 weeks', '3-4 weeks', 'Within days', '1-2 months'],
      weights: [35, 30, 25, 10]
    },
    frequency: {
      values: ['Once daily', 'Twice daily', 'As needed', 'Three times daily'],
      weights: [45, 25, 20, 10]
    },
    form: {
      values: ['Capsule', 'Tablet', 'Liquid', 'Powder'],
      weights: [40, 35, 15, 10]
    }
  };

  const config = distributions[field] || {
    values: ['Option A', 'Option B', 'Option C'],
    weights: [50, 30, 20]
  };

  // Generate counts based on weights
  const values = config.values.map((value, index) => {
    const percentage = config.weights[index];
    const count = Math.round((percentage / 100) * totalReports);
    return {
      value,
      count,
      percentage
    };
  }).filter(v => v.count > 0);

  // Find mode (most common value)
  const mode = values.reduce((max, current) => 
    current.count > max.count ? current : max
  ).value;

  return {
    mode,
    values,
    totalReports
  };
};

// Generate distributions for a solution based on its category
export const generateSolutionDistributions = (
  solutionCategory: string,
  totalRatings: number = 50
): Record<string, DistributionData> => {
  const categoryFields: Record<string, string[]> = {
    medications: ['cost', 'side_effects', 'time_to_results', 'frequency'],
    supplements_vitamins: ['cost', 'side_effects', 'time_to_results', 'form'],
    natural_remedies: ['cost', 'side_effects', 'time_to_results', 'form'],
    beauty_skincare: ['cost', 'side_effects', 'time_to_results'],
    apps_software: ['cost', 'time_to_results'],
    exercise_movement: ['time_to_results'],
    meditation_mindfulness: ['time_to_results'],
    habits_routines: ['time_to_results']
  };

  const fields = categoryFields[solutionCategory] || ['time_to_results'];
  const distributions: Record<string, DistributionData> = {};

  fields.forEach(field => {
    distributions[field] = generateMockDistribution(field, totalRatings);
  });

  return distributions;
};
