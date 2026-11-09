/* Felix Onfermann, Work page, reworked (mobile + desktop).
   The selected work sits centred on the stage, with every work in one strip:
   along the bottom on the phone, down the right on desktop (his breakpoint, 900px).
   Navigation copies his viewer (chunk 2ghhiw1po9ybg.js): a swipe over 40px or a tap on the outer 30%
   walks through a series first, then to the next work; it wraps at both ends.

   Tune → Strip:
     pill   endless, centred; the middle one sits in a grey pill
     plain  the same without the pill: opacity only
     lens   square crops, the middle swells to its true ratio
     fixed  desktop only: the strip doesn't move, every work has the same slice of its height;
            hover or drag picks what's under the pointer and the pill travels there
   Tune → Nav: his caps, or lowercase. */
(() => {
  const WORK = window.FELIX_WORK;
  const CDN = window.FELIX_CDN;
  const N = WORK.length;
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const stage = $('#stage'), meta = $('#meta'), count = $('#count');
  const strip = $('#strip'), track = $('#track'), pill = $('#pill');
  const rowIn = $('#row-in'), rowPill = $('#row-pill');
  const pad = (n, l = 3) => String(n).padStart(l, '0');            // his g()
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const bell = (d, s) => Math.exp(-(d * d) / (2 * s * s));
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  const desk = matchMedia('(min-width: 900px)');

  // his b(): Sanity sizing, auto=format, q=80
  const src = (img, w) => `${CDN}${img.u}?w=${Math.round(w)}&auto=format&q=80`;
  const THUMB_W = 300;

  /* ---------- the strips ----------
     size(ar, d): ar = width/height, d = distance from the middle in works (signed, fractional) → the thumb's box. */
  const linear = (d) => 0.35 + 0.65 * clamp01(1 - Math.abs(d));     // his dim, 0.35
  const lensOp = (d) => 0.35 + 0.65 * bell(d, 0.85);
  const PHONE = {
    pill:  { axis: 'x', gap: 8, size: (ar) => ({ w: 44 * ar, h: 44 }), op: linear, pill: 5 },
    plain: { axis: 'x', gap: 8, size: (ar) => ({ w: 44 * ar, h: 44 }), op: linear },
    lens:  { axis: 'x', gap: 4, op: lensOp,
             size: (ar, d) => { const f = bell(d, 0.85); return { w: 28 + (56 * ar - 28) * f, h: 28 + 28 * f }; } },
  };
  const DESK = {       // the same three stood up: a fixed width, every thumb scaled to it
    pill:  { axis: 'y', gap: 8, size: (ar) => ({ w: 64, h: 64 / ar }), op: linear, pill: 6 },
    plain: { axis: 'y', gap: 8, size: (ar) => ({ w: 64, h: 64 / ar }), op: linear },
    lens:  { axis: 'y', gap: 6, op: lensOp,
             size: (ar, d) => { const f = bell(d, 0.85); return { w: 40 + 40 * f, h: 40 + (80 / ar - 40) * f }; } },
    fixed: { axis: 'y', fixed: true },
  };

  /* ---------- Tune options (shared panel: tune.js) ---------- */
  const OPTIONS = [
    { key: 'strip', label: 'Strip', values: [['pill', 'Pill'], ['plain', 'Plain'], ['lens', 'Lens'], ['fixed', 'Fixed', 'desk-only']] },
    { key: 'nav', label: 'Nav', values: [['caps', 'CAPS'], ['lower', 'lower']] },
  ];
  const DEFAULTS = { strip: 'pill', nav: 'caps' };
  let opt = { ...DEFAULTS };
  body.classList.add('tune-left');     // desktop: the strip owns the right edge

  let D = null, mode = null;

  /* ---------- build: the moving strip (one element per work, placed by wrap-around) ---------- */
  const thumb = (i) => {
    const el = document.createElement('div');
    el.className = 'th';
    el.innerHTML = `<div class="im"><img alt="" decoding="async" draggable="false" src="${src(WORK[i].images[0], THUMB_W)}"></div>`;
    return el;
  };
  const thumbs = WORK.map((w, i) => {
    const el = thumb(i);
    track.appendChild(el);
    const img = w.images[0];
    return { el, ar: img.w / img.h, x: 0, w: 0, h: 0, len: 0, k: 0, d: 0 };
  });
  /* ---------- build: the fixed column ---------- */
  const rowThumbs = WORK.map((w, i) => { const el = thumb(i); rowIn.appendChild(el); return el; });

  // opened from the index (works/): ?w=<slug> starts on that work
  const startSlug = new URLSearchParams(location.search).get('w');
  let pos = Math.max(0, WORK.findIndex((w) => w.slug === startSlug));   // fractional index of the work in the middle (moving strips)
  let current = -1;         // the work on the stage
  let series = 0;           // image within that work's series
  let stepFwd = 60, stepBack = 60;

  function layout() {
    if (!D || D.fixed) return;
    const c = Math.floor(pos), frac = pos - c;
    const half = N / 2, Y = D.axis === 'y';
    const slots = [];
    thumbs.forEach((t, i) => {
      let k = mod(i - c, N); if (k > half) k -= N;
      const d = k - frac;
      const s = D.size(t.ar, d);
      t.k = k; t.d = d; t.w = s.w; t.h = s.h;
      t.len = Y ? s.h : s.w;
      slots[k + N] = t;
    });
    const at = (k) => slots[k + N];
    const step = (a, b) => at(a).len / 2 + D.gap + at(b).len / 2;
    const kMin = -Math.floor((N - 1) / 2), kMax = Math.ceil((N - 1) / 2);
    stepFwd = step(0, 1); stepBack = step(-1, 0);
    at(0).x = -frac * stepFwd;                  // the point at d = 0 is the strip's centre
    for (let k = 1; k <= kMax; k++) at(k).x = at(k - 1).x + step(k - 1, k);
    for (let k = -1; k >= kMin; k--) at(k).x = at(k + 1).x - step(k, k + 1);

    const on = mod(Math.round(pos), N);
    thumbs.forEach((t) => {
      const s = t.el.style;
      s.width = t.w.toFixed(2) + 'px';
      s.height = t.h.toFixed(2) + 'px';
      const tx = Y ? -t.w / 2 : t.x - t.w / 2;
      const ty = Y ? t.x - t.h / 2 : -t.h / 2;
      s.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      s.opacity = D.op(t.d).toFixed(3);
    });

    if (D.pill) {             // the fixed marker in the middle, blended between this one and the next
      const a = at(0), b = at(1), p = D.pill;
      const mw = a.w + (b.w - a.w) * frac, mh = a.h + (b.h - a.h) * frac;
      pill.style.width = (mw + 2 * p) + 'px';
      pill.style.height = (mh + 2 * p) + 'px';
      pill.style.transform = `translate3d(${-(mw / 2 + p)}px, ${-(mh / 2 + p)}px, 0)`;
    }
    if (on !== current) select(on);
  }

  /* ---------- fixed: the pill + opacity travel along a still column ---------- */
  function markRow(animate = true) {
    if (!D || !D.fixed || current < 0) return;
    const el = rowThumbs[current];
    rowThumbs.forEach((t, i) => t.classList.toggle('on', i === current));
    rowPill.classList.toggle('no-anim', !animate);
    rowPill.style.height = (el.offsetHeight + 8) + 'px';
    rowPill.style.transform = `translate3d(0, ${el.offsetTop - 4}px, 0)`;
  }
  function scrubAt(y) {
    const a = rowThumbs[0].getBoundingClientRect(), b = rowThumbs[N - 1].getBoundingClientRect();
    const i = Math.max(0, Math.min(N - 1, Math.floor(((y - a.top) / (b.bottom - a.top)) * N)));
    if (i !== current) { entryFromEnd = false; select(i); }
  }

  /* ---------- the stage ---------- */
  let entryFromEnd = false;   // stepping back into a series lands on its last image (his k())

  function select(i) {
    const fromEnd = entryFromEnd; entryFromEnd = false;
    const dirBack = current >= 0 && mod(i - current, N) > N / 2;
    current = i;
    series = fromEnd && dirBack ? WORK[i].images.length - 1 : 0;
    show();
    markRow();
  }

  function fit(ar) {
    const r = stage.getBoundingClientRect();
    const maxW = Math.min(r.width, 1100);              // his max-width: min(100%, 1100px)
    let w = maxW, h = w / ar;
    if (h > r.height) { h = r.height; w = h * ar; }
    return { w: Math.round(w), h: Math.round(h) };
  }

  let settleTimer = 0;
  function show() {
    const w = WORK[current];
    const img = w.images[Math.min(series, w.images.length - 1)];
    const clip = w.clips ? (w.clips[series] || w.clips[0]) : null;
    const ar = img.w / img.h;
    const box = fit(ar);
    const layer = document.createElement('div');
    layer.className = 'layer';
    let media;
    if (clip) {
      media = document.createElement('video');
      media.muted = true; media.loop = true; media.playsInline = true; media.autoplay = true;
      media.setAttribute('playsinline', ''); media.setAttribute('muted', '');
      media.preload = 'auto';
      media.poster = src(img, box.w * DPR);
      media.src = clip.replace(/(#t=[\d.]+),[\d.]+$/, '$1');   // his B(): keep the start, drop the end
    } else {
      media = document.createElement('img');
      media.alt = w.title || `photograph ${pad(current + 1)}`;
      media.decoding = 'async';
      media.src = src(img, Math.min(2200, Math.ceil((box.w * DPR) / 100) * 100));
    }
    // what's already in the browser (the strip thumb, or his lqip) paints under it at once
    const under = series === 0 ? src(img, THUMB_W) : null;
    media.style.backgroundImage = [under && `url("${under}")`, img.q && `url("${img.q}")`].filter(Boolean).join(',');
    media.style.width = box.w + 'px';
    media.style.height = box.h + 'px';
    media.dataset.ar = ar;
    layer.appendChild(media);
    stage.appendChild(layer);
    if (clip) media.play().catch(() => {});

    // crossfade: the new one in, the old ones out (his .fade, 0.3s)
    const layers = [...stage.querySelectorAll('.layer')];
    requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('in')));
    layers.slice(0, -1).forEach((old, j, arr) => {
      old.classList.remove('in');
      if (j < arr.length - 2) old.remove();                     // fast scrubbing: never more than 3
      else setTimeout(() => { old.querySelector('video')?.pause(); old.remove(); }, 340);
    });

    writeMeta();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(prefetch, 300);
  }

  function writeMeta() {
    const w = WORK[current];
    let html = '';
    if (w.title) html += `<div class="t title">${esc(w.title)}</div>`;
    if (w.credits) html += `<div class="t">${esc(w.credits)}</div>`;
    if (w.images.length > 1) html += `<div>${pad(series + 1, 2)}/${pad(w.images.length, 2)}</div>`;
    meta.innerHTML = html;
    count.textContent = `${pad(current + 1)}/${pad(N)}`;
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // his router.prefetch(prev/next): warm the neighbours once the stage settles
  function prefetch() {
    for (const i of [current - 1, current + 1]) {
      const w = WORK[mod(i, N)];
      if (w.clips) continue;
      const img = w.images[0];
      const box = fit(img.w / img.h);
      new Image().src = src(img, Math.min(2200, Math.ceil((box.w * DPR) / 100) * 100));
    }
  }

  /* ---------- motion: drag, flick, wheel, spring (moving strips) ---------- */
  const K = 210, C = 2 * Math.sqrt(K) * 0.92;   // near-critical: no wobble, no drag
  let vel = 0, target = null, raf = 0, last = 0;

  function tick(t) {
    const dt = Math.min(0.032, (t - (last || t)) / 1000) || 0.016;
    last = t;
    if (target !== null) {
      const a = -K * (pos - target) - C * vel;
      vel += a * dt; pos += vel * dt;
      if (Math.abs(pos - target) < 0.0004 && Math.abs(vel) < 0.002) {
        pos = mod(target, N); vel = 0; target = null;
      }
    }
    layout();
    raf = target !== null ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  }
  function animateTo(t, v) {
    target = t; if (v !== undefined) vel = v;
    if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
  }

  const coord = (e) => (D.axis === 'y' ? e.clientY : e.clientX);
  let drag = null;
  strip.addEventListener('pointerdown', (e) => {
    strip.setPointerCapture(e.pointerId);
    if (D.fixed) { drag = { scrub: true }; strip.classList.add('is-scrub'); scrubAt(e.clientY); return; }
    target = null; vel = 0;
    const c0 = coord(e);
    drag = { c: c0, c0, t0: performance.now(), samples: [[performance.now(), pos]], moved: 0 };
    strip.classList.add('is-drag');
  });
  strip.addEventListener('pointermove', (e) => {
    if (D.fixed) {                                   // fixed: a drag, or just the mouse hovering over it
      if (drag || e.pointerType === 'mouse') { strip.classList.add('is-scrub'); scrubAt(e.clientY); }
      return;
    }
    if (!drag) return;
    const c1 = coord(e), dx = c1 - drag.c;
    drag.c = c1;
    drag.moved = Math.max(drag.moved, Math.abs(c1 - drag.c0));
    pos -= dx / (dx < 0 ? stepFwd : stepBack);
    const now = performance.now();
    drag.samples.push([now, pos]);
    while (drag.samples.length > 2 && now - drag.samples[0][0] > 90) drag.samples.shift();
    if (!raf) requestAnimationFrame(() => layout());
  });
  strip.addEventListener('pointerleave', () => { if (!drag) strip.classList.remove('is-scrub'); });
  const end = (e) => {
    if (!drag) return;
    strip.classList.remove('is-drag', 'is-scrub');
    const d = drag; drag = null;
    if (d.scrub) return;
    if (d.moved < 6 && performance.now() - d.t0 < 400) {        // a tap: go to the thumb under the pointer
      const r = strip.getBoundingClientRect();
      const p = D.axis === 'y' ? e.clientY - r.top - r.height / 2 : e.clientX - r.left - r.width / 2;
      let best = null;
      for (const t of thumbs) if (!best || Math.abs(t.x - p) < Math.abs(best.x - p)) best = t;
      animateTo(Math.round(pos) + best.k, 0);
      return;
    }
    const [t0, p0] = d.samples[0], [t1, p1] = d.samples[d.samples.length - 1];
    const v = t1 > t0 ? ((p1 - p0) / (t1 - t0)) * 1000 : 0;      // works per second
    const throwN = Math.max(-14, Math.min(14, v * 0.24));
    animateTo(Math.round(pos + throwN), v);
  };
  strip.addEventListener('pointerup', end);
  strip.addEventListener('pointercancel', end);

  // wheel / trackpad anywhere scrolls through the works; the strip settles on one when you stop
  let wheelTimer = 0, wheelAcc = 0;
  addEventListener('wheel', (e) => {
    if (e.target.closest && e.target.closest('.tune')) return;
    const dlt = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    const px = e.deltaMode === 1 ? dlt * 16 : dlt;
    if (D.fixed) {
      wheelAcc += px;
      while (Math.abs(wheelAcc) >= 60) { const s = Math.sign(wheelAcc); wheelAcc -= s * 60; entryFromEnd = false; select(mod(current + s, N)); }
      return;
    }
    target = null; vel = 0;
    pos += px / (px > 0 ? stepFwd : stepBack);
    if (!raf) requestAnimationFrame(() => layout());
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => animateTo(Math.round(pos), 0), 140);
  }, { passive: true });

  /* ---------- his k(): one step, series first, then the next work ---------- */
  function go(d) {
    const w = WORK[current];
    const n = series + d;
    const settlingHere = D.fixed || target === null || mod(target, N) === current;
    if (n >= 0 && n < w.images.length && settlingHere) { series = n; show(); return; }
    entryFromEnd = d < 0;
    if (D.fixed) { select(mod(current + d, N)); return; }
    const base = target !== null ? target : Math.round(pos);
    animateTo(base + d);
  }

  // stage swipe, his threshold (40px)
  let sx = null, sy = null, swiped = 0;
  const viewer = $('#viewer');
  viewer.addEventListener('touchstart', (e) => {
    if (strip.contains(e.target)) { sx = null; return; }
    sx = e.touches.length === 1 ? e.touches[0].clientX : null; sy = e.touches[0].clientY;
  }, { passive: true });
  viewer.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = performance.now(); go(dx < 0 ? 1 : -1); }
  });
  $('.zone.prev').addEventListener('click', () => { if (performance.now() - swiped > 400) go(-1); });
  $('.zone.next').addEventListener('click', () => { if (performance.now() - swiped > 400) go(1); });
  document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.step)));
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
  });

  /* ---------- apply the options ---------- */
  function apply() {
    const set = desk.matches ? DESK : PHONE;
    mode = set[opt.strip] ? opt.strip : 'pill';     // fixed is desktop-only; the phone falls back to pill
    D = set[mode];
    body.dataset.strip = mode;
    body.dataset.nav = opt.nav;
    target = null; vel = 0;
    if (current >= 0) pos = current;                // every strip opens on the work you're looking at
    refit();
    if (current < 0) select(mod(Math.round(pos), N));
    markRow(false);
  }
  function refit() {
    stage.querySelectorAll('.layer img, .layer video').forEach((m) => {
      const box = fit(+m.dataset.ar);
      m.style.width = box.w + 'px'; m.style.height = box.h + 'px';
    });
    layout();
  }
  addEventListener('resize', () => { refit(); markRow(false); });
  desk.addEventListener('change', apply);

  /* ---------- Tune ---------- */
  opt = window.FelixTune({ title: 'Felix', options: OPTIONS, defaults: DEFAULTS, onChange: (o) => { opt = o; apply(); } });
})();
