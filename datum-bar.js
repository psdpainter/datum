import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_BAR_COLORS = [
  Color.Blue,
  Color.Cyan,
  Color.Orange,
  Color.Purple,
  Color.Green
];

const DEFAULT_OPTIONS = {
  fill: null,
  stroke: null,
  strokeWidth: 0,
  rx: 0,
  opacity: 1
};

export function bar(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    fill = DEFAULT_OPTIONS.fill,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    rx = DEFAULT_OPTIONS.rx,
    opacity = DEFAULT_OPTIONS.opacity,
    stackId = null
  } = keysAndOptions;

  // Normalize primitive number arrays: [0.42, 0.88] -> [{ x: 0, y: 0.42 }, { x: 1, y: 0.88 }]
  const normalizedData = data.map((item, index) => {
    if (typeof item === 'number') {
      return { [x]: index + 1, [y]: item };
    }
    return item;
  });

  return {
    type: 'bar',
    data: normalizedData,
    keys: { x, y },
    options: { fill, stroke, strokeWidth, rx, opacity, stackId }
  };
}

export function renderBarLayer(layer, context, barMeta) {
  const { svg, getY, getBand, plotBottom } = context;
  const { data, keys, options } = layer;
  const { barIndex, totalBarsInGroup, barGroupMode, stackOffsets } = barMeta;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_BAR_COLORS[barIndex % DEFAULT_BAR_COLORS.length];
  const fillColor = options.fill || fallbackColor;

  data.forEach((d, catIndex) => {
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
    rect.setAttribute('fill', fillColor);
    rect.setAttribute('rx', options.rx);
    rect.setAttribute('opacity', options.opacity);

    if (options.stroke) {
      rect.setAttribute('stroke', options.stroke);
      rect.setAttribute('stroke-width', options.strokeWidth);
    }

    svg.appendChild(rect);
  });
}