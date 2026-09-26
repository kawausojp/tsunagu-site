// 地圖：Natural Earth 1:10m（world-atlas，公有領域）只取台灣與日本。
// 渲染時由頁面載入（與 Google Fonts 同屬頁面資源），版本釘死避免上游變動。
const TOPO = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json';

export const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
export const CITY = {
  taipei: [121.5654, 25.0330], taichung: [120.6736, 24.1477], kaohsiung: [120.3014, 22.6273],
  tokyo: [139.6917, 35.6895], osaka: [135.5023, 34.6937],
};
/** 世界座標：台北為原點，1 經度 = K 像素（鏡頭 z=1 時），麥卡托 */
export const K = 220;
const Y0 = merc(CITY.taipei[1]);
export const proj = ([lon, lat]) => [(lon - CITY.taipei[0]) * K, -(merc(lat) - Y0) * K];

/** 折線：累積長度、取點、取子段（筆畫逐步畫出用；不用 dasharray，因為線寬要跟鏡頭無關） */
export class Poly {
  constructor(pts, closed = false) {
    this.pts = closed ? [...pts, pts[0]] : pts.slice();
    this.cum = [0];
    for (let i = 1; i < this.pts.length; i++) {
      const [a, b] = this.pts[i - 1], [c, d] = this.pts[i];
      this.cum.push(this.cum[i - 1] + Math.hypot(c - a, d - b));
    }
    this.len = this.cum[this.cum.length - 1];
  }
  idx(s) { // 二分找 s 所在的線段
    let lo = 0, hi = this.cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.cum[m] <= s) lo = m; else hi = m; }
    return lo;
  }
  at(s) {
    s = Math.min(this.len, Math.max(0, s));
    const i = this.idx(s), seg = this.cum[i + 1] - this.cum[i] || 1, t = (s - this.cum[i]) / seg;
    const [a, b] = this.pts[i], [c, d] = this.pts[i + 1] || this.pts[i];
    return [a + (c - a) * t, b + (d - b) * t];
  }
  /** s0→s1 的子段點列（s 可超出 [0, len] 以環狀取用，closed 時） */
  slice(s0, s1) {
    if (s1 <= s0) return [];
    const L = this.len, out = [];
    const push = (a, b) => { // 單段 [a,b]，0≤a<b≤L
      out.push(this.at(a));
      for (let i = this.idx(a) + 1; i < this.cum.length && this.cum[i] < b; i++) out.push(this.pts[i]);
      out.push(this.at(b));
    };
    if (s0 >= 0 && s1 <= L) push(s0, s1);
    else if (s0 < 0) { push(L + s0, L); push(0, Math.min(s1, L)); }
    else { push(s0, L); push(0, s1 - L); }
    return out;
  }
}
export const pathD = (pts, close = false) => pts.length < 2 ? '' :
  'M' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + (close ? 'Z' : '');

/** Douglas–Peucker（開放折線） */
export function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const L = Math.hypot(bx - ax, by - ay) || 1e-9;
  let dm = 0, im = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = L < 1e-6 ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
      : Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L;
    if (d > dm) { dm = d; im = i; }
  }
  if (dm <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, im + 1), eps).slice(0, -1), ...simplify(pts.slice(im), eps)];
}
const ringArea = r => { let s = 0; for (let i = 0; i < r.length; i++) { const [a, b] = r[i], [c, d] = r[(i + 1) % r.length]; s += a * d - c * b; } return s / 2; };
const centroid = r => { let x = 0, y = 0; for (const p of r) { x += p[0]; y += p[1]; } return [x / r.length, y / r.length]; };

/** 載入並投影：回傳 { tw: [{pts, area, c}], jp: [...] }，pts 為世界座標閉合環（首尾不重複） */
export async function loadIslands() {
  const topo = await (await fetch(TOPO)).json();
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arcPts = i => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  const ringOf = ids => { const out = []; ids.forEach((i, k) => { const p = arcPts(i); out.push(...(k ? p.slice(1) : p)); }); return out; };
  const get = id => {
    const g = topo.objects.countries.geometries.find(g => g.id === id);
    return (g.type === 'Polygon' ? [g.arcs] : g.arcs).map(p => ringOf(p[0]));
  };
  const prep = (rings, keep, eps) => rings.filter(keep).map(r => {
    let pts = r.map(proj);
    if (Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) < 1e-6) pts.pop();
    pts = simplify([...pts, pts[0]], eps).slice(0, -1);
    if (ringArea(pts) < 0) pts.reverse();              // 統一為螢幕座標下的順時針
    return { pts, area: Math.abs(ringArea(pts)), c: centroid(pts) };
  }).sort((a, b) => b.area - a.area);
  const lonlatArea = r => Math.abs(ringArea(r.map(([x, y]) => [x, merc(y)])));
  return {
    // 台灣：本島＋澎湖、綠島、蘭嶼（金門貼著對岸，單獨畫出來反而奇怪，略去）
    tw: prep(get('158'), r => r[0][0] > 119 && lonlatArea(r) > 0.001, 0.45),
    // 日本：面積門檻留下四大島、沖繩、琉球群島與主要離島
    jp: prep(get('392'), r => lonlatArea(r) > 0.008, 1.6),
  };
}
