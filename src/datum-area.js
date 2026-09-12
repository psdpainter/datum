import { DEFAULT_SERIES_COLORS, generateGuid } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  opacity: 0.25,
  gradient: false
};

// Layer descriptor factory
export function area(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    fill,
    opacity = DEFAULT_OPTIONS.opacity,
    gradient = DEFAULT_OPTIONS.gradient
  } = keysAndOptions;

  // Normalize primitive number arrays: [10, 25, ...] -> [{ x: 1, y: 10 }, { x: 2, y: 25 }, ...]
  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return { [x]: index + 1, [y]: item };
    }
    return item;
  });

  return {
    type: 'area',
    data: normalizedData,
    keys: { x, y },
    options: { fill, opacity, gradient }
  };
}

// Layer renderer (called by orchestrator)
export function renderAreaLayer(layer, context, layerIndex = 0) {
  const { svg, getX, getY, height, padding, plotBottom } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  // Fallback to shared Material Design series cycle
  const fallbackColor = DEFAULT_SERIES_COLORS[layerIndex % DEFAULT_SERIES_COLORS.length];
  const fillColor = options.fill || fallbackColor;
  const baselineY = plotBottom !== undefined ? plotBottom : height - padding.bottom;

  let finalFill = fillColor;

  // 1. Conditionally inject <linearGradient> if gradient: true
  if (options.gradient === true) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }

    const gradientId = `datum-grad-${generateGuid()}`;
    const linearGradient = document.createElementNS(SVG_NS, 'linearGradient');
    linearGradient.setAttribute('id', gradientId);
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '0%');
    linearGradient.setAttribute('y2', '100%');

    // Top stop: defined color and opacity
    const stopTop = document.createElementNS(SVG_NS, 'stop');
    stopTop.setAttribute('offset', '0%');
    stopTop.setAttribute('stop-color', fillColor);
    stopTop.setAttribute('stop-opacity', options.opacity);
    linearGradient.appendChild(stopTop);

    // Bottom stop: fade to zero opacity
    const stopBottom = document.createElementNS(SVG_NS, 'stop');
    stopBottom.setAttribute('offset', '100%');
    stopBottom.setAttribute('stop-color', fillColor);
    stopBottom.setAttribute('stop-opacity', '0');
    linearGradient.appendChild(stopBottom);

    defs.appendChild(linearGradient);
    finalFill = `url(#${gradientId})`;
  }

  // 2. Build the path geometry
  let pathString = '';
  const firstX = getX(0, data.length);
  const lastX = getX(data.length - 1, data.length);

  data.forEach((d, index) => {
    const px = getX(index, data.length);
    const py = getY(Number(d[keys.y]) || 0);
    pathString += (index === 0 ? 'M' : 'L') + ` ${px} ${py} `;
  });

  // Close the path down to the baseline
  pathString += `L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  const areaPath = document.createElementNS(SVG_NS, 'path');
  areaPath.setAttribute('d', pathString.trim());
  areaPath.setAttribute('fill', finalFill);
  if (!options.gradient) {
    areaPath.setAttribute('fill-opacity', options.opacity);
  }
  areaPath.setAttribute('stroke', 'none');

  // Insert before other elements in this layer
  svg.appendChild(areaPath);
}