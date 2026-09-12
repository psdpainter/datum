// src/datum-line.js
import { DEFAULT_SERIES_COLORS } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function line(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    stroke,
    strokeWidth = 1
  } = keysAndOptions;

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
    options: { stroke, strokeWidth }
  };
}

export function renderLineLayer(layer, context, layerIndex = 0) {
  const { svg, getX, getY } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_SERIES_COLORS[layerIndex % DEFAULT_SERIES_COLORS.length];
  const color = options.stroke || fallbackColor;
  const strokeWidth = options.strokeWidth ?? 1;

  let pathString = '';
  data.forEach((d, index) => {
    const px = getX(index, data.length);
    const py = getY(Number(d[keys.y]) || 0);
    pathString += (index === 0 ? 'M' : 'L') + ` ${px} ${py} `;
  });

  const linePath = document.createElementNS(SVG_NS, 'path');
  linePath.setAttribute('d', pathString.trim());
  linePath.setAttribute('fill', 'none');
  linePath.setAttribute('stroke', color);
  linePath.setAttribute('stroke-width', strokeWidth);
  linePath.setAttribute('stroke-linejoin', 'round');
  linePath.setAttribute('stroke-linecap', 'round');
  svg.appendChild(linePath);
}