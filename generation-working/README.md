# Generation Working Folder

Active workspace for Claude Web solution generation and quality testing.

## Current Test: "Reduce Anxiety" Quality Comparison

**Goal**: Test flexible solution count system and compare quality vs existing data

**Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7`
**Arena**: Feeling & Emotion
**Solution Count Range**: 15-50 (typical: 35)

### Process

1. **STAGE 1-2**: ✅ Backup and delete existing 22 solutions
2. **STAGE 3**: ⏳ Claude Web generates 45 solutions as JSON (manual, evidence-based)
3. **STAGE 4**: ⏳ Validate and insert JSON using local MCP access
4. **STAGE 5**: ⏳ Export and compare BEFORE vs AFTER quality

### BEFORE (Baseline)
- **Solutions**: 22 (21 unique)
- **Avg Effectiveness**: 4.01/5.0
- **Quality Score**: 86% (3 minor issues)
- **Data**: `data/before-reduce-anxiety.json`
- **Report**: `data/before-quality-report.md`

### AFTER (Target)
- **Expected**: 45 solutions
- **Method**: Manual Claude Web generation (no scripts)
- **Quality Target**: ≥86% (match or exceed BEFORE)
- **Output**: `reduce-anxiety-45-solutions.json`

## Key Files

- `CLAUDE_WEB_EXECUTION_PROMPT.md` - Main instructions for Claude Web
- `JSON_OUTPUT_INSTRUCTIONS.md` - JSON format specification
- `RESPONSE_TO_CLAUDE_WEB.md` - Response about generator script concern
- `backup/` - Backup of 22 deleted links (link-ids-before-deletion.json)
- `data/` - BEFORE data export for comparison
- `archive/` - Failed connection attempt files (REST API, psql, etc.)
