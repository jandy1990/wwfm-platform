# CLEANUP_PLAN.md - WWFM Codebase Reset Action Plan

## 🎯 Executive Summary
Based on analysis of all project documentation, WWFM needs focused cleanup in 4 areas:
1. **Critical Bug Fixes** (Rating submission blocker)
2. **Code Organization** (Inconsistent patterns, dead code)
3. **Missing Implementation** (8/9 forms incomplete)
4. **Documentation Debt** (Context scattered across artifacts)

**Estimated Timeline**: 2 weeks for full cleanup (1 hour daily + focused sessions)

## 📅 Week 1: Foundation & Critical Fixes

### Day 1: Documentation & Setup (2 hours)
```bash
Morning (1 hour):
1. Copy CLAUDE.md, ARCHITECTURE.md, DEBUGGING.md, WORKFLOW.md to project root
2. Create .claude/ directory for additional context
3. Set up Claude Code MCP connection
4. Verify filesystem access

Afternoon (1 hour):
1. Fix the critical rating bug (see DEBUGGING.md)
2. Test with authenticated and anonymous users
3. Update DEBUGGING.md with results
4. Commit: "fix: Add missing variant prop to InteractiveRating"
```

### Day 2: Codebase Audit (1 hour)
```bash
Tasks for Claude Code:
1. "Scan all TypeScript files and list all 'any' types"
2. "Find all console.log statements in the codebase"
3. "Identify all commented-out code blocks"
4. "List all unused imports across components"
5. "Find duplicate component patterns"

Output: AUDIT_RESULTS.md with prioritized cleanup list
```

### Day 3: Quick Wins Cleanup (1 hour)
```bash
Focus: Remove obvious dead code
1. Remove all console.log statements (except error handlers)
2. Delete commented-out code
3. Remove unused imports
4. Fix ESLint errors
5. Run: npm run lint --fix

Target: 500+ lines of code removed
```

### Day 4: TypeScript Hardening (1 hour)
```bash
Focus: Type safety
1. Replace all 'any' with proper types
2. Create missing interfaces in /types/
3. Add return types to all functions
4. Enable strict mode in tsconfig.json
5. Fix resulting TypeScript errors

Key files:
- /types/solution.ts (define all solution-related types)
- /types/forms.ts (define form field types)
- /types/database.ts (match Supabase schema)
```

### Day 5: Component Organization (1 hour)
```bash
Focus: Atomic Design structure
1. Create component hierarchy:
   /components/atoms/      (Button, Input, Card)
   /components/molecules/  (RatingDisplay, SolutionCard)
   /components/organisms/  (SolutionList, GoalHeader)
   /components/templates/  (PageLayout)

2. Move existing components to proper locations
3. Update all imports
4. Ensure no circular dependencies
```

## 📅 Week 2: Implementation & Polish

### Day 6-7: Form Implementation Sprint (4 hours)
```bash
Priority Order:
1. SessionForm (7 categories) - Most common
2. PracticeForm (3 categories) - Simple structure  
3. AppForm (1 category) - High user demand
4. PurchaseForm (2 categories)

For each form:
1. Copy DosageForm pattern
2. Implement category-specific fields
3. Add failed solutions search
4. Test with real data
5. Update form count in CLAUDE.md
```

### Day 8: Error Handling & Loading States (1 hour)
```bash
1. Create standard error boundary component
2. Add loading skeletons for all data fetches
3. Implement retry logic for failed requests
4. Add user-friendly error messages
5. Create toast notification system
```

### Day 9: Authentication Flow (1 hour)
```bash
Focus: Fix client component auth issues
1. Create auth context provider
2. Pass user ID from server components
3. Implement proper session handling
4. Add auth check wrapper component
5. Test all protected routes
```

### Day 10: Performance Optimization (1 hour)
```bash
1. Run bundle analyzer: npm run analyze
2. Implement code splitting for forms
3. Add dynamic imports for heavy components
4. Optimize images with next/image
5. Check and fix any layout shifts
6. Target: <3s initial load time
```

## 🧪 Testing & Validation Checklist

### Functionality Tests
- [ ] Anonymous users can browse goals and solutions
- [ ] Authenticated users can rate solutions
- [ ] All 9 forms render and submit correctly
- [ ] Search works with typos (fuzzy matching)
- [ ] Filters and sorting work as expected
- [ ] Mobile gestures (swipe to rate) work

### Data Integrity Tests
- [ ] All solutions have at least one variant
- [ ] Ratings link to valid variant IDs
- [ ] Effectiveness shows in goal_implementation_links
- [ ] No orphaned records in database

### Performance Tests
- [ ] Initial page load <3 seconds
- [ ] No layout shifts (CLS = 0)
- [ ] Bundle size <500KB for initial load
- [ ] Database queries <100ms

## 📊 Success Metrics

### Before Cleanup
- TypeScript coverage: ~60% (many 'any' types)
- Dead code: ~2000 lines
- Bundle size: Unknown (needs analysis)
- Forms complete: 1/9
- Critical bugs: 1 (rating submission)

### After Cleanup Target
- TypeScript coverage: 95%+
- Dead code: 0 lines
- Bundle size: <500KB
- Forms complete: 9/9
- Critical bugs: 0

## 🚀 Post-Cleanup Next Steps

1. **Content Expansion**
   - Generate 1,500+ solutions
   - Add hypothetical effectiveness ratings
   - Achieve 80% goal coverage

2. **Feature Development**
   - Admin review queue
   - Email notifications
   - Analytics integration
   - User profiles

3. **Testing Suite**
   - Unit tests for components
   - Integration tests for forms
   - E2E tests for critical paths

## 💡 Key Decisions to Document

As you clean up, document these decisions in ARCHITECTURE.md:
1. Why certain patterns were chosen
2. Trade-offs made for performance vs. features
3. Security considerations for RLS policies
4. Accessibility standards followed

## 🔧 Tooling Setup

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Git Commit Convention
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
perf: Performance improvements
test: Test additions/changes
chore: Build process/auxiliary tool changes
```

## 🎯 Final Checklist

### Documentation In Codebase
- [ ] CLAUDE.md (AI context)
- [ ] ARCHITECTURE.md (patterns)
- [ ] DEBUGGING.md (issues/solutions)
- [ ] WORKFLOW.md (process)
- [ ] CLEANUP_PLAN.md (this file)

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All imports resolved
- [ ] Consistent naming
- [ ] Proper error handling

### User Experience
- [ ] Fast initial load
- [ ] Smooth interactions
- [ ] Clear error messages
- [ ] Mobile responsive
- [ ] Accessible (basic a11y)

Remember: This cleanup is about creating a sustainable foundation for growth. Take time to do it right rather than rushing through.