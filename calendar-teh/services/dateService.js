/**
 * Date computation service for holiday and observance calculations.
 * Supports:
 * - Fixed Gregorian dates (e.g. Oct 1, Jan 26)
 * - Programmatic Easter computation (Good Friday, Easter Monday) via Meeus/Jones/Butcher algorithm
 * - Lunar Islamic date resolution with astronomical projection & NSCIA moon-sighting overrides
 */

const fs = require('fs');
const path = require('path');

const LUNAR_FILE = path.join(__dirname, '../data/lunar_overrides.json');

function getLunarOverrides() {
  try {
    if (fs.existsSync(LUNAR_FILE)) {
      const data = fs.readFileSync(LUNAR_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading lunar overrides:', err);
  }
  return { years: {} };
}

function saveLunarOverrides(data) {
  try {
    fs.writeFileSync(LUNAR_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving lunar overrides:', err);
    return false;
  }
}

/**
 * Computes Western Easter Sunday using the Meeus/Jones/Butcher Gregorian algorithm
 * Accurate for any Gregorian year
 */
function getEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Resolves lunar date for given year and event ID
 */
function resolveLunarDate(year, eventId) {
  const overrides = getLunarOverrides();
  const yearStr = String(year);
  if (overrides.years && overrides.years[yearStr] && overrides.years[yearStr][eventId]) {
    const item = overrides.years[yearStr][eventId];
    return {
      month: item.month,
      day: item.day,
      source: item.source || 'NSCIA Moon-Sighting / Astronomical'
    };
  }

  // Fallback approximate astronomical estimation based on 2026 anchor
  // 1 lunar year ~ 354.367 days (approximately shifts 10-11 days earlier per solar year)
  const diffYears = year - 2026;
  const anchors = {
    'ng-eid-al-fitr': new Date(Date.UTC(2026, 2, 20)), // March 20, 2026
    'ng-eid-al-adha': new Date(Date.UTC(2026, 4, 27)), // May 27, 2026
    'ng-eid-el-maulud': new Date(Date.UTC(2026, 7, 26)) // August 26, 2026
  };

  if (anchors[eventId]) {
    const anchor = anchors[eventId];
    const shiftDays = Math.round(diffYears * -10.875);
    const estimated = new Date(anchor.getTime() + shiftDays * 86400000);
    return {
      month: estimated.getUTCMonth() + 1,
      day: estimated.getUTCDate(),
      source: 'Calculated Astronomical Estimation (Pending Official Moon Sighting)'
    };
  }

  return null;
}

/**
 * Resolves all raw event definitions for a specific calendar year.
 */
function resolveEventsForYear(events, year) {
  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter.getTime() - 2 * 86400000);
  const easterMonday = new Date(easter.getTime() + 1 * 86400000);

  return events.map(ev => {
    let resolvedMonth = ev.month;
    let resolvedDay = ev.day;
    let resolutionNote = null;

    if (ev.recurrence === 'computed') {
      if (ev.computation_rule === 'easter_minus_2') {
        resolvedMonth = goodFriday.getUTCMonth() + 1;
        resolvedDay = goodFriday.getUTCDate();
        resolutionNote = `Computed for ${year} via Astronomical Easter Algorithm`;
      } else if (ev.computation_rule === 'easter_plus_1') {
        resolvedMonth = easterMonday.getUTCMonth() + 1;
        resolvedDay = easterMonday.getUTCDate();
        resolutionNote = `Computed for ${year} via Astronomical Easter Algorithm`;
      }
    } else if (ev.recurrence === 'lunar') {
      const lunar = resolveLunarDate(year, ev.id);
      if (lunar) {
        resolvedMonth = lunar.month;
        resolvedDay = lunar.day;
        resolutionNote = lunar.source;
      }
    } else if (ev.recurrence === 'variable' && ev.year_specific_dates && ev.year_specific_dates[String(year)]) {
      const spec = ev.year_specific_dates[String(year)];
      resolvedMonth = spec.month;
      resolvedDay = spec.day;
      resolutionNote = spec.source || 'Government Announced Special Gazette';
    }

    if (!resolvedMonth || !resolvedDay) {
      return null;
    }

    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(resolvedMonth)}-${pad(resolvedDay)}`;

    return {
      ...ev,
      year,
      month: resolvedMonth,
      day: resolvedDay,
      dateStr,
      resolutionNote
    };
  }).filter(Boolean);
}

/**
 * Calculates calendar day difference (targetDate - fromDate) in integer days
 */
function getDaysDifference(targetDateStr, fromDateStr) {
  const [tY, tM, tD] = targetDateStr.split('-').map(Number);
  const [fY, fM, fD] = fromDateStr.split('-').map(Number);

  const tUtc = Date.UTC(tY, tM - 1, tD);
  const fUtc = Date.UTC(fY, fM - 1, fD);

  const diffMs = tUtc - fUtc;
  return Math.round(diffMs / 86400000);
}

module.exports = {
  getEasterSunday,
  resolveLunarDate,
  resolveEventsForYear,
  getDaysDifference,
  getLunarOverrides,
  saveLunarOverrides
};
