# WWFM Forms Field Matrix - ACTUAL Implementation

## Overview
This document reflects what is ACTUALLY stored in the database and what the frontend displays.

## Universal Fields (All Forms)
- **Effectiveness** (1-5 stars) - Always shown in header
- **Time to Results** - Always shown as one of 4 fields

## Required Fields by Category (What We Actually Generated)

### DOSAGE FORMS
#### medications, supplements_vitamins, natural_remedies
- `cost` - "$10-25/month"
- `time_to_results` - "3-4 weeks"
- `frequency` - "Once daily"
- `length_of_use` - "3-6 months"
- **Array**: `side_effects` - ["Nausea", "Headache", etc.]

#### beauty_skincare (NOT YET GENERATED)
- `cost`
- `time_to_results`
- `frequency`
- `product_type`
- **Array**: `side_effects`

### PRACTICE FORMS
#### meditation_mindfulness
- `startup_cost` - "Free/No startup cost"
- `ongoing_cost` - "Free/No ongoing cost"
- `time_to_results` - "1-2 weeks"
- `practice_length` - "10-20 minutes"
- **Array**: `challenges` - ["Difficulty concentrating", etc.]

#### exercise_movement
- `startup_cost` - "Free/No startup cost"
- `ongoing_cost` - "$25-50/month"
- `time_to_results` - "1-2 weeks"
- `frequency` - "3-4x per week"
- `duration` - "30-45 minutes"
- **Array**: `challenges` - ["Weather dependent", etc.]

#### habits_routines
- `startup_cost` - "Free/No startup cost"
- `ongoing_cost` - "Free/No ongoing cost"
- `time_to_results` - "Within days"
- `time_commitment` - "5-15 minutes"
- **Array**: `challenges` - ["Easy to forget", etc.]

### SESSION FORMS
#### therapists_counselors ✅ UPDATED
- `cost` - "$100-200/session"
- `time_to_results` - "3-4 weeks"
- `session_frequency` - "Weekly"
- `format` - "In-person"
- `session_length` - "60 minutes"
- **Array**: `barriers` - ["Finding the right therapist", "High cost without insurance", etc.]

#### doctors_specialists ✅ UPDATED
- `cost` - "$200-400/visit"
- `time_to_results` - "1-2 weeks"
- `wait_time` - "2-4 weeks"
- `insurance_coverage` - "Usually covered"
- **Array**: `barriers` - ["Long wait times", "Insurance requirements", etc.]

#### coaches_mentors ✅ UPDATED
- `cost` - "$100-250/session"
- `time_to_results` - "3-4 weeks"
- `session_frequency` - "Bi-weekly"
- `format` - "Virtual/Online"
- **Array**: `barriers` - ["Finding qualified coaches", "No insurance coverage", etc.]

#### Other Session Forms (NOT YET GENERATED)
- doctors_specialists
- coaches_mentors
- alternative_practitioners
- professional_services
- medical_procedures
- crisis_resources

### PURCHASE FORMS
#### products_devices
- `cost` - "$25-50"
- `time_to_results` - "Within days"
- `ease_of_use` - "Easy"
- `product_type` - "Physical device"
- `best_for` - "Physical tension from anxiety"
- **Array**: `issues` - ["Uncomfortable at first", etc.]

#### books_courses
- `cost` - "$50-100"
- `time_to_results` - "3-4 weeks"
- `format` - "Online course"
- `learning_difficulty` - "Moderate"
- `most_valuable_feature` - "Structured weekly lessons"
- **Array**: `challenges` - ["Time commitment required", etc.]

### APP FORM
#### apps_software ✅ UPDATED
- `cost` - "$12.99/month"
- `time_to_results` - "1-2 weeks"
- `usage_frequency` - "Daily"
- `subscription_type` - "Premium/Pro"
- `most_valuable_feature` - "Guided sessions"
- **Array**: `challenges` - ["Remembering to use daily", "Hard to maintain habit", etc.]

### COMMUNITY FORMS
#### support_groups
- `cost` - "Free"
- `time_to_results` - "First session"
- `meeting_frequency` - "Weekly"
- `format` - "Online only"
- `group_size` - "Varies significantly"
- **Array**: `challenges` - ["Variable quality of listeners", etc.]

#### groups_communities (NOT YET GENERATED)
- Will follow similar pattern

### LIFESTYLE FORMS
#### diet_nutrition
- `cost_impact` - "Somewhat more expensive"
- `time_to_results` - "3-4 weeks"
- `daily_prep_time` - "30-60 minutes"
- `adjustment_period` - "2-4 weeks"
- `long_term_sustainability` - "Maintained 3-6 months"
- **Array**: `challenges` - ["Meal planning", "Cost", etc.]

#### sleep
- `cost_impact` - "Free"
- `time_to_results` - "1-2 weeks"
- `adjustment_period` - "1-2 weeks"
- `previous_sleep_hours` - "5-6 hours"
- `long_term_sustainability` - "Maintained 6-12 months"
- **Array**: `challenges` - ["Hard to maintain schedule", etc.]

### HOBBY FORM (NOT YET GENERATED)
#### hobbies_activities
- `time_commitment`
- `startup_cost`
- `ongoing_cost`
- `time_to_results`
- `skill_level`
- **Array**: `barriers`

### FINANCIAL FORM (NOT YET GENERATED)
#### financial_products
- `cost_type`
- `financial_benefit`
- `time_to_results`
- `access_time`
- `minimum_requirement`
- **Array**: `key_features`

## Display Rules

1. **Always show exactly 4 non-array fields** (plus effectiveness in header)
2. **Array fields show as pills** below the main fields
3. **Single values should show as "(100%)"** not just the value
4. **Missing prevalence data** should show as "(No data)"

## Recent Updates (July 2025)

### New Array Fields Added
1. **apps_software**: Now includes `challenges` array field
   - Focus on daily life integration challenges
   - Examples: "Remembering to use daily", "Gets repetitive after a while", "Premium features expensive"
   - All 6 app solutions updated with challenges and prevalence data

2. **therapists_counselors, doctors_specialists, coaches_mentors**: Now include `barriers` array field
   - Focus on access and engagement barriers
   - Examples: "Finding the right therapist", "High cost without insurance", "Limited trained practitioners"
   - All 5 therapy solutions updated with barriers and prevalence data
   - Note: These display as "Barriers" in UI, not "Challenges"

### Array Field Naming Convention
- `side_effects` - Used for medical/physical interventions (medications, supplements, medical procedures)
- `challenges` - Used for practices and apps (meditation, exercise, habits, apps)
- `barriers` - Used for professional services (therapists, doctors, coaches)
- `issues` - Used for products/devices

## Data Issues to Fix

### Missing Prevalence Data
These categories have solutions but are missing ai_field_distributions:
- Most meditation_mindfulness solutions
- Most exercise_movement solutions
- Most habits_routines solutions
- All diet_nutrition solutions
- All sleep solutions
- Some products_devices solutions
- Most books_courses solutions
- Most support_groups solutions

### Field Mismatches
- **products_devices**: We stored 5 fields instead of 4
- **books_courses**: Used `learning_difficulty` instead of `ease_of_use`

## Frontend Display Configuration

### Display Rules for Array Fields
1. Array fields are stored in `challenge_options` table (used for all array types)
2. Frontend displays array field names based on category:
   - `side_effects` → "Side Effects" (or "Risks" for alternative_practitioners)
   - `challenges` → "Challenges"
   - `barriers` → "Barriers"
   - `issues` → "Issues"
3. Pills show with prevalence percentages when available
4. "Add yours" button appears for user contributions

### Key Fields Display (4 non-array fields per category)

#### Dosage Forms
- **medications**: cost, frequency, length_of_use, [time_to_results implicit]
- **supplements_vitamins**: cost, frequency, length_of_use, [time_to_results implicit]
- **natural_remedies**: cost, frequency, length_of_use, [time_to_results implicit]
- **beauty_skincare**: cost, frequency, product_type, [time_to_results implicit]

#### Practice Forms
- **meditation_mindfulness**: startup_cost, ongoing_cost, practice_length, [time_to_results implicit]
- **exercise_movement**: startup_cost, ongoing_cost, frequency, [time_to_results implicit]
- **habits_routines**: startup_cost, ongoing_cost, time_commitment, [time_to_results implicit]

#### Session Forms
- **therapists_counselors**: cost, session_frequency, format, [time_to_results implicit]
- **doctors_specialists**: cost, wait_time, insurance_coverage, [time_to_results implicit]
- **coaches_mentors**: cost, session_frequency, format, [time_to_results implicit]
- **alternative_practitioners**: cost, session_frequency, format, [time_to_results implicit]
- **professional_services**: cost, session_frequency, format, [time_to_results implicit]
- **medical_procedures**: cost, treatment_frequency, wait_time, [time_to_results implicit]
- **crisis_resources**: cost, availability, format, [time_to_results implicit]

#### App Form
- **apps_software**: cost, usage_frequency, subscription_type, [time_to_results implicit]

#### Purchase Forms
- **products_devices**: cost, ease_of_use, product_type, [time_to_results implicit]
- **books_courses**: cost, format, learning_difficulty, [time_to_results implicit]

#### Community Forms
- **support_groups**: cost, meeting_frequency, format, [time_to_results implicit]
- **groups_communities**: cost, meeting_frequency, group_size, [time_to_results implicit]

#### Lifestyle Forms
- **diet_nutrition**: cost_impact, daily_prep_time, long_term_sustainability, [time_to_results implicit]
- **sleep**: cost_impact, adjustment_period, long_term_sustainability, [time_to_results implicit]

#### Hobby Form
- **hobbies_activities**: time_commitment, startup_cost, ongoing_cost, [time_to_results implicit]

#### Financial Form
- **financial_products**: cost_type, financial_benefit, access_time, [time_to_results implicit]

Note: time_to_results is always tracked but may not be displayed as one of the 4 key fields