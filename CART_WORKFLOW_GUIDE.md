# Cart System Workflow Guide

## ✅ Cart System Documentation

**Status:** Implemented and functional (currently disabled in UI)

### How It Works:

#### **User Has Free Saves (1-5):**
1. User clicks "Save to Google Doc"
2. Doc created → Modal appears with download options
3. Usage count decrements
4. Logged as `google_doc_created` (normal flow)

#### **User Out of Free Saves (0):**
1. User clicks "Save to Google Doc" → Limit modal appears
2. User clicks "Add to Cart (1,000 UGX)"
3. System:
   - Generates `CartID` (e.g., `CART-1705315800`) if first item
   - Generates unique `ItemID` (e.g., `ITEM-1705315801`)
   - Creates Google Doc in background
   - Shows "Creating your Google Doc, please wait..."
   - Logs to analytics with `EventType: cart_doc_created`
   - Stores download URL with cart item
   - Shows "Added to cart!" message
4. User can add more items (same CartID)
5. User clicks "Proceed to Checkout"
6. Payment form opens with:
   - Session ID (pre-filled)
   - Items list (pre-filled)
   - Total amount (pre-filled)
   - **CartID (pre-filled)** ← NEW!
7. Cart is cleared after checkout

---

## 📊 Analytics Sheet Structure:

### New Columns:
| SessionID | Timestamp | EventType | AssistantName | CartID | ItemID | DocDownloadURL | Details |
|-----------|-----------|-----------|---------------|--------|--------|----------------|---------|
| Clever-Lion-123 | 2025-01-15 10:30 | cart_doc_created | Item Writer | CART-1705315800 | ITEM-1705315801 | https://docs.google.com/.../export?format=docx | ... |
| Clever-Lion-123 | 2025-01-15 10:32 | cart_doc_created | Lesson Plans | CART-1705315800 | ITEM-1705315802 | https://docs.google.com/.../export?format=docx | ... |

---

## 🔍 Your Workflow After Payment:

### Step 1: Check Payment Sheet
- Open payment sheet
- Find the submission
- Note: `SessionID` and `CartID`

Example:
```
SessionID: Clever-Lion-123
CartID: CART-1705315800
Total: 3000 UGX
```

### Step 2: Filter Analytics Sheet
1. Open analytics sheet
2. Apply filters:
   - `SessionID = Clever-Lion-123`
   - `CartID = CART-1705315800`
   - `EventType = cart_doc_created`

### Step 3: Copy Download Links
- You'll see all items with their download URLs
- Copy the `DocDownloadURL` column values
- These are direct download links (`.docx` format)

Example URLs:
```
https://docs.google.com/document/d/ABC123/export?format=docx
https://docs.google.com/document/d/DEF456/export?format=docx
https://docs.google.com/document/d/GHI789/export?format=docx
```

### Step 4: Send to User
Send via WhatsApp/Email:
```
Hi! Your payment has been verified. Here are your download links:

1. Item Writer: https://docs.google.com/document/d/ABC123/export?format=docx
2. Lesson Plans: https://docs.google.com/document/d/DEF456/export?format=docx
3. Coteacher: https://docs.google.com/document/d/GHI789/export?format=docx

Click each link to download directly as Word document.
```

---

## 🎯 Key Features:

✅ **CartID:** Unique per checkout session  
✅ **ItemID:** Unique per document  
✅ **Download URLs:** Direct `.docx` download (not view links)  
✅ **Auto-logging:** All cart docs logged to analytics  
✅ **Cart cleared:** After successful checkout  
✅ **No duplicates:** Each "Add to Cart" creates new doc  

---

## 🧹 Weekly Cleanup (Optional):

### Find Unpaid Docs:
1. Filter analytics for `EventType = cart_doc_created`
2. Get all unique `CartID` values
3. Check which CartIDs exist in payment sheet
4. CartIDs not in payment sheet = unpaid
5. Delete those docs from Google Drive (optional)

### Quick Script (Optional):
You can create a simple Apps Script to:
- Compare CartIDs in analytics vs payment sheet
- List unpaid docs
- Optionally delete them

---

## ⚠️ Edge Cases Handled:

1. **User adds, removes, re-adds:** New doc created each time ✅
2. **User clears cart:** CartID is reset ✅
3. **Multiple checkout sessions:** Each gets unique CartID ✅
4. **Cart cleared after checkout:** Prevents confusion ✅
5. **Empty cart:** CartID is cleared ✅

---

## 🔧 Testing:

1. Use dev link: `https://cbc-ai-tool.netlify.app/app.html?admin=true`
2. Use up 5 free saves
3. Try to save → Should show "Add to Cart"
4. Add 2-3 items to cart
5. Check analytics sheet → Should see `cart_doc_created` events with same CartID
6. Proceed to checkout → Form should have CartID pre-filled
7. Submit form
8. Check payment sheet → CartID should be there
9. Filter analytics by SessionID + CartID → Get download URLs

---

## 📝 Form Entry IDs (Reference):

- Session ID: `entry.1510315924`
- Items: `entry.153116271`
- Total: `entry.1062442954`
- CartID: `entry.322933472` ← NEW!

---

## 🎉 Done!

The system is now ready. Test it thoroughly before going live!
