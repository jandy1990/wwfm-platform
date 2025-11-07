# Supabase Connection Guide for Claude Web

## Database Credentials

**Supabase URL**: `https://wqxkhxdbxdtpuvuvgirx.supabase.co`
**Publishable (Anon) Key**: `sb_publishable_7l8zsP4JB1VkjfclBZf3Yg_DbzTfeqr`
**Service Role Key**: `sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX`
**Project ID**: `wqxkhxdbxdtpuvuvgirx`

**Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7` ("Reduce anxiety")

**Which Key to Use**:
- **Service Role Key** (recommended): Full database access, bypasses RLS policies
- **Publishable Key**: Standard access with RLS policies enforced

---

## Direct REST API Access (Recommended for Claude Web)

Since the Supabase JS client is having network issues, use **direct curl commands** instead:

### Test Connection
```bash
curl -X GET 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solutions?limit=1' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX"
```

### Check Existing Solutions for Goal
```bash
curl -X GET 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links?goal_id=eq.56e2801e-0d78-4abd-a795-869e5b780ae7&select=*,solution_variants(solution_id,solutions(title,solution_category))' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX"
```

### Insert Solution (Example)
```bash
# Step 1: Insert into solutions table
curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solutions' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Test Solution",
    "description": "Test description",
    "solution_category": "medications",
    "is_approved": true
  }'

# Step 2: Insert variant (use the solution_id from step 1)
curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solution_variants' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "solution_id": "<UUID_FROM_STEP_1>",
    "variant_name": "Standard"
  }'

# Step 3: Create goal-solution link (use variant_id from step 2)
curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
    "implementation_id": "<VARIANT_ID_FROM_STEP_2>",
    "avg_effectiveness": 4.3,
    "aggregated_fields": {
      "time_to_results": {
        "mode": "2-4 weeks",
        "values": [
          {"value": "2-4 weeks", "count": 35, "percentage": 35, "source": "research"},
          {"value": "1-2 months", "count": 30, "percentage": 30, "source": "research"},
          {"value": "1-2 weeks", "count": 20, "percentage": 20, "source": "studies"},
          {"value": "3-6 months", "count": 10, "percentage": 10, "source": "studies"},
          {"value": "Less than 1 week", "count": 5, "percentage": 5, "source": "research"}
        ],
        "totalReports": 100,
        "dataSource": "ai_research"
      }
    }
  }'
```

---

## PostgreSQL Direct Access (Alternative)

If REST API doesn't work, use direct PostgreSQL connection:

```bash
psql "postgresql://postgres.wqxkhxdbxdtpuvuvgirx:GoWhenTheRoadOpens5775!@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**Password**: `GoWhenTheRoadOpens5775!`

### Example Queries
```sql
-- Check existing solutions for goal
SELECT s.id, s.title, s.solution_category
FROM solutions s
JOIN solution_variants sv ON sv.solution_id = s.id
JOIN goal_implementation_links gil ON gil.implementation_id = sv.id
WHERE gil.goal_id = '56e2801e-0d78-4abd-a795-869e5b780ae7';

-- Insert solution with variant and link
BEGIN;

INSERT INTO solutions (id, title, description, solution_category, created_at, updated_at, is_approved)
VALUES (gen_random_uuid(), 'Solution Title', 'Description...', 'category_name', NOW(), NOW(), true)
RETURNING id;

-- Copy the returned ID, then:
INSERT INTO solution_variants (solution_id, variant_name)
VALUES ('<SOLUTION_ID>', 'Standard')
RETURNING id;

-- Copy the returned variant ID, then:
INSERT INTO goal_implementation_links (
  id, goal_id, implementation_id, avg_effectiveness, aggregated_fields, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '56e2801e-0d78-4abd-a795-869e5b780ae7',
  '<VARIANT_ID>',
  4.3,
  '{"time_to_results": {...}}'::jsonb,
  NOW(),
  NOW()
);

COMMIT;
```

---

## Troubleshooting

**If Node.js fetch fails** → Use curl commands directly
**If curl fails** → Use psql direct connection
**If psql not installed** → Generate JSON files, user will insert manually

**Network Issues**: Claude Web container may have restricted network access. If both curl and psql fail, generate all solution data as JSON files for manual insertion.

---

## Expected Solution Count

Based on STEP 0 assessment:
- **Classification**: BROAD (major mental health challenge)
- **Target Count**: 45-50 solutions
- **Rationale**: Extensive evidence-based solutions across medications, therapy, apps, meditation, exercise, books, supplements
