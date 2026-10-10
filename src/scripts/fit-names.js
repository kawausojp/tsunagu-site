// 企業卡的品牌名最多兩行（使用者 2026-10-11：「字體縮小到剛好可以塞進去，不要改到原名稱」）。
// 手機半寬卡上「Metro Properties restaurants」「メトロプロパティーズ系列の飲食店」「LOULOU WILLOUGHBY」會折成三行；
// 這裡只縮字級（每次 0.5px，下限 9px），名稱一個字都不動。
// 用 ResizeObserver 盯每個品牌名：字型換上、篩選切換、版面變動時自動再縮；視窗變寬時全部重設再算（才會放大回來）。
(() => {
  const names = document.querySelectorAll('.co h3');
  if (!names.length || !('ResizeObserver' in window)) return;
  const shrink = (h) => {
    if (!h.getClientRects().length) return;
    // 量測期間關掉 transition：「減少動態」的全站規則把 transition 設成 .01ms（property=all），
    // 字級一改就開始一段極短的漸變，同步讀到的還是舊值，迴圈會一路縮到下限（2026-10-11 實測）
    h.style.transition = 'none';
    const cs = getComputedStyle(h);
    let size = parseFloat(cs.fontSize);
    const ratio = parseFloat(cs.lineHeight) / size;
    const lines = () => Math.round(h.getBoundingClientRect().height / (size * ratio));
    while (lines() > 2 && size > 9) { size -= 0.5; h.style.fontSize = `${size}px`; }
    h.style.transition = '';
  };
  const ro = new ResizeObserver((entries) => { for (const e of entries) shrink(e.target); });
  for (const h of names) ro.observe(h);
  let lastW = innerWidth, t;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth;
    clearTimeout(t);
    t = setTimeout(() => { for (const h of names) { h.style.transition = 'none'; h.style.fontSize = ''; shrink(h); } }, 120);
  });
})();
