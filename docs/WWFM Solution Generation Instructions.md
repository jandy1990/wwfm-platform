# WWFM Solution Generation - Complete Implementation Instructions

> **Purpose**: Step-by-step guide for implementing automated solution generation with SmartMatcher  
> **Time Estimate**: 16-20 hours total  
> **Dependencies**: Node.js, TypeScript, Supabase access  
> **Last Updated**: January 2025

## 📚 Required Documentation

Before starting, ensure you have access to these files:

### Core Project Files
Located in `/Users/jackandrews/Desktop/wwfm-platform/`:
- `CLAUDE.md` - AI assistant guide
- `README.md` - Project overview
- `ARCHITECTURE.md` - Technical architecture

### Reference Documents
- `/docs/WWFM Solution Fields Matrix - Code-Aligned.md` - **CRITICAL: Exact field requirements**
- `/docs/archive/WWFM Forms Field Matrix - ACTUAL Implementation - ARCHIVED 2025-01.md` - Dropdown options
- Project uploads:
  - `WWFM Solution Generation Guide v5` - SQL patterns and generation strategy
  - `WWFM Missing Goals Analysis` - Priority goals needing solutions

### Code Files to Reference
- `/components/goal/GoalPageClient.tsx` - CATEGORY_CONFIG (lines 84-348)
- `/lib/supabase/client.ts` - Database connection
- `/types/solutions.ts` - TypeScript interfaces

## 🏗️ Phase 1: Build Core Infrastructure (4-5 hours)

### Step 1.1: Create Solution Generator Service
**Location**: `/lib/services/solution-generator.ts`

```typescript
// Create this file with:
import { createClient } from '@/lib/database/client'

interface SolutionProfile {
  mechanisms: string[]        // How it works
  timeframe: string           // immediate/days/weeks/months
  evidence_for: string[]      // Conditions with evidence
  contraindications: string[] // When NOT to use
  effort_level: string        // low/medium/high
  cost_level: string          // free/low/medium/high
}

interface GeneratedSolution {
  title: string
  description: string
  solution_category: string
  solution_fields: Record<string, string | string[]>
  matching_profile: SolutionProfile
}

class SolutionGenerator {
  async generateSolution(input: {
    name: string
    category: string
    description?: string
  }): Promise<GeneratedSolution> {
    // Implementation here
  }
  
  async generateVariants(category: string, profile: SolutionProfile) {
    // Only for medications, supplements, natural_remedies, beauty_skincare
  }
  
  async generateFieldData(category: string, profile: SolutionProfile) {
    // Use exact field names from matrix!
  }
  
  async generatePrevalenceData(fieldData: Record<string, any>) {
    // Ensure array values match exactly
  }
}
```

**Reference**:
- Field names from: `/docs/WWFM Solution Fields Matrix - Code-Aligned.md`
- Dropdown values from: Archived matrix Section "Dropdown Options Reference"
- Database structure from: `/docs/database/schema.md`

### Step 1.2: Create SmartMatcher Service
**Location**: `/lib/services/smart-matcher.ts`

```typescript
interface GoalProfile {
  goal: string
  mechanism_needs: string[]
  timeframe_tolerance: string
  typical_solutions: string[]
  incompatible_approaches: string[]
}

class SmartMatcher {
  calculateRelevance(solution: SolutionProfile, goal: GoalProfile): number {
    let score = 0
    
    // 40% - Mechanism match
    if (solution.mechanisms.some(m => goal.mechanism_needs.includes(m))) {
      score += 0.4
    }
    
    // 30% - Timeframe compatibility  
    if (solution.timeframe === goal.timeframe_tolerance) {
      score += 0.3
    }
    
    // 20% - Evidence base
    if (solution.evidence_for.some(e => goal.typical_solutions.includes(e))) {
      score += 0.2
    }
    
    // 10% - User patterns (from existing data)
    score += 0.1 * this.getUserPatternScore(solution, goal)
    
    return score // 0-1
  }
  
  shouldLink(solution: SolutionProfile, goal: GoalProfile): boolean {
    return this.calculateRelevance(solution, goal) > 0.6
  }
}
```

### Step 1.3: Create SQL Generator
**Location**: `/lib/services/sql-generator.ts`

```typescript
class SQLGenerator {
  generateSolutionSQL(solution: GeneratedSolution): string {
    return `
      INSERT INTO solutions (id, title, description, solution_category, source_type, is_approved)
      VALUES (
        gen_random_uuid(),
        '${this.escapeString(solution.title)}',
        '${this.escapeString(solution.description)}',
        '${solution.solution_category}',
        'ai_foundation',
        true
      );
    `
  }
  
  generateVariantSQL(solutionId: string, variants: any[]): string {
    // Implementation
  }
  
  generateLinkSQL(matches: Match[]): string {
    // Implementation with solution_fields
  }
  
  validateSQL(sql: string): ValidationResult {
    // Check for common errors
    // Verify array field matching
    // Ensure percentages sum to 100
  }
}
```

**SQL Patterns**: Copy from Solution Generation Guide v5 Section 8

### Step 1.4: Create Validation Service
**Location**: `/lib/services/solution-validator.ts`

```typescript
class SolutionValidator {
  validateSolution(solution: GeneratedSolution, category: string): ValidationResult {
    const errors: string[] = []
    
    // Get required fields from matrix
    const requiredFields = this.getRequiredFields(category)
    
    // Check all 4 fields present
    for (const field of requiredFields) {
      if (!solution.solution_fields[field]) {
        errors.push(`Missing required field: ${field}`)
      }
    }
    
    // Validate array field matching
    const arrayField = this.getArrayField(category)
    if (arrayField && arrayField !== 'null') {
      // Check values match distributions
    }
    
    return { valid: errors.length === 0, errors }
  }
  
  private getRequiredFields(category: string): string[] {
    // Based on matrix, return exact 4 fields
    const fieldMap = {
      'medications': ['time_to_results', 'frequency', 'length_of_use', 'cost'],
      'beauty_skincare': ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'],
      // ... etc from matrix
    }
    return fieldMap[category] || []
  }
}
```

## 🎯 Phase 2: Implement Generation Pipeline (3-4 hours)

### Step 2.1: Create CLI Tool
**Location**: `/scripts/generate-solutions.ts`

```bash
# Usage:
npm run generate:solutions -- \
  --category="medications" \
  --count=50 \
  --goals="anxiety,depression" \
  --dry-run
```

**Implementation**:
```typescript
import { program } from 'commander'
import { SolutionGenerator } from '@/lib/services/solution-generator'
import { SmartMatcher } from '@/lib/services/smart-matcher'
import { SQLGenerator } from '@/lib/services/sql-generator'
import { SolutionValidator } from '@/lib/services/solution-validator'

program
  .option('-c, --category <type>', 'solution category')
  .option('-n, --count <number>', 'number to generate')
  .option('-g, --goals <items>', 'comma-separated goal keywords')
  .option('-d, --dry-run', 'preview without executing')
  .parse()

async function main() {
  const options = program.opts()
  
  // 1. Load goal profiles
  // 2. Generate solutions
  // 3. Match to goals
  // 4. Validate
  // 5. Generate SQL
  // 6. Execute or preview
}

main().catch(console.error)
```

### Step 2.2: Create Solution Templates
**Location**: `/data/solution-templates/`

Create JSON templates for common solutions:
```
/data/solution-templates/
  medications/
    ssris.json
    benzos.json
    adhd-meds.json
  apps/
    meditation-apps.json
    productivity-apps.json
  therapy/
    therapy-types.json
```

**Template Structure**:
```json
{
  "title": "Sertraline",
  "category": "medications",
  "description": "SSRI antidepressant commonly prescribed for depression and anxiety",
  "profile": {
    "mechanisms": ["serotonin_regulation", "mood_stabilization"],
    "timeframe": "weeks",
    "evidence_for": ["depression", "anxiety", "ptsd", "ocd"],
    "contraindications": ["bipolar_unmedicated", "pregnancy_first_trimester"],
    "effort_level": "low",
    "cost_level": "low"
  },
  "common_variants": [
    {"amount": 25, "unit": "mg", "form": "tablet"},
    {"amount": 50, "unit": "mg", "form": "tablet"},
    {"amount": 100, "unit": "mg", "form": "tablet"}
  ],
  "typical_fields": {
    "time_to_results": "3-4 weeks",
    "frequency": "Once daily",
    "length_of_use": "6-12 months",
    "cost": "$10-25/month",
    "side_effects": ["Nausea", "Headache", "Insomnia", "Sexual side effects"]
  }
}
```

### Step 2.3: Create Prevalence Data Generator
**Location**: `/lib/services/prevalence-generator.ts`

```typescript
class PrevalenceGenerator {
  generateDistributions(
    solutionFields: Record<string, any>,
    category: string
  ): FieldDistribution[] {
    const distributions: FieldDistribution[] = []
    
    // For each field, generate realistic distributions
    for (const [fieldName, value] of Object.entries(solutionFields)) {
      if (Array.isArray(value)) {
        // Array field - MUST include exact values!
        distributions.push({
          field_name: fieldName,
          distributions: this.generateArrayDistribution(value)
        })
      } else {
        // Regular field
        distributions.push({
          field_name: fieldName,
          distributions: this.generateValueDistribution(fieldName, value, category)
        })
      }
    }
    
    return distributions
  }
  
  private generateArrayDistribution(items: string[]): Distribution[] {
    // Ensure stored items are included with high percentages
    const distributions: Distribution[] = []
    let remainingPercentage = 100
    
    // Give each stored item a percentage
    items.forEach((item, index) => {
      const percentage = Math.floor(remainingPercentage / (items.length - index))
      distributions.push({ name: item, percentage })
      remainingPercentage -= percentage
    })
    
    return distributions
  }
}
```

## 🔄 Phase 3: Build Automation Tools (3-4 hours)

### Step 3.1: Create Web Interface (Optional)
**Location**: `/app/admin/solution-generator/page.tsx`

Build admin UI for:
- Selecting categories and goals
- Previewing generated solutions
- Adjusting relevance thresholds
- Executing generation
- Viewing results

### Step 3.2: Create Batch Processing
**Location**: `/scripts/batch-generate.ts`

```typescript
// Priority clusters based on Missing Goals Analysis
const clusters = [
  {
    name: "mental_health",
    goals: ["manage anxiety", "overcome depression", "manage adhd symptoms"],
    targetSolutions: 100
  },
  {
    name: "productivity", 
    goals: ["stop procrastinating", "improve focus", "manage time better"],
    targetSolutions: 50
  },
  {
    name: "relationships",
    goals: ["improve communication", "rebuild trust", "manage jealousy"],
    targetSolutions: 40
  }
]

for (const cluster of clusters) {
  console.log(`Processing cluster: ${cluster.name}`)
  await processCluster(cluster)
}
```

### Step 3.3: Create Quality Monitoring
**Location**: `/scripts/monitor-quality.ts`

```typescript
async function checkQuality() {
  const metrics = {
    totalSolutions: 0,
    goalsWithSolutions: 0,
    avgSolutionsPerGoal: 0,
    categoryCoverage: {},
    fieldCompleteness: {},
    arrayMatchingErrors: []
  }
  
  // Run checks
  // Output report
  console.table(metrics)
}
```

## 📊 Phase 4: Generate Initial Content (4-5 hours)

### Step 4.1: Priority 1 - Universal Solutions (200 solutions)

Focus on solutions that work across many goals:

```bash
# Mental health universals
npm run generate:solutions -- \
  --template="mental-health-universal" \
  --categories="meditation_mindfulness,therapists_counselors,medications" \
  --min-relevance=0.4 \
  --count=50

# Physical health universals  
npm run generate:solutions -- \
  --template="physical-health-universal" \
  --categories="exercise_movement,diet_nutrition,sleep" \
  --min-relevance=0.4 \
  --count=50
```

### Step 4.2: Priority 2 - Uncovered Goals (500 solutions)

Target the 613 goals with no solutions:

```bash
npm run generate:targeted -- \
  --uncovered-only \
  --min-per-goal=5 \
  --count=500
```

### Step 4.3: Priority 3 - Category Balance (300 solutions)

Ensure all 23 categories have representation:

```bash
npm run generate:balanced -- \
  --ensure-categories=all \
  --min-per-category=20 \
  --count=300
```

## 🧪 Phase 5: Testing & Validation (2-3 hours)

### Step 5.1: Unit Tests
Create test files:
- `/tests/services/solution-generator.test.ts`
- `/tests/services/smart-matcher.test.ts`
- `/tests/services/sql-generator.test.ts`
- `/tests/services/solution-validator.test.ts`

### Step 5.2: Integration Tests
Test complete pipeline with a small batch

### Step 5.3: Manual Validation
Check in UI at `/goal/[id]`:
- Do all 4 fields display?
- Are array pills showing?
- Do percentages appear?

## 🚀 Execution Checklist

### Prerequisites
- [ ] Read `/docs/WWFM Solution Fields Matrix - Code-Aligned.md`
- [ ] Understand field variations (skincare_frequency for beauty_skincare)
- [ ] Have Supabase credentials
- [ ] TypeScript environment ready

### Implementation Order
1. [ ] Build SolutionGenerator class
2. [ ] Build SmartMatcher class
3. [ ] Build SQL generator
4. [ ] Build validator
5. [ ] Create CLI tool
6. [ ] Create templates for 5 categories
7. [ ] Test with 10 solutions
8. [ ] Fix any field matching issues
9. [ ] Generate 100 solutions batch
10. [ ] Validate in UI
11. [ ] Generate remaining 1,900 solutions

### Quality Gates
- [ ] Using EXACT field names from matrix
- [ ] All percentages sum to 100
- [ ] Array values match distributions exactly
- [ ] Field names match CATEGORY_CONFIG
- [ ] Relevance scores > 0.6
- [ ] No duplicate solution-goal pairs

## 🔧 Troubleshooting Guide

### Problem: "Array percentages not showing"
**Solution**: Check that array values in `solution_fields` EXACTLY match distribution names

### Problem: "Wrong fields displaying"
**Solution**: Verify against `/docs/WWFM Solution Fields Matrix - Code-Aligned.md`
- beauty_skincare uses `skincare_frequency`
- All categories use `time_to_results`
- financial uses `time_to_impact`

### Problem: "SQL failing"
**Solution**: Check for proper escaping, UUID formats, JSONB syntax

### Problem: "Low relevance scores"
**Solution**: Adjust matching weights or improve goal/solution profiles

## 📈 Success Metrics

Target outcomes:
- **2,000+ solutions** generated
- **80% goal coverage** (522/652 goals)
- **Average 8+ solutions** per covered goal
- **Relevance > 0.7** average
- **100% field completion**
- **0 array matching errors**

## 🎬 Next Session Handoff

For the next Claude session, provide:
1. This instruction document: `/docs/WWFM Solution Generation Instructions.md`
2. Matrix document: `/docs/WWFM Solution Fields Matrix - Code-Aligned.md`
3. Progress update: "Completed Phase X, Step Y"
4. Any error logs or issues
5. Current metrics

**Start command**:
```
"Continue WWFM solution generation from Phase [X], Step [Y]. 
Previous session generated [N] solutions covering [M] goals.
Current issue: [describe if any]"
```

## 📞 Support Resources

- **Matrix**: `/docs/WWFM Solution Fields Matrix - Code-Aligned.md`
- **Display Logic**: `/components/goal/GoalPageClient.tsx`
- **Database Schema**: `/docs/database/schema.md`
- **Form Templates**: `/components/solutions/forms/`
- **Type Definitions**: `/types/solutions.ts`

---

**Ready to start?** Begin with Phase 1, Step 1.1 - Create the SolutionGenerator service!