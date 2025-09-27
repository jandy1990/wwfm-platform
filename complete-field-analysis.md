# Complete Field Analysis - ALL Required Fields Per Category

Based on GoalPageClient.tsx CATEGORY_CONFIGS, here are ALL fields displayed for each category:

## DOSAGE FORMS (4 categories)
**medications**: keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'] + arrayField: 'side_effects'
**supplements_vitamins**: keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'] + arrayField: 'side_effects'
**natural_remedies**: keyFields: ['time_to_results', 'frequency', 'length_of_use', 'cost'] + arrayField: 'side_effects'
**beauty_skincare**: keyFields: ['time_to_results', 'skincare_frequency', 'length_of_use', 'cost'] + arrayField: 'side_effects'

## PRACTICE FORMS (3 categories mapped)
**meditation_mindfulness**: keyFields: ['time_to_results', 'practice_length', 'frequency'] + arrayField: 'challenges'
**exercise_movement**: keyFields: ['time_to_results', 'frequency', 'cost'] + arrayField: 'challenges'
**habits_routines**: keyFields: ['time_to_results', 'time_commitment', 'cost'] + arrayField: 'challenges'

## SESSION FORMS (7 categories)
**therapists_counselors**: keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'] + arrayField: 'challenges'
**doctors_specialists**: keyFields: ['time_to_results', 'wait_time', 'insurance_coverage', 'cost'] + arrayField: 'challenges'
**coaches_mentors**: keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'] + arrayField: 'challenges'
**alternative_practitioners**: keyFields: ['time_to_results', 'session_frequency', 'session_length', 'cost'] + arrayField: 'side_effects'
**professional_services**: keyFields: ['time_to_results', 'session_frequency', 'specialty', 'cost'] + arrayField: 'challenges'
**medical_procedures**: keyFields: ['time_to_results', 'session_frequency', 'wait_time', 'cost'] + arrayField: 'side_effects'
**crisis_resources**: keyFields: ['time_to_results', 'response_time', 'cost'] + arrayField: null

## LIFESTYLE FORMS (2 categories mapped)
**diet_nutrition**: keyFields: ['time_to_results', 'weekly_prep_time', 'still_following', 'cost'] + arrayField: 'challenges'
**sleep**: keyFields: ['time_to_results', 'previous_sleep_hours', 'still_following', 'cost'] + arrayField: 'challenges'

## PURCHASE FORMS (2 categories)
**products_devices**: keyFields: ['time_to_results', 'ease_of_use', 'product_type', 'cost'] + arrayField: 'challenges'
**books_courses**: keyFields: ['time_to_results', 'format', 'learning_difficulty', 'cost'] + arrayField: 'challenges'

## APP FORM (1 category)
**apps_software**: keyFields: ['time_to_results', 'usage_frequency', 'subscription_type', 'cost'] + arrayField: 'challenges'

## COMMUNITY FORMS (2 categories)
**groups_communities**: keyFields: ['time_to_results', 'meeting_frequency', 'group_size', 'cost'] + arrayField: 'challenges'
**support_groups**: keyFields: ['time_to_results', 'meeting_frequency', 'format', 'cost'] + arrayField: 'challenges'

## HOBBY FORM (1 category)
**hobbies_activities**: keyFields: ['time_to_results', 'time_commitment', 'frequency', 'cost'] + arrayField: 'challenges'

## FINANCIAL FORM (1 category)
**financial_products**: keyFields: ['time_to_results', 'financial_benefit', 'access_time'] + arrayField: 'challenges'

---

# ALL UNIQUE FIELDS THAT NEED TO BE AUDITED:

## Universal Fields:
- **time_to_results** (appears in ALL categories)

## Cost Fields:
- **cost** (appears in 20/23 categories - missing from: meditation_mindfulness, financial_products, and some others)

## Frequency Fields:
- **frequency** (medications, natural_remedies, meditation_mindfulness, exercise_movement, hobbies_activities)
- **session_frequency** (therapists_counselors, coaches_mentors, alternative_practitioners, professional_services, medical_procedures)
- **skincare_frequency** (beauty_skincare)
- **meeting_frequency** (groups_communities, support_groups)

## Duration/Time Fields:
- **length_of_use** (medications, supplements_vitamins, natural_remedies, beauty_skincare)
- **session_length** (therapists_counselors, coaches_mentors, alternative_practitioners)
- **practice_length** (meditation_mindfulness)
- **time_commitment** (habits_routines, hobbies_activities)
- **weekly_prep_time** (diet_nutrition)
- **wait_time** (doctors_specialists, medical_procedures)
- **response_time** (crisis_resources)
- **access_time** (financial_products)

## Service-Specific Fields:
- **insurance_coverage** (doctors_specialists)
- **specialty** (professional_services)
- **subscription_type** (apps_software)
- **usage_frequency** (apps_software)

## Lifestyle Fields:
- **still_following** (diet_nutrition, sleep)
- **previous_sleep_hours** (sleep)

## Product Fields:
- **ease_of_use** (products_devices)
- **product_type** (products_devices)
- **format** (books_courses, support_groups)
- **learning_difficulty** (books_courses)
- **group_size** (groups_communities)

## Financial Fields:
- **financial_benefit** (financial_products)

## Array Fields:
- **side_effects** (6 categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, alternative_practitioners, medical_procedures)
- **challenges** (16 categories: all others except crisis_resources which has null)

---

# AUDIT RESULTS: 31 unique fields analyzed across all categories!

## 🎯 CRITICAL PRIORITIES (Based on Audit)

### CRITICAL - Display Breaking (100% missing):
1. **session_length** (265 solutions) - therapists, coaches, alternative practitioners
2. **learning_difficulty** (833 solutions) - books/courses
3. **group_size** (152 solutions) - groups/communities
4. **practice_length** (160 solutions) - meditation/mindfulness

### HIGH PRIORITY - Cost Display (81% missing):
- **startup_cost** & **ongoing_cost** (4,444 solutions) - affects cost display

### MEDIUM PRIORITY - UX Impact:
- **side_effects** (637/1,336 missing - 48%) - medical categories
- **session_frequency** (200/462 missing - 43%) - service categories

### OPTIONAL (Removed from Requirements):
- **notes** - Can remain blank across all categories

## 🧠 AI Training Data Requirements:
ALL generated data must reflect AI training patterns from medical literature/studies/research.
NO mechanistic or random data patterns allowed.