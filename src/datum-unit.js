import { Color, DEFAULT_SERIES_COLORS } from './datum-core.js';
import { attachDiscreteTooltip } from './datum-tooltip.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  unitValue: 1,       // How many data units each icon/square represents
  columns: 10,        // Max items per row before wrapping
  shape: 'rect',      // 'rect' | 'circle'
  size: 14,           // Dimension (width/height or diameter) in pixels
  gap: 4,             // Gap between units in pixels
  rx: 2,              // Corner radius for rects
  fill: null,
  opacity: 1,
  stroke: null,
  strokeWidth: 0
};

export function unit(data = [], keysAndOptions = {}) {
  const {
    label = 'label',
    value = 'value',
    unitValue = DEFAULT_OPTIONS.unitValue,
    columns = DEFAULT_OPTIONS.columns,
    shape = DEFAULT_OPTIONS.shape,
    size = DEFAULT_OPTIONS.size,
    gap = DEFAULT_OPTIONS.gap,
    rx = DEFAULT_OPTIONS.rx,
    fill = DEFAULT_OPTIONS.fill,
    opacity = DEFAULT_OPTIONS.opacity,
    stroke = DEFAULT_OPTIONS.stroke,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    name,
    tooltip
  } = keysAndOptions;

  // Normalize primitive number arrays: [12, 18] -> [{ label: '1', value: 12 }, ...]
  const normalizedData = (data || []).map((item, index) => {
    if (typeof item === 'number') {
      return { [label]: String(index + 1), [value]: item };
    }
    return item;
  });

  return {
    type: 'unit',
    data: normalizedData,
    keys: { label, value },
    options: {
      unitValue,
      columns,
      shape,
      size,
      gap,
      rx,
      fill,
      opacity,
      stroke,
      strokeWidth,
      name,
      tooltip
    }
  };
}

export function renderUnitLayer(layer, context, layerIndex = 0) {
  const { svg, container, tooltipController, plotLeft, plotTop, plotWidth, plotHeight } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  const fallbackColor = DEFAULT_SERIES_COLORS[layerIndex % DEFAULT_SERIES_COLORS.length];
  const { unitValue, columns, shape, size, gap, rx, opacity, stroke, strokeWidth } = options;

  // Expand each datum item into an array of discrete unit tokens
  const units = [];
  data.forEach((d, groupIndex) => {
    const rawVal = Number(d[keys.value]) || 0;
    const count = Math.max(0, Math.round(rawVal / unitValue));
    const groupColor = options.fill || DEFAULT_SERIES_COLORS[groupIndex % DEFAULT_SERIES_COLORS.length] || fallbackColor;
    const groupLabel = String(d[keys.label] ?? `Group ${groupIndex + 1}`);

    for (let i = 0; i < count; i++) {
      units.push({
        groupIndex,
        unitIndex: i,
        totalUnits: count,
        color: groupColor,
        label: groupLabel,
        rawVal,
        datum: d
      });
    }
  });

  if (units.length === 0) return;

  const step = size + gap;
  const totalRows = Math.ceil(units.length / columns);
  const gridWidth = Math.min(units.length, columns) * step - gap;
  const gridHeight = totalRows * step - gap;

  // Center the unit grid inside the available plot canvas
  const startX = plotLeft + Math.max(0, (plotWidth - gridWidth) / 2);
  const startY = plotTop + Math.max(0, (plotHeight - gridHeight) / 2);

  units.forEach((u, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    const x = startX + col * step;
    const y = startY + row * step;

    let mark;
    if (shape === 'circle') {
      mark = document.createElementNS(SVG_NS, 'circle');
      mark.setAttribute('cx', x + size / 2);
      mark.setAttribute('cy', y + size / 2);
      mark.setAttribute('r', size / 2);
    } else {
      mark = document.createElementNS(SVG_NS, 'rect');
      mark.setAttribute('x', x);
      mark.setAttribute('y', y);
      mark.setAttribute('width', size);
      mark.setAttribute('height', size);
      if (rx > 0) mark.setAttribute('rx', rx);
    }

    mark.setAttribute('fill', u.color);
    mark.setAttribute('opacity', opacity);

    if (stroke && strokeWidth > 0) {
      mark.setAttribute('stroke', stroke);
      mark.setAttribute('stroke-width', strokeWidth);
    }

    svg.appendChild(mark);

    // Attach hover inspection
    if (tooltipController && container && options.tooltip !== false) {
      attachDiscreteTooltip(
        mark,
        {
          datum: u.datum,
          index: u.groupIndex,
          value: u.rawVal,
          label: `${u.label} (${index + 1}/${units.length})`,
          color: u.color,
          formatter: typeof options.tooltip === 'function' ? options.tooltip : null,
          tooltipConfig: typeof options.tooltip === 'object' ? options.tooltip : {}
        },
        tooltipController,
        container
      );
    }
  });
}