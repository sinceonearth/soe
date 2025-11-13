# 📱 iOS Release Guide - Since On Earth

This guide will help you build and release your app to the App Store using Capacitor and Xcode.

## Prerequisites

✅ You need:
- A Mac with Xcode installed
- Apple Developer Account ($99/year)
- CocoaPods installed (`sudo gem install cocoapods`)

## Step 1: Build Your Web App for Production

First, build your optimized production web bundle:

```bash
npm run build
```

This creates a production build in the `dist` folder.

## Step 2: Sync Capacitor with iOS

After building, sync your web assets with the iOS project:

```bash
npx cap sync ios
```

This will:
- Copy your web build to the iOS project
- Update iOS dependencies
- Install any new Capacitor plugins

## Step 3: Open in Xcode

Open the iOS project in Xcode:

```bash
npx cap open ios
```

This will launch Xcode with your iOS project.

## Step 4: Configure Your App in Xcode

### A. Set Your Team & Signing

1. In Xcode, select your project in the navigator (left panel)
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Select your Apple Developer Team from the dropdown
5. Xcode will automatically manage signing certificates

### B. Update App Information

1. Still in the project settings, go to the "General" tab
2. Update:
   - **Display Name**: "Since On Earth"
   - **Bundle Identifier**: `com.sinceonearth.app`
   - **Version**: 1.0.0
   - **Build**: 1

### C. Add App Icons & Launch Screen

1. In the left navigator, find `App/Assets.xcassets`
2. Click on "AppIcon"
3. Drag your app icons into the appropriate slots (you need various sizes)
4. For Launch Screen, customize `App/Base.lproj/LaunchScreen.storyboard`

**Icon Sizes Needed:**
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro @2x)
- 152x152 (iPad @2x)
- 76x76 (iPad)

### D. Configure Info.plist

Add required permissions if your app uses:
- **Camera**: Add "Privacy - Camera Usage Description"
- **Location**: Add "Privacy - Location When In Use Usage Description"
- **Photos**: Add "Privacy - Photo Library Usage Description"

1. Find `App/Info.plist` in the left navigator
2. Right-click and select "Open As" → "Source Code"
3. Add permissions like this:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan flight tickets</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to save flight images</string>
```

## Step 5: Test on Your iPhone

### Connect Your iPhone:
1. Connect your iPhone to your Mac via USB
2. Unlock your iPhone and trust the computer
3. In Xcode, select your iPhone from the device dropdown (top toolbar)
4. Click the "Play" button (▶) to build and run on your device

### First Time Setup:
1. On your iPhone, go to Settings → General → VPN & Device Management
2. Trust your developer certificate

## Step 6: Archive for App Store

### A. Select "Any iOS Device (arm64)"

In Xcode's device dropdown, select "Any iOS Device (arm64)" instead of a specific device or simulator.

### B. Create Archive

1. In Xcode menu: **Product** → **Archive**
2. Wait for the build to complete (this can take several minutes)
3. The Organizer window will open when done

### C. Distribute to App Store

1. In the Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Next**
5. Select **Upload** (not Export)
6. Follow the prompts:
   - Select your signing certificate
   - Review the app information
   - Click **Upload**

## Step 7: Complete App Store Connect Setup

### A. Create App Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: "Since On Earth"
   - **Primary Language**: English
   - **Bundle ID**: Select `com.sinceonearth.app`
   - **SKU**: `sinceonearth-001` (or any unique identifier)
   - **User Access**: Full Access

### B. Add App Information

1. **App Privacy**: Answer questions about data collection
2. **Categories**: 
   - Primary: Travel
   - Secondary: Lifestyle
3. **App Screenshots**:
   - You need screenshots for:
     - 6.7" Display (iPhone 14 Pro Max, etc.)
     - 5.5" Display (iPhone 8 Plus, etc.)
   - Take screenshots using the iOS Simulator in Xcode
4. **Description**: Write compelling app description
5. **Keywords**: travel, flight tracker, globe, adventures, trips
6. **Support URL**: Your website
7. **Marketing URL**: Optional

### C. Submit for Review

1. Select your uploaded build in the "Build" section
2. Fill in the "Version Information"
3. Set your pricing (Free or Paid)
4. Answer the Export Compliance questions:
   - For most apps: "No" unless you use strong encryption
5. Click **Submit for Review**

## Step 8: Wait for Review

- **Review Time**: Usually 24-48 hours
- You'll receive emails about the review status
- If rejected, address the issues and resubmit

## Quick Commands Reference

```bash
# Build production web app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Update Capacitor dependencies
npm install @capacitor/core@latest @capacitor/ios@latest
npx cap sync ios
```

## Troubleshooting

### Build Errors in Xcode

1. Clean build folder: **Product** → **Clean Build Folder** (⇧⌘K)
2. Delete DerivedData: Close Xcode, delete `~/Library/Developer/Xcode/DerivedData`
3. Reinstall pods:
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

### "No signing certificate" error

1. In Xcode, go to Preferences → Accounts
2. Add your Apple ID
3. Click "Download Manual Profiles"

### Build succeeds but app crashes

1. Check Console.app on your Mac for crash logs
2. Make sure all API endpoints are using HTTPS (not HTTP)
3. Check that all required permissions are in Info.plist

## Production Checklist

Before submitting to App Store:

- [ ] Test on real device, not just simulator
- [ ] All features work without errors
- [ ] App icons set in all required sizes
- [ ] Launch screen configured
- [ ] Privacy policy URL added to App Store Connect
- [ ] Support URL is working
- [ ] App description is clear and accurate
- [ ] Screenshots showcase key features
- [ ] Version and build numbers are correct
- [ ] All API calls use HTTPS
- [ ] Test login/logout flow
- [ ] Test with no internet connection (show appropriate errors)

## Updates & New Versions

When you need to release an update:

1. Update version in `package.json`
2. Build: `npm run build`
3. Sync: `npx cap sync ios`
4. Open Xcode: `npx cap open ios`
5. Increment build number in Xcode
6. Archive and upload to App Store Connect
7. Create new version in App Store Connect
8. Submit for review

---

## Need Help?

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

Good luck with your iOS release! 🚀
