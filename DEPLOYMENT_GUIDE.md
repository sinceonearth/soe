# 🚀 Deployment Guide - Since On Earth

## Overview

Your app has two parts:
1. **Backend API** (Express server) - Must be deployed on Replit
2. **iOS App** (Capacitor) - Will connect to the deployed backend

## Step 1: Deploy Backend on Replit

### A. Click the "Publish" Button

1. At the top of your Replit workspace, click **"Publish"** (or "Deploy")
2. Replit will show you deployment options

### B. Choose Deployment Type

**Recommended: Reserved VM**
- Your app needs to maintain sessions and WebSocket connections
- Reserved VM keeps your server always running
- Best for apps with authentication and real-time features

**Cost**: ~$20-40/month depending on traffic

### C. Configure Deployment

1. **Deployment Name**: sinceonearth-api (or your preferred name)
2. **Build Command**: Already configured ✅ (`npm run build`)
3. **Run Command**: Already configured ✅ (`npm run start`)
4. **Environment Variables**: Will be copied from development ✅

### D. Deploy!

Click **"Deploy"** and wait for the build to complete (~2-5 minutes)

### E. Get Your Production URL

After deployment, you'll get a URL like:
```
https://sinceonearth-api.replit.app
```

**SAVE THIS URL** - You'll need it for the iOS app!

## Step 2: Update Database for Production

Your Replit PostgreSQL database is already set up and will work in production automatically!

### Verify Database Connection

After deployment, check the deployment logs to ensure:
- ✅ Database connection successful
- ✅ Server running on port 5000
- ✅ No errors in startup

## Step 3: Update iOS App Configuration

Once you have your production URL, update the Capacitor config:

### A. Edit `capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sinceonearth.app',
  appName: 'Since On Earth',
  webDir: 'dist',
  server: {
    url: 'https://YOUR-DEPLOYMENT-URL.replit.app', // ← Add this!
    cleartext: false,
  },
};

export default config;
```

Replace `YOUR-DEPLOYMENT-URL` with your actual Replit deployment URL.

### B. What This Does

- Your iOS app will load the web content from the production server
- All API calls will go to the production backend
- Users will always get the latest version

## Step 4: Test Production API

Before building iOS app, test your production API:

```bash
# Test health endpoint
curl https://YOUR-DEPLOYMENT-URL.replit.app/api/health

# Test login (should return 401 if not logged in)
curl https://YOUR-DEPLOYMENT-URL.replit.app/api/auth/user
```

## Step 5: Build iOS App

Now you can build your iOS app! On your Mac:

```bash
# 1. Install dependencies
npm install

# 2. Build web app (will use production API)
npm run build:web

# 3. Sync with iOS
npm run cap:sync:ios

# 4. Open in Xcode
npm run cap:open:ios
```

## Deployment Checklist

Before deploying to Replit:
- [x] Database schema is up to date (`npm run db:push`)
- [x] All environment variables are set
- [x] Build and run commands are configured
- [ ] Test locally one more time

After deploying to Replit:
- [ ] Verify deployment URL works
- [ ] Test login/logout flow
- [ ] Test API endpoints
- [ ] Update `capacitor.config.ts` with production URL
- [ ] Build iOS app with production config

## Important Notes

### Environment Variables

Your deployment will automatically copy these from development:
- `DATABASE_URL` - Your Replit PostgreSQL database
- `SESSION_SECRET` - For session management
- `JWT_SECRET` - For authentication tokens

### HTTPS is Required

- ✅ Replit deployments automatically use HTTPS
- ✅ iOS requires HTTPS for all API calls (App Transport Security)
- ✅ Your deployed URL will be `https://...`

### Database is Production-Ready

- ✅ Your Replit PostgreSQL database works in both dev and production
- ✅ All your imported data is already there
- ✅ No additional database setup needed

### CORS is Configured

Your app already allows requests from any origin (configured in `server/index.ts`):
```typescript
app.use(cors({ origin: true, credentials: true }));
```

This means your iOS app can connect to the API without CORS issues.

## Monitoring & Updates

### View Deployment Logs

In Replit:
1. Go to the "Deployments" tab
2. Click on your active deployment
3. View real-time logs

### Update Your Deployment

When you make changes:
1. Commit your changes in Replit
2. Go to Deployments tab
3. Click "Redeploy" to push the latest version

### Rolling Back

If something breaks:
1. Go to Deployments tab
2. Click on a previous successful deployment
3. Click "Promote to Production"

## Cost Breakdown

### Replit Deployment
- **Reserved VM**: ~$20-40/month
- **Database**: Included with Replit subscription
- **SSL Certificate**: FREE (automatic)

### Total Monthly Cost
- **Replit**: ~$20-40/month
- **Apple Developer**: $99/year ($8.25/month)
- **Total**: ~$30-50/month

## Troubleshooting

### "Cannot connect to database"
- Check that `DATABASE_URL` is set in deployment settings
- Verify database is active in Replit

### "CORS error" from iOS app
- Make sure your API has `cors` middleware enabled
- Check server logs for the actual error

### "404 Not Found" errors
- Verify your production URL is correct
- Check that the build completed successfully
- Look at deployment logs for errors

### App works in development but not production
- Clear iOS app data and reinstall
- Check that `capacitor.config.ts` has the correct production URL
- Verify API endpoints are accessible from outside Replit

## Next Steps

After successful deployment:
1. ✅ Your backend is live and accessible
2. ✅ Update iOS app to use production URL
3. ✅ Build and test iOS app on your Mac
4. ✅ Submit to App Store

---

**Ready to deploy?** Click the "Publish" button at the top of your Replit workspace! 🚀
