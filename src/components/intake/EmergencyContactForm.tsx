'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Props = {
  membershipId: string;
};

export default function EmergencyContactForm({ membershipId }: Props) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!name || !relationship || !phone) {
      setError('Name, relationship, and phone are required.');
      return;
    }

    setSubmitting(true);

    // ✅ Upsert prevents duplicates (requires the UNIQUE index you added)
    const { error: upsertError } = await supabase
      .from('emergency_contacts')
      .upsert(
        {
          membership_id: membershipId,
          name: name.trim(),
          relationship: relationship.trim(),
          phone: phone.trim(),
        },
        {
          onConflict: 'membership_id,name,relationship,phone',
        }
      );

    if (upsertError) {
      console.error('EMERGENCY CONTACT UPSERT ERROR:', upsertError);
      setError('Failed to save emergency contact.');
      setSubmitting(false);
      return;
    }

    // Advance step (if you’re doing that here драмatically)
    const { error: stepError } = await supabase
      .from('memberships')
      .update({ onboarding_step: 'emergency_contact_complete' })
      .eq('id', membershipId);

    if (stepError) {
      console.error('ONBOARDING STEP UPDATE ERROR:', stepError);
      setError('Saved, but failed to update onboarding step.');
      setSubmitting(false);
      return;
    }

    router.replace(`/membership/intake/medical-history?membershipId=${membershipId}`);
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                Emergency contact
              </h1>
              <p className="text-sm text-slate-600 max-w-prose">
                We only use this if we’re concerned about your safety.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Bridget Mayeux"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Relationship
                </label>
                <input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Spouse"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="(435) 631-0760"
                  inputMode="tel"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-md py-2 text-white ${
                submitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {submitting ? 'Saving…' : 'Save and continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}