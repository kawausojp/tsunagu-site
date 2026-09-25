// stories 頁頂的學長姐橫捲列（手機單行）：鍵盤 Tab 進來時，瀏覽器預設只捲到「看得到一點」，
// 右側 chip 會卡在畫面邊緣只露一半。聚焦時把它完整捲進可視範圍（2026-09-24 稽核）。
const bar = document.querySelector<HTMLElement>('.jump');
if (bar) {
  bar.addEventListener('focusin', event => {
    const chip = event.target as HTMLElement;
    if (bar.scrollWidth <= bar.clientWidth) return;   // 桌機折行時沒有橫捲
    const pad = parseFloat(getComputedStyle(bar).paddingLeft) || 0;
    const left = chip.offsetLeft - bar.offsetLeft;
    const min = left - pad, max = left + chip.offsetWidth + pad - bar.clientWidth;
    if (bar.scrollLeft > min) bar.scrollLeft = min;
    else if (bar.scrollLeft < max) bar.scrollLeft = max;
  });
}
