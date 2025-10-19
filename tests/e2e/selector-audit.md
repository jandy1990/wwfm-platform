# Phase 1 Test Selector Audit

**Created**: 2025-10-19
**Purpose**: Document all brittle `.nth()` selectors before migration to semantic patterns

---

## Summary

- **Total brittle selectors found**: 37
- **Forms affected**: 9 (all forms)
- **Primary issue**: Position-based selectors will break when converting to shadcn Select components

---

## Selector Inventory by Form

### DosageForm (8 selectors) - HIGH PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness | Category Context |
|------|-----------------|---------------|-------------|------------------|
| 137 | `page.locator('select').nth(0)` | Unit dropdown | HIGH | Non-beauty categories |
| 143 | `page.locator('select').nth(1)` | Frequency dropdown | HIGH | Non-beauty categories |
| 149 | `page.locator('select').nth(2)` | Length of use dropdown | HIGH | Non-beauty categories |
| 170 | `page.locator('select').nth(0)` | Time to results | HIGH | beauty_skincare only |
| 176 | `page.locator('select').nth(1)` | Skincare frequency | HIGH | beauty_skincare only |
| 182 | `page.locator('select').nth(2)` | Length of use | HIGH | beauty_skincare only |
| 188 | `page.locator('select').nth(3)` | Time to results | HIGH | Non-beauty categories |
| 1032 | `page.locator('select').nth(i)` | Loop iteration | MEDIUM | Validation loop |

**Notes**:
- beauty_skincare has different field order (no dosage fields)
- Two different paths: beauty (lines 170-182) vs non-beauty (lines 137-149, 188)

---

### AppForm (3 selectors) - MEDIUM PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 267 | `page.locator('select:visible').nth(1)` | Usage frequency | HIGH |
| 272 | `page.locator('select:visible').nth(2)` | Subscription type | HIGH |
| 280 | `page.locator('select:visible').nth(3)` | Cost range | HIGH |

**Notes**:
- Uses `:visible` qualifier (safer but still brittle)

---

### FinancialForm (6 selectors) - MEDIUM PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 1176 | `page.locator('select').nth(0)` | Time commitment | HIGH |
| 1182 | `page.locator('select').nth(1)` | Startup cost | HIGH |
| 1188 | `page.locator('select').nth(2)` | Ongoing cost | HIGH |
| 1194 | `page.locator('select').nth(3)` | Frequency | HIGH |
| 1200 | `page.locator('select').nth(4)` | Category | HIGH |
| 1664-1684 | Multiple selects | Benefit/access/time selects | HIGH |

---

### SessionForm (1 selector) - LOW PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 975 | `page.locator('button[role="combobox"]').nth(responseTimeIndex)` | Response time (crisis) | MEDIUM |

**Notes**:
- Already uses shadcn Select (combobox)
- Index is calculated, not hardcoded
- Safer pattern but should still use semantic selector

---

### PracticeForm (2 selectors) - LOW PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 792 | `page.locator('button[role="combobox"]').nth(formatIndex)` | Format | MEDIUM |
| 831 | `page.locator('button[role="combobox"]').nth(i)` | Loop iteration | MEDIUM |

**Notes**:
- Already uses shadcn Select (combobox)
- Index is calculated from visibility checks

---

### PurchaseForm (4 selectors) - MEDIUM PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 1304 | `page.locator('button[role="combobox"]').nth(1)` | Product type | MEDIUM |
| 1318 | `page.locator('button[role="combobox"]').nth(2)` | Ease of use | MEDIUM |
| 1343 | `page.locator('button[role="combobox"]').nth(1)` | Format (books) | MEDIUM |
| 1357 | `page.locator('button[role="combobox"]').nth(2)` | Difficulty (books) | MEDIUM |

**Notes**:
- Already uses shadcn Select (combobox)
- Category-specific fields (products_devices vs books_courses)

---

### CommunityForm (5 selectors) - MEDIUM PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 1435 | `page.locator('button[role="combobox"]').nth(1)` | Payment type | MEDIUM |
| 1443 | `page.locator('button[role="combobox"]').nth(2)` | Cost range | MEDIUM |
| 1451 | `page.locator('button[role="combobox"]').nth(3)` | Meeting frequency | MEDIUM |
| 1459 | `page.locator('button[role="combobox"]').nth(4)` | Format | MEDIUM |
| 1467 | `page.locator('button[role="combobox"]').nth(5)` | Group size | MEDIUM |

**Notes**:
- Already uses shadcn Select (combobox)
- Most selectors in single form (5 dropdowns)

---

### LifestyleForm (4 selectors) - MEDIUM PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 1574 | `page.locator('select').nth(0)` | Time commitment | HIGH |
| 1580 | `page.locator('select').nth(1)` | Cost | HIGH |
| 1593 | `page.locator('select').nth(2)` | Prep time (diet) | HIGH |
| 1598 | `page.locator('select').nth(2)` | Sleep hours (sleep) | HIGH |

**Notes**:
- Category-specific: diet_nutrition vs sleep
- Line 1593 and 1598 both use `.nth(2)` but in different categories

---

### HobbyForm (1 selector) - LOW PRIORITY

**Notes**: No .nth() selectors found in HobbyForm filler.

---

### Shared/Utility (3 selectors) - LOW PRIORITY

| Line | Brittle Selector | Field Purpose | Brittleness |
|------|-----------------|---------------|-------------|
| 542 | `ratingButtonsLocator.nth(3)` | 4-star rating | LOW |
| 547 | `ratingButtonsLocator.nth(3)` | Check if selected | LOW |
| 556 | `alternativeButtonsLocator.nth(3)` | Alternative rating | LOW |

**Notes**:
- Rating buttons are not dropdowns
- Semantic equivalent: `page.getByRole('button', { name: '4 stars' })` or similar

---

## Migration Priority

### Critical (Must fix before component changes)
1. **DosageForm** (8 selectors) - Will break immediately when native select → shadcn
2. **FinancialForm** (6 selectors) - Will break immediately
3. **AppForm** (3 selectors) - Will break immediately

### High (Forms already using shadcn, but brittle)
4. **CommunityForm** (5 selectors) - Already shadcn but position-dependent
5. **PurchaseForm** (4 selectors) - Already shadcn but position-dependent
6. **LifestyleForm** (4 selectors) - Will break when migrated

### Medium
7. **PracticeForm** (2 selectors) - Calculated index, safer but should fix
8. **SessionForm** (1 selector) - Calculated index

### Low
9. **HobbyForm** (0 selectors) - No brittle selectors
10. **Shared utilities** (3 rating selectors) - Not affected by select changes

---

## Recommended Migration Order

1. DosageForm (highest impact, 4 categories to test)
2. FinancialForm (many selectors, simpler form)
3. AppForm (fewer selectors, quick win)
4. LifestyleForm (category-specific logic)
5. PurchaseForm (already shadcn, easier to test)
6. CommunityForm (many selectors but straightforward)
7. PracticeForm (calculated indexes)
8. SessionForm (single selector, complex form)
9. HobbyForm (no changes needed)

---

## Semantic Selector Strategy

### For native `<select>` elements (will become shadcn):
```typescript
// ❌ Brittle
const unitSelect = page.locator('select').nth(0)

// ✅ Semantic (works with both native and shadcn)
const unitSelect = page.getByLabel('Unit', { exact: false })
// OR
const unitSelect = page.locator('label:has-text("Unit") + select')
// OR (for shadcn Select)
const unitSelect = page.getByRole('combobox', { name: /unit/i })
```

### For shadcn Select (already `button[role="combobox"]`):
```typescript
// ❌ Brittle
const formatSelect = page.locator('button[role="combobox"]').nth(1)

// ✅ Semantic
const formatSelect = page.getByRole('combobox', { name: /format/i })
// OR
const formatSelect = page.getByLabel('Format')
```

### For rating buttons:
```typescript
// ❌ Brittle
await ratingButtonsLocator.nth(3).click()

// ✅ Semantic
await page.getByRole('button', { name: '4 stars' }).click()
// OR
await page.getByLabel('Rate 4 out of 5').click()
```

---

## Next Steps

1. **Task 1.2**: Map exact form labels by reading component files
2. **Task 1.3**: Run baseline tests to ensure 31/31 passing before changes
3. **Task 1.4**: Create feature branch
4. **Task 2.1-2.4**: Begin DosageForm selector migration

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Labels change between forms | MEDIUM | Document exact label text per form |
| Duplicate labels within form | HIGH | Use more specific locators (section scoping) |
| Category-specific fields | HIGH | Add category checks in test logic |
| shadcn Select structure different | MEDIUM | Test both native and shadcn patterns |
| Tests become flaky | LOW | Use `waitFor()` and proper visibility checks |

---

**Audit Complete**: Ready to proceed with label mapping (Task 1.2)
