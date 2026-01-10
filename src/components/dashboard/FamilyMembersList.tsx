'use client';

import { useState } from 'react';
import AddFamilyMemberModal from './AddFamilyMemberModal';
import EditFamilyMemberPersonalInfo from './EditFamilyMemberPersonalInfo';
import EditFamilyMemberMedicalInfo from './EditFamilyMemberMedicalInfo';
import EditFamilyMemberEmergencyContacts from './EditFamilyMemberEmergencyContacts';
import { removeFamilyMember } from '@/server/family/familyMemberActions';

type FamilyMember = {
  id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string;
  relationship: string;
  phone: string | null;
  sex_at_birth: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  intake_complete: boolean;
};

type Props = {
  membershipId: string;
  familyMembers: FamilyMember[];
};

function calculateAge(dob: string): number {
  // Parse date parts directly to avoid timezone issues
  const [year, month, day] = dob.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

function formatRelationship(rel: string): string {
  if (rel === 'self') return 'Self';
  if (rel === 'spouse_or_partner') return 'Spouse/Partner';
  return rel.charAt(0).toUpperCase() + rel.slice(1);
}

function FamilyMemberCard({ member, membershipId, onRemove }: { 
  member: FamilyMember; 
  membershipId: string;
  onRemove: (id: string, name: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelf = member.relationship === 'self';

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-left flex-1 hover:opacity-80 transition cursor-pointer"
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${isSelf ? 'bg-blue-100' : 'bg-slate-100'} flex items-center justify-center`}>
              <svg className={`w-7 h-7 ${isSelf ? 'text-blue-600' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {member.preferred_name || member.first_name} {member.last_name}
                  {isSelf && <span className="text-slate-500 font-normal ml-2">(You)</span>}
                </h3>
                {member.intake_complete ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    Intake needed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {formatRelationship(member.relationship)} • Age {calculateAge(member.date_of_birth)}
                {member.phone && ` • ${member.phone}`}
              </p>
            </div>

            <svg
              className={`w-5 h-5 text-slate-400 transition-transform cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {!isSelf && (
            <button
              onClick={() => onRemove(member.id, `${member.first_name} ${member.last_name}`)}
              className="ml-4 text-red-600 hover:text-red-700 p-2 cursor-pointer"
              title="Remove family member"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Incomplete Intake Warning */}
        {!member.intake_complete && isExpanded && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 mb-2">
              Complete intake to access and edit medical information for {member.first_name}.
            </p>
            <a
              href={`/membership/intake/${member.id}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Complete intake for {member.first_name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Expanded Sections - Same as original dashboard cards */}
      {isExpanded && member.intake_complete && (
        <div className="space-y-4 ml-16">
          {/* Personal Information - Editable */}
          <EditFamilyMemberPersonalInfo person={member} membershipId={membershipId} />

          {/* Medical Info - Editable */}
          <EditFamilyMemberMedicalInfo person={member} membershipId={membershipId} />

          {/* Emergency Contacts - Editable (shared with membership) */}
          <EditFamilyMemberEmergencyContacts 
            membershipId={membershipId}
            personId={member.id}
            personName={`${member.first_name} ${member.last_name}`}
          />
        </div>
      )}
    </div>
  );
}

export default function FamilyMembersList({ membershipId, familyMembers }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (personId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your family members?`)) {
      return;
    }

    setError(null);
    setRemovingId(personId);

    const result = await removeFamilyMember(personId, membershipId);

    setRemovingId(null);

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Family Members</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Member
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              membershipId={membershipId}
              onRemove={handleRemove}
            />
          ))}

          {familyMembers.filter(m => m.relationship !== 'self').length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm shadow-sm">
              No additional family members added yet.
              <br />
              Click "Add Member" to add a family member.
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Family members added here can be selected when requesting a consultation.
        </div>
      </section>

      <AddFamilyMemberModal
        membershipId={membershipId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
