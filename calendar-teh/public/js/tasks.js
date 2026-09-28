/**
 * Task & KPI Management Controller (Minimalist Apple-Grade UX)
 * Provides an intuitive, human-friendly Deliverables view,
 * clean Objective accordions, executive score cards, and real-time filtering.
 */

const TasksManager = {
  currentView: 'cards', // 'cards' (default) | 'grouped' | 'matrix'
  statusFilter: 'all',  // 'all' | 'on_track' | 'at_risk' | 'completed'
  objectiveFilter: 'all', // 'all' | specific pillar
  searchQuery: '',
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

  updateSyncFeedUrl() {
    const input = document.getElementById('icsFeedUrlInput');
    if (!input) return;
    const user = window.Auth?.getUser();
    if (user && user.id) {
      input.value = `${window.location.origin}/api/users/${user.id}/calendar.ics`;
    } else {
      input.value = '';
    }
  },

  // ----------------- Executive Stats & Status Scoreboard -----------------
  renderStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const onTrack = this.tasks.filter(t => t.status === 'on_track' && !t.completed).length;
    const atRisk = this.tasks.filter(t => (t.status === 'at_risk' || t.status === 'overdue') && !t.completed).length;

    // Overall KPI Delivery Score (computed as true average deliverable progress rate)
    let score = 0;
    if (total > 0) {
      const sumPcts = this.tasks.reduce((acc, t) => acc + (t.progress_percentage || 0), 0);
      score = Math.round(sumPcts / total);
    }

    const scoreEl = document.getElementById('kpiOverallScore');
    if (scoreEl) scoreEl.textContent = `${score}%`;

    const progressBar = document.getElementById('kpiScoreProgressBar');
    if (progressBar) progressBar.style.width = `${score}%`;

    const statusBadge = document.getElementById('kpiOverallStatusBadge');
    if (statusBadge) {
      if (score >= 70) {
        statusBadge.textContent = '🟢 High Velocity';
        statusBadge.style.color = '#00E676';
      } else if (score >= 40) {
        statusBadge.textContent = '🟡 Steady Track';
        statusBadge.style.color = '#FBBF24';
      } else {
        statusBadge.textContent = '🟠 In Progress';
        statusBadge.style.color = '#FF2E56';
      }
    }

    const summaryEl = document.getElementById('kpiProgressSummary');
    if (summaryEl) {
      summaryEl.textContent = `${completed} of ${total} Deliverables Marked Done (${onTrack} on track · Avg delivery: ${score}%)`;
    }

    // Health Pipeline Counters
    const metricOnTrack = document.getElementById('metricCountOnTrack');
    if (metricOnTrack) metricOnTrack.textContent = onTrack;

    const metricAtRisk = document.getElementById('metricCountAtRisk');
    if (metricAtRisk) metricAtRisk.textContent = atRisk;

    const metricCompleted = document.getElementById('metricCountCompleted');
    if (metricCompleted) metricCompleted.textContent = completed;

    // Filter Strip counts
    const countAll = document.getElementById('chipCountAll');
    const countOnTrack = document.getElementById('chipCountOnTrack');
    const countAtRisk = document.getElementById('chipCountAtRisk');
    const countCompleted = document.getElementById('chipCountCompleted');

    if (countAll) countAll.textContent = total;
    if (countOnTrack) countOnTrack.textContent = onTrack;
    if (countAtRisk) countAtRisk.textContent = atRisk;
    if (countCompleted) countCompleted.textContent = completed;

    // Strategic Pillars Breakdown & Live Tab Badges
    const calcPillarPct = (items) => {
      if (!items || items.length === 0) return 0;
      const sum = items.reduce((acc, t) => acc + (t.progress_percentage || 0), 0);
      return Math.round(sum / items.length);
    };

    const edItems = this.tasks.filter(t => t.objective === 'Content Creation & Editorial Support' || t.objective === 'Social Media & Platform Support');
    const diaItems = this.tasks.filter(t => t.objective === 'Event & Stakeholder Engagement Support' || t.objective === 'Proposal, Client & Partnership Support');
    const podItems = this.tasks.filter(t => t.objective === 'Multimedia & Digital Content Production');
    const regItems = this.tasks.filter(t => t.objective === 'Research & Sector Monitoring' || t.objective === 'Reporting & Documentation' || t.objective === 'Capacity Building & Knowledge Transfer');

    const badgeAll = document.getElementById('badgePillarAll');
    if (badgeAll) badgeAll.textContent = `${total}`;

    const badgeEd = document.getElementById('badgePillarEditorial');
    if (badgeEd) badgeEd.textContent = `${edItems.length} • ${calcPillarPct(edItems)}%`;

    const badgeDia = document.getElementById('badgePillarDialogue');
    if (badgeDia) badgeDia.textContent = `${diaItems.length} • ${calcPillarPct(diaItems)}%`;

    const badgePod = document.getElementById('badgePillarPodcast');
    if (badgePod) badgePod.textContent = `${podItems.length} • ${calcPillarPct(podItems)}%`;

    const badgeReg = document.getElementById('badgePillarRegulatory');
    if (badgeReg) badgeReg.textContent = `${regItems.length} • ${calcPillarPct(regItems)}%`;

    // Cadence Breakdown
    const dailyCount = this.tasks.filter(t => (t.recurrence === 'daily') || (t.title && t.title.toLowerCase().includes('daily'))).length;
    const biweeklyCount = this.tasks.filter(t => (t.recurrence === 'biweekly') || (t.title && t.title.toLowerCase().includes('podcast'))).length;
    const monthlyCount = this.tasks.filter(t => (t.recurrence === 'monthly') || (t.title && t.title.toLowerCase().includes('dialogue'))).length;

    const cadDaily = document.getElementById('kpiCadenceDaily');
    if (cadDaily) cadDaily.textContent = `${dailyCount || 2} Active`;

    const cadBiweekly = document.getElementById('kpiCadenceBiweekly');
    if (cadBiweekly) cadBiweekly.textContent = `${biweeklyCount || 4} Active`;

    const cadMonthly = document.getElementById('kpiCadenceMonthly');
    if (cadMonthly) cadMonthly.textContent = `${monthlyCount || 7} Active`;

    // Welcome user name
    const userNameEl = document.getElementById('kpiUserNameDisplay');
    if (userNameEl && window.Auth?.user?.name) {
      userNameEl.textContent = window.Auth.user.name;
    }
  },

  setStatusFilter(status) {
    this.statusFilter = status;
    document.querySelectorAll('.kpi-status-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-filter') === status);
    });
    this.renderView();
  },

  // ----------------- View Switcher Router -----------------
  renderView() {
    const cardsView = document.getElementById('kpiCardsViewContainer');
    const groupedView = document.getElementById('kpiGroupedViewContainer');
    const matrixView = document.getElementById('kpiMatrixViewContainer');

    if (cardsView) cardsView.style.display = this.currentView === 'cards' ? 'grid' : 'none';
    if (groupedView) groupedView.style.display = this.currentView === 'grouped' ? 'flex' : 'none';
    if (matrixView) matrixView.style.display = this.currentView === 'matrix' ? 'block' : 'none';

    if (this.currentView === 'cards') {
      this.renderCardsGrid();
    } else if (this.currentView === 'grouped') {
      this.renderGroupedView();
    } else if (this.currentView === 'matrix') {
      this.renderMatrixTable();
    }
  },

  getFilteredTasks() {
    let list = [...this.tasks];

    // Objective Pillar filter
    if (this.objectiveFilter && this.objectiveFilter !== 'all') {
      const filterKey = this.objectiveFilter.toLowerCase();
      if (filterKey === 'editorial') {
        list = list.filter(t => t.objective === 'Content Creation & Editorial Support' || t.objective === 'Social Media & Platform Support');
      } else if (filterKey === 'dialogue') {
        list = list.filter(t => t.objective === 'Event & Stakeholder Engagement Support' || t.objective === 'Proposal, Client & Partnership Support');
      } else if (filterKey === 'podcast') {
        list = list.filter(t => t.objective === 'Multimedia & Digital Content Production');
      } else if (filterKey === 'regulatory') {
        list = list.filter(t => t.objective === 'Research & Sector Monitoring' || t.objective === 'Reporting & Documentation' || t.objective === 'Capacity Building & Knowledge Transfer');
      } else {
        list = list.filter(t => (t.objective || '').toLowerCase().includes(filterKey));
      }
    }

    // Status filter
    if (this.statusFilter === 'on_track') {
      list = list.filter(t => t.status === 'on_track' && !t.completed);
    } else if (this.statusFilter === 'at_risk') {
      list = list.filter(t => (t.status === 'at_risk' || t.status === 'overdue') && !t.completed);
    } else if (this.statusFilter === 'completed') {
      list = list.filter(t => t.completed);
    }

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.objective && t.objective.toLowerCase().includes(q))
      );
    }

    return list;
  },

  // ----------------- 1. Clean Deliverable Cards View (Default) -----------------
  renderCardsGrid() {
    const container = document.getElementById('kpiCardsViewContainer');
    if (!container) return;

    const filtered = this.getFilteredTasks();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:48px 24px; background:var(--bg-surface); border-radius:var(--border-radius-lg); border:1px solid var(--border-light);">
          <div style="font-size:32px; margin-bottom:8px;">✨</div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary);">No deliverables found</h3>
          <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">No items match your active filter or search.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(t => {
      const isChecked = t.completed ? 'checked' : '';
      const statusLabel = t.completed ? 'Completed' : (t.status === 'at_risk' ? 'Needs Attention' : 'On Track');
      const statusClass = t.completed ? 'completed' : t.status;
      const cadenceStr = t.recurrence ? (t.recurrence.charAt(0).toUpperCase() + t.recurrence.slice(1)) : 'Quarterly';
      const annualTarget = t.annual_target || (t.target_metric * 4);

      html += `
        <div class="task-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
          <div class="task-card-top">
            <input type="checkbox" class="task-round-checkbox" ${isChecked} onchange="TasksManager.toggleTaskCompletion('${t.id}', this.checked)" title="Mark as completed">
            <div class="task-card-content">
              <div class="task-card-header-row">
                <span class="kpi-code-badge">${t.code || 'KPI'}</span>
                <span class="task-objective-tag">${t.objective}</span>
              </div>
              <div class="task-card-title">${t.title}</div>
              <div class="task-card-desc">${t.description || ''}</div>
              <div class="task-card-meta-line">
                <span>🔄 ${cadenceStr} Cadence</span>
                <span>&bull;</span>
                <span>Target: ${t.target_metric} ${t.unit} (Annual: ${annualTarget})</span>
              </div>
            </div>
          </div>

          <div class="task-progress-section">
            <div class="task-progress-header">
              <div class="task-progress-stepper">
                <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', -1)" title="Decrement work">-</button>
                <span style="font-weight:700; color:var(--text-primary); font-size:12.5px;">
                  ${t.current_progress} of ${t.target_metric} ${t.unit}
                </span>
                <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', 1)" title="Increment work">+</button>
              </div>
              <span style="font-weight:800; color:var(--text-primary); font-size:12.5px; font-family:var(--font-family-mono);">${t.progress_percentage}%</span>
            </div>
            <div class="kpi-progress-bar-bg">
              <div class="kpi-progress-bar-fill ${statusClass}" style="width:${t.progress_percentage}%;"></div>
            </div>
          </div>

          <div class="task-card-footer">
            <div class="task-card-due">
              <span>📅 ${t.due_date ? `Due ${t.due_date}` : 'No deadline'}</span>
            </div>
            <div class="task-card-actions">
              <span class="status-pill ${statusClass}">${statusLabel}</span>
              <button class="btn btn-secondary btn-sm" onclick="TasksManager.openEditModal('${t.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="TasksManager.deleteTask('${t.id}')" title="Delete">✕</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // ----------------- 2. Grouped By Objective View (Clean Accordions) -----------------
  renderGroupedView() {
    const container = document.getElementById('kpiGroupedViewContainer');
    if (!container) return;

    const filtered = this.getFilteredTasks();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px 24px; background:var(--bg-surface); border-radius:var(--border-radius-lg); border:1px solid var(--border-light); width:100%;">
          <div style="font-size:32px; margin-bottom:8px;">✨</div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary);">No deliverables found</h3>
          <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">No items match your active filter.</p>
        </div>
      `;
      return;
    }

    // Group by Objective
    const grouped = {};
    filtered.forEach(t => {
      const obj = t.objective || 'General Focus';
      if (!grouped[obj]) grouped[obj] = [];
      grouped[obj].push(t);
    });

    let html = '';
    const icons = {
      'Event & Stakeholder Engagement Support': '🎙️',
      'Research & Sector Monitoring': '🔬',
      'Content Creation & Editorial Support': '✍️',
      'Reporting & Documentation': '📊',
      'Multimedia & Digital Content Production': '🎬',
      'Social Media & Platform Support': '📱',
      'Proposal, Client & Partnership Support': '💼',
      'Capacity Building & Knowledge Transfer': '🎓'
    };

    Object.keys(grouped).forEach((objName, index) => {
      const items = grouped[objName];
      const completedCount = items.filter(i => i.completed).length;
      const icon = icons[objName] || '📌';

      html += `
        <div class="objective-accordion-card">
          <div class="objective-accordion-header" onclick="TasksManager.toggleAccordion('objGroup_${index}')">
            <div class="objective-title-text">
              <span>${icon}</span>
              <span>${objName}</span>
            </div>
            <div class="objective-progress-pill">
              ${completedCount}/${items.length} completed
            </div>
          </div>
          <div class="objective-accordion-body" id="objGroup_${index}">
            ${items.map(t => {
              const statusLabel = t.completed ? 'Completed' : (t.status === 'at_risk' ? 'Needs Attention' : 'On Track');
              const statusClass = t.completed ? 'completed' : t.status;
              return `
                <div class="task-card ${t.completed ? 'completed' : ''}" style="margin:0;">
                  <div class="task-card-top">
                    <input type="checkbox" class="task-round-checkbox" ${t.completed ? 'checked' : ''} onchange="TasksManager.toggleTaskCompletion('${t.id}', this.checked)">
                    <div class="task-card-content">
                      <div class="task-card-title">${t.title}</div>
                      <div class="task-card-desc">${t.description || ''}</div>
                    </div>
                  </div>
                  <div class="task-progress-section">
                    <div class="task-progress-header">
                      <div class="task-progress-stepper">
                        <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', -1)">-</button>
                        <span style="font-weight:700; font-size:12px;">${t.current_progress} / ${t.target_metric} ${t.unit}</span>
                        <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', 1)">+</button>
                      </div>
                      <span style="font-weight:700; font-size:11.5px;">${t.progress_percentage}%</span>
                    </div>
                    <div class="kpi-progress-bar-bg">
                      <div class="kpi-progress-bar-fill ${statusClass}" style="width:${t.progress_percentage}%;"></div>
                    </div>
                  </div>
                  <div class="task-card-footer">
                    <span style="font-size:11.5px; color:var(--text-muted);">📅 ${t.due_date || 'No date'}</span>
                    <span class="status-pill ${statusClass}">${statusLabel}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  toggleAccordion(bodyId) {
    const el = document.getElementById(bodyId);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'grid' : 'none';
  },

  // ----------------- 3. Spreadsheet Matrix Table -----------------
  renderMatrixTable() {
    const tableBody = document.getElementById('kpiMatrixTableBody');
    if (!tableBody) return;

    const filtered = this.getFilteredTasks();

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted);">
            No deliverables found matching your filter.
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(t => {
      const statusClass = t.completed ? 'completed' : t.status;
      const statusLabel = t.completed ? 'Completed' : (t.status === 'at_risk' ? 'Needs Attention' : 'On Track');

      html += `
        <tr data-task-row-id="${t.id}">
          <td style="width:30px; text-align:center;">
            <input type="checkbox" class="task-round-checkbox" ${t.completed ? 'checked' : ''} onchange="TasksManager.toggleTaskCompletion('${t.id}', this.checked)">
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="kpi-code-badge">${t.code || 'KPI'}</span>
              <span style="font-weight:700; color:var(--text-primary); font-size:13.5px;">${t.title}</span>
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${t.description || ''}</div>
          </td>
          <td>
            <strong>${t.target_metric}</strong> <span style="font-size:11px; color:var(--text-muted);">${t.unit}</span>
          </td>
          <td style="min-width:140px;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; margin-bottom:4px;">
              <div class="task-progress-stepper">
                <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', -1)">-</button>
                <strong style="margin:0 2px;">${t.current_progress}</strong>
                <button class="step-btn" onclick="TasksManager.quickStep('${t.id}', 1)">+</button>
              </div>
              <span style="font-weight:700;">${t.progress_percentage}%</span>
            </div>
            <div class="kpi-progress-bar-bg">
              <div class="kpi-progress-bar-fill ${statusClass}" style="width:${t.progress_percentage}%;"></div>
            </div>
          </td>
          <td>
            <span class="status-pill ${statusClass}">${statusLabel}</span>
          </td>
          <td style="font-size:12px; white-space:nowrap;">
            📅 ${t.due_date || 'No deadline'}
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="TasksManager.openEditModal('${t.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="TasksManager.deleteTask('${t.id}')">✕</button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  },

  // ----------------- Actions & Controls -----------------
  bindControls() {
    if (this._bound) return;
    this._bound = true;
    // Switch between Calendar and KPI Tracker View
    const navBtn = document.getElementById('navTasksKpiBtn');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        this.toggleDashboard();
      });
    }

    const backBtn = document.getElementById('btnBackToCalendar');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.openCalendar();
      });
    }

    // Workspace Segmented Navigation Switcher (in Navbar)
    document.getElementById('btnNavViewDashboard')?.addEventListener('click', () => {
      this.openDashboard();
    });
    document.getElementById('btnNavViewCalendar')?.addEventListener('click', () => {
      this.openCalendar();
    });

    // Objective Pillar Tabs
    document.querySelectorAll('.kpi-pillar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.kpi-pillar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.objectiveFilter = tab.getAttribute('data-objective');
        this.renderView();
      });
    });

    // View Switcher (Cards vs Objective vs Table)
    document.querySelectorAll('.kpi-view-segmented .kpi-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.kpi-view-segmented .kpi-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.getAttribute('data-view');
        this.renderView();
      });
    });

    // Status Filter Chips
    document.querySelectorAll('.kpi-status-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.kpi-status-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.statusFilter = chip.getAttribute('data-filter');
        this.renderView();
      });
    });

    // Search Input
    const searchInput = document.getElementById('kpiSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value.trim();
        this.renderView();
      });
    }

    // Import TEH Template Button
    const importBtn = document.getElementById('btnImportTehKpiTemplate');
    if (importBtn) {
      importBtn.addEventListener('click', async () => {
        await this.importTehTemplate();
      });
    }

    // Create Deliverable Modal Form
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
          copyFeedBtn.textContent = '✓ Copied';
          setTimeout(() => { copyFeedBtn.textContent = '📋 Copy URL'; }, 2000);
        }
      });
    }
  },

  openDashboard() {
    const kpiSection = document.getElementById('kpiDashboardSection');
    const calSection = document.querySelector('.main-content');
    const heroSection = document.querySelector('.hero-section');
    const controlBar = document.querySelector('.control-bar');
    const mailingSection = document.getElementById('mailingSection');
    const btnDash = document.getElementById('btnNavViewDashboard');
    const btnCal = document.getElementById('btnNavViewCalendar');

    if (!kpiSection) return;

    kpiSection.classList.add('active');
    if (calSection) calSection.style.display = 'none';
    if (heroSection) heroSection.style.display = 'none';
    if (controlBar) controlBar.style.display = 'none';
    if (mailingSection) mailingSection.style.display = 'none';

    if (btnDash) btnDash.classList.add('active');
    if (btnCal) btnCal.classList.remove('active');

    this.refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openCalendar() {
    const kpiSection = document.getElementById('kpiDashboardSection');
    const calSection = document.querySelector('.main-content');
    const heroSection = document.querySelector('.hero-section');
    const controlBar = document.querySelector('.control-bar');
    const mailingSection = document.getElementById('mailingSection');
    const btnDash = document.getElementById('btnNavViewDashboard');
    const btnCal = document.getElementById('btnNavViewCalendar');

    if (kpiSection) kpiSection.classList.remove('active');
    if (calSection) calSection.style.display = 'block';
    if (heroSection) heroSection.style.display = 'block';
    if (controlBar) controlBar.style.display = 'block';
    if (mailingSection) mailingSection.style.display = 'block';

    if (btnDash) btnDash.classList.remove('active');
    if (btnCal) btnCal.classList.add('active');

    if (window.CalendarRenderer) window.CalendarRenderer.refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleDashboard() {
    const kpiSection = document.getElementById('kpiDashboardSection');
    if (kpiSection && kpiSection.classList.contains('active')) {
      this.openCalendar();
    } else {
      this.openDashboard();
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
      alert(`Could not update item: ${err.message}`);
    }
  },

  async importTehTemplate() {
    if (!confirm('Reload the 19 core Communications Analyst KPIs from the TEH workplan?')) return;
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
    document.getElementById('taskEditorModalTitle').textContent = 'Create Deliverable / KPI';
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

    document.getElementById('taskEditorModalTitle').textContent = 'Edit Deliverable';
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
    if (!confirm('Are you sure you want to delete this deliverable?')) return;
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
      listEl.innerHTML = '<div class="notif-empty">No notifications right now.</div>';
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
