# Claude Code Tools & Reports

**⚠️ FOR CLAUDE CODE ONLY** - Do not include these files in Claude Web sessions

This folder contains scripts, tools, and reports used by Claude Code (local MCP access) for database operations and quality analysis.

## Files

### Insertion Scripts
- **insert-solutions.ts** - Bulk insertion script for final-output.json
  - Inserts all solutions from final-output.json into Supabase
  - Creates solution → variant → goal_implementation_link chain
  - Handles 45 solutions automatically
  - Usage: `npx tsx --env-file=.env.local claude-code/insert-solutions.ts`

- **insert-remaining-3.ts** - Handles duplicate solutions
  - Links existing solutions (Lexapro, Ashwagandha, Workbook) to goal
  - Creates variants as needed
  - One-time use for this goal

### Documentation
- **INSERTION-PROCESS.md** - Step-by-step insertion guide for Claude Code
  - Documents the 3-step insertion process
  - Validation queries
  - Export procedures

- **QUALITY_COMPARISON_REPORT.md** - Final quality analysis
  - BEFORE (22 solutions) vs AFTER (45 solutions)
  - 12-section comprehensive comparison
  - System performance validation
  - Recommendation: Approve for production expansion

## Usage Notes

These files require:
- Local Supabase access via MCP tools or TypeScript client
- Environment variables from `.env.local`
- Node.js with tsx for TypeScript execution

Claude Web sessions should NOT see these files - they are for local database operations only.
