#!/usr/bin/env bash
# Render build script for N5Reading backend

set -e  # Exit on error

echo "📦 Installing system dependencies..."

# Install yt-dlp (Python-based YouTube downloader)
echo "⬇️ Installing yt-dlp..."
pip install --upgrade yt-dlp

# Verify installation
echo "✅ Verifying yt-dlp installation..."
yt-dlp --version

# Install npm dependencies
echo "📚 Installing Node.js dependencies..."
npm install

echo "✅ Build complete!"

