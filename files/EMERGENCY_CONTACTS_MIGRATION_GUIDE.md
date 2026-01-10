# 🚨 Important: Emergency Contacts Schema Change

## What's Changing

Your `emergency_contacts` table currently has:
```sql
emergency_contacts
├── id
├── membership_id  ← Links to membership (CURRENT)
├── name
├── relationship
└── phone
```

We're migrating it to:
```sql
emergency_contacts
├── id
├── person_id      ← Links to person (NEW)
├── name
├── relationship
└── phone
```

## Why This Change?

### Current Design Problem (membership_id)
❌ Entire family shares same emergency contacts  
❌ Dad's contact might be "my son" (doesn't make sense)  
❌ Can't have person-specific contacts  
❌ Not flexible for real-world use  

### Better Design (person_id)
✅ Each person has their own emergency contacts  
✅ Child's contacts = parents  
✅ Parent's contacts = spouse, siblings, friends  
✅ Makes logical sense  
✅ More flexible and realistic  

## What The Migration Does

The `emergency_contacts_migration.sql` script will:

1. **Add `person_id` column** to emergency_contacts table
2. **Copy existing contacts** to all people in each membership
   - Example: If membership #123 has 3 people, each gets a copy of the contacts
3. **Make `person_id` required** (NOT NULL)
4. **Update RLS policies** to use person_id instead of membership_id
5. **Optionally remove `membership_id`** (commented out by default for safety)

## Migration Strategy: Copy to All

We chose to **copy contacts to all family members** because:

- ✅ Safer - no data loss
- ✅ Each person starts with the same contacts
- ✅ They can customize their own contacts going forward
- ✅ Existing emergency contacts still work for everyone

### Example

**Before migration:**
```
Membership #123:
└── Emergency Contact: "Jane Doe, Spouse, 555-1234"

People in membership:
├── John (dad)
├── Sarah (mom)  
└── Timmy (son, age 8)
```

**After migration:**
```
John's Emergency Contacts:
└── "Jane Doe, Spouse, 555-1234"

Sarah's Emergency Contacts:
└── "Jane Doe, Spouse, 555-1234"

Timmy's Emergency Contacts:
└── "Jane Doe, Spouse, 555-1234"
```

**After users customize:**
```
John's Emergency Contacts:
├── "Sarah Doe, Spouse, 555-5678"
└── "Bob Smith, Brother, 555-9012"

Sarah's Emergency Contacts:
├── "John Doe, Spouse, 555-1234"
└── "Jane Smith, Sister, 555-3456"

Timmy's Emergency Contacts:
├── "John Doe, Father, 555-1234"
└── "Sarah Doe, Mother, 555-5678"
```

## Running The Migration

### Step 1: Backup Your Data (Recommended)
```sql
-- Create backup table
CREATE TABLE emergency_contacts_backup AS 
SELECT * FROM emergency_contacts;
```

### Step 2: Run The Migration
1. Open Supabase SQL Editor
2. Copy entire contents of `emergency_contacts_migration.sql`
3. Review the script (it has comments explaining each step)
4. Click "Run"

### Step 3: Verify
The migration includes verification queries at the end:
- Check all contacts have person_id
- View distribution of contacts per person
- Confirm RLS policies are correct

### Step 4: Test
- Log in as a clinician
- View a patient chart
- Verify emergency contacts display correctly

## Rollback Plan

If something goes wrong, the migration includes rollback instructions:

```sql
-- 1. Drop the new constraint
ALTER TABLE emergency_contacts DROP CONSTRAINT emergency_contacts_person_id_fkey;

-- 2. Remove person_id column  
ALTER TABLE emergency_contacts DROP COLUMN person_id;

-- 3. Restore from backup
INSERT INTO emergency_contacts 
SELECT * FROM emergency_contacts_backup
WHERE id NOT IN (SELECT id FROM emergency_contacts);
```

## After Migration

### What Changes in the App

**Before:** Emergency contacts fetched by membership_id
```typescript
.eq('membership_id', person.membership_id)
```

**After:** Emergency contacts fetched by person_id
```typescript
.eq('person_id', personId)
```

The updated `getPatientChart.ts` already has this change.

### User Experience

**For patients:**
- They can now manage their own emergency contacts
- Changing their contacts won't affect family members
- Each person can have different contacts

**For clinicians:**
- Charts show correct person-specific contacts
- No confusion about who to call in emergencies
- More accurate emergency contact information

## FAQs

**Q: Will existing contacts be lost?**  
A: No, all existing contacts are copied to each person.

**Q: Can I keep using membership_id?**  
A: Technically yes, but it's not recommended. Person-specific contacts are more accurate.

**Q: What if I have a lot of data?**  
A: The migration handles any amount of data. It uses a DO block with loops.

**Q: Can I undo this?**  
A: Yes, use the rollback plan provided in the script.

**Q: Will this break my app?**  
A: Not if you use the updated `getPatientChart.ts` provided.

## Timeline

1. **Now:** Review this document
2. **Next:** Run `emergency_contacts_migration.sql`
3. **Then:** Run `database_migration_minimal.sql`
4. **Finally:** Deploy updated application code

## Need Help?

If you encounter issues:
1. Check Supabase logs for error messages
2. Run the verification queries in the migration
3. Confirm the table structure matches expectations
4. Test with a single patient before rolling out

---

**This is a one-time migration. Once completed, your emergency contacts will be person-based going forward.**

✅ **Ready to migrate? Open `emergency_contacts_migration.sql` and run it!**
