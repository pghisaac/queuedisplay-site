// Shared by the TV page and the admin page.
(function () {
  'use strict';

  var cfg = window.QD_CONFIG || {};
  var tz = cfg.TIMEZONE || 'Asia/Singapore';

  // Current date / time-of-day / weekday in the configured timezone.
  function nowParts(date) {
    date = date || new Date();
    var out = { date: '', time: '', day: 0 };
    try {
      var parts = {};
      new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short'
      }).formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
      out.date = parts.year + '-' + parts.month + '-' + parts.day;
      out.time = parts.hour + ':' + parts.minute;
      out.day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday];
    } catch (e) {
      // Fallback: the device's own clock
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      out.date = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
      out.time = pad(date.getHours()) + ':' + pad(date.getMinutes());
      out.day = date.getDay();
    }
    return out;
  }

  function hhmm(t) { return t ? String(t).slice(0, 5) : ''; }

  // True if this media row should be playing right now.
  function isActive(m, now) {
    now = now || nowParts();
    if (!m.enabled) return false;
    if (m.start_date && now.date < m.start_date) return false;
    if (m.end_date && now.date > m.end_date) return false;
    if (m.days && m.days.length && m.days.indexOf(now.day) === -1) return false;

    var s = hhmm(m.start_time), e = hhmm(m.end_time);
    if (s && e) {
      if (s <= e) { if (now.time < s || now.time > e) return false; }
      else { if (now.time < s && now.time > e) return false; } // window crosses midnight
    } else if (s) {
      if (now.time < s) return false;
    } else if (e) {
      if (now.time > e) return false;
    }
    return true;
  }

  // Short human description of a row's schedule.
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function describe(m) {
    var bits = [];
    if (m.start_date || m.end_date) bits.push((m.start_date || '…') + ' → ' + (m.end_date || '…'));
    if (m.start_time || m.end_time) bits.push((hhmm(m.start_time) || '00:00') + '–' + (hhmm(m.end_time) || '23:59'));
    if (m.days && m.days.length && m.days.length < 7) {
      bits.push(m.days.slice().sort().map(function (d) { return DAY[d]; }).join(' '));
    }
    return bits.length ? bits.join(' · ') : 'Always';
  }

  window.QDSchedule = { nowParts: nowParts, isActive: isActive, describe: describe, timezone: tz };
})();
