// 合作企業列表的搜尋／篩選。三語共用同一份邏輯，顯示字串由頁面的 data-* 傳入
// （原本三個語言各自複製一份 inline script，改邏輯要同步三處，容易漏）。
const KEYS = ['area', 'cat', 'jlpt', 'flag'] as const;
type Key = (typeof KEYS)[number];

export function initCompanyFilter() {
  const root = document.querySelector<HTMLElement>('[data-filter-root]');
  const grid = document.querySelector<HTMLElement>('[data-grid]');
  const searchEl = document.querySelector<HTMLInputElement>('[data-search-input]');
  const statusEl = document.querySelector<HTMLElement>('[data-status]');
  if (!root || !grid || !searchEl || !statusEl) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.co'));
  const emptyEl = document.querySelector<HTMLElement>('[data-empty]');
  const resetEls = Array.from(document.querySelectorAll<HTMLElement>('[data-reset]'));
  const filterOptions = document.querySelector<HTMLDetailsElement>('[data-filter-options]');
  const summaryEl = document.querySelector<HTMLElement>('[data-filter-summary]');
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('button.f'));

  const statusTpl = root.dataset.statusTpl ?? '{n}';
  const summaryLabel = root.dataset.summaryLabel ?? '';
  const summaryPicked = root.dataset.summaryPicked ?? '{n}';
  const fill = (tpl: string, n: number) => tpl.replace('{n}', String(n));

  const active: Record<Key, Set<string>> = {
    area: new Set(), cat: new Set(), jlpt: new Set(), flag: new Set(),
  };
  const mobile = window.matchMedia('(max-width: 720px)');
  const normalise = (v: string) => v.normalize('NFKC').toLocaleLowerCase().trim();

  function matches(c: HTMLElement) {
    const q = normalise(searchEl!.value);
    if (q && !(c.dataset.search || '').includes(q)) return false;
    if (active.area.size && !(c.dataset.areas || '').split(' ').some(a => active.area.has(a))) return false;
    if (active.cat.size && !active.cat.has(c.dataset.cat || '')) return false;
    if (active.jlpt.size && !active.jlpt.has(c.dataset.jlpt || 'none')) return false;
    // 布林條件是「而且」：勾了兩個就要兩個都符合
    for (const flag of active.flag) if (c.dataset[flag] !== '1') return false;
    return true;
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (searchEl!.value.trim()) params.set('q', searchEl!.value.trim());
    for (const k of KEYS) if (active[k].size) params.set(k, [...active[k]].join(','));
    const qs = params.toString();
    history.replaceState(null, '', (qs ? `?${qs}` : location.pathname) + location.hash);
  }

  function apply(updateUrl = true) {
    let n = 0;
    for (const c of cards) {
      const show = matches(c);
      c.style.display = show ? '' : 'none';
      if (show) n++;
    }
    statusEl!.textContent = fill(statusTpl, n);
    if (emptyEl) emptyEl.hidden = n > 0;
    const picked = KEYS.reduce((sum, k) => sum + active[k].size, 0);
    const any = searchEl!.value.length > 0 || picked > 0;
    for (const el of resetEls) if (el.hasAttribute('data-reset-toggle')) el.hidden = !any;
    if (summaryEl) summaryEl.textContent = picked ? fill(summaryPicked, picked) : summaryLabel;
    if (updateUrl) syncUrl();
  }

  function reset() {
    searchEl!.value = '';
    for (const k of KEYS) active[k].clear();
    for (const b of buttons) b.setAttribute('aria-pressed', 'false');
    // 桌面把焦點還給搜尋框；行動版搶焦會彈出鍵盤蓋住結果，改交給結果列
    // （這顆按鈕 apply() 後會 hidden，不轉移焦點就會掉到 <body>）
    if (!mobile.matches) searchEl!.focus();
    else { statusEl!.setAttribute('tabindex', '-1'); statusEl!.focus(); }
    apply();
  }

  // 還原網址帶的條件（分享連結、上一頁都能回到同樣的結果）
  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) searchEl.value = q;
  // 只接受畫面上真的存在的值，否則會出現「已選 4」但一顆 chip 都沒亮的死結
  const valid: Record<string, Set<string>> = {};
  for (const b of buttons) {
    const f = b.dataset.f, v = b.dataset.v;
    if (f && v) (valid[f] ??= new Set()).add(v);
  }
  let dropped = false;
  for (const k of KEYS) {
    const raw = params.get(k);
    if (!raw) continue;
    for (const v of raw.split(',').filter(Boolean)) {
      if (valid[k]?.has(v)) active[k].add(v);
      else dropped = true;
    }
  }
  for (const b of buttons) {
    const f = b.dataset.f as Key | undefined;
    const v = b.dataset.v;
    if (f && v && active[f]?.has(v)) b.setAttribute('aria-pressed', 'true');
  }

  if (dropped) syncUrl();   // 把垃圾參數清出網址

  searchEl.addEventListener('input', () => apply());
  for (const b of buttons) {
    b.addEventListener('click', () => {
      const f = b.dataset.f as Key;
      const v = b.dataset.v!;
      if (active[f].has(v)) { active[f].delete(v); b.setAttribute('aria-pressed', 'false'); }
      else { active[f].add(v); b.setAttribute('aria-pressed', 'true'); }
      apply();
    });
  }
  for (const el of resetEls) el.addEventListener('click', reset);

  if (filterOptions && mobile.matches) filterOptions.open = false;
  if (filterOptions) filterOptions.dataset.ready = '';
  mobile.addEventListener('change', event => {
    if (filterOptions) filterOptions.open = !event.matches;
  });

  apply(false);
}
