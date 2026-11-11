'use strict';
/* Section 5.2 Plane Figures */
(() => {
  // figures used more than once
  const B1 = [30, 170], S1 = [300, 170], P1 = HP.apex(B1, S1, 48, 47), R1 = HP.foot(P1, B1, 105);          // example 3
  const B2 = [30, 170], D2 = [300, 170], A2 = HP.apex(B2, D2, 35, 48), C2 = HP.foot(A2, B2, 80);          // practice 52-4
  const hex = HP.regular('ABCDEF', [160, 105], 85);
  const four = {
    w: 340, h: 150, noLabels: true, mono: true, arcR: 11,
    pts: { A: [20, 30], B: [80, 30], C: [80, 90], D: [20, 90], E: [130, 20], F: [165, 60], G: [130, 100], H: [95, 60], I: [185, 60], J: [215, 25], K: [215, 45], L: [255, 45], M: [255, 75], N: [215, 75], P: [215, 95], Q: [270, 35], R: [325, 35], S: [325, 85], T: [270, 85] },
    polys: ['ABCD', 'EFGH', 'IJKLMNP', 'QRST'],
    ticks: { AB: 1, BC: 1, CD: 1, DA: 1, EF: 1, FG: 1, GH: 1, HE: 1 },
    rights: ['DAB', 'ABC', 'BCD', 'CDA', 'TQR', 'QRS', 'RST', 'STQ'],
    texts: [{ at: [50, 125], t: 'I' }, { at: [130, 125], t: 'II' }, { at: [222, 125], t: 'III' }, { at: [297, 125], t: 'IV' }],
  };

  C5.sections['5.2'] = {
    id: '5.2',
    title: 'Plane Figures',
    blurb: 'Types of triangles, the angle sum of a triangle, types of polygons, and circles.',
    live: 's52-live.html',   // the step-through version shown in class
    traps: ['twonames', 'anglesumcheck', 'wrongtriangle', 'equalmarks', 'regularboth', 'concave', 'anychord'],
    learn: [
      { h: 'Types of triangles' },
      { p: 'A triangle can be classified in two ways: by the <b>lengths of its sides</b>, and by the <b>sizes of its angles</b>.' },
      {
        figs: [
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [60, 60, 60] }], polys: ['ABC'], ticks: { AB: 1, BC: 1, CA: 1 } }, cap: 'Equilateral triangle', note: 'All sides are equal.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [40, 70, 70] }], polys: ['ABC'], ticks: { AB: 1, CA: 1 } }, cap: 'Isosceles triangle', note: 'Two sides are equal.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [75, 62, 43] }], polys: ['ABC'] }, cap: 'Scalene triangle', note: 'All sides are unequal.' },
        ],
      },
      {
        figs: [
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [70, 62, 48] }], polys: ['ABC'], arcs: { CAB: 1, ABC: 1, BCA: 1 }, arcR: 12 }, cap: 'Acute-angled triangle', note: 'All angles are acute.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [35, 90, 55] }], polys: ['ABC'], rights: ['ABC'] }, cap: 'Right-angled triangle', note: 'One angle is a right angle.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, make: [{ tri: 'ABC', ang: [30, 115, 35] }], polys: ['ABC'], arcs: { ABC: 1 }, arcR: 12 }, cap: 'Obtuse-angled triangle', note: 'One angle is obtuse.' },
        ],
      },
      { tip: 'Every triangle has <b>two</b> names, one from each way. For example, a set square with angles $45^\\circ$, $45^\\circ$ and $90^\\circ$ is an <b>isosceles right-angled</b> triangle.', title: 'Two names' },
      { h: 'Angle sum of a triangle' },
      {
        title: 'The key fact',
        key: 'The sum of all the interior angles of a triangle is $180^\\circ$.<br>In $\\triangle ABC$, &nbsp; $\\angle BAC + \\angle ABC + \\angle ACB = 180^\\circ$. &nbsp;&nbsp; Reason: <b>∠ sum of △</b>',
        fig: { w: 260, h: 150, make: [{ tri: 'ABC', ang: [72, 63, 45] }], polys: ['ABC'], arcs: { CAB: 1, ABC: 2, BCA: 3 }, arcR: 18 },
      },
      { demo: 'anglesum' },
      {
        title: 'How to write it',
        key: 'Say which triangle you are using, write the equation with the reason, then solve:<br>In $\\triangle ABC$,<br>$\\angle BAC + \\angle ABC + \\angle ACB = 180^\\circ$ &nbsp;&nbsp; (∠ sum of △)<br>Then put in the numbers and solve.',
      },
      { tip: 'When a figure has more than one triangle, start with a triangle that has <b>only one</b> unknown angle.', title: 'Where to start' },
      { h: 'Polygons' },
      { p: 'A <b>polygon</b> is a closed plane figure with three or more straight sides. A line segment joining two vertices that are <b>not</b> next to each other is a <b>diagonal</b>.' },
      {
        table: {
          head: ['Number of sides', '3', '4', '5', '6', '7', '8'],
          rows: [['Name', 'triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon']],
        },
      },
      {
        figs: [
          { fig: { w: 150, h: 120, noLabels: true, mono: true, pts: { A: [40, 30], B: [105, 20], C: [130, 70], D: [85, 105], E: [25, 80] }, polys: ['ABCDE'] }, cap: 'Convex polygon', note: 'All interior angles are less than 180°.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, pts: { A: [75, 15], B: [130, 105], C: [75, 70], D: [20, 105] }, polys: ['ABCD'], reflex: ['BCD'], arcs: { BCD: 1 }, arcR: 10 }, cap: 'Concave polygon', note: 'At least one interior angle is greater than 180°.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, pts: { A: [75, 20], B: [135, 60], C: [75, 100], D: [15, 60] }, polys: ['ABCD'], ticks: { AB: 1, BC: 1, CD: 1, DA: 1 } }, cap: 'Equilateral polygon', note: 'All sides are equal.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, pts: { A: [20, 30], B: [130, 30], C: [130, 90], D: [20, 90] }, polys: ['ABCD'], rights: ['DAB', 'ABC', 'BCD', 'CDA'] }, cap: 'Equiangular polygon', note: 'All interior angles are equal.' },
          { fig: { w: 150, h: 120, noLabels: true, mono: true, arcR: 10, pts: HP.regular('ABCDE', [75, 64], 48), polys: ['ABCDE'], ticks: { AB: 1, BC: 1, CD: 1, DE: 1, EA: 1 }, arcs: { EAB: 1, ABC: 1, BCD: 1, CDE: 1, DEA: 1 } }, cap: 'Regular polygon', note: 'All sides are equal <b>and</b> all interior angles are equal.' },
        ],
      },
      { tip: 'A regular polygon needs <b>both</b>: equal sides and equal angles. A rhombus has equal sides only; a rectangle has equal angles only. Neither is regular.', title: 'Regular means both' },
      { h: 'Circles' },
      { p: 'A circle is a plane figure too, but it is <b>not</b> a polygon: it has no straight sides.' },
      {
        title: 'Centre, radius, diameter and circumference',
        key: 'Every point on a circle is the same distance from its <b>centre</b>.<ul><li>A <b>radius</b> is a line segment from the centre to the circle.</li><li>A <b>diameter</b> is a line segment joining two points on the circle and passing through the centre. &nbsp; diameter $= 2 \\times$ radius</li><li>The <b>circumference</b> is the curve that forms the circle. The word also means the length of that curve: the distance once round the circle.</li></ul>',
      },
      { demo: 'circle' },
      { tip: 'A line segment joining two points on a circle is a diameter <b>only if it passes through the centre</b>. All diameters of one circle have the same length, and so do all its radii.', title: 'Not every line across a circle is a diameter' },
      { cta: { href: '#/game', label: 'Play the Sorting Game', text: 'Sort triangles and polygons against the clock.' } },
    ],
    examples: [
      {
        level: 1,
        q: 'Find $\\angle ABC$ in the figure.',
        fig: { w: 300, h: 180, make: [{ tri: 'ABC', ang: [74, 58, 48] }], polys: ['ABC'], at: { CAB: '74°', BCA: '48°' } },
        steps: [
          { t: 'In $\\triangle ABC$,' },
          { s: '∠BAC + ∠ABC + ∠ACB = 180°', r: '∠ sum of △', hl: [['CAB', 1], ['ABC', 2], ['BCA', 3]] },
          { s: '74° + ∠ABC + 48° = 180°' },
          { s: '∠ABC = 180° − 74° − 48°' },
          { s: '= \\underline{\\underline{58°}}' },
        ],
      },
      {
        level: 1,
        q: 'Find $x$ in the figure.',
        fig: { w: 300, h: 160, make: [{ tri: 'PRQ', ang: [38, 104, 38] }], polys: ['PQR'], at: { RPQ: 'x', PQR: 'x', QRP: '104°' } },
        steps: [
          { t: 'In $\\triangle PQR$,' },
          { s: 'x + x + 104° = 180°', r: '∠ sum of △' },
          { s: '2x = 76°' },
          { s: 'x = \\underline{\\underline{38°}}' },
        ],
      },
      {
        level: 2,
        q: 'In the figure, $QRS$ is a straight line. Find $x$ and $y$.',
        fig: { w: 340, h: 200, fit: true, pts: { Q: B1, S: S1, P: P1, R: R1 }, polys: ['PQS'], lines: ['PR'], at: { PQR: '48°', PRQ: '105°', QPR: 'x', RPS: '58°', PSR: 'y' } },
        tip: 'Start with the triangle that has only one unknown angle: $\\triangle PQR$ has only $x$.',
        steps: [
          { t: 'In $\\triangle PQR$,' },
          { s: '∠QPR + ∠PQR + ∠PRQ = 180°', r: '∠ sum of △', hl: [['QPR', 1], ['PQR', 1], ['PRQ', 1]] },
          { s: 'x + 48° + 105° = 180°' },
          { s: 'x = 180° − 48° − 105°' },
          { s: '= \\underline{\\underline{27°}}' },
          { t: 'In $\\triangle PQS$,' },
          { s: '∠QPS + ∠PQS + ∠PSQ = 180°', r: '∠ sum of △', hl: [['QPS', 2], ['PQS', 2], ['PSQ', 2]] },
          { s: '(x + 58°) + 48° + y = 180°' },
          { s: '27° + 58° + 48° + y = 180°' },
          { s: 'y = 180° − 27° − 58° − 48°' },
          { s: '= \\underline{\\underline{47°}}' },
        ],
      },
      {
        level: 2,
        q: 'In $\\triangle ABC$, the three angles are $2x$, $x + 15^\\circ$ and $45^\\circ$.<br>(a) Find $x$.<br>(b) Classify $\\triangle ABC$ according to the sizes of its angles.',
        fig: { w: 300, h: 180, make: [{ tri: 'ABC', ang: [80, 55, 45] }], polys: ['ABC'], at: { CAB: '2x', ABC: 'x + 15°', BCA: '45°' } },
        steps: [
          { t: '(a) In $\\triangle ABC$,' },
          { s: '2x + (x + 15°) + 45° = 180°', r: '∠ sum of △' },
          { s: '3x + 60° = 180°' },
          { s: '3x = 120°' },
          { s: 'x = \\underline{\\underline{40°}}' },
          { t: '(b)' },
          { s: '∠BAC = 2 \\times 40° = 80°' },
          { s: '∠ABC = 40° + 15° = 55°' },
          { t: 'All three angles ($80^\\circ$, $55^\\circ$, $45^\\circ$) are acute.' },
          { t: '$\\therefore\\ \\triangle ABC$ is an <b>acute-angled triangle</b>.' },
        ],
      },
      {
        level: 2,
        title: 'Example 5 — a quadrilateral cut into two triangles',
        q: 'The figure shows a quadrilateral $ABCD$ with $\\angle BAD = 110^\\circ$ and $\\angle BCD = 70^\\circ$. Find $\\angle ABC + \\angle ADC$.',
        fig: { w: 320, h: 200, pts: { A: [110, 30], B: [35, 120], C: [200, 180], D: [285, 75] }, polys: ['ABCD'], lines: ['BD'], at: { BAD: '110°', BCD: '70°' } },
        tip: 'The diagonal $BD$ cuts the quadrilateral into two triangles. Each triangle has an angle sum of $180^\\circ$.',
        steps: [
          { t: 'In $\\triangle ABD$,' },
          { s: '∠ABD + ∠ADB + ∠BAD = 180°', r: '∠ sum of △', hl: [['ABD', 1], ['ADB', 1], ['BAD', 1]] },
          { t: 'In $\\triangle BCD$,' },
          { s: '∠CBD + ∠CDB + ∠BCD = 180°', r: '∠ sum of △', hl: [['CBD', 2], ['CDB', 2], ['BCD', 2]] },
          { t: 'Add the two equations. In quadrilateral $ABCD$,' },
          { s: '(∠ABD + ∠CBD) + (∠ADB + ∠CDB) + ∠BAD + ∠BCD = 180° + 180°' },
          { s: '∠ABC + ∠ADC + 110° + 70° = 360°' },
          { s: '∠ABC + ∠ADC = \\underline{\\underline{180°}}' },
        ],
        after: 'The four interior angles of any quadrilateral add up to $360^\\circ$, because it can always be cut into two triangles.',
      },
      {
        level: 1,
        q: 'Consider polygons I to IV. Which of them is/are<br>(a) convex? &nbsp; (b) equilateral? &nbsp; (c) equiangular? &nbsp; (d) regular?',
        fig: four,
        steps: [
          { t: '(a) I, II and IV are convex. (III has interior angles greater than $180^\\circ$, so it is concave.)' },
          { t: '(b) I and II are equilateral: all their sides carry the same mark.' },
          { t: '(c) I and IV are equiangular: all their angles are right angles.' },
          { t: '(d) Only I is regular: it is equilateral <b>and</b> equiangular.' },
        ],
      },
    ],
    practice: [
      {
        id: '52-1', level: 1, type: 'mcq',
        q: 'Which of the following sets of angles can be the three interior angles of a triangle?',
        options: ['$50^\\circ$, $60^\\circ$, $80^\\circ$', '$38^\\circ$, $52^\\circ$, $90^\\circ$', '$100^\\circ$, $50^\\circ$, $40^\\circ$', '$90^\\circ$, $90^\\circ$, $0^\\circ$'],
        ans: 1,
        why: { 0: '50° + 60° + 80° = 190°, not 180°.', 2: '100° + 50° + 40° = 190°, not 180°.', 3: 'The sum is 180°, but an angle of a triangle cannot be 0°.' },
        trap: 'anglesumcheck',
        sol: ['$38^\\circ + 52^\\circ + 90^\\circ = 180^\\circ$, and every angle is greater than $0^\\circ$. The answer is <b>B</b>.'],
      },
      {
        id: '52-2', level: 1,
        q: 'Find $x$ in the figure.',
        fig: { w: 300, h: 180, make: [{ tri: 'DEF', ang: [72, 67, 41] }], polys: ['DEF'], at: { FDE: 'x', DEF: '67°', EFD: '41°' } },
        rows: [{ t: 'In $\\triangle DEF$,' }, { s: 'x + 67° + 41° = [[num:180]]°', r: '[[reason:∠ sum of △]]' }, { s: 'x = [[num:72]]°' }],
        wrongs: [{ tok: 2, val: 108, hint: 'You added the two angles. Now take the sum away from 180°.' }],
        hints: ['The three angles of a triangle add up to 180°.', 'x = 180° − 67° − 41°.'],
        sol: [{ t: 'In $\\triangle DEF$,' }, { s: 'x + 67° + 41° = 180°', r: '∠ sum of △' }, { s: 'x = 180° − 67° − 41°' }, { s: '= \\underline{\\underline{72°}}' }],
      },
      { id: '52-r', gen: 's52rand' },
      {
        id: '52-3', level: 1,
        q: 'Find $y$ in the figure.',
        fig: { w: 300, h: 150, make: [{ tri: 'LNM', ang: [28, 124, 28] }], polys: ['LMN'], at: { NLM: 'y', LMN: 'y', MNL: '124°' } },
        lines: ['$y = $ [[num:28]]°'],
        wrongs: [{ tok: 0, val: 56, hint: '56° is the sum of the two unknown angles: y + y = 56°. So y = ?' }],
        hints: ['Two of the angles are both y. Write y + y + 124° = 180°.', '2y = 56°.'],
        sol: [{ t: 'In $\\triangle LMN$,' }, { s: 'y + y + 124° = 180°', r: '∠ sum of △' }, { s: '2y = 56°' }, { s: 'y = \\underline{\\underline{28°}}' }],
      },
      {
        id: '52-4', level: 2,
        q: 'In the figure, $BCD$ is a straight line. Find $x$ and $y$.',
        fig: { w: 340, h: 200, fit: true, pts: { B: B2, D: D2, A: A2, C: C2 }, polys: ['ABD'], lines: ['AC'], at: { ABC: '35°', ACB: '80°', BAC: 'x', CAD: 'y', ADC: '48°' } },
        lines: ['$x = $ [[num:65]]°', '$y = $ [[num:32]]°'],
        wrongs: [{ tok: 1, val: 52, hint: '80° is ∠ACB, which is in △ABC, not in △ACD. Use the big triangle ABD: its angle at A is x + y.', trap: 'wrongtriangle' }, { tok: 1, val: 97, hint: 'The angle of △ABD at A is x + y, and you already know x.' }],
        hints: ['Start with △ABC: it has only one unknown angle.', 'Then use △ABD: 35° + (x + y) + 48° = 180°.'],
        sol: [
          { t: 'In $\\triangle ABC$,' }, { s: 'x + 35° + 80° = 180°', r: '∠ sum of △' }, { s: 'x = \\underline{\\underline{65°}}' },
          { t: 'In $\\triangle ABD$,' }, { s: '(x + y) + 35° + 48° = 180°', r: '∠ sum of △' }, { s: '65° + y + 35° + 48° = 180°' }, { s: 'y = \\underline{\\underline{32°}}' },
        ],
      },
      {
        id: '52-5', level: 2,
        q: 'The three angles of $\\triangle PQR$ are $3x$, $2x$ and $x + 30^\\circ$.',
        fig: { w: 300, h: 180, make: [{ tri: 'PQR', ang: [75, 50, 55] }], polys: ['PQR'], at: { RPQ: '3x', PQR: '2x', QRP: 'x + 30°' } },
        lines: ['(a) $x = $ [[num:25]]°', '(b) The largest angle of the triangle is [[num:75]]°.', '(c) $\\triangle PQR$ is [[choice:an acute-angled*|a right-angled|an obtuse-angled]] triangle.'],
        wrongs: [{ tok: 0, val: 30, hint: 'Do not forget the 30°: 3x + 2x + x + 30° = 180°, so 6x = 150°.' }, { tok: 1, val: 25, hint: '25° is x. The angles are 3x, 2x and x + 30°.' }],
        hints: ['3x + 2x + (x + 30°) = 180°.', '6x = 150°, so x = 25°. The angles are 75°, 50° and 55°.'],
        sol: [{ t: 'In $\\triangle PQR$,' }, { s: '3x + 2x + (x + 30°) = 180°', r: '∠ sum of △' }, { s: '6x = 150°' }, { s: 'x = \\underline{\\underline{25°}}' }, { t: 'The angles are $75^\\circ$, $50^\\circ$ and $55^\\circ$. All are acute, so $\\triangle PQR$ is an acute-angled triangle.' }],
      },
      {
        id: '52-6', level: 1,
        q: 'Two angles of a triangle are $28^\\circ$ and $34^\\circ$.',
        lines: ['The third angle is [[num:118]]°.', 'The triangle is [[choice:an acute-angled|a right-angled|an obtuse-angled*]] triangle.'],
        wrongs: [{ tok: 0, val: 62, hint: '62° is the sum of the two given angles. Take it away from 180°.' }],
        hints: ['Find the third angle first.', 'One obtuse angle is enough to make the triangle obtuse-angled.'],
        trap: 'twonames',
        sol: [{ s: '180° − 28° − 34° = 118°', r: '∠ sum of △' }, { t: '$118^\\circ$ is obtuse, so the triangle is obtuse-angled — even though its other two angles are acute.' }],
      },
      {
        id: '52-7', level: 1, type: 'mcq',
        q: 'Which of the following statements <b>must</b> be correct?',
        options: ['A triangle can have two right angles.', 'An obtuse-angled triangle has exactly one obtuse angle.', 'An equiangular polygon is a regular polygon.', 'A scalene triangle cannot be a right-angled triangle.'],
        ans: 1,
        why: { 0: 'Two right angles already make 180°, leaving 0° for the third angle.', 2: 'A rectangle is equiangular, but its sides are not all equal.', 3: 'A triangle with sides 3 cm, 4 cm and 5 cm is scalene and right-angled.' },
        whyTrap: { 2: 'regularboth' },
        sol: ['Two obtuse angles would add up to more than $180^\\circ$, so there is exactly one. The answer is <b>B</b>.'],
      },
      {
        id: '52-8', level: 1,
        q: 'Consider polygons I to IV.',
        fig: four,
        parts: [
          { type: 'pick', label: '(a) Choose all the <b>convex</b> polygons.', options: ['I', 'II', 'III', 'IV'], ans: [0, 1, 3], why: { 2: 'III has two interior angles greater than 180° (at the back of the arrow head), so it is concave.' }, pickTrap: 'concave' },
          { type: 'pick', label: '(b) Choose all the <b>equilateral</b> polygons.', options: ['I', 'II', 'III', 'IV'], ans: [0, 1], why: { 3: 'IV has four right angles, so it is equiangular. Its sides are not all equal.', 2: 'The sides of III are not marked equal.' }, pickTrap: 'equalmarks' },
          { type: 'pick', label: '(c) Choose all the <b>regular</b> polygons.', options: ['I', 'II', 'III', 'IV'], ans: [0], why: { 1: 'II has equal sides, but its angles are not all equal.', 3: 'IV has equal angles, but its sides are not all equal.' }, pickTrap: 'regularboth' },
        ],
        hints: ['Ticks show equal sides. Small squares show right angles.', 'Regular = equal sides and equal angles together.'],
        sol: ['(a) I, II and IV: none of their interior angles is greater than $180^\\circ$.', '(b) I and II: every side carries the same mark.', '(c) I only: it is both equilateral and equiangular.'],
      },
      {
        id: '52-12', level: 1,
        q: 'In the figure, $O$ is the centre of the circle. $AOB$ is a straight line, and $C$ and $D$ are points on the circle.',
        fig: { w: 260, h: 190, fit: false, pts: { O: [130, 95], A: [60, 95], B: [200, 95], C: [165, 34.4], D: [173.1, 150.2] }, circles: [{ c: 'O', r: 70 }], lines: ['AB', 'OC', 'CD'], dots: 'O', lab: { O: [-4, 14], A: [-12, 0], B: [12, 0], C: [8, -11], D: [9, 11] } },
        parts: [
          { type: 'pick', label: '(a) Choose all the radii.', options: ['$OA$', '$OC$', '$AB$', '$CD$'], ans: [0, 1], why: { 2: 'AB joins two points on the circle through the centre: it is a diameter, made of two radii.', 3: 'CD does not start from the centre.' }, miss: { 0: 'OA also joins the centre to a point on the circle.' } },
          { type: 'mcq', label: '(b) Which line segment is a diameter?', options: ['$OC$', '$CD$', '$AB$'], ans: 2, why: { 1: 'CD joins two points on the circle, but it does not pass through the centre O.' }, whyTrap: { 1: 'anychord' } },
          { label: '(c) If $OC = 4$ cm, then', lines: ['$OA = $ [[num:4]] cm and $AB = $ [[num:8]] cm.'], wrongs: [{ tok: 1, val: 4, hint: 'AB is a diameter: AB = AO + OB.', trap: 'radiusdiameter' }] },
        ],
        hints: ['A radius joins the centre to a point on the circle.', 'A diameter joins two points on the circle and passes through the centre. Its length is twice the radius.'],
        sol: ['(a) $OA$ and $OC$ join the centre to the circle, so they are radii. ($OB$ is a radius too.)', '(b) $AB$ passes through the centre $O$, so it is a diameter. $CD$ does not.', '(c) All radii are equal, so $OA = OC = 4$ cm, and $AB = 2 \\times 4 = 8$ cm.'],
      },
      {
        id: '52-9', level: 2,
        q: 'How many diagonals does each polygon have?',
        fig: { w: 300, h: 185, pts: HP.regular('ABCDE', [150, 95], 70), polys: ['ABCDE'], lines: ['AC', 'AD'], dashed: ['AC', 'AD'] },
        lines: ['(a) a quadrilateral: [[num:2]]', '(b) a pentagon: [[num:5]]', '(c) a hexagon: [[num:9]]'],
        wrongs: [{ tok: 1, val: 2, hint: 'The figure shows only the diagonals from A. Draw the diagonals from the other vertices too.' }, { tok: 1, val: 10, hint: 'Each diagonal has two ends, so you counted every one twice.' }, { tok: 2, val: 18, hint: 'Each diagonal has two ends, so you counted every one twice.' }, { tok: 2, val: 6, hint: 'From each vertex of a hexagon you can draw 3 diagonals.' }],
        hints: ['A diagonal joins two vertices that are not next to each other. The figure shows the two diagonals from A in a pentagon.', 'Pentagon: 2 from each of 5 vertices gives 10, but each diagonal is counted twice. Hexagon: 3 from each of 6 vertices.'],
        sol: ['(a) Quadrilateral: $4 \\times 1 \\div 2 = 2$.', '(b) Pentagon: $5 \\times 2 \\div 2 = 5$.', '(c) Hexagon: $6 \\times 3 \\div 2 = 9$.'],
      },
      {
        id: '52-10', level: 2,
        q: 'In the figure, $QSR$ is a straight line and $\\angle PSR = 90^\\circ$.',
        fig: { w: 320, h: 150, pts: { Q: [40, 125], S: [130, 125], R: [290, 125], P: [130, 45] }, polys: ['PQR'], lines: ['PS'], rights: ['PSR'], lab: { S: [-8, 14] } },
        parts: [
          { label: '(a) How many triangles are there in the figure?', lines: ['[[num:3]]'], wrongs: [{ tok: 0, val: 2, hint: 'Do not forget the big triangle PQR.' }] },
          { type: 'pick', label: '(b) Choose all the right-angled triangles.', options: ['$\\triangle PQS$', '$\\triangle PSR$', '$\\triangle PQR$'], ans: [0, 1], why: { 2: 'The angle of △PQR at P is made of two parts and is greater than 90°.' }, miss: { 0: 'QSR is a straight line, so ∠PSQ = 180° − 90° = 90° as well.' } },
          { type: 'mcq', label: '(c) Which type of triangle is $\\triangle PQR$?', options: ['acute-angled', 'right-angled', 'obtuse-angled'], ans: 2, why: { 1: 'The right angles are at S, and S is not a vertex of △PQR.' } },
        ],
        hints: ['Count the small triangles, then the big one.', '∠PSQ and ∠PSR make a straight line, so both are 90°.'],
        sol: ['(a) $\\triangle PQS$, $\\triangle PSR$ and $\\triangle PQR$: 3 triangles.', '(b) $\\angle PSQ = 180^\\circ - 90^\\circ = 90^\\circ$, so $\\triangle PQS$ and $\\triangle PSR$ are both right-angled.', '(c) $\\angle QPR$ is obtuse, so $\\triangle PQR$ is obtuse-angled.'],
      },
      {
        id: '52-11', level: 3,
        q: 'In the figure, $ABCDEF$ is a regular hexagon. Each interior angle of a regular hexagon is $120^\\circ$. Find $x$ and $y$.',
        fig: { w: 320, h: 210, pts: hex, polys: ['ABCDEF'], lines: ['AC'], at: { ABC: '120°', BAC: 'x', BCA: 'x', CAF: 'y' } },
        lines: ['$x = $ [[num:30]]°', '$y = $ [[num:90]]°'],
        wrongs: [{ tok: 0, val: 60, hint: '60° is x + x. So x = ?' }, { tok: 1, val: 120, hint: '120° is the whole angle at A. It is made of x and y.' }],
        hints: ['In △ABC: x + x + 120° = 180°.', 'The interior angle at A is 120°, and it is made of x and y.'],
        sol: [{ t: 'In $\\triangle ABC$,' }, { s: 'x + x + 120° = 180°', r: '∠ sum of △' }, { s: 'x = \\underline{\\underline{30°}}' }, { t: 'The interior angle at $A$ is $\\angle BAF = 120^\\circ$.' }, { s: 'x + y = 120°' }, { s: 'y = 120° − 30°' }, { s: '= \\underline{\\underline{90°}}' }],
      },
    ],
  };

  /* Randomised angle-sum question for 5.2 */
  C5.gens.s52rand = () => {
    let a;
    do { a = G.randAngles(35, 105, 8); } while (a[2] < 40);
    const t = U.letters(3).join('');
    const at = {};
    at[t[2] + t[0] + t[1]] = a[0] + '°';
    at[t[0] + t[1] + t[2]] = a[1] + '°';
    at[t[1] + t[2] + t[0]] = 'x';
    return {
      level: 1,
      q: 'Find $x$ in the figure.',
      fig: { w: 300, h: 190, make: [{ tri: t, ang: a, rot: U.pick([0, 0, 180]) }], polys: [t], at },
      lines: ['$x = $ [[num:' + a[2] + ']]°'],
      wrongs: [{ tok: 0, val: a[0] + a[1], hint: 'That is the sum of the two given angles. Take it away from 180°.' }, { tok: 0, val: 360 - a[0] - a[1], hint: 'The angle sum of a triangle is 180°, not 360°.' }],
      hints: ['The three angles of a triangle add up to 180°.', `x = 180° − ${a[0]}° − ${a[1]}°.`],
      sol: [{ t: `In $\\triangle ${t}$,` }, { s: `x + ${a[0]}° + ${a[1]}° = 180°`, r: '∠ sum of △' }, { s: `x = 180° − ${a[0]}° − ${a[1]}°` }, { s: `= \\underline{\\underline{${a[2]}°}}` }],
    };
  };
})();
