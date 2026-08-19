# Tsunagu 官網

> 接手開發請先讀 [CLAUDE.md](./CLAUDE.md)——那裡有完整的決策脈絡、禁止事項與上線前待辦。

台湾人と日本企業をツナグ — 官方網站。Astro + GitHub Pages。

## 開發

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 產出到 dist/
npm run preview
```

## 部署

推到 `main` 就會自動部署（`.github/workflows/deploy.yml`）。
第一次要先到 repo 的 **Settings → Pages → Source** 選 **GitHub Actions**。

`astro.config.mjs` 開頭有兩行要依實際情況改：

| 情況 | `site` | `base` |
|---|---|---|
| 自訂網域，例如 tsunagu.tw | `https://tsunagu.tw` | `/` |
| `<帳號>.github.io/<repo>` | `https://<帳號>.github.io` | `/<repo>` |

## 內容怎麼改（不用碰程式碼）

| 要改什麼 | 改哪裡 |
|---|---|
| 企業／品牌 | `src/content/companies/*.md` — 一個品牌一個檔 |
| 學長姐分享 | `src/content/stories/*.md` — 內容摘自 IG 原文，每篇都有 `igCode` 回連原貼文 |
| 交流會場次 | `src/data/events.json` — 新增一場加在 `events` 最前面；日期過了會自動移到「舉辦紀錄」 |
| 設計 token（顏色、字體、圓角） | `src/styles/global.css` 最上方 `:root` |

企業 frontmatter 欄位定義與驗證規則在 `src/content.config.ts`（Zod schema，寫錯會在 build 時報錯）。

## 上線前的待辦

這些地方在程式碼裡都標了 `TODO` 或在畫面上顯示黃色的「【待補】」提示：

1. **Footer 的許可資訊**（`src/components/Footer.astro`）
   依《私立就業服務機構許可及管理辦法》第 35 條，就業服務業務廣告應載明
   機構名稱、許可證字號、機構地址及電話。**填持照合作方的資料。**
2. **Google 表單網址**
   - 交流會報名：每一場的表單都不同，填在 `src/data/events.json` 每筆的 `signupUrl`。
   - Profile／履歷收件：`src/pages/apply/index.astro` 的 `FORM_URL` 常數。
   官網本身不蒐集個資。
3. **隱私權政策與跨境傳輸同意條款** — `src/pages/apply/index.astro`
4. **角色圖來源檔** — 已從提供的 761px PNG 去背並切成
   `src/assets/tsunagu-characters.png`（角色）、`tsunagu-wordmark.png`（字標）、
   `tsunagu-lockup.png`（合圖），另在 `public/img/` 產出 og image 與 icon。
   **原圖只有 761px**，首頁最大顯示 380px（約 2 倍密度）勉強夠用；
   若之後拿得到 SVG 或更大的 PNG，直接覆蓋 `src/assets/` 三個檔即可。
   header 的 TSUNAGU 字樣沒有用品牌字標圖 —— 品牌字標是淺粉／淺藍，
   在淺色 header 上對比只有約 1.4:1，讀不清楚。字標圖只用在 footer 這種裝飾位置。
5. ~~字體~~ — 已定案，沿用簡報用字（BIZ UDPGothic + Noto Sans TC + Jost），全部來自 Google Fonts。
6. **交流會場次** — 下一場公布後加進 `src/data/events.json`
7. **企業 logo 授權** — 目前卡片用漸層底 + 品牌名文字，尚未使用任何企業 logo
8. **學長姐的轉載同意** — 內容摘自 Tsunagu IG 上前輩們的原文分享並附原文連結。
   轉載到官網是否需要另外向本人取得同意，請確認。照片一律未使用。
9. **媒體報導連結** — `src/pages/about/index.astro`，用外連不貼截圖

## 資料來源

企業與數據整理自《第76,77回 台北交流会スライド 2026.4.18【途中】.pdf》。
簡報檔名標示「途中」＝未定稿，數字與企業清單請以最新版覆核。
