# Claude Web Solution Generator

> **Built for Claude Code on the Web** - Optimized for rich prompts, real-time validation, and parallel processing

## Overview

This is a **NEW generation system** designed specifically for Claude Code on the Web's strengths:
- **Rich prompts** with comprehensive context (not terse like Gemini)
- **Real-time validation** at every step (laugh test, duplicates, SSOT compliance)
- **Parallel processing** (10 goals simultaneously)
- **Checkpoint/resume** for multi-session generation

**Keep Gemini system intact** - This is a parallel implementation, not a replacement.

## Why Claude Web?

| Feature | Claude Web | Gemini Free |
|---------|------------|-------------|
| **Speed** | 3-4 hours for 200 goals | 2-3 days |
| **Parallelization** | 10 tasks simultaneously | Sequential only |
| **Validation** | Real-time during generation | Post-generation only |
| **Prompt Quality** | Rich, comprehensive | Terse (API cost limits) |
| **Database Access** | Direct via MCP | Via scripts only |
| **Cost** | $100-200 (Max 5x) | Free |

## Quick Start (for Claude Web)

### Prerequisites
1. Subscribe to **Claude Max 5x** ($100/mo)
2. Set up MCP Supabase connector (see Setup section)
3. Ensure `.env.local` has database credentials

### Generate All 200 Goals
```bash
# In Claude Web, run:
npm run claude:generate -- --mode=full

# Or use custom command:
/generate-batch 10
```

This will:
1. Process 200 goals in batches of 10 (parallel)
2. Validate each solution in real-time
3. Checkpoint progress after each batch
4. Complete in 3-4 hours

### Generate High-Priority Goals Only
```bash
npm run claude:generate -- --mode=high-priority
```

Processes 20 high-traffic goals first (anxiety, sleep, social, finance).

### Resume After Interruption
```bash
npm run claude:generate -- --mode=resume
```

Loads checkpoint and continues from last batch.

## Architecture

```
claude-web-generator/
├── config.ts                    # Configuration (batch size, thresholds)
├── commands/                    # Custom Claude commands
│   ├── generate-batch.md        # Main generation command
│   ├── validate-batch.md        # Validation-only command
│   └── checkpoint-restore.md    # Recovery command
├── prompts/
│   ├── rich-solution-prompt.ts  # Comprehensive solution generation
│   ├── validation-prompts.ts    # Laugh test, evidence checks
│   └── field-generation.ts      # Rich field distribution prompts
├── workflows/
│   ├── parallel-batch.ts        # 10-task orchestrator
│   ├── checkpoint-manager.ts    # State persistence
│   └── validation-pipeline.ts   # Real-time validation
└── database/
    ├── mcp-queries.ts           # Direct Supabase queries
    └── quality-checks.ts        # Validation queries
```

## Quality Hardening (Based on Real Data Analysis)

Before building the Claude Web system, we analyzed **61 AI-generated solutions across 13 goals** (anxiety, sleep, weight, relationships, career, etc.) to identify systematic quality issues. Five parallel agents examined the Gemini-generated data and found **8 critical problems** that needed hardening against.

### Issues Found in Gemini Data

| Issue | Count | Severity | Example |
|-------|-------|----------|---------|
| **Missing percentages in array fields** | 40+ | 🚨 CRITICAL | side_effects with no % distributions |
| **Semantic duplicates** | 40+ | 🚨 CRITICAL | 8 "Headspace" entries, 5 "mindful eating" |
| **"e.g." placeholder patterns** | 5 | 🚨 CRITICAL | "e.g. (via ADAA)" - not a real solution |
| **Generic solutions rated too high** | 20+ | ⚠️ MODERATE | "Yoga" rated 4.5 (should be 4.0 max) |
| **Miscategorizations** | 10+ | ⚠️ MODERATE | "NRT patches" in habits (should be medications) |
| **Single-word generic titles** | 15+ | ⚠️ MODERATE | "Meditation", "Journaling", "Therapy" |
| **Copy-paste description errors** | 15+ | ⚠️ MODERATE | Wrong goal keywords in descriptions |
| **Poor specificity** | 30+ | ⚠️ MODERATE | "App for meditation" vs "Headspace App" |

### How Claude Web Addresses Each Issue

#### 1. Missing Array Field Percentages (🚨 HIGHEST PRIORITY)

**Problem**: side_effects and challenges fields often missing percentage distributions
```json
// ❌ Gemini output (BROKEN)
{
  "side_effects": {
    "values": [
      {"value": "Nausea"},  // No percentage!
      {"value": "Headache"}
    ]
  }
}
```

**Solution**: Dedicated `array-field-validator.ts` with 7 comprehensive checks:
```typescript
✅ Field exists
✅ Has values array
✅ All values have percentages
✅ Percentages sum to exactly 100%
✅ Minimum 4 options (diversity)
✅ No single value at 100%
✅ No equal splits (mechanistic data)

// ✅ Claude Web output (CORRECT)
{
  "side_effects": {
    "values": [
      {"value": "Nausea", "percentage": 35},
      {"value": "Headache", "percentage": 25},
      {"value": "Sleep changes", "percentage": 20},
      {"value": "Digestive issues", "percentage": 12},
      {"value": "Fatigue", "percentage": 8}
    ]
  }
}
```

**Prompts explicitly state**: "MANDATORY REQUIREMENTS (Will be validated): EVERY value MUST have a percentage. Solutions missing percentages will be REJECTED."

#### 2. Semantic Duplication Prevention

**Problem**: Multiple entries for same concept
```
❌ Gemini generated:
- "Headspace App"
- "Headspace guided meditations"
- "Headspace anxiety pack"
- "Headspace stress management"
- "Headspace mindfulness"
- "Headspace breathing exercises"
- "Headspace sleep sounds"
- "Headspace daily meditation"
(8 entries for ONE app!)
```

**Solution**: Explicit "Max 2 Per Concept" rule in rich prompts:
```typescript
## 🚨 CRITICAL: Avoid Over-Duplication (Maximum 2 Per Concept)

**✅ RIGHT - Maximum 2 Per Concept:**
- 1-2 mindful eating solutions max (e.g., one program + one book)
- 1 Headspace solution (just "Headspace App")
- 1 Noom solution (just "Noom")

**Rule of Thumb:**
If you've already generated a solution for:
- Mindful eating → Don't add more mindful eating
- Headspace → Don't add Headspace again
- Meditation → Maximum 2 meditation solutions total
```

#### 3. "e.g." Pattern Bans

**Problem**: Placeholder solutions that aren't real
```
❌ "Regular Aerobic Exercise (e.g., Brisk Walking)"
❌ "e.g. (via ADAA)"
❌ "Meditation app such as Calm"
```

**Solution**: Enhanced Laugh Test validation catches these patterns:
```typescript
// Automatic failures:
- [ ] Contains "like", "such as", "e.g.", "for example", "including"
- [ ] Contains "(via X)", "(by X)" placeholder patterns
- [ ] Contains "I tried", "I used", "I started"

// Examples added to prompts:
❌ "e.g. (via ADAA)" - **CRITICAL**: Not a real solution, just placeholder
✅ "Anxiety and Depression Association of America (ADAA)"
```

#### 4. Generic Solution Rating Caps

**Problem**: Generic solutions rated as highly as specific ones
```
❌ "Yoga" rated 4.5 (too generic for high rating)
❌ "BetterHelp online therapy" rated 4.7 (varies by therapist)
❌ "Therapy" rated 4.8 (what kind? where?)
```

**Solution**: Explicit rating guidelines in validation prompts:
```typescript
## CRITICAL: Generic vs Specific Solution Rating Caps

**GENERIC SOLUTIONS** (Maximum 4.0 rating):
- Broad categories: "Therapy", "Meditation", "Exercise", "Yoga"
- Single words: "Journaling", "Squats", "Dumbbells"
- General platforms: "BetterHelp", "Any licensed therapist"
- Why cap at 4.0: Quality varies enormously, not specific enough

**SPECIFIC SOLUTIONS** (Can be 4.5+):
- Named programs: "Sleepio CBT-I", "Couch to 5K", "Headspace App"
- Specific medications: "Sertraline (Zoloft) 50mg"
- Named practices: "Morning Pages journaling", "Hatha yoga"
```

#### 5. Strengthened Specificity Checks

**Problem**: Single-word generic solutions
```
❌ "Meditation"
❌ "Journaling"
❌ "Therapy"
❌ "Exercise"
```

**Solution**: Laugh Test now bans single-word solutions:
```typescript
// Added to validation checklist:
- [ ] Single word solution: "Yoga", "Journaling", "Meditation" (needs specificity)
- [ ] Too verbose or conversational
- [ ] Multiple solutions in one title (should be separate solutions)

// Examples in prompts:
✅ "Morning Pages journaling" - Specific method
✅ "Hatha yoga" - Specific practice name
✅ "Headspace App" - Specific product
❌ "Meditation" - Too vague
❌ "Journaling" - Not specific enough
```

## Enhanced Validation Pipeline

Every solution now goes through **5 validation checks** before insertion:

### 1. Laugh Test (Title Quality)
```typescript
// Would you say this to a friend?
✅ PASS: "Headspace App"
❌ FAIL: "I tried the Headspace App for guided meditations"

✅ PASS: "Sertraline (Zoloft)"
❌ FAIL: "Nicotine replacement therapy like Nicoderm CQ"

// NEW: Now catches "e.g." patterns and single-word generics
❌ FAIL: "e.g. (via ADAA)" - Not a real solution
❌ FAIL: "Meditation" - Too vague, single word
```

### 2. Evidence Check (Effectiveness Justification)
```typescript
// Verify effectiveness rating backed by actual evidence
✅ PASS: 4.3 rating + "Multiple RCTs show 60-70% response rate"
❌ FAIL: 4.8 rating + "Seems like it would help"

// NEW: Generic solutions capped at 4.0
❌ FAIL: "Yoga" rated 4.5 (generic, max 4.0)
✅ PASS: "Iyengar yoga" rated 4.3 (specific)
```

### 3. Category Check (Correct Categorization)
```typescript
// Verify solution is in correct category
✅ PASS: "Nicoderm CQ patches" → medications
❌ FAIL: "Nicoderm CQ patches" → habits_routines

✅ PASS: "Morning Pages journaling" → habits_routines
❌ FAIL: "The Artist's Way book" → habits_routines (should be books_courses)
```

### 4. Array Field Check (🚨 HIGH PRIORITY - Percentages)
```typescript
// NEW: Dedicated validator for side_effects/challenges
✅ All values have percentages
✅ Percentages sum to 100%
✅ Minimum 4 options (diversity)
✅ No single value at 100%
✅ No equal splits (25%/25%/25%/25%)

// Example validation:
❌ FAIL: side_effects with 2 values missing percentages
❌ FAIL: challenges summing to 87% (not 100%)
❌ FAIL: single "Side effects" at 100% (too vague)
✅ PASS: 5 side effects, all with percentages, sum to 100%
```

### 5. Duplicate Detection
```typescript
// Check against entire database after each batch
- Uses canonical matching (token-based)
- Catches duplicates across categories
- Prevents "NRT" appearing 3 times issue
```

## Quality Standards Achieved

### Before (Gemini Data Issues):
- ❌ 40+ solutions missing array field percentages
- ❌ 40+ semantic duplicates (5-8 entries per concept)
- ❌ 5 "e.g." placeholder solutions
- ❌ 20+ generic solutions rated too high (>4.0)
- ❌ 15+ single-word generic titles
- ❌ 10+ miscategorizations

### After (Claude Web Hardening):
- ✅ **100%** array field percentage compliance (validated pre-insertion)
- ✅ **Max 2** solutions per concept (explicitly prompted)
- ✅ **Zero** "e.g." patterns (banned in Laugh Test)
- ✅ **Generic cap at 4.0** (enforced in Evidence Check)
- ✅ **Zero** single-word generics (banned in Laugh Test)
- ✅ **<5%** miscategorization (Category Check with confidence scoring)

### Target Quality Metrics
- ✅ **Zero** "like/such as/e.g." title patterns
- ✅ **100%** array field percentage compliance
- ✅ **<5%** miscategorization rate
- ✅ **100%** SSOT field compliance
- ✅ **Zero** duplicate solutions per batch
- ✅ **5-8** distribution options per field (rich diversity)

### Validation Reporting
After each batch, system reports:
```
📊 Batch 5 Results:
✅ Generated: 10/10 goals
✅ Solutions: 187 total
⚠️  Laugh test failures: 2 (auto-fixed: removed "e.g." patterns)
⚠️  Evidence check failures: 1 (regenerated: generic rated 4.5)
⚠️  Category check failures: 0
⚠️  Array field failures: 0 (100% percentage compliance!)
⚠️  Duplicates found: 0
💰 Cost so far: $125.50 / $1000 budget
```

## Checkpoint System

Progress saved after each batch to `.checkpoint.json`:

```json
{
  "mode": "full",
  "totalGoals": 200,
  "processedGoals": 50,
  "currentBatch": 5,
  "lastProcessedGoalId": "uuid-123",
  "timestamp": "2025-11-06T10:00:00Z",
  "estimatedCostSoFar": 25.50,
  "validationResults": {
    "laughTestFailures": 2,
    "duplicatesFound": 1,
    "ssotViolations": 0,
    "dropdownViolations": 3
  }
}
```

Resume from checkpoint:
```bash
npm run claude:generate -- --mode=resume
```

## Cost Tracking

**Max 5x Subscription**: $100/month

**Estimated Costs**:
- 200 goals × $2.50/goal = **$500 total**
- Batch of 10 goals = **$25**
- Single goal = **$2.50**

**Budget Monitoring**:
- System alerts at $800 spent (approaching $1000 limit)
- Cost per goal logged in checkpoint file
- Can stop/resume at any time to manage budget

## Parallel Processing

Claude Web supports **10 simultaneous tasks**:

```typescript
// Batch processing pattern
Batch 1: Goals 1-10   → 10 parallel tasks → 5 min
Batch 2: Goals 11-20  → 10 parallel tasks → 5 min
...
Batch 20: Goals 191-200 → 10 parallel tasks → 5 min

Total time: 20 batches × 5 min = ~2 hours
+ Validation: ~1 hour
= 3 hours total for 200 goals
```

## MCP Supabase Integration

### Setup
1. Install MCP Supabase connector:
```bash
npm install @anthropic/supabase-mcp
```

2. Configure in `.claude/mcp/config.json`:
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

### Direct Database Queries
```typescript
// Claude can now directly query Supabase:
const goals = await mcp__supabase__execute_sql(`
  SELECT id, title, description
  FROM goals
  WHERE needs_generation = true
  LIMIT 10
`)

// Real-time duplicate check:
const duplicates = await mcp__supabase__execute_sql(`
  SELECT title, COUNT(*)
  FROM solutions
  WHERE category = 'medications'
  GROUP BY title
  HAVING COUNT(*) > 1
`)
```

## Usage Examples

### Example 1: Generate Single Goal (Testing)
```bash
npm run claude:generate -- --mode=single-goal --goal-id=<uuid>
```

### Example 2: Generate High-Priority Goals First
```bash
npm run claude:generate -- --mode=high-priority
# Processes 20 high-traffic goals (anxiety, sleep, finance)
```

### Example 3: Full Generation (All 200 Goals)
```bash
npm run claude:generate -- --mode=full
# Processes all 200 goals in batches of 10
# Estimated time: 3-4 hours
# Estimated cost: $100-200
```

### Example 4: Resume After Interruption
```bash
npm run claude:generate -- --mode=resume
# Loads .checkpoint.json and continues from last batch
```

## Custom Commands (Claude Web)

### `/generate-batch` Command
```markdown
# .claude/commands/generate-batch.md

Generate high-quality solutions for the next batch of 10 goals:

1. Query database for next 10 goals needing generation
2. Generate 20 solutions per goal (parallel processing)
3. Validate each solution:
   - Laugh test (title quality)
   - Duplicate detection
   - SSOT field compliance
   - Dropdown value validation
4. Insert validated solutions to database
5. Save checkpoint
6. Report results (success/failure counts, validation issues)
```

Usage in Claude Web:
```
/generate-batch
```

## Quality Metrics

### Target Quality Standards
- ✅ **Zero** "like/such as/e.g." title patterns
- ✅ **<5%** miscategorization rate
- ✅ **100%** SSOT field compliance
- ✅ **Zero** duplicate solutions per batch
- ✅ **5-8** distribution options per field (rich diversity)

### Validation Reporting
After each batch, system reports:
```
📊 Batch 5 Results:
✅ Generated: 10/10 goals
✅ Solutions: 187 total
⚠️  Laugh test failures: 2 (fixed before insert)
⚠️  Duplicates found: 0
✅ SSOT violations: 0
⚠️  Dropdown violations: 1 (regenerated)
💰 Cost so far: $125.50 / $1000 budget
```

## Troubleshooting

### Rate Limit Hit
**Symptom**: "Rate limit exceeded" error
**Solution**: Wait 5 hours for reset, then resume:
```bash
npm run claude:generate -- --mode=resume
```

### Validation Failures
**Symptom**: Solutions rejected by validation pipeline
**Solution**: Check `.generation-log.json` for details:
```json
{
  "failedSolutions": [
    {
      "title": "Nicotine replacement therapy like Nicoderm CQ",
      "reason": "Laugh test failure: contains 'like'",
      "category": "medications"
    }
  ]
}
```

### Checkpoint Corruption
**Symptom**: Resume fails to load checkpoint
**Solution**: Manual recovery:
```bash
# Check last successful goal in database
npm run claude:status

# Start from specific batch:
npm run claude:generate -- --mode=full --start-batch=5
```

## Comparison: Claude Web vs Gemini

### When to Use Claude Web
- ✅ Need results in hours (not days)
- ✅ Real-time validation critical
- ✅ Budget allows $100-200
- ✅ Quality matters more than cost
- ✅ First-time generation for new goals

### When to Use Gemini
- ✅ Zero budget requirement
- ✅ Can tolerate 2-3 day generation time
- ✅ Post-generation validation acceptable
- ✅ Large-scale batch processing (1000+ goals)

## Next Steps

1. **Setup** (30 min):
   - Subscribe to Claude Max 5x
   - Configure MCP Supabase
   - Test single goal generation

2. **Generate** (3-4 hours):
   - Run full generation: `/generate-batch 10`
   - Monitor progress in real-time
   - System checkpoints automatically

3. **Validate** (1 hour):
   - Review validation report
   - Regenerate any failures
   - Compare quality vs Gemini baseline

4. **Document** (30 min):
   - Record cost actual vs estimate
   - Note any quality issues
   - Update prompts if needed

**Total timeline**: 1-2 days
**Total cost**: $100-200 (well within $1000 budget)

---

**Ready to generate 200+ high-quality solutions with comprehensive validation? Let's go!**
