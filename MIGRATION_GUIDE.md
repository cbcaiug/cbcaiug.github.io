# Complete Migration Guide: CBC AI → TeachDeeper

## Overview
Migrating from `cbcaiug.github.io` to `teachdeeper.web.app` (or `teachdeeper.vercel.app`)

**Timeline:** 2-3 hours  
**Difficulty:** Medium  
**Reversible:** Yes (keep old project as backup)

---

## Table of Contents
1. [Pre-Migration Checklist](#1-pre-migration-checklist)
2. [Firebase Project Setup](#2-firebase-project-setup)
3. [Code Changes Required](#3-code-changes-required)
4. [Deployment Options](#4-deployment-options)
5. [DNS & Domain Setup](#5-dns--domain-setup)
6. [SEO & Search Console](#6-seo--search-console)
7. [Testing Checklist](#7-testing-checklist)
8. [Rollback Plan](#8-rollback-plan)

---

## 1. Pre-Migration Checklist

### Backup Current State
```bash
# Create backup branch
git checkout -b backup-pre-teachdeeper
git push origin backup-pre-teachdeeper

# Export Firestore data (optional)
# Go to Firebase Console → Firestore → Import/Export
```

### Document Current Setup
- [ ] Current domain: `cbcaiug.github.io`
- [ ] Firebase project: `cbcaiug-auth`
- [ ] Total users: _____ (check Firebase Auth)
- [ ] Google Search Console verified: Yes/No
- [ ] Analytics tracking ID: `G-YCTLDP04EJ`

---

## 2. Firebase Project Setup

### A. Create New Project
1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Project name: `teachdeeper`
4. Project ID: `teachdeeper` (or auto-generated)
5. Disable Google Analytics (can enable later)
6. Click **"Create project"**

### B. Enable Authentication
1. **Firebase Console** → **Authentication** → **Get Started**
2. **Sign-in method** tab:
   - Enable **Email/Password**
   - Enable **Google**
     - Support email: `cbcaitool@gmail.com`
     - Click **Save**

### C. Create Firestore Database
1. **Firestore Database** → **Create database**
2. Choose **Production mode**
3. Location: `europe-west1` (closest to Uganda)
4. Click **Enable**

### D. Copy Firestore Rules
1. **Old project** (cbcaiug-auth) → Firestore → **Rules** tab
2. Copy this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. **New project** (teachdeeper) → Firestore → **Rules** tab
4. Paste and click **Publish**

### E. Add Admin Account
1. **Authentication** → **Users** → **Add user**
2. Email: `cbcaitool@gmail.com`
3. Password: (your secure password)
4. Click **Add user**

### F. Get Firebase Config
1. **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"** section
3. Click **Web icon** (</>) → **Register app**
4. App nickname: `TeachDeeper Web`
5. **Also set up Firebase Hosting** (check this box)
6. Click **Register app**
7. **Copy the firebaseConfig object** (you'll need this)

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "teachdeeper.firebaseapp.com",
  projectId: "teachdeeper",
  storageBucket: "teachdeeper.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 3. Code Changes Required

### Files to Update (18 files total)

#### **Critical Files (Firebase Config)**
1. `src/services/firebase.js` - Replace firebaseConfig object
2. `admin.html` - Replace firebaseConfig object

#### **Branding Updates (16 files)**
Replace "CBC AI" → "TeachDeeper" and "cbcaiug" → "teachdeeper"

**HTML Pages:**
- `index.html`
- `app.html`
- `about.html`
- `aboutMe.html`
- `faq.html`
- `samples.html`
- `terms.html`
- `privacy.html`
- `gift.html`
- `admin.html`

**JavaScript Files:**
- `src/components/App.js`
- `src/components/AuthModal.js`
- `src/components/Chat.js`
- `src/components/Modals.js`
- `src/components/WelcomeView.js`
- `src/utils/helpers.js`

**Config Files:**
- `manifest.json`
- `README.md`

### Branding Changes Breakdown

| Old | New |
|-----|-----|
| CBC AI | TeachDeeper |
| CBC AI Tool | TeachDeeper |
| cbcaiug.github.io | teachdeeper.web.app |
| cbcaiug-auth | teachdeeper |

### URLs to Update
- Logo URLs: Keep GitHub raw URLs (they still work)
- Internal links: No change needed (relative paths)
- External links: Update in social media

---

## 4. Deployment Options

### Option A: Firebase Hosting (Recommended)

**Pros:**
- Free SSL certificate
- Global CDN
- Easy rollback
- Integrated with Firebase Auth

**Steps:**
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting
# Select: teachdeeper project
# Public directory: . (current directory)
# Single-page app: No
# Overwrite files: No

# Deploy
firebase deploy --only hosting
```

**Result:** `https://teachdeeper.web.app` and `https://teachdeeper.firebaseapp.com`

### Option B: Vercel

**Pros:**
- Faster builds
- Better analytics
- Easy custom domain setup
- Free SSL

**Steps:**
1. Go to https://vercel.com
2. Import Git repository
3. Framework: None (static site)
4. Root directory: `./`
5. Click **Deploy**

**Result:** `https://teachdeeper.vercel.app`

### Option C: Keep GitHub Pages + New Domain

**Pros:**
- No migration needed
- Just add custom domain

**Steps:**
1. Buy domain: `teachdeeper.com`
2. Add CNAME record: `teachdeeper.com` → `cbcaiug.github.io`
3. Update GitHub Pages settings

---

## 5. DNS & Domain Setup

### Future: Buy teachdeeper.com (via Vercel)

**Cost:** ~$15/year

**Steps:**
1. Vercel Dashboard → Domains → **Buy Domain**
2. Search: `teachdeeper.com`
3. Purchase
4. Auto-configured (no DNS setup needed)

**Alternative: Buy via Namecheap/GoDaddy**
1. Buy domain
2. Add DNS records:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

---

## 6. SEO & Search Console

### A. Google Search Console

**Old Property:** `cbcaiug.github.io`

**New Property Setup:**
1. Go to https://search.google.com/search-console
2. Click **Add Property**
3. URL: `https://teachdeeper.web.app`
4. Verification method: **HTML file**
   - Download verification file
   - Add to root directory
   - Deploy
   - Click **Verify**

### B. Submit New Sitemap
1. In Search Console → **Sitemaps**
2. Enter: `sitemap.xml`
3. Click **Submit**

### C. Update sitemap.xml
Replace all URLs:
```xml
<!-- Old -->
<loc>https://cbcaiug.github.io/</loc>

<!-- New -->
<loc>https://teachdeeper.web.app/</loc>
```

### D. Set Up 301 Redirects (Old Site)

**On GitHub Pages (cbcaiug.github.io):**

Create `index.html` with redirect:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;url=https://teachdeeper.web.app">
  <link rel="canonical" href="https://teachdeeper.web.app">
</head>
<body>
  <p>Site moved to <a href="https://teachdeeper.web.app">teachdeeper.web.app</a></p>
  <script>window.location.href="https://teachdeeper.web.app"</script>
</body>
</html>
```

### E. Update Social Media Links
- [ ] WhatsApp status/bio
- [ ] Email signature
- [ ] LinkedIn
- [ ] Twitter/X
- [ ] Facebook

---

## 7. Testing Checklist

### Before Going Live
- [ ] Firebase Auth works (Email/Password)
- [ ] Firebase Auth works (Google Sign-in)
- [ ] User quotas sync correctly
- [ ] Downloads decrement quota
- [ ] Messages decrement quota
- [ ] Admin panel accessible
- [ ] All pages load correctly
- [ ] Mobile responsive
- [ ] PWA install works
- [ ] Service worker caches assets

### Test URLs
```
https://teachdeeper.web.app/
https://teachdeeper.web.app/app.html
https://teachdeeper.web.app/about.html
https://teachdeeper.web.app/assistants/item-writer.html
```

### Test User Flows
1. **New User Signup**
   - Sign up with email
   - Verify quotas: 20 downloads, 50 messages
   
2. **Existing User Login**
   - Login with Google
   - Check quota persistence

3. **Generate Content**
   - Use Item Writer
   - Download as Word
   - Verify quota decrements

4. **Admin Access**
   - Login as admin
   - View all users
   - Reset user quota

---

## 8. Rollback Plan

### If Something Goes Wrong

**Immediate Rollback:**
```bash
# Switch back to old branch
git checkout main
git push origin main --force

# Or revert to backup
git checkout backup-pre-teachdeeper
git checkout -b main
git push origin main --force
```

**Keep Old Firebase Project:**
- Don't delete `cbcaiug-auth` project
- Keep it as backup for 30 days
- Export all Firestore data before deletion

**DNS Rollback:**
- Remove new domain DNS records
- Point back to `cbcaiug.github.io`

---

## 9. Post-Migration Tasks

### Week 1
- [ ] Monitor Firebase usage (Auth, Firestore)
- [ ] Check Google Analytics traffic
- [ ] Verify Search Console indexing
- [ ] Test on multiple devices
- [ ] Collect user feedback

### Week 2-4
- [ ] Update all external links
- [ ] Request re-indexing in Search Console
- [ ] Monitor error logs
- [ ] Check quota usage patterns

### Month 2+
- [ ] Delete old Firebase project (cbcaiug-auth)
- [ ] Remove old GitHub Pages site
- [ ] Consider buying teachdeeper.com domain

---

## 10. Cost Breakdown

### Current (Free)
- GitHub Pages: $0
- Firebase Spark Plan: $0
- Domain: $0

### After Migration (Free)
- Firebase Hosting: $0 (10GB/month free)
- Firebase Auth: $0 (unlimited)
- Firestore: $0 (1GB storage, 50K reads/day free)
- Vercel: $0 (100GB bandwidth/month free)

### Future (Optional)
- Custom domain (teachdeeper.com): ~$15/year
- Firebase Blaze Plan: Pay-as-you-go (if you exceed free tier)

---

## 11. Quick Reference

### Important URLs
- **Old site:** https://cbcaiug.github.io
- **New site:** https://teachdeeper.web.app
- **Firebase Console:** https://console.firebase.google.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Search Console:** https://search.google.com/search-console

### Support Contacts
- Firebase Support: https://firebase.google.com/support
- Vercel Support: support@vercel.com
- Domain Registrar: (depends on provider)

---

## 12. Automation Script (Optional)

Save time with this script to update all branding:

```bash
#!/bin/bash
# Run from project root

# Backup first
git checkout -b migration-teachdeeper

# Replace branding in all files
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec sed -i 's/CBC AI/TeachDeeper/g' {} +

find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec sed -i 's/cbcaiug\.github\.io/teachdeeper.web.app/g' {} +

find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.json" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec sed -i 's/cbcaiug-auth/teachdeeper/g' {} +

echo "Branding updated! Review changes with: git diff"
```

---

## Need Help?

**Common Issues:**

1. **Firebase Auth not working**
   - Check authorized domains in Firebase Console
   - Add `teachdeeper.web.app` to authorized domains

2. **Firestore permission denied**
   - Verify security rules are published
   - Check user is authenticated

3. **Domain not resolving**
   - DNS propagation takes 24-48 hours
   - Use https://dnschecker.org to verify

4. **Old site still showing**
   - Clear browser cache
   - Try incognito mode
   - Check CDN cache (Firebase/Vercel)

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Author:** Migration Guide for TeachDeeper
