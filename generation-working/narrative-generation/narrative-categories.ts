/**
 * Narrative Category Framework
 *
 * Defines category-specific diversity instructions for scalable narrative generation.
 * Instead of hardcoding detail pools, we provide instructions about WHAT TYPES of
 * details to include and let AI's training data determine WHICH SPECIFIC brands/names.
 */

export type NarrativeCategory =
  | 'mental_health'
  | 'physical_health'
  | 'weight_fitness'
  | 'womens_health'
  | 'beauty_skincare'
  | 'life_skills';

interface CategoryConfig {
  diversityInstructions: string;
  applicableGoals: string[];
}

export const NARRATIVE_CATEGORIES: Record<NarrativeCategory, CategoryConfig> = {
  mental_health: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Therapist/Psychiatrist Names:**
- Use realistic, diverse names (varied ethnicity, gender)
- Format: "Dr. [First] [Last]" or "therapist [Name]"
- Different therapist name for EACH post (no repeats)

**Medications:**
- Include specific medications with exact dosages
- Examples from training data: "Lexapro 10mg", "Zoloft 50mg", "Wellbutrin 150mg"
- Different medication+dosage combination for each post
- Use realistic dosages from your medical training data

**Therapy Modalities:**
- Available types: CBT, DBT, EMDR, ACT, psychodynamic, somatic, IFS, ERP, narrative therapy, humanistic, etc.
- ⚠️ CRITICAL: Each post must use a DIFFERENT therapy type - NO REPEATS
- If 10 posts, use 10 different therapy types (e.g., Post 1=CBT, Post 2=DBT, Post 3=EMDR, Post 4=ACT, Post 5=psychodynamic, etc.)
- Based on your training data about therapy effectiveness

**Mental Health Apps/Tools:**
- Examples: Calm, Headspace, BetterHelp, Talkspace, Insight Timer, etc.
- Different app per post if apps are mentioned
- Include realistic pricing if mentioned

**Support Resources:**
- Support groups (local NAMI, online communities, Reddit forums)
- Crisis resources (988 hotline, Crisis Text Line, etc.)
- Vary across posts

**Timestamps for Anxiety/Panic Moments:**
- Use specific times: "2:47 AM", "3:15 AM", "11:47 PM"
- Different timestamp per post
- Based on how people actually describe anxiety timing

**Therapy Costs:**
- Use realistic session costs: "$120/session", "$175/session", "$200/session"
- Vary across posts
- Based on your training data about therapy pricing

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- NO repeated therapist names across the batch
- NO identical medication+dosage combinations
- ❌ NO repeated therapy types across the batch (each post gets ONE UNIQUE therapy type - if you use CBT in Post 1, you CANNOT use CBT in any other post)
- NO repeated apps/tools if mentioned
- NO repeated timestamps for anxiety moments
- Based on your training data about how people describe mental health journeys in forums, therapy notes, and personal narratives
`,
    applicableGoals: [
      'Reduce anxiety',
      'Manage stress',
      'Improve emotional regulation',
      'Channel anger productively',
      'Live with ADHD',
      'Live with depression',
      'Navigate autism challenges',
      'Live with social anxiety',
      'Build confidence',
      'Quit drinking',
      'Stop emotional eating',
      'Get over dating anxiety'
    ]
  },

  physical_health: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Supplements/Vitamins:**
- Include brand names with specific dosages
- Examples: "Magnesium glycinate 400mg", "Melatonin 3mg", "Vitamin D3 2000 IU"
- Different supplement combination for each post
- Use realistic dosages from your health training data

**Exercise Types:**
- Vary exercise modalities: yoga, running, weightlifting, swimming, cycling, HIIT, etc.
- Include frequency: "3x/week", "daily 20min", "4x/week"
- Different exercise type/frequency per post
- Based on your training data about exercise habits

**Fitness Apps/Wearables:**
- Examples: Fitbit, Oura Ring, Apple Watch, Whoop, Garmin, Strava, Peloton, etc.
- Different fitness tracker/wearable per post if mentioned
- Include specific models if natural: "Fitbit Charge 5", "Oura Ring Gen 3"

**Sleep Optimization Tools:**
- Examples: blackout curtains, white noise machine, weighted blankets, sleep masks, etc.
- Include specific weights/specs if natural: "weighted blanket 15 lbs"
- Vary sleep tools across posts

**Diet Approaches:**
- Examples: intermittent fasting (16:8), Mediterranean diet, low-carb, plant-based, etc.
- Different diet approach per post if mentioned
- Based on your training data about sustainable diet patterns

**Energy Tracking/Metrics:**
- Sleep hours improved: "from 4 hours to 6-7 hours"
- Energy levels, HRV data, recovery scores
- Vary metrics across posts

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- NO repeated supplement combinations
- Vary exercise modalities (not all yoga or all running)
- Different fitness tracker/wearable brands per post
- Vary sleep tools and approaches
- Different diet approaches if mentioned
- Based on your training data about physical wellness journeys
`,
    applicableGoals: [
      'Sleep better',
      'Fall asleep faster',
      'Beat afternoon slump',
      'Find exercise I enjoy',
      'Start exercising',
      'Bike long distances',
      'Manage chronic pain'
    ]
  },

  weight_fitness: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Diet Approaches:**
- Include specific methods with details
- Examples: "1800 calories/day", "16:8 intermittent fasting", "40/30/30 macro split"
- Different diet approach per post
- Based on your training data about sustainable weight loss

**Exercise Programs:**
- Specific workout methods: "strength training 4x/week", "HIIT 3x/week + walking"
- Include program names if relevant: "Strong Curves", "PPL split", "Couch to 5K"
- Vary exercise approaches across posts

**Weight Loss Metrics:**
- Specific amounts: "lost 25 lbs in 4 months", "down 3 inches around waist"
- Timeframes: "over 6 months", "first 8 weeks"
- Body fat percentage if mentioned
- Different metrics per post

**Tracking Tools:**
- Examples: MyFitnessPal, food scale, macro tracking apps, progress photos
- Different tracking method per post if mentioned
- Based on your training data about successful tracking habits

**Professional Support:**
- Examples: dietitian names (use realistic names), personal trainers, coaches
- Different professional per post if mentioned
- Include costs if natural: "$150/month for trainer"

**Plateau/Setback Details:**
- Specific stall periods: "weeks 8-12", "month 3"
- How breakthrough happened
- Vary plateau experiences across posts

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- Vary diet approaches (not all calorie counting)
- Different exercise programs/splits
- Different weight loss amounts and timeframes
- Vary tracking tools
- Different professional support types if mentioned
- Based on your training data about realistic weight loss journeys
`,
    applicableGoals: [
      'Lose weight sustainably',
      'Lose belly fat'
    ]
  },

  womens_health: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Hormone-Related Symptoms:**
- Specific symptoms with frequency/severity
- Examples: "hot flashes 8-10x/day", "migraines during luteal phase"
- Symptom timing and patterns
- Vary symptom presentations across posts

**Medications/Hormone Treatments:**
- Specific HRT protocols: "estradiol 1mg + progesterone 100mg"
- Birth control types: "Mirena IUD", "combination pill", "mini-pill"
- Different medication/treatment per post
- Use realistic protocols from your medical training data

**Supplements for Women's Health:**
- Examples: "Evening primrose oil 1000mg", "Vitex 400mg", "Myo-inositol 2g"
- Different supplement per post
- Based on your training data about women's health supplements

**Healthcare Providers:**
- OB/GYN names (use realistic, diverse names)
- Specialist names: "Dr. [Name] (reproductive endocrinologist)"
- Different provider name per post

**Symptom Management Techniques:**
- Examples: cold packs, layering clothes, stress management, dietary changes
- Vary management techniques across posts
- Based on your training data about symptom relief

**Cycle Tracking:**
- Apps or methods: "Clue app", "basal temp tracking", "Oura Ring HRV"
- Different tracking method per post if mentioned

**Timeframes:**
- Perimenopause duration, cycle days, treatment adjustment periods
- Specific improvement timelines
- Vary timeframes across posts

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- Vary symptom presentations (not all identical hot flash patterns)
- Different medications/HRT protocols
- Different healthcare provider names
- Vary management techniques (medical, lifestyle, alternative)
- Different tracking methods
- Based on your training data about women's health journeys
`,
    applicableGoals: [
      'Navigate menopause',
      'Reduce menopause hot flashes',
      'Manage painful periods',
      'Manage PCOS'
    ]
  },

  beauty_skincare: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Skincare Products:**
- Include brand names and specific product names
- Examples: "CeraVe Moisturizing Cream", "The Ordinary Niacinamide", "Neutrogena Hydro Boost"
- Different product brand per post
- Based on your training data about effective skincare

**Active Ingredients:**
- Include specific percentages
- Examples: "retinol 0.5%", "niacinamide 10%", "salicylic acid 2%"
- Different active ingredients across posts (not all retinol)
- Use realistic concentrations

**Dermatologist Names:**
- Use realistic, diverse provider names
- Format: "Dr. [Name] (dermatologist)" or "my derm Dr. [Name]"
- Different dermatologist per post

**Hair Products:**
- Examples: "Olaplex No. 3", "K18 Hair Mask", "Redken Extreme"
- Different hair product per post
- Include usage frequency if natural

**Cost Levels:**
- Vary cost ranges: "$8 (drugstore)", "$25 (Target)", "$150 (derm visit)"
- Mix drugstore, mid-range, premium, prescription
- Different cost level per post

**Application Routines:**
- AM/PM routines, frequency, layering order
- Examples: "morning and night", "every other day", "PM only"
- Vary routines across posts

**Treatment Approaches:**
- Mix: over-the-counter, prescription, professional treatments
- Examples: "drugstore routine", "tretinoin prescription", "chemical peel at derm office"
- Different approach per post

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- Different product brands across posts
- Vary active ingredients (not all niacinamide or all retinol)
- Different dermatologist names
- Vary cost levels (mix drugstore and premium)
- Different treatment approaches (OTC vs Rx vs professional)
- Based on your training data about skincare journeys
`,
    applicableGoals: [
      'Clear up acne',
      'Fix dry skin',
      'Have healthier hair',
      'Have healthy nails'
    ]
  },

  life_skills: {
    diversityInstructions: `
⚠️ CATEGORY-SPECIFIC DETAILS TO INCLUDE (vary naturally from your training data):

**Productivity Apps/Systems:**
- Examples: Notion, Todoist, Habitica, Forest app, time blocking, Pomodoro, etc.
- Different productivity system per post
- Include specific features if natural: "Notion databases", "Todoist priority levels"
- Don't use Notion in every post - vary tools

**Books/Courses:**
- Include specific titles and authors
- Examples: "Atomic Habits by James Clear", "Getting Things Done", "Deep Work"
- Different book/course per post if mentioned
- Based on your training data about habit formation resources

**Financial Apps/Tools:**
- Examples: YNAB, Mint, EveryDollar, Personal Capital, Acorns, etc.
- Different financial tool per post (for financial goals)
- Include pricing if natural: "YNAB $99/year"

**Coaches/Mentors:**
- Use realistic names if mentioned: "my coach [Name]"
- Different coach/mentor per post
- Include costs if natural

**Methods/Frameworks:**
- Examples: Pomodoro Technique, time blocking, 2-minute rule, habit stacking
- Different method per post
- Based on your training data about productivity systems

**Time Metrics:**
- Specific productivity gains: "from 2 hours to 45 minutes", "saved 10 hours/week"
- Morning routine times: "5:30 AM start", "45-minute routine"
- Vary metrics across posts

**Money Metrics (Financial Goals):**
- Specific amounts: "saved $5,000 in 6 months", "credit score from 620 to 720"
- Debt paid: "$8,000 paid off", "3 cards paid down"
- Vary amounts and timeframes

🚨 CRITICAL DIVERSITY REQUIREMENTS:
- Vary productivity systems (not all Notion or Todoist)
- Different books, courses, frameworks
- Different financial tools (if financial goal)
- Vary methods (Pomodoro, time blocking, habit stacking, etc.)
- Different metrics and improvements
- Based on your training data about habit formation and skill development
`,
    applicableGoals: [
      'Develop morning routine',
      'Overcome procrastination',
      'Save money',
      'Improve credit score'
    ]
  }
};

/**
 * Get category configuration by category type
 */
export function getCategoryConfig(category: NarrativeCategory): CategoryConfig {
  return NARRATIVE_CATEGORIES[category];
}

/**
 * Get all goals that belong to a specific category
 */
export function getGoalsByCategory(category: NarrativeCategory): string[] {
  return NARRATIVE_CATEGORIES[category].applicableGoals;
}

/**
 * Check if a goal belongs to a specific category
 */
export function isGoalInCategory(goalTitle: string, category: NarrativeCategory): boolean {
  return NARRATIVE_CATEGORIES[category].applicableGoals.includes(goalTitle);
}
