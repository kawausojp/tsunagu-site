// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isSitesBuild = process.env.TSUNAGU_DEPLOY_TARGET === 'sites';

// ─── 部署設定 ───────────────────────────────────────────────
// GitHub Pages 有兩種情況，改這裡就好：
//   1. 自訂網域 或 <帳號>.github.io  → site: 'https://tsunagu.tw',  base: '/'
//   2. <帳號>.github.io/<repo>       → site: 'https://<帳號>.github.io', base: '/<repo>'
// ────────────────────────────────────────────────────────────
export default defineConfig({
  site: process.env.TSUNAGU_SITE_URL || 'https://kawausojp.github.io',
  base: isSitesBuild ? '/' : '/tsunagu-site',
  outDir: isSitesBuild ? './astro-dist' : './dist',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
