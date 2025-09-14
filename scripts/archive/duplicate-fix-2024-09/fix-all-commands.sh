#!/bin/bash

echo "🔧 Setting up VS Code and Claude commands..."

# First, let's find VS Code
if [ -d "/Applications/Visual Studio Code.app" ]; then
    VSCODE_PATH="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    echo "✅ Found VS Code at standard location"
elif [ -d "/Applications/VSCode.app" ]; then
    VSCODE_PATH="/Applications/VSCode.app/Contents/Resources/app/bin/code"
    echo "✅ Found VS Code at alternate location"
else
    echo "🔍 Searching for VS Code..."
    VSCODE_APP=$(mdfind -onlyin /Applications "kMDItemKind == 'Application' && kMDItemDisplayName == 'Visual Studio Code'" | head -1)
    if [ -n "$VSCODE_APP" ]; then
        VSCODE_PATH="$VSCODE_APP/Contents/Resources/app/bin/code"
        echo "✅ Found VS Code at: $VSCODE_APP"
    else
        echo "❌ VS Code not found in Applications folder"
        echo "You're currently using VS Code, so it must be installed somewhere else."
        echo ""
        echo "Please open VS Code manually, then:"
        echo "1. Press Cmd+Shift+P"
        echo "2. Type 'Shell Command: Install code command in PATH'"
        echo "3. Select that option"
        echo ""
        echo "This will install the 'code' command properly."
        exit 1
    fi
fi

# Now set up the commands
echo ""
echo "📝 Adding commands to your shell configuration..."

# Remove any broken aliases first
sed -i '' '/Claude Code\.app/d' ~/.zshrc 2>/dev/null
sed -i '' '/alias code=/d' ~/.zshrc 2>/dev/null
sed -i '' '/alias claude=/d' ~/.zshrc 2>/dev/null

# Add new aliases
echo '' >> ~/.zshrc
echo '# VS Code and Claude commands' >> ~/.zshrc
echo "alias code='\"$VSCODE_PATH\"'" >> ~/.zshrc
echo "alias claude='\"$VSCODE_PATH\"'" >> ~/.zshrc

echo ""
echo "✅ Commands configured!"
echo ""
echo "Now run:"
echo "  source ~/.zshrc"
echo ""
echo "Then you can use:"
echo "  code .     # Opens VS Code in current directory"
echo "  claude .   # Also opens VS Code (where Claude extension is)"
echo ""
echo "Since you're already in VS Code, you can access Claude through:"
echo "  Cmd+Shift+P → then type 'Claude'"
