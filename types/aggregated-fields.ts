/**
 * Type definitions for aggregated solution fields
 */

export interface DistributionValue {
  value: string
  count: number
  percentage: number
  source?: string
}

export interface DistributionData {
  mode: string
  values: DistributionValue[]
  totalReports: number
  dataSource?: string
}

export interface AggregatedFieldsMetadata {
  total_ratings: number
  last_aggregated: string
  data_source: 'user' | 'ai' | 'mixed'
  confidence: 'high' | 'medium' | 'low'
  computed_at?: string // Legacy field for backwards compatibility
}

export interface AggregatedFields {
  // Core fields (always present)
  effectiveness?: DistributionData
  time_to_results?: DistributionData
  cost?: DistributionData
  cost_type?: DistributionData
  
  // Dosage fields (medications, supplements, natural remedies, beauty)
  dosage_amount?: DistributionData
  dosage_unit?: DistributionData
  skincare_frequency?: DistributionData
  usage_frequency?: DistributionData
  time_of_day?: DistributionData
  with_food?: DistributionData
  
  // Community fields
  meeting_frequency?: DistributionData
  group_size?: DistributionData
  format?: DistributionData
  facilitator_quality?: DistributionData
  
  // App fields
  subscription_type?: DistributionData
  platform?: DistributionData
  features_used?: DistributionData
  
  // Practice fields
  duration?: DistributionData
  location?: DistributionData
  instructor_quality?: DistributionData
  
  // Financial fields
  financial_benefit?: DistributionData
  monthly_savings?: DistributionData
  
  // Lifestyle fields
  still_following?: DistributionData
  difficulty_level?: DistributionData
  weekly_time_commitment?: DistributionData
  
  // Hobby fields
  skill_level?: DistributionData
  weekly_prep_time?: DistributionData
  community_involvement?: DistributionData
  
  // Purchase fields
  product_type?: DistributionData
  brand?: DistributionData
  where_purchased?: DistributionData
  
  // Session fields
  session_frequency?: DistributionData
  session_duration?: DistributionData
  therapist_approach?: DistributionData
  
  // General optional fields
  side_effects?: DistributionData
  would_recommend?: DistributionData
  ease_of_use?: DistributionData
  value_for_money?: DistributionData
  
  // Additional fields used by solution-aggregator
  challenges?: DistributionData
  startup_cost?: DistributionData
  ongoing_cost?: DistributionData
  frequency?: DistributionData
  length_of_use?: DistributionData
  practice_length?: DistributionData
  session_length?: DistributionData
  time_commitment?: DistributionData
  wait_time?: DistributionData
  insurance_coverage?: DistributionData
  best_time?: DistributionData
  previous_sleep_hours?: DistributionData
  sustainability_reason?: DistributionData
  social_impact?: DistributionData
  sleep_quality_change?: DistributionData
  specific_approach?: DistributionData
  cost_impact?: DistributionData
  purchase_cost_type?: DistributionData
  cost_range?: DistributionData
  learning_difficulty?: DistributionData
  completion_status?: DistributionData
  payment_frequency?: DistributionData
  commitment_type?: DistributionData
  accessibility_level?: DistributionData
  leadership_style?: DistributionData
  access_time?: DistributionData
  provider?: DistributionData
  minimum_requirements?: DistributionData
  specialty?: DistributionData
  response_time?: DistributionData
  completed_treatment?: DistributionData
  typical_length?: DistributionData
  availability?: DistributionData
  notes?: DistributionData
  
  // Metadata
  _metadata?: AggregatedFieldsMetadata
}

export interface RatingWithFields {
  solution_fields?: Record<string, any>
  [key: string]: any
}
