// Talks to the visitor counter (api/visits.js). Each browser is counted once:
// after that it only reads the total. Automated browsers (tests, bots that say
// so) never count. Resolves to null when the counter isn't available, for
// example in local development, so callers can just hide it.
const COUNTED = 'portfolio:counted';
let counting = null; // one counting request per page load, however many callers ask

function alreadyCounted() {
  try {
    return localStorage.getItem(COUNTED) === '1';
  } catch {
    return false;
  }
}

function rememberCounted() {
  try {
    localStorage.setItem(COUNTED, '1');
  } catch {
    // Private mode or storage blocked: the server still counts each person once a day.
  }
}

async function request(method) {
  try {
    const response = await fetch('/api/visits', { method, headers: { Accept: 'application/json' } });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return null;
    const { visitors } = await response.json();
    return Number.isFinite(visitors) ? visitors : null;
  } catch {
    return null;
  }
}

export function fetchVisitors({ count = true } = {}) {
  if (count && (counting || (!alreadyCounted() && !navigator.webdriver))) {
    counting ??= request('POST').then((visitors) => {
      if (visitors !== null) rememberCounted();
      return visitors;
    });
    return counting;
  }
  return request('GET');
}
