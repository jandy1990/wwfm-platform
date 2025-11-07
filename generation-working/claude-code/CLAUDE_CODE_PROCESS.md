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

### Step 1: Pull Branch and Validate Output (5 min)

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

### Step 2: Spot-Check Quality (5 min)

```bash
# Check first 3 solutions
cat generation-working/final-output.json | jq '.solutions[0:3] | .[] | {index, title, category: .solution_category, effectiveness: .avg_effectiveness, field_count: (.aggregated_fields | length)}'

# Check a distribution example
cat generation-working/final-output.json | jq '.solutions[0].aggregated_fields.time_to_results'
```

**Verify**:
- ✅ Specific titles (not generic)
- ✅ Field distributions have 5-8 options
- ✅ Percentages sum to 100%
- ✅ Evidence-based sources (research/studies, not fallback)

### Step 3: Create Insertion Script (10 min)

Create `generation-working/claude-code/insert-solutions.ts`:

**Key features**:
- Uses Supabase TypeScript client
- Reads from `../final-output.json`
- Loops through all solutions
- For each solution:
  1. Insert into `solutions` table → get `solution_id`
  2. Insert into `solution_variants` table (variant_name: 'Standard') → get `variant_id`
  3. Insert into `goal_implementation_links` table with `aggregated_fields`
- Tracks success/failure counts
- Validates final count matches expected

**Run**:
```bash
npx tsx --env-file=.env.local generation-working/claude-code/insert-solutions.ts
```

### Step 4: Handle Duplicates (if any) (5-10 min)

If insertion script reports duplicate key violations:

**Expected behavior**: Solutions already exist in database
**Action**: Create variant + link for existing solutions

Create `generation-working/claude-code/insert-remaining-N.ts`:
- Query database for existing solution IDs
- Create Standard variant (or use existing variant)
- Create goal_implementation_link with aggregated_fields from final-output.json

**Run**:
```bash
npx tsx --env-file=.env.local generation-working/claude-code/insert-remaining-N.ts
```

### Step 5: Validate Insertion (2 min)

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

### Step 6: Export AFTER Data (5 min)

```typescript
// Category distribution
mcp__supabase__execute_sql({
  query: `
    SELECT
      s.solution_category,
      COUNT(*) as solution_count,
      ROUND(AVG(gil.avg_effectiveness)::numeric, 2) as avg_effectiveness
    FROM goal_implementation_links gil
    JOIN solution_variants sv ON sv.id = gil.implementation_id
    JOIN solutions s ON s.id = sv.solution_id
    WHERE gil.goal_id = '<goal_id>'
    GROUP BY s.solution_category
    ORDER BY solution_count DESC;
  `
})

// Overall statistics
mcp__supabase__execute_sql({
  query: `
    SELECT
      COUNT(*) as total_solutions,
      ROUND(AVG(gil.avg_effectiveness)::numeric, 2) as overall_avg,
      ROUND(MIN(gil.avg_effectiveness)::numeric, 2) as min_effectiveness,
      ROUND(MAX(gil.avg_effectiveness)::numeric, 2) as max_effectiveness
    FROM goal_implementation_links gil
    WHERE gil.goal_id = '<goal_id>';
  `
})
```

### Step 7: Create Quality Comparison Report (15-20 min)

Read BEFORE data from `generation-working/data/before-quality-report.md`

Create `generation-working/claude-code/QUALITY_COMPARISON_REPORT.md` with:

**Sections**:
1. Executive Summary (BEFORE vs AFTER key metrics)
2. Solution Count & Coverage (22 → 45, category changes)
3. Effectiveness Rating Analysis (maintained/improved?)
4. Quality Issue Resolution (BEFORE issues fixed?)
5. Technical Quality Validation (validation_summary breakdown)
6. Solution Specificity Analysis (spot checks)
7. Batched Generation System Performance (reliability stats)
8. Category Distribution Quality (diversity improvements)
9. Comparison to Quality Targets (met/exceeded?)
10. Evidence-Based Distribution Quality (sample checks)
11. Key Achievements (wins, maintained quality, process improvements)
12. Recommended Next Steps & Conclusion

**Key comparisons**:
- Total solutions (count increase)
- Average effectiveness (maintained quality)
- Category diversity (breadth improvement)
- Quality issues (before → after)
- System reliability (success rate)

### Step 8: Archive Batch Files (CRITICAL - DO NOT SKIP)

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

### Step 9: Commit and Push (5 min)

```bash
git add generation-working/
git commit -m "Complete solution generation for '<goal-title>'

Results:
- Generated: X solutions (up from Y)
- Inserted: X/X successfully
- Average effectiveness: Z.ZZ
- Category diversity: N categories

See generation-working/claude-code/QUALITY_COMPARISON_REPORT.md for details.

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
✅ Quality comparison report created
✅ Batch files archived with timestamped folder
✅ Changes committed to repository
✅ No database errors or warnings

---

## Time Estimates

| Step | Time | Notes |
|------|------|-------|
| Pull & validate | 5 min | Quick checks |
| Spot-check quality | 5 min | Sample distributions |
| Create insertion script | 10 min | Bulk insert logic |
| Handle duplicates | 5-10 min | If needed |
| Validate insertion | 2 min | Count query |
| Export AFTER data | 5 min | Stats queries |
| Quality report | 15-20 min | Comprehensive analysis |
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
