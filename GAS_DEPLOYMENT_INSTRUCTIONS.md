# 🚀 GAS Deployment Instructions

## **You've Updated Script Properties - Now What?**

### **Answer: Just Save - No New Deployment Needed!**

Script Properties are **configuration**, not code. They update immediately without redeployment.

---

## **What You Did:**

1. ✅ Opened GAS → Project Settings → Script Properties
2. ✅ Updated `TRIAL_KEY_1` through `TRIAL_KEY_6` with new keys
3. ✅ Clicked "Save"

**Result**: Keys are now active immediately! No deployment needed.

---

## **When to Deploy New Version:**

Only deploy when you change **CODE**, not properties:

### **Code Changes That Need Deployment:**
- Modified `doGet()` or `doPost()` functions
- Changed key rotation logic
- Added new endpoints
- Fixed bugs in code
- Added new features

### **Property Changes (No Deployment):**
- Updated API keys
- Changed configuration values
- Modified settings

---

## **How to Deploy (When Needed):**

### **Option 1: Update Existing Deployment (Recommended)**

1. Click "Deploy" → "Manage deployments"
2. Click ⚙️ (gear icon) next to active deployment
3. Click "New version"
4. Add description: "Updated key rotation logic" or "Fixed bug in getTrialApiKey"
5. Click "Deploy"

**Result**: Same URL, new version

### **Option 2: New Deployment (Not Recommended)**

Creates a NEW URL - breaks your app!

---

## **Current Status:**

✅ **Your keys are active NOW**  
✅ **No deployment needed**  
✅ **Just test the app**

---

## **Testing:**

1. Open app: https://cbcaiug.github.io/cbcaiug.github.io/app.html
2. Enable "Use Shared API Key" toggle
3. Generate a response
4. Should work now with new keys!

---

## **If Keys Still Don't Work:**

Check GAS code to ensure it's reading from Script Properties:

```javascript
function getTrialApiKey() {
  const props = PropertiesService.getScriptProperties();
  const keys = [
    props.getProperty('TRIAL_KEY_1'),
    props.getProperty('TRIAL_KEY_2'),
    props.getProperty('TRIAL_KEY_3'),
    props.getProperty('TRIAL_KEY_4'),
    props.getProperty('TRIAL_KEY_5'),
    props.getProperty('TRIAL_KEY_6')
  ].filter(k => k); // Remove null/undefined
  
  if (keys.length === 0) {
    return {
      success: false,
      error: 'No trial keys configured'
    };
  }
  
  const randomIndex = Math.floor(Math.random() * keys.length);
  return {
    success: true,
    apiKey: keys[randomIndex],
    keyLabel: `Key #${randomIndex + 1}`
  };
}
```

---

## **Summary:**

**Script Properties Update**: ✅ Active immediately  
**Code Changes**: ❌ Need deployment  
**Your Situation**: ✅ No deployment needed  
**Next Step**: 🧪 Test the app!
