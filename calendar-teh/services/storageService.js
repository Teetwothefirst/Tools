/**
 * JSON File Storage Service with atomic write operations and validation
 * Supports Events, Public Alerts Subscribers, Users, Tasks & KPIs, and In-App Notifications.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const USER_NOTIFS_FILE = path.join(DATA_DIR, 'user_notifications.json');
const KPI_TEMPLATE_FILE = path.join(DATA_DIR, 'kpi_template.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON(filePath, fallback = []) {
  try {
    ensureDataDir();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    ensureDataDir();
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// ----------------- Public Events -----------------
function getEvents() {
  return readJSON(EVENTS_FILE, []);
}

function getEventById(id) {
  const events = getEvents();
  return events.find(e => e.id === id) || null;
}

function saveEvents(events) {
  return writeJSON(EVENTS_FILE, events);
}

function addEvent(eventData) {
  const events = getEvents();
  const newEvent = {
    id: eventData.id || `custom-${Date.now()}`,
    name: eventData.name,
    scope: eventData.scope || 'energy',
    category: eventData.category || 'energy_sector',
    recurrence: eventData.recurrence || 'fixed',
    month: eventData.month ? parseInt(eventData.month, 10) : null,
    day: eventData.day ? parseInt(eventData.day, 10) : null,
    year_specific_date: eventData.year_specific_date || null,
    description: eventData.description || '',
    source_note: eventData.source_note || 'User-added observance',
    official: Boolean(eventData.official),
    tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags ? String(eventData.tags).split(',').map(s => s.trim()) : [])
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

function updateEvent(id, eventData) {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    ...eventData,
    id,
    month: eventData.month !== undefined ? (eventData.month ? parseInt(eventData.month, 10) : null) : events[index].month,
    day: eventData.day !== undefined ? (eventData.day ? parseInt(eventData.day, 10) : null) : events[index].day,
    official: eventData.official !== undefined ? Boolean(eventData.official) : events[index].official
  };
  saveEvents(events);
  return events[index];
}

function deleteEvent(id) {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  saveEvents(filtered);
  return true;
}

// ----------------- Public Subscribers -----------------
function getSubscribers() {
  return readJSON(SUBSCRIBERS_FILE, []);
}

function getSubscriberByEmail(email) {
  const subs = getSubscribers();
  const cleanEmail = String(email || '').trim().toLowerCase();
  return subs.find(s => s.email.toLowerCase() === cleanEmail) || null;
}

function getSubscriberByToken(token) {
  const subs = getSubscribers();
  return subs.find(s => s.token === token) || null;
}

function getSubscriberById(id) {
  const subs = getSubscribers();
  return subs.find(s => s.id === id) || null;
}

function addSubscriber(subData) {
  const subs = getSubscribers();
  const cleanEmail = String(subData.email || '').trim().toLowerCase();

  const existingIndex = subs.findIndex(s => s.email.toLowerCase() === cleanEmail);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    subs[existingIndex] = {
      ...subs[existingIndex],
      email_type: subData.email_type || subs[existingIndex].email_type || 'work',
      name: subData.name !== undefined ? subData.name : subs[existingIndex].name,
      interests: Array.isArray(subData.interests) && subData.interests.length > 0 ? subData.interests : subs[existingIndex].interests,
      lead_times_days: Array.isArray(subData.lead_times_days) && subData.lead_times_days.length > 0 ? subData.lead_times_days : subs[existingIndex].lead_times_days,
      consent_given: true,
      consent_timestamp: now,
      status: 'active',
      updated_at: now
    };
    writeJSON(SUBSCRIBERS_FILE, subs);
    return { subscriber: subs[existingIndex], isNew: false };
  }

  const newSub = {
    id: uuidv4(),
    email: cleanEmail,
    email_type: subData.email_type || 'work',
    name: subData.name ? String(subData.name).trim() : '',
    interests: Array.isArray(subData.interests) && subData.interests.length > 0
      ? subData.interests
      : ['nigeria', 'africa', 'global', 'energy'],
    lead_times_days: Array.isArray(subData.lead_times_days) && subData.lead_times_days.length > 0
      ? subData.lead_times_days.map(Number)
      : [7, 1],
    consent_given: Boolean(subData.consent_given),
    consent_timestamp: now,
    status: 'active',
    token: `tok_${uuidv4().replace(/-/g, '')}`,
    created_at: now
  };

  subs.push(newSub);
  writeJSON(SUBSCRIBERS_FILE, subs);
  return { subscriber: newSub, isNew: true };
}

function updateSubscriber(idOrToken, updates) {
  const subs = getSubscribers();
  const index = subs.findIndex(s => s.id === idOrToken || s.token === idOrToken);
  if (index === -1) return null;

  subs[index] = {
    ...subs[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  writeJSON(SUBSCRIBERS_FILE, subs);
  return subs[index];
}

function unsubscribe(idOrTokenOrEmail) {
  const subs = getSubscribers();
  const cleanParam = String(idOrTokenOrEmail || '').trim().toLowerCase();
  const index = subs.findIndex(s =>
    s.id === idOrTokenOrEmail ||
    s.token === idOrTokenOrEmail ||
    s.email.toLowerCase() === cleanParam
  );

  if (index === -1) return false;
  subs[index].status = 'unsubscribed';
  subs[index].unsubscribed_at = new Date().toISOString();
  writeJSON(SUBSCRIBERS_FILE, subs);
  return subs[index];
}

// ----------------- Notifications Log (Deduplication) -----------------
function getNotifications() {
  return readJSON(NOTIFICATIONS_FILE, []);
}

function recordNotification(subscriberId, eventId, year, leadTimeDays, email) {
  const notifs = getNotifications();
  const record = {
    id: uuidv4(),
    subscriber_id: subscriberId,
    email,
    event_id: eventId,
    year: Number(year),
    lead_time_days: Number(leadTimeDays),
    sent_at: new Date().toISOString()
  };
  notifs.push(record);
  writeJSON(NOTIFICATIONS_FILE, notifs);
  return record;
}

function hasBeenNotified(subscriberId, eventId, year, leadTimeDays) {
  const notifs = getNotifications();
  return notifs.some(n =>
    n.subscriber_id === subscriberId &&
    n.event_id === eventId &&
    Number(n.year) === Number(year) &&
    Number(n.lead_time_days) === Number(leadTimeDays)
  );
}

// ----------------- Outbox (In-App Email Inspector) -----------------
function getOutbox() {
  return readJSON(OUTBOX_FILE, []);
}

function logToOutbox(emailRecord) {
  const outbox = getOutbox();
  const record = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...emailRecord
  };
  outbox.unshift(record);
  if (outbox.length > 200) outbox.pop();
  writeJSON(OUTBOX_FILE, outbox);
  return record;
}

function clearOutbox() {
  writeJSON(OUTBOX_FILE, []);
  return true;
}

// ----------------- Users (Authentication & Life Manager) -----------------
function getUsers() {
  return readJSON(USERS_FILE, []);
}

function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

function getUserByEmail(email) {
  const users = getUsers();
  const clean = String(email || '').trim().toLowerCase();
  return users.find(u => u.email.toLowerCase() === clean) || null;
}

function getUserByCalendarToken(token) {
  const users = getUsers();
  return users.find(u => u.calendar_token === token) || null;
}

function getUserByResetToken(token) {
  const users = getUsers();
  const now = new Date().toISOString();
  return users.find(u =>
    u.reset_token === token &&
    u.reset_token_expires &&
    u.reset_token_expires > now
  ) || null;
}

function addUser(userData) {
  const users = getUsers();
  const cleanEmail = String(userData.email || '').trim().toLowerCase();

  const newUser = {
    id: userData.id || `usr-${uuidv4().slice(0, 8)}`,
    email: cleanEmail,
    password_hash: userData.password_hash,
    name: userData.name || '',
    role: userData.role || 'Communications Analyst',
    bu: userData.bu || 'The Electricity Hub (TEH)',
    line_manager: userData.line_manager || '',
    avatar: userData.avatar || '⚡',
    calendar_token: userData.calendar_token || `cal_${uuidv4().replace(/-/g, '')}`,
    reset_token: null,
    reset_token_expires: null,
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);
  return newUser;
}

function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    id,
    updated_at: new Date().toISOString()
  };
  writeJSON(USERS_FILE, users);
  return users[index];
}

// ----------------- Tasks & KPIs -----------------
function getTasks() {
  return readJSON(TASKS_FILE, []);
}

function getTaskById(id) {
  const tasks = getTasks();
  return tasks.find(t => t.id === id) || null;
}

function getTasksByUserId(userId) {
  const tasks = getTasks();
  return tasks.filter(t => t.user_id === userId);
}

function saveTasks(tasks) {
  return writeJSON(TASKS_FILE, tasks);
}

function addTask(taskData) {
  const tasks = getTasks();
  const now = new Date().toISOString();

  const newTask = {
    id: taskData.id || `tsk-${uuidv4().slice(0, 8)}`,
    user_id: taskData.user_id,
    entity_type: taskData.entity_type || 'kpi', // "kpi" | "task" | "milestone" | "life_event"
    code: taskData.code || null,
    title: taskData.title,
    description: taskData.description || '',
    objective: taskData.objective || 'General',
    category: taskData.category || taskData.objective || 'General',
    metric_type: taskData.metric_type || 'number', // "number" | "boolean"
    target_metric: taskData.target_metric !== undefined ? Number(taskData.target_metric) : 1,
    annual_target: taskData.annual_target !== undefined ? Number(taskData.annual_target) : null,
    current_progress: taskData.current_progress !== undefined ? Number(taskData.current_progress) : 0,
    unit: taskData.unit || 'units',
    start_date: taskData.start_date || now.slice(0, 10),
    due_date: taskData.due_date || now.slice(0, 10),
    recurrence: taskData.recurrence || 'none', // "none" | "daily" | "weekly" | "monthly" | "quarterly"
    priority: taskData.priority || 'medium', // "low" | "medium" | "high" | "urgent"
    status: taskData.status || 'on_track', // "on_track" | "at_risk" | "overdue" | "completed"
    completed: Boolean(taskData.completed),
    completed_at: taskData.completed ? now : null,
    tags: Array.isArray(taskData.tags) ? taskData.tags : (taskData.tags ? String(taskData.tags).split(',').map(s => s.trim()) : []),
    remind_before_days: Array.isArray(taskData.remind_before_days) ? taskData.remind_before_days.map(Number) : [1],
    created_at: now,
    updated_at: now
  };

  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

function updateTask(id, userId, updates) {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id && t.user_id === userId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = tasks[index];

  // If completion state toggled
  let completed = updates.completed !== undefined ? Boolean(updates.completed) : current.completed;
  let completed_at = current.completed_at;
  if (updates.completed === true && !current.completed) {
    completed_at = now;
  } else if (updates.completed === false) {
    completed_at = null;
  }

  tasks[index] = {
    ...current,
    ...updates,
    id,
    user_id: userId,
    completed,
    completed_at,
    target_metric: updates.target_metric !== undefined ? Number(updates.target_metric) : current.target_metric,
    current_progress: updates.current_progress !== undefined ? Number(updates.current_progress) : current.current_progress,
    updated_at: now
  };

  saveTasks(tasks);
  return tasks[index];
}

function deleteTask(id, userId) {
  const tasks = getTasks();
  const filtered = tasks.filter(t => !(t.id === id && t.user_id === userId));
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

// ----------------- User In-App Notifications -----------------
function getUserNotifications(userId) {
  const notifs = readJSON(USER_NOTIFS_FILE, []);
  return notifs.filter(n => n.user_id === userId);
}

function addUserNotification(userId, notifData) {
  const notifs = readJSON(USER_NOTIFS_FILE, []);
  const newNotif = {
    id: uuidv4(),
    user_id: userId,
    task_id: notifData.task_id || null,
    type: notifData.type || 'reminder', // "reminder" | "warning" | "celebration" | "info"
    title: notifData.title,
    message: notifData.message,
    read: false,
    created_at: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  if (notifs.length > 500) notifs.pop();
  writeJSON(USER_NOTIFS_FILE, notifs);
  return newNotif;
}

function markNotificationRead(id, userId) {
  const notifs = readJSON(USER_NOTIFS_FILE, []);
  const item = notifs.find(n => n.id === id && n.user_id === userId);
  if (!item) return false;
  item.read = true;
  writeJSON(USER_NOTIFS_FILE, notifs);
  return true;
}

function markAllNotificationsRead(userId) {
  const notifs = readJSON(USER_NOTIFS_FILE, []);
  let changed = false;
  notifs.forEach(n => {
    if (n.user_id === userId && !n.read) {
      n.read = true;
      changed = true;
    }
  });
  if (changed) writeJSON(USER_NOTIFS_FILE, notifs);
  return true;
}

// ----------------- KPI Template -----------------
function getKpiTemplate() {
  return readJSON(KPI_TEMPLATE_FILE, { items: [] });
}

module.exports = {
  getEvents,
  getEventById,
  saveEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getSubscribers,
  getSubscriberByEmail,
  getSubscriberByToken,
  getSubscriberById,
  addSubscriber,
  updateSubscriber,
  unsubscribe,
  getNotifications,
  recordNotification,
  hasBeenNotified,
  getOutbox,
  logToOutbox,
  clearOutbox,
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByCalendarToken,
  getUserByResetToken,
  addUser,
  updateUser,
  getTasks,
  getTaskById,
  getTasksByUserId,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
  getUserNotifications,
  addUserNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getKpiTemplate
};
