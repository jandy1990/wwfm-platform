# WWFM Form Dropdown Options Reference

This document contains the exact dropdown field options extracted from all 9 form files in `components/organisms/solutions/forms/`. These values are critical for data validation - any AI-generated data must use these exact values or the frontend will break.

## Universal Fields (Common Across All Forms)

### time_to_results (All Forms)
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

### Effectiveness Rating (All Forms)
Star rating system: 1-5 scale
- 1: "Not at all"
- 2: "Slightly"
- 3: "Moderate"
- 4: "Very"
- 5: "Extremely"

## Form-Specific Fields

### 1. AppForm.tsx

#### cost_type (Radio buttons)
- "one_time"
- "subscription"

#### One-time Cost Options (when cost_type = "one_time")
- "Free"
- "Under $10"
- "$10-$24.99"
- "$25-$49.99"
- "$50-$99.99"
- "$100-$249.99"
- "$250-$499.99"
- "$500-$999.99"
- "$1000+"

#### Subscription Cost Options (when cost_type = "subscription")
- "Free"
- "Under $5/month"
- "$5-10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "Over $100/month"

#### platform
- "iOS"
- "Android"
- "Web browser"
- "Desktop app"
- "Multiple platforms"

#### ease_of_use (REQUIRED)
- "Very easy to use"
- "Easy to use"
- "Moderate learning curve"
- "Difficult to use"
- "Very difficult to use"

### 2. CommunityForm.tsx

#### startup_cost
- "Free/No startup cost"
- "Don't remember"
- "Under $50"
- "$50-$99.99"
- "$100-$249.99"
- "$250-$499.99"
- "$500-$999.99"
- "$1000+"

#### ongoing_cost
- "Free/No ongoing cost"
- "Don't remember"
- "Under $10/month"
- "$10-$24.99/month"
- "$25-$49.99/month"
- "$50-$99.99/month"
- "$100-$199.99/month"
- "$200+/month"

#### group_size
- "1-on-1"
- "Small group (2-10 people)"
- "Medium group (10-25 people)"
- "Large group (25+ people)"
- "Online community (many members)"
- "Varies"

#### meeting_frequency (REQUIRED)
- "Daily"
- "Multiple times per week"
- "Weekly"
- "Fortnightly"
- "Monthly"
- "Multiple times per month"
- "As needed"
- "One-time only"

#### format (REQUIRED for some categories)
- "In-person only"
- "Online only"
- "Hybrid"
- "Phone/Conference call"

#### payment_frequency (REQUIRED)
- "Free"
- "Donation-based"
- "Per meeting/session"
- "Monthly"
- "Yearly"

#### commitment_level (REQUIRED for support_groups)
- "Drop-in (no commitment)"
- "Short-term (few weeks)"
- "Medium-term (few months)"
- "Long-term (6+ months)"
- "Ongoing indefinitely"

#### location_type (REQUIRED for social_groups)
- "Public spaces"
- "Private venues"
- "Members' homes"
- "Online only"
- "Mixed locations"

### 3. DosageForm.tsx

#### dosage_amount (REQUIRED)
- "As needed/PRN"
- "1-2 times per day"
- "3 times per day"
- "With meals"
- "Before meals"
- "At bedtime"
- "Weekly"
- "Other schedule"

#### dosage_form (REQUIRED for supplements, medications, beauty)
- "Tablets/Pills"
- "Capsules"
- "Liquid"
- "Powder"
- "Gummies"
- "Topical cream/gel"
- "Drops"
- "Spray"
- "Injection"
- "Other"

#### where_obtained (REQUIRED)
- "Prescription from doctor"
- "Over-the-counter pharmacy"
- "Online retailer"
- "Health food store"
- "Grocery store"
- "Beauty store"
- "Direct from manufacturer"
- "Other"

#### cost_range
- "Free (samples/covered)"
- "Under $10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "$100-200/month"
- "Over $200/month"
- "One-time cost under $50"
- "One-time cost $50-200"
- "One-time cost over $200"
- "Don't remember"

### 4. FinancialForm.tsx

#### cost_type (Dropdown - REQUIRED)
- "Free to use"
- "Subscription fee"
- "Transaction/usage fees"
- "Interest charged (loans/credit)"
- "Account maintenance fees"
- "One-time purchase/setup fee"

#### financial_benefit (Dropdown - REQUIRED)
- "No direct financial benefit"
- "Under $25/month saved/earned"
- "$25-100/month saved/earned"
- "$100-250/month saved/earned"
- "$250-500/month saved/earned"
- "$500-1000/month saved/earned"
- "Over $1000/month saved/earned"
- "Varies significantly (explain in notes)"

#### access_time (Dropdown - REQUIRED)
- "Instant approval"
- "Same day"
- "1-3 business days"
- "1-2 weeks"
- "2-4 weeks"
- "Over a month"

#### financial_product_type (Success Screen - Optional)
- "Savings account"
- "Checking account"
- "Credit card"
- "Budgeting app"
- "Investment platform"
- "Debt management"
- "Insurance product"
- "Loan"
- "Other"

#### ease_of_use (Success Screen - Optional)
- "Very easy to use"
- "Easy to use"
- "Moderate learning curve"
- "Difficult to use"
- "Very difficult to use"

### 5. HobbyForm.tsx

#### cost_type (Radio buttons)
- "startup"
- "ongoing"
- "both"

#### cost_range (varies by cost_type)
**Startup:**
- "Under $50"
- "$50-200"
- "$200-500"
- "$500-1000"
- "Over $1000"

**Ongoing:**
- "Under $25/month"
- "$25-100/month"
- "$100-300/month"
- "Over $300/month"

#### skill_level (REQUIRED)
- "Complete beginner"
- "Some experience"
- "Intermediate"
- "Advanced"
- "Expert level"

#### time_commitment (REQUIRED)
- "Under 1 hour/week"
- "1-3 hours/week"
- "3-5 hours/week"
- "5-10 hours/week"
- "10-20 hours/week"
- "Over 20 hours/week"

#### social_aspect (REQUIRED)
- "Solo activity"
- "Can be done alone or with others"
- "Better with others"
- "Requires group/community"

### 6. LifestyleForm.tsx - Diet & Nutrition and Sleep

#### weekly_prep_time (REQUIRED for diet_nutrition)
- "Under 1 hour/week"
- "1-2 hours/week"
- "2-4 hours/week"
- "4-6 hours/week"
- "6-8 hours/week"
- "Over 8 hours/week"

#### sleep_quality_change (REQUIRED for sleep - Step 1)
**Note:** Changed from previous_sleep_hours to sleep_quality_change (Nov 2025)
- "Dramatically better"
- "Significantly better"
- "Somewhat better"
- "No change"
- "Somewhat worse"
- "Much worse"

#### previous_sleep_hours (OPTIONAL - Success screen for sleep)
- "Under 4 hours"
- "4-5 hours"
- "5-6 hours"
- "6-7 hours"
- "7-8 hours"
- "Over 8 hours"
- "Highly variable"

#### current_sleep_hours (OPTIONAL - Success screen for sleep)
- "Under 4 hours"
- "4-5 hours"
- "5-6 hours"
- "6-7 hours"
- "7-8 hours"
- "Over 8 hours"
- "Highly variable"

#### usage_frequency (REQUIRED)
- "Daily"
- "5-6 times per week"
- "3-4 times per week"
- "1-2 times per week"
- "Weekly"
- "Few times a month"
- "As needed"

#### required_space (REQUIRED for fitness_equipment, organization_tools)
- "No extra space needed"
- "Small corner/desk space"
- "Dedicated room area"
- "Full room required"
- "Outdoor space needed"
- "Varies by use"

#### setup_complexity (REQUIRED for fitness_equipment)
- "No setup required"
- "Simple setup (under 30 min)"
- "Moderate setup (30min-2hrs)"
- "Complex setup (2+ hours)"
- "Professional installation needed"

#### durability (REQUIRED for fitness_equipment)
- "Very durable (5+ years)"
- "Durable (3-5 years)"
- "Moderate durability (1-3 years)"
- "Short-term use (under 1 year)"
- "Disposable/single use"

#### portability (REQUIRED for travel_gear)
- "Highly portable"
- "Somewhat portable"
- "Not very portable"
- "Not portable at all"

### 7. PracticeForm.tsx

#### startup_cost
- "Free/No startup cost"
- "Don't remember"
- "Under $50"
- "$50-$99.99"
- "$100-$249.99"
- "$250-$499.99"
- "$500-$999.99"
- "$1000+"

#### ongoing_cost
- "Free/No ongoing cost"
- "Don't remember"
- "Under $10/month"
- "$10-$24.99/month"
- "$25-$49.99/month"
- "$50-$99.99/month"
- "$100-$199.99/month"
- "$200+/month"

#### frequency (REQUIRED)
- "Daily"
- "5-6 times per week"
- "3-4 times per week"
- "1-2 times per week"
- "Weekly"
- "Few times a month"
- "As needed"

#### practice_length (REQUIRED for meditation_mindfulness)
- "Under 5 minutes"
- "5-10 minutes"
- "10-20 minutes"
- "20-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "Over 1 hour"

#### duration (REQUIRED for exercise_movement)
- "Under 15 minutes"
- "15-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "60-90 minutes"
- "90-120 minutes"
- "Over 2 hours"

#### time_commitment (REQUIRED for habits_routines)
- "Under 5 minutes"
- "5-10 minutes"
- "10-20 minutes"
- "20-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "1-2 hours"
- "2-3 hours"
- "More than 3 hours"
- "Multiple times throughout the day"
- "Ongoing/Background habit"

#### best_time (Success screen optional)
- "Early morning (5-7am)"
- "Morning (7-10am)"
- "Midday (10am-2pm)"
- "Afternoon (2-5pm)"
- "Evening (5-8pm)"
- "Night (8pm+)"
- "Anytime"

#### location (Success screen optional, not for habits_routines)
- "Home"
- "Gym/Studio"
- "Outdoors"
- "Office/Work"
- "Online/Virtual"
- "Multiple locations"

### 8. PurchaseForm.tsx

#### cost_type (Radio buttons)
- "one_time"
- "subscription"

#### cost_range (varies by cost_type)
**One-time:**
- "Free"
- "Under $20"
- "$20-50"
- "$50-100"
- "$100-250"
- "$250-500"
- "$500-1000"
- "Over $1000"

**Subscription:**
- "Free"
- "Under $10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "Over $100/month"

#### product_type (REQUIRED for products_devices)
- "Physical device"
- "Mobile app"
- "Software"
- "Wearable"
- "Subscription service"
- "Other"

#### ease_of_use (REQUIRED for products_devices)
- "Very easy to use"
- "Easy to use"
- "Moderate learning curve"
- "Difficult to use"
- "Very difficult to use"

#### format (REQUIRED for books_courses)
- "Physical book"
- "E-book"
- "Audiobook"
- "Online course"
- "Video series"
- "Workbook/PDF"
- "App-based"
- "Other"

#### learning_difficulty (REQUIRED for books_courses)
- "Beginner friendly"
- "Some experience helpful"
- "Intermediate level"
- "Advanced level"
- "Expert level"

#### completion_status (Success screen optional for books_courses)
- "Completed fully"
- "Completed partially"
- "Still in progress"
- "Abandoned"

### 9. SessionForm.tsx

#### cost_type (Radio buttons)
- "per_session" (therapists, coaches, alternative practitioners, doctors, professional services, crisis resources)
- "monthly" (professional services, crisis resources only)
- **Note:** medical_procedures has NO radio button - cost type is auto-set to 'total'

#### cost_range (varies by category and cost_type)
**Crisis Resources:**
- "Free"
- "Donation-based"
- "Sliding scale"
- "Don't remember"

**Medical Procedures (total):**
- "Free"
- "Under $100"
- "$100-500"
- "$500-1,000"
- "$1,000-5,000"
- "$5,000-10,000"
- "$10,000-25,000"
- "$25,000-50,000"
- "Over $50,000"
- "Don't remember"

**Per Session:**
- "Free"
- "Under $50"
- "$50-100"
- "$100-200"
- "$200-300"
- "$300-500"
- "Over $500"
- "Don't remember"

**Monthly:**
- "Free"
- "Under $100"
- "$100-300"
- "$300-500"
- "$500-1000"
- "Over $1000"
- "Don't remember"

#### session_frequency (Not for crisis_resources)
- "One-time only"
- "As needed"
- "Multiple times per week"
- "Weekly"
- "Fortnightly"
- "Monthly"
- "Every 2-3 months"
- "Other"

#### format
**Crisis Resources:**
- "Phone"
- "Text/Chat"
- "Online"

**Medical Procedures:**
- "Outpatient"
- "Inpatient"
- "In-office"
- "At-home"

**Others:**
- "In-person"
- "Virtual/Online"
- "Phone"
- "Hybrid"

#### session_length
**REQUIRED for:** therapists_counselors, coaches_mentors, alternative_practitioners
**OPTIONAL (success screen) for:** doctors_specialists, professional_services

- "Under 15 minutes"
- "15-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "60-90 minutes"
- "90-120 minutes"
- "Over 2 hours"
- "Varies"

#### wait_time (REQUIRED for medical_procedures, optional for others)
**Doctors/General:**
- "Same day"
- "Within a week"
- "1-2 weeks"
- "2-4 weeks"
- "1-2 months"
- "2+ months"

**Medical Procedures:**
- "Same day"
- "Within a week"
- "1-2 weeks"
- "2-4 weeks"
- "1-3 months"
- "3-6 months"
- "6-12 months"
- "1-2 years"
- "Over 2 years"

#### insurance_coverage
- "Fully covered by insurance"
- "Partially covered by insurance"
- "Not covered by insurance/self-funded"
- "Covered by government program (Medicare, NHS, provincial coverage, etc.)"

#### specialty (REQUIRED for professional_services)
**Note:** Options are alphabetized. Selecting "Other (please specify)" reveals a text field.

- "Career/Business coach"
- "Creative services (photographer, designer, writer)"
- "Digital marketing/Tech specialist"
- "Financial advisor/Planner"
- "Hair/Beauty professional"
- "Home services (cleaning, handyman, etc.)"
- "Legal services"
- "Nutritionist"
- "Personal trainer/Fitness coach"
- "Pet services"
- "Professional organizer"
- "Tutor/Educational specialist"
- "Virtual assistant"
- "Other (please specify)" - Opens text field for custom service type

#### response_time (REQUIRED for crisis_resources)
- "Immediate"
- "Within 5 minutes"
- "Within 30 minutes"
- "Within hours"
- "Within 24 hours"
- "Within a couple of days"
- "More than a couple of days"

#### completed_treatment (Success screen optional)
- "Yes"
- "No"
- "Still ongoing"

#### typical_length (Success screen optional for therapists/coaches/doctors/alternative only)
**Note:** NOT shown for medical_procedures (redundant with frequency), professional_services, or crisis_resources
- "Single session only"
- "2-4 sessions"
- "5-8 sessions"
- "8-12 sessions"
- "3-6 months"
- "6-12 months"
- "1-2 years"
- "Ongoing/Indefinite"

#### availability (Success screen optional for crisis_resources, multi-select)
- "24/7"
- "Business hours"
- "Evenings"
- "Weekends"
- "Immediate response"
- "Callback within 24hrs"

## Multi-Select vs Single-Select Fields

### Multi-Select Fields (Arrays)
- challenges (all forms)
- side_effects (SessionForm for medical categories)
- availability (SessionForm success screen for crisis_resources)

### Single-Select Fields (Dropdowns)
All other fields listed above are single-select dropdowns.

## Category-Specific Challenge Options

### Meditation/Mindfulness (PracticeForm)
- "None"
- "Difficulty concentrating"
- "Restlessness"
- "Emotional overwhelm"
- "Physical discomfort"
- "Anxiety increased"
- "Boredom"
- "Difficulty staying awake"
- "Intrusive thoughts"
- "Noisy environment"
- "Pet/child interruptions"
- "Time management issues"
- "Initially worse before better"

### Exercise/Movement (PracticeForm)
- "None"
- "Physical limitations"
- "Time constraints"
- "Weather dependent"
- "Gym intimidation"
- "Lack of motivation"
- "Injury/soreness"
- "Equipment costs"
- "Finding good instruction"
- "Progress plateaus"
- "Schedule conflicts"
- "Energy levels"
- "Initially worse before better"

### Habits/Routines (PracticeForm)
- "None"
- "Forgot to do it"
- "Lost motivation after initial enthusiasm"
- "Takes too much time"
- "Hard to do when tired"
- "Broke the chain and gave up"
- "Results too slow"
- "Life got in the way"
- "Felt silly or self-conscious"
- "Too ambitious at start"
- "No immediate reward"
- "Competing priorities"
- "Didn't track progress"
- "All-or-nothing thinking"
- "Initially made things worse"

### Products/Devices (PurchaseForm)
- "None"
- "Build quality concerns"
- "Difficult to set up"
- "Doesn't work as advertised"
- "Poor customer support"
- "Battery/power issues"
- "Compatibility problems"
- "Durability concerns"
- "Missing features"

### Books/Courses (PurchaseForm)
- "None"
- "Too basic for my level"
- "Too advanced for my level"
- "Not enough practical examples"
- "Too theoretical"
- "Outdated information"
- "Poor organization"
- "Too long/verbose"
- "Instructor hard to follow"
- "Technical platform issues"
- "Didn't match description"
- "Incomplete content"
- "No community support"

### Professional Services (SessionForm)
- "None"
- "Finding qualified professionals"
- "High cost"
- "Limited availability"
- "Not covered by insurance"
- "Unclear about what I need"
- "Too many options to choose from"
- "Scheduling conflicts"
- "Location/distance issues"
- "Concerns about confidentiality"

### Crisis Resources (SessionForm)
- "None"
- "Long wait times"
- "Difficulty getting through"
- "Not the right type of help"
- "Felt judged or dismissed"
- "Language barriers"
- "Technical issues with platform"
- "Limited hours of operation"
- "Needed different level of care"
- "Privacy concerns"

## Critical Notes for Data Validation

1. **Exact Match Required**: All generated data must use these exact string values, including capitalization and punctuation.

2. **Cost Type Dependencies**: Cost ranges change based on the selected cost_type radio button.

3. **Category Dependencies**: Some fields are only required for specific categories.

4. **Multi-Select Handling**: Challenge and side effect arrays should filter out "None" when other options are selected.

5. **Success Screen Fields**: Some fields are only available on the success screen and are optional.

6. **Database Fallbacks**: Some forms query the database for challenge/side effect options with fallbacks to hardcoded arrays.

7. **Don't Remember Option**: Most cost fields include "Don't remember" as an option, which maps to "Unknown" in the cost field and "unknown" in cost_type.

This reference ensures that AI-generated data will be compatible with the frontend form validation and prevent data quality failures.