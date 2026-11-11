'use strict';
/* Pages and routing (hash routes so the site works on GitHub Pages and from a folder). */
(() => {
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const ORDER = ['5.1', '5.2', '5.3', '5.4'];
  const TABS = [['learn', 'Learn'], ['examples', 'Examples'], ['practice', 'Practice'], ['traps', 'Traps']];
  let cleanup = null;

  Store.load();

  /* ---------- navigation ---------- */
  const NAV = [['#/', 'Home'], ...ORDER.map(id => ['#/s/' + id, id]), ['#/game', 'Game'], ['#/traps', 'Traps'], ['#/challenge', 'Challenge'], ['#/sheet', 'Revision sheet']];
  NAV.forEach(([h, t]) => nav.append(U.el('a', { href: h, text: t })));
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all your ticks, scores and game levels on this device?')) { Store.reset(); route(); }
  });

  /* ---------- helpers ---------- */
  function practiceItems(sec) {
    return (sec.practice || []);
  }
  function progress(id) {
    const sec = C5.sections[id];
    if (!sec) return { x: 0, y: 0 };
    const items = practiceItems(sec);
    // x: solved without opening the solution; f: right on the first try
    return { x: items.filter(q => Store.isOk(id, q.id)).length, f: items.filter(q => Store.isFirst(id, q.id)).length, y: items.length };
  }
  function resolveQ(q) {
    if (q.gen) {
      const g = C5.gens[q.gen];
      if (typeof g !== 'function') { console.warn('Unknown question generator:', q.gen); return { q: null, regen: null }; }
      const made = g();
      made.id = q.id; made.random = true;
      return { q: made, regen: () => { const m = g(); m.id = q.id; m.random = true; return m; } };
    }
    return { q, regen: null };
  }

  /* ---------- learn blocks ---------- */
  function block(b) {
    if (b.h) return U.el('h2', { html: TEX.render(b.h) });
    if (b.h3) return U.el('h3', { html: TEX.render(b.h3) });
    if (b.p) return U.el('p', { html: TEX.render(b.p) });
    if (b.key) return U.el('div', { class: 'key' }, b.title ? U.el('h3', { html: TEX.render(b.title) }) : '', U.el('div', { html: TEX.render(b.key) }), b.fig ? figBlock(b.fig, b.cap) : '');
    if (b.tip) return U.el('div', { class: 'tip' }, U.el('div', { class: 'tip-title', text: b.title || 'Tip' }), U.el('div', { html: TEX.render(b.tip) }));
    if (b.list) return U.el('ul', {}, b.list.map(x => U.el('li', { html: TEX.render(x) })));
    if (b.table) {
      return U.el('div', { class: 'table-wrap' }, U.el('table', { class: 'plain' },
        U.el('thead', {}, U.el('tr', {}, b.table.head.map(h => U.el('th', { html: TEX.render(h) })))),
        U.el('tbody', {}, b.table.rows.map(r => U.el('tr', {}, r.map(c => U.el('td', { html: TEX.render(c) })))))));
    }
    if (b.reasons) return reasonTable(b.reasons);
    if (b.fig) return figBlock(b.fig, b.cap);
    if (b.figs) return U.el('div', { class: 'cards figcards' }, b.figs.map(f => U.el('div', { class: 'mini-card' }, figBlock(f.fig, null), f.cap ? U.el('div', { class: 'mini-ttl', html: TEX.render(f.cap) }) : '', f.note ? U.el('div', { class: 'small muted', html: TEX.render(f.note) }) : '')));
    if (b.demo === 'dial') return DEMO.dial();
    if (b.demo === 'anglesum') return DEMO.angleSum();
    if (b.demo === 'slicer') return DEMO.slicer();
    if (b.demo === 'grids') return DEMO.grids();
    if (b.demo === 'constructions') return CONS.render(b.only);
    if (b.anglerow) return DEMO.angleRow(b.anglerow);
    if (b.checklist) return U.el('div', { class: 'tip' }, U.el('div', { class: 'tip-title', text: b.title || 'Check your drawing' }), U.el('ul', { class: 'ticklist' }, b.checklist.map(x => U.el('li', { html: TEX.render(x) }))));
    if (b.cta) return U.el('div', { class: 'btn-row' }, U.el('a', { class: 'btn', href: b.cta.href, text: b.cta.label }), b.cta.text ? U.el('span', { class: 'small muted', text: b.cta.text }) : '');
    if (b.example) return EX.render(b.example, b.num || '');
    return U.el('div');
  }
  /* A table whose rows open a worked mini-example: a figure with the parts highlighted, the proof line(s), a note.
     { reasons: { head:[...3], rows:[{ see, write, reason, ex:{ fig, hl, lines, note } }] } } */
  function reasonTable(t) {
    let open = null;
    const tbody = U.el('tbody');
    t.rows.forEach((r, i) => {
      const id = 'rx-' + Math.random().toString(36).slice(2, 8);
      const btn = U.el('button', { type: 'button', class: 'show-btn', 'aria-expanded': 'false', 'aria-controls': id, text: 'Show me ▸' });
      const tr = U.el('tr', { class: 'rx-row' },
        U.el('td', {}, U.el('div', { html: TEX.render(r.see) }), btn),
        U.el('td', { html: TEX.render(r.write) }),
        U.el('td', { html: TEX.render(r.reason) }));
      const toggle = () => {
        const wasMe = open && open.tr === tr;
        if (open) { open.detail.remove(); open.btn.setAttribute('aria-expanded', 'false'); open.btn.textContent = 'Show me ▸'; open.tr.classList.remove('open'); open = null; }
        if (wasMe) return;
        const ex = r.ex;
        const fig = G.draw(ex.fig);
        if (ex.hl) fig.highlight(EX.hlList(ex.hl));
        const detail = U.el('tr', { class: 'rx-detail', id },
          U.el('td', { colspan: 3 }, U.el('div', { class: 'rx-box' },
            U.el('div', { class: 'fig-wrap' }, fig.svg),
            U.el('div', {},
              ex.lines ? U.el('div', { class: 'table-wrap' }, QR.proofTable(ex.lines, {}, [])) : '',
              ex.note ? U.el('p', { class: 'small', html: TEX.render(ex.note) }) : ''))));
        tr.after(detail);
        tr.classList.add('open');
        btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Hide ▾';
        open = { tr, detail, btn };
      };
      btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
      tr.addEventListener('click', toggle);
      tbody.append(tr);
    });
    return U.el('div', { class: 'table-wrap' }, U.el('table', { class: 'plain rx-table' },
      U.el('thead', {}, U.el('tr', {}, t.head.map(h => U.el('th', { html: TEX.render(h) })))), tbody));
  }

  function figBlock(spec, cap) {
    const f = G.draw(spec);
    return U.el('div', { class: 'fig-wrap' }, f.svg, cap ? U.el('div', { class: 'cap', html: TEX.render(cap) }) : '');
  }

  /* ---------- traps ---------- */
  function trapNode(t) {
    return U.el('section', { class: 'trap', id: 'trap-' + t.id },
      U.el('div', { class: 'trap-head', html: TEX.render(t.title) }),
      U.el('div', { class: 'trap-body' },
        t.fig ? figBlock(t.fig, t.cap) : '',
        U.el('div', { class: 'trap-cols' },
          U.el('div', { class: 'trap-bad' }, U.el('div', { class: 'lab', text: '✗ The trap' }), U.el('div', { html: TEX.render(t.bad) })),
          U.el('div', { class: 'trap-good' }, U.el('div', { class: 'lab', text: '✓ Do this' }), U.el('div', { html: TEX.render(t.good) }))),
        U.el('p', { html: TEX.render(t.why) }),
        t.sections ? U.el('p', { class: 'small muted', text: 'Appears in: ' + t.sections.join(', ') }) : ''));
  }

  /* ---------- pages ---------- */
  function home() {
    app.append(U.el('div', { class: 'hero' },
      U.el('h1', { text: 'Welcome, Wahyanites!' }),
      U.el('p', { text: 'Chapter 5: Introduction to Geometry. Use this site before class to preview, or after class to practise. Every section has Learn → Examples → Practice → Traps.' })));
    const cards = U.el('div', { class: 'cards' });
    ORDER.forEach(id => {
      const s = C5.sections[id];
      if (!s) return;
      const p = progress(id);
      const pct = p.y ? Math.round(100 * p.x / p.y) : 0;
      cards.append(U.el('a', { class: 'card', href: '#/s/' + id },
        U.el('div', { class: 'num', text: 'Section ' + id }),
        U.el('div', { class: 'ttl', text: s.title }),
        U.el('div', { class: 'meta', html: TEX.render(s.blurb || '') }),
        s.noTest ? U.el('div', { class: 'small' }, U.el('span', { class: 'badge', text: 'Not in test/exam' })) : '',
        s.live ? U.el('div', { class: 'meta', text: 'Live version for class on the section page.' }) : '',
        p.y ? U.el('div', { class: 'meta', text: `${p.x}/${p.y} practice solved · ${p.f} first try` }) : '',
        p.y ? U.el('div', { class: 'bar' }, U.el('span', { style: `width:${pct}%` })) : ''));
    });
    const gs = Store.game();
    cards.append(
      U.el('a', { class: 'card extra', href: '#/game' }, U.el('div', { class: 'num', text: 'Game' }), U.el('div', { class: 'ttl', text: 'Sorting Game' }),
        U.el('div', { class: 'meta', text: `Name the angle, the triangle, the polygon or the solid — fast. Six decks. Best Speed Round: ${Math.max(0, ...Object.values(gs.best || {}).map(b => b.speed || 0))}.` })),
      U.el('a', { class: 'card extra', href: '#/traps' }, U.el('div', { class: 'num', text: 'Avoid mistakes' }), U.el('div', { class: 'ttl', text: 'Trap Gallery' }),
        U.el('div', { class: 'meta', text: 'The most common mistakes in this chapter, and how to avoid them.' })),
      U.el('a', { class: 'card extra', href: '#/challenge' }, U.el('div', { class: 'num', text: 'Revision' }), U.el('div', { class: 'ttl', text: 'Mixed Challenge' }),
        U.el('div', { class: 'meta', text: '10 mixed questions from 5.1–5.4, with an optional 35-minute test mode.' })),
      U.el('a', { class: 'card extra', href: '#/sheet' }, U.el('div', { class: 'num', text: 'Revision' }), U.el('div', { class: 'ttl', text: 'Revision Sheet' }),
        U.el('div', { class: 'meta', text: 'All the key points of the chapter on one printable page.' })));
    app.append(cards);
  }

  function sheet() {
    app.append(U.el('div', { class: 'crumbs no-print' }, U.el('a', { href: '#/', text: 'Home' }), ' / Revision Sheet'));
    app.append(U.el('h1', { text: 'Ch5 Introduction to Geometry — Revision Sheet' }));
    app.append(U.el('div', { class: 'btn-row no-print' },
      U.el('button', { type: 'button', class: 'btn', text: 'Print / save as PDF', onclick: () => window.print() }),
      U.el('span', { class: 'small muted', text: 'Fits on about two A4 pages.' })));
    const wrap = U.el('div', { class: 'sheet' });
    (C5.sheet || []).forEach(b => wrap.append(block(b)));
    app.append(wrap);
  }

  function section(id, tab) {
    const s = C5.sections[id];
    if (!s) return notFound();
    const tabs = s.tabs || TABS.map(t => t[0]);
    if (!tabs.includes(tab)) tab = tabs[0];
    Store.seen(id, tab);
    app.append(U.el('div', { class: 'crumbs' }, U.el('a', { href: '#/', text: 'Home' }), ' / Section ' + id));
    app.append(U.el('h1', { text: id + ' ' + s.title }));
    if (s.live) app.append(U.el('p', { class: 'small' }, U.el('a', { href: s.live, text: 'Live version ▸' }), ' The step-by-step screens shown in class, one idea at a time.'));
    if (s.noTest) app.append(U.el('div', { class: 'note', text: s.noTestNote || 'Not in the test or exam.' }));
    const p = progress(id);
    if (p.y) app.append(U.el('div', { class: 'small muted', text: `${p.x}/${p.y} practice questions solved (${p.f} on the first try) on this device` }));
    if (tabs.length > 1) {
      const tb = U.el('nav', { class: 'tabs', 'aria-label': 'Section tabs' });
      TABS.filter(t => tabs.includes(t[0])).forEach(([k, label]) => tb.append(U.el('a', { href: `#/s/${id}/${k}`, text: label, 'aria-current': k === tab ? 'page' : null })));
      app.append(tb);
    }
    if (tab === 'learn') (s.learn || []).forEach(b => app.append(block(b)));
    if (tab === 'examples') {
      app.append(U.el('p', { class: 'muted small', text: 'Try each example yourself first, then reveal the solution one step at a time. Tap a solution line to see it on the figure.' }));
      (s.examples || []).forEach((ex, i) => app.append(EX.render(ex, i + 1)));
    }
    if (tab === 'practice') {
      app.append(U.el('p', { class: 'muted small', html: 'Check your answer. The first wrong try gives a hint; after two tries you can see the solution. A question only counts as solved if you get it right <b>without</b> opening the solution. Write angles in full, e.g. ∠ABC. Questions marked "Do it on paper" ask you to draw first, then check your drawing.' }));
      const items = practiceItems(s);
      const head = U.el('div', { class: 'small', style: 'font-weight:500;color:var(--blue)' });
      const upd = () => { const pp = progress(id); head.textContent = `${pp.x}/${pp.y} solved · ${pp.f} first try`; };
      upd();
      app.append(head);
      items.forEach((item, i) => {
        const { q, regen } = resolveQ(item);
        if (!q) return;
        const c = QR.card(q, {
          num: i + 1, done: Store.isOk(id, item.id), regen,
          onResult: (ok, first, earned) => { if (ok && earned) Store.ok(id, item.id); if (ok && first) Store.first(id, item.id); upd(); },
        });
        app.append(c.node);
      });
    }
    if (tab === 'traps') {
      app.append(U.el('p', { class: 'muted small', text: 'Common mistakes in this section. The full list is in the Trap Gallery.' }));
      (s.traps || []).forEach(tid => { const t = C5.traps.find(x => x.id === tid); if (t) app.append(trapNode(t)); });
    }
    // pager
    const i = tabs.indexOf(tab);
    const pager = U.el('div', { class: 'btn-row', style: 'margin-top:28px;justify-content:space-between' });
    if (i > 0) pager.append(U.el('a', { class: 'btn ghost', href: `#/s/${id}/${tabs[i - 1]}`, text: '◀ ' + TABS.find(t => t[0] === tabs[i - 1])[1] }));
    else pager.append(U.el('span'));
    if (i < tabs.length - 1) pager.append(U.el('a', { class: 'btn', href: `#/s/${id}/${tabs[i + 1]}`, text: TABS.find(t => t[0] === tabs[i + 1])[1] + ' ▶' }));
    else {
      const ni = ORDER.indexOf(id) + 1;
      if (ni < ORDER.length) pager.append(U.el('a', { class: 'btn', href: '#/s/' + ORDER[ni], text: 'Next section ' + ORDER[ni] + ' ▶' }));
    }
    app.append(pager);
  }

  function game() {
    app.append(U.el('div', { class: 'crumbs' }, U.el('a', { href: '#/', text: 'Home' }), ' / Game'));
    app.append(U.el('h1', { text: 'Sorting Game' }));
    app.append(U.el('p', { text: 'Choose a deck. Look at each figure and tap the group it belongs to. A round has 10 figures; the Speed Round gives you 60 seconds.' }));
    const g = GAME.render();
    cleanup = g.cleanup;
    app.append(g);
  }

  function traps(focus) {
    app.append(U.el('div', { class: 'crumbs' }, U.el('a', { href: '#/', text: 'Home' }), ' / Trap Gallery'));
    app.append(U.el('h1', { text: 'Trap Gallery' }));
    app.append(U.el('p', { text: 'These are the mistakes students make most often in this chapter. Read the trap, then what to do instead.' }));
    C5.traps.forEach(t => app.append(trapNode(t)));
    if (focus) setTimeout(() => { const el = document.getElementById('trap-' + focus); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  }

  function challenge() {
    app.append(U.el('div', { class: 'crumbs' }, U.el('a', { href: '#/', text: 'Home' }), ' / Mixed Challenge'));
    app.append(U.el('h1', { text: 'Mixed Challenge' }));
    app.append(U.el('p', { text: `10 questions drawn at random from a pool of ${C5.challenge.length} (Sections 5.1–5.4). Choose how you want to do them.` }));
    const area = U.el('div');
    const resumeBox = U.el('div');
    const fmt = s => { const t = Math.max(0, Math.round(s)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    app.append(resumeBox, U.el('div', { class: 'btn-row' },
      U.el('button', { type: 'button', class: 'btn', text: 'Practice mode (untimed)', onclick: () => start(false) }),
      U.el('button', { type: 'button', class: 'btn ghost', text: 'Test mode (35 min)', onclick: () => start(true) })),
      U.el('p', { class: 'small muted', text: 'Practice mode: check each answer as you go, with hints. Test mode: no hints, marks shown at the end — like a real test. Your test answers and the time are saved on this device, so a refresh will not lose them.' }), area);
    let timer = null, resumeTimer = null;
    cleanup = () => { if (timer) clearInterval(timer); if (resumeTimer) clearInterval(resumeTimer); };
    // A saved test (from an earlier visit or a refresh): a card with a live countdown.
    // It stays visible while the student uses Practice mode, so the saved test is never hidden.
    function showResume() {
      const saved = Store.getTest();
      if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
      U.clear(resumeBox);
      if (!saved || !Array.isArray(saved.qs) || !saved.qs.length) { if (saved) Store.setTest(null); return; }
      const msg = U.el('p');
      const go = U.el('button', { type: 'button', class: 'btn', onclick: () => start(true, saved) });
      const tick = () => {
        const left = Math.round((saved.ends - Date.now()) / 1000);
        if (left > 0) { msg.textContent = `${fmt(left)} left. Your answers so far are saved.`; go.textContent = 'Resume the test'; }
        else { msg.textContent = 'The time is up. Your answers were saved — see your mark.'; go.textContent = 'See my mark'; clearInterval(resumeTimer); resumeTimer = null; }
      };
      resumeBox.append(U.el('div', { class: 'tip' },
        U.el('div', { class: 'tip-title', text: 'You have a test in progress' }), msg,
        U.el('div', { class: 'btn-row' }, go,
          U.el('button', { type: 'button', class: 'btn ghost', text: 'Discard it', onclick: () => { if (confirm('Discard your saved test without marking it?')) { Store.setTest(null); showResume(); } } }))));
      tick();
      resumeTimer = setInterval(tick, 1000);
    }
    showResume();
    function start(test, resume) {
      const saved = Store.getTest();
      if (test && !resume && saved) {
        const expired = saved.ends <= Date.now();
        const ask = expired ? 'Your saved test has run out of time but has not been marked yet. Start a new test and discard it?' : 'Start a new test? Your saved test will be discarded.';
        if (!confirm(ask)) return;
      }
      if (timer) clearInterval(timer);
      U.clear(area);
      if (test) { if (resumeTimer) clearInterval(resumeTimer); resumeTimer = null; U.clear(resumeBox); }
      const qs = resume ? resume.qs : U.shuffle(C5.challenge).map(item => resolveQ(item).q).filter(Boolean).slice(0, 10);
      const run = test ? (resume || { qs, ends: Date.now() + 35 * 60 * 1000, states: [] }) : null;
      if (run && !Array.isArray(run.states)) run.states = [];
      if (test) Store.setTest(run);
      const cards = [];
      let score = 0;
      const scoreEl = U.el('div', { class: 'stats' });
      if (!test) {
        area.append(scoreEl);
        scoreEl.textContent = 'Score: 0/10 (first try)';
      }
      qs.forEach((q, i) => {
        const c = QR.card(q, {
          num: i + 1, deferred: test,
          onResult: (ok, first) => { if (ok && first) { score++; scoreEl.textContent = `Score: ${score}/10 (first try)`; } },
          onChange: test ? () => { if (!run.done) { run.states[i] = cards[i].state(); Store.setTest(run); } } : null,
        });
        cards.push(c);
        area.append(c.node);
        if (test && run.states[i]) { try { c.restore(run.states[i]); } catch (e) { run.states[i] = null; } }
      });
      if (test) {
        const tEl = U.el('span', { class: 'timer' });
        const finish = U.el('button', { type: 'button', class: 'btn', text: 'Finish and mark' });
        const bar = U.el('div', { class: 'timer-bar' }, tEl, finish);
        area.prepend(bar);
        const secsLeft = () => Math.round((run.ends - Date.now()) / 1000);
        tEl.textContent = fmt(secsLeft());
        const mark = () => {
          clearInterval(timer); timer = null;
          run.done = true;
          Store.setTest(null);
          let total = 0;
          cards.forEach(c => { const ok = c.grade(); if (ok) total++; c.reveal(ok); });
          finish.disabled = true;
          bar.replaceWith(U.el('div', { class: 'demo' }, U.el('div', { class: 'demo-title', text: 'Your mark' }), U.el('div', { class: 'score-big', text: total + ' / 10' }),
            U.el('p', { text: 'Scroll down to see the solutions. Red marks show where to look again.' })));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        finish.addEventListener('click', () => { if (confirm('Finish now and see your mark?')) mark(); });
        if (secsLeft() <= 0) { mark(); return; }
        timer = setInterval(() => { const l = secsLeft(); tEl.textContent = fmt(l); if (l <= 0) mark(); }, 1000);
      }
    }
  }

  function notFound() {
    app.append(U.el('h1', { text: 'Page not found' }), U.el('p', {}, U.el('a', { href: '#/', text: 'Go to the home page' })));
  }

  /* ---------- router ---------- */
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    U.clear(app);
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    let current = '#/';
    if (!parts.length) home();
    else if (parts[0] === 's') { section(parts[1], parts[2] || 'learn'); current = '#/s/' + parts[1]; }
    else if (parts[0] === 'game') { game(); current = '#/game'; }
    else if (parts[0] === 'traps') { traps(parts[1]); current = '#/traps'; }
    else if (parts[0] === 'challenge') { challenge(); current = '#/challenge'; }
    else if (parts[0] === 'sheet') { sheet(); current = '#/sheet'; }
    else notFound();
    nav.querySelectorAll('a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === current ? 'page' : 'false'));
    const sec = parts[0] === 's' ? C5.sections[parts[1]] : null;
    document.title = (sec ? parts[1] + ' ' + sec.title + ' · ' : '') + 'Introduction to Geometry · F1 Ch5';
    if (!(parts[0] === 'traps' && parts[1])) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
