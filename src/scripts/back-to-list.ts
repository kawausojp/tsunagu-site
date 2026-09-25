// 品牌詳情頁的「← 回合作企業」：從篩選過的列表點進來時，回到同樣的篩選結果。
// 列表頁（company-filter.ts）把目前網址存進 sessionStorage；語言不同（路徑不同）就不套用。
const link = document.querySelector<HTMLAnchorElement>('a[data-back-list]');
if (link) {
  try {
    const saved = sessionStorage.getItem('tsunagu:co-list');
    if (saved) {
      const target = new URL(saved, location.origin);
      const strip = (p: string) => p.replace(/\/$/, '');
      if (strip(target.pathname) === strip(new URL(link.href).pathname) && target.search) {
        link.href = target.pathname + target.search;
      }
    }
  } catch { /* sessionStorage 不可用時維持原連結 */ }
}
