// Test data fixtures for form testing

export const FORM_DROPDOWN_OPTIONS = {
  // Dosage forms
  cost: [
    'Free',
    'Under $10/month',
    '$10-25/month',
    '$25-50/month',
    '$50-100/month',
    '$100-200/month',
    'Over $200/month'
  ],
  time_to_results: [
    'Immediately',
    'Within days',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3+ months'
  ],
  frequency: [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'As needed',
    'Weekly',
    'Monthly'
  ],
  dosage_unit: [
    'mg',
    'g',
    'mcg',
    'IU',
    'ml',
    'drops'
  ],
  dosage_form: [
    'tablet',
    'capsule',
    'liquid',
    'powder',
    'cream',
    'gel',
    'injection',
    'patch',
    'drops'
  ],
  
  // Session forms
  session_frequency: [
    'Daily',
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'As needed'
  ],
  format: [
    'In-person',
    'Video call',
    'Phone',
    'Text/Chat',
    'Group',
    'Self-guided'
  ],
  wait_time: [
    'Same day',
    'Within a week',
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3+ months'
  ],
  insurance_coverage: [
    'Fully covered',
    'Partially covered',
    'Not covered',
    'No insurance needed'
  ],
  
  // Practice forms
  practice_length: [
    '5-10 minutes',
    '10-20 minutes',
    '20-30 minutes',
    '30-60 minutes',
    'Over 1 hour'
  ],
  time_commitment: [
    'Less than 5 min/day',
    '5-15 min/day',
    '15-30 min/day',
    '30-60 min/day',
    'Over 1 hour/day'
  ],
  
  // App forms
  usage_frequency: [
    'Multiple times daily',
    'Daily',
    'Few times a week',
    'Weekly',
    'As needed'
  ],
  subscription_type: [
    'Free',
    'Freemium',
    'Premium/Pro',
    'One-time purchase'
  ],
  
  // Lifestyle forms
  daily_prep_time: [
    'No extra time',
    '5-15 minutes',
    '15-30 minutes',
    '30-60 minutes',
    'Over 1 hour'
  ],
  long_term_sustainability: [
    'Very easy',
    'Easy',
    'Moderate',
    'Difficult',
    'Very difficult'
  ],
  cost_impact: [
    'Saves money',
    'Cost neutral',
    'Slight increase',
    'Moderate increase',
    'Significant increase'
  ],
  adjustment_period: [
    'No adjustment',
    'Few days',
    '1 week',
    '2-3 weeks',
    '1 month+',
  ],
  
  // Purchase forms
  ease_of_use: [
    'Very easy',
    'Easy',
    'Moderate',
    'Difficult',
    'Very difficult'
  ],
  product_type: [
    'Physical product',
    'Digital product',
    'Service',
    'Subscription'
  ],
  learning_difficulty: [
    'Very easy',
    'Easy',
    'Moderate',
    'Difficult',
    'Very difficult'
  ],
  
  // Community forms
  group_size: [
    'One-on-one',
    'Small (2-5)',
    'Medium (6-15)',
    'Large (16-50)',
    'Very large (50+)'
  ],
  meeting_frequency: [
    'Daily',
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'As needed'
  ],
  
  // Financial forms
  cost_type: [
    'Free',
    'One-time fee',
    'Monthly fee',
    'Annual fee',
    'Transaction-based'
  ],
  financial_benefit: [
    'Immediate savings',
    'Short-term (< 6 months)',
    'Medium-term (6-12 months)',
    'Long-term (1+ years)'
  ],
  access_time: [
    'Immediate',
    'Same day',
    '1-3 days',
    '1 week',
    '2+ weeks'
  ]
}

// Array field options
export const ARRAY_FIELD_OPTIONS = {
  side_effects: [
    'Nausea',
    'Headache',
    'Dizziness',
    'Fatigue',
    'Insomnia',
    'Dry mouth',
    'Weight changes',
    'Mood changes'
  ],
  challenges: [
    'Hard to maintain habit',
    'Too expensive',
    'Takes too much time',
    'Difficult to learn',
    'Lack of motivation',
    'Technical issues',
    'Not seeing results',
    'Too many notifications'
  ],
  barriers: [
    'Cost',
    'Time commitment',
    'Finding right provider',
    'Insurance issues',
    'Location/accessibility',
    'Stigma',
    'Wait times',
    'Scheduling conflicts'
  ],
  issues: [
    'Build quality',
    'Difficult to use',
    'Doesn\'t work as advertised',
    'Poor customer support',
    'Battery life',
    'Compatibility issues',
    'Size/portability',
    'Maintenance required'
  ],
  key_features: [
    'Low fees',
    'High returns',
    'Easy to use',
    'Good customer service',
    'Mobile app',
    'Educational resources',
    'Automated features',
    'Security features'
  ]
}

// Sample form data by category
export const SAMPLE_FORM_DATA = {
  medications: {
    title: 'Test Medication Solution',
    description: 'A test medication for automated testing',
    cost: '$50-100/month',
    time_to_results: '3-4 weeks',
    frequency: 'Twice daily',
    length_of_use: '6 months',
    side_effects: ['Nausea', 'Headache'],
    dosage_amount: '20',
    dosage_unit: 'mg',
    dosage_form: 'tablet'
  },
  supplements_vitamins: {
    title: 'Test Supplement Solution',
    description: 'A test supplement for automated testing',
    cost: '$25-50/month',
    time_to_results: '1-2 weeks',
    frequency: 'Once daily',
    length_of_use: '3 months',
    side_effects: ['Fatigue'],
    dosage_amount: '1000',
    dosage_unit: 'IU',
    dosage_form: 'capsule'
  },
  apps_software: {
    title: 'Test App Solution',
    description: 'A test app for automated testing',
    cost: '$10-25/month',
    time_to_results: 'Immediately',
    usage_frequency: 'Daily',
    subscription_type: 'Premium/Pro',
    challenges: ['Hard to maintain habit', 'Too many notifications']
  },
  therapists_counselors: {
    title: 'Test Therapy Solution',
    description: 'A test therapy service for automated testing',
    cost: '$100-200/month',
    time_to_results: '1-2 months',
    session_frequency: 'Weekly',
    format: 'Video call',
    barriers: ['Cost', 'Finding right provider']
  }
}

// Expected field mappings by form type
export const EXPECTED_FIELDS_BY_FORM = {
  dosage_form: ['cost', 'time_to_results', 'frequency', 'length_of_use', 'side_effects'],
  session_form: ['cost', 'time_to_results', 'session_frequency', 'format', 'barriers'],
  practice_form: ['startup_cost', 'ongoing_cost', 'time_to_results', 'practice_length', 'challenges'],
  app_form: ['cost', 'time_to_results', 'usage_frequency', 'subscription_type', 'challenges'],
  purchase_form: ['cost', 'time_to_results', 'ease_of_use', 'product_type', 'issues'],
  community_form: ['cost', 'time_to_results', 'meeting_frequency', 'group_size', 'challenges'],
  lifestyle_form: ['cost_impact', 'time_to_results', 'daily_prep_time', 'long_term_sustainability', 'challenges'],
  hobby_form: ['startup_cost', 'ongoing_cost', 'time_to_results', 'time_commitment', 'barriers'],
  financial_form: ['cost_type', 'time_to_results', 'financial_benefit', 'access_time', 'key_features']
}