# WWFM Form Data Flow Matrix

## Overview
This matrix documents all data-related components across the 9 WWFM forms, excluding pure UI elements.

## Data Flow Components Matrix

| Form | Data Imports | Hooks | solutionFields Pattern | Variant Handling | Server Actions | Special Components |
|------|--------------|-------|------------------------|------------------|----------------|-------------------|
| **AppForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• SubmitSolutionData | • useFormBackup | Direct object literal `{}` | ❌ None | • submitSolution<br>• updateSolutionFields | None |
| **CommunityForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• supabase (imported)<br>• createClientComponentClient | • useFormBackup | Direct object `Record<string, any> = {}` | ❌ None | • submitSolution<br>• updateSolutionFields | • Select (shadcn) |
| **DosageForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• SubmitSolutionData | • useFormBackup | **Conditional empty object**<br>`Record<string, any> = {}`<br>then conditionally adds | ✅ Yes (variantData) | • submitSolution<br>• updateSolutionFields | None |
| **FinancialForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• supabase (imported) | • useFormBackup | Direct object `Record<string, any> = {}` | ❌ None | • submitSolution<br>• updateSolutionFields | None |
| **HobbyForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• SubmitSolutionData | • useFormBackup | Direct object literal `{}` | ❌ None | • submitSolution<br>• updateSolutionFields | None |
| **LifestyleForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• supabase (imported) | • useFormBackup | Direct object with spread<br>`Record<string, any> = {}`<br>uses `...()` syntax | ❌ None | • submitSolution<br>• updateSolutionFields | None |
| **PracticeForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• SubmitSolutionData | • useFormBackup | Direct object with spread<br>`Record<string, any> = {}`<br>uses `...()` syntax | ❌ None | • submitSolution<br>• updateSolutionFields | None |
| **PurchaseForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• supabase (imported)<br>• createClientComponentClient | • useFormBackup | Direct object with spread<br>`Record<string, any> = {}`<br>uses `...()` syntax | ❌ None | • submitSolution<br>• updateSolutionFields | • Select (shadcn)<br>• RadioGroup (shadcn) |
| **SessionForm** | • submitSolution<br>• updateSolutionFields<br>• FailedSolutionsPicker<br>• supabase (imported) | • useFormBackup | Direct object with conditionals<br>`Record<string, any> = {}`<br>then adds with `if` | ❌ None | • submitSolution<br>• updateSolutionFields | • Select (shadcn)<br>• Label |

## Data Transformation Patterns

### solutionFields Construction Methods

#### Pattern A: Conditional Empty Object (DosageForm) ✅
```typescript
const solutionFields: Record<string, any> = {}
if (value) solutionFields.field = value
```
- Used by: DosageForm
- **Benefit**: Only includes fields with values

#### Pattern B: Direct Object Literal (AppForm, HobbyForm) ❌
```typescript
const solutionFields = {
  field1: value1,
  field2: value2
}
```
- Used by: AppForm, HobbyForm
- **Risk**: May include undefined values

#### Pattern C: Direct Object with Spread Operator (LifestyleForm, PracticeForm, PurchaseForm)
```typescript
const solutionFields: Record<string, any> = {
  baseField: value,
  ...(condition && { field: value })
}
```
- Used by: LifestyleForm, PracticeForm, PurchaseForm
- **Benefit**: Conditional inclusion with cleaner syntax

#### Pattern D: Hybrid (SessionForm, CommunityForm, FinancialForm)
```typescript
const solutionFields: Record<string, any> = {
  requiredFields: values
}
// Then conditionally add
if (optional) solutionFields.optional = value
```
- Used by: SessionForm, CommunityForm, FinancialForm
- **Mixed**: Some fields always included, others conditional

## Common Data Fields Across Forms

### Universal Fields (Present in Most Forms)
| Field | Forms Using It |
|-------|---------------|
| `cost` | All 9 forms |
| `cost_type` | All 9 forms |
| `time_to_results` | 8 forms (all except CommunityForm uses time_to_impact) |
| `challenges` | 6 forms (App, Community, Financial, Hobby, Lifestyle, Purchase) |

### Category-Specific Fields
| Field | Forms | Purpose |
|-------|-------|---------|
| `dosage_amount`, `dosage_unit` | DosageForm only | Medication/supplement dosing |
| `usage_frequency` | AppForm only | App usage patterns |
| `meeting_frequency` | CommunityForm only | Group meeting schedule |
| `session_frequency`, `session_length` | SessionForm only | Therapy/coaching sessions |
| `frequency` | DosageForm, HobbyForm, PracticeForm | General frequency |
| `side_effects` | DosageForm only | Medical side effects |

## Server Action Flow

### All Forms Use Identical Pattern:
1. **Initial Submission**: `submitSolution(submissionData)`
   - Creates rating with `solution_fields`
   - Creates/updates `goal_implementation_links`
   - Triggers aggregation

2. **Success Screen Update**: `updateSolutionFields(data)`
   - Merges additional fields into existing rating
   - Re-triggers aggregation

## Key Differences & Patterns

### Supabase Client Import
- **Forms with supabase import**: Community, Financial, Lifestyle, Purchase, Session (5 forms)
- **Forms without**: App, Dosage, Hobby, Practice (4 forms)
- **Note**: None actually use the supabase client directly

### UI Component Libraries
- **Forms using shadcn components**: Community (Select), Purchase (Select, RadioGroup), Session (Select)
- **Forms using only HTML**: App, Dosage, Financial, Hobby, Lifestyle, Practice

### Variant Handling
- **Only DosageForm** handles variants (for medications, supplements, natural remedies, beauty)
- All other forms use standard solution without variants

## Data Validation Patterns

### Field Filtering
- **Array fields**: Most forms filter out "None" values
  ```typescript
  challenges: selectedChallenges.filter(c => c !== 'None')
  ```
- **Conditional inclusion**: Several forms only include fields if they have values
- **DosageForm**: Most thorough validation (checks each field before adding)

## Success Screen Fields (updateSolutionFields)

All forms defer some fields to success screen:
- **Common deferred fields**: notes, brand, platform, provider
- **Form-specific deferred**: 
  - DosageForm: brand, form_factor
  - AppForm: platform
  - CommunityForm: payment_frequency, commitment_type, accessibility_level
  - SessionForm: specialty, response_time, completed_treatment

## Testing Correlation

### Test Status vs Patterns
| Pattern | Forms | Test Status |
|---------|-------|-------------|
| Conditional empty object | DosageForm | ✅ Working |
| Direct object literal | AppForm, HobbyForm | ❌ AppForm failing |
| Direct with spread | Lifestyle, Practice, Purchase | Mixed |
| Hybrid approach | Session, Community, Financial | ❌ CommunityForm failing |

### Potential Issues Identified
1. **AppForm**: Direct object literal may include undefined values
2. **CommunityForm**: Uses Select component which may have visibility issues
3. **Only DosageForm** uses pure conditional pattern (most reliable)

## Recommendations

1. **Standardize solutionFields construction** to DosageForm's conditional pattern
2. **Remove unused supabase imports** from 5 forms
3. **Investigate shadcn Select component** visibility in tests
4. **Ensure all forms filter undefined values** before submission