// 三語頁面共用的資料邏輯：下一場場次、日期格式。頁面文案不在此（各語言頁自持）。
import rawEvents from '../data/events.json';
import { z } from 'astro/zod';
import type { Lang } from '../i18n/ui';

// events.json 沒有 content collection 的 schema 把關，這裡進場時驗一次：格式錯會在 build 直接擋下
const EventSchema = z.object({
  no: z.string().regex(/^\d+(,\d+)*$/),            // "88,89" 資料源保持逗號
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  city: z.string().min(1),
  sessions: z.array(z.string().regex(/^\d{1,2}:\d{2}\s*[–\-−~〜]\s*\d{1,2}:\d{2}$/)).optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  signupUrl: z.url().optional(),
  ig: z.string().regex(/^[A-Za-z0-9_-]{10,12}$/).optional(),
}).loose();
const eventsData = z.object({
  totalHeld: z.number().int().nonnegative(),
  cities: z.array(z.string()),
  since: z.string().regex(/^\d{4}-\d{2}$/),
  events: z.array(EventSchema),
}).loose().parse(rawEvents);

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

/** 主 CTA 文字：有下一場就帶日期地點（首頁 hero 與各頁收尾 CTA 三語共用），
 * 沒有就退回一般字串。審查發現「下一場是哪一天」原本只在首頁 hero 出現一次。 */
export function signupCta(lang: Lang) {
  const e = nextEvent();
  if (!e) return { zh: '報名下一場交流會', ja: '次回の交流会に申し込む', en: 'Join the next meetup' }[lang];
  const d = fmtEventDate(e.date, lang);
  const c = CITY[lang][e.city] ?? e.city;
  if (lang === 'ja') return `${d}・${c}の交流会に申し込む`;
  if (lang === 'en') return `Join the ${d} meetup in ${c}`;
  return `報名 ${d}${c}交流會`;
}

/** 媒體報導（about 頁三語共用；原本三份陣列，新增一則要改三檔）。
 * 紅線 #3：只放標題＋日期＋外連，不貼截圖。title 為原文標題（2026-09-19 自原文頁面抄錄）。
 * 繊研 2025 兩篇與日經 2024.10.07 經查無線上版（senken.co.jp 404 實測），標紙面刊載。
 * 口徑依簡報 p22–p28：媒體名單含 Yahoo!ニュース；Haru／きものやまと 一則繫於 2024.08.07（p24），非日經（p25）。 */
export const MEDIA: { name: Record<Lang, string>; date: string; url?: string; title?: string; print?: boolean; note?: Record<Lang, string> }[] = [
  { name: { zh: '繊研新聞', ja: '繊研新聞', en: 'Senken Shimbun' }, date: '2026.01.28', url: 'https://senken.co.jp/posts/bp-260128',
    title: 'ブレーンアンドパートナーの台湾人材仲介事業　インバウンド対応ニーズで拡大' },
  { name: { zh: '繊研新聞', ja: '繊研新聞', en: 'Senken Shimbun' }, date: '2025.07.17', print: true },
  { name: { zh: '繊研新聞', ja: '繊研新聞', en: 'Senken Shimbun' }, date: '2025.02.12', print: true },
  { name: { zh: '日本經濟新聞 朝刊', ja: '日本経済新聞 朝刊', en: 'Nikkei (morning edition)' }, date: '2024.10.07', print: true },
  { name: { zh: 'Yahoo! ニュース', ja: 'Yahoo! ニュース', en: 'Yahoo! News Japan' }, date: '2024.08.07',
    note: { zh: '報導きものやまと的 Haru', ja: 'きものやまと勤務の Haru さんを紹介', en: 'Featured Haru at Kimono Yamato' } },
  { name: { zh: '台北經濟新聞', ja: '台北経済新聞', en: 'Taipei Keizai Shimbun' }, date: '2023.06.06', url: 'https://taipei.keizai.biz/headline/418/',
    title: '台北で「台湾人と日本企業をツナグ交流会」　台湾人材を日本へ' },
];

/** stories 的 location（繁中原值，如「東京・澀谷」）→ 日／英表記。
 * 逐詞替換（長詞優先），未收錄的詞原樣通過；zh 原樣回傳。
 * 審查發現 ja 頁直接渲染「澀谷／表參道／心齋橋」對日本讀者是錯字，且 BIZ UDPGothic 無此字會混字型。 */
const LOC_WORDS: [string, string, string][] = [
  ['東京車站附近', '東京駅周辺', 'near Tokyo Station'],
  ['東京車站', '東京駅', 'Tokyo Station'],
  ['銀座三越', '銀座三越', 'Ginza Mitsukoshi'],
  ['心齋橋', '心斎橋', 'Shinsaibashi'],
  ['表參道', '表参道', 'Omotesando'],
  ['澀谷', '渋谷', 'Shibuya'],
  ['新宿', '新宿', 'Shinjuku'],
  ['銀座', '銀座', 'Ginza'],
  ['東京', '東京', 'Tokyo'],
  ['大阪', '大阪', 'Osaka'],
  ['福岡', '福岡', 'Fukuoka'],
  ['／', '／', ' / '],
  ['・', '・', ', '],
];
export function fmtLocation(loc: string, lang: Lang) {
  if (lang === 'zh') return loc;
  const i = lang === 'ja' ? 1 : 2;
  let out = loc;
  for (const w of LOC_WORDS) out = out.split(w[0]).join(w[i]);
  return out;
}

/** 品牌顯示名：ja/en 有各自表記（nameJa/nameEn）就用，否則沿用繁中 name。 */
export function companyName(d: { name: string; nameJa?: string; nameEn?: string }, lang: Lang) {
  return (lang === 'ja' && d.nameJa) || (lang === 'en' && d.nameEn) || d.name;
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

/** 品牌頁：在這個品牌工作過的學長姐（matchCompanyId 的反向；原本三語 [slug] 各抄一份）。
 * 前綴比對而非子字串：避免 "ete" 誤配 "agete"；另取空格前第一段處理 "MUK ムカイ" → MUKAI */
export function relatedStoriesFor<T extends { data: { company: string; order: number } }>(companyName: string, stories: T[]): T[] {
  const dn = normName(companyName);
  return stories.filter(st => {
    const sn = normName(st.data.company);
    if (sn.length < 2) return false;
    const snFirst = normName(st.data.company.split(/[\s/]/)[0]);
    return sn === dn || dn.startsWith(sn) || sn.startsWith(dn) || (snFirst.length > 2 && dn.startsWith(snFirst));
  }).sort((a, b) => a.data.order - b.data.order);
}

/** apply 頁的線上收件表單。線上收件流程目前不存在（2026-08-26 使用者確認）；
 * 日後建立 Google 表單填入這裡，三語 apply 頁即自動切換為內嵌表單。 */
export const FORM_URL = '';

type EventRow = (typeof eventsData.events)[number];
const JP_CITIES = new Set(['東京', '大阪']);
/** Event 結構化資料（三語 events 頁共用；原本三份）。僅給未來場次且場地齊備者（Google Event 標記要求結構化地址）。
 * name 固定日文表記（同一場活動三語應輸出同一個名稱）；交流會以中文進行，inLanguage 維持 zh-Hant。 */
export function eventLd(e: EventRow) {
  // 資料源時段用 en dash「14:00–16:00」，但也容忍連字號／波浪號，避免產生 "Tundefined:00"
  const times = (e.sessions ?? []).map(t => t.split(/\s*[–\-−~〜]\s*/));
  const lastTime = times.at(-1);
  const inJapan = JP_CITIES.has(e.city);
  const tz = inJapan ? '+09:00' : '+08:00';
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `第 ${fmtEventNo(e.no, 'ja')} 回 台湾人と日本企業をツナグ交流会`,
    startDate: times[0]?.[0] ? `${e.date}T${times[0][0]}:00${tz}` : e.date,
    endDate: lastTime?.[1] ? `${e.date}T${lastTime[1]}:00${tz}` : e.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: e.venue,
      address: { '@type': 'PostalAddress', streetAddress: e.address, addressLocality: e.city, addressCountry: inJapan ? 'JP' : 'TW' },
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: inJapan ? 'JPY' : 'TWD',
      availability: 'https://schema.org/InStock', url: e.signupUrl },
    organizer: { '@type': 'Organization', name: 'ツナグ Tsunagu',
      url: 'https://www.instagram.com/tw.tsunagu.jp/' },
    inLanguage: 'zh-Hant',
    isAccessibleForFree: true,
  };
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

/** 簽約企業數（簡報 p18 口徑）；品牌數以 content/companies 筆數為準，兩者不同：一家企業可有多個品牌 */
export const CONTRACTED_COMPANIES = 39;

/** 累計舉辦場數：JSON 的 totalHeld 只是下限。場次過期後每日排程重建會自動移到「舉辦紀錄」，
 * 這裡同步以「已過期場次的最大回數」推算，不必每場手動改數字。 */
export const totalHeld = (() => {
  const today = todayTaipei();
  const pastMax = eventsData.events
    .filter(e => e.date < today)
    .flatMap(e => e.no.split(',').map(Number))
    .filter(n => Number.isFinite(n))
    .reduce((m, n) => Math.max(m, n), 0);
  return Math.max(eventsData.totalHeld, pastMax);
})();
export const eventsList = eventsData.events;
/** events 頁用的其餘欄位（since／cities／events）；totalHeld 請用上面推導後的值，不要讀 JSON 原值 */
export const eventsMeta = eventsData;

export const CAT_LABEL: Record<Lang, Record<string, string>> = {
  zh: { apparel: '服飾', bag: '包款', eyewear: '眼鏡', food: '餐飲', goods: '飾品雜貨', group: '複合集團', hat: '帽子', jewelry: '珠寶飾品', kimono: '和服', shoes: '鞋履包款', socks: '襪類', other: '其他' },
  ja: { apparel: 'アパレル', bag: 'バッグ', eyewear: 'メガネ', food: '飲食', goods: 'アクセサリー・雑貨', group: '複合企業', hat: '帽子', jewelry: 'ジュエリー', kimono: '着物', shoes: 'シューズ・バッグ', socks: '靴下', other: 'その他' },
  en: { apparel: 'Fashion', bag: 'Bags', eyewear: 'Eyewear', food: 'Food', goods: 'Goods', group: 'Group', hat: 'Hats', jewelry: 'Jewelry', kimono: 'Kimono', shoes: 'Shoes & Bags', socks: 'Socks', other: 'Other' },
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
 *  0:47 = Tsunagu 訪談段落的開始。
 *  要換段落改這裡即可，三語首頁共用。 */
export const VIDEO_START = 47;

/** 品類的主色調：藍＝鞋／襪／眼鏡，其餘粉。CategoryIcon 線條色與企業卡圖標框共用 */
export const SKY_CATEGORIES = new Set(['shoes', 'socks', 'eyewear']);
