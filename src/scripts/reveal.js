// 捲動進場動效（使用者 2026-09-25：每個區塊捲到時播一次，而且每次捲回來都重播，不是載入後只動一次）。
//
// 以 is:inline 放在 <body> 最後同步執行（Base.astro 用 ?raw 讀進來），所以標記 data-rv、
// 把還沒進畫面的元素藏起來，都發生在首次繪製前——不會先閃出內容再消失。
// 漸進增強：JS 沒跑、或使用者系統設定「減少動態效果」時，什麼都不藏、什麼都不動。
(() => {
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // [選擇器, 效果]。效果的 keyframes 在 global.css（搜 data-rv）。
  // 會交錯（stagger）的是「一起進畫面的兄弟元素」，所以列表／格線要標到子元素，不要標容器。
  const RULES = [
    ['.hero-inner > :not(.chars)', 'rise'],          // 角色另有點擊晃動動畫，兩個 animation 會互搶，不加
    ['.page-head .d1, .section .d2, .page-section > .d2, .page-section > h2', 'title'],
    ['.band .stat', 'pop'],
    ['.grid3 > *, #company-grid > *, .upcoming-list > *, .reasons > *, .numbers > *, .grid-2 > *, ' +
     '.contact-panel > *, .list > .item, .flow > *', 'card'],
    ['.rows > *', 'slide'],
    ['.video', 'zoom'],
    ['.final-chars', 'bounce'],
    ['.page-head .lead, .page-head .small, .section .lead, .co-side > .action-link, .voice, .more, ' +
     '.final .cta-row, .cta-box, .hl, .prose, .notice, .tools', 'rise'],
  ];

  const els = [];
  for (const [sel, fx] of RULES) {
    for (const el of document.querySelectorAll(sel)) {
      if (el.hasAttribute('data-rv')) continue;       // 先配到的規則優先
      el.setAttribute('data-rv', fx);
      els.push(el);
    }
  }
  if (!els.length) return;
  document.documentElement.classList.add('rv');

  // 進場：元素頂端越過畫面 88% 那條線就播。同一批進場的依序錯開 90ms（上限 6 個，避免尾巴等太久）
  const enter = new IntersectionObserver((entries) => {
    let n = 0;
    for (const e of entries) {
      if (!e.isIntersecting || e.target.classList.contains('is-in')) continue;
      e.target.style.setProperty('--rv-d', `${Math.min(n++, 6) * 90}ms`);
      e.target.classList.add('is-in');
    }
  }, { rootMargin: '0px 0px -12% 0px' });

  // 離場：完全離開畫面才重置，下次捲回來會再播一次。
  // 用另一個不縮邊的 observer：否則往上捲時，元素還露在畫面底部那 12% 就先被藏掉
  const leave = new IntersectionObserver((entries) => {
    for (const e of entries) if (!e.isIntersecting) e.target.classList.remove('is-in');
  });

  for (const el of els) { enter.observe(el); leave.observe(el); }
})();
