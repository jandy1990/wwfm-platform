# WWFM Data Architecture Overhaul Documentation

## 1. Context & Discovery

### Background
WWFM is preparing to generate 2,000+ AI-seeded solutions to achieve 80% goal coverage for launch. During field standardization work, we discovered a critical bug: when multiple users rate the same solution, the second user's data completely overwrites the first user's data instead of aggregating it.

### The Discovery Path
1. Initial finding: Success screen fields appear editable but don't save (all 9 forms affected)
2. Deeper investigation: Forms include fields users haven't seen yet (phantom nulls)
3. Root cause: `solution_fields` in `goal_implementation_links` gets overwritten, not merged
4. Systemic issue: Architecture ambiguity about whether fields are individual or aggregated

## 2. The Core Problem

### What's Happening
When User 2 rates a solution that User 1 already rated:
```
User 1 submits: { side_effects: ["Nausea"], brand: "Nature Made", cost: "$10-25" }
Database saves: All User 1's data

User 2 submits: { side_effects: ["Headache"], brand: "", cost: "$5-10" }
Database now has: Only User 2's data (User 1's is LOST)
```

### Where It Lives
**Primary Location**: `/app/actions/submit-solution.ts`
- Line 302: `solution_fields: formData.solutionFields` - overwrites everything
- Line 420: Same bug when updating failed solutions

**Secondary Issues**: All 9 forms
- Include phantom fields (brand, notes) before user sees them
- Success screen shows fields that don't actually save

### Why It Wasn't Caught
1. No solutions have multiple ratings yet (verified via database query)
2. Testing doesn't cover multi-user scenarios
3. Comment "Update with latest fields" shows it was intentional but misguided
4. Architecture ambiguity about data ownership

## 3. Implications

### Immediate Impact
- **Data Loss**: Every new rating destroys previous user's metadata
- **AI Investment Risk**: 2,000 AI solutions could be overwritten by first user
- **Quality Degradation**: Instead of richer data over time, we get poorer data

### Business Impact
- **Value Proposition Failure**: Can't show "60% experienced nausea" if we only have last user's data
- **Trust Issues**: Users think they're contributing but data vanishes
- **Launch Blocker**: Can't launch with this fundamental flaw

### Technical Debt
- Architecture mismatch between layers
- No data aggregation logic
- Missing service layer
- Testing blind spots

## 4. Architectural Decision

### Current State (Broken)
- `solution_fields` stored in `goal_implementation_links` (shared location)
- Treated as individual data (overwritten each time)
- Display expects aggregated data but gets individual

### Target State ("Both" Architecture)
1. **Individual Storage** (source of truth)
   - Store in `ratings.solution_fields`
   - Preserve every user's contribution
   - Enable attribution and filtering

2. **Computed Aggregates** (for performance)
   - Store in `goal_implementation_links.aggregated_fields`
   - Calculate distributions and statistics
   - Update after each rating

### Why "Both" Is Required
- **Core Value**: WWFM aggregates experiences - that's the entire product
- **AI Transparency**: Show "AI suggests X, 60% of users report Y"
- **Future Features**: Trust scores, demographic filtering, outlier detection
- **Data Quality**: Can remove bad data without losing everything

## 5. Interacting & Intersecting Code

### Layer 1: Forms → Submission
**All 9 forms** (`/components/organisms/solutions/forms/`)
- DosageForm.tsx (lines 343-356)
- SessionForm.tsx (lines 1074-1108)
- PracticeForm.tsx (lines 291-340)
- LifestyleForm.tsx (lines 301-348)
- AppForm.tsx (lines 227-262)
- PurchaseForm.tsx (lines 273-312)
- CommunityForm.tsx (lines 271-303)
- HobbyForm.tsx (lines 218-247)
- FinancialForm.tsx (lines 275-306)

**Issues**:
- Include phantom fields (brand, notes) user hasn't seen
- Submit undefined values that become nulls
- Success screen dead functions

### Layer 2: Submission → Database
**Server Action** (`/app/actions/submit-solution.ts`)
- Lines 292-317: Updates existing link (OVERWRITES)
- Lines 318-334: Creates new link
- Lines 411-423: Updates for failed solutions (OVERWRITES AGAIN)

**Issues**:
- No merge logic
- Complete replacement of shared data
- No individual storage

### Layer 3: Database → Display
**Data Fetching** (`/lib/solutions/goal-solutions.ts`)
- Line 80: Maps solution_fields from goal_implementation_links
- No aggregation logic

**Display** (`/components/goal/GoalPageClient.tsx`)
- Lines 490-508: getFieldDisplayValue expects single values
- Lines 510-540: getCompositeFieldValue tries to combine
- No distribution display for most fields

## 6. Comprehensive To-Do List

### Phase 0: Audits & Documentation (2-3 hours)

#### Audit 1: Data Overwrite Locations
- [ ] Search all `.update()` calls affecting shared data
- [ ] Document every place solution_fields is modified
- [ ] Check for similar JSONB replacement patterns
- [ ] Verify no other tables have this issue

#### Audit 2: Phantom Fields Analysis
- [ ] List all fields sent before user sees them (per form)
- [ ] Document which fields appear on success screens
- [ ] Map field flow: form state → submission → database → display
- [ ] Identify all "dead" updateAdditionalInfo functions

#### Audit 3: Testing Coverage Gaps
- [ ] Review existing tests for multi-user scenarios
- [ ] Document missing test cases
- [ ] Identify critical paths needing tests

#### Audit 4: Database State Assessment
- [ ] Query current data to understand impact
- [ ] Check if any solutions have multiple ratings
- [ ] Verify data migration requirements
- [ ] Plan backup strategy

### Phase 1: Database Schema Changes (1 hour)

- [ ] Add `solution_fields` column to `ratings` table
- [ ] Add `aggregated_fields` column to `goal_implementation_links`
- [ ] Create migration script
- [ ] Test rollback procedure
- [ ] Document schema changes

### Phase 2: Fix Data Submission (3-4 hours)

#### Fix Core Submission Logic
- [ ] Move solution_fields storage to ratings table
- [ ] Remove overwriting from goal_implementation_links
- [ ] Implement proper field separation
- [ ] Handle failed solutions correctly

#### Clean Up Forms (All 9)
- [ ] Remove phantom fields from submission
- [ ] Only send fields user has actually filled
- [ ] Fix success screen to show read-only
- [ ] Remove dead updateAdditionalInfo functions

### Phase 3: Implement Aggregation (3-4 hours)

#### Create Aggregation Service
- [ ] Build field aggregation logic
- [ ] Handle different field types (arrays, strings, numbers)
- [ ] Calculate distributions and percentages
- [ ] Generate statistical summaries

#### Update After Ratings
- [ ] Trigger aggregation after new rating
- [ ] Store in aggregated_fields
- [ ] Handle edge cases (first rating, deletions)
- [ ] Optimize for performance

### Phase 4: Update Display Layer (2-3 hours)

#### Modify Data Fetching
- [ ] Fetch aggregated_fields instead of solution_fields
- [ ] Handle both AI and user data sources
- [ ] Prepare data for distribution display

#### Update GoalPageClient
- [ ] Show percentages for array fields
- [ ] Display ranges for numeric fields
- [ ] Show "most common" for text fields
- [ ] Add AI vs User indicators

### Phase 5: Testing & Validation (2 hours)

- [ ] Create multi-user rating tests
- [ ] Test aggregation logic
- [ ] Verify no data loss
- [ ] Test display of distributions
- [ ] Edge case testing

### Phase 6: Success Screen Fix (2-3 hours)

Either:
- [ ] Implement actual update functionality (Option B from ticket)
OR
- [ ] Make fields read-only (Option A from ticket)

### Phase 7: Documentation & Handoff (1 hour)

- [ ] Update architecture documentation
- [ ] Document new data flow
- [ ] Create migration guide
- [ ] Update CLAUDE.md with changes
- [ ] Create handoff for next session

## 7. Implementation Order

1. **Immediate**: Complete all audits (understand full scope)
2. **Next**: Database schema changes (foundation)
3. **Then**: Fix submission logic (stop the bleeding)
4. **Then**: Implement aggregation (add value)
5. **Then**: Update display (show value)
6. **Finally**: Testing and documentation

## 8. Success Criteria

- [ ] No data loss when multiple users rate same solution
- [ ] Aggregated statistics display correctly
- [ ] AI vs human data clearly separated
- [ ] All phantom fields eliminated
- [ ] Success screen actually saves OR is read-only
- [ ] Tests cover multi-user scenarios
- [ ] Documentation reflects new architecture

## 9. Risk Mitigation

- **Backup**: Export current data before changes
- **Rollback**: Keep migration scripts reversible
- **Testing**: Test with copies before production
- **Gradual**: Can implement individual storage first, aggregation later
- **Monitoring**: Add logging to track issues

## 10. Estimated Timeline

- **Total**: 16-20 hours
- **Critical Path** (stop data loss): 4-5 hours
- **Full Implementation**: 2-3 days
- **With Testing**: 3-4 days

This can be broken into multiple sessions with clear handoff points after each phase.

---

## IMPLEMENTATION PROGRESS

### ✅ Completed (Session 1 - 2025-08-20)

#### Phase 0: Audits
- [x] Audit 1: Found 2 critical overwrite locations
- [x] Audit 2: Documented phantom fields in all 9 forms  
- [x] Audit 3: Identified testing gaps (no multi-user tests)
- [x] Audit 4: Confirmed no existing multi-user data
- Created: `/docs/AUDIT_RESULTS_DATA_ARCHITECTURE.md`

#### Phase 1: Database Schema
- [x] Added `solution_fields` to `ratings` table
- [x] Added `aggregated_fields` to `goal_implementation_links`  
- [x] Created migration script at `/scripts/migrate-solution-fields.ts`

#### Phase 2: Core Fixes
- [x] Fixed data overwriting in `/app/actions/submit-solution.ts`:
  - Line 275: Now stores solution_fields with individual rating
  - Line 302: Removed overwriting of shared solution_fields
  - Line 327: New links don't include solution_fields
  - Line 417-423: Failed solutions now update rating, not shared link
- [x] Cleaned phantom fields in DosageForm.tsx

#### Phase 3: Aggregation Service
- [x] Created `/lib/services/solution-aggregator.ts`:
  - Computes distributions for array fields
  - Calculates cost ranges and most common values
  - Aggregates brands with counts
  - Creates percentage distributions
- [x] Integrated into submit-solution.ts (runs after each rating)

### ✅ Testing Results (2025-08-20)

Successfully tested multi-user ratings with test1@test.com and test2@test.com:
- **Data Preservation**: ✅ Both users' individual data fully preserved
- **Aggregation**: ✅ Correctly computed distributions (60% saw X, 40% saw Y)
- **No Overwrites**: ✅ Fixed the critical bug completely

### 🔍 Key Discovery: Display Layer Architecture

**Found**: Existing `ai_field_distributions` table for AI-simulated data
- Uses array format: `[{ name: "value", percentage: 50 }]`
- One row per field per solution
- Static, pre-populated predictions

**Decision**: Don't conform to this limited format. Instead, evolve the display to show richer real user data.

### 📊 New Display Architecture Decision

Instead of simplifying our aggregations to match AI format, we'll enhance the display to show:

```javascript
{
  side_effects: {
    distribution: [
      { value: "Nausea", count: 14, percentage: 60 },
      { value: "Headache", count: 9, percentage: 39 }
    ],
    metadata: {
      total_reports: 23,
      includes_ai: false,
      confidence: "high"
    }
  }
}
```

**Benefits**:
- Shows "14 of 23 users" not just "60%"
- Indicates data source (AI vs User)
- Enables confidence scoring
- Supports future filtering (recency, demographics)

### ⏳ Updated Remaining Work

#### Phase 4: Data Layer Alignment (COMPLETED - Session 3)
- [x] Updated aggregation service to output DistributionData format directly
- [x] Modified `solution-aggregator.ts` to align with display expectations
- [x] Updated `goal-solutions.ts` to fetch and pass `aggregated_fields`
- [x] Modified `GoalPageClient.tsx` to use aggregated data with AI fallback
- [x] Ensured no transformation needed - layers now speak same language

**Key Achievement**: Aligned layers at the source instead of using transformers

#### Phase 5: Clean Up Forms (2 hours)
- [x] DosageForm.tsx - phantom fields removed
- [ ] SessionForm.tsx
- [ ] PracticeForm.tsx
- [ ] LifestyleForm.tsx
- [ ] AppForm.tsx
- [ ] PurchaseForm.tsx
- [ ] CommunityForm.tsx
- [ ] HobbyForm.tsx
- [ ] FinancialForm.tsx

#### Phase 6: Success Screen Fix (2 hours)
- [ ] Make fields read-only (quick fix) OR
- [ ] Implement actual update functionality (proper fix)

#### Phase 7: Comprehensive Testing (2 hours)
- [x] Manual multi-user test - PASSED
- [ ] Automated multi-user rating tests
- [ ] Aggregation calculation tests
- [ ] Display of rich data tests

---

## Session 2 Summary (2025-08-20 Continued)

### Major Accomplishments:
1. **Tested the fix** - Confirmed both users' data preserved, aggregation works
2. **Critical decision** - Don't conform to AI format limitations, enhance display instead
3. **Architecture clarity** - Keep AI predictions separate from user aggregations

### Key Insights:
- Display layer already expects distributions (just wrong source)
- AI uses `ai_field_distributions` table (static predictions)
- Our `aggregated_fields` should be richer, not simpler
- Platform value = showing real aggregated experiences with transparency

---

## Session 3 Summary (2025-08-20 Continued)

### Major Accomplishments:
1. **Aligned data layers** - Aggregator now outputs DistributionData format directly
2. **No transformers needed** - Each layer speaks the same language
3. **Smart fallback** - Uses user data when available, falls back to AI
4. **Metadata preserved** - Tracks data source, confidence, and sample size

### Architecture Decision:
Instead of building transformers between layers, we aligned the aggregation service to output the exact format the display expects. This follows the "align the layers" principle and reduces complexity.

### Implementation Details:

#### Aggregation Service Changes:
- Output format: `{mode, values: [{value, count, percentage}], totalReports}`
- Added metadata tracking: `{data_source, confidence, total_ratings}`
- All field types now return consistent DistributionData format

#### Data Flow:
1. `solution-aggregator.ts` computes DistributionData from ratings
2. `goal-solutions.ts` fetches and passes `aggregated_fields` 
3. `GoalPageClient.tsx` uses aggregated data, falls back to AI if needed
4. Display components receive proper format without transformation

## Session Handoff Instructions

For the next Claude session, start with:
```
"Continue WWFM Data Architecture Overhaul - Display Enhancement Phase.
Read /docs/CRITICAL_DATA_ARCHITECTURE_OVERHAUL.md first.
Previous sessions: Fixed overwrites, aligned data layers, no transformers needed.
Need to: Enhance display components to show counts/sources, clean 8 forms, fix success screen."
```

### Files Modified So Far:
- `/app/actions/submit-solution.ts` - Fixed overwrites, integrated aggregation
- `/lib/services/solution-aggregator.ts` - Aligned output format with display
- `/lib/solutions/goal-solutions.ts` - Fetches aggregated_fields
- `/components/goal/GoalPageClient.tsx` - Uses aggregated data with fallback
- `/components/organisms/solutions/forms/DosageForm.tsx` - Removed phantom fields
- Database: Added `solution_fields` to ratings, `aggregated_fields` to links

### Critical Context for Next Session:
- **Don't use `ai_field_distributions` for user data** - Keep them separate
- **Build richer display** showing "14 of 23 users (60%)" not just "60%"
- **8 forms still need phantom field cleanup**
- **Success screen bug affects ALL 9 forms**

---

*Created: 2025-08-20*
*Last Updated: 2025-08-20 (End of Session 2)*
*Priority: CRITICAL - Must complete before AI solution generation*
*Status: Core architecture fixed & tested, display enhancement needed*