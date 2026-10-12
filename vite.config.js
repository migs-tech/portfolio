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

// A stand-in for the profile views counter (api/views.js) on this computer, so
// the hero's views chip shows up in `npm run dev` and `npm run preview`. The
// numbers are samples kept in memory, and your own visits add to them. It's
// never part of the built site: online, the real counter on Vercel answers.
function localViews() {
  const sample = [6, 11, 8, 14, 9, 12, 0]; // views on each of the last 7 days, today last
  const state = { views: 248, visitors: 131 };
  const lastWeek = () =>
    Array.from({ length: 7 }, (_, i) =>
      new Date(Date.now() - (6 - i) * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
    );

  const handle = (req, res, next) => {
    if (!req.url?.startsWith('/api/views')) return next();
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const counted = req.method === 'POST';
      if (counted) {
        state.views += 1;
        sample[6] += 1;
        try {
          if (JSON.parse(body || '{}').firstVisit) state.visitors += 1;
        } catch {
          // No body: a view only.
        }
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(
        JSON.stringify({
          ...state,
          days: lastWeek().map((date, i) => ({ date, views: sample[i] })),
          ...(counted ? { counted } : {}),
        }),
      );
    });
  };

  return {
    name: 'local-profile-views',
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
  return {
    plugins: [react(), siteUrlTags(env.VITE_SITE_URL?.trim()), localViews()],
  };
});
