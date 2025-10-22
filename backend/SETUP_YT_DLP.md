# Installing yt-dlp for YouTube Downloads

The N5Reading backend requires `yt-dlp` to download YouTube videos. This guide will help you install it.

## Quick Installation

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install yt-dlp
```

### macOS
```bash
brew install yt-dlp
```

### Using pip (All platforms)
```bash
# Using pip3
pip3 install --user yt-dlp

# Or using pip
pip install --user yt-dlp
```

### Manual Installation (Linux/macOS)
```bash
# Download the binary
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp

# Make it executable
sudo chmod +x /usr/local/bin/yt-dlp
```

## Verifying Installation

After installation, verify that yt-dlp is available:

```bash
yt-dlp --version
```

You should see a version number (e.g., `2025.10.14`).

## Troubleshooting

### "yt-dlp not found" error

If you installed yt-dlp but still get errors:

1. **Check if it's in your PATH:**
   ```bash
   which yt-dlp
   ```

2. **If using pip with --user flag, add to PATH:**
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```
   Add this line to your `~/.bashrc` or `~/.zshrc` to make it permanent.

3. **Restart the backend server** after installation:
   ```bash
   npm run dev
   ```

### Production Deployment (Render, Heroku, etc.)

The `render-build.sh` script automatically installs yt-dlp during deployment. Ensure:
- The build script has execute permissions: `chmod +x render-build.sh`
- The build script runs during deployment (configured in Render/Heroku settings)

## Alternative: Upload Videos Directly

If you cannot install yt-dlp, you can:
1. Download YouTube videos manually using [youtube-dl](https://youtube-dl.org/) or online tools
2. Use the "Upload Video" feature in the app to upload the downloaded file

## More Information

- yt-dlp GitHub: https://github.com/yt-dlp/yt-dlp
- yt-dlp Documentation: https://github.com/yt-dlp/yt-dlp#readme
