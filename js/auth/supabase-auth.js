/**
 * Supabase Authentication Module
 * Handles user sign-in/sign-up without email confirmation
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://qrkodwjhxrcrvsgkfeeo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya29kd2poeHJjcnZzZ2tmZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODA2OTIsImV4cCI6MjA3OTI1NjY5Mn0.dPf7TvcS-NmteJbg2QUt-ZVwrvNF2Bfw0Y3zgb9FtvQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const modalHTML = `
<style>
/* Modal base - mobile-first responsive, compact design */
#authModal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index: 10050; backdrop-filter: blur(4px); padding: 16px; pointer-events: auto; }
#authBox { background: var(--auth-bg, #0b1220); padding: 24px 20px 20px; width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 18px 50px rgba(2,6,23,0.85); font-family: Inter, sans-serif; position: relative; max-height: 90vh; overflow-y: auto; pointer-events: auto; }
#authBox img { display: block; margin: 0 auto 10px; height: 48px; border-radius: 8px; }
#authBox h2 { margin: 0 0 4px; font-size: 19px; font-weight: 600; text-align: center; color: var(--auth-text, #e6eef8); }
#authBox p { margin: 0 0 12px; font-size: 13px; color: var(--auth-subtext, #94a3b8); text-align: center; }
#authBox input { width: 100%; padding: 11px 12px; margin-bottom: 8px; border: 1px solid var(--auth-input-border, #1f2937); border-radius: 8px; font-size: 14px; box-sizing: border-box; background: var(--auth-input-bg, rgba(15,23,36,0.6)) !important; color: var(--auth-text, #e6eef8) !important; }
#authBox input:focus { outline: 2px solid #4f46e5; border-color: #4f46e5; background: var(--auth-input-bg, rgba(15,23,36,0.8)) !important; }
#authBox input:active { outline: 2px solid #4f46e5; background: var(--auth-input-bg, rgba(15,23,36,0.8)) !important; }
#authBox input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px rgba(15,23,36,0.8) inset !important; -webkit-text-fill-color: #e6eef8 !important; }
#authBox input::placeholder { color: #64748b; }
#authBox button { width: 100%; padding: 11px; margin-bottom: 6px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.12s; }
#authBox button:hover { transform: translateY(-1px); }
#signInBtn { background: #4f46e5; color: white; }
#signUpBtn { background: transparent; color: var(--auth-text, #e6eef8); border: 1px solid #374151; }
#googleBtn { background: var(--google-bg, #111827); color: var(--auth-text, #e6eef8); display:flex; align-items:center; gap:10px; justify-content:center; padding:10px; border-radius:8px; border:1px solid #374151; font-weight:600; }
#googleBtn img, #googleBtn svg { height:18px; width:18px; }
#authMessage { margin-top: 12px; padding: 10px 12px; border-radius: 6px; font-weight: 500; text-align: center; line-height: 1.4; }
#authMessage.error { background: #b91c1c; color: #ffffff; border: 1px solid #7f1d1d; }
#authMessage.success { background: #059669; color: #ffffff; border: 1px solid #047857; }
#passwordValidation { font-size:11px; color:#64748b; margin-top:-4px; margin-bottom:6px; }
#usernameExists { font-size:11px; color:#64748b; margin-top:-4px; margin-bottom:6px; }
#authFooter { display:flex; justify-content:space-between; gap:8px; align-items:center; margin-top: 4px; }
#forgotLink { font-size:12px; color:#6366f1; cursor:pointer; text-decoration:underline; }

/* Sign-out confirmation modal */
#signOutConfirmModal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index: 10051; backdrop-filter: blur(4px); padding: 16px; }
#signOutConfirmBox { background: var(--auth-bg, #0b1220); padding: 24px 20px; width: 100%; max-width: 350px; border-radius: 12px; box-shadow: 0 18px 50px rgba(2,6,23,0.85); font-family: Inter, sans-serif; }
#signOutConfirmBox h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--auth-text, #e6eef8); text-align: center; }
#signOutConfirmBox p { margin: 0 0 16px; font-size: 13px; color: var(--auth-subtext, #94a3b8); text-align: center; line-height: 1.4; }
#signOutConfirmBox .warning-box { background: rgba(239,68,68,0.1); border: 1px solid #dc2626; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 12px; color: #fca5a5; }
#signOutConfirmFooter { display: flex; gap: 8px; }
#signOutConfirmFooter button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.12s; }
#confirmSignOutBtn { background: #dc2626; color: white; }
#confirmSignOutBtn:hover { background: #b91c1c; }
#cancelSignOutBtn { background: #374151; color: var(--auth-text, #e6eef8); }
#cancelSignOutBtn:hover { background: #4b5563; }

/* Light mode override */
@media (prefers-color-scheme: light) {
  :root { --auth-bg: white; --auth-text: #0f172a; --auth-subtext: #475569; --auth-input-bg: #f8fafc; --auth-input-border: #e2e8f0; --google-bg: #ffffff; }
  #authBox { box-shadow: 0 18px 50px rgba(2,6,23,0.45); }
  #authBox input { border-color: #e2e8f0; }
  #signUpBtn { border-color: #e2e8f0; color: #0f172a; }
  #googleBtn { border-color: #e2e8f0; color: #0f172a; background: white; }
  #authMessage.error { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
  #authMessage.success { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
  #forgotLink { color: #4f46e5; }
  #signOutConfirmBox { background: white; box-shadow: 0 18px 50px rgba(2,6,23,0.45); }
  #signOutConfirmBox h3 { color: #0f172a; }
  #signOutConfirmBox p { color: #475569; }
  #signOutConfirmBox .warning-box { background: rgba(239,68,68,0.05); color: #991b1b; border-color: #fca5a5; }
  #cancelSignOutBtn { background: #e5e7eb; color: #0f172a; }
  #cancelSignOutBtn:hover { background: #d1d5db; }
}

</style>
<div id="signOutConfirmModal" style="display:none">
  <div id="signOutConfirmBox">
    <h3>Sign Out?</h3>
    <p>You will be signed out of your account.</p>
    <div class="warning-box">⚠️ All local chats, API keys, and settings will be cleared.</div>
    <div id="signOutConfirmFooter">
      <button id="cancelSignOutBtn" type="button">Cancel</button>
      <button id="confirmSignOutBtn" type="button">Sign Out</button>
    </div>
  </div>
</div>
<div id="authModal" style="display:none">
  <div id="authBox">
    <img src="https://cbcaiug.github.io/images/cbc-ai-tool-logo.jpeg" alt="CBC AI Tool">
    <h2>Welcome</h2>
    <p>Sign in to access AI assistants</p>

    <!-- Google sign-in button -->
    <button id="googleBtn" title="Continue with Google" type="button" aria-label="Continue with Google">
      <!-- Inline Google G logo (monochrome friendly) -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.6 8.1 3l5.9-5.9C34.9 3.5 29.8 1.5 24 1.5 14.6 1.5 6.9 6.9 3.1 14.7l6.9 5.4C11.3 14.1 17.2 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.5 24c0-1.5-.1-2.6-.4-3.8H24v7.2h12.7c-.6 3.2-2.7 5.8-5.7 7.6l8.8 6.8C44.4 36.7 46.5 30.9 46.5 24z"/>
        <path fill="#4A90E2" d="M9.9 28.1A14.6 14.6 0 0 1 9 24c0-1.3.2-2.6.6-3.8L2.7 14.8A24.5 24.5 0 0 0 0 24c0 3.9.9 7.6 2.7 11.2l7.2-7.1z"/>
        <path fill="#FBBC05" d="M24 46.5c6.5 0 11.9-2.1 15.9-5.7l-7.7-6.1c-2.4 1.6-5.5 2.6-8.2 2.6-6.9 0-12.8-4.6-15-10.9L2.7 33.9C6.9 41.7 14.6 46.5 24 46.5z"/>
      </svg>
      <span>Continue with Google</span>
    </button>

    <div style="height:10px"></div>

    <input id="usernameInput" type="text" placeholder="Username or Email" autocomplete="username">
    <div id="usernameExists"></div>
    <div style="position: relative;">
      <input id="passwordInput" type="password" placeholder="Password" autocomplete="current-password" style="padding-right: 42px;">
      <button id="togglePassword" type="button" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: auto !important; margin: 0; background: none; border: none; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center; z-index: 10;" title="Show/Hide Password" aria-label="Toggle password visibility">
        <svg id="eyeOffIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b;">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
        <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b; display: none;">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
    </div>
    <div id="passwordValidation">Password must be at least 6 characters</div>

    <div id="authFooter">
      <div style="flex:1">
        <button id="signInBtn">Sign In</button>
      </div>
      <div style="width:6px"></div>
      <div style="flex:1">
        <button id="signUpBtn">Create Account</button>
      </div>
    </div>

    <div style="margin-top:4px; display:flex; justify-content:center;">
      <span id="forgotLink">Forgot password?</span>
    </div>

    <div id="authMessage"></div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

// Get references to modal elements
const modal = document.getElementById('authModal');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const authMessage = document.getElementById('authMessage');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleBtn = document.getElementById('googleBtn');

// Password visibility toggle
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const eyeOffIcon = document.getElementById('eyeOffIcon');
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    // eyeOffIcon (crossed) shows when password is HIDDEN, eyeIcon shows when password is VISIBLE
    eyeOffIcon.style.display = isPassword ? 'none' : 'block';
    eyeIcon.style.display = isPassword ? 'block' : 'none';
  });
}

const showModal = () => {
  // Check persistent flag first - prevents modal from reappearing after hideModal
  if (window.__authModalShouldBeHidden) return;

  // Don't flash the auth modal immediately after a signin event; allow
  // a short suppression window set by signin handlers.
  try {
    const suppressUntil = window.__suppressAuthModalUntil || 0;
    if (Date.now() < suppressUntil) return;
  } catch (e) { /* ignore */ }

  // Clear flag when explicitly showing modal
  window.__authModalShouldBeHidden = false;

  // Clear any previous messages (for example a lingering "Login successful")
  try { showMessage(''); } catch (e) { }
  if (modal) {
    modal.style.display = 'flex';
    modal.style.pointerEvents = 'auto';
  }
};
const hideModal = () => {
  // Set persistent flag to prevent modal from reappearing
  window.__authModalShouldBeHidden = true;
  if (modal) {
    modal.style.display = 'none';
    modal.style.pointerEvents = 'none';
  }
};


const showMessage = (msg, type = 'error') => {
  if (!authMessage) return;

  if (!msg) {
    authMessage.style.display = 'none';
    authMessage.textContent = '';
    authMessage.className = '';
    return;
  }

  authMessage.style.display = 'block';
  authMessage.textContent = msg;
  authMessage.className = type;
  // Ensure message is visible by scrolling to bottom of authBox if needed
  const box = document.getElementById('authBox');
  if (box) box.scrollTop = box.scrollHeight;
};

const ensureQuotaRow = async (userId) => {
  const { data } = await supabase.from('usage_quotas').select('user_id').eq('user_id', userId).maybeSingle();
  if (!data) {
    await supabase.from('usage_quotas').insert([{ user_id: userId, free_generations_remaining: 50, free_downloads_remaining: 20, accepted_terms: false }]);
  }
};

// Handle authentication state changes (login, logout, OAuth callback, etc.)
const handleAuthStateChange = async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session?.user) {
      const userId = session.user.id;

      // Prevent double-processing the same sign-in event
      if (window.__lastProcessedSignIn === userId) {
        return;  // Already processed this sign-in
      }
      window.__lastProcessedSignIn = userId;

      // Suppress modal with longer window to cover OAuth callbacks
      try { window.__suppressAuthModalUntil = Date.now() + 3500; } catch (e) { }

      // Ensure quota row exists for this user (covers OAuth sign-ups too)
      await ensureQuotaRow(userId);

      const { data: quota } = await supabase.from('usage_quotas').select('*').eq('user_id', userId).maybeSingle();
      // Broadcast the latest quota to the app so all open tabs/browsers update UI
      try {
        if (quota) {
          window.dispatchEvent(new CustomEvent('quotaUpdated', { detail: quota }));
        }
      } catch (e) {
        console.warn('Could not dispatch quotaUpdated event', e);
      }

      // Notify the app that a user signed in so it can refresh UI/state
      try {
        window.dispatchEvent(new CustomEvent('userSignedIn', { detail: { userId } }));
      } catch (e) { console.warn('userSignedIn dispatch failed', e); }

      // For Google OAuth, auto-accept terms on first sign-in
      if (window.__autoAcceptTermsForOAuth) {
        try {
          const { data: quota } = await supabase.from('usage_quotas')
            .select('accepted_terms')
            .eq('user_id', userId)
            .maybeSingle();

          if (!quota || !quota.accepted_terms) {
            await window.supabaseAuth.acceptTerms();
          }
        } catch (err) {
          console.warn('Failed to auto-accept terms for OAuth:', err);
        }
        window.__autoAcceptTermsForOAuth = false; // Clear flag
      }

      // Always hide auth modal; App now just loads assistant (no ConsentModal)
      hideModal();

      // Add page reload warning when user is signed in
      window.onbeforeunload = function (e) {
        // Modern browsers ignore custom messages and show generic warning
        // But we still need to return a value to trigger the confirmation
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Some browsers use return value
      };
    }
  } else if (event === 'SIGNED_OUT') {
    // User signed out - clear form fields, validation, and show modal
    window.__authModalShouldBeHidden = false;  // Clear persistent flag
    window.__lastProcessedSignIn = null;        // Reset sign-in tracking

    // Remove page reload warning when user signs out
    window.onbeforeunload = null;

    try {
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      // Clear password validation message
      if (passwordValidation) {
        passwordValidation.textContent = 'Password must be at least 6 characters';
        passwordValidation.style.color = '';
      }
      showMessage(''); // Clear any messages
    } catch (e) { console.warn('Failed to clear form fields', e); }

    setTimeout(() => {
      showModal();
      // Ensure auth initialization completes so loader can be dismissed
      if (window.authInitComplete) {
        window.authInitComplete();
      }
    }, 100);
  }
};

// Subscribe to auth state changes (includes OAuth callbacks)
const authSubscription = supabase.auth.onAuthStateChange(handleAuthStateChange);

// SECURITY: Force sign-out on every page reload
// This ensures users must re-authenticate and prevents showing cached user data
(async () => {
  try {
    // Check if there's an active session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Sign out any existing session on page load
      await supabase.auth.signOut();

      // Clear all form fields
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
      showMessage('');
    }

    // Always show modal on page load (clean state)
    showModal();

    // Signal auth initialization complete
    if (window.authInitComplete) {
      window.authInitComplete();
    }
  } catch (err) {
    console.error('Error during forced sign-out:', err);
    showModal();
  }
})();


// Sign In
signInBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) {
    return showMessage('Enter username/email and password');
  }

  // Visual feedback: green button with checkmark
  const originalHTML = signInBtn.innerHTML;
  signInBtn.innerHTML = '<span style="display:flex;align-items:center;gap:4px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Signing In...</span>';
  signInBtn.style.background = '#10b981';
  signInBtn.disabled = true;

  const email = username.includes('@') ? username : `${username}@local.app`;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Restore button
  signInBtn.innerHTML = originalHTML;
  signInBtn.style.background = '';
  signInBtn.disabled = false;

  if (error) {
    // Provide clearer messages
    if (/invalid login credentials|Invalid login credentials/i.test(error.message)) {
      return showMessage('Invalid username or password');
    }
    return showMessage(error.message);
  }
  if (data?.user) {
    // Suppress modal briefly
    try { window.__suppressAuthModalUntil = Date.now() + 2000; } catch (e) { }
    hideModal();
    await ensureQuotaRow(data.user.id);
    // Notify app
    try {
      window.dispatchEvent(new CustomEvent('userSignedIn', { detail: { userId: data.user.id } }));
    } catch (e) { console.warn('userSignedIn dispatch failed', e); }
  }
});

// --- Google sign-in button handler ---
// Note: The Supabase console must have the correct redirect URIs configured:
// - https://cbcaiug.github.io/app.html
// - https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback
// The Google prompt showing "qrkodwjhxrcrvsgkfeeo.supabase.co" is normal OAuth flow.
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    showMessage('Redirecting to Google...', '');
    try {
      // Build the redirect URL to ensure user returns to the app after OAuth callback
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/app.html`;

      // For Google OAuth, we auto-accept terms on first sign-in
      // This is set in handleAuthStateChange when OAuth user signs in
      window.__autoAcceptTermsForOAuth = true;

      // Initiate Google OAuth flow with proper redirect
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    } catch (err) {
      console.error('Google sign-in error', err);
      showMessage('Google sign-in failed. Try again later.');
      window.__autoAcceptTermsForOAuth = false;
    }
  });
}

// --- NEW: Live password validation (simple length check) ---
const passwordValidation = document.getElementById('passwordValidation');
const usernameExistsNode = document.getElementById('usernameExists');
passwordInput.addEventListener('input', () => {
  const v = passwordInput.value || '';
  if (v.length >= 6) {
    passwordValidation.textContent = 'Good — password length OK';
    passwordValidation.style.color = '#059669';
  } else {
    passwordValidation.textContent = 'Password must be at least 6 characters';
    passwordValidation.style.color = '';
  }
});

// Lightweight username/email hint (non-destructive)
usernameInput.addEventListener('input', () => {
  const val = usernameInput.value.trim();
  if (!val) {
    usernameExistsNode.textContent = '';
    return;
  }
  if (val.includes('@')) {
    usernameExistsNode.textContent = 'Looks like an email address';
  } else {
    usernameExistsNode.textContent = 'Will be used as your username';
  }
});

// --- Forgot password link handler ---
const forgotLink = document.getElementById('forgotLink');
if (forgotLink) {
  forgotLink.addEventListener('click', () => {
    alert('Password recovery feature coming soon! Please contact support at support@cbcaiug.com for assistance.');
  });
}

// --- Sign-out confirmation modal handlers (Commit 2) ---
const signOutConfirmModal = document.getElementById('signOutConfirmModal');
const confirmSignOutBtn = document.getElementById('confirmSignOutBtn');
const cancelSignOutBtn = document.getElementById('cancelSignOutBtn');

const hideSignOutConfirmModal = () => {
  if (signOutConfirmModal) signOutConfirmModal.style.display = 'none';
};

const performSignOut = async () => {
  hideSignOutConfirmModal();
  try {
    await supabase.auth.signOut();
    // Clear session-related localStorage to avoid leaking previous chat when a new user signs in
    try {
      const keys = Object.keys(localStorage || {});
      keys.forEach(k => {
        if (k && (k.startsWith('chatHistory_') || k === 'cbc_chat_history' || k === 'aiAssistantState' || k === 'trialGenerationsCount' || k === 'saveUsageCount' || k === 'generationCount' || k === 'trialPolicyVersion' || k === 'userConsentV1' || k === 'cbc_chat_history_autosave')) {
          try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
        }
      });
    } catch (e) { console.warn('Failed to clear session localStorage on signOut', e); }

    // Notify app and tabs about sign-out; rely on auth state handler to show modal
    try { window.dispatchEvent(new CustomEvent('userSignedOut')); } catch (e) { console.warn('userSignedOut dispatch failed', e); }
  } catch (err) {
    console.error('Sign-out error', err);
    showMessage('Sign-out failed. Please try again.');
  }
};

if (confirmSignOutBtn) {
  confirmSignOutBtn.addEventListener('click', performSignOut);
}

if (cancelSignOutBtn) {
  cancelSignOutBtn.addEventListener('click', hideSignOutConfirmModal);
}

// --- Enhance Sign Up error handling to indicate existing accounts ---
// Sign Up (wrap original handler to improve messages)
signUpBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage('Enter username/email and password');
  if (password.length < 6) return showMessage('Password must be at least 6 characters');

  // Visual feedback: green button with checkmark
  const originalHTML = signUpBtn.innerHTML;
  signUpBtn.innerHTML = '<span style="display:flex;align-items:center;gap:4px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Signing Up...</span>';
  signUpBtn.style.background = '#10b981';
  signUpBtn.disabled = true;

  const email = username.includes('@') ? username : `${username}@local.app`;
  const { data, error } = await supabase.auth.signUp({ email, password });

  // Restore button
  signUpBtn.innerHTML = originalHTML;
  signUpBtn.style.background = '';
  signUpBtn.disabled = false;

  if (error) {
    // Try to provide clearer messaging
    const msg = error.message || '';
    if (/already|duplicate|exists/i.test(msg)) {
      return showMessage('An account with this email/username already exists. Try signing in.');
    }
    return showMessage(msg);
  }
  if (data?.user) {
    // Suppress modal briefly to prevent flashing
    try { window.__suppressAuthModalUntil = Date.now() + 2000; } catch (e) { }

    // Hide modal immediately
    hideModal();

    // Ensure quota row exists
    await ensureQuotaRow(data.user.id);

    // Notify app that a user has signed in - this triggers the App.js listener
    // which will check accepted_terms and show consent modal for first-time users
    try {
      window.dispatchEvent(new CustomEvent('userSignedIn', { detail: { userId: data.user.id } }));
    } catch (e) { console.warn('userSignedIn dispatch failed', e); }
  }
});

// Export API
window.supabaseAuth = {
  supabase,
  async getQuota() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('usage_quotas').select('*').eq('user_id', user.id).single();
    return data;
  },
  async consume(action) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not signed in');
    const rpc = action === 'generation' ? 'consume_generation' : 'consume_download';
    const { error } = await supabase.rpc(rpc, { p_user_id: user.id });
    if (error) throw error;
  },
  async signOut() {
    // Show confirmation modal instead of reloading immediately
    const confirmModal = document.getElementById('signOutConfirmModal');
    if (confirmModal) confirmModal.style.display = 'flex';
  },
  async acceptTerms() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use update instead of upsert to avoid resetting other columns
      await supabase.from('usage_quotas')
        .update({ accepted_terms: true })
        .eq('user_id', user.id);
      // Dispatch event so app can close consent modal and load assistant
      try { window.dispatchEvent(new CustomEvent('termsAccepted', { detail: { userId: user.id } })); } catch (e) { }
    }
  },
  subscribeToQuotaUpdates(callback) {
    // Create a channel when the user is available. Return an unsubscribe function
    // synchronously so callers can remove the listener in cleanups.
    let channelRef = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channelRef = supabase.channel('quota-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'usage_quotas',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          callback(payload.new);
        })
        .subscribe();
    }).catch(err => console.warn('subscribeToQuotaUpdates getUser failed', err));

    // Return an unsubscribe function immediately. If channel isn't ready yet,
    // attempt to remove it later when available.
    return () => {
      if (channelRef) {
        try { supabase.removeChannel(channelRef); } catch (e) { console.warn('removeChannel failed', e); }
        channelRef = null;
      } else {
        // Channel not yet created; attempt to remove after a short delay
        setTimeout(() => {
          if (channelRef) {
            try { supabase.removeChannel(channelRef); } catch (e) { console.warn('removeChannel failed', e); }
            channelRef = null;
          }
        }, 1000);
      }
    };
  }
};

// Hook for consent modal
window.showConsentModal = () => {
  const event = new CustomEvent('showConsent');
  window.dispatchEvent(event);
};

// Signal that auth initialization is complete (used for smooth loading transition)
if (window.authInitComplete) {
  window.authInitComplete();
}
