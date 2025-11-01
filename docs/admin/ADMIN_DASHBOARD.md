# Admin Dashboard Documentation

**URL:** `/admin`

**Access:** Restricted to users in `admin_users` table

## Features

### 1. Custom Professional Service Type Review

**Purpose:** Review and promote user-submitted custom service types to the main dropdown.

**Workflow:**
1. Users select "Other (please specify)" in professional_services form
2. They enter custom service type in text field
3. Data saved to `ratings.solution_fields.custom_specialty`
4. Admin reviews entries with 10+ uses
5. Admin clicks "Promote to Dropdown" for popular entries
6. System logs the promotion (manual code update required)

**Promotion Threshold:** 10+ uses (configurable)

**Manual Steps After Promotion:**
1. Update `lib/config/solution-dropdown-options.ts` - Add to `service_type` array (alphabetically)
2. Update `scripts/solution-generator/config/dropdown-options.ts` - Mirror the change
3. Update `FORM_DROPDOWN_OPTIONS_REFERENCE.md` - Document the new option
4. Deploy changes

**Future Enhancement:** Automate the config file updates via script generation.

---

## Database Schema

### Tables Used:
- `admin_users` - Admin authorization
- `ratings` - Contains `solution_fields.custom_specialty`

### Functions Created:
- `get_custom_specialty_counts()` - Returns custom specialty usage statistics

---

## Security

- ✅ Server-side auth check (Supabase Auth)
- ✅ Admin table verification
- ✅ Redirects non-admins to homepage
- ✅ Redirects unauthenticated users to login

---

## Future Features

Placeholder sections exist for:
- Solution moderation queue
- User management
- Analytics and reporting
- Content flags review

---

## Access Management

To grant admin access to a user:

```sql
INSERT INTO admin_users (user_id, created_by, notes)
VALUES (
  'user-uuid-here',
  'your-admin-uuid',
  'Reason for admin access'
);
```

To check current admins:

```sql
SELECT
  au.user_id,
  u.email,
  au.created_at,
  au.notes
FROM admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
ORDER BY au.created_at DESC;
```
