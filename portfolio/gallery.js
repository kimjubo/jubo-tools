'use strict';
(async () => {
  const $ = id => document.getElementById(id);
  const groups = [
    {start:1,end:1,label:'소개',en:'Introduction'},
    {start:2,end:7,label:'모션 그래픽 · 애니메이션',en:'Motion & Animation'},
    {start:8,end:33,label:'일러스트레이션',en:'Illustrations'},
    {start:34,end:36,label:'스토리보드',en:'Storyboards'},
    {start:37,end:41,label:'만화',en:'Comics'},
    {start:42,end:44,label:'드로잉 · 기타',en:'Drawing & More'}
  ];
  let slides;
  try {
    const response = await fetch('slides.json?v=20261018-2');
    if (!response.ok) throw new Error('slides');
    slides = await response.json();
    if (!slides.length) throw new Error('empty');
  } catch (error) {
    $('workTitle').textContent = '목록을 불러오지 못했다. 페이지를 새로고침하거나 구글 슬라이드 원본을 열어 주세요.';
    $('next').disabled = true;
    return;
  }
  $('pageTotal').textContent = ` / ${slides.length}`;
  let current = 0;
  const groupFor = n => groups.findIndex(g => n >= g.start && n <= g.end);
  const thumbButtons = slides.map((slide, i) => {
    const button = document.createElement('button');
    button.className = 'thumb';
    button.setAttribute('aria-label', `${i + 1}번 작품: ${slide.title}`);
    button.dataset.group = groupFor(slide.n);
    const img = document.createElement('img');
    img.src = slide.image; img.alt = slide.title; img.loading = 'lazy'; img.width = 320; img.height = 240;
    const caption = document.createElement('span');
    caption.textContent = String(i + 1).padStart(2, '0');
    button.append(img, caption);
    button.addEventListener('click', () => { show(i); $('canvas').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); });
    $('thumbs').append(button);
    return button;
  });
  const chapterButtons = groups.map((group,i) => {
    const button = document.createElement('button'); button.className = 'chapter';
    const num = document.createElement('span'); num.textContent = String(i + 1).padStart(2, '0');
    button.append(num, document.createTextNode(group.label));
    button.addEventListener('click', () => show(slides.findIndex(slide => slide.n >= group.start && slide.n <= group.end)));
    $('chapters').append(button);
    const option = document.createElement('option'); option.value = String(i); option.textContent = group.label; $('filter').append(option);
    return button;
  });
  function show(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[current];
    $('imageError').hidden = true;
    $('artwork').src = slide.image; $('artwork').alt = `${current + 1} / ${slides.length} · ${slide.title}`;
    $('workTitle').textContent = slide.title;
    $('page').textContent = String(current + 1).padStart(2, '0');
    $('largePage').textContent = `${current + 1} / ${slides.length}`;
    if ($('lightbox').open) { $('largeArtwork').src = slide.image; $('largeArtwork').alt = slide.title; }
    [$('prev'),$('largePrev')].forEach(button => button.disabled = current === 0);
    [$('next'),$('largeNext')].forEach(button => button.disabled = current === slides.length - 1);
    thumbButtons.forEach((button,i) => button.setAttribute('aria-current',String(i === current)));
    chapterButtons.forEach((button,i) => button.setAttribute('aria-current',String(i === groupFor(slide.n))));
    if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
    if (slides[current + 1]) { const preload = new Image(); preload.src = slides[current + 1].image; }
  }
  $('artwork').addEventListener('error', () => $('imageError').hidden = false);
  $('artwork').addEventListener('load', () => $('imageError').hidden = true);
  $('retry').addEventListener('click', () => { $('imageError').hidden = true; $('artwork').src = `${slides[current].image}?retry=${Date.now()}`; });
  ['prev','largePrev'].forEach(id => $(id).addEventListener('click', () => show(current - 1)));
  ['next','largeNext'].forEach(id => $(id).addEventListener('click', () => show(current + 1)));
  $('expand').addEventListener('click', () => { $('largeArtwork').src = slides[current].image; $('largeArtwork').alt = slides[current].title; $('lightbox').showModal(); });
  $('close').addEventListener('click', () => $('lightbox').close());
  document.addEventListener('keydown', event => {
    if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });
  [$('canvas'),$('largeArtwork')].forEach(surface => {
    let start = null;
    surface.addEventListener('touchstart', event => { const t = event.touches[0]; start = event.touches.length === 1 ? {x:t.clientX,y:t.clientY} : null; }, {passive:true});
    surface.addEventListener('touchend', event => {
      if (!start || event.touches.length) return;
      const t = event.changedTouches[0], dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
      start = null;
    }, {passive:true});
    surface.addEventListener('touchcancel', () => start = null, {passive:true});
  });
  $('filter').addEventListener('change', event => thumbButtons.forEach(button => button.hidden = event.target.value !== 'all' && button.dataset.group !== event.target.value));
  function fromHash() { const match = location.hash.match(/^#slide-(\d+)$/); show(match ? Number(match[1]) - 1 : 0, false); }
  addEventListener('hashchange',fromHash);
  fromHash();
})();
