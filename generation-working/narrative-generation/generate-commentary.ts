/**
 * Category-Based Narrative Generation Engine
 *
 * Generates authentic peer commentary using category-specific diversity instructions
 * and single-batch generation for maximum diversity and efficiency.
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FlairType,
  PatternIngredients,
  GeneratedPost,
  getPatternQuotas
} from './pattern-templates';
import { validateAuthenticity, checkDestroyersAuthenticity } from './quality-validator';
import { getCategoryConfig } from './narrative-categories';
import { getGoalCategory } from './goal-category-map';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    temperature: 0.9, // Higher temperature for creative, varied output
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192 // Increased for batch generation
  }
});

/**
 * Generate a batch of posts in a single API call
 * Uses category-specific diversity instructions
 */
export const generatePostBatch = async (
  goalTitle: string,
  goalType: PatternIngredients['goalType'],
  postCount: number = 10,
  maxAttempts: number = 2,
  excludedDetails?: {
    therapists?: string[];
    medications?: string[];
    therapyTypes?: string[];
    apps?: string[];
  }
): Promise<GeneratedPost[]> => {

  const quotas = getPatternQuotas(goalType, postCount);

  console.log(`\nPattern Distribution for ${postCount} posts:`);
  quotas.forEach(q => {
    console.log(`  - ${q.pattern}: ${q.count} posts`);
  });
  console.log();

  let attempt = 0;
  let lastErrors: string[] = [];

  while (attempt < maxAttempts) {
    try {
      const prompt = attempt === 0
        ? buildBatchPrompt(goalTitle, goalType, postCount, quotas, excludedDetails)
        : buildRetryPrompt(goalTitle, goalType, postCount, quotas, lastErrors, excludedDetails);

      console.log(`\n🤖 Generating all ${postCount} posts in single batch (attempt ${attempt + 1}/${maxAttempts})...`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const posts = parsePostsFromJSON(response.text(), postCount);

      console.log(`✅ Generated ${posts.length} posts successfully`);

      return posts;

    } catch (error) {
      attempt++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Attempt ${attempt} failed:`, errorMsg);

      if (attempt >= maxAttempts) {
        throw new Error(`Failed to generate valid batch after ${maxAttempts} attempts: ${errorMsg}`);
      }

      lastErrors.push(errorMsg);
      console.log(`\n🔄 Retrying with error feedback...`);
    }
  }

  throw new Error('Unreachable');
};

/**
 * Build category-aware batch prompt
 */
function buildBatchPrompt(
  goalTitle: string,
  goalType: string,
  postCount: number,
  quotas: Array<{ pattern: FlairType; count: number }>,
  excludedDetails?: {
    therapists?: string[];
    medications?: string[];
    therapyTypes?: string[];
    apps?: string[];
  }
): string {

  const category = getGoalCategory(goalTitle);
  const categoryConfig = getCategoryConfig(category);

  const exclusionSection = excludedDetails ? `
🚫🚫🚫 MANDATORY EXCLUSIONS - VIOLATION = REJECTION 🚫🚫🚫

This is the SECOND batch. The first batch already used these therapy types:
${excludedDetails.therapyTypes && excludedDetails.therapyTypes.length > 0 ? `\n❌ DO NOT USE: ${excludedDetails.therapyTypes.join(', ')}\n` : ''}
YOU ARE FORBIDDEN FROM USING THESE THERAPY TYPES.

Instead, use ONLY these therapy types that were NOT used in Batch 1:
✅ CBT (Cognitive Behavioral Therapy)
✅ IFS (Internal Family Systems)
✅ ERP (Exposure and Response Prevention)
✅ Narrative Therapy
✅ Humanistic Therapy
✅ Gestalt Therapy
✅ Schema Therapy
✅ Mindfulness-Based Cognitive Therapy (MBCT)

${excludedDetails.therapists && excludedDetails.therapists.length > 0 ? `\n❌ Therapist names already used: ${excludedDetails.therapists.join(', ')} - use DIFFERENT names\n` : ''}
${excludedDetails.medications && excludedDetails.medications.length > 0 ? `\n❌ Medications already used: ${excludedDetails.medications.join(', ')} - use DIFFERENT medications\n` : ''}
${excludedDetails.apps && excludedDetails.apps.length > 0 ? `\n❌ Apps already used: ${excludedDetails.apps.join(', ')} - use DIFFERENT apps\n` : ''}

CRITICAL: If you use ANY therapy type from the "DO NOT USE" list above, the entire batch will be REJECTED.

---

` : '';

  const baseInstructions = `You are generating authentic peer-to-peer posts for the WWFM community.

${exclusionSection}

CRITICAL: This must feel like it was written by real people who actually experienced this goal, NOT AI-generated advice.

GOAL: "${goalTitle}"
GOAL TYPE: ${goalType}
CATEGORY: ${category}

🚨🚨🚨 ANTI-REPETITION RULES - FAILURE = REJECTION 🚨🚨🚨

You will generate ${postCount} posts. Each post MUST have UNIQUE details.

NEVER REPEAT ACROSS THE BATCH:
❌ NEVER use the same therapist/doctor name twice (e.g., if Post 1 has "Dr. Sarah Chen", NO other post can mention Dr. Sarah Chen)
❌ NEVER use the same medication+dosage combination twice (e.g., if Post 1 has "Lexapro 10mg", NO other post can use Lexapro 10mg)
❌ NEVER use the same therapy type more than ONCE (e.g., if Post 1 mentions "CBT", NO other post should mention CBT - use DBT, ACT, EMDR, psychodynamic, somatic, etc.)
❌ NEVER use the same app name more than ONCE (e.g., Headspace, Calm, Insight Timer - use different ones)
❌ NEVER use the same exact cost more than ONCE (e.g., vary therapy session costs: $120, $150, $175, $200)

EXAMPLE OF VIOLATION (DO NOT DO THIS):
Post 1: "Dr. Anya Sharma", "CBT", "Lexapro 10mg"
Post 2: "Dr. Anya Sharma", "ACT", "Zoloft 50mg"  ❌ WRONG - repeated Dr. Anya Sharma
Post 3: "Dr. James Lee", "CBT", "Wellbutrin 150mg"  ❌ WRONG - repeated CBT

CORRECT APPROACH:
Post 1: "Dr. Anya Sharma", "CBT", "Lexapro 10mg"
Post 2: "Dr. James Lee", "ACT", "Zoloft 50mg"  ✅ All unique
Post 3: "Dr. Maria Garcia", "EMDR", "Wellbutrin 150mg"  ✅ All unique

Before finalizing each post, CHECK: "Have I used this therapist name / medication / therapy type in a previous post?" If YES, choose a different one.

${categoryConfig.diversityInstructions}

AUTHENTICITY IS EVERYTHING. Each post will be evaluated on:
1. Specific numbers (exact days, costs, percentages - not rounded)
2. Named products/tools/books/therapists
3. Vulnerability (admitting mistakes, fears, struggles)
4. Non-linear progression (setbacks, plateaus, "got worse before better")
5. Unglamorous details (not Instagram-worthy)
6. First-person "I" perspective (not "you should")
7. ⚠️ MANDATORY PEER DISCLAIMER - EVERY post must include phrases like "worked for me", "everyone's different", "YMMV", "your experience may vary" to avoid sounding preachy
8. Realistic timeframes (not overnight success - mention weeks/months explicitly)
9. Ongoing challenges (not perfect endings - acknowledge what's still hard)
10. Specific costs and trade-offs

MUST INCLUDE 2 of 3 CORE INGREDIENTS:
- Emotional honesty (fear, shame, struggle)
- Specific details (numbers, names, costs)
- Temporal progression (before/during/after with time markers)

AVOID THESE DESTROYERS:
- Vague time ("recently", "a while ago")
- Perfect outcomes
- Motivation clichés ("just believe", "stay positive")
- Expert tone ("you should")
- Generic advice that could come from anywhere

---

GENERATE EXACTLY ${postCount} POSTS with this pattern distribution:
${quotas.map(q => `- ${formatFlairName(q.pattern)}: ${q.count} post${q.count > 1 ? 's' : ''}`).join('\n')}

60% of posts should BLEND two patterns (research finding that blended narratives feel more authentic).
40% should be single-pattern (focused on one narrative type).

${getPatternTemplates()}

---

🚨 FINAL REMINDER BEFORE GENERATING 🚨

Before you write the JSON, remember these CRITICAL rules:
1. Generate EXACTLY ${postCount} posts (not ${postCount + 1}, not ${postCount - 1}, exactly ${postCount})
2. Each post MUST use a DIFFERENT therapy type - TRACK what you've used:
   - If Post 1 uses CBT, Posts 2-${postCount} CANNOT use CBT
   - If Post 2 uses DBT, Posts 3-${postCount} CANNOT use DBT
   - If Post 3 uses ACT, Posts 4-${postCount} CANNOT use ACT
   - Continue this pattern for ALL therapy types
3. Each post MUST use a DIFFERENT therapist name - no repeats
4. Each post MUST include a peer disclaimer ("worked for me", "YMMV", "everyone's different")

---

🚨 JSON OUTPUT FORMAT 🚨

Return a JSON array with EXACTLY ${postCount} posts - NO MORE, NO LESS.

⚠️ COUNT ENFORCEMENT: The array MUST contain exactly ${postCount} objects. Not ${postCount - 1}, not ${postCount + 1}, not ${postCount + 3}. Exactly ${postCount}.

Each post object must have this structure:
{
  "content": "the full post content (250-500 words)",
  "flairTypes": ["pattern_type"] or ["pattern_type_1", "pattern_type_2"] for blended,
  "metadata": {
    "patterns_used": ["pattern_type"],
    "word_count": number,
    "authenticity_markers": ["marker1", "marker2", ...]
  }
}

Valid flair types: "what_to_expect", "mindset_shift", "lessons_learned", "my_story", "practical_tips"

Return ONLY the JSON array. No markdown code blocks, no explanations, just the raw JSON array starting with [ and ending with ].`;

  return baseInstructions;
}

/**
 * Build retry prompt with error feedback
 */
function buildRetryPrompt(
  goalTitle: string,
  goalType: string,
  postCount: number,
  quotas: Array<{ pattern: FlairType; count: number }>,
  errors: string[],
  excludedDetails?: {
    therapists?: string[];
    medications?: string[];
    therapyTypes?: string[];
    apps?: string[];
  }
): string {

  return `RETRY GENERATION - Previous attempt had issues:

ERRORS TO FIX:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

⚠️ CRITICAL: Fix the above errors while maintaining high authenticity.

${buildBatchPrompt(goalTitle, goalType, postCount, quotas, excludedDetails)}`;
}

/**
 * Parse posts from JSON response
 */
function parsePostsFromJSON(response: string, expectedCount: number): GeneratedPost[] {
  // Remove markdown code blocks if present
  let cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Sometimes AI adds explanation before JSON - extract just the array
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    cleaned = arrayMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    if (parsed.length !== expectedCount) {
      console.warn(`⚠️ Expected ${expectedCount} posts but got ${parsed.length}`);
    }

    // Validate each post structure
    const validatedPosts = parsed.map((post, index) => {
      if (!post.content) {
        throw new Error(`Post ${index + 1} missing 'content' field`);
      }
      if (!post.flairTypes || !Array.isArray(post.flairTypes)) {
        throw new Error(`Post ${index + 1} missing or invalid 'flairTypes' field`);
      }
      if (!post.metadata) {
        post.metadata = {
          patterns_used: post.flairTypes,
          word_count: post.content.split(/\s+/).length,
          authenticity_markers: []
        };
      }

      return post as GeneratedPost;
    });

    return validatedPosts;

  } catch (error) {
    throw new Error(`JSON parsing failed: ${error instanceof Error ? error.message : String(error)}\n\nResponse preview: ${cleaned.substring(0, 500)}...`);
  }
}

/**
 * Get pattern templates for prompt
 */
function getPatternTemplates(): string {
  return `
## PATTERN TEMPLATES

### Pattern 1: Timeline Reality / Progress Milestones (what_to_expect)

⚠️ CRITICAL: This pattern MUST be structured around discrete timeline checkpoints, not a flowing narrative.

**REQUIRED FORMAT:**

**[Exact number] [time unit] [achievement]**

[1-2 sentence opening - humble acknowledgment]

**Week 1-2: [Initial state heading]**
[2-3 sentences describing the first phase with specific symptoms/feelings]

**Week 4-6: [Difficulty heading]** (or Month 2 if longer timeline)
[2-3 sentences about the plateau/purge/setback - this is the hard part]

**Month 3+: [Progress heading]** (or Month 6 if longer timeline)
[2-3 sentences about visible improvements while acknowledging what remains]

**What Helped:**
- [Named tool 1] ($X cost/frequency)
- [Named tool 2] (dosage/specs)
- [Named tool 3] ($Y/timeframe)

**Still Working On:**
[1-2 sentences about ongoing challenges]

[Closing encouragement - 1 sentence]

**Example:**
"**73 Days Managing My Anxiety**

Humbled I made it this far. Never thought I'd last 10 weeks.

**Week 1-2: The Impossible Beginning**
Panic attacks were daily, sometimes multiple times a day. Couldn't go to the grocery store alone, heart racing at the thought. Sleep was 4-5 hours max, waking up drenched in sweat at 2:47 AM most nights.

**Week 4-6: The Plateau (and Purge)**
This was brutal. Lexapro side effects peaked - nausea every morning, felt emotionally numb. Therapy sessions were $175 each and I questioned if it was working. Almost quit twice.

**Month 3+: Small Wins Adding Up**
Panic attacks down to 2-3 times a week, not daily. Can grocery shop alone most days now. Sleep improved to 6-7 hours consistently. Still avoid crowded bars though.

**What Helped:**
- CBT therapy with Dr. Sarah Chen ($175/session, weekly)
- Lexapro 10mg (took 6 weeks to kick in)
- Calm app breathing exercises ($70/year, use daily)
- Morning walks (20min, helps reset)

**Still Working On:**
Crowded places still trigger me sometimes. Social anxiety at parties is better but not gone.

If I can make it 73 days with daily panic attacks, there's hope for you too. Progress isn't linear."

---

### Pattern 2: Mindset Shift That Enabled Success (mindset_shift)

**STRUCTURE (200-350 words):**

1. **Old belief statement:**
   "I used to believe [specific limiting belief]"

2. **Consequences (1-2 sentences):**
   How this thinking held you back

3. **Catalyst (must be specific):**
   "Everything changed when [specific trigger]"
   Options: therapist said X, read book Y, hit rock bottom, friend pointed out

4. **New belief:**
   "Now I understand that [reframed belief]"
   Often contradicts old belief

5. **Behavioral shift:**
   "Because of this shift, I now [specific action]"

6. **Results:**
   "This has helped me [outcome]"

7. **Ongoing work (optional):**
   "I still catch myself [old pattern], but I remind myself [new frame]"

**Example:**
"I used to think anxiety meant I was weak and broken. This kept me from seeking help for 3 years, suffering in silence.

Everything changed when my therapist said 'Anxiety isn't insanity—it's a recognized medical condition.' Such a simple statement but it cracked something open.

Now I see anxiety as my brain's overprotective alarm system, not a character flaw. It's trying to keep me safe, just overdoing it.

Because of this shift, I now tell people when I'm anxious instead of hiding it, and I take medication without shame. This acceptance allowed me to actually get treatment and manage symptoms instead of just white-knuckling through life.

I still catch myself thinking 'what's wrong with me?' during panic attacks, but I remind myself—nothing's wrong, my alarm system is just too sensitive. And that's fixable."

---

### Pattern 3: What I Learned / Common Mistakes (lessons_learned)

**STRUCTURE (300-500 words):**

1. **Credibility opener:**
   "[Time period] [achieving goal] taught me [#] hard lessons"

2. **Framing:**
   "Mistakes I made so you don't have to:"

3. **Lessons (3-5 lessons):**
   Each with:
   - What I did wrong
   - Why it failed
   - What actually works

4. **Closing wisdom:**
   Key takeaway

---

### Pattern 4: Journey Narrative (my_story)

**STRUCTURE (350-600 words):**

1. **Rock bottom moment** (specific, vulnerable)
2. **Decision point** (what made me try)
3. **The journey** (setbacks, surprises, turning points)
4. **Where I am now** (progress + ongoing challenges)
5. **Looking back** (what I'd tell myself)

---

### Pattern 5: Tactical Tips (practical_tips)

**STRUCTURE (200-400 words):**

1. **Context:** Why these tips matter
2. **Actionable tips (3-5):** Specific, implementable
3. **Common pitfalls:** What doesn't work
4. **Final encouragement**
`;
}

/**
 * Format flair name for display
 */
function formatFlairName(flair: FlairType): string {
  const names: Record<FlairType, string> = {
    'what_to_expect': 'Timeline Reality',
    'mindset_shift': 'Mindset Shift',
    'lessons_learned': 'Lessons Learned',
    'my_story': 'Journey Narrative',
    'practical_tips': 'Tactical Tips'
  };
  return names[flair] || flair;
}

/**
 * Extract used details from posts for exclusion in next batch
 */
export function extractUsedDetails(posts: GeneratedPost[]): {
  therapists: string[];
  medications: string[];
  therapyTypes: string[];
  apps: string[];
} {
  const therapists = new Set<string>();
  const medications = new Set<string>();
  const therapyTypes = new Set<string>();
  const apps = new Set<string>();

  posts.forEach(post => {
    const content = post.content;

    // Extract therapist names (Dr. [Name] pattern)
    const therapistMatches = content.match(/Dr\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g);
    if (therapistMatches) {
      therapistMatches.forEach(name => therapists.add(name));
    }

    // Extract therapy types
    const therapyPatterns = [
      /\bCBT\b/gi,
      /\bDBT\b/gi,
      /\bACT\b/gi,
      /\bEMDR\b/gi,
      /\bpsychodynamic\b/gi,
      /\bsomatic\b/gi,
      /\bIFS\b/gi,
      /\bERP\b/gi,
      /\bnarrative therapy\b/gi,
      /\bhumanistic\b/gi,
      /\bexposure therapy\b/gi
    ];
    therapyPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => therapyTypes.add(match.toUpperCase()));
      }
    });

    // Extract medications (pattern: word + dosage)
    const medMatches = content.match(/\b[A-Z][a-z]+(?:ol|ex|in|am|one|ide|ate|ine|pam)\s+\d+\s*(?:mg|mcg|IU)/gi);
    if (medMatches) {
      medMatches.forEach(med => medications.add(med));
    }

    // Extract apps
    const appPatterns = [
      /\bCalm\b/gi,
      /\bHeadspace\b/gi,
      /\bBetterHelp\b/gi,
      /\bTalkspace\b/gi,
      /\bInsight Timer\b/gi,
      /\bSanvello\b/gi,
      /\bMindshift\b/gi
    ];
    appPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => apps.add(match));
      }
    });
  });

  return {
    therapists: Array.from(therapists),
    medications: Array.from(medications),
    therapyTypes: Array.from(therapyTypes),
    apps: Array.from(apps)
  };
}
