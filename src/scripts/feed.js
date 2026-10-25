// 文章列表（與實績總表）的分類切換與「看更多」（2026-10-25）。以 is:inline 緊接在列表 markup 後同步執行：
// 首次繪製前就把超出的項目藏好、把分類列打開，不會先畫出全部再收掉（同 2026-10-18 收藏區塊的教訓）。
// 沒有 JS 時：分類列維持 hidden、全部文章照常顯示。
(() => {
  for (const feed of document.querySelectorAll('[data-feed]:not([data-ready])')) {
    feed.dataset.ready = '';
    const initial = Number(feed.dataset.initial) || 0;
    const tabs = feed.querySelector('[data-tabs]');
    const moreWrap = feed.querySelector('[data-more-wrap]');
    const entries = [...feed.querySelectorAll('.fpost, .frow, [data-entry]')];   // [data-entry]：實績總表的列
    let cat = feed.dataset.default || 'all';
    let expanded = false;
    const render = () => {
      let shown = 0, total = 0;
      for (const el of entries) {
        const match = cat === 'all' || el.dataset.cat === cat;
        if (match) total++;
        const vis = match && (expanded || !initial || shown < initial);
        if (vis) shown++;
        el.hidden = !vis;
      }
      if (moreWrap) moreWrap.hidden = expanded || !initial || total <= initial;
    };
    if (tabs) {
      tabs.hidden = false;
      tabs.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-cat]');
        if (!b || b.getAttribute('aria-pressed') === 'true') return;
        cat = b.dataset.cat;
        expanded = false;
        for (const x of tabs.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b));
        render();
      });
    }
    moreWrap?.querySelector('[data-more]')?.addEventListener('click', () => {
      // 展開後把焦點交給第一則新出現的文章（按鈕會消失，不轉移焦點就會掉到 <body>）
      const firstHidden = entries.find(el => el.hidden && (cat === 'all' || el.dataset.cat === cat));
      expanded = true;
      render();
      firstHidden?.querySelector('h3 a')?.focus();
    });
    render();
  }
})();
