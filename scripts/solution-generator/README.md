# AI Solution Generator - Current Implementation

> **Last Updated**: January 2025
> **Status**: Production Ready
> **Data Format**: DistributionData with clear AI labeling

## Overview

The AI Solution Generator creates evidence-based solution data using Gemini AI, storing it in a format that seamlessly integrates with WWFM's human data aggregation system while maintaining clear separation between AI and human contributions.

## Core Architecture

### Two-Table Data System
- **`solution_fields`**: AI-generated data in DistributionData format
- **`aggregated_fields`**: Human-aggregated data only (computed by SolutionAggregator)
- **Clear separation**: No mixing of AI estimates with human experiences
- **Automatic transition**: System switches from AI to human data at 3 human ratings

### AI Data Format
AI data stored in research-based DistributionData format:
```json
{
  "side_effects": {
    "mode": "Nausea",
    "values": [
      {"value": "Nausea", "count": 40, "percentage": 40, "source": "research"},
      {"value": "Headache", "count": 25, "percentage": 25, "source": "clinical_studies"}
    ],
    "totalReports": 100,  // Virtual base, not real user count
    "dataSource": "ai_research"
  },
  "time_to_results": {
    "mode": "2-4 weeks",
    "values": [
      {"value": "2-4 weeks", "count": 60, "percentage": 60, "source": "studies"},
      {"value": "1-2 weeks", "count": 25, "percentage": 25, "source": "trials"},
      {"value": "4-8 weeks", "count": 15, "percentage": 15, "source": "research"}
    ],
    "totalReports": 100,
    "dataSource": "ai_research"
  }
}
```

## Current Scripts

### Active Scripts
- **`index.ts`**: Core solution generator (single-pass, validated pipeline)
- **`solution-goal-expander-quality.ts`**: Expansion harness with quality controls (used for large batch backfills)
- **`generation-manager.ts`**: Manages generation batches and API limits
- **`monitor-expansion.ts`**: Progress monitoring and quality tracking

- **`database/inserter.ts`**: Writes solutions/goals safely (token-based canonical matching prevents duplicates, distributions diversified before insert)
- **`generators/solution-generator.ts`**: Orchestrates required-field prompts, alias mapping, validation, retries
- **`prompts/master-prompts-improved.ts`**: Evidence-based prompting strategy for per-field distributions

### Archived Scripts
See `/archive/` for:
- Old fix scripts (beauty skincare, dropdown mappings)
- Deprecated validation approaches
- Legacy quality pipelines

## Data Quality Principles

### 1. Evidence-Based Generation
- All data sourced from AI's training on medical literature
- Research-based percentages, not random generation
- Clear sourcing attribution in data structure

### 2. Format Consistency
- Same DistributionData structure as human aggregations
- Enables seamless display logic
- Supports transition system without breaking changes

### 3. Transparency
- `totalReports: 100` indicates virtual research base
- `dataSource: "ai_research"` clearly marks AI origin
- No fake user counts or misleading statistics

### 4. Transition Compatibility
- AI data preserved in `ai_snapshot` during transition
- Human data replaces AI data naturally at 3 ratings
- No contamination between data sources

## Integration with Platform

### Display Logic
```javascript
// GoalPageClient checks data_display_mode
if (data_display_mode === 'ai') {
  // Show solution_fields (AI data)
  // Badge: "AI-Generated 🤖"
} else {
  // Show aggregated_fields (human data)
  // Badge: "Community Verified ✓"
}
```

### Transition Flow
1. **Initial**: AI data in `solution_fields`, `data_display_mode: 'ai'`
2. **Human ratings**: Stored separately, counted in `human_rating_count`
3. **Threshold hit**: At 3 ratings, `data_display_mode` switches to `'human'`
4. **Post-transition**: Display shows human `aggregated_fields`, AI data preserved in `ai_snapshot`

## Usage

### Generate Solutions
```bash
# Expand solutions for specific category
npx tsx solution-goal-expander-quality.ts --category sleep --mode zero --batch-size 20

# Monitor progress
npx tsx monitor-expansion.ts --category sleep

# Quality check
npx tsx check-progress.ts
```

### Key Parameters
- `--category`: Target solution category
- `--mode`: zero (no connections), single (1 connection), auto (priority-based)
- `--batch-size`: Solutions per batch (respect API limits)
- `--dry-run`: Preview without database changes

## Quality Assurance

### Built-in Validations
- **Credibility Validator**: Medical/expert credibility checks
- **Laugh Test**: Prevents nonsensical connections
- **Progress Tracker**: Monitors quality trends and stops on degradation
- **Evidence Requirement**: All data must trace to research sources

### Success Metrics
- **High credibility**: >70% pass rate on expert review test
- **Evidence-based**: All percentages tied to studies/research
- **Transition-ready**: Format compatible with human data display
- **Quality maintained**: No degradation over batch sizes

### Verification
- Run `npx vitest run scripts/solution-generator/database/canonical.test.ts` to confirm first-person naming & duplicate-matching heuristics remain intact.

### Recent Improvements (October 2025)
- **Solution Canonicalisation** – `database/inserter.ts` now applies token-based canonical signatures to collapse duplicates (e.g. “Prescription antidepressants (Sertraline/Zoloft)” resolves to existing “Sertraline (Zoloft)”).
- **First-Person Title Enforcement** – generator and inserter rewrite AI suggestions into the exact phrasing a member would submit (“Hatha yoga”, not “Yoga practice (Hatha yoga)”).
- **Dropdown Alias Mapping** – enhanced `mapFieldToDropdown` handles practice/session/app frequency aliases (`once daily`, `video/online`, etc.) so Gemini outputs land on approved SSOT values.
- **Distribution Diversity Guard** – low-diversity distributions are reshaped before insert (minimum 3 unique bins where available, realistic percentage templates, consistent counts).
- **Validation Harness** – `tests/integration/generator-validation.test.ts` runs generator (dry-run) + validator (`--assert-zero`) in CI to catch regressions immediately.

## Troubleshooting

### Common Issues

1. **Medication Cost Field Mismatch** (CRITICAL - Fixed Nov 2, 2025)
   - Issue: AI generates monthly costs ("$10-25/month") but medications expect one-time costs ("$20-50")
   - Impact: ~15-20 medication solutions skipped across generation runs
   - Fix: Added explicit medication cost format instruction in `lib/ai-generation/fields/prompt.ts`
   - Status: Fixed, but some medications still slip through retries

2. **AI Miscategorization** (~5-10% of solutions affected)
   - Issue: AI occasionally categorizes solutions incorrectly
   - Examples found:
     - "Nicotine Replacement Therapy" → habits_routines (should be medications)
     - "The Acne.org Regimen" → habits_routines (should be beauty_skincare)
     - "Daily Stoic Journal by Ryan Holiday" → habits_routines (should be books_courses)
     - "Mindful Walking Meditation" → exercise_movement (should be meditation_mindfulness)
   - Impact: Canonical matching only works within same category, so duplicates can occur across categories
   - Status: Known issue, acceptable for launch, manual cleanup as needed
   - Prevention: Prompt improvements and category keyword enforcement

3. **"Like/Such as/E.g." in Titles** (Fixed Nov 2, 2025)
   - Issue: AI generates "Nicotine replacement therapy like Nicoderm CQ" instead of just "Nicoderm CQ"
   - Fails "friend test": Not how real people talk
   - Fix: Added explicit prohibition in prompt + `enforceFirstPersonTitle` function strips these patterns
   - Filter: Added "like/such/as/eg/including/example" to `GENERIC_TITLE_TOKENS`

4. **Rate Limits**: Gemini free tier = 15 requests/minute, 1000/day
   - Solution: Built-in 3-4 second delays + exponential backoff on errors

5. **Low Diversity Distributions** (60-70% of fields)
   - Issue: AI generates 2-3 values instead of target 5-8
   - Root causes: Over-aggressive deduplication, fallback diversity injection
   - Status: Acceptable for launch, improvements planned

6. **Format Inconsistency**: Mixed string/DistributionData formats
   - Solution: Ensure all fields use DistributionData structure

7. **Display Issues**: Cards not showing AI data
   - Solution: Check `data_display_mode` and `solution_fields` format

### Debug Commands
```bash
# Check current data format
npx supabase db query "SELECT solution_fields FROM goal_implementation_links WHERE data_display_mode = 'ai' LIMIT 5"

# Verify transition system
npx supabase db query "SELECT COUNT(*) as transitioned FROM goal_implementation_links WHERE data_display_mode = 'human'"
```

## Future Enhancements

### Planned Improvements
- **Dynamic Quality Thresholds**: Adjust based on category complexity
- **Multi-AI Validation**: Cross-validate with Claude for medical data
- **Confidence Intervals**: Show statistical confidence in research data
- **Source Attribution**: Link to specific studies where possible

## Migration Notes

### From Old System
The generator has evolved from a 3-table system to a clean 2-table approach:
- ❌ **Old**: `solution_fields` (arrays) + `ai_field_distributions` (separate table) + `aggregated_fields` (human)
- ✅ **New**: `solution_fields` (DistributionData) + `aggregated_fields` (human only)

### Key Changes
- Eliminated `ai_field_distributions` table
- Unified DistributionData format for both AI and human data
- Clear data source labeling
- Seamless transition system integration

---

**Remember**: The goal is transparent, evidence-based AI data that seamlessly transitions to authentic human experiences as the community grows.
