'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelConsultationRequest } from '@/server/consultation/cancelConsultationAction';

type Props = {
  consultationId: string;
  membershipId: string;
};

export default function CancelConsultationButton({ consultationId, membershipId }: Props) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this consultation request? This cannot be undone.')) {
      return;
    }

    setCancelling(true);
    setError(null);

    const result = await cancelConsultationRequest(consultationId, membershipId);

    if (result.error) {
      setError(result.error);
      setCancelling(false);
      return;
    }

    // Success - refresh the page
    router.refresh();
  };

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}
      <button
        onClick={handleCancel}
        disabled={cancelling}
        className="text-sm font-medium text-red-600 hover:text-red-700 underline disabled:opacity-50 cursor-pointer"
      >
        {cancelling ? 'Cancelling...' : 'Cancel this request'}
      </button>
    </div>
  );
}
