/**
 * In-App & Email Notification Service for Tasks & KPIs
 * Checks for upcoming task deadlines, flags at-risk or overdue items,
 * and delivers reminders via in-app notification center and email.
 */

const storage = require('./storageService');
const { calculateTaskStatus } = require('./taskService');
const emailService = require('./emailService');

/**
 * Runs task reminder cycle for a user or all users
 */
async function checkTaskReminders(referenceDateStr, appBaseUrl) {
  const today = referenceDateStr || new Date().toISOString().slice(0, 10);
  const tasks = storage.getTasks();
  const users = storage.getUsers();
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u; });

  const createdNotifications = [];

  for (const task of tasks) {
    if (task.completed) continue;
    const user = userMap[task.user_id];
    if (!user) continue;

    // Auto-update status
    const newStatus = calculateTaskStatus(task, today);
    if (newStatus !== task.status) {
      storage.updateTask(task.id, task.user_id, { status: newStatus });
      // Notify on status degradation (e.g. became at_risk or overdue)
      if (newStatus === 'at_risk' || newStatus === 'overdue') {
        const notif = storage.addUserNotification(user.id, {
          task_id: task.id,
          type: 'warning',
          title: `⚠️ Status Alert: ${task.title} is now ${newStatus.replace('_', ' ').toUpperCase()}`,
          message: `Current progress: ${task.current_progress}/${task.target_metric} ${task.unit}. Due date: ${task.due_date}.`
        });
        createdNotifications.push(notif);
      }
    }

    // Check reminder lead days (e.g., 1 day before, 3 days before, same day)
    if (task.due_date) {
      const [dy, dm, dd] = task.due_date.split('-').map(Number);
      const [ty, tm, td] = today.split('-').map(Number);
      const diffDays = Math.round((Date.UTC(dy, dm - 1, dd) - Date.UTC(ty, tm - 1, td)) / 86400000);

      const leadDays = task.remind_before_days || [1];
      if (leadDays.includes(diffDays)) {
        // Check if we already alerted today
        const existingNotifs = storage.getUserNotifications(user.id);
        const alreadyAlerted = existingNotifs.some(n =>
          n.task_id === task.id &&
          n.created_at &&
          n.created_at.startsWith(today)
        );

        if (!alreadyAlerted) {
          let urgencyPrefix = diffDays === 0 ? '🚨 DUE TODAY' : `⏰ Due in ${diffDays} day(s)`;
          const notif = storage.addUserNotification(user.id, {
            task_id: task.id,
            type: diffDays === 0 ? 'warning' : 'reminder',
            title: `${urgencyPrefix}: ${task.title}`,
            message: `Objective: ${task.objective}. Progress: ${task.current_progress}/${task.target_metric} ${task.unit}.`
          });
          createdNotifications.push(notif);

          // If user has email and appBaseUrl is provided, log outbox alert
          if (user.email) {
            storage.logToOutbox({
              to: user.email,
              recipientName: user.name || 'User',
              emailType: 'work',
              subject: `${urgencyPrefix}: ${task.title} [Personal KPI Reminder]`,
              eventId: task.id,
              eventName: task.title,
              eventScope: 'user_task',
              eventDate: task.due_date,
              leadTimeDays: diffDays,
              provider: 'in-app-outbox',
              delivered: true,
              html: `
                <div style="font-family:sans-serif; padding:20px; color:#1F2937;">
                  <h2 style="color:#008751;">📌 Task & KPI Reminder</h2>
                  <h3>${urgencyPrefix}: ${task.title}</h3>
                  <p><strong>Objective:</strong> ${task.objective}</p>
                  <p><strong>Timeline:</strong> Due on ${task.due_date} (Status: ${newStatus.toUpperCase()})</p>
                  <p><strong>Progress:</strong> ${task.current_progress} / ${task.target_metric} ${task.unit}</p>
                  <div style="margin-top:20px;">
                    <a href="${appBaseUrl || 'http://localhost:3000'}" style="display:inline-block; padding:10px 20px; background:#008751; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
                      Open Life Manager Dashboard
                    </a>
                  </div>
                </div>
              `,
              text: `${urgencyPrefix}: ${task.title}\nDue: ${task.due_date}\nProgress: ${task.current_progress}/${task.target_metric} ${task.unit}`
            });
          }
        }
      }
    }
  }

  return { checkedTasks: tasks.length, createdNotifications: createdNotifications.length };
}

module.exports = {
  checkTaskReminders
};
