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

/** 9/20（日）／9/20（Sun）格式 */
export function fmtEventDate(date: string, lang: Lang) {
  const m = Number(date.slice(5, 7)), d = Number(date.slice(8, 10));
  const wd = WD[lang][new Date(`${date}T00:00:00+08:00`).getDay()];
  return `${m}/${d}（${wd}）`;
}

export const totalHeld = eventsData.totalHeld;
export const eventsList = eventsData.events;

export const CAT_LABEL: Record<Lang, Record<string, string>> = {
  zh: { apparel: '服飾', bag: '包款', eyewear: '眼鏡', food: '餐飲', goods: '飾品雜貨', group: '複合集團', hat: '帽子', jewelry: '珠寶飾品', kimono: '和服', shoes: '鞋履包款', socks: '襪類' },
  ja: { apparel: 'アパレル', bag: 'バッグ', eyewear: 'メガネ', food: '飲食', goods: '雑貨・小物', group: '複合企業', hat: '帽子', jewelry: 'ジュエリー', kimono: '着物', shoes: 'シューズ・バッグ', socks: '靴下' },
  en: { apparel: 'Fashion', bag: 'Bags', eyewear: 'Eyewear', food: 'Food', goods: 'Goods', group: 'Group', hat: 'Hats', jewelry: 'Jewelry', kimono: 'Kimono', shoes: 'Shoes & Bags', socks: 'Socks' },
};
