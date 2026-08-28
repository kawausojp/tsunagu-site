// 影片門面：按下才建立 iframe。在此之前不對 Google 發出任何請求。
const btn = document.querySelector<HTMLButtonElement>('.video-play');
if (btn) {
  btn.addEventListener('click', () => {
    const id = btn.dataset.videoId;
    if (!id) return;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    frame.title = btn.querySelector('.vp-title')?.textContent ?? '';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    btn.replaceWith(frame);
    frame.focus();
  }, { once: true });
}
