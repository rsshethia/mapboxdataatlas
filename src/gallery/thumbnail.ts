import { hashString, mulberry32, svgEl } from '../lib/dom';
import { BIVARIATE_3X3, PALETTES, QUALITATIVE } from '../lib/colors';
import type { ExampleMeta } from '../lib/types';

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  radius = 0,
  opacity = 1,
): SVGRectElement {
  return svgEl('rect', { x, y, width, height, fill, rx: radius, opacity });
}

function circle(
  cx: number,
  cy: number,
  r: number,
  fill: string,
  opacity = 1,
  stroke = 'none',
  strokeWidth = 0,
): SVGCircleElement {
  return svgEl('circle', { cx, cy, r, fill, opacity, stroke, 'stroke-width': strokeWidth });
}

function path(
  d: string,
  stroke: string,
  width = 1.5,
  opacity = 1,
  dash?: string,
  fill = 'none',
): SVGPathElement {
  const node = svgEl('path', {
    d,
    fill,
    stroke,
    'stroke-width': width,
    opacity,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  if (dash) node.setAttribute('stroke-dasharray', dash);
  return node;
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  width = 1,
  opacity = 1,
): SVGLineElement {
  return svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': width, opacity });
}

function polygon(points: string, fill: string, opacity = 1, stroke = 'none'): SVGPolygonElement {
  return svgEl('polygon', { points, fill, opacity, stroke, 'stroke-width': 0.8 });
}

function texture(svg: SVGSVGElement, seed: number, color = '#181611'): void {
  const random = mulberry32(seed);
  for (let index = 0; index < 40; index += 1) {
    svg.append(
      circle(random() * 320, random() * 200, random() * 0.9 + 0.2, color, 0.08),
    );
  }
}

function choropleth(svg: SVGSVGElement, random: () => number): void {
  const colors = PALETTES.ylGnBu;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const value = random();
      const color = colors[Math.min(colors.length - 1, Math.floor(value * colors.length))];
      const inset = random() * 4;
      svg.append(rect(14 + col * 37 + inset, 24 + row * 30 + inset, 33 - inset, 26 - inset, color, 1.5, 0.95));
    }
  }
  svg.append(line(14, 18, 306, 18, '#181611', 1, 0.25));
  svg.append(line(14, 182, 306, 182, '#181611', 1, 0.25));
}

function bivariate(svg: SVGSVGElement): void {
  const size = 46;
  const startX = 92;
  const startY = 22;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      svg.append(
        rect(startX + col * size, startY + row * size, size - 3, size - 3, BIVARIATE_3X3[(2 - row) * 3 + col], 1, 1),
      );
    }
  }
  svg.append(line(82, 22, 82, 160, '#181611', 1, 0.35));
  svg.append(line(92, 170, 232, 170, '#181611', 1, 0.35));
  svg.append(path('M 72 30 L 82 22 L 72 14', '#181611', 1, 0.35));
  svg.append(path('M 224 160 L 232 170 L 224 180', '#181611', 1, 0.35));
  svg.append(rect(14, 24, 42, 136, '#181611', 0, 0.08));
  for (let index = 0; index < 5; index += 1) {
    svg.append(line(18, 34 + index * 26, 52, 34 + index * 26, '#181611', 1, 0.2));
  }
}

function bubbles(svg: SVGSVGElement, random: () => number): void {
  for (let index = 0; index < 28; index += 1) {
    svg.append(
      circle(
        20 + random() * 280,
        20 + random() * 160,
        2 + random() * 16,
        QUALITATIVE.bold[index % QUALITATIVE.bold.length],
        0.55,
        '#181611',
        0.5,
      ),
    );
  }
  for (let index = 0; index < 3; index += 1) {
    svg.append(circle(40 + index * 100, 160, 22 + index * 10, 'none', 0.5, '#181611', 0.6));
  }
}

function hexes(svg: SVGSVGElement, random: () => number): void {
  const colors = PALETTES.viridis;
  const radius = 17;
  const width = Math.sqrt(3) * radius;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 6; col += 1) {
      const cx = 28 + col * width + (row % 2 ? width / 2 : 0);
      const cy = 32 + row * radius * 1.5;
      const points = Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI / 3) * index - Math.PI / 6;
        return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
      }).join(' ');
      const color = colors[Math.min(colors.length - 1, Math.floor(random() * colors.length))];
      svg.append(polygon(points, color, 0.92, '#f4f0e6'));
    }
  }
}

function heat(svg: SVGSVGElement, random: () => number, id: string): void {
  const defs = svgEl('defs');
  for (let index = 0; index < 4; index += 1) {
    const gradient = svgEl('radialGradient', { id: `${id}-heat-${index}` });
    gradient.append(
      svgEl('stop', { offset: '0%', 'stop-color': ['#fde725', '#a0da39', '#1fa187', '#440154'][index], 'stop-opacity': 0.9 }),
      svgEl('stop', { offset: '100%', 'stop-color': '#440154', 'stop-opacity': 0 }),
    );
    defs.append(gradient);
  }
  svg.append(defs);
  for (let index = 0; index < 5; index += 1) {
    svg.append(
      circle(40 + random() * 240, 30 + random() * 140, 30 + random() * 32, `url(#${id}-heat-${index % 4})`, 0.9),
    );
  }
  for (let index = 0; index < 34; index += 1) {
    svg.append(circle(30 + random() * 260, 20 + random() * 160, 1.2, '#f4f0e6', 0.7));
  }
}

function clusters(svg: SVGSVGElement, random: () => number): void {
  for (let cluster = 0; cluster < 3; cluster += 1) {
    const cx = 70 + cluster * 90;
    const cy = 60 + (cluster % 2) * 70;
    for (let index = 0; index < 18; index += 1) {
      const angle = random() * Math.PI * 2;
      const distance = random() * 28;
      svg.append(circle(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, 2.2, QUALITATIVE.bold[cluster], 0.75));
    }
    svg.append(circle(cx, cy, 27, 'none', 0.5, '#181611', 1));
    svg.append(circle(cx, cy, 17, '#f4f0e6', 1, '#181611', 1));
    svg.append(circle(cx, cy, 1.8, '#181611'));
  }
}

function extrusion(svg: SVGSVGElement, random: () => number): void {
  const colors = PALETTES.orRd;
  for (let index = 0; index < 9; index += 1) {
    const x = 18 + index * 33;
    const height = 24 + random() * 100;
    const y = 166 - height;
    const color = colors[Math.min(colors.length - 1, Math.floor((height / 124) * colors.length))];
    svg.append(rect(x, y, 24, height, color, 0, 0.95));
    svg.append(polygon(`${x},${y} ${x + 8},${y - 8} ${x + 32},${y - 8} ${x + 24},${y}`, '#181611', 0.18));
    svg.append(polygon(`${x + 24},${y} ${x + 32},${y - 8} ${x + 32},${166 - 8} ${x + 24},166`, '#181611', 0.12));
  }
  svg.append(line(14, 166, 306, 166, '#181611', 1, 0.35));
}

function arcs(svg: SVGSVGElement, random: () => number, particles = false): void {
  for (let index = 0; index < 9; index += 1) {
    const startX = 20 + random() * 50;
    const startY = 150 + random() * 25;
    const endX = 250 + random() * 50;
    const endY = 20 + random() * 50;
    const controlX = 120 + random() * 90;
    const controlY = 20 + random() * 40;
    const color = QUALITATIVE.bold[index % QUALITATIVE.bold.length];
    svg.append(path(`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`, color, 1.2, 0.65));
    if (particles) {
      const t = 0.2 + random() * 0.6;
      const x = (1 - t) ** 2 * startX + 2 * (1 - t) * t * controlX + t ** 2 * endX;
      const y = (1 - t) ** 2 * startY + 2 * (1 - t) * t * controlY + t ** 2 * endY;
      svg.append(circle(x, y, 2.6, color, 1, '#f4f0e6', 0.8));
    }
  }
}

function route(svg: SVGSVGElement): void {
  svg.append(path('M 26 160 C 80 150, 76 70, 132 84 S 208 154, 288 38', '#181611', 3, 0.9));
  svg.append(path('M 26 160 C 80 150, 76 70, 132 84 S 208 154, 288 38', '#f4f0e6', 1, 1, '2 8'));
  svg.append(circle(26, 160, 7, '#c8462b', 1, '#f4f0e6', 2));
  svg.append(circle(288, 38, 7, '#1f6f78', 1, '#f4f0e6', 2));
  for (let index = 0; index < 8; index += 1) {
    const t = index / 7;
    svg.append(circle(40 + t * 230, 145 - t * 30 + Math.sin(t * Math.PI * 2) * 30, 1.5, '#181611', 0.3));
  }
}

function timeline(svg: SVGSVGElement, random: () => number): void {
  for (let index = 0; index < 30; index += 1) {
    const height = 10 + random() * 70;
    svg.append(rect(16 + index * 9.8, 172 - height, 6.4, height, '#1f6f78', 0, 0.55));
  }
  svg.append(rect(120, 14, 78, 164, '#c8462b', 0, 0.1));
  svg.append(line(120, 14, 120, 178, '#c8462b', 1, 0.45));
  svg.append(line(198, 14, 198, 178, '#c8462b', 1, 0.45));
  svg.append(path('M 16 120 C 60 100, 90 130, 130 96 S 220 60, 304 78', '#c8462b', 2, 0.9));
  svg.append(line(16, 182, 304, 182, '#181611', 1, 0.3));
}

function scatter(svg: SVGSVGElement, random: () => number): void {
  svg.append(rect(52, 122, 120, 48, '#1f6f78', 0, 0.12));
  svg.append(rect(52, 122, 120, 48, 'none', 0, 0.5));
  for (let index = 0; index < 80; index += 1) {
    const x = 54 + random() * 220;
    const y = 170 - random() * 130;
    const selected = x > 52 && x < 172 && y > 122 && y < 170;
    svg.append(circle(x, y, 2.4, selected ? '#c8462b' : '#181611', selected ? 0.9 : 0.35));
  }
  svg.append(line(52, 178, 300, 178, '#181611', 1, 0.3));
  svg.append(line(52, 16, 52, 178, '#181611', 1, 0.3));
}

function bars(svg: SVGSVGElement): void {
  const values = [0.92, 0.75, 0.64, 0.52, 0.44, 0.32, 0.22];
  values.forEach((value, index) => {
    svg.append(rect(84, 22 + index * 23, 190 * value, 13, index === 0 ? '#c8462b' : '#1f6f78', 1, index === 0 ? 1 : 0.65));
    svg.append(rect(20, 24 + index * 23, 52, 8, '#181611', 0, 0.18));
  });
  svg.append(line(84, 14, 84, 182, '#181611', 1, 0.3));
}

function multiples(svg: SVGSVGElement, random: () => number): void {
  for (let panel = 0; panel < 4; panel += 1) {
    const x = 18 + (panel % 2) * 146;
    const y = 18 + Math.floor(panel / 2) * 86;
    svg.append(rect(x, y, 138, 74, '#181611', 1, 0.06));
    for (let index = 0; index < 12; index += 1) {
      svg.append(circle(x + 10 + random() * 118, y + 10 + random() * 54, 2 + random() * 9, PALETTES.orRd[2 + (index % 5)], 0.7));
    }
  }
}

function terrain(svg: SVGSVGElement, random: () => number): void {
  for (let layer = 0; layer < 7; layer += 1) {
    let d = `M 0 ${120 + layer * 9}`;
    for (let x = 0; x <= 320; x += 20) {
      d += ` Q ${x + 10} ${110 + layer * 9 + Math.sin((x + layer * 14) / 34) * 18} ${x + 20} ${120 + layer * 9}`;
    }
    svg.append(path(d, layer % 2 ? '#8a5a3b' : '#1f6f78', 1.2, 0.5 + layer * 0.05));
  }
  const defs = svgEl('defs');
  const gradient = svgEl('linearGradient', { id: 'terrain-sky', x1: 0, y1: 0, x2: 0, y2: 1 });
  gradient.append(
    svgEl('stop', { offset: '0%', 'stop-color': '#f4f0e6', 'stop-opacity': 0.1 }),
    svgEl('stop', { offset: '100%', 'stop-color': '#c8462b', 'stop-opacity': 0.12 }),
  );
  defs.append(gradient);
  svg.append(defs);
  svg.append(rect(0, 0, 320, 200, 'url(#terrain-sky)', 0, 1));
  for (let index = 0; index < 12; index += 1) {
    svg.append(circle(random() * 320, random() * 110, 1.1, '#181611', 0.25));
  }
}

function globe(svg: SVGSVGElement): void {
  svg.append(circle(160, 100, 76, '#1f6f78', 0.12, '#181611', 1));
  for (let index = 1; index < 4; index += 1) {
    svg.append(svgEl('ellipse', { cx: 160, cy: 100, rx: (76 * index) / 4, ry: 76, fill: 'none', stroke: '#181611', 'stroke-width': 0.8, opacity: 0.28 }));
  }
  for (let index = -1; index <= 1; index += 1) {
    svg.append(svgEl('ellipse', { cx: 160, cy: 100 + index * 24, rx: 76 * Math.cos((index * 24 * Math.PI) / 180), ry: 10, fill: 'none', stroke: '#181611', 'stroke-width': 0.8, opacity: 0.28 }));
  }
  svg.append(path('M 92 60 Q 160 10 228 62', '#c8462b', 2, 0.9));
  svg.append(path('M 96 142 Q 160 190 224 140', '#c8462b', 2, 0.9));
  svg.append(circle(92, 60, 3, '#c8462b'));
  svg.append(circle(228, 62, 3, '#c8462b'));
}

function profile(svg: SVGSVGElement, random: () => number): void {
  let d = 'M 20 168';
  for (let x = 20; x <= 300; x += 14) {
    const y = 150 - Math.sin(x / 26) * 30 - random() * 22;
    d += ` L ${x} ${y}`;
  }
  d += ' L 300 168 Z';
  svg.append(path(d, '#1f6f78', 1.5, 0.9, undefined, '#1f6f78'));
  const area = svg.lastElementChild as SVGPathElement;
  area.setAttribute('fill-opacity', '0.18');
  svg.append(line(20, 168, 300, 168, '#181611', 1, 0.3));
}

function isochrone(svg: SVGSVGElement, random: () => number): void {
  const points = (radius: number, wobble: number): string => {
    const values: string[] = [];
    for (let index = 0; index < 28; index += 1) {
      const angle = (index / 28) * Math.PI * 2;
      const r = radius + Math.sin(angle * 3 + random()) * wobble + Math.cos(angle * 5) * wobble * 0.4;
      values.push(`${160 + Math.cos(angle) * r},${100 + Math.sin(angle) * r * 0.72}`);
    }
    return values.join(' ');
  };
  svg.append(polygon(points(92, 8), '#c8462b', 0.18, '#c8462b'));
  svg.append(polygon(points(62, 6), '#d9a441', 0.24, '#d9a441'));
  svg.append(polygon(points(34, 4), '#1f6f78', 0.3, '#1f6f78'));
  svg.append(circle(160, 100, 4, '#181611', 1, '#f4f0e6', 1.5));
}

function search(svg: SVGSVGElement): void {
  for (let index = 0; index < 20; index += 1) {
    svg.append(rect(14 + (index % 8) * 38, 22 + Math.floor(index / 8) * 48, 30, 38, '#181611', 0, 0.05));
  }
  svg.append(circle(222, 82, 24, 'none', 0.8, '#181611', 2.5));
  svg.append(line(240, 100, 264, 124, '#181611', 4, 0.8));
  svg.append(path('M 96 62 C 82 62 74 74 74 86 C 74 104 96 122 96 122 C 96 122 118 104 118 86 C 118 74 110 62 96 62 Z', '#c8462b', 1, 1, undefined, '#c8462b'));
  svg.append(circle(96, 86, 7, '#f4f0e6'));
}

function directions(svg: SVGSVGElement): void {
  svg.append(path('M 54 154 C 88 130, 82 88, 130 92 S 208 132, 268 48', '#181611', 1, 0.2));
  svg.append(path('M 54 154 C 88 130, 82 88, 130 92 S 208 132, 268 48', '#1f6f78', 4, 1));
  svg.append(circle(54, 154, 8, '#c8462b', 1, '#f4f0e6', 2));
  svg.append(circle(268, 48, 8, '#181611', 1, '#f4f0e6', 2));
  for (let index = 0; index < 3; index += 1) {
    svg.append(rect(218, 126 + index * 14, 66 - index * 12, 7, '#181611', 0, 0.15));
  }
}

function exportFrame(svg: SVGSVGElement): void {
  svg.append(rect(26, 18, 268, 164, '#f4f0e6', 1, 1));
  svg.append(rect(38, 30, 244, 126, '#181611', 0, 0.08));
  for (let index = 0; index < 5; index += 1) {
    svg.append(rect(42 + index * 48, 108, 40, 44, PALETTES.orRd[2 + index], 0, 0.8));
  }
  svg.append(circle(240, 68, 28, '#1f6f78', 0.3));
  svg.append(rect(38, 164, 78, 6, '#181611', 0, 0.4));
  svg.append(rect(250, 164, 32, 6, '#181611', 0, 0.4));
  svg.append(line(20, 12, 40, 12, '#181611', 1, 0.6));
  svg.append(line(20, 12, 20, 32, '#181611', 1, 0.6));
  svg.append(line(300, 188, 280, 188, '#181611', 1, 0.6));
  svg.append(line(300, 188, 300, 168, '#181611', 1, 0.6));
}

function compare(svg: SVGSVGElement, random: () => number): void {
  for (let col = 0; col < 5; col += 1) {
    for (let row = 0; row < 5; row += 1) {
      svg.append(rect(14 + col * 30, 20 + row * 32, 26, 28, PALETTES.ylGnBu[Math.floor(random() * 8)], 0, 0.9));
      svg.append(rect(174 + col * 30, 20 + row * 32, 26, 28, PALETTES.orRd[Math.floor(random() * 8)], 0, 0.9));
    }
  }
  svg.append(rect(160, 10, 2, 180, '#181611', 0, 0.8));
  svg.append(circle(160, 100, 9, '#f4f0e6', 1, '#181611', 1.5));
  svg.append(path('M 156 100 L 160 96 L 164 100 M 156 100 L 160 104 L 164 100', '#181611', 1.2, 0.8));
}

function live(svg: SVGSVGElement, random: () => number): void {
  for (let index = 0; index < 16; index += 1) {
    const x = 30 + random() * 260;
    const y = 30 + random() * 140;
    svg.append(path(`M ${x - 28} ${y + 12} Q ${x - 14} ${y} ${x} ${y}`, '#1f6f78', 1, 0.35));
    svg.append(circle(x, y, 2.6, '#c8462b', 1, '#f4f0e6', 1));
  }
  svg.append(circle(270, 34, 4, '#c8462b'));
  svg.append(circle(270, 34, 9, 'none', 0.4, '#c8462b', 1));
}

export function thumbnailSvg(meta: ExampleMeta): SVGSVGElement {
  const seed = hashString(meta.id);
  const random = mulberry32(seed);
  const svg = svgEl('svg', {
    viewBox: '0 0 320 200',
    class: 'thumb-svg',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.append(rect(0, 0, 320, 200, '#e9e3d5'));
  texture(svg, seed, '#181611');

  switch (meta.thumb) {
    case 'choropleth':
      choropleth(svg, random);
      break;
    case 'bivariate':
      bivariate(svg);
      break;
    case 'bubbles':
      bubbles(svg, random);
      break;
    case 'hex':
      hexes(svg, random);
      break;
    case 'heat':
      heat(svg, random, meta.id);
      break;
    case 'clusters':
      clusters(svg, random);
      break;
    case 'extrusion':
      extrusion(svg, random);
      break;
    case 'arcs':
      arcs(svg, random);
      break;
    case 'particles':
      arcs(svg, random, true);
      break;
    case 'route':
      route(svg);
      break;
    case 'timeline':
      timeline(svg, random);
      break;
    case 'scatter':
      scatter(svg, random);
      break;
    case 'bars':
      bars(svg);
      break;
    case 'multiples':
      multiples(svg, random);
      break;
    case 'terrain':
      terrain(svg, random);
      break;
    case 'globe':
      globe(svg);
      break;
    case 'profile':
      profile(svg, random);
      break;
    case 'isochrone':
      isochrone(svg, random);
      break;
    case 'search':
      search(svg);
      break;
    case 'directions':
      directions(svg);
      break;
    case 'export':
      exportFrame(svg);
      break;
    case 'compare':
      compare(svg, random);
      break;
    case 'live':
      live(svg, random);
      break;
    default:
      choropleth(svg, random);
  }

  return svg;
}
