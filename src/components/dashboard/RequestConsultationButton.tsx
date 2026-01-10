'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import CancelConsultationButton from './CancelConsultationButton';

type ActiveConsultation = {
  id: string;
  status: string;
  created_at: string;
  chief_complaint: string;
} | null;

type FamilyMember = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
  intake_complete: boolean;
};

type Props = {
  intakeComplete: boolean;
  activeConsultation: ActiveConsultation;
  membershipId: string;
  personId: string | undefined;
  callbackPhone: string | null | undefined;
  familyMembers?: FamilyMember[];
};

const SYMPTOM_CATEGORIES = [
  'Injury / trauma',
  'Fever / infection',
  'Abdominal pain / GI',
  'Chest pain / breathing issue',
  'Headache / neurologic',
  'Rash / allergic reaction',
  'Pediatric concern',
  'Medication question',
  '"Do we need the ER?"',
  'Other'
];

const RED_FLAGS_GENERAL = [
  'Trouble breathing',
  'Chest pain or chest pressure',
  'New confusion or altered mental status',
  'Loss of consciousness or fainting',
  'New weakness, facial droop, slurred speech',
  'Seizure activity',
  'Severe uncontrolled pain',
  'Active or uncontrolled bleeding'
];

const RED_FLAGS_PEDIATRIC = [
  'Infant < 3 months with fever',
  'Lethargic or difficult to arouse',
  'Poor feeding or markedly decreased wet diapers',
  'Blue or gray lips/skin',
  'Persistent vomiting or dehydration concerns'
];

const RED_FLAGS_MENTAL_HEALTH = [
  'Thoughts of self-harm or concern for immediate safety'
];

const RECENT_CHANGES = [
  'New symptoms not previously discussed',
  'New medication started',
  'Missed medication doses',
  'Recent injury',
  'Recent ER or urgent care visit'
];

const CONSULTATION_GOALS = [
  'Reassurance / watch-and-wait guidance',
  'Help deciding ER vs urgent care vs home',
  'Pediatric-specific guidance',
  'Medication advice',
  'Second opinion',
  'Plan for the next 24–48 hours'
];

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function RequestConsultationButton({
  intakeComplete,
  activeConsultation,
  membershipId,
  personId,
  callbackPhone,
  familyMembers = []
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [redFlagTriggered, setRedFlagTriggered] = useState(false);

  // Step 1: Patient selection
  const [selectedPatientId, setSelectedPatientId] = useState(personId || '');
  const [patientAge, setPatientAge] = useState<number>(0);
  const [locationState, setLocationState] = useState('Utah');
  const [physicallyInUtah, setPhysicallyInUtah] = useState(false);

  // Step 2: Chief concern
  const [chiefConcern, setChiefConcern] = useState('');
  const [symptomCategory, setSymptomCategory] = useState('');

  // Step 3: Timing & severity
  const [symptomOnset, setSymptomOnset] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState('');

  // Step 4: Red flags
  const [redFlagsGeneral, setRedFlagsGeneral] = useState<string[]>([]);
  const [redFlagsPediatric, setRedFlagsPediatric] = useState<string[]>([]);
  const [redFlagsMentalHealth, setRedFlagsMentalHealth] = useState<string[]>([]);
  const [noRedFlagsConfirmed, setNoRedFlagsConfirmed] = useState(false);

  // Step 5: Recent changes
  const [recentChanges, setRecentChanges] = useState<string[]>([]);
  const [recentChangesNotes, setRecentChangesNotes] = useState('');

  // Step 6: Goals
  const [consultationGoals, setConsultationGoals] = useState<string[]>([]);

  // Step 7: Availability
  const [availableIn, setAvailableIn] = useState('15min');
  const [phone, setPhone] = useState(callbackPhone || '');

  // Step 8: Acknowledgement
  const [emergencyAck, setEmergencyAck] = useState(false);

  // Update patient age when selection changes
  const handlePatientSelect = (patId: string) => {
    setSelectedPatientId(patId);
    const patient = familyMembers.find(p => p.id === patId);
    if (patient) {
      setPatientAge(calculateAge(patient.date_of_birth));
    }
  };

  // Check for red flags
  const checkRedFlags = () => {
    const hasRedFlag = 
      redFlagsGeneral.length > 0 || 
      redFlagsPediatric.length > 0 || 
      redFlagsMentalHealth.length > 0;
    
    setRedFlagTriggered(hasRedFlag);
    return hasRedFlag;
  };

  function formatPhoneInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function formatDate(dateString: string) {
    // Use simpler formatting that's consistent between server and client
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${month} ${day} at ${time}`;
  }

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!selectedPatientId) {
        setError('Please select who this consult is for');
        return;
      }
      if (!physicallyInUtah) {
        setError('You must confirm you are physically present in Utah to proceed');
        return;
      }
    }
    if (currentStep === 2 && !chiefConcern.trim()) {
      setError('Please describe what is happening right now');
      return;
    }
    if (currentStep === 4) {
      if (checkRedFlags()) {
        return; // Red flag screen will show
      }
      if (!noRedFlagsConfirmed) {
        setError('Please confirm that none of the red flag symptoms apply');
        return;
      }
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  async function handleSubmit() {
    if (!selectedPatientId) {
      setError('Unable to submit request. Please refresh the page.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a callback phone number.');
      return;
    }

    if (!emergencyAck) {
      setError('Please acknowledge that you understand this is not emergency care.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('consultation_requests')
      .insert({
        membership_id: membershipId,
        person_id: selectedPatientId,
        patient_age: patientAge,
        patient_location_state: locationState,
        
        chief_complaint: chiefConcern.trim(),
        symptom_category: symptomCategory || null,
        symptom_onset: symptomOnset || null,
        symptom_severity: symptomSeverity || null,
        
        red_flags_general: redFlagsGeneral,
        red_flags_pediatric: redFlagsPediatric,
        red_flags_mental_health: redFlagsMentalHealth,
        red_flag_triggered: false,
        
        recent_changes: recentChanges,
        recent_changes_notes: recentChangesNotes.trim() || null,
        
        consultation_goals: consultationGoals,
        
        preferred_contact_method: 'phone',
        available_in: availableIn,
        callback_phone: phone.trim(),
        
        emergency_acknowledgement: emergencyAck,
        
        status: 'pending',
      });

    if (insertError) {
      console.error('Failed to submit consultation request:', insertError);
      setError('Failed to submit request. Please try again.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  function handleCancel() {
    setIsFormOpen(false);
    setCurrentStep(1);
    setError(null);
    setRedFlagTriggered(false);
    // Reset all form fields
    setSelectedPatientId(personId || '');
    setPhysicallyInUtah(false);
    setChiefConcern('');
    setSymptomCategory('');
    setSymptomOnset('');
    setSymptomSeverity('');
    setRedFlagsGeneral([]);
    setRedFlagsPediatric([]);
    setRedFlagsMentalHealth([]);
    setNoRedFlagsConfirmed(false);
    setRecentChanges([]);
    setRecentChangesNotes('');
    setConsultationGoals([]);
    setAvailableIn('15min');
    setPhone(callbackPhone || '');
    setEmergencyAck(false);
  }

  // Success state
  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Request Submitted</h3>
        <p className="text-slate-600 mb-4">
          A physician will contact you shortly at the number provided.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
        >
          Return to dashboard
        </button>
      </div>
    );
  }

  // Active consultation status
  if (activeConsultation) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Active Consultation</h2>
          <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
            activeConsultation.status === 'pending' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {activeConsultation.status === 'pending' ? 'Awaiting physician' : 'In progress'}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-2">
          <span className="font-medium">Submitted:</span>{' '}
          <span suppressHydrationWarning>
            {formatDate(activeConsultation.created_at)}
          </span>
        </p>
        <p className="text-sm text-slate-600 mb-4">
          <span className="font-medium">Concern:</span> {activeConsultation.chief_complaint}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          A physician will contact you shortly. If this is a medical emergency, please call 911.
        </p>
        
        <CancelConsultationButton 
          consultationId={activeConsultation.id}
          membershipId={membershipId}
        />
      </div>
    );
  }

  // Intake not complete
  if (!intakeComplete) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Complete Your Intake</h3>
        <p className="text-slate-600 mb-4">
          To request a physician consultation, please complete your membership intake first.
        </p>
        <a
          href="/intake"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          Continue Intake
        </a>
      </div>
    );
  }

  // Red flag triggered - emergency screen
  if (redFlagTriggered) {
    return (
      <div className="py-6">
        <div className="rounded-lg border-2 border-red-600 bg-red-50 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                This May Be a Medical Emergency
              </h3>
              <p className="text-red-800 mb-4">
                Based on your answers, this consult cannot proceed safely. 
                Please seek immediate medical attention.
              </p>
              <div className="bg-white rounded-md p-4 mb-4">
                <p className="font-bold text-red-900 text-lg mb-2">
                  📞 Call 911 or go to the nearest emergency department now
                </p>
                <p className="text-sm text-red-700">
                  Time is critical. Do not wait for a consultation.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCancel}
            className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
          >
            I Understand — Exit to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show request form
  if (isFormOpen) {
    return (
      <div className="max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Step {currentStep} of 8</span>
            <span>{Math.round((currentStep / 8) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Patient Selection */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Who is this consult for?</h2>
            
            {familyMembers.length > 0 ? (
              <div className="space-y-3 mb-4">
                {familyMembers.map((member) => {
                  const age = calculateAge(member.date_of_birth);
                  const intakeComplete = member.intake_complete;
                  const isDisabled = !intakeComplete;
                  
                  return (
                    <div key={member.id}>
                      <label 
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                          isDisabled
                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                            : selectedPatientId === member.id
                            ? 'border-blue-600 bg-blue-50 cursor-pointer'
                            : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="patient"
                          value={member.id}
                          checked={selectedPatientId === member.id}
                          onChange={(e) => handlePatientSelect(e.target.value)}
                          disabled={isDisabled}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {member.first_name} {member.last_name}
                            </span>
                            {intakeComplete ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Intake Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                ⚠ Intake Needed
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            {age} years old • {member.relationship}
                          </div>
                        </div>
                      </label>
                      
                      {!intakeComplete && (
                        <div className="mt-2 ml-10 text-sm">
                          <a
                            href={`/membership/intake/${member.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Complete intake for {member.first_name}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-600 mb-4">Loading patient information...</p>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Current location (state)
                </label>
                <select
                  value={locationState}
                  onChange={(e) => setLocationState(e.target.value)}
                  disabled
                  className="w-full rounded-md border px-3 py-2 bg-slate-50 text-slate-600"
                >
                  <option value="Utah">Utah</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  MyERDoc is currently available in Utah only
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={physicallyInUtah}
                    onChange={(e) => setPhysicallyInUtah(e.target.checked)}
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-slate-900">
                    <span className="font-medium">I confirm I am physically present in Utah</span>
                    <br />
                    <span className="text-slate-600">Due to medical licensing requirements, our physicians can only provide care to patients currently located in Utah.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Chief Concern */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What's happening right now?</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Chief concern <span className="text-red-500">*</span>
                </label>
                <input
                  value={chiefConcern}
                  onChange={(e) => setChiefConcern(e.target.value)}
                  placeholder="What's going on right now?"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Symptom category
                </label>
                <select
                  value={symptomCategory}
                  onChange={(e) => setSymptomCategory(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="">Select a category...</option>
                  {SYMPTOM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Timing & Severity */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Symptom timing & severity</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  When did this start?
                </label>
                <div className="space-y-2">
                  {['<1 hour', '1–6 hours', '6–24 hours', '24+ hours'].map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="onset"
                        value={option}
                        checked={symptomOnset === option}
                        onChange={(e) => setSymptomOnset(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  How severe is it right now?
                </label>
                <div className="space-y-2">
                  {['Mild', 'Moderate', 'Severe'].map(option => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="severity"
                        value={option}
                        checked={symptomSeverity === option}
                        onChange={(e) => setSymptomSeverity(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Red Flag Safety Check */}
        {currentStep === 4 && (
          <div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">⚠️ Safety Check (Required)</h2>
              <p className="text-sm text-red-800">
                Please check any symptoms that apply. If you check any box, you'll be directed to call 911.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* General Red Flags */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">General Warning Signs</h3>
                <div className="space-y-2">
                  {RED_FLAGS_GENERAL.map(flag => (
                    <label key={flag} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={redFlagsGeneral.includes(flag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRedFlagsGeneral([...redFlagsGeneral, flag]);
                          } else {
                            setRedFlagsGeneral(redFlagsGeneral.filter(f => f !== flag));
                          }
                        }}
                        className="w-4 h-4 mt-0.5"
                      />
                      <span className="text-slate-900">{flag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pediatric Red Flags - show if patient is under 18 */}
              {patientAge < 18 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Pediatric Warning Signs</h3>
                  <div className="space-y-2">
                    {RED_FLAGS_PEDIATRIC.map(flag => (
                      <label key={flag} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={redFlagsPediatric.includes(flag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRedFlagsPediatric([...redFlagsPediatric, flag]);
                            } else {
                              setRedFlagsPediatric(redFlagsPediatric.filter(f => f !== flag));
                            }
                          }}
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className="text-slate-900">{flag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mental Health Safety */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Mental Health Safety</h3>
                <div className="space-y-2">
                  {RED_FLAGS_MENTAL_HEALTH.map(flag => (
                    <label key={flag} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={redFlagsMentalHealth.includes(flag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRedFlagsMentalHealth([...redFlagsMentalHealth, flag]);
                          } else {
                            setRedFlagsMentalHealth(redFlagsMentalHealth.filter(f => f !== flag));
                          }
                        }}
                        className="w-4 h-4 mt-0.5"
                      />
                      <span className="text-slate-900">{flag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* None of the above confirmation */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noRedFlagsConfirmed}
                    onChange={(e) => {
                      setNoRedFlagsConfirmed(e.target.checked);
                      // If they're confirming no red flags, clear any accidentally checked boxes
                      if (e.target.checked) {
                        setRedFlagsGeneral([]);
                        setRedFlagsPediatric([]);
                        setRedFlagsMentalHealth([]);
                      }
                    }}
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-slate-900">
                    <span className="font-medium">I confirm that NONE of the above warning signs apply</span>
                    <br />
                    <span className="text-slate-600">This is required to proceed with your consultation request.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Recent Changes */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent changes since last intake</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {RECENT_CHANGES.map(change => (
                  <label key={change} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={recentChanges.includes(change)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRecentChanges([...recentChanges, change]);
                        } else {
                          setRecentChanges(recentChanges.filter(c => c !== change));
                        }
                      }}
                      className="w-4 h-4 mt-0.5"
                    />
                    <span className="text-slate-900">{change}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Anything new since we last spoke? (optional)
                </label>
                <textarea
                  value={recentChangesNotes}
                  onChange={(e) => setRecentChangesNotes(e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Goals */}
        {currentStep === 6 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">What are you hoping we help with today?</h2>
            
            <div className="space-y-2">
              {CONSULTATION_GOALS.map(goal => (
                <label key={goal} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={consultationGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConsultationGoals([...consultationGoals, goal]);
                      } else {
                        setConsultationGoals(consultationGoals.filter(g => g !== goal));
                      }
                    }}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="text-slate-900">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Availability */}
        {currentStep === 7 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Availability & contact</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Contact method
                </label>
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                  Phone call
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  All consultations are conducted via phone at launch
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Available in
                </label>
                <select
                  value={availableIn}
                  onChange={(e) => setAvailableIn(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="15min">15 minutes</option>
                  <option value="30min">30 minutes</option>
                  <option value="1hour">1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Callback phone number <span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  placeholder="(555) 555-5555"
                  inputMode="tel"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Acknowledgement */}
        {currentStep === 8 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Final acknowledgement</h2>
            
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emergencyAck}
                  onChange={(e) => setEmergencyAck(e.target.checked)}
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-slate-900">
                  <span className="font-medium">I understand this is not emergency care</span> and I will seek urgent care if symptoms worsen. 
                  For life-threatening emergencies, I will call 911.
                </span>
              </label>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900 mb-2">Review your request</h3>
              <div className="text-sm space-y-1 text-slate-600">
                <p><span className="font-medium">Chief concern:</span> {chiefConcern}</p>
                {symptomCategory && <p><span className="font-medium">Category:</span> {symptomCategory}</p>}
                {symptomSeverity && <p><span className="font-medium">Severity:</span> {symptomSeverity}</p>}
                <p><span className="font-medium">Callback:</span> {phone}</p>
                <p><span className="font-medium">Available in:</span> {availableIn === '15min' ? '15 minutes' : availableIn === '30min' ? '30 minutes' : '1 hour'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-6 border-t mt-6">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Back
            </button>
          )}
          
          {currentStep < 8 ? (
            <button
              onClick={handleNext}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !emergencyAck}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
          
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default state - CTA button
  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Need to Speak with a Physician?</h3>
      <p className="text-slate-600 mb-4">
        Request a consultation and an ER physician will contact you.
      </p>
      <button
        onClick={() => setIsFormOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
      >
        Request Consultation
      </button>
    </div>
  );
}
