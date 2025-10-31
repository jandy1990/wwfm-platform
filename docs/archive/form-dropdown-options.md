# Form Dropdown Options Documentation

This document provides a comprehensive list of all dropdown fields and their options for each form in the WWFM platform. Each form handles multiple solution categories through smart routing.

## 1. AppForm
**Categories:** `apps_software`
**File:** `components/organisms/solutions/forms/AppForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Usage Frequency
**Options:**
- "Select frequency"
- "Multiple times daily"
- "Daily"
- "Few times a week"
- "Weekly"
- "As needed"

#### Subscription Type
**Options:**
- "Select type"
- "Free version"
- "Monthly subscription"
- "Annual subscription"
- "One-time purchase"

#### Cost (conditional based on subscription type)
**Monthly Subscription:**
- "Under $5/month"
- "$5-$9.99/month"
- "$10-$19.99/month"
- "$20-$49.99/month"
- "$50-$99.99/month"
- "$100+/month"

**Annual Subscription:**
- "Under $50/year"
- "$50-$99.99/year"
- "$100-$199.99/year"
- "$200-$499.99/year"
- "$500-$999.99/year"
- "$1000+/year"

**One-time Purchase:**
- "Under $5"
- "$5-$9.99"
- "$10-$24.99"
- "$25-$49.99"
- "$50-$99.99"
- "$100-$249.99"
- "$250+"

### Optional Dropdown Fields (Success Screen):

#### Platform
**Options:**
- "Select platform"
- "iOS (iPhone/iPad)"
- "Android"
- "Web/Browser"
- "Windows"
- "Mac"
- "Multiple platforms"
- "Chrome Extension"
- "Other"

---

## 2. CommunityForm
**Categories:** `groups_communities`, `support_groups`
**File:** `components/organisms/solutions/forms/CommunityForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Payment Frequency
**Options:**
- "How do you pay?"
- "Free or donation-based"
- "Per meeting/session"
- "Monthly"
- "Yearly"

#### Cost Range (conditional based on payment frequency)
**Free:**
- "Free"
- "Donation-based"

**Per Meeting:**
- "Under $10/meeting"
- "$10-$19.99/meeting"
- "$20-$49.99/meeting"
- "$50-$99.99/meeting"
- "Over $100/meeting"

**Monthly:**
- "Under $20/month"
- "$20-$49.99/month"
- "$50-$99.99/month"
- "$100-$199.99/month"
- "$200-$499.99/month"
- "Over $500/month"

**Yearly:**
- "Under $50/year"
- "$50-$99.99/year"
- "$100-$249.99/year"
- "$250-$499.99/year"
- "$500+/year"

#### Meeting Frequency
**Options:**
- "How often?"
- "Daily"
- "Several times per week"
- "Weekly"
- "Bi-weekly"
- "Monthly"
- "As needed"
- "Special events only"

#### Format
**Options:**
- "Meeting format"
- "In-person only"
- "Online only"
- "Hybrid (both)"
- "Phone/Conference call"

#### Group Size
**Options:**
- "How many people?"
- "Small (under 10 people)"
- "Medium (10-20 people)"
- "Large (20-50 people)"
- "Very large (50+ people)"
- "Varies significantly"
- "One-on-one"

### Optional Dropdown Fields (Success Screen):

#### Commitment Type
**Options:**
- "Commitment type"
- "Drop-in anytime"
- "Regular attendance expected"
- "Course/Program (fixed duration)"
- "Ongoing open group"

#### Accessibility Level
**Options:**
- "Beginner friendly?" / "Newcomer welcoming?" (varies by category)
- "Very welcoming"
- "Welcoming"
- "Neutral"
- "Some experience helpful"
- "Experience required"

#### Leadership Style (support_groups only)
**Options:**
- "Leadership style"
- "Peer-led"
- "Professional facilitator"
- "Rotating leadership"
- "Mixed leadership"
- "Self-organizing"

---

## 3. DosageForm
**Categories:** `supplements_vitamins`, `medications`, `natural_remedies`, `beauty_skincare`
**File:** `components/organisms/solutions/forms/DosageForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Dosage Unit (excluding beauty_skincare)
**Supplements/Vitamins:**
- "mg", "mcg", "IU", "g", "ml", "billion CFU", "other"

**Medications:**
- "mg", "mcg", "g", "ml", "units", "meq", "other"

**Natural Remedies:**
- "mg", "g", "ml", "tsp", "tbsp", "cups", "other"

#### Frequency (excluding beauty_skincare)
**Options:**
- "Select frequency"
- "once daily"
- "twice daily"
- "three times daily"
- "four times daily"
- "as needed"
- "every other day"
- "twice weekly"
- "weekly"
- "monthly"

#### Skincare Frequency (beauty_skincare only)
**Options:**
- "Select frequency"
- "Twice daily (AM & PM)"
- "Once daily (morning)"
- "Once daily (night)"
- "Every other day"
- "2-3 times per week"
- "Weekly"
- "As needed (spot treatment)"

#### Length of Use
**Options:**
- "Select duration"
- "Less than 1 month"
- "1-3 months"
- "3-6 months"
- "6-12 months"
- "1-2 years"
- "Over 2 years"
- "As needed"
- "Still using"

### Optional Dropdown Fields (Success Screen):

#### Cost Type
**Options:**
- "Monthly" or "One-time" (button selection)

#### Cost Range (conditional based on cost type)
**Monthly:**
- "Under $10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "$100-200/month"
- "$200-500/month"
- "$500-1000/month"
- "Over $1000/month"

**One-time:**
- "Under $20"
- "$20-50"
- "$50-100"
- "$100-250"
- "$250-500"
- "$500-1000"
- "Over $1000"

**Special Options:**
- "Free"
- "I don't remember"

#### Form Factor (not beauty_skincare)
**Options:**
- "Form factor"
- "Tablet/Pill"
- "Capsule"
- "Softgel"
- "Liquid/Syrup"
- "Powder"
- "Gummy"
- "Chewable"
- "Sublingual"
- "Lozenge"
- "Drops"
- "Spray"
- "Patch"
- "Cream/Gel"
- "Injection"
- "Tea/Infusion"
- "Tincture"
- "Other"

---

## 4. FinancialForm
**Categories:** `financial_products`
**File:** `components/organisms/solutions/forms/FinancialForm.tsx`

### Required Dropdown Fields:

#### Cost Type
**Options:**
- "Select cost type"
- "Free to use"
- "Subscription fee"
- "Transaction/usage fees"
- "Interest charged (loans/credit)"
- "Account maintenance fees"
- "One-time purchase/setup fee"

#### Financial Benefit
**Options:**
- "Select savings or earnings..."
- "No direct financial benefit"
- "Under $25/month saved/earned"
- "$25-100/month saved/earned"
- "$100-250/month saved/earned"
- "$250-500/month saved/earned"
- "$500-1000/month saved/earned"
- "Over $1000/month saved/earned"
- "Varies significantly (explain in notes)"

#### Access Time
**Options:**
- "Select access time..."
- "Instant approval"
- "Same day"
- "1-3 business days"
- "1-2 weeks"
- "2-4 weeks"
- "Over a month"

#### Time to Impact
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

### Optional Dropdown Fields (Success Screen):

#### Ease of Use
**Options:**
- "Ease of use"
- "Very easy"
- "Easy"
- "Moderate"
- "Complex"
- "Very complex"

#### Minimum Requirements (checkboxes)
**Options:**
- "None"
- "Bank account required"
- "Minimum balance ($500+)"
- "Minimum balance ($1000+)"
- "Minimum balance ($5000+)"
- "Good credit (650+)"
- "Excellent credit (750+)"
- "Proof of income"
- "Business entity"
- "Collateral required"
- "Age 18+ required"
- "US citizenship/residency"
- "Other requirements"

---

## 5. HobbyForm
**Categories:** `hobbies_activities`
**File:** `components/organisms/solutions/forms/HobbyForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still learning to enjoy it"

#### Initial Startup Cost
**Options:**
- "Select startup cost"
- "Free/No startup cost"
- "Don't remember"
- "Under $50"
- "$50-$100"
- "$100-$250"
- "$250-$500"
- "$500-$1,000"
- "$1,000-$2,500"
- "$2,500-$5,000"
- "Over $5,000"

#### Monthly Ongoing Cost
**Options:**
- "Select monthly cost"
- "Free/No ongoing cost"
- "Don't remember"
- "Under $25/month"
- "$25-$50/month"
- "$50-$100/month"
- "$100-$200/month"
- "$200-$500/month"
- "Over $500/month"

#### Time Commitment
**Options:**
- "Select time"
- "15-30 minutes"
- "30-60 minutes"
- "1-2 hours"
- "2-4 hours"
- "Half day"
- "Full day"
- "Varies significantly"

#### Frequency
**Options:**
- "Select frequency"
- "Daily"
- "Few times a week"
- "Weekly"
- "Few times a month"
- "Monthly"
- "Occasionally"

---

## 6. LifestyleForm
**Categories:** `diet_nutrition`, `sleep`
**File:** `components/organisms/solutions/forms/LifestyleForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Cost Impact
**Diet/Nutrition:**
- "Compared to previous diet"
- "Significantly more expensive"
- "Somewhat more expensive"
- "About the same"
- "Somewhat less expensive"
- "Significantly less expensive"

**Sleep:**
- "Any costs?"
- "Free"
- "Under $50"
- "$50-$100"
- "$100-$200"
- "Over $200"

#### Weekly Prep Time (diet_nutrition only)
**Options:**
- "Time spent on meal planning/prep"
- "No extra time"
- "Under 1 hour/week"
- "1-2 hours/week"
- "2-4 hours/week"
- "4-6 hours/week"
- "6-8 hours/week"
- "Over 8 hours/week"

#### Previous Sleep Hours (sleep only)
**Options:**
- "Before this change"
- "Under 4 hours"
- "4-5 hours"
- "5-6 hours"
- "6-7 hours"
- "7-8 hours"
- "Over 8 hours"
- "Highly variable"

#### Still Following (radio buttons)
**Options:**
- "Yes, still following it"
- "No, I stopped"

#### Sustainability Reason (conditional dropdown)
**If Still Following = Yes:**
- "Select (optional)"
- "Easy to maintain now"
- "Takes effort but manageable"
- "Getting harder over time"
- "Struggling but continuing"

**If Still Following = No:**
- "Select (optional)"
- "Too hard to sustain"
- "No longer needed (problem solved)"
- "Found something better"
- "Life circumstances changed"
- "Other"

### Optional Dropdown Fields (Success Screen):

#### Social Impact (diet_nutrition only)
**Options:**
- "Social challenges?"
- "No impact"
- "Slightly challenging"
- "Moderately challenging"
- "Very challenging"
- "Deal breaker"

#### Sleep Quality Change (sleep only)
**Options:**
- "Quality improvement?"
- "Dramatically better"
- "Significantly better"
- "Somewhat better"
- "No change"
- "Somewhat worse"
- "Much worse"

---

## 7. PracticeForm
**Categories:** `meditation_mindfulness`, `exercise_movement`, `habits_routines`
**File:** `components/organisms/solutions/forms/PracticeForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Initial Startup Cost
**Options:**
- "Select startup cost"
- "Free/No startup cost"
- "Don't remember"
- "Under $50"
- "$50-$99.99"
- "$100-$249.99"
- "$250-$499.99"
- "$500-$999.99"
- "$1000+"

#### Monthly Ongoing Cost
**Options:**
- "Select ongoing cost"
- "Free/No ongoing cost"
- "Don't remember"
- "Under $10/month"
- "$10-$24.99/month"
- "$25-$49.99/month"
- "$50-$99.99/month"
- "$100-$199.99/month"
- "$200+/month"

#### Frequency
**Options:**
- "Select frequency"
- "Daily"
- "5-6 times per week"
- "3-4 times per week"
- "1-2 times per week"
- "Weekly"
- "Few times a month"
- "As needed"

#### Practice Length (meditation_mindfulness only)
**Options:**
- "Select practice length"
- "Under 5 minutes"
- "5-10 minutes"
- "10-20 minutes"
- "20-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "Over 1 hour"

#### Session Duration (exercise_movement only)
**Options:**
- "Select duration"
- "Under 15 minutes"
- "15-30 minutes"
- "30-45 minutes"
- "45-60 minutes"
- "60-90 minutes"
- "90-120 minutes"
- "Over 2 hours"

#### Time Commitment (habits_routines only)
**Options:**
- "Select time commitment"
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

### Optional Dropdown Fields (Success Screen):

#### Best Time
**Options:**
- "Best time of day?"
- "Early morning (5-7am)"
- "Morning (7-10am)"
- "Midday (10am-2pm)"
- "Afternoon (2-5pm)"
- "Evening (5-8pm)"
- "Night (8pm+)"
- "Anytime"

#### Location (not habits_routines)
**Options:**
- "Where do you practice?"
- "Home"
- "Gym/Studio"
- "Outdoors"
- "Office/Work"
- "Online/Virtual"
- "Multiple locations"

---

## 8. PurchaseForm
**Categories:** `products_devices`, `books_courses`
**File:** `components/organisms/solutions/forms/PurchaseForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Cost Type (radio buttons)
**Options:**
- "One-time purchase"
- "Subscription" / "Ongoing costs" (label varies by category)

#### Cost Range (conditional based on cost type)
**One-time:**
- "Free"
- "Under $20"
- "$20-50"
- "$50-100"
- "$100-250"
- "$250-500"
- "$500-1000"
- "Over $1000"

**Subscription/Ongoing:**
- "Free"
- "Under $10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "Over $100/month"

#### Product Type/Format
**Products/Devices:**
- "Select type"
- "Physical device"
- "Mobile app"
- "Software"
- "Wearable"
- "Subscription service"
- "Other (please describe)"

**Books/Courses:**
- "Select type"
- "Physical book"
- "E-book"
- "Audiobook"
- "Online course"
- "Video series"
- "Workbook/PDF"
- "App-based"
- "Other (please describe)"

#### Ease of Use (products_devices only)
**Options:**
- "How easy to use?"
- "Very easy to use"
- "Easy to use"
- "Moderate learning curve"
- "Difficult to use"
- "Very difficult to use"

#### Learning Difficulty (books_courses only)
**Options:**
- "How challenging?"
- "Beginner friendly"
- "Some experience helpful"
- "Intermediate level"
- "Advanced level"
- "Expert level"

### Optional Dropdown Fields (Success Screen):

#### Completion Status (books_courses only)
**Options:**
- "Completion status"
- "Completed fully"
- "Completed partially"
- "Still in progress"
- "Abandoned"

---

## 9. SessionForm
**Categories:** `therapists_counselors`, `doctors_specialists`, `coaches_mentors`, `alternative_practitioners`, `professional_services`, `medical_procedures`, `crisis_resources`
**File:** `components/organisms/solutions/forms/SessionForm.tsx`

### Required Dropdown Fields:

#### Time to Results
**Options:**
- "Select timeframe"
- "Immediately"
- "Within days"
- "1-2 weeks"
- "3-4 weeks"
- "1-2 months"
- "3-6 months"
- "6+ months"
- "Still evaluating"

#### Cost Type (radio buttons, not for crisis_resources)
**Options:**
- "Per session"
- "Monthly"
- "Total cost" (medical_procedures only)

#### Cost Range (conditional based on category and cost type)
**Crisis Resources:**
- "Free"
- "Donation-based"
- "Sliding scale"
- "Don't remember"

**Per Session (from COST_RANGES.per_session):**
- "Free"
- "Under $50"
- "$50-100"
- "$100-150"
- "$150-250"
- "$250-500"
- "Over $500"
- "Don't remember"

**Monthly (from COST_RANGES.monthly):**
- "Free"
- "Under $10/month"
- "$10-25/month"
- "$25-50/month"
- "$50-100/month"
- "$100-200/month"
- "Over $200/month"
- "Don't remember"

**Total (from COST_RANGES.one_time):**
- "Free"
- "Under $20"
- "$20-50"
- "$50-100"
- "$100-250"
- "$250-500"
- "$500-1000"
- "Over $1000"
- "Don't remember"

#### Session Frequency (not crisis_resources)
**Options:**
- "How often?"
- "One-time only"
- "As needed"
- "Multiple times per week"
- "Weekly"
- "Fortnightly"
- "Monthly"
- "Every 2-3 months"
- "Other (please describe)"

#### Format
**Crisis Resources:**
- "Select format"
- "Phone"
- "Text/Chat"
- "Online"

**Medical Procedures:**
- "Select format"
- "Outpatient"
- "Inpatient"
- "In-office"
- "At-home"

**Others:**
- "Select format"
- "In-person"
- "Virtual/Online"
- "Phone"
- "Hybrid (both)"

#### Session Length (required for therapists_counselors, optional for others except crisis_resources/medical_procedures)
**Options:**
- "How long?"
- "15 minutes"
- "30 minutes"
- "45 minutes"
- "60 minutes"
- "90 minutes"
- "2+ hours"
- "Varies"

#### Wait Time (medical_procedures required, doctors_specialists optional)
**Doctors/Specialists:**
- "Time to get appointment"
- "Same day"
- "Within a week"
- "1-2 weeks"
- "2-4 weeks"
- "1-2 months"
- "2+ months"

**Medical Procedures:**
- "Time to get appointment"
- "Same day"
- "Within a week"
- "1-2 weeks"
- "2-4 weeks"
- "1-3 months"
- "3-6 months"
- "More than 6 months"

#### Insurance Coverage (therapists_counselors, doctors_specialists, medical_procedures)
**Options:**
- "Coverage status"
- "Fully covered by insurance"
- "Partially covered by insurance"
- "Not covered by insurance"
- "No insurance/Self-pay"
- "Covered by government program (Medicare, NHS, provincial coverage, etc.)"
- "HSA/FSA eligible (US)"

#### Service Type (professional_services only)
**Options:**
- "Select service type"
- "Personal trainer/Fitness coach"
- "Nutritionist/Dietitian"
- "Professional organizer"
- "Financial advisor/Planner"
- "Legal services"
- "Virtual assistant"
- "Tutor/Educational specialist"
- "Hair/Beauty professional"
- "Home services (cleaning, handyman, etc.)"
- "Career/Business coach"
- "Digital marketing/Tech specialist"
- "Pet services"
- "Creative services (photographer, designer, writer)"
- "Other professional service"

#### Response Time (crisis_resources only)
**Options:**
- "How quickly did they respond?"
- "Immediate"
- "Within 5 minutes"
- "Within 30 minutes"
- "Within hours"
- "Within 24 hours"
- "Within a couple of days"
- "More than a couple of days"

### Optional Dropdown Fields (Success Screen):

#### Completed Treatment
**Options:**
- "Completed full treatment?"
- "Yes"
- "No"
- "Still ongoing"

#### Typical Treatment Length
**Options:**
- "Typical treatment length"
- "Single session only"
- "2-4 sessions"
- "5-8 sessions"
- "8-12 sessions"
- "3-6 months"
- "6-12 months"
- "1-2 years"
- "Ongoing/Indefinite"
- "Varies by condition"

#### Availability (crisis_resources only, checkboxes)
**Options:**
- "24/7"
- "Business hours"
- "Evenings"
- "Weekends"
- "Immediate response"
- "Callback within 24hrs"

---

## Universal Fields (All Forms)

### Effectiveness Rating (5-star scale)
**Options:** 1-5 stars with labels:
- 1: "Not at all" 😞
- 2: "Slightly" 😕
- 3: "Moderate" 😐
- 4: "Very" 😊
- 5: "Extremely" 🤩

### Challenge/Side Effect Options
**Note:** Most forms include challenge/side effect selection in Step 2. These are either:
1. **Hard-coded arrays** within each form component
2. **Database-driven** from `challenge_options` or `side_effect_options` tables
3. **Fallback options** defined within each form when database data is unavailable

Common challenge patterns include:
- "None" (always available)
- Category-specific predefined options
- "Other" or "Other (please describe)" for custom input
- Support for custom challenge addition

## Notes

1. **Conditional Fields:** Many dropdown options change based on previous selections (e.g., cost ranges change based on cost type selection)
2. **Category-Specific Logic:** Forms adapt their required fields based on the solution category
3. **Database Integration:** Some challenge options are fetched from Supabase tables with fallback arrays
4. **Two-Phase Submission:** Required fields are submitted initially, optional fields are handled via success screen
5. **Form Backup:** All forms include backup/restore functionality for user convenience