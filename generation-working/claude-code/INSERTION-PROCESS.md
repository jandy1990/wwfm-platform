# Insertion Process (For Claude Code)

**When final-output.json is received**

---

## Step 1: Quick Validation (5 min)

Check `validation_summary`:
```json
{
  "count_check": {"passed": true},
  "percentage_check": {"passed": true, "fields_with_errors": []},
  "category_fields_check": {"passed": true, "solutions_with_missing_fields": []},
  "dropdown_values_check": {"passed": true, "invalid_values": []}
}
```

If all `passed: true` and all error arrays empty → Proceed to insertion

If any failures → Review specific errors and fix before insertion

---

## Step 2: Insert Solutions (30-45 min for 45 solutions)

For EACH solution in the `solutions` array:

### 2.1: Insert into solutions table
```javascript
const solutionData = {
  title: solution.title,
  description: solution.description,
  solution_category: solution.solution_category,
  is_approved: true
};

// Use mcp__supabase__execute_sql
INSERT INTO solutions (id, title, description, solution_category, created_at, updated_at, is_approved)
VALUES (gen_random_uuid(), '${title}', '${description}', '${category}', NOW(), NOW(), true)
RETURNING id;

// Save returned solution_id
```

### 2.2: Insert into solution_variants table
```javascript
// Use mcp__supabase__execute_sql
INSERT INTO solution_variants (solution_id, variant_name)
VALUES ('${solution_id}', 'Standard')
RETURNING id;

// Save returned variant_id
```

### 2.3: Insert into goal_implementation_links table
```javascript
// Use mcp__supabase__execute_sql
INSERT INTO goal_implementation_links (
  id, goal_id, implementation_id, avg_effectiveness, aggregated_fields, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '${goal_id}',
  '${variant_id}',
  ${avg_effectiveness},
  '${JSON.stringify(aggregated_fields)}'::jsonb,
  NOW(),
  NOW()
);
```

**Key**: `aggregated_fields` from JSON is already in correct JSONB format!

---

## Step 3: Validate Insertion (5 min)

Check count:
```sql
SELECT COUNT(*) FROM goal_implementation_links WHERE goal_id = '${goal_id}';
```

Should equal `actual_count` from final-output.json (e.g., 45)

---

## Step 4: Export AFTER Data (5 min)

Run same export query as BEFORE:
```sql
SELECT
  s.title,
  s.solution_category,
  gil.avg_effectiveness,
  gil.aggregated_fields
FROM goal_implementation_links gil
JOIN solution_variants sv ON sv.id = gil.implementation_id
JOIN solutions s ON s.id = sv.solution_id
WHERE gil.goal_id = '${goal_id}';
```

Save as: `generation-working/data/after-reduce-anxiety.json`

---

## Step 5: Generate Comparison Report

Compare BEFORE vs AFTER:
- Solution count (22 → 45)
- Average effectiveness (4.01 → ?)
- Category distribution
- Quality scores
- Field completeness

Output: `generation-working/comparison-report.md`

---

## Format Confirmation

✅ **goal_id**: Present at root level
✅ **title**: In each solution
✅ **description**: In each solution
✅ **solution_category**: In each solution
✅ **avg_effectiveness**: In each solution
✅ **aggregated_fields**: In each solution, already JSONB-ready
✅ **validation_summary**: Makes quick review easy

**Format is perfect for insertion!**
