/**
 * Modals Controller: Event Details, Subscription Signup, Preferences, About, and Privacy
 */

const Modals = {
  activeModalId: null,

  init() {
    // Backdrop click closes modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeAll();
        }
      });
    });

    // Close buttons
    document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeAll());
    });

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });

    // Bind form submits
    this.bindSignupForms();
    this.bindManageAlertsForm();
  },

  open(modalId) {
    this.closeAll();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModalId = modalId;
      document.body.style.overflow = 'hidden';
    }
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    this.activeModalId = null;
    document.body.style.overflow = '';
  },

  // ----------------- Event Detail Modal -----------------
  async openEventDetail(eventId, year) {
    try {
      const data = await window.API.getEvent(eventId, year);
      const ev = data.resolved || data.event;

      let scopeLabel = '🌐 Global';
      if (ev.scope === 'nigeria') scopeLabel = '🇳🇬 Nigeria';
      else if (ev.scope === 'africa') scopeLabel = '🌍 Africa';
      else if (ev.scope === 'energy') scopeLabel = '⚡ Clean Energy';

      const officialText = ev.official
        ? 'Official Statutory Public Holiday / Gazette Observance'
        : 'Industry-Recognized Observance (Non-official UN status)';

      const officialBadgeClass = ev.official ? 'official' : '';

      // Date formatted
      const [y, m, d] = ev.dateStr.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const friendlyDate = dateObj.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const bodyHtml = `
        <div class="event-detail-tags">
          <span class="agenda-scope-pill ${ev.scope}">${scopeLabel}</span>
          <span class="agenda-official-badge ${officialBadgeClass}">${officialText}</span>
          ${ev.recurrence ? `<span class="agenda-official-badge" style="text-transform:capitalize;">${ev.recurrence} Recurrence</span>` : ''}
        </div>

        <div class="detail-date-banner">
          <span>📅</span>
          <span>${friendlyDate}</span>
          ${ev.resolutionNote ? `<span style="font-size:12px; font-weight:normal; opacity:0.85;">(${ev.resolutionNote})</span>` : ''}
        </div>

        <div class="detail-description-block">
          ${ev.description}
        </div>

        <div class="detail-meta-box">
          <div class="detail-meta-row">
            <span class="detail-meta-label">Category:</span>
            <span class="detail-meta-val" style="text-transform:capitalize;">${(ev.category || '').replace(/_/g, ' ')}</span>
          </div>
          <div class="detail-meta-row">
            <span class="detail-meta-label">Source Citation:</span>
            <span class="detail-meta-val">${ev.source_note || 'Official National / International Gazette'}</span>
          </div>
          ${ev.tags && ev.tags.length ? `
          <div class="detail-meta-row">
            <span class="detail-meta-label">Tags:</span>
            <span class="detail-meta-val">${ev.tags.map(t => `#${t}`).join(' ')}</span>
          </div>` : ''}
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:20px;">
          <button class="btn btn-primary" id="modalNotifyBtn" style="flex:1;">
            🔔 Get Advance Alert for this Event
          </button>
          <button class="btn btn-secondary" id="modalExportIcsBtn">
            📅 Download .ICS
          </button>
          <a class="btn btn-secondary" href="${window.CalendarRenderer.getGoogleCalendarUrl(ev)}" target="_blank" rel="noopener">
            🗓️ Google Calendar
          </a>
        </div>
      `;

      document.getElementById('eventDetailTitle').textContent = ev.name;
      document.getElementById('eventDetailBody').innerHTML = bodyHtml;

      document.getElementById('modalNotifyBtn').onclick = () => {
        this.openSignupModal(ev);
      };

      document.getElementById('modalExportIcsBtn').onclick = () => {
        window.CalendarRenderer.downloadIcs(ev);
      };

      this.open('eventDetailModal');
    } catch (err) {
      console.error('Error opening event detail modal:', err);
      alert('Could not load event details.');
    }
  },

  // ----------------- Day Events List Modal (for multi-event days) -----------------
  openDayListModal(dateStr, dayEvents, year) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    const friendlyDate = dateObj.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let listHtml = `<div class="agenda-cards-list">`;
    dayEvents.forEach(ev => {
      let scopeLabel = ev.scope.toUpperCase();
      if (ev.scope === 'nigeria') scopeLabel = '🇳🇬 Nigeria';
      else if (ev.scope === 'africa') scopeLabel = '🌍 Africa';
      else if (ev.scope === 'energy') scopeLabel = '⚡ Clean Energy';
      else if (ev.scope === 'global') scopeLabel = '🌐 Global';

      listHtml += `
        <div class="agenda-event-card ${ev.scope}" data-event-id="${ev.id}" style="cursor:pointer;">
          <div class="agenda-details-col">
            <div class="agenda-tags-row">
              <span class="agenda-scope-pill ${ev.scope}">${scopeLabel}</span>
              ${ev.official ? '<span class="agenda-official-badge official">Official</span>' : '<span class="agenda-official-badge">Industry</span>'}
            </div>
            <div class="agenda-event-name">${ev.name}</div>
            <div class="agenda-event-desc">${ev.description}</div>
          </div>
          <div class="agenda-actions-col">
            <button class="btn btn-secondary btn-sm" onclick="Modals.openEventDetail('${ev.id}', ${year})">View Details</button>
          </div>
        </div>
      `;
    });
    listHtml += `</div>`;

    document.getElementById('eventDetailTitle').textContent = `Observances on ${friendlyDate}`;
    document.getElementById('eventDetailBody').innerHTML = listHtml;
    this.open('eventDetailModal');
  },

  // ----------------- Signup Modal -----------------
  openSignupModal(presetEvent = null) {
    const form = document.getElementById('modalSignupForm');
    if (form) {
      form.reset();
      // If presetEvent is provided, ensure its scope is checked
      if (presetEvent && presetEvent.scope) {
        const checkbox = form.querySelector(`input[name="interests"][value="${presetEvent.scope}"]`);
        if (checkbox) checkbox.checked = true;
      }
    }
    const statusMsg = document.getElementById('modalSignupStatus');
    if (statusMsg) statusMsg.innerHTML = '';
    this.open('signupModal');
  },

  bindSignupForms() {
    const handleSignup = async (form, statusEl, closeOnSuccess = false) => {
      const email = form.querySelector('[name="email"]').value.trim();
      const emailType = form.querySelector('[name="email_type"]:checked')?.value || 'work';
      const name = form.querySelector('[name="name"]')?.value.trim() || '';
      const consentGiven = form.querySelector('[name="consent_given"]').checked;

      const interests = Array.from(form.querySelectorAll('[name="interests"]:checked')).map(c => c.value);
      const leadTimes = Array.from(form.querySelectorAll('[name="lead_times_days"]:checked')).map(c => Number(c.value));

      if (!email) {
        statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">Please provide an email address.</span>`;
        return;
      }

      if (!consentGiven) {
        statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">You must agree to receive observance alerts.</span>`;
        return;
      }

      statusEl.innerHTML = `<span style="color:var(--text-secondary);">Subscribing you to alerts...</span>`;

      try {
        const res = await window.API.subscribe({
          email,
          email_type: emailType,
          name,
          interests,
          lead_times_days: leadTimes,
          consent_given: consentGiven
        });

        // Trigger celebratory confetti flourish
        if (window.triggerCelebrationConfetti) {
          window.triggerCelebrationConfetti();
        }

        statusEl.innerHTML = `
          <div style="padding:12px; border-radius:8px; background-color:#DCFCE7; color:#14532D; font-weight:700; margin-top:10px;">
            🎉 ${res.message} Check your inbox (${email}) for upcoming observance advance alerts!
          </div>
        `;
        form.reset();

        if (closeOnSuccess) {
          setTimeout(() => {
            this.closeAll();
          }, 2400);
        }
      } catch (err) {
        statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">${err.message || 'Subscription failed. Please check your email and try again.'}</span>`;
      }
    };

    // Hero / In-page Form
    const heroForm = document.getElementById('heroSignupForm');
    if (heroForm) {
      heroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup(heroForm, document.getElementById('heroSignupStatus'), false);
      });
    }

    // Modal Form
    const modalForm = document.getElementById('modalSignupForm');
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup(modalForm, document.getElementById('modalSignupStatus'), true);
      });
    }
  },

  // ----------------- Manage Alerts & Unsubscribe -----------------
  async openManageAlertsModal(token = null, email = null) {
    const inputToken = token || new URLSearchParams(window.location.search).get('token');
    const inputEmail = email || new URLSearchParams(window.location.search).get('email');

    this.open('manageAlertsModal');

    if (inputToken || inputEmail) {
      document.getElementById('lookupIdentifier').value = inputToken || inputEmail;
      this.lookupSubscriberPreferences(inputToken, inputEmail);
    }
  },

  async lookupSubscriberPreferences(token, email) {
    const statusEl = document.getElementById('manageAlertsStatus');
    const panelEl = document.getElementById('managePreferencesPanel');
    statusEl.innerHTML = 'Loading your subscription preferences...';

    try {
      const res = await window.API.getSubscriberPreferences(token, email);
      const sub = res.subscriber;
      statusEl.innerHTML = '';
      panelEl.style.display = 'block';

      document.getElementById('manageSubscriberId').value = sub.id;
      document.getElementById('manageEmailDisplay').textContent = `${sub.email} (${sub.name || 'Subscriber'})`;

      // Set context radio
      const radio = document.querySelector(`input[name="manage_email_type"][value="${sub.email_type}"]`);
      if (radio) radio.checked = true;

      // Set interest checkboxes
      document.querySelectorAll('input[name="manage_interests"]').forEach(cb => {
        cb.checked = sub.interests && sub.interests.includes(cb.value);
      });

      // Set lead time checkboxes
      document.querySelectorAll('input[name="manage_lead_times"]').forEach(cb => {
        cb.checked = sub.lead_times_days && sub.lead_times_days.includes(Number(cb.value));
      });

      // Status indicator
      const isUnsub = sub.status === 'unsubscribed';
      document.getElementById('manageStatusBadge').innerHTML = isUnsub
        ? `<span style="color:var(--color-coral); font-weight:700;">Status: Unsubscribed</span>`
        : `<span style="color:var(--color-ng-green); font-weight:700;">Status: Active</span>`;

    } catch (err) {
      statusEl.innerHTML = `<span style="color:var(--color-coral);">Could not find a subscription with that email or token.</span>`;
      panelEl.style.display = 'none';
    }
  },

  bindManageAlertsForm() {
    const lookupBtn = document.getElementById('btnLookupSubscriber');
    if (lookupBtn) {
      lookupBtn.addEventListener('click', () => {
        const val = document.getElementById('lookupIdentifier').value.trim();
        if (!val) return;
        if (val.includes('@')) {
          this.lookupSubscriberPreferences(null, val);
        } else {
          this.lookupSubscriberPreferences(val, null);
        }
      });
    }

    const saveBtn = document.getElementById('btnSavePreferences');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const id = document.getElementById('manageSubscriberId').value;
        const emailType = document.querySelector('input[name="manage_email_type"]:checked')?.value || 'work';
        const interests = Array.from(document.querySelectorAll('input[name="manage_interests"]:checked')).map(c => c.value);
        const leadTimes = Array.from(document.querySelectorAll('input[name="manage_lead_times"]:checked')).map(c => Number(c.value));

        const statusEl = document.getElementById('manageSaveStatus');
        statusEl.innerHTML = 'Updating preferences...';

        try {
          await window.API.updateSubscriber(id, {
            email_type: emailType,
            interests,
            lead_times_days: leadTimes,
            status: 'active'
          });
          statusEl.innerHTML = `<span style="color:var(--color-ng-green); font-weight:700;">Preferences updated successfully!</span>`;
          document.getElementById('manageStatusBadge').innerHTML = `<span style="color:var(--color-ng-green); font-weight:700;">Status: Active</span>`;
        } catch (err) {
          statusEl.innerHTML = `<span style="color:var(--color-coral);">Failed to update preferences: ${err.message}</span>`;
        }
      });
    }

    const unsubBtn = document.getElementById('btnUnsubscribeConfirm');
    if (unsubBtn) {
      unsubBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to unsubscribe from all celebration and energy advance alerts?')) return;
        const id = document.getElementById('manageSubscriberId').value;
        const statusEl = document.getElementById('manageSaveStatus');

        try {
          await window.API.unsubscribe(id);
          statusEl.innerHTML = `<span style="color:var(--color-coral); font-weight:700;">You have unsubscribed from alerts.</span>`;
          document.getElementById('manageStatusBadge').innerHTML = `<span style="color:var(--color-coral); font-weight:700;">Status: Unsubscribed</span>`;
        } catch (err) {
          statusEl.innerHTML = `<span style="color:var(--color-coral);">Failed to unsubscribe: ${err.message}</span>`;
        }
      });
    }
  },

  openAboutModal() {
    // About and Sources removed per specification
  },

  openPrivacyModal() {
    this.open('privacyModal');
  }
};

window.Modals = Modals;
