'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/utils/auditLog';

export interface PatientChartData {
  person: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    email: string | null;
    phone: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    profile_photo_url: string | null;
    created_at: string;
  };
  membership: {
    id: string;
    status: string;
    plan_type: string | null;
    created_at: string;
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Unauthorized' };
    }

    // Verify clinician role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'clinician') {
      return { data: null, error: 'Access denied: Clinician role required' };
    }

    // Log audit trail for accessing patient chart
    await logAudit({
      user_id: user.id,
      action: 'VIEW_PATIENT_CHART',
      resource_type: 'person',
      resource_id: personId,
      details: `Clinician accessed full patient chart`,
    });

    // Fetch person details
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('*')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      return { data: null, error: 'Patient not found' };
    }

    // Fetch membership info
    const { data: membership } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', person.membership_id)
      .single();

    // Fetch medical conditions
    const { data: conditions } = await supabase
      .from('medical_conditions')
      .select('*')
      .eq('person_id', personId)
      .order('diagnosed_date', { ascending: false });

    // Fetch surgical history
    const { data: surgeries } = await supabase
      .from('surgical_history')
      .select('*')
      .eq('person_id', personId)
      .order('surgery_date', { ascending: false });

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

    // Fetch emergency contacts (now linked to person, not membership)
    const { data: emergencyContacts } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('person_id', personId)
      .order('is_primary', { ascending: false });

    // Fetch consultation history with clinician details
    const { data: consultations } = await supabase
      .from('consultation_requests')
      .select(
        `
        id,
        created_at,
        status,
        chief_complaint,
        diagnosis,
        notes,
        treatment_plan,
        clinician:assigned_physician_id(first_name, last_name)
      `
      )
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    // Fetch family members (other people in the same membership)
    const { data: familyMembers } = await supabase
      .from('people')
      .select('id, first_name, last_name, date_of_birth, relationship')
      .eq('membership_id', person.membership_id)
      .neq('id', personId);

    // Fetch audit trail for this person
    const { data: auditTrail } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_id', personId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get user details for audit trail
    const userIds = [...new Set(auditTrail?.map(log => log.user_id).filter(Boolean) || [])];
    const { data: users } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const userRoleMap = new Map(users?.map(u => [u.user_id, u.role]) || []);

    // Format consultation data
    const formattedConsultations =
      consultations?.map((c: any) => ({
        id: c.id,
        created_at: c.created_at,
        status: c.status,
        chief_complaint: c.chief_complaint,
        diagnosis: c.diagnosis,
        notes: c.notes,
        treatment_plan: c.treatment_plan,
        clinician_name: c.clinician
          ? `${c.clinician.first_name} ${c.clinician.last_name}`
          : null,
      })) || [];

    // Format audit trail
    const formattedAuditTrail =
      auditTrail?.map((log: any) => ({
        id: log.id,
        timestamp: log.created_at,
        action: log.action,
        user_email: log.user_email || 'Unknown',
        user_role: userRoleMap.get(log.user_id) || 'Unknown',
        details: log.details,
      })) || [];

    const chartData: PatientChartData = {
      person: {
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        date_of_birth: person.date_of_birth,
        email: person.email,
        phone: person.phone,
        address: person.address,
        city: person.city,
        state: person.state,
        zip_code: person.zip_code,
        profile_photo_url: person.profile_photo_url,
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
        conditions: conditions || [],
        surgeries: surgeries || [],
        medications: medications || [],
        allergies: allergies || [],
        bloodType: person.blood_type || null,
        height: person.height || null,
        weight: person.weight || null,
      },
      emergencyContacts: emergencyContacts || [],
      consultations: formattedConsultations,
      familyMembers:
        familyMembers?.map((m: any) => ({
          id: m.id,
          first_name: m.first_name,
          last_name: m.last_name,
          relationship: m.relationship || 'Family Member',
          date_of_birth: m.date_of_birth,
        })) || [],
      auditTrail: formattedAuditTrail,
    };

    return { data: chartData, error: null };
  } catch (error) {
    console.error('Error fetching patient chart:', error);
    return { data: null, error: 'Failed to fetch patient chart' };
  }
}
