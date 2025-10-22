#!/usr/bin/env bash
# Render startup script for N5Reading backend

# Add user's local bin to PATH (where yt-dlp is installed)
export PATH="$HOME/.local/bin:$PATH"

echo "🚀 Starting N5Reading Backend..."
echo "PATH: $PATH"
echo "Checking yt-dlp availability..."

if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp found: $(which yt-dlp)"
    echo "✅ yt-dlp version: $(yt-dlp --version)"
else
    echo "⚠️ WARNING: yt-dlp not found in PATH!"
    echo "YouTube downloads will not work."
fi

# Start the Node.js server
node src/server.js

