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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allergies: {
        Row: {
          active: boolean
          allergen: string
          created_at: string
          id: string
          person_id: string
          reaction: string | null
          severity: string | null
          source: string
        }
        Insert: {
          active?: boolean
          allergen: string
          created_at?: string
          id?: string
          person_id: string
          reaction?: string | null
          severity?: string | null
          source: string
        }
        Update: {
          active?: boolean
          allergen?: string
          created_at?: string
          id?: string
          person_id?: string
          reaction?: string | null
          severity?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          membership_id: string
          name: string
          notes: string | null
          phone: string
          relationship: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          membership_id: string
          name: string
          notes?: string | null
          phone: string
          relationship: string
        }
        Update: {
          created_at?: string | null
          id?: string
          membership_id?: string
          name?: string
          notes?: string | null
          phone?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_responses: {
        Row: {
          created_at: string | null
          id: string
          intake_submission_id: string
          question_key: string
          value_json: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          intake_submission_id: string
          question_key: string
          value_json: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          intake_submission_id?: string
          question_key?: string
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "intake_responses_intake_submission_id_fkey"
            columns: ["intake_submission_id"]
            isOneToOne: false
            referencedRelation: "intake_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_submissions: {
        Row: {
          attestation_accepted: boolean
          id: string
          intake_complete: boolean
          location_state: string
          membership_id: string | null
          person_id: string
          red_flag_positive: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
        }
        Insert: {
          attestation_accepted: boolean
          id?: string
          intake_complete?: boolean
          location_state: string
          membership_id?: string | null
          person_id: string
          red_flag_positive?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
        }
        Update: {
          attestation_accepted?: boolean
          id?: string
          intake_complete?: boolean
          location_state?: string
          membership_id?: string | null
          person_id?: string
          red_flag_positive?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_submissions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_submissions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_conditions: {
        Row: {
          active: boolean
          condition_code: string | null
          condition_label: string
          created_at: string
          id: string
          person_id: string
          resolved_at: string | null
          source: string
        }
        Insert: {
          active?: boolean
          condition_code?: string | null
          condition_label: string
          created_at?: string
          id?: string
          person_id: string
          resolved_at?: string | null
          source: string
        }
        Update: {
          active?: boolean
          condition_code?: string | null
          condition_label?: string
          created_at?: string
          id?: string
          person_id?: string
          resolved_at?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dose: string | null
          frequency: string | null
          id: string
          medication_name: string
          person_id: string
          route: string | null
          source: string
          stopped_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          dose?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          person_id: string
          route?: string | null
          source: string
          stopped_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          dose?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          person_id?: string
          route?: string | null
          source?: string
          stopped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          approved_at: string | null
          created_at: string | null
          id: string
          onboarding_step: string | null
          plan_type: string
          status: string
          user_id: string
          vitals_kit_status: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          onboarding_step?: string | null
          plan_type: string
          status?: string
          user_id: string
          vitals_kit_status?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          id?: string
          onboarding_step?: string | null
          plan_type?: string
          status?: string
          user_id?: string
          vitals_kit_status?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string
          first_name: string
          id: string
          last_name: string
          membership_id: string
          middle_name: string | null
          phone: string | null
          postal_code: string | null
          preferred_name: string | null
          relationship: string
          sex_at_birth: string | null
          state: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth: string
          first_name: string
          id?: string
          last_name: string
          membership_id: string
          middle_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          relationship?: string
          sex_at_birth?: string | null
          state?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string
          first_name?: string
          id?: string
          last_name?: string
          membership_id?: string
          middle_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          relationship?: string
          sex_at_birth?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      surgical_history: {
        Row: {
          approximate_date: string | null
          created_at: string
          id: string
          notes: string | null
          person_id: string
          procedure: string
          source: string
        }
        Insert: {
          approximate_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          person_id: string
          procedure: string
          source: string
        }
        Update: {
          approximate_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          person_id?: string
          procedure?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgical_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_self_person: {
        Args: {
          p_date_of_birth: string
          p_first_name: string
          p_last_name: string
          p_membership_id: string
        }
        Returns: string
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
