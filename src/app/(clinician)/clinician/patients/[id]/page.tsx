import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPatientChart } from '@/server/patient/getPatientChart';
import PatientChart from '@/components/clinician/PatientChart';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    consultationId?: string;
  };
}

export default async function PatientChartPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { data, error } = await getPatientChart(id);

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Unable to Load Patient Chart
            </h2>
            <p className="mt-2 text-gray-600">
              {error || 'The patient chart could not be loaded'}
            </p>
            <Link
              href="/clinician/dashboard"
              className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

return <PatientChart data={data} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const { data } = await getPatientChart(id);

  if (!data) {
    return {
      title: 'Patient Chart | MyERDoc',
    };
  }

  return {
    title: `${data.person.first_name} ${data.person.last_name} - Patient Chart | MyERDoc`,
    description: `Medical chart for ${data.person.first_name} ${data.person.last_name}`,
  };
}