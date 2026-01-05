'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import BaselineIntakeForm from '@/components/intake/BaselineIntakeForm';

export default function IntakeFormPage() {
  const router = useRouter();
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1️⃣ Ensure user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      // 2️⃣ Fetch membership
      const { data: membership, error } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error || !membership) {
        console.error('Membership not found', error);
        router.replace('/login');
        return;
      }

      setMembershipId(membership.id);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading || !membershipId) return null;

  return <BaselineIntakeForm membershipId={membershipId} />;
}