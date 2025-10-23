# WORKFLOW.md - WWFM Development Workflow Guide

## 🎯 Development Philosophy

WWFM follows an iterative, user-focused development approach. We prioritize shipping small improvements frequently over perfect but delayed features. Every change should make the platform more valuable for users seeking or sharing solutions.

## 🏃 Getting Started

### Initial Setup
```bash
# Clone the repository
git clone [repository-url]
cd wwfm-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
# Opens on http://localhost:3000 (or next available port up to 3005)
```

### Daily Startup Routine
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Check for TypeScript errors
npm run type-check

# 4. Start dev server
npm run dev
```

## 🔄 Development Workflow

### 1. Planning Phase

Before writing code, understand the full context:

```markdown
## Feature/Bug Planning Template

**What**: [Clear description of what needs to be done]
**Why**: [User value or problem being solved]
**Where**: [Affected files/components]
**How**: [High-level approach]
**Success Criteria**: [How we know it's done]
```

### 2. Implementation Flow

#### Feature Branch Strategy
```bash
# Create feature branch
git checkout -b feature/add-session-form
# or
git checkout -b fix/rating-submission-error

# Work iteratively with frequent commits
git add -p  # Stage changes selectively
git commit -m "feat: add basic SessionForm structure"
git commit -m "feat: add category-specific fields to SessionForm"
git commit -m "test: add SessionForm validation tests"
```

#### Commit Message Format
```
feat: add user profile page
fix: resolve hydration error in GoalCard
docs: update setup instructions
style: format code with prettier
refactor: extract common form logic
perf: optimize image loading
test: add rating component tests
chore: update dependencies
```

### 3. Testing Approach

#### Manual Testing Checklist
- [ ] Works for anonymous users
- [ ] Works for authenticated users  
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Error states handle gracefully
- [ ] Data persists after refresh

#### Key Test Scenarios
```typescript
// Test data edge cases
- Empty states (no solutions, no ratings)
- Single item (1 solution, 1 rating)
- Many items (50+ solutions)
- Long text content
- Special characters in user input
- Network failures
- Slow connections
```

### 4. Code Review Process

#### Self-Review Checklist
Before requesting review:
- [ ] No commented-out code
- [ ] No console.logs (except error handlers)
- [ ] TypeScript types are specific (no `any`)
- [ ] Components have loading states
- [ ] Errors show user-friendly messages
- [ ] Database queries are efficient
- [ ] RLS policies are appropriate

#### Review Focus Areas
1. **User Experience**: Does this improve the platform?
2. **Code Quality**: Is it maintainable and clear?
3. **Performance**: Will it scale?
4. **Security**: Are there vulnerabilities?
5. **Consistency**: Does it follow patterns?

## 🏗️ Common Development Tasks

### Adding a New Form Type

```typescript
// 1. Create form component in components/solutions/forms/
// 2. Map categories to form in lib/forms/mappings.ts
// 3. Add form fields interface in types/forms.ts
// 4. Implement validation schema with Zod
// 5. Test with all mapped categories
// 6. Update form count in documentation
```

### Adding a New Page

```typescript
// 1. Create page in app/ directory
// 2. Implement loading.tsx for suspense
// 3. Add error.tsx for error boundary
// 4. Fetch data in server component
// 5. Pass data to client components
// 6. Add to navigation if needed
```

### Modifying Database Schema

```sql
-- 1. Create migration file
-- migrations/YYYYMMDD_description.sql

-- 2. Write forward migration
ALTER TABLE solutions ADD COLUMN new_field TEXT;

-- 3. Update TypeScript types
-- 4. Update RLS policies if needed
-- 5. Test locally
-- 6. Apply to production via Supabase dashboard
```

### Implementing a New Feature

```markdown
1. **Research Phase**
   - Check if similar functionality exists
   - Review related code patterns
   - Identify affected components

2. **Design Phase**
   - Sketch UI/UX approach
   - Define data requirements
   - Plan component structure

3. **Implementation Phase**
   - Start with types/interfaces
   - Build server-side data fetching
   - Create UI components
   - Add interactivity
   - Implement error handling

4. **Polish Phase**
   - Add loading states
   - Ensure mobile responsiveness
   - Optimize performance
   - Update documentation
```

## 🐛 Debugging Workflow

### Systematic Debugging Process

```typescript
// 1. Reproduce the issue
// 2. Identify the error type:
//    - TypeScript: Check types
//    - Runtime: Check console
//    - Network: Check requests
//    - Database: Check queries

// 3. Isolate the problem:
console.log('Before operation:', state);
const result = await problematicOperation();
console.log('After operation:', result);

// 4. Fix incrementally
// 5. Verify fix doesn't break other features
// 6. Document in DEBUGGING.md if common
```

### Performance Debugging

```typescript
// Measure component render time
console.time('ComponentRender');
// ... component code ...
console.timeEnd('ComponentRender');

// Profile database queries
const start = performance.now();
const result = await supabase.from('table').select();
console.log(`Query took ${performance.now() - start}ms`);

// Check bundle size impact
npm run analyze
```

## 📦 Deployment Workflow

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Performance acceptable
- [ ] Mobile tested

### Deployment Process
```bash
# 1. Ensure main branch is clean
git checkout main
git pull origin main

# 2. Merge feature branch
git merge --no-ff feature/your-feature

# 3. Push to trigger deployment
git push origin main

# 4. Monitor deployment
# - Check Vercel dashboard
# - Verify production site
# - Monitor error logs
```

### Post-Deployment
- [ ] Verify feature works in production
- [ ] Check performance metrics
- [ ] Monitor error tracking
- [ ] Update documentation
- [ ] Announce changes if user-facing

## 🔧 Tooling & Environment

### Recommended VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)\"", "([^\"]*)"]
  ]
}
```

### Useful npm Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # Check TypeScript
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run analyze      # Analyze bundle size
```

### Browser Extensions for Development
- React Developer Tools
- Supabase Inspector
- Tailwind CSS Devtools
- WAVE (accessibility)

## 📊 Code Quality Standards

### TypeScript Best Practices
```typescript
// ✅ Good: Specific types
interface UserRating {
  id: string;
  userId: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
}

// ❌ Bad: Loose types
interface UserRating {
  id: any;
  userId: any;
  effectiveness: number;
}
```

### Component Best Practices
```typescript
// ✅ Good: Clear, focused components
export function RatingStars({ rating, onChange }: RatingStarsProps) {
  // Single responsibility
}

// ❌ Bad: Kitchen sink components
export function SolutionCardWithRatingAndFormAndModal() {
  // Too many responsibilities
}
```

### Database Query Best Practices
```typescript
// ✅ Good: Select only needed fields
const { data } = await supabase
  .from('solutions')
  .select('id, title, solution_category')
  .eq('is_approved', true);

// ❌ Bad: Select everything
const { data } = await supabase
  .from('solutions')
  .select('*');
```

## 🚀 Continuous Improvement

### Weekly Rituals
- **Monday**: Review metrics, plan week
- **Wednesday**: Mid-week progress check
- **Friday**: Demo, retrospective, documentation

### Monthly Goals
- Increase goal coverage by 10%
- Improve page load time by 100ms
- Add one major feature
- Fix top 5 user-reported issues

### Feedback Loops
- User feedback → GitHub issues
- Error tracking → Bug fixes
- Performance monitoring → Optimizations
- Analytics → Feature priorities

## 💡 Tips for Success

1. **Start Small**: Break features into tiny, shippable pieces
2. **User First**: Always ask "How does this help users?"
3. **Document Early**: Update docs while context is fresh
4. **Test Edge Cases**: Empty states, errors, slow network
5. **Communicate**: Over-communicate in commits and PRs
6. **Learn Patterns**: Study existing code before adding new
7. **Ask Questions**: No question is too simple
8. **Ship Daily**: Small improvements > perfect features

Remember: WWFM is about helping real people find real solutions. Every line of code should serve that mission.