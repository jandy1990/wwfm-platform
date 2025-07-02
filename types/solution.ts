// Type definitions for the new solutions schema

export type SolutionModel = 'standard' | 'measured';
export type SourceType = 'community_contributed' | 'ai_generated' | 'ai_enhanced' | 'expert_verified' | 'ai_foundation';

// Main solution type (solutions_v2 table)
export interface SolutionV2 {
  id: string;
  title: string;
  description: string | null;
  solution_category: string | null;
  source_type: SourceType;
  solution_model: SolutionModel;
  parent_concept: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  legacy_solution_id?: string;
}

// Solution variant type (solution_variants table)
export interface SolutionVariant {
  id: string;
  solution_id: string;
  name: string;
  category_fields: Record<string, unknown> | null;
  effectiveness: number | null;
  time_to_results: string | null;
  cost_range: string | null;
  created_at: string;
  updated_at: string;
  legacy_implementation_id?: string;
}

// Combined types for queries
export interface SolutionWithVariants extends SolutionV2 {
  variants?: SolutionVariant[];
}