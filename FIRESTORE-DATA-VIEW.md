# Viewing Firestore Data (Like Supabase Table)

## Firebase Console - Data View

### Step 1: Access Firestore Database
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `cbcaiug-auth`
3. Left sidebar → Click **"Firestore Database"**
4. Click **"Data"** tab

### Step 2: View Users Collection
You'll see:
```
users/ (collection)
  ├── abc123xyz (document - user UID)
  │   ├── downloadsLeft: 17
  │   ├── messagesLeft: 45
  │   ├── isGuest: false
  │   └── createdAt: {timestamp}
  │
  ├── def456uvw (another user)
  │   ├── downloadsLeft: 20
  │   ├── messagesLeft: 50
  │   ├── isGuest: false
  │   └── createdAt: {timestamp}
```

### Step 3: View User Emails & Last Sign-In
1. Firebase Console → **Authentication** → **Users** tab
2. You'll see a table with:
   - **Identifier** (email)
   - **Providers** (Google, Email/Password)
   - **Created** (signup date)
   - **Signed In** (last sign-in time)
   - **User UID**

---

## Real-Time Updates

### Firestore Data Tab
- Click on any user document
- You'll see fields update in real-time as users interact
- Example: User downloads a file → `downloadsLeft: 17` changes to `16` instantly

### Authentication Tab
- Shows last sign-in time
- Updates when user signs in

---

## Comparison: Supabase vs Firestore

| Feature | Supabase | Firestore |
|---------|----------|-----------|
| **Data View** | Table view | Document tree view |
| **Real-time** | ✅ Yes | ✅ Yes |
| **User Info** | In same table | Split: Data in Firestore, Auth in Authentication tab |
| **Last Sign-In** | Custom column | Built-in (Authentication tab) |
| **Downloads/Messages** | Table columns | Document fields |
| **Filtering** | SQL queries | Firestore queries |

---

## Creating a Dashboard View (Optional)

If you want a Supabase-like table view, you can:

### Option 1: Use Firebase Extensions
1. Install **"Export Collections"** extension
2. Export to Google Sheets
3. View as table in Sheets

### Option 2: Build Custom Admin Panel
Create a simple admin page that queries Firestore:

```javascript
// Get all users
const usersSnapshot = await db.collection('users').get();
const users = [];

usersSnapshot.forEach(doc => {
  users.push({
    uid: doc.id,
    ...doc.data()
  });
});

// Display in table
console.table(users);
```

### Option 3: Use Firestore Console Filters
1. Firestore Database → Data tab
2. Click "Start collection"
3. Use filters to find specific users
4. Example: Find users with low quotas

---

## Viewing Specific User Data

### By Email
1. Authentication → Users tab
2. Search for email
3. Copy User UID
4. Firestore Database → Data tab
5. Navigate to `users/{UID}`

### By UID
1. Firestore Database → Data tab
2. Click `users` collection
3. Click on user document (UID)
4. See all fields

---

## Monitoring User Activity

### Downloads Remaining
1. Firestore → Data → users
2. Look at `downloadsLeft` field
3. Updates in real-time

### Messages Remaining
1. Same location
2. Look at `messagesLeft` field

### Last Activity
1. Add `lastActivity` field to user documents
2. Update on each action:
```javascript
await db.collection('users').doc(uid).update({
  lastActivity: firebase.firestore.FieldValue.serverTimestamp()
});
```

---

## Exporting Data

### Export to JSON
1. Firestore → Data tab
2. Select collection
3. Click "..." menu
4. "Export collection"
5. Choose format (JSON, CSV)

### Export to BigQuery
1. Firebase Console → Integrations
2. Enable BigQuery export
3. Query data with SQL

---

## Adding Custom Fields

### Track Copy/Save Actions
Update your firebase.js:

```javascript
// When user copies
await db.collection('users').doc(uid).update({
  downloadsLeft: firebase.firestore.FieldValue.increment(-1),
  lastCopy: firebase.firestore.FieldValue.serverTimestamp(),
  totalCopies: firebase.firestore.FieldValue.increment(1)
});
```

### Track Last Sign-In (Custom)
```javascript
// On sign-in
await db.collection('users').doc(uid).update({
  lastSignIn: firebase.firestore.FieldValue.serverTimestamp()
});
```

---

## Quick Access URLs

### Your Firestore Data
```
https://console.firebase.google.com/project/cbcaiug-auth/firestore/data
```

### Your Authentication Users
```
https://console.firebase.google.com/project/cbcaiug-auth/authentication/users
```

---

## Real-Time Monitoring Script

Create a simple script to watch changes:

```javascript
// Listen to all user changes
db.collection('users').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'modified') {
      console.log('User updated:', change.doc.id, change.doc.data());
    }
  });
});
```

---

## Summary

**Firestore Data** = Supabase Table Rows  
**Authentication Tab** = User emails, last sign-in  
**Real-time Updates** = Same as Supabase  
**Difference** = Split view (Data + Auth) vs single table

**To see everything**:
1. Firestore Data tab → User quotas, activity
2. Authentication tab → Emails, sign-in times
3. Both update in real-time!
