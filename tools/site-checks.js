/* Site checks — run before every publish.

   How: open the site (local preview or live), open the browser console (or have Claude run it with the
   browser tool), paste this whole file, then run:   await runSiteChecks()
   For the phone check, set the viewport to 375 px wide first, then run:   await runSiteChecks({ phone: true })

   It checks:
     1. every page renders with no script errors and no broken maths
     2. every hand-made question (practice + challenge) marks CORRECT with its intended answer,
        plus 40 random questions from each generator
     3. every figure: no overlapping labels, no label off the picture, no vertex letter on an angle mark,
        no angle value crossing its arc, no side length sitting on a line (fixed figures + 150 random each)
     4. (phone) no page scrolls sideways
     5. no request goes to any server other than the site itself
   The result object lists problems; empty lists mean all good. */
async function runSiteChecks(opts = {}) {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const routes = ['#/', ...Object.keys(C5.sections).flatMap(id => (C5.sections[id].tabs || ['learn', 'examples', 'practice', 'traps']).map(t => `#/s/${id}/${t}`)), '#/game', '#/traps', '#/challenge', '#/sheet'];
  const out = { pageErrors: [], texProblems: [], wrongAnswerKeys: [], figureProblems: [], sidewaysScroll: [], otherServers: [] };
  const onErr = e => out.pageErrors.push(e.message + ' @' + location.hash);
  window.addEventListener('error', onErr);

  /* 1 + 4: pages */
  for (const r of routes) {
    location.hash = r; await wait(300);
    const n = document.querySelectorAll('#app .katex-error, #app .tex-fallback').length;
    if (n) out.texProblems.push(r + ' (' + n + ')');
    if (opts.phone && document.documentElement.scrollWidth > document.documentElement.clientWidth) out.sidewaysScroll.push(r);
  }

  /* 2: answer keys */
  const TOK = /\[\[(\w+):([^\]]*)\]\]/g, norm = s => s.replace(/\s+/g, '');
  const tokensOf = p => { const strs = [...(p.lines || [])]; (p.rows || []).forEach(r => { if (typeof r === 'string') strs.push(r); else if (r.t != null) strs.push(r.t); else { strs.push(r.s); if (r.r) strs.push(r.r); } }); const o = []; strs.forEach(s => { let m; TOK.lastIndex = 0; while ((m = TOK.exec(s))) o.push([m[1], m[2]]); }); return o; };
  const ansFor = ([k, raw]) => { const a = raw.split('|'); if (k === 'choice') return a.find(x => /^\*|\*$/.test(x)).replace(/^\*|\*$/g, ''); if (k === 'angle' || k === 'aname') return '∠' + a[0]; return a[0]; };
  function solve(card, q) {
    const parts = q.parts || [q];
    const fillEls = [...card.querySelectorAll('.fill-line .ans, .proof-group .ans')]; let ii = 0;
    const bts = [...card.querySelectorAll('table.bank-table')]; let bi = 0;
    const sbs = [...card.querySelectorAll('.sb')]; let si = 0;
    const ogs = [...card.querySelectorAll('.opts')]; let oi = 0;
    for (const p of parts) {
      const t = p.type || 'fill';
      if (t === 'fill') tokensOf(p).forEach(tk => { fillEls[ii++].value = ansFor(tk); });
      else if (t === 'mcq') ogs[oi++].querySelectorAll('.opt')[p.ans].click();
      else if (t === 'pick') { const o = ogs[oi++].querySelectorAll('.opt'); p.ans.forEach(i => o[i].click()); }
      else if (t === 'statement') { const pr = (p.pairs || [[p.tri1, p.tri2]])[0]; const kp = [...sbs[si++].querySelectorAll('.keypad button')]; (pr[0] + pr[1]).split('').forEach(L => kp.find(b => b.textContent === L).click()); }
      else if (t === 'bank') {
        const tbl = bts[bi++], bank = tbl.closest('div').parentElement.querySelector('.bank'), route = p.routes[0];
        route.lines.forEach(l => { [...bank.querySelectorAll('.chip')].find(c => !c.classList.contains('hidden') && norm(c.querySelector('annotation').textContent) === norm(TEX.conv(l.s))).click(); });
        const rows = [...tbl.querySelectorAll('tr')];
        rows.slice(0, -1).forEach(tr => { const txt = norm(tr.querySelector('.slot annotation').textContent); tr.querySelector('select').value = route.lines.find(l => norm(TEX.conv(l.s)) === txt).r.split('|')[0]; });
        rows[rows.length - 1].querySelector('select').value = route.cond;
      }
    }
    [...card.querySelectorAll('button')].find(b => b.textContent === 'Check').click();
    return card.querySelector('.feedback').innerText.split('\n')[0];
  }
  location.hash = '#/sheet'; await wait(300);
  const host = document.getElementById('app');
  const questions = [...Object.values(C5.sections).flatMap(s => s.practice || []), ...(C5.challenge || [])];
  for (const q of questions.filter(q => !q.gen)) {
    const c = QR.card(q, {}); host.append(c.node);
    let r; try { r = solve(c.node, q); } catch (e) { r = 'ERROR ' + e.message; }
    if (!r.startsWith('Correct')) out.wrongAnswerKeys.push(q.id + ': ' + r);
    c.node.remove();
  }
  const gens = [...new Set(questions.filter(q => q.gen).map(q => q.gen))];
  for (const g of gens) {
    if (typeof C5.gens[g] !== 'function') { out.wrongAnswerKeys.push('missing generator ' + g); continue; }
    for (let k = 0; k < 40; k++) { const q = C5.gens[g](); const c = QR.card(q, {}); host.append(c.node); const r = solve(c.node, q); if (!r.startsWith('Correct')) out.wrongAnswerKeys.push(g + ': ' + r); c.node.remove(); }
  }

  /* 3: figures */
  const inter = (a, c) => Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x) > 0.5 && Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y) > 0.5;
  const checkFig = (svg, tag) => {
    const vb = svg.viewBox.baseVal;
    if (!svg.querySelector('.g-seg')) return;   // solids are drawn by js/solids.js and carry no letters to check
    const lines = [...svg.querySelectorAll('.g-seg line')].map(l => ['x1', 'y1', 'x2', 'y2'].map(a => +l.getAttribute(a)));
    const texts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent, b: t.getBBox(), lbl: t.classList.contains('lbl'), txt: t.classList.contains('txt') }));
    const marks = [...svg.querySelectorAll('.g-mark path')];
    // Points along each mark. A letter is "on a mark" only if a point of the mark itself falls inside
    // the letter: the mark's bounding box is not enough, since for a wide angle drawn at a slant the
    // box reaches back past the corner to where the letter sits, well clear of the arc.
    const markPts = marks.map(p => { const len = p.getTotalLength(), pts = []; for (let i = 0; i <= 48; i++) pts.push(p.getPointAtLength(len * i / 48)); return pts; });
    const onMark = ib => markPts.some(pts => pts.some(q => q.x > ib.x && q.x < ib.x + ib.width && q.y > ib.y && q.y < ib.y + ib.height));
    texts.forEach(({ t, b, lbl, txt }) => {
      if (b.x < vb.x - 2 || b.y < vb.y - 2 || b.x + b.width > vb.x + vb.width + 2 || b.y + b.height > vb.y + vb.height + 2) out.figureProblems.push(tag + ': "' + t + '" off the picture');
      if (lbl) { const ib = { x: b.x + 2, y: b.y + 3, width: b.width - 4, height: b.height - 6 }; if (onMark(ib)) out.figureProblems.push(tag + ': letter ' + t + ' on an angle mark'); }
      if (txt && /°|^[a-z]$/.test(t)) for (const p of marks) {
        if (!/ A/.test(p.getAttribute('d'))) continue;
        const len = p.getTotalLength(); let hit = false;
        for (let i = 0; i <= 24 && !hit; i++) { const q = p.getPointAtLength(len * i / 24); hit = q.x > b.x + 1 && q.x < b.x + b.width - 1 && q.y > b.y + 1 && q.y < b.y + b.height - 1; }
        if (hit) { out.figureProblems.push(tag + ': "' + t + '" crosses an arc'); break; }
      }
      if (txt && /cm|^\d+(\.\d)?$/.test(t)) {
        const ib = { x: b.x + 1.5, y: b.y + 3, width: b.width - 3, height: b.height - 6 };
        if (lines.some(([x1, y1, x2, y2]) => { for (let i = 0; i <= 40; i++) { const x = x1 + (x2 - x1) * i / 40, y = y1 + (y2 - y1) * i / 40; if (x > ib.x && x < ib.x + ib.width && y > ib.y && y < ib.y + ib.height) return true; } return false; })) out.figureProblems.push(tag + ': "' + t + '" sits on a line');
      }
    });
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) if (inter(texts[i].b, texts[j].b)) out.figureProblems.push(tag + ': "' + texts[i].t + '" overlaps "' + texts[j].t + '"');
  };
  const figSpecs = [];
  const collect = o => { if (!o || typeof o !== 'object') return; if (o.fig && typeof o.fig === 'object') figSpecs.push(o.fig); Object.values(o).forEach(v => { if (v && typeof v === 'object') collect(v); }); };
  collect(C5.sections); collect(C5.challenge); collect(C5.traps);
  figSpecs.forEach((spec, i) => { const f = G.draw(spec); host.append(f.svg); checkFig(f.svg, 'figure #' + i); f.svg.remove(); });
  for (const g of gens) for (let k = 0; k < 150; k++) { const spec = C5.gens[g]().fig; if (!spec) break; const f = G.draw(spec); host.append(f.svg); checkFig(f.svg, g); f.svg.remove(); }

  /* 5: other servers */
  const hosts = [...new Set(performance.getEntriesByType('resource').map(e => new URL(e.name).host))];
  out.otherServers = hosts.filter(h => h !== location.host);

  window.removeEventListener('error', onErr);
  location.hash = '#/';
  out.figureProblems = [...new Set(out.figureProblems)];
  out.summary = Object.entries(out).filter(([k, v]) => Array.isArray(v) && v.length).map(([k, v]) => k + ': ' + v.length).join(', ') || 'ALL CHECKS PASSED';
  return out;
}
