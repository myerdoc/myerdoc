-- ============================================================================
-- PATIENT CHART SYSTEM - MINIMAL MIGRATION FOR EXISTING SCHEMA
-- ============================================================================
-- This migration works with your existing tables:
-- people, memberships, consultation_requests, emergency_contacts,
-- medical_conditions, medications, allergies, surgical_history, audit_logs
-- 
-- Run this after reviewing what columns you already have
-- ============================================================================

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO PEOPLE TABLE (if they don't exist)
-- ============================================================================

-- Check if these columns exist first, then add only if missing
-- Run this block one column at a time and skip if you get an error that it already exists

DO $$ 
BEGIN
  -- Add blood_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'people' AND column_name = 'blood_type'
  ) THEN
    ALTER TABLE people ADD COLUMN blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));
  END IF;

  -- Add height column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'people' AND column_name = 'height'
  ) THEN
    ALTER TABLE people ADD COLUMN height NUMERIC; -- in cm
  END IF;

  -- Add weight column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'people' AND column_name = 'weight'
  ) THEN
    ALTER TABLE people ADD COLUMN weight NUMERIC; -- in kg
  END IF;

  -- Add relationship column if it doesn't exist (for family members)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'people' AND column_name = 'relationship'
  ) THEN
    ALTER TABLE people ADD COLUMN relationship TEXT;
  END IF;
END $$;

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO CONSULTATION_REQUESTS (if needed)
-- ============================================================================

DO $$ 
BEGIN
  -- Add treatment_plan column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'consultation_requests' AND column_name = 'treatment_plan'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN treatment_plan TEXT;
  END IF;
END $$;

-- ============================================================================
-- 3. ENSURE AUDIT_LOGS TABLE HAS REQUIRED COLUMNS
-- ============================================================================

DO $$ 
BEGIN
  -- Add user_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN user_email TEXT;
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_people_membership_id ON people(membership_id);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_person_id ON medical_conditions(person_id);
CREATE INDEX IF NOT EXISTS idx_medications_person_id ON medications(person_id);
CREATE INDEX IF NOT EXISTS idx_allergies_person_id ON allergies(person_id);
CREATE INDEX IF NOT EXISTS idx_surgical_history_person_id ON surgical_history(person_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_person_id ON emergency_contacts(person_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_person_id ON consultation_requests(person_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 5. EMERGENCY CONTACTS NOTE
-- ============================================================================

-- NOTE: emergency_contacts table needs to be migrated from membership_id to person_id
-- This is handled in a separate migration file: emergency_contacts_migration.sql
-- Run that migration BEFORE deploying the patient chart system

-- After running emergency_contacts_migration.sql, the table will have:
-- - person_id (NOT NULL, FK to people)
-- - Proper RLS policies for person-based access

-- ============================================================================
-- 6. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN people.blood_type IS 'Patient blood type - CRITICAL for emergencies';
COMMENT ON COLUMN people.height IS 'Height in centimeters';
COMMENT ON COLUMN people.weight IS 'Weight in kilograms';
COMMENT ON COLUMN people.relationship IS 'Relationship to primary account holder (for family members)';

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables (skip if already enabled)
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Clinicians can view all people" ON people;
DROP POLICY IF EXISTS "Clinicians can view all medical conditions" ON medical_conditions;
DROP POLICY IF EXISTS "Clinicians can view all medications" ON medications;
DROP POLICY IF EXISTS "Clinicians can view all allergies" ON allergies;
DROP POLICY IF EXISTS "Clinicians can view all surgical history" ON surgical_history;
DROP POLICY IF EXISTS "Clinicians can view all emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Clinicians can view all consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Clinicians can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;

-- Create policies for clinician access
CREATE POLICY "Clinicians can view all people"
ON people FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Clinicians can view all medical conditions"
ON medical_conditions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Clinicians can view all medications"
ON medications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Clinicians can view all allergies"
ON allergies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Clinicians can view all surgical history"
ON surgical_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

-- NOTE: Emergency contacts RLS policies are created in emergency_contacts_migration.sql

CREATE POLICY "Clinicians can view all consultation requests"
ON consultation_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "Clinicians can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'clinician'
  )
);

CREATE POLICY "System can create audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Check that all required columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('people', 'consultation_requests', 'audit_logs')
  AND column_name IN ('blood_type', 'height', 'weight', 'relationship', 'treatment_plan', 'user_email')
ORDER BY table_name, column_name;

-- Check that RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('people', 'medical_conditions', 'medications', 'allergies', 
                    'surgical_history', 'emergency_contacts', 'consultation_requests', 'audit_logs')
ORDER BY tablename;

-- Check that policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('people', 'medical_conditions', 'medications', 'allergies', 
                    'surgical_history', 'emergency_contacts', 'consultation_requests', 'audit_logs')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Verify all queries above show expected results
-- 2. Test with a clinician user account
-- 3. Deploy the application code
-- 4. Test the patient chart view
-- 
-- ============================================================================
