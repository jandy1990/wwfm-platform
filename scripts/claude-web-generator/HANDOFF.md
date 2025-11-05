# Claude Web Generator - Handoff Instructions

> **For Claude Code on the Web** - Complete setup and execution guide

## What You're Doing

You (Claude Web) will systematically generate high-quality solutions for 200+ WWFM goals using **rich prompts** and **real-time validation**. This system is optimized for your strengths: comprehensive analysis, parallel processing, and interactive validation.

## Why This Matters

- **Current state**: 228 goals, many with <5 solutions
- **Your mission**: Generate 15-20 solutions per goal with comprehensive validation
- **Key advantage**: Rich prompts + real-time validation vs Gemini's terse prompts
- **Budget**: $100-200 (Max 5x subscription) completes entire project

---

## Setup (Do This First)

### 1. Subscribe to Claude Max 5x
- **Cost**: $100/month
- **Capacity**: 140-280 Sonnet 4 hours/week
- **Sufficient for**: All 200+ goals in 1-2 sessions

### 2. Configure MCP Supabase Integration

Create `.claude/mcp/config.json`:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@anthropic/supabase-mcp"],
      "env": {
        "SUPABASE_URL": "https://wqxkhxdbxdtpuvuvgirx.supabase.co",
        "SUPABASE_KEY": "${SUPABASE_SERVICE_KEY}"
      }
    }
  }
}
```

**Note**: `SUPABASE_SERVICE_KEY` will be read from `.env.local`

### 3. Verify Database Access

Test MCP connection:
```typescript
// Query for goals needing generation
const goals = await mcp__supabase__execute_sql(`
  SELECT id, title, description
  FROM goals
  LIMIT 5
`)

console.log(goals) // Should return 5 goals
```

---

## Execution Workflow

### High-Level Process

For each batch of 10 goals (parallel):
1. **Generate solutions** using rich prompts (`prompts/rich-solution-prompt.ts`)
2. **Validate solutions** through 4-step pipeline:
   - Laugh test (title quality)
   - Evidence check (effectiveness justification)
   - Category check (correct categorization)
   - Duplicate check (similar solutions)
3. **Auto-fix** fixable issues (title cleanup, category correction)
4. **Insert** validated solutions to database
5. **Checkpoint** progress
6. **Report** results (success/failure counts, validation metrics)

### Detailed Steps

#### Step 1: Get Next Batch of Goals

```typescript
import { GET_GOALS_NEEDING_GENERATION } from './database/mcp-queries'

const goals = await mcp__supabase__execute_sql(GET_GOALS_NEEDING_GENERATION)

// Take first 10 for this batch
const batch = goals.slice(0, 10)
```

#### Step 2: Generate Solutions for Each Goal

For each goal in parallel (use Task tool for parallelization):

```typescript
import { getRichSolutionPrompt } from './prompts/rich-solution-prompt'

const prompt = getRichSolutionPrompt({
  goalTitle: goal.title,
  goalDescription: goal.description,
  arena: goal.arena_name,
  limit: 20, // Generate 20 solutions
  includeExamples: true // Use rich examples
})

// Generate solutions (YOU will generate this, not external API)
const solutionsJSON = await generateContent(prompt)
const solutions = JSON.parse(solutionsJSON)
```

#### Step 3: Validate Each Solution

```typescript
import { validateSolutionBatch } from './workflows/validation-pipeline'

const validationResults = await validateSolutionBatch(
  solutions,
  supabase,
  generateContent // Pass YOUR content generation function
)

// Results include:
// - laughTestFailures
// - evidenceCheckFailures
// - categoryCheckFailures
// - duplicatesFound
```

#### Step 4: Auto-Fix and Filter

```typescript
import { filterValidSolutions } from './workflows/validation-pipeline'

const validSolutions = filterValidSolutions(validationResults, true /* autoFix */)

// This will:
// - Fix titles that fail laugh test
// - Fix categories with high-confidence suggestions
// - Skip unfixable duplicates
```

#### Step 5: Generate Field Distributions

For each valid solution:

```typescript
import { getRichFieldDistributionPrompt } from './prompts/field-generation'
import { getRequiredFields } from '../../../lib/config/solution-fields'

const requiredFields = getRequiredFields(solution.category)

for (const fieldName of requiredFields) {
  const fieldPrompt = getRichFieldDistributionPrompt({
    fieldName,
    category: solution.category,
    solutionTitle: solution.title,
    goalTitle: goal.title,
    includeExamples: true
  })

  const distributionJSON = await generateContent(fieldPrompt)
  const distribution = JSON.parse(distributionJSON)

  // Store distribution for this field
  solution.fields[fieldName] = formatAsDistributionData(distribution)
}
```

#### Step 6: Insert to Database

```typescript
import { insertSolutionToDatabase } from '../../solution-generator/database/inserter'

for (const solution of validSolutions) {
  await insertSolutionToDatabase(
    goal,
    solution,
    supabase,
    CATEGORY_FIELDS[solution.category],
    { forceWrite: false, dirtyOnly: false }
  )
}
```

#### Step 7: Update Checkpoint

```typescript
import { updateCheckpoint } from './workflows/checkpoint-manager'

checkpoint = updateCheckpoint(checkpoint, {
  goalId: goal.id,
  successfulSolutions: validSolutions.length,
  failedSolutions: solutions.length - validSolutions.length,
  validationResults: {
    laughTestFailures: validationResults.laughTestFailures,
    duplicatesFound: validationResults.duplicatesFound,
    ssotViolations: 0, // Track these separately
    dropdownViolations: 0
  }
})
```

---

## Parallel Processing (Critical)

Use **Task tool** to process 10 goals simultaneously:

```typescript
// Launch 10 parallel tasks
const tasks = batch.map(goal =>
  Task({
    subagent_type: 'general-purpose',
    description: `Generate solutions for: ${goal.title}`,
    prompt: `
      Generate 20 solutions for this goal using the Claude Web generation system:

      Goal: ${goal.title}
      Description: ${goal.description}

      Follow the workflow in HANDOFF.md:
      1. Generate solutions (rich prompt)
      2. Validate (4-step pipeline)
      3. Auto-fix issues
      4. Generate field distributions
      5. Insert to database
      6. Report results

      Return: {successCount, failureCount, validationIssues}
    `
  })
)

// Wait for all to complete
const results = await Promise.all(tasks)
```

---

## Validation Rules (Zero Tolerance)

### 1. Laugh Test (Title Quality)

**Automatic failures**:
- ❌ Contains "like", "such as", "e.g.", "for example", "including"
- ❌ Contains "I tried", "I used", "I started"
- ❌ Has generic prefix: "Prescription X", "Therapy Y"
- ❌ Parentheses pattern: "Generic (Specific)"

**Examples**:
- ❌ "Nicotine replacement therapy like Nicoderm CQ"
- ✅ "Nicoderm CQ patches"

### 2. Evidence Check

**Requirements**:
- Effectiveness rating 3.0-5.0 (no lower)
- Rationale cites specific evidence (studies, trials, data)
- Rationale quality matches rating level:
  - 4.5-5.0: RCTs, meta-analyses required
  - 4.0-4.4: Multiple studies required
  - 3.5-3.9: Some studies or mixed results
  - 3.0-3.4: Anecdotal or emerging research

### 3. Category Check

**Watch for common miscategorizations**:
- Medications in habits_routines (e.g., "NRT" should be medications)
- Beauty products in habits_routines (e.g., "Acne.org Regimen" should be beauty_skincare)
- Books in habits_routines (e.g., "Daily Stoic Journal" should be books_courses)

### 4. Duplicate Check

**How it works**:
- Tokenizes title into keywords
- Searches same category for similar titles
- Flags if significant overlap (60%+ tokens match)

**Action**: Skip duplicates, don't insert

---

## Checkpoint System

Progress saved after every batch to `.checkpoint.json`:

```json
{
  "mode": "full",
  "totalGoals": 200,
  "processedGoals": 50,
  "currentBatch": 5,
  "lastProcessedGoalId": "uuid-123",
  "timestamp": "2025-11-06T10:00:00Z",
  "estimatedCostSoFar": 125.50,
  "validationResults": {
    "laughTestFailures": 8,
    "duplicatesFound": 2,
    "ssotViolations": 0,
    "dropdownViolations": 1
  }
}
```

**Resume after interruption**:
```typescript
import { loadCheckpoint } from './workflows/checkpoint-manager'

const checkpoint = loadCheckpoint()
if (checkpoint) {
  // Continue from checkpoint.currentBatch
}
```

---

## Cost Tracking

**Estimated costs**:
- **Per goal**: $2.50 (20 solutions × $0.125/solution)
- **Per batch (10 goals)**: $25
- **All 200 goals**: $500

**Budget alerts**:
- System warns at $800 spent (approaching $1000 limit)
- Can pause/resume anytime
- Checkpoint preserves progress

---

## Quality Targets

After generation, aim for:
- ✅ **Zero** "like/such as/e.g." patterns in titles
- ✅ **<5%** miscategorization rate
- ✅ **100%** SSOT field compliance
- ✅ **Zero** duplicate solutions per batch
- ✅ **5-8** distribution options per field

---

## Reporting

After each batch, display:

```
📊 Batch 5 Results:
✅ Generated: 10/10 goals
✅ Solutions: 187 total (169 valid, 18 rejected)
⚠️  Laugh test failures: 8 (auto-fixed)
⚠️  Duplicates found: 2 (skipped)
✅ SSOT violations: 0
⚠️  Dropdown violations: 1 (regenerated)
💰 Cost so far: $125.50 / $1000 budget
⏱️  Time elapsed: 25 minutes
📈 Progress: 50/200 goals (25%)
```

---

## Error Handling

### Rate Limit Hit
**Symptom**: 429 error or rate limit warning
**Action**: Pause for 5 hours, resume from checkpoint

### Validation Failures
**Symptom**: >20% solutions rejected
**Action**:
1. Review validation report in `.generation-log.json`
2. Identify common failure patterns
3. Adjust prompts if systematic issue
4. Continue generation

### Database Errors
**Symptom**: Insert failures
**Action**:
1. Check database connection
2. Verify MCP configuration
3. Check `.env.local` credentials
4. Retry failed goal

---

## Success Criteria

Generation is successful when:
- ✅ All 200 goals have 15+ solutions
- ✅ <5% overall validation failure rate
- ✅ Zero duplicates in final dataset
- ✅ All field distributions have 5+ options
- ✅ Total cost <$200

---

## Final Steps

After completing all batches:

1. **Verify generation stats**:
```typescript
const stats = await mcp__supabase__execute_sql(GET_GENERATION_STATS)
console.log(stats)
// Expected: ~3,000-4,000 new solutions
```

2. **Clear checkpoint**:
```typescript
import { clearCheckpoint } from './workflows/checkpoint-manager'
clearCheckpoint()
```

3. **Export summary**:
```typescript
import { exportCheckpointSummary } from './workflows/checkpoint-manager'
exportCheckpointSummary(finalCheckpoint)
```

4. **Report to user**:
```
🎉 Generation Complete!

Results:
- Goals processed: 200/200
- Solutions generated: 3,847
- Validation pass rate: 96.2%
- Total cost: $187.50
- Time: 3.5 hours

Quality metrics:
- Laugh test failures: 0
- Duplicates found: 0
- SSOT violations: 0
- Avg distribution options: 6.2
```

---

## You're Ready!

This system gives you:
- 📝 Rich, comprehensive prompts (not terse)
- ✅ Real-time validation (catch issues immediately)
- 🔄 Parallel processing (10 goals at once)
- 💾 Checkpoint system (resume anytime)
- 📊 Progress tracking (know exactly where you are)

**Start generation**:
1. Subscribe to Max 5x ($100/mo)
2. Configure MCP Supabase
3. Load first batch of 10 goals
4. Follow the workflow above
5. Repeat until all 200 goals processed

**Estimated timeline**: 3-4 hours active work
**Estimated cost**: $150-200

Let's generate some high-quality solutions! 🚀
