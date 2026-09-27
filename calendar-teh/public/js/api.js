/**
 * API Client for Calendar & Personal Task/KPI Tracker Backend
 */

const API = {
  baseUrl: '',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Auto-attach auth token if available and not explicitly overridden
    if (!headers.Authorization && window.Auth && window.Auth.getToken()) {
      headers.Authorization = `Bearer ${window.Auth.getToken()}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  },

  // ----------------- Authentication -----------------
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(data) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMe(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/auth/me', { headers });
  },

  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    });
  },

  // ----------------- Events (Public + User Merged) -----------------
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.year) query.set('year', params.year);
    if (params.month) query.set('month', params.month);
    if (params.scope) query.set('scope', params.scope);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/events${qs}`);
  },

  async getEvent(id, year) {
    const qs = year ? `?year=${year}` : '';
    return this.request(`/api/events/${id}${qs}`);
  },

  async createEvent(eventData) {
    return this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(id, eventData) {
    return this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  async deleteEvent(id) {
    return this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  // ----------------- Tasks & KPIs -----------------
  async getTasks(params = {}, token) {
    const query = new URLSearchParams();
    if (params.view) query.set('view', params.view);
    if (params.objective) query.set('objective', params.objective);
    if (params.priority) query.set('priority', params.priority);
    if (params.entity_type) query.set('entity_type', params.entity_type);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/tasks${qs}`, { headers });
  },

  async getTask(id, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/api/tasks/${id}`, { headers });
  },

  async createTask(taskData, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/tasks', {
      method: 'POST',
      headers,
      body: JSON.stringify(taskData)
    });
  },

  async updateTask(id, updates, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(id, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers
    });
  },

  async getTaskStats(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/tasks/stats', { headers });
  },

  async importTehCommunicationsTemplate(quarter = 'Q3', year = 2026, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/tasks/template/teh-communications', {
      method: 'POST',
      headers,
      body: JSON.stringify({ quarter, year })
    });
  },

  // ----------------- In-App Notifications -----------------
  async getNotifications(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/notifications', { headers });
  },

  async markNotificationRead(id, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers
    });
  },

  async markAllNotificationsRead(token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.request('/api/notifications/read-all', {
      method: 'PUT',
      headers
    });
  },

  // ----------------- Public Subscribers -----------------
  async subscribe(subData) {
    return this.request('/api/subscribers', {
      method: 'POST',
      body: JSON.stringify(subData)
    });
  },

  async getSubscriberPreferences(token, email) {
    const query = new URLSearchParams();
    if (token) query.set('token', token);
    if (email) query.set('email', email);
    return this.request(`/api/subscribers/manage?${query.toString()}`);
  },

  async updateSubscriber(id, updates) {
    return this.request(`/api/subscribers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async unsubscribe(tokenOrEmail) {
    return this.request('/api/subscribers/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ token: tokenOrEmail, email: tokenOrEmail })
    });
  },

  async getSubscribersAdmin() {
    return this.request('/api/subscribers');
  },

  // ----------------- Alerts & Outbox -----------------
  async runAlertCycle(simulatedDate) {
    return this.request('/api/alerts/run', {
      method: 'POST',
      body: JSON.stringify({ simulated_date: simulatedDate || null })
    });
  },

  async getAlertLogs() {
    return this.request('/api/alerts/logs');
  },

  async getOutbox() {
    return this.request('/api/outbox');
  },

  async clearOutbox() {
    return this.request('/api/outbox', { method: 'DELETE' });
  },

  // ----------------- Lunar -----------------
  async getLunarOverrides() {
    return this.request('/api/lunar');
  },

  async setLunarOverride(payload) {
    return this.request('/api/lunar/override', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ----------------- Status -----------------
  async getSystemStatus() {
    return this.request('/api/system/status');
  }
};

window.API = API;
