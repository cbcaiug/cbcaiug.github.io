# Local Testing Guide

## Start Local Server

### Option 1: Using npx serve (Recommended)
```bash
cd /home/derrickmusamali/cbcaiug

# Start server
npx serve cbcaiug.github.io -p 3000
```

**Output will show**:
```
   ┌────────────────────────────────────────┐
   │                                        │
   │   Serving!                             │
   │                                        │
   │   - Local:    http://localhost:3000    │
   │   - Network:  http://192.168.1.XXX:3000│
   │                                        │
   └────────────────────────────────────────┘
```

**PC URL**: `http://localhost:3000/app.html`  
**Phone URL**: `http://192.168.1.XXX:3000/app.html`

### Option 2: Using http-server
```bash
cd /home/derrickmusamali/cbcaiug/cbcaiug.github.io
http-server -p 8080
```

**PC URL**: `http://localhost:8080/app.html`

---

## Add 127.0.0.1:3000 to Firebase

Since you're using `http://127.0.0.1:3000`, add this to Firebase:

1. Firebase Console → Authentication → Settings
2. Authorized domains
3. Add: `127.0.0.1:3000`
4. Click "Add"

---

## Testing Checklist

### Unauthenticated User (No Sign-In)
**Expected Display**:
```
Settings
👤 Not signed in
📥 0 downloads • 💬 10 free messages
```

**Test**:
- [ ] Open app
- [ ] Settings shows: `0 downloads • 10 free messages`
- [ ] Send 10 messages
- [ ] After 10th message → Auth modal appears
- [ ] Try to download → Auth modal appears

---

### Guest User (Anonymous)
**Expected Display**:
```
Settings
👤 Guest User (Limited)
📥 5/5 downloads • 💬 5/5 messages
Sign Out
```

**Test**:
- [ ] Click "Continue as Guest (5 free uses)"
- [ ] Settings shows: `5/5 downloads • 5/5 messages`
- [ ] Download 1 file
- [ ] Settings shows: `4/5 downloads • 5/5 messages`
- [ ] Send 1 message
- [ ] Settings shows: `4/5 downloads • 4/5 messages`

---

### Registered User (Email/Google)
**Expected Display**:
```
Settings
👤 user@example.com
📥 20/20 downloads • 💬 50/50 messages
Sign Out
```

**Test**:
- [ ] Sign up with email
- [ ] Settings shows: `20/20 downloads • 50/50 messages`
- [ ] Download 3 files
- [ ] Settings shows: `17/20 downloads • 50/50 messages`
- [ ] Refresh page
- [ ] Still shows: `17/20 downloads • 50/50 messages`

---

## Quota Flow Summary

| User Type | Downloads | Messages | Auth Required |
|-----------|-----------|----------|---------------|
| **Unauthenticated** | 0 | 10 free | After 10 messages |
| **Guest (Anonymous)** | 5 | 5 | No (already signed in) |
| **Registered (Email/Google)** | 20 | 50 | No (already signed in) |

---

## Upgrade Flow

### Anonymous → Guest
1. User opens app (not signed in)
2. Sends 10 messages
3. Auth modal appears
4. Clicks "Continue as Guest"
5. Quotas: 0 → 5 downloads, 10 → 5 messages

### Guest → Registered
1. Guest user clicks "Sign Up"
2. Creates account with email
3. Quotas: 5 → 20 downloads, 5 → 50 messages
4. Chat history preserved

---

## Common Issues

### Issue: Shows 20/50 when not signed in
**Cause**: Old state from previous session  
**Fix**: Clear browser cache or use incognito

### Issue: Google sign-in fails
**Cause**: Domain not authorized  
**Fix**: Add `127.0.0.1:3000` to Firebase authorized domains

### Issue: Quotas don't update
**Cause**: Real-time listener not working  
**Fix**: Check browser console for errors

---

## VS Code Live Server

If using VS Code Live Server:
- URL: `http://127.0.0.1:5500/cbcaiug.github.io/app.html`
- Add `127.0.0.1:5500` to Firebase authorized domains

---

## Phone Testing

1. Find your PC's local IP from `npx serve` output
2. On phone (same WiFi): `http://192.168.1.XXX:3000/app.html`
3. Test all flows above
4. Verify quotas sync between PC and phone
