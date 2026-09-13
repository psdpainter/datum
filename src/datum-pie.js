import { DEFAULT_SERIES_COLORS } from './datum-core.js';
import { attachDiscreteTooltip } from './datum-tooltip.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  innerRadius: 0,        // 0 for standard pie; decimal (0.6) or pixels for donut
  stroke: '#ffffff',
  strokeWidth: 2,
  opacity: 1,
  showLabels: true,
  labelPosition: 'inside' // 'inside' | 'outside'
};

function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

function describeArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const delta = endAngle - startAngle;
  // Guard against SVG zero-length arc breakdown on 360-degree slices
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
    label = 'label',
    value = 'value',
    // Support either innerRadius or innerRadiusRatio
    innerRadius = keysAndOptions.innerRadiusRatio ?? DEFAULT_OPTIONS.innerRadius,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    opacity = DEFAULT_OPTIONS.opacity,
    colors = DEFAULT_SERIES_COLORS,
    showLabels = DEFAULT_OPTIONS.showLabels,
    labelPosition = DEFAULT_OPTIONS.labelPosition,
    tooltip
  } = keysAndOptions;

  // Normalize primitive number arrays: [30, 70] -> [{ label: '1', value: 30 }, { label: '2', value: 70 }]
  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return { [label]: String(index + 1), [value]: item };
    }
    return item;
  });

  return {
    type: 'pie',
    data: normalizedData,
    keys: { label, value },
    options: {
      innerRadius,
      stroke,
      strokeWidth,
      opacity,
      colors,
      showLabels,
      labelPosition,
      tooltip
    }
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

  // Calculate inner radius (handles ratios like 0.6 or absolute pixel values)
  const rInner = options.innerRadius < 1 
    ? rOuter * Math.max(0, options.innerRadius) 
    : Math.min(options.innerRadius, rOuter - 5);

  let currentAngle = -Math.PI / 2; // Start at 12 o'clock

  data.forEach((d, index) => {
    const rawVal = Number(d[keys.value]) || 0;
    const sliceAngle = (rawVal / total) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const sliceColor = options.colors[index % options.colors.length];

    // 1. Draw Slice Path
    const pathD = describeArc(centerX, centerY, rOuter, rInner, startAngle, endAngle);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathD.trim());
    path.setAttribute('fill', sliceColor);
    path.setAttribute('opacity', options.opacity);

    if (options.strokeWidth > 0 && data.length > 1) {
      path.setAttribute('stroke', options.stroke);
      path.setAttribute('stroke-width', options.strokeWidth);
    }
    svg.appendChild(path);

    // 2. Attach Discrete Tooltip
    if (tooltipController && container && options.tooltip !== false) {
      attachDiscreteTooltip(
        path,
        {
          datum: d,
          index,
          value: rawVal,
          label: String(d[keys.label] ?? `Slice ${index + 1}`),
          percent: Math.round((rawVal / total) * 100),
          color: sliceColor,
          formatter: typeof options.tooltip === 'function' ? options.tooltip : null,
          tooltipConfig: typeof options.tooltip === 'object' ? options.tooltip : {}
        },
        tooltipController,
        container
      );
    }

    // 3. Render Slice Labels
    if (options.showLabels && sliceAngle > 0.05) {
      const midAngle = (startAngle + endAngle) / 2;
      const percent = Math.round((rawVal / total) * 100);

      const labelDist = isOutside 
        ? rOuter + 16 
        : (rInner > 0 ? (rOuter + rInner) / 2 : rOuter * 0.65);

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