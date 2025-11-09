/**
 * Main Generation Engine for AI-Synthesized Narrative Commentary
 *
 * Uses Gemini AI to generate authentic-feeling peer commentary following
 * the 5 research-validated patterns.
 */

import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  FlairType,
  PatternIngredients,
  GeneratedPost,
  getRecommendedPatterns
} from './pattern-templates';
import { validateAuthenticity, checkDestroyersAuthenticity, generateQualityReport } from './quality-validator';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
  generationConfig: {
    temperature: 0.9, // Higher temperature for more creative, varied output
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048
  }
});

/**
 * Generate commentary for a specific pattern
 */
export const generateCommentary = async (
  pattern: FlairType,
  ingredients: PatternIngredients,
  maxRetries: number = 3
): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  // Get pattern-specific prompt
  const prompt = buildPromptForPattern(pattern, ingredients);

  let attempts = 0;
  let bestAttempt: GeneratedPost | null = null;
  let bestScore = 0;

  while (attempts < maxRetries) {
    attempts++;

    try {
      // Generate content with Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Validate authenticity
      const validation = validateAuthenticity(content);
      const destroyers = checkDestroyersAuthenticity(content);

      // Check if this is good enough
      if (validation.passed && destroyers.severity !== 'major') {
        return {
          content,
          flairTypes: [pattern],
          metadata: {
            patterns_used: [pattern],
            word_count: content.split(/\s+/).length,
            authenticity_markers: validation.details
              .filter(d => d.passed)
              .map(d => d.criterion)
          }
        };
      }

      // Track best attempt
      if (validation.score > bestScore) {
        bestScore = validation.score;
        bestAttempt = {
          content,
          flairTypes: [pattern],
          metadata: {
            patterns_used: [pattern],
            word_count: content.split(/\s+/).length,
            authenticity_markers: validation.details
              .filter(d => d.passed)
              .map(d => d.criterion)
          }
        };
      }

      // If not good enough, regenerate with feedback
      console.log(`Attempt ${attempts}: Score ${validation.score}/10, Destroyers: ${destroyers.severity}`);

    } catch (error) {
      console.error(`Generation attempt ${attempts} failed:`, error);
      if (attempts === maxRetries) throw error;
    }
  }

  // Return best attempt if we didn't get a perfect one
  if (bestAttempt) {
    console.warn(`Using best attempt with score ${bestScore}/10`);
    return bestAttempt;
  }

  throw new Error(`Failed to generate authentic content after ${maxRetries} attempts`);
};

/**
 * Generate blended pattern commentary
 */
export const generateBlendedCommentary = async (
  pattern1: FlairType,
  pattern2: FlairType,
  ingredients: PatternIngredients,
  maxRetries: number = 3
): Promise<GeneratedPost> => {
  const prompt = buildBlendedPrompt(pattern1, pattern2, ingredients);

  let attempts = 0;
  let bestAttempt: GeneratedPost | null = null;
  let bestScore = 0;

  while (attempts < maxRetries) {
    attempts++;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const validation = validateAuthenticity(content);
      const destroyers = checkDestroyersAuthenticity(content);

      if (validation.passed && destroyers.severity !== 'major') {
        return {
          content,
          flairTypes: [pattern1, pattern2],
          metadata: {
            patterns_used: [pattern1, pattern2],
            word_count: content.split(/\s+/).length,
            authenticity_markers: validation.details
              .filter(d => d.passed)
              .map(d => d.criterion)
          }
        };
      }

      if (validation.score > bestScore) {
        bestScore = validation.score;
        bestAttempt = {
          content,
          flairTypes: [pattern1, pattern2],
          metadata: {
            patterns_used: [pattern1, pattern2],
            word_count: content.split(/\s+/).length,
            authenticity_markers: validation.details
              .filter(d => d.passed)
              .map(d => d.criterion)
          }
        };
      }

      console.log(`Blended attempt ${attempts}: Score ${validation.score}/10`);

    } catch (error) {
      console.error(`Blended generation attempt ${attempts} failed:`, error);
      if (attempts === maxRetries) throw error;
    }
  }

  if (bestAttempt) {
    console.warn(`Using best blended attempt with score ${bestScore}/10`);
    return bestAttempt;
  }

  throw new Error(`Failed to generate blended content after ${maxRetries} attempts`);
};

/**
 * Build prompt for a specific pattern
 */
const buildPromptForPattern = (pattern: FlairType, ingredients: PatternIngredients): string => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const baseInstructions = `You are generating a peer-to-peer post for the WWFM community.

CRITICAL: This must feel like it was written by a real person who actually experienced this goal, NOT AI-generated advice.

Goal: "${goalTitle}"
Goal Type: ${goalType}
${solutionContext ? `Focus on: ${solutionContext}` : ''}

AUTHENTICITY IS EVERYTHING. You will be evaluated on:
1. Specific numbers (exact days, costs, percentages - not rounded)
2. Named products/tools/books/therapists
3. Vulnerability (admitting mistakes, fears, struggles)
4. Non-linear progression (setbacks, plateaus, "got worse before better")
5. Unglamorous details (not Instagram-worthy)
6. First-person "I" perspective (not "you should")
7. Peer disclaimers ("worked for me", "everyone's different")
8. Realistic timeframes (not overnight success)
9. Ongoing challenges (not perfect endings)
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
`;

  const patternPrompts: Record<FlairType, string> = {
    what_to_expect: `${baseInstructions}

PATTERN: Timeline Reality / Progress Milestones

STRUCTURE (250-400 words):
1. Milestone header: "[Exact number] [time unit] [achievement]"
   Example: "73 Days Managing Anxiety" or "6 Months into Therapy"

2. Opening (1-2 sentences): Humble acknowledgment
   Example: "Humbled I made it this far" or "Can't believe I stuck with it"

3. What's different (3-5 specific changes):
   Physical/mental/emotional changes with specifics
   Example: "Panic attacks down from daily to 2-3 times a week, can now grocery shop alone, sleep improved from 4 hours to 6-7 hours"

4. Timeline breakdown:
   - Week 1-2: [Initial state] - Be specific about symptoms/feelings
   - Week 4-6 OR Month 2: [The hard part] - The plateau, purge phase, or setback
   - Month 3+: [Visible improvements] - What got better, but acknowledge what remains

5. What helped (2-4 specific interventions):
   Name tools, costs, frequency
   Example: "CBT therapy $150/session weekly, Lexapro 10mg, Calm app $70/year, journaling 10min daily"

6. Ongoing struggles (1-2 sentences):
   What's still challenging
   Example: "Crowded places still trigger me sometimes" or "Sleep isn't perfect yet"

7. Closing: Encouragement to others
   Example: "If I can do this, there's hope for you too"

REMEMBER: Include specific numbers, named tools, acknowledge setbacks, ongoing challenges.`,

    mindset_shift: `${baseInstructions}

PATTERN: Mindset Shift That Enabled Success

STRUCTURE (200-350 words):
1. Old belief statement:
   "I used to believe [specific limiting belief]"
   Example: "I used to think anxiety meant I was weak and broken"

2. Consequences (1-2 sentences):
   How this thinking held you back
   Example: "This kept me from seeking help for 3 years, suffering in silence"

3. Catalyst (must be specific):
   "Everything changed when [specific trigger]"
   Options: therapist said X, read book Y, hit rock bottom, friend pointed out
   Example: "My therapist said 'Anxiety isn't insanity—it's a recognized medical condition'"

4. New belief:
   "Now I understand that [reframed belief]"
   Often contradicts old belief
   Example: "Now I see anxiety as my brain's overprotective alarm system, not a character flaw"

5. Behavioral shift:
   "Because of this shift, I now [specific action]"
   Example: "I now tell people when I'm anxious instead of hiding it, and I take medication without shame"

6. Results:
   "This has helped me [outcome]"
   Example: "This acceptance allowed me to actually get treatment and manage symptoms"

7. Ongoing work (optional):
   "I still catch myself [old pattern], but I remind myself [new frame]"

REMEMBER: Name the source of the shift, show behavioral change, acknowledge it's ongoing practice.`,

    lessons_learned: `${baseInstructions}

PATTERN: What I Learned / Common Mistakes

STRUCTURE (300-500 words):
1. Credibility opener:
   "[Time period] [achieving goal] taught me [#] hard lessons"
   Example: "18 months managing anxiety taught me 3 crucial lessons the hard way"

2. Framing:
   "Mistakes I made so you don't have to:"

3. Mistake #1:
   **[Category/Name]**
   - What I did: [Specific action]
   - Why I did it: [Relatable reasoning - impatience, misinformation, desperation]
   - What happened: [Negative consequence with metrics if possible]
   - Do this instead: [Corrected approach]

   Example:
   **Stopping Medication Too Early**
   - What I did: Quit Lexapro after 3 weeks because I felt better
   - Why: I thought I was "cured" and didn't want to depend on medication
   - What happened: Crashed hard 2 weeks later, lost all progress, back to square one
   - Do this instead: Stay on medication for at least 6 months per doctor recommendation

4. Mistake #2: [Same structure]

5. Mistake #3: [Same structure]

6. Pattern-breaking insight (optional):
   Counterintuitive lesson
   Example: "Quick fixes don't work—what worked was slow and unsexy"

7. Encouragement with caveat:
   Example: "These lessons took me months to learn. Hope they save you some pain."

REMEMBER: Specific mistakes with costs, self-deprecating tone, corrected approaches, vulnerability.`,

    my_story: `${baseInstructions}

PATTERN: Journey Narrative (Rock Bottom to Recovery)

STRUCTURE (400-700 words):
1. Opening hook:
   Option A: "Today I [positive reality] but [time ago] I [low point]"
   Option B: Start with rock bottom scene

2. Backstory (2-4 sentences):
   How you got there
   - Early signs ignored
   - Gradual worsening
   - Failed attempts or denial

3. Rock bottom scene (100-150 words - MOST IMPORTANT):
   Vivid, specific moment
   - Time/place: "3:23am, alone in my apartment"
   - Physical state: "Heart racing, couldn't breathe, convinced I was dying"
   - Emotional: "Terrified, ashamed, desperate"
   - Thought: "I can't live like this anymore"

   Use sensory details, be uncomfortably specific

4. Turning point:
   "[Specific moment] I [decision]"
   What made THIS attempt different
   Example: "After my 4th panic attack that week, I finally called a therapist"

5. Action taken:
   Specific treatment path with timeline
   Example: "Started CBT therapy $150/week, added Lexapro 10mg after month 2, joined support group"
   Include what it cost (time, money, relationships)

6. Messy middle:
   Not linear progress
   Example: "Month 3: Almost quit therapy when progress plateaued. Medication made me nauseous for weeks."

7. Current state:
   What's different, what remains challenging
   Example: "I can now leave my house without panic. Still avoid crowded places sometimes, but I'm living again."

8. Message to reader:
   Direct encouragement with realism
   Example: "Recovery is possible, but it's not linear or perfect. Clench your teeth and keep going."

REMEMBER: Vivid low point, raw honesty, specific treatment details, ongoing challenges.`,

    practical_tips: `${baseInstructions}

PATTERN: Practical Tips Compilation

STRUCTURE (400-800 words):
1. Title/opening:
   "[#] Tips for ${goalTitle}"
   Context (2-3 sentences) acknowledging the challenge

2. Category 1: [Problem area]
   • Tip 1: [Specific action/tool with product name]
   • Tip 2: [Specific action/tool]
   • Tip 3: [Specific action/tool with cost if applicable]

3. Category 2: [Another problem area]
   • Tip 1: [Specific action/tool]
   • Tip 2: [Specific action/tool]
   • Tip 3: [Specific action/tool]

4. Category 3: [Another problem area]
   • Tip 1: [Specific action/tool]
   • Tip 2: [Specific action/tool]

5. Caveat section:
   "Important reminders:"
   - "Everyone's different—not every tip will fit"
   - "Try a few, see what sticks"
   - "YMMV (your mileage may vary)"

6. Closing encouragement

EXAMPLES OF GOOD TIPS:
- "Calm app ($70/year) for guided meditation - 10min daily made huge difference for me"
- "Keep anxiety medication next to coffee pot so I never forget morning dose"
- "Sticky notes with coping strategies on bathroom mirror"
- "Text 988 for crisis support - saved me twice"

REMEMBER: Specific product names, costs, unglamorous tactics, peer disclaimers, variety of options.`
  };

  return patternPrompts[pattern];
};

/**
 * Build prompt for blended patterns
 */
const buildBlendedPrompt = (
  pattern1: FlairType,
  pattern2: FlairType,
  ingredients: PatternIngredients
): string => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const blendingStrategies: Record<string, string> = {
    'lessons_learned+what_to_expect': 'Interwoven: Mistakes appear at relevant timeline points ("Week 2 I made this mistake...")',
    'mindset_shift+my_story': 'The mindset shift IS the turning point in the journey narrative',
    'practical_tips+what_to_expect': 'Tips introduced as they become relevant at each timeline stage',
    'lessons_learned+mindset_shift': 'Each mistake reveals a limiting belief that needed changing',
    'lessons_learned+my_story': 'Journey narrative with lessons extracted at key moments',
  };

  const comboKey = [pattern1, pattern2].sort().join('+');
  const strategy = blendingStrategies[comboKey] || 'Natural blending with smooth transitions';

  return `You are generating a peer-to-peer post that BLENDS two patterns naturally.

Goal: "${goalTitle}"
Goal Type: ${goalType}
${solutionContext ? `Focus on: ${solutionContext}` : ''}

PRIMARY PATTERN: ${pattern1}
SECONDARY PATTERN: ${pattern2}

BLENDING STRATEGY: ${strategy}

CRITICAL: The two patterns must feel NATURALLY interwoven, NOT like two separate posts stuck together.

AUTHENTICITY REQUIREMENTS:
✓ Must include 2 of 3 core ingredients: emotional honesty, specific details, temporal progression
✓ Pass 7+ items on 10-point checklist:
  1. Specific numbers (time, cost, percentage)
  2. Named tools/products
  3. Admits mistake, fear, or struggle
  4. Shows non-linear progression
  5. Unglamorous details
  6. First-person experience
  7. Peer disclaimers ("worked for me")
  8. Time investment mentioned
  9. Ongoing work acknowledged
  10. Specific costs/trade-offs

AVOID:
✗ Vague time references
✗ Perfect outcomes
✗ Motivation clichés
✗ Expert tone ("you should")
✗ Template-like structure

Length: 350-600 words
Tone: Authentic peer-to-peer, naturally blending both patterns

Generate the blended post now:`;
};

/**
 * Generate a batch of posts for a goal with recommended pattern mix
 */
export const generatePostBatch = async (
  goalTitle: string,
  goalType: PatternIngredients['goalType'],
  postCount: number = 8
): Promise<GeneratedPost[]> => {
  const recommendations = getRecommendedPatterns(goalType);
  const posts: GeneratedPost[] = [];

  // 40% single pattern, 60% blended
  const singleCount = Math.floor(postCount * 0.4);
  const blendedCount = postCount - singleCount;

  console.log(`Generating ${postCount} posts: ${singleCount} single-pattern, ${blendedCount} blended`);

  // Generate single-pattern posts
  for (let i = 0; i < singleCount; i++) {
    const pattern = recommendations.primary[i % recommendations.primary.length];
    console.log(`\nGenerating single-pattern post ${i + 1}: ${pattern}`);

    const post = await generateCommentary(pattern, { goalTitle, goalType });
    posts.push(post);

    // Brief delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate blended posts
  for (let i = 0; i < blendedCount; i++) {
    const pattern1 = recommendations.primary[i % recommendations.primary.length];
    const pattern2 = recommendations.secondary?.[0] || recommendations.primary[(i + 1) % recommendations.primary.length];

    console.log(`\nGenerating blended post ${i + 1}: ${pattern1} + ${pattern2}`);

    const post = await generateBlendedCommentary(pattern1, pattern2, { goalTitle, goalType });
    posts.push(post);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return posts;
};
