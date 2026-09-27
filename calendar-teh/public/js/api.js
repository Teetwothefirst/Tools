/**
 * API Client for Calendar Backend
 */

const API = {
  baseUrl: '',

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

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

  // Events
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

  // Subscribers
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

  // Alerts & Outbox
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

  // Lunar
  async getLunarOverrides() {
    return this.request('/api/lunar');
  },

  async setLunarOverride(payload) {
    return this.request('/api/lunar/override', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Status
  async getSystemStatus() {
    return this.request('/api/system/status');
  }
};

window.API = API;
