# Solution Consolidation Process

## Find Duplicates
```sql
SELECT title, COUNT(*) as duplicates
FROM solutions 
WHERE source_type = 'ai_foundation'
GROUP BY title
HAVING COUNT(*) > 1;
```

## Consolidate Process

### 1. Choose Master Solution
- Keep the one with most goal links
- Best/most complete title and description

### 2. Transfer ALL Data
```sql
-- CRITICAL: Must preserve aggregated_fields 
INSERT INTO goal_implementation_links (goal_id, implementation_id, avg_effectiveness, aggregated_fields)
SELECT goal_id, new_variant_id, avg_effectiveness, aggregated_fields  -- ← MUST INCLUDE THIS
FROM old_goal_links;
```

### 3. Transfer Field Distributions
```sql
UPDATE ai_field_distributions 
SET solution_id = master_solution_id
WHERE solution_id = duplicate_solution_id;
```

### 4. Verify Fix
```sql
-- Should return 0 rows
SELECT COUNT(*) FROM goal_implementation_links 
WHERE aggregated_fields = '{}' OR aggregated_fields IS NULL;
```

## What NOT to Consolidate
- Different delivery methods: "CBT therapy" vs "CBT workbook" vs "CBT-I app"
- Different supplements: "Vitamin D" vs "Vitamin C" vs "Magnesium"
- Different platforms: "BetterHelp" vs "in-person therapy"

## Common Error
**Forgetting `aggregated_fields`** → Blank solution cards in UI

## Solutions Missing Field Data (From Yesterday's Consolidation)

These consolidated solutions need field data regeneration:

**High Priority (Major Consolidations):**
- "Cognitive Behavioral Therapy (CBT) with a Licensed Therapist" (15+ goals affected)
- "Headspace App" (22+ goals affected)

**Other Consolidated Solutions:**
- "EFT Tapping (Emotional Freedom Techniques)" 
- "Active Listening Practice"
- "Paula's Choice BHA"
- "YNAB (You Need A Budget)"
- "Sleep Cycle App" 
- "Pomodoro Technique"
- "Progressive Muscle Relaxation (PMR)"
- "Atomic Habits by James Clear"
- "StrongLifts 5x5 Program"
- "MyFitnessPal Calorie Tracking"

## Fix Empty Cards
```sql
-- Check which solutions need field data
SELECT COUNT(*) FROM goal_implementation_links 
WHERE aggregated_fields = '{}' OR aggregated_fields IS NULL;
```

**Action**: Regenerate field data for these solutions at end of today's generation.