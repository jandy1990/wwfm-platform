# WWFM Forms README

> **Source of truth for Claude Code**  
> Field configuration SSOT: `/docs/solution-fields-ssot.md`  
> Data flow overview: `/docs/solution-field-data-flow.md`

This document contains an introduction to the forms. The forms themselves are here: components/organisms/solutions/forms 

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
- AppForm.tsx is complete
- HobbyForm.tsx is complete
- PracticeForm.tsx is complete
- Other 5 forms follow the same pattern
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
