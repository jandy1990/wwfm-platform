# Form Label to Semantic Selector Mapping

**Created**: 2025-10-19
**Purpose**: Map exact form labels to semantic selectors for test migration

---

## DosageForm Label Mappings

### Non-Beauty Categories (medications, supplements_vitamins, natural_remedies)

| Brittle Selector | Field Purpose | Label Text | Semantic Selector | File Line |
|-----------------|---------------|------------|-------------------|-----------|
| `page.locator('select').nth(0)` | Dose unit | "Unit *" | `page.locator('label:has-text("Unit") + div select')` | 612 |
| `page.locator('select').nth(1)` | Frequency | "How often? *" | `page.locator('label:has-text("How often?") + select')` | 652 |
| `page.locator('select').nth(2)` | Length of use | "How long did you use it? *" | `page.locator('label:has-text("How long did you use it?") + select')` | 687 |
| `page.locator('select').nth(3)` | Time to results | "When did you notice results? *" | `page.locator('label:has-text("When did you notice results?") + select')` | 489 |

**Note**: "Amount *" field (line 589) is an `<input type="text">`, not a select

### Beauty/Skincare Category Specific

| Brittle Selector | Field Purpose | Label Text | Semantic Selector | File Line |
|-----------------|---------------|------------|-------------------|-----------|
| `page.locator('select').nth(0)` | Time to results | "When did you notice results? *" | `page.locator('label:has-text("When did you notice results?") + select')` | 489 |
| `page.locator('select').nth(1)` | Skincare frequency | "How often did you use it? *" | `page.locator('label:has-text("How often did you use it?") + select')` | 531 |
| `page.locator('select').nth(2)` | Length of use | "How long did you use it? *" | (Same as nth(1) for non-beauty - ambiguous!) | 551 |
| `page.locator('select').nth(3)` | Time to results | "When did you notice results? *" | (Duplicate - see above) | - |

**⚠️ CRITICAL ISSUE**: beauty_skincare has "How long did you use it?" at BOTH lines 551 and 687, but different contexts!
- **Solution**: Use section scoping or more specific locator

### Recommended Semantic Selectors for DosageForm

```typescript
// Non-beauty categories
const unitSelect = page.locator('label').filter({ hasText: 'Unit' }).locator('..').locator('select')
const frequencySelect = page.locator('label').filter({ hasText: 'How often?' }).locator('..').locator('select')
const lengthSelect = page.locator('label').filter({ hasText: /How long did you use it\?/ }).locator('..').locator('select')
const timeSelect = page.locator('label').filter({ hasText: 'When did you notice results?' }).locator('..').locator('select')

// Beauty/skincare (use section scoping if needed)
const skincareFrequencySelect = page.locator('text=Application details').locator('..').locator('label:has-text("How often")').locator('..').locator('select')
const lengthSelect = page.locator('text=Application details').locator('..').locator('label:has-text("How long")').locator('..').locator('select')
```

---

## AppForm Label Mappings

**TODO**: Read AppForm.tsx to get exact labels
**Brittle selectors to replace**:
- Line 267: `page.locator('select:visible').nth(1)` - Usage frequency
- Line 272: `page.locator('select:visible').nth(2)` - Subscription type
- Line 280: `page.locator('select:visible').nth(3)` - Cost range

---

## FinancialForm Label Mappings

**TODO**: Read FinancialForm.tsx to get exact labels
**Brittle selectors to replace**:
- Line 1176: `page.locator('select').nth(0)` - Time commitment
- Line 1182: `page.locator('select').nth(1)` - Startup cost
- Line 1188: `page.locator('select').nth(2)` - Ongoing cost
- Line 1194: `page.locator('select').nth(3)` - Frequency
- Line 1200: `page.locator('select').nth(4)` - Category

---

## LifestyleForm Label Mappings

**TODO**: Read LifestyleForm.tsx to get exact labels
**Brittle selectors to replace**:
- Line 1574: `page.locator('select').nth(0)` - Time commitment
- Line 1580: `page.locator('select').nth(1)` - Cost
- Line 1593: `page.locator('select').nth(2)` - Prep time (diet category)
- Line 1598: `page.locator('select').nth(2)` - Sleep hours (sleep category)

---

## SessionForm Label Mappings

**TODO**: Read SessionForm.tsx to get exact labels (mostly uses shadcn already)
**Brittle selectors to replace**:
- Line 975: `page.locator('button[role="combobox"]').nth(responseTimeIndex)` - Response time

---

## PracticeForm Label Mappings

**TODO**: Read PracticeForm.tsx to get exact labels (uses shadcn Select)
**Brittle selectors to replace**:
- Line 792: `page.locator('button[role="combobox"]').nth(formatIndex)` - Format

---

## PurchaseForm Label Mappings

**TODO**: Read PurchaseForm.tsx to get exact labels (uses shadcn Select)
**Brittle selectors to replace**:
- Line 1304: `page.locator('button[role="combobox"]').nth(1)` - Product type
- Line 1318: `page.locator('button[role="combobox"]').nth(2)` - Ease of use
- Line 1343: `page.locator('button[role="combobox"]').nth(1)` - Format (books)
- Line 1357: `page.locator('button[role="combobox"]').nth(2)` - Difficulty (books)

---

## CommunityForm Label Mappings

**TODO**: Read CommunityForm.tsx to get exact labels (uses shadcn Select)
**Brittle selectors to replace**:
- Line 1435: `page.locator('button[role="combobox"]').nth(1)` - Payment type
- Line 1443: `page.locator('button[role="combobox"]').nth(2)` - Cost range
- Line 1451: `page.locator('button[role="combobox"]').nth(3)` - Meeting frequency
- Line 1459: `page.locator('button[role="combobox"]').nth(4)` - Format
- Line 1467: `page.locator('button[role="combobox"]').nth(5)` - Group size

---

## General Semantic Selector Patterns

### For Native `<select>` Elements

```typescript
// ✅ Method 1: Filter label by text, traverse to parent, find select
const select = page.locator('label').filter({ hasText: 'Label Text' }).locator('..').locator('select')

// ✅ Method 2: Use getByLabel (Playwright built-in)
const select = page.getByLabel('Label Text', { exact: false })

// ✅ Method 3: Section scoping for duplicate labels
const select = page.locator('text=Section Header').locator('..').locator('label:has-text("Label")').locator('..').locator('select')
```

### For shadcn Select (`button[role="combobox"]`)

```typescript
// ✅ Method 1: Use getByRole with name
const select = page.getByRole('combobox', { name: /label text/i })

// ✅ Method 2: Filter by label text
const select = page.locator('label').filter({ hasText: 'Label Text' }).locator('..').locator('button[role="combobox"]')
```

### For Rating Buttons

```typescript
// ❌ Brittle
await ratingButtonsLocator.nth(3).click()

// ✅ Semantic - find by emoji or text
await page.locator('button').filter({ hasText: '😊' }).click() // 4-star emoji
// OR if buttons have aria-labels
await page.getByRole('button', { name: '4 stars' }).click()
```

---

## Migration Strategy

1. **Read form component** to get exact label text
2. **Verify label uniqueness** within form (watch for duplicates!)
3. **Choose semantic selector** based on element type
4. **Test with old component** to ensure selector works
5. **Update label mapping** before moving to next form

---

## Edge Cases & Notes

### Duplicate Labels
- **DosageForm**: "How long did you use it?" appears for both beauty and non-beauty
  - **Solution**: Use section scoping with "Application details" header

### Dynamic Labels
- Some forms may have category-specific labels
- **Solution**: Add category checks in test code

### Visibility Filters
- AppForm uses `:visible` qualifier
- **Solution**: Keep visibility check in semantic selector if needed

### Calculated Indexes
- PracticeForm and SessionForm calculate index from visibility
- **Solution**: Replace with semantic selectors entirely, safer than calculated index

---

## Next Steps

1. **Complete mapping**: Read remaining form components (AppForm, FinancialForm, etc.)
2. **Verify uniqueness**: Check for label collisions within each form
3. **Document workarounds**: Note any complex selectors needed
4. **Begin migration**: Start with DosageForm (Task 2.1)
