# File Handling & Batch Processing Instructions

## File Locations

### Input Directory
```
/Users/jackandrews/Desktop/wwfm-platform/TIMS3311 Marking/
```

### File Naming Convention
All student submissions follow this format:
```
studentname_studentID.md
```

**Examples:**
- `Lily Wang_s4928374.md`
- `Ambryn Liu_s5063829.md`
- `Elliott Jiang_s4882629.md`

### Output Files

Create TWO output files in the same directory:

1. **`marking_results.csv`** - Spreadsheet-compatible format
2. **`detailed_feedback.md`** - Markdown with full feedback for each student

---

## CSV Output Format

### Required Columns

```csv
Student Name,Student ID,Total Mark,Grade,Personal Lessons,Networks,Prior Knowledge,Key Learnings,Career Impact,Course Feedback,Diary Entries,Overall Experience,New Knowledge & Skills,Feedback
```

### Column Descriptions

| Column | Description | Format |
|--------|-------------|--------|
| Student Name | From filename | Text (e.g., "Lily Wang") |
| Student ID | From filename | Text (e.g., "s4928374") |
| Total Mark | Sum of all rubric items | Number (e.g., 27) |
| Grade | HD/D/C/P/F | Text (e.g., "HD") |
| Personal Lessons | Personal lessons mark | Number /5 |
| Networks | Networks established mark | Number /3 |
| Prior Knowledge | Prior knowledge mark | Number /3 |
| Key Learnings | Key learnings mark | Number /9 |
| Career Impact | Career trajectory mark | Number /4 |
| Course Feedback | Course feedback mark | Number /3 |
| Diary Entries | Diary entries mark | Number /3 |
| Overall Experience | Sum of Personal Lessons + Networks | Number /8 |
| New Knowledge & Skills | Sum of Prior + Key + Career + Feedback | Number /19 |
| Feedback | Full feedback text | Text (use quotes if contains commas) |

### Example CSV Row

```csv
Lily Wang,s4928374,28,HD,5,3,3,9,4,3,3,8,19,"Excellent work Lily. Your reflection demonstrates exceptional depth..."
```

---

## Markdown Output Format

For each student, include:

```markdown
---

## [Student Name] ([Student ID])

**Total Mark:** X/30 (Grade)

**Rubric Breakdown:**
- Overall WIL Experience: X/8
  - Personal lessons: X/5
  - Networks established: X/3
- New Knowledge, Insights & Skills: X/19
  - Prior knowledge: X/3
  - Key learnings: X/9
  - Career impact: X/4
  - Course feedback: X/3
- Reflective Diary Entries: X/3

**Feedback:**

[Paragraph 1]

[Paragraph 2]

[Paragraph 3]

---
```

---

## Batch Processing Workflow

### Step 1: Initialize Output Files

```markdown
1. Create marking_results.csv with header row
2. Create detailed_feedback.md with title and date
3. Initialize counters and tracking arrays
```

### Step 2: Process Each Submission

For each `.md` file in the TIMS3311 Marking directory:

```markdown
1. Extract student name and ID from filename
   - Split on underscore: name_id.md → ["name", "id.md"]
   - Parse name: capitalize, handle spaces
   - Parse ID: remove .md extension

2. Read file content

3. Parse submission (see PARSING_GUIDANCE.md)
   - Identify essay section
   - Identify diary entries
   - Count words

4. Apply marking process (see CLAUDE_CODE_PROCESS.md)
   - Score each rubric item
   - Calculate totals
   - Determine grade
   - Generate feedback

5. Append to CSV file
   - Format row with proper escaping
   - Include all rubric breakdowns
   - Quote feedback text

6. Append to Markdown file
   - Use consistent formatting
   - Include full breakdown
   - Add separator

7. Track progress
   - Count processed files
   - Note any errors/warnings
```

### Step 3: Quality Checks

After processing all files:

```markdown
1. Count total submissions processed
2. Calculate grade distribution:
   - HD: X students (X%)
   - D: X students (X%)
   - C: X students (X%)
   - P: X students (X%)

3. Verify most students in Distinction range (23-25 marks)
   - If <60% in D range, flag for review
   - If >30% in HD range, check for leniency
   - If >20% in C or below, check for harshness

4. Generate summary report
```

---

## Grade Calculation

```
Total Mark → Grade
27-30 → HD (High Distinction)
23-26 → D (Distinction)
19-22 → C (Credit)
15-18 → P (Pass)
0-14 → F (Fail)
```

**Expected Distribution:**
- Most students (60-70%) should receive Distinction (23-26)
- Some students (20-30%) should receive High Distinction (27-30)
- Few students (<10%) should receive Credit (19-22)
- Very few students (<5%) should receive Pass or Fail

---

## Error Handling

### Missing Files
- If submission file not found, log error
- Continue processing other files
- Note in final summary

### Parsing Issues
- If essay/diary separation unclear, note in feedback
- If word count significantly off, flag in feedback
- If missing sections, note in rubric comments

### File Writing Issues
- If CSV write fails, attempt backup file
- If Markdown write fails, log to console
- Ensure all data captured even if formatting imperfect

---

## Progress Reporting

During batch processing, output:

```
Processing: LilyWang_s4928374.md
├─ Essay identified: 1,458 words
├─ Diary entries found: 5
├─ Theory frameworks: Design Thinking, Lean Startup, Effectuation
└─ Mark: 28/30 (HD) ✓

Processing: AmbrynLiu_s5063829.md
├─ Essay identified: 1,312 words
├─ Diary entries found: 5
├─ Theory frameworks: Lean Startup, Effectuation
└─ Mark: 24/30 (D) ✓

...

Complete! 
- Processed: 45 submissions
- Grades: 12 HD, 28 D, 4 C, 1 P, 0 F
- Output: marking_results.csv, detailed_feedback.md
```

---

## File Validation Checklist

Before finalizing outputs:

- [ ] All student files processed
- [ ] CSV has header row
- [ ] CSV has correct number of columns (14)
- [ ] All marks are numbers
- [ ] All totals sum correctly
- [ ] Feedback text properly escaped in CSV
- [ ] Markdown file has separator between students
- [ ] Grade distribution looks reasonable
- [ ] No duplicate student IDs
- [ ] File sizes reasonable (not truncated)

---

## Consistency Check

After marking first 10 submissions:

```markdown
1. Review mark distribution
2. Check if most marks in 23-25 range
3. Read 2-3 feedbacks to verify tone
4. Verify theory identification is working correctly
5. Adjust calibration if needed (but note any adjustments)
```

---

## Final Output Summary

Generate at end:

```markdown
# TIMS3311 Assessment 2 Marking Summary
Date: [DATE]
Marker: Claude Code

## Statistics
- Total submissions: X
- Successfully processed: X
- Errors/warnings: X

## Grade Distribution
- High Distinction (27-30): X students (X%)
- Distinction (23-26): X students (X%)
- Credit (19-22): X students (X%)
- Pass (15-18): X students (X%)
- Fail (0-14): X students (X%)

## Average Marks by Rubric Item
- Personal lessons: X.X/5
- Networks: X.X/3
- Prior knowledge: X.X/3
- Key learnings: X.X/9
- Career impact: X.X/4
- Course feedback: X.X/3
- Diary entries: X.X/3
- Overall average: X.X/30

## Theory Framework Mentions
- Design Thinking: X students (X%)
- Lean Startup: X students (X%)
- Effectuation: X students (X%)
- All three: X students (X%)
- Two frameworks: X students (X%)
- One framework: X students (X%)
- None explicitly: X students (X%)

## Quality Indicators
- Average word count: X words
- Diary entries: X.X average per student
- Citations present: X students (X%)
```

---

## Quick Reference Commands

```bash
# To process all files
for file in *.md; do
    echo "Processing $file..."
    # Apply marking logic
done

# To verify output
wc -l marking_results.csv  # Should be 1 + number of students
grep -c "^---$" detailed_feedback.md  # Should be number of students
```
