'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Props = {
  membershipId: string;
};

const CONDITION_OPTIONS = [
  'Hypertension',
  'Diabetes',
  'Asthma or COPD',
  'Heart disease',
  'Seizure disorder',
  'Bleeding disorder',
  'Immunocompromised',
  'None',
];

const ALLERGY_OPTIONS = ['None', 'Penicillin', 'Sulfa', 'NSAIDs', 'Opioids', 'Other'];

export default function MedicalHistoryForm({ membershipId }: Props) {
  const router = useRouter();

  // ===== State =====
  const [sexAtBirth, setSexAtBirth] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ===== Helpers =====
  function toggle(
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) {
    if (value === 'None') {
      setList(['None']);
      return;
    }

    setList(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list.filter(v => v !== 'None'), value]
    );
  }

  async function getSelfPersonId(): Promise<string | null> {
    const { data, error } = await supabase
      .from('people')
      .select('id')
      .eq('membership_id', membershipId)
      .eq('relationship', 'self')
      .maybeSingle();

    if (error) {
      console.error('SELF PERSON LOOKUP ERROR:', error);
      return null;
    }

    return data?.id ?? null;
  }

  // ===== Submit =====
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!sexAtBirth) {
      setError('Please select sex assigned at birth.');
      return;
    }

    if (!acknowledged) {
      setError('You must acknowledge the emergency care disclaimer.');
      return;
    }

    setSubmitting(true);

    // 1️⃣ Insert medical history
    const { error: insertError } = await supabase
      .from('medical_histories')
      .insert({
        membership_id: membershipId,
        conditions,
        other_condition: otherCondition || null,
        medications: medications || null,
        allergies,
        pregnancy_status: pregnancyStatus || null,
        acknowledged,
      });

    if (insertError) {
      console.error('MEDICAL HISTORY ERROR:', insertError);
      setError('Failed to save medical history.');
      setSubmitting(false);
      return;
    }

    // 2️⃣ Update sex_at_birth on self person
    const personId = await getSelfPersonId();

    if (!personId) {
      setError('Saved medical history, but could not locate your profile.');
      setSubmitting(false);
      return;
    }

    const { error: sexUpdateError } = await supabase
      .from('people')
      .update({ sex_at_birth: sexAtBirth })
      .eq('id', personId);

    if (sexUpdateError) {
      console.error('SEX UPDATE ERROR:', sexUpdateError);
      setError('Saved medical history, but failed to save sex at birth.');
      setSubmitting(false);
      return;
    }

    // 3️⃣ Advance onboarding step
    const { error: stepError } = await supabase
      .from('memberships')
      .update({ onboarding_step: 'medical_history_complete' })
      .eq('id', membershipId);

    if (stepError) {
      console.error('ONBOARDING STEP UPDATE ERROR:', stepError);
      setError('Saved, but failed to update onboarding step.');
      setSubmitting(false);
      return;
    }

    router.push(`/membership/intake/vitals-kit?membershipId=${membershipId}`);
  }

  // ===== Render =====
  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Medical history
              </h1>
              <p className="text-sm text-slate-600">
                This information helps our physicians provide safer, more accurate guidance.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* Sex at birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Sex assigned at birth
              </label>
              {['Male', 'Female', 'Intersex', 'Prefer not to say'].map(option => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sexAtBirth"
                    value={option}
                    checked={sexAtBirth === option}
                    onChange={e => setSexAtBirth(e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Known medical conditions
              </label>
              {CONDITION_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={conditions.includes(option)}
                    onChange={() => toggle(option, conditions, setConditions)}
                  />
                  {option}
                </label>
              ))}

              <input
                type="text"
                value={otherCondition}
                onChange={e => setOtherCondition(e.target.value)}
                placeholder="Other condition (optional)"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Current medications (optional)
              </label>
              <textarea
                value={medications}
                onChange={e => setMedications(e.target.value)}
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Drug allergies
              </label>
              {ALLERGY_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allergies.includes(option)}
                    onChange={() => toggle(option, allergies, setAllergies)}
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Pregnancy */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Pregnancy status (if applicable)
              </label>
              <select
                value={pregnancyStatus}
                onChange={e => setPregnancyStatus(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Not pregnant">Not pregnant</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Possibly pregnant">Possibly pregnant</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Acknowledgment */}
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={e => setAcknowledged(e.target.checked)}
              />
              <span>
                I understand MyERDoc is not a replacement for emergency medical care.
              </span>
            </label>

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