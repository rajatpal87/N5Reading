#!/usr/bin/env bash
# Render startup script for N5Reading backend

# Add multiple potential yt-dlp locations to PATH
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"

echo "🚀 Starting N5Reading Backend..."
echo "Current PATH: $PATH"
echo "Home directory: $HOME"
echo ""
echo "Checking yt-dlp availability..."

# Try to find yt-dlp in common locations
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp found: $(which yt-dlp)"
    echo "✅ yt-dlp version: $(yt-dlp --version)"
elif [ -f "$HOME/.local/bin/yt-dlp" ]; then
    echo "✅ yt-dlp binary found at: $HOME/.local/bin/yt-dlp"
    echo "✅ yt-dlp version: $($HOME/.local/bin/yt-dlp --version)"
else
    echo "⚠️ WARNING: yt-dlp not found!"
    echo "Checking possible locations:"
    ls -la $HOME/.local/bin/ 2>/dev/null || echo "  $HOME/.local/bin/ does not exist"
    echo "YouTube downloads will not work."
fi

echo ""
echo "Starting Node.js server..."
# Start the Node.js server with PATH exported
exec node src/server.js

