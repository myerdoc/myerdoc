// components/dashboard/ConsultationHistory.tsx
// UPDATED VERSION - Shows addendums to patients

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Calendar, User, Stethoscope, ClipboardList, Pill, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ConsultationRecord {
  id: string;
  created_at: string;
  status: string;
  chief_complaint: string;
  symptoms?: string;
  diagnosis?: string;
  clinical_summary?: string;
  treatment_plan?: string;
  family_member_name: string;
  family_member_relationship: string;
  summary_url?: string;
  completed_at?: string;
}

interface Addendum {
  id: string;
  addendum_text: string;
  addendum_type: string;
  reason?: string;
  created_at: string;
  clinicians: {
    first_name: string;
    last_name: string;
    credentials: string;
  } | null;
}

interface ConsultationHistoryProps {
  consultations: ConsultationRecord[];
}

export default function ConsultationHistory({ consultations }: ConsultationHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addendums, setAddendums] = useState<Record<string, Addendum[]>>({});

  // Filter to show completed and cancelled consultations
  const historicalConsultations = consultations.filter(
    c => c.status === 'completed' || c.status === 'cancelled'
  );

  if (historicalConsultations.length === 0) {
    return null;
  }

  const toggleExpand = async (id: string) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);
    
    // Fetch addendums when expanding if not already loaded
    if (newExpandedId && !addendums[id]) {
      await fetchAddendums(id);
    }
  };

  async function fetchAddendums(consultationId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
          Cancelled
        </span>
      );
    }
    return null;
  };

  const getAddendumTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      general: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Update' },
      correction: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Correction' },
      clarification: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Clarification' },
      follow_up: { bg: 'bg-green-100', text: 'text-green-800', label: 'Follow-up' },
    };
    const badge = badges[type] || badges.general;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Helper function to format clinician name
  const formatClinicianName = (clinician: Addendum['clinicians']) => {
    if (!clinician) {
      return 'Your care team';
    }
    const name = clinician.last_name || 'Unknown';
    const credentials = clinician.credentials || '';
    return credentials ? `Dr. ${name}, ${credentials}` : `Dr. ${name}`;
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Consultation History
          </h2>
          <span className="text-sm text-slate-500">
            {historicalConsultations.length} consultation{historicalConsultations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {historicalConsultations.map((consultation) => {
          const isExpanded = expandedId === consultation.id;
          const isCompleted = consultation.status === 'completed';
          const hasDetails = isCompleted && (
            consultation.diagnosis || 
            consultation.clinical_summary || 
            consultation.treatment_plan
          );
          const consultationAddendums = addendums[consultation.id] || [];

          return (
            <div key={consultation.id} className="bg-white">
              {/* Consultation Row - Clickable */}
              <button
                onClick={() => toggleExpand(consultation.id)}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors duration-150"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Chief Complaint with Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-slate-900">
                        {consultation.chief_complaint}
                      </h3>
                      {getStatusBadge(consultation.status)}
                      {consultationAddendums.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          {consultationAddendums.length} Update{consultationAddendums.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(consultation.completed_at || consultation.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {consultation.family_member_name}
                        {consultation.family_member_relationship !== 'self' && (
                          <span className="text-slate-500">
                            ({consultation.family_member_relationship})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                  {!isCompleted ? (
                    <div className="pt-4">
                      <p className="text-sm text-slate-600 italic">
                        This consultation was {consultation.status}. 
                        {consultation.status === 'cancelled' && ' No details available.'}
                      </p>
                    </div>
                  ) : !hasDetails ? (
                    <div className="pt-4">
                      <p className="text-sm text-slate-600 italic">
                        Consultation details are not available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-4">
                      {/* Chief Complaint & Symptoms */}
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start gap-2 mb-2">
                          <ClipboardList className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div className="flex-1">
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                              Chief Complaint
                            </dt>
                            <dd className="text-sm text-slate-900">
                              {consultation.chief_complaint}
                            </dd>
                            {consultation.symptoms && (
                              <dd className="text-sm text-slate-600 mt-1">
                                {consultation.symptoms}
                              </dd>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Diagnosis */}
                      {consultation.diagnosis && (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <Stethoscope className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                                Diagnosis
                              </dt>
                              <dd className="text-sm text-slate-900 font-medium">
                                {consultation.diagnosis}
                              </dd>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Clinical Summary */}
                      {consultation.clinical_summary && (
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div className="flex-1">
                              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Clinical Summary
                              </dt>
                              <dd className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                                {consultation.clinical_summary}
                              </dd>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Treatment Plan */}
                      {consultation.treatment_plan && (
                        <div className="bg-white rounded-lg p-4 border border-blue-100 bg-blue-50/30">
                          <div className="flex items-start gap-2">
                            <Pill className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-2">
                                Treatment Plan & Instructions
                              </dt>
                              <dd className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                                {consultation.treatment_plan}
                              </dd>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Addendums */}
                      {consultationAddendums.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-amber-200">
                          <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                              <dt className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                                Updates & Additional Notes
                              </dt>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {consultationAddendums.map((addendum) => (
                              <div
                                key={addendum.id}
                                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    {getAddendumTypeBadge(addendum.addendum_type)}
                                    {addendum.reason && (
                                      <span className="text-xs text-slate-600">
                                        • {addendum.reason}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500 whitespace-nowrap">
                                    {formatDateTime(addendum.created_at)}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-900 whitespace-pre-wrap mb-2">
                                  {addendum.addendum_text}
                                </p>
                                <p className="text-xs text-slate-600">
                                  — {formatClinicianName(addendum.clinicians)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary Link (if exists) */}
                      {consultation.summary_url && (
                        <div className="pt-2">
                          <a
                            href={consultation.summary_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Download Full Summary
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
