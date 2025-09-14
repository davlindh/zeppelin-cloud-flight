/**
 * This file contains the auto-generated types for the Supabase database.
 * It is used to provide strong typing for table names and other database-related
 * entities throughout the application.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: number
          setting_key: string
          setting_value: Json | null
        }
        Insert: {
          id?: number
          setting_key: string
          setting_value?: Json | null
        }
        Update: {
          id?: number
          setting_key?: string
          setting_value?: Json | null
        }
        Relationships: []
      }
      participant_media: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          participant_id: string
          title: string
          type: string
          updated_at: string
          url: string
          year: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          participant_id: string
          title: string
          type: string
          updated_at?: string
          url: string
          year?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          participant_id?: string
          title?: string
          type?: string
          updated_at?: string
          url?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_media_participant_id_fkey"
            columns: ["participant_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          availability: string | null
          avatar_path: string | null
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          contributions: string[] | null
          created_at: string
          experience_level: string | null
          how_found_us: string | null
          id: string
          interests: string[] | null
          location: string | null
          name: string
          skills: string[] | null
          slug: string
          social_links: Json | null
          time_commitment: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          availability?: string | null
          avatar_path?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contributions?: string[] | null
          created_at?: string
          experience_level?: string | null
          how_found_us?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name: string
          skills?: string[] | null
          slug: string
          social_links?: Json | null
          time_commitment?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          availability?: string | null
          avatar_path?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contributions?: string[] | null
          created_at?: string
          experience_level?: string | null
          how_found_us?: string | null
          id?: string
          interests?: string[] | null
          location?: string | null
          name?: string
          skills?: string[] | null
          slug?: string
          social_links?: Json | null
          time_commitment?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      project_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mime_type: string | null
          project_id: string
          size: number | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mime_type?: string | null
          project_id: string
          size?: number | null
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mime_type?: string | null
          project_id?: string
          size?: number | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_participants: {
        Row: {
          created_at: string
          participant_id: string
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          participant_id: string
          project_id: string
          role: string
        }
        Update: {
          created_at?: string
          participant_id?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_participant_id_fkey"
            columns: ["participant_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      project_sponsors: {
        Row: {
          created_at: string
          project_id: string
          sponsor_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          sponsor_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sponsors_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_sponsors_sponsor_id_fkey"
            columns: ["sponsor_id"]
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_path: string | null
          links: Json | null
          purpose: string | null
          start_date: string | null
          status: string
          timeline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_path?: string | null
          links?: Json | null
          purpose?: string | null
          start_date?: string | null
          status?: string
          timeline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_path?: string | null
          links?: Json | null
          purpose?: string | null
          start_date?: string | null
          status?: string
          timeline?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type TableName = keyof Database['public']['Tables'];
export type ViewName = keyof Database['public']['Views'];
export type FunctionName = keyof Database['public']['Functions'];
