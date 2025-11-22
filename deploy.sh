#!/bin/bash

# Fix OTP modal and sidebar user display

cd /home/derrickmusamali/cbcaiug.github.io/cbcaiug.github.io

git add js/auth/supabase-auth.js

git commit -m "fix(auth): improve OTP input UX and sidebar user display

- js/auth/supabase-auth.js: auto-advance cursor between OTP boxes
- js/auth/supabase-auth.js: fix number visibility with better styling
- js/auth/supabase-auth.js: trigger authStateChanged event for immediate sidebar update
- js/auth/supabase-auth.js: add arrow key navigation for OTP inputs"

git push origin main

echo "✅ Changes deployed successfully!"
