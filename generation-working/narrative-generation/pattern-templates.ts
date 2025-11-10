/**
 * Pattern Templates for AI-Generated Narrative Commentary
 *
 * Based on research identifying 5 high-frequency patterns in peer commentary.
 * Each pattern has specific ingredients and structure to ensure authenticity.
 */

export type FlairType =
  | 'what_to_expect'      // Pattern 1: Timeline Reality
  | 'mindset_shift'       // Pattern 2: Mindset Shifts
  | 'lessons_learned'     // Pattern 3: Mistakes/Learned
  | 'my_story'            // Pattern 4: Journey Narrative
  | 'practical_tips';     // Pattern 5: Tactical Tips

export interface PatternIngredients {
  goalTitle: string;
  goalType: 'mental_health' | 'physical_health' | 'career' | 'finance' | 'relationships';
  solutionContext?: string; // Optional: specific solution to focus on
  targetLength?: number;
}

export interface GeneratedPost {
  content: string;
  flairTypes: FlairType[];
  metadata: {
    patterns_used: string[];
    word_count: number;
    authenticity_markers: string[];
  };
}

/**
 * Pattern 1: Timeline Reality / Progress Milestones
 * Frequency: 45-60% | Best for: Physical health, finance, substance recovery
 * Length: 250-400 words
 */
export const generateTimelineReality = async (ingredients: PatternIngredients): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  // This will be implemented with AI generation
  // Template structure:
  // 1. Milestone header with exact numbers
  // 2. Opening emotion (humble acknowledgment)
  // 3. Physical/mental changes (3-5 specific)
  // 4. Timeline breakdown (Week 1 vs Week 6 vs Month 3)
  // 5. What helped (2-4 specific interventions with costs)
  // 6. Ongoing struggles
  // 7. Community closing

  const prompt = `Generate a peer-to-peer post following the "Timeline Reality" pattern for the goal: "${goalTitle}".

CRITICAL AUTHENTICITY REQUIREMENTS:
1. Use EXACT time markers (not "a few months" but "73 days" or "6 months")
2. Include specific numbers, costs, and product names
3. Show non-linear progression (plateaus, setbacks, "got worse before better")
4. Include ongoing struggles (never perfect ending)
5. First-person perspective with emotional honesty

STRUCTURE:
- Milestone header: "[Exact number] [time unit] [achievement]"
- Opening: Humble acknowledgment (1-2 sentences)
- Changes: What's different now vs. start (3-5 specific changes)
- Timeline breakdown:
  * Week 1-2: [initial state/symptoms]
  * Week 4-6 or Month 2: [the hard part, purge, plateau]
  * Month 3+: [improvements visible]
- What helped: 2-4 specific tools/practices with names and costs
- Struggles: Ongoing challenges or context (1-2 sentences)
- Closing: Community encouragement

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY CHECKLIST (must include):
- At least 3 specific numbers (time, cost, percentage)
- At least 2 named tools/products
- At least 1 mistake or struggle admission
- Non-linear progression acknowledgment
- Ongoing work/imperfection acknowledgment

Length: 250-400 words
Tone: Humble pride, cautious optimism, gratitude mixed with realism`;

  return {
    content: '', // Will be filled by AI generation
    flairTypes: ['what_to_expect'],
    metadata: {
      patterns_used: ['timeline_reality'],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Pattern 2: Mindset Shifts That Enabled Success
 * Frequency: 55-70% | Best for: Mental health, career pivots, financial mindset
 * Length: 200-350 words
 */
export const generateMindsetShift = async (ingredients: PatternIngredients): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const prompt = `Generate a peer-to-peer post following the "Mindset Shift" pattern for the goal: "${goalTitle}".

CRITICAL AUTHENTICITY REQUIREMENTS:
1. State the OLD belief explicitly ("I used to think...")
2. Specific catalyst for change (not vague "I realized")
3. NEW belief stated clearly (often contradicts old belief)
4. Concrete behavioral change from new thinking
5. Emotional honesty about difficulty

STRUCTURE:
- Old belief: "I used to believe [specific limiting belief]"
- Consequences: How this thinking held me back (1-2 sentences)
- Catalyst: "Everything changed when [specific trigger/source]"
  * Must be specific: therapist said X, read book Y, hit rock bottom, etc.
- New belief: "Now I understand that [reframed belief]"
- Behavioral shift: "Because of this shift, I now [specific action]"
- Results: "This has helped me [outcome]"
- Ongoing work: "I still catch myself [old pattern], but I remind myself [new frame]"

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY CHECKLIST (must include):
- Specific old belief that's relatable
- Named source for shift (therapist, book, person, experience)
- Admits shift was hard/took time
- Shows both sides (still struggle sometimes)
- Observable behavioral change

Length: 200-350 words
Tone: Gentle wisdom, protective, matter-of-fact about struggle, hopeful but not preachy`;

  return {
    content: '',
    flairTypes: ['mindset_shift'],
    metadata: {
      patterns_used: ['mindset_shift'],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Pattern 3: What I Learned / Common Mistakes
 * Frequency: 40-55% | Best for: Career, finance, skill learning, protocols
 * Length: 300-500 words
 */
export const generateLessonsLearned = async (ingredients: PatternIngredients): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const prompt = `Generate a peer-to-peer post following the "Lessons Learned" pattern for the goal: "${goalTitle}".

CRITICAL AUTHENTICITY REQUIREMENTS:
1. Specific mistakes described (not "I made errors")
2. Why each mistake was made (makes error relatable)
3. Consequences quantified (time/money lost)
4. Corrected approach stated clearly
5. Self-deprecating or humble tone

STRUCTURE:
- Credibility opener: "[Time period] [achieving goal] taught me [#] hard lessons"
- Framing: "Things I wish I knew when starting:" or "Mistakes I made so you don't have to:"
- Mistake #1:
  * What I did: [Specific action]
  * Why I did it: [Relatable reasoning - impatience, misinformation, desperation]
  * What happened: [Negative consequence with metrics]
  * Do this instead: [Corrected approach]
- Mistake #2: [same structure]
- Mistake #3: [same structure]
- Optional: Pattern-breaking insight (counterintuitive lesson)
- Encouragement: "[Hope message with caveat]"

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY CHECKLIST (must include):
- At least 3 specific mistakes
- Cost quantification ($X wasted, Y months lost)
- Self-deprecating admission or humor
- "Why I did it" context for each mistake
- Specific corrected approaches

Length: 300-500 words
Tone: Peer-to-peer, humble, protective ("don't do what I did"), occasionally self-deprecating`;

  return {
    content: '',
    flairTypes: ['lessons_learned'],
    metadata: {
      patterns_used: ['lessons_learned'],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Pattern 4: Detailed Journey Narrative (Rock Bottom to Recovery)
 * Frequency: 25-40% | Best for: Mental health recovery, addiction, major pivots
 * Length: 400-700 words
 */
export const generateMyStory = async (ingredients: PatternIngredients): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const prompt = `Generate a peer-to-peer post following the "Journey Narrative" pattern for the goal: "${goalTitle}".

CRITICAL AUTHENTICITY REQUIREMENTS:
1. Vivid low point scene with sensory details
2. Raw emotional honesty (shame, fear, hopelessness)
3. Specific turning point moment
4. Treatment path with timeline (not vague "got help")
5. Ongoing challenges acknowledged

STRUCTURE:
- Opening hook: Current state first OR rock bottom first
- Backstory: How did I get there (2-4 sentences)
  * Early signs ignored
  * Gradual worsening
  * Denial or failed attempts
- Rock bottom scene (100-150 words - the emotional anchor):
  * Time/place details (3:23am, specific location)
  * Physical state description
  * Emotional reality
  * Thought process or internal dialogue
- Turning point: "[Specific moment] I [decision/realization]"
  * What made this attempt different
  * Often "last resort" or "had no choice"
- Action taken: "I started [specific treatment/practice]"
  * Name therapist type, medication, program
  * Timeline (started X, added Y at month 3)
  * What it cost (time, money, relationships)
- Messy middle: "[Struggle during recovery]"
  * Not linear progress
  * Setbacks or surprises
  * What almost derailed it
- Current state: "[What's different now]"
  * Physical/mental changes
  * Life activities possible now
  * What remains challenging
  * Ongoing practices
- Message to reader: "[Direct encouragement with realism]"

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY CHECKLIST (must include):
- Uncomfortably specific low point details
- Physical symptom details or visceral descriptions
- Admission of self-deception
- Multiple attempts or relapses mentioned
- Grief for time lost
- Ongoing challenges acknowledged

Length: 400-700 words
Tone: Raw → protective, vulnerable → earned hope, honest about difficulty`;

  return {
    content: '',
    flairTypes: ['my_story'],
    metadata: {
      patterns_used: ['my_story'],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Pattern 5: Tactical Tip Compilations (Crowdsourced Wisdom)
 * Frequency: 15-30% | Best for: ADHD, productivity, protocols, organization
 * Length: 400-800 words
 */
export const generatePracticalTips = async (ingredients: PatternIngredients): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  const prompt = `Generate a peer-to-peer post following the "Practical Tips" pattern for the goal: "${goalTitle}".

CRITICAL AUTHENTICITY REQUIREMENTS:
1. Tips organized by category (3-5 categories)
2. Hyper-specific tactics with product/app names
3. Peer disclaimers ("for me," "YMMV")
4. Acknowledgment of variety (multiple approaches)
5. Cost/accessibility mentioned

STRUCTURE:
- Title/opening: "[#] Tips for [Specific Challenge] from [Experience]"
- Context: Brief acknowledgment of challenge (2-3 sentences)
- Category 1 header: "[Problem area]" (e.g., "Memory & Forgetting")
  * Tip 1: [Specific action/tool]
    - [Product/app name if applicable]
    - [Brief why/how] (optional)
  * Tip 2: [Specific action/tool]
  * Tip 3: [Specific action/tool]
- Category 2 header: [repeat structure]
- Category 3 header: [repeat structure]
- Caveat section: "Important reminders:"
  * "Everyone's different—not every tip will fit your life"
  * "Try a few, see what sticks"
  * "Adapt these to your situation"
- Closing: "[Encouragement]"

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY CHECKLIST (must include):
- Brand names and costs (specific products)
- Unglamorous/silly tactics admitted
- "For me" or "YMMV" disclaimers
- Variety within categories (multiple options)
- Mix of free and paid options

Length: 400-800 words
Tone: Peer-to-peer, conversational, humble, enthusiastic without being preachy`;

  return {
    content: '',
    flairTypes: ['practical_tips'],
    metadata: {
      patterns_used: ['practical_tips'],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Blended Pattern Generation
 * Combines two patterns for higher engagement (research shows 60% of best posts use 2 patterns)
 */
export const generateBlendedPattern = async (
  pattern1: FlairType,
  pattern2: FlairType,
  ingredients: PatternIngredients
): Promise<GeneratedPost> => {
  const { goalTitle, goalType, solutionContext } = ingredients;

  // Define common blending strategies
  const blendingStrategies: Record<string, string> = {
    'what_to_expect+lessons_learned': 'Interwoven: Mistakes appear at relevant timeline points ("Week 2 I made this mistake...")',
    'my_story+mindset_shift': 'The mindset shift IS the turning point in the journey',
    'what_to_expect+practical_tips': 'Tips introduced as they become relevant at each stage',
    'lessons_learned+mindset_shift': 'Each mistake reveals a limiting belief that needed changing',
    'my_story+lessons_learned': 'Journey narrative with lessons extracted at key moments',
  };

  const comboKey = [pattern1, pattern2].sort().join('+');
  const strategy = blendingStrategies[comboKey] || 'Sequential blending with natural transitions';

  const prompt = `Generate a peer-to-peer post that BLENDS two patterns for the goal: "${goalTitle}".

PRIMARY PATTERN: ${pattern1}
SECONDARY PATTERN: ${pattern2}

BLENDING STRATEGY: ${strategy}

CRITICAL: The two patterns should feel naturally interwoven, NOT like two separate posts stuck together.

${solutionContext ? `Focus on this solution/approach: ${solutionContext}` : ''}

AUTHENTICITY REQUIREMENTS (must include):
- At least 2 of 3 core ingredients: emotional honesty, specific details, temporal progression
- Pass 7+ items on 10-point checklist:
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

Length: 350-600 words
Tone: Authentic peer-to-peer, blending tones of both patterns naturally`;

  return {
    content: '',
    flairTypes: [pattern1, pattern2],
    metadata: {
      patterns_used: [pattern1, pattern2],
      word_count: 0,
      authenticity_markers: []
    }
  };
};

/**
 * Get recommended patterns for a goal type
 */
export const getRecommendedPatterns = (goalType: PatternIngredients['goalType']): {
  primary: FlairType[];
  secondary: FlairType[];
  avoid: string[];
} => {
  const recommendations = {
    mental_health: {
      primary: ['mindset_shift', 'my_story'],
      secondary: ['what_to_expect'],
      avoid: ['Toxic positivity', 'Just think positive framing']
    },
    physical_health: {
      primary: ['what_to_expect', 'lessons_learned'],
      secondary: ['practical_tips'],
      avoid: ['Body shaming', 'Unrealistic timelines']
    },
    career: {
      primary: ['lessons_learned', 'mindset_shift'],
      secondary: ['my_story'],
      avoid: ['Follow your passion without logistics', 'Survivorship bias']
    },
    finance: {
      primary: ['what_to_expect', 'my_story', 'lessons_learned'],
      secondary: ['practical_tips'],
      avoid: ['Privilege blindness', 'Extreme frugality shame']
    },
    relationships: {
      primary: ['mindset_shift', 'my_story'],
      secondary: ['lessons_learned'],
      avoid: ['Blame framing', 'Just leave without context']
    }
  };

  return recommendations[goalType];
};

/**
 * Get pattern quotas for batch generation
 * Returns exact counts of each pattern type based on goal type
 */
export const getPatternQuotas = (
  goalType: PatternIngredients['goalType'],
  postCount: number
): Array<{ pattern: FlairType; count: number }> => {

  // Goal-type-specific pattern weights
  const weights: Record<PatternIngredients['goalType'], Record<FlairType, number>> = {
    mental_health: {
      what_to_expect: 0.30,    // Timeline Reality - most universal
      mindset_shift: 0.25,
      my_story: 0.20,
      lessons_learned: 0.15,
      practical_tips: 0.10
    },
    physical_health: {
      what_to_expect: 0.35,
      lessons_learned: 0.25,
      practical_tips: 0.20,
      my_story: 0.15,
      mindset_shift: 0.05
    },
    career: {
      lessons_learned: 0.30,
      mindset_shift: 0.25,
      my_story: 0.20,
      what_to_expect: 0.15,
      practical_tips: 0.10
    },
    finance: {
      what_to_expect: 0.30,
      my_story: 0.25,
      lessons_learned: 0.20,
      practical_tips: 0.15,
      mindset_shift: 0.10
    },
    relationships: {
      mindset_shift: 0.30,
      my_story: 0.25,
      lessons_learned: 0.20,
      what_to_expect: 0.15,
      practical_tips: 0.10
    }
  };

  const goalWeights = weights[goalType];
  const quotas: Array<{ pattern: FlairType; count: number }> = [];

  // Calculate quotas ensuring all patterns are represented and sum equals postCount
  const patterns: FlairType[] = ['what_to_expect', 'mindset_shift', 'lessons_learned', 'my_story', 'practical_tips'];

  let remaining = postCount;
  const calculatedCounts: Record<FlairType, number> = {} as Record<FlairType, number>;

  // First pass: calculate ideal counts
  patterns.forEach(pattern => {
    const idealCount = Math.round(postCount * goalWeights[pattern]);
    const actualCount = Math.max(0, idealCount); // At least 0
    calculatedCounts[pattern] = actualCount;
    remaining -= actualCount;
  });

  // Second pass: distribute remaining posts to maintain total
  if (remaining !== 0) {
    // Add/subtract from largest weighted patterns first
    const sortedPatterns = patterns.sort((a, b) => goalWeights[b] - goalWeights[a]);
    for (const pattern of sortedPatterns) {
      if (remaining === 0) break;
      if (remaining > 0) {
        calculatedCounts[pattern]++;
        remaining--;
      } else if (remaining < 0 && calculatedCounts[pattern] > 0) {
        calculatedCounts[pattern]--;
        remaining++;
      }
    }
  }

  // Build final quotas array (filter out zero counts)
  patterns.forEach(pattern => {
    if (calculatedCounts[pattern] > 0) {
      quotas.push({ pattern, count: calculatedCounts[pattern] });
    }
  });

  return quotas;
};
