'use client';

import { useState } from 'react';
import { updateFamilyMemberPersonalInfo } from '@/server/family/familyMemberActions';

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
};

type Props = {
  person: Person;
  membershipId: string;
};

function formatDob(date: string) {
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
}

function formatAddress(person: Person): string {
  const parts = [
    person.address_line1,
    person.address_line2,
    [person.city, person.state].filter(Boolean).join(', '),
    person.postal_code
  ].filter(Boolean);
  return parts.join(', ') || 'Not provided';
}

export default function EditFamilyMemberPersonalInfo({ person, membershipId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(person.first_name);
  const [lastName, setLastName] = useState(person.last_name);
  const [preferredName, setPreferredName] = useState(person.preferred_name || '');
  const [phone, setPhone] = useState(person.phone || '');
  const [address1, setAddress1] = useState(person.address_line1 || '');
  const [address2, setAddress2] = useState(person.address_line2 || '');
  const [city, setCity] = useState(person.city || '');
  const [state, setState] = useState(person.state || '');
  const [postalCode, setPostalCode] = useState(person.postal_code || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updateFamilyMemberPersonalInfo({
      personId: person.id,
      membershipId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      preferredName: preferredName.trim() || null,
      phone: phone.trim() || null,
      addressLine1: address1.trim() || null,
      addressLine2: address2.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      postalCode: postalCode.trim() || null,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Preferred Name (optional)</label>
            <input
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Address Line 1</label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Address Line 2 (optional)</label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">ZIP</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={submitting}
              className="rounded-md border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Edit
        </button>
      </div>

      <div style={{ maxWidth: '600px' }} className="space-y-2 text-sm">
        <div className="flex">
          <span className="font-medium text-slate-700 w-32 shrink-0">Name:</span>
          <span className="text-slate-900">
            {preferredName || firstName} {lastName}
          </span>
        </div>
        <div className="flex">
          <span className="font-medium text-slate-700 w-32 shrink-0">Date of birth:</span>
          <span className="text-slate-900">{formatDob(person.date_of_birth)}</span>
        </div>
        <div className="flex">
          <span className="font-medium text-slate-700 w-32 shrink-0">Phone:</span>
          <span className="text-slate-900">{phone || 'Not provided'}</span>
        </div>
        <div className="flex">
          <span className="font-medium text-slate-700 w-32 shrink-0">Address:</span>
          <span className="text-slate-900">{formatAddress(person)}</span>
        </div>
      </div>
    </section>
  );
}
