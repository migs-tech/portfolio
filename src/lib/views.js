// Talks to the profile views counter (api/views.js).
//
// A visit counts once per browser session, so refreshing or moving around the
// page doesn't add views; the first visit from a browser also counts as a
// visitor. Automated browsers (tests, bots that say so) only read. Everything
// resolves to null when the counter isn't available (for example in local
// development), so callers can simply hide it.
const VIEWED = 'portfolio:viewed'; // sessionStorage: this visit was counted
const VISITED = 'portfolio:visited'; // localStorage: this browser was counted as a visitor
let pageLoad = null; // one counting request per page load, however many callers ask

function flag(storage, key) {
  try {
    return window[storage].getItem(key) === '1';
  } catch {
    return false;
  }
}

function setFlag(storage, key) {
  try {
    window[storage].setItem(key, '1');
  } catch {
    // Storage blocked: the server still counts each person once per half hour.
  }
}

async function request(method, body) {
  try {
    const response = await fetch('/api/views', {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    // Always read the reply, even an error, so the request finishes; an unread
    // body keeps it open and the page never counts as fully loaded.
    const text = await response.text();
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return null;
    const stats = JSON.parse(text);
    return Number.isFinite(stats?.views) && Array.isArray(stats.days) ? stats : null;
  } catch {
    return null;
  }
}

// Counts this visit (when it should) and resolves to
// { views, visitors, days: [{ date, views }] × 7, counted }.
export function loadViews() {
  if (pageLoad) return pageLoad;
  const count = !navigator.webdriver && !flag('sessionStorage', VIEWED);
  pageLoad = (count ? request('POST', { firstVisit: !flag('localStorage', VISITED) }) : request('GET')).then((stats) => {
    if (stats && count) {
      setFlag('sessionStorage', VIEWED);
      setFlag('localStorage', VISITED);
    }
    return stats;
  });
  return pageLoad;
}

// The latest numbers, without counting anything.
export const refreshViews = () => request('GET');
