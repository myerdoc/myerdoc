'use client';

import { useSearchParams } from 'next/navigation';
import MedicalHistoryForm from '@/components/intake/MedicalHistoryForm';

export default function MedicalHistoryPage() {
  const searchParams = useSearchParams();
  const membershipId = searchParams.get('membershipId') ?? '';

  if (!membershipId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-sm text-slate-700">
        Missing membership information.
      </div>
    );
  }

  return <MedicalHistoryForm membershipId={membershipId} />;
}