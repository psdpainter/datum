import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  bins: 10,              // target bin count
  binRange: null,        // optional explicit [min, max]
  fill: Color.Blue,
  stroke: '#ffffff',     // subtle separator between contiguous bins
  strokeWidth: 1,
  opacity: 0.85,
  rx: 0
};

// Helper to compute bins from continuous values
function createHistogramBins(values, binCountTarget, rangeOverride) {
  if (values.length === 0) return [];

  const minVal = rangeOverride ? rangeOverride[0] : Math.min(...values);
  const maxVal = rangeOverride ? rangeOverride[1] : Math.max(...values);
  const span = maxVal - minVal;

  // Protect against uniform datasets
  const binCount = span === 0 ? 1 : Math.max(1, binCountTarget);
  const step = span === 0 ? 1 : span / binCount;

  const bins = [];
  for (let i = 0; i < binCount; i++) {
    const x0 = minVal + i * step;
    const x1 = i === binCount - 1 ? maxVal : x0 + step;
    bins.push({
      x0,
      x1,
      label: `${Math.round(x0)}–${Math.round(x1)}`,
      count: 0
    });
  }

  // Populate frequencies
  values.forEach(v => {
    if (v < minVal || v > maxVal) return;
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      const isLast = i === bins.length - 1;
      if (v >= bins[i].x0 && (isLast ? v <= bins[i].x1 : v < bins[i].x1)) {
        bins[i].count++;
        placed = true;
        break;
      }
    }
  });

  return bins;
}

// Layer descriptor factory
export function histogram(data = [], keysAndOptions = {}) {
  const {
    value = 'value',
    bins = DEFAULT_OPTIONS.bins,
    binRange = DEFAULT_OPTIONS.binRange,
    fill = DEFAULT_OPTIONS.fill,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    opacity = DEFAULT_OPTIONS.opacity,
    rx = DEFAULT_OPTIONS.rx
  } = keysAndOptions;

  // Extract raw numbers from numbers array or objects
  const rawValues = data
    .map(item => (typeof item === 'object' && item !== null ? item[value] : item))
    .map(Number)
    .filter(v => !isNaN(v));

  // Pre-bin the data into frequency bands
  const computedBins = createHistogramBins(rawValues, bins, binRange);

  // Format into standard datum items so orchestrator can read categories & values
  const transformedData = computedBins.map(b => ({
    binLabel: b.label,
    frequency: b.count,
    x0: b.x0,
    x1: b.x1
  }));

  return {
    type: 'histogram',
    data: transformedData,
    keys: { x: 'binLabel', y: 'frequency' },
    options: { fill, stroke, strokeWidth, opacity, rx }
  };
}

// Layer renderer (called by orchestrator)
export function renderHistogramLayer(layer, context) {
  const { svg, getY, getBand, plotBottom } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  data.forEach((d, index) => {
    // Histogram bars occupy the full slot (no categorical padding)
    const band = getBand ? getBand(index) : { x: 0, width: 20 };
    const rawVal = Number(d[keys.y]) || 0;

    const yTop = getY(rawVal);
    const rectHeight = Math.max(0, plotBottom - yTop);

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', band.x);
    rect.setAttribute('y', yTop);
    rect.setAttribute('width', Math.max(1, band.width));
    rect.setAttribute('height', rectHeight);
    rect.setAttribute('fill', options.fill);
    rect.setAttribute('opacity', options.opacity);
    rect.setAttribute('rx', options.rx);

    if (options.strokeWidth > 0) {
      rect.setAttribute('stroke', options.stroke);
      rect.setAttribute('stroke-width', options.strokeWidth);
    }

    svg.appendChild(rect);
  });
}