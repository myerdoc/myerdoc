export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      allergies: {
        Row: {
          id: string
          person_id: string
          allergen: string
          reaction: string | null
          severity: string | null
          source: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          allergen: string
          reaction?: string | null
          severity?: string | null
          source: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          allergen?: string
          reaction?: string | null
          severity?: string | null
          source?: string
          active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          clinician_id: string | null
          patient_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          details: Json | null
          created_at: string | null
          user_email: string | null
          session_id: string | null
          access_outcome: string | null
          phi_accessed: boolean | null
          access_method: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          clinician_id?: string | null
          patient_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string | null
          user_email?: string | null
          session_id?: string | null
          access_outcome?: string | null
          phi_accessed?: boolean | null
          access_method?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          clinician_id?: string | null
          patient_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string | null
          user_email?: string | null
          session_id?: string | null
          access_outcome?: string | null
          phi_accessed?: boolean | null
          access_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      clinicians: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          credentials: string | null
          license_number: string | null
          license_state: string | null
          specialty: string | null
          phone: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
          password_changed_at: string | null
          account_locked: boolean | null
          failed_login_attempts: number | null
          lockout_until: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          credentials?: string | null
          license_number?: string | null
          license_state?: string | null
          specialty?: string | null
          phone?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          password_changed_at?: string | null
          account_locked?: boolean | null
          failed_login_attempts?: number | null
          lockout_until?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          credentials?: string | null
          license_number?: string | null
          license_state?: string | null
          specialty?: string | null
          phone?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          password_changed_at?: string | null
          account_locked?: boolean | null
          failed_login_attempts?: number | null
          lockout_until?: string | null
        }
        Relationships: []
      }
      consultation_addendums: {
        Row: {
          id: string
          consultation_id: string
          clinician_id: string
          addendum_text: string
          addendum_type: string | null
          reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          consultation_id: string
          clinician_id: string
          addendum_text: string
          addendum_type?: string | null
          reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string
          clinician_id?: string
          addendum_text?: string
          addendum_type?: string | null
          reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_addendums_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_addendums_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      consultation_requests: {
        Row: {
          id: string
          membership_id: string
          person_id: string
          chief_complaint: string
          symptoms: string | null
          symptom_duration: string | null
          urgency_level: string | null
          preferred_contact_method: string | null
          callback_phone: string | null
          status: string | null
          assigned_physician_id: string | null
          physician_notes: string | null
          created_at: string | null
          updated_at: string | null
          started_at: string | null
          completed_at: string | null
          patient_age: number | null
          patient_location_state: string | null
          symptom_category: string | null
          symptom_onset: string | null
          symptom_severity: string | null
          red_flags_general: string[] | null
          red_flags_pediatric: string[] | null
          red_flags_mental_health: string[] | null
          red_flag_triggered: boolean | null
          recent_changes: string[] | null
          recent_changes_notes: string | null
          consultation_goals: string[] | null
          available_in: string | null
          emergency_acknowledgement: boolean | null
          diagnosis: string | null
          summary_url: string | null
          clinical_summary: string | null
          treatment_plan: string | null
          reviewed_at: string | null
          vitals_data: Json | null
          clinician_id: string | null
        }
        Insert: {
          id?: string
          membership_id: string
          person_id: string
          chief_complaint: string
          symptoms?: string | null
          symptom_duration?: string | null
          urgency_level?: string | null
          preferred_contact_method?: string | null
          callback_phone?: string | null
          status?: string | null
          assigned_physician_id?: string | null
          physician_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          patient_age?: number | null
          patient_location_state?: string | null
          symptom_category?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          red_flags_general?: string[] | null
          red_flags_pediatric?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flag_triggered?: boolean | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          consultation_goals?: string[] | null
          available_in?: string | null
          emergency_acknowledgement?: boolean | null
          diagnosis?: string | null
          summary_url?: string | null
          clinical_summary?: string | null
          treatment_plan?: string | null
          reviewed_at?: string | null
          vitals_data?: Json | null
          clinician_id?: string | null
        }
        Update: {
          id?: string
          membership_id?: string
          person_id?: string
          chief_complaint?: string
          symptoms?: string | null
          symptom_duration?: string | null
          urgency_level?: string | null
          preferred_contact_method?: string | null
          callback_phone?: string | null
          status?: string | null
          assigned_physician_id?: string | null
          physician_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          patient_age?: number | null
          patient_location_state?: string | null
          symptom_category?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          red_flags_general?: string[] | null
          red_flags_pediatric?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flag_triggered?: boolean | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          consultation_goals?: string[] | null
          available_in?: string | null
          emergency_acknowledgement?: boolean | null
          diagnosis?: string | null
          summary_url?: string | null
          clinical_summary?: string | null
          treatment_plan?: string | null
          reviewed_at?: string | null
          vitals_data?: Json | null
          clinician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      emergency_contacts: {
        Row: {
          id: string
          membership_id: string
          person_id: string
          name: string
          relationship: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          membership_id: string
          person_id: string
          name: string
          relationship: string
          phone: string
          created_at?: string
        }
        Update: {
          id?: string
          membership_id?: string
          person_id?: string
          name?: string
          relationship?: string
          phone?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_contacts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      intake_responses: {
        Row: {
          id: string
          intake_submission_id: string
          question_key: string
          response_value: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intake_submission_id: string
          question_key: string
          response_value?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intake_submission_id?: string
          question_key?: string
          response_value?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_responses_intake_submission_id_fkey"
            columns: ["intake_submission_id"]
            isOneToOne: false
            referencedRelation: "intake_submissions"
            referencedColumns: ["id"]
          }
        ]
      }
      intake_submissions: {
        Row: {
          id: string
          person_id: string
          membership_id: string
          status: string
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          membership_id: string
          status?: string
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          membership_id?: string
          status?: string
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      medical_conditions: {
        Row: {
          id: string
          person_id: string
          condition_name: string
          diagnosed_date: string | null
          status: string
          notes: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          condition_name: string
          diagnosed_date?: string | null
          status?: string
          notes?: string | null
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          condition_name?: string
          diagnosed_date?: string | null
          status?: string
          notes?: string | null
          source?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_conditions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      medications: {
        Row: {
          id: string
          person_id: string
          medication_name: string
          dosage: string | null
          frequency: string | null
          prescribing_doctor: string | null
          start_date: string | null
          end_date: string | null
          active: boolean
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          medication_name: string
          dosage?: string | null
          frequency?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          end_date?: string | null
          active?: boolean
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          medication_name?: string
          dosage?: string | null
          frequency?: string | null
          prescribing_doctor?: string | null
          start_date?: string | null
          end_date?: string | null
          active?: boolean
          source?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          onboarding_step: string
          vitals_kit_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          onboarding_step?: string
          vitals_kit_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          onboarding_step?: string
          vitals_kit_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          id: string
          membership_id: string
          first_name: string
          last_name: string
          preferred_name: string | null
          date_of_birth: string
          relationship: string
          email: string | null
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          sex: string | null
          gender_identity: string | null
          pronouns: string | null
          blood_type: string | null
          height_inches: number | null
          weight_lbs: number | null
          primary_care_physician: string | null
          pharmacy_name: string | null
          pharmacy_phone: string | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          intake_complete: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          membership_id: string
          first_name: string
          last_name: string
          preferred_name?: string | null
          date_of_birth: string
          relationship: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          sex?: string | null
          gender_identity?: string | null
          pronouns?: string | null
          blood_type?: string | null
          height_inches?: number | null
          weight_lbs?: number | null
          primary_care_physician?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          intake_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          membership_id?: string
          first_name?: string
          last_name?: string
          preferred_name?: string | null
          date_of_birth?: string
          relationship?: string
          email?: string | null
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          sex?: string | null
          gender_identity?: string | null
          pronouns?: string | null
          blood_type?: string | null
          height_inches?: number | null
          weight_lbs?: number | null
          primary_care_physician?: string | null
          pharmacy_name?: string | null
          pharmacy_phone?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          intake_complete?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          }
        ]
      }
      prescriptions: {
        Row: {
          id: string
          consultation_request_id: string
          patient_id: string
          clinician_id: string
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          quantity: number
          refills: number
          instructions: string | null
          status: string
          prescribed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          consultation_request_id: string
          patient_id: string
          clinician_id: string
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          quantity: number
          refills?: number
          instructions?: string | null
          status?: string
          prescribed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          consultation_request_id?: string
          patient_id?: string
          clinician_id?: string
          medication_name?: string
          dosage?: string
          frequency?: string
          duration?: string
          quantity?: number
          refills?: number
          instructions?: string | null
          status?: string
          prescribed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_request_id_fkey"
            columns: ["consultation_request_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      surgical_history: {
        Row: {
          id: string
          person_id: string
          procedure_name: string
          procedure_date: string | null
          hospital: string | null
          surgeon: string | null
          notes: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          procedure_name: string
          procedure_date?: string | null
          hospital?: string | null
          surgeon?: string | null
          notes?: string | null
          source: string
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          procedure_name?: string
          procedure_date?: string | null
          hospital?: string | null
          surgeon?: string | null
          notes?: string | null
          source?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgical_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      clinician_dashboard_stats: {
        Row: {
          clinician_id: string | null
          first_name: string | null
          last_name: string | null
          pending_consultations: number | null
          in_progress_consultations: number | null
          completed_today: number | null
          total_consultations: number | null
        }
        Relationships: []
      }
      consultation_queue: {
        Row: {
          id: string | null
          status: string | null
          created_at: string | null
          urgency_level: string | null
          patient_name: string | null
          patient_id: string | null
          date_of_birth: string | null
          age: number | null
          chief_complaint: string | null
          symptoms: string | null
          symptom_severity: string | null
          red_flag_triggered: boolean | null
          assigned_physician_id: string | null
          clinician_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_patient_id?: string
          p_details?: Json
          p_phi_accessed?: boolean
          p_access_method?: string
        }
        Returns: string
      }
      archive_old_consultations: {
        Args: {}
        Returns: number
      }
      archive_old_audit_logs: {
        Args: {}
        Returns: number
      }
      upsert_self_person: {
        Args: {
          p_membership_id: string
          p_first_name: string
          p_last_name: string
          p_date_of_birth: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
