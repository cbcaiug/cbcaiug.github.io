# 🔑 GAS Shared API Key Management

## **Issue: Shared API Keys Not Working**

Your shared API keys are failing because:
1. Keys are exhausted (rate limits reached)
2. Keys are invalid/expired
3. Rotation logic not working properly

---

## **Solution: Update Keys in GAS**

### **Step 1: Get Fresh API Keys**

1. Go to https://aistudio.google.com/apikey
2. Create 5-10 new API keys
3. Copy each key

### **Step 2: Update GAS Script**

1. Open your Google Apps Script project
2. Find the `getTrialApiKey()` function
3. Replace the keys array with your new keys:

```javascript
function getTrialApiKey() {
  const keys = [
    'YOUR_NEW_KEY_1',
    'YOUR_NEW_KEY_2',
    'YOUR_NEW_KEY_3',
    'YOUR_NEW_KEY_4',
    'YOUR_NEW_KEY_5'
  ];
  
  // Random selection for load balancing
  const randomIndex = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomIndex];
  
  return {
    success: true,
    apiKey: selectedKey,
    keyLabel: `Key #${randomIndex + 1}`
  };
}
```

### **Step 3: Better Rotation Logic (Optional)**

For better rotation, track which keys are failing:

```javascript
function getTrialApiKey() {
  const keys = [
    { key: 'YOUR_KEY_1', label: 'Key #1', active: true },
    { key: 'YOUR_KEY_2', label: 'Key #2', active: true },
    { key: 'YOUR_KEY_3', label: 'Key #3', active: true },
    { key: 'YOUR_KEY_4', label: 'Key #4', active: true },
    { key: 'YOUR_KEY_5', label: 'Key #5', active: true }
  ];
  
  // Filter active keys only
  const activeKeys = keys.filter(k => k.active);
  
  if (activeKeys.length === 0) {
    return {
      success: false,
      error: 'All shared keys exhausted. Please add your own API key.'
    };
  }
  
  // Random selection from active keys
  const randomIndex = Math.floor(Math.random() * activeKeys.length);
  const selected = activeKeys[randomIndex];
  
  return {
    success: true,
    apiKey: selected.key,
    keyLabel: selected.label
  };
}
```

### **Step 4: Monitor Key Usage**

Add logging to track which keys are being used:

```javascript
function logKeyUsage(keyLabel, success) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('KeyUsage');
  if (!sheet) return;
  
  sheet.appendRow([
    new Date(),
    keyLabel,
    success ? 'SUCCESS' : 'FAILED'
  ]);
}
```

---

## **Testing After Update**

1. Deploy new version of GAS script
2. Open app in browser
3. Enable "Use Shared API Key" toggle
4. Try generating a response
5. Check console for key label (e.g., "Key #3")
6. If it fails, try again (should get different key)

---

## **Rate Limits**

Google AI Studio free tier limits:
- **15 requests per minute**
- **1,500 requests per day**

With 5 keys, you get:
- **75 requests per minute** (15 × 5)
- **7,500 requests per day** (1,500 × 5)

---

## **Recommendations**

1. **Start with 10 keys** for better load distribution
2. **Monitor usage** to identify exhausted keys
3. **Rotate keys weekly** to avoid rate limit issues
4. **Add error handling** to automatically disable failing keys
5. **Consider paid tier** if usage is high

---

## **Frontend Already Handles:**

✅ Key rotation (tries new key on failure)  
✅ Error messages to user  
✅ Fallback to personal keys  
✅ Key label display  

**Backend (GAS) needs:**  
❌ Fresh API keys  
❌ Better rotation logic  
❌ Usage tracking  
