// 首頁動效。全部走漸進增強：JS 沒跑或使用者要求減少動態時，畫面與現況完全一樣。
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/* 統計數字跳動：捲到就跑，離開畫面後重置、捲回來再跑一次（使用者 2026-09-25，同 reveal.js）。
   HTML 裡本來就是最終數字，這裡只是在進場時倒帶重播。 */
function countUp() {
  const cells = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!cells.length || reduced.matches || !('IntersectionObserver' in window)) return;

  const run = (el: HTMLElement) => {
    const raw = el.dataset.count ?? '';
    const target = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(target) || target <= 0) return;
    const node = el.firstChild;                   // 數字的文字節點（<small> 單位不動）
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const grouped = raw.includes(',');
    const dur = 900;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);       // ease-out cubic，末段慢下來
      const v = Math.round(target * eased);
      node.nodeValue = grouped ? v.toLocaleString('en-US') : String(v);
      if (p < 1) requestAnimationFrame(tick);
      else node.nodeValue = raw;                  // 收尾一定回到原始字串
    };
    requestAnimationFrame(tick);
  };

  const done = new WeakSet<Element>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) { done.delete(e.target); continue; }   // 完全離開 → 下次再播
      if (e.intersectionRatio < 0.6 || done.has(e.target)) continue;
      done.add(e.target);
      run(e.target as HTMLElement);
    }
  }, { threshold: [0, 0.6] });
  cells.forEach((c) => io.observe(c));
}

/* 角色的觸控回饋：按一下會輕輕晃一下（桌機的 hover 傾斜已由 CSS 負責）。 */
function charactersReact() {
  const chars = document.querySelector<HTMLElement>('.hero .chars');
  if (!chars || reduced.matches) return;
  chars.addEventListener('pointerdown', () => {
    if (chars.classList.contains('is-wiggling')) return;
    chars.classList.add('is-wiggling');
  });
  chars.addEventListener('animationend', () => chars.classList.remove('is-wiggling'));
}

countUp();
charactersReact();
