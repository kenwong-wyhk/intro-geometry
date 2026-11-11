'use strict';
/* Core helpers: DOM building, maths rendering (KaTeX), local progress storage. */

window.C5 = window.C5 || { sections: {}, traps: [], challenge: [], gens: {} };

const U = {
  el(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) {
      if (k == null || k === false) continue;
      e.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
    return e;
  },
  esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
  shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  pick(a) { return a[Math.floor(Math.random() * a.length)]; },
  rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  round(x, dp = 0) { const f = Math.pow(10, dp); return Math.round(x * f) / f; },
  // random distinct capital letters (avoids I and O which look like 1 and 0)
  letters(n, avoid = '') {
    const pool = U.shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ'.split('').filter(c => !avoid.includes(c)));
    return pool.slice(0, n);
  },
  perm3() { return U.pick([[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]); },
  clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; },
};

/* ---------- Maths rendering ----------
   In content strings, maths goes between $...$ and is LaTeX.
   Unicode shorthands are also understood inside $...$: ∠ △ ≅ ° // ⊥ ∴ ∵
   TEX.m(plain) renders a whole string as maths (used for proof lines). */
const TEX = {
  conv(s) {
    return String(s)
      .replace(/∠/g, '\\angle ')
      .replace(/△/g, '\\triangle ')
      .replace(/≅/g, '\\cong ')
      .replace(/°/g, '^\\circ ')
      // HK textbooks write "parallel" as a slanted // (not the upright ∥ of \parallel)
      .replace(/\/\/|\\parallel(?![a-zA-Z])|∥/g, '\\mathrel{/\\mkern-5mu/}')
      .replace(/⊥/g, '\\perp ')
      .replace(/∴/g, '\\therefore\\ ')
      .replace(/∵/g, '\\because\\ ')
      .replace(/×/g, '\\times ')
      .replace(/−/g, '-')
      .replace(/([\d)])\s*cm\b/g, '$1\\text{ cm}');
  },
  k(t, display) {
    try {
      if (window.katex) return katex.renderToString(TEX.conv(t), { throwOnError: false, displayMode: !!display });
    } catch (e) { /* fall through */ }
    return '<span class="tex-fallback">' + U.esc(t) + '</span>';
  },
  render(s) {
    if (s == null) return '';
    return String(s).replace(/\$([^$]+)\$/g, (m, t) => TEX.k(t));
  },
  m(plain) { return TEX.k(plain); },
};

/* ---------- Reasons & conditions (textbook notation) ---------- */
const REASONS = ['∠ sum of △'];
const CONDS = [];

/* ---------- Local progress (this browser only) ---------- */
const Store = {
  key: 'wyhk-f1c5-v1',
  d: null,
  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.d = {}; }
    this.d.s = this.d.s || {};
    this.d.game = this.d.game || { best: {} };
    this.d.game.best = this.d.game.best || {};
    return this.d;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { /* storage blocked */ } },
  sec(id) { if (!this.d) this.load(); return (this.d.s[id] = this.d.s[id] || { seen: {}, ok: {} }); },
  seen(id, tab) { const s = this.sec(id); if (!s.seen[tab]) { s.seen[tab] = 1; this.save(); } },
  ok(id, qid) { const s = this.sec(id); if (!s.ok[qid]) { s.ok[qid] = 1; this.save(); } },
  isOk(id, qid) { return !!this.sec(id).ok[qid]; },
  first(id, qid) { const s = this.sec(id); s.ft = s.ft || {}; if (!s.ft[qid]) { s.ft[qid] = 1; this.save(); } },
  isFirst(id, qid) { const s = this.sec(id); return !!(s.ft && s.ft[qid]); },
  // Test mode in progress (saved so a refresh does not lose it)
  getTest() { if (!this.d) this.load(); return this.d.test || null; },
  setTest(t) { if (!this.d) this.load(); if (t) this.d.test = t; else delete this.d.test; this.save(); },
  game() { if (!this.d) this.load(); return this.d.game; },
  reset() { this.d = { s: {}, game: { best: {} } }; this.save(); },
};
