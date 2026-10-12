import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Adds canonical and Open Graph URL tags once VITE_SITE_URL is known.
// Social platforms require absolute URLs, so the tags are skipped when it is empty.
function siteUrlTags(siteUrl) {
  return {
    name: 'site-url-tags',
    transformIndexHtml() {
      if (!siteUrl) return [];
      const base = siteUrl.replace(/\/+$/, '');
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: `${base}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: `${base}/og-image.jpg` }, injectTo: 'head' },
      ];
    },
  };
}

// The live site, where the real profile views counter runs (api/views.js on Vercel).
const LIVE_SITE = 'https://felixmigs.vercel.app';

// On this computer (`npm run dev` and `npm run preview`) the views chip shows
// the real numbers from the live site. Read only: visits here are never counted,
// so testing doesn't inflate the count. If the live counter isn't set up or
// can't be reached, it answers with an empty reply and the chip stays hidden.
function liveViews(siteUrl) {
  const handle = async (req, res, next) => {
    if (!req.url?.startsWith('/api/views')) return next();
    const send = (status, body) => {
      res.statusCode = status;
      res.setHeader('Cache-Control', 'no-store');
      if (body === undefined) return res.end();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(body));
    };
    // Nothing to show (live counter not set up or unreachable): an empty reply,
    // not an error, so the browser console stays clean.
    const nothing = () => send(204);
    try {
      const response = await fetch(`${siteUrl}/api/views`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        nothing();
        return;
      }
      send(200, { ...(await response.json()), counted: false });
    } catch {
      nothing();
    }
  };

  return {
    name: 'live-profile-views',
    // Block bodies on purpose: a function returned from these hooks would run as another hook.
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const siteUrl = env.VITE_SITE_URL?.trim();
  return {
    plugins: [react(), siteUrlTags(siteUrl), liveViews((siteUrl || LIVE_SITE).replace(/\/+$/, ''))],
  };
});
