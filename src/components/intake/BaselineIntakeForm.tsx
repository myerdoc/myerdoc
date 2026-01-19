'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Props = {
  membershipId: string;
};

export default function BaselineIntakeForm({ membershipId }: Props) {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dob, setDob] = useState(''); // MM/DD/YYYY

  // Contact + shipping
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function formatZip(value: string) {
    return value.replace(/\D/g, '').slice(0, 10); // ZIP or ZIP+4
  }

  function toPostgresDate(mmddyyyy: string) {
    const [m, d, y] = mmddyyyy.split('/');
    if (!m || !d || !y || y.length !== 4) return null;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!firstName || !lastName || !dob) {
      setError('First name, last name, and date of birth are required.');
      return;
    }

    if (!address1 || !city || !state || !postalCode) {
      setError('Address line 1, city, state, and ZIP code are required.');
      return;
    }

    const formattedDob = toPostgresDate(dob);
    if (!formattedDob) {
      setError('Date of birth must be in MM/DD/YYYY format.');
      return;
    }

    setSubmitting(true);

    try {
      // 1) Check if self person already exists
      const { data: existingPerson, error: checkError } = await supabase
        .from('people')
        .select('id')
        .eq('membership_id', membershipId)
        .eq('relationship', 'self')
        .maybeSingle();

      if (checkError) {
        console.error('CHECK ERROR:', checkError);
        setError('Failed to check existing profile.');
        setSubmitting(false);
        return;
      }

      let personId: string;

      if (existingPerson) {
        // Update existing person
        const { error: updateError } = await supabase
          .from('people')
          .update({
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName || null,
            preferred_name: preferredName || null,
            date_of_birth: formattedDob,
            phone: phone || null,
            address_line1: address1,
            address_line2: address2 || null,
            city,
            state,
            postal_code: postalCode,
          })
          .eq('id', existingPerson.id);

        if (updateError) {
          console.error('UPDATE ERROR:', updateError);
          setError('Failed to update profile.');
          setSubmitting(false);
          return;
        }

        personId = existingPerson.id;
      } else {
        // Insert new person
        const { data: newPerson, error: insertError } = await supabase
          .from('people')
          .insert({
            membership_id: membershipId,
            relationship: 'self',
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName || null,
            preferred_name: preferredName || null,
            date_of_birth: formattedDob,
            phone: phone || null,
            address_line1: address1,
            address_line2: address2 || null,
            city,
            state,
            postal_code: postalCode,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('INSERT ERROR:', insertError);
          setError('Failed to create profile.');
          setSubmitting(false);
          return;
        }

        personId = newPerson.id;
      }

      // 2) Advance onboarding step
      const { error: stepError } = await supabase
        .from('memberships')
        .update({ onboarding_step: 'baseline_complete' })
        .eq('id', membershipId);

      if (stepError) {
        console.error('ONBOARDING STEP UPDATE ERROR:', stepError);
        setError('Saved, but failed to update onboarding step.');
        setSubmitting(false);
        return;
      }

      router.replace(`/membership/intake/emergency-contact?membershipId=${membershipId}`);
    } catch (err) {
      console.error('UNEXPECTED ERROR:', err);
      setError('An unexpected error occurred.');
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold text-slate-900">Baseline intake</h1>
              <p className="text-sm text-slate-600 max-w-prose">
                This helps us confirm identity, contact you, and ship your vitals kit if needed.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
            )}

            {/* Name */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Middle name <span className="text-slate-400">(optional)</span>
                </label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Preferred name <span className="text-slate-400">(optional)</span>
                </label>
                <input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="If different from first name" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Date of birth</label>
                <input value={dob} onChange={(e) => setDob(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="MM/DD/YYYY" required />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Contact & shipping address</h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Mobile phone <span className="text-slate-400">(optional)</span>
                </label>
                <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="w-full rounded-md border px-3 py-2" placeholder="(555) 123-4567" inputMode="tel" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Address line 1</label>
                <input value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Address line 2 <span className="text-slate-400">(optional)</span>
                </label>
                <input value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-900">City</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-900">State</label>
                  <input value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-md border px-3 py-2" placeholder="UT" required />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-900">ZIP</label>
                  <input value={postalCode} onChange={(e) => setPostalCode(formatZip(e.target.value))} className="w-full rounded-md border px-3 py-2" placeholder="84060" inputMode="numeric" required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className={`w-full rounded-md py-2 text-white ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {submitting ? 'Saving…' : 'Save and continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
