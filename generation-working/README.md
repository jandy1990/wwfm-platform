# Generation Working Folder

Active workspace for Claude Web solution generation and quality testing.

## Current Test: "Reduce Anxiety" Quality Comparison

**Goal**: Test flexible solution count system and compare quality vs existing data

**Goal ID**: `56e2801e-0d78-4abd-a795-869e5b780ae7`
**Arena**: Feeling & Emotion
**Solution Count Range**: 15-50 (typical: 35)

### Expected Classification
- **Classification**: BROAD
- **Target Count**: 45-50 solutions
- **Rationale**: Major mental health challenge affecting millions, extensive evidence-based solutions across medications, therapy, apps, meditation, exercise, books, supplements

### BEFORE (Current State)
- **Solutions**: 22 (21 unique)
- **Avg Effectiveness**: 4.01/5.0
- **Quality Score**: 86% (3 minor issues)
- **Data**: `data/before-reduce-anxiety.json`
- **Report**: `data/before-quality-report.md`

### AFTER (To Be Generated)
- **Expected**: 45-50 solutions
- **System**: Hardened Claude Web with flexible count
- **Quality Target**: ≥86% (match or exceed BEFORE)

## Folder Structure

```
generation-working/
├── data/           # Exported solution data (before/after)
├── reports/        # Quality analysis reports
├── scripts/        # Custom export/analysis scripts
└── backup/         # Database backups before deletion
```

## Next Steps

1. ✅ Flexible count system implemented
2. ⏳ Backup existing 22 solutions
3. ⏳ Clear goal-solution links (preserve solutions)
4. ⏳ Generate 45-50 new solutions via Claude Web
5. ⏳ Export and analyze AFTER data
6. ⏳ Compare quality: BEFORE vs AFTER
