/**
 * Main Application Orchestrator
 * Coordinates Theme, Calendar, Personal Task/KPI Tracker, Auth, and Notifications.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme (Light / Dark)
  initTheme();

  // 2. Initialize Core Components
  window.CalendarRenderer.init();
  window.Modals.init();
  window.AdminHub.init();

  // 3. Initialize Authentication & Session
  if (window.Auth) {
    await window.Auth.init();
  }

  // 4. Load Initial Event Data (Public + User Merged if logged in)
  await loadInitialData();

  // 5. Bind Global UI Events
  bindGlobalControls();

  // 6. Check URL Parameters for direct routes (?view=manage-alerts, ?view=reset-password, ?view=admin)
  handleUrlRouting();
});

// ----------------- Theme Management -----------------
function initTheme() {
  const savedTheme = localStorage.getItem('celebration_cal_theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('celebration_cal_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

// ----------------- Data Loading & Hero Spotlight -----------------
async function loadInitialData() {
  try {
    const year = window.CalendarRenderer.selectedYear;
    const res = await window.API.getEvents({ year });
    const events = res.events || [];

    window.CalendarRenderer.setEvents(events);
    updateLayerCounts(events, res.userTaskCount || 0);
    populateHeroSpotlight(events);
  } catch (err) {
    console.error('Failed to load initial calendar events:', err);
  }
}

function updateLayerCounts(events, userTaskCount = 0) {
  const counts = {
    nigeria: events.filter(e => e.scope === 'nigeria').length,
    africa: events.filter(e => e.scope === 'africa').length,
    energy: events.filter(e => e.scope === 'energy').length,
    global: events.filter(e => e.scope === 'global').length,
    user_task: events.filter(e => e.scope === 'user_task').length || userTaskCount
  };

  document.querySelectorAll('.layer-chip').forEach(chip => {
    const layer = chip.getAttribute('data-layer');
    const badge = chip.querySelector('.chip-count');
    if (badge && counts[layer] !== undefined) {
      badge.textContent = counts[layer];
    }
  });

  const bStatNg = document.getElementById('bentoStatNigeria');
  const bStatEnergy = document.getElementById('bentoStatEnergy');
  const bStatAfrica = document.getElementById('bentoStatAfrica');
  const bStatGlobal = document.getElementById('bentoStatGlobal');

  if (bStatNg) bStatNg.textContent = counts.nigeria;
  if (bStatEnergy) bStatEnergy.textContent = counts.energy;
  if (bStatAfrica) bStatAfrica.textContent = counts.africa;
  if (bStatGlobal) bStatGlobal.textContent = counts.global;
}

function populateHeroSpotlight(events) {
  const spotlightContainer = document.getElementById('heroSpotlight');
  if (!spotlightContainer || events.length === 0) return;

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  // Find next upcoming observance
  let nextEvent = null;
  let minDiffDays = Infinity;

  events.forEach(ev => {
    const [y, m, d] = ev.dateStr.split('-').map(Number);
    const evUtc = Date.UTC(y, m - 1, d);
    const diffDays = Math.round((evUtc - todayUtc) / 86400000);

    if (diffDays >= 0 && diffDays < minDiffDays) {
      minDiffDays = diffDays;
      nextEvent = ev;
    }
  });

  if (!nextEvent) {
    nextEvent = events[0];
    minDiffDays = 0;
  }

  let daysTag = '';
  if (minDiffDays === 0) daysTag = 'TODAY 🎉';
  else if (minDiffDays === 1) daysTag = 'TOMORROW';
  else daysTag = `IN ${minDiffDays} DAYS`;

  const [y, m, d] = nextEvent.dateStr.split('-').map(Number);
  const friendlyDate = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const badgeEl = document.getElementById('spotlightDaysBadge');
  if (badgeEl) {
    badgeEl.textContent = daysTag;
    badgeEl.className = 'spotlight-strip-tag ' + (nextEvent.scope || 'nigeria');
  }
  document.getElementById('spotlightTitle').textContent = nextEvent.name;
  document.getElementById('spotlightDateText').textContent = friendlyDate;
  document.getElementById('spotlightDesc').textContent = nextEvent.description;

  const notifyBtn = document.getElementById('spotlightNotifyBtn');
  if (notifyBtn) {
    notifyBtn.onclick = () => {
      window.Modals.openSignupModal(nextEvent);
    };
  }

  const detailsBtn = document.getElementById('spotlightDetailsBtn');
  if (detailsBtn) {
    detailsBtn.onclick = () => {
      window.Modals.openEventDetail(nextEvent.id, nextEvent.year);
    };
  }
}

// ----------------- Global Controls Binding -----------------
function bindGlobalControls() {
  // Layer Chips
  document.querySelectorAll('.layer-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const layer = chip.getAttribute('data-layer');
      window.CalendarRenderer.toggleLayer(layer);
    });
  });

  // Search input
  const searchInput = document.getElementById('eventSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      const val = searchInput.value;
      if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        window.CalendarRenderer.setSearch(val);
      }, 180);
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.remove('visible');
      window.CalendarRenderer.setSearch('');
      searchInput.focus();
    });
  }

  // Navigation: Prev / Next / Today
  document.getElementById('btnPrevPeriod')?.addEventListener('click', () => window.CalendarRenderer.prevPeriod());
  document.getElementById('btnNextPeriod')?.addEventListener('click', () => window.CalendarRenderer.nextPeriod());
  document.getElementById('btnTodayJump')?.addEventListener('click', () => window.CalendarRenderer.jumpToToday());

  // View Switcher Buttons (Month, Year, Agenda)
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      window.CalendarRenderer.setView(view);
    });
  });

  // Week Start Toggle (Sun vs Mon)
  document.getElementById('weekStartToggleBtn')?.addEventListener('click', () => {
    window.CalendarRenderer.toggleWeekStart();
  });

  // Header Nav Actions
  document.getElementById('navGetAlertsBtn')?.addEventListener('click', () => window.Modals.openSignupModal());
  document.getElementById('heroJoinAlertsBtn')?.addEventListener('click', () => window.Modals.openSignupModal());

  // Authentication Buttons
  document.getElementById('navLoginBtn')?.addEventListener('click', () => window.Auth.openAuthModal('login'));
  document.getElementById('navRegisterBtn')?.addEventListener('click', () => window.Auth.openAuthModal('register'));
  document.getElementById('headerLogoutBtn')?.addEventListener('click', () => {
    if (confirm('Log out of your personal account?')) {
      window.Auth.logout();
    }
  });

  // Notification Bell Toggle
  const bellBtn = document.getElementById('notifBellBtn');
  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.NotificationsCenter.toggleDropdown();
    });
  }

  document.getElementById('notifMarkAllReadBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.NotificationsCenter.markAllRead();
  });

  // Close notification dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const bell = document.getElementById('headerNotificationBell');
    if (dropdown && dropdown.classList.contains('active')) {
      if (!dropdown.contains(e.target) && !bell.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    }
  });

  // Create Task button inside Task dashboard
  document.getElementById('btnCreateTask')?.addEventListener('click', () => {
    window.TasksManager.openCreateModal();
  });

  // Footer Links
  document.getElementById('footerManageAlerts')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.Modals.openManageAlertsModal();
  });
  document.getElementById('footerAdminHub')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.AdminHub.openAdminModal();
  });
  document.getElementById('footerPrivacy')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.Modals.openPrivacyModal();
  });
}

// ----------------- URL Routing -----------------
function handleUrlRouting() {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view');
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  if (view === 'manage-alerts' || view === 'unsubscribe' || (token && !view)) {
    setTimeout(() => {
      window.Modals.openManageAlertsModal(token, email);
    }, 400);
  } else if (view === 'admin') {
    setTimeout(() => {
      window.AdminHub.openAdminModal();
    }, 400);
  } else if (view === 'tasks') {
    setTimeout(() => {
      if (window.TasksManager) window.TasksManager.toggleDashboard();
    }, 400);
  }
}
