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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          athlete_id: string
          date_earned: string
          description: string | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          athlete_id: string
          date_earned?: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          athlete_id?: string
          date_earned?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string | null
          affected_record_id: string | null
          affected_table: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id?: string | null
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string | null
          affected_record_id?: string | null
          affected_table?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_entity: string | null
          target_entity_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity?: string | null
          target_entity_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_entity?: string | null
          target_entity_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          institution_id: string | null
          note_text: string
          note_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id?: string | null
          note_text: string
          note_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id?: string | null
          note_text?: string
          note_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          athlete_id: string | null
          confidence_score: number | null
          created_at: string | null
          data_points: Json | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string | null
          priority: string | null
          recommended_actions: string[] | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          athlete_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type?: string | null
          priority?: string | null
          recommended_actions?: string[] | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          athlete_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_points?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string | null
          priority?: string | null
          recommended_actions?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "institution_announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          burst_limit: number | null
          created_at: string | null
          endpoint_pattern: string
          id: string
          institution_id: string | null
          is_active: boolean | null
          requests_per_day: number | null
          requests_per_hour: number | null
          requests_per_minute: number | null
        }
        Insert: {
          burst_limit?: number | null
          created_at?: string | null
          endpoint_pattern: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
        }
        Update: {
          burst_limit?: number | null
          created_at?: string | null
          endpoint_pattern?: string
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          requests_per_day?: number | null
          requests_per_hour?: number | null
          requests_per_minute?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_rate_limits_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          institution_id: string | null
          ip_address: unknown
          method: string
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          institution_id?: string | null
          ip_address?: unknown
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          institution_id?: string | null
          ip_address?: unknown
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
          {
            foreignKeyName: "api_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_benchmarks: {
        Row: {
          assessment_date: string | null
          assessor_id: string | null
          athlete_id: string
          benchmark_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          notes: string | null
          percentile_rank: number | null
          verified: boolean | null
        }
        Insert: {
          assessment_date?: string | null
          assessor_id?: string | null
          athlete_id: string
          benchmark_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          notes?: string | null
          percentile_rank?: number | null
          verified?: boolean | null
        }
        Update: {
          assessment_date?: string | null
          assessor_id?: string | null
          athlete_id?: string
          benchmark_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          notes?: string | null
          percentile_rank?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_benchmarks_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_benchmarks_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_benchmarks_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_benchmarks_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_benchmarks_benchmark_id_fkey"
            columns: ["benchmark_id"]
            isOneToOne: false
            referencedRelation: "benchmark_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_cohorts: {
        Row: {
          cohort_name: string
          cohort_type: string | null
          created_at: string | null
          criteria: Json | null
          end_date: string | null
          id: string
          institution_id: string | null
          member_count: number | null
          start_date: string | null
        }
        Insert: {
          cohort_name: string
          cohort_type?: string | null
          created_at?: string | null
          criteria?: Json | null
          end_date?: string | null
          id?: string
          institution_id?: string | null
          member_count?: number | null
          start_date?: string | null
        }
        Update: {
          cohort_name?: string
          cohort_type?: string | null
          created_at?: string | null
          criteria?: Json | null
          end_date?: string | null
          id?: string
          institution_id?: string | null
          member_count?: number | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_cohorts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_cohorts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      athlete_documents: {
        Row: {
          athlete_id: string
          created_at: string | null
          document_type: string
          expiry_date: string | null
          file_name: string
          file_size_bytes: number | null
          file_url: string
          id: string
          issued_by: string | null
          metadata: Json | null
          mime_type: string | null
          notes: string | null
          upload_date: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          document_type: string
          expiry_date?: string | null
          file_name: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          issued_by?: string | null
          metadata?: Json | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          document_type?: string
          expiry_date?: string | null
          file_name?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          issued_by?: string | null
          metadata?: Json | null
          mime_type?: string | null
          notes?: string | null
          upload_date?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_documents_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_invites: {
        Row: {
          athlete_id: string
          created_at: string | null
          email_sent_to: string | null
          expires_at: string
          id: string
          invited_by: string | null
          invited_by_role: string
          status: string
          token: string
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          email_sent_to?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_role: string
          status?: string
          token?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          email_sent_to?: string | null
          expires_at?: string
          id?: string
          invited_by?: string | null
          invited_by_role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_invites_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_invites_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_invites_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "athlete_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_matches: {
        Row: {
          assists: number | null
          athlete_id: string
          created_at: string | null
          goals: number | null
          id: string
          match_date: string
          minutes_played: number | null
          notes: string | null
          opponent: string
          rating: number | null
          result: string | null
          score: string | null
        }
        Insert: {
          assists?: number | null
          athlete_id: string
          created_at?: string | null
          goals?: number | null
          id?: string
          match_date: string
          minutes_played?: number | null
          notes?: string | null
          opponent: string
          rating?: number | null
          result?: string | null
          score?: string | null
        }
        Update: {
          assists?: number | null
          athlete_id?: string
          created_at?: string | null
          goals?: number | null
          id?: string
          match_date?: string
          minutes_played?: number | null
          notes?: string | null
          opponent?: string
          rating?: number | null
          result?: string | null
          score?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_matches_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_matches_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_matches_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      athletes: {
        Row: {
          claimed_by: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          fifa_id: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          institution_id: string | null
          invited_at: string | null
          level: number
          mysafa_id: string | null
          nationality: string | null
          performance_score: number
          playing_style: string | null
          position: string | null
          position_abbreviation: string | null
          possible_duplicate: boolean
          profile_id: string | null
          profile_slug: string | null
          province: string | null
          secondary_sports: string[] | null
          sport: string
          squad: string | null
          status: Database["public"]["Enums"]["athlete_status"]
          updated_at: string
          weight_kg: number | null
          xp_points: number
        }
        Insert: {
          claimed_by?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          fifa_id?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          institution_id?: string | null
          invited_at?: string | null
          level?: number
          mysafa_id?: string | null
          nationality?: string | null
          performance_score?: number
          playing_style?: string | null
          position?: string | null
          position_abbreviation?: string | null
          possible_duplicate?: boolean
          profile_id?: string | null
          profile_slug?: string | null
          province?: string | null
          secondary_sports?: string[] | null
          sport?: string
          squad?: string | null
          status?: Database["public"]["Enums"]["athlete_status"]
          updated_at?: string
          weight_kg?: number | null
          xp_points?: number
        }
        Update: {
          claimed_by?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          fifa_id?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          institution_id?: string | null
          invited_at?: string | null
          level?: number
          mysafa_id?: string | null
          nationality?: string | null
          performance_score?: number
          playing_style?: string | null
          position?: string | null
          position_abbreviation?: string | null
          possible_duplicate?: boolean
          profile_id?: string | null
          profile_slug?: string | null
          province?: string | null
          secondary_sports?: string[] | null
          sport?: string
          squad?: string | null
          status?: Database["public"]["Enums"]["athlete_status"]
          updated_at?: string
          weight_kg?: number | null
          xp_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "athletes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
          {
            foreignKeyName: "athletes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          arrival_time: string | null
          athlete_id: string
          created_at: string | null
          id: string
          notes: string | null
          session_id: string
          status: string
        }
        Insert: {
          arrival_time?: string | null
          athlete_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_id: string
          status: string
        }
        Update: {
          arrival_time?: string | null
          athlete_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          coach_notes: string | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          institution_id: string
          location: string | null
          session_date: string
          session_type: string
        }
        Insert: {
          coach_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          institution_id: string
          location?: string | null
          session_date?: string
          session_type: string
        }
        Update: {
          coach_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          institution_id?: string
          location?: string | null
          session_date?: string
          session_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmark_templates: {
        Row: {
          age_group_max: number | null
          age_group_min: number | null
          benchmark_name: string
          description: string | null
          gender: string | null
          id: string
          metadata: Json | null
          metric_type: string | null
          sport: string | null
          unit_of_measure: string | null
        }
        Insert: {
          age_group_max?: number | null
          age_group_min?: number | null
          benchmark_name: string
          description?: string | null
          gender?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string | null
          sport?: string | null
          unit_of_measure?: string | null
        }
        Update: {
          age_group_max?: number | null
          age_group_min?: number | null
          benchmark_name?: string
          description?: string | null
          gender?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string | null
          sport?: string | null
          unit_of_measure?: string | null
        }
        Relationships: []
      }
      bulk_export_jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          export_type: string
          file_name: string | null
          file_url: string | null
          filters: Json | null
          format: string | null
          id: string
          institution_id: string
          record_count: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          export_type: string
          file_name?: string | null
          file_url?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          institution_id: string
          record_count?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          export_type?: string
          file_name?: string | null
          file_url?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          institution_id?: string
          record_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_export_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_export_jobs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_export_jobs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      bulk_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_log: Json | null
          failed_rows: number | null
          file_name: string | null
          file_url: string
          id: string
          institution_id: string
          job_type: string
          metadata: Json | null
          processed_rows: number | null
          result_summary: Json | null
          started_at: string | null
          status: string | null
          successful_rows: number | null
          total_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          failed_rows?: number | null
          file_name?: string | null
          file_url: string
          id?: string
          institution_id: string
          job_type: string
          metadata?: Json | null
          processed_rows?: number | null
          result_summary?: Json | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          failed_rows?: number | null
          file_name?: string | null
          file_url?: string
          id?: string
          institution_id?: string
          job_type?: string
          metadata?: Json | null
          processed_rows?: number | null
          result_summary?: Json | null
          started_at?: string | null
          status?: string | null
          successful_rows?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_import_jobs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_import_jobs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      club_history: {
        Row: {
          athlete_id: string
          club_name: string
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string
        }
        Insert: {
          athlete_id: string
          club_name: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date: string
        }
        Update: {
          athlete_id?: string
          club_name?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      coach_feedback: {
        Row: {
          athlete_id: string
          category: string | null
          created_at: string | null
          feedback_text: string
          id: string
          institution_id: string | null
          rating: number | null
        }
        Insert: {
          athlete_id: string
          category?: string | null
          created_at?: string | null
          feedback_text: string
          id?: string
          institution_id?: string | null
          rating?: number | null
        }
        Update: {
          athlete_id?: string
          category?: string | null
          created_at?: string | null
          feedback_text?: string
          id?: string
          institution_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_feedback_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_feedback_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_feedback_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "coach_feedback_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_feedback_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      cohort_members: {
        Row: {
          athlete_id: string
          cohort_id: string
          departed_date: string | null
          id: string
          joined_date: string | null
          status: string | null
        }
        Insert: {
          athlete_id: string
          cohort_id: string
          departed_date?: string | null
          id?: string
          joined_date?: string | null
          status?: string | null
        }
        Update: {
          athlete_id?: string
          cohort_id?: string
          departed_date?: string | null
          id?: string
          joined_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "athlete_cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          member_count: number
          name: string
          sport: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          member_count?: number
          name: string
          sport?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          member_count?: number
          name?: string
          sport?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_standings: {
        Row: {
          competition_id: string
          drawn: number | null
          form_last_5: Json | null
          goal_difference: number | null
          goals_against: number | null
          goals_for: number | null
          id: string
          last_updated: string | null
          lost: number | null
          played: number | null
          points: number | null
          position: number | null
          team_id: string
          won: number | null
        }
        Insert: {
          competition_id: string
          drawn?: number | null
          form_last_5?: Json | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          team_id: string
          won?: number | null
        }
        Update: {
          competition_id?: string
          drawn?: number | null
          form_last_5?: Json | null
          goal_difference?: number | null
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          last_updated?: string | null
          lost?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          team_id?: string
          won?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_standings_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          competition_name: string
          competition_type: string | null
          created_at: string | null
          end_date: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          logo_url: string | null
          metadata: Json | null
          organizer: string | null
          rules_url: string | null
          season: string | null
          sport: string
          standings: Json | null
          start_date: string | null
        }
        Insert: {
          competition_name: string
          competition_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          organizer?: string | null
          rules_url?: string | null
          season?: string | null
          sport: string
          standings?: Json | null
          start_date?: string | null
        }
        Update: {
          competition_name?: string
          competition_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          organizer?: string | null
          rules_url?: string | null
          season?: string | null
          sport?: string
          standings?: Json | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          id: string
          message: string
          metadata: Json
          name: string
          organization: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sponsor_type: string | null
          status: string
          subject: string | null
          submission_type: string
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          metadata?: Json
          name: string
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sponsor_type?: string | null
          status?: string
          subject?: string | null
          submission_type: string
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          metadata?: Json
          name?: string
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sponsor_type?: string | null
          status?: string
          subject?: string | null
          submission_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_form_fields: {
        Row: {
          created_at: string | null
          display_order: number | null
          field_label: string
          field_options: Json | null
          field_type: string
          form_type: string
          help_text: string | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          is_required: boolean | null
          validation_regex: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          field_label: string
          field_options?: Json | null
          field_type: string
          form_type: string
          help_text?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_required?: boolean | null
          validation_regex?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          field_label?: string
          field_options?: Json | null
          field_type?: string
          form_type?: string
          help_text?: string | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_required?: boolean | null
          validation_regex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_form_fields_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_form_fields_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      email_queue: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          actions_taken: string | null
          assigned_to: string | null
          athlete_id: string | null
          created_at: string | null
          description: string
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          incident_date: string
          incident_type: string
          institution_id: string
          location: string | null
          reported_by: string
          resolution_date: string | null
          severity: string | null
          status: string | null
          witnesses: string[] | null
        }
        Insert: {
          actions_taken?: string | null
          assigned_to?: string | null
          athlete_id?: string | null
          created_at?: string | null
          description: string
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date: string
          incident_type: string
          institution_id: string
          location?: string | null
          reported_by: string
          resolution_date?: string | null
          severity?: string | null
          status?: string | null
          witnesses?: string[] | null
        }
        Update: {
          actions_taken?: string | null
          assigned_to?: string | null
          athlete_id?: string | null
          created_at?: string | null
          description?: string
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          incident_date?: string
          incident_type?: string
          institution_id?: string
          location?: string | null
          reported_by?: string
          resolution_date?: string | null
          severity?: string | null
          status?: string | null
          witnesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "incident_reports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
          {
            foreignKeyName: "incident_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          institution_id: string
          priority: string | null
          read_count: number | null
          target_audience: string[] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id: string
          priority?: string | null
          read_count?: number | null
          target_audience?: string[] | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          institution_id?: string
          priority?: string | null
          read_count?: number | null
          target_audience?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_announcements_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_announcements_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      institution_branding: {
        Row: {
          accent_color: string | null
          created_at: string | null
          custom_css: string | null
          custom_domain: string | null
          custom_privacy_url: string | null
          custom_terms_url: string | null
          email_signature_html: string | null
          favicon_url: string | null
          hide_even_playground_branding: boolean | null
          institution_id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          social_media_links: Json | null
          subdomain: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          custom_privacy_url?: string | null
          custom_terms_url?: string | null
          email_signature_html?: string | null
          favicon_url?: string | null
          hide_even_playground_branding?: boolean | null
          institution_id: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_media_links?: Json | null
          subdomain?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          custom_privacy_url?: string | null
          custom_terms_url?: string | null
          email_signature_html?: string | null
          favicon_url?: string | null
          hide_even_playground_branding?: boolean | null
          institution_id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          social_media_links?: Json | null
          subdomain?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_branding_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_branding_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      institutions: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: string
          institution_name: string
          institution_type: string
          logo_url: string | null
          physical_address: string | null
          primary_contact_name: string | null
          profile_id: string
          province: string | null
          registration_number: string | null
          safa_affiliation_number: string | null
          sasa_registration_number: string | null
          sport_codes: string[] | null
          updated_at: string
          website: string | null
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_name: string
          institution_type?: string
          logo_url?: string | null
          physical_address?: string | null
          primary_contact_name?: string | null
          profile_id: string
          province?: string | null
          registration_number?: string | null
          safa_affiliation_number?: string | null
          sasa_registration_number?: string | null
          sport_codes?: string[] | null
          updated_at?: string
          website?: string | null
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          institution_type?: string
          logo_url?: string | null
          physical_address?: string | null
          primary_contact_name?: string | null
          profile_id?: string
          province?: string | null
          registration_number?: string | null
          safa_affiliation_number?: string | null
          sasa_registration_number?: string | null
          sport_codes?: string[] | null
          updated_at?: string
          website?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configurations: {
        Row: {
          api_credentials: Json
          configuration_name: string
          created_at: string | null
          id: string
          institution_id: string | null
          integration_type: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          sync_frequency: string | null
          sync_status: string | null
          webhook_url: string | null
        }
        Insert: {
          api_credentials: Json
          configuration_name: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          integration_type: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          sync_frequency?: string | null
          sync_status?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_credentials?: Json
          configuration_name?: string
          created_at?: string | null
          id?: string
          institution_id?: string | null
          integration_type?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          sync_frequency?: string | null
          sync_status?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_configurations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_configurations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      integration_sync_logs: {
        Row: {
          configuration_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          sync_type: string
        }
        Insert: {
          configuration_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          sync_type: string
        }
        Update: {
          configuration_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "integration_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          athlete_id: string | null
          coordinate_x: number | null
          coordinate_y: number | null
          created_at: string | null
          description: string | null
          event_type: string
          extra_minute: number | null
          id: string
          match_id: string
          metadata: Json | null
          minute: number
          player_name: string | null
          team_id: string | null
          team_side: string | null
          video_clip_url: string | null
        }
        Insert: {
          athlete_id?: string | null
          coordinate_x?: number | null
          coordinate_y?: number | null
          created_at?: string | null
          description?: string | null
          event_type: string
          extra_minute?: number | null
          id?: string
          match_id: string
          metadata?: Json | null
          minute: number
          player_name?: string | null
          team_id?: string | null
          team_side?: string | null
          video_clip_url?: string | null
        }
        Update: {
          athlete_id?: string | null
          coordinate_x?: number | null
          coordinate_y?: number | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          extra_minute?: number | null
          id?: string
          match_id?: string
          metadata?: Json | null
          minute?: number
          player_name?: string | null
          team_id?: string | null
          team_side?: string | null
          video_clip_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_fixtures: {
        Row: {
          attendance_count: number | null
          away_score: number | null
          away_team_id: string
          broadcast_url: string | null
          competition_id: string | null
          created_at: string | null
          created_by: string | null
          half_time_away_score: number | null
          half_time_home_score: number | null
          highlights_url: string | null
          home_score: number | null
          home_team_id: string
          id: string
          kickoff_time: string
          live_updates: Json | null
          match_report: string | null
          pitch_condition: string | null
          referee_name: string | null
          status: string | null
          venue_address: string | null
          venue_id: string | null
          venue_name: string | null
          weather_conditions: string | null
        }
        Insert: {
          attendance_count?: number | null
          away_score?: number | null
          away_team_id: string
          broadcast_url?: string | null
          competition_id?: string | null
          created_at?: string | null
          created_by?: string | null
          half_time_away_score?: number | null
          half_time_home_score?: number | null
          highlights_url?: string | null
          home_score?: number | null
          home_team_id: string
          id?: string
          kickoff_time: string
          live_updates?: Json | null
          match_report?: string | null
          pitch_condition?: string | null
          referee_name?: string | null
          status?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string | null
          weather_conditions?: string | null
        }
        Update: {
          attendance_count?: number | null
          away_score?: number | null
          away_team_id?: string
          broadcast_url?: string | null
          competition_id?: string | null
          created_at?: string | null
          created_by?: string | null
          half_time_away_score?: number | null
          half_time_home_score?: number | null
          highlights_url?: string | null
          home_score?: number | null
          home_team_id?: string
          id?: string
          kickoff_time?: string
          live_updates?: Json | null
          match_report?: string | null
          pitch_condition?: string | null
          referee_name?: string | null
          status?: string | null
          venue_address?: string | null
          venue_id?: string | null
          venue_name?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_fixtures_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_fixtures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_fixtures_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      match_stats: {
        Row: {
          assists: number
          athlete_id: string
          created_at: string
          goals: number
          id: string
          match_id: string
          minutes_played: number
          rating: number | null
        }
        Insert: {
          assists?: number
          athlete_id: string
          created_at?: string
          goals?: number
          id?: string
          match_id: string
          minutes_played?: number
          rating?: number | null
        }
        Update: {
          assists?: number
          athlete_id?: string
          created_at?: string
          goals?: number
          id?: string
          match_id?: string
          minutes_played?: number
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_stats_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string
          competition: string | null
          created_at: string
          home_score: number | null
          home_team_id: string
          id: string
          location: string | null
          match_date: string
          status: Database["public"]["Enums"]["match_status"]
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          competition?: string | null
          created_at?: string
          home_score?: number | null
          home_team_id: string
          id?: string
          location?: string | null
          match_date?: string
          status?: Database["public"]["Enums"]["match_status"]
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          competition?: string | null
          created_at?: string
          home_score?: number | null
          home_team_id?: string
          id?: string
          location?: string | null
          match_date?: string
          status?: Database["public"]["Enums"]["match_status"]
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      media_gallery: {
        Row: {
          athlete_id: string
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          media_type: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          media_type?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          media_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_gallery_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_gallery_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      merchandise: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name: string
          price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name: string
          price?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_athletes: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "parent_athletes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_athletes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_parent_dashboard"
            referencedColumns: ["parent_id"]
          },
        ]
      }
      parents: {
        Row: {
          contact_phone: string | null
          created_at: string
          id: string
          profile_id: string
          relationship_to_child: string | null
          updated_at: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          profile_id: string
          relationship_to_child?: string | null
          updated_at?: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          relationship_to_child?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          agility: number | null
          athlete_id: string
          bench_press_1rm_kg: number | null
          created_at: string | null
          endurance: number | null
          id: string
          illinois_agility_s: number | null
          reaction_time: number | null
          recorded_at: string | null
          speed: number | null
          sprint_40m_s: number | null
          squat_1rm_kg: number | null
          strength: number | null
          training_hours_per_week: number | null
          vertical_jump_cm: number | null
          vo2_max: number | null
        }
        Insert: {
          agility?: number | null
          athlete_id: string
          bench_press_1rm_kg?: number | null
          created_at?: string | null
          endurance?: number | null
          id?: string
          illinois_agility_s?: number | null
          reaction_time?: number | null
          recorded_at?: string | null
          speed?: number | null
          sprint_40m_s?: number | null
          squat_1rm_kg?: number | null
          strength?: number | null
          training_hours_per_week?: number | null
          vertical_jump_cm?: number | null
          vo2_max?: number | null
        }
        Update: {
          agility?: number | null
          athlete_id?: string
          bench_press_1rm_kg?: number | null
          created_at?: string | null
          endurance?: number | null
          id?: string
          illinois_agility_s?: number | null
          reaction_time?: number | null
          recorded_at?: string | null
          speed?: number | null
          sprint_40m_s?: number | null
          squat_1rm_kg?: number | null
          strength?: number | null
          training_hours_per_week?: number | null
          vertical_jump_cm?: number | null
          vo2_max?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_metrics_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      performance_tests: {
        Row: {
          athlete_id: string
          created_at: string | null
          id: string
          test_date: string | null
          test_name: string
          test_unit: string | null
          test_value: number
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          id?: string
          test_date?: string | null
          test_name: string
          test_unit?: string | null
          test_value: number
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          id?: string
          test_date?: string | null
          test_name?: string
          test_unit?: string | null
          test_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_tests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_tests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_tests_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category: string
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          favorite_sport: string | null
          id: string
          name: string
          popia_consent: boolean | null
          popia_consent_date: string | null
          popia_consent_version: string | null
          reputation: number
          secondary_roles: string[] | null
          setup_complete: boolean
          subscription_active: boolean | null
          subscription_tier: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          favorite_sport?: string | null
          id: string
          name?: string
          popia_consent?: boolean | null
          popia_consent_date?: string | null
          popia_consent_version?: string | null
          reputation?: number
          secondary_roles?: string[] | null
          setup_complete?: boolean
          subscription_active?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          favorite_sport?: string | null
          id?: string
          name?: string
          popia_consent?: boolean | null
          popia_consent_date?: string | null
          popia_consent_version?: string | null
          reputation?: number
          secondary_roles?: string[] | null
          setup_complete?: boolean
          subscription_active?: boolean | null
          subscription_tier?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      query_cache: {
        Row: {
          access_count: number | null
          cache_key: string
          created_at: string | null
          expires_at: string
          last_accessed: string | null
          query_hash: string
          result_data: Json
        }
        Insert: {
          access_count?: number | null
          cache_key: string
          created_at?: string | null
          expires_at: string
          last_accessed?: string | null
          query_hash: string
          result_data: Json
        }
        Update: {
          access_count?: number | null
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          last_accessed?: string | null
          query_hash?: string
          result_data?: Json
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
          unit: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          athlete_id: string
          id: string
          jersey_number: number | null
          joined_at: string
          position: string | null
          team_id: string
        }
        Insert: {
          athlete_id: string
          id?: string
          jersey_number?: number | null
          joined_at?: string
          position?: string | null
          team_id: string
        }
        Update: {
          athlete_id?: string
          id?: string
          jersey_number?: number | null
          joined_at?: string
          position?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_squads: {
        Row: {
          athlete_id: string
          created_at: string | null
          departure_date: string | null
          id: string
          jersey_number: number | null
          joined_date: string | null
          notes: string | null
          squad_role: string | null
          status: string | null
          team_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          departure_date?: string | null
          id?: string
          jersey_number?: number | null
          joined_date?: string | null
          notes?: string | null
          squad_role?: string | null
          status?: string | null
          team_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          departure_date?: string | null
          id?: string
          jersey_number?: number | null
          joined_date?: string | null
          notes?: string | null
          squad_role?: string | null
          status?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_squads_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_squads_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_squads_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "team_squads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string | null
          assistant_coach_id: string | null
          coach_id: string | null
          created_at: string
          home_venue: string | null
          id: string
          institution_id: string
          logo_url: string | null
          practice_schedule: Json | null
          season: string | null
          skill_level: string | null
          sport: string
          team_colors: string[] | null
          team_logo_url: string | null
          team_name: string
        }
        Insert: {
          age_group?: string | null
          assistant_coach_id?: string | null
          coach_id?: string | null
          created_at?: string
          home_venue?: string | null
          id?: string
          institution_id: string
          logo_url?: string | null
          practice_schedule?: Json | null
          season?: string | null
          skill_level?: string | null
          sport?: string
          team_colors?: string[] | null
          team_logo_url?: string | null
          team_name: string
        }
        Update: {
          age_group?: string | null
          assistant_coach_id?: string | null
          coach_id?: string | null
          created_at?: string
          home_venue?: string | null
          id?: string
          institution_id?: string
          logo_url?: string | null
          practice_schedule?: Json | null
          season?: string | null
          skill_level?: string | null
          sport?: string
          team_colors?: string[] | null
          team_logo_url?: string | null
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_assistant_coach_id_fkey"
            columns: ["assistant_coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "v_institution_engagement"
            referencedColumns: ["institution_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          province: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          province?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          province?: string | null
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          digital_signature: string | null
          documents: string[] | null
          entity_id: string
          entity_type: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["verification_status"]
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          digital_signature?: string | null
          documents?: string[] | null
          entity_id: string
          entity_type: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          digital_signature?: string | null
          documents?: string[] | null
          entity_id?: string
          entity_type?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_daily_institution_stats: {
        Row: {
          active_athletes: number | null
          avg_performance_score: number | null
          expired_documents: number | null
          institution_id: string | null
          profile_id: string | null
          stat_date: string | null
          total_athletes: number | null
          total_documents: number | null
          total_matches: number | null
          total_sessions: number | null
          total_teams: number | null
          verified_documents: number | null
        }
        Relationships: []
      }
      mv_monthly_attendance: {
        Row: {
          attendance_rate: number | null
          institution_id: string | null
          month_start: string | null
          session_type: string | null
          total_records: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      mv_weekly_performance_trends: {
        Row: {
          avg_rating: number | null
          avg_score: number | null
          feedback_count: number | null
          institution_id: string | null
          median_rating: number | null
          sport: string | null
          week_start: string | null
        }
        Relationships: []
      }
      public_athlete_profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          full_name: string | null
          id: string | null
          position: string | null
          sport: string | null
          status: Database["public"]["Enums"]["athlete_status"] | null
        }
        Relationships: []
      }
      v_athlete_performance_trends: {
        Row: {
          athlete_id: string | null
          avg_feedback_rating: number | null
          feedback_categories: string | null
          full_name: string | null
          last_feedback_date: string | null
          level: number | null
          performance_score: number | null
          sport: string | null
          team_count: number | null
          total_feedback: number | null
          total_media: number | null
        }
        Relationships: []
      }
      v_institution_engagement: {
        Row: {
          avg_session_duration: number | null
          institution_id: string | null
          profile_id: string | null
          total_announcement_reads: number | null
          total_announcements: number | null
          total_athletes: number | null
          total_documents: number | null
          total_matches: number | null
          total_sessions: number | null
          total_teams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institutions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_parent_dashboard: {
        Row: {
          athlete_id: string | null
          athlete_name: string | null
          attendance_rate: number | null
          avg_feedback_rating: number | null
          current_team: string | null
          expired_documents: number | null
          level: number | null
          parent_id: string | null
          performance_score: number | null
          position: string | null
          profile_id: string | null
          sport: string | null
          total_attendance_records: number | null
          total_documents: number | null
          total_feedback: number | null
          verified_documents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_athletes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "v_athlete_performance_trends"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "parents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_match_stats: { Args: { match_id_param: string }; Returns: Json }
      claim_athlete_profile: {
        Args: {
          p_athlete_id: string
          p_height_cm?: number
          p_mysafa_id?: string
          p_nationality?: string
          p_playing_style?: string
          p_position?: string
          p_profile_id: string
          p_squad?: string
          p_weight_kg?: number
        }
        Returns: undefined
      }
      find_or_create_athlete: {
        Args: {
          p_created_by_role?: string
          p_date_of_birth: string
          p_email?: string
          p_full_name: string
          p_position?: string
          p_secondary_sports?: string[]
          p_sport: string
        }
        Returns: Json
      }
      get_institution_branding: {
        Args: { inst_id: string }
        Returns: {
          custom_css: string
          hide_branding: boolean
          logo_url: string
          primary_color: string
          secondary_color: string
        }[]
      }
      get_team_roster: {
        Args: { team_id_param: string }
        Returns: {
          athlete_id: string
          full_name: string
          jersey_number: number
          joined_date: string
          position: string
          sport: string
          squad_role: string
          status: string
        }[]
      }
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_announcement_read: {
        Args: { announcement_id: string }
        Returns: undefined
      }
      test_insert_note: { Args: { test_uid: string }; Returns: string }
      test_select_athletes: {
        Args: { test_uid: string }
        Returns: {
          claimed_by: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          fifa_id: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          institution_id: string | null
          invited_at: string | null
          level: number
          mysafa_id: string | null
          nationality: string | null
          performance_score: number
          playing_style: string | null
          position: string | null
          position_abbreviation: string | null
          possible_duplicate: boolean
          profile_id: string | null
          profile_slug: string | null
          province: string | null
          secondary_sports: string[] | null
          sport: string
          squad: string | null
          status: Database["public"]["Enums"]["athlete_status"]
          updated_at: string
          weight_kg: number | null
          xp_points: number
        }[]
        SetofOptions: {
          from: "*"
          to: "athletes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role:
        | "athlete"
        | "institution"
        | "coach"
        | "referee"
        | "scout"
        | "fan"
        | "master_admin"
      athlete_status: "stub" | "invited" | "claimed" | "merged"
      match_status: "scheduled" | "live" | "completed" | "cancelled"
      user_type: "athlete" | "institution" | "fan" | "master_admin"
      verification_status: "pending" | "verified" | "rejected"
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
    Enums: {
      app_role: [
        "athlete",
        "institution",
        "coach",
        "referee",
        "scout",
        "fan",
        "master_admin",
      ],
      athlete_status: ["stub", "invited", "claimed", "merged"],
      match_status: ["scheduled", "live", "completed", "cancelled"],
      user_type: ["athlete", "institution", "fan", "master_admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
