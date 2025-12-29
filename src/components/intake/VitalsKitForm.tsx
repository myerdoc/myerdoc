'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Props = {
  membershipId: string;
};

export default function VitalsKitForm({ membershipId }: Props) {
  const router = useRouter();

  const [selection, setSelection] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mapSelectionToStatus(value: string) {
    if (value === 'has_kit') return 'has_kit';
    if (value === 'need_kit') return 'kit_requested';
    if (value === 'unsure') return 'unsure';
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selection) {
      setError('Please select an option.');
      return;
    }

    const vitalsKitStatus = mapSelectionToStatus(selection);
    if (!vitalsKitStatus) {
      setError('Invalid selection.');
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase
      .from('memberships')
      .update({
        vitals_kit_status: vitalsKitStatus,
        onboarding_step: 'onboarding_complete',
      })
      .eq('id', membershipId);

    if (updateError) {
      console.error('VITALS KIT ERROR:', updateError);
      setError('Failed to save vitals kit information.');
      setSubmitting(false);
      return;
    }

    router.replace('/dashboard');
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                Vitals kit
              </h1>
              <p className="text-sm text-slate-600 max-w-prose">
                A MyERDoc vitals kit helps our physicians provide more accurate
                guidance, but access to care does not depend on having the kit in hand.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-900">
                Do you currently have a MyERDoc vitals kit?
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="vitalsKit"
                    value="has_kit"
                    checked={selection === 'has_kit'}
                    onChange={(e) => setSelection(e.target.value)}
                  />
                  Yes — I have a working kit
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="vitalsKit"
                    value="need_kit"
                    checked={selection === 'need_kit'}
                    onChange={(e) => setSelection(e.target.value)}
                  />
                  No — I need a kit shipped
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="vitalsKit"
                    value="unsure"
                    checked={selection === 'unsure'}
                    onChange={(e) => setSelection(e.target.value)}
                  />
                  I’m not sure
                </label>
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
              {submitting ? 'Saving…' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}