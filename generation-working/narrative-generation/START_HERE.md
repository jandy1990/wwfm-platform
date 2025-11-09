# START HERE - Narrative Generation Project

**For the next Claude picking this up cold**

---

## 📍 Quick Orientation

**What you're doing:** Building AI-generated qualitative commentary for WWFM Community tabs

**Current status:** Research complete ✅ | Implementation decisions made ✅ | Ready to build ⏳

**Your mission:** Build the content generation pipeline and create 5-10 posts for "Reduce anxiety" goal as prototype

---

## 🚀 Read These Files In Order

### 1. **HANDOVER.md** (30 min read - ESSENTIAL)
Complete project context including:
- What WWFM is and why we're doing this
- The 5 research-validated patterns
- Authenticity framework (CRITICAL - this is how you avoid generic content)
- Build sequence and success criteria

### 2. **IMPLEMENTATION_DECISIONS.md** (5 min read - ESSENTIAL)
All 5 implementation questions have been answered:
- ✅ Flair names: "What to Expect", "The Mindset Shift", "Lessons Learned", "My Story", "Practical Tips"
- ✅ Attribution: Simply "AI-synthesized"
- ✅ Multiple flairs allowed per post
- ✅ Goal-specific pattern distribution
- ✅ Interwoven blending for combinations

### 3. **Claude Research.md** (Reference as needed - 50 pages)
Complete pattern taxonomy with:
- Ingredient lists for each pattern
- Generation templates
- Authenticity examples (do vs. don't)
- Goal-type applicability guide

### 4. **COMMUNITY_TAB_ANALYSIS.md** (Optional - 10 min)
Technical infrastructure details

---

## ✅ What's Already Complete

- ✅ Research: 5 patterns identified with 45-70% frequency validation
- ✅ Infrastructure: Community tabs exist, database tables ready
- ✅ User requirements: Gathered from Jack
- ✅ Implementation decisions: All 5 questions answered
- ✅ Flair naming: User-centric language finalized

---

## 🎯 Your Immediate Next Steps

### Step 1: Database Schema Updates
Add these columns to `goal_discussions` table:
```sql
ALTER TABLE goal_discussions
ADD COLUMN is_ai_generated BOOLEAN DEFAULT false,
ADD COLUMN flair_types TEXT[],
ADD COLUMN ai_metadata JSONB;
```

### Step 2: Create AI User or System Flag
Decide approach:
- Create "WWFM Research" bot user account
- OR use special system user_id for AI posts

### Step 3: Build Generation Pipeline
Create these files in this folder:

1. **`pattern-templates.ts`**
   - 5 pattern templates from research
   - Blending logic for combinations
   - Uses ingredient lists from `Claude Research.md`

2. **`generate-commentary.ts`**
   - Main generation engine
   - Takes: goal + pattern(s) + optional focus
   - Returns: synthetic post text + metadata

3. **`insert-discussions.ts`**
   - Inserts into database
   - Sets flairs, AI flag, metadata

4. **`quality-validator.ts`**
   - 10-point authenticity checklist
   - Ensures 2/3 core ingredients present

### Step 4: Prototype on "Reduce Anxiety"
Generate 8-10 posts:
- 3 posts: "The Mindset Shift" (mental health primary pattern)
- 2 posts: "My Story"
- 2 posts: "What to Expect"
- 1 post: "Lessons Learned"
- ~60% should combine 2 patterns

**Validate each:**
- Passes 7+ items on authenticity checklist
- Includes 2/3 core ingredients
- Feels peer-to-peer, not generic

### Step 5: Review with Jack
Show him the 8-10 posts, get feedback, iterate

### Step 6: Scale
Once approved, expand to top 50 goals

---

## ⚠️ CRITICAL Success Factors

### The Authenticity Formula
Every post MUST include **2 of 3** core ingredients:
1. **Emotional Honesty** - "I was terrified," "I still struggle"
2. **Specific Details** - "$124K debt," "Week 6," "CeraVe cleanser"
3. **Temporal Progression** - "Week 1 vs Month 3," "got worse before better"

### 10-Point Checklist (Need 7+)
- [ ] Specific numbers (time, cost, percentage)
- [ ] Named tools/products
- [ ] Admits mistake/fear/struggle
- [ ] Shows non-linear progression
- [ ] Unglamorous details
- [ ] First-person experience
- [ ] Peer disclaimers ("worked for me")
- [ ] Time investment mentioned
- [ ] Ongoing work acknowledged
- [ ] Specific costs/trade-offs

### Quality Control Question
**"Could this have been written by someone who didn't actually do the thing?"**
- If YES → add specificity/vulnerability/details
- If NO → ready to publish

---

## 🚨 Common Pitfalls to Avoid

1. **Template Detection** - Vary structure, don't follow templates rigidly
2. **Generic Advice** - Add specificity, emotional honesty, unglamorous details
3. **Missing the Firewall** - NEVER copy real posts, always generate fresh
4. **Wrong Pattern for Goal** - Check applicability guide (mental health ≠ physical health)
5. **Insufficient Authenticity** - Need 7+ checklist items, not 4-5
6. **Perfect Outcomes** - Always include "still working on" or setbacks
7. **Expert Tone** - Use peer language ("worked for me" not "you should")

---

## 💡 Quick Reference: Pattern Templates

**From `Claude Research.md` pages 64-555:**

### "What to Expect" Template
```
[MILESTONE]: "73 Days Sober"
[EMOTION]: Humble acknowledgment
[CHANGES]: 3-5 specific differences
[TIMELINE]: Week 1 vs Week 6 vs Month 3
[WHAT HELPED]: Specific tools with costs
[STRUGGLES]: Ongoing challenges
[CLOSING]: Encouragement
```

### "The Mindset Shift" Template
```
[OLD BELIEF]: "I used to think..."
[CONSEQUENCES]: How it held me back
[CATALYST]: What changed my thinking
[NEW BELIEF]: "Now I realize..."
[BEHAVIOR CHANGE]: What I do differently
[RESULTS]: What this enabled
```

### "Lessons Learned" Template
```
[CREDIBILITY]: "2 years managing anxiety taught me..."
[MISTAKE #1]: What I did + why + consequence + correction
[MISTAKE #2]: What I did + why + consequence + correction
[MISTAKE #3]: What I did + why + consequence + correction
[ENCOURAGEMENT]: Hope with caveat
```

**Full templates in research document.**

---

## 📊 Goal-Specific Pattern Distribution

**Mental Health** (anxiety, depression):
- Primary: "The Mindset Shift" (70%), "My Story" (40%)
- Secondary: "What to Expect" (35%)

**Physical Health** (skincare, weight, sleep):
- Primary: "What to Expect" (60%), "Lessons Learned" (40%)
- Secondary: "Practical Tips" (30%)

**Career Goals**:
- Primary: "Lessons Learned", "The Mindset Shift"

**Finance Goals**:
- Primary: "What to Expect" + "My Story", "Lessons Learned"

**See `IMPLEMENTATION_DECISIONS.md` for complete guide.**

---

## 🎯 Success = Prototype Approval

You succeed when:
1. 8-10 posts generated for "Reduce anxiety"
2. Each passes authenticity checklist (7+ items)
3. Each has 2/3 core ingredients
4. Mix matches mental health pattern distribution
5. Jack reviews and approves quality
6. Ready to scale to more goals

---

## 📁 File Structure

```
narrative-generation/
├── START_HERE.md (you are here)
├── HANDOVER.md (complete context - read this)
├── IMPLEMENTATION_DECISIONS.md (all questions answered)
├── Claude Research.md (pattern taxonomy - reference)
├── COMMUNITY_TAB_ANALYSIS.md (technical docs)
└── [You will create:]
    ├── pattern-templates.ts
    ├── generate-commentary.ts
    ├── insert-discussions.ts
    └── quality-validator.ts
```

---

## 🚀 Your First Action

1. Read HANDOVER.md (30 min)
2. Read IMPLEMENTATION_DECISIONS.md (5 min)
3. Skim Claude Research.md patterns (20 min)
4. Say "Ready to build" to Jack
5. Start with database schema updates

---

**Everything you need is in this folder. Start with HANDOVER.md.**

**Questions? Ask Jack - he's been through the entire research and decision process.**

---

**Good luck! 🎉**
