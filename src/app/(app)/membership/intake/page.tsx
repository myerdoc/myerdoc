import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMedicalSnapshot } from '@/server/medical/getMedicalSnapshot';
import { formatPhone } from '@/lib/format/phone';
import EditPersonalInfo from '@/components/dashboard/EditPersonalInfo';
import EditMedicalInfo from '@/components/dashboard/EditMedicalInfo';
import EditEmergencyContacts from '@/components/dashboard/EditEmergencyContacts';

/* =========================
   Helpers
========================= */

function formatDob(date: string) {
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

/* =========================
   Page (SERVER COMPONENT)
========================= */

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  /* ---------- Auth ---------- */
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/login')
  }

  /* ---------- Membership ---------- */
  const { data: membership } = await supabase
    .from('memberships')
    .select('id, onboarding_step, vitals_kit_status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    redirect('/request');
  }

  const intakeComplete =
    membership.onboarding_step === 'onboarding_complete';

  /* ---------- Self Person ---------- */
  const { data: person } = await supabase
    .from('people')
    .select(`
      id,
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
    `)
    .eq('membership_id', membership.id)
    .eq('relationship', 'self')
    .maybeSingle();

  /* ---------- Medical Snapshot (CANONICAL) ---------- */
  const medical = person
    ? await getMedicalSnapshot(person.id)
    : null;

  /* ---------- Emergency Contacts (per person) ---------- */
  const { data: contacts } = person
    ? await supabase
        .from('emergency_contacts')
        .select('id, name, relationship, phone')
        .eq('person_id', person.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-6 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome to MyERDoc
          </h1>
          <p className="text-slate-600">
            {intakeComplete
              ? 'Your intake is complete. You have full access to on-call ER physicians.'
              : 'Your intake is still in progress. Complete it to activate full access.'}
          </p>
        </header>

        {/* Status Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account Status</h2>
          <div style={{ maxWidth: '320px' }} className="space-y-2 text-sm mt-4">
            <div className="flex">
              <span className="font-medium text-slate-700 w-32 shrink-0">Intake:</span>
              <span className={intakeComplete ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                {intakeComplete ? 'Complete' : 'In progress'}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-slate-700 w-32 shrink-0">Vitals kit:</span>
              <span className="text-slate-900">{vitalsKitLabel(membership.vitals_kit_status)}</span>
            </div>
          </div>
        </section>

        {/* Your details - EDITABLE */}
        <EditPersonalInfo person={person} />

        {/* Medical snapshot - EDITABLE */}
        <EditMedicalInfo person={person} medical={medical} membershipId={membership.id} />

        {/* Emergency contacts - EDITABLE */}
        {person && (
          <EditEmergencyContacts 
            membershipId={membership.id}
            personId={person.id}
            contacts={contacts || []} 
          />
        )}
      </div>
    </div>
  );
}
