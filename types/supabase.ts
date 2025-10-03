export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aggregation_queue: {
        Row: {
          attempts: number | null
          goal_id: string
          implementation_id: string
          last_error: string | null
          processing: boolean | null
          queued_at: string | null
        }
        Insert: {
          attempts?: number | null
          goal_id: string
          implementation_id: string
          last_error?: string | null
          processing?: boolean | null
          queued_at?: string | null
        }
        Update: {
          attempts?: number | null
          goal_id?: string
          implementation_id?: string
          last_error?: string | null
          processing?: boolean | null
          queued_at?: string | null
        }
        Relationships: []
      }
      archived_tier4_goals: {
        Row: {
          archived_at: string | null
          arena_id: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          original_data: Json | null
          removal_reason: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          arena_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          original_data?: Json | null
          removal_reason?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          arena_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          original_data?: Json | null
          removal_reason?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      arenas: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_rank: number | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_rank?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_rank?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attribute_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_type: string
          description: string | null
          id: string
          is_required: boolean | null
          is_system_defined: boolean | null
          name: string
          solution_type_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_type: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          is_system_defined?: boolean | null
          name: string
          solution_type_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          is_system_defined?: boolean | null
          name?: string
          solution_type_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attribute_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attribute_definitions_solution_type_id_fkey"
            columns: ["solution_type_id"]
            isOneToOne: false
            referencedRelation: "solution_types"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          arena_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_rank: number | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          arena_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_rank?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          arena_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_rank?: number | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      category_keywords: {
        Row: {
          category: string
          created_at: string | null
          id: string
          keywords: string[]
          patterns: string[] | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          keywords: string[]
          patterns?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          keywords?: string[]
          patterns?: string[] | null
        }
        Relationships: []
      }
      challenge_options: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label: string
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          solution_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          flagged_by: string | null
          id: string
          reason: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          reason?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_votes: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_votes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "goal_discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      expansion_progress: {
        Row: {
          attempts_count: number | null
          avg_effectiveness: number | null
          category: string
          claimed_at: string | null
          claimed_by: string | null
          connection_count: number | null
          created_at: string | null
          last_error: string | null
          last_processed_at: string | null
          rejection_rate: number | null
          solution_id: string
          status: string | null
          successful_connections: number | null
          updated_at: string | null
        }
        Insert: {
          attempts_count?: number | null
          avg_effectiveness?: number | null
          category: string
          claimed_at?: string | null
          claimed_by?: string | null
          connection_count?: number | null
          created_at?: string | null
          last_error?: string | null
          last_processed_at?: string | null
          rejection_rate?: number | null
          solution_id: string
          status?: string | null
          successful_connections?: number | null
          updated_at?: string | null
        }
        Update: {
          attempts_count?: number | null
          avg_effectiveness?: number | null
          category?: string
          claimed_at?: string | null
          claimed_by?: string | null
          connection_count?: number | null
          created_at?: string | null
          last_error?: string | null
          last_processed_at?: string | null
          rejection_rate?: number | null
          solution_id?: string
          status?: string | null
          successful_connections?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expansion_progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: true
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expansion_progress_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: true
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          categories: string[] | null
          cost_can_toggle: boolean | null
          cost_toggle_options: string[] | null
          cost_type: string
          created_at: string | null
          optional_fields: Json
          required_fields: Json
          template_display_name: string | null
          template_name: string
        }
        Insert: {
          categories?: string[] | null
          cost_can_toggle?: boolean | null
          cost_toggle_options?: string[] | null
          cost_type: string
          created_at?: string | null
          optional_fields: Json
          required_fields: Json
          template_display_name?: string | null
          template_name: string
        }
        Update: {
          categories?: string[] | null
          cost_can_toggle?: boolean | null
          cost_toggle_options?: string[] | null
          cost_type?: string
          created_at?: string | null
          optional_fields?: Json
          required_fields?: Json
          template_display_name?: string | null
          template_name?: string
        }
        Relationships: []
      }
      goal_discussions: {
        Row: {
          content: string
          created_at: string | null
          goal_id: string
          id: string
          is_edited: boolean | null
          is_flagged: boolean | null
          parent_id: string | null
          reply_count: number | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          goal_id: string
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          goal_id?: string
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          parent_id?: string | null
          reply_count?: number | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_discussions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "goal_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_followers: {
        Row: {
          created_at: string | null
          goal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_followers_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_implementation_links: {
        Row: {
          aggregated_fields: Json | null
          ai_snapshot: Json | null
          avg_effectiveness: number | null
          contraindications: string | null
          created_at: string | null
          data_display_mode: string | null
          goal_id: string | null
          human_rating_count: number | null
          id: string
          implementation_id: string | null
          last_rating_at: string | null
          lasting_benefit_count: number | null
          lasting_benefit_rate: number | null
          needs_aggregation: boolean | null
          notes: string | null
          rating_count: number | null
          solution_fields: Json | null
          transition_threshold: number | null
          transitioned_at: string | null
          typical_application: string | null
          updated_at: string | null
        }
        Insert: {
          aggregated_fields?: Json | null
          ai_snapshot?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          data_display_mode?: string | null
          goal_id?: string | null
          human_rating_count?: number | null
          id?: string
          implementation_id?: string | null
          last_rating_at?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          needs_aggregation?: boolean | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          transition_threshold?: number | null
          transitioned_at?: string | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Update: {
          aggregated_fields?: Json | null
          ai_snapshot?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          data_display_mode?: string | null
          goal_id?: string | null
          human_rating_count?: number | null
          id?: string
          implementation_id?: string | null
          last_rating_at?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          needs_aggregation?: boolean | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          transition_threshold?: number | null
          transitioned_at?: string | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_implementation_links_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_implementation_links_implementation_id_fkey"
            columns: ["implementation_id"]
            isOneToOne: false
            referencedRelation: "solution_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_implementation_links_backup_khan_20250921: {
        Row: {
          aggregated_fields: Json | null
          avg_effectiveness: number | null
          contraindications: string | null
          created_at: string | null
          goal_id: string | null
          id: string | null
          implementation_id: string | null
          lasting_benefit_count: number | null
          lasting_benefit_rate: number | null
          notes: string | null
          rating_count: number | null
          solution_fields: Json | null
          typical_application: string | null
          updated_at: string | null
        }
        Insert: {
          aggregated_fields?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string | null
          implementation_id?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Update: {
          aggregated_fields?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string | null
          implementation_id?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_implementation_links_backup_pmr_20250921: {
        Row: {
          aggregated_fields: Json | null
          avg_effectiveness: number | null
          contraindications: string | null
          created_at: string | null
          goal_id: string | null
          id: string | null
          implementation_id: string | null
          lasting_benefit_count: number | null
          lasting_benefit_rate: number | null
          notes: string | null
          rating_count: number | null
          solution_fields: Json | null
          typical_application: string | null
          updated_at: string | null
        }
        Insert: {
          aggregated_fields?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string | null
          implementation_id?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Update: {
          aggregated_fields?: Json | null
          avg_effectiveness?: number | null
          contraindications?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string | null
          implementation_id?: string | null
          lasting_benefit_count?: number | null
          lasting_benefit_rate?: number | null
          notes?: string | null
          rating_count?: number | null
          solution_fields?: Json | null
          typical_application?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_relationships: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          related_goal_id: string | null
          relationship_type: string | null
          source: string | null
          strength: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          related_goal_id?: string | null
          relationship_type?: string | null
          source?: string | null
          strength?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          related_goal_id?: string | null
          relationship_type?: string | null
          source?: string | null
          strength?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_relationships_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_relationships_related_goal_id_fkey"
            columns: ["related_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_retrospectives: {
        Row: {
          achieved_date: string
          assessment_type: string
          benefits_lasted: boolean | null
          counterfactual_impact: number | null
          created_at: string | null
          days_since_achievement: number | null
          evaluated_date: string | null
          goal_id: string
          id: string
          life_domain_impacts: Json | null
          rating_id: string
          reminder_count: number | null
          response_source: string | null
          response_time_seconds: number | null
          solution_id: string | null
          unexpected_benefits: string | null
          updated_at: string | null
          user_id: string
          wisdom_note: string | null
          worth_pursuing: boolean | null
        }
        Insert: {
          achieved_date: string
          assessment_type: string
          benefits_lasted?: boolean | null
          counterfactual_impact?: number | null
          created_at?: string | null
          days_since_achievement?: number | null
          evaluated_date?: string | null
          goal_id: string
          id?: string
          life_domain_impacts?: Json | null
          rating_id: string
          reminder_count?: number | null
          response_source?: string | null
          response_time_seconds?: number | null
          solution_id?: string | null
          unexpected_benefits?: string | null
          updated_at?: string | null
          user_id: string
          wisdom_note?: string | null
          worth_pursuing?: boolean | null
        }
        Update: {
          achieved_date?: string
          assessment_type?: string
          benefits_lasted?: boolean | null
          counterfactual_impact?: number | null
          created_at?: string | null
          days_since_achievement?: number | null
          evaluated_date?: string | null
          goal_id?: string
          id?: string
          life_domain_impacts?: Json | null
          rating_id?: string
          reminder_count?: number | null
          response_source?: string | null
          response_time_seconds?: number | null
          solution_id?: string | null
          unexpected_benefits?: string | null
          updated_at?: string | null
          user_id?: string
          wisdom_note?: string | null
          worth_pursuing?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_retrospectives_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_retrospectives_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_retrospectives_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_retrospectives_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_solutions: {
        Row: {
          created_at: string | null
          display_order: number | null
          goal_id: string | null
          id: string
          is_common: boolean | null
          solution_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          goal_id?: string | null
          id?: string
          is_common?: boolean | null
          solution_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          goal_id?: string | null
          id?: string
          is_common?: boolean | null
          solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_solutions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_suggestions: {
        Row: {
          admin_notes: string | null
          arena_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          similar_to_goal_id: string | null
          status: string | null
          suggested_by: string | null
          title: string
        }
        Insert: {
          admin_notes?: string | null
          arena_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_to_goal_id?: string | null
          status?: string | null
          suggested_by?: string | null
          title: string
        }
        Update: {
          admin_notes?: string | null
          arena_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_to_goal_id?: string | null
          status?: string | null
          suggested_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_suggestions_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_suggestions_similar_to_goal_id_fkey"
            columns: ["similar_to_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_suggestions_suggested_by_fkey"
            columns: ["suggested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_wisdom_scores: {
        Row: {
          common_benefits: Json | null
          created_at: string | null
          goal_id: string
          happiness_impact_avg: number | null
          health_impact_avg: number | null
          id: string
          lasting_value_score: number | null
          maintenance_rate: number | null
          relationships_impact_avg: number | null
          retrospectives_12m: number | null
          retrospectives_6m: number | null
          total_retrospectives: number | null
          updated_at: string | null
          wisdom_quotes: Json | null
          work_impact_avg: number | null
          worth_pursuing_percentage: number | null
        }
        Insert: {
          common_benefits?: Json | null
          created_at?: string | null
          goal_id: string
          happiness_impact_avg?: number | null
          health_impact_avg?: number | null
          id?: string
          lasting_value_score?: number | null
          maintenance_rate?: number | null
          relationships_impact_avg?: number | null
          retrospectives_12m?: number | null
          retrospectives_6m?: number | null
          total_retrospectives?: number | null
          updated_at?: string | null
          wisdom_quotes?: Json | null
          work_impact_avg?: number | null
          worth_pursuing_percentage?: number | null
        }
        Update: {
          common_benefits?: Json | null
          created_at?: string | null
          goal_id?: string
          happiness_impact_avg?: number | null
          health_impact_avg?: number | null
          id?: string
          lasting_value_score?: number | null
          maintenance_rate?: number | null
          relationships_impact_avg?: number | null
          retrospectives_12m?: number | null
          retrospectives_6m?: number | null
          total_retrospectives?: number | null
          updated_at?: string | null
          wisdom_quotes?: Json | null
          work_impact_avg?: number | null
          worth_pursuing_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_wisdom_scores_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: true
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          arena_id: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          emoji: string | null
          id: string
          is_approved: boolean | null
          meta_tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          arena_id?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_approved?: boolean | null
          meta_tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          arena_id?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_approved?: boolean | null
          meta_tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_goals_arena"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      import_staging: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          import_data: Json
          import_type: string
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          import_data: Json
          import_type: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          import_data?: Json
          import_type?: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      mailbox_items: {
        Row: {
          achievement_date: string
          created_at: string | null
          goal_title: string
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          priority: number | null
          retrospective_schedule_id: string | null
          solution_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_date: string
          created_at?: string | null
          goal_title: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          retrospective_schedule_id?: string | null
          solution_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_date?: string
          created_at?: string | null
          goal_title?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          retrospective_schedule_id?: string | null
          solution_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mailbox_items_retrospective_schedule_id_fkey"
            columns: ["retrospective_schedule_id"]
            isOneToOne: false
            referencedRelation: "retrospective_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          created_at: string | null
          id: string
          notification_type: string
          opened_at: string | null
          payload: Json
          priority: number | null
          responded_at: string | null
          response: string | null
          scheduled_for: string | null
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_type: string
          opened_at?: string | null
          payload: Json
          priority?: number | null
          responded_at?: string | null
          response?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_type?: string
          opened_at?: string | null
          payload?: Json
          priority?: number | null
          responded_at?: string | null
          response?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          data_source: string | null
          duration_used: string | null
          effectiveness_score: number
          goal_id: string | null
          id: string
          implementation_id: string | null
          is_quick_rating: boolean | null
          severity_before: number | null
          side_effects: string | null
          solution_fields: Json | null
          solution_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          data_source?: string | null
          duration_used?: string | null
          effectiveness_score: number
          goal_id?: string | null
          id?: string
          implementation_id?: string | null
          is_quick_rating?: boolean | null
          severity_before?: number | null
          side_effects?: string | null
          solution_fields?: Json | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          data_source?: string | null
          duration_used?: string | null
          effectiveness_score?: number
          goal_id?: string | null
          id?: string
          implementation_id?: string | null
          is_quick_rating?: boolean | null
          severity_before?: number | null
          side_effects?: string | null
          solution_fields?: Json | null
          solution_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_implementation_id_fkey"
            columns: ["implementation_id"]
            isOneToOne: false
            referencedRelation: "solution_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      related_solutions: {
        Row: {
          id: string
          related_solution_id: string | null
          relationship_strength: number | null
          relationship_type: string
          solution_id: string | null
        }
        Insert: {
          id?: string
          related_solution_id?: string | null
          relationship_strength?: number | null
          relationship_type: string
          solution_id?: string | null
        }
        Update: {
          id?: string
          related_solution_id?: string | null
          relationship_strength?: number | null
          relationship_type?: string
          solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "related_solutions_related_solution_id_fkey"
            columns: ["related_solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_solutions_related_solution_id_fkey"
            columns: ["related_solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      retrospective_schedules: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          expired_at: string | null
          goal_id: string
          id: string
          last_reminder_at: string | null
          notification_sent_at: string | null
          opted_in: boolean | null
          preferred_channel: string | null
          rating_id: string
          reminder_count: number | null
          responded_at: string | null
          schedule_type: string
          scheduled_date: string
          solution_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          expired_at?: string | null
          goal_id: string
          id?: string
          last_reminder_at?: string | null
          notification_sent_at?: string | null
          opted_in?: boolean | null
          preferred_channel?: string | null
          rating_id: string
          reminder_count?: number | null
          responded_at?: string | null
          schedule_type: string
          scheduled_date: string
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          expired_at?: string | null
          goal_id?: string
          id?: string
          last_reminder_at?: string | null
          notification_sent_at?: string | null
          opted_in?: boolean | null
          preferred_channel?: string | null
          rating_id?: string
          reminder_count?: number | null
          responded_at?: string | null
          schedule_type?: string
          scheduled_date?: string
          solution_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retrospective_schedules_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_schedules_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_schedules_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retrospective_schedules_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_solutions: {
        Row: {
          created_at: string | null
          solution_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          solution_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          solution_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_solutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      side_effect_options: {
        Row: {
          category: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          label: string
        }
        Insert: {
          category: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label: string
        }
        Update: {
          category?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
        }
        Relationships: []
      }
      solution_attributes: {
        Row: {
          attribute_definition_id: string | null
          boolean_value: boolean | null
          created_at: string | null
          id: string
          numeric_value: number | null
          solution_id: string | null
          text_value: string | null
          updated_at: string | null
        }
        Insert: {
          attribute_definition_id?: string | null
          boolean_value?: boolean | null
          created_at?: string | null
          id?: string
          numeric_value?: number | null
          solution_id?: string | null
          text_value?: string | null
          updated_at?: string | null
        }
        Update: {
          attribute_definition_id?: string | null
          boolean_value?: boolean | null
          created_at?: string | null
          id?: string
          numeric_value?: number | null
          solution_id?: string | null
          text_value?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_attributes_attribute_definition_id_fkey"
            columns: ["attribute_definition_id"]
            isOneToOne: false
            referencedRelation: "attribute_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_attributes_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_completion_tracking: {
        Row: {
          completion_score: number | null
          created_at: string | null
          declined_count: number | null
          last_enrichment_at: string | null
          last_prompted_at: string | null
          next_prompt_type: string | null
          prompt_count: number | null
          solution_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completion_score?: number | null
          created_at?: string | null
          declined_count?: number | null
          last_enrichment_at?: string | null
          last_prompted_at?: string | null
          next_prompt_type?: string | null
          prompt_count?: number | null
          solution_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completion_score?: number | null
          created_at?: string | null
          declined_count?: number | null
          last_enrichment_at?: string | null
          last_prompted_at?: string | null
          next_prompt_type?: string | null
          prompt_count?: number | null
          solution_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_completion_tracking_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: true
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_completion_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_enrichments: {
        Row: {
          created_at: string | null
          enrichment_data: Json
          enrichment_type: string
          id: string
          prompt_type: string | null
          solution_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          enrichment_data: Json
          enrichment_type: string
          id?: string
          prompt_type?: string | null
          solution_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          enrichment_data?: Json
          enrichment_type?: string
          id?: string
          prompt_type?: string | null
          solution_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_enrichments_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_enrichments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_implementations: {
        Row: {
          category_fields: Json | null
          challenges: string[] | null
          cost_ongoing: string | null
          cost_range: string | null
          cost_startup: string | null
          cost_type: string | null
          created_at: string | null
          created_by: string | null
          effectiveness: number | null
          id: string
          name: string
          old_details: Json | null
          other_important_information: string | null
          side_effects: string[] | null
          solution_id: string | null
          source_type: string | null
          time_to_results: string | null
          updated_at: string | null
        }
        Insert: {
          category_fields?: Json | null
          challenges?: string[] | null
          cost_ongoing?: string | null
          cost_range?: string | null
          cost_startup?: string | null
          cost_type?: string | null
          created_at?: string | null
          created_by?: string | null
          effectiveness?: number | null
          id?: string
          name: string
          old_details?: Json | null
          other_important_information?: string | null
          side_effects?: string[] | null
          solution_id?: string | null
          source_type?: string | null
          time_to_results?: string | null
          updated_at?: string | null
        }
        Update: {
          category_fields?: Json | null
          challenges?: string[] | null
          cost_ongoing?: string | null
          cost_range?: string | null
          cost_startup?: string | null
          cost_type?: string | null
          created_at?: string | null
          created_by?: string | null
          effectiveness?: number | null
          id?: string
          name?: string
          old_details?: Json | null
          other_important_information?: string | null
          side_effects?: string[] | null
          solution_id?: string | null
          source_type?: string | null
          time_to_results?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solution_type_fields: {
        Row: {
          created_at: string | null
          field_order: string[] | null
          id: string
          optional_fields: Json | null
          required_fields: Json
          solution_type: string
        }
        Insert: {
          created_at?: string | null
          field_order?: string[] | null
          id?: string
          optional_fields?: Json | null
          required_fields?: Json
          solution_type: string
        }
        Update: {
          created_at?: string | null
          field_order?: string[] | null
          id?: string
          optional_fields?: Json | null
          required_fields?: Json
          solution_type?: string
        }
        Relationships: []
      }
      solution_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solution_variants: {
        Row: {
          amount: number | null
          created_at: string | null
          display_order: number | null
          form: string | null
          id: string
          is_default: boolean | null
          legacy_implementation_id: string | null
          solution_id: string | null
          unit: string | null
          variant_name: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          display_order?: number | null
          form?: string | null
          id?: string
          is_default?: boolean | null
          legacy_implementation_id?: string | null
          solution_id?: string | null
          unit?: string | null
          variant_name: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          display_order?: number | null
          form?: string | null
          id?: string
          is_default?: boolean | null
          legacy_implementation_id?: string | null
          solution_id?: string | null
          unit?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_variants_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_variants_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_approved: boolean | null
          legacy_implementation_id: string | null
          legacy_solution_id: string | null
          parent_concept: string | null
          search_keywords: string[] | null
          solution_category: string
          solution_model: string
          source_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category: string
          solution_model?: string
          source_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string
          solution_model?: string
          source_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      solutions_backup_3cat_20250921: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_approved: boolean | null
          legacy_implementation_id: string | null
          legacy_solution_id: string | null
          parent_concept: string | null
          search_keywords: string[] | null
          solution_category: string | null
          solution_model: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solutions_backup_khan_20250921: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_approved: boolean | null
          legacy_implementation_id: string | null
          legacy_solution_id: string | null
          parent_concept: string | null
          search_keywords: string[] | null
          solution_category: string | null
          solution_model: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solutions_backup_pmr_20250921: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string | null
          is_approved: boolean | null
          legacy_implementation_id: string | null
          legacy_solution_id: string | null
          parent_concept: string | null
          search_keywords: string[] | null
          solution_category: string | null
          solution_model: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string | null
          is_approved?: boolean | null
          legacy_implementation_id?: string | null
          legacy_solution_id?: string | null
          parent_concept?: string | null
          search_keywords?: string[] | null
          solution_category?: string | null
          solution_model?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      solutions_old: {
        Row: {
          avg_rating: number | null
          benefit_categories: string[] | null
          completion_percentage: number | null
          completion_score: number | null
          cost_category: string | null
          cost_estimate: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          external_url: string | null
          goal_id: string | null
          id: string
          is_approved: boolean | null
          is_compound: boolean | null
          mechanism_tags: string[] | null
          minimum_dose: string | null
          primary_benefit: string | null
          rating_count: number | null
          reference_links: string[] | null
          solution_category: string | null
          solution_fields: Json | null
          solution_type_id: string | null
          source_type: string | null
          time_investment: string | null
          time_to_results: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          benefit_categories?: string[] | null
          completion_percentage?: number | null
          completion_score?: number | null
          cost_category?: string | null
          cost_estimate?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          external_url?: string | null
          goal_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_compound?: boolean | null
          mechanism_tags?: string[] | null
          minimum_dose?: string | null
          primary_benefit?: string | null
          rating_count?: number | null
          reference_links?: string[] | null
          solution_category?: string | null
          solution_fields?: Json | null
          solution_type_id?: string | null
          source_type?: string | null
          time_investment?: string | null
          time_to_results?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          benefit_categories?: string[] | null
          completion_percentage?: number | null
          completion_score?: number | null
          cost_category?: string | null
          cost_estimate?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          external_url?: string | null
          goal_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_compound?: boolean | null
          mechanism_tags?: string[] | null
          minimum_dose?: string | null
          primary_benefit?: string | null
          rating_count?: number | null
          reference_links?: string[] | null
          solution_category?: string | null
          solution_fields?: Json | null
          solution_type_id?: string | null
          source_type?: string | null
          time_investment?: string | null
          time_to_results?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solutions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solutions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solutions_solution_type_id_fkey"
            columns: ["solution_type_id"]
            isOneToOne: false
            referencedRelation: "solution_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_arena_time: {
        Row: {
          arena_id: string | null
          arena_name: string
          created_at: string | null
          date: string
          id: string
          seconds_spent: number | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          arena_id?: string | null
          arena_name: string
          created_at?: string | null
          date: string
          id?: string
          seconds_spent?: number | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          arena_id?: string | null
          arena_name?: string
          created_at?: string | null
          date?: string
          id?: string
          seconds_spent?: number | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_arena_time_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "arenas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          goal_id: string | null
          id: string
          is_authenticated: boolean | null
          page_path: string
          page_type: string | null
          page_url: string
          rating: number
          session_data: Json | null
          solution_id: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          goal_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          page_path: string
          page_type?: string | null
          page_url: string
          rating: number
          session_data?: Json | null
          solution_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          goal_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          page_path?: string
          page_type?: string | null
          page_url?: string
          rating?: number
          session_data?: Json | null
          solution_id?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solution_coverage_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedback_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_solutions: {
        Row: {
          actual_end_date: string | null
          created_at: string | null
          notes: string | null
          solution_id: string
          start_date: string | null
          status: string
          target_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_end_date?: string | null
          created_at?: string | null
          notes?: string | null
          solution_id: string
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_end_date?: string | null
          created_at?: string | null
          notes?: string | null
          solution_id?: string
          start_date?: string | null
          status?: string
          target_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_solutions_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_old"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_solutions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age_range: string | null
          auth_id: string | null
          avatar_url: string | null
          captcha_score: number | null
          comments_count: number | null
          contribution_points: number | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          location: string | null
          ratings_count: number | null
          registration_ip: string | null
          registration_timestamp: string | null
          share_demographics: boolean | null
          show_activity: boolean | null
          solutions_count: number | null
          trust_score: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age_range?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          captcha_score?: number | null
          comments_count?: number | null
          contribution_points?: number | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id: string
          location?: string | null
          ratings_count?: number | null
          registration_ip?: string | null
          registration_timestamp?: string | null
          share_demographics?: boolean | null
          show_activity?: boolean | null
          solutions_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age_range?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          captcha_score?: number | null
          comments_count?: number | null
          contribution_points?: number | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          ratings_count?: number | null
          registration_ip?: string | null
          registration_timestamp?: string | null
          share_demographics?: boolean | null
          show_activity?: boolean | null
          solutions_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      platform_stats_cache: {
        Row: {
          active_users_today: number | null
          avg_effectiveness: number | null
          discussions_today: number | null
          last_updated: string | null
          ratings_last_hour: number | null
          total_goals: number | null
          total_solutions: number | null
        }
        Relationships: []
      }
      solution_coverage_stats: {
        Row: {
          avg_effectiveness: number | null
          connection_count: number | null
          first_connection_date: string | null
          id: string | null
          last_connection_date: string | null
          recent_connections: number | null
          solution_category: string | null
          source_type: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      batch_sync_arena_time: {
        Args: { p_entries: Json; p_user_id: string }
        Returns: number
      }
      calculate_completion_score: {
        Args: { p_solution_id: string }
        Returns: number
      }
      calculate_solution_completeness: {
        Args: { solution_id_param: string }
        Returns: number
      }
      check_and_execute_transition: {
        Args: { p_goal_id: string; p_implementation_id: string }
        Returns: boolean
      }
      check_if_generic_search: {
        Args: { search_term: string }
        Returns: boolean
      }
      check_keyword_match: {
        Args: { search_term: string }
        Returns: {
          category: string
        }[]
      }
      check_keyword_match_fuzzy: {
        Args: { search_term: string }
        Returns: {
          category: string
          match_type: string
        }[]
      }
      claim_expansion_batch: {
        Args: {
          p_batch_size: number
          p_category: string
          p_connection_filter: string
          p_process_id: string
        }
        Returns: {
          attempts_count: number
          avg_effectiveness: number
          category: string
          connection_count: number
          rejection_rate: number
          solution_id: string
          status: string
          successful_connections: number
        }[]
      }
      create_failed_solution_rating: {
        Args: {
          p_goal_id: string
          p_rating: number
          p_solution_id: string
          p_solution_name: string
          p_user_id: string
        }
        Returns: string
      }
      format_keyword_as_solution_name: {
        Args: { category: string; keyword: string }
        Returns: string
      }
      get_activity_feed: {
        Args: { hours_back?: number; limit_count?: number }
        Returns: {
          activity_type: string
          content_excerpt: string
          created_at: string
          goal_emoji: string
          goal_title: string
          rating: number
          solution_title: string
          upvotes: number
        }[]
      }
      get_related_goals: {
        Args: { target_goal_id: string }
        Returns: {
          goal_id: string
          relationship_type: string
          source: string
          strength: number
          title: string
        }[]
      }
      get_trending_goals: {
        Args: { limit_count?: number; timeframe_days?: number }
        Returns: {
          activity_score: number
          avg_effectiveness: number
          emoji: string
          id: string
          ratings_today: number
          recent_discussions: number
          recent_ratings: number
          solution_count: number
          title: string
          trend_status: string
        }[]
      }
      get_user_arena_stats: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          arena_name: string
          days_active: number
          first_visited: string
          last_visited: string
          total_seconds: number
          visit_count: number
        }[]
      }
      get_user_badge_level: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_time_summary: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          average_session_length: number
          least_visited_arena: string
          least_visited_seconds: number
          most_visited_arena: string
          most_visited_seconds: number
          total_seconds: number
          total_visits: number
          unique_arenas: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_goal_view_count: {
        Args: { goal_id: string }
        Returns: undefined
      }
      increment_upvote: {
        Args: { discussion_id: string }
        Returns: undefined
      }
      is_generic_term: {
        Args: { term: string }
        Returns: boolean
      }
      match_category_partial: {
        Args: { input_text: string }
        Returns: {
          category: string
        }[]
      }
      match_category_patterns: {
        Args: { input_text: string }
        Returns: {
          category: string
        }[]
      }
      refresh_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_solution_coverage_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_all_solutions: {
        Args: { search_term: string }
        Returns: {
          description: string
          id: string
          solution_category: string
          title: string
        }[]
      }
      search_keywords_as_solutions: {
        Args: { search_term: string }
        Returns: {
          category: string
          is_likely_solution: boolean
          match_type: string
          solution_name: string
        }[]
      }
      search_keywords_for_autocomplete: {
        Args: { search_term: string }
        Returns: {
          category: string
          keyword: string
          match_score: number
        }[]
      }
      search_solutions_fuzzy: {
        Args: { search_term: string }
        Returns: {
          description: string
          id: string
          match_score: number
          solution_category: string
          title: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      upsert_arena_time: {
        Args: {
          p_arena_id: string
          p_arena_name: string
          p_date: string
          p_seconds: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
