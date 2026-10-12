// Visitor counter (a Vercel Function at /api/visits), shown in the footer by
// src/components/ui/VisitorCount.jsx.
//
// Storage is one number in an Upstash Redis database, connected to the project
// in Vercel (Storage → Upstash Redis), which adds the KV_REST_API_* variables.
//
// Nothing about visitors is kept. So that one person can't count twice in a
// day, a one-way hash of their IP address (salted with the secret database
// token, so it can't be reversed or matched elsewhere) is remembered for 24
// hours, then Redis deletes it.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TOTAL = 'portfolio:visitors';
const ONE_DAY = 60 * 60 * 24;

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

async function todaysHash(request) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${REDIS_TOKEN}|${day}|${ip}`));
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Read the total.
export async function GET() {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: 'The counter is not set up.' }, 503);
  try {
    const [total] = await redis(['GET', TOTAL]);
    return json({ visitors: Number(total) || 0 });
  } catch {
    return json({ error: 'The counter is unavailable.' }, 502);
  }
}

// Count a new visitor (once per person per day), then return the total.
export async function POST(request) {
  if (!REDIS_URL || !REDIS_TOKEN) return json({ error: 'The counter is not set up.' }, 503);
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'Forbidden' }, 403);
  try {
    const seen = `portfolio:seen:${await todaysHash(request)}`;
    const [fresh, total] = await redis(['SET', seen, '1', 'NX', 'EX', String(ONE_DAY)], ['GET', TOTAL]);
    if (fresh !== 'OK') return json({ visitors: Number(total) || 0 });
    const [next] = await redis(['INCR', TOTAL]);
    return json({ visitors: Number(next) });
  } catch {
    return json({ error: 'The counter is unavailable.' }, 502);
  }
}
