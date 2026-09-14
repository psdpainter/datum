import { Color, generateGuid } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_AREA_COLORS = [
  Color.Blue,
  Color.Cyan,
  Color.Orange,
  Color.Purple,
  Color.Green
];

const DEFAULT_OPTIONS = {
  opacity: 0.25,
  gradient: false,
  smooth: false,
  tension: 0.2
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

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

export function area(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    fill,
    opacity = DEFAULT_OPTIONS.opacity,
    gradient = DEFAULT_OPTIONS.gradient,
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
    type: 'area',
    data: normalizedData,
    keys: { x, y },
    options: { fill, opacity, gradient, smooth, tension, name, tooltip }
  };
}

export function renderAreaLayer(layer, context, layerIndex = 0) {
  const { svg, getX, getY, height, padding } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_AREA_COLORS[layerIndex % DEFAULT_AREA_COLORS.length];
  const fillColor = options.fill || fallbackColor;
  const baselineY = height - padding.bottom;

  let finalFill = fillColor;

  // 1. Dynamic SVG linearGradient injection
  if (options.gradient === true) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const gradientId = `datum-grad-${generateGuid()}`;
    const linearGradient = document.createElementNS(SVG_NS, 'linearGradient');
    linearGradient.setAttribute('id', gradientId);
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '0%');
    linearGradient.setAttribute('y2', '100%');

    const stopTop = document.createElementNS(SVG_NS, 'stop');
    stopTop.setAttribute('offset', '0%');
    stopTop.setAttribute('stop-color', fillColor);
    stopTop.setAttribute('stop-opacity', options.opacity);
    linearGradient.appendChild(stopTop);

    const stopBottom = document.createElementNS(SVG_NS, 'stop');
    stopBottom.setAttribute('offset', '100%');
    stopBottom.setAttribute('stop-color', fillColor);
    stopBottom.setAttribute('stop-opacity', '0');
    linearGradient.appendChild(stopBottom);

    defs.appendChild(linearGradient);
    finalFill = `url(#${gradientId})`;
  }

  // 2. Build coordinate points
  const points = data.map((d, index) => ({
    x: getX(index, data.length),
    y: getY(Number(d[keys.y]) || 0)
  }));

  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;

  // 3. Build top boundary path (smooth bezier or linear segments)
  let topPathString = '';
  if (options.smooth) {
    topPathString = buildSmoothPath(points, options.tension);
  } else {
    points.forEach((pt, index) => {
      topPathString += (index === 0 ? 'M' : ' L') + ` ${pt.x} ${pt.y}`;
    });
  }

  // 4. Close path down to the baseline axis
  const pathString = `${topPathString} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  const areaPath = document.createElementNS(SVG_NS, 'path');
  areaPath.setAttribute('d', pathString.trim());
  areaPath.setAttribute('fill', finalFill);
  if (!options.gradient) {
    areaPath.setAttribute('fill-opacity', options.opacity);
  }
  areaPath.setAttribute('stroke', 'none');

  // Keep areas behind overlay marks
  const defs = svg.querySelector('defs');
  if (defs && defs.nextSibling) {
    svg.insertBefore(areaPath, defs.nextSibling);
  } else {
    svg.insertBefore(areaPath, svg.firstChild);
  }
}