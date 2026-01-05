'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getMedicalSnapshot(personId: string) {
  const supabase = await createServerSupabaseClient();

  /* ---------- Conditions ---------- */
  const { data: conditions } = await supabase
    .from('medical_conditions')
    .select('id, condition_label, active')
    .eq('person_id', personId)
    .eq('active', true);

  /* ---------- Allergies ---------- */
  const { data: allergies } = await supabase
    .from('allergies')
    .select('id, allergen, reaction, severity, active')
    .eq('person_id', personId)
    .eq('active', true);

  /* ---------- Medications ---------- */
  const { data: medications } = await supabase
    .from('medications')
    .select(
      'id, medication_name, dose, frequency, route, active'
    )
    .eq('person_id', personId)
    .eq('active', true);

  /* ---------- Surgical history ---------- */
  const { data: surgeries } = await supabase
    .from('surgical_history')
    .select(
      'id, procedure, approximate_date, notes'
    )
    .eq('person_id', personId);

  return {
    conditions: conditions ?? [],
    allergies: allergies ?? [],
    medications: medications ?? [],
    surgeries: surgeries ?? [],
  };
}