# Implementation Decisions - Narrative Generation

**Date:** November 9, 2025
**Status:** All 5 questions answered - Ready to build

---

## ✅ Question 1: Flair Selection

**Decision:** Implement all 5 patterns as user-centric flairs

### Final Flair Names (User-Facing)

1. **"What to Expect"** - Timeline Reality pattern (45-60% frequency)
2. **"The Mindset Shift"** - Mindset Shifts pattern (55-70% frequency)
3. **"Lessons Learned"** - Mistakes/Learned pattern (40-55% frequency)
4. **"My Story"** - Journey Narrative pattern (25-40% frequency)
5. **"Practical Tips"** - Tactical Tips pattern (15-30% frequency)

**Rationale:** User-centric language communicates value rather than narrative structure. "What to Expect" tells users what they'll get, vs "Timeline Reality" which describes the format.

---

## ✅ Question 2: Source Attribution

**Decision:** Minimal/generic attribution

### Attribution Text
Simply label all posts as: **"AI-synthesized"**

**No source details** (no Reddit communities, no post counts, no specific forums)

**Rationale:**
- Maximally simple and transparent
- Avoids legal/attribution complexity
- Clear that it's synthetic content without over-explaining

---

## ✅ Question 3: Pattern Combination Strategy

**Decision:** Allow multiple flairs per post

### Implementation
- Posts can have 1-2 flairs (e.g., "What to Expect" + "Lessons Learned")
- UI shows both badges on the post
- Users can filter by flair to see all posts with that pattern
- Database: Store as array of flair types

**Rationale:**
- Research shows 60% of highest-engagement posts combine 2 patterns
- Multiple flairs accurately represent content
- Enables flexible filtering (show me all "Mindset Shift" posts, including combos)

---

## ✅ Question 4: Volume Distribution Per Goal

**Decision:** Goal-specific pattern mix (Option C)

### Distribution Strategy

**Mental Health Goals** (anxiety, depression, ADHD):
- Primary: "The Mindset Shift" (70%), "My Story" (40%)
- Secondary: "What to Expect" (35%)
- Avoid: Toxic positivity, "just think positive"

**Physical Health Goals** (skincare, weight loss, sleep):
- Primary: "What to Expect" (60%), "Lessons Learned" (40%)
- Secondary: "Practical Tips" (30%)
- Avoid: Body shaming, unrealistic timelines

**Career Goals**:
- Primary: "Lessons Learned" (dominant), "The Mindset Shift"
- Secondary: "My Story" (for transitions)
- Avoid: "Follow your passion" without logistics

**Finance Goals**:
- Primary: "What to Expect" + "My Story" (70%+), "Lessons Learned"
- Secondary: "Practical Tips"
- Avoid: Privilege blindness

**Relationship Goals**:
- Primary: "The Mindset Shift", "My Story"
- Secondary: "Lessons Learned"
- Avoid: Blame framing

**Rationale:** Different goal types benefit from different pattern mixes based on research frequency data and applicability.

---

## ✅ Question 5: Combination Post Structure

**Decision:** Interwoven/natural blending (Option B)

### Blending Approach
When combining two patterns in one post:
- **Blend naturally** where they logically connect
- **Don't force sequential structure** (first half pattern A, second half pattern B)
- **Let patterns support each other** organically

**Examples:**
- **"What to Expect" + "Lessons Learned":** Mistakes appear at relevant timeline points ("Week 2 I made this mistake...")
- **"My Story" + "The Mindset Shift":** The mindset shift IS the turning point in the journey
- **"What to Expect" + "Practical Tips":** Tips introduced as they become relevant at each stage

**Validation:**
- Prototype on "Reduce anxiety" first
- Use 10-point authenticity checklist to catch forced/mechanical blending
- Iterate based on what feels natural vs. templated

**Rationale:**
- Most organic approach (patterns naturally intersect)
- Avoids rigid templates that feel mechanical
- Can adjust after prototype if needed

---

## 📊 Summary: Implementation Specifications

### Database Schema Changes Needed

```sql
ALTER TABLE goal_discussions
ADD COLUMN is_ai_generated BOOLEAN DEFAULT false,
ADD COLUMN flair_types TEXT[], -- Array for multiple flairs
ADD COLUMN ai_metadata JSONB;
```

**ai_metadata structure:**
```json
{
  "label": "AI-synthesized",
  "generated_date": "2025-11-09",
  "patterns_used": ["what_to_expect", "lessons_learned"]
}
```

### Flair Database Values

**Internal values** (stored in database):
- `what_to_expect`
- `mindset_shift`
- `lessons_learned`
- `my_story`
- `practical_tips`

**Display values** (shown to users):
- "What to Expect"
- "The Mindset Shift"
- "Lessons Learned"
- "My Story"
- "Practical Tips"

### Content Generation Strategy

**For 5-10 posts per goal:**

1. **Identify goal type** (mental health, physical health, career, finance, relationship)
2. **Select pattern mix** based on goal-type distribution guide above
3. **Generate single-pattern posts** (40% of content)
4. **Generate combination posts** (60% of content) using natural blending
5. **Validate each post** using 10-point authenticity checklist
6. **Ensure 2/3 core ingredients** present (emotional honesty, specific details, temporal progression)

### Prototype Plan

**Goal:** "Reduce anxiety" (rank #1 traffic, 55 solutions, mental health)

**Pattern mix for anxiety (mental health goal):**
- 3 posts: "The Mindset Shift" (some standalone, some combined)
- 2 posts: "My Story" (some standalone, some combined)
- 2 posts: "What to Expect"
- 1 post: "Lessons Learned"
- 1-2 posts: Combinations as appropriate

**Total:** 8-10 posts

**Process:**
1. Generate all posts
2. Run authenticity checklist on each
3. Review with Jack
4. Iterate based on feedback
5. Once approved → scale to more goals

---

## 🎯 Next Steps (For Next Claude)

1. **Update database schema** (add flair_types, is_ai_generated, ai_metadata)
2. **Create AI user account** or system flag for posting
3. **Build generation pipeline:**
   - `pattern-templates.ts` (5 templates + blending logic)
   - `generate-commentary.ts` (main generation engine)
   - `insert-discussions.ts` (database insertion)
   - `quality-validator.ts` (authenticity checklist)
4. **Prototype on "Reduce anxiety"** (8-10 posts)
5. **Get Jack's approval**
6. **Scale to top 50 goals**

---

**All decisions made. Ready to build.**
