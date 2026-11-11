'use strict';
/* One-page revision sheet (printable). Uses the same blocks as the Learn pages. */
C5.sheet = [
  { h: '1. Basic concepts (5.1)' },
  { key: 'A <b>line segment</b> $PQ$ has two end points and a fixed length.<br>Name an angle with three letters, <b>vertex in the middle</b>: $\\angle ABC$ or $\\angle CBA$. Use $\\angle B$ only when one angle is at $B$.' },
  {
    table: {
      head: ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Round'],
      rows: [['$0^\\circ$ to $90^\\circ$', '$90^\\circ$', '$90^\\circ$ to $180^\\circ$', '$180^\\circ$', '$180^\\circ$ to $360^\\circ$', '$360^\\circ$']],
    },
  },
  { key: '<b>Complementary</b> angles: sum $= 90^\\circ$. &nbsp; <b>Supplementary</b> angles: sum $= 180^\\circ$.<br>$AB \\parallel CD$: parallel (same arrows). &nbsp; $AB \\perp CD$: perpendicular (right-angle mark).<br>Never assume a line is straight from the picture: add the angles and check for $180^\\circ$.' },
  { h: '2. Plane figures (5.2)' },
  {
    table: {
      head: ['Triangles by sides', 'Triangles by angles'],
      rows: [['<b>equilateral</b>: all sides equal', '<b>acute-angled</b>: all angles acute'], ['<b>isosceles</b>: two sides equal', '<b>right-angled</b>: one right angle'], ['<b>scalene</b>: no sides equal', '<b>obtuse-angled</b>: one obtuse angle']],
    },
  },
  { key: '<b>Angle sum of a triangle</b>: in $\\triangle ABC$, $\\angle BAC + \\angle ABC + \\angle ACB = 180^\\circ$ &nbsp; (∠ sum of △).<br>Write "In $\\triangle ABC$," first. With several triangles, start with the one that has only one unknown.<br>A quadrilateral can be cut into two triangles, so its four angles add up to $360^\\circ$.' },
  {
    table: {
      head: ['Polygon', 'Meaning'],
      rows: [['convex', 'all interior angles less than $180^\\circ$'], ['concave', 'at least one interior angle greater than $180^\\circ$'], ['equilateral', 'all sides equal'], ['equiangular', 'all interior angles equal'], ['<b>regular</b>', 'equilateral <b>and</b> equiangular']],
    },
  },
  { key: '<b>Circle</b>: every point is the same distance from the <b>centre</b>. <b>Radius</b>: centre to circle. <b>Diameter</b>: across the circle <b>through the centre</b>; diameter $= 2 \\times$ radius. <b>Circumference</b>: the curve itself, and its length.' },
  { h: '3. Basic constructions (5.3)' },
  { key: 'Parallel and perpendicular lines: <b>ruler + set square</b> (slide the set square along the ruler).<br>Circles, arcs, copying a length: <b>compasses</b>. The opening is the <b>radius</b>.' },
  {
    table: {
      head: ['Case', 'Given', 'Tools'],
      rows: [['1', 'three sides', 'ruler, compasses'], ['2', 'two sides and the included angle', 'ruler, protractor'], ['3', 'two angles and the included side', 'ruler, protractor'], ['4', 'two angles and a side not between them', 'find the third angle, then Case 3'], ['5', 'right angle, hypotenuse, one side', 'ruler, set square or protractor, compasses']],
    },
  },
  { key: 'Keep all construction lines. Label the vertices and write the given measurements on the figure.' },
  { h: '4. Three-dimensional figures (5.4)' },
  { key: 'A <b>polyhedron</b> is enclosed by polygons only (no curved surface).<br><b>Prism</b>: two identical parallel bases. <b>Pyramid</b>: one base and a top vertex. Both are named after the base.<br>Count hidden (dotted) edges too.' },
  {
    table: {
      head: ['Base has $n$ sides', 'Vertices', 'Edges', 'Faces'],
      rows: [['Prism', '$2n$', '$3n$', '$n + 2$'], ['Pyramid', '$n + 1$', '$2n$', '$n + 1$']],
    },
  },
  { key: 'A <b>cross-section</b> is the flat face made by a cut. <b>Uniform cross-sections</b>: every cut parallel to the end faces has the same shape <b>and</b> size — prisms and circular cylinders only.<br>In a 2-D drawing, visible edges are solid lines and hidden edges are dotted lines. On oblique grid paper, one slanted grid line stands for 2 units.' },
];
