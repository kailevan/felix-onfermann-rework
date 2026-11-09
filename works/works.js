/* Felix Onfermann, desktop Work index, reworked.
   His index (chunk 1yt3xaqnta39o.js) rebuilt 1:1: the "ragged" rows (56px thumbs, 10px apart, rows 82px apart,
   each row breaking at a seeded random 35–100% of the column, seed 24), the hover that dims the rest to 0.35,
   and the sticky preview (series flip every 2.2s, video plays, caption under it).
   Reworked: the rows at Tune → Scale (default 50%), still flush left, breaking at the same fractions of a
   column scaled the same way, so it's his exact index, smaller. The preview gets the right half. */
(() => {
  const CDN = window.FELIX_CDN;
  const GROUPS = [
    { items: window.FELIX_WORK, base: 'work', from: 0 },
    { items: window.FELIX_OTHER || [], base: 'other', from: window.FELIX_WORK.length },
  ].filter((g) => g.items.length);
  const $ = (s) => document.querySelector(s);
  const table = $('#table'), groupsEl = $('#groups'), preview = $('#preview');
  const pad = (n, l = 3) => String(n).padStart(l, '0');
  const src = (img, w) => `${CDN}${img.u}?w=${Math.round(w)}&auto=format&q=80`;
  const srcset = (img, w) => [1, 1.5, 2].map((r) => `${src(img, w * r)} ${r}x`).join(', ');   // his X()
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // his seeded random (mulberry32), verbatim, and his 400 row-break fractions: 0.35 + 0.65 × random
  const rng = (e) => () => { e |= 0; let t = Math.imul((e = (e + 0x6d2b79f5) | 0) ^ (e >>> 15), 1 | e); return (((t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t) ^ (t >>> 14)) >>> 0) / 0x100000000; };
  const R = rng(window.FELIX_SEED ?? 24);
  const FRACS = Array.from({ length: 400 }, () => 0.35 + 0.65 * R());

  let scale = 0.5;

  /* ---------- build ---------- */
  const all = [];       // every thumb, in order across both groups
  const boxes = [];
  GROUPS.forEach((g, gi) => {
    if (gi > 0) { const h = document.createElement('h2'); h.className = 'others micro'; h.textContent = 'other works'; groupsEl.appendChild(h); }
    const box = document.createElement('div');
    box.className = 'thumbs';
    groupsEl.appendChild(box);
    boxes.push(box);
    g.items.forEach((w, n) => {
      const img = w.images[0];
      const a = document.createElement('a');
      a.className = 'th';
      a.href = g.base === 'work' ? `../?w=${encodeURIComponent(w.slug)}` : `https://felixonfermann.com/other/${w.slug}`;
      if (g.base !== 'work') a.target = '_blank';
      a.setAttribute('aria-label', 'open ' + (w.title || `photograph ${pad(n + 1)}`));
      const im = document.createElement('img');
      im.alt = ''; im.decoding = 'async';
      im.width = img.w; im.height = img.h;
      im.className = 'fade';
      if (img.q) { im.style.backgroundImage = `url("${img.q}")`; im.style.backgroundSize = 'cover'; }
      im.onload = () => { im.classList.add('in'); im.style.backgroundImage = ''; };
      a.appendChild(im);
      const lab = document.createElement('span');
      lab.className = 'n micro'; lab.textContent = pad(n + 1);
      a.appendChild(lab);
      const idx = g.from + n;
      a.addEventListener('mouseenter', () => hover(idx));
      a.addEventListener('focus', () => hover(idx));
      box.appendChild(a);
      all.push({ el: a, img: im, w, g, n, pic: img });
    });
    box.addEventListener('mouseleave', () => hover(null));
  });

  /* ---------- his x(): the ragged layout, at Tune → Scale ---------- */
  function layout() {
    const desk = innerWidth >= 900;
    const s = desk ? scale : 1;
    const th = Math.round(56 * s);
    table.style.setProperty('--th', desk ? th + 'px' : '');
    table.style.setProperty('--others-top', Math.round(56 * s) + 'px');
    table.style.setProperty('--others-bottom', Math.round(14 * s) + 'px');
    // the width his rows break against: his column (1 / span 7) at this window, scaled like the thumbs
    const cs = getComputedStyle(table);
    const cw = table.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const gut = parseFloat(cs.columnGap) || 16;
    const hisCol = 7 * ((cw - 11 * gut) / 12) + 6 * gut;
    const gap = Math.round(10 * s);
    const rowH = th + 15 + Math.round(11 * s);             // thumb + 3 + 12 (number) + his 11 → 82 at 100%
    let t = 0;
    GROUPS.forEach((g, gi) => {
      const box = boxes[gi];
      box.classList.toggle('ragged', desk);
      const els = all.filter((x) => x.g === g);
      if (!desk) { box.style.height = ''; els.forEach((x) => { x.el.style.left = x.el.style.top = ''; x.img.src = src(x.pic, 120); }); return; }
      const n = scale === 1 ? box.clientWidth : hisCol * s;
      let a = 0, c = 0;
      els.forEach((x) => {
        const iw = Math.round((th * x.pic.w) / x.pic.h);
        if (a > 0 && (x.w.newRow || a + iw > n * FRACS[(t + c) % FRACS.length])) { c++; a = 0; }
        x.el.style.left = a + 'px';
        x.el.style.top = rowH * c + 'px';
        a += iw + gap;
        x.img.srcset = srcset(x.pic, iw);
        x.img.src = src(x.pic, iw * 2);
      });
      box.style.height = (c + 1) * rowH + 'px';
      t += c + 1;
    });
  }

  /* ---------- hover → preview (his) ---------- */
  let lit = null, flipTimer = 0;
  function hover(idx) {
    if (idx === lit) return;
    lit = idx;
    clearTimeout(flipTimer);
    table.classList.toggle('has-hover', idx != null);
    all.forEach((x, i) => x.el.classList.toggle('lit', i === idx));
    preview.innerHTML = '';
    if (idx == null) return;
    const x = all[idx], w = x.w;
    const big = document.createElement('a');
    big.className = 'big'; big.href = x.el.href; big.tabIndex = -1;
    if (x.el.target) big.target = x.el.target;
    const pw = Math.ceil((preview.clientWidth * DPR) / 100) * 100;
    const clip = w.clips ? w.clips[0] : null;
    if (clip) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = 'metadata';
      v.setAttribute('playsinline', '');
      v.poster = src(x.pic, pw);
      v.width = x.pic.w; v.height = x.pic.h;
      v.src = clip.replace(/(#t=[\d.]+),[\d.]+$/, '$1');
      big.appendChild(v);
      v.play().catch(() => {});
    } else if (w.images.length > 1) {
      big.appendChild(flipper(w.images, pw));
    } else {
      big.appendChild(pic(x.pic, pw));
    }
    preview.appendChild(big);
    const cap = document.createElement('div');
    cap.className = 'cap';
    preview.appendChild(cap);
    writeCap(0);
  }
  function pic(img, pw, cls) {
    const i = document.createElement('img');
    i.src = src(img, Math.min(2400, pw)); i.alt = ''; i.width = img.w; i.height = img.h;
    if (cls) i.className = cls;
    return i;
  }
  // his flipper: the series steps every 2.2s, the new one fades in over the last (0.45s)
  function flipper(images, pw) {
    const el = document.createElement('span');
    el.className = 'flipper flip-fade';
    let c = 0;
    const paint = (prev) => {
      el.innerHTML = '';
      if (prev != null) el.appendChild(pic(images[prev], pw, 'under'));
      el.appendChild(pic(images[c], pw, 'top'));
      new Image().src = src(images[(c + 1) % images.length], Math.min(2400, pw));
      flipTimer = setTimeout(() => { const p = c; c = (c + 1) % images.length; paint(p); writeCap(c); }, 2200);
    };
    paint(null);
    return el;
  }
  function writeCap(k) {
    const cap = preview.querySelector('.cap');
    if (!cap || lit == null) return;
    const x = all[lit], w = x.w, isVideo = !!w.clips;
    const line = w.medium ? [w.medium] : [w.credits, w.images.length > 1 && isVideo ? w.images.length + ' images' : '', isVideo && x.g.base === 'work' ? 'video' : ''];
    cap.innerHTML =
      `<div>${w.title ? `<div class="title">${esc(w.title)}</div>` : ''}` +
      (w.images.length > 1 && !isVideo ? `<div>${pad(k + 1, 2)}/${pad(w.images.length, 2)}</div>` : '') +
      `<div>${esc(line.filter(Boolean).join(' — '))}</div></div>` +
      `<div>${pad(x.n + 1)}/${pad(x.g.items.length)}</div>`;
  }

  let rt = 0, lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; clearTimeout(rt); rt = setTimeout(layout, 120); } });

  /* ---------- Tune ---------- */
  window.FelixTune({
    title: 'Felix · index',
    options: [
      { key: 'scale', label: 'Scale', values: [['50', '50%'], ['65', '65%'], ['100', 'His']] },
      { key: 'nav', label: 'Nav', values: [['caps', 'CAPS'], ['lower', 'lower']] },
    ],
    defaults: { scale: '50', nav: 'caps' },
    onChange: (o) => {
      scale = +o.scale / 100;
      document.body.dataset.scale = o.scale;
      document.body.dataset.nav = o.nav;
      layout();
      if (lit != null) { const l = lit; lit = null; hover(l); }
    },
  });
})();
