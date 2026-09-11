import { Color } from './datum-core.js';
import { attachDiscreteTooltip } from './datum-tooltip.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  minColor: '#e0f2fe',
  maxColor: Color.Blue || '#2563eb',
  stroke: '#ffffff',
  strokeWidth: 2,
  rx: 3,
  showValues: false,
  valueColor: '#1e293b',
  tooltip: null
};

function interpolateColor(color1, color2, factor) {
  const parseHex = (hex) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
}

export function heatmap(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    value = 'value',
    minColor = DEFAULT_OPTIONS.minColor,
    maxColor = DEFAULT_OPTIONS.maxColor,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    rx = DEFAULT_OPTIONS.rx,
    showValues = DEFAULT_OPTIONS.showValues,
    valueColor = DEFAULT_OPTIONS.valueColor,
    tooltip = DEFAULT_OPTIONS.tooltip
  } = keysAndOptions;

  let normalizedData = [];
  if (Array.isArray(data) && Array.isArray(data[0])) {
    data.forEach((row, rowIndex) => {
      row.forEach((val, colIndex) => {
        normalizedData.push({
          [x]: colIndex + 1,
          [y]: rowIndex + 1,
          [value]: Number(val) || 0
        });
      });
    });
  } else {
    normalizedData = data;
  }

  return {
    type: 'heatmap',
    data: normalizedData,
    keys: { x, y, value },
    options: { minColor, maxColor, stroke, strokeWidth, rx, showValues, valueColor, tooltip }
  };
}

export function renderHeatmapLayer(layer, context) {
  const { svg, container, tooltipController, getBand, getYBand, valueMin = 0, valueMax = 100 } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const vSpan = valueMax - valueMin || 1;

  data.forEach((d, index) => {
    const rawVal = Number(d[keys.value]) || 0;
    const factor = Math.max(0, Math.min(1, (rawVal - valueMin) / vSpan));
    const cellColor = interpolateColor(options.minColor, options.maxColor, factor);

    const xBand = getBand(d[keys.x]);
    const yBand = getYBand(d[keys.y]);

    if (!xBand || !yBand) return;

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', xBand.x);
    rect.setAttribute('y', yBand.y);
    rect.setAttribute('width', Math.max(1, xBand.width));
    rect.setAttribute('height', Math.max(1, yBand.height));
    rect.setAttribute('fill', cellColor);
    rect.setAttribute('rx', options.rx);

    if (options.strokeWidth > 0) {
      rect.setAttribute('stroke', options.stroke);
      rect.setAttribute('stroke-width', options.strokeWidth);
    }

    svg.appendChild(rect);

    if (tooltipController && container && options.tooltip !== false) {
      attachDiscreteTooltip(
        rect,
        {
          datum: d,
          index,
          value: rawVal,
          label: `${d[keys.x]} × ${d[keys.y]}`,
          color: cellColor,
          formatter: options.tooltip
        },
        tooltipController,
        container
      );
    }

    if (options.showValues) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', xBand.center);
      text.setAttribute('y', yBand.center);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('fill', factor > 0.65 ? '#ffffff' : options.valueColor);
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', '500');
      text.setAttribute('font-family', 'system-ui, sans-serif');
      text.style.pointerEvents = 'none';
      text.textContent = rawVal;
      svg.appendChild(text);
    }
  });
}