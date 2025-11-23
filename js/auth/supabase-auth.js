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
/* Modal base - mobile-first responsive */
#authModal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index: 99999 !important; backdrop-filter: blur(4px); padding: 16px; }
#authBox { background: var(--auth-bg, white); padding: 20px; width: 100%; max-width: 420px; border-radius: 12px; box-shadow: 0 18px 50px rgba(2,6,23,0.45); font-family: Inter, sans-serif; position: relative; z-index: 100000 !important; }
#authBox * { position: relative; z-index: 100001 !important; }
#authBox img { display: block; margin: 0 auto 12px; height: 56px; border-radius: 8px; }
#authBox h2 { margin: 0 0 6px; font-size: 20px; font-weight: 600; text-align: center; color: var(--auth-text, #0f172a); }
#authBox p { margin: 0 0 14px; font-size: 13px; color: var(--auth-subtext, #475569); text-align: center; }
#authBox input { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #e6e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: var(--auth-input-bg, white) !important; color: var(--auth-text, #0f172a) !important; }
#authBox input:focus { outline: 2px solid #4f46e5; border-color: #4f46e5; }
#authBox button { width: 100%; padding: 12px; margin-bottom: 8px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.12s; }
#authBox button:hover { transform: translateY(-1px); }
#signInBtn { background: #4f46e5; color: white; }
#signUpBtn { background: transparent; color: var(--auth-text, #0f172a); border: 1px solid #e6e7eb; }
#googleBtn { background: var(--google-bg, #ffffff); color: var(--auth-text, #0f172a); display:flex; align-items:center; gap:10px; justify-content:center; padding:10px; border-radius:8px; border:1px solid #e6e7eb; font-weight:600; }
#googleBtn img, #googleBtn svg { height:18px; width:18px; }
#authMessage { min-height: 20px; font-size: 13px; margin-top: 8px; padding: 8px; border-radius: 6px; }
#authMessage.error { background: #fee; color: #c00; }
#authMessage.success { background: #e6ffed; color: #04660a; }
#passwordValidation { font-size:12px; color:#94a3b8; margin-top:-6px; margin-bottom:8px; }
#usernameExists { font-size:12px; color:#94a3b8; margin-top:-6px; margin-bottom:8px; }
#authFooter { display:flex; justify-content:space-between; gap:8px; align-items:center; }
#forgotLink { font-size:13px; color:#4f46e5; cursor:pointer; text-decoration:underline; }
#forgotFlow { display:none; margin-top:8px; }

/* Dark mode tweaks */
@media (prefers-color-scheme: dark) {
  :root { --auth-bg: #0b1220; --auth-text: #e6eef8; --auth-subtext: #94a3b8; --auth-input-bg: #0f1724; --google-bg: #111827; }
  #authBox { box-shadow: 0 18px 50px rgba(2,6,23,0.75); }
  #authBox input { border-color: #1f2937; }
  #signUpBtn { border-color: #1f2937; }
}

/* Keep modal centered and avoid overflow */
#authBox { max-height: calc(100vh - 64px); overflow-y: auto; }

</style>
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
    <input id="passwordInput" type="password" placeholder="Password" autocomplete="current-password">
    <div id="passwordValidation">Password must be at least 6 characters</div>

    <div id="authFooter">
      <div style="flex:1">
        <button id="signInBtn">Sign In</button>
      </div>
      <div style="width:8px"></div>
      <div style="flex:1">
        <button id="signUpBtn">Create Account</button>
      </div>
    </div>

    <div style="margin-top:6px; display:flex; justify-content:center;">
      <span id="forgotLink">Forgot password?</span>
    </div>

    <!-- Staged forgot-password flow (hidden by default to avoid breaking current auth) -->
    <div id="forgotFlow">
      <p style="font-size:13px; color:var(--auth-subtext); margin-bottom:8px;">Enter the email where we should send a recovery code (feature staged)</p>
      <input id="forgotEmailInput" type="email" placeholder="your.email@example.com">
      <button id="sendRecoveryBtn" style="margin-top:8px;">Request recovery code</button>
      <div id="forgotMessage" style="margin-top:8px; font-size:13px;"></div>
    </div>

    <div id="authMessage"></div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('authModal');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const authMessage = document.getElementById('authMessage');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');

const showModal = () => modal.style.display = 'flex';
const hideModal = () => modal.style.display = 'none';

const showMessage = (msg, type = 'error') => {
  authMessage.textContent = msg;
  authMessage.className = type;
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
      
      if (quota?.accepted_terms) {
        // User has accepted terms, hide auth modal
        hideModal();
      } else {
        // User needs to accept terms
        hideModal();
        window.showConsentModal?.();
      }
    }
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    showModal();
  }
};

// Subscribe to auth state changes (includes OAuth callbacks)
const authSubscription = supabase.auth.onAuthStateChange(handleAuthStateChange);

// Check initial session on page load (handles OAuth callbacks and session recovery)
(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: quota } = await supabase.from('usage_quotas').select('accepted_terms').eq('user_id', user.id).maybeSingle();
      if (quota?.accepted_terms) {
        hideModal();
        return;
      }
      // Ensure quota row exists
      await ensureQuotaRow(user.id);
      hideModal();
      window.showConsentModal?.();
    } else {
      showModal();
    }
  } catch (err) {
    console.error('Error checking initial session:', err);
    showModal();
  }
})();



// Sign In
signInBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage('Enter username/email and password');
  
  const email = username.includes('@') ? username : `${username}@local.app`;
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Provide clearer messages while keeping Supabase error text
    if (/invalid login credentials|Invalid login credentials/i.test(error.message)) {
      return showMessage('Invalid username or password');
    }
    return showMessage(error.message);
  }
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    const { data: quota } = await supabase.from('usage_quotas').select('accepted_terms').eq('user_id', data.user.id).single();
    hideModal();
    if (!quota?.accepted_terms) {
      window.showConsentModal?.();
    }
  }
});

// --- NEW: Google sign-in button handler ---
// Note: The Supabase console must have the correct redirect URIs configured:
// - https://cbcaiug.github.io/app.html
// - https://qrkodwjhxrcrvsgkfeeo.supabase.co/auth/v1/callback
// The Google prompt showing "qrkodwjhxrcrvsgkfeeo.supabase.co" is normal OAuth flow.
const googleBtn = document.getElementById('googleBtn');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    showMessage('Redirecting to Google...','');
    try {
      // Build the redirect URL to ensure user returns to the app after OAuth callback
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/app.html`;
      
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

// --- NEW: Forgot password UI (staged) ---
const forgotLink = document.getElementById('forgotLink');
const forgotFlow = document.getElementById('forgotFlow');
const sendRecoveryBtn = document.getElementById('sendRecoveryBtn');
const forgotEmailInput = document.getElementById('forgotEmailInput');
const forgotMessage = document.getElementById('forgotMessage');
if (forgotLink && forgotFlow) {
  forgotLink.addEventListener('click', () => {
    // Toggle the staged recovery UI. The actual sending is staged to avoid breaking auth.
    forgotFlow.style.display = forgotFlow.style.display === 'block' ? 'none' : 'block';
  });
}

if (sendRecoveryBtn) {
  sendRecoveryBtn.addEventListener('click', async () => {
    const email = (forgotEmailInput.value || '').trim();
    if (!email) return (forgotMessage.textContent = 'Enter a valid email');
    forgotMessage.textContent = '';
    // Feature is staged: do not call reset endpoints automatically in production without backend verification.
    // You can replace the block below with a call to `supabase.auth.resetPasswordForEmail(email)` or a secure server endpoint.
    try {
      forgotMessage.textContent = 'Recovery feature is staged. An implementation will send a code/link here.';
      forgotMessage.style.color = '#4f46e5';
    } catch (err) {
      console.error(err);
      forgotMessage.textContent = 'Unable to request recovery at this time.';
      forgotMessage.style.color = '#c00';
    }
  });
}

// --- Enhance Sign Up error handling to indicate existing accounts ---
// Sign Up (wrap original handler to improve messages)
signUpBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage('Enter username/email and password');
  if (password.length < 6) return showMessage('Password must be at least 6 characters');
  const email = username.includes('@') ? username : `${username}@local.app`;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    // Try to provide clearer messaging
    const msg = error.message || '';
    if (/already|duplicate|exists/i.test(msg)) {
      return showMessage('An account with this email/username already exists. Try signing in.');
    }
    return showMessage(msg);
  }
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    hideModal();
    window.showConsentModal?.();
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
    await supabase.auth.signOut();
    showModal();
  },
  async acceptTerms() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('usage_quotas').upsert({ user_id: user.id, accepted_terms: true }, { onConflict: 'user_id' });
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
