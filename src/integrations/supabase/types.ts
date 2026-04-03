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
            foreignKeyName: "athletes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "coach_feedback_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
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
            foreignKeyName: "parent_athletes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
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
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          logo_url: string | null
          season: string | null
          sport: string
          team_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          logo_url?: string | null
          season?: string | null
          sport?: string
          team_name: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          logo_url?: string | null
          season?: string | null
          sport?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
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
    }
    Functions: {
      find_or_create_athlete: {
        Args: {
          p_created_by_role?: string
          p_date_of_birth: string
          p_email?: string
          p_full_name: string
          p_position?: string
          p_sport: string
        }
        Returns: Json
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
