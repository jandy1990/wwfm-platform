# Parsing Guidance for Student Submissions

## Overview

Student submissions are markdown files containing:
1. Title/header information
2. Critical reflection essay (1000-1500 words)
3. APA references (optional)
4. Five diary entries (max 300 words each)

This guide explains how to identify and extract each component.

---

## File Structure Patterns

Based on analysis of sample submissions, students use various formatting approaches:

### Pattern 1: Clear Section Headers (Most Common)
```markdown
# Title
## Introduction or Essay begins
[Essay content...]

## References
[APA references...]

## Diary Entries
### Entry 1
[Content...]
### Entry 2
[Content...]
```

### Pattern 2: Numbered Entries
```markdown
[Essay content...]

References
[References...]

Diary Entry 1
[Content...]

Diary Entry 2
[Content...]
```

### Pattern 3: Date-Based Entries
```markdown
[Essay content...]

## Reflective Diary

**Week 3 - August 15, 2025**
[Content...]

**Week 5 - September 1, 2025**
[Content...]
```

### Pattern 4: Minimal Structure
```markdown
[Essay content...]

Entry 1:
[Content...]

Entry 2:
[Content...]
```

---

## Parsing Strategy

### Step 1: Identify Essay Section

**Start of essay:**
- Typically begins after title/header (lines 1-10)
- First substantial paragraph (>50 words)
- May begin with "Introduction" or "Reflection" heading
- May start immediately with first-person narrative

**End of essay:**
- Look for one of these markers:
  - Heading containing: "Diary", "Entry", "Entries", "Record", "Journal"
  - Heading containing: "Reference", "Bibliography"
  - Pattern change: numbered entries (1., 2., 3.)
  - Pattern change: date stamps or week labels
  - Significant whitespace (3+ blank lines)

**Validation:**
- Essay should be 800-1700 words (flag if outside 700-1800 range)
- Should contain first-person language ("I learned", "My experience")
- Should NOT contain numbered entry patterns

### Step 2: Identify References Section (Optional)

**Markers:**
- Heading containing: "Reference", "Bibliography", "Citations"
- Usually appears after essay, before diary entries
- Contains citation patterns: Author (Year), URLs, doi:
- May be absent (many students don't include formal references)

**Action:**
- Note if present but don't include in essay word count
- Don't penalize absence (APA citations don't affect marks)
- Include in feedback only if exceptionally poor or good

### Step 3: Identify Diary Entries

**Count and locate entries using these patterns:**

1. **Heading-based entries:**
   ```
   ## Entry 1
   ## Diary Entry 2
   ### Entry 3
   ```
   
2. **Numbered entries:**
   ```
   1. [Content]
   2. [Content]
   ```

3. **Date-based entries:**
   ```
   Week 3 - August 15
   September 1, 2025
   ```

4. **Bold/underlined markers:**
   ```
   **Entry 1:**
   <u>Entry 2</u>
   ```

**Validation:**
- Should find exactly 5 entries
- Each entry should be 50-350 words
- Entries should be distinct sections (not paragraphs within essay)
- Should contain reflection on specific moments/events

**If count ≠ 5:**
- Flag for instructor review: "Found X diary entries instead of 5"
- If 4-6 entries: proceed with marking but note in feedback
- If <4 or >6 entries: deduct 1 mark from diary section, note clearly

---

## Word Count Calculation

### Essay Word Count
```python
# Pseudocode
essay_text = extract_essay_section()
# Remove markdown formatting
essay_text = remove_markdown_syntax(essay_text)
# Remove citations (in-text)
essay_text = remove_inline_citations(essay_text)
# Count words
word_count = len(essay_text.split())
```

**Guidelines:**
- Count only the essay body (exclude title, references, diary entries)
- Include in-text citations in word count
- Flag if <850 or >1650 words (outside reasonable range)

### Diary Entry Word Count
```python
# For each entry
for entry in diary_entries:
    entry_text = clean_text(entry)
    entry_words = len(entry_text.split())
    if entry_words > 350:
        flag_warning(f"Entry {i} is {entry_words} words (limit 300)")
```

---

## Parsing Algorithm

```python
def parse_submission(content):
    """
    Parse student submission into components
    """
    
    # 1. Extract title/header (first 10 lines)
    lines = content.split('\n')
    header = '\n'.join(lines[:10])
    
    # 2. Find diary entries section
    diary_start_markers = [
        'diary entry', 'diary entries', 'reflective diary',
        'entry 1', 'journal entries', 'diary record'
    ]
    
    diary_start_index = None
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(marker in line_lower for marker in diary_start_markers):
            diary_start_index = i
            break
    
    # 3. Split content
    if diary_start_index:
        essay_section = '\n'.join(lines[10:diary_start_index])
        diary_section = '\n'.join(lines[diary_start_index:])
    else:
        # Fallback: last 30% of document is diary
        split_point = int(len(lines) * 0.7)
        essay_section = '\n'.join(lines[10:split_point])
        diary_section = '\n'.join(lines[split_point:])
        flag_warning("Could not clearly identify diary section")
    
    # 4. Find references within essay section
    ref_markers = ['references', 'bibliography', 'works cited']
    ref_start = None
    essay_lines = essay_section.split('\n')
    
    for i, line in enumerate(essay_lines):
        if any(marker in line.lower() for marker in ref_markers):
            ref_start = i
            break
    
    if ref_start:
        essay_body = '\n'.join(essay_lines[:ref_start])
        references = '\n'.join(essay_lines[ref_start:])
    else:
        essay_body = essay_section
        references = ""
    
    # 5. Count diary entries
    diary_count = count_diary_entries(diary_section)
    
    # 6. Calculate word counts
    essay_words = count_words(essay_body)
    diary_words = count_words(diary_section)
    
    return {
        'essay': essay_body,
        'essay_word_count': essay_words,
        'references': references,
        'diary_section': diary_section,
        'diary_count': diary_count,
        'diary_word_count': diary_words
    }

def count_diary_entries(text):
    """
    Count number of diary entries using multiple strategies
    """
    strategies = [
        count_heading_entries,      # ## Entry 1, ## Entry 2
        count_numbered_entries,      # 1., 2., 3.
        count_date_entries,          # Week X, Date patterns
        count_bold_entries           # **Entry 1:**
    ]
    
    counts = [strategy(text) for strategy in strategies]
    
    # Use most common count
    from collections import Counter
    most_common = Counter(counts).most_common(1)[0][0]
    
    return most_common

def count_heading_entries(text):
    """Count entries marked with ## or ### headings"""
    import re
    pattern = r'^#{2,3}\s*(Entry|Diary|Record|Journal)'
    matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
    return len(matches)

def count_numbered_entries(text):
    """Count entries marked with 1., 2., 3. at start of line"""
    import re
    pattern = r'^\d+\.\s+(?=\w)'
    matches = re.findall(pattern, text, re.MULTILINE)
    # Filter to ensure they're not in middle of sentences
    return len([m for m in matches if 'Entry' in text[text.find(m):text.find(m)+100]])

def count_date_entries(text):
    """Count entries marked with dates or week numbers"""
    import re
    date_patterns = [
        r'Week\s+\d+',
        r'\d{1,2}[/-]\d{1,2}[/-]\d{4}',
        r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}'
    ]
    total = 0
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        total += len(matches)
    return min(total, 10)  # Cap at reasonable number

def count_bold_entries(text):
    """Count entries marked with bold text"""
    import re
    pattern = r'\*\*\s*Entry\s*\d+\s*:?\*\*'
    matches = re.findall(pattern, text, re.IGNORECASE)
    return len(matches)
```

---

## Edge Cases and Solutions

### Edge Case 1: Diary Entries Within Essay
**Problem:** Student embeds diary-like paragraphs throughout essay instead of separating them

**Detection:**
- No clear "Diary Entries" section
- Total word count very high (>2000 words)
- No distinct formatting change

**Solution:**
- Flag for instructor: "Unable to clearly separate diary entries from essay"
- Mark based on essay quality
- Deduct 1-2 marks from diary section
- Note in feedback: "Diary entries should be clearly separated from essay"

### Edge Case 2: Insufficient Diary Entries
**Problem:** Student provides only 3-4 entries instead of 5

**Detection:**
- Counting algorithm finds <5 entries
- Visual inspection confirms

**Solution:**
- Award proportional marks: (entries_found / 5) * 3
- Example: 4 entries = 2.4/3 marks
- Note in feedback: "Submission includes only X diary entries instead of required 5"

### Edge Case 3: Excessive Diary Length
**Problem:** Diary entries exceed 300 words each

**Detection:**
- Individual entry word counts >350 words

**Solution:**
- Don't penalize marks (guidelines say address in feedback only)
- Note in feedback: "Some diary entries exceed 300-word limit"
- If egregious (>500 words each), mention in feedback more strongly

### Edge Case 4: No Clear Structure
**Problem:** Entire document is one continuous text without clear sections

**Detection:**
- No section headings found
- No formatting changes
- Word count >2000

**Solution:**
- Attempt 70/30 split (first 70% = essay, last 30% = diary)
- Flag for instructor: "Unable to clearly parse document structure"
- Mark conservatively
- Note in feedback: "Please use clear section headings to separate essay from diary entries"

### Edge Case 5: Extremely Short or Long
**Problem:** Essay <700 words or >1800 words

**Detection:**
- Word count outside acceptable range

**Solution:**
- If <700 words: Deduct 1-2 marks, note in feedback
- If >1800 words: Deduct 1 mark, note in feedback
- If <500 or >2200 words: Flag for instructor review

---

## Validation Checklist

Before marking each submission:

- [ ] Essay section identified (800-1700 words expected)
- [ ] Diary entries section identified
- [ ] Exactly 5 diary entries found (or deviation noted)
- [ ] Each diary entry <400 words
- [ ] No diary content mixed into essay
- [ ] References section identified (if present)
- [ ] Word counts calculated
- [ ] Any parsing warnings flagged

---

## Sample Parsing Outputs

### Successful Parse
```
✓ Essay identified: 1,458 words
✓ References section: Present (5 citations)
✓ Diary entries: 5 found
  - Entry 1: 287 words ✓
  - Entry 2: 243 words ✓
  - Entry 3: 298 words ✓
  - Entry 4: 256 words ✓
  - Entry 5: 301 words (slightly over limit)
✓ Structure: Clear and well-organized
```

### Parse with Warnings
```
⚠ Essay identified: 1,712 words (slightly over limit)
✓ References section: Not found (not required)
⚠ Diary entries: 4 found (expected 5)
  - Entry 1: 245 words ✓
  - Entry 2: 312 words (exceeds 300)
  - Entry 3: 267 words ✓
  - Entry 4: 289 words ✓
! Structure: Diary section unclear - using best guess
Flag: Review diary entry count
```

### Parse Requiring Review
```
! Essay identified: 2,134 words (significantly over)
! References section: Not found
! Diary entries: Unable to clearly identify
  - Possible entries: 3-7 (unclear formatting)
! Structure: No clear section breaks
Flag: INSTRUCTOR REVIEW REQUIRED - parsing uncertain
Action: Mark conservatively, note structure issues
```

---

## Common Student Formatting Patterns

Based on sample analysis:

**Lily Wang (s4928374):**
- Clear ## headings for sections
- "Diary Entries" heading
- Bold subheadings for each entry
- ✓ Easy to parse

**Ambryn Liu (s5063829):**
- Uses ### for diary entries
- Clear separation with whitespace
- Numbers entries (Entry 1, Entry 2...)
- ✓ Easy to parse

**Elliott Jiang (s4882629):**
- Uses HTML underline tags (<u>)
- "Diary Record" heading
- Less whitespace but still clear
- ✓ Parseable with attention to HTML

**Expected variations:**
- Some use numbered lists (1., 2., 3.)
- Some use dates as headers
- Some use minimal formatting
- Few embed entries in essay (flag these)

---

## Final Parsing Recommendations

1. **Be flexible:** Accept various formatting styles
2. **Be conservative:** When uncertain, favor the student (mark the content)
3. **Be clear:** Note any parsing difficulties in feedback
4. **Be consistent:** Apply same standards to all submissions
5. **Be helpful:** Suggest improvements to structure in feedback when needed

**Remember:** The goal is to assess content quality, not punish formatting differences. If you can read and understand the submission, you can mark it fairly.
