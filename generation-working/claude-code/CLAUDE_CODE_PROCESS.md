# Claude Code Process: Solution Insertion & Validation

**For Claude Code (local MCP access) to execute after Claude Web completes all phases**

This documents the steps Claude Code must perform to insert generated solutions and validate quality.

---

## Prerequisites

✅ Claude Web has completed all phases and pushed:
- `solution-list.json`
- `batch-1.json` through `batch-N.json`
- `final-output.json`

✅ Branch pushed to GitHub with all outputs

---

## Process Steps

### Step 0: Create Deduplication Reference (10-15 min) **BEFORE Claude Web**

**CRITICAL**: This must be done BEFORE giving anything to Claude Web

```bash
# Generate existing solutions reference
npx tsx --env-file=.env.local generation-working/claude-code/create-dedup-reference.ts "<goal_id>" "<goal_title>"

# Example:
# npx tsx --env-file=.env.local generation-working/claude-code/create-dedup-reference.ts "56e2801e-0d78-4abd-a795-869e5b780ae7" "Reduce anxiety"
```

**What this does**:
1. Queries all solutions currently linked to this goal
2. Queries ALL solutions in database (for cross-goal deduplication)
3. Analyzes category gaps
4. Calculates how many NEW solutions needed
5. Creates `existing-solutions-reference.json`

**Output**: `generation-working/existing-solutions-reference.json`

**Contents**:
```json
{
  "existing_solutions": [
    {"title": "...", "solution_id": "...", "in_current_goal": true/false},
    ...
  ],
  "gaps_to_fill": ["Missing medications", "Need specific apps"],
  "target_new_count": 23
}
```

**Verify**:
- ✅ File created successfully
- ✅ existing_solutions list is comprehensive
- ✅ gaps_to_fill accurately identifies what's missing
- ✅ target_new_count makes sense (total_target - existing_count)

**Give to Claude Web**: Both `goal-info.json` AND `existing-solutions-reference.json`

---

### Step 1: Pull Branch and Validate Output (5 min) **AFTER Claude Web**

```bash
# Pull the branch with Claude Web's outputs
git pull origin <branch-name>

# Verify all files present
ls generation-working/

# Quick validation - check summary from Phase Three
cat generation-working/final-output.json | jq '{goal_id, goal_title, target_count, actual_count, validation_summary}'
```

**Verify**:
- ✅ `actual_count` matches `target_count`
- ✅ All validation checks show `passed: true`
- ✅ No errors in arrays (`fields_with_errors`, `invalid_values`, etc.)

### Step 2: Validate Titles (5 min)

```bash
# Run title validation script
npx tsx generation-working/claude-code/validate-titles.ts generation-working/solution-list.json
```

**What this checks**:
- ❌ Generic terms ("strength training", "running", "deep breathing")
- ❌ Category names in titles ("CBT with licensed therapist")
- ❌ Multiple options in title ("Running or jogging")
- ⚠️ Very long or very short titles

**If errors found**:
- **STOP** - Do not proceed to insertion
- Fix titles in solution-list.json or ask Claude Web to regenerate
- Re-run validation until all errors cleared

### Step 3: Spot-Check Quality (5 min)

```bash
# Check first 3 solutions from final-output.json
cat generation-working/final-output.json | jq '.solutions[0:3] | .[] | {index, title, category: .solution_category, effectiveness: .avg_effectiveness, field_count: (.aggregated_fields | length)}'

# Check a distribution example
cat generation-working/final-output.json | jq '.solutions[0].aggregated_fields.time_to_results'
```

**Verify**:
- ✅ NO descriptions present (or minimal placeholders only)
- ✅ Specific titles (not generic)
- ✅ Field distributions have 5-8 options
- ✅ Percentages sum to 100%
- ✅ Evidence-based sources (research/studies, not fallback)

### Step 4: Create Insertion Script with Deduplication (15-20 min)

Create `generation-working/claude-code/insert-solutions-with-dedup.ts`:

**Key features**:
- Uses Supabase TypeScript client
- Reads from `../final-output.json`
- **CRITICAL**: Checks for existing solutions BEFORE inserting
- Loops through all solutions
- For each solution:

  **Step A: Deduplication Check**
  ```typescript
  // Search for existing solution by title similarity
  const { data: existing } = await supabase
    .from('solutions')
    .select('id, title, solution_category')
    .ilike('title', `%${coreTitle}%`)
    .eq('solution_category', solution.solution_category);

  let solution_id;
  if (existing && existing.length > 0) {
    // Use existing solution
    solution_id = existing[0].id;
    console.log(`  ✓ Linking to existing: ${existing[0].title}`);
  } else {
    // Create new solution
    const { data: newSolution } = await supabase
      .from('solutions')
      .insert({
        title: solution.title,
        description: solution.description || '',
        solution_category: solution.solution_category,
        is_approved: true
      })
      .select('id')
      .single();

    solution_id = newSolution.id;
    console.log(`  ✓ Created new: ${solution.title}`);
  }
  ```

  **Step B**: Find or create variant
  **Step C**: Create goal_implementation_link with `aggregated_fields`

- Tracks: created new vs linked existing
- Validates final count matches expected

**Run**:
```bash
npx tsx --env-file=.env.local generation-working/claude-code/insert-solutions-with-dedup.ts
```

### Step 5: Review Deduplication Results (5 min)

Check the insertion summary:

```
============================================================
INSERTION SUMMARY
============================================================
✓ Linked to existing: 15 solutions
✓ Created new: 8 solutions
Total: 23 solutions

Existing solutions reused:
  - Cognitive Behavioral Therapy
  - Lexapro
  - Progressive Muscle Relaxation
  ...

New solutions created:
  - Headspace
  - 4-7-8 Breathing Technique
  ...
```

**Verify**:
- ✅ Linked count + created count = target count
- ✅ Solutions that SHOULD exist were linked (not recreated)
- ✅ Only genuinely new solutions were created
- ❌ If duplicates were created, **ROLLBACK and fix dedup logic**

### Step 6: Validate Insertion (2 min)

Query database to confirm count:

```typescript
// Via MCP tool
mcp__supabase__execute_sql({
  project_id: 'wqxkhxdbxdtpuvuvgirx',
  query: `
    SELECT COUNT(*) as total_count
    FROM goal_implementation_links
    WHERE goal_id = '<goal_id>';
  `
})
```

**Verify**: Count matches `actual_count` from final-output.json

### Step 7: Archive Batch Files (CRITICAL - DO NOT SKIP)

Move all batch and output files to archive folder:

```bash
# Create timestamped archive folder
mkdir -p generation-working/archive/reduce-anxiety-2025-11-07

# Archive batch files and final output
mv generation-working/batch-*.json generation-working/archive/reduce-anxiety-2025-11-07/
mv generation-working/final-output.json generation-working/archive/reduce-anxiety-2025-11-07/
mv generation-working/solution-list.json generation-working/archive/reduce-anxiety-2025-11-07/

# Keep a copy of final-output.json for future reference
cp generation-working/archive/reduce-anxiety-2025-11-07/final-output.json generation-working/claude-code/final-output-reduce-anxiety.json

# Create archive README
cat > generation-working/archive/reduce-anxiety-2025-11-07/README.md << 'EOF'
# Reduce Anxiety - Generation Archive

**Goal**: Reduce anxiety
**Goal ID**: 56e2801e-0d78-4abd-a795-869e5b780ae7
**Date**: 2025-11-07
**Classification**: Broad
**Solutions Generated**: 45

## Files
- solution-list.json (Phase One output)
- batch-1.json through batch-5.json (Phase Two outputs)
- final-output.json (Phase Three output - inserted into database)

## Results
✅ 45/45 solutions successfully inserted
✅ All validation checks passed
✅ Quality report: generation-working/claude-code/QUALITY_COMPARISON_REPORT.md

## Database Status
Inserted: 2025-11-07
Status: Active in production
EOF
```

**Why archive?**
- Keeps generation-working/ clean for next goal
- Preserves historical record of what was generated
- Allows reverting if needed
- Documents generation date and results

### Step 8: Commit and Push (5 min)

```bash
git add generation-working/
git commit -m "Complete solution generation for '<goal-title>'

Results:
- Generated: X solutions
- Inserted: X/X successfully
- Average effectiveness: Z.ZZ
- Category diversity: N categories

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
```

---

## Common Issues & Solutions

### Issue: Duplicate Key Violations
**Cause**: Solution already exists in database
**Fix**: Create variant + link for existing solution (see Step 4)

### Issue: Missing Environment Variables
**Cause**: .env.local not loaded
**Fix**: Use `npx tsx --env-file=.env.local` or `node -r dotenv/config`

### Issue: Response Too Large
**Cause**: Trying to export all 45 solutions with full field data
**Fix**: Use summary queries (COUNT, AVG) or paginate results

### Issue: Field Count Mismatch
**Cause**: Category has wrong fields in final-output.json
**Fix**: Verify against `docs/solution-fields-ssot.md` before insertion

---

## Success Criteria

Before considering the process complete:

✅ All solutions inserted into database
✅ Insertion count matches `actual_count` from final-output.json
✅ Batch files archived with timestamped folder
✅ Changes committed to repository
✅ No database errors or warnings

---

## Time Estimates

| Step | Time | Notes |
|------|------|-------|
| **Step 0: Create dedup reference** | **10-15 min** | **BEFORE Claude Web** |
| Pull & validate | 5 min | Quick checks |
| Validate titles | 5 min | Check for generic/redundant |
| Spot-check quality | 5 min | Sample distributions |
| Create insertion script | 15-20 min | With deduplication logic |
| Review dedup results | 5 min | Verify linked vs created |
| Validate insertion | 2 min | Count query |
| **Archive batch files** | **5 min** | **CRITICAL STEP** |
| Commit & push | 5 min | Git operations |
| **Total** | **~60 min** | **For 45 solutions** |

---

## Next Goal

After completing all steps and archiving:

1. Clear generation-working/ of JSON outputs (archived)
2. Update goal-info.json with next goal details
3. Provide START-HERE.md to Claude Web for next generation cycle
4. Repeat process

The phase instruction files (PHASE-ZERO.md, PHASE-ONE.md, etc.) remain unchanged and reusable for all goals.
