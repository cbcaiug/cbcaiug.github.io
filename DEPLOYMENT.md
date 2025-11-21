# Deployment Guide

## 🚀 Deploying CBC AI Tool

### Prerequisites
- Google Account (for Apps Script backend)
- Netlify Account (for frontend hosting)
- Git repository

---

## 📦 Backend Deployment (Google Apps Script)

### Step 1: Create Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "CBC AI Tool Backend"

### Step 2: Add Code Files
1. Copy contents of `ai-suite-assets/GAS.js`
2. Paste into Code.gs in Apps Script editor
3. Save (Ctrl+S or Cmd+S)

### Step 3: Create Google Sheets
Create 3 sheets in Google Drive:

**1. Analytics Sheet:**
- Columns: Timestamp, SessionID, EventType, AssistantName, ModelName, UserType, Details, CartID, ItemID, DocDownloadURL

**2. Prompts Sheet:**
- Columns: AssistantName, PromptContent

**3. Updates Sheet:**
- Columns: Timestamp, Message, URL

### Step 4: Update Sheet IDs in GAS.js
```javascript
const ANALYTICS_SHEET_ID = 'YOUR_ANALYTICS_SHEET_ID';
const PROMPTS_SHEET_ID = 'YOUR_PROMPTS_SHEET_ID';
const UPDATES_SHEET_ID = 'YOUR_UPDATES_SHEET_ID';
```

### Step 5: Add API Keys to Script Properties
1. Click Project Settings (gear icon)
2. Scroll to "Script Properties"
3. Add properties:
   - `TRIAL_API_KEY_1` = Your Gemini API Key 1
   - `TRIAL_API_KEY_2` = Your Gemini API Key 2
   - `TRIAL_API_KEY_3` = Your Gemini API Key 3

### Step 6: Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Select type: "Web app"
3. Description: "CBC AI Tool Backend v1"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. **Copy the Web App URL** (you'll need this)

### Step 7: Authorize Permissions
1. Click "Review permissions"
2. Choose your Google account
3. Click "Advanced" → "Go to CBC AI Tool Backend (unsafe)"
4. Click "Allow"

---

## 🌐 Frontend Deployment (Netlify)

### Step 1: Prepare Repository
1. Ensure `ai-suite-assets/` folder is in your repo
2. Create `.gitignore`:
```
node_modules/
.DS_Store
*.log
```

### Step 2: Update Backend URL
In `ai-suite-assets/js/services/api.js`:
```javascript
const GAS_WEB_APP_URL = 'YOUR_WEB_APP_URL_FROM_STEP_6';
```

### Step 3: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git repository
4. Configure build settings:
   - Base directory: `ai-suite-assets`
   - Build command: (leave empty)
   - Publish directory: `.` (current directory)
5. Click "Deploy site"

### Step 4: Configure Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

### Step 5: Enable HTTPS
Netlify automatically provisions SSL certificate.

---

## 🔄 Updating the Application

### Backend Updates
1. Edit code in Apps Script editor
2. Click "Deploy" → "Manage deployments"
3. Click pencil icon next to active deployment
4. Select "New version"
5. Click "Deploy"

**Note:** URL remains the same, no frontend changes needed.

### Frontend Updates
1. Push changes to Git repository
2. Netlify auto-deploys from main branch
3. Check deploy status in Netlify dashboard

---

## 🧪 Testing Deployment

### Test Backend
```bash
curl "YOUR_WEB_APP_URL?action=getAssistants"
```
Should return JSON with assistant list.

### Test Frontend
1. Visit your Netlify URL
2. Open browser console (F12)
3. Check for errors
4. Try generating a response
5. Verify analytics logging in Google Sheets

---

## 📊 Monitoring

### Analytics Sheet
Monitor user activity:
- Filter by EventType
- Track SessionID patterns
- Monitor API key usage

### Netlify Analytics
- Page views
- Bandwidth usage
- Deploy history

### Google Apps Script Logs
1. Open Apps Script editor
2. Click "Executions" (clock icon)
3. View execution logs and errors

---

## 🔐 Security Checklist

- [ ] Script Properties contain API keys (not hardcoded)
- [ ] Apps Script deployed with "Execute as: Me"
- [ ] HTTPS enabled on Netlify
- [ ] Sheet IDs not exposed in frontend code
- [ ] CORS properly configured in Apps Script

---

## 🐛 Troubleshooting

### "Application failed to start"
- Check browser console for errors
- Verify GAS_WEB_APP_URL is correct
- Ensure all script files loaded

### "Failed to fetch trial key"
- Check Script Properties have API keys
- Verify Apps Script permissions
- Check Apps Script execution logs

### Downloads not working
- Verify GAS.js has handleDocDownload function
- Check Apps Script has Drive API access
- Test download URL directly

---

## 📝 Deployment Checklist

**Backend:**
- [ ] Apps Script project created
- [ ] GAS.js code added
- [ ] Sheet IDs updated
- [ ] API keys added to Script Properties
- [ ] Web app deployed
- [ ] Permissions authorized

**Frontend:**
- [ ] GAS_WEB_APP_URL updated
- [ ] Repository pushed to Git
- [ ] Netlify site created
- [ ] Build successful
- [ ] HTTPS enabled

**Testing:**
- [ ] Backend API responds
- [ ] Frontend loads without errors
- [ ] Can generate responses
- [ ] Analytics logging works
- [ ] Downloads work on mobile
- [ ] All assistants load

---

## 🎉 Post-Deployment

1. Share production URL with users
2. Monitor analytics for first 24 hours
3. Check for error patterns
4. Gather user feedback
5. Plan iterative improvements

---

## 📞 Support

Issues? Contact:
- WhatsApp: +256726654714
- Email: derrickmusamali@gmail.com
