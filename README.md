# F1 Ch5 Introduction to Geometry — self-study site

A static website for WYHK F1 students to use before or after class. No login, no server, and nothing leaves the
student's device (progress ticks are kept in that browser only). Built from the Congruence site's engine; see
`../PLAYBOOK.md` for the house rules and the checks to run before publishing.

## What's inside

| Page | What students do |
| --- | --- |
| 5.1–5.4 | **Learn** (key points + interactive demo) → **Examples** (reveal the solution step by step) → **Practice** (instant feedback, hint → stronger hint → solution) → **Traps** |
| 5.1 demo | Angle dial: drag an arm and watch the type of angle change |
| 5.2 demo | Angle sum: drag the corners of a triangle; the three angles always fill a straight line |
| 5.3 | Nine constructions shown step by step (ruler, set square, compasses, protractor); practice on tools, cases and step order; "Do it on paper" questions with a measurable answer |
| 5.4 demo | Slicer: move a cut through a solid and see its true cross-section; solids are drawn by `js/solids.js` with dotted hidden edges |
| Game | Sorting Game: six decks (angles, triangles by sides and by angles, polygons, polyhedron?, uniform cross-sections?), rounds of 10 and a 60-second Speed Round |
| Traps | Trap Gallery — 24 common mistakes with "the trap" vs "do this" |
| Challenge | 10 random questions from a pool of 30; Practice mode or 35-minute Test mode |
| Revision sheet | Key points of the chapter on one printable page (`#/sheet`) |
| Live lessons | `s51-live.html`: section 5.1 as full-screen scenes for teaching from the front (arrow keys or a clicker; F for full screen). Engine in `live/`. 5.2–5.4 follow after the 5.1 review. |

## Files

```
index.html          page shell (loads everything)
css/style.css       look and feel (WYHK Design System colours; light theme only)
js/                 the engine
  core.js           helpers, maths rendering, reasons list, local progress
  geom.js           draws plane figures from a short description (also reflex angles and circles)
  solids.js         draws solids, their cuts and cross-sections (notes at the top of the file)
  check.js          marks answers (full angle names, numbers, "name this angle")
  question.js       question cards: fill-in, multiple choice (text or picture options), tick-all-that-apply
  examples.js       step-by-step worked examples
  demos.js          angle pictures, angle dial, angle-sum triangle, slicer, grid-paper picture
  construct.js      5.3 construction animations
  game.js           Sorting Game
  app.js            pages and navigation
data/               the content — edit these to change questions
  helpers.js        small helpers for figure coordinates (rays from a point, a triangle from its angles)
  s51.js … s54.js   one file per section
  traps.js          Trap Gallery
  challenge.js      Mixed Challenge pool
  sheet.js          printable revision sheet
vendor/             KaTeX and fonts, served from the site itself
tools/stamp_versions.py   refreshes the ?v= tags in index.html and the live pages
tools/site-checks.js      browser checks to run before publishing (see ../PLAYBOOK.md, section 6)
```

## New in this site (compared with the Congruence site)

- Blank `[[aname:ABC]]`: accepts ∠ABC, ∠CBA and the short name ∠B. Use it only where one angle is at that vertex;
  use `[[angle:ABC]]` everywhere else (it rejects ∠B with a hint).
- `type: 'pick'` with `ans: [0, 2]`: choose all the correct options. `why` gives a hint for a wrong choice, `miss`
  for one left out.
- A multiple-choice option may be a picture: `{ fig: { ... } }`.
- `paper: true` marks a "Do it on paper" question.
- Figures: `reflex: ['CDE']`, `circles: [{ c: 'O', r: 70 }]`, `solid: { kind: 'pyramid', ngon: 4, r: 2.6, height: 4.4, cut: { y: 1.8 } }`.

## Previewing on your computer

The site needs to be served by a small web server (opening `index.html` directly mostly works, but a server is safer):

```bash
python -m http.server 8000 --directory "Intro Geometry Website"
```

Then open http://localhost:8000.

## Editing questions

Each section file has a `practice` list. Maths is LaTeX between `$...$`, exactly as in your worksheets.
Inside proof lines you can also type the symbols directly: `∠ △ ≅ ° // ⊥ ∴ ∵`.

### Fill-in question

```js
{
  id: '51-9', level: 1,
  q: 'Given that $\\triangle ABC \\cong \\triangle PQR$, find',
  lines: ['$PQ = $ [[side:AB]]', '$\\angle QPR = $ [[angle:BAC]]', '$x = $ [[num:56]]°'],
  hints: ['First hint', 'Stronger hint'],
  sol: [{ s: 'PQ = AB', r: 'corr. sides, ≅ △s' }],
}
```

Blanks: `[[num:56]]` (marked exactly: 6.3 and 6.30 are right, 6.35 is wrong; fractions like `[[num:1/2]]` work), `[[side:AB]]` (BA also accepted), `[[angle:ABC]]` (∠CBA accepted, ∠B rejected with a hint),
`[[tri:PQR]]`, `[[reason:given]]`, `[[cond:SAS]]`, `[[choice:Yes*|No]]` (the `*` marks the right option, before or after it).
Use `|` for alternatives, e.g. `[[num:56|124]]`.

A proof line is split at its first `=` so the equal signs line up; a text line (`{ t: 'In $\triangle ABE$,' }`) starts a new block.

A proof table uses `rows` instead of `lines`: `{ s: 'AB = [[side:DC]]', r: '[[reason:given]]' }`.

Targeted hints for common wrong answers: `wrongs: [{ tok: 0, val: 53, hint: '...', trap: 'anglesum' }]`
(`tok` counts the blanks from 0).

### Multiple choice

```js
{ id: '52-11', type: 'mcq', q: '...', options: ['SSS', 'SAS', 'ASA', 'RHS'], ans: 1, why: { 3: 'hint if they pick D' } }
```

### Proof bank (students build the proof)

```js
{
  id: '53-9', type: 'bank', q: '...', fig: { ... },
  intro: 'In $\\triangle ABC$ and $\\triangle DCB$,',
  routes: [{ lines: [{ s: 'AB = DC', r: 'given' }, { s: 'AC = DB', r: 'given' }, { s: 'BC = CB', r: 'common side' }], cond: 'SSS' }],
  distract: [{ s: '∠ABC = ∠DCB', why: 'Not given — it comes from the congruence.' }],
  concl: '△ABC ≅ △DCB',
}
```

Add a second entry to `routes` if another proof is also correct (e.g. ASA and AAS).

### Build the statement

```js
{ type: 'statement', pairs: [['ABD', 'CBD'], ['ADE', 'CDE']], letters: 'ABCDE' }   // any listed pair is accepted, in any consistent order
```

### Curved figures

```js
fig: { w: 320, h: 120, fit: false, noLabels: true, pts: {},
       shapes: [{ d: 'M -28 -26 L 28 -26 L 28 0 A 28 28 0 0 1 -28 0 Z', at: [95, 60], rot: 90, flip: true, scale: 1.2 }] }
```

### Figures

```js
fig: {
  w: 340, h: 190,
  pts: { A: [20, 150], B: [160, 150], C: [55, 70] },            // or make: [{ tri:'ABC', ang:[66,37,77], box:[...] }]
  derive: [{ src: 'ABC', dst: 'PRQ', rot: 100, at: [262, 100] }], // a congruent copy (turned / flipped)
  polys: ['ABC', 'PRQ'], lines: ['BCD'],
  ticks: { AB: 1, PR: 1 }, arcs: { ABC: 1 }, rights: ['ACB'], arrows: { AB: 1 },
  st: { AB: '5 cm' }, at: { BAC: '66°', QPR: 'y' },
}
```

Coordinates have y going **down**. Full notes are at the top of `js/geom.js`.

### Randomised questions and AI-made variants

`C5.gens.s51rand` (in `s51.js`) and `C5.gens.s52rand` (in `s52.js`) generate new numbers every time.
To add more variants later, ask Claude to "add N new practice questions to data/s53.js in the same format",
check them in the preview, then publish. Nothing is generated while students use the site.

## Publishing on GitHub Pages

1. Create a new **public** repository on GitHub, e.g. `intro-geometry`.
2. Upload the **contents** of this folder (so `index.html` is at the top level of the repository).
3. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/intro-geometry/`. Post that link on Google Classroom.

To update the site later, commit and push with git. Students' progress is not affected.
Each script and style link in `index.html` carries a `?v=` tag made from that file's contents, so students' browsers
fetch exactly the files that changed. A git hook refreshes the tags automatically on every commit. In a fresh copy
of the repository, switch the hook on once with `git config core.hooksPath .githooks`, or run
`python tools/stamp_versions.py` yourself before committing.

## Notes

- Everything is served from the site itself — KaTeX (`vendor/katex/`, MIT) and the fonts Oswald and Noto Sans HK
  (`vendor/fonts/`, Latin subsets, SIL Open Font License) — so a visit makes **no requests to any other server**.
  Versions and checksums are in each folder's `VERSION.txt`. The school's licensed font files are **not** included.
- No school badge is used, to avoid needing College approval.
- The worksheet PDFs are not included; all questions are new, modelled on the worksheet examples.
