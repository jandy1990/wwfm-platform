# DosageForm Test Coverage Expansion Plan

> **Created**: January 26, 2025  
> **Purpose**: Systematic expansion of test coverage for DosageForm categories  
> **Current Status**: 1/4 categories tested (25% coverage)  
> **Target**: 4/4 categories tested (100% coverage)

## 📊 Current Coverage Status

| Category | Test Solution | Status | Key Differences |
|----------|---------------|--------|-----------------|
| `supplements_vitamins` | Vitamin D (Test) | ✅ Tested | Uses IU units, standard dosage flow |
| `medications` | Prozac (Test) | ❌ Not tested | Uses mg units, tablet form factor |
| `natural_remedies` | Lavender Oil (Test) | ❌ Not tested | Uses drops/tsp units, liquid forms |
| `beauty_skincare` | Retinol Cream (Test) | ❌ Not tested | NO DOSAGE - uses frequency only |

## 🔍 Category-Specific Code Analysis

### 1. **supplements_vitamins** (✅ Working)
```typescript
// Line 35: Unit options
unitOptions: ['mg', 'mcg', 'IU', 'g', 'ml', 'billion CFU', 'other']

// Line 265-271: Side effects
sideEffectOptions: ['None', 'Upset stomach', 'Nausea', 'Constipation', 
                    'Diarrhea', 'Headache', 'Metallic taste', 'Fatigue', 
                    'Skin reaction', 'Increased energy', 'Sleep changes', 
                    'Morning grogginess', 'Vivid dreams', 'Acne/breakouts', 
                    'Gas/bloating', 'Initially worse before better']

// Test uses: 500mg once daily
```

### 2. **medications** (❌ Not tested)
```typescript
// Line 36: Unit options
unitOptions: ['mg', 'mcg', 'g', 'ml', 'units', 'meq', 'other']

// Line 272-278: Side effects (MORE OPTIONS)
sideEffectOptions: ['None', 'Nausea', 'Headache', 'Dizziness', 'Drowsiness',
                    'Insomnia', 'Dry mouth', 'Weight gain', 'Weight loss',
                    'Sexual side effects', 'Mood changes', 'Appetite changes',
                    'Sweating', 'Tremor', 'Constipation', 'Blurred vision',
                    'Initially worse before better']

// Form factors: tablet, capsule, injection, etc.
```

### 3. **natural_remedies** (❌ Not tested)
```typescript
// Line 37: Unit options (DIFFERENT)
unitOptions: ['mg', 'g', 'ml', 'tsp', 'tbsp', 'cups', 'other']

// Line 279-284: Side effects (FEWER OPTIONS)
sideEffectOptions: ['None', 'Drowsiness', 'Upset stomach', 'Headache',
                    'Allergic reaction', 'Vivid dreams', 'Changes in appetite',
                    'Mild anxiety', 'Digestive changes', 'Skin reaction',
                    'Interactions with medications', 'Initially worse before better']

// Often liquid forms: tea, tincture, oil
```

### 4. **beauty_skincare** (❌ Not tested) - MOST DIFFERENT
```typescript
// Line 31: NOT in DOSAGE_CATEGORIES array
const DOSAGE_CATEGORIES = ['medications', 'supplements_vitamins', 'natural_remedies']
// beauty_skincare EXCLUDED!

// Line 227-229: Returns 'Standard' variant
if (category === 'beauty_skincare') {
  return 'Standard'; // Use single variant like apps
}

// Line 42-49: Skincare-specific frequencies
skincareFrequencies = [
  'twice_daily', 'once_daily_am', 'once_daily_pm',
  'every_other_day', '2-3_weekly', 'weekly', 'spot_treatment'
]

// Line 285-292: Different side effects
sideEffectOptions: ['None', 'Dryness/peeling', 'Redness/irritation',
                    'Purging (initial breakouts)', 'Burning/stinging',
                    'Itching', 'Photosensitivity', 'Discoloration',
                    'Allergic reaction', 'Oiliness', 'Clogged pores',
                    'Texture changes', 'Initially worse before better']

// NO dosage amount/unit - only frequency!
// Lines 318-323: Different validation
const dosageValid = category === 'beauty_skincare' 
  ? skincareFrequency !== ''  // Only frequency required
  : doseAmount !== '' && ... // Amount + unit required
```

## 🎯 Testing Strategy

### Phase 1: Individual Category Testing
Each category will be tested individually with its own test file to ensure isolation and clarity.

### Test Structure Template
```typescript
// tests/e2e/forms/dosage-form-[category].spec.ts

1. Navigate to add solution page
2. Search for test fixture (e.g., "Prozac (Test)")
3. Auto-detection should route to DosageForm
4. Fill category-specific fields
5. Verify submission success
6. Validate data pipeline
```

## 📋 Implementation Process (Per Category)

### Step 1: Code Inspection & Documentation
```markdown
For each category:
1. Review DosageForm.tsx lines specific to category
2. Document:
   - Unit options available
   - Side effect options
   - Validation rules
   - Special handling (e.g., beauty_skincare)
3. Create test data matrix
```

### Step 2: Test Fixture Verification
```bash
# Verify test solution exists in database
SELECT * FROM solutions WHERE title LIKE '%Test%' 
AND solution_category = '[category]';

# Verify variant (if applicable)
SELECT * FROM solution_variants WHERE solution_id = ...;
```

### Step 3: Form Filler Updates
```typescript
// Update fillDosageForm() for each category:

if (category === 'medications') {
  // Use 'mg' units (most common)
  await unitSelect.selectOption('mg')
  // Select tablet form factor
  // Handle prescription-specific side effects
}

if (category === 'natural_remedies') {
  // Use 'tsp' or 'drops' (liquid forms)
  await unitSelect.selectOption('tsp')
  // Different frequency patterns
}

if (category === 'beauty_skincare') {
  // NO DOSAGE FIELDS
  // Only skincare frequency dropdown
  await skincareFrequencySelect.selectOption('twice_daily')
  // Different side effects
}
```

### Step 4: Test Implementation
```typescript
test('should complete DosageForm for [category]', async ({ page }) => {
  // 1. Setup
  await clearTestRatingsForSolution(TEST_SOLUTIONS.[category])
  
  // 2. Navigate and search
  await page.goto('/goal/.../add-solution')
  await page.type('#solution-name', TEST_SOLUTIONS.[category])
  
  // 3. Fill form (category-specific)
  await fillDosageForm(page, '[category]')
  
  // 4. Verify pipeline
  const expectedFields = {
    // Category-specific expectations
  }
  await verifyDataPipeline(...)
})
```

### Step 5: Validation & Edge Cases
```markdown
Per category validations:
- medications: Verify decimal doses work (0.5mg)
- natural_remedies: Test custom units ('sachets')
- beauty_skincare: Confirm NO dosage fields appear
```

## 🚀 Execution Order

### Category 1: medications (Most Similar to Working Test)
**Priority**: HIGH - Similar to supplements_vitamins  
**Test Solution**: "Prozac (Test)"  
**Key Differences**:
- Different side effects list (17 vs 16 options)
- 'units' and 'meq' as unit options
- Form factor selection important

**Test Data**:
```javascript
{
  dosage_amount: '20',
  dosage_unit: 'mg',
  frequency: 'once daily',
  form: 'tablet',
  side_effects: ['None'],
  time_to_results: '3-4 weeks',
  length_of_use: '6-12 months'
}
```

### Category 2: natural_remedies (Moderate Differences)
**Priority**: MEDIUM - Different units system  
**Test Solution**: "Lavender Oil (Test)"  
**Key Differences**:
- Liquid measurements (tsp, tbsp, drops)
- Different side effects (herbal-specific)
- Often "as needed" frequency

**Test Data**:
```javascript
{
  dosage_amount: '5',
  dosage_unit: 'drops',
  frequency: 'as needed',
  form: 'oil',
  side_effects: ['None'],
  time_to_results: 'Immediately',
  length_of_use: 'As needed'
}
```

### Category 3: beauty_skincare (Most Different)
**Priority**: HIGH - Completely different flow  
**Test Solution**: "Retinol Cream (Test)"  
**Key Differences**:
- NO dosage amount/unit fields
- Uses skincare_frequency instead
- Different side effects (skin-specific)
- Returns 'Standard' variant

**Test Data**:
```javascript
{
  skincare_frequency: 'once_daily_pm',
  side_effects: ['Dryness/peeling'],
  time_to_results: '3-4 weeks',
  length_of_use: '3-6 months'
  // NO dosage_amount or dosage_unit!
}
```

## 🔧 Form Filler Modifications Required

### Current fillDosageForm() Issues
1. **Line selection by index** - Fragile when fields differ
2. **Hardcoded 'mg' unit** - Won't work for natural_remedies
3. **No beauty_skincare handling** - Completely different flow

### Proposed Updates
```typescript
export async function fillDosageForm(page: Page, category: string) {
  // Category-specific routing
  switch(category) {
    case 'beauty_skincare':
      await fillBeautySkincareForm(page);
      break;
    case 'natural_remedies':
      await fillNaturalRemediesForm(page);
      break;
    case 'medications':
      await fillMedicationsForm(page);
      break;
    default:
      await fillStandardDosageForm(page, category);
  }
}
```

## 📊 Success Metrics

1. **All 4 categories have passing tests**
2. **Data pipeline verification for each**:
   - Correct fields saved to database
   - Appropriate variant created (or 'Standard')
   - Side effects properly stored
3. **Form behavior validated**:
   - beauty_skincare shows no dosage fields
   - natural_remedies accepts liquid units
   - medications handles decimal doses

## ⚠️ Known Challenges

1. **beauty_skincare is fundamentally different**
   - Must handle missing dosage fields gracefully
   - Different field names (skincare_frequency vs frequency)
   - May need separate test approach

2. **Field selection by index is fragile**
   - beauty_skincare has different select count
   - Should use more robust selectors

3. **Variant handling varies**
   - 3 categories create real variants
   - beauty_skincare uses 'Standard' only

## 📝 Final Checklist

- [ ] Test fixtures verified in database
- [ ] Form filler updated for each category
- [ ] Individual test files created
- [ ] Data pipeline validated per category
- [ ] Edge cases tested
- [ ] Documentation updated in FORM_FIX_PROGRESS.md

## 🎯 Next Steps

1. **Start with medications** - Most similar to working test
2. **Then natural_remedies** - Test liquid measurements
3. **Finally beauty_skincare** - Requires most changes
4. **Update FORM_FIX_PROGRESS.md** after each success

---

This plan ensures systematic, thorough testing of each DosageForm category with proper isolation and validation.