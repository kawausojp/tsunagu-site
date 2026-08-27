// 三語 UI 字典：只放「元件層」共用字串（導覽、footer、卡片標籤）。
// 頁面內容不走字典——ja/en 頁是獨立檔案，文案直接寫在該頁（維護見 CLAUDE.md）。
export type Lang = 'zh' | 'ja' | 'en';

export const LANG_META: Record<Lang, { label: string; htmlLang: string; prefix: string }> = {
  zh: { label: '繁體中文', htmlLang: 'zh-Hant', prefix: '' },
  ja: { label: '日本語', htmlLang: 'ja', prefix: '/ja' },
  en: { label: 'English', htmlLang: 'en', prefix: '/en' },
};

export const ui = {
  zh: {
    nav: [
      { path: '/companies', label: '合作企業', short: '合作企業' },
      { path: '/stories', label: '學長姐經驗', short: '學長姐' },
      { path: '/support', label: '我們怎麼幫你', short: '支援方式' },
      { path: '/about', label: '關於 Tsunagu', short: '關於我們' },
    ],
    signup: '報名交流會',
    signupShort: '報名',
    home: 'ツナグ Tsunagu 首頁',
    mainMenu: '主選單',
    quickNav: '快速導覽',
    mobileMenu: '行動版主選單',
    openMenu: '開啟主選單',
    langMenu: '切換語言',
    skip: '跳到主要內容',
    footerSite: '網站',
    footerContact: '聯絡',
    footerLinks: [
      { path: '/events', label: '交流會場次與報名' },
      { path: '/companies', label: '合作企業' },
      { path: '/stories', label: '學長姐經驗' },
      { path: '/support', label: '我們怎麼幫你' },
      { path: '/apply', label: '送出 Profile' },
      { path: '/about', label: '關於 Tsunagu' },
    ],
    footerTagline: '把台灣的好人才，牽到日本。',
    footerFree: '參加交流會與工作媒合，對台灣的各位全程免費。',
    organizer: '活動主辦：智囊和夥伴有限公司（Brain & Partner Taiwan Inc.）',
    card: {
      placements: (n: number) => `累計 ${n} 人任職`,
      fullTime: (n: number) => `${n} 人轉正職`,
      online: '可線上面試',
      jlpt: (lv: string) => `${lv} 以上`,
    },
    area: { tokyo: '東京', osaka: '大阪', kyoto: '京都', fukuoka: '福岡', kobe: '神戶', hokkaido: '北海道' } as Record<string, string>,
  },
  ja: {
    nav: [
      { path: '/companies', label: '提携企業', short: '提携企業' },
      { path: '/stories', label: '先輩の声', short: '先輩の声' },
      { path: '/support', label: 'サポート内容', short: 'サポート' },
      { path: '/about', label: 'ツナグについて', short: 'ツナグとは' },
    ],
    signup: '交流会に申し込む',
    signupShort: '申込',
    home: 'ツナグ Tsunagu ホーム',
    mainMenu: 'メインメニュー',
    quickNav: 'クイックナビ',
    mobileMenu: 'モバイルメニュー',
    openMenu: 'メニューを開く',
    langMenu: '言語を切り替える',
    skip: '本文へスキップ',
    footerSite: 'サイト',
    footerContact: 'お問い合わせ',
    footerLinks: [
      { path: '/events', label: '交流会日程・申込' },
      { path: '/companies', label: '提携企業' },
      { path: '/stories', label: '先輩の声' },
      { path: '/support', label: 'サポート内容' },
      { path: '/apply', label: 'プロフィール送信' },
      { path: '/about', label: 'ツナグについて' },
    ],
    footerTagline: '台湾の優秀な人材を、日本へ。',
    footerFree: '交流会への参加も就職マッチングも、台湾の皆さまはすべて無料でご利用いただけます。',
    organizer: '主催：Brain & Partner Taiwan Inc.（智囊和夥伴有限公司）',
    card: {
      placements: (n: number) => `累計 ${n} 名が就業`,
      fullTime: (n: number) => `${n} 名が正社員に登用`,
      online: 'オンライン面接可',
      jlpt: (lv: string) => `${lv} 以上`,
    },
    area: { tokyo: '東京', osaka: '大阪', kyoto: '京都', fukuoka: '福岡', kobe: '神戸', hokkaido: '北海道' } as Record<string, string>,
  },
  en: {
    nav: [
      { path: '/companies', label: 'Partner Brands', short: 'Brands' },
      { path: '/stories', label: 'Alumni Stories', short: 'Stories' },
      { path: '/support', label: 'How We Help', short: 'Support' },
      { path: '/about', label: 'About Tsunagu', short: 'About' },
    ],
    signup: 'Join a Meetup',
    signupShort: 'Join',
    home: 'Tsunagu home',
    mainMenu: 'Main menu',
    quickNav: 'Quick navigation',
    mobileMenu: 'Mobile menu',
    openMenu: 'Open menu',
    langMenu: 'Switch language',
    skip: 'Skip to main content',
    footerSite: 'Site',
    footerContact: 'Contact',
    footerLinks: [
      { path: '/events', label: 'Meetup Schedule & Sign-up' },
      { path: '/companies', label: 'Partner Brands' },
      { path: '/stories', label: 'Alumni Stories' },
      { path: '/support', label: 'How We Help' },
      { path: '/apply', label: 'Submit Your Profile' },
      { path: '/about', label: 'About Tsunagu' },
    ],
    footerTagline: 'Bringing Taiwan’s talent to Japan.',
    footerFree: 'Meetups and job matching are completely free for participants from Taiwan.',
    organizer: 'Organizer: Brain & Partner Taiwan Inc.',
    card: {
      placements: (n: number) => `${n} placed to date`,
      fullTime: (n: number) => `${n} became full-time`,
      online: 'Online interview OK',
      jlpt: (lv: string) => `${lv}+`,
    },
    area: { tokyo: 'Tokyo', osaka: 'Osaka', kyoto: 'Kyoto', fukuoka: 'Fukuoka', kobe: 'Kobe', hokkaido: 'Hokkaido' } as Record<string, string>,
  },
} as const;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** 產生指定語言下的站內連結（含 base 與語言前綴） */
export const href = (lang: Lang, path: string) =>
  `${BASE}${LANG_META[lang].prefix}${path === '/' ? '/' : path}`;

/** 從 pathname 判斷當前語言 */
export function langFromPath(pathname: string): Lang {
  const p = pathname.slice(BASE.length);
  if (p === '/ja' || p.startsWith('/ja/')) return 'ja';
  if (p === '/en' || p.startsWith('/en/')) return 'en';
  return 'zh';
}

/** 目前頁面在另一語言的對應網址（頁面不存在時退回該語言首頁由呼叫端保證） */
export function switchHref(lang: Lang, target: Lang, pathname: string) {
  const p = pathname.slice(BASE.length).replace(/^\/(ja|en)(?=\/|$)/, '') || '/';
  return `${BASE}${LANG_META[target].prefix}${p}`;
}
