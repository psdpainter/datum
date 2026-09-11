import { Color } from './datum-core.js';
import { attachDiscreteTooltip } from './datum-tooltip.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_PIE_COLORS = [
  Color.Blue,
  Color.Cyan,
  Color.Orange,
  Color.Purple,
  Color.Green,
  '#f43f5e',
  '#eab308',
  '#06b6d4'
];

const DEFAULT_OPTIONS = {
  innerRadius: 0,
  stroke: '#ffffff',
  strokeWidth: 2,
  opacity: 1,
  showLabels: true,
  labelPosition: 'inside',
  tooltip: null // Formatter: (datum, index, meta) => string
};

function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

function describeArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const delta = endAngle - startAngle;
  const effectiveEnd = delta >= 2 * Math.PI ? startAngle + 2 * Math.PI - 0.0001 : endAngle;
  const largeArc = (effectiveEnd - startAngle) > Math.PI ? 1 : 0;

  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, effectiveEnd);

  if (rInner > 0) {
    const p3 = polarToCartesian(cx, cy, rInner, effectiveEnd);
    const p4 = polarToCartesian(cx, cy, rInner, startAngle);
    return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
  }

  return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

export function pie(data = [], keysAndOptions = {}) {
  const {
    value = 'value',
    label = 'label',
    innerRadius = DEFAULT_OPTIONS.innerRadius,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    opacity = DEFAULT_OPTIONS.opacity,
    colors = DEFAULT_PIE_COLORS,
    showLabels = DEFAULT_OPTIONS.showLabels,
    labelPosition = DEFAULT_OPTIONS.labelPosition,
    tooltip = DEFAULT_OPTIONS.tooltip
  } = keysAndOptions;

  const normalizedData = data.map((item, index) => {
    if (typeof item === 'number') {
      return { [label]: `Item ${index + 1}`, [value]: item };
    }
    return item;
  });

  return {
    type: 'pie',
    data: normalizedData,
    keys: { value, label },
    options: { innerRadius, stroke, strokeWidth, opacity, colors, showLabels, labelPosition, tooltip }
  };
}

export function renderPieLayer(layer, context) {
  const { svg, container, tooltipController, centerX, centerY, radius } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const total = data.reduce((sum, d) => sum + (Number(d[keys.value]) || 0), 0);
  if (total <= 0) return;

  const isOutside = options.labelPosition === 'outside';
  const rOuter = radius * (isOutside ? 0.75 : 0.9);
  const rInner = options.innerRadius < 1 
    ? rOuter * options.innerRadius 
    : Math.min(options.innerRadius, rOuter - 5);

  let currentAngle = -Math.PI / 2;

  data.forEach((d, index) => {
    const val = Number(d[keys.value]) || 0;
    const sliceAngle = (val / total) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const fillColor = Array.isArray(options.colors)
      ? options.colors[index % options.colors.length]
      : DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length];

    // 1. Slice Path
    const pathD = describeArc(centerX, centerY, rOuter, rInner, startAngle, endAngle);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', fillColor);
    path.setAttribute('opacity', options.opacity);

    if (options.strokeWidth > 0 && data.length > 1) {
      path.setAttribute('stroke', options.stroke);
      path.setAttribute('stroke-width', options.strokeWidth);
    }
    svg.appendChild(path);

    // Attach discrete hover tooltip
    if (tooltipController && container && options.tooltip !== false) {
      attachDiscreteTooltip(
        path,
        {
          datum: d,
          index,
          value: val,
          label: d[keys.label] ?? `Slice ${index + 1}`,
          percent: Math.round((val / total) * 100),
          color: fillColor,
          formatter: options.tooltip
        },
        tooltipController,
        container
      );
    }

    // 2. Centered Labels
    if (options.showLabels && sliceAngle > 0.05) {
      const midAngle = (startAngle + endAngle) / 2;
      const percent = Math.round((val / total) * 100);

      const labelDist = isOutside ? rOuter + 16 : (rInner > 0 ? (rOuter + rInner) / 2 : rOuter * 0.65);
      const pos = polarToCartesian(centerX, centerY, labelDist, midAngle);

      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('fill', isOutside ? '#374151' : '#ffffff');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', '600');
      text.setAttribute('font-family', 'system-ui, sans-serif');
      text.style.pointerEvents = 'none';
      text.textContent = `${percent}%`;
      svg.appendChild(text);
    }
  });
}