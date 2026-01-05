'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  phone: string | null;
  sex_at_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
} | null;

type Medical = {
  conditions: Array<{ id: string; condition_label: string; active: boolean }>;
  allergies: Array<{ id: string; allergen: string; reaction: string | null; severity: string | null; active: boolean }>;
  medications: Array<{ id: string; medication_name: string; dose: string | null; frequency: string | null; route: string | null; active: boolean }>;
  surgeries: Array<{ id: string; procedure: string; approximate_date: string | null; notes: string | null }>;
} | null;

export default function EditMedicalInfo({ 
  person, 
  medical, 
  membershipId 
}: { 
  person: Person; 
  medical: Medical; 
  membershipId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [sexAtBirth, setSexAtBirth] = useState(person?.sex_at_birth || '');
  const [conditions, setConditions] = useState(
    medical?.conditions.map(c => c.condition_label).join(', ') || ''
  );
  const [allergies, setAllergies] = useState(
    medical?.allergies.map(a => a.allergen).join(', ') || ''
  );
  const [medications, setMedications] = useState(
    medical?.medications.map(m => 
      `${m.medication_name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` ${m.frequency}` : ''}`
    ).join(', ') || ''
  );
  const [surgeries, setSurgeries] = useState(
    medical?.surgeries.map(s => 
      `${s.procedure}${s.approximate_date ? ` (${s.approximate_date})` : ''}`
    ).join(', ') || ''
  );

  async function handleSave() {
    if (!person) return;
    
    setSaving(true);
    setError(null);

    // Update sex_at_birth on the person record
    const { error: personError } = await supabase
      .from('people')
      .update({ sex_at_birth: sexAtBirth || null })
      .eq('id', person.id);

    if (personError) {
      setError('Failed to update information');
      setSaving(false);
      return;
    }

    // Handle medical_conditions (not "conditions")
    await supabase.from('medical_conditions').delete().eq('person_id', person.id);
    if (conditions.trim()) {
      const conditionList = conditions.split(',').map(c => c.trim()).filter(Boolean);
      for (const condition of conditionList) {
        await supabase.from('medical_conditions').insert({
          person_id: person.id,
          condition_label: condition,
          active: true,
          source: 'patient_reported',
        });
      }
    }

    // Handle allergies
    await supabase.from('allergies').delete().eq('person_id', person.id);
    if (allergies.trim()) {
      const allergyList = allergies.split(',').map(a => a.trim()).filter(Boolean);
      for (const allergen of allergyList) {
        await supabase.from('allergies').insert({
          person_id: person.id,
          allergen: allergen,
          active: true,
          source: 'patient_reported',
        });
      }
    }

    // Handle medications
    await supabase.from('medications').delete().eq('person_id', person.id);
    if (medications.trim()) {
      const medList = medications.split(',').map(m => m.trim()).filter(Boolean);
      for (const med of medList) {
        // Try to parse medication name and dose/frequency
        const parts = med.split(' ');
        const medication_name = parts[0] || med;
        const rest = parts.slice(1).join(' ');
        
        await supabase.from('medications').insert({
          person_id: person.id,
          medication_name: medication_name,
          dose: rest || null,
          active: true,
          source: 'patient_reported',
        });
      }
    }

    // Handle surgical_history (not "surgeries")
    await supabase.from('surgical_history').delete().eq('person_id', person.id);
    if (surgeries.trim()) {
      const surgeryList = surgeries.split(',').map(s => s.trim()).filter(Boolean);
      for (const surgery of surgeryList) {
        // Try to parse procedure and date
        const match = surgery.match(/^(.+?)\s*\((\d{4})\)$/);
        const procedure = match ? match[1].trim() : surgery;
        const approximate_date = match ? match[2] : null;
        
        await supabase.from('surgical_history').insert({
          person_id: person.id,
          procedure: procedure,
          approximate_date: approximate_date,
          source: 'patient_reported',
        });
      }
    }

    setSaving(false);
    setIsEditing(false);
    window.location.reload();
  }

  function handleCancel() {
    setSexAtBirth(person?.sex_at_birth || '');
    setConditions(medical?.conditions.map(c => c.condition_label).join(', ') || '');
    setAllergies(medical?.allergies.map(a => a.allergen).join(', ') || '');
    setMedications(
      medical?.medications.map(m => 
        `${m.medication_name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` ${m.frequency}` : ''}`
      ).join(', ') || ''
    );
    setSurgeries(
      medical?.surgeries.map(s => 
        `${s.procedure}${s.approximate_date ? ` (${s.approximate_date})` : ''}`
      ).join(', ') || ''
    );
    setIsEditing(false);
    setError(null);
  }

  if (!person || !medical) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Medical snapshot</h2>
        <p className="text-sm text-slate-500">No medical information on file yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Medical snapshot</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isEditing ? (
        <div className="space-y-2 text-sm mt-4">
          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Sex at birth:</span>
            <span className="text-slate-900">{person.sex_at_birth || 'Not specified'}</span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Conditions:</span>
            <span className="text-slate-900">
              {medical.conditions.length
                ? medical.conditions.map(c => c.condition_label).join(', ')
                : 'None'}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Allergies:</span>
            <span className="text-slate-900">
              {medical.allergies.length
                ? medical.allergies.map(a => 
                    `${a.allergen}${a.reaction ? ` (${a.reaction})` : ''}`
                  ).join(', ')
                : 'None'}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Medications:</span>
            <span className="text-slate-900">
              {medical.medications.length
                ? medical.medications.map(m =>
                    `${m.medication_name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`
                  ).join(', ')
                : 'None listed'}
            </span>
          </div>

          <div className="flex gap-2">
            <span className="font-medium text-slate-700 w-28 shrink-0">Surgical history:</span>
            <span className="text-slate-900">
              {medical.surgeries.length
                ? medical.surgeries.map(s => 
                    `${s.procedure}${s.approximate_date ? ` (${s.approximate_date})` : ''}`
                  ).join(', ')
                : 'None'}
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-md mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900">Sex at birth</label>
            <select
              value={sexAtBirth}
              onChange={(e) => setSexAtBirth(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Intersex">Intersex</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Conditions</label>
            <input
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g., Hypertension, Diabetes (comma separated)"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple conditions with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Allergies</label>
            <input
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g., Penicillin, Peanuts (comma separated)"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple allergies with commas, or leave blank for none</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Medications</label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g., Lisinopril 20 mg daily, Metformin 500 mg twice daily"
              rows={3}
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">Include name, dose, and frequency for each medication</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900">Surgical history</label>
            <input
              value={surgeries}
              onChange={(e) => setSurgeries(e.target.value)}
              placeholder="e.g., Appendectomy (2015), Knee Arthroscopy (2020)"
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">Include procedure name and year if known</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
