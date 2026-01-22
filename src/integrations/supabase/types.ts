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
      admin_actions: {
        Row: {
          action_details: Json | null
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_detailed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_filter_presets: {
        Row: {
          admin_user_id: string
          created_at: string | null
          filters: Json
          id: string
          preset_name: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          filters: Json
          id?: string
          preset_name: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          filters?: Json
          id?: string
          preset_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_filter_presets_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_filter_presets_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_detailed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_filter_presets_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_activity_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      funnel_stage_colors: {
        Row: {
          created_at: string
          header_color: string
          id: string
          stage_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          header_color?: string
          id?: string
          stage_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          header_color?: string
          id?: string
          stage_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_tags: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      student_activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          details: Json | null
          id: string
          performed_by: string | null
          student_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          student_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_courses: {
        Row: {
          completion_date: string | null
          course_name: string
          created_at: string
          created_by: string | null
          edition: string | null
          enrollment_date: string | null
          id: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          course_name: string
          created_at?: string
          created_by?: string | null
          edition?: string | null
          enrollment_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          course_name?: string
          created_at?: string
          created_by?: string | null
          edition?: string | null
          enrollment_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notes: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          student_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          student_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          course: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          deal_currency: string | null
          deal_value: number | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          emails: Json | null
          enrollment_date: string | null
          expected_close_date: string | null
          funnel_stage: string | null
          id: string
          is_sc_client: boolean | null
          lead_source: string | null
          name: string
          notes: string | null
          phone: string | null
          phones: Json | null
          state: string | null
          status: string
          student_code: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          course?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deal_currency?: string | null
          deal_value?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          emails?: Json | null
          enrollment_date?: string | null
          expected_close_date?: string | null
          funnel_stage?: string | null
          id?: string
          is_sc_client?: boolean | null
          lead_source?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          phones?: Json | null
          state?: string | null
          status?: string
          student_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          course?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deal_currency?: string | null
          deal_value?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          emails?: Json | null
          enrollment_date?: string | null
          expected_close_date?: string | null
          funnel_stage?: string | null
          id?: string
          is_sc_client?: boolean | null
          lead_source?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          phones?: Json | null
          state?: string | null
          status?: string
          student_code?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      user_access_logs: {
        Row: {
          access_type: Database["public"]["Enums"]["access_type"]
          accessed_at: string
          id: string
          page_route: string | null
          user_id: string
        }
        Insert: {
          access_type: Database["public"]["Enums"]["access_type"]
          accessed_at?: string
          id?: string
          page_route?: string | null
          user_id: string
        }
        Update: {
          access_type?: Database["public"]["Enums"]["access_type"]
          accessed_at?: string
          id?: string
          page_route?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_metrics: {
        Row: {
          active_today: number | null
          last_activity: string | null
          total_logins: number | null
          total_users: number | null
        }
        Relationships: []
      }
      daily_access_stats: {
        Row: {
          access_date: string | null
          logins: number | null
          page_views: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      user_activity_detailed: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_login: string | null
          name: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          total_logins: number | null
          total_page_views: number | null
        }
        Relationships: []
      }
      user_activity_summary: {
        Row: {
          email: string | null
          last_login: string | null
          name: string | null
          total_logins: number | null
          total_page_views: number | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_login_count: {
        Row: {
          last_login: string | null
          total_logins: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_page_views: {
        Row: {
          last_viewed: string | null
          page_route: string | null
          user_id: string | null
          view_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user: { Args: { user_id: string }; Returns: undefined }
      get_admin_dashboard_metrics: {
        Args: never
        Returns: {
          active_today: number
          last_activity: string
          total_logins: number
          total_users: number
        }[]
      }
      get_daily_access_stats: {
        Args: never
        Returns: {
          access_date: string
          logins: number
          page_views: number
          unique_users: number
        }[]
      }
      get_paginated_users: {
        Args: {
          filters?: Json
          page_number?: number
          page_size?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: Json
      }
      get_user_activity_detailed: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_login: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          total_logins: number
          total_page_views: number
        }[]
      }
      get_user_activity_summary: {
        Args: never
        Returns: {
          email: string
          last_login: string
          name: string
          total_logins: number
          total_page_views: number
          user_created_at: string
          user_id: string
        }[]
      }
      get_user_login_count: {
        Args: never
        Returns: {
          last_login: string
          total_logins: number
          user_id: string
        }[]
      }
      get_user_page_views: {
        Args: never
        Returns: {
          last_viewed: string
          page_route: string
          user_id: string
          view_count: number
        }[]
      }
      has_full_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action_details?: Json
          p_action_type: Database["public"]["Enums"]["admin_action_type"]
          p_ip_address?: string
          p_target_user_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      access_type: "login" | "page_view"
      admin_action_type:
        | "role_change"
        | "user_delete"
        | "user_suspend"
        | "user_reactivate"
        | "config_change"
        | "export_data"
      app_role: "admin" | "user" | "viewer"
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
      access_type: ["login", "page_view"],
      admin_action_type: [
        "role_change",
        "user_delete",
        "user_suspend",
        "user_reactivate",
        "config_change",
        "export_data",
      ],
      app_role: ["admin", "user", "viewer"],
    },
  },
} as const
