import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import FamilyMemberIntakeFlow from '@/components/intake/FamilyMemberIntakeFlow';

export default async function FamilyMemberIntakePage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  
  const supabase = await createServerSupabaseClient();

  /* ---------- Auth ---------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  /* ---------- Get Person & Verify Ownership ---------- */
  const { data: person } = await supabase
    .from('people')
    .select(`
      id,
      first_name,
      last_name,
      date_of_birth,
      relationship,
      intake_complete,
      membership_id,
      memberships!inner(user_id)
    `)
    .eq('id', personId)
    .single();

  if (!person) {
    redirect('/dashboard');
  }

  // Verify the person belongs to the current user's membership
  const membership = person.memberships as unknown as { user_id: string };
  if (membership.user_id !== user.id) {
    redirect('/dashboard');
  }

  /* ---------- If intake already complete, redirect ---------- */
  if (person.intake_complete) {
    redirect('/dashboard');
  }

  /* ---------- Render intake flow ---------- */
  return (
    <FamilyMemberIntakeFlow
      personId={person.id}
      firstName={person.first_name}
      lastName={person.last_name}
      relationship={person.relationship}
      membershipId={person.membership_id}
    />
  );
}
