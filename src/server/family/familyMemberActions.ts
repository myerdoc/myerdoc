'use server';

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addFamilyMember(formData: {
  membershipId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  phone?: string;
}) {
  const supabase = await createServerSupabaseClient();

  // Validate required fields
  if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.relationship) {
    return { error: 'All required fields must be filled out' };
  }

  // Validate date of birth format (YYYY-MM-DD)
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dobRegex.test(formData.dateOfBirth)) {
    return { error: 'Invalid date of birth format' };
  }

  // Validate relationship
  const validRelationships = ['spouse', 'partner', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other'];
  if (!validRelationships.includes(formData.relationship)) {
    return { error: 'Invalid relationship type' };
  }

  // Insert new family member
  const { data, error } = await supabase
    .from('people')
    .insert({
      membership_id: formData.membershipId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      relationship: formData.relationship,
      phone: formData.phone || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding family member:', error);
    console.error('Form data:', formData);
    return { error: `Failed to add family member: ${error.message}` };
  }

  // Revalidate the dashboard page to show the new family member
  revalidatePath('/dashboard');

  return { success: true, data };
}

export async function removeFamilyMember(personId: string, membershipId: string) {
  const supabase = await createServerSupabaseClient();

  // Verify the person belongs to this membership (security check)
  const { data: person } = await supabase
    .from('people')
    .select('id, membership_id, relationship')
    .eq('id', personId)
    .single();

  if (!person || person.membership_id !== membershipId) {
    return { error: 'Unauthorized' };
  }

  // Don't allow removing self
  if (person.relationship === 'self') {
    return { error: 'Cannot remove primary member' };
  }

  // Delete the person
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId);

  if (error) {
    console.error('Error removing family member:', error);
    return { error: 'Failed to remove family member. Please try again.' };
  }

  // Revalidate the dashboard page
  revalidatePath('/dashboard');

  return { success: true };
}

export async function updateFamilyMember(formData: {
  personId: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: string;
  phone: string | null;
}) {
  const supabase = await createServerSupabaseClient();

  // Security: Verify the person belongs to this membership
  const { data: person } = await supabase
    .from('people')
    .select('relationship, membership_id')
    .eq('id', formData.personId)
    .single();

  if (!person || person.membership_id !== formData.membershipId) {
    return { error: 'Unauthorized or person not found' };
  }

  // Cannot edit the primary member here
  if (person.relationship === 'self') {
    return { error: 'Cannot edit the primary member here' };
  }

  // Validate date format
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dobRegex.test(formData.dateOfBirth)) {
    return { error: 'Invalid date of birth format' };
  }

  // Validate relationship
  const validRelationships = ['spouse', 'partner', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other'];
  if (!validRelationships.includes(formData.relationship)) {
    return { error: 'Invalid relationship type' };
  }

  // Update the person
  const { error } = await supabase
    .from('people')
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
      date_of_birth: formData.dateOfBirth,
      relationship: formData.relationship,
      phone: formData.phone,
    })
    .eq('id', formData.personId);

  if (error) {
    console.error('Error updating family member:', error);
    return { error: 'Failed to update family member' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateFamilyMemberPersonalInfo(formData: {
  personId: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}) {
  const supabase = await createServerSupabaseClient();

  // Security: Verify the person belongs to this membership
  const { data: person } = await supabase
    .from('people')
    .select('relationship, membership_id')
    .eq('id', formData.personId)
    .single();

  if (!person || person.membership_id !== formData.membershipId) {
    return { error: 'Unauthorized or person not found' };
  }

  // Update the person
  const { error } = await supabase
    .from('people')
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
      preferred_name: formData.preferredName,
      phone: formData.phone,
      address_line1: formData.addressLine1,
      address_line2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postalCode,
    })
    .eq('id', formData.personId);

  if (error) {
    console.error('Error updating family member personal info:', error);
    return { error: 'Failed to update personal information' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
