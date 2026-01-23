# Railway Deployment Guide

## Prerequisites
- Railway account (railway.app)
- GitHub repository connected to Railway
- Git configured locally

## Steps to Deploy

### Option 1: GitHub Integration (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project → "Deploy from GitHub"
3. Select this repository
4. Railway will auto-detect the Dockerfile and deploy

### Option 2: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create project
railway init

# Deploy
railway up
```

## Environment Variables
Set these in Railway dashboard:
- `NODE_ENV=production`
- `PYTHONUNBUFFERED=1`
- `PYTHONIOENCODING=utf-8`
- `MAX_GENERATIONS=2` (adjust as needed)
- `MAX_TYPES=1`

## What's Included
- **Dockerfile**: Multi-stage build with all system libraries for OpenCV
- **railway.json**: Configuration for Railway deployment
- **System libs**: libgl1, libsm6, libxext6, libxrender-dev (for cv2)
- **Python deps**: All packages from requirements.txt
- **Node/Next.js**: Full Next.js build and start

## Expected Deployment Time
- First build: ~10-15 minutes (downloading PyTorch, building dependencies)
- Subsequent builds: ~3-5 minutes (cached layers)

## Verification
Once deployed, Railway will provide a public URL. Visit it and:
1. Navigate to the architecture page
2. Create a room layout
3. Click "Generate" to test the full pipeline

## Debugging
- View logs in Railway dashboard: Resources → Your App → Logs
- Check build logs for any installation errors
- Monitor stdout for Python debug output

## Notes
- OpenCV will work fully on Railway (HAS_CV2=True)
- Much faster inference than Codespace
- Can scale up/down based on demand
