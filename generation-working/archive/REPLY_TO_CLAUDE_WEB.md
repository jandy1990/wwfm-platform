# Reply to Claude Web - Database Connection Fix

Copy and paste this entire message back to Claude Web:

---

## Database Connection Solution

I've set up three ways for you to access the Supabase database. Here are the credentials and instructions:

### Credentials

**Supabase URL**: `https://wqxkhxdbxdtpuvuvgirx.supabase.co`
**Service Role Key**: `sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX`
**Publishable Key**: `sb_publishable_7l8zsP4JB1VkjfclBZf3Yg_DbzTfeqr`

**Use the Service Role Key** - it bypasses RLS policies and gives you full database access.

### Step 1: Test Your Connection

Run this command first to verify everything works:

```bash
bash /home/user/wwfm-platform/generation-working/test-connection.sh
```

This will test the connection and confirm the goal has 0 existing solutions (ready for fresh generation).

### Step 2: Use curl for Database Operations

Since Node.js fetch is failing in your environment, use **curl commands directly** instead of the Supabase JS client.

#### Check existing solutions for the goal:
```bash
curl -s -X GET 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links?goal_id=eq.56e2801e-0d78-4abd-a795-869e5b780ae7&select=*,solution_variants(solution_id,solutions(title,solution_category))' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX"
```

#### Insert a solution (3-step process):

**Step 1: Insert into solutions table**
```bash
curl -s -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solutions' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Lexapro",
    "description": "SSRI antidepressant...",
    "solution_category": "medications",
    "is_approved": true
  }'
```

This returns JSON with an `id` field - **save this solution_id**.

**Step 2: Insert variant**
```bash
curl -s -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solution_variants' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "solution_id": "<SOLUTION_ID_FROM_STEP_1>",
    "variant_name": "Standard"
  }'
```

This returns JSON with an `id` field - **save this variant_id**.

**Step 3: Create goal-solution link**
```bash
curl -s -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links' \
  -H "apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "goal_id": "56e2801e-0d78-4abd-a795-869e5b780ae7",
    "implementation_id": "<VARIANT_ID_FROM_STEP_2>",
    "avg_effectiveness": 4.5,
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
      },
      "frequency": {
        "mode": "Once daily",
        "values": [
          {"value": "Once daily", "count": 60, "percentage": 60, "source": "research"},
          {"value": "Twice daily", "count": 25, "percentage": 25, "source": "research"},
          {"value": "As needed", "count": 10, "percentage": 10, "source": "studies"},
          {"value": "Every other day", "count": 5, "percentage": 5, "source": "research"}
        ],
        "totalReports": 100,
        "dataSource": "ai_research"
      }
    }
  }'
```

### Step 3: Parse JSON Responses

Each curl command returns JSON. Extract the `id` field using:

```bash
# Example: Save solution_id from response
response=$(curl -s -X POST '...' -d '{...}')
solution_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Solution ID: $solution_id"
```

Or use `jq` if available:
```bash
solution_id=$(echo "$response" | jq -r '.[0].id')
```

### Alternative: PostgreSQL Direct Access

If curl fails, use psql directly:

```bash
psql "postgresql://postgres.wqxkhxdbxdtpuvuvgirx:GoWhenTheRoadOpens5775!@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

Then use SQL commands:
```sql
BEGIN;

INSERT INTO solutions (id, title, description, solution_category, created_at, updated_at, is_approved)
VALUES (gen_random_uuid(), 'Lexapro', 'SSRI antidepressant...', 'medications', NOW(), NOW(), true)
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
  4.5,
  '{"time_to_results": {...}, "frequency": {...}}'::jsonb,
  NOW(),
  NOW()
);

COMMIT;
```

### Complete Reference Documentation

All details are in: `/home/user/wwfm-platform/generation-working/SUPABASE_CONNECTION_GUIDE.md`

### What to Do Now

1. **Test connection**: Run `bash /home/user/wwfm-platform/generation-working/test-connection.sh`
2. **If successful**: Proceed with your 45 solutions using curl commands for all database operations
3. **If curl fails**: Try psql direct connection
4. **If both fail**: Generate all solution data as JSON files for manual insertion

You have everything you need to proceed. Use curl for all database operations - replace the Supabase JS client calls with curl commands following the patterns above.

---

**TL;DR**: Use curl commands instead of Node.js Supabase client. Test with the shell script first, then proceed with insertion using the curl patterns provided.
