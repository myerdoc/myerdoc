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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "allergies_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_audit_logs: {
        Row: {
          access_method: string | null
          access_outcome: string | null
          action: string
          archived_at: string | null
          clinician_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          patient_id: string | null
          phi_accessed: boolean | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          access_method?: string | null
          access_outcome?: string | null
          action: string
          archived_at?: string | null
          clinician_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          access_method?: string | null
          access_outcome?: string | null
          action?: string
          archived_at?: string | null
          clinician_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      archived_consultation_requests: {
        Row: {
          archived_at: string | null
          assigned_physician_id: string | null
          available_in: string | null
          callback_phone: string | null
          chief_complaint: string
          clinical_summary: string | null
          clinician_id: string | null
          completed_at: string | null
          consultation_goals: string[] | null
          created_at: string | null
          diagnosis: string | null
          emergency_acknowledgement: boolean | null
          id: string
          membership_id: string
          patient_age: number | null
          patient_location_state: string | null
          person_id: string
          physician_notes: string | null
          preferred_contact_method: string | null
          recent_changes: string[] | null
          recent_changes_notes: string | null
          red_flag_triggered: boolean | null
          red_flags_general: string[] | null
          red_flags_mental_health: string[] | null
          red_flags_pediatric: string[] | null
          reviewed_at: string | null
          started_at: string | null
          status: string | null
          summary_url: string | null
          symptom_category: string | null
          symptom_duration: string | null
          symptom_onset: string | null
          symptom_severity: string | null
          symptoms: string | null
          treatment_plan: string | null
          updated_at: string | null
          urgency_level: string | null
          vitals_data: Json | null
        }
        Insert: {
          archived_at?: string | null
          assigned_physician_id?: string | null
          available_in?: string | null
          callback_phone?: string | null
          chief_complaint: string
          clinical_summary?: string | null
          clinician_id?: string | null
          completed_at?: string | null
          consultation_goals?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          emergency_acknowledgement?: boolean | null
          id?: string
          membership_id: string
          patient_age?: number | null
          patient_location_state?: string | null
          person_id: string
          physician_notes?: string | null
          preferred_contact_method?: string | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          red_flag_triggered?: boolean | null
          red_flags_general?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flags_pediatric?: string[] | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: string | null
          summary_url?: string | null
          symptom_category?: string | null
          symptom_duration?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          vitals_data?: Json | null
        }
        Update: {
          archived_at?: string | null
          assigned_physician_id?: string | null
          available_in?: string | null
          callback_phone?: string | null
          chief_complaint?: string
          clinical_summary?: string | null
          clinician_id?: string | null
          completed_at?: string | null
          consultation_goals?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          emergency_acknowledgement?: boolean | null
          id?: string
          membership_id?: string
          patient_age?: number | null
          patient_location_state?: string | null
          person_id?: string
          physician_notes?: string | null
          preferred_contact_method?: string | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          red_flag_triggered?: boolean | null
          red_flags_general?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flags_pediatric?: string[] | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: string | null
          summary_url?: string | null
          symptom_category?: string | null
          symptom_duration?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          vitals_data?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          access_method: string | null
          access_outcome: string | null
          action: string
          clinician_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          patient_id: string | null
          phi_accessed: boolean | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          access_method?: string | null
          access_outcome?: string | null
          action: string
          clinician_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          access_method?: string | null
          access_outcome?: string | null
          action?: string
          clinician_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          patient_id?: string | null
          phi_accessed?: boolean | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "audit_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicians: {
        Row: {
          account_locked: boolean | null
          created_at: string | null
          credentials: string | null
          failed_login_attempts: number | null
          first_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string
          license_number: string | null
          license_state: string | null
          lockout_until: string | null
          password_changed_at: string | null
          phone: string | null
          specialty: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_locked?: boolean | null
          created_at?: string | null
          credentials?: string | null
          failed_login_attempts?: number | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name: string
          license_number?: string | null
          license_state?: string | null
          lockout_until?: string | null
          password_changed_at?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_locked?: boolean | null
          created_at?: string | null
          credentials?: string | null
          failed_login_attempts?: number | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string
          license_number?: string | null
          license_state?: string | null
          lockout_until?: string | null
          password_changed_at?: string | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      consultation_addendums: {
        Row: {
          addendum_text: string
          addendum_type: string | null
          clinician_id: string
          consultation_id: string
          created_at: string | null
          id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          addendum_text: string
          addendum_type?: string | null
          clinician_id: string
          consultation_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          addendum_text?: string
          addendum_type?: string | null
          clinician_id?: string
          consultation_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_addendums_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "consultation_addendums_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_addendums_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_addendums_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_addendums_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          assigned_physician_id: string | null
          available_in: string | null
          callback_phone: string | null
          chief_complaint: string
          clinical_summary: string | null
          clinician_id: string | null
          completed_at: string | null
          consultation_goals: string[] | null
          created_at: string | null
          diagnosis: string | null
          emergency_acknowledgement: boolean | null
          id: string
          membership_id: string
          patient_age: number | null
          patient_location_state: string | null
          person_id: string
          physician_notes: string | null
          preferred_contact_method: string | null
          recent_changes: string[] | null
          recent_changes_notes: string | null
          red_flag_triggered: boolean | null
          red_flags_general: string[] | null
          red_flags_mental_health: string[] | null
          red_flags_pediatric: string[] | null
          reviewed_at: string | null
          started_at: string | null
          status: string | null
          summary_url: string | null
          symptom_category: string | null
          symptom_duration: string | null
          symptom_onset: string | null
          symptom_severity: string | null
          symptoms: string | null
          treatment_plan: string | null
          updated_at: string | null
          urgency_level: string | null
          vitals_data: Json | null
        }
        Insert: {
          assigned_physician_id?: string | null
          available_in?: string | null
          callback_phone?: string | null
          chief_complaint: string
          clinical_summary?: string | null
          clinician_id?: string | null
          completed_at?: string | null
          consultation_goals?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          emergency_acknowledgement?: boolean | null
          id?: string
          membership_id: string
          patient_age?: number | null
          patient_location_state?: string | null
          person_id: string
          physician_notes?: string | null
          preferred_contact_method?: string | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          red_flag_triggered?: boolean | null
          red_flags_general?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flags_pediatric?: string[] | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: string | null
          summary_url?: string | null
          symptom_category?: string | null
          symptom_duration?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          vitals_data?: Json | null
        }
        Update: {
          assigned_physician_id?: string | null
          available_in?: string | null
          callback_phone?: string | null
          chief_complaint?: string
          clinical_summary?: string | null
          clinician_id?: string | null
          completed_at?: string | null
          consultation_goals?: string[] | null
          created_at?: string | null
          diagnosis?: string | null
          emergency_acknowledgement?: boolean | null
          id?: string
          membership_id?: string
          patient_age?: number | null
          patient_location_state?: string | null
          person_id?: string
          physician_notes?: string | null
          preferred_contact_method?: string | null
          recent_changes?: string[] | null
          recent_changes_notes?: string | null
          red_flag_triggered?: boolean | null
          red_flags_general?: string[] | null
          red_flags_mental_health?: string[] | null
          red_flags_pediatric?: string[] | null
          reviewed_at?: string | null
          started_at?: string | null
          status?: string | null
          summary_url?: string | null
          symptom_category?: string | null
          symptom_duration?: string | null
          symptom_onset?: string | null
          symptom_severity?: string | null
          symptoms?: string | null
          treatment_plan?: string | null
          updated_at?: string | null
          urgency_level?: string | null
          vitals_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "consultation_requests_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "consultation_requests_person_id_fkey"
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
          person_id: string
          phone: string
          relationship: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          membership_id: string
          name: string
          notes?: string | null
          person_id: string
          phone: string
          relationship: string
        }
        Update: {
          created_at?: string | null
          id?: string
          membership_id?: string
          name?: string
          notes?: string | null
          person_id?: string
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
          {
            foreignKeyName: "emergency_contacts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "emergency_contacts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_requests: {
        Row: {
          concern: string | null
          consent: boolean
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          status: string
          type: string
        }
        Insert: {
          concern?: string | null
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string
          type?: string
        }
        Update: {
          concern?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          type?: string
        }
        Relationships: []
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
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
          blood_type: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string
          email: string | null
          first_name: string
          height: number | null
          id: string
          intake_complete: boolean | null
          last_name: string
          membership_id: string
          middle_name: string | null
          phone: string | null
          postal_code: string | null
          preferred_name: string | null
          pregnancy_status: string | null
          relationship: string
          sex_at_birth: string | null
          state: string | null
          weight: number | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          first_name: string
          height?: number | null
          id?: string
          intake_complete?: boolean | null
          last_name: string
          membership_id: string
          middle_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          pregnancy_status?: string | null
          relationship?: string
          sex_at_birth?: string | null
          state?: string | null
          weight?: number | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          first_name?: string
          height?: number | null
          id?: string
          intake_complete?: boolean | null
          last_name?: string
          membership_id?: string
          middle_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          pregnancy_status?: string | null
          relationship?: string
          sex_at_birth?: string | null
          state?: string | null
          weight?: number | null
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
      physician_schedules: {
        Row: {
          clinician_id: string
          created_at: string
          id: string
          is_active: boolean | null
          notes: string | null
          schedule_date: string
          shift_end: string
          shift_start: string
          updated_at: string
        }
        Insert: {
          clinician_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          schedule_date: string
          shift_end?: string
          shift_start?: string
          updated_at?: string
        }
        Update: {
          clinician_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          schedule_date?: string
          shift_end?: string
          shift_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "physician_schedules_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "physician_schedules_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physician_schedules_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          clinician_id: string | null
          consultation_request_id: string | null
          created_at: string | null
          dosage: string
          duration: string | null
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string | null
          prescribed_at: string | null
        }
        Insert: {
          clinician_id?: string | null
          consultation_request_id?: string | null
          created_at?: string | null
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id?: string | null
          prescribed_at?: string | null
        }
        Update: {
          clinician_id?: string | null
          consultation_request_id?: string | null
          created_at?: string | null
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string | null
          prescribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "prescriptions_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_request_id_fkey"
            columns: ["consultation_request_id"]
            isOneToOne: false
            referencedRelation: "consultation_queue"
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "people"
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
            referencedRelation: "consultation_queue"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "surgical_history_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      access_denied_monitor: {
        Row: {
          action: string | null
          denial_count: number | null
          denial_date: string | null
          last_denial: string | null
          resource_type: string | null
          user_email: string | null
        }
        Relationships: []
      }
      clinician_dashboard_stats: {
        Row: {
          clinician_id: string | null
          completed_today: number | null
          first_name: string | null
          in_progress_consultations: number | null
          last_name: string | null
          pending_consultations: number | null
          total_consultations: number | null
        }
        Relationships: []
      }
      consultation_queue: {
        Row: {
          age: number | null
          assigned_physician_id: string | null
          chief_complaint: string | null
          clinician_name: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          red_flag_triggered: boolean | null
          status: string | null
          symptom_severity: string | null
          symptoms: string | null
          urgency_level: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_requests_assigned_physician_id_fkey"
            columns: ["assigned_physician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
        ]
      }
      locked_accounts_monitor: {
        Row: {
          account_locked: boolean | null
          failed_login_attempts: number | null
          first_name: string | null
          id: string | null
          last_login_at: string | null
          last_name: string | null
          lockout_until: string | null
          user_id: string | null
        }
        Insert: {
          account_locked?: boolean | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string | null
          last_login_at?: string | null
          last_name?: string | null
          lockout_until?: string | null
          user_id?: string | null
        }
        Update: {
          account_locked?: boolean | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string | null
          last_login_at?: string | null
          last_name?: string | null
          lockout_until?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      phi_access_monitor: {
        Row: {
          access_count: number | null
          access_date: string | null
          clinician_id: string | null
          last_access: string | null
          unique_patients: number | null
          user_email: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinician_dashboard_stats"
            referencedColumns: ["clinician_id"]
          },
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "clinicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "locked_accounts_monitor"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      archive_old_audit_logs: { Args: never; Returns: undefined }
      archive_old_consultations: { Args: never; Returns: undefined }
      create_audit_log:
        | {
            Args: {
              p_action: string
              p_details: Json
              p_patient_id: string
              p_resource_id: string
              p_resource_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_access_method: string
              p_action: string
              p_details: Json
              p_patient_id: string
              p_phi_accessed: boolean
              p_resource_id: string
              p_resource_type: string
            }
            Returns: string
          }
        | {
            Args: {
              p_access_outcome: string
              p_action: string
              p_changes: Json
              p_clinician_id: string
              p_patient_id: string
              p_phi_accessed: boolean
              p_resource_id: string
              p_resource_type: string
              p_user_email: string
              p_user_id: string
            }
            Returns: string
          }
      get_current_on_call_clinician: {
        Args: never
        Returns: {
          clinician_id: string
          clinician_name: string
          shift_end: string
          shift_start: string
        }[]
      }
      get_on_call_clinician_at_time: {
        Args: { p_check_time: string }
        Returns: {
          clinician_id: string
          clinician_name: string
          shift_end: string
          shift_start: string
        }[]
      }
      get_user_membership_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_clinician: { Args: never; Returns: boolean }
      is_clinician_on_call: {
        Args: { p_check_time?: string; p_clinician_id: string }
        Returns: boolean
      }
      log_access_denied: {
        Args: {
          p_action: string
          p_reason: string
          p_resource_id: string
          p_resource_type: string
        }
        Returns: undefined
      }
      upsert_self_person:
        | {
            Args: {
              p_date_of_birth: string
              p_first_name: string
              p_last_name: string
              p_membership_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_address_line1: string
              p_address_line2: string
              p_city: string
              p_date_of_birth: string
              p_first_name: string
              p_last_name: string
              p_membership_id: string
              p_phone: string
              p_postal_code: string
              p_preferred_name: string
              p_sex_at_birth: string
              p_state: string
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
