import { DEFAULT_SERIES_COLORS } from './datum-core.js';
import { attachDiscreteTooltip } from './datum-tooltip.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  innerRadiusRatio: 0,
  padAngle: 0.02,
  stroke: '#ffffff',
  strokeWidth: 2
};

export function pie(data = [], keysAndOptions = {}) {
  const {
    label = 'label',
    value = 'value',
    colors = DEFAULT_SERIES_COLORS,
    innerRadiusRatio = DEFAULT_OPTIONS.innerRadiusRatio,
    padAngle = DEFAULT_OPTIONS.padAngle,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    tooltip
  } = keysAndOptions;

  // Normalize primitive integer arrays: [10, 20, 30] -> [{ label: '1', value: 10 }, ...]
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
      colors,
      innerRadiusRatio,
      padAngle,
      stroke,
      strokeWidth,
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

  const innerRadius = radius * Math.max(0, Math.min(0.95, options.innerRadiusRatio));
  let currentAngle = -Math.PI / 2;

  data.forEach((d, index) => {
    const rawVal = Number(d[keys.value]) || 0;
    const sliceAngle = (rawVal / total) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const sliceColor = options.colors[index % options.colors.length];

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    let pathData = '';
    if (innerRadius > 0) {
      const ix1 = centerX + innerRadius * Math.cos(endAngle);
      const iy1 = centerY + innerRadius * Math.sin(endAngle);
      const ix2 = centerX + innerRadius * Math.cos(startAngle);
      const iy2 = centerY + innerRadius * Math.sin(startAngle);

      pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
        Z
      `;
    } else {
      pathData = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
    }

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathData.trim());
    path.setAttribute('fill', sliceColor);
    path.setAttribute('stroke', options.stroke);
    path.setAttribute('stroke-width', options.strokeWidth);
    svg.appendChild(path);

    if (tooltipController && container && options.tooltip !== false) {
      attachDiscreteTooltip(
        path,
        {
          datum: d,
          index,
          value: rawVal,
          label: String(d[keys.label] ?? `Slice ${index + 1}`),
          color: sliceColor,
          formatter: options.tooltip
        },
        tooltipController,
        container
      );
    }
  });
}