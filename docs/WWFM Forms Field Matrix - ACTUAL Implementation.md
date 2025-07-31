# WWFM Forms Field Matrix - ACTUAL Implementation

## Overview
This document reflects what is ACTUALLY stored in the database and what the frontend displays.

## Universal Fields (All Forms)
- **Effectiveness** (1-5 stars) - Always shown in header
- **Time to Results** - Always shown as one of 4 fields

## Required Fields by Category (What We Actually Generated)

### DOSAGE FORMS
#### medications, supplements_vitamins, natural_remedies
- `cost` - "$10-25/month" (dropdown - conditional based on cost type)
- `time_to_results` - "3-4 weeks" (dropdown)
- `frequency` - "Once daily" (dropdown)
- `length_of_use` - "3-6 months" (dropdown)
- **Array**: `side_effects` - ["Nausea", "Headache", etc.]
- **Note**: Cost field moved to success screen (optional)

#### beauty_skincare
- `cost` - (dropdown - conditional based on cost type)
- `time_to_results` - (dropdown)
- `skincareFrequency` - (dropdown - special skincare options like "Twice daily (AM & PM)", "Morning only", etc.)
- `length_of_use` - (dropdown)
- **Array**: `side_effects`
- **Note**: Cost field moved to success screen (optional), uses skincareFrequency instead of regular frequency

### PRACTICE FORMS
#### meditation_mindfulness
- `startup_cost` - "Free/No startup cost" (dropdown with precise ranges)
- `ongoing_cost` - "Free/No ongoing cost" (dropdown with precise ranges)
- `time_to_results` - "1-2 weeks" (dropdown)
- `practice_length` - "10-20 minutes" (dropdown)
- `frequency` - "Daily" (dropdown)
- **Array**: `challenges` - ["Difficulty concentrating", etc.]

#### exercise_movement
- `startup_cost` - "Free/No startup cost" (dropdown with precise ranges)
- `ongoing_cost` - "$25-$49.99/month" (dropdown with precise ranges)
- `time_to_results` - "1-2 weeks" (dropdown)
- `frequency` - "3-4 times per week" (dropdown)
- `duration` - "30-45 minutes" (dropdown)
- **Array**: `challenges` - ["Weather dependent", etc.]

#### habits_routines
- `startup_cost` - "Free/No startup cost" (dropdown with precise ranges)
- `ongoing_cost` - "Free/No ongoing cost" (dropdown with precise ranges)
- `time_to_results` - "Within days" (dropdown)
- `time_commitment` - "5-15 minutes" (dropdown)
- `frequency` - "Daily" (dropdown)
- **Array**: `challenges` - ["Easy to forget", etc.]

### SESSION FORMS
#### therapists_counselors ✅ UPDATED
- `cost` - "$100-200/session" (required)
- `time_to_results` - "3-4 weeks" (required)
- `session_frequency` - "Weekly" (optional)
- `format` - "In-person" (optional)
- **Array**: `barriers` - ["Finding the right therapist", "High cost without insurance", etc.]

#### doctors_specialists ✅ UPDATED
- `cost` - "$200-400/visit"
- `time_to_results` - "1-2 weeks"
- `wait_time` - "2-4 weeks"
- `insurance_coverage` - "Usually covered"
- **Array**: `barriers` - ["Long wait times", "Insurance requirements", etc.]

#### coaches_mentors ✅ UPDATED
- `cost` - "$100-250/session" (required)
- `time_to_results` - "3-4 weeks" (required)
- `session_frequency` - "Bi-weekly" (optional)
- `format` - "Virtual/Online" (optional)
- **Array**: `barriers` - ["Finding qualified coaches", "No insurance coverage", etc.]

#### Other Session Forms (NOT YET GENERATED)
- doctors_specialists
- coaches_mentors
- alternative_practitioners
- professional_services
- medical_procedures
- crisis_resources

### PURCHASE FORMS
#### products_devices ✅ UPDATED
- `cost` - "$25-50" (dropdown)
- `time_to_results` - "Within days" (dropdown)
- `ease_of_use` - "Easy to use" (dropdown - now with full descriptive options)
- `product_type` - "Physical device" (dropdown)
- **Array**: `issues` - ["Build quality concerns", "Difficult to set up", etc.]

#### books_courses ✅ UPDATED
- `cost` - "$50-100" (dropdown)
- `time_to_results` - "3-4 weeks" (dropdown)
- `format` - "Online course" (dropdown - optional)
- `learning_difficulty` - "Intermediate level" (dropdown - now with proper difficulty levels)
- **Array**: `issues` - ["Too theoretical", "Not enough practical examples", etc.]

### APP FORM
#### apps_software ✅ UPDATED
- `subscription_type` - "Monthly subscription" (dropdown)
- `cost` - "$10-$19.99/month" (conditional dropdown based on subscription_type - auto-set to "Free" for "Free version")
- `time_to_results` - "1-2 weeks" (dropdown)
- `usage_frequency` - "Daily" (dropdown)
- **Array**: `challenges` - ["Remembering to use daily", "Hard to maintain habit", etc.]
- **Note**: When subscription_type is "Free version", cost automatically becomes "Free"

### COMMUNITY FORMS
#### support_groups
- `cost` - "Free"
- `time_to_results` - "First session"
- `meeting_frequency` - "Weekly"
- `format` - "Online only"
- `group_size` - "Varies significantly"
- **Array**: `challenges` - ["Variable quality of listeners", etc.]

#### groups_communities ✅ UPDATED
- `cost` - "Free" (dropdown with per-meeting and monthly options)
- `time_to_results` - "First session" (dropdown)
- `meeting_frequency` - "Weekly" (dropdown)
- `format` - "In-person only" (dropdown)
- `group_size` - "Medium (10-20 people)" (dropdown)
- **Array**: `challenges` - ["Hard to break in socially", "Activity level inconsistent", etc.]

### LIFESTYLE FORMS ✅ UPDATED
#### diet_nutrition
- `cost` - "Somewhat more expensive" (dropdown - relative cost impact)
- `time_to_results` - "3-4 weeks" (dropdown)
- `weekly_prep_time` - "2-4 hours/week" (dropdown - changed from daily)
- `adjustment_period` - "2-4 weeks" (dropdown)
- `long_term_sustainability` - "Maintained 3-6 months" (dropdown)
- **Array**: `challenges` - ["Meal planning time", "Higher grocery costs", etc.]

#### sleep
- `cost` - "Free" (dropdown - one-time costs or free)
- `time_to_results` - "1-2 weeks" (dropdown)
- `adjustment_period` - "1-2 weeks" (dropdown)
- `previous_sleep_hours` - "5-6 hours" (dropdown)
- `long_term_sustainability` - "Maintained 6-12 months" (dropdown)
- **Array**: `challenges` - ["Hard to maintain schedule", "Partner's different schedule", etc.]

### HOBBY FORM ✅ IMPLEMENTED
#### hobbies_activities
- `time_commitment` - "5-10 hours/week" (weekly dropdown)
- `startup_cost` - "$50-$99.99" (dropdown with precise ranges)
- `ongoing_cost` - "$25-$49.99/month" (dropdown with precise ranges)
- `time_to_enjoyment` - "Within first week" (dropdown)
- **Array**: `barriers` - ["Finding time", "Equipment costs", etc.]
- **Note**: `skill_level` is optional field on success screen

### FINANCIAL FORM ✅ UPDATED
#### financial_products
- `cost_type` - "Free to use" (dropdown - simplified options)
- `financial_benefit` - "$100-250/month saved/earned" (dropdown)
- `time_to_results` - "1-2 weeks" (dropdown)
- `access_time` - "1-3 business days" (dropdown)
- **Array**: `barriers` - ["Credit score too low", "Income requirements not met", "Complex application process", etc.]
- **Optional**: `minimum_requirements` - Multi-select checkbox array

## Display Rules

1. **Always show exactly 4 non-array fields** (plus effectiveness in header)
2. **Array fields show as pills** below the main fields
3. **Single values should show as "(100%)"** not just the value
4. **Missing prevalence data** should show as "(No data)"

## Recent Updates (July 2025)

### Forms Implemented
1. **DosageForm** - Complete with 3-step flow and success screen
2. **AppForm** - Complete with auto-cost logic for free versions
3. **HobbyForm** - Complete with time commitment focus
4. **PracticeForm** - Complete with category-specific fields

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

### Forms vs Generated Data Mismatches
- **DosageForm**: Cost field now on success screen (optional), not required
- **Beauty/Skincare**: Uses `skincareFrequency` field name, not `frequency`
- **AppForm**: Cost auto-set to "Free" when subscription_type is "Free version"
- **HobbyForm**: `skill_level` is optional on success screen, not required field

## Form Implementation Details

### DosageForm (IMPLEMENTED)
- **Step 1**: Dosage details + effectiveness + time to results
- **Step 2**: Side effects selection
- **Step 3**: Failed solutions (optional)
- **Success Screen**: Optional fields including cost, brand, form, other info
- **Note**: Cost moved to success screen to simplify required fields

### AppForm (IMPLEMENTED)
- **Step 1**: App details (usage frequency, subscription type, cost) + effectiveness + time to results
- **Step 2**: Challenges selection
- **Step 3**: Failed solutions (optional)
- **Success Screen**: Optional fields including platform, other info
- **Auto-logic**: When subscription_type is "Free version", cost is automatically set to "Free"

### HobbyForm (IMPLEMENTED)
- **Step 1**: Hobby details (time commitment, startup cost, ongoing cost, time to enjoyment) + effectiveness
- **Step 2**: Barriers selection
- **Step 3**: Failed solutions (optional)
- **Success Screen**: Optional fields including skill level, other info

### PracticeForm (IMPLEMENTED)
- **Step 1**: Practice details (startup cost, ongoing cost, frequency, category-specific field) + effectiveness + time to results
- **Step 2**: Challenges selection
- **Step 3**: Failed solutions (optional)
- **Success Screen**: Optional fields including best time, location, other info
- **Category-specific fields**:
  - meditation_mindfulness: practice_length
  - exercise_movement: duration
  - habits_routines: time_commitment

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
- **beauty_skincare**: cost, frequency, length_of_use, [time_to_results implicit]

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
- **apps_software**: subscription_type, cost, usage_frequency, [time_to_results implicit]

#### Purchase Forms ✅ UPDATED
- **products_devices**: cost, ease_of_use, product_type, [time_to_results implicit]
- **books_courses**: cost, format, learning_difficulty, [time_to_results implicit]

#### Community Forms ✅ UPDATED
- **support_groups**: cost, meeting_frequency, format, group_size, [time_to_results implicit]
- **groups_communities**: cost, meeting_frequency, format, group_size, [time_to_results implicit]

#### Lifestyle Forms ✅ UPDATED
- **diet_nutrition**: cost, weekly_prep_time, adjustment_period, long_term_sustainability, [time_to_results implicit]
- **sleep**: cost, adjustment_period, previous_sleep_hours, long_term_sustainability, [time_to_results implicit]

#### Hobby Form
- **hobbies_activities**: time_commitment, startup_cost, ongoing_cost, [time_to_enjoyment implicit]

#### Financial Form ✅ UPDATED
- **financial_products**: cost_type, financial_benefit, access_time, [time_to_results implicit]

Note: time_to_results is always tracked but may not be displayed as one of the 4 key fields

## Dropdown Options Reference

### Length of Use (Dosage Forms)
- "Less than 1 month"
- "1-3 months"
- "3-6 months"
- "6-12 months"
- "1-2 years"
- "Over 2 years"
- "As needed"
- "Still using"

### Frequency (Medications/Supplements/Natural Remedies)
- "once daily"
- "twice daily"
- "three times daily"
- "four times daily"
- "as needed"
- "every other day"
- "twice weekly"
- "weekly"
- "monthly"

### Frequency (Beauty/Skincare) - stored as skincareFrequency
- Value: "twice_daily" → Display: "Twice daily"
- Value: "once_daily_am" → Display: "Morning only"
- Value: "once_daily_pm" → Display: "Night only"
- Value: "every_other_day" → Display: "Every other day"
- Value: "2-3_weekly" → Display: "2-3x per week"
- Value: "weekly" → Display: "Weekly"
- Value: "spot_treatment" → Display: "Spot treatment"

### Subscription Type (Apps)
- "Free version"
- "Monthly subscription"
- "Annual subscription"
- "One-time purchase"

### Cost - Apps (Conditional based on subscription type)

#### Monthly subscription:
- "Under $5/month"
- "$5-$9.99/month"
- "$10-$19.99/month"
- "$20-$49.99/month"
- "$50-$99.99/month"
- "$100+/month"

#### Annual subscription:
- "Under $50/year"
- "$50-$99.99/year"
- "$100-$199.99/year"
- "$200-$499.99/year"
- "$500-$999.99/year"
- "$1000+/year"

#### One-time purchase:
- "Under $5"
- "$5-$9.99"
- "$10-$24.99"
- "$25-$49.99"
- "$50-$99.99"
- "$100-$249.99"
- "$250+"

### Usage Frequency (Apps)
- "Multiple times daily"
- "Daily"
- "Few times a week"
- "Weekly"
- "As needed"

### Time Commitment (Hobbies) - Weekly
- "Less than 1 hour/week"
- "1-3 hours/week"
- "3-5 hours/week"
- "5-10 hours/week"
- "10-15 hours/week"
- "15-20 hours/week"
- "20-30 hours/week"
- "30+ hours/week"

### Startup Cost (Hobbies)
- "Free/No startup cost"
- "Under $50"
- "$50-$99.99"
- "$100-$249.99"
- "$250-$499.99"
- "$500-$999.99"
- "$1000-$2499.99"
- "$2500+"

### Ongoing Cost - Monthly (Hobbies)
- "Free/No ongoing cost"
- "Under $10/month"
- "$10-$24.99/month"
- "$25-$49.99/month"
- "$50-$99.99/month"
- "$100-$199.99/month"
- "$200+/month"

### Time to Enjoyment (Hobbies)
- "Immediately enjoyable"
- "Within first week"
- "2-4 weeks"
- "1-2 months"
- "3-6 months"
- "Took persistence"

### Time Commitment (Hobbies) - Per Week
- "Less than 1 hour/week"
- "1-3 hours/week"
- "3-5 hours/week"
- "5-10 hours/week"
- "10-15 hours/week"
- "15-20 hours/week"
- "20-30 hours/week"
- "30+ hours/week"

### Skill Level (Hobbies - Optional)
- "Still beginner"
- "Intermediate"
- "Advanced"
- "Expert"

### Frequency (Practice Forms)
- "Daily"
- "5-6 times per week"
- "3-4 times per week" 
- "1-2 times per week"
- "Weekly"
- "Few times a month"
- "As needed"

### Practice Length (Meditation)
- "Under 5 minutes"
- "5-10 minutes"
- "10-20 minutes"
- "20-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "Over 1 hour"

### Duration (Exercise)
- "Under 15 minutes"
- "15-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "60-90 minutes"
- "90-120 minutes"
- "Over 2 hours"

### Time Commitment (Habits)
- "Under 5 minutes"
- "5-15 minutes"
- "15-30 minutes"
- "30-60 minutes"
- "1-2 hours"
- "Throughout the day"