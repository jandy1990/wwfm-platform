# WWFM Documentation Guide

**Purpose**: Complete guide for documenting the WWFM platform  
**Timeline**: 12-15 sessions (~24-30 hours)  
**Current Coverage**: ~25% → Target: 90%  
**Method**: Interactive Q&A sessions where Claude interviews you about each component

---

## 📊 Current State & Priority Matrix

### Coverage Assessment (September 2025)
- **Has Documentation**: 7/19 folders (37%)
- **Critical Gaps**: `/app`, `/components`, `/lib` - core application code
- **Documentation Debt Score**: 3/10

### Priority Order & Session Plan

| Priority | Folder | Session | Why Critical | Time Est |
|----------|--------|---------|--------------|----------|
| 🔴 CRITICAL | `/app` & `/app/api` | 1 | All routes & endpoints | 2-3 hrs |
| 🔴 CRITICAL | `/components/solutions/forms` | 2 | 9 forms, 23 categories | 3 hrs |
| 🔴 CRITICAL | `/lib/supabase` | 3 | Database integration | 2 hrs |
| 🟠 HIGH | `/components` | 4 | 100+ UI components | 3 hrs |
| 🟠 HIGH | `/lib/services` | 5 | Business logic | 2 hrs |
| 🟠 HIGH | `/app/goal/[id]` & `/app/arena/[slug]` | 6 | Dynamic routes | 2 hrs |
| 🟠 HIGH | `/lib` | 7 | Core utilities | 2 hrs |
| 🟠 HIGH | `/types` | 8 | TypeScript types | 2 hrs |
| 🟠 HIGH | `/supabase` | 9 | Database/migrations | 2 hrs |
| 🟡 MEDIUM | `/hooks` & `/contexts` | 10 | State management | 2 hrs |
| 🟡 MEDIUM | `/tests` | 11 | Update existing | 2 hrs |
| 🟢 LOW | `/tools` & `/data` | 12 | Static files | 1 hr |

---

## 🎯 How Documentation Sessions Work

### Interactive Q&A Process
```
1. Claude analyzes the folder/component
2. Claude asks targeted questions (5-10 at a time)
3. You provide answers focusing on "why" not "how"
4. Claude writes the README
5. You review and approve
6. Move to next component
```

### Time per Component
- **Analysis**: 2 minutes (Claude)
- **Questions**: 10-15 minutes (Q&A)
- **Documentation**: 5 minutes (Claude)
- **Review**: 3 minutes (You)
- **Total**: ~20-25 minutes per component

---

## 📋 README Template

```markdown
# [Component/Feature Name]

## 📎 Purpose
[Why this exists, what problem it solves]

## 🧠 Business Logic
[Key decisions, rules, and constraints]

## 📁 Structure
- `file1.tsx` - [purpose]
- `file2.ts` - [purpose]
- `/subfolder` - [purpose]

## 🔌 API/Interface
[Public methods, props, or endpoints]

## 🔄 Data Flow
[How data enters, transforms, and exits]

## 🧪 Testing
[How to test, what to verify]

## ⚠️ Important Notes
[Gotchas, special cases, warnings]

## 🔮 Future Improvements
[Technical debt, planned enhancements]
```

---

## 💬 Core Interview Questions

### For Every Component
1. **Purpose & Problem**
   - What problem does this solve?
   - Why was it built this way instead of alternatives?
   - Who are the users of this feature?

2. **Business Rules**
   - What are the key business rules or constraints?
   - What validations or checks are critical?
   - What edge cases are handled?

3. **Data Flow**
   - Where does the data come from?
   - How is it transformed?
   - Where does it go?

4. **Dependencies**
   - What must exist for this to work?
   - What breaks if this fails?
   - What other parts depend on this?

5. **Gotchas & Decisions**
   - What would surprise a new developer?
   - What technical debt exists and why?
   - What were the key design decisions?

---

## 📝 Component-Specific Questions

### Pages/Routes (`/app`)
- What is the purpose of this page?
- Who can access it (auth requirements)?
- What data does it need and where from?
- What actions can users take?
- SEO or performance considerations?

### API Endpoints (`/app/api`)
- What operation does this endpoint perform?
- Auth/permissions required?
- Validation rules?
- Success/error responses?
- Database operations involved?

### UI Components (`/components`)
- What UI problem does this solve?
- Where is it used?
- Required vs optional props?
- Accessibility considerations?
- Responsive behavior?

### Forms (`/components/solutions/forms`)
- What data does this form collect?
- Which solution categories use this?
- Validation rules?
- Two-phase submission flow?
- Error handling approach?

### Services/Utilities (`/lib`)
- What business logic does this encapsulate?
- Main functions/methods?
- Error handling strategy?
- Caching considerations?
- Common usage patterns?

---

## 💡 Answer Guidelines

### What to Focus On

✅ **DO Explain:**
- Business reasons and constraints
- Why decisions were made
- What problems it solves
- Who uses it and how
- Known issues or debt
- Future plans

❌ **DON'T Worry About:**
- Code syntax details (Claude can read that)
- Import statements (Claude will document)
- Type definitions (Claude can extract)
- Function signatures (Claude will include)

### Example Good Answer

**Claude:** "What problem does the auto-categorization system solve?"

**Good Answer:**
"Users were typing things like 'meditation' which is too vague to track effectiveness. We needed to force them to be specific like 'Headspace anxiety pack'. The auto-categorization uses 10,000+ keywords to detect what category their solution belongs to, then routes them to the right form. We chose fuzzy matching because users make typos. The business rule is: we'd rather reject a vague entry than accept something untrackable."

---

## 🎯 Quick Start

### To Begin Any Session

**You say:**
```
"Let's document [folder/component name]"
```

**Claude will:**
1. Analyze the folder structure
2. Identify key files
3. Prepare targeted questions
4. Start the interview

### Success Criteria

Documentation is complete when:
- ✅ Every folder has a README
- ✅ Business logic is clearly explained
- ✅ Technical implementation is documented
- ✅ A new developer can understand the system
- ✅ Common tasks have guides
- ✅ Architecture decisions are captured
- ✅ Testing strategies are documented
- ✅ Deployment process is clear

---

## 📊 Key Statistics to Track

### Code Volume
- `/app` - ~50+ files (pages, API routes, layouts)
- `/components` - ~100+ files (UI components, forms)
- `/lib` - ~30+ files (utilities, services)
- `/hooks` - ~10 files (custom hooks)
- `/types` - ~15 files (TypeScript types)

### Business Logic Hotspots
1. **Form System** - 9 templates, 23 category mappings
2. **Auto-categorization** - 10,000+ keywords, fuzzy matching
3. **Search Pipeline** - PostgreSQL pg_trgm, quality filters
4. **Rating System** - Effectiveness calculations, aggregation

---

## 🚀 Ready to Start?

Just say: **"Let's document [folder/component name]"** and Claude will begin the interview process!

This approach will be efficient - you provide the context and business knowledge, Claude handles the technical documentation and structure.