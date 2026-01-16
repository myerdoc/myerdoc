import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChangePassword from '@/components/ChangePassword';

export default async function ClinicianSettings() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Verify user is a clinician
  const { data: clinician } = await supabase
    .from('clinicians')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!clinician) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8">
          <Link 
            href="/clinician/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account security and preferences
          </p>
        </div>

        <div className="space-y-6">
          <ChangePassword userType="clinician" />
          
          {/* Add other settings sections here as needed */}
        </div>
      </div>
    </div>
  );
}
