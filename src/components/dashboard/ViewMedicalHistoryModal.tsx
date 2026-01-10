'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getMedicalSnapshot } from '@/server/medical/getMedicalSnapshot';

type Props = {
  personId: string;
  firstName: string;
  lastName: string;
  isOpen: boolean;
  onClose: () => void;
};

type MedicalSnapshot = {
  conditions: Array<{ id: string; condition_label: string; active: boolean }>;
  medications: Array<{ id: string; medication_name: string; dose: string | null; active: boolean }>;
  allergies: Array<{ id: string; allergen: string; severity: string | null; active: boolean }>;
  surgeries: Array<{ id: string; procedure: string; approximate_date: string | null }>;
};

export default function ViewMedicalHistoryModal({ personId, firstName, lastName, isOpen, onClose }: Props) {
  const [medical, setMedical] = useState<MedicalSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && personId) {
      loadMedicalData();
    }
  }, [isOpen, personId]);

  async function loadMedicalData() {
    setLoading(true);
    try {
      const data = await getMedicalSnapshot(personId);
      setMedical(data);
    } catch (err) {
      console.error('Failed to load medical data:', err);
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Medical History: {firstName} {lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              <p className="mt-2 text-sm text-slate-600">Loading medical history...</p>
            </div>
          ) : medical ? (
            <div className="space-y-6">
              {/* Medical Conditions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Medical Conditions</h3>
                {medical.conditions.filter(c => c.active).length > 0 ? (
                  <ul className="space-y-1">
                    {medical.conditions.filter(c => c.active).map(condition => (
                      <li key={condition.id} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {condition.condition_label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">None reported</p>
                )}
              </div>

              {/* Medications */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Current Medications</h3>
                {medical.medications.filter(m => m.active).length > 0 ? (
                  <ul className="space-y-1">
                    {medical.medications.filter(m => m.active).map(med => (
                      <li key={med.id} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {med.medication_name}
                        {med.dose && <span className="text-slate-500">({med.dose})</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">None reported</p>
                )}
              </div>

              {/* Allergies */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Allergies</h3>
                {medical.allergies.filter(a => a.active).length > 0 ? (
                  <ul className="space-y-1">
                    {medical.allergies.filter(a => a.active).map(allergy => (
                      <li key={allergy.id} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        {allergy.allergen}
                        {allergy.severity && <span className="text-red-600 text-xs font-medium">({allergy.severity})</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">None reported</p>
                )}
              </div>

              {/* Surgical History */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Surgical History</h3>
                {medical.surgeries.length > 0 ? (
                  <ul className="space-y-1">
                    {medical.surgeries.map(surgery => (
                      <li key={surgery.id} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {surgery.procedure}
                        {surgery.approximate_date && (
                          <span className="text-slate-500 text-xs">({surgery.approximate_date})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">None reported</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No medical data available</p>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
