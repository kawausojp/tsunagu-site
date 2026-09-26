// 時間與緩動：全片每一格都是 t（秒）的純函數，逐格輸出才能重現、才能做次格動態模糊
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
/** t 在 [a, b] 間的進度，0–1 夾住 */
export const P = (t, a, b) => clamp((t - a) / (b - a));
export const mix2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];

export const E = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) ** 2,
  inCubic: t => t ** 3,
  outCubic: t => 1 - (1 - t) ** 3,
  inOutCubic: t => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  outQuart: t => 1 - (1 - t) ** 4,
  inQuart: t => t ** 4,
  inOutQuart: t => (t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
  outQuint: t => 1 - (1 - t) ** 5,
  inOutQuint: t => (t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  outExpo: t => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  inExpo: t => (t <= 0 ? 0 : 2 ** (10 * t - 10)),
  inOutExpo: t => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outSine: t => Math.sin(t * Math.PI / 2),
  inSine: t => 1 - Math.cos(t * Math.PI / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2,
  inBack: (t, s = 1.70158) => (s + 1) * t ** 3 - s * t * t,
};

/** CSS cubic-bezier() 的等價實作（牛頓法＋二分法備援） */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x, d = dx(t);
      if (Math.abs(e) < 1e-7) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 40; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-7) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}
E.brand = cubicBezier(.34, 1.4, .64, 1);   // 官網 --ease（過衝）
E.glide = cubicBezier(.22, .61, .36, 1);   // 官網頁首收合用的無過衝曲線
E.swift = cubicBezier(.65, 0, .35, 1);     // 鏡頭用：起落都柔、中段快

/** 阻尼彈簧的階躍響應 0→1（f：頻率 Hz，z：阻尼比；z<1 會過衝回彈） */
export function spring(t, f = 2.2, z = .5) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}

/** 關鍵影格軌：[[時間, 值, 往下一格的緩動], …] */
export function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0, e = E.inOutCubic] = keys[i], [t1, v1] = keys[i + 1];
    if (t < t1) return lerp(v0, v1, e((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}

/** van Wijk & Nuij 平滑縮放平移（同 d3.interpolateZoom）：view = [cx, cy, 視野寬（世界單位）] */
export function zoomPath(p0, p1, rho = Math.SQRT2) {
  const [ux0, uy0, w0] = p0, [ux1, uy1, w1] = p1;
  const dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy;
  const rho2 = rho * rho, rho4 = rho2 * rho2;
  if (d2 < 1e-12) {
    const S = Math.log(w1 / w0) / rho;
    return t => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
  const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  const S = (r1 - r0) / rho;
  return t => {
    const s = t * S, ch = Math.cosh(r0);
    const u = w0 / (rho2 * d1) * (ch * Math.tanh(rho * s + r0) - Math.sinh(r0));
    return [ux0 + u * dx, uy0 + u * dy, w0 * ch / Math.cosh(rho * s + r0)];
  };
}

/** 決定性的偽隨機（同一 seed 每次同值） */
export function rand(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}
