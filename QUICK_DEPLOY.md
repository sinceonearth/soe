# ⚡ Quick Deployment Steps

## Right Now on Replit:

### 1. Click "Publish" Button
At the top of your Replit workspace, click the **"Publish"** or **"Deploy"** button.

### 2. Choose Reserved VM
- Select **"Reserved VM"** deployment type
- This keeps your server always running (needed for authentication)

### 3. Deploy!
- Click "Deploy" 
- Wait 2-5 minutes for build to complete

### 4. Copy Your Production URL
After deployment succeeds, you'll get a URL like:
```
https://sinceonearth-api.replit.app
```

**COPY THIS URL!** You'll need it for the next steps.

---

## Then on Your Mac:

### 5. Update Capacitor Config
Edit `capacitor.config.ts` and add your production URL:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sinceonearth.app',
  appName: 'Since On Earth',
  webDir: 'dist',
  server: {
    url: 'https://YOUR-DEPLOYMENT-URL.replit.app', // ← Paste your URL here
    cleartext: false,
  },
};

export default config;
```

### 6. Build iOS App
```bash
npm install
npm run ios:prepare
```

### 7. Test & Release
- Test the app on your iPhone
- Archive and submit to App Store
- Done! 🎉

---

## Why This Order?

1. **Deploy backend first** → Get production URL
2. **Update iOS config** → Point app to production
3. **Build iOS app** → App connects to live backend
4. **Release to App Store** → Users get working app

---

## Need More Details?

See `DEPLOYMENT_GUIDE.md` for the complete guide with troubleshooting tips.

**Ready?** Click that "Publish" button now! 🚀
