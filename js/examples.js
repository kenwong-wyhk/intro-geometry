'use strict';
/* Worked examples: reveal the solution one step at a time.
   Example: { title, level, q, fig, tip, split:['ABC','DEC'],
              steps: [{ t:'In △ABC,' }, { s:'AB = DE', r:'given', hl:[['AB','DE',1]] }, ...] }
   hl lists the parts to light up for that step: [part, part, colour] or [part, colour]. */
const EX = (() => {
  function hlList(hl) {
    const out = [];
    (hl || []).forEach(h => {
      const n = typeof h[h.length - 1] === 'number' ? h[h.length - 1] : 1;
      h.forEach(p => { if (typeof p === 'string') out.push([p, n]); });
    });
    return out;
  }

  function render(ex, num) {
    const box = U.el('div', { class: 'example' });
    box.append(U.el('div', { class: 'qhead' },
      U.el('span', { class: 'ex-title', text: ex.title || ('Example ' + num) }),
      ex.level ? U.el('span', { class: 'level', text: ex.level === 3 ? 'Challenge' : 'Level ' + ex.level }) : ''));
    box.append(U.el('div', { class: 'qtext', html: TEX.render(ex.q) }));
    let fig = null;
    const figWrap = U.el('div', { class: 'fig-wrap' });
    if (ex.fig) { fig = G.draw(ex.fig); figWrap.append(fig.svg); box.append(figWrap); }
    const splitWrap = U.el('div', { class: 'split-wrap' });
    if (ex.split && ex.fig) {
      const sb = U.el('button', { type: 'button', class: 'btn ghost small', text: 'Split the figure into two triangles' });
      sb.addEventListener('click', () => {
        if (splitWrap.firstChild) { U.clear(splitWrap); sb.textContent = 'Split the figure into two triangles'; return; }
        splitWrap.append(G.splitView(ex.fig, ex.split), U.el('div', { class: 'cap', text: 'The two triangles pulled apart. Shared parts appear in both.' }));
        sb.textContent = 'Hide the split';
      });
      box.append(U.el('div', { class: 'btn-row' }, sb), splitWrap);
    }
    if (ex.tip) box.append(U.el('div', { class: 'tip' }, U.el('div', { class: 'tip-title', text: 'Tip' }), U.el('div', { html: TEX.render(ex.tip) })));
    box.append(U.el('div', { class: 'part-label', text: 'Solution' }));
    const { table, trs } = QR.proofTable(ex.steps, {}, [], { returnRows: true });
    box.append(U.el('div', { class: 'table-wrap' }, table));
    let shown = 0;
    const highlightRow = i => {
      if (!fig) return;
      fig.clearHL();
      trs.forEach(tr => tr.classList.remove('active'));
      const st = ex.steps[i];
      if (st && st.hl) {
        const list = hlList(st.hl), cols = [...new Set(list.map(([, n]) => n))];
        fig.highlight(list);
        // the line's band takes the colour of the parts it lights (grey when it lights several colours)
        trs[i].dataset.c = cols.length === 1 ? cols[0] : 'mix';
        trs[i].classList.add('active');
      }
    };
    trs.forEach((tr, i) => {
      if (ex.steps[i].hl) {
        tr.classList.add('clickable');
        tr.title = 'Tap to highlight on the figure';
        tr.addEventListener('click', () => highlightRow(i));
      }
    });
    const update = () => {
      trs.forEach((tr, i) => tr.classList.toggle('step-hidden', i >= shown));
      nextBtn.disabled = shown >= trs.length;
      allBtn.disabled = shown >= trs.length;
    };
    const nextBtn = U.el('button', { type: 'button', class: 'btn', text: 'Next step', onclick: () => { shown++; update(); highlightRow(shown - 1); } });
    const allBtn = U.el('button', { type: 'button', class: 'btn ghost', text: 'Show all', onclick: () => { shown = trs.length; update(); if (fig) fig.clearHL(); } });
    const resetBtn = U.el('button', { type: 'button', class: 'btn ghost', text: 'Start again', onclick: () => { shown = 0; update(); if (fig) fig.clearHL(); } });
    box.append(U.el('div', { class: 'btn-row' }, nextBtn, allBtn, resetBtn));
    if (ex.after) box.append(U.el('div', { class: 'note', html: TEX.render(ex.after) }));
    update();
    return box;
  }
  return { render, hlList };
})();
