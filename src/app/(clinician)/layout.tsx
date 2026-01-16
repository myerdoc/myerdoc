import { createServerSupabaseClient } from '@/lib/supabase/server' // Changed
import { redirect } from 'next/navigation'

export default async function ClinicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient() // Added await
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Verify clinician role
  const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', session.user.id)
  .single()

  if (roleData?.role !== 'clinician' && roleData?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}