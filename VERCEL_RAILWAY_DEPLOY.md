# Vercel + Railway Deployment Guide

## Architecture
```
Vercel (Next.js Frontend) ↔ API Call ↔ Railway (Python Backend)
```

## Step 1: Deploy Python Backend to Railway

### 1a. Create Railway project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your FYP-AI-ARCH repository
4. Railway will auto-detect the Dockerfile
5. Wait for build to complete (~10-15 min for first build)

### 1b. Get Railway URL
1. In Railway dashboard, go to your project
2. Click on the deployment
3. Go to "Settings" → "Domains"
4. Copy the public URL (e.g., `https://your-app.up.railway.app`)

## Step 2: Deploy Next.js Frontend to Vercel

### 2a. Create Vercel project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import your FYP-AI-ARCH repository
3. Vercel will auto-detect it's a Next.js project
4. Configure environment variables (see below)
5. Deploy!

### 2b. Set Environment Variables in Vercel
In your Vercel project settings, add:
```
RAILWAY_BACKEND_URL=https://your-app.up.railway.app
```

Replace `your-app` with your actual Railway project name.

## Step 3: Update Code for Remote Backend

The bridge now automatically:
- ✅ Detects if running in Vercel (`process.env.VERCEL === '1'`)
- ✅ Uses Railway backend if `RAILWAY_BACKEND_URL` is set
- ✅ Falls back to local Python if neither are available

**No code changes needed!** Just set the environment variable.

## Verification

1. Visit your Vercel URL
2. Navigate to the architecture page
3. Create a floor plan
4. Click "Generate"
5. It should call the Railway backend and display the SVG

## Expected Behavior
- ✅ First request: ~5-8 seconds (model loading on Railway)
- ✅ Subsequent requests: ~4-6 seconds (model cached)
- ✅ Full accuracy with OpenCV support on Railway
- ✅ Instant frontend with Vercel optimization

## Troubleshooting

### "Remote backend unreachable"
- Check RAILWAY_BACKEND_URL is set correctly in Vercel
- Verify Railway deployment is running (check Railway logs)
- Make sure the URL is public (not localhost)

### "502 Bad Gateway" from Railway
- Check Railway logs for Python errors
- Restart Railway deployment
- Increase Railway memory if needed

### Request timeout
- Railway model loading can take 5-10s on first request
- Vercel timeout is 60s (Pro plan can extend to 300s)
- Should be fine with default limits

## Deployment Checklist
- [ ] Railway project created and deployed
- [ ] Railway public URL obtained
- [ ] Vercel project created
- [ ] RAILWAY_BACKEND_URL set in Vercel env vars
- [ ] Vercel deployment triggered
- [ ] Test generation works on Vercel

## Cost Estimate
- **Railway**: ~$5-10/month (with free tier up to certain compute)
- **Vercel**: Free tier includes unlimited requests
