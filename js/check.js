'use strict';
/* Answer checking. Every checker returns { ok, hint? }. */
const CK = (() => {
  const rev = s => s.split('').reverse().join('');
  const norm = s => String(s || '')
    .replace(/\s+/g, '')
    .replace(/angle/ig, '∠').replace(/triangle/ig, '△')
    .replace(/[<∡]/g, '∠').replace(/[Δ∆]/g, '△')
    .toUpperCase();
  // answers may be passed as an array of alternatives (preferred) or as one string
  const alts = ans => (Array.isArray(ans) ? ans.map(String) : [String(ans)]);
  // a number, or a simple fraction such as 1/2 or -3/4
  const toNum = s => {
    const m = String(s).match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    return m ? Number(m[1]) / Number(m[2]) : Number(s);
  };

  function side(inp, ans) {
    const s = norm(inp);
    if (!s) return { ok: false, empty: true };
    for (const a of alts(ans)) if (s === a || s === rev(a)) return { ok: true };
    if (/^[A-Z]{2}$/.test(s)) return { ok: false };
    return { ok: false, hint: 'Name a side with its two end-points, e.g. AB.' };
  }

  function angle(inp, ans) {
    const s = norm(inp);
    if (!s) return { ok: false, empty: true };
    const A = alts(ans);
    const m3 = s.match(/^∠?([A-Z]{3})$/);
    if (m3) {
      const t = m3[1];
      const hit = A.some(a => t === a || t === rev(a));
      if (hit && !s.startsWith('∠')) return { ok: false, hint: `Nearly — write the angle sign too: ∠${t}.` };
      if (hit) return { ok: true };
      return { ok: false };
    }
    const m1 = s.match(/^∠?([A-Z])$/);
    if (m1) {
      if (A.some(a => a[1] === m1[1])) return { ok: false, hint: `Use the full name with three letters, e.g. ∠${A[0][0]}${A[0][1]}… (not ∠${m1[1]}): the vertex goes in the middle.`, trap: 'fullname' };
      return { ok: false, hint: 'Use the full name of the angle with three letters, e.g. ∠ABC.', trap: 'fullname' };
    }
    return { ok: false, hint: 'Write the angle like this: ∠ABC (the middle letter is the vertex).' };
  }

  // "Name this angle" (5.1): the full name, or the short name ∠B when B is the vertex and only one angle is there
  function aname(inp, ans) {
    const s = norm(inp);
    if (!s) return { ok: false, empty: true };
    const A = alts(ans);
    const m = s.match(/^(∠?)([A-Z]|[A-Z]{3})$/);
    if (!m) return { ok: false, hint: 'Write the angle like this: ∠ABC (the middle letter is the vertex), or ∠B.' };
    if (!m[1]) return { ok: false, hint: 'Write the angle sign ∠ in front of the letters.' };
    const t = m[2];
    if (t.length === 3) {
      if (A.some(a => t === a || t === rev(a))) return { ok: true };
      if (A.some(a => t.split('').sort().join('') === a.split('').sort().join(''))) return { ok: false, hint: 'Right letters, but the vertex must be the <b>middle</b> letter.', trap: 'vertexmiddle' };
      return { ok: false };
    }
    return { ok: A.some(a => a[1] === t) };
  }

  // exact marking: 6.3 and 6.30 are right, 6.35 is wrong (tol only absorbs floating-point noise)
  function num(inp, ans, tol = 1e-9) {
    const s = String(inp || '').replace(/[°˚º\s]|cm/gi, '').replace(/−/g, '-');
    if (!s) return { ok: false, empty: true };
    const v = toNum(s);
    if (!isFinite(v)) return { ok: false, hint: 'Type a number only (no units needed).' };
    return { ok: alts(ans).some(a => Math.abs(v - toNum(a)) <= tol), val: v };
  }

  function tri(inp, ans) {
    const s = norm(inp).replace(/^△/, '');
    if (!s) return { ok: false, empty: true };
    for (const a of alts(ans)) {
      if (s === a) return { ok: true };
      if (s.length === a.length && s.split('').sort().join('') === a.split('').sort().join('')) {
        return { ok: false, hint: 'Right letters, wrong order. The order must match the corresponding vertices.', trap: 'order' };
      }
    }
    return { ok: false };
  }

  function text(inp, ans) {
    const s = String(inp || '').trim().toLowerCase();
    if (!s) return { ok: false, empty: true };
    return { ok: alts(ans).some(a => a.trim().toLowerCase() === s) };
  }

  /* Congruence statement: student wrote △L ≅ △R; the true correspondence is t1[i] <-> t2[i].
     Any consistent re-ordering is accepted (△BAC ≅ △QPR is the same as △ABC ≅ △PQR). */
  function statement(L, R, t1, t2) {
    L = L.join ? L.join('') : L; R = R.join ? R.join('') : R;
    if (L.length !== t1.length || R.length !== t1.length || L.includes(' ') || R.includes(' ')) return { ok: false, hint: 'Fill in all the letters.' };
    const map = {}, inv = {};
    [...t1].forEach((c, i) => { map[c] = t2[i]; inv[t2[i]] = c; });
    const sortS = s => s.split('').sort().join('');
    const tryDir = (from, to, m) => sortS(L) === sortS(from) && sortS(R) === sortS(to) && [...L].every((c, i) => m[c] === R[i]);
    if (tryDir(t1, t2, map) || tryDir(t2, t1, inv)) return { ok: true };
    const setsOk = (sortS(L) === sortS(t1) && sortS(R) === sortS(t2)) || (sortS(L) === sortS(t2) && sortS(R) === sortS(t1));
    if (setsOk) return { ok: false, hint: 'The letters are right but the order is not. Corresponding vertices must be in the same position on both sides.', trap: 'order' };
    return { ok: false, hint: 'Check which vertices belong to which triangle.' };
  }

  return { norm, side, angle, aname, num, tri, text, statement, rev };
})();
