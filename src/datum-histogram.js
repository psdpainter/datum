import { DEFAULT_SERIES_COLORS } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  bins: 6,
  stroke: '#ffffff',
  strokeWidth: 1,
  rx: 2,
  opacity: 1
};

export function histogram(data = [], keysAndOptions = {}) {
  const {
    bins = DEFAULT_OPTIONS.bins,
    fill,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    rx = DEFAULT_OPTIONS.rx,
    opacity = DEFAULT_OPTIONS.opacity
  } = keysAndOptions;

  // Extract raw numbers whether passed as primitives or objects with a value key
  const values = (data || [])
    .map(d => (typeof d === 'number' ? d : Number(d.value ?? d.y ?? 0)))
    .filter(v => !isNaN(v));

  let binData = [];
  if (values.length > 0) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const rangeVal = max - min || 1;
    const binSize = rangeVal / bins;

    binData = Array.from({ length: bins }, (_, i) => {
      const bMin = min + i * binSize;
      const bMax = bMin + binSize;
      return {
        bin: `${Math.round(bMin)}-${Math.round(bMax)}`,
        count: 0
      };
    });

    values.forEach(v => {
      let bIndex = Math.floor((v - min) / binSize);
      if (bIndex >= bins) bIndex = bins - 1;
      binData[bIndex].count++;
    });
  }

  return {
    type: 'histogram',
    data: binData,
    keys: { x: 'bin', y: 'count' },
    options: { bins, fill, stroke, strokeWidth, rx, opacity }
  };
}

export function renderHistogramLayer(layer, context, layerIndex = 0) {
  const { svg, getY, getBand, plotBottom } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_SERIES_COLORS[layerIndex % DEFAULT_SERIES_COLORS.length];
  const fillColor = options.fill || fallbackColor;

  data.forEach((d, index) => {
    const band = getBand(index);
    const rawVal = Number(d[keys.y]) || 0;
    const yTop = getY(rawVal);
    const rectHeight = Math.max(0, plotBottom - yTop);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', band.x);
    rect.setAttribute('y', yTop);
    rect.setAttribute('width', Math.max(1, band.width));
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