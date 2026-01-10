'use client';

import Link from 'next/link';

interface ViewFullChartButtonProps {
  patientId: string;
  consultationId?: string;
  className?: string;
}

export default function ViewFullChartButton({
  patientId,
  consultationId,
  className = '',
}: ViewFullChartButtonProps) {
  const href = consultationId 
    ? `/clinician/patients/${patientId}?consultationId=${consultationId}`
    : `/clinician/patients/${patientId}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className}`}
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      View Full Chart
    </Link>
  );
}