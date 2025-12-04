# 🎛️ Admin Dashboard Guide

## Access

**URL**: `https://cbcaiug.github.io/admin.html`

**Password**: `cbcadmin2024` (change in admin.html line 103)

---

## Features

### 1. **View All Users**
- See total user count
- View quotas for each user
- See creation date
- Auto-refreshes on page load

### 2. **Search User**
- Search by email OR Firebase UID
- View individual user quotas
- Quick reset from search results

### 3. **Reset Single User**
- Click "Reset" button next to any user
- Resets to: 20 downloads, 50 messages
- **Changes reflect instantly** in user's app (no refresh needed)

### 4. **Reset All Users**
- Click "Reset All Quotas" button
- Double confirmation required
- Resets ALL users to default quotas
- **All users see changes instantly**

---

## Real-Time Sync ✅

When you update quotas in admin panel:
1. Firestore updates immediately
2. All connected devices receive update via `subscribeToQuotas()`
3. User sees new quotas **without refreshing**

**Example**: User has app open → You reset their quota → They see "20/20" instantly

---

## Security

### Change Admin Password

Edit `admin.html` line 103:
```javascript
const ADMIN_PASSWORD = "YOUR_NEW_PASSWORD_HERE";
```

### Firestore Security Rules

Current rules allow admin access. To restrict:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admin can read/write all (requires admin claim)
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

---

## Troubleshooting

### "User not found" when searching
- User may not have signed in yet
- Check Firebase Console → Authentication for user list
- Try searching by UID instead of email

### Changes not reflecting
- Check browser console for errors
- Verify Firebase config matches main app
- Ensure user is currently signed in to app

### Can't login to admin panel
- Check password in admin.html line 103
- Clear browser cache
- Check browser console for errors

---

## Future Enhancements

Possible additions:
- [ ] Export user data to CSV
- [ ] View user activity logs
- [ ] Set custom quotas per user
- [ ] Ban/unban users
- [ ] View quota usage analytics
- [ ] Email notifications to users

---

## Quick Reference

| Action | Steps |
|--------|-------|
| Reset one user | Search → Click "Reset" |
| Reset all users | Click "Reset All Quotas" → Confirm twice |
| View user details | Search by email or UID |
| Change password | Edit admin.html line 103 |
| Check Firestore | Firebase Console → Firestore Database |
