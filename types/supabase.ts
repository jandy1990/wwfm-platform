// This file should be auto-generated from your Supabase schema
// Run: npx supabase gen types typescript --project-id your-project-id > types/supabase.ts

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          contribution_points: number;
          ratings_count: number;
          solutions_count: number;
          comments_count: number;
          age_range: string | null;
          gender: string | null;
          location: string | null;
          share_demographics: boolean;
          show_activity: boolean;
          registration_ip: string | null;
          registration_timestamp: string;
          captcha_score: number | null;
          trust_score: number;
          auth_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      solutions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          solution_category: string;
          solution_model: string;
          parent_concept: string | null;
          legacy_solution_id: string | null;
          legacy_implementation_id: string | null;
          search_keywords: string[] | null;
          source_type: string;
          created_by: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['solutions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['solutions']['Insert']>;
      };
      solution_variants: {
        Row: {
          id: string;
          solution_id: string;
          variant_name: string;
          amount: number | null;
          unit: string | null;
          form: string | null;
          legacy_implementation_id: string | null;
          is_default: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['solution_variants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['solution_variants']['Insert']>;
      };
      goals: {
        Row: {
          id: string;
          category_id: string | null;
          arena_id: string | null;
          title: string;
          description: string | null;
          created_by: string | null;
          is_approved: boolean;
          meta_tags: string[] | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
      goal_implementation_links: {
        Row: {
          id: string;
          goal_id: string | null;
          implementation_id: string | null;
          avg_effectiveness: number;
          rating_count: number;
          solution_fields: Record<string, any>;
          typical_application: string | null;
          contraindications: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goal_implementation_links']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['goal_implementation_links']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          user_id: string | null;
          solution_id: string | null;
          implementation_id: string | null;
          goal_id: string | null;
          effectiveness_score: number;
          is_quick_rating: boolean;
          duration_used: string | null;
          severity_before: number | null;
          side_effects: string | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
      arenas: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          slug: string | null;
          display_order: number | null;
          order_rank: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['arenas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['arenas']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          arena_id: string | null;
          name: string;
          description: string | null;
          icon: string | null;
          slug: string | null;
          order_rank: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_solutions_fuzzy: {
        Args: { search_term: string };
        Returns: Array<{
          id: string;
          title: string;
          solution_category: string;
          description: string;
          match_score: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
