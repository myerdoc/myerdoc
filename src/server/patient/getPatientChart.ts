'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditServer } from '@/lib/utils/auditLogServer';

export interface PatientChartData {
  person: {
    id: string;
    first_name: string;
    last_name: string;
    preferred_name?: string;
    date_of_birth: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    profile_photo_url: string | null;
    created_at: string | null;
  };
  membership: {
    id: string;
    status: string;
    plan_type: string | null;
    created_at: string | null;
  } | null;
  medicalHistory: {
    conditions: Array<{
      id: string;
      condition_name: string;
      diagnosed_date: string | null;
      notes: string | null;
    }>;
    surgeries: Array<{
      id: string;
      surgery_name: string;
      surgery_date: string | null;
      notes: string | null;
    }>;
    medications: Array<{
      id: string;
      medication_name: string;
      dosage: string | null;
      frequency: string | null;
      notes: string | null;
    }>;
    allergies: Array<{
      id: string;
      allergen: string;
      severity: string | null;
      reaction: string | null;
    }>;
    bloodType: string | null;
    height: number | null;
    weight: number | null;
  };
  emergencyContacts: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    is_primary: boolean;
  }>;
  consultations: Array<{
    id: string;
    created_at: string;
    status: string;
    chief_complaint: string;
    diagnosis: string | null;
    notes: string | null;
    clinician_name: string | null;
    treatment_plan: string | null;
  }>;
  familyMembers: Array<{
    id: string;
    first_name: string;
    last_name: string;
    relationship: string;
    date_of_birth: string;
  }>;
  auditTrail: Array<{
    id: string;
    timestamp: string;
    action: string;
    user_email: string | null;
    user_role: string | null;
    details: string | null;
  }>;
}

export async function getPatientChart(
  personId: string
): Promise<{ data: PatientChartData | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Verify clinician access (check clinicians table)
    const { data: clinician } = await (supabase as any)
      .from('clinicians')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!clinician) {
      return { data: null, error: 'Access denied: Clinician access required' };
    }

    // Log audit trail for accessing patient chart (optional - fails gracefully)
    try {
      await logAuditServer(
        'VIEW_PATIENT_CHART',
        'person',
        personId,
        personId,
        { action: 'Clinician accessed full patient chart' }
      );
    } catch (auditError) {
      // Log error but don't block the request
      console.error('Audit log error:', auditError);
    }

    // Fetch person details
const { data: person, error: personError } = await (supabase as any)
  .from('people')
  .select('*')
  .eq('id', personId)
  .single();
  
    if (personError || !person) {
      console.error('Person fetch error:', personError);
      return { data: null, error: 'Patient not found' };
    }

    // Fetch membership info
    const { data: membership } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', person.membership_id)
      .single();

    // Fetch medical conditions (active only)
    const { data: conditions } = await supabase
      .from('medical_conditions')
      .select('*')
      .eq('person_id', personId)
      .eq('active', true)
      .order('created_at', { ascending: false });

    // Fetch surgical history
    const { data: surgeries } = await supabase
      .from('surgical_history')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    // Fetch medications
    const { data: medications } = await supabase
      .from('medications')
      .select('*')
      .eq('person_id', personId);

    // Fetch allergies
    const { data: allergies } = await supabase
      .from('allergies')
      .select('*')
      .eq('person_id', personId);

    // Fetch emergency contacts (person-specific)
    const { data: emergencyContacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    // Fetch consultations (removed 'notes' field which doesn't exist)
    const { data: consultations } = await (supabase as any)
      .from('consultation_requests')
      .select(`
        id,
        created_at,
        status,
        chief_complaint,
        diagnosis,
        treatment_plan,
        assigned_physician_id
      `)
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    // Add clinician names to consultations
    const consultationsWithClinician = await Promise.all(
      (consultations || []).map(async (consultation: any) => {
        if (consultation.assigned_physician_id) {
          const { data: clinicianData } = await (supabase as any)
            .from('clinicians')
            .select('first_name, last_name, credentials')
            .eq('id', consultation.assigned_physician_id)
            .single();

          return {
            ...consultation,
            notes: null, // Add notes as null since it doesn't exist in the table
            clinician_name: clinicianData
              ? `${clinicianData.first_name} ${clinicianData.last_name}, ${clinicianData.credentials}`
              : null,
          };
        }
        return { ...consultation, notes: null, clinician_name: null };
      })
    );

    // Fetch family members (same membership, different person)
    const { data: familyMembers } = await supabase
      .from('people')
      .select('id, first_name, last_name, date_of_birth, relationship')
      .eq('membership_id', person.membership_id)
      .neq('id', personId);

    // Fetch audit logs
    const { data: auditLogs } = await (supabase as any)
      .from('audit_logs')
      .select(`
        id,
        created_at,
        action,
        details,
        user_id
      `)
      .eq('patient_id', personId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Add user details to audit logs
    const auditTrailWithUsers = await Promise.all(
      (auditLogs || []).map(async (log: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(
          log.user_id
        );
        const { data: roleData } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', log.user_id)
          .single();

        return {
          id: log.id,
          timestamp: log.created_at,
          action: log.action,
          user_email: userData?.user?.email || null,
          user_role: roleData?.role || null,
          details: log.details,
        };
      })
    );

    // Assemble chart data with CORRECT column mappings from schema
    const chartData: PatientChartData = {
      person: {
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        preferred_name: person.preferred_name || undefined,
        date_of_birth: person.date_of_birth,
        email: person.email,
        phone: person.phone,
        address: person.address_line1,  // ✅ FIXED: was "address", should be "address_line1"
        city: person.city,
        state: person.state,
        zip_code: person.postal_code,  // ✅ FIXED: was "zip_code", should be "postal_code"
        profile_photo_url: null,  // Field doesn't exist in database schema
        created_at: person.created_at,
      },
      membership: membership
        ? {
            id: membership.id,
            status: membership.status,
            plan_type: membership.plan_type,
            created_at: membership.created_at,
          }
        : null,
      medicalHistory: {
        conditions:
          conditions?.map((c) => ({
            id: c.id,
            condition_name: c.condition_label || 'Unknown condition',  // ✅ CORRECT
            diagnosed_date: c.created_at,  // ✅ Using created_at as diagnosed date
            notes: c.source || null,  // ✅ CORRECT
          })) || [],
        surgeries:
          surgeries?.map((s) => ({
            id: s.id,
            surgery_name: s.procedure || 'Unknown procedure',  // ✅ CORRECT
            surgery_date: s.approximate_date,  // ✅ CORRECT (this is text in schema)
            notes: s.notes,  // ✅ CORRECT
          })) || [],
        medications:
          medications?.map((m) => ({
            id: m.id,
            medication_name: m.medication_name,  // ✅ CORRECT
            dosage: m.dose,  // ✅ FIXED: was "dosage", should be "dose"
            frequency: m.frequency,  // ✅ CORRECT
            notes: m.route || null,  // ✅ Using route as notes since there's no notes field
          })) || [],
        allergies:
          allergies?.map((a) => ({
            id: a.id,
            allergen: a.allergen,  // ✅ CORRECT
            severity: a.severity,  // ✅ CORRECT
            reaction: a.reaction,  // ✅ CORRECT
          })) || [],
        bloodType: person.blood_type || null,  // ✅ CORRECT
        height: person.height || null,  // ✅ CORRECT
        weight: person.weight || null,  // ✅ CORRECT
      },
      emergencyContacts:
        emergencyContacts?.map((ec) => ({
          id: ec.id,
          name: ec.name,
          relationship: ec.relationship,
          phone: ec.phone,
          is_primary: false,  // Field doesn't exist in database schema, defaulting to false
        })) || [],
      consultations: consultationsWithClinician,
      familyMembers:
        familyMembers?.map((m) => ({
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          relationship: m.relationship || 'Family Member',
          date_of_birth: m.date_of_birth,
        })) || [],
      auditTrail: auditTrailWithUsers,
    };

    return { data: chartData, error: null };
  } catch (error) {
    console.error('Error fetching patient chart:', error);
    return { data: null, error: 'Failed to fetch patient chart' };
  }
}
