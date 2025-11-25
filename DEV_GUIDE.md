# Local Development & Deployment Guide

## Local Testing

### Start Dev Server (PC Only)
```bash
npm run serve
```
Server will start at: `http://localhost:8080`

### Start Dev Server (PC + Phone on Same Network)
```bash
npm run serve:network
```
Server will start at: `http://localhost:8080` and `http://YOUR_IP:8080`

To find your IP address:
```bash
hostname -I | awk '{print $1}'
```

## Git Workflow - Push to Main

### Method 1: Single Command (Copy & Paste)
```bash
git add . && git commit -m "fix: remove unsupported Gemini models" && git push origin main
```

### Method 2: Step-by-Step
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "fix: remove unsupported Gemini models"

# Push to main branch
git push origin main
```

## Testing Checklist
- [ ] Test model selection on PC (localhost:8080)
- [ ] Test model selection on phone (network IP:8080)
- [ ] Verify all models work with API key
- [ ] Check error handling
- [ ] Push to GitHub
- [ ] Verify on live site
