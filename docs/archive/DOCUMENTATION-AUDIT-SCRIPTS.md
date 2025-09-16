# Documentation Audit Script

This script helps analyze each folder to identify what needs documenting before each session.

## Quick Audit Commands

### 1. List All Files in a Folder
```bash
# See what's in a folder
find ./app -type f -name "*.tsx" -o -name "*.ts" | head -20

# Count files by type
echo "TypeScript files:" && find ./components -name "*.ts" -o -name "*.tsx" | wc -l
echo "Test files:" && find ./components -name "*.test.*" -o -name "*.spec.*" | wc -l
```

### 2. Identify Complexity
```bash
# Find the largest files (likely most complex)
find ./app -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -10

# Find files with most imports (high coupling)
grep -r "^import" ./lib --include="*.ts" --include="*.tsx" | cut -d: -f1 | uniq -c | sort -rn | head -10
```

### 3. Find Existing Documentation
```bash
# Find all README files
find . -name "README.md" -o -name "readme.md" | grep -v node_modules

# Find inline documentation (JSDoc comments)
grep -r "/\*\*" ./components --include="*.tsx" --include="*.ts" | wc -l

# Find TODO comments (technical debt)
grep -r "TODO\|FIXME\|HACK" . --include="*.ts" --include="*.tsx" | wc -l
```

### 4. Analyze Component Structure
```bash
# List all React components
grep -r "export.*function\|export.*const.*=.*(" ./components --include="*.tsx" | cut -d: -f1 | sort -u

# Find components with props interfaces
grep -r "interface.*Props" ./components --include="*.tsx" | cut -d: -f1 | sort -u

# Find custom hooks
grep -r "^export.*use[A-Z]" ./hooks --include="*.ts" --include="*.tsx"
```

### 5. Analyze API Routes
```bash
# List all API routes
find ./app/api -type f -name "route.ts" | sed 's|./app/api/||' | sed 's|/route.ts||'

# Find HTTP methods in API routes
grep -r "export async function \(GET\|POST\|PUT\|DELETE\|PATCH\)" ./app/api
```

### 6. Database Queries Analysis
```bash
# Find all Supabase queries
grep -r "supabase\." . --include="*.ts" --include="*.tsx" | grep -v node_modules | cut -d: -f1 | sort -u

# Find all database tables referenced
grep -r "from('[a-z_]*')" . --include="*.ts" --include="*.tsx" | grep -oP "from\('\K[^']*" | sort -u

# Find RLS checks
grep -r "auth\.uid()" . --include="*.ts" --include="*.tsx" | wc -l
```

## Pre-Session Audit Checklist

### For Each Folder, Document:

#### 1. **File Inventory**
```bash
# Run this for your target folder
FOLDER="./app/api"
echo "=== $FOLDER Inventory ==="
echo "Total files: $(find $FOLDER -type f | wc -l)"
echo "TypeScript: $(find $FOLDER -name '*.ts' -o -name '*.tsx' | wc -l)"
echo "Tests: $(find $FOLDER -name '*.test.*' | wc -l)"
echo "Largest file: $(find $FOLDER -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -1)"
```

#### 2. **Complexity Indicators**
- Number of files
- Lines of code
- Number of exports
- External dependencies
- Database queries
- API calls

#### 3. **Business Logic Indicators**
Look for files containing:
- Validation rules
- Calculations
- Workflow logic
- State machines
- Business constants

```bash
# Find business logic patterns
grep -r "validate\|calculate\|process\|transform\|rules" $FOLDER --include="*.ts"
```

#### 4. **Integration Points**
```bash
# Find what this folder imports from
grep -r "from '\.\." $FOLDER --include="*.ts" --include="*.tsx" | cut -d"'" -f2 | sort -u

# Find what imports from this folder
grep -r "from '.*$FOLDER" . --include="*.ts" --include="*.tsx" | grep -v node_modules
```

## Documentation Priority Matrix

### How to Prioritize What to Document

| Criteria | High Priority | Medium Priority | Low Priority |
|----------|--------------|-----------------|--------------|
| **Usage** | Used everywhere | Used in multiple places | Used in one place |
| **Complexity** | >200 lines | 50-200 lines | <50 lines |
| **Business Logic** | Core rules | Supporting logic | UI only |
| **External Dependencies** | 5+ imports | 2-4 imports | 0-1 imports |
| **Database Queries** | Complex joins | Simple queries | No queries |
| **Test Coverage** | No tests | Some tests | Well tested |

## Quick Documentation Generator

### Generate Basic README Structure
```bash
#!/bin/bash
FOLDER=$1
cat > $FOLDER/README.md << 'EOF'
# $(basename $FOLDER)

## 📎 Purpose
[Why this exists]

## 🧠 Business Logic
[Key rules and decisions]

## 📁 Structure
EOF

# Add file list
echo '```' >> $FOLDER/README.md
find $FOLDER -maxdepth 1 -name "*.ts" -o -name "*.tsx" | xargs -I {} basename {} >> $FOLDER/README.md
echo '```' >> $FOLDER/README.md

cat >> $FOLDER/README.md << 'EOF'

## 🔌 API/Interface
[Public methods/exports]

## 🧪 Testing
[How to test]

## ⚠️ Important Notes
[Gotchas and warnings]

## 🔮 Future Improvements
[Technical debt]
EOF
```

## Analysis Questions for Each File

### When reviewing a file, ask:

1. **What** does this do?
2. **Why** does it exist?
3. **Who** uses it?
4. **When** is it called?
5. **Where** does data come from/go to?
6. **How** does it work internally?

### Code Smell Indicators (Need Extra Documentation)

```bash
# Files with many responsibilities (likely need refactoring notes)
grep -c "export" $FILE

# Files with complex conditionals (need business logic explanation)
grep -c "if \|switch \|? :" $FILE

# Files with magic numbers/strings (need constant documentation)
grep -E "[0-9]{2,}|'[A-Z_]{2,}'" $FILE

# Files with error handling (need failure mode documentation)
grep -c "catch\|throw\|Error" $FILE
```

## Session Preparation Script

```bash
#!/bin/bash
# prepare-session.sh - Run before each documentation session

SESSION_FOLDER=$1
echo "=== Preparing Documentation Session for $SESSION_FOLDER ==="

# Create session notes file
cat > session-notes.md << EOF
# Documentation Session - $(date)
## Folder: $SESSION_FOLDER

### Files to Document
$(find $SESSION_FOLDER -maxdepth 2 -name "*.ts" -o -name "*.tsx" | sort)

### Existing Documentation
$(find $SESSION_FOLDER -name "README*" -o -name "*.md")

### Key Imports
$(grep -h "^import" $SESSION_FOLDER/*.ts* 2>/dev/null | sort -u | head -10)

### Exported Functions
$(grep -h "^export" $SESSION_FOLDER/*.ts* 2>/dev/null | grep -E "function|const" | head -10)

### TODO/FIXME Items
$(grep -n "TODO\|FIXME" $SESSION_FOLDER/*.ts* 2>/dev/null)

### Questions to Answer
1. What is the main purpose of this module?
2. What are the key business rules?
3. What are the main entry points?
4. What could break?
5. What needs improvement?

### Session Goals
- [ ] Create/update README.md
- [ ] Document all public APIs
- [ ] Explain business logic
- [ ] Add code examples
- [ ] Note technical debt

EOF

echo "Session notes created: session-notes.md"
echo "Ready to begin documentation!"
```

## Post-Session Validation

```bash
#!/bin/bash
# validate-docs.sh - Run after documentation session

FOLDER=$1
echo "=== Validating Documentation for $FOLDER ==="

# Check README exists
if [ -f "$FOLDER/README.md" ]; then
    echo "✅ README.md exists"
    
    # Check for required sections
    for section in "Purpose" "Business Logic" "Structure" "Testing"; do
        if grep -q "$section" "$FOLDER/README.md"; then
            echo "✅ Has $section section"
        else
            echo "❌ Missing $section section"
        fi
    done
    
    # Check for code examples
    if grep -q '```' "$FOLDER/README.md"; then
        echo "✅ Has code examples"
    else
        echo "⚠️ No code examples found"
    fi
else
    echo "❌ No README.md found"
fi

# Check for undocumented exports
echo ""
echo "=== Checking Documentation Coverage ==="
for file in $FOLDER/*.ts $FOLDER/*.tsx; do
    if [ -f "$file" ]; then
        exports=$(grep -c "^export" "$file")
        if [ $exports -gt 0 ]; then
            echo "$file has $exports exports - check if documented"
        fi
    fi
done
```

---

Save these scripts and use them during each documentation session to ensure thorough coverage!