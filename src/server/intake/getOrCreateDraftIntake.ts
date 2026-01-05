'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

export async function getOrCreateDraftIntake(personId: string) {
  if (!personId) {
    throw new Error('personId is required');
  }

  const supabase = await createServerSupabaseClient();

  // 1️⃣ Fetch existing draft
  const { data: existingDraft, error: fetchError } = await supabase
    .from('intake_submissions')
    .select('*')
    .eq('person_id', personId)
    .eq('status', 'draft')
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existingDraft) {
    return existingDraft;
  }

  // 2️⃣ Insert new draft
  const { data: newDraft, error: insertError } = await supabase
    .from('intake_submissions')
    .insert({
      person_id: personId,
      status: 'draft',
      attestation_accepted: false,
      intake_complete: false,
      location_state: 'unknown',
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newDraft;
}