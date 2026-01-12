'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EmergencyContactForm from '@/components/intake/EmergencyContactForm';

function EmergencyContactContent() {
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

export default function EmergencyContactPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-12 text-sm text-slate-700">Loading...</div>}>
      <EmergencyContactContent />
    </Suspense>
  );
}