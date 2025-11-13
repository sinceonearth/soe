# 🚀 iOS Quick Start - Since On Earth

## What You Need

- **A Mac** (MacBook, iMac, Mac Mini, etc.)
- **Xcode** installed from the Mac App Store
- **Apple Developer Account** ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- **CocoaPods** - Install: `sudo gem install cocoapods`

## Step-by-Step Process

### On Replit (or before moving to Mac):

1. ✅ Your Capacitor is already configured
2. ✅ iOS project folder exists (`/ios`)
3. ✅ App is configured: `com.sinceonearth.app`

### On Your Mac:

1. **Download/Clone this project** to your Mac

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build and prepare for iOS:**
   ```bash
   npm run ios:prepare
   ```
   This will:
   - Build your web app
   - Sync with iOS project  
   - Open Xcode automatically

4. **In Xcode:**
   - Select your Apple Developer Team
   - Connect your iPhone and select it as the device
   - Click the Play button ▶ to test on your iPhone

5. **To release to App Store:**
   - In Xcode, select "Any iOS Device (arm64)"
   - Go to **Product** → **Archive**
   - Click **Distribute App** → **App Store Connect**
   - Upload your build

6. **In App Store Connect:**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Create your app listing
   - Add screenshots and description
   - Submit for review

## Useful Commands (Run on Mac)

```bash
# Build web app only
npm run build:web

# Sync with iOS project
npm run cap:sync:ios

# Open Xcode
npm run cap:open:ios

# Do everything at once
npm run ios:prepare
```

## Important Files

- `capacitor.config.ts` - Capacitor configuration
- `ios/App/` - Your iOS project
- `IOS_RELEASE_GUIDE.md` - Detailed step-by-step guide
- `client/` - Your web app source code

## App Store Requirements

Before submitting, you need:

- [ ] App icons (1024x1024, 180x180, 120x120, etc.)
- [ ] iPhone screenshots (6.7" and 5.5" displays)
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Support email/URL
- [ ] Test on a real iPhone (not just simulator)

## Timeline

- **First Build on Mac**: ~30 minutes
- **Archive & Upload**: ~15 minutes
- **App Store Review**: 24-48 hours
- **Total Time to Launch**: 2-3 days

## Cost

- **Apple Developer Account**: $99/year
- **Everything else**: FREE!

## Need Help?

Check out `IOS_RELEASE_GUIDE.md` for the complete detailed guide with screenshots and troubleshooting.

---

**Ready?** Download this project to your Mac and run `npm run ios:prepare`! 🎉
