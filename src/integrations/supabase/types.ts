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
      admin_access_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      auctions: {
        Row: {
          bidders: number
          category: string
          condition: Database["public"]["Enums"]["auction_condition"]
          created_at: string
          current_bid: number
          description: string | null
          end_time: string
          id: string
          image: string
          images: string[] | null
          slug: string | null
          starting_bid: number
          status: string | null
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bidders?: number
          category: string
          condition: Database["public"]["Enums"]["auction_condition"]
          created_at?: string
          current_bid?: number
          description?: string | null
          end_time: string
          id?: string
          image: string
          images?: string[] | null
          slug?: string | null
          starting_bid: number
          status?: string | null
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bidders?: number
          category?: string
          condition?: Database["public"]["Enums"]["auction_condition"]
          created_at?: string
          current_bid?: number
          description?: string | null
          end_time?: string
          id?: string
          image?: string
          images?: string[] | null
          slug?: string | null
          starting_bid?: number
          status?: string | null
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      bid_history: {
        Row: {
          amount: number
          auction_id: string
          bid_type: string | null
          bidder: string
          bidder_email: string | null
          created_at: string
          id: string
          is_auto_bid: boolean | null
          time: string
          user_id: string | null
        }
        Insert: {
          amount: number
          auction_id: string
          bid_type?: string | null
          bidder: string
          bidder_email?: string | null
          created_at?: string
          id?: string
          is_auto_bid?: boolean | null
          time?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          auction_id?: string
          bid_type?: string | null
          bidder?: string
          bidder_email?: string | null
          created_at?: string
          id?: string
          is_auto_bid?: boolean | null
          time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_history_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_notifications: {
        Row: {
          auction_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          user_id: string | null
        }
        Insert: {
          auction_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          user_id?: string | null
        }
        Update: {
          auction_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_notifications_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agreed_to_terms: boolean
          created_at: string
          customer_email: string
          customer_message: string
          customer_name: string
          customer_phone: string
          customizations: Json
          id: string
          selected_date: string
          selected_time: string
          service_id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
        }
        Insert: {
          agreed_to_terms?: boolean
          created_at?: string
          customer_email: string
          customer_message: string
          customer_name: string
          customer_phone: string
          customizations?: Json
          id?: string
          selected_date: string
          selected_time: string
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          agreed_to_terms?: boolean
          created_at?: string
          customer_email?: string
          customer_message?: string
          customer_name?: string
          customer_phone?: string
          customizations?: Json
          id?: string
          selected_date?: string
          selected_time?: string
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_metadata: {
        Row: {
          category_id: string | null
          color_scheme: Json | null
          created_at: string
          icon_name: string | null
          id: string
          image_url: string | null
          search_keywords: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          color_scheme?: Json | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          search_keywords?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          color_scheme?: Json | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          search_keywords?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_metadata_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_requests: {
        Row: {
          additional_data: Json | null
          created_at: string
          created_by_guest: boolean | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          estimated_response_time: string | null
          id: string
          message: string
          provider_email: string
          provider_id: string
          provider_name: string
          provider_response: string | null
          reference_number: string
          response_timestamp: string | null
          service_id: string | null
          service_name: string | null
          service_price: number | null
          status: Database["public"]["Enums"]["communication_status"]
          subject: string | null
          timestamp: string
          type: Database["public"]["Enums"]["communication_type"]
          updated_at: string
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string
          created_by_guest?: boolean | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          estimated_response_time?: string | null
          id?: string
          message: string
          provider_email: string
          provider_id: string
          provider_name: string
          provider_response?: string | null
          reference_number: string
          response_timestamp?: string | null
          service_id?: string | null
          service_name?: string | null
          service_price?: number | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          timestamp?: string
          type: Database["public"]["Enums"]["communication_type"]
          updated_at?: string
        }
        Update: {
          additional_data?: Json | null
          created_at?: string
          created_by_guest?: boolean | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          estimated_response_time?: string | null
          id?: string
          message?: string
          provider_email?: string
          provider_id?: string
          provider_name?: string
          provider_response?: string | null
          reference_number?: string
          response_timestamp?: string | null
          service_id?: string | null
          service_name?: string | null
          service_price?: number | null
          status?: Database["public"]["Enums"]["communication_status"]
          subject?: string | null
          timestamp?: string
          type?: Database["public"]["Enums"]["communication_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
      media_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          media_id: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          media_id?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          media_id?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_audit_log_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_audit_log_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
        ]
      }
      media_items: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          filename: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string
          original_name: string | null
          participant_id: string | null
          project_id: string | null
          size: number
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          filename: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type: string
          original_name?: string | null
          participant_id?: string | null
          project_id?: string | null
          size: number
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          filename?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string
          original_name?: string | null
          participant_id?: string | null
          project_id?: string | null
          size?: number
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          approved_at: string | null
          bucket: string
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          file_size: number | null
          filename: string
          height: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          mime_type: string
          original_filename: string | null
          participant_id: string | null
          project_id: string | null
          public_url: string
          search_vector: unknown
          source: string | null
          status: string
          storage_path: string
          submission_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          approved_at?: string | null
          bucket?: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          mime_type: string
          original_filename?: string | null
          participant_id?: string | null
          project_id?: string | null
          public_url: string
          search_vector?: unknown
          source?: string | null
          status?: string
          storage_path: string
          submission_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          approved_at?: string | null
          bucket?: string
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          mime_type?: string
          original_filename?: string | null
          participant_id?: string | null
          project_id?: string | null
          public_url?: string
          search_vector?: unknown
          source?: string | null
          status?: string
          storage_path?: string
          submission_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_library_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_library_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_library_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library_backup_20251018: {
        Row: {
          approved_at: string | null
          bucket: string | null
          category: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          filename: string | null
          height: number | null
          id: string | null
          is_featured: boolean | null
          is_public: boolean | null
          mime_type: string | null
          original_filename: string | null
          participant_id: string | null
          project_id: string | null
          public_url: string | null
          search_vector: unknown
          source: string | null
          status: string | null
          storage_path: string | null
          submission_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          approved_at?: string | null
          bucket?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: string | null
          is_featured?: boolean | null
          is_public?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          participant_id?: string | null
          project_id?: string | null
          public_url?: string | null
          search_vector?: unknown
          source?: string | null
          status?: string | null
          storage_path?: string | null
          submission_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          approved_at?: string | null
          bucket?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          height?: number | null
          id?: string | null
          is_featured?: boolean | null
          is_public?: boolean | null
          mime_type?: string | null
          original_filename?: string | null
          participant_id?: string | null
          project_id?: string | null
          public_url?: string | null
          search_vector?: unknown
          source?: string | null
          status?: string | null
          storage_path?: string | null
          submission_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      media_participant_links: {
        Row: {
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          media_id: string
          participant_id: string
          updated_at: string | null
          year: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_id: string
          participant_id: string
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_id?: string
          participant_id?: string
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_participant_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_participant_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
          {
            foreignKeyName: "media_participant_links_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_project_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          media_id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_id: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_project_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_project_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
          {
            foreignKeyName: "media_project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sponsor_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_primary: boolean | null
          media_id: string
          media_type: string | null
          sponsor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          media_id: string
          media_type?: string | null
          sponsor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          media_id?: string
          media_type?: string | null
          sponsor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_sponsor_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_sponsor_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
          {
            foreignKeyName: "media_sponsor_links_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          auction_ending_alerts: boolean | null
          back_in_stock_alerts: boolean | null
          created_at: string | null
          daily_digest: boolean | null
          email_notifications: boolean | null
          frequency_daily: boolean | null
          frequency_hourly: boolean | null
          frequency_immediate: boolean | null
          id: string
          new_items_in_categories: boolean | null
          outbid_alerts: boolean | null
          price_drop_alerts: boolean | null
          push_notifications: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          stock_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_recommendations: boolean | null
        }
        Insert: {
          auction_ending_alerts?: boolean | null
          back_in_stock_alerts?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          frequency_daily?: boolean | null
          frequency_hourly?: boolean | null
          frequency_immediate?: boolean | null
          id?: string
          new_items_in_categories?: boolean | null
          outbid_alerts?: boolean | null
          price_drop_alerts?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          stock_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_recommendations?: boolean | null
        }
        Update: {
          auction_ending_alerts?: boolean | null
          back_in_stock_alerts?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          email_notifications?: boolean | null
          frequency_daily?: boolean | null
          frequency_hourly?: boolean | null
          frequency_immediate?: boolean | null
          id?: string
          new_items_in_categories?: boolean | null
          outbid_alerts?: boolean | null
          price_drop_alerts?: boolean | null
          push_notifications?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          stock_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_recommendations?: boolean | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_sku: string | null
          item_title: string
          item_type: Database["public"]["Enums"]["order_item_type"]
          metadata: Json | null
          order_id: string
          quantity: number
          tax_rate: number | null
          total_price: number
          unit_price: number
          variant_details: Json | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_sku?: string | null
          item_title: string
          item_type: Database["public"]["Enums"]["order_item_type"]
          metadata?: Json | null
          order_id: string
          quantity?: number
          tax_rate?: number | null
          total_price: number
          unit_price: number
          variant_details?: Json | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_sku?: string | null
          item_title?: string
          item_type?: Database["public"]["Enums"]["order_item_type"]
          metadata?: Json | null
          order_id?: string
          quantity?: number
          tax_rate?: number | null
          total_price?: number
          unit_price?: number
          variant_details?: Json | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          changed_by_type: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          changed_by_type?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          changed_by_type?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_address: Json | null
          cancelled_at: string | null
          carrier: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          delivered_at: string | null
          discount_amount: number
          id: string
          order_number: string
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_amount: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          order_number: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address: Json
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total_amount: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          discount_amount?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_amount?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      participant_claim_audit: {
        Row: {
          admin_assisted: boolean
          admin_user_id: string | null
          claim_method: string
          claimed_at: string
          claimed_by_user_id: string
          id: string
          notes: string | null
          participant_id: string
        }
        Insert: {
          admin_assisted?: boolean
          admin_user_id?: string | null
          claim_method?: string
          claimed_at?: string
          claimed_by_user_id: string
          id?: string
          notes?: string | null
          participant_id: string
        }
        Update: {
          admin_assisted?: boolean
          admin_user_id?: string | null
          claim_method?: string
          claimed_at?: string
          claimed_by_user_id?: string
          id?: string
          notes?: string | null
          participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_claim_audit_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_media: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          participant_id: string
          thumbnail_url: string | null
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
          thumbnail_url?: string | null
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
          thumbnail_url?: string | null
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
      participant_media_backup_20251018: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          participant_id: string | null
          thumbnail_url: string | null
          title: string | null
          type: string | null
          url: string | null
          year: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          participant_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
          year?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          participant_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
          year?: string | null
        }
        Relationships: []
      }
      participant_media_links: {
        Row: {
          created_at: string | null
          id: string
          media_id: string | null
          participant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          participant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          participant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
          {
            foreignKeyName: "participant_media_links_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          participant_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          participant_id: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          participant_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_tokens_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          auth_user_id: string | null
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
          is_featured: boolean | null
          is_public: boolean | null
          location: string | null
          name: string
          profile_completed: boolean | null
          profile_completed_at: string | null
          show_contact_info: boolean | null
          skills: string[] | null
          slug: string
          social_links: Json | null
          time_commitment: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          auth_user_id?: string | null
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
          is_featured?: boolean | null
          is_public?: boolean | null
          location?: string | null
          name: string
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          show_contact_info?: boolean | null
          skills?: string[] | null
          slug: string
          social_links?: Json | null
          time_commitment?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          auth_user_id?: string | null
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
          is_featured?: boolean | null
          is_public?: boolean | null
          location?: string | null
          name?: string
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          show_contact_info?: boolean | null
          skills?: string[] | null
          slug?: string
          social_links?: Json | null
          time_commitment?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string
          helpful_votes: number | null
          id: string
          product_id: string
          rating: number
          reviewer_email: string | null
          reviewer_name: string
          title: string | null
          updated_at: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment: string
          created_at?: string
          helpful_votes?: number | null
          id?: string
          product_id: string
          rating: number
          reviewer_email?: string | null
          reviewer_name: string
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string
          created_at?: string
          helpful_votes?: number | null
          id?: string
          product_id?: string
          rating?: number
          reviewer_email?: string | null
          reviewer_name?: string
          title?: string | null
          updated_at?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          material: string | null
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          material?: string | null
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          material?: string | null
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          article_number: string | null
          barcode: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string
          features: string[] | null
          id: string
          image: string | null
          images: string[] | null
          in_stock: boolean | null
          is_stock_item: boolean | null
          original_price: number | null
          product_brand: string | null
          product_group: string | null
          product_type: string | null
          rating: number | null
          reviews: number | null
          selling_price: number
          slug: string | null
          stock_quantity: number | null
          supplier: string | null
          tags: string[] | null
          tax_rate: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          article_number?: string | null
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description: string
          features?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_stock_item?: boolean | null
          original_price?: number | null
          product_brand?: string | null
          product_group?: string | null
          product_type?: string | null
          rating?: number | null
          reviews?: number | null
          selling_price: number
          slug?: string | null
          stock_quantity?: number | null
          supplier?: string | null
          tags?: string[] | null
          tax_rate?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          article_number?: string | null
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string
          features?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_stock_item?: boolean | null
          original_price?: number | null
          product_brand?: string | null
          product_group?: string | null
          product_type?: string | null
          rating?: number | null
          reviews?: number | null
          selling_price?: number
          slug?: string | null
          stock_quantity?: number | null
          supplier?: string | null
          tags?: string[] | null
          tax_rate?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
          thumbnail_url: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          thumbnail_url?: string | null
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          thumbnail_url?: string | null
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
      project_media_backup_20251018: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          project_id: string | null
          thumbnail_url: string | null
          title: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          project_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      project_media_links: {
        Row: {
          created_at: string | null
          id: string
          media_id: string | null
          project_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          project_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media_id?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_migration_status"
            referencedColumns: ["ml_id"]
          },
          {
            foreignKeyName: "project_media_links_project_id_fkey"
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
          auth_user_id: string | null
          claimed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          expected_impact: string | null
          full_description: string | null
          id: string
          image_path: string | null
          location: string | null
          match_confidence: number | null
          match_criteria: Json | null
          purpose: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          associations?: string[] | null
          auth_user_id?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          expected_impact?: string | null
          full_description?: string | null
          id?: string
          image_path?: string | null
          location?: string | null
          match_confidence?: number | null
          match_criteria?: Json | null
          purpose?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          associations?: string[] | null
          auth_user_id?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          expected_impact?: string | null
          full_description?: string | null
          id?: string
          image_path?: string | null
          location?: string | null
          match_confidence?: number | null
          match_criteria?: Json | null
          purpose?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string | null
          provider_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          provider_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_audit_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_portfolio_items: {
        Row: {
          after_image: string | null
          before_image: string | null
          category: string
          client_name: string | null
          created_at: string
          description: string
          display_order: number | null
          featured: boolean | null
          id: string
          image: string
          images: string[] | null
          project_date: string | null
          project_url: string | null
          project_value: number | null
          provider_id: string
          tags: string[] | null
          testimonial: string | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image?: string | null
          before_image?: string | null
          category: string
          client_name?: string | null
          created_at?: string
          description: string
          display_order?: number | null
          featured?: boolean | null
          id?: string
          image: string
          images?: string[] | null
          project_date?: string | null
          project_url?: string | null
          project_value?: number | null
          provider_id: string
          tags?: string[] | null
          testimonial?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image?: string | null
          before_image?: string | null
          category?: string
          client_name?: string | null
          created_at?: string
          description?: string
          display_order?: number | null
          featured?: boolean | null
          id?: string
          image?: string
          images?: string[] | null
          project_date?: string | null
          project_url?: string | null
          project_value?: number | null
          provider_id?: string
          tags?: string[] | null
          testimonial?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_portfolio_items_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          avatar: string
          awards: string[] | null
          bio: string
          certifications: string[] | null
          completed_projects: number | null
          created_at: string
          email: string
          experience: string
          id: string
          location: string
          name: string
          phone: string
          portfolio_description: string | null
          portfolio_visible: boolean | null
          rating: number
          response_time: string | null
          reviews: number
          slug: string
          specialties: string[] | null
          updated_at: string
          work_philosophy: string | null
          years_in_business: number | null
        }
        Insert: {
          avatar: string
          awards?: string[] | null
          bio: string
          certifications?: string[] | null
          completed_projects?: number | null
          created_at?: string
          email: string
          experience: string
          id?: string
          location: string
          name: string
          phone: string
          portfolio_description?: string | null
          portfolio_visible?: boolean | null
          rating?: number
          response_time?: string | null
          reviews?: number
          slug: string
          specialties?: string[] | null
          updated_at?: string
          work_philosophy?: string | null
          years_in_business?: number | null
        }
        Update: {
          avatar?: string
          awards?: string[] | null
          bio?: string
          certifications?: string[] | null
          completed_projects?: number | null
          created_at?: string
          email?: string
          experience?: string
          id?: string
          location?: string
          name?: string
          phone?: string
          portfolio_description?: string | null
          portfolio_visible?: boolean | null
          rating?: number
          response_time?: string | null
          reviews?: number
          slug?: string
          specialties?: string[] | null
          updated_at?: string
          work_philosophy?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          comment: string
          created_at: string
          customer_email: string | null
          customer_name: string
          date: string
          id: string
          rating: number
          service_id: string
          verified: boolean
        }
        Insert: {
          comment: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          date?: string
          id?: string
          rating: number
          service_id: string
          verified?: boolean
        }
        Update: {
          comment?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          date?: string
          id?: string
          rating?: number
          service_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          available: boolean
          available_times: string[] | null
          category: string
          created_at: string
          description: string
          duration: string
          faqs: Json | null
          features: string[] | null
          id: string
          image: string
          images: string[] | null
          location: string
          provider: string
          provider_id: string | null
          provider_rating: number | null
          rating: number
          response_time: string | null
          reviews: number
          slug: string | null
          starting_price: number
          title: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          available_times?: string[] | null
          category: string
          created_at?: string
          description: string
          duration: string
          faqs?: Json | null
          features?: string[] | null
          id?: string
          image: string
          images?: string[] | null
          location: string
          provider: string
          provider_id?: string | null
          provider_rating?: number | null
          rating?: number
          response_time?: string | null
          reviews?: number
          slug?: string | null
          starting_price: number
          title: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          available_times?: string[] | null
          category?: string
          created_at?: string
          description?: string
          duration?: string
          faqs?: Json | null
          features?: string[] | null
          id?: string
          image?: string
          images?: string[] | null
          location?: string
          provider?: string
          provider_id?: string | null
          provider_rating?: number | null
          rating?: number
          response_time?: string | null
          reviews?: number
          slug?: string | null
          starting_price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_path: string | null
          name: string
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_path?: string | null
          name: string
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
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
          ip_address: unknown
          language_preference: string | null
          location: string | null
          media_approved_at: string | null
          media_converted_at: string | null
          media_status: string | null
          processed_at: string | null
          publication_permission: boolean | null
          session_id: string | null
          status: string
          submitted_by: string | null
          thumbnail_url: string | null
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
          ip_address?: unknown
          language_preference?: string | null
          location?: string | null
          media_approved_at?: string | null
          media_converted_at?: string | null
          media_status?: string | null
          processed_at?: string | null
          publication_permission?: boolean | null
          session_id?: string | null
          status?: string
          submitted_by?: string | null
          thumbnail_url?: string | null
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
          ip_address?: unknown
          language_preference?: string | null
          location?: string | null
          media_approved_at?: string | null
          media_converted_at?: string | null
          media_status?: string | null
          processed_at?: string | null
          publication_permission?: boolean | null
          session_id?: string | null
          status?: string
          submitted_by?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          is_priority: boolean | null
          item_id: string
          item_type: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_priority?: boolean | null
          item_id: string
          item_type: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_priority?: boolean | null
          item_id?: string
          item_type?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          auth_user_id: string
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          customer_id: number | null
          customer_type: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_purchase_date: string | null
          location: string | null
          loyalty_points: number | null
          phone: string | null
          preferences: Json | null
          preferred_contact_method: string | null
          preferred_payment_method: string | null
          updated_at: string | null
          username: string | null
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          auth_user_id: string
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          customer_id?: number | null
          customer_type?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_purchase_date?: string | null
          location?: string | null
          loyalty_points?: number | null
          phone?: string | null
          preferences?: Json | null
          preferred_contact_method?: string | null
          preferred_payment_method?: string | null
          updated_at?: string | null
          username?: string | null
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          auth_user_id?: string
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          customer_id?: number | null
          customer_type?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_purchase_date?: string | null
          location?: string | null
          loyalty_points?: number | null
          phone?: string | null
          preferences?: Json | null
          preferred_contact_method?: string | null
          preferred_payment_method?: string | null
          updated_at?: string | null
          username?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      current_user_is_admin: {
        Row: {
          is_admin: boolean | null
        }
        Relationships: []
      }
      media_migration_status: {
        Row: {
          ml_id: string | null
          ml_project_id: string | null
          pm_id: string | null
          pm_project_id: string | null
          public_url: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_library_project_id_fkey"
            columns: ["ml_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["pm_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_claim_participant: {
        Args: { _participant_id: string; _user_email: string }
        Returns: boolean
      }
      can_edit_participant: {
        Args: { _participant_id: string }
        Returns: boolean
      }
      can_edit_project: { Args: { _project_id: string }; Returns: boolean }
      can_edit_sponsor: { Args: { _sponsor_id: string }; Returns: boolean }
      claim_participant_profile: {
        Args: { _participant_id: string; _user_email: string; _user_id: string }
        Returns: Json
      }
      claim_project_profile: {
        Args: { _project_id: string; _user_email: string; _user_id: string }
        Returns: Json
      }
      clean_media_title: { Args: { filename: string }; Returns: string }
      cleanup_old_drafts: { Args: never; Returns: undefined }
      complete_participant_profile: {
        Args: {
          _auth_user_id: string
          _availability?: string
          _avatar_path?: string
          _bio?: string
          _contributions?: string[]
          _experience_level?: string
          _interests?: string[]
          _skills?: string[]
          _time_commitment?: string
          _token: string
        }
        Returns: {
          message: string
          participant_slug: string
          success: boolean
        }[]
      }
      convert_submission_media_to_library: {
        Args: {
          media_urls: string[]
          submission_id: string
          target_project_id?: string
        }
        Returns: Json
      }
      create_participant_from_submission: {
        Args: { _submission_id: string }
        Returns: {
          message: string
          participant_id: string
          success: boolean
        }[]
      }
      current_user_email: { Args: never; Returns: string }
      generate_session_id: { Args: never; Returns: string }
      generate_slug: { Args: { title: string }; Returns: string }
      get_available_times: {
        Args: { selected_date: string; service_uuid: string }
        Returns: string[]
      }
      get_total_users_count: { Args: never; Returns: number }
      get_unified_admin_dashboard_stats: { Args: never; Returns: Json }
      get_zeppel_admin_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_device_fingerprint: {
        Args: { fingerprint: string }
        Returns: string
      }
      place_bid: {
        Args: { p_amount: number; p_auction_id: string; p_bidder: string }
        Returns: {
          message: string
          new_bidder_count: number
          new_current_bid: number
          success: boolean
        }[]
      }
      set_session_context: {
        Args: { device_fingerprint: string; session_id: string }
        Returns: undefined
      }
      verify_participant_token: {
        Args: { _token: string }
        Returns: {
          participant_email: string
          participant_id: string
          participant_name: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "participant" | "customer" | "moderator"
      auction_category:
        | "electronics"
        | "fashion"
        | "home"
        | "sports"
        | "books"
        | "art"
        | "collectibles"
        | "automotive"
      auction_condition: "new" | "like-new" | "good" | "fair" | "poor"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      communication_status:
        | "sent"
        | "delivered"
        | "read"
        | "responded"
        | "completed"
      communication_type: "message" | "consultation" | "quote"
      order_item_type: "product" | "auction" | "service"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      product_category:
        | "electronics"
        | "clothing"
        | "home"
        | "sports"
        | "books"
        | "beauty"
        | "toys"
        | "automotive"
      service_category:
        | "photography"
        | "design"
        | "consulting"
        | "tutoring"
        | "fitness"
        | "beauty"
        | "home-services"
        | "event-planning"
        | "legal"
        | "accounting"
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
      app_role: ["admin", "participant", "customer", "moderator"],
      auction_category: [
        "electronics",
        "fashion",
        "home",
        "sports",
        "books",
        "art",
        "collectibles",
        "automotive",
      ],
      auction_condition: ["new", "like-new", "good", "fair", "poor"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      communication_status: [
        "sent",
        "delivered",
        "read",
        "responded",
        "completed",
      ],
      communication_type: ["message", "consultation", "quote"],
      order_item_type: ["product", "auction", "service"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      product_category: [
        "electronics",
        "clothing",
        "home",
        "sports",
        "books",
        "beauty",
        "toys",
        "automotive",
      ],
      service_category: [
        "photography",
        "design",
        "consulting",
        "tutoring",
        "fitness",
        "beauty",
        "home-services",
        "event-planning",
        "legal",
        "accounting",
      ],
    },
  },
} as const
