'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatPhone } from '@/lib/format/phone';

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
} | null;

export default function EditPersonalInfo({ person }: { person: Person }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(person?.first_name || '');
  const [lastName, setLastName] = useState(person?.last_name || '');
  const [preferredName, setPreferredName] = useState(person?.preferred_name || '');
  const [phone, setPhone] = useState(person?.phone || '');
  const [address1, setAddress1] = useState(person?.address_line1 || '');
  const [address2, setAddress2] = useState(person?.address_line2 || '');
  const [city, setCity] = useState(person?.city || '');
  const [state, setState] = useState(person?.state || '');
  const [postalCode, setPostalCode] = useState(person?.postal_code || '');

  function formatPhoneInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function formatDob(date: string) {
    const [y, m, d] = date.split('-');
    if (!y || !m || !d) return date;
    return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
  }

  async function handleSave() {
    if (!person) return;
    
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('people')
      .update({
        first_name: firstName,
        last_name: lastName,
        preferred_name: preferredName || null,
        phone: phone || null,
        address_line1: address1,
        address_line2: address2 || null,
        city,
        state,
        postal_code: postalCode,
      })
      .eq('id', person.id);

    if (updateError) {
      setError('Failed to update information');
      setSaving(false);
      return;
    }

    setSaving(false);
    setIsEditing(false);
    window.location.reload();
  }

  function handleCancel() {
    setFirstName(person?.first_name || '');
    setLastName(person?.last_name || '');
    setPreferredName(person?.preferred_name || '');
    setPhone(person?.phone || '');
    setAddress1(person?.address_line1 || '');
    setAddress2(person?.address_line2 || '');
    setCity(person?.city || '');
    setState(person?.state || '');
    setPostalCode(person?.postal_code || '');
    setIsEditing(false);
    setError(null);
  }

  if (!person) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
        <p className="text-sm text-slate-500">No details on file yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isEditing ? (
        <div className="space-y-2 text-sm mt-4">
          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Name:</span>
            <span className="text-slate-900">{preferredName || firstName} {lastName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Date of birth:</span>
            <span className="text-slate-900">{formatDob(person.date_of_birth)}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Phone:</span>
            <span className="text-slate-900">{formatPhone(phone)}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Address:</span>
            <span className="text-slate-900">
              {address1}
              {address2 && `, ${address2}`}, {city}, {state} {postalCode}
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-md mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Preferred name</label>
            <input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Address line 1</label>
            <input
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Address line 2</label>
            <input
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">State</label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">ZIP</label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
