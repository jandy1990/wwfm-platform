# Archived Goals Table - Security Notice

## Table: `archived_tier4_goals`

### Purpose
This table contains **514 goals** that were removed during the platform curation process in January 2025. These goals didn't fit WWFM's solution-rating model.

### Contents
Goals that were too philosophical, subjective, or unmeasurable for the platform:
- "Find my purpose in life"
- "Love myself"
- "Be more spiritual"
- "Achieve enlightenment"
- Similar philosophical/journey-type goals

### Security Status
✅ **RLS ENABLED** (as of 2025-09-14)
- Table is secured with Row Level Security
- Currently restricted - no public access
- Admin-only access (pending admin role implementation)

### RLS Policy
```sql
-- Current policy: Complete restriction
CREATE POLICY "archived_goals_admin_only" 
ON archived_tier4_goals
FOR ALL 
TO authenticated
USING (false)  -- Blocks all access
WITH CHECK (false);
```

### Future Considerations
When admin roles are implemented, update the policy:
```sql
-- Future: Allow admin access
DROP POLICY "archived_goals_admin_only" ON archived_tier4_goals;

CREATE POLICY "archived_goals_admin_read" 
ON archived_tier4_goals
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);
```

### Why These Goals Were Archived
See: `/docs/decisions/goal-curation-2025.md` for full rationale

These goals fundamentally don't fit WWFM's model of crowdsourcing specific, rateable solutions. They're preserved for historical reference but not part of the active platform.

---

**Security Check Command**:
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'archived_tier4_goals';
```

Expected result: `rowsecurity = true`