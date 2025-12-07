# Email Notifications Setup Guide

## Overview
Send automated emails when users sign up using Firebase Cloud Functions + Gmail API

---

## Prerequisites
- Firebase project: `cbcaiug-auth`
- Gmail account: `cbcaitool@gmail.com`
- Node.js installed

---

## Step 1: Upgrade Firebase Plan

**Why?** Cloud Functions require Blaze (pay-as-you-go) plan

**Cost:** $0/month (free tier covers typical usage)
- 2M function invocations/month free
- 5GB outbound networking free

**Steps:**
1. Firebase Console → ⚙️ Settings → **Usage and billing**
2. Click **Modify plan**
3. Select **Blaze (pay-as-you-go)**
4. Add payment method (credit/debit card)
5. Set budget alert: $5/month (optional safety net)

---

## Step 2: Install Firebase CLI & Initialize Functions

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Navigate to project
cd /path/to/cbcaiug.github.io

# Initialize Cloud Functions
firebase init functions

# Select:
# - Use existing project: cbcaiug-auth
# - Language: JavaScript
# - ESLint: Yes
# - Install dependencies: Yes
```

---

## Step 3: Install Nodemailer

```bash
cd functions
npm install nodemailer
```

---

## Step 4: Generate Gmail App Password

**Why?** Gmail blocks "less secure apps" - need app-specific password

**Steps:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with `cbcaitool@gmail.com`
3. App name: `Firebase Functions`
4. Click **Create**
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
6. Save it securely

---

## Step 5: Store Email Credentials in Firebase

```bash
# Set Gmail credentials as environment variables
firebase functions:config:set gmail.email="cbcaitool@gmail.com"
firebase functions:config:set gmail.password="abcd efgh ijkl mnop"

# Verify
firebase functions:config:get
```

---

## Step 6: Create Cloud Function

**File:** `functions/index.js`

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure Gmail transporter
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// Trigger on new user creation
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || email.split('@')[0];
  const signupMethod = user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password';
  const signupTime = new Date(user.metadata.creationTime).toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Get total user count
  const userCount = await admin.auth().listUsers(1000).then(result => result.users.length);

  // 1. Send welcome email to new user (BCC admin)
  const welcomeEmail = {
    from: `TeachDeeper <${gmailEmail}>`,
    to: email,
    bcc: gmailEmail,
    subject: 'Welcome to TeachDeeper! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to TeachDeeper, ${displayName}!</h2>
        
        <p>Thank you for joining TeachDeeper - your AI partner for the new curriculum.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Free Quota:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>✅ <strong>20 free downloads</strong></li>
            <li>✅ <strong>50 free AI messages</strong></li>
          </ul>
        </div>
        
        <p><strong>Get Started:</strong></p>
        <a href="https://cbcaiug.github.io/app.html" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Launch App
        </a>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 14px; color: #6b7280;">
          <strong>Need help?</strong><br>
          📧 Reply to this email<br>
          📱 WhatsApp: <a href="https://wa.me/256750470234">+256 750 470234</a>
        </p>
        
        <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
          Happy teaching!<br>
          The TeachDeeper Team
        </p>
      </div>
    `
  };

  // 2. Send admin notification
  const adminEmail = {
    from: `TeachDeeper Notifications <${gmailEmail}>`,
    to: gmailEmail,
    subject: `🎉 New User Signup - TeachDeeper`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">New User Signup!</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${displayName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Method:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${signupMethod}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${signupTime} EAT</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>User ID:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${user.uid}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Total Users:</strong></td>
            <td style="padding: 8px; color: #3b82f6; font-weight: bold;">${userCount}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">
          <a href="https://console.firebase.google.com/project/cbcaiug-auth/authentication/users" 
             style="color: #3b82f6; text-decoration: none;">
            View in Firebase Console →
          </a>
        </p>
      </div>
    `
  };

  try {
    // Send both emails
    await transporter.sendMail(welcomeEmail);
    await transporter.sendMail(adminEmail);
    console.log(`Welcome email sent to ${email}`);
    console.log(`Admin notification sent`);
    return null;
  } catch (error) {
    console.error('Error sending emails:', error);
    return null;
  }
});
```

---

## Step 7: Deploy Cloud Function

```bash
# Deploy
firebase deploy --only functions

# Expected output:
# ✔ functions[sendWelcomeEmail(us-central1)] Successful create operation.
# Function URL: https://us-central1-cbcaiug-auth.cloudfunctions.net/sendWelcomeEmail
```

---

## Step 8: Test

### Test New Signup
1. Go to: https://cbcaiug.github.io/app.html
2. Sign up with a test email
3. Check:
   - ✅ Welcome email received by test user
   - ✅ Admin notification received by you
   - ✅ BCC copy of welcome email received by you

### Check Logs
```bash
firebase functions:log
```

---

## Troubleshooting

### Email not sending?

**1. Check Gmail App Password**
```bash
firebase functions:config:get
# Should show gmail.email and gmail.password
```

**2. Check Function Logs**
```bash
firebase functions:log --only sendWelcomeEmail
```

**3. Gmail Blocking?**
- Check: https://myaccount.google.com/notifications
- Look for "Blocked sign-in attempt"
- Allow Firebase Functions

**4. Test Manually**
```bash
# Trigger function with test data
firebase functions:shell
> sendWelcomeEmail({email: 'test@example.com', uid: 'test123'})
```

---

## Cost Estimate

**Typical Usage (100 signups/month):**
- Cloud Functions: $0 (within free tier)
- Gmail API: $0 (free)
- Firestore writes: $0 (within free tier)

**Total: $0/month**

**Free Tier Limits:**
- 2M function invocations/month
- 5GB outbound networking/month
- 10GB Firestore storage

---

## Customization

### Change Email Template
Edit `functions/index.js` → `welcomeEmail.html` section

### Add More Triggers
```javascript
// Send email when user deletes account
exports.sendGoodbyeEmail = functions.auth.user().onDelete(async (user) => {
  // Your code here
});

// Send email on first login
exports.sendFirstLoginEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    // Your code here
  });
```

### Change Email Provider
Replace Gmail with:
- SendGrid
- Mailgun
- AWS SES
- Postmark

---

## Security Notes

- ✅ Gmail password stored securely in Firebase config (not in code)
- ✅ Function only accessible by Firebase (not public URL)
- ✅ Emails sent server-side (user can't intercept)
- ✅ Rate limiting built-in (Firebase prevents spam)

---

## Maintenance

### Update Email Template
```bash
# Edit functions/index.js
nano functions/index.js

# Deploy changes
firebase deploy --only functions
```

### Monitor Usage
Firebase Console → Functions → Dashboard
- Invocations count
- Error rate
- Execution time

---

## Next Steps

1. ✅ Set up email notifications
2. Consider adding:
   - Password reset email customization
   - Monthly usage summary emails
   - Quota warning emails (when user has 5 messages left)
   - Newsletter signup

---

**Questions?** Check Firebase docs: https://firebase.google.com/docs/functions
