# Generation Working Folder

Active workspace for Claude Web solution generation and quality testing.

## Current Test: "Reduce Anxiety" Quality Comparison

**Goal**: Test flexible solution count system and compare quality vs existing data

**Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7`
**Arena**: Feeling & Emotion
**Solution Count Range**: 15-50 (typical: 35)

### Process

**Setup**: ✅ Backup and delete existing 22 solutions

**Claude Web Execution** (3 phases, batched):
1. **Phase Zero**: Read orientation
2. **Phase One**: Generate solution list (run once) → solution-list.json
3. **Phase Two**: Generate distributions for ONE BATCH of 5-10 solutions (run 5x) → batch-1.json through batch-5.json
4. **Phase Three**: Merge batches, validate, finalize (run once) → final-output.json

**Total executions**: 7 (1 + 5 batches + 1)

**Local Validation**: ⏳ Validate and insert final-output.json using MCP access
**Comparison**: ⏳ Export and compare BEFORE vs AFTER quality

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

## Files

**Execution (in order)**:
- **`START-HERE.md`** - Entry point (read first)
- **`PHASE-ZERO.md`** - Orientation and quality standards
- **`PHASE-ONE.md`** - Generate solution list (run once)
- **`PHASE-TWO.md`** - Generate distributions for one batch (run 5x)
- **`PHASE-THREE.md`** - Merge, validate, finalize (run once)

**Input**:
- **`goal-info.json`** - Goal information for Phase One

**Data**:
- **`backup/`** - Backup of 22 deleted links
- **`data/`** - BEFORE data export for comparison
- **`archive/`** - Old files and failed connection attempts
