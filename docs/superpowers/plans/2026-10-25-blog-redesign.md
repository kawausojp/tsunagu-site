# Tsunagu 網誌化改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 `docs/superpowers/specs/2026-10-25-blog-redesign-design.md`，把官網改成以前輩文章與實績總表為主的網誌，拿掉品牌頁與英文版，資料更新到 2026.10.18 簡報。

**Architecture:** 沿用 Astro 7 靜態站。stories collection 擴充為「IG 原文全文」，build 時用 zod 驗證標題／引言必須是原文子字串。首頁、/stories/ 共用一個文章列表元件（PostList），列表資料由 `site.ts` 的 `buildFeed()` 組合前輩分享、交流會紀錄、媒體報導三種來源。舊網址用靜態轉址頁保留。

**Tech Stack:** Astro 7、TypeScript、zod（astro:content）、Playwright（QA 截圖）、內建瀏覽器（讀 IG）。

**測試方式：** 本專案沒有單元測試框架。「測試」＝ (1) zod schema 在 build 時擋下錯誤資料、(2) `node node_modules/astro/bin/astro.mjs check`、(3) `npm run build`、(4) scratchpad 裡的 Playwright 檢查腳本（斷鏈、溢出、位移、截圖）。每個 Task 最後都要 build 通過才 commit。

**共通指令：**
```bash
export PATH="$HOME/.local/node/bin:$HOME/.local/gh/bin:$PATH"
npm run build                                   # 必須 Complete!
node node_modules/astro/bin/astro.mjs check     # 必須 0 errors
```

**CLAUDE.md 提交方式：** 工作目錄的 CLAUDE.md 有另一個 session 未提交的影片段落，不可提交。CLAUDE.md 的修改一律用「對 HEAD 版套用 → `git hash-object -w` → `git update-index --cacheinfo`」只暫存自己的修改（見 Task 15）。

---

## 檔案結構

| 檔案 | 責任 | 動作 |
|---|---|---|
| `src/content.config.ts` | stories schema（原文全文＋子字串驗證） | 改 |
| `src/content/stories/*.md` | 每位前輩一檔，IG 原文 | 全部重寫＋新增 |
| `src/data/events.json` | 場次 | 加第 92,93 回 |
| `src/data/results.json` | 實績總表資料（品牌、品類、人數、轉正、sourceSlide） | 新 |
| `src/lib/site.ts` | 數字、MEDIA、`storiesByVol()`、`buildFeed()`、`nextEvent()`；刪企業／en 相關 | 改 |
| `src/i18n/ui.ts` | 導覽、文章列表字串；刪 en | 改 |
| `src/components/PostList.astro` | 文章列表（主打＋分隔線清單＋分類分頁＋看更多） | 新 |
| `src/components/NextEvent.astro` | 下一場交流會卡（首頁、文章頁底部共用） | 新 |
| `src/components/Redirect.astro` | 轉址頁骨架 | 新 |
| `src/scripts/feed.js` | 分類切換與「看更多」 | 新 |
| `src/styles/feed.css` | 文章列表樣式 | 新 |
| `src/styles/page-story.css` | 前輩文章頁樣式 | 新 |
| `src/styles/page-results.css` | 實績總表樣式 | 新 |
| `src/pages/index.astro`、`ja/index.astro` | 首頁 | 改 |
| `src/pages/stories/index.astro`、`ja/stories/index.astro` | 前輩分享列表 | 改 |
| `src/pages/stories/[slug].astro`、`ja/stories/[slug].astro` | 前輩文章頁 | 新 |
| `src/pages/results/index.astro`、`ja/results/index.astro` | 實績總表 | 新 |
| `src/pages/about/*`、`events/*`（zh/ja） | 併入 support、拿掉收藏區 | 改 |
| `src/pages/companies/**`、`ja/companies/**`、`support`、`ja/support`、`en/**` | 轉址頁 | 改為轉址 |
| `CompanyCard`、`CategoryIcon`、`company-filter.ts`、`co-prefilter.js`、`back-to-list.ts`、`fit-names.js`、`save.js`、`saved-box.js`、`page-companies.css`、`page-company.css`、`page-support.css` | 品牌頁與收藏 | 刪 |

---

### Task 0: 本機待辦清單

- [ ] 在 `TASKS.md`（已列入 .git/info/exclude）寫入本計畫的 Task 1–16 清單，做完一項勾一項。

### Task 1: 收集 IG 前輩原文

**Files:** scratchpad `ig/<igCode>.txt`（原文快照，不進 repo）

- [ ] **Step 1:** 用內建瀏覽器逐一打開現有 14 篇 `https://www.instagram.com/p/<igCode>/`，關掉註冊提示（右上 ×），`get_page_text` 取得全文，存成 `ig/<igCode>.txt`。只讀，不按讚、不登入。
- [ ] **Step 2:** 找 14 篇以外的新前輩貼文：(a) 個人頁網格（未登入可見的範圍）、(b) WebSearch `"透過ツナグ介紹" instagram tw.tsunagu.jp`、(c) 已知貼文頁下方「更多貼文」。只收標題為「\ 透過ツナグ介紹🇯🇵在日打工中的台灣朋友/」系列者。
- [ ] **Step 3:** 讀不到全文的貼文列入回報清單（Blocked on me），不補寫。

### Task 2: stories schema（原文全文＋子字串驗證）

**Files:** Modify `src/content.config.ts`

- [ ] **Step 1:** 改 stories schema 為：

```ts
const para = z.array(z.string().min(1)).default([]);
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    name: z.string(),
    visa: z.enum(['打工度假', '留學', '留學生', '交換留學', '打工度假 → 工作簽證']),
    started: z.string().regex(/^\d{4}\.\d{2}$/),
    location: z.string(),
    company: z.string(),              // 品牌名（實績總表連結用），照 IG 寫法
    workplace: z.string(),            // IG 原文「工作地點：」整行，例：agete（誕生於日本的流行珠寶品牌）
    title: z.string(),                // 必須是 messages 內的子字串
    pull: z.string().optional(),      // 大字引言，必須是 messages／advice 內的子字串
    messages: para, advice: para,
    titleJa: z.string().optional(), pullJa: z.string().optional(),
    messagesJa: para, adviceJa: para, // IG「〜メッセージ日本語〜」原文；沒有就空
    igCode: z.string().regex(/^[A-Za-z0-9_-]{10,12}$/),
    igPosted: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).strict().superRefine((d, ctx) => {
    const zh = [...d.messages, ...d.advice].join('\n');
    const ja = [...d.messagesJa, ...d.adviceJa].join('\n');
    const need = (s: string | undefined, hay: string, path: string) => {
      if (s && !hay.includes(s)) ctx.addIssue({ code: 'custom', path: [path], message: `${path} 必須是 IG 原文的子字串（紅線 #1）` });
    };
    need(d.title, d.messages.join('\n'), 'title');
    need(d.pull, zh, 'pull');
    need(d.titleJa, ja, 'titleJa');
    need(d.pullJa, ja, 'pullJa');
    if ((d.titleJa || d.pullJa) && !ja) ctx.addIssue({ code: 'custom', path: ['messagesJa'], message: '有日文標題就要有日文原文' });
  }),
});
```

- [ ] **Step 2:** `npm run build` 預期**失敗**（現有 md 沒有 `workplace`／`title`、有 `lead`／`order`）——確認 zod 有在擋。

### Task 3: 重寫前輩 md

**Files:** `src/content/stories/*.md`（14 篇改寫＋Task 1 找到的新篇）

- [ ] **Step 1:** 由 `ig/<code>.txt` 逐篇產生 md：段落以空行切開，`messages`／`advice`／`messagesJa`／`adviceJa` 原樣保留標點與全形空白；`title` 從 Message 第一段原樣擷取一句（到句號或逗號前），`pull` 擷取一句最有代表性的原句。
- [ ] **Step 2:** 用腳本比對：每段文字都必須能在 `ig/<code>.txt` 中找到（`txt.includes(para)`），印出不符者。0 不符才繼續。
- [ ] **Step 3:** `npm run build` 至少 content 層通過（頁面層會在後續 Task 修）。
- [ ] **Step 4:** Commit「前輩分享改為 IG 原文全文…」。

### Task 4: site.ts 資料與工具函式

**Files:** Modify `src/lib/site.ts`、`src/data/events.json`；Create `src/data/results.json`

- [ ] **Step 1:** `HOME_STATS = { active: '177', fulltime: '39', toFulltime: '33', attendees: '3,329' }`；`CONTRACTED_COMPANIES = 43`；`SOURCE_DECK` 改 2026.10.18 版。
- [ ] **Step 2:** `MEDIA` 前面加 `{ name:{zh:'繊研新聞',ja:'繊研新聞'}, date:'2026.07.21', print:true }`（若查到線上版改填 `url`／`title`）。
- [ ] **Step 3:** events.json 最前面加：
```json
{ "no": "92,93", "date": "2026-11-14", "city": "高雄", "sessions": ["14:00–16:00", "16:30–18:30"],
  "signupUrl": "https://forms.gle/wJZ32V9gUYgoYUdU7", "venue": "Galaxy 教室 B", "address": "高雄市三民區九如二路255號12樓" }
```
- [ ] **Step 4:** 新增
```ts
export const storiesByVol = <T extends { data: { igPosted: string } }>(xs: T[]) =>
  [...xs].sort((a, b) => a.data.igPosted.localeCompare(b.data.igPosted)).map((s, i) => ({ ...s, vol: i + 1 }));
export type FeedItem =
  | { kind: 'story'; date: string; id: string; vol: number; story: any }
  | { kind: 'event'; date: string; no: string; city: string; ig: string }
  | { kind: 'media'; date: string; name: string; title?: string; url?: string; print?: boolean };
export function buildFeed(stories, lang: Lang): FeedItem[]  // 三種來源合併、日期新→舊；event 只收有 ig 的過去場次
export function nextEvent(): Event | undefined               // 今天以後最早的一場
```
- [ ] **Step 5:** 刪除只給企業頁用的函式（`relatedBrands`、`relatedStoriesFor`、`byPlacements`、`companyName`、`nameLang`、`CAT_LABEL` 中不再用者——以 `grep` 確認無引用再刪）與所有 `en` 欄位／型別。
- [ ] **Step 6:** results.json：依 10/18 簡報逐頁抽出「○名勤務／採用／活躍」的品牌，格式
```json
[{ "brand": "agete", "cat": "jewelry", "people": 13, "fulltime": 1, "sourceSlide": 52 }]
```
圖片頁用 Read（pages 參數）開圖核對；核對不了者不列並記錄。

### Task 5: 共用元件 PostList／NextEvent／feed.js

**Files:** Create `src/components/PostList.astro`、`src/components/NextEvent.astro`、`src/scripts/feed.js`、`src/styles/feed.css`

- [ ] PostList props：`items: FeedItem[]`、`lang`、`feature?: boolean`（第一篇前輩分享放大）、`tabs?: boolean`、`initial?: number`（預設 12）。markup：`<div data-feed>` 內有 `<ul class="tabs" role="group">`（按鈕 `data-cat`、`aria-pressed`，C 樣式），`<ol class="rows">` 每列 `data-cat`。超過 initial 的列加 `data-more`，`<noscript>` 下全部顯示。
- [ ] feed.js（inline、緊接列表後同步執行，不造成首次繪製後位移）：先藏 `data-more`、顯示「看更多」；分類按鈕切換 `hidden`；選中＝粗字＋3px `--sky-300` 底線。
- [ ] NextEvent props：`lang`、`variant: 'card' | 'mini'`。無下一場時顯示 IG 導流。

### Task 6: 前輩文章頁

**Files:** Create `src/pages/stories/[slug].astro`、`src/pages/ja/stories/[slug].astro`、`src/styles/page-story.css`

- [ ] 依規格 §5 與草圖實作。`getStaticPaths` 由 `storiesByVol` 產生，傳入 prev/next 與 related（同 company 優先、再依日期接近，取 3）。
- [ ] ja：`messagesJa` 有值時顯示日文原文與 `titleJa`／`pullJa`；否則顯示繁中並標「原文（繁體中国語）を掲載」，`lang="zh-Hant"`。
- [ ] 出處框文字：zh「本文為 Tsunagu Instagram YYYY.MM.DD 貼文原文，未經改寫。」ja「Tsunagu 公式 Instagram（YYYY.MM.DD）の投稿を原文のまま掲載しています。」

### Task 7: /stories/ 列表與首頁

**Files:** Modify `src/pages/stories/index.astro`、`ja/stories/index.astro`、`index.astro`、`ja/index.astro`、`src/styles/home.css`、`page-stories.css`

- [ ] /stories/：PostList（只有前輩分享、無分類分頁、全部顯示、第一篇放大）。
- [ ] 首頁：保留 hero、統計泡泡（四顆改為 177 活躍中／39 轉正職／3,329 參加／43 簽約企業）；新增 NextEvent card；PostList（feature、tabs、initial 12）；保留影片；刪企業區、焦點引言區、結尾 CTA。
- [ ] reveal.js 的 RULES 補上新元素（列表標子元素）。

### Task 8: 實績總表

**Files:** Create `src/pages/results/index.astro`、`ja/results/index.astro`、`src/styles/page-results.css`

- [ ] 頁首四數字＋說明＋出處；表格（品牌／品類／人數／轉正）依人數排序，品類分頁（同 feed.js 的 C 樣式，可共用腳本以 `data-feed` 模式）；有前輩文章的品牌連到文章。手機改為兩行列。

### Task 9: about／events／apply

- [ ] about：把 support 的內容段落搬入（標題「我們怎麼幫你」保留為 h2）；媒體清單用新的 MEDIA。
- [ ] events：刪 saved-box markup 與 `saved-box.js` import；JOIN_STEPS 若提到品牌目錄就改寫為不提（只改 UI 文案，不涉引言）。
- [ ] apply：與簡報 p187–188 對照，數字或要點不同才改。

### Task 10: 拿掉品牌頁、收藏、英文版，加轉址

- [ ] Create `src/components/Redirect.astro`（props: `to`, `lang`）：`<meta http-equiv="refresh" content="0;url=…">`、canonical、`robots noindex`、一行連結。
- [ ] `companies/index.astro`、`companies/[slug].astro`（getStaticPaths 仍讀 companies collection）、ja 同；`support/index.astro`、`ja/support/index.astro` 改為 Redirect。
- [ ] 刪 `src/pages/en/**`，新增 `src/pages/en/[...path].astro`：getStaticPaths 列出舊的 42 個 en 路徑 → 對應 zh 路徑（companies → results，support → about）。
- [ ] 刪 CompanyCard、CategoryIcon（確認無引用）、company-filter.ts、co-prefilter.js、back-to-list.ts、fit-names.js、save.js、saved-box.js、page-companies.css、page-company.css、page-support.css；Base.astro 移除對應 import；vt.js 拿掉企業卡命名（若整檔無用則刪）。

### Task 11: Header／Footer／ui.ts／hreflang

- [ ] 導覽：文章（/stories/）、實績（/results/）、報名交流會、準備出發、關於。語言選單只剩繁中／日本語；hreflang 只 zh、ja、x-default。

### Task 12: 色彩規則

- [ ] `grep -rn "background:var(--sky-300)"` 全站改為線條／底線（page-stories 圓點等）。

### Task 13: 建置驗證

- [ ] `astro check` 0 errors；`npm run build` Complete；頁數記錄。
- [ ] 斷鏈腳本：所有 dist HTML 的站內 href 都存在。
- [ ] `grep -rnE "募集|招募中|徵才|在徵" dist --include=*.html`：品牌招募敘述為 0。
- [ ] 3 寬度（390／820／1440）截圖：首頁、文章頁、實績頁、events；無橫向溢出。
- [ ] 位移稽核（分類切換、看更多、選單）與 CLS。

### Task 14: Commit 與推送

- [ ] 分段 commit（內容、元件、頁面、刪除與轉址），最後 push main。

### Task 15: CLAUDE.md

- [ ] 用 HEAD 版套用修改的方式只暫存自己的段落：刪企業卡／品牌頁／收藏／英文版相關規則，加入本規格的決定、新資料來源（10/18 簡報頁碼）、IG 原文驗證規則、實績總表收錄規則、「不用實心粉藍底」。

### Task 16: Artifact 鏡像

- [ ] `rm -rf .artifact && python3 scripts/mk-artifact.py .artifact`；`Artifact list scope:files` 與本地整組比對；新增的全傳、本地沒有的設 null；HTML 全部重傳。
