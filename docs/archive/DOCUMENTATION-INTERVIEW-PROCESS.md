# WWFM Documentation Interview Process

**Approach**: Interactive Q&A sessions where Claude interviews you about each component, then creates the documentation  
**Your Role**: Explain business logic, decisions, and context  
**Claude's Role**: Ask targeted questions, write technical documentation  

---

## 🎯 How Interview Sessions Work

### Session Flow
```
1. Claude analyzes the folder/component
2. Claude asks targeted questions (5-10 at a time)
3. You provide answers focusing on "why" not "how"
4. Claude writes the README
5. You review and approve
6. Move to next component
```

### Time Estimate
- **Analysis**: 2 minutes (Claude)
- **Questions**: 10-15 minutes (Q&A)
- **Documentation**: 5 minutes (Claude)
- **Review**: 3 minutes (You)
- **Total per component**: ~20-25 minutes

---

## 📋 Master Question Templates

### For Every Component (Core Questions)

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

## 🗂️ Component-Specific Interview Templates

### 📄 Page/Route Component (`/app` folders)
```
Claude will ask:
1. What is the purpose of this page?
2. Who can access it (auth requirements)?
3. What data does it need and where from?
4. What actions can users take here?
5. What happens on success/failure?
6. Any SEO or performance considerations?
7. Mobile vs desktop differences?
```

### 🔌 API Endpoint (`/app/api` folders)
```
Claude will ask:
1. What operation does this endpoint perform?
2. Who can call it (auth/permissions)?
3. What validations are required?
4. What are the success/error responses?
5. Rate limiting or security concerns?
6. Database operations involved?
7. External service integrations?
```

### 🎨 UI Component (`/components` folders)
```
Claude will ask:
1. What UI problem does this solve?
2. Where is it used in the app?
3. What props are required vs optional?
4. What states can it be in?
5. Accessibility considerations?
6. Responsive behavior?
7. Can it be reused elsewhere?
```

### 📝 Form Component (`/components/solutions/forms`)
```
Claude will ask:
1. What data does this form collect?
2. Which solution categories use this form?
3. What are the validation rules?
4. How does the two-phase submission work?
5. What fields are required vs optional?
6. Error handling approach?
7. Success tracking needs?
```

### 🔧 Service/Utility (`/lib` folders)
```
Claude will ask:
1. What business logic does this encapsulate?
2. What are the main functions/methods?
3. Error handling strategy?
4. Caching or performance considerations?
5. Testing approach?
6. Common usage patterns?
7. Future improvements needed?
```

### 🪝 Custom Hook (`/hooks` folders)
```
Claude will ask:
1. What React problem does this solve?
2. What does it return?
3. When should it be used?
4. Performance implications?
5. Testing approach?
6. Common mistakes to avoid?
```

### 📊 Type Definition (`/types` folders)
```
Claude will ask:
1. What domain does this type model?
2. Which components use these types?
3. Any tricky generic types?
4. Database sync considerations?
5. Validation requirements?
6. Common type errors to avoid?
```

---

## 💬 Interview Session Format

### Starting a Session

**You say:**
```
"Let's document [folder/component name]"
```

**Claude will:**
1. Analyze the folder structure
2. Identify key files
3. Prepare targeted questions
4. Start the interview

### During the Interview

**Claude asks:**
```
I'm looking at [component]. I can see it has [X files] including [key files].

Let me ask you about the business logic:

1. What problem does this solve for users?
2. [Specific question based on code]
3. [Another specific question]
...
```

**You answer:**
```
1. This solves [problem] by [approach]
2. We chose this because [reasoning]
3. The main constraint is [business rule]
...
```

**Claude then:**
- Asks follow-up questions if needed
- Writes the README
- Creates code examples
- Documents the findings

### Review Phase

**Claude presents:**
```
Here's the README I've created based on our discussion:
[Shows README content]

Does this accurately capture the component?
Anything to add or correct?
```

---

## 📝 Answer Guidelines

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

### Example Quick Answer

**Claude:** "Any gotchas in this component?"

**Quick Answer:**
"Yes - the form looks like it submits once but actually does two phases. First submission is required fields only, then the success screen collects optional fields. This was because users were abandoning complex forms."

---

## 🎯 Session Priorities

### Session 1: Core Application (`/app`)
**Interview Focus**: Page purposes, routing logic, data fetching patterns

### Session 2: API Layer (`/app/api`)
**Interview Focus**: Endpoint purposes, auth requirements, business rules

### Session 3: Forms System (`/components/solutions/forms`)
**Interview Focus**: Form-to-category mapping, validation rules, two-phase submission

### Session 4: Component Library (`/components`)
**Interview Focus**: Component hierarchy, reusability, design patterns

### Session 5: Services (`/lib/services`)
**Interview Focus**: Business logic encapsulation, data transformations

### Session 6: Database (`/lib/supabase`)
**Interview Focus**: Query patterns, RLS policies, performance

---

## 🚀 Quick Start Script

### To Begin Any Session

**You:** 
```
"Let's document [folder name]. Here's what you need to know first: [any context]"
```

**Claude will respond with:**
```
I'll analyze [folder] and ask you some questions to create comprehensive documentation.

[Analysis of folder structure]

Here are my questions about the business logic and design decisions:

1. [First question]
2. [Second question]
...

Take your time with the answers - focus on the "why" behind the implementation.
```

---

## 📊 Coverage Tracking

### After Each Interview

**Claude will update:**
- Documentation coverage percentage
- Business logic captured
- Technical debt identified
- Future improvements noted

**You track:**
- Time spent
- Completeness feeling (1-5)
- Any unanswered questions

---

## 💡 Tips for Efficient Interviews

### For You:
- **Be concise** - 2-3 sentences per answer is usually enough
- **Focus on "why"** - Claude can read the "how" from code
- **Mention gotchas** - These are gold for documentation
- **Explain tradeoffs** - Why this approach vs alternatives
- **Note technical debt** - And why it exists

### What Claude Will Do:
- Read the code before asking questions
- Ask specific, targeted questions
- Skip obvious technical details
- Focus on business logic and decisions
- Create comprehensive READMEs
- Generate code examples
- Document gotchas and edge cases

---

## 📝 Sample Interview Session

**You:** "Let's document the goal page component"

**Claude:** 
"I'm analyzing `/app/goal/[id]/page.tsx`. I can see it's a dynamic route that displays individual goals with their solutions.

Here are my questions:

1. What determines if a goal should be visible to public vs authenticated users?
2. Why do solutions show different effectiveness per goal?
3. What's the business logic for sorting solutions?
4. Why is there both a simple and detailed view?
5. What happens if a goal has no solutions?

**You:**
"1. All goals are public, but contributing requires auth
2. Same solution works differently for different problems - meditation might be 5 stars for anxiety but 3 stars for focus
3. Default sort is by effectiveness, but users can change to newest or most reviewed
4. Simple view is for browsing, detailed shows distributions of costs, side effects, etc - progressive disclosure
5. We show a prompt to be the first to share what worked"

**Claude:** 
"Perfect! Let me create the README for the goal page component..."

[Claude generates comprehensive documentation]

---

## Ready to Start?

Just say: **"Let's document [folder/component name]"** and I'll begin the interview process!

This approach will be much more efficient - you provide the context and business knowledge, I handle the technical documentation and structure.