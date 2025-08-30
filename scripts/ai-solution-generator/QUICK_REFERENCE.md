# Quick Reference Guide - Critical Rules (v2 - Intelligent Mapping)

## 🚨 Before You Generate Solutions

### The 5 Golden Rules (Updated)

1. **Evidence-Based Only**: Every effectiveness rating must reference real research from training data
2. **Natural Value Generation**: AI generates natural values (e.g., "$18/month"), system maps to dropdowns
3. **Array Value Matching**: Array values in solution_fields MUST appear in distributions with exact same strings
4. **AI Foundation Marking**: All generated content must have `source_type: 'ai_foundation'` and `rating_count: 1`
5. **Realistic Distributions**: Prevalence must reflect real-world patterns, not uniform randomness

## ⚡ Quick Commands

### First Time Setup
```bash
# 1. Add your API key to .env.local:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# 2. Install dependencies (if not done):
npm install

# 3. Test everything works:
npm run test:ai-generator
```

### Generation Commands

```bash
# Test value mapping
npm run test:ai-mapper

# Test the system
npm run test:ai-generator

# Test dropdown validation
npm run test:ai-dropdown

# Dry run (preview only)
npm run generate:ai-solutions -- --dry-run

# Generate for one goal
npm run generate:ai-solutions -- --goal-id=<uuid> --limit=5

# Full generation
npm run generate:ai-solutions
```

## 🎯 What Success Looks Like

- **10-15 solutions per goal** (not 50, not 3)
- **Effectiveness 3.0-5.0** (nothing below 3.0)
- **Variety of categories** (not all medications)
- **Mix of price points** (free to premium)
- **Percentages sum to 100** (always)

## ❌ Common Mistakes (Updated)

1. **Random effectiveness**: `3.5 + Math.random()` - NO!
2. **Wrong field names**: Using `frequency` instead of `skincare_frequency`
3. **Mismatched arrays**: "Nausea" in fields but "nausea" in distributions
4. **Too uniform**: All distributions at 20%, 20%, 20%, 20%, 20%
5. **Missing variants**: Medications without dosage variants
6. **~~Forcing exact dropdowns~~**: No longer needed - AI generates natural values, system maps them

## 📊 Expected Output

```
🎯 Reduce anxiety
   🤖 Consulting AI for evidence-based solutions...
   📋 AI recommended 15 solutions
      1. Cognitive Behavioral Therapy (4.6★) - therapists_counselors
      2. SSRIs (Sertraline) (4.3★) - medications
      3. Regular Exercise (4.1★) - exercise_movement
   💾 Processing: Cognitive Behavioral Therapy
      🔄 Mapping to dropdown values...
        Mapped cost: "$150 per session" → "$100-200/session"
        Mapped time_to_results: "4 weeks" → "3-4 weeks"
      ✅ Successfully inserted Cognitive Behavioral Therapy
```

## 🔍 Validation Checklist

Before considering generation complete:
- [ ] Run `npm run test:ai-mapper` - does mapping work?
- [ ] Check a few goal pages in the UI - do solutions display?
- [ ] Are all 4 fields showing on each card?
- [ ] Do array field pills render correctly?
- [ ] Are effectiveness ratings reasonable (3.0-5.0)?
- [ ] Do prevalence percentages appear?
- [ ] Check console for mapping messages (e.g., "Mapped cost: '$18/month' → '$10-25/month'")

## 🆘 If Something Goes Wrong

1. **Run value mapper test** to see if mapping is working
2. **Check field names** against CATEGORY_CONFIG
3. **Verify array matching** is exact
4. **Look at console** for mapping messages
5. **Check SQL output** for malformed JSON
6. **Check Supabase logs** for RLS issues
7. **Read CONTEXT.md** for full understanding

---

**Remember**: We're using AI's training knowledge to provide genuine, evidence-based starting points. The system now intelligently maps natural values to dropdown options, making the generation more reliable and maintainable.
