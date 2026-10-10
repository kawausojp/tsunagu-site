// 手機右下角的浮動報名鈕（使用者 2026-10-11：手機頁首沒有報名鈕，主要流量又來自 IG 的手機用戶）。
// 只在「畫面上沒有其他主按鈕、也沒捲到 footer」時出現：hero／結尾的粉色主鈕還看得到時不重複出現，
// 也不蓋住 footer 的連結。/events（報名頁本身）不輸出這顆鈕（Base.astro）。
(() => {
  const fab = document.querySelector('.fab');
  if (!fab || !('IntersectionObserver' in window)) return;
  const seen = new Set();
  const update = () => fab.toggleAttribute('data-show', scrollY > innerHeight * 0.6 && seen.size === 0);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
    update();
  });
  for (const el of document.querySelectorAll('main .btn-primary, footer')) io.observe(el);
  addEventListener('scroll', update, { passive: true });
  update();
})();
