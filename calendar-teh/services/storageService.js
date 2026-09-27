/**
 * JSON File Storage Service with atomic write operations and validation
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const OUTBOX_FILE = path.join(DATA_DIR, 'outbox.json');

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

// ----------------- Events -----------------
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
    id, // preserve id
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

// ----------------- Subscribers -----------------
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

  // If already exists, return existing or update preferences
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
    email_type: subData.email_type || 'work', // "work" | "business" | "personal"
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
  outbox.unshift(record); // newest first
  if (outbox.length > 200) outbox.pop(); // keep last 200
  writeJSON(OUTBOX_FILE, outbox);
  return record;
}

function clearOutbox() {
  writeJSON(OUTBOX_FILE, []);
  return true;
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
  clearOutbox
};
