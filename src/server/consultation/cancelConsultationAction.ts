'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelConsultationRequest(consultationId: string, membershipId: string) {
  const supabase = await createServerSupabaseClient();

  // Verify the consultation belongs to this membership
  const { data: consultation, error: fetchError } = await supabase
    .from('consultation_requests')
    .select('membership_id, status')
    .eq('id', consultationId)
    .single();

  if (fetchError) {
    console.error('Error fetching consultation:', fetchError);
    return { error: 'Consultation not found' };
  }

  if (!consultation || consultation.membership_id !== membershipId) {
    return { error: 'Unauthorized' };
  }

  // Only allow canceling pending or in_progress consultations
  if (!consultation.status || !['pending', 'in_progress'].includes(consultation.status)) {
    return { error: `Cannot cancel consultation with status: ${consultation.status || 'unknown'}` };
  }

  // Update status to cancelled
  const { error: updateError } = await supabase
    .from('consultation_requests')
    .update({ status: 'cancelled' })
    .eq('id', consultationId);

  if (updateError) {
    console.error('Error updating consultation status:', updateError);
    return { error: `Database error: ${updateError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
