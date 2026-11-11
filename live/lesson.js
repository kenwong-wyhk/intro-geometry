'use strict';
/* Helpers shared by the live lessons (s51-live.html, s52-live.html, ...).
   Load after the site's js/core.js, geom.js, check.js, question.js and live/live.js,
   and before the lesson's own script. Nothing here runs until a lesson calls it,
   except the maths pass at the bottom, which must happen before anything is built. */
const L5 = (() => {
  const $ = id => document.getElementById(id);
  const C = n => 'var(--c' + n + ')';

  // Call fn(shown) now and whenever el gains or loses the "shown" class (a step press, or back).
  function onShown(el, fn) {
    fn(el.classList.contains('shown'));
    new MutationObserver(() => fn(el.classList.contains('shown'))).observe(el, { attributes: true, attributeFilter: ['class'] });
  }
  function figInto(id, spec, hl) {
    const f = G.draw(spec);
    if (hl) f.highlight(hl);
    $(id).append(f.svg);
    return f;
  }
  // [['PQR','XYZ',1]] -> [['PQR',1],['XYZ',1]]
  function hlList(hl) {
    const out = [];
    (hl || []).forEach(h => { const n = typeof h[h.length - 1] === 'number' ? h[h.length - 1] : 1; h.forEach(p => { if (typeof p === 'string') out.push([p, n]); }); });
    return out;
  }

  /* Light the figure from the latest line shown. items: [{ el, hl, fixed }].
     The current line gets the class "now" and data-c = its highlight colour (1, 2, 3, or "mix"),
     so its band matches the figure: blue, red or gold pair; grey when it lights several colours. */
  function lightFrom(fig, items) {
    let current = null;
    const update = () => {
      let last = -1;
      items.forEach((it, i) => { if (it.hl && (it.fixed || it.el.classList.contains('shown'))) last = i; });
      // Only act on a change: marking a line "now" is itself a class change the observer sees.
      if (last === current) return;
      if (current !== null && current >= 0) items[current].el.classList.remove('now');
      current = last;
      fig.clearHL();
      if (last >= 0) {
        const list = hlList(items[last].hl), cols = [...new Set(list.map(([, n]) => n))];
        fig.highlight(list);
        items[last].el.dataset.c = cols.length === 1 ? cols[0] : 'mix';
        items[last].el.classList.add('now');
      }
    };
    items.forEach(it => { if (it.el.dataset.step) new MutationObserver(update).observe(it.el, { attributes: true, attributeFilter: ['class'] }); });
    update();
  }

  /* A worked solution: proof lines appear one per press (lines marked fixed show from the start),
     and the figure lights the parts named by the latest line. */
  function solution(figId, proofId, spec, steps) {
    const fig = figInto(figId, spec);
    const { table, trs } = QR.proofTable(steps, {}, [], { returnRows: true });
    $(proofId).append(table);
    let n = 0;
    trs.forEach((tr, i) => { if (!steps[i].fixed) tr.dataset.step = ++n; });
    lightFrom(fig, trs.map((tr, i) => ({ el: tr, hl: steps[i].hl, fixed: steps[i].fixed })));
    return fig;
  }

  /* A figure whose lines in the page light its parts: lines is [[elementId, hl], ...].
     The elements carry their own data-step. */
  function litFigure(figId, spec, lines) {
    const fig = figInto(figId, spec);
    lightFrom(fig, lines.map(([id, hl]) => ({ el: $(id), hl })));
    return fig;
  }

  /* The figure pulled apart into its triangles; returns a function that sets apart (true) or together.
     gap: how far each triangle moves. Triangles that cover the same width (sharing a side and
     crossing) need a gap of over half that width to come clear, and pad to match, to stay in view.
     Or pass offsets: [[dx, dy], ...], one move per triangle, e.g. one up-left and one down-right, so
     triangles that cover the same width come clear at different heights. The picture is then sized to
     hold both positions, so it does not change size when the triangles move. */
  function splitFig(id, spec, tris, gap, pad) {
    const w = spec.w || 320, h = spec.h || 200;
    const offsets = gap && gap.offsets;
    pad = pad || 50;
    const pts = G.resolve(spec);
    let vb = [-pad, -pad / 2, w + 2 * pad, h + pad];
    if (offsets) {
      const m = 28;   // room for letters and side labels
      const all = tris.flatMap((t, i) => [...t].flatMap(L => [pts[L], G.V.add(pts[L], offsets[i])]));
      const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m;
      vb = [x0, y0, Math.max(...xs) + m - x0, Math.max(...ys) + m - y0];
    }
    const svg = G.mk('svg', { viewBox: vb.map(v => v.toFixed(1)).join(' '), class: 'fig', role: 'img', 'aria-label': 'The figure, which the hint pulls apart into its two triangles' });
    const allC = G.centroid(Object.values(pts));
    const inTri = (t, k) => [...k].every(L => t.includes(L));
    const filt = (obj, t) => { const o = {}; for (const k in obj || {}) if (inTri(t, k)) o[k] = obj[k]; return o; };
    const groups = tris.map((t, i) => {
      const sub = { w, h, polys: [t], ticks: filt(spec.ticks, t), arcs: filt(spec.arcs, t), rights: (spec.rights || []).filter(k => inTri(t, k)), st: filt(spec.st, t), at: filt(spec.at, t) };
      const tp = {}; [...t].forEach(L => { tp[L] = pts[L]; });
      const g = G.mk('g', { class: 'tri-g' }, svg);
      const f = G.draw(sub, { pts: tp });
      [...f.svg.childNodes].forEach(c => g.appendChild(c));
      if (offsets) return { g, off: offsets[i] };
      let d = G.V.sub(G.centroid([...t].map(L => pts[L])), allC);
      if (G.V.len(d) < 6) d = i === 0 ? [-1, 0] : [1, 0];
      return { g, off: G.V.mul(G.V.unit(d), gap || 46) };
    });
    // A vertex both triangles share gets a label from each triangle. Together, that would show it
    // twice, so show the whole figure's single label then, and each triangle's own when apart.
    const shared = Object.keys(pts).filter(L => tris.filter(t => t.includes(L)).length > 1);
    groups.forEach(({ g }) => g.querySelectorAll('text.lbl').forEach(t => { if (shared.includes(t.textContent)) t.classList.add('own'); }));
    const whole = G.draw(spec);
    whole.svg.querySelectorAll('text.lbl').forEach(t => { if (shared.includes(t.textContent)) { t.classList.add('joined'); svg.appendChild(t); } });
    svg.classList.add('split-fig');
    $(id).append(svg);
    return apart => {
      svg.classList.toggle('apart', !!apart);
      groups.forEach(({ g, off }) => { g.style.transform = apart ? `translate(${off[0].toFixed(1)}px, ${off[1].toFixed(1)}px)` : 'none'; });
    };
  }

  /* Lines of text that light parts of a hand-made drawing. items: [{ el, c, draw(colour) -> node or [nodes] }].
     The latest line shown is "now": its parts are drawn into `layer` and its band takes colour c (1, 2 or 3). */
  function litParts(layer, items) {
    let current = null;
    const update = () => {
      let last = -1;
      items.forEach((it, i) => { if (it.el.classList.contains('shown')) last = i; });
      if (last === current) return;
      if (current !== null && current >= 0) items[current].el.classList.remove('now');
      current = last;
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      if (last >= 0) {
        [].concat(items[last].draw(C(items[last].c))).forEach(n => layer.appendChild(n));
        items[last].el.dataset.c = items[last].c;
        items[last].el.classList.add('now');
      }
    };
    items.forEach(it => new MutationObserver(update).observe(it.el, { attributes: true, attributeFilter: ['class'] }));
    update();
  }

  /* A construction from js/construct.js, one step per press. The drawing goes into figId and the words for the
     current step into textId. The presses are hidden markers added to the scene, so Back undoes a step. */
  function cons(figId, textId, consId) {
    const box = CONS.render([consId]);
    const fig = $(figId), scene = fig.closest('.scene');
    fig.append(box.querySelector('svg'));
    $(textId).append(box.stepText);
    const marks = [];
    for (let i = 1; i < box.count(); i++) {
      const m = document.createElement('span');
      m.dataset.step = i; m.style.display = 'none';
      scene.querySelector('.body').append(m);
      marks.push(m);
    }
    let shown = 0;
    const update = () => { const n = marks.filter(m => m.classList.contains('shown')).length; if (n !== shown) { shown = n; box.go(n); } };
    marks.forEach(m => new MutationObserver(update).observe(m, { attributes: true, attributeFilter: ['class'] }));
    return box;
  }

  /* Maths: render every $...$ in the scenes. Punctuation straight after maths is kept with it,
     so a line never starts with a lone "." or "?". */
  document.querySelectorAll('.scene').forEach(s => {
    s.innerHTML = TEX.render(s.innerHTML.replace(/(\$[^$]+\$)([.,;:?!])/g, '<span class="nobr">$1$2</span>'));
  });

  // ∠ △ ≅ in ordinary text (reasons such as "base ∠s, isos. △") come from the maths font through
  // css/fonts.css, as on the reading site, so they match the maths at full size.

  return { $, C, onShown, figInto, hlList, lightFrom, solution, litFigure, splitFig, litParts, cons };
})();
