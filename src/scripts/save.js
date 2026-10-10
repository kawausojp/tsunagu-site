// 收藏品牌與分享（2026-10-11 使用者選定：參考 104「儲存」、518 愛心、Yourator「收藏職缺」）。
// 收藏清單只存在訪客自己的瀏覽器（localStorage 的品牌 slug 陣列），不上傳、不是個資——
// 官網不蒐集個資的原則不變。localStorage 不能用（私密模式等）時，愛心照樣能按，只是不會被記住。
(() => {
  const KEY = 'tsunagu:saved';
  const read = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } };
  const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* 無法保存：只在這一頁有效 */ } };
  let saved = read();

  const paint = () => {
    for (const b of document.querySelectorAll('[data-save]')) b.setAttribute('aria-pressed', String(saved.has(b.dataset.save)));
    renderSavedBox();
    document.dispatchEvent(new CustomEvent('tsunagu:saved', { detail: saved }));
  };

  // /events 的「你收藏的品牌」：品牌名與網址由頁面以 JSON 提供（data-saved-names）
  function renderSavedBox() {
    const box = document.querySelector('[data-saved-box]');
    if (!box) return;
    let names = {};
    try { names = JSON.parse(box.dataset.savedNames || '{}'); } catch { /* 頁面資料壞掉就不顯示 */ }
    const list = box.querySelector('[data-saved-list]');
    const ids = [...saved].filter((id) => names[id]);
    box.hidden = ids.length === 0;
    if (!list) return;
    list.replaceChildren(...ids.map((id) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = names[id].href; a.textContent = names[id].name;
      li.append(a);
      return li;
    }));
  }

  document.addEventListener('click', async (e) => {
    const save = e.target.closest('[data-save]');
    if (save) {
      e.preventDefault();
      const id = save.dataset.save;
      if (saved.has(id)) saved.delete(id); else saved.add(id);
      write(saved);
      save.classList.remove('pop'); void save.offsetWidth; save.classList.add('pop');
      paint();
      return;
    }
    // 分享：手機叫出系統分享（可直接傳 LINE），不支援的瀏覽器改成複製連結
    const share = e.target.closest('[data-share]');
    if (share) {
      e.preventDefault();
      const url = location.href.split('#')[0];
      if (navigator.share) {
        try { await navigator.share({ title: document.title, url }); } catch { /* 使用者取消 */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        const label = share.querySelector('[data-share-label]');
        const done = share.dataset.copied;
        if (label && done) {
          const orig = label.textContent;
          label.textContent = done;
          setTimeout(() => { label.textContent = orig; }, 2000);
        }
      } catch { /* 無法複製：不做任何事 */ }
    }
  });
  addEventListener('storage', (e) => { if (e.key === KEY) { saved = read(); paint(); } });
  addEventListener('pageshow', (e) => { if (e.persisted) { saved = read(); paint(); } });
  window.tsunaguSaved = () => saved;
  paint();
})();
