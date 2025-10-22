/**
 * Complete Dropdown Options Configuration
 * 
 * This file contains ALL exact dropdown values from the forms
 * Every field value MUST be one of these exact strings
 * 
 * Based on: /docs/form-dropdown-options.md
 * 
 * CRITICAL: The AI must ONLY use these exact values - no variations!
 */

export const DROPDOWN_OPTIONS = {
  // ========================================
  // UNIVERSAL FIELDS (used across many forms)
  // ========================================
  
  time_to_results: [
    "Immediately",
    "Within days",
    "1-2 weeks",
    "3-4 weeks",
    "1-2 months",
    "3-6 months",
    "6+ months",
    "Still evaluating"
  ],

  // ========================================
  // APP FORM FIELDS
  // ========================================
  
  usage_frequency: [
    "Multiple times daily",
    "Daily",
    "Few times a week",
    "Weekly",
    "As needed"
  ],
  
  subscription_type: [
    "Free version",
    "Monthly subscription",
    "Annual subscription",
    "One-time purchase"
  ],
  
  // Cost varies by subscription type
  app_cost_monthly: [
    "Under $5/month",
    "$5-$9.99/month",
    "$10-$19.99/month",
    "$20-$49.99/month",
    "$50-$99.99/month",
    "$100+/month"
  ],
  
  app_cost_annual: [
    "Under $50/year",
    "$50-$99.99/year",
    "$100-$199.99/year",
    "$200-$499.99/year",
    "$500-$999.99/year",
    "$1000+/year"
  ],
  
  app_cost_onetime: [
    "Under $5",
    "$5-$9.99",
    "$10-$24.99",
    "$25-$49.99",
    "$50-$99.99",
    "$100-$249.99",
    "$250+"
  ],

  // Union of all app cost formats (monthly, annual, one-time)
  // This allows validation to pass regardless of subscription type
  app_cost: [
    "Free",
    // Monthly subscription costs
    "Under $5/month",
    "$5-$9.99/month",
    "$10-$19.99/month",
    "$20-$49.99/month",
    "$50-$99.99/month",
    "$100+/month",
    // Annual subscription costs
    "Under $50/year",
    "$50-$99.99/year",
    "$100-$199.99/year",
    "$200-$499.99/year",
    "$500-$999.99/year",
    "$1000+/year",
    // One-time purchase costs
    "Under $5",
    "$5-$9.99",
    "$10-$24.99",
    "$25-$49.99",
    "$50-$99.99",
    "$100-$249.99",
    "$250+"
  ],

  app_challenges: [
    "None",
    "Remembering to use daily",
    "Too many notifications",
    "Gets repetitive after a while",
    "Hard to maintain habit",
    "Premium features expensive",
    "Privacy concerns with data",
    "Takes up too much storage",
    "Drains battery",
    "Not enough customization",
    "Subscription fatigue",
    "Forgot to cancel trial",
    "Other (please describe)"
  ],

  // ========================================
  // COMMUNITY FORM FIELDS
  // ========================================
  
  payment_frequency: [
    "Free or donation-based",
    "Per meeting/session",
    "Monthly",
    "Yearly"
  ],
  
  meeting_frequency: [
    "Daily",
    "Several times per week",
    "Weekly",
    "Bi-weekly",
    "Monthly",
    "As needed",
    "Special events only"
  ],
  
  community_format: [
    "In-person only",
    "Online only",
    "Hybrid (both)",
    "Phone/Conference call"
  ],
  
  group_size: [
    "Small (under 10 people)",
    "Medium (10-20 people)",
    "Large (20-50 people)",
    "Very large (50+ people)",
    "Varies significantly",
    "One-on-one"
  ],

  support_group_cost: [
    "Free",
    "Donation-based",
    "Under $10/meeting",
    "$10-$19.99/meeting",
    "$20-$49.99/meeting",
    "$50-$99.99/meeting",
    "Over $100/meeting",
    "Don't remember"
  ],

  community_cost_monthly: [
    "Free",
    "Under $20/month",
    "$20-$49.99/month",
    "$50-$99.99/month",
    "$100-$199.99/month",
    "$200-$499.99/month",
    "Over $500/month",
    "Don't remember"
  ],

  community_challenges: [
    "None",
    "Hard to break in socially",
    "Activity level inconsistent",
    "Leadership issues",
    "Drama or conflicts",
    "Time commitment too high",
    "Location/meeting challenges",
    "Cost of activities",
    "Age/demographic mismatch",
    "Too competitive/not competitive enough",
    "Communication gaps",
    "Other (please describe)"
  ],

  support_group_challenges: [
    "None",
    "Inconsistent attendance",
    "Group dynamics issues",
    "Not enough structure",
    "Too much structure",
    "Facilitator quality varies",
    "Hard to share openly",
    "Triggering content from others",
    "Time conflicts",
    "Cliques or exclusion",
    "Not the right fit",
    "Other (please describe)"
  ],

  // ========================================
  // DOSAGE FORM FIELDS
  // ========================================
  
  frequency: [
    "once daily",
    "twice daily",
    "three times daily",
    "four times daily",
    "as needed",
    "every other day",
    "twice weekly",
    "weekly",
    "monthly"
  ],
  
  skincare_frequency: [
    // Human-readable labels (legacy)
    "Twice daily (AM & PM)",
    "Once daily (morning)",
    "Once daily (night)",
    "Every other day",
    "2-3 times per week",
    "Weekly",
    "As needed (spot treatment)",
    // Machine-readable values (sent by DosageForm)
    "twice_daily",
    "once_daily_am",
    "once_daily_pm",
    "every_other_day",
    "2-3_weekly",
    "weekly",
    "spot_treatment"
  ],
  
  length_of_use: [
    "Less than 1 month",
    "1-3 months",
    "3-6 months",
    "6-12 months",
    "1-2 years",
    "Over 2 years",
    "As needed",
    "Still using"
  ],

  meditation_challenges: [
    "None",
    "Difficulty concentrating",
    "Restlessness",
    "Emotional overwhelm",
    "Physical discomfort",
    "Anxiety increased",
    "Boredom",
    "Difficulty staying awake",
    "Intrusive thoughts",
    "Noisy environment",
    "Pet/child interruptions",
    "Time management issues",
    "Initially worse before better",
    "Other (please describe)"
  ],

  exercise_challenges: [
    "None",
    "Physical limitations",
    "Time constraints",
    "Weather dependent",
    "Gym intimidation",
    "Lack of motivation",
    "Injury/soreness",
    "Equipment costs",
    "Finding good instruction",
    "Progress plateaus",
    "Schedule conflicts",
    "Energy levels",
    "Initially worse before better",
    "Other (please describe)"
  ],

  habits_challenges: [
    "None",
    "Forgot to do it",
    "Lost motivation after initial enthusiasm",
    "Takes too much time",
    "Hard to do when tired",
    "Broke the chain and gave up",
    "Results too slow",
    "Life got in the way",
    "Felt silly or self-conscious",
    "Too ambitious at start",
    "No immediate reward",
    "Competing priorities",
    "Didn't track progress",
    "All-or-nothing thinking",
    "Initially made things worse",
    "Other (please describe)"
  ],

  dosage_cost_monthly: [
    "Free",
    "Under $10/month",
    "$10-25/month",
    "$25-50/month",
    "$50-100/month",
    "$100-200/month",
    "$200-500/month",
    "$500-1000/month",
    "Over $1000/month"
  ],
  
  dosage_cost_onetime: [
    "Free",
    "Under $20",
    "$20-50",
    "$50-100",
    "$100-250",
    "$250-500",
    "$500-1000",
    "Over $1000"
  ],

  // ========================================
  // FINANCIAL FORM FIELDS
  // ========================================
  
  cost_type: [
    "Free to use",
    "Subscription fee",
    "Transaction/usage fees",
    "Interest charged (loans/credit)",
    "Account maintenance fees",
    "One-time purchase/setup fee"
  ],
  
  financial_benefit: [
    "No direct financial benefit",
    "Under $25/month saved/earned",
    "$25-100/month saved/earned",
    "$100-250/month saved/earned",
    "$250-500/month saved/earned",
    "$500-1000/month saved/earned",
    "Over $1000/month saved/earned",
    "Varies significantly"
  ],
  
  access_time: [
    "Instant approval",
    "Same day",
    "1-3 business days",
    "1-2 weeks",
    "2-4 weeks",
    "Over a month"
  ],

  financial_challenges: [
    "Credit score too low",
    "Income requirements not met",
    "Complex application process",
    "High minimum balance",
    "Documentation requirements",
    "Geographic restrictions",
    "Age restrictions",
    "Citizenship/residency requirements",
    "Hidden fees discovered",
    "Poor customer service",
    "Technical issues with platform",
    "None",
    "Other"
  ],

  // ========================================
  // HOBBY FORM FIELDS
  // ========================================
  
  time_to_enjoyment: [
    "Immediately",
    "Within days",
    "1-2 weeks",
    "3-4 weeks",
    "1-2 months",
    "3-6 months",
    "6+ months",
    "Still learning to enjoy it"
  ],
  
  startup_cost: [
    "Free/No startup cost",
    "Under $50",
    "$50-$100",
    "$100-$250",
    "$250-$500",
    "$500-$1,000",
    "$1,000-$2,500",
    "$2,500-$5,000",
    "Over $5,000"
  ],
  
  hobby_ongoing_cost: [
    "Free/No ongoing cost",
    "Under $25/month",
    "$25-$50/month",
    "$50-$100/month",
    "$100-$200/month",
    "$200-$500/month",
    "Over $500/month"
  ],
  
  time_commitment: [
    "15-30 minutes",
    "30-60 minutes",
    "1-2 hours",
    "2-4 hours",
    "Half day",
    "Full day",
    "Varies significantly"
  ],
  
  hobby_frequency: [
    "Daily",
    "Few times a week",
    "Weekly",
    "Few times a month",
    "Monthly",
    "Occasionally"
  ],

  hobby_challenges: [
    "None",
    "Too expensive to start",
    "Steep learning curve",
    "Hard to find time",
    "Equipment/space requirements",
    "Need others to participate",
    "Not seeing progress",
    "Lost motivation after initial excitement",
    "Weather dependent",
    "Physical limitations",
    "Information overload",
    "Perfectionism getting in the way",
    "Hard to find good instruction",
    "Other (please describe)"
  ],

  // ========================================
  // LIFESTYLE FORM FIELDS
  // ========================================
  
  diet_cost_impact: [
    "Significantly more expensive",
    "Somewhat more expensive",
    "About the same",
    "Somewhat less expensive",
    "Significantly less expensive"
  ],

  diet_challenges: [
    "None",
    "Meal planning and prep time",
    "Cooking skills needed",
    "Complicated diet rules",
    "Higher grocery costs",
    "Cravings and temptations",
    "Missing favorite foods",
    "Social situations difficult",
    "Family not supportive",
    "Travel and eating out",
    "Energy dips initially",
    "Digestive adjustment",
    "Limited food options nearby",
    "Other (please describe)"
  ],
  
  sleep_cost_impact: [
    "Free",
    "Under $50",
    "$50-$100",
    "$100-$200",
    "Over $200"
  ],

  sleep_challenges: [
    "None",
    "Hard to maintain schedule",
    "Partner's different schedule",
    "Work/family conflicts",
    "Too restrictive",
    "Anxiety about sleep",
    "Physical discomfort",
    "Missing late night activities",
    "Inconsistent results",
    "Environmental factors (noise, light)",
    "Other (please describe)"
  ],

  generic_challenges: [
    "None",
    "High cost",
    "Limited availability",
    "Not covered by insurance",
    "Long wait times",
    "Finding qualified professionals",
    "Scheduling conflicts",
    "Transportation issues",
    "Requires lifestyle changes",
    "Lack of immediate results",
    "Consistency",
    "Time constraints",
    "Initial learning curve",
    "Social stigma",
    "Other (please describe)"
  ],
  
  weekly_prep_time: [
    "No extra time",
    "Under 1 hour/week",
    "1-2 hours/week",
    "2-4 hours/week",
    "4-6 hours/week",
    "6-8 hours/week",
    "Over 8 hours/week"
  ],
  
  previous_sleep_hours: [
    "Under 4 hours",
    "4-5 hours",
    "5-6 hours",
    "6-7 hours",
    "7-8 hours",
    "Over 8 hours",
    "Highly variable"
  ],
  
  sustainability: [
    "Easy to maintain now",
    "Takes effort but manageable",
    "Getting harder over time",
    "Struggling but continuing"
  ],

  // ========================================
  // PRACTICE FORM FIELDS
  // ========================================
  
  practice_startup_cost: [
    "Free/No startup cost",
    "Under $50",
    "$50-$99.99",
    "$100-$249.99",
    "$250-$499.99",
    "$500-$999.99",
    "$1000+"
  ],
  
  practice_ongoing_cost: [
    "Free/No ongoing cost",
    "Under $10/month",
    "$10-$24.99/month",
    "$25-$49.99/month",
    "$50-$99.99/month",
    "$100-$199.99/month",
    "$200+/month"
  ],
  
  practice_frequency: [
    "Daily",
    "5-6 times per week",
    "3-4 times per week",
    "1-2 times per week",
    "Weekly",
    "Few times a month",
    "As needed"
  ],
  
  practice_length: [
    "Under 5 minutes",
    "5-10 minutes",
    "10-20 minutes",
    "20-30 minutes",
    "30-45 minutes",
    "45-60 minutes",
    "Over 1 hour"
  ],
  
  session_duration: [
    "Under 15 minutes",
    "15-30 minutes",
    "30-45 minutes",
    "45-60 minutes",
    "60-90 minutes",
    "90-120 minutes",
    "Over 2 hours"
  ],
  
  habits_time_commitment: [
    "Under 5 minutes",
    "5-10 minutes",
    "10-20 minutes",
    "20-30 minutes",
    "30-45 minutes",
    "45-60 minutes",
    "1-2 hours",
    "2-3 hours",
    "More than 3 hours",
    "Multiple times throughout the day",
    "Ongoing/Background habit"
  ],

  // ========================================
  // PURCHASE FORM FIELDS
  // ========================================
  
  purchase_cost_onetime: [
    "Free",
    "Under $20",
    "$20-50",
    "$50-100",
    "$100-250",
    "$250-500",
    "$500-1000",
    "Over $1000"
  ],
  
  purchase_cost_subscription: [
    "Free",
    "Under $10/month",
    "$10-25/month",
    "$25-50/month",
    "$50-100/month",
    "Over $100/month"
  ],
  
  product_type: [
    "Physical device",
    "Mobile app",
    "Software",
    "Wearable",
    "Subscription service",
    "Other"
  ],
  
  book_format: [
    "Physical book",
    "E-book",
    "Audiobook",
    "Online course",
    "Video series",
    "Workbook/PDF",
    "App-based",
    "Other"
  ],
  
  ease_of_use: [
    "Very easy to use",
    "Easy to use",
    "Moderate learning curve",
    "Difficult to use",
    "Very difficult to use"
  ],
  
  learning_difficulty: [
    "Beginner friendly",
    "Some experience helpful",
    "Intermediate level",
    "Advanced level",
    "Expert level"
  ],

  product_challenges: [
    "Build quality concerns",
    "Difficult to set up",
    "Doesn't work as advertised",
    "Poor customer support",
    "Battery/power issues",
    "Compatibility problems",
    "Durability concerns",
    "Missing features",
    "None",
    "Other (please describe)"
  ],

  learning_challenges: [
    "Too theoretical",
    "Not enough practical examples",
    "Outdated information",
    "Poor organization",
    "Too basic/too advanced",
    "Instructor hard to follow",
    "Technical issues with platform",
    "No community support",
    "None",
    "Other (please describe)"
  ],

  // ========================================
  // SESSION FORM FIELDS
  // ========================================
  
  session_cost_per: [
    "Free",
    "Under $50",
    "$50-100",
    "$100-150",
    "$150-250",
    "$250-500",
    "Over $500",
    "Don't remember"
  ],
  
  session_cost_monthly: [
    "Free",
    "Under $10/month",
    "$10-25/month",
    "$25-50/month",
    "$50-100/month",
    "$100-200/month",
    "Over $200/month",
    "Don't remember"
  ],
  
  session_cost_total: [
    "Free",
    "Under $20",
    "$20-50",
    "$50-100",
    "$100-250",
    "$250-500",
    "$500-1000",
    "Over $1000",
    "Don't remember"
  ],
  
  session_frequency: [
    "One-time only",
    "As needed",
    "Multiple times per week",
    "Weekly",
    "Fortnightly",
    "Monthly",
    "Every 2-3 months"
  ],
  
  session_format: [
    "In-person",
    "Virtual/Online",
    "Phone",
    "Hybrid (both)"
  ],
  
  crisis_format: [
    "Phone",
    "Text/Chat",
    "Online"
  ],

  therapy_challenges: [
    "None",
    "Finding the right therapist",
    "High cost",
    "Not covered by insurance",
    "Scheduling conflicts",
    "Limited availability",
    "Travel or location issues",
    "Hard to open up",
    "Therapist turnover",
    "Homework between sessions",
    "Lack of immediate results",
    "Other (please describe)"
  ],

  coaching_challenges: [
    "None",
    "Finding qualified coach",
    "High cost",
    "Not the right fit",
    "Limited availability",
    "Too sales-focused",
    "Time zone conflicts",
    "Hard to stay consistent",
    "Lack of accountability",
    "No measurable progress",
    "Other (please describe)"
  ],

  medical_challenges: [
    "None",
    "Long wait times",
    "Insurance requirements",
    "Need referral",
    "High cost",
    "Limited specialists nearby",
    "Side effects difficult",
    "Coordination between providers",
    "Logistics or travel barriers",
    "Other (please describe)"
  ],

  professional_service_challenges: [
    "Finding qualified professionals",
    "High cost",
    "Limited availability",
    "Not covered by insurance",
    "Unclear about what I need",
    "Too many options to choose from",
    "Scheduling conflicts",
    "Location/distance issues",
    "Concerns about confidentiality",
    "None",
    "Other (please describe)"
  ],

  crisis_challenges: [
    "Long wait times",
    "Difficulty getting through",
    "Not the right type of help",
    "Felt judged or dismissed",
    "Language barriers",
    "Technical issues with platform",
    "Limited hours of operation",
    "Needed different level of care",
    "Privacy concerns",
    "None",
    "Other (please describe)"
  ],
  
  medical_format: [
    "Outpatient",
    "Inpatient",
    "In-office",
    "At-home"
  ],
  
  session_length: [
    "15 minutes",
    "30 minutes",
    "45 minutes",
    "60 minutes",
    "90 minutes",
    "2+ hours",
    "Varies"
  ],
  
  wait_time_doctors: [
    "Same day",
    "Within a week",
    "1-2 weeks",
    "2-4 weeks",
    "1-2 months",
    "2+ months"
  ],
  
  wait_time_procedures: [
    "Same day",
    "Within a week",
    "1-2 weeks",
    "2-4 weeks",
    "1-3 months",
    "3-6 months",
    "More than 6 months"
  ],
  
  insurance_coverage: [
    "Fully covered by insurance",
    "Partially covered by insurance",
    "Not covered by insurance",
    "No insurance/Self-pay",
    "Covered by government program (Medicare, NHS, provincial coverage, etc.)",
    "HSA/FSA eligible (US)"
  ],
  
  service_type: [
    "Personal trainer/Fitness coach",
    "Nutritionist/Dietitian",
    "Professional organizer",
    "Financial advisor/Planner",
    "Legal services",
    "Virtual assistant",
    "Tutor/Educational specialist",
    "Hair/Beauty professional",
    "Home services (cleaning, handyman, etc.)",
    "Career/Business coach",
    "Digital marketing/Tech specialist",
    "Pet services",
    "Creative services (photographer, designer, writer)",
    "Other professional service"
  ],
  
  response_time: [
    "Immediate",
    "Within 5 minutes",
    "Within 30 minutes",
    "Within hours",
    "Within 24 hours",
    "Within a couple of days",
    "More than a couple of days"
  ],

  crisis_cost: [
    "Free",
    "Donation-based",
    "Sliding scale"
  ],

  still_following: [
    "Yes, consistently",
    "Yes, with modifications",
    "Sometimes",
    "No, stopped"
  ],

  common_side_effects: [
    "No side effects",
    "Mild side effects",
    "Moderate side effects",
    "Severe side effects",
    "Mixed - some benefits, some issues"
  ]
}

/**
 * Map category to cost field and options
 * Different categories use different cost structures
 */
export const CATEGORY_COST_MAPPING = {
  // Apps use subscription-based costs
  apps_software: {
    field: 'cost',
    getOptions: (subscriptionType: string) => {
      if (subscriptionType === 'Free version') return ['Free']
      if (subscriptionType === 'Monthly subscription') return DROPDOWN_OPTIONS.app_cost_monthly
      if (subscriptionType === 'Annual subscription') return DROPDOWN_OPTIONS.app_cost_annual
      if (subscriptionType === 'One-time purchase') return DROPDOWN_OPTIONS.app_cost_onetime
      return DROPDOWN_OPTIONS.app_cost_monthly // default
    }
  },
  
  // Dosage forms use monthly costs
  medications: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.dosage_cost_monthly
  },
  supplements_vitamins: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.dosage_cost_monthly
  },
  natural_remedies: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.dosage_cost_monthly
  },
  beauty_skincare: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.dosage_cost_monthly
  },
  
  // Practice forms use startup and ongoing costs
  meditation_mindfulness: {
    startup_field: 'startup_cost',
    startup_options: DROPDOWN_OPTIONS.practice_startup_cost,
    ongoing_field: 'ongoing_cost',
    ongoing_options: DROPDOWN_OPTIONS.practice_ongoing_cost
  },
  exercise_movement: {
    startup_field: 'startup_cost',
    startup_options: DROPDOWN_OPTIONS.practice_startup_cost,
    ongoing_field: 'ongoing_cost',
    ongoing_options: DROPDOWN_OPTIONS.practice_ongoing_cost
  },
  habits_routines: {
    startup_field: 'startup_cost',
    startup_options: DROPDOWN_OPTIONS.practice_startup_cost,
    ongoing_field: 'ongoing_cost',
    ongoing_options: DROPDOWN_OPTIONS.practice_ongoing_cost
  },
  
  // Session forms use per-session costs
  therapists_counselors: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_per
  },
  doctors_specialists: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_per
  },
  coaches_mentors: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_per
  },
  alternative_practitioners: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_per
  },
  professional_services: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_per
  },
  medical_procedures: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.session_cost_total
  },
  crisis_resources: {
    field: 'cost',
    options: ['Free', 'Donation-based', 'Sliding scale']
  },
  
  // Community forms use meeting-based costs
  support_groups: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.support_group_cost
  },
  groups_communities: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.community_cost_monthly
  },
  
  // Purchase forms use one-time or subscription
  products_devices: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.purchase_cost_onetime
  },
  books_courses: {
    field: 'cost',
    options: DROPDOWN_OPTIONS.purchase_cost_onetime
  },
  
  // Lifestyle forms use impact-based costs
  diet_nutrition: {
    field: 'cost_impact',
    options: DROPDOWN_OPTIONS.diet_cost_impact
  },
  sleep: {
    field: 'cost_impact',
    options: DROPDOWN_OPTIONS.sleep_cost_impact
  },
  
  // Hobby forms use startup and ongoing
  hobbies_activities: {
    startup_field: 'startup_cost',
    startup_options: DROPDOWN_OPTIONS.startup_cost,
    ongoing_field: 'ongoing_cost',
    ongoing_options: DROPDOWN_OPTIONS.hobby_ongoing_cost
  },
  
  // Financial forms use cost type
  financial_products: {
    field: 'cost_type',
    options: DROPDOWN_OPTIONS.cost_type
  }
}

/**
 * Get the appropriate dropdown options for a field in a category
 */
export function getDropdownOptionsForField(category: string, fieldName: string): string[] | null {
  // Special handling for frequency fields
  if (fieldName === 'frequency' && category !== 'beauty_skincare') {
    return DROPDOWN_OPTIONS.frequency
  }
  if (fieldName === 'skincare_frequency' && category === 'beauty_skincare') {
    return DROPDOWN_OPTIONS.skincare_frequency
  }
  
  // Special handling for exercise_movement frequency
  if (fieldName === 'frequency' && category === 'exercise_movement') {
    return DROPDOWN_OPTIONS.practice_frequency
  }

  if (fieldName === 'format') {
    if (category === 'crisis_resources') return DROPDOWN_OPTIONS.crisis_format
    if (category === 'medical_procedures') return DROPDOWN_OPTIONS.medical_format
    if (category === 'books_courses') return DROPDOWN_OPTIONS.book_format
    if (category.includes('groups') || category.includes('support')) return DROPDOWN_OPTIONS.community_format
    return DROPDOWN_OPTIONS.session_format
  }

  if (fieldName === 'challenges') {
    const challengeMapping: Record<string, string[]> = {
      meditation_mindfulness: DROPDOWN_OPTIONS.meditation_challenges,
      exercise_movement: DROPDOWN_OPTIONS.exercise_challenges,
      habits_routines: DROPDOWN_OPTIONS.habits_challenges,
      therapists_counselors: DROPDOWN_OPTIONS.therapy_challenges,
      coaches_mentors: DROPDOWN_OPTIONS.coaching_challenges,
      doctors_specialists: DROPDOWN_OPTIONS.medical_challenges,
      professional_services: DROPDOWN_OPTIONS.professional_service_challenges,
      crisis_resources: DROPDOWN_OPTIONS.crisis_challenges,
      diet_nutrition: DROPDOWN_OPTIONS.diet_challenges,
      sleep: DROPDOWN_OPTIONS.sleep_challenges,
      products_devices: DROPDOWN_OPTIONS.product_challenges,
      books_courses: DROPDOWN_OPTIONS.learning_challenges,
      apps_software: DROPDOWN_OPTIONS.app_challenges,
      groups_communities: DROPDOWN_OPTIONS.community_challenges,
      support_groups: DROPDOWN_OPTIONS.support_group_challenges,
      hobbies_activities: DROPDOWN_OPTIONS.hobby_challenges,
      financial_products: DROPDOWN_OPTIONS.financial_challenges
    }

    return challengeMapping[category] || DROPDOWN_OPTIONS.generic_challenges
  }

  // Handle cost fields based on category
  const costMapping = CATEGORY_COST_MAPPING[category]
  if (costMapping) {
    if (fieldName === 'cost' && costMapping.field === 'cost') {
      return costMapping.options || null
    }
    if (fieldName === 'startup_cost' && costMapping.startup_field === 'startup_cost') {
      return costMapping.startup_options || null
    }
    if (fieldName === 'ongoing_cost' && costMapping.ongoing_field === 'ongoing_cost') {
      return costMapping.ongoing_options || null
    }
    if (fieldName === 'cost_impact' && costMapping.field === 'cost_impact') {
      return costMapping.options || null
    }
    if (fieldName === 'cost_type' && costMapping.field === 'cost_type') {
      return costMapping.options || null
    }
  }
  
  // Direct field mappings
  const directMappings = {
    'time_to_results': DROPDOWN_OPTIONS.time_to_results,
    'time_to_enjoyment': DROPDOWN_OPTIONS.time_to_enjoyment,
    'usage_frequency': DROPDOWN_OPTIONS.usage_frequency,
    'subscription_type': DROPDOWN_OPTIONS.subscription_type,
    'meeting_frequency': DROPDOWN_OPTIONS.meeting_frequency,
    'session_frequency': DROPDOWN_OPTIONS.session_frequency,
    'practice_frequency': DROPDOWN_OPTIONS.practice_frequency,
    'group_size': DROPDOWN_OPTIONS.group_size,
    'length_of_use': DROPDOWN_OPTIONS.length_of_use,
    'financial_benefit': DROPDOWN_OPTIONS.financial_benefit,
    'access_time': DROPDOWN_OPTIONS.access_time,
    'time_commitment': category === 'hobbies_activities' ? DROPDOWN_OPTIONS.time_commitment :
                       category === 'habits_routines' ? DROPDOWN_OPTIONS.habits_time_commitment :
                       null,
    'weekly_prep_time': DROPDOWN_OPTIONS.weekly_prep_time,
    'prep_time': DROPDOWN_OPTIONS.weekly_prep_time,
    'previous_sleep_hours': DROPDOWN_OPTIONS.previous_sleep_hours,
    'sustainability': DROPDOWN_OPTIONS.sustainability,
    'long_term_sustainability': DROPDOWN_OPTIONS.sustainability,
    'practice_length': DROPDOWN_OPTIONS.practice_length,
    'session_duration': DROPDOWN_OPTIONS.session_duration,
    'product_type': DROPDOWN_OPTIONS.product_type,
    'ease_of_use': DROPDOWN_OPTIONS.ease_of_use,
    'learning_difficulty': DROPDOWN_OPTIONS.learning_difficulty,
    'session_length': DROPDOWN_OPTIONS.session_length,
    'wait_time': category === 'doctors_specialists' ? DROPDOWN_OPTIONS.wait_time_doctors :
                 category === 'medical_procedures' ? DROPDOWN_OPTIONS.wait_time_procedures :
                 null,
    'insurance_coverage': DROPDOWN_OPTIONS.insurance_coverage,
    'service_type': DROPDOWN_OPTIONS.service_type,
    'response_time': DROPDOWN_OPTIONS.response_time,
    'adjustment_period': [
      "Immediately",
      "Within days", 
      "1-2 weeks",
      "3-4 weeks",
      "1-2 months",
      "Still adjusting"
    ],
    'recovery_time': [
      "No recovery needed",
      "Few days",
      "1-2 weeks",
      "2-4 weeks",
      "1-2 months",
      "3-6 months",
      "6+ months"
    ],
    'sessions_required': [
      "Single session",
      "2-3 sessions",
      "4-6 sessions",
      "7-10 sessions",
      "10+ sessions",
      "Ongoing"
    ],
    'treatment_type': [
      "Acupuncture",
      "Chiropractic",
      "Massage therapy",
      "Energy healing",
      "Naturopathy",
      "Homeopathy",
      "Traditional medicine",
      "Other"
    ],
    'availability': [
      "24/7",
      "Business hours",
      "Evenings",
      "Weekends",
      "Immediate response"
    ],
    'time_to_complete': [
      "Under 1 hour",
      "1-5 hours",
      "5-10 hours",
      "10-20 hours",
      "20-40 hours",
      "40+ hours",
      "Self-paced"
    ],
    'payment_frequency': DROPDOWN_OPTIONS.payment_frequency
  }
  
  return directMappings[fieldName] || null
}
