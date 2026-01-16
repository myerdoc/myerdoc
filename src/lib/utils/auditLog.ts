import { createClient } from '@/lib/supabase/client';

/**
 * Creates an audit log entry for HIPAA compliance
 * 
 * @param {string} action - The action being performed (e.g., 'VIEW_PATIENT', 'UPDATE_CONSULTATION')
 * @param {string} resourceType - The type of resource (e.g., 'patient', 'consultation')
 * @param {string} resourceId - The UUID of the resource
 * @param {string} patientId - The UUID of the patient involved
 * @param {object} details - Additional details about the action
 * @returns {Promise<string|null>} The audit log ID or null if failed
 */
export async function logAudit(
  action: string,
  resourceType: string,
  resourceId?: string,
  patientId?: string,
  details: Record<string, any> = {}
): Promise<string | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.rpc('create_audit_log', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_patient_id: patientId,
      p_details: details
    });

    if (error) {
      console.error('Audit log error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Audit log exception:', error);
    return null;
  }
}

/**
 * Fetches audit logs for the current clinician
 * 
 * @param {object} filters - Optional filters for the query
 * @param {number} filters.limit - Number of records to return
 * @param {string} filters.action - Filter by action type
 * @param {string} filters.patientId - Filter by patient
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getClinicianAuditLogs({ 
  limit = 100, 
  action = null, 
  patientId = null 
}: {
  limit?: number;
  action?: string | null;
  patientId?: string | null;
} = {}): Promise<any[]> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    // Get clinician ID
    const { data: clinicianData } = await supabase
      .from('clinicians')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!clinicianData) {
      throw new Error('Clinician not found');
    }

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('clinician_id', clinicianData.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action', action);
    }

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Fetches audit logs for a specific patient (who accessed their data)
 * 
 * @param {string} patientId - The patient's UUID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} Array of audit log entries with clinician details
 */
export async function getPatientAuditLogs(
  patientId: string, 
  limit: number = 50
): Promise<any[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        clinician:clinicians (
          first_name,
          last_name,
          credentials
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching patient audit logs:', error);
    return [];
  }
}

/**
 * Audit action constants for consistency
 */
export const AUDIT_ACTIONS = {
  // Patient access
  VIEW_PATIENT: 'VIEW_PATIENT',
  VIEW_PATIENT_CHART: 'VIEW_PATIENT_CHART',
  ACCESS_MEDICAL_RECORD: 'ACCESS_MEDICAL_RECORD',
  
  // Consultation actions
  VIEW_CONSULTATION: 'VIEW_CONSULTATION',
  CLAIM_CONSULTATION: 'CLAIM_CONSULTATION',
  UPDATE_CONSULTATION: 'UPDATE_CONSULTATION',
  COMPLETE_CONSULTATION: 'COMPLETE_CONSULTATION',
  
  // Prescription actions
  PRESCRIBE_MEDICATION: 'PRESCRIBE_MEDICATION',
  VIEW_PRESCRIPTIONS: 'VIEW_PRESCRIPTIONS',
  
  // Data exports
  EXPORT_PATIENT_DATA: 'EXPORT_PATIENT_DATA',
  EXPORT_CONSULTATION_DATA: 'EXPORT_CONSULTATION_DATA',
  
  // Messages
  SEND_MESSAGE: 'SEND_MESSAGE',
  VIEW_MESSAGES: 'VIEW_MESSAGES'
} as const;

/**
 * Formats audit log for display
 */
export function formatAuditLog(log: any) {
  return {
    id: log.id,
    timestamp: new Date(log.created_at).toLocaleString(),
    action: log.action.replace(/_/g, ' ').toLowerCase(),
    resourceType: log.resource_type,
    clinician: log.clinician 
      ? `${log.clinician.first_name} ${log.clinician.last_name}, ${log.clinician.credentials}`
      : 'Unknown',
    details: log.details
  };
}
