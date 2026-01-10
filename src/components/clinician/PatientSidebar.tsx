// components/clinician/PatientSidebar.tsx
'use client';

import { useState } from 'react';
import PriorConsultations from './PriorConsultations';

export default function PatientSidebar({ patient, consultationId }) {
    const [activeTab, setActiveTab] = useState('overview');

    function calculateAge(dateOfBirth) {
        // Parse date parts directly to avoid timezone issues
        const [year, month, day] = dateOfBirth.split('-').map(Number);
        const today = new Date();
        let age = today.getFullYear() - year;
        const monthDiff = today.getMonth() + 1 - month; // getMonth() is 0-indexed
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
            age--;
        }
        return age;
    }

    // Timezone-safe date formatting for date-only strings (YYYY-MM-DD)
    function formatDateOfBirth(dateString) {
        if (!dateString) return 'Unknown';
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return dateString;
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'history', label: 'Prior Visits' }
    ];

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Patient Header */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    {patient.preferred_name || patient.first_name} {patient.last_name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    {calculateAge(patient.date_of_birth)} years old
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                            activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="p-6 space-y-6">
                        {/* Demographics */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Demographics
                            </h3>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-gray-600">Date of Birth</dt>
                                    <dd className="text-gray-900">
                                        {formatDateOfBirth(patient.date_of_birth)}
                                    </dd>
                                </div>
                                {patient.sex_at_birth && (
                                    <div>
                                        <dt className="text-gray-600">Sex</dt>
                                        <dd className="text-gray-900 capitalize">{patient.sex_at_birth}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Allergies - CRITICAL */}
                        <div>
                            <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                                <span className="text-red-600">⚠️</span> Allergies
                            </h3>
                            {!patient.allergies || patient.allergies.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">No known allergies</p>
                            ) : (
                                <ul className="space-y-3">
                                    {patient.allergies.map((allergy) => (
                                        <li key={allergy.id} className="text-sm bg-red-50 p-3 rounded border border-red-200">
                                            <div className="font-medium text-red-900">
                                                {allergy.allergen}
                                            </div>
                                            {allergy.reaction && (
                                                <div className="text-xs text-gray-700 mt-1">
                                                    Reaction: {allergy.reaction}
                                                </div>
                                            )}
                                            {allergy.severity && (
                                                <div className="text-xs text-red-700 mt-1 font-medium">
                                                    Severity: {allergy.severity}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Medical Conditions - UPDATED to split comma-separated */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Medical Conditions
                            </h3>
                            {!patient.medical_conditions || patient.medical_conditions.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">None reported</p>
                            ) : (
                                <ul className="space-y-3">
                                    {patient.medical_conditions.flatMap((condition) => {
                                        // Split comma-separated conditions into individual items
                                        const labels = condition.condition_label.split(',').map(s => s.trim());
                                        
                                        return labels.map((label, idx) => (
                                            <li key={`${condition.id}-${idx}`} className="text-sm bg-gray-50 p-3 rounded border border-gray-200">
                                                <div className="font-medium text-gray-900">
                                                    {label}
                                                </div>
                                                {condition.created_at && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Added: {new Date(condition.created_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {condition.source && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Source: {condition.source}
                                                    </div>
                                                )}
                                            </li>
                                        ));
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Medications */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Medications
                            </h3>
                            {!patient.medications || patient.medications.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">No medications reported</p>
                            ) : (
                                <ul className="space-y-3">
                                    {patient.medications.map((medication) => (
                                        <li key={medication.id} className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                                            <div className="font-medium text-gray-900">
                                                {medication.medication_name}
                                            </div>
                                            {medication.dose && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {medication.dose}
                                                </div>
                                            )}
                                            {medication.frequency && (
                                                <div className="text-xs text-gray-600">
                                                    Frequency: {medication.frequency}
                                                </div>
                                            )}
                                            {medication.route && (
                                                <div className="text-xs text-gray-600">
                                                    Route: {medication.route}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Surgical History */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Surgical History
                            </h3>
                            {!patient.surgical_history || patient.surgical_history.length === 0 ? (
                                <p className="text-sm text-gray-600 italic">None reported</p>
                            ) : (
                                <ul className="space-y-3">
                                    {patient.surgical_history.map((surgery) => (
                                        <li key={surgery.id} className="text-sm bg-purple-50 p-3 rounded border border-purple-200">
                                            <div className="font-medium text-gray-900">
                                                {surgery.procedure}
                                            </div>
                                            {surgery.approximate_date && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Date: {surgery.approximate_date}
                                                </div>
                                            )}
                                            {surgery.notes && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {surgery.notes}
                                                </div>
                                            )}
                                            {surgery.source && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Source: {surgery.source}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <PriorConsultations 
                        personId={patient.id}
                        currentConsultationId={consultationId}
                    />
                )}
            </div>
        </aside>
    );
}
