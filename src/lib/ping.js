// Times how long a site takes to answer, measured from the visitor's browser.
// A no-cors request can't read the response, so this only tells whether the
// site answered at all and how quickly; that is all the "Live" badges claim.
export async function ping(url, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const start = performance.now();
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    return { up: true, ms: Math.round(performance.now() - start) };
  } catch {
    return { up: false, ms: null };
  } finally {
    clearTimeout(timer);
  }
}
