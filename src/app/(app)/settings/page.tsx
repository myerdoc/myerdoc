import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChangePassword from '@/components/ChangePassword';
import ChangeEmail from '@/components/ChangeEmail';
import UpdateContactInfo from '@/components/UpdateContactInfo';

export default async function PatientSettings() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get the user's membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    redirect('/login');
  }

  // Get the person record for contact info
  const { data: person } = await supabase
    .from('people')
    .select('id, phone, address_line1, address_line2, city, state, postal_code')
    .eq('membership_id', membership.id)
    .eq('relationship', 'self')
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Account Settings</h1>
          <p className="text-slate-600">
            Manage your account security and preferences
          </p>
        </header>

        {/* Change Email */}
        <ChangeEmail currentEmail={user.email || ''} />

        {/* Update Contact Info */}
        {person && (
          <UpdateContactInfo 
            personId={person.id}
            currentPhone={person.phone}
            currentAddress={{
              line1: person.address_line1,
              line2: person.address_line2,
              city: person.city,
              state: person.state,
              postalCode: person.postal_code,
            }}
          />
        )}

        {/* Change Password */}
        <ChangePassword userType="patient" />
      </div>
    </div>
  );
}