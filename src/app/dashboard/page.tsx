'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Membership = {
  id: string;
  onboarding_step: string;
  vitals_kit_status: string | null;
};

type Person = {
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  phone: string | null;
  sex_at_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
};

type MedicalHistory = {
  conditions: string[] | null;
  allergies: string[] | null;
  medications: string | null;
  pregnancy_status: string | null;
};

type EmergencyContact = {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
};

function formatDob(date: string) {
  // expects YYYY-MM-DD
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
}

function vitalsKitLabel(status: string | null) {
  if (!status) return 'Not specified';
  if (status === 'has_kit') return 'You have a vitals kit';
  if (status === 'kit_requested') return 'Kit requested';
  if (status === 'kit_shipped') return 'Kit shipped';
  if (status === 'unsure') return 'Not sure yet';
  return status;
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [medical, setMedical] = useState<MedicalHistory | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const intakeComplete = useMemo(() => {
    return membership?.onboarding_step === 'onboarding_complete';
  }, [membership?.onboarding_step]);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      // Membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('id, onboarding_step, vitals_kit_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('MEMBERSHIP FETCH ERROR:', membershipError);
        setLoading(false);
        return;
      }

      if (!membershipData) {
        router.replace('/request');
        return;
      }

      setMembership(membershipData);

      // Self person
      const { data: selfPerson, error: personError } = await supabase
        .from('people')
        .select(
          `
          first_name,
          last_name,
          preferred_name,
          date_of_birth,
          phone,
          sex_at_birth,
          address_line1,
          address_line2,
          city,
          state,
          postal_code
        `
        )
        .eq('membership_id', membershipData.id)
        .eq('relationship', 'self')
        .maybeSingle();

      if (personError) {
        console.error('SELF PERSON FETCH ERROR:', personError);
      }
      setPerson(selfPerson ?? null);

      // Medical snapshot (latest)
      const { data: medicalData, error: medicalError } = await supabase
        .from('medical_histories')
        .select(
          `
          conditions,
          allergies,
          medications,
          pregnancy_status
        `
        )
        .eq('membership_id', membershipData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (medicalError) {
        console.error('MEDICAL HISTORY FETCH ERROR:', medicalError);
      }
      setMedical(medicalData ?? null);

      // Emergency contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('id, name, relationship, phone')
        .eq('membership_id', membershipData.id)
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('EMERGENCY CONTACTS FETCH ERROR:', contactsError);
      }
      setContacts((contactsData ?? []) as EmergencyContact[]);

      setLoading(false);
    };

    run();
  }, [router]);

  if (loading || !membership) return null;

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome to MyERDoc
          </h1>
          <p className="text-sm text-slate-600">
            {intakeComplete
              ? 'Your intake is complete. You can update anything below at any time.'
              : 'Your intake is still in progress. You can finish it anytime.'}
          </p>
        </header>

        {/* Intake status */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Status</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <strong>Intake:</strong>{' '}
              {intakeComplete ? 'Complete' : 'In progress'}
            </p>
            <p>
              <strong>Vitals kit:</strong> {vitalsKitLabel(membership.vitals_kit_status)}
            </p>
          </div>
        </section>

        {/* Your details */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your details</h2>
            <a
              href={`/membership/intake/baseline?membershipId=${membership.id}`}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Edit
            </a>
          </div>

          {!person ? (
            <p className="mt-4 text-sm text-slate-500">
              No details on file yet.
            </p>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <strong>Name:</strong>{' '}
                {person.preferred_name || person.first_name} {person.last_name}
              </p>

              <p>
                <strong>Date of birth:</strong>{' '}
                {formatDob(person.date_of_birth)}
              </p>

              <p>
                <strong>Phone:</strong> {person.phone || 'Not provided'}
              </p>

              <p>
                <strong>Address:</strong>
                <br />
                {person.address_line1 || '—'}
                <br />
                {person.address_line2 ? (
                  <>
                    {person.address_line2}
                    <br />
                  </>
                ) : null}
                {person.city && person.state && person.postal_code
                  ? `${person.city}, ${person.state} ${person.postal_code}`
                  : null}
              </p>
            </div>
          )}
        </section>

        {/* Medical snapshot */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Medical snapshot
            </h2>
            <a
              href={`/membership/intake/medical-history?membershipId=${membership.id}`}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Edit
            </a>
          </div>

          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <p>
              <strong>Sex at birth:</strong>{' '}
              {person?.sex_at_birth || 'Not specified'}
            </p>

            <div>
              <strong>Conditions:</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {(medical?.conditions?.length ?? 0) > 0
                  ? medical!.conditions!.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                      >
                        {c}
                      </span>
                    ))
                  : ' None'}
              </div>
            </div>

            <div>
              <strong>Allergies:</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {(medical?.allergies?.length ?? 0) > 0
                  ? medical!.allergies!.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                      >
                        {a}
                      </span>
                    ))
                  : ' None'}
              </div>
            </div>

            <p>
              <strong>Medications:</strong>{' '}
              {medical?.medications || 'None listed'}
            </p>
          </div>
        </section>

        {/* Emergency contacts */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Emergency contacts
            </h2>
            <a
              href={`/membership/intake/emergency-contact?membershipId=${membership.id}`}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Edit
            </a>
          </div>

          {contacts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No emergency contacts on file.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="text-sm text-slate-700 space-y-1">
                    <p>
                      <strong>Name:</strong> {c.name}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {c.relationship || '—'}
                    </p>
                    <p>
                      <strong>Phone:</strong> {c.phone || '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}