# Firestore Security Rules for Admin Dashboard

## Current Problem
Admin dashboard can't read users because Firestore rules block it.

## Solution

Go to: **Firebase Console → Firestore Database → Rules**

Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // ADMIN: Allow reading ALL users (for admin dashboard)
      // WARNING: This allows anyone to read all user data
      // In production, add admin authentication
      allow read: if request.auth != null;
    }
  }
}
```

## Better Solution (With Admin Auth)

For production, authenticate admin first:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
    }
    
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all users
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

Then create admin user in Firestore:
1. Go to Firestore → Create collection "admins"
2. Add document with your UID as document ID
3. Add field: `isAdmin: true`

## Quick Fix (For Testing)

**Temporary open access** (NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // DANGER: Open to all
    }
  }
}
```

## Steps to Apply

1. Go to: https://console.firebase.google.com
2. Select project: **cbcaiug-auth**
3. Click **Firestore Database** (left sidebar)
4. Click **Rules** tab
5. Paste one of the rules above
6. Click **Publish**
7. Refresh admin dashboard

## Current Rules (Blocking Admin)

Your current rules probably look like:
```javascript
allow read, write: if request.auth.uid == userId;
```

This blocks admin from reading other users.
