# 🚀 Deploy to Render.com - Quick Guide

## Prerequisites

✅ Code is ready (all Render configurations added)  
✅ GitHub repository: https://github.com/rajatpal87/N5Reading  
✅ OpenAI API key: Get from https://platform.openai.com  
✅ DeepL API key: Get from https://www.deepl.com/pro-api

---

## Step 1: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

---

## Step 2: Deploy Backend (5 minutes)

### A. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect repository: **`rajatpal87/N5Reading`**
3. Configure:
   ```
   Name:           n5reading-backend
   Region:         Oregon (US West) or closest to you
   Branch:         main
   Root Directory: backend
   Runtime:        Node
   Build Command:  npm install
   Start Command:  npm start
   ```

4. Select **Instance Type: Starter ($7/month)**

### B. Add Environment Variables

Click "Advanced" → "Add Environment Variable":

```
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
DEEPL_API_KEY=your_deepl_api_key_here
```

### C. Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your backend will be live at: `https://n5reading-backend.onrender.com`

### D. Verify Backend

```bash
# Test health endpoint
curl https://n5reading-backend.onrender.com/api/health

# Expected: {"status":"ok","message":"N5 Reading API is running",...}
```

---

## Step 3: Seed Production Database (3 minutes)

### Option A: Use Render Shell (Recommended)

1. In Render dashboard, go to your backend service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run seed
   ```

### Option B: SSH into Render

```bash
# Get shell access
render shell n5reading-backend

# Run seed
npm run seed
```

### Verify Data Loaded

```bash
curl https://n5reading-backend.onrender.com/api/test-db

# Expected: {"status":"ok","database":"SQLite","data":{"n5_vocabulary":296,"n5_grammar":50}}
```

---

## Step 4: Deploy Frontend (5 minutes)

### A. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect repository: **`rajatpal87/N5Reading`**
3. Configure:
   ```
   Name:                n5reading-frontend
   Branch:              main
   Root Directory:      frontend
   Build Command:       npm install && npm run build
   Publish Directory:   dist
   ```

### B. Add Environment Variable

Click "Advanced" → "Add Environment Variable":

```
VITE_API_URL=https://n5reading-backend.onrender.com/api
```

**⚠️ IMPORTANT:** Replace `n5reading-backend` with your actual backend URL from Step 2!

### C. Deploy!

1. Click **"Create Static Site"**
2. Wait 2-3 minutes for build
3. Your frontend will be live at: `https://n5reading-frontend.onrender.com`

---

## Step 5: Test Full Application (2 minutes)

1. **Open frontend in browser:**
   ```
   https://n5reading-frontend.onrender.com
   ```

2. **Check browser console** (F12) - no errors

3. **Test API connection** - should show React app

---

## 🎉 Success! Your App is Live!

**Frontend URL:** https://n5reading-frontend.onrender.com  
**Backend API:** https://n5reading-backend.onrender.com/api  
**Cost:** $7/month (backend only, frontend is FREE)

---

## Auto-Deploy Setup (Bonus)

Render automatically deploys when you push to `main` branch:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Pull latest code
# 3. Run build
# 4. Deploy new version
# 5. Live in 2-5 minutes!
```

---

## Common Issues & Solutions

### Issue: "Build failed"
**Solution:**
1. Check build logs in Render dashboard
2. Make sure `npm install` runs successfully locally
3. Check Node version compatibility

### Issue: "Health check failed"
**Solution:**
1. Make sure backend is listening on port 3000
2. Check `/api/health` endpoint exists
3. Verify environment variables are set

### Issue: "Database empty"
**Solution:**
```bash
# SSH into backend and run seed
render shell n5reading-backend
npm run seed
```

### Issue: "Frontend can't connect to backend"
**Solution:**
1. Check `VITE_API_URL` in frontend environment variables
2. Make sure it points to your actual backend URL
3. Rebuild frontend after changing env vars

### Issue: "CORS error"
**Solution:**
Backend already has CORS enabled for all origins. If still getting errors:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'https://n5reading-frontend.onrender.com'
}));
```

---

## Upgrade to PostgreSQL (Phase 8+)

When you're ready for production database (Phase 8+):

### 1. Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   ```
   Name: n5reading-db
   Database: n5reading
   User: n5reading
   Region: Same as backend
   Instance Type: Starter ($7/month)
   ```

3. Click **"Create Database"**

### 2. Connect Backend to PostgreSQL

1. Go to your PostgreSQL database in Render
2. Copy **"Internal Database URL"**
3. Go to your backend service → Environment
4. Add variable:
   ```
   DATABASE_URL=postgres://...
   ```

5. **Restart backend service**

### 3. Seed PostgreSQL Database

```bash
# SSH into backend
render shell n5reading-backend

# Run seed (will automatically use PostgreSQL)
npm run seed
```

### 4. Verify

```bash
curl https://n5reading-backend.onrender.com/api/test-db

# Should show: {"database":"PostgreSQL",...}
```

---

## Monitoring

### View Logs

1. Go to Render dashboard
2. Click on service (backend or frontend)
3. Click **"Logs"** tab
4. See real-time logs

### View Metrics

1. Click on service
2. Click **"Metrics"** tab
3. See CPU, memory, bandwidth usage

### Health Checks

Render automatically monitors `/api/health` endpoint. If it fails, you'll get an email alert.

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Frontend (Static Site) | FREE | $0/month |
| Backend (Web Service) | Starter | $7/month |
| PostgreSQL (Optional) | Starter | $7/month |
| Redis (Phase 2+) | Starter | $5/month |
| **Total (MVP)** | | **$7/month** |
| **Total (Production)** | | **$19/month** |

---

## Custom Domain (Optional)

### After buying domain (e.g., n5reading.com):

1. In Render dashboard, go to your Static Site
2. Click **"Settings"** → **"Custom Domain"**
3. Add: `n5reading.com` and `www.n5reading.com`
4. Render will show DNS records to add
5. Add DNS records in your domain registrar
6. Wait 5-60 minutes for propagation
7. FREE SSL certificate auto-configured!

---

## Rollback (if deployment fails)

1. Go to service in Render dashboard
2. Click **"Events"** tab
3. Find previous successful deployment
4. Click **"Rollback"**

---

## Support

- **Render Docs:** https://render.com/docs
- **Community Forum:** https://community.render.com
- **Status Page:** https://status.render.com

---

**Deployment Time:** 15-20 minutes  
**Monthly Cost:** $7 (MVP)  
**Auto-Deploy:** ✅ Enabled  
**SSL Certificate:** ✅ FREE  
**Scaling:** ✅ Easy

🎉 **Congratulations! Your app is live!**

