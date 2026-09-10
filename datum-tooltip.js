const SVG_NS = 'http://www.w3.org/2000/svg';

export function createTooltipController(container, globalConfig = {}) {
  let tooltipEl = container.querySelector('.datum-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'datum-tooltip datum-ff datum-fs-sm';
    container.appendChild(tooltipEl);
  }

  return {
    show(content, x, y, customStyle = {}) {
      if (!content) {
        this.hide();
        return;
      }

      const mergedStyle = Object.assign({}, globalConfig, customStyle);
      if (mergedStyle.background || mergedStyle.backgroundColor) {
        tooltipEl.style.backgroundColor = mergedStyle.background || mergedStyle.backgroundColor;
      } else {
        tooltipEl.style.backgroundColor = '';
      }

      if (mergedStyle.color) {
        tooltipEl.style.color = mergedStyle.color;
      } else {
        tooltipEl.style.color = '';
      }

      if (mergedStyle.borderColor) {
        tooltipEl.style.borderColor = mergedStyle.borderColor;
      } else {
        tooltipEl.style.borderColor = '';
      }

      tooltipEl.innerHTML = typeof content === 'string' ? content : '';
      tooltipEl.style.display = 'block';
      tooltipEl.style.opacity = '1';

      const tipWidth = tooltipEl.offsetWidth;
      const tipHeight = tooltipEl.offsetHeight;
      const containerRect = container.getBoundingClientRect();

      let left = x + 12;
      let top = y - tipHeight / 2;

      if (left + tipWidth > containerRect.width - 8) {
        left = x - tipWidth - 12;
      }
      if (top < 8) top = 8;
      if (top + tipHeight > containerRect.height - 8) {
        top = containerRect.height - tipHeight - 8;
      }

      tooltipEl.style.left = `${Math.max(8, left)}px`;
      tooltipEl.style.top = `${top}px`;
    },

    hide() {
      if (tooltipEl) {
        tooltipEl.style.display = 'none';
        tooltipEl.style.opacity = '0';
      }
    }
  };
}

export function attachDiscreteTooltip(element, payload, tooltipController, container) {
  element.style.cursor = 'pointer';

  element.addEventListener('pointerenter', (e) => {
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let content = '';
    const styleOptions = typeof payload.tooltipConfig === 'object' ? payload.tooltipConfig : {};

    if (typeof payload.formatter === 'function') {
      content = payload.formatter(payload.datum, payload.index);
    } else {
      content = `
        <div class="datum-tooltip-title datum-fw-600">${payload.label}</div>
        <div class="datum-tooltip-row">
          <span class="datum-tooltip-label-wrapper">
            <span class="datum-tooltip-swatch" style="background: ${payload.color};"></span>
            <span>${payload.value}${payload.percent !== undefined ? ` (${payload.percent}%)` : ''}</span>
          </span>
        </div>
      `;
    }

    tooltipController.show(content, mouseX, mouseY, styleOptions);
  });

  element.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const styleOptions = typeof payload.tooltipConfig === 'object' ? payload.tooltipConfig : {};
    tooltipController.show(null, e.clientX - rect.left, e.clientY - rect.top, styleOptions);
  });

  element.addEventListener('pointerleave', () => {
    tooltipController.hide();
  });
}

export function setupCrosshairOverlay(context) {
  const {
    svg,
    container,
    layers,
    xCategories,
    getX,
    getY,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    plotWidth,
    plotHeight,
    globalTooltipConfig,
    tooltipController
  } = context;

  if (!xCategories || xCategories.length === 0) return;

  const overlayGroup = document.createElementNS(SVG_NS, 'g');
  overlayGroup.setAttribute('class', 'datum-crosshair-overlay');
  overlayGroup.style.display = 'none';
  svg.appendChild(overlayGroup);

  const rulerLine = document.createElementNS(SVG_NS, 'line');
  rulerLine.setAttribute('class', 'datum-crosshair-ruler');
  rulerLine.setAttribute('y1', plotTop);
  rulerLine.setAttribute('y2', plotBottom);
  overlayGroup.appendChild(rulerLine);

  const snapDot = document.createElementNS(SVG_NS, 'circle');
  snapDot.setAttribute('class', 'datum-crosshair-dot');
  snapDot.setAttribute('r', '4');
  overlayGroup.appendChild(snapDot);

  const hitRect = document.createElementNS(SVG_NS, 'rect');
  hitRect.setAttribute('class', 'datum-hit-target');
  hitRect.setAttribute('x', plotLeft);
  hitRect.setAttribute('y', plotTop);
  hitRect.setAttribute('width', plotWidth);
  hitRect.setAttribute('height', plotHeight);
  hitRect.setAttribute('fill', 'transparent'); // Bulletproof: never rely on external CSS for hit-testing transparency
  hitRect.style.cursor = 'crosshair';
  svg.appendChild(hitRect);

  function getPointerCoords(e) {
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function handlePointerMove(e) {
    const coords = getPointerCoords(e);

    if (coords.x < plotLeft || coords.x > plotRight + 2) {
      overlayGroup.style.display = 'none';
      tooltipController.hide();
      return;
    }

    const total = xCategories.length;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < total; i++) {
      const cx = getX(i, total);
      const dist = Math.abs(coords.x - cx);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const slotWidth = plotWidth / (total || 1);
    if (coords.x >= plotRight - slotWidth / 2) {
      closestIndex = total - 1;
    }

    const snapX = getX(closestIndex, total);
    const categoryTitle = xCategories[closestIndex] ?? '';

    const slicePoints = [];
    let primaryY = null;

    layers.forEach((layer, idx) => {
      if (layer.options?.tooltip === false) return;

      const d = layer.data?.[closestIndex];
      if (!d) return;

      const layerName = layer.options?.name || layer.options?.label || `Series ${idx + 1}`;
      let layerColor = layer.options?.stroke || layer.options?.fill || '#38bdf8';

      if (layer.type === 'candlestick') {
        const o = d[layer.keys.open];
        const h = d[layer.keys.high];
        const l = d[layer.keys.low];
        const c = d[layer.keys.close];
        slicePoints.push({ label: layerName, value: `${o} / ${h} / ${l} / ${c}`, raw: d, color: layerColor });
        if (primaryY === null) primaryY = getY(c);
      } else if (layer.type === 'range') {
        const yMin = d[layer.keys.yMin];
        const yMax = d[layer.keys.yMax];
        slicePoints.push({ label: `${layerName} Range`, value: `${yMin} – ${yMax}`, raw: d, color: layerColor });
        if (primaryY === null) primaryY = getY(yMax);
      } else if (layer.keys?.y) {
        const val = d[layer.keys.y];
        slicePoints.push({ label: layerName, value: Number(val).toLocaleString(), raw: d, color: layerColor });
        if (primaryY === null) primaryY = getY(val);
      }
    });

    if (slicePoints.length === 0) {
      overlayGroup.style.display = 'none';
      tooltipController.hide();
      return;
    }

    overlayGroup.style.display = '';
    rulerLine.setAttribute('x1', snapX);
    rulerLine.setAttribute('x2', snapX);

    if (primaryY !== null && !isNaN(primaryY)) {
      snapDot.style.display = '';
      snapDot.setAttribute('cx', snapX);
      snapDot.setAttribute('cy', primaryY);
      snapDot.setAttribute('stroke', slicePoints[0].color);
    } else {
      snapDot.style.display = 'none';
    }

    let tooltipContent = '';
    const isCustomFunction = typeof globalTooltipConfig === 'function';
    const styleOptions = (typeof globalTooltipConfig === 'object' && globalTooltipConfig !== null) ? globalTooltipConfig : {};

    if (isCustomFunction) {
      const sliceData = {
        category: categoryTitle,
        points: slicePoints
      };
      tooltipContent = globalTooltipConfig(sliceData, closestIndex);
    } else {
      const rows = slicePoints.map(item => `
        <div class="datum-tooltip-row">
          <span class="datum-tooltip-label-wrapper">
            <span class="datum-tooltip-swatch" style="background: ${item.color};"></span>
            <span class="datum-tooltip-label">${item.label}</span>
          </span>
          <span class="datum-tooltip-value">${item.value}</span>
        </div>
      `).join('');

      tooltipContent = `
        <div class="datum-tooltip-title">${categoryTitle}</div>
        ${rows}
      `;
    }

    tooltipController.show(tooltipContent, snapX, primaryY || coords.y, styleOptions);
  }

  function handlePointerLeave() {
    overlayGroup.style.display = 'none';
    tooltipController.hide();
  }

  hitRect.addEventListener('pointermove', handlePointerMove);
  hitRect.addEventListener('pointerleave', handlePointerLeave);
  hitRect.addEventListener('touchstart', handlePointerMove, { passive: true });
  hitRect.addEventListener('touchend', handlePointerLeave);
}