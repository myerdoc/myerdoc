import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMedicalSnapshot } from '@/server/medical/getMedicalSnapshot';
import RequestConsultationButton from '@/components/dashboard/RequestConsultationButton';
import FamilyMembersList from '@/components/dashboard/FamilyMembersList';
import ConsultationHistory from '@/components/dashboard/ConsultationHistory';

/* =========================
   Helpers
========================= */

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

  /* ---------- All Family Members ---------- */
  const { data: familyMembers } = await supabase
    .from('people')
    .select(`
      id,
      first_name,
      last_name,
      preferred_name,
      date_of_birth,
      relationship,
      phone,
      sex_at_birth,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      intake_complete
    `)
    .eq('membership_id', membership.id)
    .order('relationship', { ascending: true });

  // Transform family members to ensure intake_complete is always boolean
  const safeFamilyMembers = (familyMembers || []).map((member: any) => ({
    ...member,
    intake_complete: member.intake_complete ?? false
  }));

  /* ---------- Active Consultation (if any) ---------- */
  const { data: activeConsultation, error: consultationError } = await supabase
    .from('consultation_requests')
    .select('id, status, created_at, chief_complaint')
    .eq('membership_id', membership.id)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Handle query errors by treating as no active consultation
  const safeActiveConsultation = consultationError || !activeConsultation ? null : {
    ...activeConsultation,
    status: activeConsultation.status ?? 'pending',
    created_at: activeConsultation.created_at ?? new Date().toISOString()
  };

  /* ---------- Consultation History ---------- */
  const { data: consultationHistory } = await supabase
    .from('consultation_requests')
    .select(`
      id,
      created_at,
      completed_at,
      status,
      chief_complaint,
      person_id,
      diagnosis,
      clinical_summary,
      treatment_plan,
      symptoms
    `)
    .eq('membership_id', membership.id)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(20);

  // Get unique person IDs from consultations
  const personIds = [...new Set((consultationHistory || []).map((c: any) => c.person_id))] as string[];
  
  // Fetch all people data in one query
  const { data: peopleData } = await supabase
    .from('people')
    .select('id, first_name, last_name, preferred_name, relationship')
    .in('id', personIds);

  // Create a map for quick lookup
  const peopleMap = new Map(
    (peopleData || []).map(person => [person.id, person])
  );

  // Transform consultation history data with null safety
  const formattedHistory = (consultationHistory || []).map((consult: any) => {
    const person = peopleMap.get(consult.person_id);
    return {
      id: consult.id,
      created_at: consult.created_at ?? new Date().toISOString(),
      completed_at: consult.completed_at ?? undefined,
      status: consult.status ?? 'unknown',
      chief_complaint: consult.chief_complaint,
      symptoms: consult.symptoms ?? undefined,
      diagnosis: consult.diagnosis ?? undefined,
      clinical_summary: consult.clinical_summary ?? undefined,
      treatment_plan: consult.treatment_plan ?? undefined,
      summary_url: undefined,
      family_member_name: person?.preferred_name || 
        `${person?.first_name} ${person?.last_name}` || 'Unknown',
      family_member_relationship: person?.relationship || 'unknown',
    };
  });

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6 space-y-8">
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

        {/* Consultation Request CTA */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <RequestConsultationButton 
            intakeComplete={intakeComplete}
            activeConsultation={safeActiveConsultation}
            membershipId={membership.id}
            personId={person?.id}
            callbackPhone={person?.phone}
            familyMembers={safeFamilyMembers}
          />
        </section>

        {/* Status Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Account Status</h2>
          <div className="space-y-2 text-sm mt-4">
            <div className="flex gap-2">
              <span className="font-medium text-slate-700 w-28 shrink-0">Intake:</span>
              <span className={intakeComplete ? 'text-green-700 font-medium' : 'text-amber-700 font-medium'}>
                {intakeComplete ? 'Complete' : 'In progress'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-slate-700 w-28 shrink-0">Vitals kit:</span>
              <span className="text-slate-900">{vitalsKitLabel(membership.vitals_kit_status)}</span>
            </div>
          </div>
        </section>

        {/* Family Members */}
        <FamilyMembersList 
          membershipId={membership.id}
          familyMembers={safeFamilyMembers}
        />

        {/* Consultation History */}
        <ConsultationHistory consultations={formattedHistory} />
      </div>
    </div>
  );
}