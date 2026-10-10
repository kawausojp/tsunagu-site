// 跨頁轉場的共用元素命名（2026-10-04）。品牌頁頁首的圖標／品牌名是固定名字（ico-／nm-＋slug），
// 列表這邊只替「這次要去／剛離開」的那一張企業卡命名——不在 35 張卡上全部掛 view-transition-name：
// 每個名字都會被單獨截圖、建一層，手機換頁會頓，換去別頁時也會白白各自淡出。
// 以 is:inline 放在 <body> 最後（Base.astro 用 ?raw 讀進來），pagereveal 才接得到新頁第一幀之前的時間點。
(() => {
  if (!('onpageswap' in window)) return;   // 不支援跨頁轉場的瀏覽器：什麼都不做，一般換頁
  const slugOf = (url) => {
    try { return new URL(url).pathname.match(/\/companies\/([^/]+)\/?$/)?.[1] ?? null; } catch { return null; }
  };
  const cardParts = (slug) => {
    const card = document.querySelector(`.co[data-slug="${slug}"]`);
    return card ? [[card.querySelector('.ico'), `ico-${slug}`], [card.querySelector('h3'), `nm-${slug}`]] : [];
  };
  const setNames = (parts, on) => { for (const [el, n] of parts) if (el) el.style.viewTransitionName = on ? n : ''; };

  // 從列表／首頁點進品牌頁：離開前一刻替被點的那張卡命名
  addEventListener('pageswap', (e) => {
    if (!e.viewTransition || !e.activation?.entry) return;
    const slug = slugOf(e.activation.entry.url);
    if (slug) setNames(cardParts(slug), true);
  });
  // 從品牌頁回到列表／首頁：新頁第一幀之前替對應的卡命名，轉場結束就拿掉
  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    const from = window.navigation?.activation?.from?.url;
    const slug = from && slugOf(from);
    if (!slug) return;
    const parts = cardParts(slug);
    setNames(parts, true);
    e.viewTransition.finished.finally(() => setNames(parts, false));
  });
  // 從 bfcache 回來：清掉離開前加上的名字（同一頁不可有兩個相同的名字）
  addEventListener('pageshow', (e) => {
    if (e.persisted) for (const el of document.querySelectorAll('.co .ico, .co h3')) el.style.viewTransitionName = '';
  });
})();
