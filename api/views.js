// Profile views counter (a Vercel Function at /api/views), shown in the hero by
// src/components/ui/ProfileViews.jsx.
//
// Storage is an Upstash Redis database connected to the project in Vercel
// (Storage → Upstash for Redis), which adds the KV_REST_API_* settings. It keeps
// three kinds of numbers: total views, unique visitors and views per day (for
// the last-7-days chart; each day is kept 40 days).
//
// Nothing about visitors is kept. So that refreshing can't inflate the numbers,
// a one-way hash of the visitor's IP address (salted with the secret database
// token, so it can't be reversed or matched elsewhere) is remembered briefly:
// 30 minutes for a view, 24 hours for a visitor. Then Redis deletes it.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEYS = {
  views: 'portfolio:views',
  visitors: 'portfolio:visitors',
  day: (date) => `portfolio:views:${date}`,
};
const VIEW_GAP = 30 * 60;
const VISITOR_GAP = 24 * 60 * 60;
const KEEP_DAY = 40 * 24 * 60 * 60;
const TIME_ZONE = 'Asia/Manila'; // "today" is a Philippine day

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Several commands in one request, using Upstash's REST pipeline.
async function redis(...commands) {
  const response = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`Redis responded ${response.status}`);
  return (await response.json()).map((reply) => reply.result);
}

// The last seven days as YYYY-MM-DD, oldest first, ending today.
function lastWeek(now = Date.now()) {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(now - (6 - i) * 86_400_000).toLocaleDateString('en-CA', { timeZone: TIME_ZONE }),
  );
}

async function visitorHash(request) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${REDIS_TOKEN}|${lastWeek().at(-1)}|${ip}`));
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Runs `updates` first (if any), then reads every number in the same request.
async function stats(updates = []) {
  const days = lastWeek();
  const replies = await redis(...updates, ['GET', KEYS.views], ['GET', KEYS.visitors], ['MGET', ...days.map(KEYS.day)]);
  const [views, visitors, perDay] = replies.slice(updates.length);
  return {
    views: Number(views) || 0,
    visitors: Number(visitors) || 0,
    days: days.map((date, i) => ({ date, views: Number(perDay?.[i]) || 0 })),
  };
}

// Read the numbers.
export async function GET() {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: 'The counter is not set up.' }, 503);
  try {
    return json(await stats());
  } catch {
    return json({ error: 'The counter is unavailable.' }, 502);
  }
}

// Count a view (and, on a browser's first visit, a visitor), then return the numbers.
// Body: { "firstVisit": true | false }.
export async function POST(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: 'The counter is not set up.' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'Forbidden' }, 403);

  let firstVisit = false;
  try {
    firstVisit = (await request.json())?.firstVisit === true;
  } catch {
    // No body: count the view only.
  }

  try {
    const id = await visitorHash(request);
    const checks = [['SET', `portfolio:seen:view:${id}`, '1', 'NX', 'EX', String(VIEW_GAP)]];
    if (firstVisit) checks.push(['SET', `portfolio:seen:visitor:${id}`, '1', 'NX', 'EX', String(VISITOR_GAP)]);
    const [newView, newVisitor] = await redis(...checks);

    const today = KEYS.day(lastWeek().at(-1));
    const updates = [];
    if (newView === 'OK') updates.push(['INCR', KEYS.views], ['INCR', today], ['EXPIRE', today, String(KEEP_DAY)]);
    if (newVisitor === 'OK') updates.push(['INCR', KEYS.visitors]);
    return json({ ...(await stats(updates)), counted: newView === 'OK' });
  } catch {
    return json({ error: 'The counter is unavailable.' }, 502);
  }
}
