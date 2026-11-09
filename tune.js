/* Tune: the prototype panel from Kai's portfolio, 1:1. Options live in the URL (?key=value; defaults are left out).
   FelixTune({ title, options: [{ key, label, values: [[value, label, class?]] }], defaults, onChange(opt) }) → opt */
window.FelixTune = function ({ title, options, defaults, onChange }) {
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  if (params.get('ui') === '0') document.body.classList.add('no-ui');
  const opt = {};
  options.forEach((o) => { const v = params.get(o.key); opt[o.key] = o.values.some((p) => p[0] === v) ? v : defaults[o.key]; });

  const tune = $('#tune'), toggle = $('#tune-toggle');
  const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const sync = () => tune.querySelectorAll('.seg button').forEach((b) => b.setAttribute('aria-pressed', String(opt[b.dataset.key] === b.dataset.val)));
  function set(key, val) {
    opt[key] = val;
    const q = new URLSearchParams(location.search);
    options.forEach((o) => { if (opt[o.key] === defaults[o.key]) q.delete(o.key); else q.set(o.key, opt[o.key]); });
    const qs = q.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) {}
    sync();
    onChange(opt);
  }

  const head = mk('div', 'tune-title');
  head.appendChild(mk('span', null, title));
  const close = mk('button', null, 'Close'); close.type = 'button';
  close.addEventListener('click', () => { tune.hidden = true; toggle.setAttribute('aria-expanded', 'false'); });
  head.appendChild(close);
  tune.appendChild(head);
  options.forEach((o) => {
    const r = mk('div', 'tune-row');
    r.appendChild(mk('span', null, o.label));
    const seg = mk('div', 'seg');
    o.values.forEach(([val, label, cls]) => {
      const b = mk('button', cls || null, label); b.type = 'button';
      b.dataset.key = o.key; b.dataset.val = val;
      b.addEventListener('click', () => set(o.key, val));
      seg.appendChild(b);
    });
    r.appendChild(seg);
    tune.appendChild(r);
  });
  const foot = mk('div', 'tune-foot');
  const reset = mk('button', null, 'Reset'); reset.type = 'button';
  reset.addEventListener('click', () => Object.keys(defaults).forEach((k) => set(k, defaults[k])));
  foot.appendChild(reset);
  tune.appendChild(foot);
  sync();
  toggle.addEventListener('click', () => { tune.hidden = !tune.hidden; toggle.setAttribute('aria-expanded', String(!tune.hidden)); });
  ['pointerdown', 'touchstart', 'wheel'].forEach((ev) => tune.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));

  onChange(opt);
  return opt;
};
