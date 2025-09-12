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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      draft_submissions: {
        Row: {
          created_at: string
          current_step: number
          device_fingerprint: string | null
          form_data: Json
          id: string
          session_id: string
          updated_at: string
          uploaded_files: Json
        }
        Insert: {
          created_at?: string
          current_step?: number
          device_fingerprint?: string | null
          form_data?: Json
          id?: string
          session_id: string
          updated_at?: string
          uploaded_files?: Json
        }
        Update: {
          created_at?: string
          current_step?: number
          device_fingerprint?: string | null
          form_data?: Json
          id?: string
          session_id?: string
          updated_at?: string
          uploaded_files?: Json
        }
        Relationships: []
      }
      participant_media: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          participant_id: string
          title: string
          type: string
          url: string
          year: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          participant_id: string
          title: string
          type: string
          url: string
          year?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          participant_id?: string
          title?: string
          type?: string
          url?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_media_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          id: string
          name: string
          slug: string
          social_links: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          social_links?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      project_access: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          project_id: string
          registration_required: boolean | null
          requirements: string[] | null
          target_audience: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          project_id: string
          registration_required?: boolean | null
          requirements?: string[] | null
          target_audience?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          project_id?: string
          registration_required?: boolean | null
          requirements?: string[] | null
          target_audience?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_budget: {
        Row: {
          amount: number | null
          breakdown: Json | null
          created_at: string
          currency: string | null
          id: string
          project_id: string
        }
        Insert: {
          amount?: number | null
          breakdown?: Json | null
          created_at?: string
          currency?: string | null
          id?: string
          project_id: string
        }
        Update: {
          amount?: number | null
          breakdown?: Json | null
          created_at?: string
          currency?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_links: {
        Row: {
          created_at: string
          id: string
          project_id: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          project_id: string
          role: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sponsors: {
        Row: {
          created_at: string
          id: string
          project_id: string
          sponsor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          sponsor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sponsors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sponsors_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          created_at: string
          id: string
          project_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          milestones: Json | null
          project_id: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          milestones?: Json | null
          project_id: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          milestones?: Json | null
          project_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_voting: {
        Row: {
          categories: Json | null
          created_at: string
          enabled: boolean | null
          id: string
          project_id: string
          results: Json | null
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          project_id: string
          results?: Json | null
        }
        Update: {
          categories?: Json | null
          created_at?: string
          enabled?: boolean | null
          id?: string
          project_id?: string
          results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "project_voting_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          associations: string[] | null
          created_at: string
          description: string
          expected_impact: string | null
          full_description: string | null
          id: string
          image_path: string | null
          purpose: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          associations?: string[] | null
          created_at?: string
          description: string
          expected_impact?: string | null
          full_description?: string | null
          id?: string
          image_path?: string | null
          purpose?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          associations?: string[] | null
          created_at?: string
          description?: string
          expected_impact?: string | null
          full_description?: string | null
          id?: string
          image_path?: string | null
          purpose?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          logo_path: string | null
          name: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name: string
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name?: string
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          content: Json
          created_at: string
          device_fingerprint: string | null
          files: Json | null
          how_found_us: string | null
          id: string
          ip_address: unknown | null
          language_preference: string | null
          location: string | null
          processed_at: string | null
          publication_permission: boolean | null
          session_id: string | null
          status: string
          submitted_by: string | null
          title: string
          type: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          content: Json
          created_at?: string
          device_fingerprint?: string | null
          files?: Json | null
          how_found_us?: string | null
          id?: string
          ip_address?: unknown | null
          language_preference?: string | null
          location?: string | null
          processed_at?: string | null
          publication_permission?: boolean | null
          session_id?: string | null
          status?: string
          submitted_by?: string | null
          title: string
          type: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          content?: Json
          created_at?: string
          device_fingerprint?: string | null
          files?: Json | null
          how_found_us?: string | null
          id?: string
          ip_address?: unknown | null
          language_preference?: string | null
          location?: string | null
          processed_at?: string | null
          publication_permission?: boolean | null
          session_id?: string | null
          status?: string
          submitted_by?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_drafts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_session_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      hash_device_fingerprint: {
        Args: { fingerprint: string }
        Returns: string
      }
      is_admin: {
        Args: { user_email: string } | { user_email?: string; user_id?: string }
        Returns: boolean
      }
      is_admin_email: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      set_session_context: {
        Args: { device_fingerprint: string; session_id: string }
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
