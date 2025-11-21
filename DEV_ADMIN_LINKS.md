# Dev/Admin Testing Links

## How It Works
The app already tracks users as "Admin" or "User" based on the `?admin=true` URL parameter.

When you use the admin link, all your activity is logged with `UserType: Admin` in the analytics sheets.

---

## Your Dev/Admin Links

### Local Development
```
http://localhost:5500/ai-suite-assets/app.html?admin=true
http://127.0.0.1:5500/ai-suite-assets/app.html?admin=true
```

### Production (Netlify)
```
https://cbc-ai-tool.netlify.app/app.html?admin=true
```

### With Specific Assistant
```
http://localhost:5500/app.html?assistant=Coteacher&admin=true
https://cbc-ai-tool.netlify.app/app.html?assistant=Item%20Writer&admin=true
```

---

## What Gets Logged as "Admin"

When you use `?admin=true`, the following events are tracked with `UserType: Admin`:

✅ Generations  
✅ Regenerations  
✅ Feedback submissions  
✅ Document creations  
✅ Share clicks  
✅ All other tracked events  

---

## Regular User Links (for comparison)

### Without admin parameter:
```
http://localhost:5500/ai-suite-assets/app.html
https://cbc-ai-tool.netlify.app/app.html?assistant=Coteacher
```

These are logged as `UserType: User`

---

## Quick Access Bookmarks

Save these in your browser for quick testing:

1. **Dev Mode - Coteacher**  
   `http://localhost:5500/ai-suite-assets/app.html?assistant=Coteacher&admin=true`

2. **Dev Mode - Item Writer**  
   `http://localhost:5500/ai-suite-assets/app.html?assistant=Item%20Writer&admin=true`

3. **Dev Mode - Lesson Plans**  
   `http://localhost:5500/ai-suite-assets/app.html?assistant=Lesson%20Plans%20(NCDC)&admin=true`

---

## Viewing Admin Activity in Sheets

In your analytics spreadsheet, filter by the "UserType" column:
- **Admin** = Your testing activity
- **User** = Real user activity

This makes it easy to separate your testing data from actual user data.

---

## Pro Tip: Create a Bookmark

1. Open your app with `?admin=true`
2. Bookmark the page
3. Name it "🔧 CBC AI Tool - DEV MODE"
4. Use this bookmark whenever you're testing

---

## Security Note

The `?admin=true` parameter is just for analytics tracking. It doesn't give any special permissions or access - it only changes how your activity is logged in the sheets.

If you want to add actual admin features (like viewing all users' data), you'd need to implement authentication.
