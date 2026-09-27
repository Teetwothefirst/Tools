/**
 * Calendar Rendering Engine
 * Supports: Month Grid View, Year-at-a-Glance View, and Agenda/List View
 */

const CalendarRenderer = {
  currentDate: new Date(),
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1, // 1 - 12
  weekStartsOn: 0, // 0 = Sunday, 1 = Monday
  currentView: 'month', // 'month' | 'year' | 'agenda'
  activeLayers: ['nigeria', 'africa', 'global', 'energy', 'user_task'],
  searchQuery: '',
  allEvents: [],

  init() {
    this.updatePeriodDisplay();
  },

  setEvents(events) {
    this.allEvents = events || [];
    this.render();
  },

  getFilteredEvents() {
    return this.allEvents.filter(ev => {
      // Layer match
      if (!this.activeLayers.includes(ev.scope)) return false;

      // Search match
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const inName = ev.name && ev.name.toLowerCase().includes(q);
        const inDesc = ev.description && ev.description.toLowerCase().includes(q);
        const inTags = ev.tags && ev.tags.some(t => t.toLowerCase().includes(q));
        if (!inName && !inDesc && !inTags) return false;
      }

      return true;
    });
  },

  updatePeriodDisplay() {
    const periodDisplay = document.getElementById('currentPeriodDisplay');
    if (!periodDisplay) return;

    if (this.currentView === 'year') {
      periodDisplay.textContent = `${this.selectedYear}`;
    } else {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      periodDisplay.textContent = `${monthNames[this.selectedMonth - 1]} ${this.selectedYear}`;
    }
  },

  render() {
    this.updatePeriodDisplay();
    const container = document.getElementById('calendarContainer');
    if (!container) return;

    const filtered = this.getFilteredEvents();

    if (this.currentView === 'month') {
      container.innerHTML = this.renderMonthGrid(filtered);
    } else if (this.currentView === 'year') {
      container.innerHTML = this.renderYearView(filtered);
    } else if (this.currentView === 'agenda') {
      container.innerHTML = this.renderAgendaView(filtered);
    }

    this.attachEventListeners();
  },

  // ----------------- Month Grid Renderer -----------------
  renderMonthGrid(events) {
    const month = this.selectedMonth;
    const year = this.selectedYear;

    // Weekday headers
    const sundayFirst = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mondayFirst = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdays = this.weekStartsOn === 1 ? mondayFirst : sundayFirst;

    let headerHtml = `<div class="calendar-month-container">
      <div class="calendar-weekdays-header">`;
    weekdays.forEach((day, index) => {
      const isWeekend = (this.weekStartsOn === 0 && (index === 0 || index === 6)) ||
                        (this.weekStartsOn === 1 && (index === 5 || index === 6));
      headerHtml += `<div class="weekday-header-cell ${isWeekend ? 'weekend' : ''}">${day}</div>`;
    });
    headerHtml += `</div><div class="calendar-days-grid">`;

    // Map events by dateStr
    const eventMap = {};
    events.forEach(ev => {
      if (!eventMap[ev.dateStr]) eventMap[ev.dateStr] = [];
      eventMap[ev.dateStr].push(ev);
    });

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    if (this.weekStartsOn === 1) {
      startDayOfWeek = (startDayOfWeek + 6) % 7; // Monday = 0
    }

    // Previous month padding
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDayNum = prevMonthLastDay - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${prevYear}-${pad(prevMonth)}-${pad(prevDayNum)}`;
      headerHtml += this.renderDayCell(prevDayNum, dateStr, eventMap[dateStr] || [], true);
    }

    // Current month days
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= daysInMonth; day++) {
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${year}-${pad(month)}-${pad(day)}`;
      const isToday = dateStr === todayStr;
      headerHtml += this.renderDayCell(day, dateStr, eventMap[dateStr] || [], false, isToday);
    }

    // Trailing days for complete 7-col grid
    const totalRendered = startDayOfWeek + daysInMonth;
    const trailingDays = (7 - (totalRendered % 7)) % 7;
    for (let day = 1; day <= trailingDays; day++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${nextYear}-${pad(nextMonth)}-${pad(day)}`;
      headerHtml += this.renderDayCell(day, dateStr, eventMap[dateStr] || [], true);
    }

    headerHtml += `</div></div>`;
    return headerHtml;
  },

  renderDayCell(dayNum, dateStr, dayEvents, isOtherMonth, isToday = false) {
    const hasEvents = dayEvents.length > 0;
    const scopeDots = [];
    const scopesAdded = new Set();

    dayEvents.forEach(e => {
      if (!scopesAdded.has(e.scope)) {
        scopesAdded.add(e.scope);
        scopeDots.push(`<span class="mini-layer-dot ${e.scope}" title="${e.scope}"></span>`);
      }
    });

    let pillsHtml = '';
    const visibleEvents = dayEvents.slice(0, 3);
    visibleEvents.forEach(ev => {
      let icon = '🌐';
      let extraClass = '';
      if (ev.scope === 'nigeria') icon = '🇳🇬';
      else if (ev.scope === 'africa') icon = '🌍';
      else if (ev.scope === 'energy') icon = '⚡';
      else if (ev.scope === 'user_task') {
        icon = '📌';
        extraClass = `${ev.status || ''} ${ev.completed ? 'completed' : ''}`;
      }

      const titleAttr = ev.scope === 'user_task'
        ? `${ev.name} (${ev.current_progress}/${ev.target_metric} ${ev.unit}) - ${ev.status}`
        : ev.name;

      pillsHtml += `
        <div class="day-event-pill ${ev.scope} ${extraClass}" data-event-id="${ev.id}" title="${titleAttr}">
          <span class="event-pill-icon">${icon}</span>
          <span class="event-pill-title">${ev.name}</span>
        </div>
      `;
    });

    if (dayEvents.length > 3) {
      pillsHtml += `<div class="more-events-indicator">+${dayEvents.length - 3} more</div>`;
    }

    return `
      <div class="calendar-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}"
           data-date="${dateStr}">
        <div class="day-header-row">
          <span class="day-number">${dayNum}</span>
          <div class="day-badges-summary">${scopeDots.join('')}</div>
        </div>
        <div class="day-events-list">
          ${pillsHtml}
        </div>
      </div>
    `;
  },

  // ----------------- Year-at-a-Glance Renderer -----------------
  renderYearView(events) {
    const year = this.selectedYear;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const eventMap = {};
    events.forEach(ev => {
      if (!eventMap[ev.dateStr]) eventMap[ev.dateStr] = [];
      eventMap[ev.dateStr].push(ev);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let html = `<div class="year-view-container">`;

    for (let m = 1; m <= 12; m++) {
      const monthEvents = events.filter(e => e.month === m);
      const firstDay = new Date(year, m - 1, 1);
      const lastDay = new Date(year, m, 0);
      const daysCount = lastDay.getDate();

      let startDayOfWeek = firstDay.getDay();
      if (this.weekStartsOn === 1) {
        startDayOfWeek = (startDayOfWeek + 6) % 7;
      }

      html += `
        <div class="year-month-card" data-jump-month="${m}">
          <div class="year-month-header">
            <span class="year-month-title">${monthNames[m - 1]}</span>
            <span class="year-month-count-badge">${monthEvents.length} observances</span>
          </div>
          <div class="year-mini-grid">
            <div class="year-mini-weekday">S</div>
            <div class="year-mini-weekday">M</div>
            <div class="year-mini-weekday">T</div>
            <div class="year-mini-weekday">W</div>
            <div class="year-mini-weekday">T</div>
            <div class="year-mini-weekday">F</div>
            <div class="year-mini-weekday">S</div>
      `;

      // Blank offset days
      for (let i = 0; i < startDayOfWeek; i++) {
        html += `<div class="year-mini-day empty"></div>`;
      }

      // Month days
      for (let d = 1; d <= daysCount; d++) {
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${year}-${pad(m)}-${pad(d)}`;
        const dayEvs = eventMap[dateStr] || [];
        const hasEv = dayEvs.length > 0;
        const isToday = dateStr === todayStr;

        let extraClass = '';
        if (hasEv) {
          if (dayEvs.some(e => e.scope === 'energy')) extraClass = 'energy-day';
          else if (dayEvs.some(e => e.scope === 'africa')) extraClass = 'africa-day';
        }

        html += `
          <div class="year-mini-day ${hasEv ? 'has-events' : ''} ${isToday ? 'is-today' : ''} ${extraClass}"
               data-date="${dateStr}" title="${dayEvs.map(e => e.name).join(', ')}">
            ${d}
          </div>
        `;
      }

      html += `</div></div>`;
    }

    html += `</div>`;
    return html;
  },

  // ----------------- Agenda / List View Renderer -----------------
  renderAgendaView(events) {
    if (events.length === 0) {
      return `
        <div class="calendar-empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">No observances found</div>
          <div class="empty-state-text">Try adjusting your layer filters or search terms.</div>
        </div>
      `;
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Group events by month
    const grouped = {};
    events.forEach(ev => {
      if (!grouped[ev.month]) grouped[ev.month] = [];
      grouped[ev.month].push(ev);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let html = `<div class="agenda-view-container">`;

    Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).forEach(mKey => {
      const monthNum = Number(mKey);
      const mEvents = grouped[mKey];

      html += `
        <div class="agenda-month-group">
          <div class="agenda-month-header">
            <span>${monthNames[monthNum - 1]} ${this.selectedYear}</span>
            <span class="agenda-month-badge">${mEvents.length} Events</span>
          </div>
          <div class="agenda-cards-list">
      `;

      mEvents.forEach(ev => {
        const [y, m, d] = ev.dateStr.split('-').map(Number);
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        const weekdayName = dateObj.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });

        // Calculate countdown
        const diffMs = Date.UTC(y, m - 1, d) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.round(diffMs / 86400000);

        let countdownTag = '';
        if (diffDays === 0) {
          countdownTag = `<span class="agenda-countdown-tag" style="background:#DCFCE7; color:#14532D; font-weight:800;">TODAY 🎉</span>`;
        } else if (diffDays === 1) {
          countdownTag = `<span class="agenda-countdown-tag" style="background:#FEF9C3; color:#854D0E;">TOMORROW</span>`;
        } else if (diffDays > 1 && diffDays <= 30) {
          countdownTag = `<span class="agenda-countdown-tag">In ${diffDays} days</span>`;
        } else if (diffDays > 30) {
          countdownTag = `<span class="agenda-countdown-tag" style="background:#F3F4F6; color:#6B7280;">Upcoming</span>`;
        }

        let scopeLabel = ev.scope.toUpperCase();
        if (ev.scope === 'nigeria') scopeLabel = '🇳🇬 Nigeria';
        else if (ev.scope === 'africa') scopeLabel = '🌍 Africa';
        else if (ev.scope === 'energy') scopeLabel = '⚡ Clean Energy';
        else if (ev.scope === 'global') scopeLabel = '🌐 Global';
        else if (ev.scope === 'user_task') scopeLabel = `📌 My Task / KPI [${(ev.status || '').toUpperCase()}]`;

        const officialTag = ev.isUserTask
          ? `<span class="agenda-official-badge" style="background:#F3E8FF; color:#6B21A8; font-weight:800;">${ev.priority ? ev.priority.toUpperCase() : 'TASK'} · ${ev.current_progress || 0}/${ev.target_metric || 1} ${ev.unit || ''}</span>`
          : (ev.official
            ? `<span class="agenda-official-badge official">Official Observance</span>`
            : `<span class="agenda-official-badge">Industry Recognized</span>`);

        html += `
          <div class="agenda-event-card ${ev.scope}" data-event-id="${ev.id}">
            <div class="agenda-date-col">
              <div class="agenda-day-num">${d}</div>
              <div class="agenda-weekday">${weekdayName}</div>
              ${countdownTag}
            </div>
            <div class="agenda-details-col">
              <div class="agenda-tags-row">
                <span class="agenda-scope-pill ${ev.scope}">${scopeLabel}</span>
                ${officialTag}
              </div>
              <div class="agenda-event-name">${ev.name}</div>
              <div class="agenda-event-desc">${ev.description}</div>
            </div>
            <div class="agenda-actions-col">
              ${ev.isUserTask ? `
                <button class="agenda-action-btn edit-task-btn" data-task-id="${ev.id}">
                  ✏️ Edit Task
                </button>
              ` : `
                <button class="agenda-action-btn notify-quick-btn" data-event-id="${ev.id}">
                  🔔 Notify Me
                </button>
                <button class="agenda-action-btn export-ics-btn" data-event-id="${ev.id}">
                  📅 Add to Cal
                </button>
              `}
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += `</div>`;
    return html;
  },

  // ----------------- Event Handlers -----------------
  attachEventListeners() {
    // Click on event pills or agenda cards to view details
    document.querySelectorAll('[data-event-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent opening event detail if clicked on action button
        if (e.target.closest('.notify-quick-btn') || e.target.closest('.export-ics-btn') || e.target.closest('.edit-task-btn')) return;
        const eventId = el.getAttribute('data-event-id');
        if (eventId.startsWith('tsk-')) {
          if (window.TasksManager) {
            window.TasksManager.openEditModal(eventId);
          }
        } else if (window.Modals && window.Modals.openEventDetail) {
          window.Modals.openEventDetail(eventId, this.selectedYear);
        }
      });
    });

    // Edit task button
    document.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = btn.getAttribute('data-task-id');
        if (window.TasksManager) {
          window.TasksManager.openEditModal(taskId);
        }
      });
    });

    // Quick notify button
    document.querySelectorAll('.notify-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute('data-event-id');
        const ev = this.allEvents.find(x => x.id === eventId);
        if (window.Modals && window.Modals.openSignupModal) {
          window.Modals.openSignupModal(ev);
        }
      });
    });

    // Quick ICS export button
    document.querySelectorAll('.export-ics-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = btn.getAttribute('data-event-id');
        const ev = this.allEvents.find(x => x.id === eventId);
        if (ev) CalendarRenderer.downloadIcs(ev);
      });
    });

    // Click on day cell opens day detail
    document.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (e.target.closest('.day-event-pill') || e.target.closest('.more-events-indicator')) return;
        const dateStr = cell.getAttribute('data-date');
        const dayEvents = this.getFilteredEvents().filter(x => x.dateStr === dateStr);
        if (dayEvents.length === 1) {
          window.Modals.openEventDetail(dayEvents[0].id, this.selectedYear);
        } else if (dayEvents.length > 1) {
          window.Modals.openDayListModal(dateStr, dayEvents, this.selectedYear);
        }
      });
    });

    // Click month card in year view jumps to that month
    document.querySelectorAll('[data-jump-month]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.year-mini-day.has-events')) return;
        const monthNum = parseInt(card.getAttribute('data-jump-month'), 10);
        this.selectedMonth = monthNum;
        this.setView('month');
      });
    });

    // Click on year mini day with events
    document.querySelectorAll('.year-mini-day.has-events').forEach(dayEl => {
      dayEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const dateStr = dayEl.getAttribute('data-date');
        const dayEvents = this.getFilteredEvents().filter(x => x.dateStr === dateStr);
        if (dayEvents.length === 1) {
          window.Modals.openEventDetail(dayEvents[0].id, this.selectedYear);
        } else if (dayEvents.length > 1) {
          window.Modals.openDayListModal(dateStr, dayEvents, this.selectedYear);
        }
      });
    });
  },

  // ----------------- View & Navigation Controls -----------------
  prevPeriod() {
    if (this.currentView === 'year') {
      this.selectedYear--;
    } else {
      if (this.selectedMonth === 1) {
        this.selectedMonth = 12;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
    }
    this.refresh();
  },

  nextPeriod() {
    if (this.currentView === 'year') {
      this.selectedYear++;
    } else {
      if (this.selectedMonth === 12) {
        this.selectedMonth = 1;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
    }
    this.refresh();
  },

  jumpToToday() {
    const now = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth() + 1;
    this.refresh();
  },

  setView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });
    this.render();
  },

  toggleWeekStart() {
    this.weekStartsOn = this.weekStartsOn === 0 ? 1 : 0;
    const btn = document.getElementById('weekStartToggleBtn');
    if (btn) {
      btn.textContent = this.weekStartsOn === 1 ? 'Monday' : 'Sunday';
    }
    this.render();
  },

  toggleLayer(layerName) {
    const idx = this.activeLayers.indexOf(layerName);
    if (idx !== -1) {
      if (this.activeLayers.length > 1) {
        this.activeLayers.splice(idx, 1);
      }
    } else {
      this.activeLayers.push(layerName);
    }

    document.querySelectorAll('.layer-chip').forEach(chip => {
      const layer = chip.getAttribute('data-layer');
      chip.classList.toggle('active', this.activeLayers.includes(layer));
    });

    this.render();
  },

  setSearch(query) {
    this.searchQuery = query.trim();
    this.render();
  },

  async refresh() {
    try {
      const res = await window.API.getEvents({ year: this.selectedYear });
      this.allEvents = res.events || [];
      this.render();
    } catch (err) {
      console.error('Error refreshing calendar data:', err);
    }
  },

  // ----------------- Calendar Export Helpers (.ics / Google Calendar) -----------------
  downloadIcs(event) {
    const pad = n => String(n).padStart(2, '0');
    const [y, m, d] = event.dateStr.split('-');
    const dateFormatted = `${y}${pad(m)}${pad(d)}`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nigeria & African Celebration Calendar//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}-${event.dateStr}@nigeriacalendar.org`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${dateFormatted}`,
      `SUMMARY:${event.name} (${event.scope.toUpperCase()})`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\\n\\nSource: ${event.source_note}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${event.id}-${event.dateStr}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getGoogleCalendarUrl(event) {
    const [y, m, d] = event.dateStr.split('-');
    const pad = n => String(n).padStart(2, '0');
    const start = `${y}${pad(m)}${pad(d)}`;
    const end = `${y}${pad(m)}${pad(d)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${event.name} (${event.scope.toUpperCase()})`,
      dates: `${start}/${end}`,
      details: `${event.description}\n\nSource: ${event.source_note}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
};

window.CalendarRenderer = CalendarRenderer;
