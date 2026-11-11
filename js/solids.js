'use strict';
/* Solids: line drawings of 3-D figures with dashed hidden edges (Section 5.4).

   In a figure spec:   fig: { w, h, solid: { ... } }            one solid filling the picture
                       fig: { w, h, solids: [{ ..., cap:'Solid I' }, ...] }   several side by side

   A solid is one of (lengths in any unit; the drawing is scaled to fit; y is UP here):
     { kind:'prism',   base:[[x,y],...], depth:d }     cross-section facing you, pushed back by d
     { kind:'uprism',  base:[[x,z],...] | ngon:n, r, height:h }   prism standing on its base
     { kind:'pyramid', base:[[x,z],...] | ngon:n, r, height:h, apex:[x,z] }
     { kind:'frustum', base | ngon, r, height:h, top:0.5 }        pyramid with its top cut off
     { kind:'poly',    verts:[[x,y,z],...], faces:[[0,1,2],...] }  any polyhedron
     { kind:'cylinder', r, h } { kind:'cone', r, h } { kind:'cfrustum', r, r2, h }
     { kind:'sphere', r } { kind:'hemisphere', r }                 add lying:true to lay one on its side
   Optional on any solid:
     cut: { y: 2 }                     horizontal cut at height y        (drawn as a red dotted line)
     cut: { z: 1 } / { x: 0 }          vertical cuts;  cut: { n:[a,b,c], p:[x,y,z] } any plane (polyhedra)
     cap: 'Solid I'                    caption under the solid
     marks: [{ v:0, t:'A', d:[-8,4] }] letters at vertices (index into the vertex list)

   SOL.section(solid, cut) returns the true shape of the cross-section as 2-D points (or { circle:r }). */
const SOL = (() => {
  const mk = (...a) => G.mk(...a);
  const K = 0.5, AL = 38 * Math.PI / 180;
  const KX = K * Math.cos(AL), KY = K * Math.sin(AL);
  const VIEW = [KX, KY, -1];                       // from any point towards the viewer
  const proj = p => [p[0] + KX * p[2], -(p[1] + KY * p[2])];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = a => Math.hypot(a[0], a[1], a[2]);
  const f2 = x => Math.round(x * 100) / 100;

  function ngon(n, r, start) {
    const a0 = start != null ? start : (n % 2 ? -90 : -90 + 180 / n);
    return [...Array(n)].map((_, i) => { const a = (a0 + 360 * i / n) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; });
  }
  const baseOf = s => s.base || ngon(s.ngon || 4, s.r || 1, s.start);

  // -> { verts, faces } for polyhedra, or null for curved solids
  function build(s) {
    if (s.kind === 'poly') return { verts: s.verts, faces: s.faces };
    if (s.kind === 'prism') {
      const b = s.base, n = b.length, d = s.depth;
      const verts = [...b.map(p => [p[0], p[1], 0]), ...b.map(p => [p[0], p[1], d])];
      const faces = [[...Array(n).keys()], [...Array(n).keys()].map(i => i + n)];
      for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
      return { verts, faces };
    }
    if (s.kind === 'uprism') {
      const b = baseOf(s), n = b.length, h = s.height;
      const sh = s.shear || [0, 0];
      const verts = [...b.map(p => [p[0], 0, p[1]]), ...b.map(p => [p[0] + sh[0], h, p[1] + sh[1]])];
      const faces = [[...Array(n).keys()], [...Array(n).keys()].map(i => i + n)];
      for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
      return { verts, faces };
    }
    if (s.kind === 'pyramid') {
      const b = baseOf(s), n = b.length, ap = s.apex || [0, 0];
      const verts = [...b.map(p => [p[0], 0, p[1]]), [ap[0], s.height, ap[1]]];
      const faces = [[...Array(n).keys()]];
      for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n]);
      return { verts, faces };
    }
    if (s.kind === 'frustum') {
      const b = baseOf(s), n = b.length, t = s.top || 0.5;
      const verts = [...b.map(p => [p[0], 0, p[1]]), ...b.map(p => [p[0] * t, s.height, p[1] * t])];
      const faces = [[...Array(n).keys()], [...Array(n).keys()].map(i => i + n)];
      for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, (i + 1) % n + n, i + n]);
      return { verts, faces };
    }
    return null;
  }

  function edgesOf(m) {
    const seen = new Map();
    m.faces.forEach(f => f.forEach((a, i) => { const b = f[(i + 1) % f.length]; const k = a < b ? a + '-' + b : b + '-' + a; if (!seen.has(k)) seen.set(k, [a, b]); }));
    return [...seen.values()];
  }
  // is point P hidden behind some face (looking along VIEW)?
  function hidden(P, m) {
    for (const f of m.faces) {
      const A = m.verts[f[0]];
      let n = [0, 0, 0];   // Newell normal (works for non-convex faces)
      f.forEach((vi, i) => { const p = m.verts[vi], q = m.verts[f[(i + 1) % f.length]]; n = add(n, [(p[1] - q[1]) * (p[2] + q[2]), (p[2] - q[2]) * (p[0] + q[0]), (p[0] - q[0]) * (p[1] + q[1])]); });
      const den = dot(n, VIEW);
      if (Math.abs(den) < 1e-9) continue;
      const t = dot(n, sub(A, P)) / den;
      if (t < 1e-4) continue;
      const Q = add(P, mul(VIEW, t));
      // drop the largest component of n and test point-in-polygon
      const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
      const d = ax >= ay && ax >= az ? 0 : ay >= az ? 1 : 2;
      const u = (d + 1) % 3, v = (d + 2) % 3;
      let inside = false;
      for (let i = 0, j = f.length - 1; i < f.length; j = i++) {
        const a = m.verts[f[i]], b = m.verts[f[j]];
        if ((a[v] > Q[v]) !== (b[v] > Q[v]) && Q[u] < (b[u] - a[u]) * (Q[v] - a[v]) / (b[v] - a[v]) + a[u]) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }

  // plane from a cut description
  function planeOf(cut) {
    if (cut.n) return { n: cut.n, p: cut.p };
    if (cut.y != null) return { n: [0, 1, 0], p: [0, cut.y, 0] };
    if (cut.z != null) return { n: [0, 0, 1], p: [0, 0, cut.z] };
    return { n: [1, 0, 0], p: [cut.x, 0, 0] };
  }
  // points where a plane meets a (convex) polyhedron, in order round the section
  function cutPoints(m, cut) {
    const { n, p } = planeOf(cut);
    const pts = [];
    const push = q => { if (!pts.some(r => len(sub(r, q)) < 1e-6)) pts.push(q); };
    edgesOf(m).forEach(([a, b]) => {
      const A = m.verts[a], B = m.verts[b], da = dot(n, sub(A, p)), db = dot(n, sub(B, p));
      if (Math.abs(da) < 1e-9) push(A);
      if (Math.abs(db) < 1e-9) push(B);
      if (da * db < -1e-12) push(add(A, mul(sub(B, A), da / (da - db))));
    });
    if (pts.length < 3) return { pts: [], flat: [] };
    const c = mul(pts.reduce(add, [0, 0, 0]), 1 / pts.length);
    const nn = mul(n, 1 / len(n));
    // the flat picture keeps the solid the right way up: x to the right, and y (or depth) upwards
    let e1, e2;
    if (Math.abs(nn[2]) > 0.999) { e1 = [1, 0, 0]; e2 = [0, 1, 0]; }
    else if (Math.abs(nn[1]) > 0.999) { e1 = [1, 0, 0]; e2 = [0, 0, 1]; }
    else { e1 = cross([0, 1, 0], nn); e1 = mul(e1, 1 / len(e1)); e2 = [0, 1, 0]; if (Math.abs(dot(e2, nn)) > 1e-9) e2 = cross(nn, e1); }
    const flat = pts.map(q => [dot(sub(q, c), e1), dot(sub(q, c), e2)]);
    const order = flat.map((q, i) => i).sort((i, j) => Math.atan2(flat[i][1], flat[i][0]) - Math.atan2(flat[j][1], flat[j][0]));
    return { pts: order.map(i => pts[i]), flat: order.map(i => flat[i]) };
  }
  // true shape of a cross-section
  function section(s, cut) {
    const m = build(s);
    if (m) return cutPoints(m, cut).flat;
    const r = s.r, h = s.h;
    if (cut.y != null) {
      const y = cut.y;
      if (s.kind === 'cylinder') return { circle: r };
      if (s.kind === 'cone') return { circle: r * (1 - y / h) };
      if (s.kind === 'cfrustum') return { circle: r + (s.r2 - r) * y / h };
      if (s.kind === 'sphere') return { circle: Math.sqrt(Math.max(0, r * r - (y - r) * (y - r))) };
      if (s.kind === 'hemisphere') return { circle: Math.sqrt(Math.max(0, r * r - y * y)) };
    }
    if (s.kind === 'cylinder') return [[-r, 0], [r, 0], [r, h], [-r, h]];
    if (s.kind === 'cone') return [[-r, 0], [r, 0], [0, h]];
    if (s.kind === 'cfrustum') return [[-r, 0], [r, 0], [s.r2, h], [-s.r2, h]];
    return { circle: r };
  }

  /* ---------- drawing ---------- */
  // returns a list of drawing items in the solid's own 2-D coordinates (y down), plus its bounding box
  function items(s) {
    const out = [], box = [Infinity, Infinity, -Infinity, -Infinity];
    const grow = p => { box[0] = Math.min(box[0], p[0]); box[1] = Math.min(box[1], p[1]); box[2] = Math.max(box[2], p[0]); box[3] = Math.max(box[3], p[1]); };
    const line = (a, b, cls) => { out.push({ k: 'line', a, b, cls }); grow(a); grow(b); };
    const m = build(s);
    if (m) {
      const N = 28;
      edgesOf(m).forEach(([a, b]) => {
        const A = m.verts[a], B = m.verts[b];
        const hid = [...Array(N)].map((_, i) => hidden(add(A, mul(sub(B, A), (i + 0.5) / N)), m));
        let start = 0;
        for (let i = 1; i <= N; i++) {
          if (i === N || hid[i] !== hid[start]) {
            line(proj(add(A, mul(sub(B, A), start / N))), proj(add(A, mul(sub(B, A), i / N))), hid[start] ? 'hid' : 'vis');
            start = i;
          }
        }
      });
      if (s.cut) {
        const c = cutPoints(m, s.cut).pts.map(proj);
        if (c.length) out.push({ k: 'poly', pts: c, cls: 'cut' });
      }
      (s.marks || []).forEach(mm => { const p = proj(m.verts[mm.v]); out.push({ k: 'text', t: mm.t, d: mm.d || [0, -12], p }); });
      return { out, box };
    }
    // curved solids, drawn upright with the centre of the base at (0,0); screen y goes down
    const r = s.r, ry = r * 0.3;
    const ell = (cy, rx, mode) => { const rr = rx * 0.3; out.push({ k: 'ell', c: [0, -cy], rx, ry: rr, mode }); grow([-rx, -cy - rr]); grow([rx, -cy + rr]); };
    if (s.kind === 'cylinder') {
      ell(0, r, 'half'); ell(s.h, r, 'full');
      line([-r, 0], [-r, -s.h], 'vis'); line([r, 0], [r, -s.h], 'vis');
      if (s.cut && s.cut.y != null) ell(s.cut.y, r, 'cut');
      if (s.cut && s.cut.y == null) out.push({ k: 'poly', pts: [[-r * 0.8, ry * 0.6], [r * 0.8, -ry * 0.6], [r * 0.8, -ry * 0.6 - s.h], [-r * 0.8, ry * 0.6 - s.h]], cls: 'cut' });
    } else if (s.kind === 'cone') {
      ell(0, r, 'half'); line([-r, 0], [0, -s.h], 'vis'); line([r, 0], [0, -s.h], 'vis');
      if (s.cut && s.cut.y != null) ell(s.cut.y, r * (1 - s.cut.y / s.h), 'cut');
      if (s.cut && s.cut.y == null) out.push({ k: 'poly', pts: [[-r * 0.8, ry * 0.6], [0, -s.h], [r * 0.8, -ry * 0.6]], cls: 'cut' });
    } else if (s.kind === 'cfrustum') {
      ell(0, r, 'half'); ell(s.h, s.r2, 'full');
      line([-r, 0], [-s.r2, -s.h], 'vis'); line([r, 0], [s.r2, -s.h], 'vis');
      if (s.cut && s.cut.y != null) ell(s.cut.y, r + (s.r2 - r) * s.cut.y / s.h, 'cut');
    } else if (s.kind === 'sphere') {
      out.push({ k: 'circ', c: [0, -r], r }); grow([-r, -2 * r]); grow([r, 0]);
      ell(r, r, 'halfthin');
      if (s.cut && s.cut.y != null) ell(s.cut.y, Math.sqrt(Math.max(0, r * r - (s.cut.y - r) * (s.cut.y - r))), 'cut');
    } else if (s.kind === 'hemisphere') {
      ell(0, r, 'half');
      out.push({ k: 'dome', r }); grow([-r, -r]); grow([r, 0]);
      if (s.cut && s.cut.y != null) ell(s.cut.y, Math.sqrt(Math.max(0, r * r - s.cut.y * s.cut.y)), 'cut');
    }
    return { out, box };
  }

  function drawSolid(root, s, area) {
    const { out, box } = items(s);
    const lying = !!s.lying;
    let bw = box[2] - box[0] || 1, bh = box[3] - box[1] || 1;
    if (lying) [bw, bh] = [bh, bw];
    const capH = s.cap ? 18 : 0;
    const [ax, ay, aw, ah] = area;
    const k = Math.min(aw / bw, (ah - capH) / bh) * (s.scale || 1);
    const cx = ax + aw / 2, cy = ay + (ah - capH) / 2;
    const mx = (box[0] + box[2]) / 2, my = (box[1] + box[3]) / 2;
    const g = mk('g', { transform: `translate(${f2(cx)} ${f2(cy)})${lying ? ' rotate(-90)' : ''} scale(${f2(k)}) translate(${f2(-mx)} ${f2(-my)})` }, root);
    const sw = w => f2(w / k);
    const dash = `${sw(5)} ${sw(4)}`, dot = `${sw(1.5)} ${sw(4)}`;
    const style = cls => cls === 'hid' ? { stroke: 'var(--ink)', 'stroke-width': sw(1.2), 'stroke-dasharray': dash }
      : cls === 'cut' ? { stroke: 'var(--c2)', 'stroke-width': sw(2.2), 'stroke-dasharray': dot, 'stroke-linecap': 'round' }
        : { stroke: 'var(--ink)', 'stroke-width': sw(1.6) };
    const texts = [];
    out.forEach(it => {
      if (it.k === 'line') mk('line', { x1: f2(it.a[0]), y1: f2(it.a[1]), x2: f2(it.b[0]), y2: f2(it.b[1]), fill: 'none', 'stroke-linecap': 'round', class: 'sol-' + it.cls, ...style(it.cls) }, g);
      else if (it.k === 'poly') mk('polygon', { points: it.pts.map(p => p.map(f2).join(',')).join(' '), fill: 'var(--c2)', 'fill-opacity': 0.08, 'stroke-linejoin': 'round', class: 'sol-cut', ...style('cut') }, g);
      else if (it.k === 'circ') mk('circle', { cx: it.c[0], cy: it.c[1], r: it.r, fill: 'none', ...style('vis') }, g);
      else if (it.k === 'dome') mk('path', { d: `M${-it.r} 0 A${it.r} ${it.r} 0 0 1 ${it.r} 0`, fill: 'none', ...style('vis') }, g);
      else if (it.k === 'ell') {
        const { c, rx, ry, mode } = it;
        const front = `M${f2(c[0] - rx)} ${f2(c[1])} A${f2(rx)} ${f2(ry)} 0 0 0 ${f2(c[0] + rx)} ${f2(c[1])}`;
        const back = `M${f2(c[0] - rx)} ${f2(c[1])} A${f2(rx)} ${f2(ry)} 0 0 1 ${f2(c[0] + rx)} ${f2(c[1])}`;
        if (mode === 'full') mk('ellipse', { cx: c[0], cy: c[1], rx: f2(rx), ry: f2(ry), fill: 'none', ...style('vis') }, g);
        else if (mode === 'cut') { if (rx > 1e-6) mk('ellipse', { cx: c[0], cy: c[1], rx: f2(rx), ry: f2(ry), fill: 'var(--c2)', 'fill-opacity': 0.08, class: 'sol-cut', ...style('cut') }, g); }
        else { mk('path', { d: front, fill: 'none', ...style('vis') }, g); mk('path', { d: back, fill: 'none', ...style('hid') }, g); }
      } else if (it.k === 'text') texts.push(it);
    });
    // letters are drawn un-scaled so they keep their size
    texts.forEach(t => {
      let x = (t.p[0] - mx) * k, y = (t.p[1] - my) * k;
      if (lying) [x, y] = [y, -x];
      mk('text', { x: f2(cx + x + t.d[0]), y: f2(cy + y + t.d[1]), class: 'lbl' }, root).textContent = t.t;
    });
    if (s.cap) mk('text', { x: f2(ax + aw / 2), y: f2(ay + ah - 4), class: 'sol-cap' }, root).textContent = s.cap;
  }

  function renderInto(svg, spec) {
    const w = spec.w || 320, h = spec.h || 200, pad = spec.pad != null ? spec.pad : 16;
    const list = spec.solids || [spec.solid];
    const cw = (w - 2 * pad) / list.length;
    list.forEach((s, i) => drawSolid(svg, s, [pad + i * cw + 8, pad, cw - 16, h - 2 * pad]));
    (spec.texts || []).forEach(t => { mk('text', { x: t.at[0], y: t.at[1], class: t.cls || 'tag' }, svg).textContent = t.t; });
  }

  // a flat shape (cross-section) as a figure spec for G.draw: polygon points or { circle:r }
  function flatFig(shape, o = {}) {
    const w = o.w || 120, h = o.h || 100;
    if (shape.circle != null) return { w, h, fit: false, noLabels: true, pts: {}, circles: [{ c: [w / 2, h / 2], r: o.r || Math.min(w, h) / 2 - 14 }] };
    const L = 'ABCDEFGHIJKLMNOP'.slice(0, shape.length);
    return { w, h, noLabels: true, pad: o.pad || 16, make: [{ tri: L, shape: shape.map(p => [p[0], -p[1]]) }], polys: [L] };
  }

  return { renderInto, build, section, ngon, flatFig, proj, cutPoints, items, drawSolid };
})();
