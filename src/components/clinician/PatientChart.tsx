'use client';

import { useState } from 'react';
import { PatientChartData } from '@/server/patient/getPatientChart';
import { formatDistanceToNow } from 'date-fns';

interface PatientChartProps {
  data: PatientChartData;
}

export default function PatientChart({ data }: PatientChartProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'medical' | 'consultations' | 'audit'
  >('overview');
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const selectedConsultationData = data.consultations.find(
    (c) => c.id === selectedConsultation
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {data.person.profile_photo_url ? (
                <img
                  src={data.person.profile_photo_url}
                  alt={`${data.person.first_name} ${data.person.last_name}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {data.person.first_name[0]}
                  {data.person.last_name[0]}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {data.person.first_name} {data.person.last_name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {calculateAge(data.person.date_of_birth)} years old • DOB:{' '}
                  {formatDate(data.person.date_of_birth)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Patient since {formatDate(data.person.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {data.membership && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    data.membership.status
                  )}`}
                >
                  {data.membership.status.replace('_', ' ').toUpperCase()}
                  {data.membership.plan_type && ` - ${data.membership.plan_type}`}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`${
                  activeTab === 'medical'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Medical History
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`${
                  activeTab === 'consultations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Consultation History ({data.consultations.length})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Audit Trail
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-gray-900">
                      {data.person.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="mt-1 text-gray-900">{data.person.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="mt-1 text-gray-900">
                      {data.person.address && data.person.city
                        ? `${data.person.address}, ${data.person.city}, ${data.person.state} ${data.person.zip_code}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Emergency Contacts
                </h2>
                {data.emergencyContacts && data.emergencyContacts.length > 0 ? (
                  <div className="space-y-4">
                    {data.emergencyContacts.filter(c => c && c.id).map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {contact.name}
                            </p>
                            {contact.is_primary && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {contact.relationship}
                          </p>
                          <p className="text-sm text-gray-600">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No emergency contacts on file</p>
                )}
              </div>

              {/* Family Members */}
              {data.familyMembers && data.familyMembers.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Family Members (Same Membership)
                  </h2>
                  <div className="space-y-3">
                    {data.familyMembers.filter(m => m && m.id).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.relationship} •{' '}
                            {calculateAge(member.date_of_birth)} years old
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Medical Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Medical Summary
                </h2>
                <div className="space-y-4">
                  {data.medicalHistory.bloodType && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Blood Type
                      </label>
                      <p className="mt-1 text-lg font-semibold text-red-600">
                        {data.medicalHistory.bloodType}
                      </p>
                    </div>
                  )}
                  {data.medicalHistory.allergies && data.medicalHistory.allergies.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-red-600">
                        ⚠️ Allergies
                      </label>
                      <ul className="mt-2 space-y-1">
                        {data.medicalHistory.allergies.filter(a => a && a.id).map((allergy) => (
                          <li
                            key={allergy.id}
                            className="text-sm text-gray-900 bg-red-50 px-3 py-2 rounded"
                          >
                            <span className="font-medium">{allergy.allergen}</span>
                            {allergy.severity && (
                              <span className="text-xs text-red-600 ml-2">
                                ({allergy.severity})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.medicalHistory.medications && data.medicalHistory.medications.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Current Medications
                      </label>
                      <ul className="mt-2 space-y-1">
                        {data.medicalHistory.medications.filter(m => m && m.id).map((med) => (
                          <li key={med.id} className="text-sm text-gray-900">
                            • {med.medication_name}
                            {med.dosage && ` - ${med.dosage}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.medicalHistory.conditions && data.medicalHistory.conditions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Medical Conditions
                      </label>
                      <ul className="mt-2 space-y-1">
                        {data.medicalHistory.conditions.filter(c => c && c.id).map((condition) => (
                          <li key={condition.id} className="text-sm text-gray-900">
                            • {condition.condition_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {data.consultations && data.consultations.length > 0 ? (
                    data.consultations.slice(0, 3).filter(c => c && c.id).map((consult) => (
                    <div
                      key={consult.id}
                      className="text-sm text-gray-600 border-l-2 border-blue-500 pl-3"
                    >
                      <p className="font-medium text-gray-900">
                        {consult.chief_complaint}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(consult.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No recent consultations
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical History Tab */}
        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Medical Conditions
              </h2>
              {data.medicalHistory.conditions && data.medicalHistory.conditions.length > 0 ? (
                <ul className="space-y-3">
                  {data.medicalHistory.conditions.filter(c => c && c.id).map((condition) => (
                    <li
                      key={condition.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="font-medium text-gray-900">
                        {condition.condition_name}
                      </p>
                      {condition.diagnosed_date && (
                        <p className="text-sm text-gray-600 mt-1">
                          Diagnosed: {formatDate(condition.diagnosed_date)}
                        </p>
                      )}
                      {condition.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {condition.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No medical conditions reported</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Allergies
              </h2>
              {data.medicalHistory.allergies && data.medicalHistory.allergies.length > 0 ? (
                <ul className="space-y-3">
                  {data.medicalHistory.allergies.filter(a => a && a.id).map((allergy) => (
                    <li
                      key={allergy.id}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="font-medium text-gray-900">
                        ⚠️ {allergy.allergen}
                      </p>
                      {allergy.severity && (
                        <p className="text-sm text-red-600 mt-1">
                          Severity: {allergy.severity}
                        </p>
                      )}
                      {allergy.reaction && (
                        <p className="text-sm text-gray-600 mt-1">
                          Reaction: {allergy.reaction}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No known allergies</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Medications
              </h2>
              {data.medicalHistory.medications && data.medicalHistory.medications.length > 0 ? (
                <ul className="space-y-3">
                  {data.medicalHistory.medications.filter(m => m && m.id).map((med) => (
                    <li key={med.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {med.medication_name}
                      </p>
                      {med.dosage && (
                        <p className="text-sm text-gray-600 mt-1">
                          Dosage: {med.dosage}
                        </p>
                      )}
                      {med.frequency && (
                        <p className="text-sm text-gray-600">
                          Frequency: {med.frequency}
                        </p>
                      )}
                      {med.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {med.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No current medications</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Surgical History
              </h2>
              {data.medicalHistory.surgeries && data.medicalHistory.surgeries.length > 0 ? (
                <ul className="space-y-3">
                  {data.medicalHistory.surgeries.filter(s => s && s.id).map((surgery) => (
                    <li key={surgery.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">
                        {surgery.surgery_name}
                      </p>
                      {surgery.surgery_date && (
                        <p className="text-sm text-gray-600 mt-1">
                          Date: {formatDate(surgery.surgery_date)}
                        </p>
                      )}
                      {surgery.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {surgery.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No surgical history reported</p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vitals
              </h2>
              <div className="space-y-3">
                {data.medicalHistory.height && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Height</span>
                    <span className="font-medium text-gray-900">
                      {data.medicalHistory.height} cm
                    </span>
                  </div>
                )}
                {data.medicalHistory.weight && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-medium text-gray-900">
                      {data.medicalHistory.weight} kg
                    </span>
                  </div>
                )}
                {!data.medicalHistory.height && !data.medicalHistory.weight && (
                  <p className="text-gray-500">No vitals recorded</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Consultation History
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {data.consultations.length} total consultations
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {data.consultations && data.consultations.length > 0 ? (
                    data.consultations.map((consult) => (
                      consult && consult.id ? (
                      <div
                        key={consult.id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedConsultation === consult.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : ''
                        }`}
                        onClick={() => setSelectedConsultation(consult.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  consult.status
                                )}`}
                              >
                                {consult.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {consult.chief_complaint}
                            </h3>
                            {consult.diagnosis && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Diagnosis:</span>{' '}
                                {consult.diagnosis}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                              <span>{formatDateTime(consult.created_at)}</span>
                              {consult.clinician_name && (
                                <span>• Dr. {consult.clinician_name}</span>
                              )}
                            </div>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              selectedConsultation === consult.id
                                ? 'rotate-90'
                                : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                      ) : null
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No consultation history available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Detail Panel */}
            <div>
              {selectedConsultationData ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Consultation Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Chief Complaint
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedConsultationData.chief_complaint}
                      </p>
                    </div>
                    {selectedConsultationData.diagnosis && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Diagnosis
                        </label>
                        <p className="mt-1 text-gray-900">
                          {selectedConsultationData.diagnosis}
                        </p>
                      </div>
                    )}
                    {selectedConsultationData.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Notes
                        </label>
                        <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                          {selectedConsultationData.notes}
                        </p>
                      </div>
                    )}
                    {selectedConsultationData.treatment_plan && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Treatment Plan
                        </label>
                        <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                          {selectedConsultationData.treatment_plan}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Clinician
                      </label>
                      <p className="mt-1 text-gray-900">
                        {selectedConsultationData.clinician_name ||
                          'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Date
                      </label>
                      <p className="mt-1 text-gray-900">
                        {formatDateTime(selectedConsultationData.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                  Select a consultation to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Access Audit Trail
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                HIPAA-compliant record of who has accessed this patient's data
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.auditTrail && data.auditTrail.length > 0 ? (
                    data.auditTrail.filter(log => log && log.id).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {log.user_role}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.details ? (
                            typeof log.details === 'string' 
                              ? log.details 
                              : JSON.stringify(log.details)
                          ) : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No audit trail records available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
