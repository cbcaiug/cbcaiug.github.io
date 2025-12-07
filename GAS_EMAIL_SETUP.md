# GAS Email Notifications + Code Cleanup

## Part 1: GAS Email Notifications (Simple Version)

### What You'll Get
- Email notification to `cbcaitool@gmail.com` when new user signs up
- Only tracks signups, not sign-ins
- Works 80% of the time (client-side trigger)

### Step 1: Create Google Apps Script

1. Go to: https://script.google.com
2. Click **New Project**
3. Name it: `TeachDeeper Signup Notifications`
4. Paste this code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Only process signup events
    if (data.action !== 'user_signup') {
      return ContentService.createTextOutput(JSON.stringify({success: false, message: 'Invalid action'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const email = data.email || 'Unknown';
    const method = data.method || 'Unknown';
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Nairobi',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    // Send email to admin
    const subject = '🎉 New User Signup - TeachDeeper';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #10b981;">New User Signup!</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Method:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${method}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${timestamp} EAT</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">
          <a href="https://console.firebase.google.com/project/cbcaiug-auth/authentication/users" 
             style="color: #3b82f6; text-decoration: none;">
            View in Firebase Console →
          </a>
        </p>
      </div>
    `;
    
    MailApp.sendEmail({
      to: 'cbcaitool@gmail.com',
      subject: subject,
      htmlBody: htmlBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Click **Deploy** → **New deployment**
6. Type: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone**
9. Click **Deploy**
10. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/...`)

### Step 2: Add to Firebase Auth Code

**File:** `src/components/AuthModal.js`

Find the signup success handlers and add this webhook call:

```javascript
// After successful signup, notify admin via GAS
const notifySignup = async (email, method) => {
  try {
    await fetch('YOUR_GAS_WEB_APP_URL_HERE', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'user_signup',
        email: email,
        method: method
      })
    });
  } catch (error) {
    console.error('Failed to notify signup:', error);
    // Don't block user flow if notification fails
  }
};

// Call after email signup
await notifySignup(email, 'Email/Password');

// Call after Google signup  
await notifySignup(user.email, 'Google');
```

---

## Part 2: Remove Consent Modal

### Issue
Consent modal still exists in code but may not be shown. Since users accept terms by signing up, it's redundant.

### Solution: Remove ConsentModal

**File:** `src/components/Modals.js`

Delete lines 163-200 (entire ConsentModal component)

**File:** `src/components/App.js`

Remove any references to:
- `showConsentModal`
- `setShowConsentModal`
- `<ConsentModal />`

---

## Part 3: Update Feedback Modal Logic

### Current Logic
- Triggers every 3 generations
- Uses localStorage counter
- Problem: Counter persists even after quota reset

### Proposed New Logic
- Trigger after 1 week of use
- Use Firestore `createdAt` timestamp
- More meaningful feedback timing

### Implementation

**File:** `src/components/App.js`

**OLD CODE (Remove):**
```javascript
const [generationCount, setGenerationCount] = useState(0);

// Effect to check feedback trigger
useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('generationCount') || '0', 10);
    localStorage.setItem('generationCount', generationCount.toString());
    if (generationCount > 0 && generationCount % FEEDBACK_TRIGGER_COUNT === 0) {
        setShowFeedbackModal(true);
    }
}, [generationCount]);
```

**NEW CODE (Add):**
```javascript
// Check if user has been active for 1 week
useEffect(() => {
    if (!user) return;
    
    const checkFeedbackTiming = async () => {
        try {
            const userDoc = await FirebaseService.db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) return;
            
            const userData = userDoc.data();
            const createdAt = userData.createdAt?.toDate();
            if (!createdAt) return;
            
            // Check if user created account more than 7 days ago
            const daysSinceSignup = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            
            // Check if feedback already shown
            const feedbackShown = localStorage.getItem('feedbackShown_' + user.uid);
            
            if (daysSinceSignup >= 7 && !feedbackShown) {
                setShowFeedbackModal(true);
                localStorage.setItem('feedbackShown_' + user.uid, 'true');
            }
        } catch (error) {
            console.error('Error checking feedback timing:', error);
        }
    };
    
    checkFeedbackTiming();
}, [user]);
```

### Benefits of New Logic
- ✅ More meaningful timing (after 1 week of use)
- ✅ Only shows once per user
- ✅ Uses Firebase data (more reliable)
- ✅ Doesn't interfere with quota system
- ✅ Less annoying for users

### Alternative: Trigger on Quota Milestone
If you prefer, trigger when user has used 50% of quota:

```javascript
// Trigger feedback when user has used 10 downloads or 25 messages
if ((userData.downloadsLeft <= 10 || userData.messagesLeft <= 25) && !feedbackShown) {
    setShowFeedbackModal(true);
    localStorage.setItem('feedbackShown_' + user.uid, 'true');
}
```

---

## Summary of Changes

### 1. GAS Email (10 min setup)
- ✅ Create GAS script
- ✅ Deploy as web app
- ✅ Add webhook call to AuthModal.js
- ✅ Test with new signup

### 2. Remove Consent Modal (2 min)
- ✅ Delete ConsentModal component
- ✅ Remove references in App.js
- ✅ Cleaner user flow

### 3. Update Feedback Logic (5 min)
- ✅ Remove generation counter
- ✅ Add 1-week timing check
- ✅ Use Firebase createdAt timestamp
- ✅ Better user experience

---

## Testing Checklist

### GAS Email
- [ ] Create test account with email
- [ ] Check cbcaitool@gmail.com inbox
- [ ] Create test account with Google
- [ ] Check inbox again

### Consent Modal
- [ ] Open app in incognito
- [ ] Verify no consent modal appears
- [ ] Sign up flow works smoothly

### Feedback Modal
- [ ] Create test account
- [ ] Manually set createdAt to 8 days ago in Firestore
- [ ] Refresh app
- [ ] Verify feedback modal appears
- [ ] Verify it doesn't appear again after dismissing

---

## Cost & Limitations

### GAS Email
- **Cost:** Free
- **Limit:** 100 emails/day
- **Reliability:** ~80% (client-side trigger)
- **Spam risk:** Low (webhook URL not easily guessable)

### Feedback Modal
- **Cost:** Free
- **Firestore reads:** 1 per app load (within free tier)
- **User experience:** Much better than every 3 generations

---

## Questions?

**Q: What if GAS email doesn't send?**
A: Check Firebase Console manually. GAS is best-effort notification, not critical.

**Q: Can users bypass the email notification?**
A: Yes, if they block JavaScript or the webhook fails. It's informational only.

**Q: Should I keep generation counter for anything?**
A: No, Firebase quotas handle all counting now. Remove it entirely.

**Q: What about existing users with old localStorage data?**
A: Old data won't interfere. New logic uses Firebase timestamps.
