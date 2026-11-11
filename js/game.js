'use strict';
/* The Sorting Game: look at a figure and put it in the right group.
   Decks: types of angles · triangles by sides · triangles by angles · polygons · solids.
   A round is 10 figures (no timer); the Speed Round is 60 seconds. Best scores are kept on this device. */
const GAME = (() => {
  const reg = (n, r, c, start) => SOL.ngon(n, r, start).map(p => [c[0] + p[0], c[1] + p[1]]);
  const L = 'ABCDEFGHIJKL';
  const polyFig = (pts, o = {}) => {
    const names = L.slice(0, pts.length), P = {};
    pts.forEach((p, i) => { P[names[i]] = p; });
    const ticks = {}, arcs = {};
    (o.ticks || []).forEach(([i, n]) => { ticks[names[i] + names[(i + 1) % pts.length]] = n; });
    (o.arcs || []).forEach(([i, n]) => { arcs[names[(i + pts.length - 1) % pts.length] + names[i] + names[(i + 1) % pts.length]] = n; });
    const rights = (o.rights || []).map(i => names[(i + pts.length - 1) % pts.length] + names[i] + names[(i + 1) % pts.length]);
    return { w: 240, h: 170, noLabels: true, pts: P, polys: [names], ticks, arcs, rights, reflex: (o.reflex || []).map(i => names[(i + pts.length - 1) % pts.length] + names[i] + names[(i + 1) % pts.length]), mono: true, arcR: 12 };
  };
  const all = (n, k = 1) => [...Array(n)].map((_, i) => [i, k]);

  const DECKS = [
    {
      id: 'angles', title: 'Types of angles', cats: ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Round'],
      make() {
        const c = U.pick([0, 0, 1, 2, 2, 3, 4, 4, 5]);
        const deg = [U.rint(15, 75), 90, U.rint(105, 165), 180, U.rint(200, 335), 360][c];
        return { svg: DEMO.angleSvg(deg, { rot: U.pick([0, 20, 45, 100, 150, 200, 250, 300]), w: 240, h: 170, len: 70, arc: 22 }), ans: c,
          why: `${DEMO.TYPES[c][0]}: ${DEMO.TYPES[c][2]}.` };
      },
    },
    {
      id: 'trisides', title: 'Triangles: by sides', cats: ['Equilateral', 'Isosceles', 'Scalene'],
      make() {
        const c = U.rint(0, 2);
        const ang = c === 0 ? [60, 60, 60] : c === 1 ? U.pick([[40, 70, 70], [100, 40, 40], [30, 75, 75], [90, 45, 45]]) : U.pick([[50, 60, 70], [30, 50, 100], [90, 35, 55], [45, 65, 70]]);
        const fig = { w: 240, h: 170, noLabels: true, make: [{ tri: 'ABC', ang, rot: U.pick([0, 0, 90, 180, 270]) }], polys: ['ABC'], mono: true };
        if (c === 0) fig.ticks = { AB: 1, BC: 1, CA: 1 };
        else if (c === 1) fig.ticks = { AB: 1, AC: 1 };
        else { const k = U.rint(4, 7); const s = ang.map(a => Math.sin(a * G.R)); fig.st = { BC: U.round(k, 1) + ' cm', CA: U.round(k * s[1] / s[0], 1) + ' cm', AB: U.round(k * s[2] / s[0], 1) + ' cm' }; }
        return { svg: G.draw(fig).svg, ans: c, why: ['Three equal sides: equilateral.', 'Exactly two equal sides: isosceles.', 'No equal sides: scalene.'][c] };
      },
    },
    {
      id: 'triangles', title: 'Triangles: by angles', cats: ['Acute-angled', 'Right-angled', 'Obtuse-angled'],
      make() {
        const c = U.rint(0, 2);
        const ang = c === 0 ? U.pick([[50, 60, 70], [80, 45, 55], [65, 75, 40], [58, 61, 61]]) : c === 1 ? U.pick([[90, 30, 60], [40, 90, 50], [25, 65, 90], [90, 45, 45]]) : U.pick([[110, 30, 40], [25, 130, 25], [35, 45, 100], [20, 65, 95]]);
        const hideOne = Math.random() < 0.6;
        const keys = ['CAB', 'ABC', 'BCA'];
        const skip = hideOne ? ang.indexOf(Math.max(...ang)) : -1;   // the biggest angle is the one to work out
        const at = {}; keys.forEach((k, i) => { if (i !== skip) at[k] = ang[i] + '°'; });
        const fig = { w: 240, h: 170, noLabels: true, make: [{ tri: 'ABC', ang, rot: U.pick([0, 0, 180]) }], polys: ['ABC'], at };
        const big = Math.max(...ang);
        return { svg: G.draw(fig).svg, ans: c,
          why: (hideOne ? `The third angle is 180° − ${ang.filter((_, i) => i !== skip).join('° − ')}° = ${big}°. ` : '') + ['All three angles are acute.', 'One angle is 90°.', `One angle (${big}°) is obtuse.`][c] };
      },
    },
    {
      id: 'polygons', title: 'Polygons', cats: ['Regular', 'Convex, not regular', 'Concave'],
      make() {
        const c = [120, 85];
        const list = [
          [0, polyFig(reg(3, 62, [120, 100]), { ticks: all(3), arcs: all(3) }), 'All sides equal and all angles equal: regular.'],
          [0, polyFig(reg(4, 68, c), { ticks: all(4), rights: [0, 1, 2, 3] }), 'A square: all sides equal and all angles equal, so it is regular.'],
          [0, polyFig(reg(5, 64, [120, 90]), { ticks: all(5), arcs: all(5) }), 'All sides equal and all angles equal: regular.'],
          [0, polyFig(reg(6, 66, c), { ticks: all(6), arcs: all(6) }), 'All sides equal and all angles equal: regular.'],
          [1, polyFig([[120, 20], [205, 85], [120, 150], [35, 85]], { ticks: all(4) }), 'Equal sides only (equilateral). The angles are not all equal, so it is not regular. No angle is greater than 180°: convex.'],
          [1, polyFig([[30, 40], [210, 40], [210, 130], [30, 130]], { rights: [0, 1, 2, 3] }), 'Equal angles only (equiangular). The sides are not all equal, so it is not regular. Convex.'],
          [1, polyFig([[60, 30], [190, 45], [215, 135], [35, 120]]), 'No equal marks, so not regular. Every interior angle is less than 180°: convex.'],
          [1, polyFig([[40, 60], [120, 20], [200, 60], [175, 140], [65, 140]]), 'No equal marks, so not regular. Every interior angle is less than 180°: convex.'],
          [2, polyFig([[120, 20], [205, 150], [120, 100], [35, 150]], { reflex: [2], arcs: [[2, 1]] }), 'The marked interior angle is greater than 180°: concave.'],
          [2, polyFig([[30, 30], [120, 30], [120, 90], [210, 90], [210, 145], [30, 145]], { reflex: [2], arcs: [[2, 1]] }), 'The marked interior angle is greater than 180° (a reflex angle): concave.'],
          [2, polyFig([[25, 85], [80, 35], [80, 65], [215, 65], [215, 105], [80, 105], [80, 135]], { ticks: [] }), 'An arrow: two of its interior angles are greater than 180°, so it is concave.'],
          [2, polyFig([[120, 15], [140, 65], [200, 65], [152, 98], [170, 150], [120, 118], [70, 150], [88, 98], [40, 65], [100, 65]], { ticks: all(10) }), 'A star: its sides are equal, but five interior angles are greater than 180°. Concave, and not regular.'],
        ];
        const [ans, fig, why] = U.pick(list);
        return { svg: G.draw(fig).svg, ans, why };
      },
    },
    {
      id: 'solids', title: 'Solids: polyhedron?', cats: ['Polyhedron', 'Not a polyhedron'],
      make() {
        const [ans, solid, why] = U.pick(SOLIDS);
        return { svg: G.draw({ w: 240, h: 170, solid }).svg, ans: ans[0], why: why[0] };
      },
    },
    {
      id: 'uniform', title: 'Solids: uniform cross-sections?', cats: ['Uniform cross-sections', 'No uniform cross-sections'],
      make() {
        const [ans, solid, why] = U.pick(SOLIDS);
        return { svg: G.draw({ w: 240, h: 170, solid }).svg, ans: ans[1], why: why[1] };
      },
    },
  ];
  const yes = 'All its faces are polygons.', prismU = 'A prism: every cut parallel to its end faces has the same shape and size.';
  const SOLIDS = [
    [[0, 0], { kind: 'uprism', ngon: 4, r: 2.2, height: 3.1 }, [yes, prismU]],
    [[0, 0], { kind: 'uprism', base: [[-3, -1.2], [3, -1.2], [3, 1.2], [-3, 1.2]], height: 2.4 }, [yes, prismU]],
    [[0, 0], { kind: 'prism', base: [[0, 0], [4, 0], [1.4, 3]], depth: 6 }, [yes, prismU]],
    [[0, 0], { kind: 'uprism', ngon: 5, r: 2, height: 4 }, [yes, prismU]],
    [[0, 0], { kind: 'prism', base: [[0, 0], [4, 0], [4, 1.5], [1.5, 1.5], [1.5, 4], [0, 4]], depth: 3 }, [yes, 'An L-shaped prism: every cut parallel to the L-shaped faces is the same L.']],
    [[0, 1], { kind: 'pyramid', ngon: 4, r: 2.6, height: 4.4 }, [yes, 'A pyramid gets narrower towards the vertex, so the cuts change size.']],
    [[0, 1], { kind: 'pyramid', ngon: 3, r: 2.6, height: 4.2 }, [yes, 'A pyramid gets narrower towards the vertex, so the cuts change size.']],
    [[0, 1], { kind: 'pyramid', ngon: 6, r: 2.4, height: 4.6 }, [yes, 'A pyramid gets narrower towards the vertex, so the cuts change size.']],
    [[0, 1], { kind: 'frustum', ngon: 4, r: 2.8, height: 3, top: 0.5 }, [yes, 'The top face is smaller than the base, so the cuts change size.']],
    [[1, 0], { kind: 'cylinder', r: 1.8, h: 4.2 }, ['Its curved surface is not a polygon.', 'A circular cylinder: every cut parallel to the circular ends is the same circle.']],
    [[1, 0], { kind: 'cylinder', r: 1.5, h: 4.6, lying: true }, ['Its curved surface is not a polygon.', 'A circular cylinder: every cut parallel to the circular ends is the same circle.']],
    [[1, 1], { kind: 'cone', r: 2, h: 4.4 }, ['Its curved surface is not a polygon.', 'A circular cone gets narrower towards the vertex, so the circles change size.']],
    [[1, 1], { kind: 'sphere', r: 2.2 }, ['A sphere has no flat faces at all.', 'The circles are small near the top and bottom and largest in the middle.']],
    [[1, 1], { kind: 'hemisphere', r: 2.6 }, ['Its curved surface is not a polygon.', 'The circles get smaller towards the top.']],
    [[1, 1], { kind: 'cfrustum', r: 2.4, r2: 1.3, h: 3 }, ['Its curved surface is not a polygon.', 'The top circle is smaller than the base, so the cuts change size.']],
  ];

  function render() {
    const box = U.el('div', { class: 'demo game' });
    const gs = Store.game();
    let deck = DECKS[0], timed = false, score = 0, count = 0, cur = null, timer = null, ends = 0, locked = false, lastSig = '';
    const deckRow = U.el('div', { class: 'cons-list', role: 'tablist' });
    const top = U.el('div', { class: 'game-top' });
    const stats = U.el('div', { class: 'stats' });
    const figWrap = U.el('div', { class: 'fig-wrap game-fig' });
    const cats = U.el('div', { class: 'game-cats' });
    const fb = U.el('div', { class: 'status', 'aria-live': 'polite' });
    const startRow = U.el('div', { class: 'btn-row' });
    const best = () => (gs.best[deck.id] || { round: 0, speed: 0 });
    const showStats = () => {
      stats.textContent = cur ? (timed ? `Speed Round · ${Math.max(0, Math.ceil((ends - Date.now()) / 1000))} s · Score ${score}` : `Figure ${Math.min(count + 1, 10)} of 10 · Score ${score}`)
        : `Best round: ${best().round}/10 · Best Speed Round: ${best().speed}`;
    };
    function stop(done) {
      if (timer) { clearInterval(timer); timer = null; }
      if (done) {
        const b = best();
        if (timed) b.speed = Math.max(b.speed, score); else b.round = Math.max(b.round, score);
        gs.best[deck.id] = b; Store.save();
        U.clear(figWrap).append(U.el('div', { class: 'score-big', text: timed ? String(score) : score + ' / 10' }));
        fb.className = 'status good';
        fb.textContent = timed ? `Time is up. You sorted ${score} correctly in 60 seconds.` : score === 10 ? 'Full marks. Try the Speed Round, or another deck.' : 'Round finished. Play again to beat your score.';
      } else { U.clear(figWrap); fb.textContent = ''; }
      U.clear(cats); cur = null; locked = false;
      startRow.classList.remove('hidden');
      showStats();
    }
    function next() {
      if (!timed && count >= 10) return stop(true);
      let it, tries = 0;
      do { it = deck.make(); tries++; } while (it.svg.outerHTML === lastSig && tries < 6);
      lastSig = it.svg.outerHTML;
      cur = it; locked = false;
      U.clear(figWrap).append(it.svg);
      cats.querySelectorAll('button').forEach(b => { b.classList.remove('right', 'wrong'); b.disabled = false; });
      showStats();
    }
    function answer(i, btn) {
      if (!cur || locked) return;
      locked = true;
      const ok = i === cur.ans;
      if (ok) score++;
      count++;
      btn.classList.add(ok ? 'right' : 'wrong');
      cats.querySelectorAll('button')[cur.ans].classList.add('right');
      fb.className = 'status' + (ok ? ' good' : '');
      fb.textContent = (ok ? 'Correct. ' : 'Not quite. ') + cur.why;
      showStats();
      setTimeout(() => { if (cur) { if (!timed || Date.now() < ends) next(); } }, ok ? (timed ? 350 : 900) : (timed ? 1300 : 2200));
    }
    function start(isTimed) {
      timed = isTimed; score = 0; count = 0; fb.textContent = ''; fb.className = 'status';
      startRow.classList.add('hidden');
      U.clear(cats);
      deck.cats.forEach((c, i) => { const b = U.el('button', { type: 'button', class: 'opt', text: c }); b.addEventListener('click', () => answer(i, b)); cats.append(b); });
      if (timed) { ends = Date.now() + 60000; timer = setInterval(() => { if (Date.now() >= ends) stop(true); else showStats(); }, 250); }
      next();
    }
    DECKS.forEach(d => {
      const b = U.el('button', { type: 'button', role: 'tab', text: d.title });
      b.addEventListener('click', () => { stop(false); deck = d; deckRow.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); showStats(); });
      if (d === deck) b.classList.add('on');
      deckRow.append(b);
    });
    startRow.append(U.el('button', { type: 'button', class: 'btn', text: 'Start a round of 10', onclick: () => start(false) }),
      U.el('button', { type: 'button', class: 'btn ghost', text: 'Speed Round (60 s)', onclick: () => start(true) }));
    top.append(stats);
    box.append(deckRow, top, figWrap, cats, fb, startRow);
    showStats();
    box.cleanup = () => { if (timer) clearInterval(timer); cur = null; };
    return box;
  }
  return { render, DECKS, SOLIDS };
})();
