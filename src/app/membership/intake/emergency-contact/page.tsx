'use client';

import { useSearchParams } from 'next/navigation';
import EmergencyContactForm from '@/components/intake/EmergencyContactForm';

export default function EmergencyContactPage() {
  const searchParams = useSearchParams();
  const membershipId = searchParams.get('membershipId') ?? '';

  if (!membershipId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-sm text-slate-700">
        Missing membership information.
      </div>
    );
  }

  return <EmergencyContactForm membershipId={membershipId} />;
}