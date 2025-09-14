#!/bin/bash

echo "🔧 Fixing the claude command..."

# Remove the broken alias from .zshrc
echo "Removing broken claude alias from .zshrc..."
sed -i '' '/Claude Code\.app/d' ~/.zshrc

# Create a working alias for VS Code with Claude extension
echo "Creating new 'claude' command that opens VS Code..."
echo '' >> ~/.zshrc
echo '# Claude command - opens VS Code (where Claude Code extension lives)' >> ~/.zshrc
echo 'alias claude="code"' >> ~/.zshrc

echo "✅ Done! The 'claude' command will now open VS Code."
echo ""
echo "To apply the changes, run:"
echo "  source ~/.zshrc"
echo ""
echo "Then you can use:"
echo "  claude ~/Desktop/wwfm-platform"
echo ""
echo "This will open VS Code with your project, where Claude Code extension is available."
