'use strict';
/* Basic constructions with a ruler, set square, protractor and compasses, shown step by step (Section 5.3).
   CONS.render() shows all of them; CONS.render(['sss','sas']) shows only those. */
const CONS = (() => {
  const { V, mk } = G;
  const f2 = x => Math.round(x * 100) / 100;
  const deg = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) / G.R;
  const at = (c, r, a) => [c[0] + r * Math.cos(a * G.R), c[1] + r * Math.sin(a * G.R)];
  function cc(c1, r1, c2, r2) {
    const d = V.dist(c1, c2), a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
    const u = V.unit(V.sub(c2, c1)), m = V.add(c1, V.mul(u, a)), p = V.perp(u);
    return [V.add(m, V.mul(p, h)), V.add(m, V.mul(p, -h))];
  }
  const higher = (p, q) => (p[1] < q[1] ? p : q);
  // drawing primitives
  const seg = (a, b, cls = 'c-line') => ({ k: 'seg', a, b, cls });
  const ext = (a, b, e1, e2, cls = 'c-line') => { const u = V.unit(V.sub(b, a)); return { k: 'seg', a: V.add(a, V.mul(u, -e1)), b: V.add(b, V.mul(u, e2)), cls }; };
  const arc = (c, r, a1, a2) => ({ k: 'arc', c, r, a1: Math.min(a1, a2), a2: Math.max(a1, a2) });
  const arcAt = (c, r, target, span = 18) => { const a = deg(c, target); return arc(c, r, a - span, a + span); };
  const pt = (p, label, lp) => ({ k: 'pt', p, label, lp });

  // tools and notes (shown only on the step that uses them when listed under `tmp`)
  const tool = (pts, cls = 'c-tool') => ({ k: 'poly', pts, cls });
  const txt = (p, t, cls = 'txt') => ({ k: 'txt', p, t, cls });
  const ra = (p, u, v) => ({ k: 'ra', p, u, v });                       // right-angle mark at p between directions u and v
  const prot = (c, dir = 0) => ({ k: 'prot', c, dir });                 // protractor: centre c, base line pointing dir degrees
  const circle = (c, r) => ({ k: 'arc', c, r, a1: 0, a2: 359.9 });
  const ruler = (a, b, wd = 16, side = 1) => { const u = V.unit(V.sub(b, a)), n = V.mul(V.perp(u), side * wd); return tool([a, b, V.add(b, n), V.add(a, n)], 'c-tool ruler'); };
  const CM = 30;   // pixels for 1 cm in these drawings

  const LIST = [
    {
      id: 'parallel', title: 'Parallel line (set square)', tools: 'ruler + set square',
      build() {
        const C = [40, 190], D = [300, 190], E = [200, 95];
        const sq = dy => tool([[120, 190 - dy], [230, 190 - dy], [120, 126 - dy]]);
        const rl = tool([[104, 20], [120, 20], [120, 225], [104, 225]], 'c-tool ruler');
        return [
          { text: 'We are given a line CD and a point E. We want the line through E <b>parallel</b> to CD.', els: [ext(C, D, 0, 0), pt(C, 'C', [-4, 14]), pt(D, 'D', [4, 14]), pt(E, 'E', [8, 13])] },
          { text: 'Put one edge of the <b>set square</b> exactly along CD.', els: [], tmp: [sq(0)] },
          { text: 'Hold a <b>ruler</b> firmly against another edge of the set square. The ruler must not move from now on.', els: [], tmp: [sq(0), rl] },
          { text: '<b>Slide</b> the set square along the ruler until its edge reaches E.', els: [], tmp: [tool([[120, 190], [230, 190], [120, 126]], 'c-tool ghost'), sq(95), rl, txt([138, 150], '↑', 'tag')] },
          { text: 'Draw the line through E along that edge. Mark the two lines with arrows: the new line // CD.', els: [seg([40, 95], [300, 95], 'c-result'), { k: 'arrow', p: [150, 95] }, { k: 'arrow', p: [150, 190] }] },
        ];
      },
      why: 'The set square keeps the same angle with the ruler while it slides, so the new edge has the same direction as CD.',
    },
    {
      id: 'perp', title: 'Perpendicular line (set square)', tools: 'ruler + set square',
      build() {
        const C = [40, 190], D = [300, 190], E = [185, 80];
        const sq = x => tool([[x, 190], [x + 64, 190], [x, 60]]);
        const rl = tool([[30, 190], [310, 190], [310, 206], [30, 206]], 'c-tool ruler');
        return [
          { text: 'We are given a line CD and a point E. We want the line through E <b>perpendicular</b> to CD.', els: [ext(C, D, 0, 0), pt(C, 'C', [-4, -12]), pt(D, 'D', [4, -12]), pt(E, 'E', [-12, -4])] },
          { text: 'Put a <b>ruler</b> along CD. Stand the set square on the ruler, with one edge of its right angle on the ruler.', els: [], tmp: [rl, sq(80)] },
          { text: '<b>Slide</b> the set square along the ruler until its upright edge passes through E.', els: [], tmp: [rl, tool([[80, 190], [144, 190], [80, 60]], 'c-tool ghost'), sq(185), txt([160, 120], '→', 'tag')] },
          { text: 'Draw the line through E along the upright edge, down to CD. Mark the right angle: the new line ⊥ CD.', els: [seg([185, 40], [185, 190], 'c-result'), ra([185, 190], [1, 0], [0, -1])] },
        ];
      },
      why: 'The two short edges of a set square meet at 90°. One edge lies along CD, so the other edge is perpendicular to CD. The point where the perpendicular meets CD is the foot of the perpendicular.',
    },
    {
      id: 'circle', title: 'Circle of a given radius', tools: 'ruler + compasses',
      build() {
        const O = [170, 115], r = 2.5 * CM, P = [O[0] + r, O[1]];
        return [
          { text: 'We want a circle with centre O and radius 2.5 cm. Mark the centre O.', els: [pt(O, 'O', [-10, -8])] },
          { text: 'Open the <b>compasses</b> to 2.5 cm on the ruler: the needle at 0 and the pencil at 2.5.', els: [], tmp: [ruler([60, 222], [280, 222], 14, -1), seg([95, 204], [95 + r, 204], 'c-result'), txt([95, 229], '0', 'txt'), txt([95 + r, 229], '2.5', 'txt')] },
          { text: 'Put the needle on O. Keep the opening fixed and turn the pencil all the way round.', els: [circle(O, r)] },
          { text: 'Every point on the circle is 2.5 cm from O. A line segment from the centre to the circle is a <b>radius</b>.', els: [seg(O, P, 'c-result'), txt([O[0] + r / 2, O[1] - 9], '2.5 cm')] },
        ];
      },
      why: 'The opening of the compasses is the radius. Check it on the ruler before you draw, and do not squeeze the compasses while turning.',
    },
    {
      id: 'copy', title: 'Copy a line segment', tools: 'compasses',
      build() {
        const A = [40, 70], B = [130, 70], C = [60, 170], D = [310, 170], E = [150, 170];
        return [
          { text: 'We are given AB and a line CD. We want a point E on CD such that CE = AB.', els: [seg(A, B), pt(A, 'A', [0, -12]), pt(B, 'B', [0, -12]), seg(C, D), pt(C, 'C', [0, 14]), pt(D, 'D', [0, 14])] },
          { text: 'Put the needle on A and open the <b>compasses</b> until the pencil is on B. The opening is now the length AB.', els: [arcAt(A, 90, B, 12)] },
          { text: 'Keep the <b>same opening</b>. Put the needle on C and draw an arc that cuts CD.', els: [arcAt(C, 90, E, 16)] },
          { text: 'Mark the point E where the arc cuts CD. Then CE = AB.', els: [pt(E, 'E', [0, 14]), seg(C, E, 'c-result')] },
        ];
      },
      why: 'The compasses carry the length from AB to CD. No ruler is needed, so there is no measuring error.',
    },
    {
      id: 'sss', title: 'Triangle: three sides', tools: 'ruler + compasses',
      build() {
        const A = [80, 200], B = [80 + 5 * CM, 200];
        const [P1, P2] = cc(A, 4 * CM, B, 3.5 * CM); const Cc = higher(P1, P2);
        return [
          { text: 'Construct △ABC with AB = 5 cm, AC = 4 cm and BC = 3.5 cm. <b>Case 1</b>: three sides — use a ruler and compasses.', els: [] },
          { text: 'Draw AB = 5 cm with the ruler.', els: [seg(A, B), pt(A, 'A', [-10, 8]), pt(B, 'B', [10, 8]), txt([155, 213], '5 cm')] },
          { text: 'Open the compasses to 4 cm. With centre A, draw an arc above AB.', els: [arcAt(A, 4 * CM, Cc, 16)] },
          { text: 'Open the compasses to 3.5 cm. With centre B, draw an arc cutting the first arc. Mark the point C.', els: [arcAt(B, 3.5 * CM, Cc, 16), pt(Cc, 'C', [0, -13])] },
          { text: 'Join AC and BC. Label the vertices and the given lengths. <b>Keep the arcs</b> — they show your method.', els: [seg(A, Cc, 'c-result'), seg(B, Cc, 'c-result'), txt([108, 138], '4 cm'), txt([226, 142], '3.5 cm')] },
        ];
      },
      why: 'C is 4 cm from A (first arc) and 3.5 cm from B (second arc), so it is the only point above AB that fits both lengths.',
    },
    {
      id: 'sas', title: 'Triangle: two sides and the included angle', tools: 'ruler + protractor',
      build() {
        const E = [70, 200], F = [70 + 6 * CM, 200], Dd = at(E, 4 * CM, -50), far = at(E, 5.6 * CM, -50);
        return [
          { text: 'Construct △DEF with EF = 6 cm, DE = 4 cm and ∠DEF = 50°. <b>Case 2</b>: two sides and their included angle — use a ruler and a protractor.', els: [] },
          { text: 'Draw EF = 6 cm with the ruler.', els: [seg(E, F), pt(E, 'E', [-10, 8]), pt(F, 'F', [10, 8]), txt([160, 213], '6 cm')] },
          { text: 'Put the centre of the <b>protractor</b> on E with its base line along EF. Mark a dot at 50°.', els: [], tmp: [prot(E), pt(at(E, 72, -50), '', null)] },
          { text: 'Draw a line from E through the dot.', els: [seg(E, far), txt([106, 186], '50°'), arc(E, 20, -50, 0)] },
          { text: 'Measure 4 cm from E along this line and mark D.', els: [pt(Dd, 'D', [-12, -6]), txt([92, 140], '4 cm')] },
          { text: 'Join DF. The triangle is finished.', els: [seg(E, Dd, 'c-result'), seg(Dd, F, 'c-result')] },
        ];
      },
      why: 'The angle must be the one between the two given sides (the included angle), so both sides start from E.',
    },
    {
      id: 'asa', title: 'Triangle: two angles and the included side', tools: 'ruler + protractor',
      build() {
        const H = [80, 200], I = [80 + 5 * CM, 200];
        const J = G.lineInter(H, at(H, 100, -65), I, at(I, 100, -180 + 45));
        return [
          { text: 'Construct △HIJ with HI = 5 cm, ∠JHI = 65° and ∠HIJ = 45°. <b>Case 3</b>: two angles and their included side — use a ruler and a protractor.', els: [] },
          { text: 'Draw HI = 5 cm with the ruler.', els: [seg(H, I), pt(H, 'H', [-10, 8]), pt(I, 'I', [10, 8]), txt([155, 213], '5 cm')] },
          { text: 'Put the protractor on H. Mark 65° and draw a long line from H.', els: [seg(H, at(H, 175, -65)), arc(H, 20, -65, 0), txt([112, 185], '65°')], tmp: [prot(H)] },
          { text: 'Put the protractor on I. Mark 45° (measured from IH) and draw a long line from I.', els: [seg(I, at(I, 150, -135)), arc(I, 22, -180, -135), txt([193, 190], '45°')], tmp: [prot(I)] },
          { text: 'The two lines meet at J. Label it. The triangle is finished.', els: [pt(J, 'J', [0, -13]), seg(H, J, 'c-result'), seg(I, J, 'c-result')] },
        ];
      },
      why: 'Each angle is measured at its own end of the given side. Read the protractor scale that starts from 0° on the side you are measuring from.',
    },
    {
      id: 'aas', title: 'Triangle: two angles and a side not between them', tools: 'ruler + protractor',
      build() {
        const Q = [72, 205], Rr = [72 + 6 * CM, 205];
        const P = G.lineInter(Q, at(Q, 100, -40), Rr, at(Rr, 100, -180 + 75));
        return [
          { text: 'Construct △PQR with QR = 6 cm, ∠QPR = 65° and ∠PRQ = 75°. <b>Case 4</b>: the given side is <b>not</b> between the two given angles.', els: [] },
          { text: 'First find the third angle: ∠PQR = 180° − 65° − 75° = 40° (∠ sum of △). Now we know the angles at both ends of QR.', els: [txt([170, 22], '∠PQR = 180° − 65° − 75° = 40°', 'tag')] },
          { text: 'Draw QR = 6 cm with the ruler.', els: [seg(Q, Rr), pt(Q, 'Q', [-10, 8]), pt(Rr, 'R', [10, 8]), txt([162, 218], '6 cm')] },
          { text: 'At Q, measure 40° with the protractor and draw a long line.', els: [seg(Q, at(Q, 215, -40)), arc(Q, 24, -40, 0), txt([114, 195], '40°')], tmp: [prot(Q)] },
          { text: 'At R, measure 75° and draw a long line. The two lines meet at P.', els: [seg(Rr, at(Rr, 170, -105)), arc(Rr, 20, -180, -105), txt([222, 192], '75°'), pt(P, 'P', [15, 3])], tmp: [prot(Rr)] },
          { text: 'Join up and label. Check: the angle at P should measure 65°.', els: [seg(Q, P, 'c-result'), seg(Rr, P, 'c-result')] },
        ];
      },
      why: 'You cannot measure an angle at P before P exists. Finding the third angle first turns Case 4 into Case 3.',
    },
    {
      id: 'rhs', title: 'Triangle: right angle, hypotenuse and one side', tools: 'ruler + set square (or protractor) + compasses',
      build() {
        const Y = [110, 200], Z = [110 + 3 * CM, 200], r = 5 * CM;
        const X = [Y[0], Y[1] - Math.sqrt(r * r - 9 * CM * CM)];
        return [
          { text: 'Construct △XYZ with ∠XYZ = 90°, YZ = 3 cm and XZ = 5 cm. <b>Case 5</b>: a right angle, the hypotenuse and one other side.', els: [] },
          { text: 'Draw YZ = 3 cm with the ruler.', els: [seg(Y, Z), pt(Y, 'Y', [-10, 8]), pt(Z, 'Z', [10, 8]), txt([155, 213], '3 cm')] },
          { text: 'At Y, draw a long line perpendicular to YZ (set square or protractor).', els: [seg(Y, [Y[0], 30]), ra(Y, [1, 0], [0, -1])], tmp: [tool([[Y[0], 200], [Y[0] + 60, 200], [Y[0], 90]])] },
          { text: 'XZ is the hypotenuse (opposite the right angle). Open the compasses to 5 cm. With centre Z, draw an arc cutting the perpendicular at X.', els: [arcAt(Z, r, X, 14), pt(X, 'X', [-12, -4])] },
          { text: 'Join XZ. The triangle is finished.', els: [seg(X, Z, 'c-result'), seg(Y, X, 'c-result'), txt([186, 126], '5 cm')] },
        ];
      },
      why: 'The length XY is not given, so we cannot measure it. The arc finds the one point on the perpendicular that is 5 cm from Z.',
    },
  ];

  function render(only) {
    const SHOWN = only && only.length ? LIST.filter(c => only.includes(c.id)) : LIST;
    const box = U.el('div', { class: 'demo' });
    const list = U.el('div', { class: 'cons-list', role: 'tablist' });
    const title = U.el('div', { class: 'demo-title' });
    const svg = mk('svg', { viewBox: '0 0 340 240', class: 'fig', role: 'img', 'aria-label': 'Construction drawing' });
    svg.style.maxWidth = '560px';
    const stepText = U.el('div', { class: 'cons-step', 'aria-live': 'polite' });
    const toolsEl = U.el('div', { class: 'small muted' });
    const why = U.el('details', {}, U.el('summary', { text: 'Why does it work?' }), U.el('p'));
    let cur, steps, i = 0, timer = null;
    const prev = U.el('button', { type: 'button', class: 'btn ghost small', text: '◀ Back', onclick: () => go(i - 1) });
    const next = U.el('button', { type: 'button', class: 'btn small', text: 'Next ▶', onclick: () => go(i + 1) });
    const play = U.el('button', { type: 'button', class: 'btn ghost small', text: 'Play all', onclick: () => playAll() });
    const again = U.el('button', { type: 'button', class: 'btn ghost small', text: 'Start again', onclick: () => { stop(); go(0); } });
    box.append(list, title, toolsEl, U.el('div', { class: 'fig-wrap' }, svg), stepText, U.el('div', { class: 'btn-row' }, prev, next, play, again), why);

    function drawEl(e, isNew) {
      let node;
      if (e.k === 'seg') {
        node = mk('line', { x1: f2(e.a[0]), y1: f2(e.a[1]), x2: f2(e.b[0]), y2: f2(e.b[1]), class: e.cls }, svg);
        if (isNew) animate(node, V.dist(e.a, e.b));
      } else if (e.k === 'arc') {
        const s = at(e.c, e.r, e.a1), t = at(e.c, e.r, e.a2), span = e.a2 - e.a1;
        node = mk('path', { d: `M${f2(s[0])} ${f2(s[1])} A${f2(e.r)} ${f2(e.r)} 0 ${span > 180 ? 1 : 0} 1 ${f2(t[0])} ${f2(t[1])}`, class: 'c-arc' }, svg);
        if (isNew) animate(node, e.r * span * G.R);
      } else if (e.k === 'pt') {
        mk('circle', { cx: f2(e.p[0]), cy: f2(e.p[1]), r: 2.8, class: 'c-pt' + (isNew ? ' new' : '') }, svg);
        if (e.label) {
          const lp = e.lp || [8, -8];
          mk('text', { x: f2(e.p[0] + lp[0]), y: f2(e.p[1] + lp[1]), class: 'lbl' }, svg).textContent = e.label;
        }
      } else if (e.k === 'poly') {
        mk('polygon', { points: e.pts.map(p => p.map(f2).join(',')).join(' '), class: e.cls }, svg);
      } else if (e.k === 'txt') {
        mk('text', { x: f2(e.p[0]), y: f2(e.p[1]), class: e.cls, 'dominant-baseline': 'central' }, svg).textContent = e.t;
      } else if (e.k === 'ra') {
        const s = 10, p1 = V.add(e.p, V.mul(e.u, s)), p3 = V.add(e.p, V.mul(e.v, s)), p2 = V.add(p1, V.mul(e.v, s));
        mk('path', { d: `M${f2(p1[0])} ${f2(p1[1])} L${f2(p2[0])} ${f2(p2[1])} L${f2(p3[0])} ${f2(p3[1])}`, class: 'c-line', 'stroke-width': 1.2 }, svg);
      } else if (e.k === 'arrow') {
        mk('path', { d: `M${e.p[0] - 6} ${e.p[1] - 5} L${e.p[0] + 2} ${e.p[1]} L${e.p[0] - 6} ${e.p[1] + 5}`, class: 'c-line', 'stroke-width': 1.5 }, svg);
      } else if (e.k === 'prot') {
        const g = mk('g', { transform: `translate(${f2(e.c[0])} ${f2(e.c[1])}) rotate(${e.dir})`, class: 'c-prot' }, svg);
        const r = 66;
        mk('path', { d: `M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 Z`, class: 'c-tool' }, g);
        for (let a = 0; a <= 180; a += 10) { const p = at([0, 0], r, -a), q = at([0, 0], r - (a % 30 ? 6 : 11), -a); mk('line', { x1: f2(p[0]), y1: f2(p[1]), x2: f2(q[0]), y2: f2(q[1]), class: 'c-tick' }, g); }
        for (let a = 30; a < 180; a += 30) { const p = at([0, 0], r - 19, -a); mk('text', { x: f2(p[0]), y: f2(p[1]), class: 'c-ptxt', 'dominant-baseline': 'central' }, g).textContent = a; }
      }
    }
    function animate(node, len) {
      if (!node.animate) return;
      node.style.strokeDasharray = len;
      const a = node.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1100, easing: 'ease-out', fill: 'forwards' });
      a.onfinish = () => { node.style.strokeDasharray = ''; };
    }
    function go(k) {
      i = Math.max(0, Math.min(steps.length - 1, k));
      U.clear(svg);
      // points drawn last so they sit on top
      const pts = [];
      (steps[i].tmp || []).filter(e => e.k === 'poly' || e.k === 'prot').forEach(e => drawEl(e, false));   // tools lie under the drawing
      for (let j = 0; j <= i; j++) steps[j].els.forEach(e => { if (e.k === 'pt') pts.push([e, j === i]); else drawEl(e, j === i); });
      (steps[i].tmp || []).filter(e => e.k !== 'poly' && e.k !== 'prot').forEach(e => { if (e.k === 'pt') pts.push([e, true]); else drawEl(e, true); });
      pts.forEach(([e, n]) => drawEl(e, n));
      stepText.innerHTML = `<span class="stepno">Step ${i + 1} of ${steps.length}.</span> ` + steps[i].text;
      prev.disabled = i === 0; next.disabled = i === steps.length - 1;
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = 'Play all'; } }
    function playAll() {
      if (timer) { stop(); return; }
      go(0);
      play.textContent = 'Pause';
      timer = setInterval(() => { if (i >= steps.length - 1) stop(); else go(i + 1); }, 2200);
    }
    function select(c) {
      stop();
      cur = c; steps = c.build();
      list.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.id === c.id));
      title.textContent = c.title;
      toolsEl.textContent = c.tools ? 'Tools: ' + c.tools : '';
      why.querySelector('p').textContent = c.why;
      why.open = false;
      go(0);
    }
    SHOWN.forEach(c => {
      const b = U.el('button', { type: 'button', role: 'tab', 'data-id': c.id, text: c.title });
      b.addEventListener('click', () => select(c));
      list.append(b);
    });
    if (SHOWN.length < 2) list.classList.add('hidden');
    select(SHOWN[0]);
    return box;
  }
  return { render, LIST };
})();
