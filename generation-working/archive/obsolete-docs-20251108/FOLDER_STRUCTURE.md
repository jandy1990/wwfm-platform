# Generation Working Folder Structure

Clear separation between Claude Web instructions and Claude Code tools.

## Directory Tree

```
generation-working/
│
├── 📋 START-HERE.md                    [Claude Web entry point]
├── 📋 PHASE-ZERO.md                    [Claude Web - orientation]
├── 📋 PHASE-ONE.md                     [Claude Web - solution list]
├── 📋 PHASE-TWO.md                     [Claude Web - distributions]
├── 📋 PHASE-THREE.md                   [Claude Web - merge/validate]
│
├── 📄 goal-info.json                   [Input: goal information]
├── 📄 solution-list.json               [Output: Phase One]
├── 📄 batch-1.json                     [Output: Phase Two batch 1]
├── 📄 batch-2.json                     [Output: Phase Two batch 2]
├── 📄 batch-3.json                     [Output: Phase Two batch 3]
├── 📄 batch-4.json                     [Output: Phase Two batch 4]
├── 📄 batch-5.json                     [Output: Phase Two batch 5]
├── 📄 final-output.json                [Output: Phase Three - READY FOR INSERTION]
│
├── 📖 README.md                        [Folder overview]
├── 📖 FOLDER_STRUCTURE.md              [This file]
│
├── 📁 claude-code/                     [⚠️ LOCAL TOOLS ONLY - NOT FOR CLAUDE WEB]
│   ├── 📖 README.md                    [Claude Code tools documentation]
│   ├── 🔧 insert-solutions.ts          [Bulk insertion script]
│   ├── 🔧 insert-remaining-3.ts        [Duplicate handler script]
│   ├── 📊 INSERTION-PROCESS.md         [Step-by-step insertion guide]
│   └── 📊 QUALITY_COMPARISON_REPORT.md [BEFORE vs AFTER analysis]
│
├── 📁 backup/                          [Deleted 22 original solutions]
├── 📁 data/                            [BEFORE data exports]
│   ├── before-reduce-anxiety.json
│   └── before-quality-report.md
│
└── 📁 archive/                         [Failed experiments & old files]
```

## Usage Rules

### For Claude Web Sessions
**ONLY provide these files:**
- START-HERE.md (or specific phase file)
- goal-info.json (for Phase One)
- solution-list.json + batch range (for Phase Two)
- All batch-*.json files (for Phase Three)

**NEVER provide:**
- Anything in claude-code/ folder
- Anything in backup/, data/, or archive/ folders
- README files (unless specifically requested)

### For Claude Code Sessions
**Can access:**
- All files (full repository access)
- claude-code/ tools for database operations
- Supabase via MCP tools or TypeScript client

## File Purposes

| File | For | Purpose |
|------|-----|---------|
| START-HERE.md | Claude Web | Complete process overview |
| PHASE-*.md | Claude Web | Step-by-step instructions per phase |
| goal-info.json | Claude Web | Goal details for Phase One |
| solution-list.json | Claude Web | Input for Phase Two batches |
| batch-*.json | Claude Web | Input for Phase Three merge |
| final-output.json | Claude Code | Ready for database insertion |
| claude-code/*.ts | Claude Code | Database insertion scripts |
| claude-code/*.md | Claude Code | Process docs & quality reports |

## Success Indicators

✅ **Clean separation**: Claude Web never sees local tools
✅ **Clear inputs/outputs**: Each phase has defined I/O
✅ **Stateless execution**: No persistent state between sessions
✅ **Scalable**: Same structure works for any goal
