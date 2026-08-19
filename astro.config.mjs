// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ─── 部署設定 ───────────────────────────────────────────────
// GitHub Pages 有兩種情況，改這裡就好：
//   1. 自訂網域 或 <帳號>.github.io  → site: 'https://tsunagu.tw',  base: '/'
//   2. <帳號>.github.io/<repo>       → site: 'https://<帳號>.github.io', base: '/<repo>'
// ────────────────────────────────────────────────────────────
export default defineConfig({
  site: 'https://tw-tsunagu.github.io',
  base: '/',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
