# WWFM AI Solution Generator
*Complete Documentation - September 2025*

## 🎯 Overview

The AI Solution Generator is a hybrid system that solves WWFM's cold start problem by pre-populating the platform with evidence-based solutions. It combines **Gemini generation** (free) with **Claude quality checking** (targeted) to achieve 95%+ quality at 70% cost savings.

**Core Innovation**: The "Attribution Required" strategy achieves 100% specificity by forcing solutions to reference specific sources (e.g., "Dr. Weil's 4-7-8 breathing" not "meditation").

## 🚀 Quick Start

### 1. Setup
```bash
# Install dependencies
npm install @google/generative-ai commander chalk dotenv

# Add to .env.local:
GEMINI_API_KEY=<your_gemini_api_key>
ANTHROPIC_API_KEY=<your_anthropic_api_key>  # For quality checking
```

### 2. Generate Solutions
```bash
# Standard generation (uses Attribution Required strategy)
npm run generate:ai-solutions

# Start from specific index (if resuming)
npm run generate:ai-solutions -- --start-from=100

# Generate for specific goal
npm run generate:ai-solutions -- --goal-id=<uuid>
```

### 3. Quality Check
```bash
# Test with 100 solutions (full data capture)
npx tsx scripts/solution-generator/quality-test-100.ts

# Run quality pipeline
npm run quality:check
```

## 🧠 Core Philosophy

### The Problem: Generic Advice Everywhere
- People get vague advice: "try meditation", "consider therapy"
- But they need specific implementations: "Headspace anxiety pack", "BetterHelp CBT"
- WWFM bridges this "last-mile problem" in self-help

### The Solution: Attribution Required Strategy
**Every solution MUST reference a specific source:**
- ✅ "Dr. Weil's 4-7-8 breathing technique"
- ✅ "Headspace's anxiety pack"
- ✅ "AA's 12-step program"
- ❌ "meditation" → REJECTED
- ❌ "therapy" → REJECTED

### Why This Works
- **Specificity**: Users get actionable recommendations
- **Evidence-based**: Leverages AI's training on research literature
- **Scalable**: Can process 271 goals automatically
- **Authentic**: Not random data, but real effectiveness from studies

## 📊 System Architecture

### Generation Pipeline
1. **Goal Selection** - Smart strategies (breadth-first, arena-based, priority)
2. **Gemini Generation** - 20 solutions per goal with evidence-based ratings
3. **Value Mapping** - Natural values → dropdown options intelligently
4. **Database Insertion** - Solutions, variants, links, distributions
5. **Quality Checking** - Claude evaluates across 5 dimensions
6. **Fix Application** - Auto-applies improvements

### Hybrid Cost Model
- **Gemini Generation**: FREE (1000 requests/day limit)
- **Claude Quality**: ~$0.001 per solution  
- **Total**: ~$30-40 vs $137 pure Claude (70% savings)

## 🎛️ Key Components

### 1. Attribution Required Prompts
**File**: `prompts/master-prompts.ts`
- Forces AI to consult training data from medical literature
- Requires specific attribution for every solution
- Achieves 100% specificity in testing

### 2. Intelligent Value Mapping
**File**: `utils/value-mapper.ts`
- AI generates natural values ("$18/month", "2 weeks")
- System maps to exact dropdown options ("$10-25/month", "1-2 weeks")
- Handles 23 solution categories with different field requirements

### 3. Quality Checking System
**File**: `services/claude-quality-checker.ts`
- Evaluates 5 dimensions (conversation completeness, evidence alignment, etc.)
- Pass threshold: ≥85% on all dimensions
- Auto-applies fixes to database

### 4. Validation Suite
**Files**: `validate-and-fix.ts`, `fix-*.ts`
- Comprehensive data quality validation
- Auto-fixes: variant naming, frequency mapping, cost logic
- 100% field completion and dropdown compliance

## 🎯 Success Metrics

### Quantitative Results
- **746 solutions generated** across 44 goals
- **100% specificity** achieved with Attribution Required strategy
- **100% field completion** - all required fields populated
- **Evidence-based ratings** - 3.0-5.0 stars with research justification
- **Cost efficiency** - $0 generation cost (Gemini free tier)

### Quality Standards
- **Googleability**: Every solution can be found with search
- **Actionability**: Users can immediately implement
- **Attribution**: Sources clearly identified
- **Evidence-based effectiveness**: No arbitrary ratings
- **Category accuracy**: Proper categorization

## 🛠️ Commands Reference

### Generation
```bash
# Full generation
npm run generate:ai-solutions

# Dry run (preview only)
npm run generate:ai-solutions -- --dry-run

# Resume from index
npm run generate:ai-solutions -- --start-from=45

# Specific goal
npm run generate:ai-solutions -- --goal-id=<uuid>

# Check progress
npm run generate:check
```

### Quality System
```bash
# Test quality system
npx tsx quality-test-100.ts

# Run quality checks
npm run quality:check

# Quality orchestrator
npm run quality:orchestrate

# Real-time dashboard
npm run quality:dashboard -- --watch
```

### Validation
```bash
# Comprehensive validation
npm run generate:validate

# Specific fixes
npm run generate:fix-frequency
npm run generate:fix-diet
```

## 🔍 Validation & Data Quality

### Issues Discovered and Fixed (2025)

#### 1. Variant Naming Bug
- **Issue**: "nullnull" prefix on beauty/natural remedy variants
- **Fix**: Check null values before concatenation in `database/inserter.ts`

#### 2. Frequency Mapping
- **Issue**: Exercise showing "three times daily" vs "3-5 times per week"
- **Fix**: Enhanced `mapFrequencyToDropdown()` with weekly pattern detection

#### 3. Time Commitment
- **Issue**: All showing "Under 5 minutes" 
- **Fix**: Dedicated `mapTimeCommitmentToDropdown()` function

#### 4. Diet Cost Logic
- **Issue**: All diet solutions marked "Significantly more expensive"
- **Fix**: Logic-based cost impacts per solution type

### Current Quality Metrics
- **Field Completion**: 100%
- **Dropdown Compliance**: 100% 
- **Variant Naming**: 100% correct
- **Logical Accuracy**: 95%+
- **Front-End Display**: Verified working

## ⚙️ Technical Details

### Rate Limiting (Gemini)
- **Daily limit**: 1000 requests
- **Rate limit**: 15 requests/minute
- **Auto-tracking**: `.gemini-usage.json`
- **Auto-resumption**: Use `--start-from` flag

### Database Schema
**Tables populated**:
- `solutions` - Base solution entities
- `solution_variants` - Dosage-specific versions 
- `goal_implementation_links` - Effectiveness per goal
- `ai_field_distributions` - Prevalence data

**Quality tracking fields**:
- `quality_status`, `quality_issues`, `quality_fixes_applied`
- Score fields for 5 quality dimensions

### Categories Supported
All 23 categories with smart field mapping:
- **Dosage categories**: medications, supplements, natural_remedies, beauty_skincare
- **Service categories**: therapists, doctors, coaches, alternative_practitioners
- **Product categories**: apps, products, books, financial_products
- **Activity categories**: exercise, meditation, habits, diet, sleep
- **Support categories**: groups, communities, crisis_resources

## 🎯 Success Examples

### Before Attribution Required
```json
{
  "title": "Meditation",
  "description": "Practice mindfulness meditation",
  "effectiveness": 4.2
}
```

### After Attribution Required  
```json
{
  "title": "Headspace anxiety pack",
  "description": "Headspace's guided meditation program specifically designed for anxiety, featuring 10-30 minute sessions",
  "effectiveness": 4.6,
  "effectiveness_rationale": "Clinical study of 238 participants showed 23% anxiety reduction"
}
```

## 🚨 Critical Rules

### 1. Attribution Required
Every solution MUST have specific attribution:
- Product name (Headspace)
- Author/creator (Dr. Weil)
- Program name (12-step program)
- Specific protocol (4-7-8 breathing)

### 2. Evidence-Based Ratings
- All effectiveness ratings based on research, not arbitrary
- Range: 3.0-5.0 (nothing below 3.0)
- Rationale required for each rating

### 3. Field Matching Critical
- Natural generation → intelligent mapping to dropdowns
- Array fields must match distributions exactly
- Category-specific field names (e.g., `skincare_frequency` not `frequency`)

### 4. Quality Dimensions
All solutions evaluated on:
- **Conversational Completeness** (30%): Friend can act on it
- **Evidence Alignment** (25%): Rating justified by research
- **Accessibility Truth** (20%): Costs/barriers disclosed  
- **Expectation Accuracy** (15%): Realistic timeframes
- **Category Accuracy** (10%): Proper categorization

## 🔄 Migration History

### v2.0.0 (August 2025) - Gemini Migration
- **Migrated**: Claude ($137/run) → Gemini (FREE)
- **Trade-off**: 3 hours → 2-3 days (worth $137 savings)
- **Fixed**: All data quality issues (variants, frequency, cost)
- **Added**: Comprehensive validation suite

### v1.0.0 (December 2024) - Initial Claude Version
- Evidence-based generation system
- 23 category support
- Prevalence distributions

## 🎉 Current Status

**PRODUCTION READY** - Successfully generated 746 solutions with:
- ✅ 100% specificity (Attribution Required strategy)
- ✅ 100% field completion
- ✅ Evidence-based effectiveness (3.8-4.7 range)
- ✅ Quality validation suite
- ✅ Cost-effective operation ($0 generation + ~$5-10 quality)

The system is ready for full production use and provides a solid foundation for WWFM's solution-rating platform.
