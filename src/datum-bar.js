// src/datum-bar.js
import { DEFAULT_SERIES_COLORS, generateGuid } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  fill: null,
  stroke: null,
  strokeWidth: 0,
  rx: 2,
  opacity: 1,
  gradient: false
};

export function bar(data = [], keysAndOptions = {}) {
  const {
    name,
    x = 'x',
    y = 'y',
    fill = DEFAULT_OPTIONS.fill,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    rx = DEFAULT_OPTIONS.rx,
    opacity = DEFAULT_OPTIONS.opacity,
    gradient = DEFAULT_OPTIONS.gradient,
    stackId = null
  } = keysAndOptions;

  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return { [x]: index + 1, [y]: item };
    }
    return item;
  });

  return {
    type: 'bar',
    data: normalizedData,
    keys: { x, y },
    options: { name, fill, stroke, strokeWidth, rx, opacity, gradient, stackId }
  };
}

export function renderBarLayer(layer, context, barMeta) {
  const { svg, getY, getBand, plotBottom } = context;
  const { data, keys, options } = layer;
  const { barIndex, totalBarsInGroup, barGroupMode, stackOffsets } = barMeta;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_SERIES_COLORS[barIndex % DEFAULT_SERIES_COLORS.length];
  layer.resolvedFillColors = [];
  const gradientFills = new Map();
  let defs;
  let gradientTop;
  let gradientBottom;
  if (options.gradient === true) {
    // Match an area's bounding-box fade, shared by every bar in this layer.
    // Resolve stacked bounds before rendering mutates the stack offsets.
    gradientTop = Infinity;
    gradientBottom = -Infinity;
    data.forEach((d, index) => {
      const value = Number(d[keys.y]) || 0;
      const bottomValue = barGroupMode === 'stacked' ? stackOffsets[index] || 0 : 0;
      const top = getY(bottomValue + value);
      const bottom = barGroupMode === 'stacked' ? getY(bottomValue) : plotBottom;
      gradientTop = Math.min(gradientTop, top);
      gradientBottom = Math.max(gradientBottom, top + Math.max(0, bottom - top));
    });
    if (gradientBottom === gradientTop) gradientBottom = gradientTop + 1;
    defs = document.createElementNS(SVG_NS, 'defs');
    svg.appendChild(defs);
  }

  data.forEach((d, catIndex) => {
    const fillColor = (typeof options.fill === 'function'
      ? options.fill(d, catIndex, data)
      : options.fill) || fallbackColor;
    layer.resolvedFillColors[catIndex] = fillColor;
    let finalFill = fillColor;
    if (defs) {
      if (!gradientFills.has(fillColor)) {
        const gradientId = `datum-grad-${generateGuid()}`;
        const linearGradient = document.createElementNS(SVG_NS, 'linearGradient');
        linearGradient.setAttribute('id', gradientId);
        linearGradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        linearGradient.setAttribute('x1', 0);
        linearGradient.setAttribute('y1', gradientTop);
        linearGradient.setAttribute('x2', 0);
        linearGradient.setAttribute('y2', gradientBottom);
        for (const [offset, opacity] of [['0%', options.opacity], ['100%', 0]]) {
          const stop = document.createElementNS(SVG_NS, 'stop');
          stop.setAttribute('offset', offset);
          stop.setAttribute('stop-color', fillColor);
          stop.setAttribute('stop-opacity', opacity);
          linearGradient.appendChild(stop);
        }
        defs.appendChild(linearGradient);
        gradientFills.set(fillColor, `url(#${gradientId})`);
      }
      finalFill = gradientFills.get(fillColor);
    }
    const band = getBand(catIndex);
    const rawVal = Number(d[keys.y]) || 0;

    let barX = band.x;
    let barWidth = band.width;
    let yTop = getY(rawVal);
    let yBottom = plotBottom;

    if (barGroupMode === 'grouped') {
      const subBarWidth = band.width / totalBarsInGroup;
      barX = band.x + barIndex * subBarWidth;
      barWidth = subBarWidth * 0.9;
    } else if (barGroupMode === 'stacked') {
      const currentStackBottom = stackOffsets[catIndex] || 0;
      const currentStackTop = currentStackBottom + rawVal;

      yBottom = getY(currentStackBottom);
      yTop = getY(currentStackTop);
      stackOffsets[catIndex] = currentStackTop;
    }

    const rectHeight = Math.max(0, yBottom - yTop);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', barX);
    rect.setAttribute('y', yTop);
    rect.setAttribute('width', Math.max(1, barWidth));
    rect.setAttribute('height', rectHeight);
    rect.setAttribute('fill', finalFill);
    rect.setAttribute('rx', options.rx);
    if (!defs) rect.setAttribute('opacity', options.opacity);

    if (options.stroke) {
      rect.setAttribute('stroke', options.stroke);
      rect.setAttribute('stroke-width', options.strokeWidth);
      if (defs) rect.setAttribute('stroke-opacity', options.opacity);
    }

    svg.appendChild(rect);
  });
}
