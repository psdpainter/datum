import { DEFAULT_SERIES_COLORS } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  strokeWidth: 2,
  stroke: null,
  smooth: false,
  tension: 0.2 // Curve smoothing tension (0.1 to 0.3 offers natural curves)
};

// Generates smooth cubic Bezier path coordinates between points
function buildSmoothPath(points, tension = 0.2) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    // Calculate tangent-based control points
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

export function line(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    smooth = DEFAULT_OPTIONS.smooth,
    tension = DEFAULT_OPTIONS.tension,
    name,
    tooltip
  } = keysAndOptions;

  // Normalize primitive numeric arrays: [10, 20] -> [{ x: 1, y: 10 }, { x: 2, y: 20 }]
  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return { [x]: index + 1, [y]: item };
    }
    return item;
  });

  return {
    type: 'line',
    data: normalizedData,
    keys: { x, y },
    options: { stroke, strokeWidth, smooth, tension, name, tooltip }
  };
}

export function renderLineLayer(layer, context, layerIndex = 0) {
  const { svg, getX, getY } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_SERIES_COLORS[layerIndex % DEFAULT_SERIES_COLORS.length];
  const color = options.stroke || fallbackColor;
  const strokeWidth = options.strokeWidth ?? DEFAULT_OPTIONS.strokeWidth;

  // Resolve 2D coordinate points
  const points = data.map((d, index) => ({
    x: getX(index, data.length),
    y: getY(Number(d[keys.y]) || 0)
  }));

  let pathString = '';

  if (options.smooth) {
    pathString = buildSmoothPath(points, options.tension);
  } else {
    // Standard linear segments
    points.forEach((pt, index) => {
      pathString += (index === 0 ? 'M' : ' L') + ` ${pt.x} ${pt.y}`;
    });
  }

  const linePath = document.createElementNS(SVG_NS, 'path');
  linePath.setAttribute('d', pathString.trim());
  linePath.setAttribute('fill', 'none');
  linePath.setAttribute('stroke', color);
  linePath.setAttribute('stroke-width', strokeWidth);
  linePath.setAttribute('stroke-linejoin', 'round');
  linePath.setAttribute('stroke-linecap', 'round');
  svg.appendChild(linePath);
}