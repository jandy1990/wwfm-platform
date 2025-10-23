# WWFM Documentation Scripts & Tools

Quick analysis scripts and commands for documentation sessions.

---

## 🔍 Quick Analysis Commands

### 1. Folder Overview
```bash
# Set your target folder
FOLDER="./app"  # Change this to your target

# Get a complete overview
echo "=== $FOLDER Overview ==="
echo "Total files: $(find $FOLDER -type f | wc -l)"
echo "TypeScript files: $(find $FOLDER -name '*.ts' -o -name '*.tsx' | wc -l)"
echo "Test files: $(find $FOLDER -name '*.test.*' -o -name '*.spec.*' | wc -l)"
echo "Existing docs: $(find $FOLDER -name '*.md' | wc -l)"

# Show largest files (likely most complex)
echo -e "\n=== Largest Files (Complexity Indicators) ==="
find $FOLDER -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -10

# Show files with most imports (high coupling)
echo -e "\n=== Files with Most Dependencies ==="
for file in $(find $FOLDER -name "*.tsx" -o -name "*.ts"); do
  count=$(grep -c "^import" "$file" 2>/dev/null || echo 0)
  if [ $count -gt 5 ]; then
    echo "$count imports: $file"
  fi
done | sort -rn | head -10
```

### 2. Find Documentation Gaps
```bash
# Find folders without README
echo "=== Folders Missing Documentation ==="
for dir in $(find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*"); do
  if [ ! -f "$dir/README.md" ]; then
    file_count=$(find "$dir" -maxdepth 1 -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
    if [ $file_count -gt 0 ]; then
      echo "❌ $dir (contains $file_count TS files)"
    fi
  fi
done

# Find complex files without comments
echo -e "\n=== Complex Files Lacking Documentation ==="
for file in $(find . -name "*.tsx" -o -name "*.ts" -not -path "*/node_modules/*"); do
  lines=$(wc -l < "$file")
  comments=$(grep -c "^\s*//" "$file" 2>/dev/null || echo 0)
  if [ $lines -gt 100 ] && [ $comments -lt 5 ]; then
    echo "$file: $lines lines, only $comments comments"
  fi
done
```

### 3. Component Analysis
```bash
# List all React components
echo "=== React Components Found ==="
grep -r "export.*function\|export.*const.*=.*(" ./components --include="*.tsx" | \
  cut -d: -f1 | sort -u | while read file; do
  echo "📦 $(basename $file .tsx)"
done

# Find components with TypeScript interfaces
echo -e "\n=== Components with Props Interfaces ==="
grep -r "interface.*Props" ./components --include="*.tsx" | \
  cut -d: -f1 | sort -u | while read file; do
  echo "🎯 $(basename $file)"
done

# Find custom hooks
echo -e "\n=== Custom Hooks ==="
grep -r "^export.*use[A-Z]" ./hooks --include="*.ts" --include="*.tsx" | \
  cut -d: -f2 | sed 's/export.*function //' | sed 's/(.*$//'
```

### 4. API Route Analysis
```bash
# List all API routes with their methods
echo "=== API Routes & Methods ==="
for route in $(find ./app/api -name "route.ts"); do
  path=$(echo $route | sed 's|./app/api/||' | sed 's|/route.ts||')
  echo -e "\n📍 /$path"
  grep "export async function" "$route" | sed 's/export async function /  - /' | sed 's/(.*$//'
done

# Find authentication checks
echo -e "\n=== Routes with Auth Checks ==="
grep -r "getUser\|requireAuth\|session" ./app/api --include="*.ts" | \
  cut -d: -f1 | sort -u | while read file; do
  route=$(echo $file | sed 's|./app/api/||' | sed 's|/route.ts||')
  echo "🔒 /$route"
done
```

### 5. Database Query Analysis
```bash
# Find all Supabase queries and their types
echo "=== Database Operations by Table ==="
for table in $(grep -r "from('[a-z_]*')" . --include="*.ts" --include="*.tsx" | \
  grep -oP "from\('\K[^']*" | sort -u); do
  echo -e "\n📊 Table: $table"
  grep -r "from('$table')" . --include="*.ts" --include="*.tsx" | \
    grep -o "\.\(select\|insert\|update\|delete\|upsert\)" | sort | uniq -c
done

# Find RLS-protected queries
echo -e "\n=== RLS Usage ==="
echo "Files using auth.uid(): $(grep -r "auth\.uid()" . --include="*.ts" --include="*.tsx" | wc -l)"
echo "Files using auth.user(): $(grep -r "auth\.user()" . --include="*.ts" --include="*.tsx" | wc -l)"
```

### 6. Business Logic Detection
```bash
# Find validation functions
echo "=== Validation Logic ==="
grep -r "validate\|isValid\|check" . --include="*.ts" --include="*.tsx" \
  -not -path "*/node_modules/*" | grep -E "function|const.*=" | head -20

# Find calculation/transformation logic
echo -e "\n=== Business Calculations ==="
grep -r "calculate\|compute\|transform\|process" . --include="*.ts" --include="*.tsx" \
  -not -path "*/node_modules/*" | grep -E "function|const.*=" | head -20

# Find business rules (comments)
echo -e "\n=== Documented Business Rules ==="
grep -r "// Rule:\|// Business:\|// Constraint:\|// Note:" . \
  --include="*.ts" --include="*.tsx" -not -path "*/node_modules/*" | head -20
```

### 7. Technical Debt Finder
```bash
# Find all TODOs and FIXMEs
echo "=== Technical Debt Markers ==="
echo "TODOs: $(grep -r "TODO" . --include="*.ts" --include="*.tsx" | wc -l)"
echo "FIXMEs: $(grep -r "FIXME" . --include="*.ts" --include="*.tsx" | wc -l)"
echo "HACKs: $(grep -r "HACK" . --include="*.ts" --include="*.tsx" | wc -l)"
echo "DEPRECATEDs: $(grep -r "deprecated" -i . --include="*.ts" --include="*.tsx" | wc -l)"

echo -e "\n=== Top Files with Technical Debt ==="
for file in $(find . -name "*.tsx" -o -name "*.ts" -not -path "*/node_modules/*"); do
  debt_count=$(grep -c "TODO\|FIXME\|HACK" "$file" 2>/dev/null || echo 0)
  if [ $debt_count -gt 0 ]; then
    echo "$debt_count issues: $file"
  fi
done | sort -rn | head -10
```

---

## 🚀 Pre-Session Script

Save this as `prepare-doc-session.sh`:

```bash
#!/bin/bash

# Usage: ./prepare-doc-session.sh ./app

FOLDER=$1

if [ -z "$FOLDER" ]; then
  echo "Usage: $0 <folder-path>"
  exit 1
fi

echo "==================================="
echo "Documentation Session Preparation"
echo "Target: $FOLDER"
echo "==================================="

# Create session notes file
SESSION_FILE="session-$(date +%Y%m%d)-$(basename $FOLDER).md"

cat > $SESSION_FILE << EOF
# Documentation Session - $(date)
## Target: $FOLDER

### 📊 Folder Statistics
- Total files: $(find $FOLDER -type f | wc -l)
- TypeScript files: $(find $FOLDER -name '*.ts' -o -name '*.tsx' | wc -l)
- Test files: $(find $FOLDER -name '*.test.*' | wc -l)
- Lines of code: $(find $FOLDER -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1 | awk '{print $1}')

### 📁 File List
$(find $FOLDER -maxdepth 2 -name "*.ts" -o -name "*.tsx" | sort)

### 🔍 Existing Documentation
$(find $FOLDER -name "README*" -o -name "*.md")

### 🎯 Key Exports
$(grep -h "^export" $FOLDER/*.ts* 2>/dev/null | head -10)

### ⚠️ Technical Debt
$(grep -n "TODO\|FIXME" $FOLDER/*.ts* 2>/dev/null | head -5)

### 📝 Questions to Answer
1. What is the main purpose of this module?
2. What are the key business rules?
3. What are the main entry points?
4. What could break?
5. What needs improvement?

### Session Notes
[Start documenting here]

EOF

echo "✅ Session notes created: $SESSION_FILE"
echo ""
echo "📋 Quick Stats:"
find $FOLDER -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
echo ""
echo "🎯 Ready to begin documentation session!"
```

---

## ✅ Post-Session Validation Script

Save this as `validate-docs.sh`:

```bash
#!/bin/bash

# Usage: ./validate-docs.sh ./app

FOLDER=$1

echo "==================================="
echo "Documentation Validation"
echo "Target: $FOLDER"
echo "==================================="

# Check README exists
if [ -f "$FOLDER/README.md" ]; then
  echo "✅ README.md exists"
  
  # Check for required sections
  for section in "Purpose" "Structure" "Business Logic" "Testing"; do
    if grep -q "## $section\|# $section" "$FOLDER/README.md"; then
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
  
  # Check README length
  lines=$(wc -l < "$FOLDER/README.md")
  if [ $lines -gt 50 ]; then
    echo "✅ Substantial documentation ($lines lines)"
  else
    echo "⚠️ Brief documentation ($lines lines)"
  fi
else
  echo "❌ No README.md found!"
fi

echo ""
echo "📊 Coverage Analysis:"

# Count documented vs undocumented exports
total_exports=$(grep -c "^export" $FOLDER/*.ts* 2>/dev/null || echo 0)
echo "Total exports found: $total_exports"

# List files that might need individual documentation
echo ""
echo "📝 Complex files that may need extra documentation:"
for file in $FOLDER/*.ts $FOLDER/*.tsx; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    if [ $lines -gt 200 ]; then
      echo "  - $(basename $file): $lines lines"
    fi
  fi
done

echo ""
echo "✨ Validation complete!"
```

---

## 🎯 Quick Reference

### Documentation Priorities by File Size
- **>200 lines**: CRITICAL - needs detailed documentation
- **100-200 lines**: HIGH - needs good documentation  
- **50-100 lines**: MEDIUM - needs basic documentation
- **<50 lines**: LOW - may be self-documenting

### Documentation Priorities by Dependencies
- **>10 imports**: CRITICAL - high coupling, needs explanation
- **5-10 imports**: HIGH - moderate coupling
- **<5 imports**: NORMAL - standard documentation

### Documentation Priorities by Business Logic
Look for these keywords to identify business-critical code:
- `validate`, `check`, `verify` - Validation logic
- `calculate`, `compute` - Business calculations  
- `transform`, `process` - Data transformation
- `rules`, `constraints` - Business rules
- `workflow`, `pipeline` - Process flows

---

## 📝 Session Helper Functions

Add these to your `.bashrc` or `.zshrc`:

```bash
# Quick documentation check
alias docheck='find . -type d -maxdepth 2 | while read d; do [ ! -f "$d/README.md" ] && [ $(find "$d" -maxdepth 1 -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l) -gt 0 ] && echo "❌ $d"; done'

# Start documentation session
dodoc() {
  folder=$1
  echo "Starting documentation session for $folder"
  code "$folder/README.md"
  echo "=== Quick Stats ==="
  find "$folder" -name "*.ts" -o -name "*.tsx" | wc -l
  echo "files to document"
}

# Quick complexity check
docomplex() {
  echo "=== Files over 200 lines ==="
  find . -name "*.tsx" -o -name "*.ts" -not -path "*/node_modules/*" | while read f; do
    lines=$(wc -l < "$f")
    [ $lines -gt 200 ] && echo "$lines lines: $f"
  done | sort -rn
}
```

---

## 🏁 Ready to Document!

1. Run `./prepare-doc-session.sh [folder]` before starting
2. Use the quick analysis commands during documentation
3. Run `./validate-docs.sh [folder]` after completing
4. Update `DOCUMENTATION-SESSIONS.md` with your progress

Remember: Focus on the WHY, not just the WHAT!