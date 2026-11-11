'use strict';
/* Section 5.1 Basic Concepts in Geometry */
C5.sections['5.1'] = {
  id: '5.1',
  title: 'Basic Concepts in Geometry',
  blurb: 'Line segments, naming angles, the six types of angles, complementary and supplementary angles, parallel and perpendicular lines.',
  live: 's51-live.html',   // the step-through version shown in class (live/ holds its engine)
  traps: ['fullname', 'vertexmiddle', 'whichbase', 'compsupp', 'lookstraight', 'parperp'],
  learn: [
    {
      title: 'Points, lines and line segments',
      key: 'A <b>line segment</b> is a part of a line. It has two <b>end points</b> and a fixed length.<br>The line segment with end points $P$ and $Q$ is called $PQ$ (or $QP$). If it is 4 cm long, we simply write $PQ = 4$ cm.',
      fig: { w: 300, h: 80, pts: { P: [50, 50], Q: [250, 36] }, lines: ['PQ'], dots: 'PQ', st: { PQ: '4 cm' }, stPos: { PQ: [0, -13] }, lab: { P: [-4, 15], Q: [4, 15] } },
    },
    {
      title: 'Naming an angle',
      key: 'An angle is formed by two arms that meet at a <b>vertex</b>. The angle in the figure can be named in four ways:<ul><li>$\\angle ABC$ or $\\angle CBA$ — three letters, with the <b>vertex in the middle</b>;</li><li>$\\angle B$ — the vertex only;</li><li>$b$ — the small letter written inside the angle.</li></ul>',
      fig: { w: 260, h: 150, pts: { A: [190, 25], B: [50, 125], C: [225, 125] }, lines: ['AB', 'BC'], at: { ABC: 'b' } },
    },
    {
      tip: 'When two or more angles meet at the same vertex, "$\\angle B$" could mean any of them. In the figure, $\\angle B$ is unclear: is it $\\angle ABD$, $\\angle DBC$ or $\\angle ABC$?<br>The three-letter name <b>always</b> works. On this site, and in your written work, use the full name: $\\angle ABC$.',
      title: 'Good habit: full angle names',
    },
    { fig: { w: 260, h: 150, pts: { A: [110, 20], B: [45, 125], C: [225, 125], D: [205, 45] }, lines: ['AB', 'BC', 'BD'], arcs: { ABD: 1, DBC: 2 }, arcR: 24 }, cap: 'Three angles share the vertex $B$: $\\angle ABD$ (blue), $\\angle DBC$ (red) and the whole angle $\\angle ABC$.' },
    { h: 'Types of angles' },
    { p: 'Angles are sorted into six types by their size.' },
    { anglerow: [[50, 'Acute angle', 'between 0° and 90°'], [90, 'Right angle', '90°'], [130, 'Obtuse angle', 'between 90° and 180°'], [180, 'Straight angle', '180°'], [250, 'Reflex angle', 'between 180° and 360°', 20], [360, 'Round angle', '360°']] },
    { demo: 'dial' },
    {
      title: 'Right angles, straight angles and round angles as units',
      key: '1 right angle $= 90^\\circ$ &nbsp;&nbsp; 1 straight angle $= 180^\\circ$ &nbsp;&nbsp; 1 round angle $= 360^\\circ$<br>So $\\dfrac{2}{3}$ straight angle $= \\dfrac{2}{3} \\times 180^\\circ = 120^\\circ$.',
    },
    {
      title: 'Complementary and supplementary angles',
      key: 'If the sum of two angles is $90^\\circ$, they are <b>complementary angles</b>.<br>If the sum of two angles is $180^\\circ$, they are <b>supplementary angles</b>.<br>For example, $35^\\circ$ and $55^\\circ$ are complementary; $35^\\circ$ and $145^\\circ$ are supplementary.',
    },
    { tip: 'The two angles do <b>not</b> need to be next to each other. Only their sum matters.', title: 'Remember' },
    { h: 'Parallel lines and perpendicular lines' },
    {
      figs: [
        { fig: { w: 220, h: 130, pts: { A: [25, 95], B: [165, 30], C: [60, 115], D: [200, 50] }, lines: ['AB', 'CD'], arrows: { AB: 1, CD: 1 } }, cap: '$AB \\parallel CD$', note: 'Parallel lines never meet. Mark them with the same arrows.' },
        { fig: { w: 220, h: 130, pts: { A: [107.2, 25], B: [120, 85], C: [20, 106.4], D: [200, 67.9] }, lines: ['AB', 'CD'], rights: ['ABD'], lab: { B: [-6, 16] } }, cap: '$AB \\perp CD$', note: 'Perpendicular lines meet at a right angle. $B$ is the foot of the perpendicular.' },
      ],
    },
    { cta: { href: '#/game', label: 'Play the Sorting Game', text: 'Name the type of each angle as fast as you can.' } },
  ],
  examples: [
    {
      level: 1,
      q: 'Express the following angles in degrees.<br>(a) $\\dfrac{3}{4}$ straight angle &nbsp;&nbsp; (b) $\\dfrac{5}{8}$ round angle',
      steps: [
        { t: '(a)' },
        { s: '\\dfrac{3}{4} \\text{ straight angle} = \\dfrac{3}{4} \\times 180°' },
        { s: '= \\underline{\\underline{135°}}' },
        { t: '(b)' },
        { s: '\\dfrac{5}{8} \\text{ round angle} = \\dfrac{5}{8} \\times 360°' },
        { s: '= \\underline{\\underline{225°}}' },
      ],
    },
    {
      level: 1,
      q: 'Arrange the following angles in ascending order of size using the symbol "&lt;".<br>$1\\dfrac{1}{2}$ right angles, &nbsp; $\\dfrac{2}{3}$ straight angle, &nbsp; $\\dfrac{3}{10}$ round angle',
      tip: 'Change every angle into degrees first. Then compare.',
      steps: [
        { s: '1\\dfrac{1}{2} \\text{ right angles} = \\dfrac{3}{2} \\times 90° = 135°' },
        { s: '\\dfrac{2}{3} \\text{ straight angle} = \\dfrac{2}{3} \\times 180° = 120°' },
        { s: '\\dfrac{3}{10} \\text{ round angle} = \\dfrac{3}{10} \\times 360° = 108°' },
        { t: '$\\because\\ 108^\\circ < 120^\\circ < 135^\\circ$' },
        { t: '$\\therefore\\ \\dfrac{3}{10}$ round angle $< \\dfrac{2}{3}$ straight angle $< 1\\dfrac{1}{2}$ right angles' },
      ],
    },
    {
      level: 1,
      q: 'Refer to the figure.<br>(a) Name a pair of complementary angles.<br>(b) If $\\angle AOD$ and $\\angle COD$ are supplementary angles, find $\\angle COD$.',
      fig: { w: 320, h: 230, pts: HP.rays([160, 112], 100, { A: 10, B: 66, E: -24, D: -70, C: 190 }), lines: ['OA', 'OB', 'OC', 'OD', 'OE'], at: { AOB: '56°', AOE: '34°', EOD: '46°' } },
      steps: [
        { t: '(a)' },
        { s: '∠AOB + ∠AOE = 56° + 34°', hl: [['AOB', 1], ['AOE', 2]] },
        { s: '= 90°' },
        { t: '$\\therefore\\ \\angle AOB$ and $\\angle AOE$ are complementary angles.' },
        { t: '(b)' },
        { s: '∠AOD + ∠COD = 180°', hl: [['AOE', 'EOD', 1], ['COD', 2]] },
        { s: '(34° + 46°) + ∠COD = 180°' },
        { s: '∠COD = 180° − 34° − 46°' },
        { s: '= \\underline{\\underline{100°}}' },
      ],
    },
    {
      level: 2,
      q: 'In the figure, $\\angle AOB = 28^\\circ$, $\\angle BOC = 117^\\circ$ and $\\angle COD = 36^\\circ$.<br>(a) Which type of angle is each of $\\angle AOB$, $\\angle BOC$ and $\\angle COD$?<br>(b) Is $\\angle AOD$ a straight angle? Explain your answer.',
      fig: { w: 320, h: 150, pts: HP.rays([160, 40], 110, { A: 180, B: 208, C: 325, D: 1 }), lines: ['OA', 'OB', 'OC', 'OD'], at: { AOB: '28°', BOC: '117°', COD: '36°' }, lab: { O: [0, -13] } },
      tip: 'A picture can <b>look</b> straight when it is not. Add up the angles to check.',
      steps: [
        { t: '(a) $\\angle AOB$ is an acute angle. $\\angle BOC$ is an obtuse angle. $\\angle COD$ is an acute angle.' },
        { t: '(b)' },
        { s: '∠AOD = ∠AOB + ∠BOC + ∠COD', hl: [['AOB', 1], ['BOC', 2], ['COD', 3]] },
        { s: '= 28° + 117° + 36°' },
        { s: '= 181°' },
        { s: '\\neq 180°' },
        { t: '$\\therefore\\ \\angle AOD$ is <b>not</b> a straight angle.' },
      ],
    },
  ],
  practice: [
    {
      id: '51-1', level: 1,
      q: 'In the figure, $ADC$ is a straight line. Use the symbol "∠" and letters to name the marked angles.',
      fig: { w: 320, h: 190, pts: { A: [40, 160], C: [285, 160], B: [125, 35], D: [185, 160] }, polys: ['ABC'], lines: ['BD'], at: { BAD: 'a', ABD: 'x', BDC: 'y' } },
      lines: ['$a = $ [[aname:BAC|BAD]]', '$x = $ [[angle:ABD]]', '$y = $ [[angle:BDC]]'],
      hints: ['Put the vertex in the middle: for x the vertex is B, and its arms go to A and D.', 'x = ∠ABD (or ∠DBA). y = ∠BDC (or ∠CDB). At A there is only one angle, so ∠A is also fine there.'],
      trap: 'fullname',
      sol: [{ t: '$a = \\angle BAC$ (also $\\angle BAD$, $\\angle CAB$ or $\\angle A$)' }, { t: '$x = \\angle ABD$ or $\\angle DBA$ &nbsp; (not $\\angle B$: three angles meet at $B$)' }, { t: '$y = \\angle BDC$ or $\\angle CDB$ &nbsp; (not $\\angle D$: two angles meet at $D$)' }],
    },
    {
      id: '51-2', level: 1, type: 'pick',
      q: 'In the figure, $QSR$ is a straight line. Choose <b>all</b> the pairs that name the <b>same</b> angle.',
      fig: { w: 320, h: 180, pts: { Q: [40, 150], R: [285, 150], P: [150, 30], S: [190, 150] }, polys: ['PQR'], lines: ['PS'] },
      options: ['$\\angle PQR$ and $\\angle PQS$', '$\\angle QPS$ and $\\angle QPR$', '$\\angle PRQ$ and $\\angle PRS$', '$\\angle PSQ$ and $\\angle PSR$'],
      ans: [0, 2],
      why: { 1: '∠QPS has arms PQ and PS. ∠QPR has arms PQ and PR. PS and PR are different lines.', 3: '∠PSQ and ∠PSR are on opposite sides of PS. They are two different angles at S.' },
      miss: { 0: 'S lies on QR, so the arm QS is the same line as the arm QR.', 2: 'S lies on RQ, so the arm RS is the same line as the arm RQ.' },
      hints: ['Two names give the same angle when they have the same vertex and the same two arms.', 'S is on the line QR, so QS and QR are the same arm from Q, and RS and RQ are the same arm from R.'],
      sol: ['$\\angle PQR = \\angle PQS$ (same vertex $Q$; $QR$ and $QS$ are the same arm).', '$\\angle PRQ = \\angle PRS$ (same vertex $R$; $RQ$ and $RS$ are the same arm).', 'The other two pairs have different arms, so they are different angles.'],
    },
    {
      id: '51-3', level: 1,
      q: 'Name the type of each marked angle in the figure.',
      fig: { w: 320, h: 190, noLabels: true, pts: { A: [40, 160], B: [40, 55], C: [120, 30], D: [160, 95], E: [245, 40], F: [262, 160] }, polys: ['ABCDEF'], rights: ['BAF'], reflex: ['CDE'], at: { BAF: 'a', ABC: 'b', CDE: 'c', DEF: 'd' } },
      lines: ['$a$ is [[choice:an acute angle|a right angle*|an obtuse angle|a reflex angle]].', '$b$ is [[choice:an acute angle|a right angle|an obtuse angle*|a reflex angle]].', '$c$ is [[choice:an acute angle|a right angle|an obtuse angle|a reflex angle*]].', '$d$ is [[choice:an acute angle*|a right angle|an obtuse angle|a reflex angle]].'],
      hints: ['Compare each angle with a right angle (a square corner) and with a straight line.', 'c is marked on the outside of the dent: it is more than a straight angle, so it is a reflex angle.'],
      sol: ['$a$: the square mark shows a right angle.', '$b$: more than a right angle but less than a straight angle, so obtuse.', '$c$: more than a straight angle, so reflex.', '$d$: less than a right angle, so acute.'],
    },
    {
      id: '51-4', level: 1,
      q: 'Express the following angles in degrees.',
      lines: ['(a) $\\dfrac{2}{5}$ straight angle $=$ [[num:72]]°', '(b) $1\\dfrac{1}{6}$ right angles $=$ [[num:105]]°', '(c) $\\dfrac{3}{8}$ round angle $=$ [[num:135]]°'],
      wrongs: [
        { tok: 0, val: 36, hint: 'A straight angle is 180°, not 90°.', trap: 'whichbase' }, { tok: 0, val: 144, hint: 'A straight angle is 180°, not 360°.', trap: 'whichbase' },
        { tok: 1, val: 210, hint: 'A right angle is 90°, not 180°.', trap: 'whichbase' }, { tok: 1, val: 15, hint: 'Do not forget the whole number: 1 1/6 = 7/6.' },
        { tok: 2, val: 67.5, hint: 'A round angle is 360°, not 180°.', trap: 'whichbase' },
      ],
      hints: ['Right angle = 90°, straight angle = 180°, round angle = 360°. Multiply the fraction by the right one.', '(b) Change the mixed number first: 1 1/6 = 7/6, then 7/6 × 90°.'],
      sol: [{ s: '\\dfrac{2}{5} \\times 180° = \\underline{\\underline{72°}}' }, { s: '1\\dfrac{1}{6} \\times 90° = \\dfrac{7}{6} \\times 90° = \\underline{\\underline{105°}}' }, { s: '\\dfrac{3}{8} \\times 360° = \\underline{\\underline{135°}}' }],
    },
    { id: '51-r', gen: 's51rand' },
    {
      id: '51-5', level: 1, type: 'mcq',
      q: 'Which of the following is a pair of complementary angles?',
      options: ['$35^\\circ$ and $45^\\circ$', '$27^\\circ$ and $63^\\circ$', '$40^\\circ$ and $140^\\circ$', '$90^\\circ$ and $90^\\circ$'],
      ans: 1,
      why: { 0: '35° + 45° = 80°, not 90°.', 2: '40° + 140° = 180°. These are supplementary angles.', 3: '90° + 90° = 180°. These are supplementary angles.' },
      whyTrap: { 2: 'compsupp', 3: 'compsupp' },
      sol: ['Complementary angles add up to $90^\\circ$: $27^\\circ + 63^\\circ = 90^\\circ$. The answer is <b>B</b>.'],
    },
    {
      id: '51-6', level: 1,
      q: 'In the figure, $\\angle BOC$ and $\\angle COD$ are complementary angles, and $\\angle AOD$ and $\\angle DOE$ are supplementary angles. Find<br>(a) $\\angle COD$, &nbsp; (b) $\\angle DOE$.',
      fig: { w: 320, h: 170, pts: HP.rays([160, 140], 115, { A: 180, B: 150, C: 98, D: 60, E: 0 }), lines: ['OA', 'OB', 'OC', 'OD', 'OE'], at: { AOB: '30°', BOC: '52°' }, lab: { O: [0, 14] } },
      lines: ['(a) $\\angle COD = $ [[num:38]]°', '(b) $\\angle DOE = $ [[num:60]]°'],
      wrongs: [{ tok: 0, val: 128, hint: 'Complementary angles add up to 90°, not 180°.', trap: 'compsupp' }, { tok: 1, val: 142, hint: '∠AOD is made of three angles: ∠AOB, ∠BOC and ∠COD. Find ∠AOD first.' }, { tok: 1, val: 98, hint: '∠AOD is made of three angles: do not leave out ∠COD.' }],
      hints: ['(a) ∠BOC + ∠COD = 90°.', '(b) ∠AOD = 30° + 52° + 38° = 120°. Then ∠AOD + ∠DOE = 180°.'],
      sol: [
        { t: '(a)' }, { s: '∠BOC + ∠COD = 90°' }, { s: '∠COD = 90° − 52°' }, { s: '= \\underline{\\underline{38°}}' },
        { t: '(b)' }, { s: '∠AOD = 30° + 52° + 38°' }, { s: '= 120°' }, { s: '∠AOD + ∠DOE = 180°' }, { s: '∠DOE = 180° − 120°' }, { s: '= \\underline{\\underline{60°}}' },
      ],
    },
    {
      id: '51-7', level: 1, type: 'mcq',
      q: 'In the figure, $AOD$ is a straight line, $\\angle AOB = 90^\\circ$ and $\\angle COD = 35^\\circ$. Which of the following is an obtuse angle?',
      fig: { w: 320, h: 160, pts: HP.rays([160, 130], 110, { A: 180, B: 90, C: 35, D: 0 }), lines: ['AOD', 'OB', 'OC'], rights: ['AOB'], at: { COD: '35°' }, lab: { O: [0, 14] } },
      options: ['$\\angle AOB$', '$\\angle BOC$', '$\\angle AOC$', '$\\angle AOD$'],
      ans: 2,
      why: { 0: '∠AOB is 90°: a right angle.', 1: '∠BOC = 90° − 35° = 55°: an acute angle.', 3: 'AOD is a straight line, so ∠AOD = 180°: a straight angle.' },
      sol: [{ s: '∠AOC = 180° − 35°' }, { s: '= 145°' }, { t: '$145^\\circ$ is between $90^\\circ$ and $180^\\circ$, so $\\angle AOC$ is an obtuse angle. The answer is <b>C</b>.' }],
    },
    {
      id: '51-8', level: 1,
      q: 'In the figure, $A$, $B$, $C$ and $D$ lie on a straight line, with $AB = BC = CD = 3$ cm.',
      fig: { w: 320, h: 80, pts: { A: [35, 45], B: [118, 45], C: [201, 45], D: [284, 45] }, lines: ['ABCD'], dots: 'ABCD', st: { AB: '3 cm', BC: '3 cm', CD: '3 cm' }, stPos: { AB: [0, -13], BC: [0, -13], CD: [0, -13] }, lab: { A: [0, 16], B: [0, 16], C: [0, 16], D: [0, 16] } },
      lines: ['(a) The line segment with the same length as $AC$ is [[side:BD]].', '(b) The longest line segment is [[side:AD]], and its length is [[num:9]] cm.', '(c) The number of line segments in the figure is [[num:6]].'],
      wrongs: [{ tok: 3, val: 3, hint: 'Count the longer ones too: AC, BD and AD are also line segments.' }, { tok: 3, val: 4, hint: 'List them by starting point: AB, AC, AD, then BC, BD, then CD.' }],
      hints: ['AC is made of two 3 cm pieces. Which other segment is made of two pieces?', 'For (c), list them in order: AB, AC, AD, BC, BD, CD.'],
      sol: ['(a) $AC = 6$ cm and $BD = 6$ cm, so the answer is $BD$.', '(b) $AD = 3 + 3 + 3 = 9$ cm.', '(c) $AB$, $AC$, $AD$, $BC$, $BD$, $CD$: 6 line segments.'],
    },
    {
      id: '51-9', level: 1,
      q: 'In the figure, $AB \\parallel DC$ and $AD \\perp DC$.',
      fig: { w: 320, h: 180, pts: { A: [60, 35], B: [200, 35], C: [280, 150], D: [60, 150] }, polys: ['ABCD'], arrows: { AB: 1, DC: 1 }, rights: ['ADC'] },
      parts: [
        { label: '(a) Complete the sentences.', lines: ['The side parallel to $AB$ is [[side:DC]].', 'The side perpendicular to $DC$ is [[side:AD]].'] },
        { type: 'mcq', label: '(b) Which of the following is correct?', options: ['$AD \\parallel BC$', '$AB \\perp DC$', '$AD \\perp AB$', '$BC \\perp DC$'], ans: 2, why: { 0: 'AD and BC would meet if you extended them upwards, so they are not parallel.', 1: 'AB and DC have the same arrows: they are parallel, not perpendicular.', 3: 'There is no right-angle mark at C, and the angle there is clearly less than 90°.' }, whyTrap: { 1: 'parperp' } },
      ],
      hints: ['Arrows mark parallel lines. A small square marks a right angle.', 'AD meets DC at 90°. Since AB has the same direction as DC, AD meets AB at 90° too.'],
      sol: ['(a) $AB \\parallel DC$ (same arrows); $AD \\perp DC$ (right-angle mark at $D$).', '(b) $AB$ has the same direction as $DC$, and $AD$ is perpendicular to $DC$, so $AD \\perp AB$. The answer is <b>C</b>.'],
    },
    {
      id: '51-10', level: 2,
      q: 'In the figure, $\\angle POQ = 47^\\circ$, $\\angle QOR = 95^\\circ$ and $\\angle ROS = 38^\\circ$. Is $POS$ a straight line?',
      fig: { w: 320, h: 160, pts: HP.rays([160, 130], 115, { P: 180, Q: 133, R: 38, S: 0 }), lines: ['OP', 'OQ', 'OR', 'OS'], at: { POQ: '47°', QOR: '95°', ROS: '38°' }, lab: { O: [0, 14] } },
      lines: ['$\\angle POS = 47^\\circ + 95^\\circ + 38^\\circ = $ [[num:180]]°', 'So $\\angle POS$ is [[choice:an obtuse angle|a straight angle*|a reflex angle]], and $POS$ [[choice:is*|is not]] a straight line.'],
      hints: ['Add the three angles.', 'If the sum is exactly 180°, ∠POS is a straight angle, so POS is a straight line.'],
      trap: 'lookstraight',
      sol: [{ s: '∠POS = ∠POQ + ∠QOR + ∠ROS' }, { s: '= 47° + 95° + 38°' }, { s: '= 180°' }, { t: '$\\therefore\\ \\angle POS$ is a straight angle, and $POS$ is a straight line.' }],
    },
    {
      id: '51-11', level: 2,
      q: 'From 2:00 p.m. to 5:30 p.m. on the same day, how many degrees does the <b>hour hand</b> of a clock turn?',
      lines: ['In 1 hour the hour hand turns [[num:30]]°.', 'From 2:00 p.m. to 5:30 p.m. it turns [[num:105]]°.'],
      wrongs: [{ tok: 0, val: 360, hint: 'That is the minute hand. The hour hand needs 12 hours to go once round.' }, { tok: 0, val: 6, hint: 'That is the minute hand in one minute. The hour hand turns 360° in 12 hours.' }, { tok: 1, val: 90, hint: 'The time is 3 and a half hours, not 3 hours.' }],
      hints: ['The hour hand makes one round angle (360°) in 12 hours.', '360° ÷ 12 = 30° each hour. The time from 2:00 to 5:30 is 3.5 hours.'],
      sol: [{ s: '\\text{In 1 hour: } 360° ÷ 12 = 30°' }, { s: '\\text{In 3.5 hours: } 3.5 \\times 30° = \\underline{\\underline{105°}}' }],
    },
  ],
};

/* Randomised "express in degrees" question for 5.1 */
C5.gens.s51rand = () => {
  const bases = [['right angle', 90], ['straight angle', 180], ['round angle', 360]];
  let name, base, n, d;
  for (;;) {
    [name, base] = U.pick(bases);
    d = U.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]);
    n = U.rint(1, base === 360 ? d - 1 : 2 * d - 1);
    const g = (a, b) => (b ? g(b, a % b) : a);
    if (n % d === 0 || g(n, d) !== 1 || (base * n) % d !== 0) continue;
    break;
  }
  const w = Math.floor(n / d), r = n - w * d;
  const fr = w ? `${w}\\dfrac{${r}}{${d}}` : `\\dfrac{${n}}{${d}}`;
  const ans = base * n / d;
  const wrongs = bases.filter(b => b[1] !== base).map(b => ({ tok: 0, val: b[1] * n / d, hint: `A ${name} is ${base}°, not ${b[1]}°.`, trap: 'whichbase' }));
  if (w) wrongs.push({ tok: 0, val: base * r / d, hint: `Do not forget the whole number: change the mixed number to ${n}/${d} first.` });
  return {
    level: 1,
    q: `Express $${fr}$ ${name}${n > d ? 's' : ''} in degrees.`,
    lines: ['[[num:' + ans + ']]°'],
    wrongs,
    hints: ['Right angle = 90°, straight angle = 180°, round angle = 360°.', `Multiply: ${n}/${d} × ${base}°.`],
    sol: [{ s: `${fr} \\text{ ${name}${n > d ? 's' : ''}} = ${w ? `\\dfrac{${n}}{${d}}` : fr} \\times ${base}°` }, { s: `= \\underline{\\underline{${ans}°}}` }],
  };
};
