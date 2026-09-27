/**
 * Main Express Application Server
 * Serves Calendar UI and REST API for Events, Subscribers, Alert Scheduling, and Outbox.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const storage = require('./services/storageService');
const dateService = require('./services/dateService');
const scheduler = require('./services/scheduler');
const { runAlertCycle } = require('./services/alertEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Known disposable email domains to flag/reject
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwawaymail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'mailinator.com', 'yopmail.com', 'trashmail.com'
]);

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return false;
  return true;
}

// -------------------------------------------------------------
// EVENTS ENDPOINTS
// -------------------------------------------------------------

// GET /api/events - List resolved events for a year with filters
app.get('/api/events', (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const year = parseInt(req.query.year, 10) || currentYear;
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const scope = req.query.scope; // "nigeria", "africa", "global", "energy"
    const category = req.query.category;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : null;

    const rawEvents = storage.getEvents();
    let resolved = dateService.resolveEventsForYear(rawEvents, year);

    // Apply filters
    if (month) {
      resolved = resolved.filter(e => e.month === month);
    }

    if (scope && scope !== 'all') {
      const scopes = scope.split(',').map(s => s.trim().toLowerCase());
      resolved = resolved.filter(e => scopes.includes(e.scope.toLowerCase()));
    }

    if (category && category !== 'all') {
      resolved = resolved.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      resolved = resolved.filter(e =>
        e.name.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search)) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(search))) ||
        (e.source_note && e.source_note.toLowerCase().includes(search))
      );
    }

    // Sort chronologically by date
    resolved.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    res.json({
      year,
      count: resolved.length,
      events: resolved
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event details
app.get('/api/events/:id', (req, res) => {
  const event = storage.getEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();
  const resolvedList = dateService.resolveEventsForYear([event], year);
  res.json({
    event,
    resolved: resolvedList[0] || null
  });
});

// POST /api/events - Add event (Admin)
app.post('/api/events', (req, res) => {
  try {
    const { name, scope, category, recurrence, month, day, description, source_note, official, tags } = req.body;
    if (!name || !scope) {
      return res.status(400).json({ error: 'Name and Scope are required' });
    }

    const created = storage.addEvent({
      name,
      scope,
      category,
      recurrence,
      month,
      day,
      description,
      source_note,
      official,
      tags
    });

    res.status(201).json({
      message: 'Event added successfully',
      event: created
    });
  } catch (err) {
    console.error('Error adding event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event (Admin)
app.put('/api/events/:id', (req, res) => {
  try {
    const updated = storage.updateEvent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({
      message: 'Event updated successfully',
      event: updated
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event (Admin)
app.delete('/api/events/:id', (req, res) => {
  try {
    const ok = storage.deleteEvent(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// -------------------------------------------------------------
// SUBSCRIBERS ENDPOINTS
// -------------------------------------------------------------

// POST /api/subscribers - Signup for alerts
app.post('/api/subscribers', (req, res) => {
  try {
    const { email, email_type, name, interests, lead_times_days, consent_given } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address. Disposable domains are disallowed.'
      });
    }

    if (!consent_given) {
      return res.status(400).json({
        error: 'You must agree to receive email alerts to join the mailing list.'
      });
    }

    // Validate email_type: work | business | personal
    const validTypes = ['work', 'business', 'personal'];
    const chosenType = validTypes.includes(email_type) ? email_type : 'work';

    // Validate interests: array of "nigeria", "africa", "global", "energy"
    const allowedInterests = ['nigeria', 'africa', 'global', 'energy'];
    let chosenInterests = Array.isArray(interests) && interests.length > 0
      ? interests.filter(i => allowedInterests.includes(i))
      : allowedInterests;
    if (chosenInterests.length === 0) chosenInterests = allowedInterests;

    // Validate lead times
    let chosenLeadTimes = Array.isArray(lead_times_days) && lead_times_days.length > 0
      ? lead_times_days.map(Number).filter(n => !isNaN(n) && n >= 0)
      : [7, 1];
    if (chosenLeadTimes.length === 0) chosenLeadTimes = [7, 1];

    const result = storage.addSubscriber({
      email,
      email_type: chosenType,
      name: name || '',
      interests: chosenInterests,
      lead_times_days: chosenLeadTimes,
      consent_given: true
    });

    res.status(result.isNew ? 201 : 200).json({
      message: result.isNew ? 'Successfully subscribed to advance alerts!' : 'Subscription preferences updated!',
      subscriber: result.subscriber,
      isNew: result.isNew
    });
  } catch (err) {
    console.error('Error adding subscriber:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// GET /api/subscribers/manage - Retrieve subscriber by token or email
app.get('/api/subscribers/manage', (req, res) => {
  const { token, email } = req.query;
  let sub = null;
  if (token) sub = storage.getSubscriberByToken(token);
  if (!sub && email) sub = storage.getSubscriberByEmail(email);

  if (!sub) {
    return res.status(404).json({ error: 'Subscriber not found' });
  }

  res.json({ subscriber: sub });
});

// PUT /api/subscribers/:id - Update preferences
app.put('/api/subscribers/:id', (req, res) => {
  try {
    const { interests, lead_times_days, email_type, name, status } = req.body;
    const updates = {};
    if (interests && Array.isArray(interests)) updates.interests = interests;
    if (lead_times_days && Array.isArray(lead_times_days)) updates.lead_times_days = lead_times_days.map(Number);
    if (email_type) updates.email_type = email_type;
    if (name !== undefined) updates.name = name;
    if (status) updates.status = status;

    const updated = storage.updateSubscriber(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    res.json({ message: 'Preferences updated successfully', subscriber: updated });
  } catch (err) {
    console.error('Error updating subscriber:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// POST /api/subscribers/unsubscribe - 1-Click unsubscribe
app.post('/api/subscribers/unsubscribe', (req, res) => {
  const { token, email, id } = req.body;
  const target = token || email || id;
  if (!target) {
    return res.status(400).json({ error: 'Token or email is required to unsubscribe' });
  }

  const sub = storage.unsubscribe(target);
  if (!sub) {
    return res.status(404).json({ error: 'Subscriber not found or already unsubscribed' });
  }

  res.json({
    message: 'You have been successfully unsubscribed from observance alerts.',
    email: sub.email
  });
});

// GET /api/subscribers - Admin listing with segmentation analytics
app.get('/api/subscribers', (req, res) => {
  const subs = storage.getSubscribers();
  const activeSubs = subs.filter(s => s.status === 'active');

  const segmentation = {
    work: activeSubs.filter(s => s.email_type === 'work').length,
    business: activeSubs.filter(s => s.email_type === 'business').length,
    personal: activeSubs.filter(s => s.email_type === 'personal').length
  };

  const layerBreakdown = {
    nigeria: activeSubs.filter(s => s.interests && s.interests.includes('nigeria')).length,
    africa: activeSubs.filter(s => s.interests && s.interests.includes('africa')).length,
    global: activeSubs.filter(s => s.interests && s.interests.includes('global')).length,
    energy: activeSubs.filter(s => s.interests && s.interests.includes('energy')).length
  };

  res.json({
    total: subs.length,
    active: activeSubs.length,
    unsubscribed: subs.length - activeSubs.length,
    segmentation,
    layerBreakdown,
    subscribers: subs
  });
});

// -------------------------------------------------------------
// ALERT ENGINE & DISPATCH RUNNER
// -------------------------------------------------------------

// POST /api/alerts/run - Run alert engine manually or with simulated date
app.post('/api/alerts/run', async (req, res) => {
  try {
    const { simulated_date } = req.body;
    const appBaseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await scheduler.triggerManualRun(simulated_date || null, appBaseUrl);
    res.json({
      message: 'Alert cycle completed successfully',
      result
    });
  } catch (err) {
    console.error('Error executing alert cycle:', err);
    res.status(500).json({ error: 'Alert cycle failed', details: err.message });
  }
});

// GET /api/alerts/logs - View sent notification history (deduplication logs)
app.get('/api/alerts/logs', (req, res) => {
  const logs = storage.getNotifications();
  res.json({ count: logs.length, logs: logs.slice().reverse() });
});

// GET /api/outbox - View in-app generated HTML emails
app.get('/api/outbox', (req, res) => {
  const outbox = storage.getOutbox();
  res.json({ count: outbox.length, outbox });
});

// DELETE /api/outbox - Clear outbox
app.delete('/api/outbox', (req, res) => {
  storage.clearOutbox();
  res.json({ message: 'Outbox cleared' });
});

// -------------------------------------------------------------
// LUNAR / MOON SIGHTING OVERRIDES (ADMIN)
// -------------------------------------------------------------

// GET /api/lunar - View lunar holiday configuration
app.get('/api/lunar', (req, res) => {
  const data = dateService.getLunarOverrides();
  res.json(data);
});

// POST /api/lunar/override - Update moon sighting for a year and holiday
app.post('/api/lunar/override', (req, res) => {
  try {
    const { year, event_id, month, day, source } = req.body;
    if (!year || !event_id || !month || !day) {
      return res.status(400).json({ error: 'Year, event_id, month, and day are required' });
    }

    const current = dateService.getLunarOverrides();
    if (!current.years) current.years = {};
    if (!current.years[String(year)]) current.years[String(year)] = {};

    current.years[String(year)][event_id] = {
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      source: source || 'Admin / NSCIA Moon-Sighting Update'
    };

    dateService.saveLunarOverrides(current);
    res.json({ message: 'Lunar date override saved successfully', data: current.years[String(year)][event_id] });
  } catch (err) {
    console.error('Error saving lunar override:', err);
    res.status(500).json({ error: 'Failed to update lunar override' });
  }
});

// -------------------------------------------------------------
// SYSTEM & HEALTH STATUS
// -------------------------------------------------------------
app.get('/api/system/status', (req, res) => {
  const schedulerStatus = scheduler.getSchedulerStatus();
  const events = storage.getEvents();
  const subscribers = storage.getSubscribers();
  const notifications = storage.getNotifications();
  const outbox = storage.getOutbox();

  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    currentYear: new Date().getFullYear(),
    scheduler: schedulerStatus,
    metrics: {
      totalEvents: events.length,
      energySectorEvents: events.filter(e => e.scope === 'energy').length,
      nigeriaEvents: events.filter(e => e.scope === 'nigeria').length,
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter(s => s.status === 'active').length,
      totalSentAlerts: notifications.length,
      outboxCount: outbox.length
    },
    emailConfig: {
      hasResend: Boolean(process.env.RESEND_API_KEY),
      hasSendGrid: Boolean(process.env.SENDGRID_API_KEY),
      hasSmtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
      mode: (process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER))
        ? 'Live Email Provider'
        : 'In-App Outbox & Simulation Mode'
    }
  });
});

// Single Page App fallback for HTML
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Celebration & Energy Calendar Server Running`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================`);

  // Initialize daily cron job
  const appBaseUrl = `http://localhost:${PORT}`;
  scheduler.initScheduler(appBaseUrl);
});
