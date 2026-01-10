'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Props = {
  personId: string;
  firstName: string;
  lastName: string;
  relationship: string;
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

const ALLERGY_OPTIONS = [
  'None',
  'Penicillin',
  'Sulfa',
  'NSAIDs',
  'Opioids',
  'Other',
];

export default function FamilyMemberIntakeFlow({
  personId,
  firstName,
  lastName,
  relationship,
  membershipId,
}: Props) {
  const router = useRouter();

  /* ======================
     State
  ====================== */

  const [sexAtBirth, setSexAtBirth] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [medications, setMedications] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ======================
     Helpers
  ====================== */

  function toggleOption(
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

  function splitCommaList(input: string): string[] {
    return input
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);
  }

  /* ======================
     Submit
  ====================== */

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

    try {
      /* 1️⃣ Clear existing medical data for this person */
      await Promise.all([
        supabase.from('medical_conditions').delete().eq('person_id', personId),
        supabase.from('allergies').delete().eq('person_id', personId),
        supabase.from('medications').delete().eq('person_id', personId),
        supabase.from('surgical_history').delete().eq('person_id', personId),
      ]);

      /* 2️⃣ Conditions */
      const normalizedConditions = [
        ...conditions.filter(c => c !== 'None'),
        ...(otherCondition.trim() ? [otherCondition.trim()] : []),
      ];

      if (normalizedConditions.length > 0) {
        await supabase.from('medical_conditions').insert(
          normalizedConditions.map(label => ({
            person_id: personId,
            condition_label: label,
            condition_code: label.toLowerCase().replace(/\s+/g, '_'),
            source: 'intake',
          }))
        );
      }

      /* 3️⃣ Allergies */
      const normalizedAllergies = allergies.filter(a => a !== 'None');

      if (normalizedAllergies.length > 0) {
        await supabase.from('allergies').insert(
          normalizedAllergies.map(allergen => ({
            person_id: personId,
            allergen,
            source: 'intake',
          }))
        );
      }

      /* 4️⃣ Medications */
      const meds = splitCommaList(medications);

      if (meds.length > 0) {
        await supabase.from('medications').insert(
          meds.map(name => ({
            person_id: personId,
            medication_name: name,
            source: 'intake',
          }))
        );
      }

      /* 5️⃣ Surgical history */
      const procedures = splitCommaList(surgeries);

      if (procedures.length > 0) {
        await supabase.from('surgical_history').insert(
          procedures.map(proc => ({
            person_id: personId,
            procedure: proc,
            source: 'intake',
          }))
        );
      }

      /* 6️⃣ Update person demographics */
      await supabase
        .from('people')
        .update({
          sex_at_birth: sexAtBirth,
          pregnancy_status: pregnancyStatus || null,
        })
        .eq('id', personId);

      /* 7️⃣ Mark intake as complete */
      await supabase
        .from('people')
        .update({ intake_complete: true })
        .eq('id', personId);

      // Success - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to save medical history.');
      setSubmitting(false);
    }
  }

  /* ======================
     Render
  ====================== */

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Medical history for {firstName} {lastName}
              </h1>
              <p className="text-sm text-slate-600">
                This information helps our physicians provide safer, more accurate guidance for {firstName}.
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
                    onChange={() =>
                      toggleOption(option, conditions, setConditions)
                    }
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
                placeholder="Example: Lisinopril 10mg, Metformin 500mg"
              />
            </div>

            {/* Surgical history */}
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Surgical history (optional)
              </label>
              <textarea
                value={surgeries}
                onChange={e => setSurgeries(e.target.value)}
                rows={3}
                className="w-full rounded-md border px-3 py-2"
                placeholder="Example: Appendectomy (2005), Knee arthroscopy (2018)"
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
                    onChange={() =>
                      toggleOption(option, allergies, setAllergies)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>

            {/* Pregnancy - only show if relevant */}
            {sexAtBirth === 'Female' && (
              <div>
                <label className="block text-sm font-medium text-slate-900">
                  Pregnancy status
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
            )}

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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 rounded-md py-2 text-white ${
                  submitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {submitting ? 'Saving…' : 'Complete Intake'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={submitting}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
