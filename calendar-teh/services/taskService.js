/**
 * Task & KPI Management Service
 * Provides business logic for status auto-calculation, view filtering,
 * calendar rendering format, KPI matrices, and RFC 5545 iCalendar feed generation.
 */

const storage = require('./storageService');
const { v4: uuidv4 } = require('uuid');

/**
 * Auto-calculates task status based on progress vs time elapsed
 * Returns: "completed" | "overdue" | "at_risk" | "on_track"
 */
function calculateTaskStatus(task, referenceDateStr) {
  const today = referenceDateStr || new Date().toISOString().slice(0, 10);

  if (task.completed || (task.target_metric > 0 && task.current_progress >= task.target_metric)) {
    return 'completed';
  }

  if (task.due_date && task.due_date < today) {
    return 'overdue';
  }

  if (!task.due_date) {
    return 'on_track';
  }

  const start = task.start_date || today;
  const due = task.due_date;

  const [sy, sm, sd] = start.split('-').map(Number);
  const [dy, dm, dd] = due.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);

  const startMs = Date.UTC(sy, sm - 1, sd);
  const dueMs = Date.UTC(dy, dm - 1, dd);
  const todayMs = Date.UTC(ty, tm - 1, td);

  const totalDuration = Math.max(86400000, dueMs - startMs);
  const elapsed = Math.max(0, todayMs - startMs);
  const timeElapsedPct = Math.min(100, (elapsed / totalDuration) * 100);

  const target = task.target_metric || 1;
  const progressPct = Math.min(100, (task.current_progress / target) * 100);

  // If time elapsed is more than 25% ahead of progress rate, flag as at risk
  if (timeElapsedPct > 25 && timeElapsedPct - progressPct > 20) {
    return 'at_risk';
  }

  return 'on_track';
}

/**
 * Enhances a task object with calculated status and percentage
 */
function enrichTask(task, referenceDateStr) {
  const status = calculateTaskStatus(task, referenceDateStr);
  const target = task.target_metric || 1;
  const progressPct = Math.min(100, Math.round(((task.current_progress || 0) / target) * 100));

  return {
    ...task,
    status,
    progress_percentage: progressPct
  };
}

/**
 * Retrieves and enriches all tasks for a specific user, filtered by view
 */
function getUserTasks(userId, options = {}) {
  const rawTasks = storage.getTasksByUserId(userId);
  const today = options.referenceDate || new Date().toISOString().slice(0, 10);
  let tasks = rawTasks.map(t => enrichTask(t, today));

  // Filter by Objective / Category
  if (options.objective && options.objective !== 'all') {
    tasks = tasks.filter(t => t.objective === options.objective || t.category === options.objective);
  }

  // Filter by Priority
  if (options.priority && options.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === options.priority);
  }

  // Filter by Entity Type
  if (options.entity_type && options.entity_type !== 'all') {
    tasks = tasks.filter(t => t.entity_type === options.entity_type);
  }

  // Filter by View
  const view = options.view || 'all';

  if (view === 'today') {
    tasks = tasks.filter(t => t.due_date === today);
  } else if (view === 'this_week') {
    const todayDate = new Date(today);
    const dayOfWeek = todayDate.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(todayDate);
    monday.setDate(todayDate.getDate() + distanceToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const pad = n => String(n).padStart(2, '0');
    const startStr = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
    const endStr = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;

    tasks = tasks.filter(t => t.due_date && t.due_date >= startStr && t.due_date <= endStr);
  } else if (view === 'overdue') {
    tasks = tasks.filter(t => t.status === 'overdue');
  } else if (view === 'upcoming') {
    tasks = tasks.filter(t => t.due_date && t.due_date >= today && t.status !== 'completed');
  } else if (view === 'completed') {
    tasks = tasks.filter(t => t.status === 'completed');
  }

  // Sort by due date ascending
  tasks.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  return tasks;
}

/**
 * Calculates aggregate stats for a user's task and KPI portfolio
 */
function getUserTaskStats(userId, referenceDateStr) {
  const tasks = getUserTasks(userId, { referenceDate: referenceDateStr, view: 'all' });
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const onTrack = tasks.filter(t => t.status === 'on_track').length;
  const atRisk = tasks.filter(t => t.status === 'at_risk').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;

  const kpisOnly = tasks.filter(t => t.entity_type === 'kpi');
  let overallKpiPct = 0;
  if (kpisOnly.length > 0) {
    const sumPcts = kpisOnly.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
    overallKpiPct = Math.round(sumPcts / kpisOnly.length);
  }

  // Objectives breakdown
  const objectives = {};
  tasks.forEach(t => {
    const obj = t.objective || 'General';
    if (!objectives[obj]) {
      objectives[obj] = { total: 0, completed: 0, onTrack: 0, atRisk: 0, overdue: 0 };
    }
    objectives[obj].total++;
    if (t.status === 'completed') objectives[obj].completed++;
    else if (t.status === 'on_track') objectives[obj].onTrack++;
    else if (t.status === 'at_risk') objectives[obj].atRisk++;
    else if (t.status === 'overdue') objectives[obj].overdue++;
  });

  return {
    total,
    completed,
    onTrack,
    atRisk,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    overallKpiScore: overallKpiPct,
    objectives
  };
}

/**
 * Formats user tasks into calendar observance items that render directly on the calendar UI
 */
function formatTasksForCalendar(tasks, year) {
  return tasks
    .filter(t => t.due_date && t.due_date.startsWith(String(year)))
    .map(t => {
      const [y, m, d] = t.due_date.split('-').map(Number);
      return {
        id: t.id,
        name: t.title,
        scope: 'user_task', // Distinct scope badge
        category: 'my_tasks',
        recurrence: t.recurrence || 'none',
        month: m,
        day: d,
        dateStr: t.due_date,
        description: t.description || `${t.objective}: Target ${t.target_metric} ${t.unit} (Current: ${t.current_progress})`,
        source_note: `Personal Task / KPI · Priority: ${t.priority.toUpperCase()} · Status: ${t.status.toUpperCase()}`,
        official: false,
        priority: t.priority,
        status: t.status,
        completed: t.completed,
        target_metric: t.target_metric,
        current_progress: t.current_progress,
        unit: t.unit,
        objective: t.objective,
        tags: t.tags || [],
        isUserTask: true
      };
    });
}

/**
 * Generates an RFC 5545 iCalendar (.ics) feed for a user's tasks
 */
function generateIcsFeed(user, tasks) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Electricity Hub//Personal Task & KPI Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${user.name || 'User'}'s Tasks & KPIs`,
    'X-WR-TIMEZONE:Africa/Lagos'
  ];

  tasks.forEach(t => {
    if (!t.due_date) return;
    const [y, m, d] = t.due_date.split('-');
    const dt = `${y}${m.padStart(2, '0')}${d.padStart(2, '0')}`;

    let priorityNum = 5;
    if (t.priority === 'urgent') priorityNum = 1;
    else if (t.priority === 'high') priorityNum = 3;
    else if (t.priority === 'low') priorityNum = 9;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${t.id}@teh.energy`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${dt}`);
    lines.push(`DTEND;VALUE=DATE:${dt}`);
    lines.push(`SUMMARY:📌 ${t.title} [${t.status.toUpperCase()}]`);
    lines.push(`DESCRIPTION:Objective: ${t.objective}\\nProgress: ${t.current_progress}/${t.target_metric} ${t.unit}\\nStatus: ${t.status}\\n\\n${(t.description || '').replace(/\n/g, '\\n')}`);
    lines.push(`PRIORITY:${priorityNum}`);
    lines.push(`STATUS:${t.completed ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Imports the complete Communications Analyst KPI Tracker for a user
 */
function importTehCommunicationsTemplate(userId, targetYear = 2026, targetQuarter = 'Q3') {
  const template = storage.getKpiTemplate();
  const createdTasks = [];
  const now = new Date();

  // Determine quarterly end dates
  const quarterDueDates = {
    'Q1': `${targetYear}-03-31`,
    'Q2': `${targetYear}-06-30`,
    'Q3': `${targetYear}-09-30`,
    'Q4': `${targetYear}-12-31`
  };

  const quarterStartDates = {
    'Q1': `${targetYear}-01-01`,
    'Q2': `${targetYear}-04-01`,
    'Q3': `${targetYear}-07-01`,
    'Q4': `${targetYear}-10-01`
  };

  const dueDate = quarterDueDates[targetQuarter] || `${targetYear}-09-30`;
  const startDate = quarterStartDates[targetQuarter] || `${targetYear}-07-01`;

  template.items.forEach(item => {
    // Check if task with same code already exists for user
    const existing = storage.getTasksByUserId(userId).find(t => t.code === item.code);
    if (!existing) {
      const targetVal = item[`${targetQuarter.toLowerCase()}_target`] || item.target_metric;
      const initialProgress = Math.round(targetVal * 0.7); // 70% progress as realistic baseline

      const newTask = storage.addTask({
        user_id: userId,
        entity_type: 'kpi',
        code: item.code,
        title: item.title,
        description: item.description,
        objective: item.objective,
        category: item.objective,
        metric_type: item.metric_type,
        target_metric: targetVal,
        annual_target: item.annual_target,
        current_progress: initialProgress,
        unit: item.unit,
        start_date: startDate,
        due_date: dueDate,
        recurrence: item.recurrence,
        priority: item.priority,
        tags: ['TEH', 'KPI', targetQuarter],
        remind_before_days: [3, 1]
      });
      createdTasks.push(newTask);
    }
  });

  return createdTasks;
}

module.exports = {
  calculateTaskStatus,
  enrichTask,
  getUserTasks,
  getUserTaskStats,
  formatTasksForCalendar,
  generateIcsFeed,
  importTehCommunicationsTemplate
};
