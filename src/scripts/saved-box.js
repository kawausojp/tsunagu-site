// /events 的「你收藏的品牌」（2026-10-18 抽出）：緊接在區塊後同步執行，首次繪製前就畫好。
// 原本放在 body 最後的 save.js 裡，Chrome 先畫出頁面才插入這塊，把下一段推出畫面（en 1440px 實測 CLS 0.008）。
// save.js 收藏有變（其他分頁、上一頁快取）時呼叫 window.tsunaguSavedBox(saved) 重畫。
(() => {
  window.tsunaguSavedBox = (saved) => {
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
  };
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('tsunagu:saved') || '[]'); } catch { /* 私密模式等 */ }
  window.tsunaguSavedBox(saved);
})();
