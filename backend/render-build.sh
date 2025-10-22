#!/usr/bin/env bash
# Render build script for N5Reading backend

set -e  # Exit on error

echo "🔍 System Information:"
echo "Python version: $(python3 --version || echo 'Python3 not found')"
echo "Pip version: $(pip3 --version || echo 'Pip3 not found')"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo ""
echo "📦 Installing system dependencies..."

# Install yt-dlp (Python-based YouTube downloader)
echo "⬇️ Installing yt-dlp..."

# Try different installation methods
if command -v pip3 &> /dev/null; then
    echo "Using pip3..."
    pip3 install --user --upgrade yt-dlp
    export PATH="$HOME/.local/bin:$PATH"
elif command -v pip &> /dev/null; then
    echo "Using pip..."
    pip install --user --upgrade yt-dlp
    export PATH="$HOME/.local/bin:$PATH"
else
    echo "❌ ERROR: pip is not available!"
    echo "Attempting to download yt-dlp binary directly..."
    
    # Download yt-dlp binary as fallback
    mkdir -p $HOME/.local/bin
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o $HOME/.local/bin/yt-dlp
    chmod +x $HOME/.local/bin/yt-dlp
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verify installation
echo ""
echo "✅ Verifying yt-dlp installation..."
if command -v yt-dlp &> /dev/null; then
    yt-dlp --version
    echo "yt-dlp location: $(which yt-dlp)"
else
    echo "❌ ERROR: yt-dlp installation failed!"
    exit 1
fi

# Install npm dependencies
echo ""
echo "📚 Installing Node.js dependencies..."
npm install

echo ""
echo "✅ Build complete!"
echo "Final PATH: $PATH"

