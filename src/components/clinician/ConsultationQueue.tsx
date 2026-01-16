// components/clinician/ConsultationQueue.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ConsultationQueueProps {
    onStatsUpdate?: () => void;
    clinicianId?: string;
}

interface Consultation {
    id: string;
    created_at: string;
    patient_name: string;
    age: number;
    chief_complaint: string;
    clinician_name: string | null;
    status: string;
}

export default function ConsultationQueue({ onStatsUpdate, clinicianId }: ConsultationQueueProps) {
    const supabase = createClient();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    useEffect(() => {
        fetchConsultations();
        
        // Set up realtime subscription
        const subscription = supabase
            .channel('consultation_changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'consultation_requests' 
                }, 
                (payload) => {
                    console.log('Consultation updated:', payload);
                    fetchConsultations();
                    onStatsUpdate?.();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [filter]);

    async function fetchConsultations() {
        try {
            let query = supabase
                .from('consultation_queue')
                .select('*')
                .order('created_at', { ascending: true });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setConsultations(data || []);
        } catch (error) {
            console.error('Error fetching consultations:', error);
        } finally {
            setLoading(false);
        }
    }

    async function claimConsultation(consultationId: string) {
        try {
            const { error } = await supabase
                .from('consultation_requests')
                .update({
                    assigned_physician_id: clinicianId,
                    status: 'in_progress',
                    started_at: new Date().toISOString()
                })
                .eq('id', consultationId);

            if (error) throw error;

            // Navigate to consultation workspace
            router.push(`/clinician/consultation-requests/${consultationId}`);
        } catch (error) {
            console.error('Error claiming consultation:', error);
            alert('Failed to claim consultation');
        }
    }

    function getUrgencyColor(createdAt: string) {
        const minutesAgo = (Date.now() - new Date(createdAt).getTime()) / 1000 / 60;
        if (minutesAgo < 30) return 'bg-green-100 text-green-800';
        if (minutesAgo < 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    function getTimeAgo(createdAt: string) {
        const minutesAgo = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000 / 60);
        if (minutesAgo < 60) return `${minutesAgo}m ago`;
        const hoursAgo = Math.floor(minutesAgo / 60);
        if (hoursAgo < 24) return `${hoursAgo}h ago`;
        return `${Math.floor(hoursAgo / 24)}d ago`;
    }

    if (loading) {
        return <div className="text-center py-8">Loading consultations...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Consultation Queue
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                filter === 'pending'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('in_progress')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                filter === 'in_progress'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            In Progress
                        </button>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {consultations.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-500">No consultations in queue</p>
                    </div>
                ) : (
                    consultations.map((consultation) => (
                        <div
                            key={consultation.id}
                            className="px-6 py-4 hover:bg-gray-50 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                                                consultation.created_at
                                            )}`}
                                        >
                                            {getTimeAgo(consultation.created_at)}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {consultation.patient_name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            Age {consultation.age}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Chief Complaint:</span>{' '}
                                            {consultation.chief_complaint}
                                        </p>
                                        {consultation.clinician_name && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Assigned to:</span>{' '}
                                                {consultation.clinician_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() =>
                                                router.push(`/clinician/consultation-requests/${consultation.id}`)
                                            }
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                                        >
                                            View Details →
                                        </button>
                                        {consultation.status === 'pending' && (
                                            <button
                                                onClick={() => claimConsultation(consultation.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition cursor-pointer"
                                            >
                                                Claim Consultation
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-4">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            consultation.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : consultation.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {consultation.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
