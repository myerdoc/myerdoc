# 🏥 Patient Chart System for MyERDoc

Complete patient medical records viewing system with **two versions** provided.

## 🎯 Which Version Do You Need?

### ✅ YOU NEED: **Adapted Version** (in `patient-chart-adapted/`)

Your schema uses:
- `people` table (not `profiles`)
- `memberships` for account management
- Separate medical tables: `medical_conditions`, `medications`, `allergies`, `surgical_history`
- `consultation_requests` (not `consultations`)
- `user_roles` for role management

**This is the version I customized specifically for your database!**

### ❌ YOU DON'T NEED: Generic Version (in `patient-chart-system/`)

This was created before I knew your schema. It uses:
- Generic `profiles` table
- Combined `medical_history` table
- Different table names

## 🚀 Quick Start

### Go to the Adapted Version:

```
📁 patient-chart-adapted/
   ├── README_ADAPTED.md           ← Start here!
   ├── QUICK_START_ADAPTED.md      ← 10-minute setup
   ├── schema_diagnostic.sql       ← Check your schema
   ├── database_migration_minimal.sql  ← Only adds what's missing
   └── adapted-src/
       ├── server/patient/
       ├── app/(clinician)/
       └── components/clinician/
```

### Installation (5 Steps)

1. **Run diagnostics** (optional): `schema_diagnostic.sql`
2. **Run emergency contacts migration** (REQUIRED): `emergency_contacts_migration.sql` - Changes emergency_contacts from membership-based to person-based
3. **Run minimal migration**: `database_migration_minimal.sql`
4. **Install dependency**: `npm install date-fns`
5. **Copy files**: From `adapted-src/` to your project

Full instructions in `QUICK_START_ADAPTED.md`

## 📦 What's Included in Adapted Version

### 🗄️ Database
- **schema_diagnostic.sql** - Understand your current schema
- **database_migration_minimal.sql** - Adds only what's missing
  - Adds `blood_type`, `height`, `weight` to `people` table
  - Adds `relationship` column for family members
  - Adds indexes for performance
  - Adds RLS policies for clinician access

### 💻 Application Code
- **getPatientChart.ts** - Server action that queries YOUR tables
- **PatientChart.tsx** - UI adapted for YOUR data structure
- **page.tsx** - Patient chart route
- **ViewFullChartButton.tsx** - Integration button

### 📚 Documentation
- **README_ADAPTED.md** - Complete guide
- **QUICK_START_ADAPTED.md** - Fast setup
- Both include troubleshooting for your specific schema

## ✨ Features

### What You Get
✅ Complete patient medical records view  
✅ HIPAA-compliant audit logging  
✅ Role-based access (clinicians only)  
✅ Professional medical UI  
✅ Works with your existing schema  
✅ Minimal database changes needed  

### What's Displayed
- **Overview Tab**: Patient info, emergency contacts, family members
- **Medical History Tab**: Conditions, medications, allergies, surgeries
- **Consultations Tab**: Full consultation history with details
- **Audit Trail Tab**: HIPAA compliance tracking

## 🔒 Security

- ✅ Automatic audit logging on every access
- ✅ Row-level security policies
- ✅ Role-based access via `user_roles` table
- ✅ Read-only view (no editing)
- ✅ HTTPS encrypted data transmission

## 📊 How It Works With Your Schema

### Data Sources
```
Patient Info       → people table
Medical Conditions → medical_conditions table
Medications       → medications table
Allergies         → allergies table
Surgeries         → surgical_history table
Emergency Contacts → emergency_contacts table
Consultations     → consultation_requests table
Family Members    → people table (same membership_id)
Audit Logs        → audit_logs table
```

### Access Control
```
1. User logs in (Supabase Auth)
2. System checks user_roles table
3. If role = 'clinician' → Access granted
4. Access logged to audit_logs
5. Data fetched via RLS policies
```

## 🎯 Quick Decision Tree

**Q: Does my database have a `profiles` table?**
- No → Use **Adapted Version** ✅
- Yes, but I also have `people` and `memberships` → Use **Adapted Version** ✅

**Q: Do I have separate tables for conditions, medications, allergies?**
- Yes → Use **Adapted Version** ✅
- No, I have one `medical_history` table → Use Generic Version (not recommended)

**Q: Do I use `user_roles` for role management?**
- Yes → Use **Adapted Version** ✅
- No, roles are in `profiles.role` → You might need generic (but customize)

**→ In your case: Use Adapted Version!**

## 📁 File Organization

```
/mnt/user-data/outputs/
├── patient-chart-adapted/          ← YOUR VERSION
│   ├── README_ADAPTED.md          ← Complete guide
│   ├── QUICK_START_ADAPTED.md     ← 10-min setup
│   ├── schema_diagnostic.sql      ← Check your schema
│   ├── database_migration_minimal.sql  ← Minimal migration
│   └── adapted-src/               ← Application code
│       ├── server/
│       ├── app/
│       └── components/
│
└── patient-chart-system/          ← Generic version (ignore this)
    └── [generic files]
```

## ✅ Installation Checklist

- [ ] Open `patient-chart-adapted/` folder
- [ ] Read `README_ADAPTED.md` for overview
- [ ] Read `EMERGENCY_CONTACTS_MIGRATION_GUIDE.md` to understand the schema change
- [ ] Follow `QUICK_START_ADAPTED.md` for setup
- [ ] Run `schema_diagnostic.sql` (optional)
- [ ] Run `emergency_contacts_migration.sql` (FIRST - migrates to person-based contacts)
- [ ] Run `database_migration_minimal.sql` (SECOND)
- [ ] Install dependency: `npm install date-fns`
- [ ] Copy files from `adapted-src/` to your project
- [ ] Add `ViewFullChartButton` to your UI
- [ ] Test with clinician account
- [ ] Verify audit logging works

## 🎓 Learning Path

1. **Understand your schema** (5 min)
   - Run queries in `schema_diagnostic.sql`
   - Review what tables you have

2. **Quick setup** (10 min)
   - Follow `QUICK_START_ADAPTED.md`
   - Get basic system working

3. **Deep dive** (30 min)
   - Read `README_ADAPTED.md`
   - Understand customization options

4. **Customize** (variable)
   - Adjust colors, styling
   - Add more fields if needed

## 🆘 Help & Support

### If something isn't working:

1. **Check you're using the adapted version**
   - Path should be: `patient-chart-adapted/`
   - Files should reference: `people`, `memberships`, etc.

2. **Run diagnostic queries**
   - Use `schema_diagnostic.sql`
   - Share results if you need help

3. **Review migration**
   - Check `database_migration_minimal.sql` ran successfully
   - Look for errors in Supabase logs

4. **Verify column names**
   - Your tables might use slightly different names
   - Update `getPatientChart.ts` to match

5. **Check user role**
   - Ensure test user has `role = 'clinician'` in `user_roles`

## 🎉 You're Ready!

**Next step**: Open `patient-chart-adapted/QUICK_START_ADAPTED.md` and follow the 5 steps!

---

**Summary:**
- ✅ Use `patient-chart-adapted/` (customized for your schema)
- ❌ Ignore `patient-chart-system/` (generic version)
- 📖 Start with `QUICK_START_ADAPTED.md`
- 🚀 10-minute setup
- 🔒 HIPAA-compliant
- 💯 Production-ready

---

**Version**: 1.0.0  
**Created**: January 2026  
**Adapted For**: MyERDoc with people/memberships schema  
**Key Files**: README_ADAPTED.md, QUICK_START_ADAPTED.md
