/**
 * Rich Solution Generation Prompts for Claude Web
 *
 * These prompts are MUCH more comprehensive than Gemini prompts
 * because we're not constrained by API cost limits.
 *
 * Key improvements:
 * - Extensive examples and context
 * - Detailed guidance on effectiveness ratings
 * - Category-specific instructions
 * - First-person title enforcement with examples
 * - Evidence-based distribution guidance
 */

import { CATEGORY_FIELDS } from '../../../lib/config/solution-fields'

interface SolutionPromptContext {
  goalTitle: string
  goalDescription?: string
  arena: string
  category?: string
  limit: number
  includeExamples?: boolean
}

/**
 * Generate rich, comprehensive solution prompt for Claude
 */
export function getRichSolutionPrompt(context: SolutionPromptContext): string {
  const { goalTitle, goalDescription, arena, category, limit, includeExamples = true } = context

  return `# Solution Generation Task

You are helping build WWFM (What Worked For Me), a platform where real people share solutions to life challenges. Your task is to generate **${limit} evidence-based solutions** for this goal:

## Goal Context
**Goal**: ${goalTitle}
**Description**: ${goalDescription || 'Not provided'}
**Arena**: ${arena}
${category ? `**Suggested Category**: ${category}` : ''}

## Core Principle: SPECIFICITY IS EVERYTHING

Every solution MUST be something **specific and googleable** - a real product, app, book, medication, or named practice that someone could look up and try.

### ❌ WRONG (Too Generic):
- "Meditation" → Too vague, not actionable
- "Therapy" → Which kind? Where? How?
- "Exercise" → What type? What program?
- "Vitamins" → Which vitamin? What dosage?

### ✅ RIGHT (Specific & Googleable):
- "Headspace App" → Can download and use
- "BetterHelp Online CBT" → Can sign up
- "Couch to 5K running program" → Can start today
- "Nature Made Vitamin D3 2000 IU" → Can purchase

## First-Person Title Naming (CRITICAL)

Title each solution **exactly as a real person would naturally say it** when telling a friend what worked for them.

### The "Friend Test"
Before naming a solution, ask: *"Would I actually say this sentence to a friend?"*

### ✅ CORRECT Examples:
- "Sertraline (Zoloft)" - Natural, how people actually talk
- "Headspace App" - Simple, direct
- "Atomic Habits by James Clear" - Includes author naturally
- "Hatha yoga" - Specific practice name
- "Morning Pages journaling" - Named method
- "BetterHelp online therapy" - Specific service

### ❌ INCORRECT Examples:
- "Prescription antidepressant (Sertraline/Zoloft)" → "Sertraline (Zoloft)" (no generic prefix)
- "Therapy like CBT" → "CBT with licensed therapist" (no "like" pattern)
- "I tried Headspace" → "Headspace App" (no conversational framing)
- "Calm or Headspace" → Pick ONE (split into 2 solutions)
- "Yoga practice (Hatha)" → "Hatha yoga" (no generic prefix in parens)
- "Book e.g. Atomic Habits" → "Atomic Habits by James Clear" (no "e.g.")

### Title Rules (Zero Tolerance):
1. **NEVER** use: "like", "such as", "e.g.", "for example", "including"
2. **NEVER** prepend generic descriptors: "Prescription X", "Therapy program Y"
3. **NEVER** use conversational framing: "I tried", "I used", "I started"
4. **BRANDS REQUIRED**: Products need brand names ("Hatch Restore" not "white noise machine")
5. **PARENTHESES**: Only for medications ("Ambien (Zolpidem)"), NOT for specs ("(15-20 lbs)")
6. **ALWAYS** pass the friend test: "Would I say this naturally?"

${includeExamples ? generateCategorySpecificExamples(arena) : ''}

## Effectiveness Ratings (Evidence-Based)

**Rating Scale** (based on research/clinical data/real outcomes):
- **4.5-5.0**: Strong evidence (RCTs, meta-analyses, high success rates)
- **4.0-4.4**: Good evidence (multiple studies, commonly effective)
- **3.5-3.9**: Moderate evidence (some studies, works for many)
- **3.0-3.4**: Limited evidence (anecdotal, works for some)
- **<3.0**: ❌ Don't include

**CRITICAL**: Generic solutions (no brand) max 4.0. Specific solutions (has brand/program) can exceed 4.0.

**Rationale Required**: Cite evidence (RCTs, studies, user data), not speculation ("seems like" ❌)

## Category Selection (CRITICAL)

Choose the **most specific, accurate category** for each solution. Common miscategorizations to avoid:

### Medications vs Habits
- ✅ Medications: "Sertraline (Zoloft)", "Lexapro", "Melatonin supplements"
- ❌ Habits: "Nicotine Replacement Therapy" (This is a MEDICATION, not a habit!)

### Beauty/Skincare vs Habits
- ✅ Beauty/Skincare: "CeraVe Hydrating Cleanser", "The Ordinary Niacinamide"
- ❌ Habits: "The Acne.org Regimen" (This is a SKINCARE product line, not just a habit!)

### Books/Courses vs Habits
- ✅ Books/Courses: "Atomic Habits by James Clear", "Coursera Python Course"
- ❌ Habits: "Daily Stoic Journal by Ryan Holiday" (This is a BOOK, not a habit!)

### Meditation vs Exercise
- ✅ Meditation: "Mindful walking meditation", "Transcendental Meditation"
- ❌ Exercise: "Walking meditation" (Focus is MEDITATION, not physical exercise)

### Therapy Types vs Providers (CRITICAL)
- ❌ "Cognitive Behavioral Therapy (CBT)" → Too generic (therapy type, not provider)
- ✅ "Sleepio CBT-I program" → Specific program (use apps_software)
- ✅ "CBT with licensed therapist" → Acceptable (adds qualification)

### Rule of Thumb:
If it's a **product you buy** or **service you purchase** → Use the product/service category
If it's a **practice you do yourself** → Use the practice category
**Therapy category requires**: specific provider, program name, OR "with licensed [type]"

## Solution Categories (Choose Exact Strings)

${generateCategoryList()}

## Required Output Format

Return a JSON array with this EXACT structure:

\`\`\`json
[
  {
    "title": "Solution Name (First-Person Style)",
    "description": "1-2 sentence description of what it is and how it helps",
    "category": "exact_category_string_from_list_above",
    "effectiveness": 3.0-5.0,
    "effectiveness_rationale": "Evidence-based explanation (studies, trials, user data, expert consensus)",
    "variants": [] // Only for medications/supplements/natural_remedies/beauty_skincare
  }
]
\`\`\`

## Example (Correct Format):

\`\`\`json
[
  {
    "title": "Sertraline (Zoloft)",
    "description": "SSRI antidepressant commonly prescribed for anxiety and depression. Helps regulate serotonin levels.",
    "category": "medications",
    "effectiveness": 4.3,
    "effectiveness_rationale": "Multiple RCTs show 60-70% response rate for anxiety symptoms. Widely prescribed first-line treatment with extensive safety data spanning decades.",
    "variants": [
      {"amount": 25, "unit": "mg", "form": "tablet"},
      {"amount": 50, "unit": "mg", "form": "tablet"},
      {"amount": 100, "unit": "mg", "form": "tablet"}
    ]
  },
  {
    "title": "Headspace App",
    "description": "Popular meditation and mindfulness app with guided sessions for anxiety, stress, and sleep.",
    "category": "apps_software",
    "effectiveness": 4.2,
    "effectiveness_rationale": "Clinical study with 8,000+ participants showed significant reduction in stress and improved well-being after 30 days. 4.5 star average from 500k+ reviews.",
    "variants": []
  }
]
\`\`\`

## 🚨 CRITICAL: Avoid Over-Duplication (Maximum 2 Per Concept)

Before generating each solution, check if you've already included a similar concept:

**❌ WRONG - Too Many Similar Solutions:**
- 5 "mindful eating" solutions (programs, practices, apps)
- 8 "Headspace" variations (app, guided meditations, stress pack, focus pack...)
- 5 "Noom" variations (app, program, weight loss, psychology-based...)

**✅ RIGHT - Maximum 2 Per Concept:**
- 1-2 mindful eating solutions max (e.g., one program + one book)
- 1 Headspace solution (just "Headspace App")
- 1 Noom solution (just "Noom")

**Rule of Thumb:**
If you've already generated a solution for:
- Mindful eating → Don't add more mindful eating
- Headspace → Don't add Headspace again
- Meditation → Maximum 2 meditation solutions total
- CBT → Maximum 2 CBT variations

**When in doubt:** Skip the duplicate and generate a DIFFERENT type of solution entirely.

## Final Checklist:

- [ ] Titles: Pass friend test, no banned patterns, brands for products
- [ ] Duplication: Max 2 per concept
- [ ] Ratings: ≥3.0, generic ≤4.0, evidence cited
- [ ] Categories: Exact strings, therapy needs provider/qualification
- [ ] Variants: Only for medications/supplements/natural_remedies/beauty_skincare
- [ ] Format: Valid JSON only

## NOW GENERATE THE SOLUTIONS

Return ONLY the JSON array. No markdown formatting, no explanations, just valid JSON.
`
}

/**
 * Generate category-specific examples (consolidated)
 */
function generateCategorySpecificExamples(arena: string): string {
  // Consolidated examples - pattern is consistent across all arenas
  return `
## Specificity Examples for ${arena}

✅ **SPECIFIC** (Googleable, can buy/sign up):
- Medications: "Sertraline (Zoloft)", "Melatonin 3mg"
- Apps: "Headspace", "MyFitnessPal", "YNAB"
- Books: "Atomic Habits by James Clear"
- Programs: "Couch to 5K", "P90X"
- Services: "BetterHelp CBT", "Toastmasters"
- Products: "Fitbit Charge 5", "YnM Weighted Blanket"

❌ **TOO GENERIC** (Can't buy THIS EXACT thing):
- "Therapy", "Medication", "Meditation", "Exercise"
- "Sleep app", "Fitness tracker", "Self-help book"
- "Couples counseling", "Career coaching"
`
}

/**
 * Generate comprehensive category list with descriptions
 */
function generateCategoryList(): string {
  return `
### Medical & Treatment:
- **medications** - Prescription drugs (e.g., "Sertraline (Zoloft)")
- **supplements_vitamins** - OTC supplements (e.g., "Nature Made Vitamin D3 2000 IU")
- **natural_remedies** - Natural/herbal treatments (e.g., "Valerian root tea")
- **beauty_skincare** - Skincare products (e.g., "CeraVe Hydrating Cleanser")
- **medical_procedures** - Surgical/medical interventions (e.g., "LASIK eye surgery")

### Professional Services:
- **therapists_counselors** - Mental health professionals (e.g., "Cognitive Behavioral Therapy")
- **doctors_specialists** - Medical specialists (e.g., "Endocrinologist consultation")
- **coaches_mentors** - Life/career coaches (e.g., "BetterUp executive coaching")
- **alternative_practitioners** - Alternative medicine (e.g., "Acupuncture treatment")
- **professional_services** - Other professionals (e.g., "Financial planner")

### Emergency & Crisis:
- **crisis_resources** - Emergency services (e.g., "988 Suicide & Crisis Lifeline")

### Self-Directed Practices:
- **meditation_mindfulness** - Meditation practices (e.g., "Transcendental Meditation")
- **exercise_movement** - Physical activities (e.g., "Hatha yoga", "Couch to 5K")
- **habits_routines** - Behavioral practices (e.g., "Morning Pages journaling")
- **diet_nutrition** - Dietary approaches (e.g., "Mediterranean diet")
- **sleep** - Sleep practices (e.g., "Cognitive Behavioral Therapy for Insomnia")

### Products & Tools:
- **products_devices** - Physical products (e.g., "Fitbit Charge 5")
- **apps_software** - Digital tools (e.g., "Headspace App")

### Education & Learning:
- **books_courses** - Books and courses (e.g., "Atomic Habits by James Clear")

### Social & Community:
- **groups_communities** - Community organizations (e.g., "Toastmasters International")
- **support_groups** - Peer support (e.g., "Alcoholics Anonymous")
- **hobbies_activities** - Recreational activities (e.g., "Rock climbing")

### Financial:
- **financial_products** - Financial products (e.g., "Vanguard index funds")
`
}

/**
 * Variant generation guidance for dosage categories
 */
export function getVariantGuidance(category: string): string {
  if (!['medications', 'supplements_vitamins', 'natural_remedies', 'beauty_skincare'].includes(category)) {
    return 'No variants needed for this category.'
  }

  return `
## Variant Requirements for ${category}

You MUST include 3-5 variants with realistic dosages/amounts:

### Format:
\`\`\`json
"variants": [
  {"amount": 25, "unit": "mg", "form": "tablet"},
  {"amount": 50, "unit": "mg", "form": "tablet"},
  {"amount": 100, "unit": "mg", "form": "capsule"}
]
\`\`\`

### Common Units:
- Medications: mg, mcg
- Supplements: mg, mcg, IU, g
- Natural remedies: ml, drops, capsules
- Beauty: ml, oz, g

### Common Forms:
- Medications: tablet, capsule, liquid, injection
- Supplements: tablet, capsule, gummy, powder, liquid
- Natural remedies: tea, tincture, capsule, powder
- Beauty: cream, serum, lotion, gel, oil
`
}
