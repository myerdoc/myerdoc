import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function MembershipIntakePage() {
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
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    redirect('/request');
  }

  /* ---------- Route based on onboarding step ---------- */
  const step = membership.onboarding_step;

  // If already complete, go to dashboard
  if (step === 'onboarding_complete') {
    redirect('/dashboard');
  }

  // If just started or not started, go to baseline form
  if (!step || step === 'started' || step === 'pending_baseline') {
    redirect(`/membership/intake/form?membershipId=${membership.id}`);
  }

  // If baseline complete, go to emergency contacts
  if (step === 'baseline_complete') {
    redirect(`/membership/intake/emergency-contact?membershipId=${membership.id}`);
  }

  // If emergency contacts complete, go to medical history
  if (step === 'emergency_contacts_complete') {
    redirect(`/membership/intake/medical-history?membershipId=${membership.id}`);
  }

  // If medical history complete, go to vitals kit
  if (step === 'medical_history_complete') {
    redirect(`/membership/intake/vitals-kit?membershipId=${membership.id}`);
  }

  // Fallback - go to form
  redirect(`/membership/intake/form?membershipId=${membership.id}`);
}
