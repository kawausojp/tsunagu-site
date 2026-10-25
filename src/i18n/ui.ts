// 雙語 UI 字典（繁中母版＋日文；英文版 2026-10-25 網誌化改版時拿掉）：只放「元件層」共用字串（導覽、footer、文章列表）。
// 頁面內容不走字典——ja 頁是獨立檔案，文案直接寫在該頁（維護見 CLAUDE.md）。
export type Lang = 'zh' | 'ja';

export const LANG_META: Record<Lang, { label: string; short: string; htmlLang: string; prefix: string }> = {
  zh: { label: '繁體中文', short: '繁中', htmlLang: 'zh-Hant', prefix: '' },
  ja: { label: '日本語', short: '日本語', htmlLang: 'ja', prefix: '/ja' },
};

export const ui = {
  zh: {
    // 2026-10-25：主辦方「品牌專區先不要做」→ 合作企業拿掉；「我們怎麼幫你」併入關於
    nav: [
      { path: '/stories', label: '前輩分享' },
      { path: '/results', label: '實績' },
      { path: '/apply', label: '準備出發' },
      { path: '/about', label: '關於 Tsunagu' },
    ],
    signup: '報名交流會',
    home: 'ツナグ Tsunagu 首頁',
    mainMenu: '主選單',
    langMenu: '切換語言',
    skip: '跳到主要內容',
    footerSite: '網站',
    footerContact: '聯絡',
    newWindow: '（另開新視窗）',
    footerLinks: [
      { path: '/events', label: '報名交流會' },
      { path: '/stories', label: '前輩分享' },
      { path: '/results', label: '實績' },
      { path: '/apply', label: '準備出發' },
      { path: '/about', label: '關於 Tsunagu' },
    ],
    footerTagline: '把台灣的好人才，牽到日本。',
    footerFree: '參加交流會與工作媒合，對台灣的各位全程免費。',
    organizer: '活動主辦：智囊和夥伴有限公司（Brain & Partner Taiwan Inc.）',
    feed: {
      all: '全部', story: '前輩分享', event: '交流會紀錄', media: '媒體報導',
      tabsLabel: '文章分類', more: '看更多文章', read: '閱讀全文',
      igRecap: '在 Instagram 看紀錄', original: '看原文', print: '紙本刊載',
      eventTitle: (no: string, city: string) => `第 ${no} 回 ${city}交流會`,
      sessions: (n: number) => `${n} 場`,
    },
  },
  ja: {
    nav: [
      { path: '/stories', label: '先輩の声' },
      { path: '/results', label: '実績' },
      { path: '/apply', label: '出発準備' },
      { path: '/about', label: 'ツナグについて' },
    ],
    signup: '交流会に申し込む',
    home: 'ツナグ Tsunagu ホーム',
    mainMenu: 'メインメニュー',
    langMenu: '言語を切り替える',
    skip: '本文へスキップ',
    footerSite: 'サイト',
    footerContact: 'お問い合わせ',
    newWindow: '（新しいウィンドウで開きます）',
    footerLinks: [
      { path: '/events', label: '交流会に申し込む' },
      { path: '/stories', label: '先輩の声' },
      { path: '/results', label: '実績' },
      { path: '/apply', label: '出発準備' },
      { path: '/about', label: 'ツナグについて' },
    ],
    footerTagline: '台湾の優秀な人材を、日本へ。',
    footerFree: '交流会への参加も就職マッチングも、台湾の皆さまはすべて無料でご利用いただけます。',
    organizer: '主催：Brain & Partner Taiwan Inc.（智囊和夥伴有限公司）',
    feed: {
      all: 'すべて', story: '先輩の声', event: '交流会レポート', media: 'メディア掲載',
      tabsLabel: '記事のカテゴリー', more: 'もっと見る', read: '続きを読む',
      igRecap: 'Instagram でレポートを見る', original: '記事を読む', print: '紙面掲載',
      eventTitle: (no: string, city: string) => `第 ${no} 回 ${city}交流会`,
      sessions: (n: number) => `${n} 回`,
    },
  },
} as const;

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 產生指定語言下的站內連結（含 base 與語言前綴） */
export const href = (lang: Lang, path: string) =>
  `${BASE}${LANG_META[lang].prefix}${path === '/' ? '/' : path}`;

/** 從 pathname 判斷當前語言 */
export function langFromPath(pathname: string): Lang {
  const p = pathname.slice(BASE.length);
  if (p === '/ja' || p.startsWith('/ja/')) return 'ja';
  return 'zh';
}

/** 目前頁面在另一語言的對應網址（頁面不存在時退回該語言首頁由呼叫端保證） */
export function switchHref(target: Lang, pathname: string) {
  const p = pathname.slice(BASE.length).replace(/^\/ja(?=\/|$)/, '') || '/';
  return `${BASE}${LANG_META[target].prefix}${p}`;
}
