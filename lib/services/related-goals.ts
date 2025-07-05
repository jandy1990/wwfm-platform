// lib/services/related-goals.ts

import { supabase } from '@/lib/supabase';

export interface RelatedGoal {
  id: string;
  title: string;
  relationship_type: 'commonly_paired' | 'prerequisite' | 'alternative' | 'progression';
  strength: number;
  source: 'manual' | 'user_behavior' | 'ml_predicted';
  shared_solution_count?: number;
  user_overlap_percentage?: number;
}

export async function getRelatedGoals(goalId: string): Promise<RelatedGoal[]> {
  console.log('Calling RPC with goalId:', goalId)
  
  // Use the database function for efficient bidirectional lookup
  const { data, error } = await supabase
    .rpc('get_related_goals', { target_goal_id: goalId });

  console.log('RPC response:', { data, error })

  if (error) {
    console.error('Error fetching related goals:', error);
    return [];
  }

  // Type guard and map
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Map the database results to our TypeScript interface
  return data.map((item: any) => ({
    id: item.goal_id,
    title: item.title,
    relationship_type: item.relationship_type as RelatedGoal['relationship_type'],
    strength: Number(item.strength),
    source: item.source as RelatedGoal['source']
  }));
}

export async function getGoalCluster(goalId: string): Promise<{
  primaryGoal: any;
  relatedGoals: RelatedGoal[];
}> {
  // Fetch the primary goal
  const { data: primaryGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single();

  // Fetch related goals
  const relatedGoals = await getRelatedGoals(goalId);

  return {
    primaryGoal,
    relatedGoals
  };
}

// Track when users navigate between related goals
export async function trackGoalRelationshipClick(
  userId: string | null,
  fromGoalId: string,
  toGoalId: string,
  uiPosition: number
) {
  // In production, send to analytics service
  // For now, we'll just log it
  console.log('Goal relationship clicked:', {
    user_id: userId,
    from_goal: fromGoalId,
    to_goal: toGoalId,
    ui_position: uiPosition,
    timestamp: new Date().toISOString()
  });

  // Future: Update relationship strength based on actual usage
  // This would involve inserting into goal_relationship_events table
}

// Calculate shared solution effectiveness
export async function getSharedSolutionCount(
  goalId1: string,
  goalId2: string
): Promise<number> {
  // This query counts solutions that work well for both goals
  const { data, error } = await supabase
    .from('goal_implementation_links')
    .select('implementation_id')
    .eq('goal_id', goalId1)
    .gte('avg_effectiveness', 4.0);

  if (!data || error) return 0;

  const implementations1 = data.map(d => d.implementation_id);

  const { data: data2 } = await supabase
    .from('goal_implementation_links')
    .select('implementation_id')
    .eq('goal_id', goalId2)
    .gte('avg_effectiveness', 4.0)
    .in('implementation_id', implementations1);

  return data2?.length || 0;
}