import ConsultationWorkspace from '@/components/clinician/ConsultationWorkspace'

export const metadata = {
  title: 'Consultation - MyERDoc',
  description: 'Review and complete consultation',
}

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }> // Changed to Promise
}) {
  const { id } = await params; // Await the params
  
  return <ConsultationWorkspace consultationId={id} />
}