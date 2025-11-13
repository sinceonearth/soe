# 🎯 Xcode Simulator & Distribution Guide

## Prerequisites

Before you start, make sure you have:
- ✅ A Mac with Xcode installed
- ✅ Latest code downloaded to your Mac
- ✅ CocoaPods installed: `sudo gem install cocoapods`

---

## Part 1: Running in Xcode Simulator

### Step 1: Prepare Your iOS Project

On your Mac, open Terminal and navigate to your project folder:

```bash
cd /path/to/your/project
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build & Sync

```bash
npm run build:web
npx cap sync ios
```

This will:
- Build your web app for production
- Copy it to the iOS project
- Update dependencies

### Step 4: Open in Xcode

```bash
npx cap open ios
```

Xcode will launch with your iOS project.

### Step 5: Select a Simulator

1. In Xcode's top toolbar, click the device dropdown (next to the play button)
2. Select a simulator, like:
   - **iPhone 15 Pro** (recommended)
   - **iPhone 14**
   - **iPad Pro**

### Step 6: Run the Simulator

1. Click the **Play button (▶)** in the top-left corner
2. Wait for the simulator to boot up
3. Your app will install and launch automatically!

### Step 7: Test Your App

The simulator will show your app. You can:
- Click around to test features
- Use Command+Shift+H to go home
- Use the simulator's camera (it shows a test pattern)
- Test different screen sizes by changing simulators

---

## Part 2: Distribution to App Store

### Step 1: Configure Your Team

1. In Xcode, click on your project name in the left sidebar
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Select your Apple Developer Team from the dropdown
   - If you don't see it, go to Xcode → Settings → Accounts and add your Apple ID

### Step 2: Update App Information

1. Still in the project settings, go to **General** tab
2. Verify these settings:
   - **Display Name**: Since On Earth
   - **Bundle Identifier**: com.sinceonearth.app
   - **Version**: 1.0 (or your current version)
   - **Build**: 1 (increment this for each upload)

### Step 3: Select "Any iOS Device"

1. In the device dropdown at the top, select **Any iOS Device (arm64)**
2. DO NOT select a simulator or specific device

### Step 4: Archive Your App

1. In Xcode menu bar, click **Product** → **Archive**
2. Wait for the build to complete (this takes 5-10 minutes)
3. The Organizer window will open automatically when done

### Step 5: Distribute to App Store

1. In the Organizer window, your archive should be selected
2. Click the **Distribute App** button on the right
3. Select **App Store Connect**
4. Click **Next**
5. Select **Upload** (not Export)
6. Click **Next** through the following screens:
   - App Store Connect distribution options
   - Re-sign options
   - Review content
7. Click **Upload**
8. Wait for the upload to complete

### Step 6: Complete App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Log in with your Apple Developer account
3. Click **My Apps**
4. If this is your first submission:
   - Click **+** → **New App**
   - Fill in:
     - Platform: iOS
     - Name: Since On Earth
     - Primary Language: English
     - Bundle ID: com.sinceonearth.app
     - SKU: sinceonearth001
   - Click **Create**

### Step 7: Add Build to Your App

1. In your app page, scroll to **Build**
2. Click **+ (Add Build)**
3. Select the build you just uploaded
4. Click **Done**

### Step 8: Fill In App Information

You need to provide:

**App Information:**
- App Name: Since On Earth
- Subtitle: Track your adventures
- Privacy Policy URL: (your website)
- Category: Travel

**Pricing:**
- Price: Free (or set your price)

**App Privacy:**
- Answer questions about data collection

**Screenshots:**
- 6.7" Display (iPhone 14 Pro Max): At least 1 screenshot
- 5.5" Display (iPhone 8 Plus): At least 1 screenshot

To capture screenshots:
1. Run app in simulator (iPhone 14 Pro Max for 6.7")
2. Command+S to save screenshot
3. Repeat for iPhone 8 Plus simulator

**Description:**
Write a compelling description of your app

**Keywords:**
travel, globe, flight tracker, adventures, journey

**Support URL:**
Your website or support email

### Step 9: Submit for Review

1. Once everything is filled in, click **Add for Review**
2. Answer the Export Compliance questions:
   - "Does your app use encryption?" → Usually **No** for most apps
3. Click **Submit to App Review**

### Step 10: Wait for Apple Review

- Review typically takes **24-48 hours**
- You'll receive email updates about the status
- If approved, your app goes live!
- If rejected, read the feedback, fix issues, and resubmit

---

## Quick Commands Summary

```bash
# Complete flow:
npm install
npm run build:web
npx cap sync ios
npx cap open ios

# Just rebuild and sync:
npm run build:web
npx cap sync ios

# Just open Xcode:
npx cap open ios
```

---

## Troubleshooting

### "No account for team" error
1. Xcode → Settings → Accounts
2. Add your Apple ID
3. Download profiles

### Build fails in Xcode
1. Product → Clean Build Folder (Shift+Cmd+K)
2. Close Xcode
3. Delete `~/Library/Developer/Xcode/DerivedData`
4. Reopen and try again

### App crashes on launch
1. Check Console.app for crash logs
2. Make sure API URL uses HTTPS
3. Check Info.plist has all required permissions

### Can't upload to App Store
1. Make sure you selected "Any iOS Device (arm64)"
2. Verify your Apple Developer membership is active
3. Check Bundle ID matches exactly in both Xcode and App Store Connect

---

## Tips

✅ **Test on real device before submitting** - Simulators don't catch everything

✅ **Increment build number** - Each upload needs a unique build number

✅ **Use TestFlight** - Upload to TestFlight first to test with real users before going live

✅ **Keep notes** - Document any issues you encounter for future releases

---

## Next Steps After Approval

Once your app is approved:
1. It will go live on the App Store automatically (or on your chosen release date)
2. Monitor reviews and ratings
3. Fix bugs and release updates regularly
4. Celebrate! 🎉

Good luck with your iOS launch! 🚀
