/**
 * The CBC AI Projects — Application Engine
 * 
 * High-performance, zero-bloat client logic.
 * Reads real-time config from Cloud Firestore (REST API, 0KB SDK overhead)
 * with instant localStorage and embedded default fallbacks.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cbc_ecosystem_config';
  const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/cbcaiug-auth/databases/(default)/documents/settings/app_links';

  // SVG Icon Registry (Inlined for 0KB external network dependencies)
  const ICONS = {
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
    atom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 8.3c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>`,
    'check-circle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31Z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    'x-twitter': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
    'graduation-cap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    genericLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
  };

  let activeCategory = 'all';
  let currentConfig = null;

  // Initialize Config
  function getInitialConfig() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Could not read cached config:', e);
    }
    return window.CBC_DEFAULT_CONFIG || {};
  }

  // Parse Firestore REST format
  function parseFirestoreDoc(doc) {
    if (!doc || !doc.fields) return null;
    const fields = doc.fields;
    
    // Check if JSON stringified payload is present
    if (fields.configJson && fields.configJson.stringValue) {
      try {
        return JSON.parse(fields.configJson.stringValue);
      } catch (e) {
        console.error('Error parsing configJson:', e);
      }
    }

    // Otherwise check for links map
    const result = {
      projects: [],
      contacts: [],
      customLinks: []
    };

    if (fields.projectsJson && fields.projectsJson.stringValue) {
      try { result.projects = JSON.parse(fields.projectsJson.stringValue); } catch (_) {}
    }
    if (fields.contactsJson && fields.contactsJson.stringValue) {
      try { result.contacts = JSON.parse(fields.contactsJson.stringValue); } catch (_) {}
    }
    if (fields.customLinksJson && fields.customLinksJson.stringValue) {
      try { result.customLinks = JSON.parse(fields.customLinksJson.stringValue); } catch (_) {}
    }
    if (fields.announcementJson && fields.announcementJson.stringValue) {
      try { result.announcement = JSON.parse(fields.announcementJson.stringValue); } catch (_) {}
    }

    return result;
  }

  const CACHE_TIME_KEY = 'cbc_config_fetch_time';
  const CACHE_TTL_MS = 2 * 60 * 1000; // 2-minute cache TTL: fast fresh updates without burning Spark quota

  // Fetch Latest Config from Firestore (REST API - zero external JS bundle)
  async function fetchRemoteConfig(force = false) {
    if (!force) {
      try {
        const lastFetch = localStorage.getItem(CACHE_TIME_KEY);
        const cached = localStorage.getItem(STORAGE_KEY);
        if (lastFetch && cached && (Date.now() - parseInt(lastFetch, 10)) < CACHE_TTL_MS) {
          // Fresh cache available; skip Firestore read to preserve free tier quota!
          return null;
        }
      } catch (_) {}
    }

    try {
      const response = await fetch(FIRESTORE_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        // Doc might not have been created yet, which is fine
        return null;
      }

      const doc = await response.json();
      const parsed = parseFirestoreDoc(doc);
      if (parsed && (parsed.projects || parsed.contacts)) {
        // Merge with defaults so new keys aren't lost
        const merged = mergeConfigs(window.CBC_DEFAULT_CONFIG, parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        return merged;
      }
    } catch (err) {
      console.warn('Remote sync skipped (offline or network error):', err);
    }
    return null;
  }

  // Helper to merge remote overrides over defaults
  function mergeConfigs(base, overrides) {
    if (!overrides) return base;
    const merged = { ...base };

    if (overrides.announcement) {
      merged.announcement = { ...base.announcement, ...overrides.announcement };
    }

    // Direct assignment preserves user's ordering, disabled states, and newly added/deleted projects
    if (Array.isArray(overrides.projects) && overrides.projects.length > 0) {
      merged.projects = overrides.projects;
    }

    if (Array.isArray(overrides.contacts) && overrides.contacts.length > 0) {
      merged.contacts = overrides.contacts;
    }

    if (Array.isArray(overrides.customLinks)) {
      merged.customLinks = overrides.customLinks;
    }

    return merged;
  }

  // Render Announcement Bar
  function renderAnnouncement(announcement) {
    const bar = document.getElementById('announcementBar');
    if (!bar) return;

    if (!announcement || !announcement.enabled || !announcement.text) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'block';
    bar.innerHTML = `
      <div class="container">
        <div class="announcement-inner">
          <span class="announcement-badge">${escapeHtml(announcement.badge || 'Update')}</span>
          <span class="announcement-text">${escapeHtml(announcement.text)}</span>
          ${announcement.url ? `
            <a href="${escapeHtml(announcement.url)}" class="announcement-link">
              Learn More ${ICONS.arrowRight}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Render Filter Chips
  function renderFilterChips(projects) {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    const categories = new Set(['all']);
    projects.forEach(p => {
      if (p.enabled !== false && p.category) {
        categories.add(p.category);
      }
    });

    let html = '';
    categories.forEach(cat => {
      const label = cat === 'all' ? 'All Projects' : cat;
      const activeClass = cat === activeCategory ? 'active' : '';
      html += `
        <button class="category-chip ${activeClass}" data-cat="${escapeHtml(cat)}">
          ${escapeHtml(label)}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeCategory = chip.getAttribute('data-cat');
        renderFilterChips(projects);
        renderProjects(projects);
      });
    });
  }

  // Helper to dynamically update the Tools Available stat
  function updateToolsCountStat(projects) {
    const activeCount = (projects || []).filter(p => p.enabled !== false).length;
    const statEl = document.getElementById('toolsCountStat');
    if (statEl) {
      statEl.textContent = String(activeCount);
    }
  }

  // Render Projects Grid
  function renderProjects(projects) {
    updateToolsCountStat(projects);
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const visibleProjects = projects.filter(p => {
      if (p.enabled === false) return false;
      if (activeCategory === 'all') return true;
      return p.category === activeCategory;
    });

    if (visibleProjects.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
          No projects found in this category.
        </div>
      `;
      return;
    }

    grid.innerHTML = visibleProjects.map(project => {
      const iconSvg = ICONS[project.icon] || ICONS.sparkles;
      const highlightClass = project.highlight ? 'highlight' : '';
      const tagsHtml = (project.tags || []).map(t => `<span class="tag-item">${escapeHtml(t)}</span>`).join('');
      
      const targetUrl = project.url || '#';
      const isExternal = targetUrl.startsWith('http');

      // Status badge styling
      const statusText = project.status || 'Live';
      let statusClass = 'status-live';
      const stLower = statusText.toLowerCase();
      if (stLower.includes('dev')) {
        statusClass = 'status-dev';
      } else if (stLower.includes('beta')) {
        statusClass = 'status-beta';
      } else if (stLower.includes('discontinued') || stLower.includes('offline') || stLower.includes('closed')) {
        statusClass = 'status-discontinued';
      }

      // Launch button control
      const isLaunchEnabled = project.launchEnabled !== false;
      const launchBtnLabel = project.launchButtonText || (isLaunchEnabled ? 'Launch Application' : 'Coming Soon');

      return `
        <article class="project-card ${highlightClass}" id="project-${escapeHtml(project.id)}">
          <div>
            <div class="card-header">
              <div class="card-icon-box">
                ${iconSvg}
              </div>
              <div class="card-badges">
                ${project.badge ? `<span class="badge badge-flagship">${escapeHtml(project.badge)}</span>` : ''}
                <span class="badge badge-status ${statusClass}">
                  <span class="status-dot"></span>
                  ${escapeHtml(statusText)}
                </span>
              </div>
            </div>

            <div class="card-body">
              <h3 class="project-title">${escapeHtml(project.title)}</h3>
              <div class="project-category">${escapeHtml(project.category || 'CBC Tool')}</div>
              <p class="project-desc">${escapeHtml(project.description)}</p>
              
              <div class="tags-list">
                ${tagsHtml}
              </div>
            </div>
          </div>

          <div class="card-footer">
            ${isLaunchEnabled ? `
              <a href="${escapeHtml(targetUrl)}" 
                 ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} 
                 class="card-link-btn"
                 aria-label="Open ${escapeHtml(project.title)}">
                <span>${escapeHtml(launchBtnLabel)}</span>
                ${ICONS.externalLink}
              </a>
            ` : `
              <button class="card-link-btn btn-disabled" disabled aria-disabled="true">
                <span>${escapeHtml(launchBtnLabel)}</span>
              </button>
            `}
          </div>
        </article>
      `;
    }).join('');
  }

  // Privacy protection: Sanitize sublabels so raw phone numbers and emails are never exposed
  function cleanContactSublabel(c) {
    const raw = (c.sublabel || '').trim();
    if (!raw) return '';
    const isPhone = raw.startsWith('+') || /^\+?\d[\d\s\-()]{6,}\d$/.test(raw);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);

    if (isPhone) {
      if (c.icon === 'whatsapp' || (c.label && c.label.toLowerCase().includes('whatsapp'))) {
        return 'Instant direct chat';
      }
      return 'Voice inquiries';
    }
    if (isEmail) {
      return 'Send official inquiry';
    }
    return raw;
  }

  // Render Contacts & Socials Grid
  function renderContacts(contacts, customLinks) {
    const grid = document.getElementById('connectGrid');
    const customStrip = document.getElementById('customLinksStrip');
    if (!grid) return;

    const visibleContacts = (contacts || []).filter(c => c.enabled !== false && c.url && c.url.trim() !== '');

    grid.innerHTML = visibleContacts.map(c => {
      const iconSvg = ICONS[c.icon] || ICONS.genericLink;
      const isExternal = c.url.startsWith('http');
      const iconClass = c.icon || 'default';
      const safeSublabel = cleanContactSublabel(c);

      return `
        <a href="${escapeHtml(c.url)}" 
           ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}
           class="connect-card"
           aria-label="${escapeHtml(c.label)}">
          <div class="connect-icon ${escapeHtml(iconClass)}">
            ${iconSvg}
          </div>
          <div class="connect-meta">
            <span class="connect-label">${escapeHtml(c.label)}</span>
            ${safeSublabel ? `<span class="connect-sublabel">${escapeHtml(safeSublabel)}</span>` : ''}
          </div>
          <div class="connect-arrow">
            ${ICONS.arrowRight}
          </div>
        </a>
      `;
    }).join('');

    // Render Custom Links Pill Strip
    if (customStrip) {
      const visibleCustom = (customLinks || []).filter(cl => cl.enabled !== false && cl.url && cl.url.trim() !== '');
      if (visibleCustom.length > 0) {
        customStrip.innerHTML = visibleCustom.map(cl => {
          const iconSvg = ICONS[cl.icon] || ICONS.genericLink;
          return `
            <a href="${escapeHtml(cl.url)}" class="custom-link-pill" target="_blank" rel="noopener noreferrer">
              ${iconSvg}
              <span>${escapeHtml(cl.label)}</span>
              ${cl.badge ? `<span style="font-size:0.68rem; padding:1px 6px; border-radius:4px; background:var(--accent-primary-glow); color:var(--accent-primary);">${escapeHtml(cl.badge)}</span>` : ''}
            </a>
          `;
        }).join('');
        customStrip.style.display = 'flex';
      } else {
        customStrip.style.display = 'none';
      }
    }
  }

  // HTML Escape utility
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Apply complete configuration to UI
  function applyConfig(cfg) {
    if (!cfg) return;
    currentConfig = cfg;
    renderAnnouncement(cfg.announcement);
    renderFilterChips(cfg.projects || []);
    renderProjects(cfg.projects || []);
    renderContacts(cfg.contacts || [], cfg.customLinks || []);
    updateToolsCountStat(cfg.projects || []);
  }

  // Initialize UI
  async function init() {
    // Check if fresh reload requested via URL (e.g. index.html?fresh=1 from admin)
    const isFresh = window.location.search.includes('fresh') || window.location.search.includes('reload');
    if (isFresh) {
      try { localStorage.removeItem(CACHE_TIME_KEY); } catch (_) {}
    }

    currentConfig = getInitialConfig();
    applyConfig(currentConfig);

    // Background sync with Cloud Firestore
    const remote = await fetchRemoteConfig(isFresh);
    if (remote) {
      applyConfig(remote);
    }

    // Cross-tab live sync within same browser
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          applyConfig(updated);
        } catch (_) {}
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
