# Patient Chart System - Quick Start (Adapted for Your Schema)

Get your patient chart system working with your existing database in 15 minutes.

## 🎯 What This Does

Creates a comprehensive patient chart view that works with your existing tables:
- ✅ `people` (your patient table)
- ✅ `memberships` (membership management)
- ✅ `medical_conditions`, `medications`, `allergies`, `surgical_history`
- ✅ `emergency_contacts`
- ✅ `consultation_requests`
- ✅ `audit_logs`

## 🚀 Installation (5 Steps)

### Step 1: Run Schema Diagnostics (2 minutes)

First, let's see exactly what columns you have:

1. Open Supabase SQL Editor
2. Copy and paste from `schema_diagnostic.sql`
3. Run all queries
4. Review the results to see your current schema

### Step 2: Run Database Migrations (5 minutes)

You need to run TWO migration scripts:

#### 2a. Emergency Contacts Migration (FIRST!)

Your `emergency_contacts` table currently uses `membership_id`, but it should use `person_id` (each person has their own emergency contacts, not shared across the whole membership).

1. Open Supabase SQL Editor
2. Copy and paste from `emergency_contacts_migration.sql`
3. Run the script
4. This will:
   - Add `person_id` column
   - Copy existing contacts to all people in each membership
   - Update RLS policies
   - (Optionally) Remove old `membership_id` column

#### 2b. Minimal Migration (SECOND!)

This adds other missing columns and indexes:

1. Open Supabase SQL Editor  
2. Copy and paste from `database_migration_minimal.sql`
3. Run the script
4. Check verification queries at the bottom

**What this adds:**
- `blood_type`, `height`, `weight` columns to `people` table (if missing)
- `relationship` column to `people` (for family members)
- `treatment_plan` column to `consultation_requests` (if missing)
- Indexes for performance
- RLS policies for clinician access

### Step 3: Install Dependencies (1 minute)

```bash
npm install date-fns
```

### Step 4: Copy Files to Your Project (4 minutes)

Copy these files from the `adapted-src/` directory:

```bash
# Server action
src/server/patient/getPatientChart.ts

# Page
src/app/(clinician)/clinician/patients/[id]/page.tsx

# Components
src/components/clinician/PatientChart.tsx
src/components/clinician/ViewFullChartButton.tsx
```

**Important:** These are adapted specifically for your schema!

## 🔗 Integration

Add the "View Full Chart" button to your `PatientSidebar` or consultation workspace:

```tsx
import ViewFullChartButton from '@/components/clinician/ViewFullChartButton';

// Inside your component:
<ViewFullChartButton personId={person.id} className="w-full" />
```

## ✅ Testing

1. Log in as a clinician
2. Navigate to `/clinician/patients/[person-id]`
3. Verify all tabs load correctly
4. Check that audit log records the access

## 🔍 Verification Checklist

After installation:

- [ ] Migration ran without errors
- [ ] All verification queries at bottom of migration show expected results
- [ ] Can access chart as clinician: `/clinician/patients/[person-id]`
- [ ] Overview tab shows patient info
- [ ] Medical History tab shows conditions, medications, allergies, surgeries
- [ ] Consultations tab shows consultation history
- [ ] Audit Trail tab shows access logs
- [ ] Non-clinicians are denied access

## 📊 What's Displayed

### Overview Tab
- Patient demographics from `people` table
- Emergency contacts from `emergency_contacts` table
- Family members (other people in same membership)
- Quick medical summary

### Medical History Tab
- Conditions from `medical_conditions` table
- Medications from `medications` table
- Allergies from `allergies` table
- Surgeries from `surgical_history` table
- Vitals (height, weight, blood type from `people`)

### Consultations Tab
- All consultations from `consultation_requests` table
- Click to view full details (diagnosis, notes, treatment plan)
- Shows clinician who handled each case

### Audit Trail Tab
- Access logs from `audit_logs` table
- HIPAA-compliant tracking
- Shows who accessed the chart and when

## 🔒 Security Features

### What's Included
- ✅ Audit logging on every chart access
- ✅ Role-based access (clinicians only)
- ✅ Row-level security policies
- ✅ Read-only view (no editing)

### How It Works
1. User must be authenticated
2. `user_roles` table checked for clinician role
3. Access logged to `audit_logs` table
4. All data fetched through RLS policies

## ⚠️ Common Issues

**"relation 'profiles' does not exist"**
→ You've already fixed this! The adapted version uses your `people` table.

**"column 'blood_type' does not exist"**
→ Re-run the migration. It adds this column if missing.

**"Access denied"**
→ Make sure the logged-in user has `role = 'clinician'` in the `user_roles` table.

**Medical history is empty**
→ Patient may not have data yet. Check if records exist in `medical_conditions`, `medications`, etc.

**Can't find person_id**
→ Make sure your medical tables use `person_id` as the foreign key (not `patient_id` or `user_id`).

## 🔧 Customization

### If Your Column Names Differ

Edit `getPatientChart.ts` to match your schema:

```typescript
// Example: If you use 'patient_id' instead of 'person_id'
.eq('patient_id', personId)  // Change this

// Example: If allergies table uses 'name' instead of 'allergen'
allergen: allergy.name  // Change this
```

### Adding More Data

To show additional fields, edit:
1. `getPatientChart.ts` - Add to database query
2. `PatientChartData` interface - Add to type
3. `PatientChart.tsx` - Display in UI

## 📁 File Structure After Installation

```
your-project/
├── src/
│   ├── app/
│   │   └── (clinician)/
│   │       └── clinician/
│   │           └── patients/
│   │               └── [id]/
│   │                   └── page.tsx       ← New
│   ├── components/
│   │   └── clinician/
│   │       ├── PatientChart.tsx           ← New (adapted)
│   │       └── ViewFullChartButton.tsx    ← New
│   └── server/
│       └── patient/
│           └── getPatientChart.ts         ← New (adapted)
```

## 🧪 Testing With Sample Data

If you want to test with sample data:

```sql
-- Get a person ID from your database
SELECT id, first_name, last_name FROM people LIMIT 1;

-- Add some test medical data
INSERT INTO medical_conditions (person_id, condition_name, diagnosed_date)
VALUES ('[person-id]', 'Hypertension', '2023-01-15');

INSERT INTO allergies (person_id, allergen, severity)
VALUES ('[person-id]', 'Penicillin', 'severe');

INSERT INTO medications (person_id, medication_name, dosage)
VALUES ('[person-id]', 'Lisinopril', '10mg daily');
```

Then visit: `/clinician/patients/[person-id]`

## 🎯 Next Steps

1. **Test thoroughly** - Try with different patients
2. **Customize styling** - Match your brand colors
3. **Train clinicians** - Show them how to use it
4. **Monitor audit logs** - Regular compliance reviews

## 📞 Need Help?

If something isn't working:

1. Run the diagnostic queries in `schema_diagnostic.sql`
2. Share the results
3. Check your Supabase logs for errors
4. Verify user has clinician role

## 🎉 You're Done!

Your patient chart system should now be working with your existing database structure!

---

**Key Differences from Generic Version:**
- ✅ Uses `people` table instead of `profiles`
- ✅ Uses `memberships` for grouping
- ✅ Separate tables for medical data (not combined `medical_history`)
- ✅ Uses `consultation_requests` instead of `consultations`
- ✅ Uses `user_roles` for role checking
- ✅ Adapted to your exact schema

**Next:** Test it out at `/clinician/patients/[person-id]`!
