// components/clinician/PriorConsultations.jsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, ChevronUp, FileText, Calendar, Plus } from 'lucide-react';

export default function PriorConsultations({ personId, currentConsultationId }) {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [addendums, setAddendums] = useState({});

    useEffect(() => {
        if (personId) {
            fetchPriorConsultations();
        }
    }, [personId]);

    async function fetchPriorConsultations() {
        try {
            const supabase = createClient();
            
            // Fetch completed consultations for this person
            const { data, error } = await supabase
                .from('consultation_requests')
                .select('*')
                .eq('person_id', personId)
                .eq('status', 'completed')
                .neq('id', currentConsultationId) // Exclude current consultation
                .order('completed_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setConsultations(data || []);
        } catch (error) {
            console.error('Error fetching prior consultations:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAddendums(consultationId) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('consultation_addendums')
                .select(`
                    *,
                    clinicians (
                        first_name,
                        last_name,
                        credentials
                    )
                `)
                .eq('consultation_id', consultationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAddendums(prev => ({ ...prev, [consultationId]: data || [] }));
        } catch (error) {
            console.error('Error fetching addendums:', error);
        }
    }

    function toggleExpand(consultationId) {
        const newExpandedId = expandedId === consultationId ? null : consultationId;
        setExpandedId(newExpandedId);
        
        // Fetch addendums when expanding
        if (newExpandedId && !addendums[consultationId]) {
            fetchAddendums(consultationId);
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (consultations.length === 0) {
        return (
            <div className="p-4 text-sm text-gray-500 italic">
                No prior consultations
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="px-4 pt-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Prior Consultations
            </h3>
            
            <div className="divide-y divide-gray-200">
                {consultations.map(consultation => {
                    const isExpanded = expandedId === consultation.id;
                    const consultationAddendums = addendums[consultation.id] || [];

                    return (
                        <div key={consultation.id} className="bg-white">
                            {/* Consultation Header */}
                            <button
                                onClick={() => toggleExpand(consultation.id)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {consultation.chief_complaint}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {formatDate(consultation.completed_at)}
                                        </p>
                                        {consultationAddendums.length > 0 && (
                                            <p className="text-xs text-blue-600 mt-1">
                                                {consultationAddendums.length} addendum{consultationAddendums.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-3 bg-gray-50">
                                    {/* Diagnosis */}
                                    {consultation.diagnosis && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 mb-1">
                                                Diagnosis
                                            </dt>
                                            <dd className="text-sm text-gray-900">
                                                {consultation.diagnosis}
                                            </dd>
                                        </div>
                                    )}

                                    {/* Clinical Summary */}
                                    {consultation.clinical_summary && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 mb-1">
                                                Clinical Summary
                                            </dt>
                                            <dd className="text-xs text-gray-700 max-h-32 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                                                <pre className="whitespace-pre-wrap font-sans">
                                                    {consultation.clinical_summary}
                                                </pre>
                                            </dd>
                                        </div>
                                    )}

                                    {/* Treatment Plan */}
                                    {consultation.treatment_plan && (
                                        <div>
                                            <dt className="text-xs font-medium text-gray-500 mb-1">
                                                Treatment Plan
                                            </dt>
                                            <dd className="text-xs text-gray-700 max-h-32 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                                                <pre className="whitespace-pre-wrap font-sans">
                                                    {consultation.treatment_plan}
                                                </pre>
                                            </dd>
                                        </div>
                                    )}

                                    {/* Addendums */}
                                    {consultationAddendums.length > 0 && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <dt className="text-xs font-medium text-gray-700 mb-2">
                                                Addendums
                                            </dt>
                                            <div className="space-y-2">
                                                {consultationAddendums.map(addendum => (
                                                    <div
                                                        key={addendum.id}
                                                        className="bg-amber-50 border border-amber-200 rounded p-2"
                                                    >
                                                        <div className="flex items-start justify-between mb-1">
                                                            <span className="text-xs font-medium text-amber-900">
                                                                {addendum.addendum_type.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-amber-700">
                                                                {formatDate(addendum.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-900 whitespace-pre-wrap">
                                                            {addendum.addendum_text}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            — Dr. {addendum.clinicians.last_name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Addendum Button */}
                                    <button
                                        onClick={() => {
                                            // This will be handled by parent component
                                            window.dispatchEvent(
                                                new CustomEvent('openAddendumModal', {
                                                    detail: { consultationId: consultation.id }
                                                })
                                            );
                                        }}
                                        className="w-full mt-2 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Addendum
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
