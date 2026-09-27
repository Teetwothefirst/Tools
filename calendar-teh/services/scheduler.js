/**
 * Scheduler service using node-cron for daily automated observance alert matching.
 */

const cron = require('node-cron');
const { runAlertCycle } = require('./alertEngine');

let cronTask = null;
let lastRunResult = null;
let isRunning = false;

function initScheduler(appBaseUrl) {
  // Run every morning at 08:00 WAT/Local
  // Cron expression: 0 8 * * *
  const cronExpression = process.env.CRON_SCHEDULE || '0 8 * * *';

  cronTask = cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] Cron triggered at ${new Date().toISOString()}`);
    isRunning = true;
    try {
      lastRunResult = await runAlertCycle(null, appBaseUrl);
    } catch (err) {
      console.error('[Scheduler] Error during scheduled alert run:', err);
    } finally {
      isRunning = false;
    }
  });

  console.log(`[Scheduler] Daily observance alert cron initialized (${cronExpression})`);
}

async function triggerManualRun(simulatedDateStr, appBaseUrl) {
  isRunning = true;
  try {
    lastRunResult = await runAlertCycle(simulatedDateStr, appBaseUrl);
    return lastRunResult;
  } finally {
    isRunning = false;
  }
}

function getSchedulerStatus() {
  return {
    scheduled: Boolean(cronTask),
    cronExpression: process.env.CRON_SCHEDULE || '0 8 * * *',
    isRunning,
    lastRunResult
  };
}

module.exports = {
  initScheduler,
  triggerManualRun,
  getSchedulerStatus
};
