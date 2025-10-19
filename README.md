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

**Current Phase**: Phase 0 - Setup & Data Preparation

### Completed
- [x] Project planning
- [x] Technology stack selection
- [x] Database schema design

### In Progress
- [ ] Extract N5 data from PDFs
- [ ] Initialize project structure
- [ ] Set up database with seed data

### Next Steps
- [ ] Build video upload page
- [ ] Integrate Whisper API
- [ ] Implement N5 analysis engine

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (MVP) → PostgreSQL (Production)
- **APIs**: OpenAI Whisper, DeepL
- **Processing**: FFmpeg, TinySegmenter/Kuromoji

## 📖 Documentation

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - Complete project documentation
  - Technology stack details
  - System architecture
  - Database schema
  - Development phases (week-by-week)
  - Japanese text processing strategy
  - Kanji handling approach
  - External services & costs

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

