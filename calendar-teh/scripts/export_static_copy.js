const fs = require('fs');
const path = require('path');
const storage = require('../services/storageService');
const dateService = require('../services/dateService');

const rawEvents = storage.getEvents();
const resolved2026 = dateService.resolveEventsForYear(rawEvents, 2026);
resolved2026.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

console.log('Total resolved events for 2026:', resolved2026.length);

const baseDir = path.join(__dirname, '..');

// 1. Write events-data.js for standalone frontend fallback
const jsContent = 'window.PRELOADED_EVENTS = ' + JSON.stringify(resolved2026, null, 2) + ';\n';
fs.writeFileSync(path.join(baseDir, 'public', 'js', 'events-data.js'), jsContent, 'utf8');
console.log('Written public/js/events-data.js');

// 2. Generate RFC 5545 .ics iCalendar file
const ics = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//The Electricity Hub//Observance Calendar 2026//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:The Electricity Hub 2026 Observances',
  'X-WR-TIMEZONE:Africa/Lagos'
];

resolved2026.forEach(ev => {
  const [y, m, d] = ev.dateStr.split('-');
  const dtStart = y + m + d;
  const nextDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d) + 1));
  const ny = nextDate.getUTCFullYear();
  const nm = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(nextDate.getUTCDate()).padStart(2, '0');
  const dtEnd = `${ny}${nm}${nd}`;

  ics.push('BEGIN:VEVENT');
  ics.push(`UID:teh-${ev.id}-2026@theelectricityhub.com`);
  ics.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`);
  ics.push(`DTSTART;VALUE=DATE:${dtStart}`);
  ics.push(`DTEND;VALUE=DATE:${dtEnd}`);
  ics.push(`SUMMARY:${ev.name}`);
  ics.push(`DESCRIPTION:${(ev.description || '').replace(/\r?\n/g, ' ')}`);
  ics.push(`CATEGORIES:${ev.scope.toUpperCase()},${(ev.category || 'OBSERVANCE').toUpperCase()}`);
  ics.push('STATUS:CONFIRMED');
  ics.push('TRANSP:TRANSPARENT');
  ics.push('END:VEVENT');
});
ics.push('END:VCALENDAR');

fs.writeFileSync(path.join(baseDir, 'the_electricity_hub_2026_events.ics'), ics.join('\r\n'), 'utf8');
console.log('Written the_electricity_hub_2026_events.ics');

// 3. Generate CSV
const csvRows = ['Date,Observance Name,Pillar / Scope,Category,Official,Description,Source'];
resolved2026.forEach(ev => {
  const escapeCsv = (str) => '"' + String(str || '').replace(/"/g, '""') + '"';
  csvRows.push([
    ev.dateStr,
    escapeCsv(ev.name),
    ev.scope.toUpperCase(),
    escapeCsv(ev.category),
    ev.official ? 'YES' : 'NO',
    escapeCsv(ev.description),
    escapeCsv(ev.source_note)
  ].join(','));
});
fs.writeFileSync(path.join(baseDir, 'the_electricity_hub_2026_events.csv'), csvRows.join('\r\n'), 'utf8');
console.log('Written the_electricity_hub_2026_events.csv');

// 4. Generate Comprehensive Markdown Executive Schedule
const mdLines = [
  '# The Electricity Hub — 2026 Power Sector & Public Observance Schedule',
  '',
  '> **Credible Energy Intelligence, Continental Transition Milestones & Statutory Public Observances**  ',
  `> *Total Observances:* **${resolved2026.length} Events** across Nigeria, Energy Sector, African Union/ECOWAS, and Global UN Days.`,
  '',
  '| Date | Observance | Pillar / Layer | Category | Official | Description |',
  '| :--- | :--- | :--- | :--- | :---: | :--- |'
];

resolved2026.forEach(ev => {
  const scopeBadge = ev.scope === 'energy' ? '⚡ Energy Sector'
    : ev.scope === 'nigeria' ? '🇳🇬 Nigeria'
    : ev.scope === 'africa' ? '🌍 Africa / AU'
    : '🌐 Global / UN';
  
  const officialBadge = ev.official ? '✅ Gazetted' : 'ℹ️ Observance';
  const cleanDesc = (ev.description || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  mdLines.push(`| **${ev.dateStr}** | **${ev.name}** | ${scopeBadge} | \`${ev.category || 'observance'}\` | ${officialBadge} | ${cleanDesc} |`);
});

fs.writeFileSync(path.join(baseDir, 'THE_ELECTRICITY_HUB_2026_SCHEDULE.md'), mdLines.join('\n'), 'utf8');
console.log('Written THE_ELECTRICITY_HUB_2026_SCHEDULE.md');
