# AI Solution Generation Learnings

## The Specificity Requirement (August 2025)

### The Discovery
Our first AI generation run produced 791 solutions that were predominantly generic advice categories rather than specific implementable solutions. Examples:
- ❌ "Practice mindfulness" instead of ✅ "Headspace app"
- ❌ "Assertiveness training" instead of ✅ "Crucial Conversations workshop"
- ❌ "Budgeting apps" instead of ✅ "You Need A Budget (YNAB)"

### The Insight
This revealed a fundamental truth: AI models (and people) naturally default to category-level advice. When asked "How do I reduce anxiety?", the common response is "try meditation" not "use Headspace's anxiety pack for 10 minutes before bed."

This exposed the **last-mile problem** in self-help: Everyone knows the categories of things that might help, but they don't know the specific implementations that actually work.

### The Platform Philosophy
WWFM's unique value is bridging this gap. We don't tell people to "try meditation" - we tell them exactly which meditation app/course/teacher worked for specific people with specific problems.

### Implementation Requirements
All solutions MUST be:
1. **Googleable** - Searching for it returns specific results
2. **Actionable** - Someone can immediately do/buy/join it
3. **Specific** - Names a particular product, method, book, or protocol

Examples of good solutions:
- "Headspace anxiety pack"
- "Couch to 5K app"
- "The 7 Habits of Highly Effective People"
- "4-7-8 breathing technique"
- "StrongLifts 5x5 program"

### Why This Matters
Generic advice is everywhere. WWFM's competitive advantage is being the only platform that tells people not just what category of solution to consider, but exactly which specific implementation to try.

## Generation Prompt Guidelines

When generating solutions, enforce these constraints:
- Must include a proper noun (brand, author, product name) OR
- Must describe a specific protocol (with numbers, steps, or timing) OR  
- Must reference a specific source (book title, course name, website)

Reject solutions that are just categories or generic advice.