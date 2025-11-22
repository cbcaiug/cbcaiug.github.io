# 📧 Fix Supabase Email Templates

## **Problem:**
Email links redirect to `127.0.0.1:3000` instead of your live site.

## **Solution:**

### **Step 1: Update Site URL**

1. Go to Supabase Dashboard
2. Project Settings → General → Configuration
3. **Site URL**: Change to `https://cbcaiug.github.io/cbcaiug.github.io/app.html`
4. Click "Save"

### **Step 2: Update Redirect URLs**

1. Project Settings → General → Configuration
2. **Redirect URLs**: Add:
   ```
   https://cbcaiug.github.io/cbcaiug.github.io/app.html
   https://cbcaiug.github.io/cbcaiug.github.io/app.html/**
   ```
3. Click "Save"

### **Step 3: Update Email Templates**

1. Go to: Authentication → Email Templates
2. Select "Confirm signup" template
3. **Replace the template with:**

```html
<h2>Confirm your signup</h2>
<p>Welcome to CBC AI Tool! Please verify your email address.</p>
<p><strong>Enter this code in the app: {{ .Token }}</strong></p>
<p style="font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">{{ .Token }}</p>
<p style="color: #666; font-size: 12px;">This code expires in 1 hour.</p>
```

4. Click "Save"

### **Step 4: Disable Email Confirmation (Optional)**

If you want users to sign in immediately without OTP:

1. Go to: Authentication → Providers → Email
2. **Confirm email**: Toggle OFF
3. Click "Save"

**Pros:**
- Faster signup
- No email issues
- Better UX

**Cons:**
- Users can create fake accounts
- No email verification

---

## **Recommended: OTP Only (No Links)**

**Email Template (OTP Only):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .code { font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CBC AI Tool</h1>
    </div>
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Welcome! Please enter this verification code in the app:</p>
      <div class="code">{{ .Token }}</div>
      <p><strong>This code expires in 1 hour.</strong></p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>CBC AI Tool - Educational Assistant for Uganda's Curriculum</p>
    </div>
  </div>
</body>
</html>
```

---

## **Facebook OAuth Fix**

### **Get Correct App ID:**

1. Go to https://developers.facebook.com/apps/
2. Select your app (or create new one)
3. Settings → Basic
4. Copy **App ID** (numbers only, no spaces)
5. Copy **App Secret**
6. Go to Supabase → Authentication → Providers → Facebook
7. Paste App ID and App Secret
8. **Valid OAuth Redirect URIs** in Facebook:
   - Add: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`
9. Save both Facebook and Supabase

---

## **Twitter OAuth Fix**

### **Option 1: Disable Twitter**

1. Supabase → Authentication → Providers → Twitter
2. Toggle OFF
3. Remove Twitter button from auth modal

### **Option 2: Configure Twitter OAuth**

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create app or select existing
3. User authentication settings → Set up
4. App permissions: Read
5. Type of App: Web App
6. Callback URL: `https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback`
7. Website URL: `https://cbcaiug.github.io`
8. Copy API Key and API Secret
9. Update in Supabase

**Recommendation**: Disable Twitter for now - most users won't use it.

---

## **Summary of Changes:**

### **Immediate:**
1. ✅ Update Site URL in Supabase
2. ✅ Update email template (OTP only, no links)
3. ✅ Disable Facebook OAuth (too complex)
4. ✅ Disable Twitter OAuth (too complex)

### **Result:**
- ✅ Google OAuth only (simplest, most used)
- ✅ Email/Password with OTP verification
- ✅ Clean, simple auth flow

### **Optional:**
1. Disable email confirmation entirely (faster signup)
2. Add Facebook/Twitter later if needed
3. Customize email template design

---

## **Test After Changes:**

1. Sign up with new email
2. Check email - should show OTP code only
3. Enter code in app
4. Should work!
5. Try Facebook OAuth
6. Should work!
