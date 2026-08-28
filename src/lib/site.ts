// 三語頁面共用的資料邏輯：下一場場次、日期格式。頁面文案不在此（各語言頁自持）。
import eventsData from '../data/events.json';
import type { Lang } from '../i18n/ui';

export const VIDEO_ID = 'UmWq6sPcrJs'; // 公視晚間新聞，內含 Tsunagu 訪談

export function todayTaipei() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
}

export function nextEvent() {
  const today = todayTaipei();
  return [...eventsData.events].filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
}

const WD: Record<Lang, string[]> = {
  zh: ['日', '一', '二', '三', '四', '五', '六'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export const CITY: Record<Lang, Record<string, string>> = {
  zh: { 台北: '台北', 台中: '台中', 高雄: '高雄', 東京: '東京', 大阪: '大阪' },
  ja: { 台北: '台北', 台中: '台中', 高雄: '高雄', 東京: '東京', 大阪: '大阪' },
  en: { 台北: 'Taipei', 台中: 'Taichung', 高雄: 'Kaohsiung', 東京: 'Tokyo', 大阪: 'Osaka' },
};

/** zh/ja「9/20（日）」；en「9/20 (Sun)」半形。
 * 星期一律用 Date.UTC + getUTCDay()：getDay() 依 build 環境時區取值，
 * 在 GitHub Actions（UTC）上會比台北早一天、全站星期錯一天。 */
export function fmtEventDate(date: string, lang: Lang) {
  const [y, m, d] = date.split('-').map(Number);
  const wd = WD[lang][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return lang === 'en' ? `${m}/${d} (${wd})` : `${m}/${d}（${wd}）`;
}

/** stories 的 company 名 → 對應品牌頁 id（與 [slug].astro 的 relatedStories 同一套寬鬆前綴比對，方向相反）。
 * 找不到回傳 null（該品牌未揭露時 company 維持純文字）。 */
const normName = (x: string) => x.normalize('NFKC').toLowerCase().replace(/[^a-z0-9぀-ヿ一-鿿]/g, '');
export function matchCompanyId(storyCompany: string, companies: { id: string; name: string }[]) {
  const sn = normName(storyCompany);
  if (sn.length < 2) return null;
  const snFirst = normName(storyCompany.split(/[\s/]/)[0]);
  for (const c of companies) {
    const dn = normName(c.name);
    if (sn === dn || dn.startsWith(sn) || sn.startsWith(dn) || (snFirst.length > 2 && dn.startsWith(snFirst))) return c.id;
  }
  return null;
}

/** 品牌頁：highlights 首條常與 placements 大數字磁磚重複（「累計 N 人任職/採用」）。
 * 有磁磚時把該條從列表濾掉，同一數字不在同屏出現兩次。內容不修改，只是不重複呈現。 */
export function dedupHighlights(highlights: string[], placements: number) {
  if (placements <= 0) return highlights;
  return highlights.filter(h => !/^累計\s?\d+\s?(人|位|名)(任職|採用|入職)/.test(h));
}

/** 場次編號「88,89」的顯示層分隔：zh「88、89」／ja「88・89」／en「88–89」（資料源保持逗號） */
export function fmtEventNo(no: string, lang: Lang) {
  const sep = lang === 'ja' ? '・' : lang === 'en' ? '–' : '、';
  return no.replace(/,/g, sep);
}

export const totalHeld = eventsData.totalHeld;
export const eventsList = eventsData.events;

export const CAT_LABEL: Record<Lang, Record<string, string>> = {
  zh: { apparel: '服飾', bag: '包款', eyewear: '眼鏡', food: '餐飲', goods: '飾品雜貨', group: '複合集團', hat: '帽子', jewelry: '珠寶飾品', kimono: '和服', shoes: '鞋履包款', socks: '襪類' },
  ja: { apparel: 'アパレル', bag: 'バッグ', eyewear: 'メガネ', food: '飲食', goods: 'アクセサリー・雑貨', group: '複合企業', hat: '帽子', jewelry: 'ジュエリー', kimono: '着物', shoes: 'シューズ・バッグ', socks: '靴下' },
  en: { apparel: 'Fashion', bag: 'Bags', eyewear: 'Eyewear', food: 'Food', goods: 'Goods', group: 'Group', hat: 'Hats', jewelry: 'Jewelry', kimono: 'Kimono', shoes: 'Shoes & Bags', socks: 'Socks' },
};

// 簽證標籤三語對照（stories frontmatter 的 visa 是繁中原值；ja/en 頁顯示時轉換）
export const VISA_LABEL: Record<Lang, Record<string, string>> = {
  zh: {},
  ja: {
    打工度假: 'ワーキングホリデー',
    留學: '留学',
    留學生: '留学',
    交換留學: '交換留学',
    '打工度假 → 工作簽證': 'ワーキングホリデー → 就労ビザ',
  },
  en: {
    打工度假: 'Working Holiday',
    留學: 'Study Abroad',
    留學生: 'Student',
    交換留學: 'Exchange Student',
    '打工度假 → 工作簽證': 'Working Holiday → Work Visa',
  },
};

/** "2023-06" → 「2023 年 6 月」／「June 2023」／zh「2023 年 6 月」 */
export function fmtSince(since: string, lang: Lang) {
  const [y, m] = since.split('-').map(Number);
  if (lang === 'en') {
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${MONTHS[m - 1]} ${y}`;
  }
  return `${y} 年 ${m} 月`;
}

/** 品牌資料的出處：主辦方簡報。標題頁自載「交流会 -第76,77回- 2026年4月18日」。
 *  三語原本各寫一套（逗號／中黑、補零與否），改由此處統一渲染。 */
export const SOURCE_DECK = { no: '76,77', date: '2026.4.18' };
export function fmtSourceDeck(lang: Lang, page?: number) {
  const no = fmtEventNo(SOURCE_DECK.no, lang);
  const p = page ? (lang === 'zh' ? `第 ${page} 頁` : `p.${page}`) : '';
  if (lang === 'en') return `Taipei meetup deck, sessions #${no}, ${SOURCE_DECK.date}${p ? `, ${p}` : ''}`;
  if (lang === 'ja') return `『第 ${no} 回 台北交流会スライド ${SOURCE_DECK.date}』${p}`;
  return `《第 ${no} 回 台北交流会スライド ${SOURCE_DECK.date}》${p}`;
}

/** 首頁影片的起始秒數（2026-08-28 使用者指定：直接嵌入、從特定段落開始）。
 *  0 分 46.55 秒 = Tsunagu 訪談段落的開始（參數只吃整數秒，取 46）。
 *  要換段落改這裡即可，三語首頁共用。 */
export const VIDEO_START = 46;
