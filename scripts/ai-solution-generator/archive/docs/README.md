# AI-Powered Solution Generator with Quality System for WWFM

## 📖 IMPORTANT: Read Context First
**Before using this system, read [CONTEXT.md](./CONTEXT.md) and [LEARNINGS.md](./LEARNINGS.md) to understand the principles, specificity requirements, and rules behind this generator.**

## 🎯 Overview
This is a hybrid AI system that combines:
1. **Gemini Generation** - Mass generation of solutions using Attribution Required strategy (100% specificity)
2. **Claude Quality Checking** - Targeted quality improvements across 5 dimensions

**Result:** 95%+ quality solutions at 5% of the cost of pure Claude generation

## ⚠️ Critical: Attribution Required Strategy
**All solutions MUST have attribution to their source:**
- ✅ "Dr. Weil's 4-7-8 breathing" 
- ✅ "Headspace's anxiety pack"
- ✅ "AA's 12-step program"
- ❌ "meditation" → REJECTED
- ❌ "therapy" → REJECTED

This strategy achieved 100% specificity in testing (see [REFINED_TESTING_SUMMARY.md](./REFINED_TESTING_SUMMARY.md))

## How It Works
1. **Reads all goals** from the database
2. **Asks Gemini** for the 15 most effective solutions for each goal
3. **Gets prevalence distributions** for realistic field variations
4. **Inserts everything** into the database with proper relationships
5. **Rate limits automatically** to stay within free tier (1000 requests/day)

## Setup

### 1. Install Dependencies
```bash
npm install @google/generative-ai commander chalk dotenv
# Note: @anthropic-ai/sdk is no longer needed (kept for reference)
```

### 2. Environment Variables
Add to your `.env.local` file:
```env
# Gemini API Key (FREE - replaces Claude which cost $137/run)
GEMINI_API_KEY=AIzaSyAeHrw-JAKpenIJO6Z7uIxza9WvjnSlYA0

# Supabase keys should already be in your .env.local
# Old Claude key (deprecated):
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 3. Add to package.json
```json
"scripts": {
  "generate:ai-solutions": "tsx scripts/ai-solution-generator/index.ts"
}
```

## Usage

### Generate for All Goals
```bash
npm run generate:ai-solutions
```

### Dry Run (Preview Only)
```bash
npm run generate:ai-solutions -- --dry-run
```

### Generate for Specific Goal
```bash
npm run generate:ai-solutions -- --goal-id=<uuid>
```

### Limit Solutions Per Goal
```bash
npm run generate:ai-solutions -- --limit=10
```

### Start from Specific Index
```bash
npm run generate:ai-solutions -- --start-from=100
```

### Reset Daily Usage Tracking
```bash
npm run generate:ai-solutions -- --reset-usage
```

## What Gets Generated

For each goal, the system generates:

1. **Solutions** - 20 evidence-based recommendations (default)
2. **Variants** - For dosage categories (medications, supplements, etc.)
3. **Effectiveness Ratings** - Based on research (3.0-5.0 stars)
4. **Field Data** - All required fields for display
5. **Prevalence Distributions** - Realistic variations for each field

## Example Output

```
🚀 WWFM AI-Powered Solution Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Using Gemini AI for evidence-based recommendations
💰 Cost: FREE (was $137 with Claude)
⏱️  Time: 2-3 days with free tier limits

✓ Found 652 goals to process

📦 Processing batch 1/66
────────────────────────────────────────

[1/652] 🎯 Reduce anxiety
   Arena: Mental Health
   🤖 Consulting AI for evidence-based solutions...
   📋 AI recommended 20 solutions
      1. Cognitive Behavioral Therapy (4.6★) - therapists_counselors
      2. SSRIs (Sertraline) (4.3★) - medications
      3. Regular Exercise (4.1★) - exercise_movement
   💾 Processing: Cognitive Behavioral Therapy
      ✨ Created new solution: Cognitive Behavioral Therapy
      ✅ Successfully inserted Cognitive Behavioral Therapy
   ✅ Generated 20 solutions
```

## Database Structure

The generator populates these tables:
- `solutions` - Base solution entities
- `solution_variants` - Specific versions (dosages, etc.)
- `goal_implementation_links` - Connects solutions to goals with effectiveness
- `ai_field_distributions` - Prevalence data for each field

## Categories Supported

All 23 categories are supported:
- Medications, Supplements, Natural Remedies, Beauty/Skincare
- Therapists, Doctors, Coaches, Alternative Practitioners
- Apps/Software, Products/Devices, Books/Courses
- Exercise, Meditation, Habits, Diet, Sleep
- Support Groups, Communities, Hobbies
- Professional Services, Medical Procedures, Financial Products
- Crisis Resources

## Field Requirements

Each category has specific required fields defined in `config/category-fields.ts`. The system ensures all required fields are populated based on the category.

## Customization

### Adjust Prompts
Edit `prompts/master-prompts.ts` to refine how Gemini generates solutions.

### Change Categories
Update `config/category-fields.ts` to modify field requirements.

### Modify Effectiveness Criteria
Adjust the effectiveness guidance in the master prompt.

## Cost & Time Estimates

### With Gemini (Current - FREE)
- **Cost: $0** (using free tier)
- **Time: 2-3 days** due to rate limits
- **Daily limit: 1000 requests**
- **Rate limit: 15 requests/minute**
- ~652 goals × 2 API calls = 1,304 total calls
- Will complete in 2 days with automatic resumption

### With Claude (Previous - EXPENSIVE)
- **Cost: $137** for full run
- **Time: 2-3 hours**
- No rate limits on paid tier

## Troubleshooting

### "GEMINI_API_KEY not found"
Add the Gemini API key to your `.env.local` file:
```
GEMINI_API_KEY=AIzaSyAeHrw-JAKpenIJO6Z7uIxza9WvjnSlYA0
```

### "Array percentages not showing in UI"
Ensure array field values in `solution_fields` exactly match distribution names.

### "Wrong fields displaying"
Check that field names match those in `GoalPageClient.tsx` CATEGORY_CONFIG.

### Rate Limiting
Gemini free tier limits:
- **15 requests per minute** (handled automatically)
- **1000 requests per day** (tracked in `.gemini-usage.json`)

If you hit the daily limit:
1. The script will tell you where to resume
2. Run again tomorrow with `--start-from=<index>`
3. Or reset tracking with `--reset-usage` (for testing)

## Migration from Claude to Gemini

### Why We Migrated
- **Cost**: Claude cost $137 per full generation run
- **Accessibility**: Gemini free tier = $0 cost
- **Quality**: Gemini provides adequate quality for structured data generation
- **Trade-off**: Takes 2-3 days instead of 2-3 hours (worth saving $137)

### Key Changes
1. **API Client**: `@anthropic-ai/sdk` → `@google/generative-ai`
2. **Model**: Claude 3.5 Sonnet → Gemini 2.5 Flash-Lite
3. **Rate Limiting**: Added automatic tracking and resumption
4. **Response Format**: Gemini supports JSON mode natively

### Rollback Instructions
If you need to switch back to Claude:
1. Uncomment `ANTHROPIC_API_KEY` in `.env.local`
2. Comment out `GEMINI_API_KEY`
3. The code still has Claude integration commented out for reference

## Validation & Quality Assurance

### Specificity Validation (NEW)
**MUST RUN BEFORE GENERATION** to ensure solutions meet specificity requirements:

```bash
# Test the validation system
npx tsx scripts/ai-solution-generator/validate-specificity-standalone.ts

# Validate solutions during generation
npx tsx scripts/ai-solution-generator/generate-specific-solutions.ts
```

### Automated Validation Scripts
After generation, run these validation scripts to ensure data quality:

```bash
# Comprehensive validation and auto-fix
npx tsx scripts/ai-solution-generator/validate-and-fix.ts

# Fix specific issues
npx tsx scripts/ai-solution-generator/fix-exercise-frequency.ts
npx tsx scripts/ai-solution-generator/fix-dropdown-mappings.ts
npx tsx scripts/ai-solution-generator/fix-diet-cost-logic.ts
```

### Common Issues & Fixes

#### 1. Variant Naming ("nullnull" prefix)
- **Issue**: Variants for beauty/natural remedies had "nullnull" prefix
- **Fix**: `validate-and-fix.ts` automatically removes prefix
- **Prevention**: Fixed in `database/inserter.ts` to handle null amount/unit

#### 2. Frequency Mapping
- **Issue**: Exercise showing "three times daily" instead of weekly
- **Fix**: `fix-exercise-frequency.ts` corrects to "3-5 times per week"
- **Prevention**: Updated `utils/value-mapper.ts` with better weekly logic

#### 3. Time Commitment
- **Issue**: All showing "Under 5 minutes"
- **Fix**: `validate-and-fix.ts` maps to appropriate time ranges
- **Prevention**: Added `mapTimeCommitmentToDropdown()` function

#### 4. Diet Cost Logic
- **Issue**: All diet solutions marked "Significantly more expensive"
- **Fix**: `fix-diet-cost-logic.ts` applies logical cost impacts
- **Prevention**: Consider actual cost implications per solution type

### Testing Generated Solutions

```bash
# Test front-end display
npm run test:forms -- tests/e2e/ai-solutions-display.spec.ts

# Check specific goals
curl http://localhost:3000/goal/<goal-id> | grep -o "solution"
```

### Package.json Scripts
Add these validation scripts:
```json
"scripts": {
  "generate:validate": "tsx scripts/ai-solution-generator/validate-and-fix.ts",
  "generate:check": "tsx scripts/ai-solution-generator/check-progress.ts",
  "generate:fix-frequency": "tsx scripts/ai-solution-generator/fix-exercise-frequency.ts",
  "generate:fix-diet": "tsx scripts/ai-solution-generator/fix-diet-cost-logic.ts"
}
```

## 🎯 Claude × Gemini Quality System

### Overview
After Gemini generates solutions, Claude evaluates and fixes them across 5 quality dimensions:

1. **Conversational Completeness (30%)**: Can a friend act on this recommendation?
2. **Evidence Alignment (25%)**: Is the effectiveness rating justified?
3. **Accessibility Truth (20%)**: Are costs and barriers fully disclosed?
4. **Expectation Accuracy (15%)**: Are time/effort expectations realistic?
5. **Category Accuracy (10%)**: Is it in the right category?

**Pass Threshold**: All dimensions must score ≥85%

### Quality Commands

#### Test with 100 Solutions (Full Data Capture)
```bash
npx tsx scripts/ai-solution-generator/quality-test-100.ts
```
This creates 4 files in `quality-test-results/`:
- `BEFORE.md` - Complete data for all 100 solutions pre-review
- `AFTER.md` - Complete data after Claude's fixes
- `REPORT.json` - Detailed quality check results
- `SUMMARY.md` - Statistics and overview

#### Quick Test (10 solutions, no database changes)
```bash
npm run quality:test
```

#### Run Full Quality Pipeline
```bash
npm run quality:check                    # Process all pending solutions
npm run quality:orchestrate              # Start automated orchestrator
npm run quality:dashboard                # View real-time metrics
npm run quality:dashboard -- --watch     # Auto-refresh mode
```

### Quality Pipeline Options

```bash
# Check with custom parameters
npm run quality:check -- \
  --batch-size 50 \      # Solutions per Claude call
  --cost-limit 5.0       # Max spend in USD

# Orchestrator with triggers
npm run quality:orchestrate -- \
  --trigger 100 \        # Check after 100 pending
  --interval 6 \         # Check every 6 hours
  --quality 80 \         # Trigger if quality < 80%
  --cost-limit 10.0      # Daily limit $10
```

### Cost Analysis
- **Gemini Generation**: $0-30 (free tier available)
- **Claude Quality Checks**: ~$0.001 per solution
- **Total for 32,000 solutions**: ~$30-40
- **Savings vs Pure Claude**: 70-75%

### Database Schema for Quality Tracking
The system adds these fields to track quality:
- `quality_status`: pending|checking|passed|fixed|failed
- `conversation_completeness_score`: 0-100
- `evidence_alignment_score`: 0-100
- `accessibility_truth_score`: 0-100
- `expectation_accuracy_score`: 0-100
- `category_accuracy_score`: 0-100
- `quality_issues`: JSON of issues found
- `quality_fixes_applied`: JSON of fixes applied

## 📋 Complete Workflow

### Step 1: Generate Solutions with Attribution
```bash
# Standard generation
npm run generate:ai-solutions

# Smart selection for better coverage
npm run generate:smart

# Generate for specific goal
npm run generate:ai-solutions -- --goal-id=<uuid>
```

### Step 2: Test Quality System
```bash
# Test with 100 solutions (captures all data)
npx tsx scripts/ai-solution-generator/quality-test-100.ts

# Review the generated markdown files
open scripts/ai-solution-generator/quality-test-results/
```

### Step 3: Run Quality Pipeline
```bash
# Apply database migration first
npm run quality:migrate

# Run quality checks
npm run quality:check

# Or start automated orchestrator
npm run quality:orchestrate
```

### Step 4: Monitor Progress
```bash
# Real-time dashboard
npm run quality:dashboard -- --watch
```

## For Future Developers

This system is completely self-contained. To use it:

### Initial Setup
1. Add API keys to `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSyAeHrw-JAKpenIJO6Z7uIxza9WvjnSlYA0
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```
2. Apply database migration: `npm run quality:migrate`

### Generation Process
1. Run `npm run generate:ai-solutions` (uses Attribution Required strategy)
2. Monitor output for any errors
3. If daily limit hit, resume with `--start-from=<index>`

### Quality Process
1. Test with 100 solutions first: `npx tsx scripts/ai-solution-generator/quality-test-100.ts`
2. Review the markdown files to verify quality improvements
3. Run full pipeline: `npm run quality:check`
4. Monitor with dashboard: `npm run quality:dashboard`

### Data Quality Standards
- **Attribution Required**: Every solution must attribute its source
- **Field Completion**: 100% of required fields must be populated
- **Dropdown Values**: Must exactly match options in `config/dropdown-options.ts`
- **Effectiveness Range**: 3.0-5.0 stars based on evidence
- **Conversation Completeness**: ≥85% (friend can act on it)
- **No Inflated Ratings**: Must have evidence-based justification
