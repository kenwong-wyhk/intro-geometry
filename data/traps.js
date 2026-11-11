'use strict';
/* Trap Gallery. Each trap: id, title, sections, bad (the mistake), good (what to do), why, optional fig/cap.
   Question hints can link here with  trap:'<id>'. */
C5.traps = [
  /* ---------- 5.1 ---------- */
  {
    id: 'fullname', title: 'Writing ∠B when several angles meet at B', sections: ['5.1', '5.2'],
    fig: { w: 260, h: 150, pts: { A: [110, 20], B: [45, 125], C: [225, 125], D: [205, 45] }, lines: ['AB', 'BC', 'BD'], arcs: { ABD: 1, DBC: 2 }, arcR: 24 },
    bad: '"$\\angle B = 40^\\circ$" in a figure like this one.',
    good: 'Use three letters with the vertex in the middle: $\\angle ABD = 40^\\circ$.',
    why: 'Three angles share the vertex $B$ here, so $\\angle B$ could mean any of them. The full name is never unclear.',
  },
  {
    id: 'vertexmiddle', title: 'Putting the vertex in the wrong place', sections: ['5.1'],
    bad: 'The angle at $B$ with arms $BA$ and $BC$ is written as $\\angle BAC$.',
    good: 'The vertex is always the <b>middle</b> letter: $\\angle ABC$ or $\\angle CBA$.',
    why: '$\\angle BAC$ is a different angle: its vertex is $A$.',
  },
  {
    id: 'whichbase', title: 'Mixing up right, straight and round angles', sections: ['5.1'],
    bad: '$\\dfrac{2}{3}$ straight angle $= \\dfrac{2}{3} \\times 90^\\circ = 60^\\circ$',
    good: '$\\dfrac{2}{3}$ straight angle $= \\dfrac{2}{3} \\times 180^\\circ = 120^\\circ$',
    why: 'Right angle $= 90^\\circ$, straight angle $= 180^\\circ$, round angle $= 360^\\circ$. Read which one the question uses before you multiply.',
  },
  {
    id: 'compsupp', title: 'Complementary or supplementary?', sections: ['5.1'],
    bad: '"$40^\\circ$ and $140^\\circ$ are complementary angles."',
    good: 'Complementary angles add up to $90^\\circ$. Supplementary angles add up to $180^\\circ$. So $40^\\circ$ and $140^\\circ$ are <b>supplementary</b>.',
    why: 'One way to remember: <b>c</b> comes before <b>s</b> in the alphabet, and $90$ comes before $180$.',
  },
  {
    id: 'lookstraight', title: '"It looks like a straight line"', sections: ['5.1'],
    bad: '"$AOD$ looks straight in the figure, so $\\angle AOD = 180^\\circ$."',
    good: 'Use only what is given. Add up the angles: if the sum is $180^\\circ$, then $AOD$ is a straight line. If the question says "$AOD$ is a straight line", you may use $180^\\circ$.',
    why: 'Figures are not always drawn accurately. An angle of $179^\\circ$ looks straight but is not.',
  },
  {
    id: 'parperp', title: 'Mixing up // and ⊥', sections: ['5.1', '5.3'],
    bad: 'Writing $AB \\perp CD$ for two lines marked with the same arrows.',
    good: 'Same arrows mean parallel: $AB \\parallel CD$. A small square where the lines meet means perpendicular: $AB \\perp CD$.',
    why: 'Parallel lines never meet. Perpendicular lines meet at $90^\\circ$. (Small ticks across lines mean <b>equal lengths</b>, which is something else again.)',
  },
  /* ---------- 5.2 ---------- */
  {
    id: 'twonames', title: 'Giving a triangle only one name', sections: ['5.2'],
    bad: '"The triangle has two acute angles, so it is acute-angled."',
    good: 'Find <b>all three</b> angles first. An acute-angled triangle needs three acute angles. One right angle makes it right-angled; one obtuse angle makes it obtuse-angled.',
    why: 'Every triangle has at least two acute angles, so two acute angles tell you nothing. The largest angle decides.',
  },
  {
    id: 'anglesumcheck', title: 'Checking only that the angles add up to 180°', sections: ['5.2'],
    bad: '"$90^\\circ$, $90^\\circ$ and $0^\\circ$ add up to $180^\\circ$, so they can be the angles of a triangle."',
    good: 'The three angles must add up to $180^\\circ$ <b>and</b> each one must be greater than $0^\\circ$.',
    why: 'An angle of $0^\\circ$ would make two sides lie on top of each other, so there would be no triangle.',
  },
  {
    id: 'wrongtriangle', title: 'Using an angle from the wrong triangle', sections: ['5.2'],
    fig: { w: 300, h: 170, fit: true, pts: { B: [30, 170], D: [300, 170], A: HP.apex([30, 170], [300, 170], 35, 48), C: HP.foot(HP.apex([30, 170], [300, 170], 35, 48), [30, 170], 80) }, polys: ['ABD'], lines: ['AC'], at: { ACB: '80°', ADC: '48°', CAD: 'y' } },
    bad: 'In $\\triangle ACD$: $y + 80^\\circ + 48^\\circ = 180^\\circ$.',
    good: 'Write "In $\\triangle ACD$," first, then use only the angles <b>inside</b> that triangle: $\\angle CAD$, $\\angle ACD$ and $\\angle ADC$.',
    why: '$80^\\circ$ is $\\angle ACB$, which belongs to $\\triangle ABC$. Naming the triangle before the equation stops you from picking up an angle from next door.',
  },
  {
    id: 'equalmarks', title: 'Judging equal sides by eye', sections: ['5.2'],
    bad: '"The sides look about the same, so the polygon is equilateral."',
    good: 'Sides are equal only if they carry the <b>same tick marks</b> (or the question says so). Angles are equal only if they carry the same arc marks.',
    why: 'A figure may not be drawn to scale. The marks are the information.',
  },
  {
    id: 'regularboth', title: 'Calling a rhombus or a rectangle "regular"', sections: ['5.2'],
    bad: '"All four sides are equal, so it is a regular polygon."',
    good: 'A regular polygon is equilateral <b>and</b> equiangular. Check both the sides and the angles.',
    why: 'A rhombus has equal sides but unequal angles. A rectangle has equal angles but unequal sides. Only a square is a regular quadrilateral.',
  },
  {
    id: 'concave', title: 'Missing the angle that makes a polygon concave', sections: ['5.2'],
    fig: { w: 200, h: 130, noLabels: true, mono: true, pts: { A: [100, 15], B: [175, 115], C: [100, 75], D: [25, 115] }, polys: ['ABCD'], reflex: ['BCD'], arcs: { BCD: 1 }, arcR: 11 },
    bad: '"All the corners are sharp, so all the interior angles are less than $180^\\circ$."',
    good: 'Measure each interior angle on the <b>inside</b> of the polygon. Where the outline has a dent, the interior angle is a reflex angle.',
    why: 'A polygon with at least one interior angle greater than $180^\\circ$ is concave.',
  },
  {
    id: 'anychord', title: 'Calling any line across a circle a diameter', sections: ['5.2'],
    fig: { w: 220, h: 150, fit: false, pts: { O: [110, 75], A: [50, 75], B: [170, 75], C: [140, 23], D: [67, 117] }, circles: [{ c: 'O', r: 60 }], lines: ['AB', 'CD'], dots: 'O', lab: { O: [-2, 13], A: [-12, 0], B: [12, 0], C: [8, -10], D: [-10, 10] } },
    bad: '"$CD$ joins two points on the circle, so it is a diameter."',
    good: 'A diameter must pass through the <b>centre</b>. $AB$ is a diameter; $CD$ is not.',
    why: 'A line segment that misses the centre is shorter than a diameter. Only a diameter is twice the radius.',
  },
  /* ---------- 5.3 ---------- */
  {
    id: 'rubout', title: 'Rubbing out the construction lines', sections: ['5.3'],
    bad: 'A neat triangle with no arcs left.',
    good: 'Leave every arc and every long line. Label the vertices and write the given measurements on the figure.',
    why: 'The arcs show <b>how</b> you constructed the figure. Without them the marker cannot tell that you used compasses.',
  },
  {
    id: 'radiusdiameter', title: 'Opening the compasses to the diameter', sections: ['5.2', '5.3'],
    bad: 'For a circle of diameter 6 cm, the compasses are opened to 6 cm.',
    good: 'The opening of the compasses is the <b>radius</b>: $6 \\div 2 = 3$ cm.',
    why: 'The needle is at the centre and the pencil is on the circle, so the opening is the distance from the centre to the circle.',
  },
  {
    id: 'protractorscale', title: 'Reading the wrong scale on the protractor', sections: ['5.3'],
    bad: 'An acute angle is read as $120^\\circ$ instead of $60^\\circ$.',
    good: 'Use the scale that starts from $0^\\circ$ on the arm lying along the base line. Then ask: should this angle be acute or obtuse?',
    why: 'A protractor has two scales running in opposite directions. The two readings at any mark always add up to $180^\\circ$.',
  },
  {
    id: 'includedangle', title: 'Putting the angle at the wrong vertex', sections: ['5.3'],
    bad: 'Given $AB = 5$ cm, $BC = 4$ cm and $\\angle ABC = 60^\\circ$, the $60^\\circ$ angle is drawn at $A$.',
    good: 'The middle letter is the vertex: $\\angle ABC$ is at $B$, between $BA$ and $BC$.',
    why: 'Sketch the triangle and write the measurements on it before you start. The sketch shows where everything goes.',
  },
  {
    id: 'case4', title: 'Case 4: measuring an angle at a vertex that is not there yet', sections: ['5.3'],
    bad: 'Given $\\angle BAC = 40^\\circ$, $\\angle ABC = 65^\\circ$ and $BC = 6$ cm, the student draws $BC$ and then tries to draw $40^\\circ$ at $C$.',
    good: 'Find the third angle first: $\\angle ACB = 180^\\circ - 40^\\circ - 65^\\circ = 75^\\circ$. Then draw $65^\\circ$ at $B$ and $75^\\circ$ at $C$.',
    why: 'You can only draw angles at the two ends of the side you have drawn. The angle at $A$ cannot be drawn until $A$ exists.',
  },
  {
    id: 'hypotenuse', title: 'Choosing the wrong side as the hypotenuse', sections: ['5.3'],
    bad: 'In $\\triangle XYZ$ with $\\angle XYZ = 90^\\circ$, taking $XY$ as the hypotenuse.',
    good: 'The hypotenuse is the side <b>opposite</b> the right angle. The right angle is at $Y$, so the hypotenuse is $XZ$.',
    why: 'The hypotenuse does not touch the right angle. It is always the longest side.',
  },
  /* ---------- 5.4 ---------- */
  {
    id: 'curvedface', title: 'Calling a cylinder or a cone a polyhedron', sections: ['5.4'],
    bad: '"A cylinder has flat ends, so it is a polyhedron."',
    good: 'A polyhedron is enclosed by polygons <b>only</b>. A cylinder has a curved surface, and its flat ends are circles, which are not polygons.',
    why: 'A polygon has straight sides. One curved surface is enough to stop a solid being a polyhedron.',
  },
  {
    id: 'hiddenedges', title: 'Forgetting the hidden edges', sections: ['5.4'],
    fig: { w: 200, h: 150, solid: { kind: 'uprism', ngon: 4, r: 2.2, height: 3.1 } },
    bad: '"I can see 9 edges and 7 vertices on this cube."',
    good: 'Count the dotted edges and the vertex where they meet as well: 12 edges and 8 vertices.',
    why: 'The dotted lines are real edges at the back of the solid. Count in groups (top, bottom, joining edges) so that nothing is missed.',
  },
  {
    id: 'prismpyramid', title: 'Mixing up prisms and pyramids', sections: ['5.4'],
    bad: 'Calling a solid with one base and triangular faces meeting at a point a "prism".',
    good: 'Two identical parallel bases: <b>prism</b>. One base and a top vertex: <b>pyramid</b>. Name it after the base, e.g. a hexagonal pyramid.',
    why: 'The name comes from the base, not from the side faces. The side faces of a pyramid are always triangles.',
  },
  {
    id: 'uniformpyramid', title: '"Same shape" is not enough for uniform cross-sections', sections: ['5.4'],
    bad: '"Every horizontal cut of a square pyramid is a square, so it has uniform cross-sections."',
    good: 'Uniform cross-sections must have the same shape <b>and the same size</b>. The squares of a pyramid get smaller towards the top, so they are not uniform.',
    why: 'Only prisms and circular cylinders keep the same size all the way along.',
  },
  {
    id: 'flatshape', title: 'Drawing the solid instead of the cross-section', sections: ['5.4'],
    bad: 'Asked for the cross-section of a cylinder, the student draws an oval (or the whole cylinder).',
    good: 'Imagine looking <b>straight at</b> the cut face and draw that flat shape: a circle for a horizontal cut of an upright cylinder.',
    why: 'A cross-section is a plane figure. The oval in a 3-D drawing is a circle seen from an angle.',
  },
  {
    id: 'solidlines', title: 'Leaving out the hidden edges, or drawing them solid', sections: ['5.4'],
    bad: 'A sketch of a pyramid with every edge drawn as a solid line, or with the back edges missing.',
    good: 'Edges you can see: solid lines. Edges hidden behind the solid: dotted lines.',
    why: 'The dotted lines let the reader see the whole solid and count its edges and vertices.',
  },
];
