'use strict';
/* Question cards.
   Question types (q.type, or per part in q.parts):
     fill      lines: ['$x = $ [[num:56]]°'], rows: [{ s:'AB = [[side:DC]]', r:'[[reason:given]]' }, { t:'In $\\triangle ABC$,' }]
     mcq       options: ['...'], ans: 2, why: { 0:'hint for choosing A' }      (an option may be { fig:{...}, t:'caption' })
     pick      options: [...], ans: [0, 2]   choose ALL the right ones;  why: { 1:'hint if B is chosen' }, miss: { 2:'hint if C is left out' }
     statement tri1:'ABC', tri2:'PQR' (corresponding order)  -> student builds △___ ≅ △___
     bank      intro, pre (fixed rows), routes: [{ lines:[{ s, r }], cond }], distract: [{ s, why }], concl
   Blank tokens:  [[num:56]] [[side:AB]] [[angle:ABC]] [[tri:PQR]] [[reason:given]] [[cond:SAS]] [[choice:Yes*|No]] [[text:...]]
   Alternatives inside a token are separated by |   e.g. [[angle:ABD|CBD]]
   Wrong-answer hints: q.wrongs = [{ tok:0, val:53, hint:'...' }] (token index counts from 0 within that part) */
const QR = (() => {
  const TOK = /\[\[(\w+):([^\]]*)\]\]/g;
  const uniq = a => [...new Set(a)];

  /* ---------- statement builder: △ _ _ _ ≅ △ _ _ _ ---------- */
  function StatementBuilder(letters, n = 3) {
    const node = U.el('div', { class: 'sb' });
    const line = U.el('div', { class: 'stmt', role: 'group', 'aria-label': 'Congruence statement' });
    const slots = [];
    let cur = 0;
    const mkSlot = i => {
      const b = U.el('button', { class: 'sl', type: 'button', 'aria-label': 'letter ' + (i + 1) });
      b.addEventListener('click', () => { if (b.textContent) b.textContent = ''; setCur(i); });
      slots.push(b); return b;
    };
    line.append(U.el('span', { class: 'tri-sym', text: '△' }));
    for (let i = 0; i < n; i++) line.append(mkSlot(i));
    line.append(U.el('span', { class: 'tri-sym', text: ' ≅ △' }));
    for (let i = n; i < 2 * n; i++) line.append(mkSlot(i));
    const setCur = i => { cur = i; slots.forEach((s, j) => s.classList.toggle('cur', j === cur)); };
    const kp = U.el('div', { class: 'keypad' });
    letters.forEach(L => kp.append(U.el('button', {
      type: 'button', text: L, onclick: () => {
        api.onChange && api.onChange();
        slots[cur].textContent = L;
        const next = slots.findIndex((s, j) => j > cur && !s.textContent);
        const any = next >= 0 ? next : slots.findIndex(s => !s.textContent);
        setCur(any >= 0 ? any : cur);
      },
    })));
    kp.append(U.el('button', { type: 'button', class: 'sym', text: 'Clear', onclick: () => { slots.forEach(s => { s.textContent = ''; }); setCur(0); line.classList.remove('ok', 'bad'); } }));
    node.append(line, kp);
    setCur(0);
    const api = {
      node,
      get() { const v = slots.map(s => s.textContent || ' '); return [v.slice(0, n).join(''), v.slice(n).join('')]; },
      set(lr) { const v = ((lr && lr[0]) || '') + ((lr && lr[1]) || ''); slots.forEach((s, i) => { s.textContent = (v[i] || '').trim(); }); },
      mark(ok) { line.classList.toggle('ok', ok === true); line.classList.toggle('bad', ok === false); },
      onChange: null,
    };
    return api;
  }

  /* ---------- blanks ---------- */
  function makeInput(kind, raw, ctx) {
    const alts = raw.split('|');
    // choice blanks mark the right option with * before or after it: [[choice:Yes*|No]] or [[choice:*Yes|No]]
    const starred = a => /^\*|\*$/.test(a);
    const clean = a => a.replace(/^\*|\*$/g, '');
    const rightChoices = alts.filter(starred).map(clean);
    let el;
    if (kind === 'reason' || kind === 'cond' || kind === 'choice') {
      let opts;
      if (kind === 'reason') opts = uniq([...REASONS, ...(ctx.reasons || [])]);
      else if (kind === 'cond') opts = CONDS;
      else opts = alts.map(clean);
      el = U.el('select', { class: 'ans', 'aria-label': kind },
        U.el('option', { value: '', text: kind === 'reason' ? '— reason —' : '— choose —' }),
        opts.map(o => U.el('option', { value: o, text: o })));
    } else {
      el = U.el('input', {
        class: 'ans' + (kind === 'num' ? ' num' : ''), type: 'text', autocomplete: 'off', spellcheck: 'false',
        autocapitalize: kind === 'num' ? 'off' : 'characters', inputmode: kind === 'num' ? 'decimal' : 'text',
        'aria-label': kind === 'num' ? 'number' : kind,
      });
      if (kind !== 'num') {
        ctx.hasText = true;
        el.addEventListener('focus', () => { ctx.lastFocus = el; });
        if (!ctx.lastFocus) ctx.lastFocus = el;
      }
    }
    el.addEventListener('input', () => el.classList.remove('ok', 'bad'));
    el.addEventListener('change', () => el.classList.remove('ok', 'bad'));
    const tok = {
      el, kind,
      check() {
        const v = el.value;
        if (kind === 'reason' || kind === 'cond') { if (!v) return { ok: false, empty: true }; return { ok: alts.includes(v), val: v }; }
        if (kind === 'choice') { if (!v) return { ok: false, empty: true }; return { ok: rightChoices.includes(v), val: v }; }
        const a = alts;   // pass the alternatives as an array (a fraction like 1/2 stays one answer)
        const r = kind === 'num' ? CK.num(v, a) : kind === 'side' ? CK.side(v, a) : kind === 'angle' ? CK.angle(v, a) : kind === 'aname' ? CK.aname(v, a) : kind === 'tri' ? CK.tri(v, a) : CK.text(v, alts);
        if (r.val == null) r.val = CK.norm(v);
        return r;
      },
      answerText() {
        if (kind === 'choice') return rightChoices[0];
        if (kind === 'angle' || kind === 'aname') return '∠' + alts[0];
        if (kind === 'tri') return '△' + alts[0];
        return alts[0];
      },
    };
    return tok;
  }

  // Render a string that may contain [[tokens]]. mode 'text': $..$ is maths; mode 'math': the whole string is maths.
  function segments(str, mode, ctx, toks) {
    const span = U.el('span');
    let last = 0, m;
    const addPlain = s => {
      if (!s) return;
      if (mode === 'math') { if (s.trim()) span.append(U.el('span', { html: TEX.m(s) })); if (/\s$/.test(s)) span.append(' '); }
      else if (mode === 'reason') span.append(U.el('span', { text: s }));
      else span.append(U.el('span', { html: TEX.render(s) }));
    };
    TOK.lastIndex = 0;
    while ((m = TOK.exec(str))) {
      addPlain(str.slice(last, m.index));
      const t = makeInput(m[1], m[2], ctx);
      toks.push(t);
      span.append(t.el);
      last = TOK.lastIndex;
    }
    addPlain(str.slice(last));
    return span;
  }

  // index of the first "=" that is not inside a [[blank]], or -1
  function firstEq(s) {
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      if (s.startsWith('[[', i)) { depth++; i++; continue; }
      if (s.startsWith(']]', i)) { depth = Math.max(0, depth - 1); i++; continue; }
      if (s[i] === '=' && depth === 0) return i;
    }
    return -1;
  }

  // rows: [{ s, r }] maths statement + reason, [{ t }] a text line, or 'string' (text line)
  // A statement is split at its first "=" so that equal signs line up. Each block of statements
  // (between text lines such as "In △ABE,") is its own table, so it aligns on its own, like the textbook.
  function proofTable(rows, ctx, toks, opts = {}) {
    const table = U.el('div', { class: 'proof-group' });
    let tb = null;
    const newTable = () => { const t = U.el('table', { class: 'proof' }); tb = U.el('tbody'); t.append(tb); table.append(t); };
    const trs = rows.map(row => {
      if (typeof row === 'string') row = { t: row };
      if (row.t != null || !tb) newTable();
      const tr = makeRow(row);
      tb.append(tr);
      if (row.t != null) tb = null;
      return tr;
    });
    if (opts.returnRows) return { table, trs };
    return table;

    function makeRow(row) {
      if (typeof row === 'string') row = { t: row };
      let tr;
      if (row.t != null) {
        tr = U.el('tr', { class: 'text' }, U.el('td', { colspan: 3 }, segments(row.t, 'text', ctx, toks)));
      } else {
        const eq = firstEq(row.s);
        const cells = eq < 0
          ? [U.el('td', { class: 's', colspan: 2 }, segments(row.s, 'math', ctx, toks))]
          : [U.el('td', { class: 's s-l' }, row.s.slice(0, eq).trim() ? segments(row.s.slice(0, eq).trim(), 'math', ctx, toks) : ''),
             U.el('td', { class: 's s-r' }, segments('= ' + row.s.slice(eq + 1).trim(), 'math', ctx, toks))];
        tr = U.el('tr', {}, ...cells,
          U.el('td', { class: 'r' }, row.r ? segments(row.r, 'reason', ctx, toks) : ''));
      }
      return tr;
    }
  }

  /* ---------- bodies ---------- */
  const BODY = {};
  // an option is a string, or a picture { fig, t }
  const optBody = o => (o && o.fig
    ? U.el('span', { class: 'opt-fig' }, G.draw(o.fig).svg, o.t ? U.el('span', { class: 'small', html: TEX.render(o.t) }) : '')
    : U.el('span', { html: TEX.render(o) }));

  BODY.fill = (part, ctx) => {
    const node = U.el('div');
    const toks = [];
    (part.lines || []).forEach(line => node.append(U.el('div', { class: 'fill-line' }, segments(line, 'text', ctx, toks))));
    if (part.rows) node.append(U.el('div', { class: 'table-wrap' }, proofTable(part.rows, ctx, toks)));
    return {
      node,
      eval() {
        let ok = true, empty = false, hint = null, trap = null;
        const hints = [];   // one entry per wrong blank that has something specific to say
        toks.forEach((t, i) => {
          const r = t.check();
          t.el.classList.toggle('ok', r.ok);
          t.el.classList.toggle('bad', !r.ok && !r.empty);
          if (r.empty) empty = true;
          if (!r.ok) {
            ok = false;
            const w = (part.wrongs || []).find(x => x.tok === i && String(x.val).toUpperCase() === String(r.val).toUpperCase());
            const h = w ? w.hint : r.hint, tr = w ? (w.trap || null) : (r.trap || null);
            if (h) hints.push({ el: t.el, hint: h, trap: tr });
            if (!hint && h) { hint = h; trap = tr; }
          }
        });
        return { ok, empty, hint, trap, hints };
      },
      reveal() { toks.forEach(t => { if (!t.check().ok) { t.el.classList.add('bad'); t.el.title = 'Answer: ' + t.answerText(); } }); },
      state() { return toks.map(t => t.el.value); },
      restore(s) { s.forEach((v, i) => { if (toks[i]) toks[i].el.value = v; }); },
    };
  };

  BODY.mcq = (part) => {
    const node = U.el('div', { class: 'opts', role: 'radiogroup' });
    let sel = null;
    if (part.options.some(o => o && o.fig)) node.classList.add('figopts');
    const btns = part.options.map((o, i) => {
      const b = U.el('button', { type: 'button', class: 'opt', role: 'radio', 'aria-checked': 'false' },
        U.el('span', { class: 'ol', text: 'ABCDEFG'[i] + '.' }), optBody(o));
      b.addEventListener('click', () => {
        sel = i;
        btns.forEach((x, j) => { x.classList.toggle('sel', j === i); x.classList.remove('right', 'wrong'); x.setAttribute('aria-checked', j === i ? 'true' : 'false'); });
      });
      node.append(b);
      return b;
    });
    return {
      node,
      eval() {
        if (sel == null) return { ok: false, empty: true };
        const ok = sel === part.ans;
        btns[sel].classList.toggle('wrong', !ok);
        btns[sel].classList.toggle('right', ok);
        return { ok, hint: ok ? null : (part.why || {})[sel] || null, trap: ok ? null : (part.whyTrap || {})[sel] || null };
      },
      reveal() { btns[part.ans].classList.add('right'); },
      state() { return sel; },
      restore(s) { if (s != null && btns[s]) btns[s].click(); },
    };
  };

  // choose every correct option (tick boxes)
  BODY.pick = (part) => {
    const node = U.el('div', { class: 'opts pick', role: 'group' });
    if (part.options.some(o => o && o.fig)) node.classList.add('figopts');
    const on = part.options.map(() => false);
    const want = new Set(part.ans);
    const btns = part.options.map((o, i) => {
      const b = U.el('button', { type: 'button', class: 'opt', 'aria-pressed': 'false' },
        U.el('span', { class: 'ol tick', text: '' }), optBody(o));
      b.addEventListener('click', () => {
        on[i] = !on[i];
        b.classList.toggle('sel', on[i]); b.setAttribute('aria-pressed', on[i] ? 'true' : 'false');
        btns.forEach(x => x.classList.remove('right', 'wrong'));
      });
      node.append(b);
      return b;
    });
    return {
      node,
      eval() {
        if (!on.some(Boolean)) return { ok: false, empty: true };
        let ok = true, hint = null;
        on.forEach((v, i) => {
          if (v && !want.has(i)) { ok = false; btns[i].classList.add('wrong'); if (!hint) hint = (part.why || {})[i] || null; }
          if (v && want.has(i)) btns[i].classList.add('right');
        });
        const missed = [...want].filter(i => !on[i]);
        if (missed.length) { ok = false; if (!hint) hint = (part.miss || {})[missed[0]] || 'Everything you chose so far that is not red is right, but there is more to choose.'; }
        else if (!ok && !hint) hint = 'Take away the choice marked in red.';
        return { ok, hint, trap: ok ? null : part.pickTrap || null };
      },
      reveal() { btns.forEach((b, i) => { b.classList.toggle('right', want.has(i)); }); },
      state() { return on.slice(); },
      restore(s) { (s || []).forEach((v, i) => { if (v && btns[i] && !on[i]) btns[i].click(); }); },
    };
  };

  BODY.statement = (part, ctx) => {
    // part.pairs lists every correct answer when more than one pair works: [['ABD','CBD'], ['ADE','CDE']]
    const pairs = part.pairs || [[part.tri1, part.tri2]];
    const letters = part.letters ? [...part.letters] : uniq(pairs.flat().join('')).sort();
    const sb = StatementBuilder(letters, pairs[0][0].length);
    const node = U.el('div', {}, part.prompt ? U.el('p', { html: TEX.render(part.prompt) }) : '', sb.node);
    sb.onChange = () => sb.mark(null);
    return {
      node,
      eval() {
        const [L, R] = sb.get();
        if ((L + R).includes(' ')) return { ok: false, empty: true };
        const results = pairs.map(([a, b]) => CK.statement(L, R, a, b));
        const r = results.find(x => x.ok) || results.find(x => x.trap) || results[0];
        sb.mark(r.ok);
        return r;
      },
      reveal() {},
      state() { return sb.get(); },
      restore(s) { sb.set(s); },
    };
  };

  BODY.bank = (part, ctx) => {
    const normS = s => s.replace(/\s+/g, '');
    const routes = part.routes;
    const n = routes[0].lines.length;
    const all = uniq([...routes.flatMap(r => r.lines.map(l => l.s)), ...(part.distract || []).map(d => d.s)]);
    const node = U.el('div');
    if (part.pre && part.pre.length) node.append(U.el('div', { class: 'table-wrap' }, proofTable(part.pre, ctx, [])));
    node.append(U.el('p', { html: TEX.render(part.intro || '') }));
    const table = U.el('table', { class: 'proof bank-table' });
    const tb = U.el('tbody');
    table.append(tb);
    const reasons = uniq([...REASONS, ...(ctx.reasons || [])]);
    const rows = [];
    const bank = U.el('div', { class: 'bank', 'aria-label': 'Statement bank' });
    const chips = {};
    const place = s => {
      const row = rows.find(r => !r.s);
      if (!row) return;
      row.s = s; chips[s].classList.add('hidden'); paint();
    };
    all.forEach(s => {
      const c = U.el('button', { type: 'button', class: 'chip', html: TEX.m(s) });
      c.addEventListener('click', () => place(s));
      chips[s] = c;
    });
    U.shuffle(all).forEach(s => bank.append(chips[s]));
    for (let i = 0; i < n; i++) {
      const slot = U.el('div', { class: 'slot empty', role: 'button', tabindex: '0' });
      const sel = U.el('select', { class: 'ans', 'aria-label': 'reason for line ' + (i + 1) },
        U.el('option', { value: '', text: '— reason —' }), reasons.map(o => U.el('option', { value: o, text: o })));
      sel.addEventListener('change', () => sel.classList.remove('ok', 'bad'));
      const row = { s: null, slot, sel };
      const clearIt = () => { if (row.s) { chips[row.s].classList.remove('hidden'); row.s = null; paint(); } };
      slot.addEventListener('click', clearIt);
      slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearIt(); } });
      rows.push(row);
      tb.append(U.el('tr', {}, U.el('td', { class: 's' }, slot), U.el('td', { class: 'r' }, sel)));
    }
    const cond = U.el('select', { class: 'ans', 'aria-label': 'condition' }, U.el('option', { value: '', text: '— condition —' }), CONDS.map(c => U.el('option', { value: c, text: c })));
    cond.addEventListener('change', () => cond.classList.remove('ok', 'bad'));
    tb.append(U.el('tr', {}, U.el('td', { class: 's', html: TEX.m('∴ ' + part.concl) }), U.el('td', { class: 'r' }, cond)));
    function paint() {
      rows.forEach((r, i) => {
        r.slot.classList.remove('ok', 'bad');
        r.slot.classList.toggle('empty', !r.s);
        r.slot.innerHTML = r.s ? TEX.m(r.s) : 'Tap a statement below for line ' + (i + 1);
      });
    }
    paint();
    node.append(U.el('div', { class: 'table-wrap' }, table),
      U.el('div', { class: 'bank-title', text: 'Statement bank — tap to add, tap a line to remove. Not every statement is useful (or true!).' }), bank);
    return {
      node,
      eval() {
        if (rows.some(r => !r.s) || rows.some(r => !r.sel.value) || !cond.value) return { ok: false, empty: true, hint: 'Fill every line: a statement, its reason, and the condition.' };
        const chosen = rows.map(r => normS(r.s));
        const route = routes.find(rt => {
          const want = rt.lines.map(l => normS(l.s)).sort().join('#');
          return want === chosen.slice().sort().join('#');
        });
        if (!route) {
          const okSet = new Set(routes.flatMap(rt => rt.lines.map(l => normS(l.s))));
          let hint = null, trap = null;
          rows.forEach((r, i) => {
            const good = okSet.has(normS(r.s));
            r.slot.classList.toggle('bad', !good);
            if (!good && !hint) {
              const d = (part.distract || []).find(x => normS(x.s) === normS(r.s));
              hint = `Line ${i + 1}: ` + (d && d.why ? d.why : 'this fact is not given and has not been proved, so you cannot use it.');
              trap = d && d.trap || 'circular';
            }
          });
          if (!hint) hint = 'Each fact is fine on its own, but together they do not make a valid condition. Try a different set of three facts.';
          return { ok: false, hint, trap };
        }
        rows.forEach(r => r.slot.classList.add('ok'));
        let hint = null, trap = null, ok = true;
        rows.forEach((r, i) => {
          const line = route.lines.find(l => normS(l.s) === normS(r.s));
          const acc = line.r.split('|');
          const good = acc.includes(r.sel.value);
          r.sel.classList.toggle('ok', good); r.sel.classList.toggle('bad', !good);
          if (!good) {
            ok = false;
            if (!hint) {
              if (line.rw && line.rw[r.sel.value]) hint = `Line ${i + 1}: ` + line.rw[r.sel.value];
              else if (acc.includes('given')) { hint = `Line ${i + 1}: this fact is stated in the question, so its reason is "given".`; trap = 'given'; }
              else if (acc.includes('common side')) { hint = `Line ${i + 1}: this side belongs to both triangles — "common side".`; trap = 'common'; }
              else if (acc.includes('common ∠')) { hint = `Line ${i + 1}: this angle belongs to both triangles — "common ∠".`; trap = 'common'; }
              else if (acc.includes('vert. opp. ∠s')) { hint = `Line ${i + 1}: these angles are opposite each other where two straight lines cross — "vert. opp. ∠s".`; trap = 'common'; }
              else hint = `Check the reason in line ${i + 1}.`;
            }
          }
        });
        const cgood = cond.value === route.cond;
        cond.classList.toggle('ok', cgood); cond.classList.toggle('bad', !cgood);
        if (!cgood) {
          ok = false;
          if (!hint) {
            if (cond.value === 'SSA') { hint = 'SSA is not a condition for congruent triangles. Look at where the angle is.'; trap = 'ssa'; }
            else if (cond.value === 'AAA') { hint = 'AAA is not a condition — same shape does not mean same size.'; trap = 'aaa'; }
            else if (/A/.test(route.cond) && /A/.test(cond.value) && route.cond !== 'SAS' && cond.value !== 'SAS') { hint = 'Look at where the side is: between the two angles (ASA) or not (AAS)?'; trap = 'asa-aas'; }
            else hint = 'The three facts are right, but they match a different condition. Check where the angle (or the side) sits.';
          }
        }
        return { ok, hint, trap };
      },
      reveal() {},
      state() { return { rows: rows.map(r => [r.s, r.sel.value]), cond: cond.value }; },
      restore(s) {
        (s.rows || []).forEach(([st, rs], i) => {
          if (!rows[i]) return;
          if (st && chips[st] && !rows[i].s) { rows[i].s = st; chips[st].classList.add('hidden'); }
          rows[i].sel.value = rs || '';
        });
        cond.value = s.cond || '';
        paint();
      },
    };
  };

  /* ---------- keypad for typed answers ---------- */
  function keypad(ctx) {
    const kp = U.el('div', { class: 'keypad', 'aria-label': 'Symbol keys' }, U.el('span', { class: 'kp-label', text: 'Keys:' }));
    const ins = txt => {
      const el = ctx.lastFocus;
      if (!el) return;
      if (txt === '⌫') el.value = el.value.slice(0, -1);
      else el.value += txt;
      el.classList.remove('ok', 'bad');
    };
    ['∠', '△'].forEach(s => kp.append(U.el('button', { type: 'button', class: 'sym', text: s, onmousedown: e => e.preventDefault(), onclick: () => ins(s) })));
    (ctx.letters || []).forEach(L => kp.append(U.el('button', { type: 'button', text: L, onmousedown: e => e.preventDefault(), onclick: () => ins(L) })));
    kp.append(U.el('button', { type: 'button', class: 'sym', text: '⌫', 'aria-label': 'backspace', onmousedown: e => e.preventDefault(), onclick: () => ins('⌫') }));
    return kp;
  }

  function solutionNode(sol, title) {
    const box = U.el('div');
    if (!sol) return box;
    box.append(U.el('h4', { text: title }));
    const rows = Array.isArray(sol) ? sol : [sol];
    box.append(U.el('div', { class: 'table-wrap' }, proofTable(rows, {}, [])));
    return box;
  }

  function trapLink(id) {
    const t = (C5.traps || []).find(x => x.id === id);
    if (!t) return null;
    return U.el('div', { class: 'trap-link' }, 'Trap: ', U.el('a', { href: '#/traps/' + id, text: t.title }));
  }

  /* ---------- the card ---------- */
  function card(q, opts = {}) {
    const root = U.el('div', { class: 'qcard', id: q.id ? 'q-' + q.id : null });
    const head = U.el('div', { class: 'qhead' });
    if (opts.num != null) head.append(U.el('span', { class: 'qnum', text: 'Q' + opts.num }));
    if (q.level) head.append(U.el('span', { class: 'level', text: q.level === 3 ? 'Challenge' : 'Level ' + q.level }));
    if (q.paper) head.append(U.el('span', { class: 'level', text: 'Do it on paper' }));
    if (q.random) head.append(U.el('span', { class: 'level', text: 'New numbers every time' }));
    if (opts.done) head.append(U.el('span', { class: 'badge done', text: 'Solved before' }));
    root.append(head);
    if (q.q) root.append(U.el('div', { class: 'qtext', html: TEX.render(q.q) }));
    let fig = null;
    if (q.fig) { fig = G.draw(q.fig); root.append(U.el('div', { class: 'fig-wrap' }, fig.svg)); }
    const ctx = { reasons: q.reasons || [], letters: q.letters ? [...q.letters] : fig ? Object.keys(fig.pts).filter(k => k.length === 1).sort() : [], lastFocus: null, hasText: false };
    const parts = q.parts || [q];
    const bodies = parts.map(p => {
      const b = BODY[p.type || 'fill'](p, ctx);
      if (p.label) root.append(U.el('div', { class: 'part-label', html: TEX.render(p.label) }));
      if (p.q && q.parts) root.append(U.el('div', { class: 'qtext', html: TEX.render(p.q) }));
      root.append(b.node);
      return b;
    });
    if (ctx.hasText) {
      if (!ctx.letters.length) {
        const found = new Set();
        root.querySelectorAll('.qtext').forEach(n => (n.textContent.match(/[A-Z]/g) || []).forEach(c => found.add(c)));
        ctx.letters = [...found].sort();
      }
      root.append(keypad(ctx));
    }
    const fb = U.el('div', { class: 'feedback', 'aria-live': 'polite' });
    const solBox = U.el('div', { class: 'solution' }, solutionNode(q.sol, 'Solution'), q.alt ? U.el('div', { class: 'alt' }, solutionNode(q.alt, 'Another way')) : '');
    let attempts = 0, solved = false, peeked = false;
    const solBtn = U.el('button', { type: 'button', class: 'btn ghost hidden', text: 'Show solution', onclick: () => { peeked = true; solBox.classList.add('show'); bodies.forEach(b => b.reveal()); solBtn.classList.add('hidden'); } });
    const showFb = (good, title, msg, trap) => {
      fb.className = 'feedback show ' + (good ? 'good' : 'bad');
      U.clear(fb).append(U.el('div', { class: 'fb-title', text: title }));
      if (msg) fb.append(U.el('div', { html: TEX.render(U.esc(msg).replace(/&lt;br&gt;/g, '<br>')) }));
      if (trap) { const l = trapLink(trap); if (l) fb.append(l); }
    };
    function evaluate() {
      const res = bodies.map(b => b.eval());
      // every specific hint from every wrong blank; numbered by box when there is more than one
      const all = res.filter(r => !r.ok).flatMap(r => r.hints || (r.hint ? [{ hint: r.hint, trap: r.trap }] : []));
      const boxes = [...root.querySelectorAll('.ans')];
      const seen = new Set();
      const list = all.filter(h => !seen.has(h.hint) && seen.add(h.hint));
      const lines = list.map(h => (list.length > 1 && h.el ? `Box ${boxes.indexOf(h.el) + 1}: ` : '') + h.hint);
      const firstTrap = (all.find(h => h.trap) || res.find(r => !r.ok && r.trap) || {}).trap || null;
      return { ok: res.every(r => r.ok), empty: res.some(r => r.empty && !r.ok), first: { hint: lines.join('<br>') || null, trap: firstTrap } };
    }
    function check() {
      const r = evaluate();
      if (r.ok) {
        const first = attempts === 0 && !solved;
        solved = true;
        root.classList.add('ok');
        const note = peeked ? 'You looked at the solution first, so this one is not counted as solved yet. Come back later and try it again without help.' : (q.after || '');
        showFb(true, first ? 'Correct — first try!' : 'Correct!', note, null);
        solBox.classList.add('show');
        solBtn.classList.add('hidden');
        // first: right on the first try; earned: solved without opening the solution
        opts.onResult && opts.onResult(true, first, !peeked);
        return;
      }
      if (r.empty && !r.first.hint) {
        const kinds = parts.map(p => p.type || 'fill');
        const msg = kinds.every(k => k === 'mcq' || k === 'pick') ? 'Choose an answer first.' : 'Answer every part before checking.';
        showFb(false, 'Not finished yet', msg, null);
        return;
      }
      attempts++;
      const hints = q.hints || [];
      let msg;
      if (attempts === 1) msg = r.first.hint || hints[0] || 'Not quite. Look at the blanks marked in red.';
      else msg = [r.first.hint, hints[1] || hints[0]].filter(Boolean).join('<br>') || 'Still not right. You can look at the solution now.';
      showFb(false, attempts === 1 ? 'Not quite' : 'Still not right', msg, r.first.trap || (attempts >= 2 ? q.trap : null));
      if (attempts >= 2) solBtn.classList.remove('hidden');
      opts.onResult && opts.onResult(false, false);
    }
    const actions = U.el('div', { class: 'btn-row' });
    if (!opts.deferred) actions.append(U.el('button', { type: 'button', class: 'btn', text: 'Check', onclick: check }));
    actions.append(solBtn);
    if (opts.regen) actions.append(U.el('button', { type: 'button', class: 'btn ghost', text: 'New numbers', onclick: () => { const n = card(opts.regen(), opts); root.replaceWith(n.node); } }));
    root.append(actions, fb, solBox);
    if (opts.onChange) {
      const ping = () => setTimeout(() => opts.onChange(), 0);
      root.addEventListener('input', ping);
      root.addEventListener('change', ping);
      root.addEventListener('click', ping);
    }
    return {
      node: root,
      // save / restore what the student has entered (used by Test mode)
      state() { return bodies.map(b => (b.state ? b.state() : null)); },
      restore(s) { (s || []).forEach((x, i) => { if (x != null && bodies[i] && bodies[i].restore) bodies[i].restore(x); }); },
      // for test mode: mark silently, then reveal
      grade() { const r = evaluate(); return r.ok; },
      reveal(ok) {
        root.classList.toggle('ok', ok);
        showFb(ok, ok ? 'Correct' : 'Not correct', '', ok ? null : q.trap);
        solBox.classList.add('show');
        bodies.forEach(b => b.reveal());
      },
    };
  }

  return { card, StatementBuilder, proofTable, segments };
})();
