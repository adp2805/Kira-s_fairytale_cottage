// ─────────────────────────────────────────────────────────────
//  Netlify Function: get-availability
//  Citește fișierele iCal de la Booking.com și Airbnb,
//  parsează datele rezervate și le returnează site-ului.
// ─────────────────────────────────────────────────────────────

const https = require('https');
const http  = require('http');

// ── Fetch URL as text ────────────────────────────────────────
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ── Parse iCal text → array of { start, end } date strings ──
function parseICal(text) {
  const events = [];
  const lines  = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvent = false;
  let dtStart = null;
  let dtEnd   = null;

  for (const raw of lines) {
    const line = raw.trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      dtStart = null;
      dtEnd   = null;
    } else if (line === 'END:VEVENT') {
      if (dtStart && dtEnd) {
        events.push({ start: dtStart, end: dtEnd });
      }
      inEvent = false;
    } else if (inEvent) {
      // DTSTART and DTEND can have timezone params: DTSTART;TZID=...:20260610
      if (line.startsWith('DTSTART')) {
        dtStart = extractDate(line);
      } else if (line.startsWith('DTEND')) {
        dtEnd = extractDate(line);
      }
    }
  }
  return events;
}

// ── Extract YYYY-MM-DD from iCal date value ──────────────────
function extractDate(line) {
  // Value is after the last colon
  const val = line.split(':').pop().trim();
  // Could be: 20260610 or 20260610T150000Z
  const d = val.substring(0, 8);
  if (d.length === 8 && /^\d{8}$/.test(d)) {
    return d.substring(0,4) + '-' + d.substring(4,6) + '-' + d.substring(6,8);
  }
  return null;
}

// ── Expand date range into individual days ───────────────────
function expandDays(start, end) {
  const days = [];
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end   + 'T00:00:00Z');
  const cur = new Date(s);
  // iCal DTEND is exclusive (checkout day is free), so we go up to but not including DTEND
  while (cur < e) {
    const y = cur.getUTCFullYear();
    const m = cur.getUTCMonth() + 1; // 1-based
    const d = cur.getUTCDate();
    days.push({ year: y, month: m, day: d });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

// ── Main handler ─────────────────────────────────────────────
exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=900' // cache 15 minutes
  };

  const bookingUrl = process.env.ICAL_BOOKING_URL || '';
  const airbnbUrl  = process.env.ICAL_AIRBNB_URL  || '';

  if (!bookingUrl && !airbnbUrl) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ bookedDays: [], source: 'no-urls-configured' })
    };
  }

  try {
    const fetches = [];
    if (bookingUrl) fetches.push(fetchText(bookingUrl).catch(() => ''));
    if (airbnbUrl)  fetches.push(fetchText(airbnbUrl).catch(() => ''));

    const results = await Promise.all(fetches);
    const allDays = [];

    for (const icalText of results) {
      if (!icalText) continue;
      const events = parseICal(icalText);
      for (const ev of events) {
        if (ev.start && ev.end) {
          const days = expandDays(ev.start, ev.end);
          allDays.push(...days);
        }
      }
    }

    // Deduplicate
    const seen = new Set();
    const unique = allDays.filter(d => {
      const key = `${d.year}-${d.month}-${d.day}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ bookedDays: unique, count: unique.length })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message, bookedDays: [] })
    };
  }
};
