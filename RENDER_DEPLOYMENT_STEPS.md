# 🚀 Render.com Deployment - Complete Guide

## ⏱️ Estimated Time: 15-20 minutes

---

## 📋 **STEP 1: Push Your Code to GitHub**

### Open Terminal and run:

```bash
cd /Users/rajatpal/N5Reading

# Stage all changes
git add .

# Commit with message
git commit -m "Deploy: Add Phase 5 complete + consolidated docs"

# Push to GitHub
git push origin main
```

**✅ Verify:** Visit https://github.com/rajatpal87/N5Reading and confirm your latest changes are there.

---

## 📋 **STEP 2: Sign Up / Login to Render**

1. Go to: **https://render.com**
2. Click **"Get Started"** or **"Sign In"**
3. **Sign in with GitHub** (recommended)
4. Authorize Render to access your GitHub repositories

**✅ You should now see the Render Dashboard**

---

## 📋 **STEP 3: Deploy Backend (Web Service)**

### 3.1 Create New Web Service

1. On Render Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"** → **"Next"**

### 3.2 Connect Your Repository

1. Find and select: **`rajatpal87/N5Reading`**
2. Click **"Connect"**

### 3.3 Configure Backend Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `n5reading-backend` |
| **Region** | `Oregon (US West)` (or closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **FREE** or **Starter ($7/mo)** |

### 3.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=[paste your OpenAI key]
DEEPL_API_KEY=[paste your DeepL key]
```

**Important:** Replace `[paste your OpenAI key]` with your actual API keys!

### 3.5 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. You'll see logs scrolling - this is normal
4. Look for: **"✅ Your service is live 🎉"**

### 3.6 Get Your Backend URL

Once deployed, you'll see a URL like:
```
https://n5reading-backend.onrender.com
```

**✅ Test it:** Visit `https://n5reading-backend.onrender.com/api/health`
- You should see: `{"status":"ok","database":"connected"}`

**⚠️ IMPORTANT:** Copy this URL - you'll need it for the frontend!

---

## 📋 **STEP 4: Deploy Frontend (Static Site)**

### 4.1 Create New Static Site

1. On Render Dashboard, click **"New +"** again
2. Select **"Static Site"**
3. Click **"Build and deploy from a Git repository"** → **"Next"**

### 4.2 Connect Repository (Again)

1. Select: **`rajatpal87/N5Reading`**
2. Click **"Connect"**

### 4.3 Configure Frontend Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `n5reading-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 4.4 Add Environment Variable

Click **"Advanced"** → **"Add Environment Variable"**

Add this ONE variable:

```
VITE_API_URL=https://n5reading-backend.onrender.com/api
```

**⚠️ REPLACE** `n5reading-backend.onrender.com` with YOUR actual backend URL from Step 3.6!

### 4.5 Deploy

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build
3. Look for: **"✅ Your site is live 🎉"**

### 4.6 Get Your Frontend URL

Once deployed, you'll see a URL like:
```
https://n5reading-frontend.onrender.com
```

**✅ Test it:** Visit the URL - you should see your N5 Reading app!

---

## 📋 **STEP 5: Configure CORS (Backend)**

**Why?** So your frontend can talk to your backend.

### 5.1 Update Backend Environment Variable

1. Go to your **backend service** on Render dashboard
2. Click **"Environment"** in left sidebar
3. Click **"Add Environment Variable"**
4. Add:

```
FRONTEND_URL=https://n5reading-frontend.onrender.com
```

**⚠️ REPLACE** with YOUR actual frontend URL from Step 4.6!

### 5.2 Redeploy Backend

1. Render will auto-redeploy after adding the variable
2. Wait 2-3 minutes
3. Look for: **"✅ Your service is live 🎉"**

---

## 🎉 **STEP 6: Test Your App!**

### Visit Your Frontend URL:
```
https://n5reading-frontend.onrender.com
```

### Test These Features:

1. **✅ Upload a Video**
   - Try uploading a small MP4 file
   - Should show in the video list

2. **✅ Download YouTube Video**
   - Try: `https://www.youtube.com/watch?v=YOUR_VIDEO`
   - Should download and appear in list

3. **✅ Extract Audio**
   - Click "Extract Audio" on a video
   - Should show progress and complete

4. **✅ Transcribe & Translate**
   - Click "Transcribe & Translate"
   - Wait 2-5 minutes (this is slow)
   - Should complete successfully

5. **✅ View Dashboard**
   - Click "View Analysis" on processed video
   - Should show N5 vocabulary and grammar

---

## ⚠️ **COMMON ISSUES & FIXES**

### Issue 1: Backend shows "Application Error"
**Fix:** Check backend logs on Render dashboard
- Look for missing environment variables
- Verify API keys are correct

### Issue 2: Frontend can't connect to backend
**Fix:** Check CORS configuration
- Verify `FRONTEND_URL` is set correctly in backend
- Verify `VITE_API_URL` is set correctly in frontend

### Issue 3: Video upload fails
**Fix:** Check file size
- Render free tier has 100MB request limit
- Videos should be < 100MB

### Issue 4: Transcription fails
**Fix:** Check OpenAI API key
- Verify key is valid and has credits
- Check OpenAI account usage limits

### Issue 5: "App is sleeping" message (Free Tier)
**Expected behavior:**
- Free tier sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake up
- Upgrade to Starter ($7/mo) to stay always-on

---

## 💰 **COST BREAKDOWN**

### Free Tier (Testing Only)
- **Backend:** FREE (sleeps after 15 min)
- **Frontend:** FREE (always on)
- **Total:** $0/month
- **Good for:** Solo testing, demos

### Starter Tier (Production Ready)
- **Backend:** $7/month (always on)
- **Frontend:** FREE (always on)
- **Total:** $7/month
- **Good for:** Real users, beta launch

---

## 🔄 **FUTURE UPDATES**

### To Deploy New Changes:

```bash
# 1. Make your code changes
# 2. Commit and push
git add .
git commit -m "Your update message"
git push origin main

# 3. Render auto-deploys!
# (No manual action needed)
```

Render will automatically:
- Detect the push
- Rebuild backend and frontend
- Deploy new versions
- Takes 5-10 minutes

---

## 📊 **MONITORING YOUR APP**

### Check Logs:

1. **Backend Logs:**
   - Go to backend service on Render
   - Click "Logs" tab
   - See real-time server logs

2. **Frontend Build Logs:**
   - Go to frontend service on Render
   - Click "Logs" tab
   - See build output

### Check Metrics:

1. Click **"Metrics"** tab on each service
2. See:
   - Request count
   - Response times
   - Memory usage
   - CPU usage

---

## 🎓 **NEXT STEPS**

### After Successful Deployment:

1. **✅ Share with friends/testers**
   - Send them your frontend URL
   - Get feedback!

2. **✅ Monitor usage**
   - Check Render metrics
   - Watch for errors in logs

3. **✅ Consider upgrade**
   - If > 5 active users → Upgrade to Starter
   - If free tier limits hit → Upgrade

4. **✅ Add custom domain (optional)**
   - Go to frontend service settings
   - Click "Custom Domain"
   - Add your own domain (e.g., n5reading.com)

5. **✅ Set up error monitoring (Phase 6+)**
   - Add Sentry for error tracking
   - Set up email alerts

---

## 🆘 **NEED HELP?**

### Resources:
- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Your Project Docs:** See `CONSOLIDATED_DEPLOYMENT.md`

### Can't solve an issue?
1. Check backend logs on Render
2. Check frontend build logs on Render
3. Check your browser console (F12)
4. Review environment variables

---

## ✨ **CONGRATULATIONS!**

Your N5 Reading Platform is now LIVE! 🎉

**Share your app:**
- Frontend: `https://n5reading-frontend.onrender.com`
- Show it to friends learning Japanese!
- Add it to your portfolio!

**You've built and deployed:**
- ✅ Video upload system
- ✅ YouTube integration
- ✅ Audio extraction
- ✅ AI transcription (Whisper)
- ✅ AI translation (DeepL)
- ✅ N5 vocabulary detection
- ✅ N5 grammar analysis
- ✅ Interactive learning dashboard
- ✅ Full-stack web application

🚀 **Amazing work!** 🚀

