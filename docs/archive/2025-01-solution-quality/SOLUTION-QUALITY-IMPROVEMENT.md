# WWFM Solution Quality Improvement Initiative

**Date**: January 2025  
**Priority**: 🔴 CRITICAL - Blocking User Experience  
**Scope**: Fix data quality issues affecting solution display

---

## 🎯 Executive Summary

Our AI-generated solutions have significant data quality issues preventing proper display on the frontend. This document outlines the problems, analysis approach, and **evidence-based AI remediation strategy**.

### Key Problems Identified:
1. **Missing distribution data** for array fields (side effects/challenges without percentages)
2. **Completely blank solution cards** (missing all field data)
3. **Wrong fields for categories** (practice solutions missing practice_length, etc.)
4. **Inconsistent field naming** (skincare_frequency vs frequency)
5. **Missing core required fields** (time_to_results, cost)

---

## 📊 Problem Analysis

### Problem 1: Array Fields Without Percentages

**Example**: "Stop Emotional Eating" goal
- ✅ Nourish: Has challenges WITH percentages
- ❌ Noom: Has challenges WITHOUT percentages

**Root Cause**: `aggregated_fields` contains raw arrays instead of DistributionData format

**Expected Format**:
```json
{
  "challenges": {
    "mode": "Staying consistent",
    "values": [
      { "value": "Staying consistent", "count": 45, "percentage": 38 },
      { "value": "Time commitment", "count": 30, "percentage": 25 }
    ],
    "totalReports": 120
  }
}
```

**Actual Format** (incorrect):
```json
{
  "challenges": ["Staying consistent", "Time commitment", "Cost"]
}
```

### Problem 2: Completely Missing Field Data

**Example**: "Mindful Eating by Mark Zaroff"
- Category: habits_routines (uses PracticeForm)
- Expected fields: time_to_results, time_commitment, cost
- Actual: NO aggregated_fields or solution_fields at all

**Impact**: Solution card displays completely blank

### Problem 3: Category-Field Mismatch

**Categories and Their Required Fields**:

```typescript
// PRACTICE FORMS (must have these fields)
meditation_mindfulness: ['time_to_results', 'practice_length', 'frequency']
exercise_movement: ['time_to_results', 'frequency', 'cost']
habits_routines: ['time_to_results', 'time_commitment', 'cost']

// SESSION FORMS (must have these fields)
therapists_counselors: ['time_to_results', 'session_frequency', 'session_length', 'cost']
doctors_specialists: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost']

// LIFESTYLE FORMS (must have these fields)
diet_nutrition: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost']
sleep: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost']
```

---

## 🔧 Evidence-Based AI Remediation Strategy

### Core Principle: AI Consultation for Specific Solution-Goal Pairs
Every piece of data must come from AI consulting its training data (medical literature, research studies, user reports) for THAT specific solution addressing THAT specific goal. No random generation, no copying - only evidence-based information.

### Phase 1: Analysis & Prioritization
1. **Run quality analysis script** to identify all issues
2. **Prioritize by impact**: Solutions with most goal connections first
3. **Group by problem type** for efficient batch processing

### Phase 2: Evidence-Based AI Data Remediation

#### Step 1: Query AI for Solution-Goal Specific Evidence
For each broken solution-goal pair, we query AI with:
- The specific solution (e.g., "Lexapro 10mg")
- The specific goal (e.g., "Reduce anxiety")
- Request evidence-based data from training (research, studies, clinical guidelines)

#### Step 2: Generate Proper Distribution Format
Convert AI responses into correct DistributionData format:
- Calculate realistic percentages based on prevalence data
- Create count distributions that sum correctly
- Ensure mode value is most common

#### Step 3: Validate Against Category Requirements
- Ensure all required fields for category are present
- Use correct field names (skincare_frequency vs frequency)
- Add missing core fields (time_to_results, cost)

### Phase 3: Quality Validation
1. **Test display on frontend** - Verify cards show all data
2. **Check distribution math** - Percentages sum to 100, counts make sense
3. **Validate evidence basis** - Spot check AI responses for accuracy

---

## 🚀 Implementation Plan

### For Claude Code:

1. **First**: Run the analysis script to get full scope
   ```bash
   npx tsx scripts/analyze-solution-quality.ts > quality-report.json
   ```

2. **Second**: Run targeted fix for highest-impact issues
   ```bash
   npx tsx scripts/fix-solution-quality.ts --goal-id <id> --ai-enhanced
   ```

3. **Third**: Validate fixes are displaying correctly
   ```bash
   npm run dev
   # Navigate to /goal/<id> and verify solution cards
   ```

### Key Scripts to Create/Run:

1. `scripts/analyze-solution-quality.ts` - Comprehensive analysis
2. `scripts/fix-solution-quality.ts` - AI-enhanced remediation
3. `scripts/validate-solution-display.ts` - Frontend validation

---

## 📈 Success Metrics

- **100% of solutions** have required fields for their category
- **100% of array fields** have proper distribution percentages
- **0 blank solution cards** on any goal page
- **All data is evidence-based** from AI training data

---

## 🔍 Quality Assurance

Each fix must:
1. Be specific to the solution-goal combination
2. Come from AI training data (research, studies, guidelines)
3. Use proper DistributionData format
4. Display correctly on frontend
5. Make logical sense (percentages, timeframes, costs)

---

## 📝 Notes for Claude Code

**Critical**: This is NOT about generating random data or copying from other solutions. Each piece of information must be:
- Evidence-based from AI's training data
- Specific to that solution for that goal
- Formatted correctly for frontend display
- Validated against category requirements

The core value proposition is that our AI-generated data reflects real research and evidence, not arbitrary values.