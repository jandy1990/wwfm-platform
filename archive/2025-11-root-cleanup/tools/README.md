# WWFM Debug Tools

## 🔍 debug-page.js

A comprehensive debugging tool for analyzing WWFM pages during development.

### Features
- 📸 **Screenshots**: Captures desktop, mobile, and full-page views
- 📊 **Performance Metrics**: Load time, DOM nodes, resource counts
- 🐛 **Error Tracking**: Console logs, network failures, page errors
- ♿ **Accessibility Checks**: Missing alt text, labels, etc.
- 🗂️ **Auto-organization**: Timestamped folders for each session
- 🗑️ **Auto-cleanup**: Keeps only the last N sessions
- 🔄 **Comparison Mode**: Compare two debug sessions

### Basic Usage

```bash
# Debug the homepage
node tools/debug-page.js

# Debug a specific page
node tools/debug-page.js http://localhost:3001/goal/some-id

# Quick summary (no screenshots)
node tools/debug-page.js --summary

# Don't open report automatically
node tools/debug-page.js --no-open

# Keep more sessions
node tools/debug-page.js --keep-last=10

# Don't cleanup old sessions
node tools/debug-page.js --no-cleanup

# Show browser window
node tools/debug-page.js --headless=false
```

### Comparison Mode

Compare two debug sessions to track performance changes:

```bash
node tools/debug-page.js --compare 2025-07-12T10-30-45 2025-07-12T11-45-30
```

### Output Structure

```
debug-output/
├── 2025-07-12T10-30-45/
│   ├── report.html        # Visual report (auto-opens)
│   ├── report.json        # Raw data
│   ├── full-page.png      # Full page screenshot
│   ├── viewport.png       # Desktop view
│   └── mobile-view.png    # Mobile view (375x667)
└── 2025-07-12T11-45-30/
    └── ...
```

## 🗑️ debug-cleanup.js

Standalone cleanup utility for managing debug sessions.

```bash
# Clean up, keeping last 3 sessions (default)
node tools/debug-cleanup.js

# Keep last 5 sessions
node tools/debug-cleanup.js --keep-last=5
```

## Tips

1. **Performance Testing**: Use comparison mode before/after changes
2. **Mobile Testing**: Check mobile screenshots for responsive issues
3. **Error Hunting**: Review console logs in the HTML report
4. **CI Integration**: Use `--summary --no-open` for automated tests

## Requirements

- Node.js
- Playwright (`npm install playwright`)

The tool automatically installs Chromium on first run.