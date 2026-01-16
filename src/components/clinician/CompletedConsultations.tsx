// components/clinician/CompletedConsultations.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Calendar, User, ChevronRight } from 'lucide-react';

interface Person {
    id: string;
    first_name: string;
    last_name: string;
    preferred_name: string | null;
    date_of_birth: string;
}

interface Consultation {
    id: string;
    chief_complaint: string;
    diagnosis: string | null;
    status: string | null;
    completed_at: string | null;
    created_at: string | null;
    person_id: string;
    people: Person;
}

export default function CompletedConsultations() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const router = useRouter();
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchCompletedConsultations();
    }, []);

    async function fetchCompletedConsultations() {
        try {
            const supabase = createClient();

            // Get current clinician
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: clinician } = await supabase
                .from('clinicians')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!clinician) throw new Error('No clinician record found');

            // Fetch completed consultations
            const { data, error } = await supabase
                .from('consultation_requests')
                .select(`
                    id,
                    chief_complaint,
                    diagnosis,
                    status,
                    completed_at,
                    created_at,
                    person_id,
                    people (
                        id,
                        first_name,
                        last_name,
                        preferred_name,
                        date_of_birth
                    )
                `)
                .eq('status', 'completed')
                .order('completed_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setConsultations(data || []);
        } catch (error) {
            console.error('Error fetching completed consultations:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateString: string | null) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function calculateAge(dateOfBirth: string) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function handleViewConsultation(consultationId: string) {
        router.push(`/clinician/consultation-requests/${consultationId}`);
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (consultations.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <p className="text-center text-gray-600">No completed consultations</p>
            </div>
        );
    }

    // Pagination
    const totalPages = Math.ceil(consultations.length / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedConsultations = consultations.slice(startIndex, endIndex);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Completed Consultations
                    </h2>
                    <span className="text-sm text-gray-600">
                        {consultations.length} total
                    </span>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-200">
                {paginatedConsultations.map((consultation) => {
                    const patientName = consultation.people.preferred_name || 
                        `${consultation.people.first_name} ${consultation.people.last_name}`;
                    const patientAge = calculateAge(consultation.people.date_of_birth);

                    return (
                        <button
                            key={consultation.id}
                            onClick={() => handleViewConsultation(consultation.id)}
                            className="w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Chief Complaint & Diagnosis */}
                                    <div className="mb-2">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {consultation.chief_complaint}
                                        </h3>
                                        {consultation.diagnosis && (
                                            <p className="text-sm text-gray-600 truncate mt-0.5">
                                                Diagnosis: {consultation.diagnosis}
                                            </p>
                                        )}
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {patientName}, {patientAge}y
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(consultation.completed_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow Icon */}
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}