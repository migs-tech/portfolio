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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react(), siteUrlTags(env.VITE_SITE_URL?.trim())],
  };
});
