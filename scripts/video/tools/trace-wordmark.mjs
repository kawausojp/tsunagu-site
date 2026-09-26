// 把 src/assets/tsunagu-wordmark.png（522×71）描成向量：
// 原檔的 alpha 只有 0／206 兩值（外圍多一圈 1px 半透明白邊），反鋸齒是以白底烘進顏色裡的，
// 所以等值場不用 alpha，而是「疊白底後離白色多遠」：粉字看 G 通道、藍字看 R 通道。
// 雙三次放大 ×4 → marching squares（0.5 等值線）→ Chaikin 平滑 → 簡化。
// 輸出 scripts/video/assets/wordmark.json：逐字母的 path（原圖像素座標）與顏色。
// 用法：node scripts/video/tools/trace-wordmark.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '../../..');
const EXE = process.env.CHROME || '/Users/kawauso/.cache/puppeteer/chrome-headless-shell/mac_arm-152.0.7977.42/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const png = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'src/assets/tsunagu-wordmark.png')).toString('base64');

const br = await chromium.launch({ executablePath: EXE });
const page = await br.newPage();
const out = await page.evaluate(async (src) => {
  const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const W = img.width, H = img.height;
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, W, H).data;
  const P = 3;                                   // 外圍補 0，輪廓才會閉合
  const GW = W + 2 * P, GH = H + 2 * P;
  const A = new Float32Array(GW * GH);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = px[i + 3] / 255;
    const [r, g, b] = [px[i], px[i + 1], px[i + 2]].map(c => c * a + 255 * (1 - a)); // 疊白底
    const f = r >= b ? (255 - g) / (255 - 160) : (255 - r) / (255 - 125);            // 粉 #F3A0AA 的 G=160；藍 #7DD0F5 的 R=125
    A[(y + P) * GW + x + P] = Math.min(1, Math.max(0, f));
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH) ? 0 : A[y * GW + x];
  // Catmull-Rom 雙三次取樣
  const cr = (p0, p1, p2, p3, t) => p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0)));
  const U = 4, FW = (GW - 1) * U + 1, FH = (GH - 1) * U + 1;
  const F = new Float32Array(FW * FH);
  for (let fy = 0; fy < FH; fy++) {
    const sy = fy / U, iy = Math.floor(sy), ty = sy - iy;
    for (let fx = 0; fx < FW; fx++) {
      const sx = fx / U, ix = Math.floor(sx), tx = sx - ix;
      const row = j => cr(at(ix - 1, iy + j), at(ix, iy + j), at(ix + 1, iy + j), at(ix + 2, iy + j), tx);
      F[fy * FW + fx] = cr(row(-1), row(0), row(1), row(2), ty);
    }
  }
  // 高斯平滑（σ≈0.6 原圖像素）：消掉 1px 反鋸齒量化出來的折面；字形本來就是圓角，不會吃掉細節
  { const sig = 0.6 * U, R = Math.ceil(sig * 3), k = [];
    for (let i = -R; i <= R; i++) k.push(Math.exp(-i * i / (2 * sig * sig)));
    const ks = k.reduce((a, b) => a + b); for (let i = 0; i < k.length; i++) k[i] /= ks;
    const tmp = new Float32Array(FW * FH);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { let s = 0; for (let i = -R; i <= R; i++) { const xx = Math.min(FW - 1, Math.max(0, x + i)); s += F[y * FW + xx] * k[i + R]; } tmp[y * FW + x] = s; }
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { let s = 0; for (let i = -R; i <= R; i++) { const yy = Math.min(FH - 1, Math.max(0, y + i)); s += tmp[yy * FW + x] * k[i + R]; } F[y * FW + x] = s; } }
  // marching squares：每條線段以「格邊 id」相連
  const T = 0.5, v = (x, y) => F[y * FW + x];
  const edgePt = new Map(), next = new Map();
  const eid = (x, y, dir) => (dir ? 'v' : 'h') + x + ',' + y; // h: (x,y)-(x+1,y)  v: (x,y)-(x,y+1)
  const pt = (x, y, dir) => {
    const k = eid(x, y, dir); if (edgePt.has(k)) return k;
    const a = v(x, y), b = dir ? v(x, y + 1) : v(x + 1, y), t = (T - a) / (b - a);
    edgePt.set(k, dir ? [x, y + t] : [x + t, y]); return k;
  };
  const seg = (a, b) => next.set(a, b);
  for (let y = 0; y < FH - 1; y++) for (let x = 0; x < FW - 1; x++) {
    const c0 = v(x, y) >= T, c1 = v(x + 1, y) >= T, c2 = v(x + 1, y + 1) >= T, c3 = v(x, y + 1) >= T;
    const idx = c0 | c1 << 1 | c2 << 2 | c3 << 3;
    if (idx === 0 || idx === 15) continue;
    const top = () => pt(x, y, 0), right = () => pt(x + 1, y, 1), bot = () => pt(x, y + 1, 0), left = () => pt(x, y, 1);
    // 方向：內部在行進方向右手邊（y 向下座標系下的順時針）
    switch (idx) {
      case 1: seg(left(), top()); break;
      case 2: seg(top(), right()); break;
      case 3: seg(left(), right()); break;
      case 4: seg(right(), bot()); break;
      case 5: { const m = (v(x,y)+v(x+1,y)+v(x+1,y+1)+v(x,y+1))/4 >= T; if (m) { seg(left(), bot()); seg(right(), top()); } else { seg(left(), top()); seg(right(), bot()); } break; }
      case 6: seg(top(), bot()); break;
      case 7: seg(left(), bot()); break;
      case 8: seg(bot(), left()); break;
      case 9: seg(bot(), top()); break;
      case 10: { const m = (v(x,y)+v(x+1,y)+v(x+1,y+1)+v(x,y+1))/4 >= T; if (m) { seg(top(), left()); seg(bot(), right()); } else { seg(top(), right()); seg(bot(), left()); } break; }
      case 11: seg(bot(), right()); break;
      case 12: seg(right(), left()); break;
      case 13: seg(right(), top()); break;
      case 14: seg(top(), left()); break;
    }
  }
  // 串成閉合輪廓
  const loops = [], seen = new Set();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop = []; let k = start;
    while (k && !seen.has(k)) { seen.add(k); const [fx, fy] = edgePt.get(k); loop.push([fx / U - P, fy / U - P]); k = next.get(k); }
    if (loop.length > 8) loops.push(loop);
  }
  const area = l => { let s = 0; for (let i = 0; i < l.length; i++) { const [a, b] = l[i], [c, d] = l[(i + 1) % l.length]; s += a * d - c * b; } return s / 2; };
  const chaikin = l => { const o = []; for (let i = 0; i < l.length; i++) { const [a, b] = l[i], [c, d] = l[(i + 1) % l.length]; o.push([.75 * a + .25 * c, .75 * b + .25 * d], [.25 * a + .75 * c, .25 * b + .75 * d]); } return o; };
  const dp = (pts, eps) => { // 閉合折線的 Douglas-Peucker（以最遠兩點切成兩段）
    const simp = (p) => { if (p.length < 3) return p; const [ax, ay] = p[0], [bx, by] = p[p.length - 1]; let dm = 0, im = 0;
      const L = Math.hypot(bx - ax, by - ay) || 1e-9;
      for (let i = 1; i < p.length - 1; i++) { const d = Math.abs((bx - ax) * (ay - p[i][1]) - (ax - p[i][0]) * (by - ay)) / L; if (d > dm) { dm = d; im = i; } }
      return dm > eps ? [...simp(p.slice(0, im + 1)).slice(0, -1), ...simp(p.slice(im))] : [p[0], p[p.length - 1]]; };
    let far = 0, fd = 0; for (let i = 0; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]); if (d > fd) { fd = d; far = i; } }
    const a = simp(pts.slice(0, far + 1)), b = simp([...pts.slice(far), pts[0]]);
    return [...a.slice(0, -1), ...b.slice(0, -1)];
  };
  let shapes = loops.map(l => { let s = chaikin(l); s = dp(s, 0.012); return { pts: s, a: area(s) }; })
    .filter(s => Math.abs(s.a) > 4);
  // 外框（面積大）與內洞配對：洞的中心落在哪個外框的 bbox 內
  const bbox = p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
  const sign = Math.sign(shapes.reduce((m, s) => Math.abs(s.a) > Math.abs(m.a) ? s : m).a);
  const outers = shapes.filter(s => Math.sign(s.a) === sign).map(s => ({ ...s, bb: bbox(s.pts), holes: [] }));
  const holes = shapes.filter(s => Math.sign(s.a) !== sign);
  for (const h of holes) { const [x0, y0, x1, y1] = bbox(h.pts), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const o = outers.find(o => cx > o.bb[0] && cx < o.bb[2] && cy > o.bb[1] && cy < o.bb[3]); if (o) o.holes.push(h); }
  outers.sort((a, b) => a.bb[0] - b.bb[0]);
  const f = n => +n.toFixed(2);
  const ring = p => 'M' + p.map(q => f(q[0]) + ' ' + f(q[1])).join('L') + 'Z';
  // 取字母原色（中心附近不透明像素的平均），用來判斷粉／藍
  const colorOf = o => { let r = 0, g = 0, b = 0, n = 0; for (let y = Math.ceil(o.bb[1]); y < o.bb[3]; y++) for (let x = Math.ceil(o.bb[0]); x < o.bb[2]; x++) { const i = (y * W + x) * 4; if (px[i + 3] > 250) { r += px[i]; g += px[i + 1]; b += px[i + 2]; n++; } } return [r / n, g / n, b / n].map(Math.round); };
  return { width: W, height: H, letters: outers.map(o => ({ d: [o, ...o.holes].map(s => ring(s.pts)).join(''), bbox: o.bb.map(f), rgb: colorOf(o), holes: o.holes.length, n: o.pts.length })) };
}, png);
out.letters.forEach(l => { l.color = l.rgb[2] > l.rgb[0] ? 'sky' : 'pink'; });
fs.writeFileSync(path.join(here, '../assets/wordmark.json'), JSON.stringify(out));
console.log(out.letters.map(l => `${l.color} rgb(${l.rgb}) bbox ${l.bbox} holes ${l.holes} pts ${l.n}`).join('\n'));
await br.close();
