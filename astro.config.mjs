// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ─── 部署設定 ───────────────────────────────────────────────
// GitHub Pages 有兩種情況，改這裡就好：
//   1. 自訂網域 或 <帳號>.github.io  → site: 'https://tsunagu.tw',  base: '/'
//   2. <帳號>.github.io/<repo>       → site: 'https://<帳號>.github.io', base: '/<repo>'
// ────────────────────────────────────────────────────────────
export default defineConfig({
  site: process.env.TSUNAGU_SITE_URL || 'https://kawausojp.github.io',
  base: '/tsunagu-site',
  outDir: './dist',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap({
    // sitemap 裡也標 hreflang（head 已有，這裡是免費加分）
    i18n: { defaultLocale: 'zh', locales: { zh: 'zh-Hant', ja: 'ja', en: 'en' } },
  })],
  // Vite 8 預設輸出 `(width<=720px)` range 語法，Safari <16.4（iOS 15 停在此）會整段忽略而失去響應式；
  // IG 導流的手機客群值得多撐幾年，退回傳統 min/max-width 語法（其餘 CSS 不受影響）
  vite: { build: { cssTarget: ['safari15', 'chrome100'] } },
});
