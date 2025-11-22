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
#authModal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); z-index: 99999 !important; backdrop-filter: blur(4px); }
#authBox { background: white; padding: 32px; width: 90%; max-width: 400px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); font-family: Inter, sans-serif; position: relative; z-index: 100000 !important; }
#authBox * { position: relative; z-index: 100001 !important; }
#authBox img { display: block; margin: 0 auto 20px; height: 64px; border-radius: 8px; }
#authBox h2 { margin: 0 0 8px; font-size: 24px; font-weight: 600; text-align: center; color: #111; }
#authBox p { margin: 0 0 20px; font-size: 14px; color: #666; text-align: center; }
#authBox input { width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: white !important; color: #111 !important; }
#authBox input:focus { outline: 2px solid #4f46e5; border-color: #4f46e5; }
#authBox button { width: 100%; padding: 12px; margin-bottom: 8px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
#authBox button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
#signInBtn { background: #4f46e5; color: white; }
#signUpBtn { background: #f3f4f6; color: #111; border: 1px solid #ddd; }
#authMessage { min-height: 20px; font-size: 13px; margin-top: 12px; padding: 8px; border-radius: 6px; }
#authMessage.error { background: #fee; color: #c00; }
#authMessage.success { background: #efe; color: #060; }
</style>
<div id="authModal" style="display:none">
  <div id="authBox">
    <img src="https://cbcaiug.github.io/images/cbc-ai-tool-logo.jpeg" alt="CBC AI Tool">
    <h2>Welcome</h2>
    <p>Sign in to access AI assistants</p>
    <input id="usernameInput" type="text" placeholder="Username or Email" autocomplete="username">
    <input id="passwordInput" type="password" placeholder="Password" autocomplete="current-password">
    <button id="signInBtn">Sign In</button>
    <button id="signUpBtn">Create Account</button>
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

// Sign Up
signUpBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage('Enter username/email and password');
  
  const email = username.includes('@') ? username : `${username}@local.app`;
  
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return showMessage(error.message);
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    hideModal();
    window.showConsentModal?.();
  }
});

// Sign In
signInBtn.addEventListener('click', async () => {
  showMessage('');
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage('Enter username/email and password');
  
  const email = username.includes('@') ? username : `${username}@local.app`;
  
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMessage(error.message);
  if (data?.user) {
    await ensureQuotaRow(data.user.id);
    const { data: quota } = await supabase.from('usage_quotas').select('accepted_terms').eq('user_id', data.user.id).single();
    hideModal();
    if (!quota?.accepted_terms) {
      window.showConsentModal?.();
    }
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
  }
};

// Hook for consent modal
window.showConsentModal = () => {
  const event = new CustomEvent('showConsent');
  window.dispatchEvent(event);
};
