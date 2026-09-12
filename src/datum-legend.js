import { DEFAULT_SERIES_COLORS } from './datum-core.js';

const PALETTE = DEFAULT_SERIES_COLORS;
const SVG_NS = 'http://www.w3.org/2000/svg';
const FONT_SIZE = 11;

function isBlankColor(color) {
  if (!color || typeof color !== 'string') return true;
  const s = color.trim().toLowerCase();
  return (
    s === 'none' ||
    s === 'transparent' ||
    s === '#fff' ||
    s === '#ffffff' ||
    s === 'white' ||
    s.startsWith('rgba(0, 0, 0, 0)') ||
    s.startsWith('rgba(255, 255, 255')
  );
}

function resolveSeriesColor(layer, fallbackIndex = 0) {
  const opts = layer.options || {};
  const defaultFallback = PALETTE[fallbackIndex % PALETTE.length];

  if (layer.type === 'line' && opts.stroke && !isBlankColor(opts.stroke)) return opts.stroke;
  if ((layer.type === 'dot' || layer.type === 'scatter') && opts.stroke && isBlankColor(opts.fill)) return opts.stroke;
  if (opts.fill && typeof opts.fill === 'string' && !isBlankColor(opts.fill)) return opts.fill;
  if (opts.stroke && typeof opts.stroke === 'string' && !isBlankColor(opts.stroke)) return opts.stroke;
  if (opts.upColor && !isBlankColor(opts.upColor)) return opts.upColor;
  if (opts.color && !isBlankColor(opts.color)) return opts.color;

  if (Array.isArray(opts.colors) && opts.colors.length > 0) {
    const c = opts.colors[fallbackIndex % opts.colors.length];
    if (c && !isBlankColor(c)) return c;
  }

  if (typeof opts.fill === 'function') {
    try {
      const sample = opts.fill(layer.data?.[0], 0);
      if (sample && typeof sample === 'string' && !isBlankColor(sample)) return sample;
    } catch (_) {}
  }

  return defaultFallback;
}

export function renderLegend(svg, layers, renderedLayerGroups, options = {}) {
  const { width, height, padding } = options;
  const legendItems = [];

  layers.forEach((layer, layerIndex) => {
    if (layer.options?.showInLegend === false || layer.options?.legend === false) return;

    const group = renderedLayerGroups[layerIndex];

    if (layer.type === 'pie') {
      const sliceNodes = group ? Array.from(group.querySelectorAll('path')) : [];
      const labelNodes = group ? Array.from(group.querySelectorAll('text')) : [];

      layer.data.forEach((d, itemIndex) => {
        const sliceLabel = String(d[layer.keys.label] ?? `Slice ${itemIndex + 1}`);
        let sliceColor = Array.isArray(layer.options?.colors)
          ? layer.options.colors[itemIndex % layer.options.colors.length]
          : null;
        if (isBlankColor(sliceColor)) {
          sliceColor = PALETTE[itemIndex % PALETTE.length];
        }

        legendItems.push({
          label: sliceLabel,
          color: sliceColor,
          visible: true,
          onToggle(visible) {
            const targetOpacity = visible ? '1' : '0';
            const pointerStyle = visible ? 'auto' : 'none';
            if (sliceNodes[itemIndex]) {
              sliceNodes[itemIndex].style.opacity = targetOpacity;
              sliceNodes[itemIndex].style.pointerEvents = pointerStyle;
            }
            if (labelNodes[itemIndex]) {
              labelNodes[itemIndex].style.opacity = targetOpacity;
              labelNodes[itemIndex].style.pointerEvents = pointerStyle;
            }
          }
        });
      });
      return;
    }

    const layerLabel = String(
      layer.options?.name ??
      layer.options?.label ??
      (layer.type === 'bar' ? `Series ${layerIndex + 1}` :
       layer.type === 'candlestick' ? 'Candlesticks' :
       layer.type === 'range' ? 'Range' :
       `Series ${layerIndex + 1}`)
    );

    const color = resolveSeriesColor(layer, layerIndex);

    legendItems.push({
      label: layerLabel,
      color,
      visible: true,
      onToggle(visible) {
        if (group) {
          group.style.opacity = visible ? '1' : '0';
          group.style.pointerEvents = visible ? 'auto' : 'none';
        }
      }
    });
  });

  if (legendItems.length === 0) return;

  const legendGroup = document.createElementNS(SVG_NS, 'g');
  legendGroup.setAttribute('class', 'datum-legend');
  svg.appendChild(legendGroup);

  const itemSpacing = 20;
  const swatchSize = 10;
  let currentX = 0;

  legendItems.forEach(item => {
    const itemG = document.createElementNS(SVG_NS, 'g');
    itemG.setAttribute('class', 'datum-legend-item');

    const swatch = document.createElementNS(SVG_NS, 'rect');
    swatch.setAttribute('class', 'datum-legend-swatch');
    swatch.setAttribute('x', currentX);
    swatch.setAttribute('y', -swatchSize / 2);
    swatch.setAttribute('width', swatchSize);
    swatch.setAttribute('height', swatchSize);
    swatch.setAttribute('fill', item.color);
    itemG.appendChild(swatch);

    const labelStr = String(item.label ?? '');
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('class', 'datum-legend-text datum-ff datum-fs-sm datum-fw-400 datum-color-body');
    text.setAttribute('x', currentX + swatchSize + 6);
    text.setAttribute('y', 0);
    text.textContent = labelStr;
    itemG.appendChild(text);

    const textWidth = Math.max(10, labelStr.length * (FONT_SIZE * 0.58));
    const totalItemWidth = swatchSize + 6 + textWidth;

    itemG.addEventListener('click', () => {
      item.visible = !item.visible;
      item.onToggle(item.visible);

      if (item.visible) {
        itemG.classList.remove('datum-legend-item-disabled');
      } else {
        itemG.classList.add('datum-legend-item-disabled');
      }
    });

    legendGroup.appendChild(itemG);
    currentX += totalItemWidth + itemSpacing;
  });

  const totalLegendWidth = currentX - itemSpacing;
  const legendX = Math.max(padding.left, (width - totalLegendWidth) / 2);
  const legendY = height - 12;
  legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);
}