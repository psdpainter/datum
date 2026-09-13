import { createBase } from './datum-core.js';
import { line, renderLineLayer } from './datum-line.js';
import { dot, renderDotLayer } from './datum-dot.js';
import { area, renderAreaLayer } from './datum-area.js';
import { ruler, renderRulerLayer } from './datum-ruler.js';
import { bar, renderBarLayer } from './datum-bar.js';
import { histogram, renderHistogramLayer } from './datum-histogram.js';
import { scatter, renderScatterLayer } from './datum-scatterplot.js';
import { candlestick, renderCandlestickLayer } from './datum-candlestick.js';
import { pie, renderPieLayer } from './datum-pie.js';
import { range, renderRangeLayer } from './datum-range.js';
import { heatmap, renderHeatmapLayer } from './datum-heatmap.js';
import { renderLegend } from './datum-legend.js';
import { createTooltipController, setupCrosshairOverlay } from './datum-tooltip.js';
import { mean, median, mode } from './datum-extensions.js';

export { Color } from './datum-core.js';
export { mean, median, mode } from './datum-extensions.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const FONT_SIZE = 11;
const CHAR_WIDTH_RATIO = 0.62;
const TICK_LENGTH = 6;

let chartInstanceCounter = 0;

const layerRenderers = {
  line: renderLineLayer,
  dot: renderDotLayer,
  area: renderAreaLayer,
  ruler: renderRulerLayer,
  bar: renderBarLayer,
  histogram: renderHistogramLayer,
  scatter: renderScatterLayer,
  candlestick: renderCandlestickLayer,
  pie: renderPieLayer,
  range: renderRangeLayer,
  heatmap: renderHeatmapLayer
};

export const Datum = {
  line,
  dot,
  area,
  ruler,
  bar,
  histogram,
  scatter,
  candlestick,
  pie,
  range,
  heatmap,

  mean,
  median,
  mode,

  chart(options = {}) {
    const layers = Array.isArray(options.datum) ? options.datum : [];
    const chartTypes = layers.map(l => l.type).filter(Boolean).join(',');

    const config = options.config || {};
    const xAxisConfig = config.xAxis || {};
    const userPadding = config.padding || {};

    const isTooltipDisabled = options.tooltip === false || config.tooltip === false;
    const tooltipConfig = options.tooltip !== undefined ? options.tooltip : config.tooltip;

    const isAnimated = options.animated === true;
    let resolvedAnimationDelay = '40ms';

    if (isAnimated) {
      if (typeof options.animationDelay === 'string' && /^\d+ms$/.test(options.animationDelay)) {
        resolvedAnimationDelay = options.animationDelay;
      } else if (options.animationDelay !== undefined) {
        console.warn(
          `Datum: "animationDelay" must be a string formatted in milliseconds (e.g. '40ms', '200ms'). Received: "${options.animationDelay}". Falling back to '40ms'.`
        );
      }
    }

    const labelAngle = typeof xAxisConfig.labelAngle === 'number' ? xAxisConfig.labelAngle : 0;
    const userInterval = typeof xAxisConfig.interval === 'number' && xAxisConfig.interval > 0 
      ? Math.round(xAxisConfig.interval) 
      : null;

    const isPolar = layers.some(l => l.type === 'pie');
    const isHeatmap = layers.some(l => l.type === 'heatmap');

    const showLegend = config.legend !== false && (
      config.legend?.show ?? (
        layers.length > 1 || 
        layers.some(l => l.type === 'pie' || Boolean(l.options?.name))
      )
    );

    let xCategories = [];
    let yCategories = [];
    let maxXCharLength = 0;
    let maxYCharLength = 0;

    if (isHeatmap) {
      const hmLayer = layers.find(l => l.type === 'heatmap');
      if (hmLayer && Array.isArray(hmLayer.data)) {
        xCategories = [...new Set(hmLayer.data.map(d => String(d[hmLayer.keys.x])))];
        yCategories = [...new Set(hmLayer.data.map(d => String(d[hmLayer.keys.y])))];
        xCategories.forEach(x => { if (x.length > maxXCharLength) maxXCharLength = x.length; });
        yCategories.forEach(y => { if (y.length > maxYCharLength) maxYCharLength = y.length; });
      }
    } else {
      let maxCategoryLength = 0;
      let primaryLayerWithCategories = null;

      layers.forEach(layer => {
        if (Array.isArray(layer.data)) {
          if (layer.data.length > maxCategoryLength) {
            maxCategoryLength = layer.data.length;
            primaryLayerWithCategories = layer;
          }
          layer.data.forEach(item => {
            const text = String(item[layer.keys?.x] ?? item[layer.keys?.label] ?? '');
            if (text.length > maxXCharLength) {
              maxXCharLength = text.length;
            }
          });
        }
      });

      xCategories = primaryLayerWithCategories
        ? primaryLayerWithCategories.data.map(d => String(d[primaryLayerWithCategories.keys.x]))
        : [];
    }

    let allYValues = [];
    let heatmapValues = [];
    const stackedTotals = new Array(xCategories.length).fill(0);

    layers.forEach(layer => {
      if (Array.isArray(layer.data)) {
        layer.data.forEach((item, i) => {
          if (layer.type === 'candlestick') {
            allYValues.push(Number(item[layer.keys.high]) || 0);
            allYValues.push(Number(item[layer.keys.low]) || 0);
          } else if (layer.type === 'range') {
            allYValues.push(Number(item[layer.keys.yMax]) || 0);
            allYValues.push(Number(item[layer.keys.yMin]) || 0);
          } else if (layer.type === 'heatmap') {
            heatmapValues.push(Number(item[layer.keys.value]) || 0);
          } else if (layer.type === 'bar' && layer.options?.stackId) {
            stackedTotals[i] += Number(item[layer.keys.y]) || 0;
          } else if (layer.type !== 'pie') {
            allYValues.push(Number(item[layer.keys.y]) || 0);
          }
        });
      }
    });

    if (stackedTotals.some(v => v > 0)) {
      allYValues.push(...stackedTotals);
    }

    const rawMinY = allYValues.length > 0 ? Math.min(...allYValues) : 0;
    const rawMaxY = allYValues.length > 0 ? Math.max(...allYValues) : 100;
    const ySpan = (rawMaxY - rawMinY) || 1;

    const requiresZeroBaseline = layers.some(l => l.type === 'bar' || l.type === 'histogram');
    const minY = requiresZeroBaseline ? Math.min(0, rawMinY) : Math.floor(rawMinY - ySpan * 0.05);
    const maxY = Math.ceil(rawMaxY + ySpan * 0.05);

    const heatMinVal = heatmapValues.length > 0 ? Math.min(...heatmapValues) : 0;
    const heatMaxVal = heatmapValues.length > 0 ? Math.max(...heatmapValues) : 100;

    const yTicksCount = 4;
    const projectedYTicks = [];
    for (let i = 0; i <= yTicksCount; i++) {
      projectedYTicks.push(minY + (i / yTicksCount) * (maxY - minY));
    }
    if (minY < 0 && maxY > 0 && !projectedYTicks.some(v => Math.round(v) === 0)) {
      projectedYTicks.push(0);
    }

    let maxYTickCharLength = 0;
    if (isHeatmap) {
      maxYTickCharLength = maxYCharLength;
    } else {
      projectedYTicks.forEach(t => {
        const str = String(Math.round(t));
        if (str.length > maxYTickCharLength) maxYTickCharLength = str.length;
      });
    }

    let dynamicLeftPadding;
    if (userPadding.left !== undefined) {
      dynamicLeftPadding = userPadding.left;
    } else if (isPolar) {
      dynamicLeftPadding = 24;
    } else {
      const estimatedYTextWidth = maxYTickCharLength * (FONT_SIZE * CHAR_WIDTH_RATIO);
      dynamicLeftPadding = Math.ceil(estimatedYTextWidth + TICK_LENGTH + 18);
      dynamicLeftPadding = Math.max(36, dynamicLeftPadding);
    }

    let dynamicBottomPadding;
    if (userPadding.bottom !== undefined) {
      dynamicBottomPadding = userPadding.bottom;
    } else if (isPolar) {
      dynamicBottomPadding = 24;
    } else {
      const estimatedXTextWidth = maxXCharLength * (FONT_SIZE * CHAR_WIDTH_RATIO);
      if (labelAngle === 0) {
        dynamicBottomPadding = 36;
      } else {
        const angleRad = Math.abs(labelAngle) * (Math.PI / 180);
        const verticalDrop = Math.sin(angleRad) * estimatedXTextWidth + Math.cos(angleRad) * FONT_SIZE;
        dynamicBottomPadding = Math.ceil(verticalDrop + TICK_LENGTH + 16);
      }
      if (showLegend && !isHeatmap) {
        dynamicBottomPadding += 28;
      }
      dynamicBottomPadding = Math.max(36, dynamicBottomPadding);
    }

    let dynamicRightPadding = userPadding.right !== undefined ? userPadding.right : 24;
    if (labelAngle > 0 && !isPolar) {
      const angleRad = (labelAngle * Math.PI) / 180;
      const rightProjection = Math.cos(angleRad) * (maxXCharLength * (FONT_SIZE * CHAR_WIDTH_RATIO));
      dynamicRightPadding = Math.max(24, Math.ceil(rightProjection));
    }

    const padding = {
      top: userPadding.top !== undefined ? userPadding.top : 24,
      right: dynamicRightPadding,
      bottom: dynamicBottomPadding,
      left: dynamicLeftPadding
    };

    const base = createBase(options);
    const { svg, container, width, height } = base;
    svg.setAttribute('data-datum-chart-type', chartTypes || 'composite');

    const chartClasses = ['datum-chart'];
    if (isAnimated) {
      chartClasses.push('is-animated');
      svg.style.setProperty('--datum-animation-delay', resolvedAnimationDelay);
      if (container) {
        container.classList.add('is-animated');
        container.style.setProperty('--datum-animation-delay', resolvedAnimationDelay);
      }
    }
    svg.setAttribute('class', chartClasses.join(' '));

    const globalStyleConfig = (typeof tooltipConfig === 'object' && tooltipConfig !== null) ? tooltipConfig : {};
    const tooltipController = !isTooltipDisabled 
      ? createTooltipController(container || svg.parentNode, globalStyleConfig) 
      : null;

    if (layers.length === 0) return base;

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const plotLeft = padding.left;
    const plotRight = width - padding.right;
    const plotTop = padding.top;
    const plotBottom = height - padding.bottom;

    const instanceId = ++chartInstanceCounter;
    const clipId = `datum-clip-${instanceId}`;

    if (isAnimated) {
      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS(SVG_NS, 'defs');
        svg.insertBefore(defs, svg.firstChild);
      }
      const clipPath = document.createElementNS(SVG_NS, 'clipPath');
      clipPath.setAttribute('id', clipId);

      const clipRect = document.createElementNS(SVG_NS, 'rect');
      clipRect.setAttribute('class', 'datum-clip-rect');
      clipRect.setAttribute('x', '0');
      clipRect.setAttribute('y', '0');
      clipRect.setAttribute('width', String(plotWidth));
      clipRect.setAttribute('height', String(plotHeight));

      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
    }

    const hasBandLayer = layers.some(l => l.type === 'bar' || l.type === 'histogram' || l.type === 'candlestick' || l.type === 'heatmap');

    const resolveIndex = (keyOrIndex, categoryList) => {
      if (categoryList && categoryList.length > 0) {
        const found = categoryList.indexOf(String(keyOrIndex));
        if (found !== -1) return found;
      }
      return typeof keyOrIndex === 'number' ? keyOrIndex : 0;
    };

    const getX = (keyOrIndex, totalCount = xCategories.length) => {
      const idx = Math.max(0, resolveIndex(keyOrIndex, xCategories));
      if (hasBandLayer) {
        const slotWidth = plotWidth / (totalCount || 1);
        return plotLeft + idx * slotWidth + slotWidth / 2;
      }
      if (totalCount <= 1) return plotLeft + plotWidth / 2;
      return plotLeft + (idx / (totalCount - 1)) * plotWidth;
    };

    const getBand = (keyOrIndex, totalCount = xCategories.length) => {
      const idx = Math.max(0, resolveIndex(keyOrIndex, xCategories));
      const slotWidth = plotWidth / (totalCount || 1);
      const paddingRatio = isHeatmap ? 0.08 : 0.25;
      const usableWidth = slotWidth * (1 - paddingRatio);
      const x = plotLeft + idx * slotWidth + (slotWidth * paddingRatio) / 2;
      return { x, width: usableWidth, center: x + usableWidth / 2 };
    };

    const getY = (val) => {
      const ratio = (val - minY) / (maxY - minY || 1);
      return plotTop + plotHeight - ratio * plotHeight;
    };

    const getYBand = (keyOrIndex, totalCount = yCategories.length) => {
      const idx = Math.max(0, resolveIndex(keyOrIndex, yCategories));
      const slotHeight = plotHeight / (totalCount || 1);
      const paddingRatio = 0.08;
      const usableHeight = slotHeight * (1 - paddingRatio);
      const y = plotTop + idx * slotHeight + (slotHeight * paddingRatio) / 2;
      return { y, height: usableHeight, center: y + usableHeight / 2 };
    };

    // 1. Grouped Axes
    if (!isPolar) {
      // Y-AXIS GROUP
      const yAxisGroup = document.createElementNS(SVG_NS, 'g');
      yAxisGroup.setAttribute('class', 'datum-axis datum-axis-y');
      svg.appendChild(yAxisGroup);

      if (isHeatmap) {
        yCategories.forEach((cat, index) => {
          const band = getYBand(index, yCategories.length);
          const yLabel = document.createElementNS(SVG_NS, 'text');
          yLabel.setAttribute('class', 'datum-axis-label datum-axis-text datum-axis-text-y datum-ff datum-fs-sm datum-fw-400 datum-color-muted');
          yLabel.setAttribute('x', plotLeft - 10);
          yLabel.setAttribute('y', band.center);
          yLabel.textContent = cat;
          yAxisGroup.appendChild(yLabel);
        });
      } else {
        projectedYTicks.sort((a, b) => a - b).forEach(tickValue => {
          const isZero = Math.round(tickValue) === 0;
          const tickY = getY(tickValue);

          const gridLine = document.createElementNS(SVG_NS, 'line');
          gridLine.setAttribute('class', isZero ? 'datum-grid-line-zero' : 'datum-grid-line');
          gridLine.setAttribute('x1', plotLeft);
          gridLine.setAttribute('x2', plotRight);
          gridLine.setAttribute('y1', tickY);
          gridLine.setAttribute('y2', tickY);
          yAxisGroup.appendChild(gridLine);

          const yLabel = document.createElementNS(SVG_NS, 'text');
          yLabel.setAttribute('class', 'datum-axis-label datum-axis-text datum-axis-text-y datum-ff datum-fs-sm datum-fw-400 datum-color-muted');
          yLabel.setAttribute('x', plotLeft - 10);
          yLabel.setAttribute('y', tickY + 3);
          yLabel.textContent = Math.round(tickValue).toLocaleString();
          yAxisGroup.appendChild(yLabel);
        });
      }

      // Left Spine
      const yAxisLine = document.createElementNS(SVG_NS, 'line');
      yAxisLine.setAttribute('class', 'datum-axis-line');
      yAxisLine.setAttribute('x1', plotLeft);
      yAxisLine.setAttribute('x2', plotLeft);
      yAxisLine.setAttribute('y1', plotTop);
      yAxisLine.setAttribute('y2', plotBottom);
      yAxisGroup.appendChild(yAxisLine);

      // X-AXIS GROUP
      const xAxisGroup = document.createElementNS(SVG_NS, 'g');
      xAxisGroup.setAttribute('class', 'datum-axis datum-axis-x');
      svg.appendChild(xAxisGroup);

      const xAxisLine = document.createElementNS(SVG_NS, 'line');
      xAxisLine.setAttribute('class', 'datum-axis-line');
      xAxisLine.setAttribute('x1', plotLeft);
      xAxisLine.setAttribute('x2', plotRight);
      xAxisLine.setAttribute('y1', plotBottom);
      xAxisLine.setAttribute('y2', plotBottom);
      xAxisGroup.appendChild(xAxisLine);

      if (xCategories.length > 0) {
        const avgCharWidth = FONT_SIZE * CHAR_WIDTH_RATIO;
        let estimatedWidth = Math.max(20, maxXCharLength * avgCharWidth);
        if (labelAngle !== 0) {
          const angleRad = Math.abs(labelAngle) * (Math.PI / 180);
          estimatedWidth = Math.cos(angleRad) * estimatedWidth + 14;
        }

        const safetyMargin = 12;
        const maxFittingLabels = Math.max(1, Math.floor(plotWidth / (estimatedWidth + safetyMargin)));
        const autoInterval = Math.max(1, Math.ceil(xCategories.length / maxFittingLabels));
        const tickInterval = userInterval || autoInterval;

        xCategories.forEach((label, index) => {
          const isFirst = index === 0;
          const isLast = index === xCategories.length - 1;
          const isStep = index % tickInterval === 0;

          const shouldRender = isFirst || isStep || isLast;
          if (!shouldRender) return;

          const xPos = getX(index, xCategories.length);
          const tickEndY = plotBottom + TICK_LENGTH;

          const tick = document.createElementNS(SVG_NS, 'line');
          tick.setAttribute('class', 'datum-axis-tick');
          tick.setAttribute('x1', xPos);
          tick.setAttribute('x2', xPos);
          tick.setAttribute('y1', plotBottom);
          tick.setAttribute('y2', tickEndY);
          xAxisGroup.appendChild(tick);

          const labelY = tickEndY + 8;
          const xLabel = document.createElementNS(SVG_NS, 'text');
          xLabel.setAttribute('class', 'datum-axis-label datum-axis-text datum-axis-text-x datum-ff datum-fs-sm datum-fw-400 datum-color-muted');
          xLabel.setAttribute('x', xPos);
          xLabel.setAttribute('y', labelY);

          if (labelAngle === 0) {
            xLabel.setAttribute('text-anchor', 'middle');
          } else if (labelAngle < 0) {
            xLabel.setAttribute('text-anchor', 'end');
            xLabel.setAttribute('transform', `rotate(${labelAngle}, ${xPos}, ${labelY})`);
          } else {
            xLabel.setAttribute('text-anchor', 'start');
            xLabel.setAttribute('transform', `rotate(${labelAngle}, ${xPos}, ${labelY})`);
          }

          xLabel.textContent = label;
          xAxisGroup.appendChild(xLabel);
        });
      }
    }

    const centerX = plotLeft + plotWidth / 2;
    const centerY = plotTop + plotHeight / 2;
    const radius = Math.min(plotWidth, plotHeight) / 2;

    const barLayers = layers.filter(l => l.type === 'bar');
    const isStacked = barLayers.length > 1 && barLayers.every(l => Boolean(l.options.stackId));
    const barGroupMode = isStacked ? 'stacked' : (barLayers.length > 1 ? 'grouped' : 'single');
    const stackOffsets = new Array(xCategories.length).fill(0);
    let barIndex = 0;

    // 2. Plot Area Canvas Group
    const plotAreaGroup = document.createElementNS(SVG_NS, 'g');
    plotAreaGroup.setAttribute('class', 'datum-plot-area');

    if (isAnimated) {
      const clipWrapperGroup = document.createElementNS(SVG_NS, 'g');
      clipWrapperGroup.setAttribute('class', 'datum-clip-wrapper');
      clipWrapperGroup.setAttribute('clip-path', `url(#${clipId})`);
      svg.appendChild(clipWrapperGroup);
      clipWrapperGroup.appendChild(plotAreaGroup);
    } else {
      svg.appendChild(plotAreaGroup);
    }

    const renderedLayerGroups = [];

    layers.forEach((layer, index) => {
      const layerGroup = document.createElementNS(SVG_NS, 'g');
      layerGroup.setAttribute('class', `datum-layer datum-layer-${layer.type}`);
      plotAreaGroup.appendChild(layerGroup);
      renderedLayerGroups.push(layerGroup);

      const layerTooltipActive = layer.options?.tooltip !== false;

      const renderContext = {
        svg: layerGroup,
        container: container || svg.parentNode,
        tooltipController: layerTooltipActive ? tooltipController : null,
        getX,
        getY,
        getBand,
        getYBand,
        valueMin: heatMinVal,
        valueMax: heatMaxVal,
        centerX,
        centerY,
        radius,
        width,
        height,
        padding,
        categories: xCategories,
        plotBottom
      };

      const renderer = layerRenderers[layer.type];
      if (renderer) {
        if (layer.type === 'bar') {
          renderer(layer, renderContext, {
            barIndex,
            totalBarsInGroup: barLayers.length,
            barGroupMode,
            stackOffsets
          });
          barIndex++;
        } else {
          renderer(layer, renderContext, index);
        }
      }
    });

    // Crosshair Hover Layer
    if (!isPolar && !isHeatmap && !isTooltipDisabled && tooltipController) {
      setupCrosshairOverlay({
        svg,
        container: container || svg.parentNode,
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
        globalTooltipConfig: tooltipConfig,
        tooltipController
      });
    }

    // 3. Legend Component Group
    if (showLegend && !isHeatmap) {
      renderLegend(svg, layers, renderedLayerGroups, { width, height, padding });
    }

    return base;
  }
};