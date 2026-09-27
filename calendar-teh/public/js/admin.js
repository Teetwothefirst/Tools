/**
 * Admin Hub Controller
 * Manages Events, Lunar Moon-Sighting Overrides, Alert Simulation, Subscribers Analytics, and Live Outbox Inspector.
 */

const AdminHub = {
  currentTab: 'events',

  init() {
    this.bindTabs();
    this.bindEventForm();
    this.bindLunarForm();
    this.bindSimulator();
  },

  bindTabs() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(p => {
      p.classList.toggle('active', p.getAttribute('id') === `adminPanel_${tabName}`);
    });

    if (tabName === 'events') this.loadEventsList();
    else if (tabName === 'lunar') this.loadLunarData();
    else if (tabName === 'subscribers') this.loadSubscribers();
    else if (tabName === 'outbox') this.loadOutbox();
    else if (tabName === 'status') this.loadSystemStatus();
  },

  openAdminModal() {
    window.Modals.open('adminModal');
    this.switchTab(this.currentTab);
  },

  // ----------------- Events Manager -----------------
  async loadEventsList() {
    const tableBody = document.getElementById('adminEventsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="6">Loading events...</td></tr>';

    try {
      const res = await window.API.getEvents({ year: new Date().getFullYear() });
      const events = res.events || [];

      if (events.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No events found.</td></tr>';
        return;
      }

      let rows = '';
      events.forEach(ev => {
        rows += `
          <tr>
            <td><strong>${ev.name}</strong></td>
            <td><span class="agenda-scope-pill ${ev.scope}">${ev.scope}</span></td>
            <td>${ev.dateStr || `${ev.month}/${ev.day}`}</td>
            <td>${ev.official ? '✅ Official' : '⚠️ Unofficial'}</td>
            <td>${ev.recurrence}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="AdminHub.editEvent('${ev.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="AdminHub.deleteEvent('${ev.id}')">Delete</button>
            </td>
          </tr>
        `;
      });
      tableBody.innerHTML = rows;
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="6" style="color:var(--color-coral)">Failed to load events: ${err.message}</td></tr>`;
    }
  },

  bindEventForm() {
    const form = document.getElementById('adminAddEventForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('adminEventFormStatus');
      statusEl.innerHTML = 'Saving event...';

      const payload = {
        id: form.querySelector('[name="event_id"]').value.trim() || undefined,
        name: form.querySelector('[name="name"]').value.trim(),
        scope: form.querySelector('[name="scope"]').value,
        category: form.querySelector('[name="category"]').value,
        recurrence: form.querySelector('[name="recurrence"]').value,
        month: form.querySelector('[name="month"]').value || null,
        day: form.querySelector('[name="day"]').value || null,
        description: form.querySelector('[name="description"]').value.trim(),
        source_note: form.querySelector('[name="source_note"]').value.trim(),
        official: form.querySelector('[name="official"]').checked,
        tags: form.querySelector('[name="tags"]').value.split(',').map(s => s.trim()).filter(Boolean)
      };

      try {
        await window.API.createEvent(payload);
        statusEl.innerHTML = `<span style="color:var(--color-ng-green); font-weight:700;">Event saved successfully!</span>`;
        form.reset();
        this.loadEventsList();
        window.CalendarRenderer.refresh();
      } catch (err) {
        statusEl.innerHTML = `<span style="color:var(--color-coral);">Failed: ${err.message}</span>`;
      }
    });
  },

  async editEvent(id) {
    const ev = window.CalendarRenderer.allEvents.find(x => x.id === id);
    if (!ev) return;
    const form = document.getElementById('adminAddEventForm');
    if (!form) return;

    form.querySelector('[name="event_id"]').value = ev.id;
    form.querySelector('[name="name"]').value = ev.name;
    form.querySelector('[name="scope"]').value = ev.scope;
    form.querySelector('[name="category"]').value = ev.category || 'observance';
    form.querySelector('[name="recurrence"]').value = ev.recurrence || 'fixed';
    form.querySelector('[name="month"]').value = ev.month || '';
    form.querySelector('[name="day"]').value = ev.day || '';
    form.querySelector('[name="description"]').value = ev.description || '';
    form.querySelector('[name="source_note"]').value = ev.source_note || '';
    form.querySelector('[name="official"]').checked = Boolean(ev.official);
    form.querySelector('[name="tags"]').value = (ev.tags || []).join(', ');

    form.scrollIntoView({ behavior: 'smooth' });
  },

  async deleteEvent(id) {
    if (!confirm(`Are you sure you want to delete event "${id}"?`)) return;
    try {
      await window.API.deleteEvent(id);
      this.loadEventsList();
      window.CalendarRenderer.refresh();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  },

  // ----------------- Lunar Moon Sighting Manager -----------------
  async loadLunarData() {
    const container = document.getElementById('adminLunarDataDisplay');
    if (!container) return;
    container.innerHTML = 'Loading lunar date configurations...';

    try {
      const data = await window.API.getLunarOverrides();
      let html = `<div class="admin-table-wrapper"><table class="admin-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Holiday</th>
            <th>Date</th>
            <th>Authority / Source</th>
          </tr>
        </thead>
        <tbody>
      `;

      if (data.years) {
        Object.keys(data.years).sort().forEach(year => {
          const holidays = data.years[year];
          Object.keys(holidays).forEach(hid => {
            const h = holidays[hid];
            const holidayName = hid === 'ng-eid-al-fitr' ? 'Eid al-Fitr (1 Shawwal)'
              : hid === 'ng-eid-al-adha' ? 'Eid al-Adha (10 Dhu al-Hijjah)'
              : 'Eid el-Maulud (12 Rabi al-Awwal)';

            html += `
              <tr>
                <td><strong>${year}</strong></td>
                <td>${holidayName}</td>
                <td>${h.month}/${h.day}</td>
                <td>${h.source}</td>
              </tr>
            `;
          });
        });
      }

      html += `</tbody></table></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-coral)">Failed to load lunar data: ${err.message}</div>`;
    }
  },

  bindLunarForm() {
    const form = document.getElementById('adminLunarForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('adminLunarStatus');
      statusEl.innerHTML = 'Saving moon sighting update...';

      const year = form.querySelector('[name="lunar_year"]').value;
      const event_id = form.querySelector('[name="lunar_event_id"]').value;
      const month = form.querySelector('[name="lunar_month"]').value;
      const day = form.querySelector('[name="lunar_day"]').value;
      const source = form.querySelector('[name="lunar_source"]').value.trim();

      try {
        await window.API.setLunarOverride({ year, event_id, month, day, source });
        statusEl.innerHTML = `<span style="color:var(--color-ng-green); font-weight:700;">Moon sighting date saved!</span>`;
        this.loadLunarData();
        window.CalendarRenderer.refresh();
      } catch (err) {
        statusEl.innerHTML = `<span style="color:var(--color-coral)">Failed: ${err.message}</span>`;
      }
    });
  },

  // ----------------- Alert Simulator -----------------
  bindSimulator() {
    const btn = document.getElementById('btnRunAlertSimulation');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const dateVal = document.getElementById('simulatedDateInput').value;
      const resultsEl = document.getElementById('alertSimulationResults');
      resultsEl.innerHTML = 'Running alert cycle and evaluating subscribers...';

      try {
        const res = await window.API.runAlertCycle(dateVal || null);
        const report = res.result;

        let dispatchedHtml = '';
        if (report.dispatched && report.dispatched.length > 0) {
          dispatchedHtml = `<div style="margin-top:12px;"><strong>Dispatched Alerts (${report.dispatched.length}):</strong><ul style="margin:8px 0 0 20px;">`;
          report.dispatched.forEach(d => {
            dispatchedHtml += `<li><strong>${d.eventName}</strong> (${d.leadTimeDays}d ahead) sent to ${d.email} [${d.emailType}] via ${d.provider}</li>`;
          });
          dispatchedHtml += `</ul></div>`;
        } else {
          dispatchedHtml = `<p style="margin-top:10px; color:var(--text-muted);">No new alerts triggered (either no events match subscriber lead times or duplicate alerts were already dispatched).</p>`;
        }

        let duplicatesHtml = '';
        if (report.skippedDuplicates && report.skippedDuplicates.length > 0) {
          duplicatesHtml = `<div style="margin-top:10px; color:var(--text-muted); font-size:12px;">Deduplication prevented ${report.skippedDuplicates.length} repeated alert(s).</div>`;
        }

        resultsEl.innerHTML = `
          <div style="padding:16px; background-color:var(--bg-surface); border:1px solid var(--border-light); border-radius:8px;">
            <div style="font-weight:800; color:var(--color-ng-green); font-size:15px;">✅ Simulation Completed for Date: ${report.referenceDate}</div>
            <div style="font-size:13px; margin-top:6px;">
              Active Subscribers: <strong>${report.activeSubscribersCount}</strong> |
              Evaluations: <strong>${report.totalEvaluations}</strong> |
              Dispatched: <strong>${report.dispatchedCount}</strong>
            </div>
            ${dispatchedHtml}
            ${duplicatesHtml}
          </div>
        `;

        // Switch to Outbox to show newly generated emails if any
        if (report.dispatchedCount > 0) {
          setTimeout(() => {
            const outboxTab = document.querySelector('[data-tab="outbox"]');
            if (outboxTab) outboxTab.textContent = `Email Outbox (${report.dispatchedCount} new)`;
          }, 500);
        }
      } catch (err) {
        resultsEl.innerHTML = `<span style="color:var(--color-coral)">Simulation failed: ${err.message}</span>`;
      }
    });
  },

  // ----------------- Subscribers Analytics -----------------
  async loadSubscribers() {
    const container = document.getElementById('adminSubscribersPanel');
    if (!container) return;
    container.innerHTML = 'Loading subscriber directory...';

    try {
      const data = await window.API.getSubscribersAdmin();
      const subs = data.subscribers || [];
      const seg = data.segmentation || {};

      let html = `
        <div class="admin-metrics-row">
          <div class="admin-stat-card">
            <div class="stat-label">Total Subscribers</div>
            <div class="stat-value">${data.total}</div>
            <div class="stat-subtext">${data.active} active / ${data.unsubscribed} unsubscribed</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-label">Work Segment</div>
            <div class="stat-value" style="color:var(--color-ng-green);">${seg.work || 0}</div>
            <div class="stat-subtext">Corporate & Utility accounts</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-label">Business Segment</div>
            <div class="stat-value" style="color:var(--color-terracotta);">${seg.business || 0}</div>
            <div class="stat-subtext">Enterprises & Solar devs</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-label">Personal Segment</div>
            <div class="stat-value" style="color:var(--color-indigo);">${seg.personal || 0}</div>
            <div class="stat-subtext">Citizens & Cultural buffs</div>
          </div>
        </div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Context</th>
                <th>Subscribed Layers</th>
                <th>Lead Times</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
      `;

      subs.forEach(s => {
        html += `
          <tr>
            <td><strong>${s.email}</strong> ${s.name ? `<span style="color:var(--text-muted); font-size:11px;">(${s.name})</span>` : ''}</td>
            <td><span class="agenda-scope-pill" style="background:#F3F4F6; text-transform:uppercase;">${s.email_type}</span></td>
            <td>${(s.interests || []).join(', ')}</td>
            <td>${(s.lead_times_days || []).map(d => `${d}d`).join(', ')}</td>
            <td>${s.status === 'active' ? '<span style="color:var(--color-ng-green); font-weight:700;">Active</span>' : '<span style="color:var(--color-coral);">Unsubscribed</span>'}</td>
            <td>${new Date(s.created_at).toLocaleDateString()}</td>
          </tr>
        `;
      });

      html += `</tbody></table></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-coral)">Failed to load subscribers: ${err.message}</div>`;
    }
  },

  // ----------------- Email Outbox Inspector -----------------
  async loadOutbox() {
    const listEl = document.getElementById('adminOutboxList');
    const iframe = document.getElementById('adminOutboxIframe');
    if (!listEl) return;

    listEl.innerHTML = 'Loading outbox messages...';

    try {
      const res = await window.API.getOutbox();
      const items = res.outbox || [];

      if (items.length === 0) {
        listEl.innerHTML = '<div style="padding:16px; color:var(--text-muted);">Outbox is empty. Run an alert cycle in the Simulator tab to trigger advance notifications!</div>';
        if (iframe) iframe.srcdoc = '<p style="font-family:sans-serif; padding:20px; color:#6B7280;">Select an email from the left sidebar to preview its full rendered HTML and styling.</p>';
        return;
      }

      let listHtml = '';
      items.forEach((item, index) => {
        listHtml += `
          <div class="outbox-item ${index === 0 ? 'active' : ''}" data-outbox-idx="${index}">
            <div class="outbox-item-to">To: ${item.to} <span style="font-size:10px; font-weight:normal; opacity:0.8;">[${item.emailType || 'work'}]</span></div>
            <div class="outbox-item-subj">${item.subject}</div>
            <div class="outbox-item-time">${new Date(item.timestamp).toLocaleTimeString()} · Provider: ${item.provider}</div>
          </div>
        `;
      });
      listEl.innerHTML = listHtml;

      // Select first item by default
      if (items[0] && iframe) {
        iframe.srcdoc = items[0].html;
      }

      // Add click listeners
      listEl.querySelectorAll('.outbox-item').forEach(el => {
        el.addEventListener('click', () => {
          listEl.querySelectorAll('.outbox-item').forEach(x => x.classList.remove('active'));
          el.classList.add('active');
          const idx = parseInt(el.getAttribute('data-outbox-idx'), 10);
          if (items[idx] && iframe) {
            iframe.srcdoc = items[idx].html;
          }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div style="color:var(--color-coral)">Failed to load outbox: ${err.message}</div>`;
    }
  },

  async clearOutbox() {
    if (!confirm('Clear all outbox logs?')) return;
    try {
      await window.API.clearOutbox();
      this.loadOutbox();
    } catch (err) {
      alert(`Clear failed: ${err.message}`);
    }
  },

  // ----------------- System Status -----------------
  async loadSystemStatus() {
    const container = document.getElementById('adminStatusPanel');
    if (!container) return;
    container.innerHTML = 'Checking backend status...';

    try {
      const data = await window.API.getSystemStatus();
      container.innerHTML = `
        <div class="admin-metrics-row">
          <div class="admin-stat-card">
            <div class="stat-label">System State</div>
            <div class="stat-value" style="color:var(--color-ng-green);">${data.status.toUpperCase()}</div>
            <div class="stat-subtext">Node.js Express API</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-label">Daily Scheduler</div>
            <div class="stat-value" style="font-size:20px;">${data.scheduler.cronExpression}</div>
            <div class="stat-subtext">Active daily cron job (08:00 WAT)</div>
          </div>
          <div class="admin-stat-card">
            <div class="stat-label">Email Mode</div>
            <div class="stat-value" style="font-size:18px; color:var(--color-terracotta);">${data.emailConfig.mode}</div>
            <div class="stat-subtext">Resend / SendGrid / SMTP / Outbox</div>
          </div>
        </div>

        <div style="background-color:var(--bg-surface); padding:20px; border-radius:8px; border:1px solid var(--border-light);">
          <h4 style="margin-bottom:12px;">Active Metrics</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:14px;">
            <li>📅 Total Events in Registry: <strong>${data.metrics.totalEvents}</strong></li>
            <li>🇳🇬 Nigerian Holidays & Observances: <strong>${data.metrics.nigeriaEvents}</strong></li>
            <li>⚡ Energy-Sector Observances: <strong>${data.metrics.energySectorEvents}</strong></li>
            <li>👥 Registered Alert Subscribers: <strong>${data.metrics.totalSubscribers}</strong></li>
            <li>📬 Sent Notifications Logged: <strong>${data.metrics.totalSentAlerts}</strong></li>
            <li>📨 Outbox Inspector Items: <strong>${data.metrics.outboxCount}</strong></li>
          </ul>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-coral)">Failed to load status: ${err.message}</div>`;
    }
  }
};

window.AdminHub = AdminHub;
