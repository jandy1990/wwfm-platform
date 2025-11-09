# WWFM Narrative Generation Pipeline

AI-synthesized qualitative commentary generation for WWFM Community tabs, based on research of 5 high-frequency peer commentary patterns.

## 📁 Files Overview

### Core System Files

1. **`pattern-templates.ts`** - Pattern definitions and generation templates
   - 5 research-validated patterns (Timeline Reality, Mindset Shifts, Lessons Learned, Journey Narrative, Practical Tips)
   - Blending logic for combining patterns
   - Goal-type-specific recommendations

2. **`quality-validator.ts`** - Authenticity validation system
   - 10-point authenticity checklist
   - 3 core ingredients framework
   - Authenticity destroyer detection
   - Quality report generation

3. **`generate-commentary.ts`** - Main AI generation engine
   - Gemini AI integration
   - Pattern-specific prompting
   - Blended pattern generation
   - Batch generation with retry logic

4. **`insert-discussions.ts`** - Database insertion utilities
   - Insert posts into `goal_discussions` table
   - Batch operations
   - Goal lookup and management

5. **`generate-prototype.ts`** - Main execution script
   - Generates 8-10 posts for "Reduce anxiety"
   - Validates all posts
   - Creates quality reports
   - Saves to JSON for review

### Documentation Files

- **`START_HERE.md`** - Quick orientation for new Claude agents
- **`HANDOVER.md`** - Complete project context and build sequence
- **`IMPLEMENTATION_DECISIONS.md`** - All 5 implementation questions answered
- **`Claude Research.md`** - 50+ pages of pattern research and templates

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/jackandrews/Projects/wwfm-platform/generation-working/narrative-generation
npm install
```

### 2. Set Environment Variables

Create a `.env` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Generate Prototype Posts

```bash
npm run generate
```

This will:
- Generate 10 posts for "Reduce anxiety"
- Validate each with 10-point checklist
- Save to `output/reduce-anxiety-posts.json`
- Create quality report in `output/reduce-anxiety-quality-report.md`

### 4. Review Generated Content

Check the output files:
- **Posts:** `output/reduce-anxiety-posts.json`
- **Quality Report:** `output/reduce-anxiety-quality-report.md`

Review for:
- ✅ Authenticity markers (7+ of 10)
- ✅ Core ingredients (2 of 3)
- ✅ No destroyers (vague time, perfect outcomes, clichés)
- ✅ Feels peer-to-peer, not AI-generated

### 5. Insert into Database (if approved)

```bash
npx tsx insert-discussions.ts insert "Reduce anxiety" ./output/reduce-anxiety-posts.json
```

## 📊 Pattern Distribution for Mental Health Goals

Based on research, "Reduce anxiety" (mental health goal) uses:

**Primary patterns (70%):**
- "The Mindset Shift" (55-70% frequency)
- "My Story" (25-40% frequency)

**Secondary patterns (30%):**
- "What to Expect" (45-60% frequency)
- "Lessons Learned" (40-55% frequency)

**Strategy:** 40% single-pattern, 60% blended patterns

## ✅ Authenticity Requirements

Every post MUST pass:

### 10-Point Checklist (need 7+ to pass)

1. ✅ Specific numbers (time, cost, percentage)
2. ✅ Named tools/products
3. ✅ Admits mistake, fear, or struggle
4. ✅ Shows non-linear progression
5. ✅ Unglamorous details
6. ✅ First-person experience
7. ✅ Peer disclaimers ("worked for me")
8. ✅ Time investment mentioned
9. ✅ Ongoing work acknowledged
10. ✅ Specific costs/trade-offs

### Core Ingredients (need 2 of 3)

1. **Emotional Honesty** - Fear, shame, struggle, vulnerability
2. **Specific Details** - Exact numbers, product names, costs
3. **Temporal Progression** - Timeline markers, non-linear journey

## 🔧 Utility Commands

### Check Discussion Counts

```bash
npx tsx insert-discussions.ts count "Reduce anxiety"
```

### Delete AI Discussions (for regeneration)

```bash
npx tsx insert-discussions.ts delete "Reduce anxiety"
```

### Generate Custom Batch

Edit `generate-prototype.ts` to change:
- `GOAL_TITLE` - Target goal
- `GOAL_TYPE` - Goal category (mental_health, physical_health, career, finance, relationships)
- `POST_COUNT` - Number of posts to generate

## 📝 Database Schema

The `goal_discussions` table has been updated with:

```sql
is_ai_generated BOOLEAN DEFAULT false
flair_types TEXT[]  -- Array of pattern types
ai_metadata JSONB   -- Generation metadata
```

**Flair types:**
- `what_to_expect` (Timeline Reality)
- `mindset_shift` (Mindset Shifts)
- `lessons_learned` (Mistakes/Learned)
- `my_story` (Journey Narrative)
- `practical_tips` (Tactical Tips)

**AI metadata structure:**
```json
{
  "label": "AI-synthesized",
  "generated_date": "2025-11-09T...",
  "patterns_used": ["mindset_shift", "my_story"],
  "word_count": 432,
  "authenticity_markers": [
    "Includes specific number(s)",
    "Admits a mistake, fear, or struggle",
    ...
  ]
}
```

## 🤖 WWFM Research Bot

**User ID:** `00000000-0000-0000-0000-000000000002`
**Username:** `WWFM Research`
**Email:** `research-bot@whatworkedforme.com`

All AI-generated posts are attributed to this bot user.

## 🎯 Success Criteria

Generated content is successful if:

1. ✅ Passes authenticity checklist (7+ of 10)
2. ✅ Includes 2 of 3 core ingredients
3. ✅ Follows pattern template from research
4. ✅ Appropriate length (200-700 words depending on pattern)
5. ✅ Goal-type aligned (uses recommended patterns)
6. ✅ Feels peer-to-peer (not expert/prescriptive)
7. ✅ Avoids destroyers (vague time, perfect outcomes, clichés)

**Platform success:**
- Users upvote/engage with AI content
- Users reply with own experiences (conversion metric!)
- Community tab becomes valued part of goal pages

## 📚 Next Steps After Prototype

1. **Review with Jack** - Get approval on "Reduce anxiety" posts
2. **Iterate based on feedback** - Adjust prompts/validation if needed
3. **Scale to top 50 goals** - Generate content for high-traffic goals
4. **Frontend UI updates** - Display flair badges, AI attribution
5. **Monitoring** - Track engagement, conversion metrics

## 🔍 Quality Assurance

Before scaling to more goals:

1. **Manual review** - Read all 10 posts yourself
2. **Ask the critical question** - "Could this have been written by someone who didn't actually do the thing?"
3. **Check variety** - Do posts feel different from each other, or templated?
4. **Peer test** - Show to someone unfamiliar with the project
5. **Compare to real posts** - Do these match the quality of authentic peer commentary?

## 📖 Reference

For deep dives into patterns, see:
- **`Claude Research.md`** - Complete pattern taxonomy (50+ pages)
- **`HANDOVER.md`** - Build sequence and success criteria
- **`IMPLEMENTATION_DECISIONS.md`** - All implementation questions answered

---

**Status:** ✅ Ready for prototype generation
**Next action:** Run `npm run generate` to create first batch
