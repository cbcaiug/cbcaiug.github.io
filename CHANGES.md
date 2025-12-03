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
- [ ] Create Firebase project
- [ ] Enable Authentication providers
- [ ] Create Firestore database
- [ ] Configure security rules
- [ ] Get Firebase config credentials

### Phase 3: Code Changes
**Files to be modified:**
- `app.html` - Add Firebase SDK scripts
- `js/services/api.js` - Add Firebase config and auth functions
- `js/components/App.js` - Replace localStorage quota logic with Firestore
- `js/components/auth.js` (NEW) - Firebase authentication UI and logic

**Files to be created:**
- `js/services/firebase.js` (NEW) - Firebase initialization and helpers
- `js/components/AuthModal.js` (NEW) - Sign-in/Sign-up UI component

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
**Lines to add** (before closing `</body>`):
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
```

### 2. js/services/firebase.js (NEW FILE)
**Purpose**: Initialize Firebase and provide auth/firestore helpers
**Key functions**:
- `initializeFirebase(config)` - Setup Firebase
- `getCurrentUser()` - Get current auth user
- `getUserQuotas(uid)` - Fetch user quotas from Firestore
- `decrementQuota(uid, type)` - Decrement download/message count

### 3. js/components/AuthModal.js (NEW FILE)
**Purpose**: Sign-in/Sign-up UI
**Features**:
- Email/password form
- Google sign-in button
- Anonymous sign-in option
- Upgrade anonymous to email

### 4. js/components/App.js
**Changes**:
- Replace `usageCount` state with Firestore-backed quota
- Add auth state listener
- Check quotas before downloads/messages
- Show AuthModal when user not signed in

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
