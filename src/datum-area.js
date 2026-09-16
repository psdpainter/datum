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

// Generates a smooth monotone cubic Bezier path between points.
// The curve avoids introducing artificial minima or maxima between
// adjacent data points.
function buildSmoothPath(points, tension = 0.2) {
  if (points.length === 0) return '';

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const slopes = [];

  // Calculate the slope of each segment.
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;

    slopes.push(dx === 0 ? 0 : dy / dx);
  }

  const tangents = new Array(points.length);

  // Endpoints follow the slope of their adjacent segment.
  tangents[0] = slopes[0];
  tangents[points.length - 1] = slopes[slopes.length - 1];

  // Interior tangents use the average of neighboring slopes,
  // but flatten at local extrema.
  for (let i = 1; i < points.length - 1; i++) {
    const previous = slopes[i - 1];
    const next = slopes[i];

    if (
      previous === 0 ||
      next === 0 ||
      Math.sign(previous) !== Math.sign(next)
    ) {
      tangents[i] = 0;
    } else {
      tangents[i] = (previous + next) / 2;
    }
  }

  // Limit tangents so the cubic curve remains monotonic within
  // each segment and does not overshoot the source values.
  for (let i = 0; i < slopes.length; i++) {
    const slope = slopes[i];

    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }

    const a = tangents[i] / slope;
    const b = tangents[i + 1] / slope;
    const magnitude = Math.hypot(a, b);

    if (magnitude > 3) {
      const scale = 3 / magnitude;

      tangents[i] = scale * a * slope;
      tangents[i + 1] = scale * b * slope;
    }
  }

  // Preserve the existing tension option. A tension of 0.2 represents
  // the normal monotone curve; lower values reduce curvature while
  // higher values increase it.
  const tensionScale = Math.max(0, tension) / 0.2;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;

    const cp1x = p1.x + dx / 3;
    const cp1y =
      p1.y + (tangents[i] * dx / 3) * tensionScale;

    const cp2x = p2.x - dx / 3;
    const cp2y =
      p2.y - (tangents[i + 1] * dx / 3) * tensionScale;

    d +=
      ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)},` +
      ` ${cp2x.toFixed(2)} ${cp2y.toFixed(2)},` +
      ` ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
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

  // Normalize primitive numeric arrays:
  // [10, 20] -> [{ x: 1, y: 10 }, { x: 2, y: 20 }]
  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return {
        [x]: index + 1,
        [y]: item
      };
    }

    return item;
  });

  return {
    type: 'area',
    data: normalizedData,
    keys: { x, y },
    options: {
      fill,
      opacity,
      gradient,
      smooth,
      tension,
      name,
      tooltip
    }
  };
}

export function renderAreaLayer(layer, context, layerIndex = 0) {
  const {
    svg,
    getX,
    getY,
    height,
    padding
  } = context;

  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor =
    DEFAULT_AREA_COLORS[
      layerIndex % DEFAULT_AREA_COLORS.length
    ];

  const fillColor = options.fill || fallbackColor;
  const baselineY = height - padding.bottom;

  let finalFill = fillColor;

  // Dynamic SVG linearGradient injection.
  if (options.gradient === true) {
    let defs = svg.querySelector('defs');

    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const gradientId = `datum-grad-${generateGuid()}`;

    const linearGradient =
      document.createElementNS(SVG_NS, 'linearGradient');

    linearGradient.setAttribute('id', gradientId);
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '0%');
    linearGradient.setAttribute('y2', '100%');

    const stopTop =
      document.createElementNS(SVG_NS, 'stop');

    stopTop.setAttribute('offset', '0%');
    stopTop.setAttribute('stop-color', fillColor);
    stopTop.setAttribute(
      'stop-opacity',
      options.opacity
    );

    linearGradient.appendChild(stopTop);

    const stopBottom =
      document.createElementNS(SVG_NS, 'stop');

    stopBottom.setAttribute('offset', '100%');
    stopBottom.setAttribute('stop-color', fillColor);
    stopBottom.setAttribute('stop-opacity', '0');

    linearGradient.appendChild(stopBottom);

    defs.appendChild(linearGradient);

    finalFill = `url(#${gradientId})`;
  }

  // Build coordinate points.
  const points = data.map((d, index) => ({
    x: getX(index, data.length),
    y: getY(Number(d[keys.y]) || 0)
  }));

  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;

  // Build the upper boundary.
  let topPathString = '';

  if (options.smooth) {
    topPathString =
      buildSmoothPath(points, options.tension);
  } else {
    points.forEach((pt, index) => {
      topPathString +=
        (index === 0 ? 'M' : ' L') +
        ` ${pt.x} ${pt.y}`;
    });
  }

  // Close the area down to the baseline.
  const pathString =
    `${topPathString}` +
    ` L ${lastX} ${baselineY}` +
    ` L ${firstX} ${baselineY} Z`;

  const areaPath =
    document.createElementNS(SVG_NS, 'path');

  areaPath.setAttribute('d', pathString.trim());
  areaPath.setAttribute('fill', finalFill);

  if (!options.gradient) {
    areaPath.setAttribute(
      'fill-opacity',
      options.opacity
    );
  }

  areaPath.setAttribute('stroke', 'none');

  // Keep areas behind overlay marks.
  const defs = svg.querySelector('defs');

  if (defs && defs.nextSibling) {
    svg.insertBefore(areaPath, defs.nextSibling);
  } else {
    svg.insertBefore(areaPath, svg.firstChild);
  }
}