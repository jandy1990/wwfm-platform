# Claude Handoff Prompt

> **Use this prompt when starting fresh with a new Claude instance**

---

## Prompt for New Claude Instance:

```
Hi Claude, I'm working on the WWFM platform and need you to implement a critical data quality fix. This is a complete handoff from a previous Claude session.

**IMPORTANT: Please start by reading the HANDOFF_GUIDE.md file in the project root for complete context.**

**Current Situation:**
- You're in the WWFM platform directory: /Users/jackandrews/Desktop/wwfm-platform
- The platform has 3,873 AI-generated solutions, but 74.6% have display issues (blank cards)
- There's a comprehensive implementation plan already created
- All documentation has been updated and organized

**Your Task:**
Implement the data quality fix that converts AI data from broken array format to proper DistributionData format, enabling all solution cards to display correctly while preserving the AI-to-human transition system.

**First Steps:**
1. Read HANDOFF_GUIDE.md for complete context
2. Read docs/implementation/DATA_QUALITY_FIX_GUIDE.md for your implementation plan
3. Run the analysis script: `npx tsx scripts/analyze-solution-quality.ts`
4. Follow the 6-phase implementation plan

**Critical Context:**
- NEVER touch aggregated_fields (human data only)
- ONLY fix solution_fields (AI data)
- Preserve the AI-to-human transition system
- Use evidence-based AI consultation for percentages
- Mark AI data clearly with totalReports: 100 and dataSource: "ai_research"

The project is clean, organized, and ready for implementation. All documentation is comprehensive and up-to-date. You have everything needed to succeed.

Please confirm you understand the task and start by reading the handoff guide.
```

---

## Additional Context for User:

When you start the new Claude session:

1. **Navigate to the project directory first:**
   ```bash
   cd /Users/jackandrews/Desktop/wwfm-platform
   ```

2. **Copy and paste the prompt above**

3. **The new Claude will have access to:**
   - Complete handoff guide with all context
   - Comprehensive implementation plan
   - Analysis tools ready to run
   - Clean, organized codebase
   - Updated documentation

4. **Expected response:**
   The new Claude should acknowledge understanding and begin by reading the handoff guide, then proceed with the implementation plan.

The handoff is designed to be completely self-contained - the new Claude instance will have everything needed to understand the platform, the problem, and implement the solution successfully.