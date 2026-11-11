'use strict';
/* Interactive demos for F1 Ch5: angle pictures, the angle dial (5.1), the angle-sum triangle (5.2), the slicer (5.4). */
const DEMO = (() => {
  const { V, mk } = G;
  const R = Math.PI / 180;
  const f2 = x => Math.round(x * 100) / 100;

  function svgPoint(svg, e) {
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const r = p.matrixTransform(svg.getScreenCTM().inverse());
    return [r.x, r.y];
  }
  // point at distance r from c, direction a degrees measured anticlockwise from "east" (as on paper)
  const polar = (c, r, a) => [c[0] + r * Math.cos(a * R), c[1] - r * Math.sin(a * R)];
  // an arc from angle a1 to a2 (anticlockwise, a2 > a1) as a path made of short steps: correct for any size up to 360°
  function arcPath(c, r, a1, a2) {
    const n = Math.max(2, Math.ceil((a2 - a1) / 4));
    let d = '';
    for (let i = 0; i <= n; i++) { const p = polar(c, r, a1 + (a2 - a1) * i / n); d += (i ? ' L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    return d;
  }

  const TYPES = [
    ['Acute angle', d => d > 0 && d < 90, 'greater than 0° and less than 90°'],
    ['Right angle', d => d === 90, '90°'],
    ['Obtuse angle', d => d > 90 && d < 180, 'greater than 90° and less than 180°'],
    ['Straight angle', d => d === 180, '180°'],
    ['Reflex angle', d => d > 180 && d < 360, 'greater than 180° and less than 360°'],
    ['Round angle', d => d === 360, '360°'],
  ];
  const typeOf = d => (TYPES.find(t => t[1](d)) || ['—'])[0];

  /* ---------- a plain picture of an angle of `deg` degrees ---------- */
  function angleInto(g, c, deg, o = {}) {
    const rot = o.rot || 0, L = o.len || 60, r = o.arc || 20;
    const col = o.col || 'var(--ink)';
    const A = polar(c, L, rot), B = polar(c, L, rot + deg);
    mk('line', { x1: c[0], y1: c[1], x2: f2(A[0]), y2: f2(A[1]), class: 'seg' }, g);
    if (deg !== 360) mk('line', { x1: c[0], y1: c[1], x2: f2(B[0]), y2: f2(B[1]), class: 'seg' }, g);
    if (deg === 90) {
      const s = 11, p1 = polar(c, s, rot), p3 = polar(c, s, rot + 90), p2 = [p1[0] + p3[0] - c[0], p1[1] + p3[1] - c[1]];
      mk('path', { d: `M${f2(p1[0])} ${f2(p1[1])} L${f2(p2[0])} ${f2(p2[1])} L${f2(p3[0])} ${f2(p3[1])}`, class: 'mark', stroke: col }, g);
    } else if (deg > 0) {
      mk('path', { d: arcPath(c, r, rot, rot + deg), class: 'mark', stroke: col, 'stroke-width': 1.6 }, g);
    }
    mk('circle', { cx: c[0], cy: c[1], r: 2.4, class: 'dot' }, g);
    if (o.label) {
      const p = polar(c, deg === 90 ? 26 : r + 14 + (deg < 40 ? 10 : 0), rot + deg / 2);
      mk('text', { x: f2(p[0]), y: f2(p[1]), class: 'txt' }, g).textContent = o.label;
    }
  }
  function angleSvg(deg, o = {}) {
    const w = o.w || 170, h = o.h || 140;
    const svg = mk('svg', { viewBox: `0 0 ${w} ${h}`, class: 'fig', role: 'img', 'aria-label': o.alt || 'An angle' });
    svg.style.maxWidth = (o.maxw || Math.round(w * 1.3)) + 'px';
    angleInto(svg, [w / 2, h / 2], deg, o);
    return svg;
  }
  // a row of cards: one picture per type of angle
  function angleRow(list) {
    return U.el('div', { class: 'cards angle-cards' }, list.map(([deg, name, size, rot]) => U.el('div', { class: 'mini-card' },
      U.el('div', { class: 'fig-wrap' }, angleSvg(deg, { rot: rot || 0, len: 52, w: 150, h: 124 })),
      U.el('div', { class: 'mini-ttl', text: name }), U.el('div', { class: 'small muted', text: size }))));
  }

  /* ---------- the angle dial ---------- */
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function frac(n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return String(n);
    const w = Math.floor(n / d), r = n - w * d;
    return w ? `${w}\\dfrac{${r}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  }
  function dial() {
    const W = 340, H = 250, c = [170, 128];
    const box = U.el('div', { class: 'demo' });
    box.append(U.el('div', { class: 'demo-title', text: 'Try it: turn the arm' }),
      U.el('p', { class: 'small', text: 'Drag the blue arm round the point (or use the buttons). Watch the name of the angle change.' }));
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fig', role: 'img', 'aria-label': 'Angle dial' });
    svg.style.maxWidth = '520px';
    const name = U.el('div', { class: 'dial-name', 'aria-live': 'polite' });
    const facts = U.el('div', { class: 'dial-facts' });
    let deg = 50;
    function draw() {
      U.clear(svg);
      mk('circle', { cx: c[0], cy: c[1], r: 100, fill: 'none', stroke: 'var(--blue-tint-2)', 'stroke-width': 1 }, svg);
      for (let a = 0; a < 360; a += 30) { const p = polar(c, 100, a), q = polar(c, a % 90 ? 95 : 90, a); mk('line', { x1: f2(p[0]), y1: f2(p[1]), x2: f2(q[0]), y2: f2(q[1]), stroke: 'var(--blue-tint-2)', 'stroke-width': 1.5 }, svg); }
      const A = polar(c, 100, 0), B = polar(c, 100, deg);
      mk('path', { d: `M${c[0]} ${c[1]} L${arcPath(c, 30, 0, deg).slice(1)} Z`, fill: 'var(--blue)', 'fill-opacity': 0.14 }, svg);
      mk('line', { x1: c[0], y1: c[1], x2: A[0], y2: A[1], class: 'seg' }, svg);
      if (deg === 90) { mk('path', { d: `M${c[0] + 12} ${c[1]} L${c[0] + 12} ${c[1] - 12} L${c[0]} ${c[1] - 12}`, class: 'mark', stroke: 'var(--ink)' }, svg); }
      else mk('path', { d: arcPath(c, 30, 0, deg), class: 'mark', stroke: 'var(--ink)', 'stroke-width': 1.6 }, svg);
      mk('line', { x1: c[0], y1: c[1], x2: f2(B[0]), y2: f2(B[1]), stroke: 'var(--blue)', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      const hnd = mk('circle', { cx: f2(B[0]), cy: f2(B[1]), r: 9, fill: 'var(--blue)', style: 'cursor:grab' }, svg);
      mk('circle', { cx: f2(B[0]), cy: f2(B[1]), r: 24, fill: 'transparent', style: 'cursor:grab' }, svg);
      mk('circle', { cx: c[0], cy: c[1], r: 3, class: 'dot' }, svg);
      const lp = polar(c, 52, deg / 2);
      mk('text', { x: f2(lp[0]), y: f2(lp[1]), class: 'tag', 'dominant-baseline': 'central' }, svg).textContent = deg + '°';
      void hnd;
      name.textContent = typeOf(deg);
      facts.innerHTML = TEX.render(`$${deg}^\\circ = ${frac(deg, 90)}$ right angle${deg > 90 ? 's' : ''} $= ${frac(deg, 180)}$ straight angle${deg > 180 ? 's' : ''} $= ${frac(deg, 360)}$ round angle`);
    }
    const set = d => { deg = Math.max(1, Math.min(360, Math.round(d))); draw(); };
    let dragging = false;
    const move = e => {
      const p = svgPoint(svg, e);
      let a = Math.atan2(c[1] - p[1], p[0] - c[0]) / R;
      if (a <= 0) a += 360;
      for (const s of [90, 180, 270, 360]) if (Math.abs(a - s) < 3) a = s;
      if (a < 3) a = 360;
      set(a);
    };
    svg.addEventListener('pointerdown', e => { e.preventDefault(); dragging = true; svg.setPointerCapture(e.pointerId); move(e); });
    svg.addEventListener('pointermove', e => { if (dragging) move(e); });
    svg.addEventListener('pointerup', () => { dragging = false; });
    svg.addEventListener('pointercancel', () => { dragging = false; });
    const btn = (t, fn) => U.el('button', { type: 'button', class: 'btn ghost small', text: t, onclick: fn });
    box.append(U.el('div', { class: 'fig-wrap' }, svg), name, facts,
      U.el('div', { class: 'btn-row' }, btn('−1°', () => set(deg - 1)), btn('+1°', () => set(deg + 1)), btn('45°', () => set(45)), btn('90°', () => set(90)), btn('135°', () => set(135)), btn('180°', () => set(180)), btn('270°', () => set(270)), btn('360°', () => set(360))));
    draw();
    return box;
  }

  /* ---------- angle sum of a triangle: drag the corners ---------- */
  function angleSum() {
    const W = 340, H = 300;
    const box = U.el('div', { class: 'demo' });
    box.append(U.el('div', { class: 'demo-title', text: 'Try it: drag the corners' }),
      U.el('p', { class: 'small', text: 'Drag A, B or C to change the triangle. The three angles are copied onto the line below. What do you notice?' }));
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'fig', role: 'img', 'aria-label': 'Angle sum of a triangle' });
    svg.style.maxWidth = '520px';
    const status = U.el('div', { class: 'status good', 'aria-live': 'polite' });
    const kind = U.el('div', { class: 'dial-facts' });
    const P = { A: [150, 30], B: [50, 170], C: [290, 170] };
    const names = ['A', 'B', 'C'];
    const angAt = k => { const o = names.filter(x => x !== k); const u = V.unit(V.sub(P[o[0]], P[k])), v = V.unit(V.sub(P[o[1]], P[k])); return Math.acos(Math.max(-1, Math.min(1, V.dot(u, v)))) / R; };
    function draw() {
      U.clear(svg);
      const raw = names.map(angAt);
      const a = Math.round(raw[0]), b = Math.round(raw[1]), cc = 180 - a - b;
      const vals = [a, b, cc];
      const cen = G.centroid(names.map(k => P[k]));
      names.forEach((k, i) => {
        const o = names.filter(x => x !== k);
        const s = G.sectorPath(P[k], P[o[0]], P[o[1]], 24);
        mk('path', { d: `M${f2(P[k][0])} ${f2(P[k][1])} L${s.d.slice(1)} Z`, fill: G.COL(i + 1), 'fill-opacity': 0.3 }, svg);
      });
      mk('polygon', { points: names.map(k => P[k].map(f2).join(',')).join(' '), fill: 'none', class: 'seg' }, svg);
      names.forEach((k, i) => {
        const out = V.add(P[k], V.mul(V.unit(V.sub(P[k], cen)), 15));
        mk('text', { x: f2(out[0]), y: f2(out[1]), class: 'lbl' }, svg).textContent = k;
        const inn = V.add(P[k], V.mul(V.unit(V.sub(cen, P[k])), 40));
        mk('text', { x: f2(inn[0]), y: f2(inn[1]), class: 'txt' }, svg).textContent = vals[i] + '°';
        const h = mk('circle', { cx: f2(P[k][0]), cy: f2(P[k][1]), r: 22, fill: 'transparent', style: 'cursor:grab' }, svg);
        mk('circle', { cx: f2(P[k][0]), cy: f2(P[k][1]), r: 4, fill: G.COL(i + 1), 'pointer-events': 'none' }, svg);
        h.addEventListener('pointerdown', e => { drag = k; svg.setPointerCapture(e.pointerId); e.preventDefault(); });
      });
      // the three angles side by side on a straight line
      const o = [170, 268];
      mk('line', { x1: 60, y1: o[1], x2: 280, y2: o[1], class: 'seg' }, svg);
      let from = 0;
      vals.forEach((v, i) => {
        mk('path', { d: `M${o[0]} ${o[1]} L${arcPath(o, 54, from, from + v).slice(1)} Z`, fill: G.COL(i + 1), 'fill-opacity': 0.3, stroke: 'var(--ink)', 'stroke-width': 1 }, svg);
        const p = polar(o, 36, from + v / 2);
        if (v >= 14) mk('text', { x: f2(p[0]), y: f2(p[1]), class: 'txt' }, svg).textContent = v + '°';
        from += v;
      });
      mk('circle', { cx: o[0], cy: o[1], r: 2.4, class: 'dot' }, svg);
      status.innerHTML = TEX.render(`$\\angle BAC + \\angle ABC + \\angle ACB = ${a}^\\circ + ${b}^\\circ + ${cc}^\\circ = 180^\\circ$`);
      const mx = Math.max(...vals);
      const byAng = mx === 90 ? 'right-angled' : mx > 90 ? 'obtuse-angled' : 'acute-angled';
      const eq = (a === b) + (b === cc) + (a === cc);
      const bySide = eq === 3 ? 'equilateral' : eq === 1 ? 'isosceles' : 'scalene';
      kind.innerHTML = `By angles: <b>${byAng}</b> triangle. &nbsp; By sides: <b>${bySide}</b> triangle.`;
    }
    let drag = null;
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      const p = svgPoint(svg, e);
      const q = [Math.max(16, Math.min(W - 16, p[0])), Math.max(16, Math.min(196, p[1]))];
      const old = P[drag];
      P[drag] = q;
      if (Math.min(...names.map(angAt)) < 12) P[drag] = old;   // keep it a proper triangle
      draw();
    });
    const end = () => { drag = null; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    const preset = (t, pts) => U.el('button', { type: 'button', class: 'btn ghost small', text: t, onclick: () => { Object.assign(P, JSON.parse(JSON.stringify(pts))); draw(); } });
    box.append(U.el('div', { class: 'fig-wrap' }, svg), status, kind, U.el('div', { class: 'btn-row' },
      preset('Equilateral', { A: [170, 31.4], B: [90, 170], C: [250, 170] }),
      preset('Right-angled', { A: [70, 40], B: [70, 170], C: [270, 170] }),
      preset('Obtuse-angled', { A: [40, 90], B: [110, 170], C: [300, 170] }),
      preset('Isosceles', { A: [170, 30], B: [110, 170], C: [230, 170] })));
    draw();
    return box;
  }

  /* ---------- the slicer: move a cut through a solid and watch the cross-section ---------- */
  function slicer() {
    const LIST = [
      { name: 'Triangular prism', s: { kind: 'prism', base: [[0, 0], [4, 0], [1.2, 3]], depth: 7 }, axis: 'z', max: 7, ext: 4, uniform: true, ends: 'the triangular end faces' },
      { name: 'Cuboid', s: { kind: 'uprism', base: [[-2, -1.5], [2, -1.5], [2, 1.5], [-2, 1.5]], height: 5 }, axis: 'y', max: 5, ext: 4.2, uniform: true, ends: 'the top and the base' },
      { name: 'Cylinder', s: { kind: 'cylinder', r: 2, h: 5 }, axis: 'y', max: 5, ext: 4, uniform: true, ends: 'the two circular ends' },
      { name: 'Square pyramid', s: { kind: 'pyramid', ngon: 4, r: 2.6, height: 5 }, axis: 'y', max: 5, ext: 4.2, uniform: false, ends: 'the base' },
      { name: 'Cone', s: { kind: 'cone', r: 2, h: 5 }, axis: 'y', max: 5, ext: 4, uniform: false, ends: 'the base' },
      { name: 'Sphere', s: { kind: 'sphere', r: 2.4 }, axis: 'y', max: 4.8, ext: 4.8, uniform: false, ends: null },
    ];
    const box = U.el('div', { class: 'demo' });
    box.append(U.el('div', { class: 'demo-title', text: 'Try it: slice a solid' }),
      U.el('p', { class: 'small', text: 'Choose a solid, then move the slider. The red dotted line is the cut; its true shape is drawn on the right.' }));
    const tabs = U.el('div', { class: 'cons-list', role: 'tablist' });
    const svg = mk('svg', { viewBox: '0 0 340 210', class: 'fig', role: 'img', 'aria-label': 'A solid and its cross-section' });
    svg.style.maxWidth = '560px';
    const slider = U.el('input', { type: 'range', min: '4', max: '96', value: '50', class: 'slider', 'aria-label': 'Position of the cut' });
    const status = U.el('div', { class: 'status', 'aria-live': 'polite' });
    let cur = LIST[0];
    function draw() {
      U.clear(svg);
      const t = slider.value / 100 * cur.max;
      const s = Object.assign({}, cur.s, { cut: { [cur.axis]: t } });
      SOL.drawSolid(svg, s, [10, 10, 190, 190]);
      mk('line', { x1: 205, y1: 14, x2: 205, y2: 196, stroke: 'var(--blue-tint-2)', 'stroke-width': 1 }, svg);
      mk('text', { x: 272, y: 22, class: 'tag' }, svg).textContent = 'Cross-section';
      const sh = SOL.section(cur.s, { [cur.axis]: t });
      const c = [272, 112], k = 104 / cur.ext;
      if (sh.circle != null) mk('circle', { cx: c[0], cy: c[1], r: f2(Math.max(0.5, sh.circle * k)), fill: 'var(--c2)', 'fill-opacity': 0.1, stroke: 'var(--c2)', 'stroke-width': 2 }, svg);
      else {
        const cx = (Math.min(...sh.map(p => p[0])) + Math.max(...sh.map(p => p[0]))) / 2, cy = (Math.min(...sh.map(p => p[1])) + Math.max(...sh.map(p => p[1]))) / 2;
        mk('polygon', { points: sh.map(p => f2(c[0] + (p[0] - cx) * k) + ',' + f2(c[1] - (p[1] - cy) * k)).join(' '), fill: 'var(--c2)', 'fill-opacity': 0.1, stroke: 'var(--c2)', 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
      }
      status.className = 'status' + (cur.uniform ? ' good' : '');
      status.innerHTML = cur.uniform
        ? `Every cut parallel to ${cur.ends} has the <b>same shape and the same size</b>. A ${cur.name.toLowerCase()} <b>has uniform cross-sections</b>.`
        : cur.ends
          ? `The cuts parallel to ${cur.ends} have the same shape but <b>different sizes</b>. A ${cur.name.toLowerCase()} does <b>not</b> have uniform cross-sections.`
          : 'Every cross-section of a sphere is a circle, but the circles have <b>different sizes</b>. A sphere does <b>not</b> have uniform cross-sections.';
    }
    LIST.forEach(it => {
      const b = U.el('button', { type: 'button', role: 'tab', text: it.name });
      b.addEventListener('click', () => { cur = it; tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); draw(); });
      if (it === cur) b.classList.add('on');
      tabs.append(b);
    });
    slider.addEventListener('input', draw);
    box.append(tabs, U.el('div', { class: 'fig-wrap' }, svg), U.el('div', { class: 'slider-row' }, U.el('span', { class: 'small muted', text: 'Move the cut' }), slider), status);
    draw();
    return box;
  }

  /* ---------- the same cuboid on oblique grid paper and on isometric grid paper ---------- */
  function grids() {
    const box = U.el('div', { class: 'demo' });
    box.append(U.el('div', { class: 'demo-title', text: 'The same cuboid on two kinds of grid paper' }));
    const svg = mk('svg', { viewBox: '0 0 340 190', class: 'fig', role: 'img', 'aria-label': 'A cuboid on oblique grid paper and on isometric grid paper' });
    svg.style.maxWidth = '560px';
    const gl = (x1, y1, x2, y2, g) => mk('line', { x1: f2(x1), y1: f2(y1), x2: f2(x2), y2: f2(y2), class: 'grid' }, g);
    const edge = (p, q, hid) => mk('line', { x1: f2(p[0]), y1: f2(p[1]), x2: f2(q[0]), y2: f2(q[1]), class: 'seg', 'stroke-dasharray': hid ? '5 4' : null }, svg);
    // oblique: squares with one diagonal
    const clipA = mk('clipPath', { id: 'gridA' }, svg); mk('rect', { x: 10, y: 10, width: 150, height: 144 }, clipA);
    const gA = mk('g', { 'clip-path': 'url(#gridA)' }, svg), s = 18;
    for (let i = 0; i <= 9; i++) { gl(10 + i * s, 10, 10 + i * s, 154, gA); gl(10, 10 + i * s, 160, 10 + i * s, gA); }
    for (let i = -8; i <= 9; i++) gl(10 + i * s, 154, 10 + i * s + 144, 10, gA);
    // isometric: three directions
    const clipB = mk('clipPath', { id: 'gridB' }, svg); mk('rect', { x: 180, y: 10, width: 150, height: 144 }, clipB);
    const gB = mk('g', { 'clip-path': 'url(#gridB)' }, svg), t = 18, dx = t * Math.cos(30 * R);
    for (let i = 0; i <= 10; i++) gl(180 + i * dx, 10, 180 + i * dx, 154, gB);
    for (let j = -10; j <= 20; j++) { gl(180, 10 + j * t, 180 + 10 * dx, 10 + j * t + 5 * t, gB); gl(180, 10 + j * t, 180 + 10 * dx, 10 + j * t - 5 * t, gB); }
    // cuboid 3 x 2 x 2 on the oblique grid: front face true shape, depth along the diagonals
    const o = [10 + 2 * s, 10 + 6 * s], P = (i, j, k) => [o[0] + i * s + k * s, o[1] - j * s - k * s];
    [[[0, 0, 0], [3, 0, 0]], [[3, 0, 0], [3, 2, 0]], [[3, 2, 0], [0, 2, 0]], [[0, 2, 0], [0, 0, 0]], [[3, 0, 0], [3, 0, 1]], [[3, 2, 0], [3, 2, 1]], [[0, 2, 0], [0, 2, 1]], [[3, 0, 1], [3, 2, 1]], [[3, 2, 1], [0, 2, 1]]].forEach(([a, b]) => edge(P(...a), P(...b)));
    [[[0, 0, 0], [0, 0, 1]], [[0, 0, 1], [3, 0, 1]], [[0, 0, 1], [0, 2, 1]]].forEach(([a, b]) => edge(P(...a), P(...b), true));
    // the same cuboid on the isometric grid
    const q = [180 + 4 * dx, 10 + 6.5 * t], Q = (i, j, k) => [q[0] + i * dx - k * dx, q[1] - i * t / 2 - k * t / 2 - j * t];
    const vis = [[[0, 0, 0], [3, 0, 0]], [[0, 0, 0], [0, 0, 2]], [[0, 0, 0], [0, 2, 0]], [[3, 0, 0], [3, 2, 0]], [[0, 0, 2], [0, 2, 2]], [[0, 2, 0], [3, 2, 0]], [[0, 2, 0], [0, 2, 2]], [[3, 2, 0], [3, 2, 2]], [[0, 2, 2], [3, 2, 2]]];
    vis.forEach(([a, b]) => edge(Q(...a), Q(...b)));
    [[[3, 0, 2], [3, 0, 0]], [[3, 0, 2], [0, 0, 2]], [[3, 0, 2], [3, 2, 2]]].forEach(([a, b]) => edge(Q(...a), Q(...b), true));
    mk('text', { x: 85, y: 174, class: 'tag' }, svg).textContent = 'Oblique grid paper';
    mk('text', { x: 255, y: 174, class: 'tag' }, svg).textContent = 'Isometric grid paper';
    box.append(U.el('div', { class: 'fig-wrap' }, svg),
      U.el('p', { class: 'small', text: 'On the oblique grid the front face is a true rectangle. On the isometric grid no face keeps its true shape, but all three directions follow the grid lines.' }));
    return box;
  }

  return { angleSvg, angleInto, angleRow, arcPath, polar, dial, angleSum, slicer, grids, typeOf, TYPES, svgPoint };
})();
