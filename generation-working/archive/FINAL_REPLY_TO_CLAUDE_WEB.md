# Database Connection Instructions for Claude Web

## Credentials

**Supabase URL**: `https://wqxkhxdbxdtpuvuvgirx.supabase.co`
**Service Role Key**: `sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX`

Use the service role key for all database operations - it has full access.

---

## Test Connection

```bash
curl -X GET 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links?goal_id=eq.56e2801e-0d78-4abd-a795-869e5b780ae7&select=id' \
  -H 'apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX'
```

Should return `[]` (empty array - goal has 0 solutions, ready for generation).

---

## Insert Solutions - 3 Steps

For each of your 45 solutions, follow this pattern:

### Step 1: Insert Solution
```bash
response=$(curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solutions' \
  -H 'apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d '{
    "title": "Lexapro",
    "description": "FDA-approved SSRI for anxiety...",
    "solution_category": "medications",
    "is_approved": true
  }')

solution_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Solution ID: $solution_id"
```

### Step 2: Insert Variant
```bash
response=$(curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/solution_variants' \
  -H 'apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{
    \"solution_id\": \"$solution_id\",
    \"variant_name\": \"Standard\"
  }")

variant_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Variant ID: $variant_id"
```

### Step 3: Create Goal-Solution Link
```bash
curl -X POST 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links' \
  -H 'apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Content-Type: application/json' \
  -H 'Prefer: return=representation' \
  -d "{
    \"goal_id\": \"56e2801e-0d78-4abd-a795-869e5b780ae7\",
    \"implementation_id\": \"$variant_id\",
    \"avg_effectiveness\": 4.5,
    \"aggregated_fields\": {
      \"time_to_results\": {
        \"mode\": \"2-4 weeks\",
        \"values\": [
          {\"value\": \"2-4 weeks\", \"count\": 35, \"percentage\": 35, \"source\": \"research\"},
          {\"value\": \"1-2 months\", \"count\": 30, \"percentage\": 30, \"source\": \"research\"},
          {\"value\": \"1-2 weeks\", \"count\": 20, \"percentage\": 20, \"source\": \"studies\"},
          {\"value\": \"3-6 months\", \"count\": 10, \"percentage\": 10, \"source\": \"studies\"},
          {\"value\": \"Less than 1 week\", \"count\": 5, \"percentage\": 5, \"source\": \"research\"}
        ],
        \"totalReports\": 100,
        \"dataSource\": \"ai_research\"
      },
      \"frequency\": {
        \"mode\": \"Once daily\",
        \"values\": [
          {\"value\": \"Once daily\", \"count\": 60, \"percentage\": 60, \"source\": \"research\"},
          {\"value\": \"Twice daily\", \"count\": 25, \"percentage\": 25, \"source\": \"research\"},
          {\"value\": \"As needed\", \"count\": 10, \"percentage\": 10, \"source\": \"studies\"},
          {\"value\": \"Every other day\", \"count\": 5, \"percentage\": 5, \"source\": \"research\"}
        ],
        \"totalReports\": 100,
        \"dataSource\": \"ai_research\"
      },
      \"length_of_use\": {
        \"mode\": \"6-12 months\",
        \"values\": [
          {\"value\": \"6-12 months\", \"count\": 40, \"percentage\": 40, \"source\": \"research\"},
          {\"value\": \"3-6 months\", \"count\": 30, \"percentage\": 30, \"source\": \"research\"},
          {\"value\": \"1-2 years\", \"count\": 20, \"percentage\": 20, \"source\": \"studies\"},
          {\"value\": \"Less than 3 months\", \"count\": 10, \"percentage\": 10, \"source\": \"research\"}
        ],
        \"totalReports\": 100,
        \"dataSource\": \"ai_research\"
      },
      \"cost\": {
        \"mode\": \"\\$20-\\$50/month\",
        \"values\": [
          {\"value\": \"\\$20-\\$50/month\", \"count\": 45, \"percentage\": 45, \"source\": \"research\"},
          {\"value\": \"\\$10-\\$20/month\", \"count\": 30, \"percentage\": 30, \"source\": \"research\"},
          {\"value\": \"\\$50-\\$100/month\", \"count\": 15, \"percentage\": 15, \"source\": \"studies\"},
          {\"value\": \"Less than \\$10/month\", \"count\": 10, \"percentage\": 10, \"source\": \"research\"}
        ],
        \"totalReports\": 100,
        \"dataSource\": \"ai_research\"
      }
    }
  }"
```

---

## Validation After Insertion

Check total count:
```bash
curl -X GET 'https://wqxkhxdbxdtpuvuvgirx.supabase.co/rest/v1/goal_implementation_links?goal_id=eq.56e2801e-0d78-4abd-a795-869e5b780ae7&select=id' \
  -H 'apikey: sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' \
  -H 'Authorization: Bearer sb_secret_qNpxRchQXbrZpBp0O5Hv2w_OaCztmlX' | grep -o '"id"' | wc -l
```

Should return `45` when complete.

---

## Important Notes

1. **All field distributions must sum to 100%** - validate before insertion
2. **Use proper category fields** - check `FORM_DROPDOWN_OPTIONS_REFERENCE.md`
3. **Escape special characters** in JSON ($ becomes \$)
4. **Extract IDs from responses** - use grep/cut pattern shown above
5. **Insert all 45 solutions** - one at a time using this 3-step pattern

Proceed with generating and inserting all 45 solutions for "Reduce anxiety" goal.
