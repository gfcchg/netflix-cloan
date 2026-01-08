# Netflix Clone - Firebase Authentication Setup Guide

## Overview
Your Netflix clone now includes Firebase Google Authentication. Follow these steps to set it up.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `netflix-clone` (or your preferred name)
4. Proceed through the setup wizard
5. Enable Google Analytics (optional)
6. Click **"Create project"**

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to register a web app
2. App name: `Netflix Clone Web`
3. Click **"Register app"**
4. You'll see your Firebase config object with values like:
   ```
   apiKey: "AIzaSyDmXx_..."
   authDomain: "netflix-clone-xxx.firebaseapp.com"
   projectId: "netflix-clone-xxx"
   storageBucket: "netflix-clone-xxx.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abc123def456"
   ```

## Step 3: Update Firebase Config in script.js

1. Open `script.js` in your project
2. Find the `firebaseConfig` object (around line 5-12)
3. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_ACTUAL_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

## Step 4: Enable Google Authentication in Firebase

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click on the **"Sign-in method"** tab
3. Click **"Google"** from the list
4. Toggle **"Enable"** to ON
5. You'll need to provide a **Support email** (use your email)
6. Click **"Save"**

## Step 5: Add Authorized Domains

1. Still in Authentication → Sign-in method
2. Scroll down to **"Authorized domains"**
3. Add your domain:
   - For local testing: `localhost` (already added by default)
   - For production: Add your actual domain

## Step 6: Test the Application

1. Open `index.html` in your browser
2. You should see the Netflix login screen
3. Click **"Sign In with Google"**
4. A Google login popup will appear
5. Sign in with your Google account
6. After successful login, you'll see:
   - Netflix splash screen (3.5 seconds animation)
   - Profile selection screen
   - Access to the main Netflix home screen

## Features Implemented

✅ **Login Screen** - Netflix-style login with Google authentication
✅ **Firebase Integration** - Secure Google Sign-In via Firebase
✅ **Session Persistence** - User stays logged in after refreshing
✅ **Sign Out** - Click profile avatar → Sign Out returns to login
✅ **Splash Screen** - 3.5-second Netflix intro animation after login
✅ **Profile Selection** - Choose profile after login
✅ **Auto-load** - App automatically loads profiles and movies after login

## Troubleshooting

### "Cross-Origin Request Blocked" Error
- Make sure `localhost` is in your **Authorized domains** in Firebase
- For development, run a local server (not `file://` protocol)
- Use VSCode Live Server extension or `python -m http.server`

### Google Sign-In Popup Doesn't Appear
- Check that Google is enabled in Firebase Authentication
- Verify Firebase config is correctly set in `script.js`
- Clear browser cache and try again

### User Not Staying Logged In
- Ensure cookies are enabled in your browser
- Check browser console for any error messages
- Verify Firebase config credentials are correct

### "signInWithPopup is not a function" Error
- Make sure Firebase CDN scripts are loaded in index.html
- Check that the imports are correct in script.js
- Verify you're using Firebase v10.7.0 (as specified in CDN links)

## File Structure

```
netflix/
├── index.html          (Login screen + all screens)
├── script.js           (Firebase + authentication logic)
├── style.css           (Styling including login screen)
├── data.json           (User profiles data)
├── FIREBASE_SETUP.md   (This file)
```

## Next Steps

After setting up Firebase:

1. Customize the login screen with your own Netflix image
2. Update the profile data in `data.json`
3. Consider adding:
   - User profile persistence to Firebase Firestore
   - Watch history tracking
   - Personalized recommendations
   - Dark mode toggle

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Console Help](https://firebase.google.com/support)

---

**Your Netflix clone is now ready with Firebase authentication! 🎬🔐**
