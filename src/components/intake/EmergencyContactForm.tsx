"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Props = {
  membershipId: string;
};

type Contact = {
  name: string;
  relationship: string;
  phone: string;
};

export default function EmergencyContactForm({ membershipId }: Props) {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "", relationship: "", phone: "" },
  ]);

  const [personId, setPersonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the person_id for the primary member (self) on mount
  useEffect(() => {
    async function fetchPersonId() {
      // Find the primary person (relationship = 'self') for this membership
      const { data, error } = await supabase
        .from("people")
        .select("id")
        .eq("membership_id", membershipId)
        .eq("relationship", "self")
        .single();

      if (error || !data?.id) {
        console.error("Failed to fetch person_id:", error);
        setError("Failed to load membership data.");
      } else {
        setPersonId(data.id);
      }
      setLoading(false);
    }

    fetchPersonId();
  }, [membershipId]);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function updateContact(
    index: number,
    field: keyof Contact,
    value: string
  ) {
    setContacts((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      )
    );
  }

  function addSecondContact() {
    setContacts((prev) =>
      prev.length === 1
        ? [...prev, { name: "", relationship: "", phone: "" }]
        : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);

    if (!personId) {
      setError("Unable to save: missing person ID.");
      return;
    }

    // Validate first contact only
    const primary = contacts[0];
    if (!primary.name || !primary.relationship || !primary.phone) {
      setError("Primary emergency contact is required.");
      return;
    }

    setSubmitting(true);

    try {
      // Delete existing emergency contacts for this person
      const { error: deleteError } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("person_id", personId);

      if (deleteError) {
        console.error(deleteError);
        setError("Failed to clear old emergency contacts.");
        setSubmitting(false);
        return;
      }

      // Save new contacts
      for (const contact of contacts) {
        // Skip empty optional contacts
        if (!contact.name && !contact.relationship && !contact.phone) continue;

        const { error: insertError } = await supabase
          .from("emergency_contacts")
          .insert({
            membership_id: membershipId,
            person_id: personId,
            name: contact.name.trim(),
            relationship: contact.relationship.trim(),
            phone: contact.phone.trim(),
          });

        if (insertError) {
          console.error(insertError);
          setError("Failed to save emergency contact.");
          setSubmitting(false);
          return;
        }
      }

      // Advance onboarding step
      const { error: stepError } = await supabase
        .from("memberships")
        .update({ onboarding_step: "emergency_contacts_complete" })
        .eq("id", membershipId);

      if (stepError) {
        console.error(stepError);
        setError("Saved, but failed to advance intake.");
        setSubmitting(false);
        return;
      }

      router.replace(
        `/membership/intake/medical-history?membershipId=${membershipId}`
      );
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-50 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Emergency contacts
              </h1>
              <p className="text-sm text-slate-600 max-w-prose">
                We only use this if we're concerned about your safety.
              </p>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {contacts.map((contact, index) => (
              <div key={index} className="space-y-6">
                {contacts.length > 1 && (
                  <h2 className="text-sm font-semibold text-slate-700">
                    {index === 0
                      ? "Primary emergency contact"
                      : "Secondary emergency contact (optional)"}
                  </h2>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Full name
                  </label>
                  <input
                    value={contact.name}
                    onChange={(e) =>
                      updateContact(index, "name", e.target.value)
                    }
                    placeholder="Full Name"
                    className="w-full rounded-md border px-3 py-2"
                    required={index === 0}
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Relationship
                  </label>
                  <input
                    value={contact.relationship}
                    onChange={(e) =>
                      updateContact(index, "relationship", e.target.value)
                    }
                    placeholder="Spouse, parent, child, sibling, friend"
                    className="w-full rounded-md border px-3 py-2"
                    required={index === 0}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">
                    Phone number
                  </label>
                  <input
                    value={contact.phone}
                    onChange={(e) =>
                      updateContact(
                        index,
                        "phone",
                        formatPhone(e.target.value)
                      )
                    }
                    placeholder="(555) 555-5555"
                    inputMode="tel"
                    className="w-full rounded-md border px-3 py-2"
                    required={index === 0}
                  />
                </div>
              </div>
            ))}

            {contacts.length === 1 && (
              <button
                type="button"
                onClick={addSecondContact}
                className="text-sm font-medium text-slate-700 underline"
              >
                + Add a second emergency contact (optional)
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-md py-2 text-white ${
                submitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {submitting ? "Saving…" : "Save and continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
