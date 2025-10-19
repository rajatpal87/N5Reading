# JLPT N5 Video Coach 🎌

Transform any Japanese video into an interactive N5 learning experience with automatic vocabulary highlighting, grammar pattern detection, and synchronized translations.

## 🎯 What This Does

Upload a Japanese video → Get:
- ✅ Timestamped Japanese transcription
- ✅ English translations
- ✅ N5 vocabulary automatically highlighted
- ✅ Grammar patterns detected and explained
- ✅ Clickable timestamps to jump to N5-rich segments
- ✅ Vocabulary lists with chapter references
- ✅ Study time estimates

## 📋 Quick Links

- **[📖 Complete Project Plan](./PROJECT_PLAN.md)** - Full technical documentation
- **[🎬 Demo Videos](#)** - Coming soon
- **[🐛 Issue Tracker](#)** - Coming soon

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key (for Whisper)
- DeepL API key (for translation)

### Installation
```bash
# Coming soon after Phase 0 setup
```

## 📊 Project Status

**Current Phase**: Phase 2 - Video Processing Pipeline

### ✅ Completed Phases

**Phase 0: Setup & Data Preparation**
- [x] Project planning & documentation
- [x] Initialize Git repository
- [x] Frontend setup (React + Vite + Tailwind)
- [x] Backend setup (Express + SQLite)
- [x] Extract N5 data (296 words + 50 grammar patterns)
- [x] Database seeding

**Phase 1: Video Upload & Storage**
- [x] Drag-and-drop upload UI
- [x] File validation (size, format, type)
- [x] Video metadata extraction
- [x] Video list with cards
- [x] Delete functionality

**Phase 1B: Security Hardening** 🔒
- [x] Rate limiting (IP-based)
- [x] Security headers (Helmet.js)
- [x] Input validation & sanitization
- [x] CORS restrictions
- [x] Request logging
- [x] Error sanitization
- [x] XSS & SQL injection protection

### 🚧 Next Steps
- [ ] YouTube URL download (Phase 2)
- [ ] Audio extraction with FFmpeg (Phase 2)
- [ ] Background job queue (Phase 2)
- [ ] Whisper API integration (Phase 3)
- [ ] DeepL translation (Phase 3)

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Security**: Rate limiting, Helmet.js, Input validation, CORS
- **Database**: SQLite (MVP) → PostgreSQL (Production)
- **APIs**: OpenAI Whisper, DeepL
- **Processing**: FFmpeg, TinySegmenter/Kuromoji
- **Deployment**: Render.com (ready for $7/month)

## 📖 Documentation

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Complete project documentation
  - Technology stack details
  - System architecture
  - Database schema
  - Development phases (week-by-week)
  - Japanese text processing strategy
  - Kanji handling approach
  - External services & costs
- [SECURITY.md](./SECURITY.md) - 🔒 Security documentation
  - Implemented security measures
  - Rate limiting configuration
  - Input validation
  - Testing instructions
  - Incident response plan
- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) - 🚀 Deployment guide
  - Render.com setup ($7/month)
  - Environment configuration
  - Scaling strategy

## 🎓 For Developers

### Understanding the Core Challenge

Japanese text has no spaces:
```
❌ English: "I am a student" (easy to split)
✅ Japanese: "私は学生です" (no spaces - needs tokenization!)
```

This project solves this using Japanese tokenizers to:
1. Split text into words
2. Match against N5 vocabulary database
3. Handle multiple written forms (kanji/hiragana)
4. Detect grammar patterns

**Read [PROJECT_PLAN.md](./PROJECT_PLAN.md#japanese-text-processing) for full details**

## 💰 Estimated Costs

**Development**: ~$2/month  
**Production** (100 videos/month): ~$15-20/month

See [cost breakdown](./PROJECT_PLAN.md#external-services--costs) for details.

## 🗓️ Timeline

- **Week 1-2**: Setup, data preparation, video upload
- **Week 3**: Transcription & translation pipeline
- **Week 4**: N5 analysis engine
- **Week 5**: Interactive video player
- **Week 6**: Dashboard & polish

**Total MVP**: 3-4 weeks

## 💰 Pricing - Progressive JLPT Level Subscriptions

### Free Trial (7 Days)
- Full access to N5 analysis
- Process unlimited videos
- No credit card required

### Subscription Tiers (After Trial)
- **Free**: 2 videos/month (N5 only)
- **N5 Learner**: $9.99/month - N5 analysis, unlimited videos *(MVP)*
- **N4 Learner**: $14.99/month - N5 + N4 analysis *(Phase 11)*
- **N3 Learner**: $19.99/month - N5 + N4 + N3 analysis *(Phase 12)*
- **N2 Learner**: $24.99/month - N5 + N4 + N3 + N2 analysis *(Future)*
- **N1 Master**: $29.99/month - Complete JLPT coverage (N5→N1) *(Future)*

### Annual Plans (Phase 10+)
Save 17-20% with annual billing:
- **N5**: $99/year (save $20)
- **N4**: $149/year (save $30)
- **N3**: $199/year (save $40)
- **N2**: $249/year (save $50)
- **N1**: $299/year (save $60)

**Natural Upgrade Path**: Progress from N5 → N4 → N3 → N2 → N1 as you advance in your Japanese learning journey!

[See detailed monetization strategy](./PROJECT_PLAN.md#monetization-strategy)

---

## 📝 License

[To be determined]

## 🤝 Contributing

This is currently in active development. Contributions welcome after MVP!

---

**Last Updated**: October 19, 2025  
**Version**: 0.1.0 (Planning Phase)

