import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  radius: 4,
  fill: Color.Blue,
  stroke: '#ffffff',
  strokeWidth: 1,
  opacity: 0.85
};

export function scatter(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    radius = DEFAULT_OPTIONS.radius,
    fill = DEFAULT_OPTIONS.fill,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    opacity = DEFAULT_OPTIONS.opacity
  } = keysAndOptions;

  // Normalize primitives [10, 20, 30] -> [{ x: 1, y: 10 }, { x: 2, y: 20 }, ...]
  const normalizedData = data.map((item, index) => {
    if (typeof item === 'number') {
      return { [x]: index + 1, [y]: item };
    }
    return item;
  });

  return {
    type: 'scatter',
    data: normalizedData,
    keys: { x, y },
    options: { radius, fill, stroke, strokeWidth, opacity }
  };
}

export function renderScatterLayer(layer, context) {
  const { svg, getX, getY } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  data.forEach((d, index) => {
    const rawX = Number(d[keys.x]);
    const rawY = Number(d[keys.y]);

    // getX handles numeric coordinates if a continuous scale is available,
    // otherwise falls back to index positioning
    const cx = typeof getX === 'function' ? getX(isNaN(rawX) ? index : rawX, data.length) : 0;
    const cy = typeof getY === 'function' ? getY(isNaN(rawY) ? 0 : rawY) : 0;

    const r = typeof options.radius === 'function' ? options.radius(d, index) : options.radius;
    const fill = typeof options.fill === 'function' ? options.fill(d, index) : options.fill;

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', Math.max(0, r));
    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', options.stroke);
    circle.setAttribute('stroke-width', options.strokeWidth);
    circle.setAttribute('opacity', options.opacity);

    svg.appendChild(circle);
  });
}