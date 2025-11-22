# 🧪 Supabase Quota Integration - Testing Checklist

## 📋 **Pre-Test Setup**

### **Tab Organization:**
- **Tab 1**: App (https://cbcaiug.github.io/cbcaiug.github.io/app.html)
- **Tab 2**: Supabase Dashboard (https://supabase.com/dashboard/project/qrkodwjhxrcrvsgkfeeo/editor)
- **Tab 3**: This checklist (for reference)

### **Supabase Dashboard Setup:**
1. Open Tab 2 → Navigate to Table Editor
2. Select `usage_quotas` table
3. Keep this tab open for quick quota checks

---

## ✅ **Test 1: Fresh Account Setup**

**Goal**: Verify new accounts get correct initial quotas

### Steps:
1. **Tab 1**: Open app in **private/incognito window**
2. Sign up with new account:
   - Username: `test_user_[timestamp]` (e.g., test_user_0245)
   - Password: `TestPass123!`
3. Accept consent modal
4. **Check Browser UI**:
   - [ ] Shows "50 free uses remaining" (generations)
   - [ ] Shows "Copy 20/20" and "Save 20/20" (downloads)
5. **Tab 2**: Refresh Supabase table
   - [ ] New row exists for user
   - [ ] `free_generations_remaining` = 50
   - [ ] `free_downloads_remaining` = 20
   - [ ] `accepted_terms` = true

**Expected**: ✅ Browser and Supabase both show 50/20

---

## ✅ **Test 2: Copy Button Integration**

**Goal**: Verify copy consumes Supabase quota and syncs state

### Steps:
1. **Tab 1**: Generate 1 AI response (any prompt)
2. Wait for response to complete
3. Click **Copy** button on the response
4. **Check Browser UI**:
   - [ ] Copy count changes to "Copy 19/20" immediately
   - [ ] Save count also shows "Save 19/20"
5. **Tab 2**: Refresh Supabase table
   - [ ] `free_downloads_remaining` = 19
6. **Tab 1**: Click Copy again
7. **Check Browser UI**:
   - [ ] Copy count changes to "Copy 18/20" immediately
8. **Tab 2**: Refresh Supabase table
   - [ ] `free_downloads_remaining` = 18

**Expected**: ✅ Copy reduces both browser and Supabase counts

---

## ✅ **Test 3: Save Button Integration**

**Goal**: Verify save consumes Supabase quota and syncs state

### Steps:
1. **Tab 1**: Click **Save** button on the same response
2. Wait for "Creating your Google Doc..." message
3. **Check Browser UI**:
   - [ ] Copy count changes to "Copy 17/20" immediately
   - [ ] Save count changes to "Save 17/20" immediately
4. **Tab 2**: Refresh Supabase table
   - [ ] `free_downloads_remaining` = 17
5. **Tab 1**: Click Save again on another response
6. **Check Browser UI**:
   - [ ] Both counts change to 16/20 immediately
7. **Tab 2**: Refresh Supabase table
   - [ ] `free_downloads_remaining` = 16

**Expected**: ✅ Save reduces both browser and Supabase counts

---

## ✅ **Test 4: Generation Count Updates**

**Goal**: Verify generation count updates in browser immediately (no reload needed)

### Steps:
1. **Tab 1**: Note current generation count (e.g., "49 free uses remaining")
2. Generate 1 AI response
3. Wait for response to complete
4. **Check Browser UI** (WITHOUT RELOADING):
   - [ ] Count updates to "48 free uses remaining" immediately
5. **Tab 2**: Refresh Supabase table
   - [ ] `free_generations_remaining` = 48
6. **Tab 1**: Generate 2 more responses
7. **Check Browser UI** (WITHOUT RELOADING):
   - [ ] Count updates to "46 free uses remaining" immediately
8. **Tab 2**: Refresh Supabase table
   - [ ] `free_generations_remaining` = 46

**Expected**: ✅ Browser count updates immediately without reload

---

## ✅ **Test 5: Logout/Login Persistence**

**Goal**: Verify correct counts show immediately after login (no max counts bug)

### Steps:
1. **Tab 1**: Note current counts (e.g., 46 generations, 16 downloads)
2. Click username in sidebar → Sign Out
3. **Check Browser UI**:
   - [ ] Shows sign-in modal
4. Sign in with same account
5. **Check Browser UI** (IMMEDIATELY after login):
   - [ ] Shows "46 free uses remaining" (NOT 50)
   - [ ] Shows "Copy 16/20" and "Save 16/20" (NOT 20/20)
6. **Tab 2**: Verify Supabase table (should not change)
   - [ ] `free_generations_remaining` = 46
   - [ ] `free_downloads_remaining` = 16

**Expected**: ✅ Browser shows correct Supabase counts immediately (no 50/20 bug)

---

## ✅ **Test 6: Private Tab Persistence**

**Goal**: Verify counts persist across private tabs

### Steps:
1. **Tab 1**: Note current counts (e.g., 46 generations, 16 downloads)
2. Close the private window
3. Open NEW private window
4. Navigate to app
5. Sign in with same account
6. **Check Browser UI**:
   - [ ] Shows "46 free uses remaining"
   - [ ] Shows "Copy 16/20" and "Save 16/20"
7. **Tab 2**: Verify Supabase table
   - [ ] `free_generations_remaining` = 46
   - [ ] `free_downloads_remaining` = 16

**Expected**: ✅ Counts persist across private tabs

---

## ✅ **Test 7: Browser Clear Persistence**

**Goal**: Verify counts persist after clearing browser data

### Steps:
1. **Tab 1**: Note current counts (e.g., 46 generations, 16 downloads)
2. Open browser settings → Clear browsing data
3. Select: Cookies, Cache, Site data
4. Clear data
5. Navigate back to app
6. Sign in with same account
7. **Check Browser UI**:
   - [ ] Shows "46 free uses remaining"
   - [ ] Shows "Copy 16/20" and "Save 16/20"
8. **Tab 2**: Verify Supabase table
   - [ ] `free_generations_remaining` = 46
   - [ ] `free_downloads_remaining` = 16

**Expected**: ✅ Counts persist after browser clear

---

## ✅ **Test 8: Model Switching with Shared Keys**

**Goal**: Verify users can switch Gemini models while using shared API keys

### Steps:
1. **Tab 1**: Ensure "Use Shared API Key" toggle is ON
2. Open Settings sidebar
3. **Check Model Dropdown**:
   - [ ] Shows multiple Gemini models (2.5 Pro, 2.5 Flash, etc.)
4. Select "Gemini 2.5 Flash"
5. **Check Browser UI**:
   - [ ] Model changes to "Gemini 2.5 Flash"
   - [ ] No error message
6. Generate 1 AI response
7. **Check Response**:
   - [ ] Response generates successfully
   - [ ] Generation count decreases
8. Select "Gemini 2.0 Flash Exp"
9. Generate 1 AI response
10. **Check Response**:
    - [ ] Response generates successfully
    - [ ] Generation count decreases

**Expected**: ✅ Model switching works with shared keys

---

## ✅ **Test 9: Copy and Save Quota Sharing**

**Goal**: Verify copy and save share the same quota

### Steps:
1. **Tab 1**: Note current download count (e.g., 16/20)
2. Click **Copy** button
3. **Check Browser UI**:
   - [ ] Copy shows 15/20
   - [ ] Save shows 15/20
4. Click **Save** button
5. **Check Browser UI**:
   - [ ] Copy shows 14/20
   - [ ] Save shows 14/20
6. **Tab 2**: Refresh Supabase table
   - [ ] `free_downloads_remaining` = 14

**Expected**: ✅ Copy and Save share same quota

---

## ✅ **Test 10: Quota Exhaustion**

**Goal**: Verify proper behavior when quotas are exhausted

### Steps:
1. **Tab 2**: Manually set quotas to low values:
   - Edit user row → Set `free_generations_remaining` = 1
   - Set `free_downloads_remaining` = 1
2. **Tab 1**: Reload page
3. **Check Browser UI**:
   - [ ] Shows "1 free uses remaining"
   - [ ] Shows "Copy 1/20" and "Save 1/20"
4. Generate 1 AI response
5. **Check Browser UI**:
   - [ ] Shows "0 free uses remaining" or "Add API key to continue"
6. Try to generate another response
7. **Check Error Message**:
   - [ ] Shows "Free generations exhausted. Add your own API key..."
8. Click **Copy** button
9. **Check Browser UI**:
   - [ ] Shows "Copy 0/20" and "Save 0/20"
10. Try to click Copy again
11. **Check Button State**:
    - [ ] Copy button is disabled/grayed out
12. Try to click Save
13. **Check Modal**:
    - [ ] Shows "Free uses exhausted" modal

**Expected**: ✅ Proper error messages and disabled states

---

## ✅ **Test 11: Personal API Key (Bonus)**

**Goal**: Verify personal API keys still work

### Steps:
1. **Tab 1**: Toggle OFF "Use Shared API Key"
2. Paste your personal Google API key
3. Wait for validation (green checkmark)
4. Generate 1 AI response
5. **Check Response**:
   - [ ] Response generates successfully
6. **Check Supabase**:
   - [ ] Generation count still decreases in Supabase
7. **Check Browser UI**:
   - [ ] Generation count updates immediately

**Expected**: ✅ Personal keys work and still track in Supabase

---

## 📊 **Final Verification**

### **All Tests Passed?**
- [ ] Test 1: Fresh Account Setup
- [ ] Test 2: Copy Button Integration
- [ ] Test 3: Save Button Integration
- [ ] Test 4: Generation Count Updates
- [ ] Test 5: Logout/Login Persistence
- [ ] Test 6: Private Tab Persistence
- [ ] Test 7: Browser Clear Persistence
- [ ] Test 8: Model Switching with Shared Keys
- [ ] Test 9: Copy and Save Quota Sharing
- [ ] Test 10: Quota Exhaustion
- [ ] Test 11: Personal API Key

### **Summary:**
- **Total Tests**: 11
- **Passed**: ___
- **Failed**: ___

### **Issues Found:**
(List any issues here)

---

## 🐛 **If Tests Fail:**

1. Open browser console (F12)
2. Look for errors in console
3. Check Supabase table for unexpected values
4. Report issue with:
   - Test number
   - Expected behavior
   - Actual behavior
   - Console errors (if any)
   - Supabase values (screenshot)

---

## ✅ **Success Criteria:**

All tests should pass with:
- ✅ Browser counts match Supabase counts
- ✅ Counts update immediately (no reload needed)
- ✅ Counts persist across logout/login
- ✅ Counts persist across private tabs
- ✅ Counts persist after browser clear
- ✅ Copy and Save share same quota
- ✅ Model switching works with shared keys
- ✅ Proper error handling when quotas exhausted
