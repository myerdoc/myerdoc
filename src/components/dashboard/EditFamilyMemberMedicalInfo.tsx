'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  sex_at_birth: string | null;
};

type Medical = {
  conditions: Array<{ id: string; condition_label: string; active: boolean }>;
  allergies: Array<{ id: string; allergen: string; reaction: string | null; severity: string | null; active: boolean }>;
  medications: Array<{ id: string; medication_name: string; dose: string | null; frequency: string | null; route: string | null; active: boolean }>;
  surgeries: Array<{ id: string; procedure: string; approximate_date: string | null; notes: string | null }>;
};

export default function EditFamilyMemberMedicalInfo({ 
  person, 
  membershipId 
}: { 
  person: Person; 
  membershipId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medical, setMedical] = useState<Medical | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [sexAtBirth, setSexAtBirth] = useState(person.sex_at_birth || '');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [surgeries, setSurgeries] = useState('');

  useEffect(() => {
    loadMedicalData();
  }, [person.id]);

  async function loadMedicalData() {
    setLoading(true);
    
    const [conditionsRes, allergiesRes, medicationsRes, surgeriesRes] = await Promise.all([
      supabase.from('medical_conditions').select('*').eq('person_id', person.id).eq('active', true),
      supabase.from('allergies').select('*').eq('person_id', person.id).eq('active', true),
      supabase.from('medications').select('*').eq('person_id', person.id).eq('active', true),
      supabase.from('surgical_history').select('*').eq('person_id', person.id),
    ]);

    const medicalData = {
      conditions: conditionsRes.data || [],
      allergies: allergiesRes.data || [],
      medications: medicationsRes.data || [],
      surgeries: surgeriesRes.data || [],
    };

    setMedical(medicalData);
    
    // Set form state
    setSexAtBirth(person.sex_at_birth || '');
    setConditions(medicalData.conditions.map(c => c.condition_label).join(', '));
    setAllergies(medicalData.allergies.map(a => a.allergen).join(', '));
    setMedications(
      medicalData.medications.map(m => 
        `${m.medication_name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` ${m.frequency}` : ''}`
      ).join(', ')
    );
    setSurgeries(
      medicalData.surgeries.map(s => 
        `${s.procedure}${s.approximate_date ? ` (${s.approximate_date})` : ''}`
      ).join(', ')
    );
    
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      // DEBUG: Check auth status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('=== DEBUG: Save Family Member Medical Info ===');
      console.log('Current user:', user?.id);
      console.log('Person ID:', person.id);
      console.log('Membership ID:', membershipId);
      
      if (authError || !user) {
        throw new Error('You must be logged in to save changes');
      }

      // Step 1: Update sex_at_birth on the person record
      console.log('Updating person record...');
      const { error: personError } = await supabase
        .from('people')
        .update({ sex_at_birth: sexAtBirth })
        .eq('id', person.id);

      if (personError) {
        console.error('Person update error:', personError);
        throw new Error(`Failed to update personal info: ${personError.message}`);
      }
      console.log('Person record updated successfully');

      // Step 2: Delete existing medical data
      console.log('Deleting existing medical data...');
      
      const { error: deleteConditionsError } = await supabase
        .from('medical_conditions')
        .delete()
        .eq('person_id', person.id);
      
      if (deleteConditionsError) {
        console.error('Delete conditions error:', deleteConditionsError);
        throw new Error(`Failed to update conditions: ${deleteConditionsError.message}`);
      }
      console.log('Conditions deleted');

      const { error: deleteAllergiesError } = await supabase
        .from('allergies')
        .delete()
        .eq('person_id', person.id);
      
      if (deleteAllergiesError) {
        console.error('Delete allergies error:', deleteAllergiesError);
        throw new Error(`Failed to update allergies: ${deleteAllergiesError.message}`);
      }
      console.log('Allergies deleted');

      const { error: deleteMedicationsError } = await supabase
        .from('medications')
        .delete()
        .eq('person_id', person.id);
      
      if (deleteMedicationsError) {
        console.error('Delete medications error:', deleteMedicationsError);
        throw new Error(`Failed to update medications: ${deleteMedicationsError.message}`);
      }
      console.log('Medications deleted');

      const { error: deleteSurgeriesError } = await supabase
        .from('surgical_history')
        .delete()
        .eq('person_id', person.id);
      
      if (deleteSurgeriesError) {
        console.error('Delete surgeries error:', deleteSurgeriesError);
        throw new Error(`Failed to update surgical history: ${deleteSurgeriesError.message}`);
      }
      console.log('Surgical history deleted');

      // Step 3: Insert new conditions
      if (conditions.trim()) {
        const conditionList = conditions.split(',').map(c => c.trim()).filter(Boolean);
        console.log('Inserting conditions:', conditionList);
        
        const { error: insertConditionsError } = await supabase
          .from('medical_conditions')
          .insert(
            conditionList.map(condition => ({
              person_id: person.id,
              condition_label: condition,
              active: true,
              source: 'patient_edit',
            }))
          );

        if (insertConditionsError) {
          console.error('Insert conditions error:', insertConditionsError);
          throw new Error(`Failed to save conditions: ${insertConditionsError.message}`);
        }
        console.log('Conditions inserted successfully');
      }

      // Step 4: Insert new allergies
      if (allergies.trim()) {
        const allergyList = allergies.split(',').map(a => a.trim()).filter(Boolean);
        console.log('Inserting allergies:', allergyList);
        
        const { error: insertAllergiesError } = await supabase
          .from('allergies')
          .insert(
            allergyList.map(allergen => ({
              person_id: person.id,
              allergen: allergen,
              active: true,
              source: 'patient_edit',
            }))
          );

        if (insertAllergiesError) {
          console.error('Insert allergies error:', insertAllergiesError);
          throw new Error(`Failed to save allergies: ${insertAllergiesError.message}`);
        }
        console.log('Allergies inserted successfully');
      }

      // Step 5: Insert new medications
      if (medications.trim()) {
        const medList = medications.split(',').map(m => m.trim()).filter(Boolean);
        console.log('Inserting medications:', medList);
        
        const medicationRecords = medList.map(med => {
          const parts = med.split(' ');
          const medication_name = parts[0] || med;
          const rest = parts.slice(1).join(' ');
          
          return {
            person_id: person.id,
            medication_name: medication_name,
            dose: rest || null,
            active: true,
            source: 'patient_edit',
          };
        });

        const { error: insertMedicationsError } = await supabase
          .from('medications')
          .insert(medicationRecords);

        if (insertMedicationsError) {
          console.error('Insert medications error:', insertMedicationsError);
          throw new Error(`Failed to save medications: ${insertMedicationsError.message}`);
        }
        console.log('Medications inserted successfully');
      }

      // Step 6: Insert new surgical history
      if (surgeries.trim()) {
        const surgeryList = surgeries.split(',').map(s => s.trim()).filter(Boolean);
        console.log('Inserting surgeries:', surgeryList);
        
        const surgeryRecords = surgeryList.map(surgery => {
          const match = surgery.match(/^(.+?)\s*\((\d{4})\)$/);
          const procedure = match ? match[1].trim() : surgery;
          const approximate_date = match ? match[2] : null;
          
          return {
            person_id: person.id,
            procedure: procedure,
            approximate_date: approximate_date,
            source: 'patient_edit',
          };
        });

        const { error: insertSurgeriesError } = await supabase
          .from('surgical_history')
          .insert(surgeryRecords);

        if (insertSurgeriesError) {
          console.error('Insert surgeries error:', insertSurgeriesError);
          throw new Error(`Failed to save surgical history: ${insertSurgeriesError.message}`);
        }
        console.log('Surgical history inserted successfully');
      }

      console.log('=== All saves completed successfully ===');
      
      // Reload medical data instead of full page reload
      await loadMedicalData();
      setSaving(false);
      setIsEditing(false);

    } catch (err) {
      console.error('=== SAVE ERROR ===', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes. Please try again.');
      setSaving(false);
    }
  }

  function handleCancel() {
    if (medical) {
      setSexAtBirth(person.sex_at_birth || '');
      setConditions(medical.conditions.map(c => c.condition_label).join(', '));
      setAllergies(medical.allergies.map(a => a.allergen).join(', '));
      setMedications(
        medical.medications.map(m => 
          `${m.medication_name}${m.dose ? ` ${m.dose}` : ''}${m.frequency ? ` ${m.frequency}` : ''}`
        ).join(', ')
      );
      setSurgeries(
        medical.surgeries.map(s => 
          `${s.procedure}${s.approximate_date ? ` (${s.approximate_date})` : ''}`
        ).join(', ')
      );
    }
    setIsEditing(false);
    setError(null);
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Medical snapshot</h2>
        <p className="text-sm text-slate-500">Loading...</p>
      </section>
    );
  }

  if (!medical) {
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
