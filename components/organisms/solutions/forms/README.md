# WWFM Forms System

**Last Updated:** November 2, 2025
**Status:** Production Ready ✅ (All 23 categories validated November 1, 2025)

---

## ⭐ Effectiveness Rating System

**BUSINESS LOGIC: What Do The Stars Mean?**

All forms use a consistent 1-5 star rating system with emojis and labels:

| Stars | Label | Emoji |
|-------|-------|-------|
| 1 ⭐ | Not at all | 😞 |
| 2 ⭐⭐ | Slightly | 😕 |
| 3 ⭐⭐⭐ | Moderate | 😐 |
| 4 ⭐⭐⭐⭐ | Very | 😊 |
| 5 ⭐⭐⭐⭐⭐ | Extremely | 🤩 |

**UI Implementation:**
- Question shown: "How well it worked"
- Emojis + labels shown on buttons
- Mobile: Shows only "Not at all" and "Extremely" as endpoints
- Desktop: Shows all 5 labels under emojis
- No additional explanation provided to users

**Key Points:**
- Self-explanatory with emojis and labels
- Consistent across all 9 forms and 23 categories
- Natural interpretation (like standard 5-star systems)

**Code Reference:** All form files implement this (e.g., `AppForm.tsx` lines 526-564)

---

## 📎 Purpose

The forms system captures experiential effectiveness data that doesn't exist anywhere else. Unlike generic product information, we focus exclusively on **people's specific experience of solution effectiveness against particular problems**. Each form is designed to collect the minimal viable data needed to determine if a solution works for a specific goal.

## 🧠 Business Logic

### Core Philosophy
- **Experiential Focus**: Only ask about user experience, not general product info
- **Selective Data Collection**: Don't ask for easily accessible information (e.g., consumer product prices)
- **Experience Variance**: Ask when there are significant variances across experiences (e.g., therapy costs $100-400/session)
- **Quality over Quantity**: Force specificity to prevent generic entries

### Form Selection Strategy
Forms are grouped by **similar data collection needs**, not by traditional product categories:

1. **Auto-Categorization Route**: User types solution → 10,000+ keywords → Category detection → Form selection
2. **9 Templates handle 23 Categories**: Each form template handles multiple solution categories with similar data requirements

## 📁 Structure

```
components/organisms/solutions/forms/
├── README.md                     # This file
├── shared/                       # Shared components
│   ├── constants.ts              # Common constants and category icons
│   ├── FormSectionHeader.tsx     # Section headers
│   ├── ProgressCelebration.tsx   # Success animations
│   └── index.ts                  # Barrel exports
│
├── AppForm.tsx                   # apps_software
├── CommunityForm.tsx             # groups_communities, support_groups
├── DosageForm.tsx                # supplements_vitamins, medications, natural_remedies, beauty_skincare
├── FinancialForm.tsx             # financial_products
├── HobbyForm.tsx                 # hobbies_activities
├── LifestyleForm.tsx             # diet_nutrition, sleep
├── PracticeForm.tsx              # meditation_mindfulness, exercise_movement, habits_routines
├── PurchaseForm.tsx              # products_devices, books_courses
└── SessionForm.tsx               # therapists_counselors, doctors_specialists, coaches_mentors,
                                  # alternative_practitioners, professional_services, medical_procedures,
                                  # crisis_resources
```

## 🔌 API/Interface

### Form Props Pattern
```typescript
interface FormProps {
  goalId: string;
  goalTitle?: string;
  userId: string;
  solutionName: string;
  category: string;
  existingSolutionId?: string;
  onBack: () => void;
}
```

### Server Actions
- **submitSolution**: Handles initial submission (required fields + failed solutions)
- **updateSolutionFields**: Handles optional fields from success screen

### Form Templates by Category

| Form Template | Categories Handled | Key Fields |
|---------------|-------------------|------------|
| **AppForm** | apps_software | subscription_type, usage_frequency, platform |
| **CommunityForm** | groups_communities, support_groups | meeting_frequency, group_size, format |
| **DosageForm** | supplements_vitamins, medications, natural_remedies, beauty_skincare | dose_amount, unit, frequency, length_of_use |
| **FinancialForm** | financial_products | cost_type, financial_benefit, access_time |
| **HobbyForm** | hobbies_activities | startup_cost, monthly_cost, time_commitment |
| **LifestyleForm** | diet_nutrition, sleep | cost_impact, prep_time, sustainability |
| **PracticeForm** | meditation_mindfulness, exercise_movement, habits_routines | startup_cost, monthly_cost, practice_length |
| **PurchaseForm** | products_devices, books_courses | cost_type, product_type, ease_of_use |
| **SessionForm** | therapists_counselors, doctors_specialists, coaches_mentors, alternative_practitioners, professional_services, medical_procedures, crisis_resources | cost_range, session_frequency, format |

## 🔄 Data Flow

### Two-Phase Submission Pattern

**Phase 1: Required Fields (Main Form)**
1. User completes required fields
2. Form validates locally
3. `submitSolution` server action called
4. Data saved to database
5. Show success screen

**Phase 2: Optional Fields (Success Screen)**
1. User optionally adds more details
2. `updateSolutionFields` server action called
3. Additional data appended to existing record

### Failed Solutions Integration
- Part of main submission process (not separate flow)
- Quick entry with low barrier
- Captures comprehensive effectiveness picture beyond just successes
- Example: "I tried 15 things for acne before finding what worked"

### Variant System
- **4 Categories with Real Variants**: supplements_vitamins, medications, natural_remedies, beauty_skincare
- **19 Categories with Standard Variants**: All others (apps, therapy, etc.)
- **Database Consistency**: Every solution has at least one variant, but "Standard" variants are hidden from users
- **Form Impact**: Only DosageForm exposes variant selection to users

## 🧪 Testing

### Form Validation Patterns

**Universal Required Fields (all forms):**
- Effectiveness rating (1-5 stars) - cannot be 0/null
- Time to results dropdown - cannot be empty

**Category-Specific Required Fields:**
- **SessionForm**: Cost range, session length (therapists), wait time (doctors/medical), specialty (doctors), response time (crisis), service type (professional services)
- **PurchaseForm**: Cost range, product type/format, ease of use (products), learning difficulty (books)
- **DosageForm**: Dose amount + unit (not beauty), frequency (not beauty), length of use

**Input Validation:**
- **Numeric Fields**: Regex `/^\d*\.?\d*$/` for dose amounts (numbers + decimal only)
- **Required Dropdowns**: HTML `required` attribute on select elements
- **Conditional Requirements**: Fields become required based on category

**Validation Layers:**
1. HTML required attributes
2. Client-side conditional validation
3. Server-side validation via server actions

### Form Backup System
All forms include backup/restore functionality using `useFormBackup` hook for user convenience.

## ⚠️ Important Notes

### Design Decisions
- **Two-Phase Submission**: "Not necessarily sold on keeping it" - may evolve based on user behavior
- **Dropdown Strategy**: Most fields are dropdowns by design to minimize validation needs
- **Auto-Categorization**: Critical routing mechanism - entire point is to serve correct form

### Category-Specific Behaviors
- **Cost Fields**: Conditional on subscription/payment type selection
- **Frequency Fields**: Different for skincare vs standard dosage
- **Free Version Handling**: Automatically sets cost to 'Free' for certain selections

### Common Gotchas
- Effectiveness data varies by goal (stored in goal_implementation_links, not solutions)
- Only 4 categories use real variants; others use hidden "Standard" variants
- Failed solutions are part of main flow, not separate
- Forms route through auto-categorization system

## 🔮 Future Improvements

### Potential Evolution
- Two-phase submission may be simplified based on user behavior
- Validation rules may expand as edge cases are discovered
- Form templates may be consolidated if usage patterns emerge

### Technical Debt
- Some validation logic could be centralized
- Form backup system could be optimized for performance

---

## Quick Reference

**Auto-Categorization Flow**: User Input → Keywords → Category → Form Selection
**Data Philosophy**: Experiential effectiveness only, not general product info
**Variant Logic**: Real variants for dosage categories, "Standard" for everything else
**Validation Strategy**: HTML + Client + Server validation layers
**Submit Pattern**: Required fields first, optional fields via success screen