# 🚀 JLPT N5 Video Coach - Deployment Guide

**Last Updated:** October 19, 2025  
**Version:** 2.0  
**Status:** Ready for MVP Deployment

---

## 📋 Table of Contents

1. [Deployment Philosophy](#deployment-philosophy)
2. [Quick Start (15 minutes)](#quick-start-15-minutes)
3. [MVP Deployment (Render.com)](#mvp-deployment-rendercom)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Domain & SSL Setup](#domain--ssl-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)
9. [Scaling Strategy](#scaling-strategy)
10. [Cost Breakdown](#cost-breakdown)

---

## 🎯 Deployment Philosophy

### For MVP (Phases 0-6): **Simple, Cheap, Scalable**

**Priorities:**
1. ✅ **Low cost** ($7-19/month total)
2. ✅ **Quick deployment** (under 1 hour)
3. ✅ **Easy maintenance** (minimal DevOps)
4. ✅ **Easy scaling** (can grow without rewrite)

**What We DON'T Need:**
- ❌ Kubernetes/complex orchestration
- ❌ Load balancers
- ❌ Multi-region deployment
- ❌ Microservices
- ❌ Dedicated servers

**Recommended Platform:** **Render.com** (all-in-one, auto-deploy)

---

## ⚡ Quick Start (15 minutes)

### Prerequisites Checklist

```bash
✅ Code pushed to GitHub
✅ FFmpeg installed on local machine (for testing)
✅ OpenAI API key (get from: https://platform.openai.com)
✅ DeepL API key (get from: https://www.deepl.com/pro-api)
✅ Render.com account (sign up: https://render.com)
```

### 5-Minute Deployment

```bash
1. Sign up on Render.com (with GitHub)
2. Create Backend Web Service
   - Connect GitHub repo
   - Root: backend/
   - Build: npm install
   - Start: npm start
   - Add environment variables (see below)
3. Create Frontend Static Site
   - Root: frontend/
   - Build: npm install && npm run build
   - Publish: dist/
4. Done! ✅
```

---

## 🏗️ MVP Deployment (Render.com)

### Architecture Overview

```
┌───────────────────────────────────────────┐
│              RENDER.COM                   │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────┐    │
│  │ Static Site (Frontend)   FREE   │    │
│  │ - React build (dist/)            │    │
│  │ - Served via CDN                 │    │
│  │ - Auto-deploy from GitHub        │    │
│  │ - https://n5reading.onrender.com │    │
│  └─────────────────────────────────┘    │
│                 │                         │
│                 │ API Calls               │
│                 ▼                         │
│  ┌─────────────────────────────────┐    │
│  │ Web Service (Backend)  $7/mo    │    │
│  │ - Node.js + Express              │    │
│  │ - SQLite (local disk)            │    │
│  │ - Video storage (local disk)     │    │
│  │ - Auto-deploy from GitHub        │    │
│  │ - https://n5-api.onrender.com    │    │
│  └─────────────────────────────────┘    │
│                                           │
└───────────────────────────────────────────┘
         │                    │
         │ External APIs      │
         ▼                    ▼
┌──────────────┐      ┌──────────────┐
│ OpenAI       │      │ DeepL        │
│ Whisper API  │      │ API          │
└──────────────┘      └──────────────┘
```

---

## 📝 Step-by-Step Deployment

### Step 1: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended for auto-deploy)
4. Authorize Render to access your repositories

---

### Step 2: Deploy Backend (5 minutes)

#### A. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`N5Reading`**
3. Configure service:

```
Name:            n5reading-backend
Region:          Oregon (US West) or closest
Branch:          main
Root Directory:  backend
Runtime:         Node
Build Command:   npm install
Start Command:   npm start
Instance Type:   Starter ($7/month)
```

#### B. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

```bash
# Required
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=sk-your-openai-key-here
DEEPL_API_KEY=your-deepl-key-here

# Optional (defaults work for MVP)
FRONTEND_URL=https://n5reading.onrender.com
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm
```

#### C. Deploy Backend

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for initial deployment
3. Backend URL: `https://n5reading-backend.onrender.com`

#### D. Verify Backend Deployment

```bash
# Test health endpoint
curl https://n5reading-backend.onrender.com/api/health

# Expected response:
{
  "status": "ok",
  "message": "N5 Reading API is running",
  "timestamp": "2025-10-19T10:30:00.000Z",
  "environment": "production"
}
```

---

### Step 3: Seed Production Database (3 minutes)

#### Option A: Use Render Shell (Recommended)

1. In Render dashboard, go to your backend service
2. Click **"Shell"** tab at the top
3. Run seeding command:

```bash
npm run seed
```

Expected output:
```
🌱 Seeding N5 vocabulary and grammar patterns...
✅ Inserted 296 N5 vocabulary words
✅ Inserted 50 N5 grammar patterns
✅ Database seeded successfully!
```

#### Option B: Use Render CLI

```bash
# Install Render CLI (if not installed)
npm install -g @render/cli

# Login
render login

# Get shell access
render shell n5reading-backend

# Run seed
npm run seed
```

#### Verify Database

```bash
curl https://n5reading-backend.onrender.com/api/test-db

# Expected:
{
  "status": "ok",
  "database": "SQLite",
  "tables": ["videos", "transcriptions", "translations", ...],
  "data": {
    "n5_vocabulary": 296,
    "n5_grammar": 50
  }
}
```

---

### Step 4: Deploy Frontend (5 minutes)

#### A. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Select repository: **`N5Reading`**
3. Configure site:

```
Name:              n5reading-frontend
Branch:            main
Root Directory:    frontend
Build Command:     npm install && npm run build
Publish Directory: dist
Instance Type:     FREE
```

#### B. Add Environment Variables

```bash
VITE_API_URL=https://n5reading-backend.onrender.com/api
```

> **Important:** Must start with `VITE_` for Vite to include it in the build

#### C. Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 2-3 minutes for build
3. Frontend URL: `https://n5reading.onrender.com`

#### D. Verify Frontend Deployment

1. Open `https://n5reading.onrender.com` in browser
2. Should see the home page with upload section
3. Check browser console for errors (should be none)
4. Try uploading a video to test backend connection

---

### Step 5: Test Full Flow (10 minutes)

#### Complete Integration Test

```bash
1. ✅ Open frontend in browser
2. ✅ Upload a small test video (< 10MB)
3. ✅ Wait for upload to complete
4. ✅ Click "Extract Audio"
5. ✅ Wait for audio extraction
6. ✅ Click "Play Audio" (verify audio plays)
7. ✅ Click "Transcribe & Translate"
8. ✅ Wait for processing (may take 2-3 minutes)
9. ✅ Click "View Transcription" (verify Japanese/English)
10. ✅ Click "Dashboard" (verify N5 analysis)
11. ✅ Test timeline interaction
12. ✅ Test vocabulary sorting/filtering
13. ✅ Test CSV export
```

#### If Everything Works: 🎉 **Deployment Complete!**

---

## ⚙️ Environment Configuration

### Backend Environment Variables

#### Required Variables

```bash
# Core Configuration
NODE_ENV=production                    # Enables production optimizations
PORT=3000                             # Default port (Render provides this)

# API Keys (REQUIRED for functionality)
OPENAI_API_KEY=sk-...                 # OpenAI Whisper API key
DEEPL_API_KEY=...                     # DeepL API key
```

#### Optional Variables (with sensible defaults)

```bash
# Frontend Configuration
FRONTEND_URL=https://n5reading.onrender.com  # For CORS (defaults to localhost)

# File Upload Limits
MAX_FILE_SIZE=104857600               # 100MB (default)
ALLOWED_FILE_TYPES=video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm

# Rate Limiting (default values shown)
RATE_LIMIT_WINDOW_MS=900000           # 15 minutes
RATE_LIMIT_MAX=100                    # 100 requests per window
UPLOAD_RATE_LIMIT_MAX=10              # 10 uploads per window

# Database (SQLite is default for MVP)
DATABASE_URL=                         # Leave empty for SQLite
                                      # Add PostgreSQL URL later if needed

# Logging
LOG_LEVEL=info                        # error, warn, info, debug
```

### Frontend Environment Variables

```bash
# API Configuration (REQUIRED)
VITE_API_URL=https://n5reading-backend.onrender.com/api

# Optional
VITE_APP_NAME=JLPT N5 Video Coach
VITE_APP_VERSION=1.0.0
```

### How to Update Environment Variables

**On Render:**
1. Go to your service dashboard
2. Click **"Environment"** in left sidebar
3. Add/Edit variables
4. Click **"Save Changes"**
5. Service will auto-redeploy

**Local Development:**
```bash
# backend/.env
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=sk-...
DEEPL_API_KEY=...
FRONTEND_URL=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗄️ Database Setup

### Current Setup (MVP): SQLite

**Pros:**
- ✅ Zero configuration
- ✅ File-based (no separate server)
- ✅ Included in backend instance
- ✅ Perfect for MVP (<100 users)

**Cons:**
- ⚠️ Limited concurrent writes
- ⚠️ Data loss if instance restarts (Render restarts every ~2 weeks on free tier)

**Recommendation:** Backup database regularly (see below)

### Backup Strategy

#### Automated Backup Script

Create `backend/scripts/backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Backup SQLite database
cp database.db $BACKUP_DIR/database_$DATE.db

# Backup uploads folder
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

echo "✅ Backup complete: $BACKUP_DIR/database_$DATE.db"
```

#### Schedule Backups (Future)

Use Render's Cron Jobs or GitHub Actions:

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Download database
        run: |
          # SSH into Render and download database
          # Upload to S3/R2 for long-term storage
```

### Migration to PostgreSQL (Phase 8+)

**When to migrate:**
- 100+ active users
- Need better concurrent write support
- Want better data durability

**Render PostgreSQL Setup:**

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: n5reading-db
   Instance Type: Starter ($7/month)
   PostgreSQL Version: 15
   ```
3. Copy `DATABASE_URL` (internal connection string)
4. Add to backend environment variables
5. Run migration script:
   ```bash
   npm run migrate:postgres
   ```

---

## 🌐 Domain & SSL Setup

### Using Custom Domain (Optional)

#### Step 1: Buy Domain

**Recommended Registrars:**
- Namecheap: ~$12/year
- Google Domains: ~$12/year
- Cloudflare: ~$10/year

Example domains:
- `n5reading.com`
- `jlptvideo.coach`
- `n5videocoach.com`

#### Step 2: Configure DNS on Render

**For Frontend (Static Site):**

1. In Render dashboard, go to your frontend service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain: `n5reading.com`
4. Render provides DNS instructions:
   ```
   Type: CNAME
   Name: @
   Value: n5reading.onrender.com
   TTL: 3600
   ```

**For Backend (API):**

Add subdomain for API:
```
Type: CNAME
Name: api
Value: n5reading-backend.onrender.com
TTL: 3600
```

Result:
- Frontend: `https://n5reading.com`
- Backend: `https://api.n5reading.com`

#### Step 3: Update Environment Variables

```bash
# Backend
FRONTEND_URL=https://n5reading.com

# Frontend
VITE_API_URL=https://api.n5reading.com/api
```

### SSL Certificates

**Render provides FREE SSL automatically:**
- ✅ Auto-generated Let's Encrypt certificates
- ✅ Auto-renewal (no maintenance)
- ✅ Works for custom domains too
- ✅ HTTPS enforced by default

**No configuration needed!**

---

## 📊 Monitoring & Logging

### Built-in Render Monitoring

**Available Metrics:**
- CPU usage
- Memory usage
- Response times
- Error rates
- Deploy history

**Access:** Render Dashboard → Service → "Metrics" tab

### Recommended Monitoring Tools

#### 1. Sentry (Error Tracking) - FREE tier

**Setup:**

```bash
# Install
npm install @sentry/node @sentry/react

# Backend (server.js)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

# Frontend (main.jsx)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE
});
```

**Benefits:**
- 5,000 errors/month (free)
- Email alerts
- Stack traces
- User context

#### 2. UptimeRobot (Uptime Monitoring) - FREE

**Setup:**
1. Sign up: https://uptimerobot.com
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://n5reading-backend.onrender.com/api/health`
   - Interval: 5 minutes
3. Add alert contacts (email, Slack, etc.)

**Benefits:**
- 50 monitors (free)
- Email alerts if down
- 90-day uptime history

#### 3. Google Analytics (Usage Tracking) - FREE

**Setup:**

```html
<!-- frontend/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Track:**
- Page views
- User behavior
- Conversion funnels
- Demographics

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue 1: Frontend shows "Failed to fetch"

**Symptoms:**
- Videos don't load
- API errors in console
- Blank dashboard

**Causes & Solutions:**

```bash
# 1. Check backend is running
curl https://n5reading-backend.onrender.com/api/health
# If fails: Backend is down, check Render logs

# 2. Check CORS configuration
# In backend/src/middleware/security.js:
const allowedOrigins = [
  'https://n5reading.onrender.com',  # Add your frontend URL
  process.env.FRONTEND_URL
];

# 3. Check environment variables
# Frontend must have: VITE_API_URL=https://...
```

#### Issue 2: Transcription fails with "API key not configured"

**Solution:**

```bash
# Verify environment variable is set
# In Render: Backend service → Environment → Check OPENAI_API_KEY

# Test API key locally
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# If invalid, get new key from: https://platform.openai.com/api-keys
```

#### Issue 3: Video upload fails

**Possible causes:**

```bash
# 1. File too large (>100MB)
# Solution: Compress video or increase MAX_FILE_SIZE env var

# 2. Invalid file type
# Solution: Check ALLOWED_FILE_TYPES includes your video format

# 3. Disk space full (Render free tier: 512MB)
# Solution: Upgrade to Starter ($7/mo) with 1GB disk
# Or: Delete old videos
```

#### Issue 4: Database not seeded

**Solution:**

```bash
# SSH into Render shell
render shell n5reading-backend

# Check if seed script exists
ls -la src/db/seed.js

# Run seed manually
node src/db/seed.js

# Verify data
curl https://n5reading-backend.onrender.com/api/test-db
```

#### Issue 5: "localhost refused to connect" (Rate Limiting)

**Cause:** Rate limiter blocking localhost in production

**Solution:**

```javascript
// backend/src/middleware/security.js
const isDevelopment = process.env.NODE_ENV !== 'production';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 100,  // Higher limit in dev
  skip: (req) => isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1')
});
```

### Checking Logs

**Render Dashboard:**
1. Go to service
2. Click **"Logs"** tab
3. Filter by error/warning

**Key logs to check:**
- `🚀 N5 Reading Backend Server` (startup)
- `✅ Connected to SQLite database` (database)
- `GET /api/health 200` (requests)
- `❌ Error:` (errors)

---

## 📈 Scaling Strategy

### Phase 0-6 (MVP): 0-100 users

```
Cost: $7/month
Architecture: Monolith
Database: SQLite
Storage: Local disk (1GB)
Processing: Synchronous
```

**Sufficient for:** Initial launch, beta testing

---

### Phase 8-10: 100-500 users

```
Cost: $30-50/month
Architecture: Still monolith
Database: PostgreSQL ($7/mo)
Storage: Local → Cloudflare R2
Processing: Async (Bull + Redis, $5/mo)
Backend: Starter → Standard ($25/mo)
```

**Upgrades needed:**
- PostgreSQL for concurrent writes
- Redis for background jobs
- More disk space for videos

---

### Phase 11+: 500-2,000 users

```
Cost: $200-400/month
Architecture: Monolith + Workers
Database: PostgreSQL with read replicas
Storage: R2 (10TB) + CDN
Processing: Dedicated worker instances
Backend: 2-3 instances (horizontal scaling)
```

**Upgrades needed:**
- Multiple backend instances (load balancing)
- Database read replicas
- CDN for video delivery
- Monitoring & alerting

---

### Scale: 2,000+ users

```
Cost: $500-1,000/month
Architecture: Microservices (optional)
Database: Sharded PostgreSQL
Storage: Multi-region R2
Processing: Serverless functions
Backend: Auto-scaling (5-10 instances)
```

**Consider:**
- AWS/GCP migration
- Microservices extraction
- Advanced caching (Redis)
- Multi-region deployment

---

## 💰 Cost Breakdown

### MVP Phase (Current)

| Service | Provider | Cost | Notes |
|---------|----------|------|-------|
| Frontend | Render | FREE | Static site |
| Backend | Render | $7/mo | Starter instance |
| Database | SQLite | FREE | Included |
| Storage | Local | FREE | 1GB included |
| Domain | Optional | $12/year | Namecheap |
| **Total** | | **$7/mo** | |

### With Usage (100 users)

| Service | Provider | Cost | Notes |
|---------|----------|------|-------|
| Infrastructure | Render | $7/mo | Backend |
| OpenAI Whisper | Pay-per-use | $30/mo | ~500 videos |
| DeepL | Free tier | $0 | <500K chars |
| **Total** | | **$37/mo** | |

**Revenue (100 users, 20% paid):** 20 × $9.99 = $200/mo  
**Profit:** $163/mo (81% margin)

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Code pushed to GitHub (main branch)
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] API keys obtained (OpenAI, DeepL)
- [ ] Render account created

### Deployment

- [ ] Backend deployed on Render
- [ ] Environment variables configured
- [ ] Database seeded with N5 data
- [ ] Frontend deployed on Render
- [ ] Frontend API URL configured
- [ ] Health check passes
- [ ] Test video upload works

### Post-Deployment

- [ ] Full integration test completed
- [ ] Monitoring tools set up (Sentry, UptimeRobot)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (auto)
- [ ] Backup strategy in place
- [ ] Team notified of URLs

---

## 🚀 Alternative Deployment Options

### Option 2: Vercel + Railway

**When to use:** Want more control, better frontend performance

```bash
# Frontend: Vercel (FREE)
vercel --prod

# Backend: Railway ($5-10/month)
# Push to GitHub, connect in Railway dashboard
```

**Pros:**
- Vercel has best-in-class frontend performance
- Railway has simpler pricing

**Cons:**
- More complex setup (2 platforms)
- Need to manage CORS between platforms

---

### Option 3: AWS/GCP (Production Scale)

**When to use:** 1,000+ users, need advanced features

**AWS Stack:**
```
Frontend: S3 + CloudFront
Backend: ECS Fargate
Database: RDS PostgreSQL
Storage: S3
Queue: SQS
```

**Cost:** $50-200/month (at 1,000 users)

**Pros:**
- Infinite scalability
- Advanced features
- Better uptime SLA

**Cons:**
- More complex setup
- Higher costs
- Requires DevOps knowledge

---

## 📚 Additional Resources

### Documentation
- [Render Docs](https://render.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

### Tools
- [Render CLI](https://render.com/docs/cli)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Sentry](https://sentry.io/)
- [UptimeRobot](https://uptimerobot.com/)

---

## 🆘 Need Help?

### Common Questions

**Q: Can I deploy without a credit card?**  
A: Render's free tier requires no credit card. Starter ($7/mo) requires payment.

**Q: How do I rollback a deployment?**  
A: Render Dashboard → Service → Deploys → Click "Rollback" on previous deploy

**Q: Can I use a different platform?**  
A: Yes! Code works on any Node.js hosting (Vercel, Railway, Heroku, AWS, etc.)

**Q: What if I exceed free tier limits?**  
A: Render will notify you. Upgrade to Starter ($7/mo) before hitting limits.

---

**Last Updated:** October 19, 2025  
**Status:** Ready for Production Deployment  
**Recommended Platform:** Render.com (Starter $7/mo)

---

**🎉 Ready to Deploy? Follow the [Quick Start](#quick-start-15-minutes) above!**

**© 2025 JLPT N5 Video Coach | Deploy with Confidence**

