-- ============================================================================
-- EMERGENCY CONTACTS MIGRATION: membership_id → person_id
-- ============================================================================
-- This migration converts emergency contacts from membership-based to person-based
-- Each person will have their own emergency contacts (not shared across membership)
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD person_id COLUMN
-- ============================================================================

ALTER TABLE emergency_contacts 
ADD COLUMN person_id UUID;

-- Add foreign key constraint
ALTER TABLE emergency_contacts
ADD CONSTRAINT emergency_contacts_person_id_fkey 
FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 2: MIGRATE EXISTING DATA
-- ============================================================================

-- OPTION A: Assign all contacts to the primary member of each membership
-- (Uncomment this if you want contacts to go to the first/oldest person)

/*
UPDATE emergency_contacts ec
SET person_id = (
  SELECT p.id 
  FROM people p 
  WHERE p.membership_id = ec.membership_id 
  ORDER BY p.created_at ASC 
  LIMIT 1
);
*/

-- OPTION B: Copy contacts to ALL people in the membership
-- (Recommended - each person gets a copy they can customize)

DO $$
DECLARE
  contact_record RECORD;
  person_record RECORD;
BEGIN
  -- For each existing emergency contact
  FOR contact_record IN 
    SELECT * FROM emergency_contacts WHERE person_id IS NULL
  LOOP
    -- Find all people in that membership
    FOR person_record IN 
      SELECT id FROM people WHERE membership_id = contact_record.membership_id
    LOOP
      -- If this is the first person, update the existing record
      IF contact_record.person_id IS NULL THEN
        UPDATE emergency_contacts 
        SET person_id = person_record.id
        WHERE id = contact_record.id;
      ELSE
        -- For additional people, create new records
        INSERT INTO emergency_contacts (
          membership_id, 
          person_id, 
          name, 
          relationship, 
          phone, 
          notes, 
          is_primary,
          created_at
        ) VALUES (
          contact_record.membership_id,
          person_record.id,
          contact_record.name,
          contact_record.relationship,
          contact_record.phone,
          contact_record.notes,
          contact_record.is_primary,
          contact_record.created_at
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 3: VERIFY DATA MIGRATION
-- ============================================================================

-- Check: All contacts should now have a person_id
SELECT 
  COUNT(*) as total_contacts,
  COUNT(person_id) as contacts_with_person_id,
  COUNT(*) - COUNT(person_id) as contacts_missing_person_id
FROM emergency_contacts;

-- Expected: contacts_missing_person_id should be 0

-- Show the migration results
SELECT 
  m.id as membership_id,
  COUNT(DISTINCT p.id) as people_count,
  COUNT(ec.id) as emergency_contacts_count
FROM memberships m
LEFT JOIN people p ON p.membership_id = m.id
LEFT JOIN emergency_contacts ec ON ec.person_id = p.id
GROUP BY m.id
ORDER BY people_count DESC;

-- ============================================================================
-- STEP 4: MAKE person_id REQUIRED
-- ============================================================================

-- Make person_id NOT NULL (after verifying all records have it)
ALTER TABLE emergency_contacts 
ALTER COLUMN person_id SET NOT NULL;

-- ============================================================================
-- STEP 5: DROP membership_id COLUMN (Optional)
-- ============================================================================

-- Option A: Drop membership_id entirely (cleaner, recommended)
-- Uncomment this after verifying everything works:

-- ALTER TABLE emergency_contacts DROP COLUMN membership_id;

-- Option B: Keep membership_id for reference (safer during transition)
-- Leave it as is, you can drop it later

-- ============================================================================
-- STEP 6: CREATE INDEX FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_emergency_contacts_person_id 
ON emergency_contacts(person_id);

-- Drop old index if it exists
DROP INDEX IF EXISTS idx_emergency_contacts_membership_id;

-- ============================================================================
-- STEP 7: UPDATE RLS POLICIES
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Clinicians can view all emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Patients can view own emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Patients can manage own emergency contacts" ON emergency_contacts;

-- Create new policies using person_id
CREATE POLICY "Clinicians can view all emergency contacts"
ON emergency_contacts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Patients can view own emergency contacts"
ON emergency_contacts FOR SELECT
TO authenticated
USING (person_id = auth.uid());

CREATE POLICY "Patients can manage own emergency contacts"
ON emergency_contacts FOR ALL
TO authenticated
USING (person_id = auth.uid())
WITH CHECK (person_id = auth.uid());

-- ============================================================================
-- STEP 8: ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON COLUMN emergency_contacts.person_id IS 'The person this emergency contact belongs to (each person has their own contacts)';
COMMENT ON TABLE emergency_contacts IS 'Emergency contacts for individual people (not shared across membership)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check foreign key is working
SELECT 
  ec.id as contact_id,
  ec.name as contact_name,
  p.first_name || ' ' || p.last_name as person_name
FROM emergency_contacts ec
JOIN people p ON p.id = ec.person_id
LIMIT 5;

-- 2. Verify RLS policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'emergency_contacts'
ORDER BY policyname;

-- 3. Check data distribution
SELECT 
  p.first_name || ' ' || p.last_name as person,
  COUNT(ec.id) as emergency_contacts_count
FROM people p
LEFT JOIN emergency_contacts ec ON ec.person_id = p.id
GROUP BY p.id, p.first_name, p.last_name
ORDER BY emergency_contacts_count DESC
LIMIT 10;

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================

/*
-- If something goes wrong, you can rollback with these commands:

-- 1. Drop the new constraint
ALTER TABLE emergency_contacts DROP CONSTRAINT emergency_contacts_person_id_fkey;

-- 2. Remove person_id column
ALTER TABLE emergency_contacts DROP COLUMN person_id;

-- 3. Restore old policies
-- (Re-run the old policy creation statements)

*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- Summary of changes:
-- ✅ Added person_id column with foreign key to people
-- ✅ Migrated existing data (copied to all people in membership)
-- ✅ Made person_id required (NOT NULL)
-- ✅ Created index for performance
-- ✅ Updated RLS policies to use person_id
-- ✅ (Optional) Dropped membership_id column
--
-- Next steps:
-- 1. Verify all queries above show expected results
-- 2. Test the patient chart view
-- 3. After confirming everything works, uncomment the DROP membership_id line
-- 
-- ============================================================================
