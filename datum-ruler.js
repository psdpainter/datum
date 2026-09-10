import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  direction: 'horizontal',
  stroke: Color.Grey,
  strokeWidth: 1,
  dashed: false,
  dashArray: '4 4'
};

export function ruler(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    value,
    direction = DEFAULT_OPTIONS.direction,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    dashed = DEFAULT_OPTIONS.dashed,
    dashArray = DEFAULT_OPTIONS.dashArray
  } = keysAndOptions;

  return {
    type: 'ruler',
    data,
    keys: { x, y },
    options: { value, direction, stroke, strokeWidth, dashed, dashArray }
  };
}

export function renderRulerLayer(layer, context) {
  const { svg, getX, getY, width, height, padding, categories } = context;
  const { data, keys, options } = layer;

  const plotLeft = padding.left;
  const plotRight = width - padding.right;
  const plotTop = padding.top;
  const plotBottom = height - padding.bottom;

  // Resolve target value from options.value or the first data item
  const targetVal = options.value ?? (data.length > 0 ? (options.direction === 'vertical' ? data[0][keys.x] : data[0][keys.y]) : null);

  if (targetVal == null) return;

  const lineEl = document.createElementNS(SVG_NS, 'line');
  lineEl.setAttribute('stroke', options.stroke);
  lineEl.setAttribute('stroke-width', options.strokeWidth);

  // Apply dashed stroke only when explicitly enabled
  if (options.dashed) {
    lineEl.setAttribute('stroke-dasharray', options.dashArray);
  }

  if (options.direction === 'vertical') {
    const index = categories ? categories.indexOf(targetVal) : -1;
    const xCoord = getX(index >= 0 ? index : 0);

    lineEl.setAttribute('x1', xCoord);
    lineEl.setAttribute('x2', xCoord);
    lineEl.setAttribute('y1', plotTop);
    lineEl.setAttribute('y2', plotBottom);
  } else {
    const yCoord = getY(Number(targetVal) || 0);

    lineEl.setAttribute('x1', plotLeft);
    lineEl.setAttribute('x2', plotRight);
    lineEl.setAttribute('y1', yCoord);
    lineEl.setAttribute('y2', yCoord);
  }

  svg.appendChild(lineEl);
}