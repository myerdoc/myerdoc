import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import MedicalHistoryForm from '@/components/intake/MedicalHistoryForm';

  export default async function MedicalHistoryPage({
    searchParams,
  }: {
    searchParams: Promise<{ membershipId?: string }>;
  }) {
    const params = await searchParams;
    const membershipId = params.membershipId;

  if (!membershipId) {
    redirect('/dashboard');
  }

  const supabase = await createServerSupabaseClient();

  /* ---------- Auth ---------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  /* ---------- Membership ---------- */
  const { data: membership } = await supabase
    .from('memberships')
    .select('id, onboarding_step')
    .eq('id', membershipId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    redirect('/dashboard');
  }

  /* ---------- 🔒 LOCK MEDICAL INTAKE ---------- */
  if (membership.onboarding_step !== 'emergency_contacts_complete') {
    // medical history already done or not yet allowed
    redirect('/dashboard');
  }

  /* ---------- Render client form ---------- */
  return <MedicalHistoryForm membershipId={membership.id} />;
}