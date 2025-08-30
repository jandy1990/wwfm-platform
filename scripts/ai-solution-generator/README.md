# AI-Powered Solution Generator for WWFM

## 📖 IMPORTANT: Read Context First
**Before using this system, read [CONTEXT.md](./CONTEXT.md) to understand the principles, reasoning, and rules behind this generator.**

## Overview
This system automatically generates evidence-based solutions for all WWFM goals by consulting Gemini AI (free tier) for recommendations based on training data from medical literature, clinical studies, and research.

**🎉 Migration Complete: Now using Google Gemini instead of Claude, reducing cost from $137 to $0!**

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

## For Future Developers

This system is completely self-contained. To use it:
1. Ensure environment variables are set (GEMINI_API_KEY)
2. Run `npm run generate:ai-solutions`
3. Monitor the output for any errors
4. Run validation after generation: `npm run generate:validate`
5. Check the database for generated content
6. Test front-end display with Playwright tests
7. If daily limit is hit, resume tomorrow with the provided command

The AI consults its training data for real effectiveness ratings, not random values. All solutions are marked with `source_type: 'ai_foundation'` and `rating_count: 1` to indicate they're AI-generated.

### Data Quality Standards
- **Field Completion**: 100% of required fields must be populated
- **Dropdown Values**: Must exactly match options in `config/dropdown-options.ts`
- **Effectiveness Range**: 3.0-5.0 stars based on evidence
- **Logical Accuracy**: Values should make sense (e.g., mindful eating ≠ expensive)
