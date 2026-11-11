'use strict';
/* Figure engine: turns a small figure description into an SVG drawing.

   Figure spec (all optional except points):
     w, h            viewBox size (default 320 x 200)
     pts             { A:[x,y], ... }  explicit coordinates (y goes down)
     make            [{ tri:'ABC', ang:[a,b,c], box:[x,y,w,h], rot, flip }]  triangle from its angles
                     [{ tri:'ABCD', shape:[[x,y],...], box, rot, flip }]       any polygon from a shape
     derive          [{ src:'ABC', dst:'PQR', rot, flip, at:[x,y] }]            congruent copy
                     [{ src:'ABE', dst:'CBD', rot:180, around:'B' }]            rotate about a point
     inter           { G:['BF','EC'] }      point where two lines meet
     along           { D:['B','C',0.4] }    point part-way along BC
     fit             true/false  rescale everything to fill the box (default: on when make/derive used)
     polys           ['ABC', ...]  closed outlines;  lines ['AEFD', ...] open paths
     dashed          ['AC']
     ticks           { AB:1, DE:1 }   equal-side marks (1, 2, 3 ticks -> blue, red, gold)
     arcs            { ABC:1 }        equal-angle marks (angle at the middle letter)
     cols            { ABC:3 }        colour a tick or arc pair differently from its count (here gold, one arc)
     rights          ['ABC']          right-angle squares
     arrows          { AB:1 }         parallel arrows
     st              { AB:'7 cm' }    text beside a side;  at { ABC:'65°' } text inside an angle
     hide            'XY'  letters not to label;  lab { A:[dx,dy] } move a label
     dots            'G'   points drawn as dots;  texts [{ at:[x,y], t:'I' }]
     grid            12    background grid step;  mono true  -> marks all in ink
     reflex          ['ABC']  angles (arcs / at) drawn the long way round;  circles [{ c:'O', r:40 }]
     solid / solids  a 3-D solid instead (see js/solids.js)
*/
const G = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const R = Math.PI / 180;
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
    mul: (a, k) => [a[0] * k, a[1] * k],
    len: a => Math.hypot(a[0], a[1]),
    unit: a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; },
    dot: (a, b) => a[0] * b[0] + a[1] * b[1],
    cross: (a, b) => a[0] * b[1] - a[1] * b[0],
    mid: (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    rot: (a, deg) => { const c = Math.cos(deg * R), s = Math.sin(deg * R); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; },
    dist: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
    perp: a => [-a[1], a[0]],
  };
  const segKey = (a, b) => (a < b ? a + b : b + a);
  const angKey = s => (s[0] < s[2] ? s : s[2] + s[1] + s[0]);
  const partKey = p => (p.length === 2 ? segKey(p[0], p[1]) : p.length === 3 ? angKey(p) : p);
  const COL = n => ['var(--ink)', 'var(--c1)', 'var(--c2)', 'var(--c3)'][n] || 'var(--ink)';
  const f2 = x => Math.round(x * 100) / 100;

  function centroid(arr) {
    const s = arr.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
    return [s[0] / arr.length, s[1] / arr.length];
  }
  // Triangle with angles (degrees) at vertices 0,1,2. Vertex 1 at origin, vertex 2 at (1,0), vertex 0 above.
  function triFromAngles(a0, a1, a2) {
    const s = Math.sin(a2 * R) / Math.sin(a0 * R);
    return [[s * Math.cos(a1 * R), -s * Math.sin(a1 * R)], [0, 0], [1, 0]];
  }
  function transform(arr, o = {}) {
    const c = centroid(arr);
    return arr.map(p => {
      let v = V.sub(p, c);
      if (o.flip) v = [-v[0], v[1]];
      if (o.rot) v = V.rot(v, o.rot);
      return V.add(c, v);
    });
  }
  function fitBox(arr, box) {
    const [bx, by, bw, bh] = box;
    const xs = arr.map(p => p[0]), ys = arr.map(p => p[1]);
    const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
    const k = Math.min(bw / ((maxx - minx) || 1), bh / ((maxy - miny) || 1));
    const ox = bx + (bw - (maxx - minx) * k) / 2, oy = by + (bh - (maxy - miny) * k) / 2;
    return arr.map(p => [ox + (p[0] - minx) * k, oy + (p[1] - miny) * k]);
  }
  function lineInter(p1, p2, p3, p4) {
    const d1 = V.sub(p2, p1), d2 = V.sub(p4, p3);
    const den = V.cross(d1, d2);
    if (Math.abs(den) < 1e-9) return V.mid(p1, p3);
    const t = V.cross(V.sub(p3, p1), d2) / den;
    return V.add(p1, V.mul(d1, t));
  }
  function randAngles(min = 35, max = 105, gap = 10) {
    for (let i = 0; i < 500; i++) {
      const a = U.rint(min, max), b = U.rint(min, max), c = 180 - a - b;
      if (c < min || c > max) continue;
      if (Math.abs(a - b) < gap || Math.abs(b - c) < gap || Math.abs(a - c) < gap) continue;
      return [a, b, c];
    }
    return [50, 60, 70];
  }

  function resolve(spec) {
    const w = spec.w || 320, h = spec.h || 200;
    const pts = {};
    for (const k in spec.pts || {}) pts[k] = spec.pts[k].slice();
    (spec.make || []).forEach(m => {
      let arr = m.ang ? triFromAngles(...m.ang) : m.shape.map(p => p.slice());
      arr = transform(arr, m);
      arr = fitBox(arr, m.box || [20, 20, w - 40, h - 40]);
      [...m.tri].forEach((L, i) => { pts[L] = arr[i]; });
    });
    (spec.derive || []).forEach(d => {
      const src = [...d.src].map(L => pts[L]);
      let arr;
      if (d.around) {
        const c = pts[d.around];
        arr = src.map(p => { let v = V.sub(p, c); if (d.flip) v = [-v[0], v[1]]; v = V.rot(v, d.rot || 0); return V.add(c, v); });
      } else {
        arr = transform(src, d);
        const c0 = centroid(arr);
        const at = d.at || V.add(c0, d.shift || [0, 0]);
        arr = arr.map(p => V.add(V.sub(p, c0), at));
        // never let the copy touch the original: if their boxes (plus room for labels) overlap, push the copy right
        const box = a => [Math.min(...a.map(p => p[0])), Math.min(...a.map(p => p[1])), Math.max(...a.map(p => p[0])), Math.max(...a.map(p => p[1]))];
        const s = box(src), c = box(arr), gap = d.gap != null ? d.gap : 52;
        if (c[0] < s[2] + gap && c[2] > s[0] - gap && c[1] < s[3] + gap && c[3] > s[1] - gap) {
          const dx = s[2] + gap - c[0];
          arr = arr.map(p => [p[0] + dx, p[1]]);
        }
      }
      [...d.dst].forEach((L, i) => { pts[L] = arr[i]; });
    });
    for (const k in spec.along || {}) {
      const [a, b, t] = spec.along[k];
      pts[k] = V.add(pts[a], V.mul(V.sub(pts[b], pts[a]), t));
    }
    for (const k in spec.inter || {}) {
      const [l1, l2] = spec.inter[k];
      pts[k] = lineInter(pts[l1[0]], pts[l1[1]], pts[l2[0]], pts[l2[1]]);
    }
    const doFit = spec.fit != null ? spec.fit : !!(spec.make || spec.derive);
    if (doFit) {
      const keys = Object.keys(pts);
      const pad = spec.pad != null ? spec.pad : 26;
      const arr = fitBox(keys.map(k => pts[k]), [pad, pad, w - 2 * pad, h - 2 * pad]);
      keys.forEach((k, i) => { pts[k] = arr[i]; });
    }
    return pts;
  }

  // reflex: draw the arc the long way round (the angle greater than 180°)
  function sectorPath(B, A, C, r, reflex) {
    const u = V.unit(V.sub(A, B)), v = V.unit(V.sub(C, B));
    const a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const p1 = V.add(B, V.mul(u, r)), p2 = V.add(B, V.mul(v, r));
    const sweep = (d > 0 ? 1 : 0) ^ (reflex ? 1 : 0);
    return { d: `M${f2(p1[0])} ${f2(p1[1])} A${r} ${r} 0 ${reflex ? 1 : 0} ${sweep} ${f2(p2[0])} ${f2(p2[1])}`, u, v, p1, p2, B };
  }

  // Put a vertex label in the widest free gap between the lines meeting there.
  // `busy` lists directions (radians) of angle marks at this vertex; a gap holding one is avoided.
  function labelPos(p, nbrs, off, busy = []) {
    if (!nbrs.length) return [p[0], p[1] - off];
    const angs = nbrs.map(q => Math.atan2(q[1] - p[1], q[0] - p[0])).sort((a, b) => a - b);
    const inGap = (t, a, b) => { while (t < a) t += 2 * Math.PI; while (t > a + 2 * Math.PI) t -= 2 * Math.PI; return t > a && t < b; };
    let best = -1, bestA = 0, bestGap = Math.PI;
    for (let i = 0; i < angs.length; i++) {
      const a = angs[i], b = i + 1 < angs.length ? angs[i + 1] : angs[0] + 2 * Math.PI;
      const score = (b - a) * (busy.some(t => inGap(t, a, b)) ? 0.25 : 1);
      if (score > best) { best = score; bestA = a + (b - a) / 2; bestGap = b - a; }
    }
    // in a narrow gap, move the label further out so it clears the two lines
    const d = bestGap >= Math.PI ? off : Math.min(off * 2, off / Math.max(0.5, Math.sin(bestGap / 2)));
    return [p[0] + d * Math.cos(bestA), p[1] + d * Math.sin(bestA)];
  }

  // Draw spec into an SVG group using resolved points.
  function renderInto(root, spec, pts) {
    const g = cls => mk('g', { class: cls }, root);
    const gGrid = g('g-grid'), gHL = g('g-hl'), gSeg = g('g-seg'), gMark = g('g-mark'), gTxt = g('g-txt'), gHit = g('g-hit');
    const w = spec.w || 320, h = spec.h || 200;
    const col = n => (spec.mono ? 'var(--ink)' : COL(n));
    // a mark's colour follows its count (1 blue, 2 red, 3 gold) unless spec.cols names another
    const markCol = (k, n) => col((spec.cols && spec.cols[k]) || n);
    const reflexSet = new Set((spec.reflex || []).map(angKey));
    const isReflex = k => reflexSet.has(angKey(k));
    // circles: [{ c:'O' or [x,y], r:40, dashed:true }]
    (spec.circles || []).forEach(c => {
      const p = typeof c.c === 'string' ? pts[c.c] : c.c;
      if (p) mk('circle', { cx: f2(p[0]), cy: f2(p[1]), r: c.r, class: 'seg', 'stroke-dasharray': c.dashed ? '5 4' : null }, gSeg);
    });
    if (spec.grid) {
      for (let x = 0; x <= w; x += spec.grid) mk('line', { x1: x, y1: 0, x2: x, y2: h, class: 'grid' }, gGrid);
      for (let y = 0; y <= h; y += spec.grid) mk('line', { x1: 0, y1: y, x2: w, y2: y, class: 'grid' }, gGrid);
    }
    // free-form (curved) outlines: shapes: [{ d:'svg path around (0,0)', at:[x,y], rot, flip, scale, sx }]
    (spec.shapes || []).forEach(s => {
      const tf = `translate(${s.at[0]} ${s.at[1]}) rotate(${s.rot || 0}) scale(${(s.flip ? -1 : 1) * (s.scale || 1) * (s.sx || 1)} ${s.scale || 1})`;
      mk('path', { d: s.d, transform: tf, fill: 'var(--blue-tint)', stroke: 'var(--ink)', 'stroke-width': 1.6, 'vector-effect': 'non-scaling-stroke' }, gGrid);
    });
    const segs = new Map(), nb = {};
    const addSeg = (a, b) => {
      if (!pts[a] || !pts[b]) return;
      const k = segKey(a, b);
      if (!segs.has(k)) segs.set(k, [a, b]);
      (nb[a] = nb[a] || new Set()).add(b); (nb[b] = nb[b] || new Set()).add(a);
    };
    (spec.polys || []).forEach(p => { const L = [...p]; L.forEach((a, i) => addSeg(a, L[(i + 1) % L.length])); });
    (spec.lines || []).forEach(p => { const L = [...p]; for (let i = 0; i < L.length - 1; i++) addSeg(L[i], L[i + 1]); });
    const dashed = new Set((spec.dashed || []).map(s => segKey(s[0], s[1])));
    segs.forEach(([a, b], k) => {
      mk('line', { x1: f2(pts[a][0]), y1: f2(pts[a][1]), x2: f2(pts[b][0]), y2: f2(pts[b][1]), class: 'seg', 'stroke-dasharray': dashed.has(k) ? '5 4' : null }, gSeg);
    });
    const allC = centroid(Object.values(pts));
    const polyCentroidFor = (a, b) => {
      const poly = (spec.polys || []).find(p => p.includes(a) && p.includes(b));
      return poly ? centroid([...poly].map(L => pts[L])) : allC;
    };
    // equal-side ticks
    for (const k in spec.ticks || {}) {
      const n = spec.ticks[k], A = pts[k[0]], B = pts[k[1]];
      if (!A || !B) continue;
      const d = V.unit(V.sub(B, A)), nn = V.perp(d), M = V.mid(A, B);
      for (let i = 0; i < n; i++) {
        const c = V.add(M, V.mul(d, (i - (n - 1) / 2) * 4.5));
        const p1 = V.add(c, V.mul(nn, 6)), p2 = V.add(c, V.mul(nn, -6));
        mk('line', { x1: f2(p1[0]), y1: f2(p1[1]), x2: f2(p2[0]), y2: f2(p2[1]), class: 'mark', stroke: markCol(k, n), 'stroke-width': 1.8 }, gMark);
      }
    }
    // parallel arrows
    for (const k in spec.arrows || {}) {
      const n = spec.arrows[k], A = pts[k[0]], B = pts[k[1]];
      if (!A || !B) continue;
      const d = V.unit(V.sub(B, A)), nn = V.perp(d), M = V.add(A, V.mul(V.sub(B, A), 0.3));
      for (let i = 0; i < n; i++) {
        const tip = V.add(M, V.mul(d, 4 + (i - (n - 1) / 2) * 7));
        const b1 = V.add(V.add(tip, V.mul(d, -7)), V.mul(nn, 5)), b2 = V.add(V.add(tip, V.mul(d, -7)), V.mul(nn, -5));
        mk('path', { d: `M${f2(b1[0])} ${f2(b1[1])} L${f2(tip[0])} ${f2(tip[1])} L${f2(b2[0])} ${f2(b2[1])}`, class: 'mark', stroke: 'var(--ink)', 'stroke-width': 1.6 }, gMark);
      }
    }
    // angle arcs
    const arcR = spec.arcR || 16;
    for (const k in spec.arcs || {}) {
      const n = spec.arcs[k], A = pts[k[0]], B = pts[k[1]], C = pts[k[2]];
      if (!A || !B || !C) continue;
      for (let i = 0; i < n; i++) {
        const s = sectorPath(B, A, C, arcR + i * 4, isReflex(k));
        mk('path', { d: s.d, class: 'mark', stroke: markCol(k, n), 'stroke-width': 1.6 }, gMark);
      }
    }
    // Where an angle's label goes (distance r along the bisector) and how big its plain arc is.
    // The label sits just outside its arc. In a narrow angle the label must move out to fit in the wedge,
    // so the arc grows with it and stays right next to its label.
    function angleLayout(k) {
      const A = pts[k[0]], B = pts[k[1]], C = pts[k[2]];
      const u = V.unit(V.sub(A, B)), v = V.unit(V.sub(C, B));
      let bis = V.add(u, v);
      bis = V.len(bis) < 1e-3 ? V.perp(u) : V.unit(bis);
      let half = Math.acos(Math.max(-1, Math.min(1, V.dot(u, v)))) / 2;
      if (isReflex(k)) { bis = V.mul(bis, -1); half = Math.PI - half; }
      if (spec.atSide && spec.atSide[k] && V.len(V.add(u, v)) < 1e-3) bis = V.mul(bis, spec.atSide[k]);
      const n = (spec.arcs || {})[k] || (spec.arcs || {})[k[2] + k[1] + k[0]] || 1;
      const t = spec.at[k], hw = t.length * 3.4, hh = 7;
      const p = V.perp(bis);
      const along = Math.abs(bis[0]) * hw + Math.abs(bis[1]) * hh;   // label half-size along the bisector
      const across = Math.abs(p[0]) * hw + Math.abs(p[1]) * hh;      // and across it
      const outer = arcR + (n - 1) * 4;
      const fit = half < 1.2 ? (across * 0.6 + 2) / Math.tan(half) : 0;
      let r = Math.max(outer + 3 + along, fit);
      if (spec.atPos && spec.atPos[k]) r = Math.max(spec.atPos[k], outer + 3 + along);
      r = Math.min(r, 80);
      return { bis, r, arc: Math.max(arcR, r - along - 4 - (n - 1) * 4) };
    }
    // classic single arc for every angle that has a value or letter written in it
    // (skipped if the angle already has equal-angle marks or a right-angle square; turn off with noAutoArc)
    if (!spec.noAutoArc) {
      const has = (obj, k) => obj && (k in obj || (k[2] + k[1] + k[0]) in obj);
      const rightSet = new Set((spec.rights || []).map(angKey));
      for (const k in spec.at || {}) {
        if (has(spec.arcs, k) || rightSet.has(angKey(k))) continue;
        const A = pts[k[0]], B = pts[k[1]], C = pts[k[2]];
        if (!A || !B || !C) continue;
        mk('path', { d: sectorPath(B, A, C, angleLayout(k).arc, isReflex(k)).d, class: 'mark', stroke: 'var(--ink)', 'stroke-width': 1.3 }, gMark);
      }
    }
    // right-angle marks
    (spec.rights || []).forEach(k => {
      const A = pts[k[0]], B = pts[k[1]], C = pts[k[2]];
      if (!A || !B || !C) return;
      const u = V.unit(V.sub(A, B)), v = V.unit(V.sub(C, B)), s = 10;
      const p1 = V.add(B, V.mul(u, s)), p3 = V.add(B, V.mul(v, s)), p2 = V.add(p1, V.mul(v, s));
      mk('path', { d: `M${f2(p1[0])} ${f2(p1[1])} L${f2(p2[0])} ${f2(p2[1])} L${f2(p3[0])} ${f2(p3[1])}`, class: 'mark', stroke: 'var(--ink)', 'stroke-width': 1.3 }, gMark);
    });
    // values such as 2x, x + 28° or y cm: the letters are italic, the rest upright
    const isVar = () => false;
    const setTxt = (node, t) => {
      const parts = String(t).split(/(cm|[a-z])/).filter(x => x !== '');
      if (parts.length === 1 && !/^[a-z]$/.test(parts[0])) { node.textContent = t; return; }
      parts.forEach(x => { const sp = mk('tspan', /^[a-z]$/.test(x) ? { class: 'var' } : {}, node); sp.textContent = x; });
    };
    // text beside sides
    for (const k in spec.st || {}) {
      const A = pts[k[0]], B = pts[k[1]];
      if (!A || !B) continue;
      const M = V.mid(A, B);
      let pos;
      if (spec.stPos && spec.stPos[k]) pos = V.add(M, spec.stPos[k]);
      else {
        let nn = V.perp(V.unit(V.sub(B, A)));
        const c = polyCentroidFor(k[0], k[1]);
        if (V.dot(nn, V.sub(M, c)) < 0) nn = V.mul(nn, -1);
        const t = spec.st[k], hw = t.length * 3.3, hh = 7;
        const place = n => V.add(M, V.mul(n, 6 + Math.abs(n[0]) * hw + Math.abs(n[1]) * 6));
        if ((spec.stIn || []).includes(k)) pos = place(V.mul(nn, -1));
        else {
          // try both sides; keep the preferred (outside) side unless it is crowded by other lines
          const d = V.unit(V.sub(B, A));
          const onLine = q => Math.abs(V.cross(d, V.sub(q, A))) < 1;
          const others = [...segs.values()].filter(([p, q]) => !(onLine(pts[p]) && onLine(pts[q])));
          const clearance = P => {
            let best = Infinity;
            others.forEach(([p, q]) => {
              const a = pts[p], b = pts[q];
              for (let i = 0; i <= 20; i++) {
                const s = V.add(a, V.mul(V.sub(b, a), i / 20));
                const dx = Math.max(0, Math.abs(s[0] - P[0]) - hw), dy = Math.max(0, Math.abs(s[1] - P[1]) - hh);
                best = Math.min(best, Math.hypot(dx, dy));
              }
            });
            return best;
          };
          const p1 = place(nn), p2 = place(V.mul(nn, -1));
          pos = clearance(p1) >= Math.min(4, clearance(p2)) ? p1 : p2;
        }
      }
      setTxt(mk('text', { x: f2(pos[0]), y: f2(pos[1]), class: 'txt' }, gTxt), spec.st[k]);
    }
    // text inside angles
    for (const k in spec.at || {}) {
      const B = pts[k[1]];
      if (!pts[k[0]] || !B || !pts[k[2]]) continue;
      const { bis, r } = angleLayout(k);
      const pos = V.add(B, V.mul(bis, r));
      setTxt(mk('text', { x: f2(pos[0]), y: f2(pos[1]), class: 'txt' }, gTxt), spec.at[k]);
    }
    // dots and point labels
    [...(spec.dots || '')].forEach(L => { if (pts[L]) mk('circle', { cx: f2(pts[L][0]), cy: f2(pts[L][1]), r: 2.6, class: 'dot' }, gTxt); });
    const hide = spec.hide || '';
    Object.keys(pts).forEach(L => {
      if (hide.includes(L) || spec.noLabels) return;
      const nbrs = [...(nb[L] || [])].map(q => pts[q]);
      // directions of angle marks (right-angle squares, arcs, angle values) that sit at this vertex
      const busy = [...(spec.rights || []), ...Object.keys(spec.arcs || {}), ...Object.keys(spec.at || {})]
        .filter(k => k.length === 3 && k[1] === L && pts[k[0]] && pts[k[2]])
        .map(k => { const u = V.unit(V.sub(pts[k[0]], pts[L])), v = V.unit(V.sub(pts[k[2]], pts[L])); let m = V.add(u, v); if (isReflex(k)) m = V.mul(m, -1); return Math.atan2(m[1], m[0]); });
      let pos = labelPos(pts[L], nbrs, 12, busy);
      if (spec.lab && spec.lab[L]) pos = V.add(pts[L], spec.lab[L]);
      mk('text', { x: f2(pos[0]), y: f2(pos[1]), class: 'lbl' }, gTxt).textContent = L;
    });
    (spec.texts || []).forEach(t => { mk('text', { x: t.at[0], y: t.at[1], class: t.cls || 'tag' }, gTxt).textContent = t.t; });
    return { gHL, gHit, segs };
  }

  function draw(spec, opts = {}) {
    const w = spec.w || 320, h = spec.h || 200;
    const svg = mk('svg', { viewBox: `0 0 ${w} ${h}`, class: 'fig', role: 'img', 'aria-label': spec.alt || 'Figure' });
    svg.style.maxWidth = (spec.maxw || Math.round(w * 1.6)) + 'px';
    // solids (js/solids.js) and plain angle pictures (js/demos.js) are drawn by their own modules
    if (spec.solid || spec.solids) { SOL.renderInto(svg, spec); return { svg, pts: {}, spec, segs: new Map(), highlight() {}, clearHL() {}, enableHit() {}, disableHit() {} }; }
    const pts = opts.pts || resolve(spec);
    const { gHL, gHit, segs } = renderInto(svg, spec, pts);
    const fig = {
      svg, pts, spec, segs,
      highlight(list) {
        list.forEach(([part, n]) => {
          const c = COL(n || 1);
          if (part.length === 1 && pts[part]) mk('circle', { cx: pts[part][0], cy: pts[part][1], r: 11, class: 'hl', fill: c }, gHL);
          else if (part.length === 2 && pts[part[0]] && pts[part[1]]) {
            const A = pts[part[0]], B = pts[part[1]];
            mk('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'hl hl-line', stroke: c }, gHL);
          } else if (part.length === 3 && pts[part[0]] && pts[part[1]] && pts[part[2]]) {
            const s = sectorPath(pts[part[1]], pts[part[0]], pts[part[2]], 26);
            mk('path', { d: `M${f2(s.B[0])} ${f2(s.B[1])} L${s.d.slice(1)} Z`, class: 'hl', fill: c }, gHL);
          }
        });
      },
      clearHL() { while (gHL.firstChild) gHL.removeChild(gHL.firstChild); },
      enableHit(parts, cb) {
        fig.disableHit();
        parts.forEach(part => {
          let e;
          if (part.length === 1) e = mk('circle', { cx: pts[part][0], cy: pts[part][1], r: 24, class: 'hit' }, gHit);
          else if (part.length === 2) { const A = pts[part[0]], B = pts[part[1]]; e = mk('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], class: 'hit-line' }, gHit); }
          else {
            const s = sectorPath(pts[part[1]], pts[part[0]], pts[part[2]], 54);
            e = mk('path', { d: `M${f2(s.B[0])} ${f2(s.B[1])} L${s.d.slice(1)} Z`, class: 'hit' }, gHit);
          }
          e.setAttribute('tabindex', '0');
          e.setAttribute('role', 'button');
          e.setAttribute('aria-label', part);
          const go = ev => { ev.preventDefault(); cb(partKey(part)); };
          e.addEventListener('click', go);
          e.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') go(ev); });
        });
      },
      disableHit() { while (gHit.firstChild) gHit.removeChild(gHit.firstChild); },
    };
    return fig;
  }

  // Two (or more) triangles of a figure pulled apart, animated.
  function splitView(spec, tris) {
    const w = spec.w || 320, h = spec.h || 200, pad = 50;
    const pts = resolve(spec);
    const svg = mk('svg', { viewBox: `${-pad} ${-pad / 2} ${w + 2 * pad} ${h + pad}`, class: 'fig', role: 'img', 'aria-label': 'The figure split into two triangles' });
    svg.style.maxWidth = Math.round((w + 2 * pad) * 1.5) + 'px';
    const allC = centroid(Object.values(pts));
    const inTri = (t, k) => [...k].every(L => t.includes(L));
    const filt = (obj, t) => { const o = {}; for (const k in obj || {}) if (inTri(t, k)) o[k] = obj[k]; return o; };
    const groups = tris.map((t, i) => {
      const sub = {
        w, h, polys: [t], ticks: filt(spec.ticks, t), arcs: filt(spec.arcs, t), arrows: {},
        rights: (spec.rights || []).filter(k => inTri(t, k)), st: filt(spec.st, t), at: filt(spec.at, t), arcR: spec.arcR,
      };
      const tp = {}; [...t].forEach(L => { tp[L] = pts[L]; });
      const gg = mk('g', { class: 'tri-g' }, svg);
      renderInto(gg, sub, tp);
      let d = V.sub(centroid([...t].map(L => pts[L])), allC);
      if (V.len(d) < 6) d = i === 0 ? [-1, 0] : [1, 0];
      const off = V.mul(V.unit(d), spec.splitGap || 58);
      return { gg, off };
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      groups.forEach(({ gg, off }) => { gg.style.transform = `translate(${f2(off[0])}px, ${f2(off[1])}px)`; });
    }));
    return svg;
  }

  return { draw, splitView, resolve, mk, V, R, triFromAngles, transform, fitBox, centroid, randAngles, segKey, angKey, partKey, sectorPath, lineInter, COL };
})();
