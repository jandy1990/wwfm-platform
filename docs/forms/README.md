# WWFM Form Templates

> **Source of truth for Claude Code**  
> Last updated from "Form Templates: Final - June 2025 Update.md"

This document contains all finalized form templates after validation and stress testing.

## Database Implementation

Form data is stored in the following Supabase tables:

### Core Tables

- **`solutions`** - Generic solution entries
  - Columns: `id`, `title`, `description`, `solution_category` (one of 23), `is_approved`
  - The `solution_category` determines which form template to use
  
- **`solution_variants`** - Specific versions (dosages, forms, etc.)
  - Columns: `id`, `solution_id`, `variant_name`, `amount`, `unit`, `form`
  - Only 4 categories have variants: medications, supplements_vitamins, natural_remedies, beauty_skincare
  - Other 19 categories use a single "Standard" variant
  
- **`goal_implementation_links`** - Connects solutions to goals with effectiveness data
  - Columns: `id`, `goal_id`, `implementation_id` (variant), `avg_effectiveness`, `rating_count`, `solution_fields`
  - The `solution_fields` JSONB column stores all form-specific data

### Form Data Storage

```typescript
// Example: How form data is stored in solution_fields JSONB
const solutionFields = {
  // Required fields (varies by form)
  cost: "$10-25/month",
  time_to_results: "3-4 weeks",
  side_effects: ["Nausea", "Headache"],
  
  // Optional fields
  frequency: "Once daily",
  brand_manufacturer: "Generic available",
  other_info: "Take with food"
};

// Stored in goal_implementation_links.solution_fields
```

### Auto-Categorization

- **`category_keywords`** table contains 10,000+ keywords for automatic form selection
- When user types a solution, system checks keywords to determine category
- Category determines which of the 9 forms to display

### Implementation Files

- Forms are implemented in `/components/solutions/forms/`
- DosageForm.tsx is complete (v2.2)
- Other 8 forms follow the same pattern
- Auto-categorization logic in `/lib/services/auto-categorization.ts`

---

## Complete Category List (23 Categories)

### Things you take (4 categories):
1. **supplements_vitamins** - Vitamin D, B12, Omega-3, Magnesium
2. **medications** - Antidepressants, Blood pressure meds, Metformin
3. **natural_remedies** - Ashwagandha, Valerian root, CBD oil, Turmeric
4. **beauty_skincare** - La Mer moisturizer, Retinol serum, Niacinamide

### People you see (7 categories):
5. **therapists_counselors** - CBT therapist, Marriage counselor, EMDR specialist
6. **doctors_specialists** - Dermatologist, Psychiatrist, Endocrinologist
7. **coaches_mentors** - Life coach, Executive coach, Career mentor
8. **alternative_practitioners** - Acupuncturist, Chiropractor, Naturopath
9. **professional_services** - Hair stylist, Personal trainer, Nutritionist
10. **medical_procedures** - Physical therapy, Laser treatment, Surgery
11. **crisis_resources** - Crisis hotline, Warm line, Text support

### Things you do (6 categories):
12. **exercise_movement** - Running, Yoga, Weight training, Swimming
13. **meditation_mindfulness** - Breath work, Body scan, Loving-kindness
14. **habits_routines** - Morning routine, Gratitude journal, Time blocking
15. **hobbies_activities** - Photography, Gardening, Chess, Woodworking
16. **groups_communities** - Running club, Book club, Hiking group
17. **support_groups** - AA, Grief support, Parenting group

### Things you use (3 categories):
18. **apps_software** - Headspace, MyFitnessPal, Todoist, YNAB
19. **products_devices** - White noise machine, Standing desk, Light therapy box
20. **books_courses** - Atomic Habits, MasterClass, CBT workbook

### Changes you make (2 categories):
21. **diet_nutrition** - Mediterranean diet, Intermittent fasting, Plant-based
22. **sleep** - Consistent bedtime, Sleep hygiene, No screens before bed

### Financial solutions (1 category):
23. **financial_products** - High-yield savings, Credit cards, Loans, Investment accounts

---

# 1. Dosage Form

**Categories**: `supplements_vitamins`, `medications`, `natural_remedies`, `beauty_skincare`  
**Required Fields**: 5  
**Optional Fields**: 7  
**Key Purpose**: Capture dosage-based solutions with structured side effects data

### Form Flow
```
User types solution → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Solution identification & auto-categorization trigger
- **Category variations**:
  - `beauty_skincare`: Label: "Product name (include brand)"
    - Placeholder: "e.g., La Mer Crème de la Mer"
  - Others: Label: "What worked for you?"
    - Placeholder: "e.g., Vitamin D, Ashwagandha"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set expectations for users
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Toggle + Dropdown
- **Purpose**: Accessibility/affordability tracking
- **Toggle**: Monthly cost | One-time purchase
- **Monthly options**:
  - Free
  - Under $10/month
  - $10-25/month
  - $25-50/month
  - $50-100/month
  - $100-200/month
  - $200-500/month
  - $500-1000/month
  - Over $1000/month
- **One-time options**:
  - Free
  - Under $20
  - $20-50
  - $50-100
  - $100-250
  - $250-500
  - $500-1000
  - Over $1000

#### 5. Side Effects
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Complete safety data for all users
- **Default**: "None" pre-checked
- **Behavior**: Selecting any effect auto-unchecks "None"
- **Custom Option**: "Add other side effect" button with text input
- **Options**: Category-specific (see Pre-Seeded Options)

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Search**: Triggers after 3 characters
- **Features**:
  - Shows existing solutions from database
  - "Verified solution" badge for matches
  - 1-5 star rating for each
  - Custom text entries allowed
- **Data handling**:
  - Existing solutions → Create negative ratings (1-3 stars)
  - Custom text → Store as JSON only

#### 7. Dosage amount
- **Type**: Text (freeform)
- **Purpose**: Optimal dosing insights
- **Examples**: "400mg", "5000 IU", "0.025%"
- **Note**: Amount only, no "2 tablets" - actual mg/unit

#### 8. Frequency
- **Type**: Dropdown
- **Purpose**: Usage pattern analysis
- **Options**: Once daily | Twice daily | Three times daily | As needed | Weekly | Other (please describe)

#### 9. Form
- **Type**: Dropdown
- **Purpose**: Preference tracking, absorption differences
- **Options**: Tablet/Pill | Capsule | Softgel | Liquid | Powder | Gummy | Sublingual | Topical/Cream | Injection | Other (please describe)

#### 10. Brand/Manufacturer
- **Type**: Text
- **Show when**: NOT beauty_skincare
- **Purpose**: Brand performance tracking

#### 11. Product Type
- **Type**: Dropdown
- **Show when**: beauty_skincare ONLY
- **Purpose**: Sub-categorization for beauty
- **Options**: Moisturizer | Serum | Cleanser | Toner | Treatment | Mask | Exfoliant | Oil | Sunscreen | Eye cream | Other (please describe)

#### 12. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical usage notes, warnings, or tips
- **Placeholder**: "Any other important information? (e.g., take with food, specific timing, warnings)"

### Pre-Seeded Side Effects

#### supplements_vitamins
None | Upset stomach | Nausea | Constipation | Diarrhea | Headache | Metallic taste | Fatigue | Skin reaction | Increased energy | Sleep changes | Morning grogginess | Vivid dreams | Acne/breakouts | Gas/bloating | Initially worse before better | [Add other side effect]

#### medications
None | Nausea | Headache | Dizziness | Drowsiness | Insomnia | Dry mouth | Weight gain | Weight loss | Sexual side effects | Mood changes | Appetite changes | Sweating | Tremor | Constipation | Blurred vision | Initially worse before better | [Add other side effect]

#### natural_remedies
None | Drowsiness | Upset stomach | Headache | Allergic reaction | Vivid dreams | Changes in appetite | Mild anxiety | Digestive changes | Skin reaction | Interactions with medications | Initially worse before better | [Add other side effect]

#### beauty_skincare
None | Dryness/peeling | Redness/irritation | Purging (initial breakouts) | Burning/stinging | Itching | Photosensitivity | Discoloration | Allergic reaction | Oiliness | Clogged pores | Texture changes | Initially worse before better | [Add other side effect]

---

# 2. Session Form

**Categories**: `therapists_counselors`, `doctors_specialists`, `coaches_mentors`, `alternative_practitioners`, `professional_services`, `medical_procedures`, `crisis_resources`  
**Required Fields**: 5  
**Optional Fields**: 6-10 (varies by category)  
**Key Purpose**: Capture professional services and appointment-based solutions with outcome tracking

### Form Flow
```
User types service → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Service identification & auto-categorization trigger
- **Category variations**:
  - `medical_procedures`: Placeholder: "e.g., Physical therapy, Laser treatment, Acupuncture"
  - `crisis_resources`: Placeholder: "e.g., Crisis hotline, Warm line, Text support"
  - Others: Placeholder: "e.g., CBT therapy, Life coach, Hair stylist"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Smart dropdown with toggle
- **Category variations**:
  - `therapists_counselors`, `doctors_specialists`, `alternative_practitioners`, `coaches_mentors`, `professional_services`: 
    - Toggle: Per session | Monthly | Total cost
  - `medical_procedures`:
    - Toggle: One-time cost | Payment plan
  - `crisis_resources`:
    - Options: Free | Donation-based | Sliding scale
- **Per session ranges**:
  - Free
  - Under $50
  - $50-100
  - $100-150
  - $150-250
  - $250-500
  - $500-1000
  - Over $1000
- **Monthly ranges**:
  - Free
  - Under $50/month
  - $50-100/month
  - $100-200/month
  - $200-400/month
  - $400-800/month
  - $800-1500/month
  - Over $1500/month
- **Total/One-time ranges**:
  - Free
  - Under $100
  - $100-500
  - $500-1,000
  - $1,000-5,000
  - $5,000-10,000
  - $10,000-25,000
  - Over $25,000

#### 5. Side Effects/Risks (CONDITIONAL)
- **Type**: Multi-select checkboxes with custom "Other" option
- **Show for**: `medical_procedures`, `alternative_practitioners`
- **Hide for**: `therapists_counselors`, `coaches_mentors`, `professional_services`, `crisis_resources`, `doctors_specialists`
- **Default**: "None" pre-checked
- **Custom Option**: "Add other side effect" button with text input
- **Options**: Category-specific (see Pre-Seeded Options)

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 7. Session/Service Frequency
- **Type**: Dropdown
- **Purpose**: Treatment intensity tracking
- **Category variations**:
  - `crisis_resources`: Hide this field
  - `medical_procedures`: Label as "Treatment frequency"
  - Others: Label as "Session frequency"
- **Options**: One-time only | As needed | Weekly | Fortnightly | Monthly | Every 2-3 months | Multiple times per week | Other (please describe)

#### 8. Format
- **Type**: Dropdown
- **Purpose**: Accessibility and preference tracking
- **Category variations**:
  - `crisis_resources`: Default to "Phone/Chat/Text"
  - `medical_procedures`: Options include "Outpatient" and "Inpatient"
- **Options**: In-person | Virtual/Online | Phone | Hybrid (both) | Text/Chat (crisis only) | Outpatient (medical only) | Inpatient (medical only)

#### 9. Session/Service Length (CONDITIONAL)
- **Type**: Dropdown
- **Hide for**: `crisis_resources`, `medical_procedures`
- **Show for**: All others
- **Options**: 15 minutes | 30 minutes | 45 minutes | 60 minutes | 90 minutes | 2+ hours | Varies

#### 10. Insurance Coverage (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `therapists_counselors`, `doctors_specialists`, `medical_procedures`
- **Hide for**: `coaches_mentors`, `alternative_practitioners`, `professional_services`, `crisis_resources`
- **Options**: Fully covered | Partially covered | Not covered | Don't have insurance | HSA/FSA eligible

#### 11. Wait Time (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `doctors_specialists`, `medical_procedures`
- **Purpose**: Access tracking
- **Options**: Same day | Within a week | 1-2 weeks | 2-4 weeks | 1-2 months | 2+ months

#### 12. Completed Full Treatment? (CONDITIONAL)
- **Type**: Radio
- **Show for**: `therapists_counselors`, `coaches_mentors`, `medical_procedures`
- **Purpose**: Outcome accuracy
- **Options**: Yes | No | Still ongoing

#### 13. Typical Treatment Length (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `therapists_counselors`, `doctors_specialists`, `coaches_mentors`, `alternative_practitioners`, `medical_procedures`
- **Hide for**: `professional_services`, `crisis_resources`
- **Purpose**: Set expectations for treatment duration
- **Options**: Single session only | 4-6 sessions | 8-12 sessions | 3-6 months | 6-12 months | Ongoing/Indefinite | Varies significantly

#### 14. Availability (CONDITIONAL)
- **Type**: Multi-select
- **Show for**: `crisis_resources` only
- **Options**: 24/7 | Business hours | Evenings | Weekends | Immediate response | Callback within 24hrs

#### 15. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical notes about the service/practitioner
- **Placeholder**: "Any other important information? (e.g., specific expertise, requirements, warnings)"

### Pre-Seeded Side Effects/Risks

#### medical_procedures
None | Pain/discomfort | Bruising/swelling | Infection risk | Scarring | Temporary mobility issues | Anesthesia reactions | Longer recovery than expected | Needed additional procedures | Initially worse before better | [Add other side effect]

#### alternative_practitioners
None | Temporary discomfort | Healing crisis | Bruising (acupuncture/cupping) | Lightheadedness | Emotional release | Fatigue after treatment | Initially worse before better | [Add other side effect]

---

# 3. Practice Form

**Categories**: `exercise_movement`, `meditation_mindfulness`, `habits_routines`  
**Required Fields**: 5  
**Optional Fields**: 8-10 (varies by category)  
**Key Purpose**: Capture regular practices and activities with challenge tracking

### Form Flow
```
User types practice → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Practice identification & auto-categorization trigger
- **Category variations**:
  - `exercise_movement`: Placeholder: "e.g., Running, Yoga, Weight training"
  - `meditation_mindfulness`: Placeholder: "e.g., Breath work, Body scan, Mindful walking"
  - `habits_routines`: Placeholder: "e.g., Morning routine, Gratitude journal, Time blocking"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Dual dropdowns (matching hobby_form structure)
- **Purpose**: Complete cost picture
- **Fields**:
  - Startup cost:
    - Free/No startup cost
    - Under $50
    - $50-100
    - $100-250
    - $250-500
    - $500-1000
    - $1000-2500
    - Over $2500
  - Ongoing cost:
    - Free/No ongoing cost
    - Under $10/month
    - $10-25/month
    - $25-50/month
    - $50-100/month
    - $100-200/month
    - $200-500/month
    - Over $500/month
- **Default selections**: 
  - Startup: "Free/No startup cost"
  - Ongoing: "Free/No ongoing cost"

#### 5. Challenges Experienced (REQUIRED)
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Complete challenge/accessibility data
- **Label**: "Challenges experienced"
- **Default**: "None" pre-checked
- **Behavior**: Selecting any challenge auto-unchecks "None"
- **Custom Option**: "Add other challenge" button with text input
- **Options**: Category-specific (see Pre-Seeded Options)

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 7. Frequency
- **Type**: Dropdown
- **Purpose**: Consistency tracking
- **Options**: Daily | 5-6x per week | 3-4x per week | 1-2x per week | A few times per month | As needed

#### 8. Duration/Time Investment (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `exercise_movement`, `meditation_mindfulness`
- **Hide for**: `habits_routines`
- **Category variations**:
  - `exercise_movement`: Label: "Session duration"
  - `meditation_mindfulness`: Label: "Practice length"
- **Options**: Under 10 minutes | 10-20 minutes | 20-30 minutes | 30-45 minutes | 45-60 minutes | 1-2 hours | Over 2 hours

#### 9. Time Commitment (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `habits_routines` ONLY
- **Purpose**: Habit complexity tracking
- **Options**: Under 5 minutes | 5-15 minutes | 15-30 minutes | 30-60 minutes | Over 1 hour | Throughout the day

#### 10. Location/Setting
- **Type**: Dropdown
- **Purpose**: Accessibility and space requirements
- **Category variations**:
  - `habits_routines`: Hide this field
- **Options**: Home | Gym/Studio | Outdoors | Office/Work | Community center | Online/Virtual | Anywhere | Multiple locations

#### 11. Guidance Type
- **Type**: Dropdown
- **Purpose**: Self-efficacy vs instruction needs
- **Category variations**:
  - `habits_routines`: Options simplified
- **Options for exercise/meditation**: Self-directed | App-guided | Video/Online class | In-person instructor | Group class | Personal trainer/coach | Mix of guided and self
- **Options for habits**: Self-directed | App-assisted | Book/Course-based | Coach-supported

#### 12. Difficulty Level (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `exercise_movement`, `meditation_mindfulness`
- **Hide for**: `habits_routines`
- **Options**: Beginner-friendly | Easy | Moderate | Challenging | Advanced | Varies by day

#### 13. Equipment/Tools Needed
- **Type**: Text (freeform)
- **Purpose**: Accessibility planning
- **Examples**: "Yoga mat", "Running shoes", "Journal and pen", "None"

#### 14. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical practice notes or tips
- **Placeholder**: "Any other important information? (e.g., modifications, best practices, warnings)"

### Pre-Seeded Challenges

#### exercise_movement
None | Muscle soreness (normal) | Joint pain | Back pain | Knee issues | Shoulder issues | Overtraining/fatigue | Pulled muscle | Stress fracture | Tendinitis | Needed to modify for injury | Weather dependent | Needs workout partner | Initially worse before better | [Add other challenge]

#### meditation_mindfulness
None | Restlessness | Difficulty concentrating | Physical discomfort | Emotional overwhelm | Difficulty staying awake | Anxiety increased | Intrusive thoughts | Boredom | Time management issues | Increased anxiety initially | Pet/child interruptions | Noisy environment | Initially worse before better | [Add other challenge]

#### habits_routines
None | Hard to remember | Time constraints | Lack of motivation | Inconsistent schedule | Family/work interruptions | Too complex | Unrealistic expectations | Lack of support | Environmental barriers | Meeting conflicts | Travel disrupts routine | Initially worse before better | [Add other challenge]

---

# 4. Purchase Form

**Categories**: `products_devices`, `books_courses`  
**Required Fields**: 4  
**Optional Fields**: 5-6 (varies by category)  
**Key Purpose**: Capture purchased solutions with simplicity and focus on what works

### Form Flow
```
User types product/book → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Product identification & auto-categorization trigger
- **Category variations**:
  - `products_devices`: Placeholder: "e.g., White noise machine, Standing desk, Light therapy box"
  - `books_courses`: Placeholder: "e.g., Atomic Habits, MasterClass subscription, CBT workbook"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Smart dropdown with toggle
- **Category variations**:
  - `products_devices`: Toggle: One-time purchase | Ongoing costs
  - `books_courses`: Toggle: One-time purchase | Subscription
- **One-time ranges**:
  - Free
  - Under $20
  - $20-50
  - $50-100
  - $100-250
  - $250-500
  - $500-1000
  - $1000-2500
  - Over $2500
- **Ongoing/Subscription ranges**:
  - Free
  - Under $10/month
  - $10-25/month
  - $25-50/month
  - $50-100/month
  - $100-200/month
  - Over $200/month

### Optional Fields

#### 5. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 6. Format/Type
- **Type**: Dropdown
- **Purpose**: Accessibility and preference tracking
- **Category variations**:
  - `products_devices`: Label: "Product type"
    - Options: Physical device | Mobile app | Software | Wearable | Subscription service | Other (please describe)
  - `books_courses`: Label: "Format"
    - Options: Physical book | E-book | Audiobook | Online course | Video series | Workbook/PDF | App-based | Other (please describe)

#### 7. Ease of Use (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `products_devices` ONLY
- **Options**: Very easy | Easy | Moderate | Difficult | Very difficult

#### 8. Learning Difficulty (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `books_courses` ONLY
- **Purpose**: Content accessibility
- **Options**: Very easy | Easy | Just right | Challenging | Too difficult

#### 9. Completion Status (CONDITIONAL)
- **Type**: Radio
- **Show for**: `books_courses` ONLY
- **Purpose**: Engagement tracking
- **Options**: Completed fully | Completed partially | Still in progress | Abandoned

#### 10. Issues Experienced (OPTIONAL)
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Quality tracking for those who want to share
- **Default**: None selected
- **Custom Option**: "Add other issue" button with text input
- **Category variations**:
  - `products_devices`: Label: "Any issues? (optional)"
  - `books_courses`: Label: "Any challenges? (optional)"
- **Options**: Category-specific (see Pre-Seeded Options)

#### 11. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical product/course notes
- **Placeholder**: "Any other important information? (e.g., specific features, requirements, tips)"

### Pre-Seeded Issues/Challenges

#### products_devices (Any issues?)
None | Build quality issues | Difficult to use | Didn't work as advertised | Battery/power problems | Connectivity issues | Software bugs | Too noisy | Broke/stopped working | Customer service problems | Missing features | Initially worse before better | [Add other issue]

#### books_courses (Any challenges?)
None | Too basic | Too advanced | Poor organization | Outdated information | Not practical | Too theoretical | Too long/verbose | Boring presentation | Technical issues (videos/app) | Didn't match description | Incomplete content | Initially worse before better | [Add other challenge]

---

# 5. App Form

**Categories**: `apps_software`  
**Required Fields**: 4  
**Optional Fields**: 5  
**Key Purpose**: Capture digital solution effectiveness with platform and usage patterns

### Form Flow
```
User types app name → Auto-categorization → App-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: App identification & auto-categorization trigger
- **Placeholder**: "e.g., Headspace, MyFitnessPal, Todoist, Calm"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Toggle + Dropdown
- **Purpose**: Accessibility tracking
- **Toggle**: One-time purchase | Subscription
- **One-time options**:
  - Free
  - Under $5
  - $5-10
  - $10-20
  - $20-50
  - $50-100
  - Over $100
- **Subscription options**:
  - Free
  - Free with ads
  - Under $5/month
  - $5-10/month
  - $10-20/month
  - $20-50/month
  - $50-100/month
  - Over $100/month

### Optional Fields

#### 5. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 6. Usage Frequency
- **Type**: Dropdown
- **Purpose**: Engagement pattern tracking
- **Options**: Multiple times daily | Daily | Several times a week | Weekly | As needed | Rarely after initial use

#### 7. Subscription Type
- **Type**: Dropdown
- **Purpose**: Feature access tracking
- **Options**: Free version | Premium/Pro | Trial period | Lifetime purchase | Not applicable

#### 8. Most Valuable Feature
- **Type**: Dropdown with custom "Other" option
- **Purpose**: Structured feature effectiveness data
- **Options**: Guided sessions | Progress tracking | Reminders/Notifications | Community features | Content library | Customization options | Offline access | Integration with other apps | [Add other feature]

#### 9. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical app notes or tips
- **Placeholder**: "Any other important information? (e.g., platform requirements, specific features, tips)"

---

# 6. Community Form

**Categories**: `groups_communities`, `support_groups`  
**Required Fields**: 4  
**Optional Fields**: 8-9 (varies by category)  
**Key Purpose**: Capture group-based solutions with accessibility and commitment tracking

### Form Flow
```
User types community/group → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Community identification & auto-categorization trigger
- **Category variations**:
  - `groups_communities`: Placeholder: "e.g., Local running club, Book club, Hiking group"
  - `support_groups`: Placeholder: "e.g., AA, Grief support, Parenting group"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set connection expectations
- **Options**:
  - First session
  - Within a few sessions
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost?
- **Type**: Dropdown
- **Purpose**: Accessibility tracking
- **Options**:
  - Free
  - Donation-based
  - Under $20/month
  - $20-50/month
  - $50-100/month
  - $100-200/month
  - Over $200/month
  - One-time fee (please describe)

### Optional Fields

#### 5. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 6. Group Size
- **Type**: Dropdown
- **Purpose**: Intimacy vs community feel
- **Options**: Under 10 people | 10-25 people | 25-50 people | 50-100 people | 100+ people | Varies significantly

#### 7. Meeting Frequency
- **Type**: Dropdown
- **Purpose**: Commitment level tracking
- **Options**: Daily | Several times per week | Weekly | Fortnightly | Monthly | As needed | Special events only

#### 8. Format
- **Type**: Dropdown
- **Purpose**: Accessibility options
- **Options**: In-person only | Online only | Hybrid (both) | Phone/Conference call

#### 9. Commitment Type
- **Type**: Dropdown
- **Purpose**: Flexibility tracking
- **Options**: Drop-in anytime | Regular attendance expected | Membership required | Course/Program (fixed duration) | Ongoing open group

#### 10. Accessibility Level
- **Type**: Dropdown
- **Purpose**: Inclusivity tracking
- **Category variations**:
  - `groups_communities`: Label: "Beginner friendly?"
  - `support_groups`: Label: "Newcomer welcoming?"
- **Options**: Very welcoming | Welcoming | Neutral | Some experience helpful | Experience required

#### 11. Leadership Style (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `support_groups` ONLY
- **Purpose**: Group dynamics tracking
- **Options**: Peer-led | Professional facilitator | Rotating leadership | Mixed leadership | Self-organizing

#### 12. Challenges Experienced (optional)
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Accessibility barriers for others
- **Default**: None selected
- **Custom Option**: "Add other challenge" button with text input
- **Options**: None | Scheduling conflicts | Location/Transportation | Cliques/Not welcoming | Too large/impersonal | Too small/intimate | Inconsistent attendance | Cost barriers | Required too much commitment | Initially worse before better | [Add other challenge]

#### 13. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical group notes
- **Placeholder**: "Any other important information? (e.g., specific focus, requirements, tips)"

---

# 7. Lifestyle Form

**Categories**: `diet_nutrition`, `sleep`  
**Required Fields**: 5  
**Optional Fields**: 6-7 (varies by category)  
**Key Purpose**: Capture lifestyle modifications with challenge tracking and sustainable change patterns

### Form Flow
```
User types change → Auto-categorization → Category-specific form loads → Submit
                        ↓ (if no match)
                    Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Change identification & auto-categorization trigger
- **Category variations**:
  - `diet_nutrition`: Placeholder: "e.g., Mediterranean diet, Intermittent fasting, Plant-based"
  - `sleep`: Placeholder: "e.g., Consistent bedtime, Sleep hygiene routine, No screens before bed"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost Impact?
- **Type**: Smart dropdown
- **Purpose**: Track financial accessibility
- **Category variations**:
  - `diet_nutrition`: 
    - Options: Significantly more expensive | Somewhat more expensive | About the same | Somewhat less expensive | Significantly less expensive
  - `sleep`: 
    - Options: Free | Under $50 one-time | $50-200 one-time | $200-500 one-time | Over $500 one-time | Ongoing costs (please describe)

#### 5. Challenges Experienced (REQUIRED)
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Complete barrier data for future users
- **Default**: "None" pre-checked
- **Behavior**: Selecting any challenge auto-unchecks "None"
- **Custom Option**: "Add other challenge" button with text input
- **Category variations**:
  - `diet_nutrition`: Label: "Adherence challenges"
  - `sleep`: Label: "Adjustment difficulties"
- **Options**: Category-specific (see Pre-Seeded Options)

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 7. Preparation/Adjustment Time
- **Type**: Dropdown
- **Purpose**: Implementation effort tracking
- **Category variations**:
  - `diet_nutrition`: Label: "Daily prep time"
    - Options: No extra time | Under 15 minutes | 15-30 minutes | 30-60 minutes | Over 1 hour
  - `sleep`: Label: "Adjustment period"
    - Options: Immediate | 3-7 days | 1-2 weeks | 2-4 weeks | Over a month

#### 8. Long-term Sustainability
- **Type**: Dropdown
- **Purpose**: Track what actually sticks
- **Options**: Still maintaining | Maintained for years | Maintained 6-12 months | Maintained 3-6 months | Maintained 1-3 months | Stopped within a month | Modified but continued

#### 9. Social Impact (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `diet_nutrition` ONLY
- **Purpose**: Social barrier assessment
- **Options**: No impact | Slightly challenging | Moderately challenging | Very challenging | Deal breaker

#### 10. Previous Sleep Hours (CONDITIONAL)
- **Type**: Dropdown
- **Show for**: `sleep` ONLY
- **Purpose**: Baseline for improvement context
- **Options**: Under 4 hours | 4-5 hours | 5-6 hours | 6-7 hours | 7-8 hours | Over 8 hours | Highly variable

#### 11. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical lifestyle change notes
- **Placeholder**: "Any other important information? (e.g., specific tips, requirements, warnings)"

### Pre-Seeded Challenges

#### diet_nutrition (Adherence challenges)
None | Cravings | Social situations | Time constraints | Cost | Meal planning | Family preferences | Travel/eating out | Energy levels | Digestive issues | Missing favorite foods | Complicated rules | Initially worse before better | [Add other challenge]

#### sleep (Adjustment difficulties)
None | Hard to maintain schedule | Work/family conflicts | Felt worse initially | Too restrictive | Inconsistent results | Partner's different schedule | Anxiety about sleep | Physical discomfort | Missing late night activities | Initially worse before better | [Add other challenge]

---

# 8. Hobby Form

**Categories**: `hobbies_activities`  
**Required Fields**: 5  
**Optional Fields**: 7  
**Key Purpose**: Capture hobby experiences with enjoyment timeline and accessibility factors

### Form Flow
```
User types hobby → Auto-categorization → Hobby form loads → Submit
                      ↓ (if no match)
                  Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Hobby identification & auto-categorization trigger
- **Placeholder**: "e.g., Photography, Gardening, Woodworking, Chess"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to enjoyment?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations for enjoyment curve
- **Label**: "When did it become enjoyable?"
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still building enjoyment

#### 4. Time Commitment
- **Type**: Dropdown
- **Purpose**: Real time investment tracking
- **Label**: "Typical time per week"
- **Options**:
  - Under 2 hours
  - 2-5 hours
  - 5-10 hours
  - 10-20 hours
  - Over 20 hours
  - Varies widely

#### 5. Cost?
- **Type**: Two dropdowns (not toggle)
- **Purpose**: Complete cost picture
- **Fields**:
  - Startup cost:
    - Free/No startup cost
    - Under $50
    - $50-200
    - $200-500
    - $500-1000
    - $1000-2500
    - Over $2500
  - Ongoing cost:
    - Free/No ongoing cost
    - Under $25/month
    - $25-50/month
    - $50-100/month
    - $100-200/month
    - Over $200/month

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 7. Barriers Experienced
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Help others anticipate challenges
- **Label**: "Challenges faced (optional)"
- **Custom Option**: "Add other barrier" button with text input
- **Options**: None | Higher cost than expected | More time-intensive than expected | Harder to learn than expected | Hard to find community/others | Space/storage issues | Family/partner not supportive | Physical demands unexpected | Too much pressure/competition | Boring after initial interest | Equipment too complicated | Initially worse before better | [Add other barrier]

#### 8. Social Setting
- **Type**: Dropdown
- **Purpose**: Social preference matching
- **Options**: Always solo | Mostly solo | Mix of solo and social | Mostly with others | Always with others | Online community

#### 9. Beginner Experience
- **Type**: Dropdown
- **Purpose**: Accessibility assessment
- **Label**: "How welcoming for beginners?"
- **Options**: Very welcoming community | Welcoming | Neutral | Intimidating at first | Very intimidating

#### 10. Space Requirements
- **Type**: Dropdown
- **Purpose**: Practical planning
- **Options**: No dedicated space needed | Small space (desk/corner) | Room/garage needed | Outdoor space needed | Special venue (studio/workshop)

#### 11. Stress Level
- **Type**: Dropdown
- **Purpose**: Match to user goals
- **Label**: "How relaxing/stressful?"
- **Options**: Very relaxing | Mostly relaxing | Neutral | Some pressure | High pressure/competitive

#### 12. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical hobby notes
- **Placeholder**: "Any other important information? (e.g., specific requirements, tips, seasonal considerations)"

---

# 9. Financial Instruments/Products Form

**Categories**: `financial_products`  
**Required Fields**: 5  
**Optional Fields**: 6  
**Key Purpose**: Capture financial instruments and products that don't fit other categories (not apps, not courses)

### Form Flow
```
User types financial product → Auto-categorization → Financial form loads → Submit
                                ↓ (if no match)
                            Category picker shown
```

### Required Fields

#### 1. What worked for you?
- **Type**: Text input
- **Purpose**: Product identification & auto-categorization trigger
- **Label**: "Financial product or service"
- **Placeholder**: "e.g., High-yield savings account, Cashback credit card, Debt consolidation loan"
- **Validation**: Search existing solutions while typing

#### 2. How well did it work?
- **Type**: Star rating (1-5)
- **Purpose**: Core effectiveness metric for achieving the financial goal
- **Default**: None selected
- **Validation**: Must select a rating

#### 3. Time to see results?
- **Type**: Dropdown
- **Purpose**: Set realistic expectations
- **Options**:
  - Immediately
  - Within days
  - 1-2 weeks
  - 3-4 weeks
  - 1-2 months
  - 3-6 months
  - 6+ months
  - Still evaluating

#### 4. Cost Type?
- **Type**: Dropdown
- **Purpose**: Determine which cost fields to show
- **Default**: "No cost"
- **Options**:
  - No cost
  - Fees only
  - Interest only (APR)
  - Fees plus interest

#### 5. Financial Benefit?
- **Type**: Dropdown
- **Purpose**: Capture savings/earnings from the product
- **Default**: "No direct financial benefit"
- **Options**:
  - No direct financial benefit
  - Under $25/month saved/earned
  - $25-100/month saved/earned
  - $100-250/month saved/earned
  - $250-500/month saved/earned
  - $500-1000/month saved/earned
  - Over $1000/month saved/earned
  - Varies significantly (explain in notes)

### Conditional Fields (Based on Cost Type)

#### If "Fees only" or "Fees plus interest":
**Fee Amount** (Dropdown):
- **Monthly fees**:
  - Under $10/month
  - $10-25/month
  - $25-50/month
  - $50-100/month
  - Over $100/month
- **Annual fees**:
  - Under $100/year
  - $100-500/year
  - Over $500/year
- **One-time fees**:
  - Under $100 one-time
  - $100-500 one-time
  - $500-2500 one-time
  - Over $2500 one-time

#### If "Interest only" or "Fees plus interest":
**Interest Rate (APR)** (Text field):
- **Type**: Text input
- **Placeholder**: "e.g., 6.75% or 0% promotional"
- **Helper text**: "Enter exact rate or 'Variable' if it changes"
- **Backend**: Auto-populate range filters:
  - 0-4.99% → "Under 5%"
  - 5-9.99% → "5-10%"
  - 10-14.99% → "10-15%"
  - 15-19.99% → "15-20%"
  - 20-29.99% → "20-30%"
  - 30%+ → "Over 30%"

### Optional Fields

#### 6. What else did you try?
- **Type**: Search with autocomplete + ratings
- **Purpose**: Capture failed solutions for complete picture
- **Implementation**: Same as DosageForm

#### 7. Minimum Requirements
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Accessibility barriers
- **Default**: None selected
- **Custom Option**: "Add other requirement" button with text input
- **Options**: None | Minimum balance ($500+) | Minimum balance ($1000+) | Minimum balance ($5000+) | Good credit (650+) | Excellent credit (750+) | Proof of income | Business entity | Collateral required | [Add other requirement]

#### 8. Key Features/Benefits
- **Type**: Multi-select checkboxes with custom "Other" option
- **Purpose**: Highlight value propositions
- **Default**: None selected
- **Custom Option**: "Add other feature" button with text input
- **Options**: No fees | Cashback/rewards | High interest earned | Low interest charged | Flexible terms | Quick approval | No credit check | Mobile app access | Automatic savings | Bill negotiation | Tax advantages | FDIC/SIPC insured | [Add other feature]

#### 9. Access Time
- **Type**: Dropdown
- **Purpose**: Speed of availability
- **Options**: Instant approval | Same day | 1-3 business days | 1-2 weeks | 2-4 weeks | Over a month

#### 10. Ease of Use
- **Type**: Dropdown
- **Purpose**: Complexity assessment
- **Options**: Very easy | Easy | Moderate | Complex | Very complex

#### 11. Other Important Information
- **Type**: Text (freeform)
- **Purpose**: Capture critical product notes, terms, warnings
- **Placeholder**: "Any other important information? (e.g., hidden fees, promotional periods, minimum payments, best practices)"

---

## Implementation Status

| Form | Categories | Status | Key Features |
|------|------------|---------|--------------||
| Dosage Form | 4 | ✅ v2.2 Complete | Failed solutions search, custom side effects |
| Session Form | 7 | ⬜ Updated spec | Added failed solutions, custom options |
| Practice Form | 3 | ⬜ Updated spec | Added failed solutions, custom options |
| Purchase Form | 2 | ⬜ Updated spec | Added failed solutions, custom options |
| App Form | 1 | ⬜ Updated spec | Added failed solutions, custom options |
| Community Form | 2 | ⬜ Updated spec | Added failed solutions, custom options |
| Lifestyle Form | 2 | ⬜ Updated spec | Added failed solutions, custom options |
| Hobby Form | 1 | ⬜ Updated spec | Added failed solutions, custom options |
| Financial Form | 1 | ⬜ Updated spec | Added failed solutions, custom options |

**Total Progress**: 1/9 forms implemented, 9/9 specifications updated ✅

## Summary of June 2025 Updates

### Applied to ALL Forms:
1. **Added "What else did you try?"** as Optional Field #1 - Failed solutions search with ratings
2. **Custom "Other" options** for all multi-select fields (side effects, challenges, features, etc.)
3. **Expanded cost ranges** - Added higher tiers up to $1000+/month where applicable
4. **"Initially worse before better"** added to all side effects/challenges lists
5. **Better placeholders** - More specific examples for each category
6. **Conditional field logic** - Show/hide fields based on category
7. **Unified time-to-results** - Consistent 8 options across all forms

### Category → Form Mapping
```javascript
const CATEGORY_TO_FORM = {
  // Dosage Form (4 categories)
  'supplements_vitamins': 'dosage_form',
  'medications': 'dosage_form',
  'natural_remedies': 'dosage_form',
  'beauty_skincare': 'dosage_form',
  
  // Session Form (7 categories)
  'therapists_counselors': 'session_form',
  'doctors_specialists': 'session_form',
  'coaches_mentors': 'session_form',
  'alternative_practitioners': 'session_form',
  'professional_services': 'session_form',
  'medical_procedures': 'session_form',
  'crisis_resources': 'session_form',
  
  // Practice Form (3 categories)
  'exercise_movement': 'practice_form',
  'meditation_mindfulness': 'practice_form',
  'habits_routines': 'practice_form',
  
  // Purchase Form (2 categories)
  'products_devices': 'purchase_form',
  'books_courses': 'purchase_form',
  
  // App Form (1 category)
  'apps_software': 'app_form',
  
  // Community Form (2 categories)
  'groups_communities': 'community_form',
  'support_groups': 'community_form',
  
  // Lifestyle Form (2 categories)
  'diet_nutrition': 'lifestyle_form',
  'sleep': 'lifestyle_form',
  
  // Hobby Form (1 category)
  'hobbies_activities': 'hobby_form',
  
  // Financial Form (1 category)
  'financial_products': 'financial_form'
};
```
