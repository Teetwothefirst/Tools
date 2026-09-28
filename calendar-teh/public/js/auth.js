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
          await window.TasksManager.init();
          window.TasksManager.openDashboard();
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
    const workspaceNav = document.getElementById('workspaceNavSegmented');
    const taskNavBtn = document.getElementById('navTasksKpiBtn');
    const notifBell = document.getElementById('headerNotificationBell');
    const userTaskFilterChip = document.getElementById('userTaskFilterChip');

    if (this.isLoggedIn()) {
      if (authActions) authActions.style.display = 'none';
      if (userProfile) {
        userProfile.style.display = 'flex';
        document.getElementById('headerUserName').textContent = this.user.name || 'Adetomiwa Adejumo';
        document.getElementById('headerUserRole').textContent = this.user.role || 'Communications Analyst';
      }
      if (workspaceNav) workspaceNav.style.display = 'inline-flex';
      if (taskNavBtn) taskNavBtn.style.display = 'none';
      if (notifBell) notifBell.style.display = 'inline-block';
      if (userTaskFilterChip) userTaskFilterChip.style.display = 'inline-flex';
    } else {
      if (authActions) authActions.style.display = 'flex';
      if (userProfile) userProfile.style.display = 'none';
      if (workspaceNav) workspaceNav.style.display = 'none';
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
      await window.TasksManager.init();
      window.TasksManager.openDashboard();
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
      await window.TasksManager.init();
      window.TasksManager.openDashboard();
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

    // Switch view back to public landing page & calendar
    if (window.TasksManager) {
      window.TasksManager.openCalendar();
    }

    if (refreshCalendar && window.CalendarRenderer) {
      window.CalendarRenderer.refresh();
    }
  },

  showAuthView(viewName = 'login') {
    const tagEl = document.getElementById('authModalTag');
    const titleEl = document.getElementById('authModalTitle');
    const subEl = document.getElementById('authModalSubtitle');

    // Hide all panels
    document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));

    const targetPanel = document.getElementById(`authPanel_${viewName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Reset status messages
    ['loginStatus', 'registerStatus', 'forgotStatus'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });

    if (viewName === 'login') {
      if (tagEl) tagEl.innerHTML = '<span>🔐</span> SECURE ACCESS';
      if (titleEl) titleEl.textContent = 'Log In to The Electricity Hub';
      if (subEl) subEl.textContent = 'Access your personal productivity deliverables, NERC tracking, and calendar.';
    } else if (viewName === 'register') {
      if (tagEl) tagEl.innerHTML = '<span>✨</span> NEW WORKSPACE';
      if (titleEl) titleEl.textContent = 'Create Your Account';
      if (subEl) subEl.textContent = 'Register to track personal deliverables, milestones, and team KPIs.';
    } else if (viewName === 'forgot') {
      if (tagEl) tagEl.innerHTML = '<span>🔑</span> ACCOUNT RECOVERY';
      if (titleEl) titleEl.textContent = 'Reset Your Password';
      if (subEl) subEl.textContent = 'Enter your work email address and we\'ll send you secure password reset instructions.';
    }
  },

  bindAuthForms() {
    // Dedicated view switcher links
    const linkForgot = document.getElementById('linkForgotPassword');
    if (linkForgot) {
      linkForgot.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAuthView('forgot');
      });
    }

    const linkGoRegister = document.getElementById('linkGoToRegister');
    if (linkGoRegister) {
      linkGoRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAuthView('register');
      });
    }

    const linkForgotBack = document.getElementById('linkForgotBackToLogin');
    if (linkForgotBack) {
      linkForgotBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAuthView('login');
      });
    }

    const linkRegBack = document.getElementById('linkRegisterBackToLogin');
    if (linkRegBack) {
      linkRegBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.showAuthView('login');
      });
    }

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

  openAuthModal(defaultView = 'login') {
    this.showAuthView(defaultView);
    window.Modals.open('authModal');
  }
};

window.Auth = Auth;
