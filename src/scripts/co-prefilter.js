// /companies 帶條件進站時（?saved=1、?area=…、從品牌頁「← 回合作企業」回來）先把不符合的卡藏好
// （2026-10-17）：company-filter.ts 是模組腳本，首次繪製後才跑，35 張卡先畫出來再收掉，
// 下方的卡整片往上跳（實測 CLS 0.06–0.10）。這裡緊接在卡片格後同步執行，只做「藏卡」，
// 其餘（計數、chip 狀態、網址）仍由 company-filter.ts 負責；比對規則兩邊要一致。
// 另外替篩選 chip 記下自己的文字（data-label）：CSS 用它預留粗體寬度，選中變粗體時 en 的 chip 不會變寬、把後面的擠開。
(() => {
  for (const b of document.querySelectorAll('button.tag.f:not([data-saved-only])')) b.dataset.label = b.textContent.trim();
  const p = new URLSearchParams(location.search);
  if (![...p.keys()].length) return;
  const grid = document.querySelector('[data-grid]');
  if (!grid) return;
  const norm = (v) => v.normalize('NFKC').toLocaleLowerCase().trim();
  const q = norm(p.get('q') || '');
  // 只認畫面上存在的值（同 company-filter.ts），亂打的參數不會把卡全藏掉
  const valid = {};
  for (const b of document.querySelectorAll('button.f[data-f][data-v]')) (valid[b.dataset.f] ??= new Set()).add(b.dataset.v);
  const pick = (k) => new Set((p.get(k) || '').split(',').filter((v) => valid[k]?.has(v)));
  const area = pick('area'), cat = pick('cat'), jlpt = pick('jlpt'), flag = pick('flag');
  let saved = null;
  if (p.get('saved') === '1') { try { saved = new Set(JSON.parse(localStorage.getItem('tsunagu:saved') || '[]')); } catch { saved = new Set(); } }
  for (const c of grid.querySelectorAll('.co')) {
    const d = c.dataset;
    const ok = (!q || (d.search || '').includes(q))
      && (!area.size || (d.areas || '').split(' ').some((a) => area.has(a)))
      && (!cat.size || cat.has(d.cat || ''))
      && (!jlpt.size || jlpt.has(d.jlpt || 'none'))
      && [...flag].every((f) => d[f] === '1')
      && (!saved || saved.has(d.slug || ''));
    if (!ok) c.style.display = 'none';
  }
})();
