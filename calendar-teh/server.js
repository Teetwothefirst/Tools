/**
 * Main Express Application Server
 * Serves Calendar UI and REST API for:
 * - Public Celebrations, African Union & Energy Sector Observances
 * - Personal Task & KPI Tracker (Extension)
 * - User Authentication (Sign up, Log in, Password Reset, Persistent Sessions)
 * - In-App Notifications & Reminders
 * - RFC 5545 iCalendar live sync feed
 * - Daily Alert Scheduling & Outbox Simulator
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const storage = require('./services/storageService');
const dateService = require('./services/dateService');
const scheduler = require('./services/scheduler');
const authService = require('./services/authService');
const taskService = require('./services/taskService');
const notificationService = require('./services/notificationService');

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
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/register - Sign up
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, role, bu } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const password_hash = authService.hashPassword(password);
    const newUser = storage.addUser({
      email,
      password_hash,
      name: name || 'User',
      role: role || 'Communications Analyst',
      bu: bu || 'The Electricity Hub (TEH)'
    });

    // Automatically seed Communications Analyst KPI Tracker for new accounts
    taskService.importTehCommunicationsTemplate(newUser.id, new Date().getFullYear(), 'Q3');

    // Create welcome notification
    storage.addUserNotification(newUser.id, {
      type: 'celebration',
      title: 'Welcome to your Life Manager Dashboard!',
      message: 'Your Communications Analyst KPI Tracker has been automatically pre-loaded. Click "My Tasks & KPIs" to view.'
    });

    const token = authService.generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login - Log in
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = storage.getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = authService.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = authService.generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me - Get current user profile
app.get('/api/auth/me', authService.requireAuth(storage), (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password - Request password reset token
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = storage.getUserByEmail(email);
  if (!user) {
    // Return standard success to prevent email enumeration
    return res.json({ message: 'If an account exists with this email, a reset link has been dispatched.' });
  }

  const { token, expiresAt } = authService.generateResetToken();
  storage.updateUser(user.id, {
    reset_token: token,
    reset_token_expires: expiresAt
  });

  const appBaseUrl = `${req.protocol}://${req.get('host')}`;
  const resetUrl = `${appBaseUrl}/?view=reset-password&token=${token}`;

  // Log to outbox so user or reviewer can easily test reset flow in simulation mode
  storage.logToOutbox({
    to: user.email,
    recipientName: user.name || 'User',
    emailType: 'work',
    subject: 'Password Reset Request — Celebration & KPI Tracker',
    eventId: 'pwd-reset',
    eventName: 'Password Reset',
    eventScope: 'user_auth',
    eventDate: new Date().toISOString().slice(0, 10),
    leadTimeDays: 0,
    provider: 'in-app-outbox',
    delivered: true,
    html: `
      <div style="font-family:sans-serif; padding:24px; color:#1F2937;">
        <h2 style="color:#008751;">Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>We received a request to reset your password. Click the link below to set a new password. This link is valid for 1 hour.</p>
        <div style="margin:24px 0;">
          <a href="${resetUrl}" style="background-color:#008751; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
            Reset My Password
          </a>
        </div>
        <p style="font-size:12px; color:#6B7280;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Password Reset Link: ${resetUrl}`
  });

  res.json({
    message: 'If an account exists with this email, a reset link has been dispatched.',
    simulation_token: token // helpful for dev/testing
  });
});

// POST /api/auth/reset-password - Complete password reset
app.post('/api/auth/reset-password', (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Valid token and password of at least 6 characters required.' });
  }

  const user = storage.getUserByResetToken(token);
  if (!user) {
    return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
  }

  const newHash = authService.hashPassword(new_password);
  storage.updateUser(user.id, {
    password_hash: newHash,
    reset_token: null,
    reset_token_expires: null
  });

  res.json({ message: 'Password has been successfully reset! You can now log in.' });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// -------------------------------------------------------------
// EVENTS ENDPOINTS (Public Observances + Merged Personal Tasks)
// -------------------------------------------------------------

// GET /api/events - List resolved events for a year with filters
app.get('/api/events', authService.optionalAuth(storage), (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const year = parseInt(req.query.year, 10) || currentYear;
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const scope = req.query.scope; // "nigeria", "africa", "global", "energy", "user_task"
    const category = req.query.category;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : null;

    const rawEvents = storage.getEvents();
    let resolved = dateService.resolveEventsForYear(rawEvents, year);

    // If user is authenticated, format their personal tasks with due dates and merge!
    let userTasksFormatted = [];
    if (req.user) {
      const userTasks = taskService.getUserTasks(req.user.id, { referenceDate: null, view: 'all' });
      userTasksFormatted = taskService.formatTasksForCalendar(userTasks, year);
    }

    let combined = [...resolved, ...userTasksFormatted];

    // Apply filters
    if (month) {
      combined = combined.filter(e => e.month === month);
    }

    if (scope && scope !== 'all') {
      const scopes = scope.split(',').map(s => s.trim().toLowerCase());
      combined = combined.filter(e => scopes.includes(e.scope.toLowerCase()));
    }

    if (category && category !== 'all') {
      combined = combined.filter(e => e.category && e.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      combined = combined.filter(e =>
        e.name.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search)) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(search))) ||
        (e.source_note && e.source_note.toLowerCase().includes(search))
      );
    }

    // Sort chronologically by date
    combined.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    res.json({
      year,
      count: combined.length,
      publicCount: resolved.length,
      userTaskCount: userTasksFormatted.length,
      events: combined
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event details
app.get('/api/events/:id', authService.optionalAuth(storage), (req, res) => {
  // Check if it's a user task
  if (req.params.id.startsWith('tsk-')) {
    if (!req.user) {
      return res.status(401).json({ error: 'Login required to view personal tasks.' });
    }
    const task = storage.getTaskById(req.params.id);
    if (!task || task.user_id !== req.user.id) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    const enriched = taskService.enrichTask(task);
    const calendarItem = taskService.formatTasksForCalendar([enriched], new Date().getFullYear())[0];
    return res.json({ event: calendarItem, task: enriched });
  }

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
// PERSONAL TASK & KPI TRACKER ENDPOINTS (AUTHENTICATED)
// -------------------------------------------------------------

// GET /api/tasks - List user tasks with view filter (today, this_week, overdue, upcoming, all)
app.get('/api/tasks', authService.requireAuth(storage), (req, res) => {
  try {
    const { view, objective, priority, entity_type } = req.query;
    const tasks = taskService.getUserTasks(req.user.id, {
      view,
      objective,
      priority,
      entity_type
    });
    const stats = taskService.getUserTaskStats(req.user.id);

    res.json({
      count: tasks.length,
      view: view || 'all',
      stats,
      tasks
    });
  } catch (err) {
    console.error('Error retrieving tasks:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// GET /api/tasks/stats - Get KPI dashboard portfolio metrics
app.get('/api/tasks/stats', authService.requireAuth(storage), (req, res) => {
  try {
    const stats = taskService.getUserTaskStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute task statistics.' });
  }
});

// GET /api/tasks/:id - Single task
app.get('/api/tasks/:id', authService.requireAuth(storage), (req, res) => {
  const task = storage.getTaskById(req.params.id);
  if (!task || task.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Task not found.' });
  }
  res.json({ task: taskService.enrichTask(task) });
});

// POST /api/tasks - Create task or KPI
app.post('/api/tasks', authService.requireAuth(storage), (req, res) => {
  try {
    const {
      title, description, objective, category, target_metric, current_progress,
      unit, start_date, due_date, recurrence, priority, entity_type, tags, remind_before_days
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const newTask = storage.addTask({
      user_id: req.user.id,
      entity_type: entity_type || 'kpi',
      title: title.trim(),
      description: description || '',
      objective: objective || 'General',
      category: category || objective || 'General',
      target_metric: target_metric !== undefined ? Number(target_metric) : 1,
      current_progress: current_progress !== undefined ? Number(current_progress) : 0,
      unit: unit || 'units',
      start_date: start_date || new Date().toISOString().slice(0, 10),
      due_date: due_date || null,
      recurrence: recurrence || 'none',
      priority: priority || 'medium',
      tags: tags || [],
      remind_before_days: remind_before_days || [1]
    });

    const enriched = taskService.enrichTask(newTask);

    res.status(201).json({
      message: 'Task created successfully!',
      task: enriched
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id - Update task or progress
app.put('/api/tasks/:id', authService.requireAuth(storage), (req, res) => {
  try {
    const updated = storage.updateTask(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const enriched = taskService.enrichTask(updated);

    // If marked completed, trigger celebration notification!
    if (req.body.completed === true && enriched.completed) {
      storage.addUserNotification(req.user.id, {
        task_id: enriched.id,
        type: 'celebration',
        title: `🎉 Goal Achieved: ${enriched.title}`,
        message: `Congratulations! You marked this item complete on ${new Date().toLocaleDateString()}.`
      });
    }

    res.json({
      message: 'Task updated successfully!',
      task: enriched
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', authService.requireAuth(storage), (req, res) => {
  try {
    const ok = storage.deleteTask(req.params.id, req.user.id);
    if (!ok) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// POST /api/tasks/template/teh-communications - 1-Click Load TEH Communications Analyst Template
app.post('/api/tasks/template/teh-communications', authService.requireAuth(storage), (req, res) => {
  try {
    const quarter = req.body.quarter || 'Q3';
    const year = req.body.year || new Date().getFullYear();
    const created = taskService.importTehCommunicationsTemplate(req.user.id, year, quarter);

    res.json({
      message: `Successfully imported ${created.length} KPIs from the TEH Communications Analyst FY 2025/2026 Tracker!`,
      importedCount: created.length
    });
  } catch (err) {
    console.error('Error importing template:', err);
    res.status(500).json({ error: 'Failed to import KPI template.' });
  }
});

// GET /api/kpi-template - View available organizational KPI templates
app.get('/api/kpi-template', (req, res) => {
  const tpl = storage.getKpiTemplate();
  res.json(tpl);
});

// -------------------------------------------------------------
// LIVE iCALENDAR (.ICS) FEED FOR GOOGLE CALENDAR / OUTLOOK SYNC
// -------------------------------------------------------------

// GET /api/users/:id/calendar.ics - RFC 5545 feed
app.get('/api/users/:id/calendar.ics', (req, res) => {
  try {
    const user = storage.getUserById(req.params.id);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const token = req.query.token;
    if (!token || token !== user.calendar_token) {
      return res.status(401).send('Unauthorized calendar sync token.');
    }

    const tasks = storage.getTasksByUserId(user.id);
    const enriched = tasks.map(t => taskService.enrichTask(t));
    const icsFeed = taskService.generateIcsFeed(user, enriched);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${user.name ? user.name.replace(/\s+/g, '_') : 'my'}_tasks.ics"`);
    res.send(icsFeed);
  } catch (err) {
    console.error('Error generating ics feed:', err);
    res.status(500).send('Error generating calendar feed.');
  }
});

// -------------------------------------------------------------
// IN-APP NOTIFICATIONS & REMINDER CENTER
// -------------------------------------------------------------

// GET /api/notifications - List user's notifications
app.get('/api/notifications', authService.requireAuth(storage), (req, res) => {
  const notifs = storage.getUserNotifications(req.user.id);
  const unreadCount = notifs.filter(n => !n.read).length;
  res.json({
    count: notifs.length,
    unreadCount,
    notifications: notifs
  });
});

// PUT /api/notifications/:id/read - Mark single notification as read
app.put('/api/notifications/:id/read', authService.requireAuth(storage), (req, res) => {
  storage.markNotificationRead(req.params.id, req.user.id);
  res.json({ message: 'Notification marked as read.' });
});

// PUT /api/notifications/read-all - Mark all as read
app.put('/api/notifications/read-all', authService.requireAuth(storage), (req, res) => {
  storage.markAllNotificationsRead(req.user.id);
  res.json({ message: 'All notifications marked as read.' });
});

// -------------------------------------------------------------
// PUBLIC SUBSCRIBERS ENDPOINTS (FOR OBSERVANCE ALERTS)
// -------------------------------------------------------------

// POST /api/subscribers - Signup for public alerts
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

    const validTypes = ['work', 'business', 'personal'];
    const chosenType = validTypes.includes(email_type) ? email_type : 'work';

    const allowedInterests = ['nigeria', 'africa', 'global', 'energy'];
    let chosenInterests = Array.isArray(interests) && interests.length > 0
      ? interests.filter(i => allowedInterests.includes(i))
      : allowedInterests;
    if (chosenInterests.length === 0) chosenInterests = allowedInterests;

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

// POST or GET /api/alerts/run, /api/cron - Run alert engine (Manual, API, or Vercel Cron)
app.all(['/api/alerts/run', '/api/cron'], async (req, res) => {
  try {
    const simulated_date = req.body?.simulated_date || req.query?.simulated_date || null;
    const appBaseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await scheduler.triggerManualRun(simulated_date || null, appBaseUrl);

    // Also check task reminders
    const taskReminderResult = await notificationService.checkTaskReminders(simulated_date || null, appBaseUrl);

    res.json({
      message: 'Alert cycle completed successfully',
      result,
      taskReminderResult
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
app.get('/api/status', (req, res) => res.redirect('/api/system/status'));
app.get('/api/system/status', (req, res) => {
  const schedulerStatus = scheduler.getSchedulerStatus();
  const events = storage.getEvents();
  const subscribers = storage.getSubscribers();
  const notifications = storage.getNotifications();
  const outbox = storage.getOutbox();
  const users = storage.getUsers();
  const tasks = storage.getTasks();

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
      totalUsers: users.length,
      totalTasks: tasks.length,
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

// Explicit SPA navigation routes
app.get(['/login', '/login/', '/register', '/register/', '/dashboard', '/dashboard/', '/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Single Page App fallback for HTML (non-API routes)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`The Electricity Hub & Observance Calendar with Task/KPI Tracker`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================`);

    const appBaseUrl = `http://localhost:${PORT}`;
    scheduler.initScheduler(appBaseUrl);
  });
}

// Export Express app for Vercel Serverless Function deployment
module.exports = app;
