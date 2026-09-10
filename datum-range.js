import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  fill: Color.Blue,
  opacity: 0.25,
  stroke: null,
  strokeWidth: 0
};

export function range(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    yMin = 'yMin',
    yMax = 'yMax',
    fill = DEFAULT_OPTIONS.fill,
    opacity = DEFAULT_OPTIONS.opacity,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth
  } = keysAndOptions;

  // Normalize data in case tuple primitives are passed: [[10, 20], [15, 25]] -> [{ x: 1, yMin: 10, yMax: 20 }, ...]
  const normalizedData = data.map((item, index) => {
    if (Array.isArray(item)) {
      return { [x]: index + 1, [yMin]: item[0], [yMax]: item[1] };
    }
    return item;
  });

  return {
    type: 'range',
    data: normalizedData,
    keys: { x, yMin, yMax },
    options: { fill, opacity, stroke, strokeWidth }
  };
}

export function renderRangeLayer(layer, context) {
  const { svg, getX, getY } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const upperPoints = [];
  const lowerPoints = [];

  data.forEach((d, index) => {
    const px = getX(index, data.length);
    const yTopVal = Number(d[keys.yMax]) || 0;
    const yBottomVal = Number(d[keys.yMin]) || 0;

    upperPoints.push({ x: px, y: getY(yTopVal) });
    lowerPoints.push({ x: px, y: getY(yBottomVal) });
  });

  // Construct forward path along upper boundary, then backward along lower boundary
  let pathD = `M ${upperPoints[0].x} ${upperPoints[0].y} `;
  for (let i = 1; i < upperPoints.length; i++) {
    pathD += `L ${upperPoints[i].x} ${upperPoints[i].y} `;
  }

  for (let i = lowerPoints.length - 1; i >= 0; i--) {
    pathD += `L ${lowerPoints[i].x} ${lowerPoints[i].y} `;
  }
  pathD += 'Z';

  const rangePath = document.createElementNS(SVG_NS, 'path');
  rangePath.setAttribute('d', pathD.trim());
  rangePath.setAttribute('fill', options.fill);
  rangePath.setAttribute('opacity', options.opacity);

  if (options.strokeWidth > 0 && options.stroke) {
    rangePath.setAttribute('stroke', options.stroke);
    rangePath.setAttribute('stroke-width', options.strokeWidth);
    rangePath.setAttribute('stroke-linejoin', 'round');
  }

  svg.appendChild(rangePath);
}