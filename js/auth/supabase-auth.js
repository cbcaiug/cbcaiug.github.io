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
#authModal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index: 99999 !important; backdrop-filter: blur(8px); animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
#authBox { background: white; padding: 16px; width: 94%; max-width: 420px; border-radius: 12px; box-shadow: 0 18px 36px rgba(0,0,0,0.18); font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; position: relative; z-index: 100000 !important; max-height: calc(100vh - 40px); overflow-y: auto; animation: slideUp 0.18s ease; }
#authBox * { position: relative; z-index: 100001 !important; }
#authBox img { display: block; margin: 0 auto 8px; height: 40px; border-radius: 8px; filter: none !important; }
#authBox h2 { margin: 0 0 6px; font-size: 20px; font-weight: 700; text-align: center; color: #1a1a1a; letter-spacing: -0.5px; }
#authBox p { margin: 0 0 16px; font-size: 13px; color: #666; text-align: center; line-height: 1.4; }
#authBox input { width: 100%; padding: 12px 14px; margin-bottom: 10px; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 14px; box-sizing: border-box; background: #fafafa !important; color: #1a1a1a !important; transition: all 0.2s; }
#authBox input:focus { outline: none; border-color: #4f46e5; background: white !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
#authBox button { width: 100%; padding: 12px; margin-bottom: 8px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
#authBox button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
#authBox button:active:not(:disabled) { transform: translateY(0); }
#authBox button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #4f46e5 100%); color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
.btn-primary:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(79,70,229,0.4); }
.btn-secondary { background: #f9fafb; color: #374151; border: 2px solid #e5e7eb; }
.btn-google { background: white; color: #1f2937; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-google svg { flex-shrink: 0; }
.btn-google:hover:not(:disabled) { border-color: #d1d5db; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.divider { display: flex; align-items: center; margin: 16px 0; color: #9ca3af; font-size: 12px; font-weight: 500; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e5e7eb; }
.divider::before { margin-right: 16px; }
.divider::after { margin-left: 16px; }
#authMessage { min-height: 20px; font-size: 13px; margin-top: 12px; padding: 12px; border-radius: 8px; font-weight: 500; }
#authMessage.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
#authMessage.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.auth-link { color: #4f46e5; cursor: pointer; text-decoration: none; font-size: 14px; text-align: center; display: block; margin-top: 16px; font-weight: 500; transition: color 0.2s; }
.auth-link:hover { color: #4338ca; text-decoration: underline; }
#otpInputs { display: flex; gap: 6px; justify-content: center; margin: 16px 0; flex-wrap: nowrap; }
#otpInputs input { flex: 1 1 40px; max-width: 56px; min-width: 28px; height: 56px; box-sizing: border-box; padding: 0; text-align: center; font-size: 22px; font-weight: 700; line-height: 56px; margin: 0; border: 2px solid #e5e7eb; border-radius: 10px; background: #fafafa; transition: all 0.12s; color: #1a1a1a; caret-color: #4f46e5; }

/* OTP message styles */
#otpMessage { min-height: 20px; font-size: 13px; margin-top: 12px; padding: 0; border-radius: 8px; font-weight: 500; text-align: center; }
#otpMessage.error { color: #dc2626; }
#otpMessage.success { color: #16a34a; }
#otpInputs input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); outline: none; }
#otpTimer { text-align: center; font-size: 13px; color: #6b7280; margin: 12px 0; font-weight: 500; }
#otpTimer.expired { color: #dc2626; }
</style>
<div id="authModal" style="display:none">
  <div id="authBox">
    <img src="https://cbcaiug.github.io/images/cbc-ai-tool-logo.jpeg" alt="CBC AI Tool">
    
    <!-- Sign In/Up Screen -->
    <div id="authScreen">
      <h2>Welcome</h2>
      <p>Sign in to access AI assistants</p>
      
      <!-- OAuth Buttons -->
      <button id="googleBtn" class="btn-google">
        <svg width="20" height="20" viewBox="0 0 18 18" style="flex-shrink: 0;"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>
      <button id="facebookBtn" class="btn-facebook" style="display:none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Continue with Facebook
      </button>
      <button id="twitterBtn" class="btn-twitter" style="display:none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        Continue with Twitter
      </button>
      
      <div class="divider">or</div>
      
      <!-- Email/Password Form -->
      <input id="emailInput" type="email" placeholder="Email" autocomplete="email">
      <input id="passwordInput" type="password" placeholder="Password" autocomplete="current-password">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <a id="forgotPasswordLink" class="auth-link" style="margin:0;display:inline-block;text-align:left">Forgot password?</a>
      </div>
      <button id="signInBtn" class="btn-primary">Sign In</button>
      <button id="signUpBtn" class="btn-secondary">Create Account</button>
      <div id="authMessage"></div>
    </div>
    
    <!-- OTP Verification Screen -->
    <div id="otpScreen" style="display:none">
      <h2>Verify Email</h2>
      <p id="otpEmailDisplay">Enter the 6-digit code sent to your email</p>
      <div id="otpInputs">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
        <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1">
      </div>
      <div id="otpTimer">Code expires in <span id="otpCountdown">10:00</span></div>
      <button id="verifyOtpBtn" class="btn-primary">Verify Code</button>
      <a class="auth-link" id="resendOtpLink" style="display:none">Resend code</a>
      <a class="auth-link" id="changeEmailLink">Use different email</a>
      <div id="otpMessage"></div>
    </div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('authModal');
const authScreen = document.getElementById('authScreen');
const otpScreen = document.getElementById('otpScreen');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authMessage = document.getElementById('authMessage');
const otpMessage = document.getElementById('otpMessage');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const googleBtn = document.getElementById('googleBtn');
const facebookBtn = document.getElementById('facebookBtn');
const twitterBtn = document.getElementById('twitterBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendOtpLink = document.getElementById('resendOtpLink');
const backToAuthLink = document.getElementById('backToAuthLink');
const otpInputs = document.querySelectorAll('#otpInputs input');

let pendingEmail = '';
let otpTimer = null;
let otpExpiryTime = null;
let otpPollInterval = null;

// helper: enable/disable verify button
function updateVerifyButtonState() {
  const val = Array.from(otpInputs).map(i => i.value).join('');
  verifyOtpBtn.disabled = val.length !== otpInputs.length;
}

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

// Check session on load
(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: quota } = await supabase.from('usage_quotas').select('accepted_terms').eq('user_id', user.id).maybeSingle();
    if (quota?.accepted_terms) {
      hideModal();
      return;
    }
    await ensureQuotaRow(user.id);
    hideModal();
    window.showConsentModal?.();
  } else {
    showModal();
  }
})();

// OAuth Sign In - Google only
if (googleBtn) {
  googleBtn.style.display = 'flex'; // Ensure visible
  googleBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) showMessage(error.message);
  });
}

// Hide Facebook and Twitter buttons
if (facebookBtn) facebookBtn.remove();
if (twitterBtn) twitterBtn.remove();

// Sign Up - simple email/password, no OTP
signUpBtn.addEventListener('click', async () => {
  showMessage('');
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return showMessage('Enter email and password');
  if (!email.includes('@')) return showMessage('Please enter a valid email');
  if (password.length < 6) return showMessage('Password must be at least 6 characters');
  
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) return showMessage(error.message);
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    // Manually trigger sidebar update
    if (window.__updateSidebarUser) {
      window.__updateSidebarUser(data.user);
    }
    hideModal();
    window.showConsentModal?.();
  }
});

// Forgot password flow
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
forgotPasswordLink.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return showMessage('Enter your email to reset password');
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) return showMessage(error.message);
  showMessage('Password reset email sent (check your inbox)', 'success');
});

// Sign In
signInBtn.addEventListener('click', async () => {
  showMessage('');
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return showMessage('Enter email and password');
  if (!email.includes('@')) return showMessage('Please enter a valid email');
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMessage(error.message);
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    const { data: quota } = await supabase.from('usage_quotas').select('accepted_terms').eq('user_id', data.user.id).single();
    // Manually trigger sidebar update
    if (window.__updateSidebarUser) {
      window.__updateSidebarUser(data.user);
    }
    hideModal();
    if (!quota?.accepted_terms) {
      window.showConsentModal?.();
    }
  }
});

// OTP Verification
verifyOtpBtn.addEventListener('click', async () => {
  const otp = Array.from(otpInputs).map(input => input.value).join('');
  if (otp.length !== 8) return showOtpMessage('Please enter all 8 digits', 'error');
  
  const { data, error } = await supabase.auth.verifyOtp({
    email: pendingEmail,
    token: otp,
    type: 'email'
  });
  
  if (error) return showOtpMessage(error.message, 'error');
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    hideModal();
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    window.showConsentModal?.();
  }
});

// initialize verify button state
updateVerifyButtonState();

// Resend OTP
resendOtpLink.addEventListener('click', async () => {
  if (!pendingEmail) return;
  resendOtpLink.style.pointerEvents = 'none';
  resendOtpLink.style.opacity = '0.5';
  const { error } = await supabase.auth.signInWithOtp({ email: pendingEmail });
  if (error) {
    resendOtpLink.style.pointerEvents = '';
    resendOtpLink.style.opacity = '';
    return showOtpMessage(error.message, 'error');
  }
  showOtpMessage('Code resent! Check your email', 'success');
  startOtpTimer();
  setTimeout(() => {
    resendOtpLink.style.pointerEvents = '';
    resendOtpLink.style.opacity = '';
  }, 60000);
});

// Change email
const changeEmailLink = document.getElementById('changeEmailLink');
changeEmailLink.addEventListener('click', () => {
  otpScreen.style.display = 'none';
  authScreen.style.display = 'block';
  otpInputs.forEach(input => input.value = '');
  emailInput.value = '';
  passwordInput.value = '';
  pendingEmail = '';
  if (otpTimer) clearInterval(otpTimer);
  if (otpPollInterval) { clearInterval(otpPollInterval); otpPollInterval = null; }
});

// OTP Timer
function startOtpTimer() {
  if (otpTimer) clearInterval(otpTimer);
  otpExpiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes
  const timerDisplay = document.getElementById('otpCountdown');
  const timerContainer = document.getElementById('otpTimer');
  resendOtpLink.style.display = 'none';
  
  otpTimer = setInterval(() => {
    const remaining = otpExpiryTime - Date.now();
    if (remaining <= 0) {
      clearInterval(otpTimer);
      timerDisplay.textContent = '0:00';
      timerContainer.classList.add('expired');
      timerContainer.innerHTML = 'Code expired';
      resendOtpLink.style.display = 'block';
      verifyOtpBtn.disabled = true;
        if (otpPollInterval) { clearInterval(otpPollInterval); otpPollInterval = null; }
      return;
    }
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Back to auth
backToAuthLink.addEventListener('click', () => {
  otpScreen.style.display = 'none';
  authScreen.style.display = 'block';
  otpInputs.forEach(input => input.value = '');
});

// OTP input auto-focus
otpInputs.forEach((input, index) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val ? val.charAt(0) : '';
    updateVerifyButtonState();
    if (val && index < otpInputs.length - 1) {
      // schedule focus so it works reliably across browsers/devices
      setTimeout(() => {
        otpInputs[index + 1].focus();
        otpInputs[index + 1].select();
      }, 0);
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].select();
      } else {
        e.target.value = '';
        updateVerifyButtonState();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputs[index - 1].focus();
      otpInputs[index - 1].select();
    } else if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
      otpInputs[index + 1].select();
    }
  });
  // also handle keyup to catch number entry events on some devices/browsers
  input.addEventListener('keyup', (e) => {
    const isDigit = /\d/.test(e.key);
    if (isDigit) {
      updateVerifyButtonState();
      if (index < otpInputs.length - 1) {
        setTimeout(() => { otpInputs[index + 1].focus(); otpInputs[index + 1].select(); }, 0);
      }
    }
  });
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpInputs.length);
    paste.split('').forEach((char, i) => {
      if (otpInputs[i]) otpInputs[i].value = char;
    });
    updateVerifyButtonState();
    if (paste.length > 0) {
      const lastIndex = Math.min(paste.length - 1, otpInputs.length - 1);
      setTimeout(()=>{ otpInputs[lastIndex].focus(); otpInputs[lastIndex].select(); }, 0);
    }
  });
});

const showOtpMessage = (msg, type = 'error') => {
  otpMessage.textContent = msg;
  otpMessage.className = type;
};

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
    if (window.__updateSidebarUser) {
      window.__updateSidebarUser(null);
    }
    showModal();
  },
  async acceptTerms() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('usage_quotas').upsert({ user_id: user.id, accepted_terms: true }, { onConflict: 'user_id' });
    }
  },
  subscribeToQuotaUpdates(callback) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const channel = supabase.channel('quota-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'usage_quotas',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          callback(payload.new);
        })
        .subscribe();
      return () => supabase.removeChannel(channel);
    });
  }
};

// Hook for consent modal
window.showConsentModal = () => {
  const event = new CustomEvent('showConsent');
  window.dispatchEvent(event);
};
