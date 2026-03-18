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
        ]
      }
      athletes: {
        Row: {
          country: string | null
          created_at: string
          date_of_birth: string | null
          id: string
          institution_id: string | null
          level: number
          performance_score: number
          position: string | null
          profile_id: string
          province: string | null
          sport: string
          updated_at: string
          xp_points: number
        }
        Insert: {
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          institution_id?: string | null
          level?: number
          performance_score?: number
          position?: string | null
          profile_id: string
          province?: string | null
          sport?: string
          updated_at?: string
          xp_points?: number
        }
        Update: {
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          institution_id?: string | null
          level?: number
          performance_score?: number
          position?: string | null
          profile_id?: string
          province?: string | null
          sport?: string
          updated_at?: string
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
          updated_at: string
          website: string | null
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
          updated_at?: string
          website?: string | null
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
          updated_at?: string
          website?: string | null
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
          reputation: number
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
          reputation?: number
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
          reputation?: number
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
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
      app_role:
        | "athlete"
        | "institution"
        | "coach"
        | "referee"
        | "scout"
        | "fan"
      match_status: "scheduled" | "live" | "completed" | "cancelled"
      user_type: "athlete" | "institution" | "fan"
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
      app_role: ["athlete", "institution", "coach", "referee", "scout", "fan"],
      match_status: ["scheduled", "live", "completed", "cancelled"],
      user_type: ["athlete", "institution", "fan"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
