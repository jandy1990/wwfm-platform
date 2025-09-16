# Documentation Session Template

**Session #**: ___  
**Date**: ___________  
**Folder**: ___________  
**Duration Target**: 2 hours  

---

## 📋 Pre-Session Checklist (10 min)

- [ ] Review folder structure
- [ ] Count files and types
- [ ] Identify largest/most complex files
- [ ] Note existing documentation
- [ ] Run the application locally
- [ ] Test the feature area

### Quick Analysis
```bash
# Run these commands for your folder
FOLDER="./YOUR_FOLDER_HERE"

# File count
find $FOLDER -type f -name "*.ts" -o -name "*.tsx" | wc -l

# Largest files
find $FOLDER -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -5

# Check for existing docs
find $FOLDER -name "*.md"

# Find TODOs
grep -r "TODO\|FIXME" $FOLDER --include="*.ts" --include="*.tsx"
```

---

## 🎯 Session Goals

### Must Document
1. **Purpose** - Why this folder exists
2. **Structure** - What each file does
3. **Business Logic** - Key rules and decisions
4. **Dependencies** - What it needs to work
5. **API/Interface** - How to use it

### Should Document
6. **Data Flow** - How information moves
7. **Testing** - How to test it
8. **Common Issues** - Known problems
9. **Examples** - Code samples

### Could Document
10. **Performance** - Optimization notes
11. **Security** - Auth/validation
12. **Future Work** - Technical debt

---

## 📝 Discovery Notes

### Folder Purpose
```
[What is the main job of this folder?]
```

### Key Files
| File | Purpose | Complexity | Notes |
|------|---------|------------|-------|
| | | Low/Med/High | |
| | | Low/Med/High | |
| | | Low/Med/High | |

### Business Logic Found
```
[List key business rules discovered]
1. 
2. 
3. 
```

### Dependencies
**Internal**:
- 
- 

**External**:
- 
- 

### Integration Points
**This folder calls**:
- 
- 

**This folder is called by**:
- 
- 

---

## 📄 README Content

### README.md Draft
```markdown
# [Folder Name]

## 📎 Purpose
[One paragraph explaining why this exists]

## 🧠 Business Logic
[Key rules, constraints, and decisions]

## 📁 Structure
- `file1.tsx` - [purpose]
- `file2.ts` - [purpose]
- `/subfolder` - [purpose]

## 🔄 Data Flow
[How data enters, processes, and exits]

## 🔌 API/Interface
[Public methods, exports, or endpoints]

## 📦 Dependencies
[What this needs to work]

## 🧪 Testing
[How to test this module]

## ⚠️ Important Notes
[Gotchas, edge cases, warnings]

## 🔮 Future Improvements
[Technical debt, planned changes]
```

---

## 💡 Key Insights

### Discoveries
1. **Unexpected**: 
2. **Complex**: 
3. **Clever**: 
4. **Problematic**: 

### Questions Raised
1. ❓ 
2. ❓ 
3. ❓ 

### Technical Debt Found
1. 🔧 
2. 🔧 
3. 🔧 

---

## ✅ Session Completion

### Created/Updated
- [ ] README.md created
- [ ] Code examples added
- [ ] Business logic documented
- [ ] API documented
- [ ] Testing notes added

### Quality Check
- [ ] New developer could understand this
- [ ] Examples are runnable
- [ ] No unexplained magic
- [ ] Technical debt noted
- [ ] Future work identified

### Time Tracking
- **Planned**: 2 hours
- **Actual**: ___ hours
- **Efficiency**: ___%

---

## 🔄 For Next Session

### Follow-up Needed
1. 
2. 
3. 

### Dependencies to Document
1. 
2. 
3. 

### Questions for Team
1. 
2. 
3. 

---

## 📊 Session Metrics

### Documentation Coverage
- Files in folder: ___
- Files documented: ___
- Coverage: ___%

### Complexity Assessment
- Business logic complexity: Low/Medium/High
- Technical complexity: Low/Medium/High
- Documentation difficulty: Easy/Medium/Hard

### Value Assessment
- Impact on understanding: Low/Medium/High
- Frequency of use: Low/Medium/High
- Priority for new developers: Low/Medium/High

---

## 🗒️ Raw Notes

```
[Unstructured notes during session]
```

---

## Session Sign-off

**Completed by**: ___________
**Date**: ___________
**Ready for Review**: Yes/No
**Reviewer**: ___________