'use strict';
/* Small helpers for writing figures in the data files, so that drawings match their labels.
   Angles are in degrees, measured anticlockwise as on paper; coordinates have y going down. */
const HP = (() => {
  const R = Math.PI / 180;
  // the point at distance r from o in direction a
  const ray = (o, a, r) => [Math.round((o[0] + r * Math.cos(a * R)) * 10) / 10, Math.round((o[1] - r * Math.sin(a * R)) * 10) / 10];
  // rays from O: rays([160,110], 95, { A:10, B:66 }) -> { O:[..], A:[..], B:[..] }
  const rays = (o, r, dirs) => { const p = { O: o }; for (const k in dirs) p[k] = ray(o, dirs[k], r); return p; };
  // the vertex above a horizontal side BC (B on the left) when the angles at B and C are b and c
  const apex = (B, C, b, c) => { const t = (C[0] - B[0]) * Math.sin(c * R) / Math.sin((b + c) * R); return ray(B, b, t); };
  // the point D on BC (B on the left) such that angle ADB = d, where A is above BC
  const foot = (A, B, d) => { const h = B[1] - A[1]; return [Math.round((A[0] + h / Math.tan(d * R)) * 10) / 10, B[1]]; };
  // a regular polygon with n vertices, centre c, radius r; names like 'ABCDE' (going clockwise on screen from the top-left)
  const regular = (names, c, r, start) => {
    const n = names.length, a0 = start != null ? start : 90 + 180 / n, p = {};
    [...names].forEach((L, i) => { p[L] = ray(c, a0 - 360 * i / n, r); });
    return p;
  };
  return { ray, rays, apex, foot, regular };
})();
