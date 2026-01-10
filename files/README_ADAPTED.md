# 🏥 Patient Chart System - Adapted for Your MyERDoc Schema

Complete patient medical records viewing system **specifically adapted** for your existing database structure.

## 🎯 What Makes This Special

This version is **custom-built** for your schema:
- ✅ Uses your `people` table (not generic `profiles`)
- ✅ Works with your `memberships` system
- ✅ Integrates with separate medical tables (`medical_conditions`, `medications`, `allergies`, `surgical_history`)
- ✅ Uses your `consultation_requests` table
- ✅ Leverages your existing `audit_logs` system
- ✅ Checks `user_roles` for clinician access

## 📦 What's In This Package

### 🚀 Getting Started
- **`QUICK_START_ADAPTED.md`** - 10-minute setup guide for your schema
- **`schema_diagnostic.sql`** - Queries to understand your current schema

### 🗄️ Database
- **`emergency_contacts_migration.sql`** - Migrates emergency_contacts from membership-based to person-based ⚠️ **Run this FIRST!**
- **`database_migration_minimal.sql`** - Adds missing columns and indexes to your existing schema

### 💻 Application Code (in `adapted-src/` directory)

#### Server
- `server/patient/getPatientChart.ts` - Fetches data from YOUR tables

#### Pages
- `app/(clinician)/clinician/patients/[id]/page.tsx` - Patient chart page

#### Components  
- `components/clinician/PatientChart.tsx` - Main UI (adapted for your data structure)
- `components/clinician/ViewFullChartButton.tsx` - Integration button

## 🔍 Your Current Schema

Based on what you shared, you have:

```
✅ people                    (patient demographics)
✅ memberships               (membership management)
✅ medical_conditions        (chronic conditions)
✅ medications               (current medications)
✅ allergies                 (allergies and reactions)
✅ surgical_history          (past surgeries)
✅ emergency_contacts        (emergency contact info)
✅ consultation_requests     (consultation history)
✅ audit_logs                (access tracking)
✅ user_roles                (role management)
```

## 📊 How Data Maps to Your Schema

### Patient Information
```typescript
FROM: people table
SHOWS: name, DOB, contact info, address
```

### Medical History
```typescript
FROM: medical_conditions, medications, allergies, surgical_history tables
SHOWS: Complete medical profile with details from each table
```

### Emergency Contacts
```typescript
FROM: emergency_contacts table
WHERE: person_id = [patient]
SHOWS: All contacts with primary designation
```

### Consultations
```typescript
FROM: consultation_requests table
JOIN: clinicians table for provider names
SHOWS: Full consultation history with diagnoses
```

### Family Members
```typescript
FROM: people table
WHERE: membership_id = [same as patient]
AND: id != [patient_id]
SHOWS: Other people in same membership
```

### Audit Trail
```typescript
FROM: audit_logs table
WHERE: resource_id = [patient]
SHOWS: Who accessed this patient's chart
```

## 🚀 Quick Installation

### 1. Run Diagnostics (Optional but Recommended)
```bash
# Open Supabase SQL Editor
# Run queries from: schema_diagnostic.sql
```

### 2. Run Database Migrations

You need to run TWO migration scripts in order:

#### 2a. Emergency Contacts Migration (FIRST!)
```bash
# Open Supabase SQL Editor
# Run: emergency_contacts_migration.sql
```

This migrates `emergency_contacts` from `membership_id` to `person_id` (each person has their own contacts). It will copy existing contacts to all people in each membership.

#### 2b. Minimal Migration (SECOND!)
```bash
# Open Supabase SQL Editor
# Run: database_migration_minimal.sql
```

This adds:
- `blood_type`, `height`, `weight` to `people` (if missing)
- `relationship` to `people` (for family members)
- `treatment_plan` to `consultation_requests` (if missing)
- Indexes for performance
- RLS policies for clinician access

### 3. Install Dependencies
```bash
npm install date-fns
```

### 4. Copy Files
Copy everything from `adapted-src/` into your project:

```bash
src/server/patient/getPatientChart.ts
src/app/(clinician)/clinician/patients/[id]/page.tsx
src/components/clinician/PatientChart.tsx
src/components/clinician/ViewFullChartButton.tsx
```

### 5. Integrate Button
Add to your consultation workspace or patient sidebar:

```tsx
import ViewFullChartButton from '@/components/clinician/ViewFullChartButton';

<ViewFullChartButton personId={person.id} className="w-full" />
```

## ✅ Verification

After installation, test:

1. **Access Control**
   - Log in as clinician → Can access chart ✅
   - Log in as patient → Denied ❌

2. **Data Display**
   - Overview tab shows demographics ✅
   - Medical tab shows conditions, meds, allergies ✅
   - Consultations tab shows history ✅
   - Audit tab shows access logs ✅

3. **Audit Logging**
   - Chart access creates audit log entry ✅
   - Entry shows correct user and timestamp ✅

## 🔒 Security Features

### HIPAA Compliance
- ✅ Automatic audit logging on every access
- ✅ Role-based access control via `user_roles` table
- ✅ Row-level security policies on all tables
- ✅ Read-only view (no accidental edits)

### How Access Control Works
```typescript
1. User authenticated via Supabase Auth
2. System checks user_roles table for 'clinician' role
3. RLS policies enforce data access restrictions
4. Access logged to audit_logs table
5. Data fetched and displayed
```

## 🎨 UI Features

### Tabbed Interface
- **Overview** - Patient summary, contacts, family
- **Medical History** - Conditions, meds, allergies, surgeries
- **Consultations** - Full history with details
- **Audit Trail** - HIPAA compliance tracking

### Visual Design
- Allergies highlighted in red for safety
- Color-coded consultation statuses
- Responsive layout (desktop/tablet)
- Professional medical aesthetic

### Interactive Elements
- Click consultations to see full details
- Tab navigation for easy browsing
- Sticky detail panels
- Hover effects for better UX

## 🔧 Customization Guide

### If Your Column Names Differ

The most common customization needed is matching column names.

**Example 1: Foreign Key Names**
```typescript
// In getPatientChart.ts
// If you use 'patient_id' instead of 'person_id':

.eq('person_id', personId)     // ← Change this
.eq('patient_id', personId)    // ← To this
```

**Example 2: Field Names**
```typescript
// If allergies table uses 'name' instead of 'allergen':

allergen: allergy.allergen     // ← Change this
allergen: allergy.name         // ← To this
```

**Example 3: Additional Fields**
```typescript
// To show more data, edit these 3 places:

1. getPatientChart.ts - Add to SELECT query
2. PatientChartData interface - Add to type
3. PatientChart.tsx - Display in UI
```

### Changing Colors

Update Tailwind classes in `PatientChart.tsx`:

```tsx
// Find:
bg-blue-500      // ← Primary color
text-blue-600    // ← Text color
border-blue-500  // ← Border color

// Replace with your brand colors:
bg-green-500
text-green-600
border-green-500
```

## 🐛 Troubleshooting

### "Column does not exist" errors

**Symptom:** Error like `column "person_id" does not exist`

**Solution:** Your table uses different column names. Update the query in `getPatientChart.ts`:

```typescript
// Find the line with the error
.eq('person_id', personId)

// Change to match your column name
.eq('patient_id', personId)  // or whatever yours is called
```

### "Access denied" errors

**Symptom:** Can't access chart even as clinician

**Solution:** Check user has clinician role:
```sql
SELECT * FROM user_roles WHERE user_id = '[your-user-id]';
-- Should show role = 'clinician'
```

### Empty medical history

**Symptom:** Medical tab shows "No data"

**Solution:** Patient may not have records yet:
```sql
-- Check if data exists
SELECT * FROM medical_conditions WHERE person_id = '[patient-id]';
SELECT * FROM medications WHERE person_id = '[patient-id]';
SELECT * FROM allergies WHERE person_id = '[patient-id]';
```

### Migration errors

**Symptom:** Migration fails with constraint errors

**Solution:** Some columns may already exist. The migration uses `IF NOT EXISTS` so it should be safe. Check error message for specific column and manually verify:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'people';
```

## 📊 Database Requirements

### Minimum Required Columns

**people table:**
- id (UUID)
- first_name, last_name
- date_of_birth
- email, phone
- address, city, state, zip_code
- membership_id (FK to memberships)
- created_at

**medical_conditions table:**
- id, person_id
- condition_name
- diagnosed_date, notes

**medications table:**
- id, person_id
- medication_name
- dosage, frequency, notes

**allergies table:**
- id, person_id
- allergen
- severity, reaction

**surgical_history table:**
- id, person_id
- surgery_name
- surgery_date, notes

**emergency_contacts table:**
- id, person_id
- name, relationship, phone
- is_primary

**consultation_requests table:**
- id, person_id, clinician_id
- status, chief_complaint
- diagnosis, notes, treatment_plan
- created_at

**audit_logs table:**
- id, user_id
- action, resource_type, resource_id
- details, created_at

**user_roles table:**
- user_id, role

## 🧪 Testing

### Manual Test Checklist

- [ ] Can access chart as clinician
- [ ] Cannot access as non-clinician
- [ ] Overview tab displays correctly
- [ ] Medical history shows all data
- [ ] Consultations load properly
- [ ] Can click consultation for details
- [ ] Audit log records access
- [ ] Family members show (if in same membership)
- [ ] Emergency contacts display
- [ ] Page is responsive on different screen sizes

### Test Data Script

```sql
-- Get a test person
SELECT id, first_name, last_name FROM people LIMIT 1;

-- Add test data (replace [person-id])
INSERT INTO medical_conditions (person_id, condition_name, diagnosed_date)
VALUES ('[person-id]', 'Hypertension', NOW());

INSERT INTO allergies (person_id, allergen, severity)
VALUES ('[person-id]', 'Penicillin', 'severe');

INSERT INTO medications (person_id, medication_name, dosage)
VALUES ('[person-id]', 'Lisinopril', '10mg daily');

-- Visit: /clinician/patients/[person-id]
```

## 🎯 What's Next?

After basic setup:

1. **Customize branding** - Update colors and styling
2. **Train staff** - Show clinicians how to use it
3. **Test thoroughly** - Try with multiple patients
4. **Monitor audit logs** - Regular compliance reviews
5. **Add enhancements** - Print feature, PDF export, etc.

## 📞 Support

### If Something Isn't Working

1. **Check schema** - Run diagnostic queries
2. **Review logs** - Check Supabase for errors  
3. **Verify data** - Ensure patient has records
4. **Test roles** - Confirm user is clinician
5. **Read errors** - Error messages usually point to the issue

### Common Column Name Mappings

If you get column errors, check these common variations:

| Generic | Your Schema Might Use |
|---------|---------------------|
| person_id | patient_id, user_id |
| allergen | allergy_name, name |
| medication_name | name, drug_name |
| condition_name | name, diagnosis |
| surgery_name | name, procedure |

## 🎉 Summary

You now have a **production-ready patient chart system** that:

✅ Works with YOUR existing schema  
✅ Requires minimal database changes  
✅ Is HIPAA-compliant with audit logging  
✅ Has a professional medical UI  
✅ Is fully typed with TypeScript  
✅ Uses your existing authentication  

**Ready to start?** Open `QUICK_START_ADAPTED.md` and follow the 4 steps!

---

**Version**: 1.0.0 (Adapted)  
**Last Updated**: January 2026  
**Adapted For**: MyERDoc with memberships-based schema  
**Key Difference**: Uses your existing `people`, `memberships`, and separate medical tables
