# Firebase Authentication - Testing Guide

## ✅ Implementation Complete!

All code files have been created and integrated. Now it's time to test locally before deploying.

---

## Step 1: Start Local Server

### Option A: Using http-server (Recommended)
```bash
# Navigate to project folder
cd /home/derrickmusamali/cbcaiug/cbcaiug.github.io

# Start server on port 8080
http-server -p 8080
```

### Option B: Using Python (if http-server not installed)
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**You'll see output like**:
```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.1.105:8080  <-- Use this IP for phone testing
```

**Copy the 192.168.x.x IP** - you'll need it for phone testing.

---

## Step 2: Test on PC Browser

### Open the App
1. Open browser (Chrome/Firefox recommended)
2. Go to: `http://localhost:8080/app.html`
3. Open browser console (F12) to see any errors

### Test Checklist

#### Test 1: Anonymous Sign-In (Guest Mode)
1. Click any assistant (e.g., "Coteacher")
2. Try to download a document (click save/download button)
3. **Expected**: Auth modal appears
4. Click **"Continue as Guest"**
5. **Expected**: Modal closes, you're signed in
6. Try download again
7. **Expected**: Download works, quota decrements

**Check in Console**:
```
✅ No errors
✅ You see: "User signed in: {uid: '...', isAnonymous: true}"
```

#### Test 2: Email Sign-Up
1. Refresh page (Ctrl+R)
2. Try to download again
3. **Expected**: Auth modal appears (you're logged out)
4. Click **"Sign Up"** at bottom
5. Enter email: `test@example.com`
6. Enter password: `test123` (min 6 chars)
7. Click **"Sign Up"**
8. **Expected**: Modal closes, you're signed in

**Check in Firebase Console**:
1. Go to Firebase Console → Authentication → Users
2. **Expected**: You see your test email listed

#### Test 3: Google Sign-In
1. Sign out (refresh page)
2. Try to download
3. Click **"Continue with Google"**
4. **Expected**: Google popup appears
5. Select your Google account
6. **Expected**: Modal closes, you're signed in

**Check in Firebase Console**:
1. Authentication → Users
2. **Expected**: You see your Google email listed

#### Test 4: Quota Persistence
1. Sign in with email (test@example.com / test123)
2. Download 3 documents
3. **Expected**: Quota shows 17 remaining (20 - 3)
4. Refresh page (Ctrl+R)
5. **Expected**: Still shows 17 remaining (persisted!)
6. Open incognito/private window
7. Go to `http://localhost:8080/app.html`
8. Sign in with same email
9. **Expected**: Still shows 17 remaining (synced!)

#### Test 5: Quota Exhaustion
1. Sign in as test user
2. Download 20 documents (or manually set quota to 0 in Firestore)
3. Try to download again
4. **Expected**: Error message "Download quota exceeded"

---

## Step 3: Test on Phone (Same WiFi)

### Connect Phone to Same Network
1. Make sure phone is on same WiFi as PC
2. On phone browser, go to: `http://192.168.1.XXX:8080/app.html`
   (Replace XXX with IP from Step 1)

### Test Checklist (Phone)

#### Test 1: Google Sign-In on Phone
1. Try to download
2. Click **"Continue with Google"**
3. **Expected**: Google account picker appears
4. Select account
5. **Expected**: Signed in successfully

#### Test 2: Cross-Device Sync
1. On PC: Sign in as test@example.com
2. Download 2 documents (quota: 18 remaining)
3. On Phone: Sign in as test@example.com
4. **Expected**: Shows 18 remaining (synced from PC!)
5. On Phone: Download 1 document
6. On PC: Refresh page
7. **Expected**: Shows 17 remaining (synced from phone!)

---

## Step 4: Check Firestore Data

### View User Data in Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click **"Data"** tab
3. Expand **"users"** collection
4. Click on a user document (UID)

**Expected structure**:
```
users/
  └── {user-uid}/
      ├── downloadsLeft: 17
      ├── messagesLeft: 50
      └── createdAt: {timestamp}
```

---

## Common Issues & Fixes

### Issue 1: "FirebaseService is not defined"
**Cause**: Firebase scripts not loaded yet  
**Fix**: Make sure you're using `defer` on all script tags

### Issue 2: "Permission denied" in Firestore
**Cause**: Security rules not set correctly  
**Fix**: Check Firestore Rules tab, should be:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Issue 3: Google Sign-In popup blocked
**Cause**: Browser popup blocker  
**Fix**: Allow popups for localhost in browser settings

### Issue 4: Can't connect from phone
**Cause**: Firewall or wrong IP  
**Fix**: 
- Check PC firewall allows port 8080
- Make sure phone is on same WiFi
- Try PC's IP address (not 127.0.0.1)

### Issue 5: Quota not syncing
**Cause**: Different user accounts  
**Fix**: Make sure you're signing in with SAME email on both devices

---

## Testing Checklist Summary

**PC Tests**:
- [ ] Anonymous sign-in works
- [ ] Email sign-up works
- [ ] Email sign-in works
- [ ] Google sign-in works
- [ ] Download decrements quota
- [ ] Quota persists after refresh
- [ ] Quota exhaustion shows error
- [ ] No console errors

**Phone Tests**:
- [ ] Can access via local IP
- [ ] Google sign-in works on mobile
- [ ] Quotas sync between PC and phone
- [ ] UI is responsive on mobile

**Firestore Tests**:
- [ ] User documents created automatically
- [ ] Quota values update correctly
- [ ] Can view data in Firebase Console

---

## Next Steps

### If All Tests Pass ✅
Reply with: **"Tests passed, ready to deploy"**

I'll guide you through:
1. Merging to main branch
2. Pushing to GitHub Pages
3. Testing live site

### If Tests Fail ❌
Reply with:
- Which test failed
- Error message from console
- Screenshot if possible

I'll help debug and fix!

---

## Quick Commands Reference

```bash
# Start local server
http-server -p 8080

# Stop server
Ctrl+C

# Check current branch
git branch

# View recent commits
git log --oneline -5

# See what changed
git diff main
```
