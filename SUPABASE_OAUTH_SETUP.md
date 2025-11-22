# 🔐 Supabase OAuth & Email Setup Guide

## **Current Status**

### ✅ **Email Confirmation**
- Enabled in Supabase dashboard
- OTP expiration: 3600 seconds (1 hour)
- OTP length: 8 digits
- Minimum password: 6 characters

### ✅ **Facebook OAuth**
- Enabled
- API Key: Set (cbcaiug's Project)
- API Secret: Set
- Callback URL: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`

### ✅ **Twitter OAuth**
- Enabled
- API Key: Set (cbcaiug's Project)
- API Secret: Set
- Callback URL: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`

### ❌ **Google OAuth - ERROR**
**Error**: "Client IDs should not contain spaces"

**Problem**: You entered "cbcaiug's Project" (contains space and apostrophe)

**Solution**: Enter actual Google OAuth Client ID

---

## **Fix Google OAuth**

### **Step 1: Configure OAuth Consent Screen**

**FIRST TIME ONLY** - Google requires this before creating OAuth credentials:

1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to: APIs & Services → OAuth consent screen
4. Choose **External** (for public users)
5. Click "Create"
6. Fill in required fields:
   - **App name**: CBC AI Tool
   - **User support email**: Your email (e.g., cbcaitool@gmail.com)
   - **App logo**: Upload logo (optional)
   - **App domain**: `cbcaiug.github.io`
   - **Authorized domains**: Add `cbcaiug.github.io`
   - **Developer contact**: Your email
7. Click "Save and Continue"
8. **Scopes**: Click "Add or Remove Scopes"
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Select: `openid`
9. Click "Update" → "Save and Continue"
10. **Test users** (optional): Add your email for testing
11. Click "Save and Continue" → "Back to Dashboard"

### **Step 1b: PUBLISH YOUR APP (Make it Public)**

⚠️ **CRITICAL**: Your app is currently in TEST MODE - only test users can sign in!

**To make it available to everyone:**

1. Go to: APIs & Services → OAuth consent screen
2. Look for **Publishing status**: "Testing"
3. Click **"PUBLISH APP"** button
4. Read the warning (it's safe for your use case)
5. Click **"CONFIRM"**
6. Status changes to: "In production"

**What this means:**
- ✅ Anyone can sign in with Google
- ✅ No more "Access blocked" errors
- ✅ No need to add test users
- ⚠️ Google may review your app (usually automatic approval for basic scopes)

**Note**: For basic scopes (email, profile), Google usually doesn't require manual review. Your app will work immediately after publishing.

### **Step 2: Get Google OAuth Credentials**

1. Navigate to: APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: "CBC AI Tool - Supabase"
5. **Authorized JavaScript origins**: Add BOTH:
   - `https://cbcaiug.github.io`
   - `https://qrkodwjhxrcrvsgkfeeo.supabase.co`
6. **Authorized redirect URIs**: Add:
   - `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`
7. Click "Create"
8. Copy the **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
9. Copy the **Client Secret**

### **Step 3: Update Supabase**

1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. **Client ID**: Paste the full Client ID (NO SPACES, NO QUOTES)
   - Example: `123456789-abc123def456.apps.googleusercontent.com`
4. **Client Secret**: Paste the Client Secret
5. **Authorized Client IDs** (optional): Leave empty or add same Client ID
6. Click "Save"

### **Step 4: Test OAuth Flow**

1. Open your app: https://cbcaiug.github.io/cbcaiug.github.io/app.html
2. Click "Sign in with Google" button (once you add it)
3. Should redirect to Google login
4. After login, redirects back to your app
5. User is authenticated!

### **Common Errors:**

**Error: "Access blocked: This app has not been verified"**
- Your app is in TEST MODE
- Solution: Click "PUBLISH APP" in OAuth consent screen
- Status must be "In production" not "Testing"

**Error: "redirect_uri_mismatch"**
- Check redirect URI matches exactly in Google Console
- Must be: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`

**Error: "origin_mismatch"**
- Add your domain to Authorized JavaScript origins
- Must include: `https://cbcaiug.github.io`

**Error: "Access blocked: This app's request is invalid"**
- Complete OAuth consent screen configuration
- Add required scopes (email, profile, openid)

---

## **Email Confirmation Flow**

### **Current Settings:**
- OTP Code: 8 digits
- Expiration: 1 hour
- Delivery: Email

### **User Experience:**

1. User signs up with email + password
2. Supabase sends OTP code to email
3. User enters 8-digit code
4. Account confirmed
5. User can sign in

### **Frontend Changes Needed:**

Your current auth modal doesn't handle OTP verification. You need to add:

1. OTP input screen after sign-up
2. Resend OTP button
3. Error handling for expired/invalid OTP

---

## **Recommended Settings**

### **Email OTP:**
- ✅ Length: 6 digits (easier to type than 8)
- ✅ Expiration: 3600 seconds (1 hour is good)
- ✅ Rate limit: 60 seconds between resends

### **Password:**
- ✅ Minimum: 8 characters (more secure than 6)
- ✅ Require: At least one number
- ✅ Require: At least one uppercase letter

### **OAuth Providers:**

**Priority Order:**
1. **Google** - Most users have Gmail
2. **Facebook** - Popular in Uganda
3. **Twitter** - Less common

---

## **Why Email Confirmation?**

### **Pros:**
- ✅ Prevents fake accounts
- ✅ Verifies real email addresses
- ✅ Reduces abuse (one account per email)
- ✅ Prevents quota exploitation

### **Cons:**
- ❌ Extra step for users
- ❌ Email delivery issues
- ❌ Users may not check email
- ❌ OTP codes can be lost

### **Recommendation:**

**For your use case (preventing multiple accounts):**

**Option 1: Email Confirmation (Current)**
- Good for preventing abuse
- Requires OTP verification UI
- May frustrate users

**Option 2: Email Link (Simpler)**
- User clicks link in email
- No OTP code to type
- Easier UX
- Still verifies email

**Option 3: No Confirmation (Easiest)**
- Fastest signup
- Track by IP address instead
- Use device fingerprinting
- Limit by browser/device

---

## **My Recommendation:**

### **Use Email Link Confirmation (Not OTP)**

**Why:**
1. Simpler UX (click link vs type code)
2. No OTP input UI needed
3. Still verifies email
4. Prevents multiple accounts

**How to Enable:**

1. Supabase Dashboard → Authentication → Email Templates
2. Select "Confirm signup" template
3. Use magic link instead of OTP
4. User clicks link → Account confirmed

---

## **OAuth Benefits**

### **Why Add Google/Facebook OAuth:**

1. **Faster signup** - One click vs form
2. **No password to remember**
3. **Verified email automatically**
4. **Trusted identity providers**
5. **Better UX**

### **Implementation:**

Your current auth modal needs OAuth buttons:

```javascript
// Add to supabase-auth.js
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://cbcaiug.github.io/cbcaiug.github.io/app.html'
    }
  });
}

async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: 'https://cbcaiug.github.io/cbcaiug.github.io/app.html'
    }
  });
}
```

---

## **Quick Reference**

### **Google Cloud Console Settings:**

**OAuth Consent Screen:**
- User type: External
- App name: CBC AI Tool
- Authorized domains: `cbcaiug.github.io`
- Scopes: `userinfo.email`, `userinfo.profile`, `openid`

**OAuth 2.0 Client:**
- Type: Web application
- JavaScript origins:
  - `https://cbcaiug.github.io`
  - `https://qrkodwjhxrcrvsgkfeeo.supabase.co`
- Redirect URIs:
  - `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`

### **Supabase Settings:**

**Google Provider:**
- Enabled: Yes
- Client ID: From Google Console
- Client Secret: From Google Console
- Callback URL: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`

---

## **Next Steps**

### **Immediate:**
1. ✅ Complete OAuth consent screen
2. ✅ Create OAuth credentials with correct origins
3. ✅ Update Supabase with Client ID/Secret
4. ✅ Test email confirmation flow
5. ✅ Decide: OTP vs Magic Link

### **Later:**
1. Add OAuth buttons to auth modal
2. Add OTP verification UI (if using OTP)
3. Test all auth flows
4. Monitor for abuse

---

## **Facebook & Twitter OAuth**

### **Q: Will Supabase take care of Facebook/Twitter?**

**A: YES** - If you already configured them in Supabase dashboard:

**Facebook:**
- ✅ Enabled in Supabase
- ✅ API Key set
- ✅ API Secret set
- ✅ Callback URL correct
- ✅ **Ready to use!**

**Twitter:**
- ✅ Enabled in Supabase
- ✅ API Key set
- ✅ API Secret set
- ✅ Callback URL correct
- ✅ **Ready to use!**

**You just need to:**
1. Add OAuth buttons to your auth modal (frontend)
2. Call `supabase.auth.signInWithOAuth({ provider: 'facebook' })`
3. Supabase handles the rest!

**No additional setup needed** - Supabase manages the OAuth flow for you.

---

## **Summary**

**Current Setup:**
- ✅ Email confirmation enabled
- ✅ Facebook OAuth configured (ready to use)
- ✅ Twitter OAuth configured (ready to use)
- ⚠️ Google OAuth configured BUT in TEST MODE

**Action Required:**
- ✅ Google: PUBLISH APP to make it public
- ✅ Add OAuth buttons to frontend
- ✅ Test all auth flows

**Recommendation:**
- Use Email Magic Link (not OTP) for simpler UX
- Publish Google OAuth app immediately
- Add OAuth buttons for Google, Facebook, Twitter
- Test thoroughly before launch
