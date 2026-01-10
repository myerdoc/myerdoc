'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Contact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
};

export default function EditFamilyMemberEmergencyContacts({ 
  membershipId,
  personId,
  personName
}: { 
  membershipId: string;
  personId: string;
  personName: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialContacts, setInitialContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Array<Partial<Contact>>>([
    { name: '', relationship: '', phone: '' }
  ]);

  useEffect(() => {
    loadContacts();
  }, [personId]);

  async function loadContacts() {
    setLoading(true);
    const supabase = createClient();
    
    console.log('=== DEBUG: Loading emergency contacts ===');
    console.log('Person ID:', personId);
    
    const { data, error: loadError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    if (loadError) {
      console.error('Error loading contacts:', loadError);
    } else {
      console.log('Loaded contacts:', data);
    }

    if (data && data.length > 0) {
      setInitialContacts(data);
      setContacts(data);
    }
    setLoading(false);
  }

  function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  function formatPhoneInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function updateContact(index: number, field: keyof Contact, value: string) {
    setContacts(prev =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function addContact() {
    if (contacts.length < 2) {
      setContacts([...contacts, { name: '', relationship: '', phone: '' }]);
    }
  }

  function removeContact(index: number) {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    
    const supabase = createClient();

    // Check auth status
    const { data: { user } } = await supabase.auth.getUser();
    console.log('=== DEBUG: Save Emergency Contacts ===');
    console.log('Current user:', user?.id);
    console.log('Membership ID:', membershipId);
    console.log('Person ID:', personId);
    console.log('Contacts to save:', contacts);

    // Validate first contact
    const primary = contacts[0];
    if (!primary?.name || !primary?.relationship || !primary?.phone) {
      setError('Primary emergency contact is required');
      setSaving(false);
      return;
    }

    // Delete existing contacts for this person
    console.log('Deleting existing contacts for person...');
    const { error: deleteError } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('person_id', personId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      setError(`Failed to update contacts: ${deleteError.message}`);
      setSaving(false);
      return;
    }
    console.log('Existing contacts deleted successfully');

    // Insert new contacts
    for (const contact of contacts) {
      if (!contact.name && !contact.relationship && !contact.phone) continue;

      const insertData = {
        membership_id: membershipId,
        person_id: personId,
        name: contact.name!.trim(),
        relationship: contact.relationship!.trim(),
        phone: contact.phone!.trim(),
      };
      
      console.log('Inserting contact:', insertData);
      
      const { error: insertError } = await supabase
        .from('emergency_contacts')
        .insert(insertData);

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`Failed to save contact: ${insertError.message}`);
        setSaving(false);
        return;
      }
      console.log('Contact inserted successfully');
    }

    console.log('=== All contacts saved successfully ===');
    
    // Reload contacts
    await loadContacts();
    setSaving(false);
    setIsEditing(false);
  }

  function handleCancel() {
    setContacts(
      initialContacts.length > 0
        ? initialContacts
        : [{ name: '', relationship: '', phone: '' }]
    );
    setIsEditing(false);
    setError(null);
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Emergency contacts</h2>
        <p className="text-sm text-slate-500">Loading...</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Emergency contacts</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {initialContacts.length > 0 && !isEditing && (
        <p className="text-xs text-slate-500 mt-1">
          Emergency contacts for {personName}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!isEditing ? (
        initialContacts.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">
            No emergency contacts on file.
          </p>
        ) : (
          <div className="space-y-4 mt-4">
            {initialContacts.map((c, index) => (
              <div key={c.id} className="text-sm space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium text-slate-700 w-28 shrink-0">Name:</span>
                  <span className="text-slate-900">{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-slate-700 w-28 shrink-0">Relationship:</span>
                  <span className="text-slate-900">{c.relationship || '—'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-slate-700 w-28 shrink-0">Phone:</span>
                  <span className="text-slate-900">{formatPhone(c.phone)}</span>
                </div>
                {index < initialContacts.length - 1 && (
                  <div className="border-t border-slate-200 pt-4 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="max-w-md mt-4 space-y-6">
          {contacts.map((contact, index) => (
            <div key={index} className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {index === 0 ? 'Primary contact' : 'Secondary contact'}
                </h3>
                {index > 0 && (
                  <button
                    onClick={() => removeContact(index)}
                    className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Full name</label>
                <input
                  value={contact.name || ''}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required={index === 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Relationship</label>
                <input
                  value={contact.relationship || ''}
                  onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                  placeholder="Spouse, parent, child, sibling, friend"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required={index === 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900">Phone number</label>
                <input
                  value={contact.phone || ''}
                  onChange={(e) =>
                    updateContact(index, 'phone', formatPhoneInput(e.target.value))
                  }
                  placeholder="(555) 555-5555"
                  inputMode="tel"
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required={index === 0}
                />
              </div>
            </div>
          ))}

          {contacts.length < 2 && (
            <button
              onClick={addContact}
              className="text-sm font-medium text-slate-700 underline cursor-pointer"
            >
              + Add another emergency contact
            </button>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
