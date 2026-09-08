/**
 * The CBC AI Projects — Admin Portal Controller
 * 
 * Manages Firebase Auth & live Firestore synchronization,
 * live project/contact/announcement editing,
 * and configuration state.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cbc_ecosystem_config';

  let configState = null;
  let currentUser = null;

  // Initialize Firebase App
  let auth = null;
  let db = null;

  try {
    if (window.firebase && window.CBC_FIREBASE_CONFIG) {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.CBC_FIREBASE_CONFIG);
      }
      auth = firebase.auth();
      db = firebase.firestore();
    }
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }

  // Check Local / Default Config
  function loadConfig() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Error reading config from localStorage:', e);
    }
    // Deep clone defaults
    return JSON.parse(JSON.stringify(window.CBC_DEFAULT_CONFIG || {}));
  }

  // Save to Local Storage
  function saveConfigLocal(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  // Toast Notification Helper
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : '!';
    toast.innerHTML = `<strong>${icon}</strong> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Custom In-App Confirm Modal (Replaces native window.confirm)
  function showAppConfirm({ title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Confirm', confirmType = 'danger' } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('customConfirmModal');
      const titleEl = document.getElementById('modalTitle');
      const messageEl = document.getElementById('modalMessage');
      const confirmBtn = document.getElementById('modalConfirmBtn');
      const cancelBtn = document.getElementById('modalCancelBtn');

      if (!modal || !confirmBtn || !cancelBtn) {
        resolve(window.confirm(message));
        return;
      }

      if (titleEl) titleEl.textContent = title;
      if (messageEl) messageEl.textContent = message;
      confirmBtn.textContent = confirmText;
      if (confirmType === 'danger') {
        confirmBtn.style.background = '#ef4444';
        confirmBtn.style.borderColor = '#dc2626';
      } else {
        confirmBtn.style.background = 'var(--accent-primary)';
        confirmBtn.style.borderColor = 'var(--accent-primary)';
      }

      modal.style.display = 'flex';

      function cleanup(result) {
        modal.style.display = 'none';
        confirmBtn.removeEventListener('click', onConfirm);
        cancelBtn.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKeyDown);
        resolve(result);
      }

      function onConfirm() { cleanup(true); }
      function onCancel() { cleanup(false); }
      function onBackdrop(e) { if (e.target === modal) cleanup(false); }
      function onKeyDown(e) {
        if (e.key === 'Escape') cleanup(false);
      }

      confirmBtn.addEventListener('click', onConfirm);
      cancelBtn.addEventListener('click', onCancel);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKeyDown);
    });
  }

  // HTML Escape Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Switch Auth View State
  function setAuthenticatedState(isAuthed, email = '') {
    const authGate = document.getElementById('authGate');
    const adminDashboard = document.getElementById('adminDashboard');
    const logoutBtn = document.getElementById('authLogoutBtn');
    const emailEl = document.getElementById('currentAdminEmail');

    if (isAuthed) {
      authGate.style.display = 'none';
      adminDashboard.style.display = 'block';
      logoutBtn.style.display = 'inline-flex';
      logoutBtn.textContent = 'Sign Out';
      if (emailEl) {
        emailEl.textContent = email || 'Admin Session';
      }
      renderAllEditors();
    } else {
      authGate.style.display = 'block';
      adminDashboard.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  }

  // Render Projects Editor List
  function renderProjectsEditor() {
    const wrap = document.getElementById('projectsListWrap');
    if (!wrap) return;

    const projects = configState.projects || [];
    wrap.innerHTML = projects.map((proj, idx) => {
      const isEnabled = proj.enabled !== false;
      const isLaunchEnabled = proj.launchEnabled !== false;
      const cardClass = isEnabled ? '' : 'disabled-item';
      const statusVal = proj.status || 'Live';

      return `
        <div class="editable-card ${cardClass}" data-project-idx="${idx}">
          <div class="card-top-bar">
            <span class="card-item-title">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${isEnabled ? 'var(--accent-primary)' : 'var(--text-subtle)'}; flex-shrink:0;"></span>
              <span>#${idx + 1}: ${escapeHtml(proj.title || 'Untitled Project')}</span>
            </span>
            <div class="card-top-actions" style="display:flex; align-items:center; gap:6px;">
              <div class="card-reorder-group" style="display:inline-flex; gap:3px;">
                <button type="button" class="btn btn-admin proj-move-top" title="Move to Top" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.35;cursor:not-allowed;padding:3px 7px;"' : 'style="padding:3px 7px;"'}>⇈ Top</button>
                <button type="button" class="btn btn-admin proj-move-up" title="Move Up" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.35;cursor:not-allowed;padding:3px 7px;"' : 'style="padding:3px 7px;"'}>↑</button>
                <button type="button" class="btn btn-admin proj-move-down" title="Move Down" data-idx="${idx}" ${idx === projects.length - 1 ? 'disabled style="opacity:0.35;cursor:not-allowed;padding:3px 7px;"' : 'style="padding:3px 7px;"'}>↓</button>
              </div>
              <label class="toggle-switch">
                <span>${isEnabled ? 'Visible' : 'Hidden'}</span>
                <input type="checkbox" class="switch-input proj-enable-toggle" ${isEnabled ? 'checked' : ''} data-idx="${idx}">
              </label>
              <button type="button" class="btn btn-admin proj-delete-btn" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:4px 8px; font-size:0.78rem;" data-idx="${idx}">
                Delete
              </button>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Project Title</label>
              <input type="text" class="form-input proj-field" data-field="title" value="${escapeHtml(proj.title || '')}" data-idx="${idx}">
            </div>
            <div class="form-group">
              <label class="form-label">Subtitle / Tagline</label>
              <input type="text" class="form-input proj-field" data-field="subtitle" value="${escapeHtml(proj.subtitle || '')}" data-idx="${idx}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Target URL (Redirect / App Link)</label>
            <div class="url-input-wrap">
              <input type="text" class="form-input proj-field proj-url-input" data-field="url" value="${escapeHtml(proj.url || '')}" placeholder="https://..." data-idx="${idx}">
              <button type="button" class="btn-test" onclick="window.open('${escapeHtml(proj.url || '')}', '_blank')">
                Test Link ↗
              </button>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Deployment Status</label>
              <select class="form-select proj-field" data-field="status" data-idx="${idx}">
                <option value="Live" ${statusVal === 'Live' ? 'selected' : ''}>● Live</option>
                <option value="In Development" ${statusVal === 'In Development' ? 'selected' : ''}>▲ In Development</option>
                <option value="Beta" ${statusVal === 'Beta' ? 'selected' : ''}>◆ Beta</option>
                <option value="Discontinued" ${statusVal === 'Discontinued' ? 'selected' : ''}>■ Discontinued</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Launch Application Button</label>
              <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                <label class="toggle-switch">
                  <input type="checkbox" class="switch-input proj-launch-toggle" ${isLaunchEnabled ? 'checked' : ''} data-idx="${idx}">
                  <span>${isLaunchEnabled ? 'Enabled' : 'Disabled (Coming Soon)'}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input type="text" class="form-input proj-field" data-field="category" value="${escapeHtml(proj.category || '')}" placeholder="e.g. School Operations" data-idx="${idx}">
            </div>
            <div class="form-group">
              <label class="form-label">Badge Tag (e.g. Flagship Suite)</label>
              <input type="text" class="form-input proj-field" data-field="badge" value="${escapeHtml(proj.badge || '')}" placeholder="e.g. Flagship Suite" data-idx="${idx}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Button Label Override (Optional)</label>
            <input type="text" class="form-input proj-field" data-field="launchButtonText" value="${escapeHtml(proj.launchButtonText || '')}" placeholder="Default: Launch Application / Coming Soon" data-idx="${idx}">
          </div>

          <div class="form-group">
            <label class="form-label">Short Description</label>
            <textarea class="form-textarea proj-field" data-field="description" data-idx="${idx}">${escapeHtml(proj.description || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Feature Tags (comma separated)</label>
            <input type="text" class="form-input proj-tags-field" value="${escapeHtml((proj.tags || []).join(', '))}" placeholder="e.g. NCDC Aligned, Free Tier" data-idx="${idx}">
          </div>
        </div>
      `;
    }).join('');

    // Attach Project Event Listeners
    wrap.querySelectorAll('.proj-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const field = e.target.getAttribute('data-field');
        if (configState.projects[idx]) {
          configState.projects[idx][field] = e.target.value;
          updateSyncStatus('Unsaved changes');
        }
      });
      // also handle select change
      if (input.tagName === 'SELECT') {
        input.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'), 10);
          const field = e.target.getAttribute('data-field');
          if (configState.projects[idx]) {
            configState.projects[idx][field] = e.target.value;
            updateSyncStatus('Unsaved changes');
          }
        });
      }
    });

    wrap.querySelectorAll('.proj-tags-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (configState.projects[idx]) {
          configState.projects[idx].tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    wrap.querySelectorAll('.proj-enable-toggle').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (configState.projects[idx]) {
          configState.projects[idx].enabled = e.target.checked;
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    wrap.querySelectorAll('.proj-launch-toggle').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (configState.projects[idx]) {
          configState.projects[idx].launchEnabled = e.target.checked;
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    // Reordering handlers
    wrap.querySelectorAll('.proj-move-top').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        if (idx > 0 && configState.projects[idx]) {
          const [moved] = configState.projects.splice(idx, 1);
          configState.projects.unshift(moved);
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
          showToast(`Moved "${moved.title || 'Project'}" to top.`);
        }
      });
    });

    wrap.querySelectorAll('.proj-move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        if (idx > 0 && configState.projects[idx]) {
          const temp = configState.projects[idx];
          configState.projects[idx] = configState.projects[idx - 1];
          configState.projects[idx - 1] = temp;
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    wrap.querySelectorAll('.proj-move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        if (idx < configState.projects.length - 1 && configState.projects[idx]) {
          const temp = configState.projects[idx];
          configState.projects[idx] = configState.projects[idx + 1];
          configState.projects[idx + 1] = temp;
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    // Custom In-App Modal Delete Confirmation
    wrap.querySelectorAll('.proj-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        const title = configState.projects[idx]?.title || 'this project';
        const confirmed = await showAppConfirm({
          title: 'Delete Project',
          message: `Are you sure you want to remove "${title}" from the showcase?`,
          confirmText: 'Delete Project',
          confirmType: 'danger'
        });
        if (confirmed) {
          configState.projects.splice(idx, 1);
          renderProjectsEditor();
          updateSyncStatus('Unsaved changes');
          showToast('Project removed.');
        }
      });
    });
  }

  // Render Contacts & Custom Links Editor
  function renderContactsEditor() {
    const wrap = document.getElementById('contactsListWrap');
    if (!wrap) return;

    const contacts = configState.contacts || [];
    const iconOptions = [
      { id: 'whatsapp', name: 'WhatsApp' },
      { id: 'phone', name: 'Phone Call' },
      { id: 'mail', name: 'Email' },
      { id: 'youtube', name: 'YouTube' },
      { id: 'facebook', name: 'Facebook' },
      { id: 'x-twitter', name: 'X / Twitter' },
      { id: 'instagram', name: 'Instagram' },
      { id: 'users', name: 'Users / Community' },
      { id: 'graduation-cap', name: 'Education / Training' },
      { id: 'genericLink', name: 'Custom Website / Link' }
    ];

    wrap.innerHTML = contacts.map((c, idx) => {
      const isEnabled = c.enabled !== false;
      const cardClass = isEnabled ? '' : 'disabled-item';

      const optionsHtml = iconOptions.map(opt => `
        <option value="${opt.id}" ${c.icon === opt.id ? 'selected' : ''}>${opt.name}</option>
      `).join('');

      return `
        <div class="editable-card ${cardClass}" data-contact-idx="${idx}">
          <div class="card-top-bar">
            <span class="card-item-title">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${isEnabled ? 'var(--accent-primary)' : 'var(--text-subtle)'}; flex-shrink:0;"></span>
              <span>${escapeHtml(c.label || 'Custom Channel')}</span>
            </span>
            <div class="card-top-actions">
              <label class="toggle-switch">
                <span>${isEnabled ? 'Visible' : 'Hidden'}</span>
                <input type="checkbox" class="switch-input contact-enable-toggle" ${isEnabled ? 'checked' : ''} data-idx="${idx}">
              </label>
              <button type="button" class="btn btn-admin contact-delete-btn" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:4px 8px; font-size:0.78rem;" data-idx="${idx}">
                Remove
              </button>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Button Label (User Sees)</label>
              <input type="text" class="form-input contact-field" data-field="label" value="${escapeHtml(c.label || '')}" placeholder="e.g. WhatsApp Channel" data-idx="${idx}">
            </div>
            <div class="form-group">
              <label class="form-label">Sublabel / Description</label>
              <input type="text" class="form-input contact-field" data-field="sublabel" value="${escapeHtml(c.sublabel || '')}" placeholder="e.g. Join 1,000+ Teachers" data-idx="${idx}">
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">URL / Link Target</label>
              <div class="url-input-wrap">
                <input type="text" class="form-input contact-field" data-field="url" value="${escapeHtml(c.url || '')}" placeholder="https://... or tel: or mailto:" data-idx="${idx}">
                <button type="button" class="btn-test" onclick="if('${escapeHtml(c.url || '')}') window.open('${escapeHtml(c.url || '')}', '_blank')">
                  Test ↗
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Channel Icon</label>
              <select class="form-select contact-field" data-field="icon" data-idx="${idx}">
                ${optionsHtml}
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Contact Event Listeners
    wrap.querySelectorAll('.contact-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const field = e.target.getAttribute('data-field');
        if (configState.contacts[idx]) {
          configState.contacts[idx][field] = e.target.value;
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    wrap.querySelectorAll('.contact-enable-toggle').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (configState.contacts[idx]) {
          configState.contacts[idx].enabled = e.target.checked;
          renderContactsEditor();
          updateSyncStatus('Unsaved changes');
        }
      });
    });

    wrap.querySelectorAll('.contact-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        const label = configState.contacts[idx]?.label || 'this channel';
        const confirmed = await showAppConfirm({
          title: 'Remove Channel',
          message: `Are you sure you want to remove "${label}"?`,
          confirmText: 'Remove',
          confirmType: 'danger'
        });
        if (confirmed) {
          configState.contacts.splice(idx, 1);
          renderContactsEditor();
          updateSyncStatus('Unsaved changes');
          showToast('Channel removed.');
        }
      });
    });
  }

  // Render Announcement Editor
  function renderAnnouncementEditor() {
    const ann = configState.announcement || {};
    const enableCb = document.getElementById('announcementEnabled');
    const badgeInput = document.getElementById('announcementBadge');
    const urlInput = document.getElementById('announcementUrl');
    const textInput = document.getElementById('announcementText');

    if (enableCb) enableCb.checked = ann.enabled !== false;
    if (badgeInput) badgeInput.value = ann.badge || '';
    if (urlInput) urlInput.value = ann.url || '';
    if (textInput) textInput.value = ann.text || '';

    // Events
    if (enableCb) {
      enableCb.onchange = (e) => {
        configState.announcement.enabled = e.target.checked;
        updateSyncStatus('Unsaved changes');
      };
    }
    if (badgeInput) {
      badgeInput.oninput = (e) => {
        configState.announcement.badge = e.target.value;
        updateSyncStatus('Unsaved changes');
      };
    }
    if (urlInput) {
      urlInput.oninput = (e) => {
        configState.announcement.url = e.target.value;
        updateSyncStatus('Unsaved changes');
      };
    }
    if (textInput) {
      textInput.oninput = (e) => {
        configState.announcement.text = e.target.value;
        updateSyncStatus('Unsaved changes');
      };
    }
  }

  // Render All Editors
  function renderAllEditors() {
    renderProjectsEditor();
    renderContactsEditor();
    renderAnnouncementEditor();
  }

  // Update Status Text
  function updateSyncStatus(text, isSpinning = false) {
    const label = document.getElementById('syncStatusText');
    const dot = document.getElementById('syncStatusIndicator');
    if (label) label.textContent = text;
    if (dot) {
      dot.className = isSpinning ? 'spinner' : 'status-dot';
    }
  }

  // Save & Publish to Cloud (Firestore)
  async function publishToCloud() {
    const pubBtn = document.getElementById('publishCloudBtn');
    const originalHtml = pubBtn ? pubBtn.innerHTML : 'Publish to Cloud';

    if (pubBtn) {
      pubBtn.disabled = true;
      pubBtn.style.opacity = '0.7';
      pubBtn.style.cursor = 'not-allowed';
      pubBtn.innerHTML = `
        <span class="spinner" style="width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; display:inline-block; animation:spin 0.8s linear infinite; margin-right:6px; vertical-align:middle;"></span>
        <span>Publishing...</span>
      `;
    }

    updateSyncStatus('Publishing to cloud...', true);
    saveConfigLocal(configState);

    try {
      if (!db) {
        throw new Error('Firebase Firestore not initialized.');
      }

      // Check if user is signed into Firebase
      const authUser = auth?.currentUser;
      if (!authUser) {
        throw new Error('Please sign in with your admin account first.');
      }

      // Build structured payload
      // Include compatible links map for cbcaiug_canvas_firebase
      const linksMap = {};
      (configState.contacts || []).forEach(c => {
        if (c.id) {
          linksMap[c.id] = {
            label: c.label || '',
            url: c.url || '',
            enabled: c.enabled !== false
          };
        }
      });

      const payload = {
        configJson: JSON.stringify(configState),
        projectsJson: JSON.stringify(configState.projects || []),
        contactsJson: JSON.stringify(configState.contacts || []),
        announcementJson: JSON.stringify(configState.announcement || {}),
        links: linksMap,
        version: Date.now(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Write to settings/app_links (governed by allow write: if isAdmin())
      await db.collection('settings').doc('app_links').set(payload, { merge: true });

      // Update local storage fetch time so this browser knows it's fresh
      localStorage.setItem('cbc_config_fetch_time', String(Date.now()));

      updateSyncStatus('Published live to Cloud Firestore!');
      showToast('All changes are published live to cbcaiug.github.io!', 'success');
    } catch (err) {
      console.error('Cloud save failed:', err);
      updateSyncStatus('Cloud save failed: ' + (err.message || 'Permission denied'));
      showToast('Saved locally, but cloud write failed: ' + (err.message || 'Please sign in as admin'), 'error');
    } finally {
      if (pubBtn) {
        pubBtn.disabled = false;
        pubBtn.style.opacity = '1';
        pubBtn.style.cursor = 'pointer';
        pubBtn.innerHTML = originalHtml;
      }
    }
  }

  // Tab Switching
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.editor-section').forEach(s => s.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        const targetSection = document.getElementById(targetTab);
        if (targetSection) targetSection.classList.add('active');
      });
    });
  }

  // Export JSON Backup
  function exportJsonBackup() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(configState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `cbc_ai_projects_config_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('Configuration exported as JSON.', 'success');
  }

  // Import JSON Backup
  function importJsonBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.projects || parsed.contacts)) {
          configState = parsed;
          saveConfigLocal(configState);
          renderAllEditors();
          showToast('Configuration imported successfully!', 'success');
          updateSyncStatus('Configuration restored from JSON. Click Publish to send live.');
        } else {
          showToast('Invalid JSON file format.', 'error');
        }
      } catch (err) {
        showToast('Error reading JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  // Setup Event Handlers
  function setupHandlers() {
    // Add New Project (Prepended to top of showcase)
    document.getElementById('addNewProjectBtn')?.addEventListener('click', () => {
      const newProj = {
        id: 'project-' + Date.now(),
        title: 'New Project',
        subtitle: 'Project Subtitle',
        category: 'School Operations',
        url: 'https://',
        description: 'Description of the new tool...',
        tags: ['New', 'AI'],
        badge: 'New',
        status: 'Live',
        icon: 'sparkles',
        enabled: true,
        launchEnabled: true,
        launchButtonText: '',
        highlight: false
      };
      configState.projects.unshift(newProj);
      renderProjectsEditor();
      updateSyncStatus('Unsaved changes');
      showToast('New project row added at the top.');
    });

    // Add Any Custom Link / Contact Channel
    document.getElementById('addNewContactBtn')?.addEventListener('click', () => {
      const newChannel = {
        id: 'link-' + Date.now(),
        label: 'New Channel / Link',
        sublabel: 'Click to open',
        url: 'https://',
        icon: 'genericLink',
        enabled: true,
        category: 'social'
      };
      configState.contacts.push(newChannel);
      renderContactsEditor();
      updateSyncStatus('Unsaved changes');
      showToast('New channel button added.');
    });

    // Save Locally Button
    document.getElementById('saveLocalBtn')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Saving...';
      saveConfigLocal(configState);
      updateSyncStatus('Saved locally to browser.');
      showToast('Saved to local browser storage.', 'success');
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
      }, 400);
    });

    // Publish to Cloud Button
    document.getElementById('publishCloudBtn')?.addEventListener('click', publishToCloud);

    // Export & Import
    document.getElementById('exportJsonBtn')?.addEventListener('click', exportJsonBackup);
    document.getElementById('importJsonFile')?.addEventListener('change', importJsonBackup);

    // Reset to Defaults with Custom In-App Modal
    document.getElementById('resetDefaultsBtn')?.addEventListener('click', async () => {
      const confirmed = await showAppConfirm({
        title: 'Reset to Defaults',
        message: 'Are you sure you want to reset all projects and contacts to default settings? This will overwrite your current configuration.',
        confirmText: 'Reset Defaults',
        confirmType: 'danger'
      });
      if (confirmed) {
        configState = JSON.parse(JSON.stringify(window.CBC_DEFAULT_CONFIG));
        saveConfigLocal(configState);
        renderAllEditors();
        showToast('Reset to defaults.', 'success');
        updateSyncStatus('Defaults restored. Click Publish to Cloud when ready.');
      }
    });

    // Email / Password Login Form
    document.getElementById('firebaseLoginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('authErrorMsg');
      const loginBtn = document.getElementById('loginBtn');

      try {
        errorEl.style.display = 'none';
        if (loginBtn) {
          loginBtn.disabled = true;
          loginBtn.textContent = 'Signing In...';
        }
        if (!auth) throw new Error('Authentication service not available');
        const cred = await auth.signInWithEmailAndPassword(email, pass);
        currentUser = cred.user;
        setAuthenticatedState(true, currentUser.email);
        showToast(`Signed in as ${currentUser.email}`, 'success');
      } catch (err) {
        console.error('Sign in error:', err);
        errorEl.textContent = err.message || 'Login failed. Please check your email and password.';
        errorEl.style.display = 'block';
      } finally {
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.textContent = 'Sign In';
        }
      }
    });

    // Google Sign In
    document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
      const errorEl = document.getElementById('authErrorMsg');
      try {
        errorEl.style.display = 'none';
        if (!auth) throw new Error('Authentication service not available');
        const provider = new firebase.auth.GoogleAuthProvider();
        const res = await auth.signInWithPopup(provider);
        currentUser = res.user;
        setAuthenticatedState(true, currentUser.email);
        showToast(`Signed in as ${currentUser.email}`, 'success');
      } catch (err) {
        console.error('Google login error:', err);
        errorEl.textContent = err.message || 'Google sign-in failed';
        errorEl.style.display = 'block';
      }
    });

    // Toggle Password Visibility
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const passInput = document.getElementById('loginPassword');
    const eyeOpen = document.getElementById('eyeIconOpen');
    const eyeClosed = document.getElementById('eyeIconClosed');

    toggleBtn?.addEventListener('click', () => {
      if (!passInput) return;
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      if (eyeOpen) eyeOpen.style.display = isPass ? 'none' : 'block';
      if (eyeClosed) eyeClosed.style.display = isPass ? 'block' : 'none';
      toggleBtn.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
    });

    // Logout
    document.getElementById('authLogoutBtn')?.addEventListener('click', async () => {
      if (auth) {
        try { await auth.signOut(); } catch (_) {}
      }
      currentUser = null;
      setAuthenticatedState(false);
      showToast('Signed out.', 'success');
    });
  }

  // Init App
  function init() {
    configState = loadConfig();
    setupTabs();
    setupHandlers();

    // Check Firebase Auth state
    if (auth) {
      auth.onAuthStateChanged(user => {
        if (user) {
          currentUser = user;
          setAuthenticatedState(true, user.email);
        } else {
          setAuthenticatedState(false);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
