# 🎯 Phase 3 Setup Instructions

## ✅ Implementation Complete!

Phase 3 (Transcription & Translation Pipeline) has been fully implemented. Now you need to add your API keys to test it.

---

## 📝 Step-by-Step Setup

### Step 1: Add Your API Keys

Open the backend `.env` file and replace the placeholder values with your actual API keys:

```bash
cd /Users/rajatpal/N5Reading/backend
nano .env  # or use any text editor
```

**Update these lines:**

```bash
# OpenAI Whisper API
OPENAI_API_KEY=your_openai_api_key_here  # ← Replace with your actual key

# DeepL Translation API
DEEPL_API_KEY=your_deepl_api_key_here    # ← Replace with your actual key
```

**Your OpenAI API key format:** `sk-proj-...` (starts with `sk-`)  
**Your DeepL API key format:** Usually ends with `:fx` (Free) or just alphanumeric (Pro)

### Step 2: Restart the Backend

After adding the API keys, restart the backend:

```bash
# Kill existing backend
lsof -ti:3000 | xargs kill -9

# Start backend
cd /Users/rajatpal/N5Reading/backend
npm start
```

Wait for: `✅ Connected to SQLite database`

### Step 3: Test the Full Pipeline!

1. **Open Frontend**: http://localhost:5173

2. **Test with existing video** (if you have one with extracted audio):
   - Find a video with status "🎵 Audio Extracted"
   - Click **"📝 Transcribe & Translate"** button
   - Watch status change: `transcribing` → `translating` → `analyzing`
   
3. **Or test with new video**:
   - Upload a video or paste YouTube URL
   - Click **"🎵 Extract Audio"**
   - Wait for status to change to "🎵 Audio Extracted"
   - Click **"📝 Transcribe & Translate"**

---

## 🧪 What to Expect

### During Transcription (30-60 seconds for 5-min video):
```
Status: 📝 Transcribing...
Backend logs:
🎤 Starting transcription for: /path/to/audio.wav
📊 Audio file size: 6.50 MB
✅ Transcription complete in 12.45s
📝 Text length: 1234 characters
📊 Segments: 45
💰 Estimated cost: $0.0180
```

### During Translation (10-30 seconds):
```
Status: 🌏 Translating...
Backend logs:
🌏 Starting translation...
📝 Text length: 1234 characters
✅ Translation complete in 3.21s
💰 Estimated cost: $0.0031
```

### After Completion:
```
Status: 🔍 Analyzing...
Total Cost: ~$0.02 for 5-minute video
```

---

## 💰 Cost Estimates

### OpenAI Whisper API
- **Rate**: $0.006 per minute of audio
- **Example**: 5-minute video = $0.03

### DeepL API
- **Rate**: ~$0.000025 per character
- **Free Tier**: 500,000 characters/month (≈3,333 minutes)
- **Example**: 1,200 chars = $0.03

### Total per Video
- **5-minute video**: ~$0.06 total
- **10-minute video**: ~$0.12 total

---

## 🎬 Phase 3 Features

### Backend
- ✅ OpenAI Whisper API integration
- ✅ DeepL Translation API integration
- ✅ Segment-level timestamps
- ✅ Cost tracking
- ✅ Error handling & validation
- ✅ Database storage (transcriptions + translations)

### Frontend
- ✅ "Transcribe & Translate" button
- ✅ Status badges (transcribing/translating/analyzing)
- ✅ Optimistic UI updates
- ✅ Error messages

### API Endpoint
```bash
POST /api/videos/:id/transcribe

Response:
{
  "message": "Transcription and translation complete",
  "video": { "id": 1, "status": "analyzing" },
  "transcription": {
    "id": 1,
    "text": "こんにちは。今日は天気がいいですね。",
    "language": "ja",
    "segmentCount": 2
  },
  "translation": {
    "id": 1,
    "text": "Hello. The weather is nice today.",
    "language": "en"
  },
  "cost": {
    "transcription": 0.018,
    "translation": 0.003,
    "total": 0.021
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid OpenAI API key"
- Check your API key in `.env` starts with `sk-`
- Verify at: https://platform.openai.com/api-keys
- Ensure you have billing set up

### Error: "OpenAI API quota exceeded"
- Check usage: https://platform.openai.com/usage
- Add credits or upgrade plan

### Error: "Invalid DeepL API key"
- Check your key at: https://www.deepl.com/account/summary
- Free vs Pro keys are different
- Verify you haven't exceeded quota

### Error: "Audio not extracted yet"
- Click "🎵 Extract Audio" first
- Wait for status to change to "🎵 Audio Extracted"
- Then click "📝 Transcribe & Translate"

### Backend Not Starting
```bash
# Check backend logs
tail -50 /tmp/backend.log

# Common issue: Port in use
lsof -ti:3000 | xargs kill -9

# Restart
cd /Users/rajatpal/N5Reading/backend && npm start
```

---

## 📊 Database Schema

### Transcriptions Table
```sql
CREATE TABLE transcriptions (
  id INTEGER PRIMARY KEY,
  video_id INTEGER NOT NULL,
  language TEXT DEFAULT 'ja',
  full_text TEXT,              -- Full Japanese transcription
  segments TEXT,               -- JSON array of timestamped segments
  created_at TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id)
);
```

### Translations Table
```sql
CREATE TABLE translations (
  id INTEGER PRIMARY KEY,
  transcription_id INTEGER NOT NULL,
  language TEXT DEFAULT 'en',
  full_text TEXT,              -- Full English translation
  segments TEXT,               -- JSON array with translations
  created_at TIMESTAMP,
  FOREIGN KEY (transcription_id) REFERENCES transcriptions(id)
);
```

---

## 🚀 Next Steps: Phase 4

After you test Phase 3, we'll build:

**Phase 4: N5 Analysis Engine**
- Detect N5 vocabulary in transcriptions
- Identify grammar patterns
- Highlight detected words/patterns
- Calculate N5 coverage percentage

**But first**: Add your API keys and test the transcription pipeline! 🎉

---

## 📞 Need Help?

If you encounter any errors:
1. Check backend logs: `tail -50 /tmp/backend.log`
2. Check frontend console (F12 in browser)
3. Verify API keys are correct in `.env`
4. Ensure both servers are running

Ready to test! 🚀

