// src/lib/utils/auditLogServer.ts
// SERVER-SIDE ONLY - Use this in server actions and server components

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Creates an audit log entry for HIPAA compliance (SERVER VERSION)
 * Use this in server actions and server components
 * 
 * @param {string} action - The action being performed (e.g., 'VIEW_PATIENT_CHART')
 * @param {string} resourceType - The type of resource (e.g., 'person', 'consultation')
 * @param {string} resourceId - The UUID of the resource
 * @param {string} patientId - The UUID of the patient involved
 * @param {object} details - Additional details about the action
 * @returns {Promise<string|null>} The audit log ID or null if failed
 */
export async function logAuditServer(
  action: string,
  resourceType: string,
  resourceId?: string,
  patientId?: string,
  details: Record<string, any> = {}
): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient();
    
const { data, error } = await supabase.rpc('create_audit_log', {      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_patient_id: patientId,
      p_details: details
    });

    if (error) {
      console.error('Server audit log error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Server audit log exception:', error);
    return null;
  }
}
