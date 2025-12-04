# Firebase Authentication - Complete Implementation Plan

## Summary
Replace localStorage quota tracking with Firebase Authentication + Firestore to persist user quotas across devices/browsers.

**Problem**: Users can bypass 20 download / 50 message limits by clearing browser data or using incognito mode.  
**Solution**: Firebase tracks quotas per authenticated user account.

---

## Comparison: ChatGPT Plan vs My Plan

### ✅ What ChatGPT Got Right
1. Firebase is the best choice (no pausing, generous free tier)
2. Email + Google + Anonymous auth methods
3. Firestore for quota storage
4. Security rules to prevent cheating

### ⚠️ What I'm Improving
1. **Concrete file paths** - Exact locations for every edit
2. **Minimal code changes** - Only touch what's necessary
3. **Local testing setup** - Step-by-step npm server instructions
4. **Git branch workflow** - Safe testing before main branch
5. **Rollback strategy** - CHANGES.md tracks everything
6. **No Cloud Functions** - Too complex for start, client-side is fine

---

## Phase 1: Firebase Console Setup (GUI Steps)

### Step 1.1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `cbcaiug-auth` (or your choice)
4. Disable Google Analytics (not needed)
5. Click **"Create project"** → Wait 30 seconds → Click **"Continue"**

### Step 1.2: Register Web App
1. In project overview, click the **Web icon** `</>`
2. App nickname: `CBC AI Tool`
3. ✅ Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **COPY the config object** - looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "cbcaiug-auth.firebaseapp.com",
  projectId: "cbcaiug-auth",
  storageBucket: "cbcaiug-auth.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```
6. **Save this config** - you'll paste it into code later
7. Click **"Continue to console"**

### Step 1.3: Enable Authentication
1. Left sidebar → Click **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab

**Enable Email/Password:**
1. Click **"Email/Password"**
2. Toggle **"Enable"** ON
3. Leave "Email link" OFF
4. Click **"Save"**

**Enable Google:**
1. Click **"Google"**
2. Toggle **"Enable"** ON
3. Project support email: (select your email)
4. Click **"Save"**

**Enable Anonymous:**
1. Click **"Anonymous"**
2. Toggle **"Enable"** ON
3. Click **"Save"**

### Step 1.4: Create Firestore Database
1. Left sidebar → Click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Location: Choose closest to Uganda (e.g., `europe-west1`)
5. Click **"Enable"** → Wait 1 minute

### Step 1.5: Set Firestore Security Rules
1. In Firestore, click **"Rules"** tab
2. **Replace all text** with this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click **"Publish"**

**What this does**: Each user can ONLY access their own quota data. No cheating possible.

---

## Phase 2: Code Changes (Minimal Edits)

### File 1: `app.html`
**Location**: Line 113 (before `</body>`)  
**Action**: Add Firebase SDK scripts

```html
<!-- Firebase SDK (Add before closing </body>) -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- Firebase Service (NEW) -->
<script type="text/babel" src="js/services/firebase.js" defer></script>

<!-- Auth Component (NEW) -->
<script type="text/babel" src="js/components/AuthModal.js" defer></script>
```

### File 2: `js/services/firebase.js` (NEW)
**Purpose**: Firebase initialization and quota management

```javascript
// Firebase configuration (PASTE YOUR CONFIG HERE)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get current user quotas
const getUserQuotas = async (uid) => {
  const doc = await db.collection('users').doc(uid).get();
  if (!doc.exists) {
    // Create new user with default quotas
    await db.collection('users').doc(uid).set({
      downloadsLeft: 20,
      messagesLeft: 50,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { downloadsLeft: 20, messagesLeft: 50 };
  }
  return doc.data();
};

// Decrement quota (safe transaction)
const decrementQuota = async (uid, type) => {
  const userRef = db.collection('users').doc(uid);
  return db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);
    const field = type === 'download' ? 'downloadsLeft' : 'messagesLeft';
    const current = doc.data()[field];
    if (current <= 0) throw new Error('Quota exceeded');
    transaction.update(userRef, { [field]: current - 1 });
    return current - 1;
  });
};

// Export for use in App.js
window.FirebaseService = { auth, db, getUserQuotas, decrementQuota };
```

### File 3: `js/components/AuthModal.js` (NEW)
**Purpose**: Sign-in/Sign-up UI

```javascript
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'signup' | 'anonymous'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await FirebaseService.auth.createUserWithEmailAndPassword(email, password);
      } else {
        await FirebaseService.auth.signInWithEmailAndPassword(email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await FirebaseService.auth.signInWithPopup(provider);
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await FirebaseService.auth.signInAnonymously();
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Sign In to Continue</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
          >
            {mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">OR</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 p-3 rounded hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={handleAnonymousSignIn}
          disabled={loading}
          className="w-full mt-3 bg-gray-200 p-3 rounded hover:bg-gray-300"
        >
          Continue as Guest
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-indigo-600 hover:underline"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
```

### File 4: `js/components/App.js`
**Changes**: Replace localStorage quota with Firebase

**Line ~90** - Add auth state:
```javascript
const [user, setUser] = React.useState(null);
const [quotas, setQuotas] = React.useState({ downloadsLeft: 20, messagesLeft: 50 });
const [showAuthModal, setShowAuthModal] = React.useState(false);
```

**Line ~500** - Add auth listener (in useEffect):
```javascript
useEffect(() => {
  const unsubscribe = FirebaseService.auth.onAuthStateChanged(async (user) => {
    setUser(user);
    if (user) {
      const userQuotas = await FirebaseService.getUserQuotas(user.uid);
      setQuotas(userQuotas);
    }
  });
  return () => unsubscribe();
}, []);
```

**Line ~800** - Replace `handleDocxDownload` quota check:
```javascript
const handleDocxDownload = async (markdownContent) => {
  if (!user) {
    setShowAuthModal(true);
    return;
  }
  
  if (quotas.downloadsLeft <= 0) {
    setError('Download quota exceeded. Upgrade your account.');
    return;
  }

  try {
    // ... existing doc creation code ...
    
    // Decrement quota in Firestore
    const newCount = await FirebaseService.decrementQuota(user.uid, 'download');
    setQuotas(prev => ({ ...prev, downloadsLeft: newCount }));
    
  } catch (error) {
    setError(error.message);
  }
};
```

**Line ~1200** - Add AuthModal to render:
```javascript
{showAuthModal && (
  <AuthModal
    isOpen={showAuthModal}
    onClose={() => setShowAuthModal(false)}
    onAuthSuccess={() => setShowAuthModal(false)}
  />
)}
```

---

## Phase 3: Local Testing Setup

### Step 3.1: Install HTTP Server (One-time)
```bash
# If you haven't installed npm server yet
npm install -g http-server
```

### Step 3.2: Start Local Server
```bash
# Navigate to your project folder
cd /home/derrickmusamali/cbcaiug/cbcaiug.github.io

# Start server on port 8080
http-server -p 8080
```

**You'll see**:
```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.1.XXX:8080  <-- Use this for phone testing
```

### Step 3.3: Test on PC
1. Open browser: `http://localhost:8080/app.html`
2. Try signing in with email
3. Try Google sign-in
4. Try anonymous
5. Check quotas persist after refresh

### Step 3.4: Test on Phone (Same Network)
1. Find your PC's local IP (from http-server output)
2. On phone browser: `http://192.168.1.XXX:8080/app.html`
3. Test all auth methods
4. Verify quotas sync across devices

---

## Phase 4: Deployment

### Step 4.1: Review Changes
```bash
git status
git diff
```

### Step 4.2: Commit to Branch
```bash
git add .
git commit -m "feat(auth): add Firebase authentication

- app.html: add Firebase SDK scripts
- js/services/firebase.js: Firebase init and quota management
- js/components/AuthModal.js: sign-in/sign-up UI
- js/components/App.js: replace localStorage with Firestore
- CHANGES.md: track all modifications"
```

### Step 4.3: Merge to Main
```bash
git checkout main
git merge auth-firebase
```

### Step 4.4: Push to GitHub Pages
```bash
git push origin main
```

**Wait 2-3 minutes** → Visit `https://cbcaiug.github.io/app.html`

---

## Rollback Plan

If something breaks:

```bash
# Revert to previous commit
git checkout main
git reset --hard HEAD~1
git push origin main --force

# Or switch back to old branch
git checkout main
git branch -D auth-firebase
```

---

## Cost Analysis (Firebase Free Tier)

**Spark Plan (Free Forever)**:
- Authentication: Unlimited users
- Firestore Reads: 50,000/day
- Firestore Writes: 20,000/day
- Storage: 1 GB

**Your Usage Estimate**:
- 100 users/day × 5 quota checks = 500 reads/day ✅
- 100 users/day × 2 decrements = 200 writes/day ✅

**Conclusion**: You'll stay free indefinitely unless you get 10,000+ daily users.

---

## Security Notes

1. **Firestore Rules** prevent users from editing other users' quotas
2. **Client-side quota checks** are fine for your use case (not financial)
3. **Anonymous users** can upgrade to email later (preserves quotas)
4. **No passwords stored** - Firebase handles all security

---

## Next Steps

**Waiting for your approval to**:
1. Proceed with Firebase Console setup (I'll guide you)
2. Create the new files (firebase.js, AuthModal.js)
3. Make minimal edits to existing files
4. Test locally before pushing

**Reply with**: "Approved" or ask any questions!
