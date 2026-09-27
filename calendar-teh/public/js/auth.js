/**
 * Authentication & Session Management Module
 */

const Auth = {
  token: localStorage.getItem('teh_auth_token') || null,
  user: null,

  async init() {
    this.bindAuthForms();

    if (this.token) {
      try {
        const res = await window.API.getMe(this.token);
        this.user = res.user;
        this.updateUI();
        if (window.TasksManager) {
          window.TasksManager.init();
        }
        if (window.NotificationsCenter) {
          window.NotificationsCenter.startPolling();
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out.');
        this.logout(false);
      }
    } else {
      this.updateUI();
    }
  },

  isLoggedIn() {
    return Boolean(this.token && this.user);
  },

  getToken() {
    return this.token;
  },

  getUser() {
    return this.user;
  },

  updateUI() {
    const authActions = document.getElementById('headerAuthActions');
    const userProfile = document.getElementById('headerUserProfile');
    const taskNavBtn = document.getElementById('navTasksKpiBtn');
    const notifBell = document.getElementById('headerNotificationBell');
    const userTaskFilterChip = document.getElementById('userTaskFilterChip');

    if (this.isLoggedIn()) {
      if (authActions) authActions.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        document.getElementById('headerUserName').textContent = this.user.name || 'My Account';
        document.getElementById('headerUserRole').textContent = this.user.role || 'Communications Analyst';
      }
      if (taskNavBtn) taskNavBtn.style.display = 'inline-flex';
      if (notifBell) notifBell.style.display = 'inline-block';
      if (userTaskFilterChip) userTaskFilterChip.style.display = 'inline-flex';
    } else {
      if (authActions) authActions.style.display = 'flex';
      if (userProfile) userProfile.style.display = 'none';
      if (taskNavBtn) taskNavBtn.style.display = 'none';
      if (notifBell) notifBell.style.display = 'none';
      if (userTaskFilterChip) userTaskFilterChip.style.display = 'none';
    }
  },

  async login(email, password) {
    const res = await window.API.login(email, password);
    this.token = res.token;
    this.user = res.user;
    localStorage.setItem('teh_auth_token', this.token);
    this.updateUI();

    // Trigger celebration
    if (window.triggerCelebrationConfetti) {
      window.triggerCelebrationConfetti();
    }

    if (window.TasksManager) {
      window.TasksManager.init();
    }
    if (window.NotificationsCenter) {
      window.NotificationsCenter.startPolling();
    }
    if (window.CalendarRenderer) {
      window.CalendarRenderer.refresh();
    }
    return res;
  },

  async register(email, password, name, role, bu) {
    const res = await window.API.register({ email, password, name, role, bu });
    this.token = res.token;
    this.user = res.user;
    localStorage.setItem('teh_auth_token', this.token);
    this.updateUI();

    if (window.triggerCelebrationConfetti) {
      window.triggerCelebrationConfetti();
    }

    if (window.TasksManager) {
      window.TasksManager.init();
    }
    if (window.NotificationsCenter) {
      window.NotificationsCenter.startPolling();
    }
    if (window.CalendarRenderer) {
      window.CalendarRenderer.refresh();
    }
    return res;
  },

  logout(refreshCalendar = true) {
    this.token = null;
    this.user = null;
    localStorage.removeItem('teh_auth_token');
    this.updateUI();

    if (window.NotificationsCenter) {
      window.NotificationsCenter.stopPolling();
    }

    // Hide task dashboard if open
    const kpiSection = document.getElementById('kpiDashboardSection');
    const calSection = document.querySelector('.main-content');
    if (kpiSection) kpiSection.classList.remove('active');
    if (calSection) calSection.style.display = 'block';

    if (refreshCalendar && window.CalendarRenderer) {
      window.CalendarRenderer.refresh();
    }
  },

  bindAuthForms() {
    // Auth Modal tabs
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.auth-form-panel').forEach(p => {
          p.classList.toggle('active', p.getAttribute('id') === `authPanel_${tab}`);
        });
      });
    });

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('loginStatus');
        statusEl.innerHTML = '<span style="color:var(--text-secondary);">Logging in...</span>';

        const email = loginForm.querySelector('[name="email"]').value.trim();
        const password = loginForm.querySelector('[name="password"]').value;

        try {
          await this.login(email, password);
          statusEl.innerHTML = '<span style="color:var(--color-ng-green); font-weight:700;">Login successful!</span>';
          setTimeout(() => {
            window.Modals.closeAll();
            statusEl.innerHTML = '';
          }, 800);
        } catch (err) {
          statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">${err.message || 'Login failed.'}</span>`;
        }
      });
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('registerStatus');
        statusEl.innerHTML = '<span style="color:var(--text-secondary);">Creating your account...</span>';

        const email = registerForm.querySelector('[name="email"]').value.trim();
        const password = registerForm.querySelector('[name="password"]').value;
        const name = registerForm.querySelector('[name="name"]').value.trim();
        const role = registerForm.querySelector('[name="role"]').value.trim();
        const bu = registerForm.querySelector('[name="bu"]').value.trim();

        try {
          await this.register(email, password, name, role, bu);
          statusEl.innerHTML = '<span style="color:var(--color-ng-green); font-weight:700;">Account created and Communications KPI Tracker loaded!</span>';
          setTimeout(() => {
            window.Modals.closeAll();
            statusEl.innerHTML = '';
          }, 1200);
        } catch (err) {
          statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">${err.message || 'Registration failed.'}</span>`;
        }
      });
    }

    // Demo Account Quick Fill Button
    const demoFillBtn = document.getElementById('btnFillDemoAccount');
    if (demoFillBtn) {
      demoFillBtn.addEventListener('click', () => {
        if (loginForm) {
          loginForm.querySelector('[name="email"]').value = 'adejumo@teh.energy';
          loginForm.querySelector('[name="password"]').value = 'password123';
        }
      });
    }

    // Forgot Password Form Submit
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = document.getElementById('forgotStatus');
        statusEl.innerHTML = 'Sending reset instructions...';

        const email = forgotForm.querySelector('[name="email"]').value.trim();
        try {
          const res = await window.API.forgotPassword(email);
          statusEl.innerHTML = `
            <div style="padding:10px; background:#DCFCE7; color:#14532D; border-radius:6px; font-weight:bold;">
              ${res.message} ${res.simulation_token ? `<br><small style="font-weight:normal;">(Simulated Token: <code>${res.simulation_token}</code> - also recorded in Admin Outbox)</small>` : ''}
            </div>
          `;
        } catch (err) {
          statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">${err.message}</span>`;
        }
      });
    }
  },

  openAuthModal(defaultTab = 'login') {
    const tabBtn = document.querySelector(`.auth-tab-btn[data-tab="${defaultTab}"]`);
    if (tabBtn) tabBtn.click();
    window.Modals.open('authModal');
  }
};

window.Auth = Auth;
