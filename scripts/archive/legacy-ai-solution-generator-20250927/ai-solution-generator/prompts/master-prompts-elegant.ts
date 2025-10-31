/**
 * Elegant, concise prompt for specific solution generation
 */

export const ELEGANT_MASTER_PROMPT = `
Generate {{LIMIT}} solutions for: {{GOAL_TITLE}}
Context: {{GOAL_DESCRIPTION}} ({{ARENA}})

REQUIREMENT: Each solution must be a real product, service, or method that exists and can be found on Google.

Think of this like making a shopping list - you wouldn't write "vegetables", you'd write "Dole Baby Spinach" or "Green Giant Broccoli Florets".

GOOD EXAMPLES:
• "Headspace" - a real meditation app
• "BetterHelp" - a real therapy platform  
• "Couch to 5K" - a real running program
• "Atomic Habits by James Clear" - a real book with author
• "YNAB (You Need A Budget)" - a real budgeting software

BAD EXAMPLES:
• "meditation app" - too generic
• "online therapy" - just a category
• "running program" - not specific
• "self-help book" - no actual title
• "budgeting software" - no product name

THE RULE: Every solution must have at least one of:
• A brand/company name (Nike, Headspace, BetterHelp)
• An app/software name (MyFitnessPal, Calm, Duolingo)
• An author/creator (James Clear, Tim Ferriss, Brené Brown)
• A specific protocol name (Pomodoro Technique, 5x5 StrongLifts, 4-7-8 breathing)

{{FIELD_REQUIREMENTS}}

Return a JSON array where each solution follows this structure:
[
  {
    "title": "The actual name of a real product/service/book/app",
    "description": "What it is and who makes it",
    "category": "exact_category_from_list",
    "effectiveness": 3.0-5.0,
    "effectiveness_rationale": "Why this rating based on evidence",
    "variants": [only for medications/supplements/natural_remedies/beauty_skincare],
    "fields": { category-specific fields as shown above }
  }
]

Categories: medications, supplements_vitamins, natural_remedies, beauty_skincare, therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources, meditation_mindfulness, exercise_movement, habits_routines, diet_nutrition, sleep, products_devices, books_courses, apps_software, groups_communities, support_groups, hobbies_activities, financial_products

TEST: Before including any solution, ask yourself: "If I Google this exact title, will I find this specific thing?" If no, replace it with something real.

Return only the JSON array.`