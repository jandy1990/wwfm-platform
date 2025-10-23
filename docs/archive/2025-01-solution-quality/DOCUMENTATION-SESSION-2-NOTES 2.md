# WWFM Forms System Documentation - Session 2 Interview Notes

## Interview Date: September 16, 2025
## Focus: /components/organisms/solutions/forms system

## Key Insights Captured:

### 1. Form-to-Category Mapping Logic
**Question:** What drove the grouping strategy for forms handling multiple categories?

**Answer:**
- Pre-launch product, no users yet
- Started with 500-600 human problems, generated solution strategies, categorized them
- Forms created where data collection needs were distinctly different
- **Core Focus:** Capturing experiential effectiveness data that doesn't exist elsewhere
- **Sweet Spot:** People's specific experience of solution effectiveness against particular problems
- **What we DON'T ask:** Easily accessible info (e.g., consumer product prices)
- **What we DO ask:** Experience-variant data (e.g., therapy costs $100-400/session)
- **Philosophy:** Laser-focused on experiential layer, not general solution information

**Key Quote:** "We're really laser-focused at the experiential layer... I don't want to drift into asking questions around things that don't relate to people's specific experience of the effectiveness of solutions against solving particular problems—that's our sweet spot."

### 2. Two-Phase Submission Pattern
**Question:** What specific problems were you solving with the two-phase submission?

**Answer:**
- **Natural Evolution:** Emerged to distinguish essential/compulsory vs voluntary fields
- **Save Strategy:** Save at earliest possible point (after required info), then nest optional info
- **User Flexibility:** Some users want detailed qualitative feedback, others want quick reports
- **Philosophy:** Accommodate both detailed contributors and quick reporters
- **Status:** "Not necessarily sold on keeping it" - may evolve based on user behavior

**Key Insight:** Designed for user choice - detailed vs quick submission paths

### 3. Auto-Categorization System
**Question:** How does the 10,000+ keyword auto-categorization work with forms?

**Answer:**
- **Timing:** Happens at the front, after user types their solution
- **Purpose:** Entire point is to serve the correct form template
- **Logic Flow:** User solution → Category detection → Form selection
- **Critical Function:** Must understand what form somebody is suited to based on their solution input

**Key Insight:** Auto-categorization is the routing mechanism that determines which of the 9 forms to show

### 4. Failed Solutions Feature
**Question:** How does the failed solutions feature integrate with the forms?

**Answer:**
- **Integration:** Part of main submission process, not separate flow
- **User Reality:** People try 15-20 solutions before finding what works (e.g., cystic acne)
- **Barrier Problem:** Users won't fill comprehensive forms for every failed attempt
- **Solution Strategy:** Quick entry for things that didn't work (low barrier)
- **Data Goal:** Capture effectiveness data across broad range of solutions, not just successes
- **Examples:** Toothpaste, fluoride, vitamin C, Cetaphil, Clearasil for acne

**Key Insight:** Lower barrier for failure data collection to get comprehensive effectiveness picture, not just success stories

### 5. Field Validation Rules
**Question:** What are the key validation patterns and business rules?

**Code Audit Results:**

**Universal Required Fields (all forms):**
- Effectiveness rating (1-5 stars) - cannot be 0/null
- Time to results dropdown - cannot be empty string

**Form-Specific Required Fields:**
- **SessionForm:** Cost range, session length (therapists), wait time (doctors/medical), specialty (doctors), response time (crisis), service type (professional services)
- **PurchaseForm:** Cost range, product type/format, ease of use (products), learning difficulty (books)
- **DosageForm:** Dose amount + unit (not beauty), frequency (not beauty), length of use

**Input Validation Patterns:**
- **Numeric Fields:** Regex `/^\d*\.?\d*$/` for dose amounts (numbers + decimal only)
- **Required Dropdowns:** HTML `required` attribute on select elements
- **Conditional Requirements:** Fields become required based on category (e.g., session length required for therapists but optional for others)

**Business Logic Validations:**
- Cost fields conditional on subscription/payment type selection
- Category-specific field visibility (e.g., skincare frequency vs standard frequency)
- Free version handling (sets cost to 'Free' automatically)

**Error Handling:**
- Base validation in FormTemplate for universal fields
- Individual form validation for category-specific requirements
- User-friendly error messages with alerts
- Server-side validation via server actions

**Key Pattern:** HTML required attributes + conditional client-side validation + server-side validation

### 6. Variants vs Solutions - Data Architecture Discovery
**Question:** How do variants affect form behavior and data structure?

**Database Audit Results:**

**Core Insight:** Every solution has at least one variant, but only 4 categories use "meaningful" variants:

**Categories with Real Variants (dosage-based):**
- **supplements_vitamins** (465 solutions, 0.6% standard variants)
- **medications** (367 solutions, 0.5% standard variants)
- **natural_remedies** (211 solutions, 4.3% standard variants)
- **beauty_skincare** (300 solutions, 1.3% standard variants)

**All Other Categories use "Standard" Variants (19 categories):**
- Apps, exercise, therapy, books, etc. (100% standard variants)
- Standard variants have null amount/unit/form fields

**Variant Structure:**
- **Real Variants:** "120mg capsule", "10% wash", "0.025mg/day patch"
- **Standard Variants:** Just "Standard" with null fields

**Form Impact:**
- DosageForm handles the 4 categories with real variants
- All other forms work with standard variants (hidden from users)
- Data consistency maintained across all solution types

**Key Design:** Variants exist for data structure consistency, but only dosage-based categories expose variant selection to users

---

## Documentation Goals:
- Create comprehensive /components/organisms/solutions/forms/README.md
- Capture business logic and strategic decisions
- Document experiential data focus philosophy
- Update /DOCUMENTATION-SESSIONS.md with progress