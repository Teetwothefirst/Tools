/**
 * Task & KPI Management Controller
 * Handles the dedicated Life Manager Dashboard, KPI Matrix Table (matching the PDF spreadsheet),
 * quick progress steppers, views (Today, This Week, Overdue, Upcoming), and iCalendar feed export.
 */

const TasksManager = {
  currentView: 'kpi_matrix', // 'kpi_matrix' | 'today' | 'this_week' | 'overdue' | 'upcoming' | 'all'
  currentObjective: 'all',
  tasks: [],
  stats: null,

  async init() {
    this.bindControls();
    await this.refresh();
  },

  async refresh() {
    if (!window.Auth || !window.Auth.isLoggedIn()) return;
    try {
      const token = window.Auth.getToken();
      const res = await window.API.getTasks({ view: 'all' }, token);
      this.tasks = res.tasks || [];
      this.stats = res.stats || null;

      this.renderStats();
      this.renderView();
      this.updateSyncFeedUrl();
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  },

  renderStats() {
    if (!this.stats) return;
    const s = this.stats;

    const scoreEl = document.getElementById('kpiOverallScore');
    const onTrackEl = document.getElementById('kpiOnTrackCount');
    const atRiskEl = document.getElementById('kpiAtRiskCount');
    const overdueEl = document.getElementById('kpiOverdueCount');

    if (scoreEl) scoreEl.textContent = `${s.overallKpiScore}%`;
    if (onTrackEl) onTrackEl.textContent = s.onTrack;
    if (atRiskEl) atRiskEl.textContent = s.atRisk;
    if (overdueEl) overdueEl.textContent = s.overdue;
  },

  renderView() {
    const matrixView = document.getElementById('kpiMatrixViewContainer');
    const cardsView = document.getElementById('kpiCardsViewContainer');

    if (this.currentView === 'kpi_matrix') {
      if (matrixView) matrixView.style.display = 'block';
      if (cardsView) cardsView.style.display = 'none';
      this.renderMatrixTable();
    } else {
      if (matrixView) matrixView.style.display = 'none';
      if (cardsView) cardsView.style.display = 'grid';
      this.renderCardsGrid();
    }
  },

  // ----------------- KPI Matrix Table (PDF Recreation) -----------------
  renderMatrixTable() {
    const tableBody = document.getElementById('kpiMatrixTableBody');
    if (!tableBody) return;

    if (this.tasks.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">
            No KPIs or tasks found. Click <strong>"Import TEH Communications KPI Template"</strong> above to load your full 19-point tracker!
          </td>
        </tr>
      `;
      return;
    }

    // Group tasks by Objective
    const grouped = {};
    this.tasks.forEach(t => {
      const obj = t.objective || 'General';
      if (!grouped[obj]) grouped[obj] = [];
      grouped[obj].push(t);
    });

    let html = '';
    let objIndex = 1;

    Object.keys(grouped).forEach(objectiveName => {
      const items = grouped[objectiveName];

      // Objective Header Row
      html += `
        <tr class="kpi-objective-header-row">
          <td colspan="7">
            <strong>${objIndex}. ${objectiveName}</strong> (${items.length} deliverables)
          </td>
        </tr>
      `;
      objIndex++;

      items.forEach(t => {
        const statusClass = t.status;
        const statusLabel = t.status.replace('_', ' ');
        const isChecked = t.completed ? 'checked' : '';

        html += `
          <tr data-task-row-id="${t.id}">
            <td style="width:30px; text-align:center;">
              <input type="checkbox" class="consent-checkbox" ${isChecked} onchange="TasksManager.toggleTaskCompletion('${t.id}', this.checked)" title="Mark completed">
            </td>
            <td style="min-width:240px;">
              <div style="font-weight:700; color:var(--text-primary); font-size:13.5px;">
                ${t.code ? `<span style="font-size:11px; color:#9333EA; font-weight:800; margin-right:4px;">[${t.code}]</span>` : ''}
                ${t.title}
              </div>
              <div style="font-size:12px; color:var(--text-secondary); margin-top:2px; line-height:1.35;">
                ${t.description}
              </div>
            </td>
            <td style="white-space:nowrap;">
              <strong>${t.target_metric}</strong> <span style="font-size:11px; color:var(--text-muted);">${t.unit}</span>
              ${t.annual_target ? `<div style="font-size:11px; color:var(--text-muted);">Annual: ${t.annual_target}</div>` : ''}
            </td>
            <td class="kpi-progress-bar-cell">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                <div class="quick-stepper">
                  <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', -1)" title="Decrement progress">-</button>
                  <strong style="margin:0 4px;">${t.current_progress}</strong>
                  <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', 1)" title="Increment progress">+</button>
                </div>
                <span style="font-weight:700; color:var(--text-secondary);">${t.progress_percentage}%</span>
              </div>
              <div class="kpi-progress-bar-bg">
                <div class="kpi-progress-bar-fill ${statusClass}" style="width:${t.progress_percentage}%;"></div>
              </div>
            </td>
            <td style="white-space:nowrap;">
              <span class="status-pill ${statusClass}">${statusLabel}</span>
              <div style="margin-top:4px;">
                <span class="priority-pill ${t.priority}">${t.priority}</span>
              </div>
            </td>
            <td style="white-space:nowrap; font-size:12px;">
              <div>📅 <strong>${t.due_date || 'No deadline'}</strong></div>
              <div style="font-size:11px; color:var(--text-muted); text-transform:capitalize;">${t.recurrence}</div>
            </td>
            <td style="white-space:nowrap; text-align:right;">
              <button class="btn btn-secondary btn-sm" onclick="TasksManager.openEditModal('${t.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="TasksManager.deleteTask('${t.id}')">✕</button>
            </td>
          </tr>
        `;
      });
    });

    tableBody.innerHTML = html;
  },

  // ----------------- Task Cards Grid (Today, This Week, Overdue) -----------------
  renderCardsGrid() {
    const container = document.getElementById('kpiCardsViewContainer');
    if (!container) return;

    let filtered = [...this.tasks];
    const today = new Date().toISOString().slice(0, 10);

    if (this.currentView === 'today') {
      filtered = filtered.filter(t => t.due_date === today);
    } else if (this.currentView === 'this_week') {
      const todayDate = new Date();
      const day = todayDate.getDay();
      const dist = day === 0 ? -6 : 1 - day;
      const mon = new Date(todayDate);
      mon.setDate(todayDate.getDate() + dist);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      const pad = n => String(n).padStart(2, '0');
      const startStr = `${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`;
      const endStr = `${sun.getFullYear()}-${pad(sun.getMonth() + 1)}-${pad(sun.getDate())}`;
      filtered = filtered.filter(t => t.due_date && t.due_date >= startStr && t.due_date <= endStr);
    } else if (this.currentView === 'overdue') {
      filtered = filtered.filter(t => t.status === 'overdue');
    } else if (this.currentView === 'upcoming') {
      filtered = filtered.filter(t => t.due_date && t.due_date >= today && !t.completed);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px; background:var(--bg-surface); border-radius:12px; border:1px solid var(--border-light);">
          <div style="font-size:36px; margin-bottom:10px;">🎉</div>
          <h3>No tasks in this view</h3>
          <p style="color:var(--text-secondary); margin-top:4px;">You have no items matching the "${this.currentView.replace('_', ' ')}" criteria.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(t => {
      html += `
        <div class="task-card">
          <div class="task-card-header">
            <span class="agenda-scope-pill user_task">${t.objective}</span>
            <span class="status-pill ${t.status}">${t.status.replace('_', ' ')}</span>
          </div>
          <div class="task-card-title">
            <input type="checkbox" class="consent-checkbox" ${t.completed ? 'checked' : ''} onchange="TasksManager.toggleTaskCompletion('${t.id}', this.checked)">
            <span style="${t.completed ? 'text-decoration:line-through; opacity:0.7;' : ''}">${t.title}</span>
          </div>
          <div class="task-card-desc">${t.description}</div>
          <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>Progress: ${t.current_progress}/${t.target_metric} ${t.unit}</span>
              <span>${t.progress_percentage}%</span>
            </div>
            <div class="kpi-progress-bar-bg">
              <div class="kpi-progress-bar-fill ${t.status}" style="width:${t.progress_percentage}%;"></div>
            </div>
          </div>
          <div class="task-card-footer">
            <span>📅 Due: <strong>${t.due_date || 'None'}</strong></span>
            <div>
              <button class="btn btn-secondary btn-sm" onclick="TasksManager.openEditModal('${t.id}')">Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="TasksManager.quickStep('${t.id}', 1)">+1</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // ----------------- Actions & Controls -----------------
  bindControls() {
    // Switch between Calendar and KPI Tracker View
    const navBtn = document.getElementById('navTasksKpiBtn');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        this.toggleDashboard();
      });
    }

    // Tabs inside Task Dashboard
    document.querySelectorAll('.kpi-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.kpi-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.getAttribute('data-view');
        this.renderView();
      });
    });

    // Import TEH Template Button
    const importBtn = document.getElementById('btnImportTehKpiTemplate');
    if (importBtn) {
      importBtn.addEventListener('click', async () => {
        await this.importTehTemplate();
      });
    }

    // Create New Task Modal Form
    const taskForm = document.getElementById('taskEditorForm');
    if (taskForm) {
      taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSaveTask(taskForm);
      });
    }

    // Copy iCalendar Feed URL button
    const copyFeedBtn = document.getElementById('btnCopyIcsFeed');
    if (copyFeedBtn) {
      copyFeedBtn.addEventListener('click', () => {
        const input = document.getElementById('icsFeedUrlInput');
        if (input) {
          navigator.clipboard.writeText(input.value);
          copyFeedBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyFeedBtn.textContent = '📋 Copy URL'; }, 2000);
        }
      });
    }
  },

  toggleDashboard() {
    const kpiSection = document.getElementById('kpiDashboardSection');
    const calSection = document.querySelector('.main-content');
    const heroSection = document.querySelector('.hero-section');
    const controlBar = document.querySelector('.control-bar');
    const navBtn = document.getElementById('navTasksKpiBtn');

    if (!kpiSection) return;

    const isOpening = !kpiSection.classList.contains('active');

    if (isOpening) {
      kpiSection.classList.add('active');
      if (calSection) calSection.style.display = 'none';
      if (heroSection) heroSection.style.display = 'none';
      if (controlBar) controlBar.style.display = 'none';
      if (navBtn) navBtn.innerHTML = '<span>📅</span> Switch to Calendar';
      this.refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      kpiSection.classList.remove('active');
      if (calSection) calSection.style.display = 'block';
      if (heroSection) heroSection.style.display = 'block';
      if (controlBar) controlBar.style.display = 'block';
      if (navBtn) navBtn.innerHTML = '<span>📋</span> My Tasks & KPIs';
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    }
  },

  async quickStep(taskId, delta) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    const newProgress = Math.max(0, (task.current_progress || 0) + delta);
    const token = window.Auth.getToken();

    try {
      await window.API.updateTask(taskId, { current_progress: newProgress }, token);
      await this.refresh();
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    } catch (err) {
      alert(`Could not update progress: ${err.message}`);
    }
  },

  async toggleTaskCompletion(taskId, completed) {
    const token = window.Auth.getToken();
    try {
      await window.API.updateTask(taskId, { completed }, token);
      if (completed && window.triggerCelebrationConfetti) {
        window.triggerCelebrationConfetti();
      }
      await this.refresh();
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    } catch (err) {
      alert(`Could not toggle task: ${err.message}`);
    }
  },

  async importTehTemplate() {
    if (!confirm('Load the Communications Analyst FY 2025/2026 Technical KPI Tracker (19 core deliverables)?')) return;
    const token = window.Auth.getToken();
    try {
      const res = await window.API.importTehCommunicationsTemplate('Q3', 2026, token);
      if (window.triggerCelebrationConfetti) {
        window.triggerCelebrationConfetti();
      }
      alert(res.message);
      await this.refresh();
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
  },

  openCreateModal() {
    const form = document.getElementById('taskEditorForm');
    if (!form) return;
    form.reset();
    form.querySelector('[name="task_id"]').value = '';
    form.querySelector('[name="start_date"]').value = new Date().toISOString().slice(0, 10);
    form.querySelector('[name="due_date"]').value = new Date().toISOString().slice(0, 10);
    document.getElementById('taskEditorModalTitle').textContent = 'Create Task / KPI Item';
    window.Modals.open('taskEditorModal');
  },

  openEditModal(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    const form = document.getElementById('taskEditorForm');
    if (!form) return;

    form.querySelector('[name="task_id"]').value = task.id;
    form.querySelector('[name="title"]').value = task.title;
    form.querySelector('[name="objective"]').value = task.objective;
    form.querySelector('[name="description"]').value = task.description || '';
    form.querySelector('[name="target_metric"]').value = task.target_metric;
    form.querySelector('[name="current_progress"]').value = task.current_progress;
    form.querySelector('[name="unit"]').value = task.unit;
    form.querySelector('[name="start_date"]').value = task.start_date || '';
    form.querySelector('[name="due_date"]').value = task.due_date || '';
    form.querySelector('[name="priority"]').value = task.priority;
    form.querySelector('[name="recurrence"]').value = task.recurrence;
    form.querySelector('[name="completed"]').checked = Boolean(task.completed);

    document.getElementById('taskEditorModalTitle').textContent = 'Edit Task / KPI Item';
    window.Modals.open('taskEditorModal');
  },

  async handleSaveTask(form) {
    const taskId = form.querySelector('[name="task_id"]').value;
    const token = window.Auth.getToken();
    const statusEl = document.getElementById('taskEditorStatus');
    statusEl.innerHTML = 'Saving...';

    const payload = {
      title: form.querySelector('[name="title"]').value.trim(),
      objective: form.querySelector('[name="objective"]').value,
      category: form.querySelector('[name="objective"]').value,
      description: form.querySelector('[name="description"]').value.trim(),
      target_metric: Number(form.querySelector('[name="target_metric"]').value),
      current_progress: Number(form.querySelector('[name="current_progress"]').value),
      unit: form.querySelector('[name="unit"]').value.trim(),
      start_date: form.querySelector('[name="start_date"]').value,
      due_date: form.querySelector('[name="due_date"]').value,
      priority: form.querySelector('[name="priority"]').value,
      recurrence: form.querySelector('[name="recurrence"]').value,
      completed: form.querySelector('[name="completed"]').checked
    };

    try {
      if (taskId) {
        await window.API.updateTask(taskId, payload, token);
      } else {
        await window.API.createTask(payload, token);
      }

      statusEl.innerHTML = '<span style="color:var(--color-ng-green); font-weight:bold;">Saved successfully!</span>';
      setTimeout(() => {
        window.Modals.closeAll();
        statusEl.innerHTML = '';
      }, 600);

      await this.refresh();
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    } catch (err) {
      statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:bold;">${err.message}</span>`;
    }
  },

  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task/KPI?')) return;
    const token = window.Auth.getToken();
    try {
      await window.API.deleteTask(taskId, token);
      await this.refresh();
      if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  },

  updateSyncFeedUrl() {
    const input = document.getElementById('icsFeedUrlInput');
    const user = window.Auth.getUser();
    if (!input || !user) return;
    const host = window.location.origin;
    input.value = `${host}/api/users/${user.id}/calendar.ics?token=${user.calendar_token}`;
  }
};

// ----------------- Notification Center -----------------
const NotificationsCenter = {
  pollingInterval: null,
  notifications: [],

  async startPolling() {
    this.stopPolling();
    await this.fetchNotifications();
    this.pollingInterval = setInterval(() => {
      this.fetchNotifications();
    }, 30000); // 30s poll
  },

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  },

  async fetchNotifications() {
    if (!window.Auth || !window.Auth.isLoggedIn()) return;
    try {
      const token = window.Auth.getToken();
      const res = await window.API.getNotifications(token);
      this.notifications = res.notifications || [];
      this.render(res.unreadCount);
    } catch (err) {
      // silent
    }
  },

  render(unreadCount) {
    const badge = document.getElementById('notifBadge');
    if (badge) {
      badge.textContent = unreadCount || 0;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    const listEl = document.getElementById('notifDropdownList');
    if (!listEl) return;

    if (this.notifications.length === 0) {
      listEl.innerHTML = '<div class="notif-empty">You have no notifications right now.</div>';
      return;
    }

    let html = '';
    this.notifications.forEach(n => {
      html += `
        <li class="notif-item ${!n.read ? 'unread' : ''}" onclick="NotificationsCenter.markRead('${n.id}')">
          <div class="notif-title">
            <span>${n.title}</span>
            ${!n.read ? '<span style="color:var(--color-coral); font-size:10px;">● NEW</span>' : ''}
          </div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </li>
      `;
    });
    listEl.innerHTML = html;
  },

  async markRead(id) {
    const token = window.Auth.getToken();
    try {
      await window.API.markNotificationRead(id, token);
      await this.fetchNotifications();
    } catch (err) {
      // silent
    }
  },

  async markAllRead() {
    const token = window.Auth.getToken();
    try {
      await window.API.markAllNotificationsRead(token);
      await this.fetchNotifications();
    } catch (err) {
      // silent
    }
  },

  toggleDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
    }
  }
};

window.TasksManager = TasksManager;
window.NotificationsCenter = NotificationsCenter;
