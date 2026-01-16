// components/clinician/ConsultationWorkspace.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logAudit } from '@/lib/utils/auditLog';
import PatientSidebar from './PatientSidebar';
import AddendumModal from './AddendumModal';

interface ConsultationWorkspaceProps {
    consultationId: string;
}

interface VitalsData {
    bp_systolic?: number | null;
    bp_diastolic?: number | null;
    hr?: number | null;
    temp?: number | null;
    rr?: number | null;
    o2?: number | null;
    recorded_at?: string;
}

interface Consultation {
    id: string;
    person_id?: string | null;
    status: string;
    chief_complaint: string;
    symptoms?: string | null;
    diagnosis?: string | null;
    clinical_summary?: string | null;
    treatment_plan?: string | null;
    physician_notes?: string | null;
    vitals_data?: VitalsData | null;
    created_at: string;
    updated_at: string;
    completed_at?: string | null;
    reviewed_at?: string | null;
    clinician_id?: string | null;
    assigned_physician_id?: string | null;
    available_in?: string | null;
    callback_phone?: string | null;
    consultation_goals?: string[] | null;
    urgency_level?: string | null;
    [key: string]: any;
}

interface Patient {
    id: string;
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    date_of_birth: string;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    phone?: string | null;
    intake_complete?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    medical_conditions?: any[];
    surgical_history?: any[];
    allergies?: any[];
    medications?: any[];
    [key: string]: any;
}

interface Addendum {
    id: string;
    consultation_id: string;
    addendum_text: string;
    addendum_type: 'general' | 'correction' | 'clarification' | 'follow_up';
    reason?: string | null;
    created_at: string;
    clinicians?: {
        first_name: string;
        last_name: string;
        credentials: string;
    } | null;
}

export default function ConsultationWorkspace({ consultationId }: ConsultationWorkspaceProps) {
    const supabase = createClient();
    const router = useRouter();
    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Addendum modal state
    const [addendumModalOpen, setAddendumModalOpen] = useState(false);
    const [addendums, setAddendums] = useState<Addendum[]>([]);
    const [loadingAddendums, setLoadingAddendums] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        diagnosis: '',
        clinical_summary: '',
        treatment_plan: '',
        physician_notes: ''
    });

    // Vitals state
    const [vitals, setVitals] = useState({
        bp_systolic: '',
        bp_diastolic: '',
        hr: '',
        temp: '',
        rr: '',
        o2: ''
    });

    // Check if consultation is completed
    const isCompleted = consultation?.status === 'completed';

    // Debug logging
    useEffect(() => {
        if (consultation) {
            console.log('Consultation status:', consultation.status);
            console.log('isCompleted:', isCompleted);
        }
    }, [consultation, isCompleted]);

    // Fetch consultation data on mount
    useEffect(() => {
        if (consultationId) {
            fetchConsultation();
            fetchAddendums();
        }
    }, [consultationId]);

     // Listen for addendum modal events from PriorConsultations component
    useEffect(() => {
        const handleOpenAddendum = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('Opening addendum for prior consultation:', customEvent.detail.consultationId);
        };

        window.addEventListener('openAddendumModal', handleOpenAddendum);
        
        return () => {
            window.removeEventListener('openAddendumModal', handleOpenAddendum);
        };
    }, []);

    async function fetchConsultation() {
        try {
            const { data: consultationDataRaw, error: consultationError } = await supabase
                .from('consultation_requests')
                .select('*')
                .eq('id', consultationId)
                .single();

            if (consultationError) throw consultationError;

            // Cast to our Consultation type immediately
            const consultationData = consultationDataRaw as any as Consultation;

            if (!consultationData.person_id) {
                throw new Error('Consultation does not have a patient ID');
            }

            const { data: patientDataRaw, error: patientError } = await supabase
                .from('people')
                .select(`
                    *,
                    medical_conditions (*),
                    surgical_history (*),
                    allergies (*),
                    medications (*)
                `)
                .eq('id', consultationData.person_id)
                .single();

            if (patientError) throw patientError;

            // Cast to our Patient type immediately
            const patientData = patientDataRaw as any as Patient;

            setConsultation(consultationData);
            setPatient(patientData);
            
            setFormData({
                diagnosis: consultationData.diagnosis || '',
                clinical_summary: consultationData.clinical_summary || '',
                treatment_plan: consultationData.treatment_plan || '',
                physician_notes: consultationData.physician_notes || ''
            });

            // Load existing vitals data
            if (consultationData.vitals_data) {
                setVitals({
                    bp_systolic: consultationData.vitals_data.bp_systolic?.toString() || '',
                    bp_diastolic: consultationData.vitals_data.bp_diastolic?.toString() || '',
                    hr: consultationData.vitals_data.hr?.toString() || '',
                    temp: consultationData.vitals_data.temp?.toString() || '',
                    rr: consultationData.vitals_data.rr?.toString() || '',
                    o2: consultationData.vitals_data.o2?.toString() || ''
                });
            }

            await logAudit(
                'VIEW_CONSULTATION',
                'consultation_request',
                consultationId,
                consultationData.person_id,
                { screen: 'consultation_workspace' }
            );
        } catch (error) {
            console.error('Error fetching consultation:', error);
            alert('Failed to load consultation');
        } finally {
            setLoading(false);
        }
    }

    async function fetchAddendums() {
        if (!consultationId) return;
        
        setLoadingAddendums(true);
        try {
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
            console.log('Fetched addendums:', data);
            setAddendums((data || []) as Addendum[]);
        } catch (error) {
            console.error('Error fetching addendums:', error);
        } finally {
            setLoadingAddendums(false);
        }
    }

    // Build vitals_data object for saving
    function buildVitalsData(): VitalsData | null {
        // Only include vitals if at least one value is entered
        const hasVitals = vitals.bp_systolic || vitals.bp_diastolic || vitals.hr || 
                         vitals.temp || vitals.rr || vitals.o2;
        
        if (!hasVitals) return null;

        return {
            bp_systolic: vitals.bp_systolic ? parseInt(vitals.bp_systolic) : null,
            bp_diastolic: vitals.bp_diastolic ? parseInt(vitals.bp_diastolic) : null,
            hr: vitals.hr ? parseInt(vitals.hr) : null,
            temp: vitals.temp ? parseFloat(vitals.temp) : null,
            rr: vitals.rr ? parseInt(vitals.rr) : null,
            o2: vitals.o2 ? parseInt(vitals.o2) : null,
            recorded_at: new Date().toISOString()
        };
    }

    async function handleSaveDraft() {
        if (isCompleted) {
            alert('Cannot edit a completed consultation. Please add an addendum instead.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('consultation_requests')
                .update({
                    diagnosis: formData.diagnosis,
                    clinical_summary: formData.clinical_summary,
                    treatment_plan: formData.treatment_plan,
                    physician_notes: formData.physician_notes,
                    vitals_data: buildVitalsData() as any,
                    updated_at: new Date().toISOString()
                })
                .eq('id', consultationId);

            if (error) throw error;

            alert('Draft saved successfully');
            await fetchConsultation();
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft');
        } finally {
            setSaving(false);
        }
    }

    async function handleComplete() {
        if (isCompleted) {
            alert('This consultation is already completed.');
            return;
        }

        if (!formData.diagnosis.trim()) {
            alert('Please enter a diagnosis');
            return;
        }
        if (!formData.clinical_summary.trim()) {
            alert('Please enter a clinical summary');
            return;
        }

        if (!consultation) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('consultation_requests')
                .update({
                    diagnosis: formData.diagnosis,
                    clinical_summary: formData.clinical_summary,
                    treatment_plan: formData.treatment_plan,
                    physician_notes: formData.physician_notes,
                    vitals_data: buildVitalsData() as any,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', consultationId);

            if (error) throw error;

            await logAudit(
                'COMPLETE_CONSULTATION',
                'consultation_request',
                consultationId,
                consultation.person_id!,
                { diagnosis: formData.diagnosis }
            );

            alert('Consultation completed successfully');
            router.push('/clinician/dashboard');
        } catch (error) {
            console.error('Error completing consultation:', error);
            alert('Failed to complete consultation');
        } finally {
            setSaving(false);
        }
    }

    function handleAddendumSuccess(addendum: Addendum) {
        console.log('Addendum created successfully:', addendum);
        fetchAddendums();
    }

    function handleInputChange(field: string, value: string) {
        if (isCompleted) {
            alert('Cannot edit a completed consultation. Please add an addendum instead.');
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    function handleVitalsChange(field: string, value: string) {
        if (isCompleted) {
            return; // Silently ignore for vitals
        }
        // Only allow numbers (and decimal for temp)
        if (field === 'temp') {
            if (value && !/^\d*\.?\d*$/.test(value)) return;
        } else {
            if (value && !/^\d*$/.test(value)) return;
        }
        setVitals(prev => ({ ...prev, [field]: value }));
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function getAddendumTypeBadge(type: string) {
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
    }

    // Check if any vitals have been recorded
    const hasVitalsData = vitals.bp_systolic || vitals.bp_diastolic || vitals.hr || 
                          vitals.temp || vitals.rr || vitals.o2;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!consultation || !patient) {
        return <div className="p-8">Consultation not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                                aria-label="Open patient sidebar"
                            >
                                <svg
                                    className="w-6 h-6 text-gray-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <button
                                onClick={() => router.push('/clinician/dashboard')}
                                className="text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                                ← Back to Dashboard
                            </button>
                            <span className="text-gray-400 hidden sm:inline">|</span>
                            <h1 className="text-xl font-semibold hidden sm:block">
                                {consultation.chief_complaint}
                            </h1>
                            {isCompleted && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Completed
                                </span>
                            )}
                        </div>
                        {!isCompleted && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={saving}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={saving}
                                    className="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Mark as Complete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="md:flex h-[calc(100vh-80px)]">
                {/* Mobile Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Patient Sidebar - Collapsible on Mobile */}
                <div
                    className={`
                        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 overflow-y-auto transform transition-transform duration-300 ease-in-out
                        md:static md:transform-none
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}
                >
                    {/* Close button for mobile */}
                    <div className="md:hidden flex justify-end p-4 border-b border-gray-200">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-md hover:bg-gray-100"
                            aria-label="Close sidebar"
                        >
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <PatientSidebar patient={patient} consultationId={consultationId} />
                </div>
                
                {/* Main Workspace */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Completed Banner */}
                        {isCompleted && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong>This consultation is completed.</strong> The original record is now read-only. 
                                    To add additional information, scroll down to the "Addendums" section.
                                </p>
                            </div>
                        )}

                        {/* Chief Complaint */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Chief Complaint</h3>
                            <p className="text-gray-700">{consultation.chief_complaint}</p>
                            {consultation.symptoms && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Symptoms:</h4>
                                    <p className="text-gray-700">{consultation.symptoms}</p>
                                </div>
                            )}
                        </div>

                        {/* Vitals Section */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    Vital Signs
                                    {isCompleted && <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>}
                                </h3>
                                {consultation.vitals_data?.recorded_at && (
                                    <span className="text-xs text-gray-500">
                                        Recorded: {formatDate(consultation.vitals_data.recorded_at)}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-end gap-6">
                                {/* Blood Pressure */}
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Blood Pressure
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={vitals.bp_systolic}
                                            onChange={(e) => handleVitalsChange('bp_systolic', e.target.value)}
                                            placeholder="120"
                                            disabled={isCompleted}
                                            maxLength={3}
                                            style={{ width: '48px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-gray-400">/</span>
                                        <input
                                            type="text"
                                            value={vitals.bp_diastolic}
                                            onChange={(e) => handleVitalsChange('bp_diastolic', e.target.value)}
                                            placeholder="80"
                                            disabled={isCompleted}
                                            maxLength={3}
                                            style={{ width: '42px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-xs text-gray-500">mmHg</span>
                                    </div>
                                </div>

                                {/* Heart Rate */}
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        HR
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={vitals.hr}
                                            onChange={(e) => handleVitalsChange('hr', e.target.value)}
                                            placeholder="72"
                                            disabled={isCompleted}
                                            maxLength={3}
                                            style={{ width: '42px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-xs text-gray-500">bpm</span>
                                    </div>
                                </div>

                                {/* Temperature */}
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Temp
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={vitals.temp}
                                            onChange={(e) => handleVitalsChange('temp', e.target.value)}
                                            placeholder="98.6"
                                            disabled={isCompleted}
                                            maxLength={5}
                                            style={{ width: '52px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-xs text-gray-500">°F</span>
                                    </div>
                                </div>

                                {/* Respiratory Rate */}
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RR
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={vitals.rr}
                                            onChange={(e) => handleVitalsChange('rr', e.target.value)}
                                            placeholder="16"
                                            disabled={isCompleted}
                                            maxLength={2}
                                            style={{ width: '36px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-xs text-gray-500">/min</span>
                                    </div>
                                </div>

                                {/* O2 Saturation */}
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SpO₂
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="text"
                                            value={vitals.o2}
                                            onChange={(e) => handleVitalsChange('o2', e.target.value)}
                                            placeholder="98"
                                            disabled={isCompleted}
                                            maxLength={3}
                                            style={{ width: '42px' }}
                                            className="px-1 py-2 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <span className="text-xs text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vitals warnings/notes */}
                            {hasVitalsData && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-2">
                                        {vitals.bp_systolic && parseInt(vitals.bp_systolic) >= 140 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                ⚠️ Elevated BP
                                            </span>
                                        )}
                                        {vitals.hr && (parseInt(vitals.hr) < 60 || parseInt(vitals.hr) > 100) && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                ⚠️ Abnormal HR
                                            </span>
                                        )}
                                        {vitals.temp && parseFloat(vitals.temp) >= 100.4 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                🌡️ Fever
                                            </span>
                                        )}
                                        {vitals.o2 && parseInt(vitals.o2) < 95 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                ⚠️ Low O₂
                                            </span>
                                        )}
                                        {vitals.rr && (parseInt(vitals.rr) < 12 || parseInt(vitals.rr) > 20) && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                ⚠️ Abnormal RR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <label className="block text-lg font-semibold mb-4">
                                Diagnosis {!isCompleted && <span className="text-red-500">*</span>}
                                {isCompleted && <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>}
                            </label>
                            <input
                                type="text"
                                value={formData.diagnosis}
                                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                                placeholder="Enter primary diagnosis"
                                disabled={isCompleted}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Clinical Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <label className="block text-lg font-semibold mb-4">
                                Clinical Summary (SOAP Format) {!isCompleted && <span className="text-red-500">*</span>}
                                {isCompleted && <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>}
                            </label>
                            <textarea
                                value={formData.clinical_summary}
                                onChange={(e) => handleInputChange('clinical_summary', e.target.value)}
                                placeholder="S: Patient presents with...&#10;O: Vitals show...&#10;A: Diagnosis of...&#10;P: Treatment plan includes..."
                                rows={10}
                                disabled={isCompleted}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Treatment Plan */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <label className="block text-lg font-semibold mb-4">
                                Treatment Plan
                                {isCompleted && <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>}
                            </label>
                            <textarea
                                value={formData.treatment_plan}
                                onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                                placeholder="1. Rest and hydration..."
                                rows={6}
                                disabled={isCompleted}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Physician Notes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <label className="block text-lg font-semibold mb-4">
                                Physician Notes
                                <span className="ml-2 text-sm font-normal text-gray-500">(Internal use only)</span>
                                {isCompleted && <span className="ml-2 text-xs font-normal text-gray-500">(Read-only)</span>}
                            </label>
                            <textarea
                                value={formData.physician_notes}
                                onChange={(e) => handleInputChange('physician_notes', e.target.value)}
                                placeholder="Private notes for internal use only..."
                                rows={4}
                                disabled={isCompleted}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-yellow-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* ADDENDUMS SECTION - Enhanced visibility */}
                        {isCompleted && (
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-4 border-amber-400">
                                {/* Big prominent header */}
                                <div className="px-6 py-5 bg-amber-100 border-b-2 border-amber-300">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Addendums</h3>
                                            <p className="text-sm text-gray-600 mt-1">Add corrections, clarifications, or follow-up notes</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                console.log('Add Addendum button clicked!');
                                                setAddendumModalOpen(true);
                                            }}
                                            className="px-6 py-3 bg-amber-600 text-gray-900 rounded-lg text-base font-bold hover:bg-amber-700 hover:text-white shadow-lg transform hover:scale-105 transition-all border-2 border-amber-800"
                                        >
                                            <span className="text-xl mr-2">+</span>
                                            Add Addendum
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    {loadingAddendums ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                                            <p className="text-sm text-gray-600 mt-2">Loading addendums...</p>
                                        </div>
                                    ) : addendums.length === 0 ? (
                                        <div className="text-center py-12 bg-amber-50 rounded-lg border-2 border-dashed border-amber-300">
                                            <p className="text-base text-gray-700 font-medium mb-2">
                                                No addendums yet
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Click the "Add Addendum" button above to add additional notes, corrections, or follow-up information.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {addendums.map((addendum: Addendum) => (
                                                <div
                                                    key={addendum.id}
                                                    className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5 shadow-sm"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {getAddendumTypeBadge(addendum.addendum_type)}
                                                            {addendum.reason && (
                                                                <span className="text-sm text-gray-700 font-medium">
                                                                    • {addendum.reason}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatDate(addendum.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-base text-gray-900 whitespace-pre-wrap mb-3 leading-relaxed">
                                                        {addendum.addendum_text}
                                                    </p>
                                                    <p className="text-sm text-gray-700 font-medium">
                                                        — Dr. {addendum.clinicians?.last_name || 'Unknown'}, {addendum.clinicians?.credentials || ''}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons (only for non-completed) */}
                        {!isCompleted && (
                            <div className="flex justify-end space-x-4 pb-8">
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={saving}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={saving}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Complete Consultation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Addendum Modal */}
            <AddendumModal
                isOpen={addendumModalOpen}
                onClose={() => {
                    console.log('Closing addendum modal');
                    setAddendumModalOpen(false);
                }}
                consultationId={consultationId}
                onSuccess={handleAddendumSuccess}
            />
        </div>
    );
}
