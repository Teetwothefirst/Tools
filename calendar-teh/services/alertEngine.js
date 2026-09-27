/**
 * Alerting Engine
 * Executes matching logic between subscribers' preferred lead times & scopes and upcoming events.
 * Fully de-duplicated per (subscriber_id, event_id, year, lead_time_days).
 */

const storage = require('./storageService');
const dateService = require('./dateService');
const emailService = require('./emailService');

/**
 * Runs the alert matching logic for a given reference date (defaults to today in UTC)
 * @param {string} [referenceDateStr] - Format "YYYY-MM-DD"
 * @param {string} [appBaseUrl] - e.g. "http://localhost:3000"
 */
async function runAlertCycle(referenceDateStr, appBaseUrl) {
  const todayStr = referenceDateStr || new Date().toISOString().slice(0, 10);
  const [refYear] = todayStr.split('-').map(Number);

  console.log(`[AlertEngine] Starting alert cycle for reference date: ${todayStr}`);

  // Fetch active subscribers
  const allSubscribers = storage.getSubscribers();
  const activeSubscribers = allSubscribers.filter(s => s.status === 'active');

  // Fetch and resolve events for this year and next year (for year-end rollover alerts)
  const rawEvents = storage.getEvents();
  const resolvedCurrentYear = dateService.resolveEventsForYear(rawEvents, refYear);
  const resolvedNextYear = dateService.resolveEventsForYear(rawEvents, refYear + 1);
  const allResolvedEvents = [...resolvedCurrentYear, ...resolvedNextYear];

  const dispatched = [];
  const skippedDuplicates = [];
  let totalEvaluations = 0;

  for (const sub of activeSubscribers) {
    const subInterests = new Set(sub.interests || []);
    const subLeadTimes = new Set((sub.lead_times_days || [7, 1]).map(Number));

    for (const ev of allResolvedEvents) {
      totalEvaluations++;

      // Check if subscriber is interested in this event's scope
      if (!subInterests.has(ev.scope)) {
        continue;
      }

      // Check difference in days between event and target date
      const daysDiff = dateService.getDaysDifference(ev.dateStr, todayStr);

      // We only alert if daysDiff is non-negative and matches one of the subscriber's lead times
      if (daysDiff >= 0 && subLeadTimes.has(daysDiff)) {
        // Check deduplication
        const alreadyNotified = storage.hasBeenNotified(sub.id, ev.id, ev.year, daysDiff);

        if (alreadyNotified) {
          skippedDuplicates.push({
            subscriberId: sub.id,
            email: sub.email,
            eventId: ev.id,
            eventName: ev.name,
            leadTimeDays: daysDiff
          });
          continue;
        }

        // Send alert
        try {
          const sendRes = await emailService.sendAlertEmail({
            subscriber: sub,
            event: ev,
            leadTimeDays: daysDiff,
            eventDateStr: ev.dateStr,
            appBaseUrl
          });

          // Record deduplication entry
          storage.recordNotification(sub.id, ev.id, ev.year, daysDiff, sub.email);

          dispatched.push({
            subscriberId: sub.id,
            email: sub.email,
            name: sub.name,
            emailType: sub.email_type,
            eventId: ev.id,
            eventName: ev.name,
            eventScope: ev.scope,
            eventDate: ev.dateStr,
            leadTimeDays: daysDiff,
            provider: sendRes.dispatchResult.provider,
            outboxId: sendRes.outboxRecord.id
          });
        } catch (err) {
          console.error(`[AlertEngine] Failed to dispatch alert to ${sub.email} for ${ev.name}:`, err);
        }
      }
    }
  }

  const summary = {
    referenceDate: todayStr,
    activeSubscribersCount: activeSubscribers.length,
    eventsEvaluated: allResolvedEvents.length,
    totalEvaluations,
    dispatchedCount: dispatched.length,
    skippedDuplicatesCount: skippedDuplicates.length,
    dispatched,
    skippedDuplicates,
    completedAt: new Date().toISOString()
  };

  console.log(`[AlertEngine] Completed alert cycle. Dispatched: ${dispatched.length}, Duplicates skipped: ${skippedDuplicates.length}`);
  return summary;
}

module.exports = {
  runAlertCycle
};
