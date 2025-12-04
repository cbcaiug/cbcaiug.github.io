# Firebase Authentication Implementation - Change Log

**Branch**: `auth-firebase`  
**Started**: 2025-01-XX  
**Status**: In Progress

---

## Overview
Adding Firebase Authentication to replace localStorage-based quota tracking. This will persist user quotas (downloads: 20, messages: 50) across devices and browsers.

**Auth Methods**: Email/Password + Google Sign-In + Anonymous

---

## Changes Made

### Phase 1: Setup & Branch Creation
- ✅ Created branch `auth-firebase`
- ✅ Created this tracking file `CHANGES.md`

### Phase 2: Firebase Console Setup (Manual Steps)
- ✅ Create Firebase project (cbcaiug-auth)
- ✅ Enable Authentication providers (Email, Google, Anonymous)
- ✅ Create Firestore database (europe-west1)
- ✅ Configure security rules
- ✅ Get Firebase config credentials

### Phase 3: Code Changes
**Files modified:**
- ✅ `app.html` - Added Firebase SDK scripts (lines 108-110)
- ✅ `js/components/App.js` - Replaced localStorage with Firestore quotas

**Files created:**
- ✅ `js/services/firebase.js` - Firebase initialization and quota functions
- ✅ `js/components/AuthModal.js` - Sign-in/Sign-up UI component

### Phase 4: Testing
- [ ] Test on PC browser (localhost)
- [ ] Test on phone via network
- [ ] Verify quota persistence across browsers
- [ ] Test anonymous → email upgrade flow

### Phase 5: Deployment
- [ ] Review all changes
- [ ] Merge to main
- [ ] Push to GitHub Pages

---

## Rollback Instructions

If you need to revert these changes:

```bash
# Switch back to main branch
git checkout main

# Delete the auth-firebase branch (if needed)
git branch -D auth-firebase
```

Your original code will be untouched on the `main` branch.

---

## Detailed File Changes

### 1. app.html
**Lines added** (line 108, before application scripts):
```html
<!-- Firebase SDK (compat version) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- New service and component -->
<script type="text/babel" src="js/services/firebase.js" defer></script>
<script type="text/babel" src="js/components/AuthModal.js" defer></script>
```

### 2. js/services/firebase.js (NEW FILE) ✅
**Purpose**: Initialize Firebase and provide auth/firestore helpers
**Key functions**:
- `firebase.initializeApp(config)` - Setup Firebase with user's config
- `getUserQuotas(uid)` - Fetch user quotas from Firestore (creates if new user)
- `decrementQuota(uid, type)` - Decrement download/message count (transaction-safe)
**Exports**: `window.FirebaseService` for use in App.js

### 3. js/components/AuthModal.js (NEW FILE) ✅
**Purpose**: Sign-in/Sign-up UI
**Features**:
- Email/password form with validation
- Google sign-in button (one-click)
- Anonymous sign-in option (guest mode)
- Toggle between sign-in and sign-up modes
- Error handling and loading states

### 4. js/components/App.js ✅
**Changes made**:
- Added Firebase auth state listener (line ~500)
- Added `user`, `quotas`, `showAuthModal` state variables
- Modified `handleDocxDownload` to check Firebase auth and quotas
- Replaced localStorage quota decrement with Firestore transaction
- Added AuthModal component to render tree

---

## Notes
- Firebase Spark (free) plan limits: 50K reads/day, 20K writes/day
- No inactivity pausing (unlike Supabase)
- Security rules prevent users from cheating quotas
- Anonymous users can upgrade to email later

---

## Current Status
**Last Updated**: 2025-01-XX  
**Next Step**: Waiting for user approval to proceed with Firebase Console setup
