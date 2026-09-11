const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_DOT_COLORS = [
  '#1a73e8', // Blue
  '#12b5cb', // Cyan
  '#e37400', // Orange
  '#a142f4', // Purple
  '#1e8e3e'  // Green
];

const DEFAULT_OPTIONS = {
  radius: 4,
  fill: '#ffffff',
  strokeWidth: 2
};

// Layer descriptor factory
export function dot(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    y = 'y',
    radius = DEFAULT_OPTIONS.radius,
    fill = DEFAULT_OPTIONS.fill,
    stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth
  } = keysAndOptions;

  return {
    type: 'dot',
    data,
    keys: { x, y },
    options: { radius, fill, stroke, strokeWidth }
  };
}

// Layer renderer (called by orchestrator)
export function renderDotLayer(layer, context, layerIndex = 0) {
  const { svg, getX, getY } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  // Fallback to palette color if explicit stroke is not provided
  const fallbackColor = DEFAULT_DOT_COLORS[layerIndex % DEFAULT_DOT_COLORS.length];
  const strokeColor = options.stroke || fallbackColor;

  data.forEach((d, index) => {
    const px = getX(index, data.length);
    const py = getY(Number(d[keys.y]) || 0);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', px);
    circle.setAttribute('cy', py);
    circle.setAttribute('r', options.radius);
    circle.setAttribute('fill', options.fill);
    circle.setAttribute('stroke', strokeColor);
    circle.setAttribute('stroke-width', options.strokeWidth);

    svg.appendChild(circle);
  });
}