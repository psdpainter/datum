import { Color } from './datum-core.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULT_OPTIONS = {
  upColor: Color.Green,
  downColor: Color.Red,
  strokeWidth: 1,
  rx: 1,
  bodyRatio: 0.6 // Ratio of band width allocated to candle body
};

export function candlestick(data = [], keysAndOptions = {}) {
  const {
    x = 'x',
    open = 'open',
    high = 'high',
    low = 'low',
    close = 'close',
    upColor = DEFAULT_OPTIONS.upColor,
    downColor = DEFAULT_OPTIONS.downColor,
    strokeWidth = DEFAULT_OPTIONS.strokeWidth,
    rx = DEFAULT_OPTIONS.rx,
    bodyRatio = DEFAULT_OPTIONS.bodyRatio
  } = keysAndOptions;

  return {
    type: 'candlestick',
    data,
    keys: { x, open, high, low, close },
    options: { upColor, downColor, strokeWidth, rx, bodyRatio }
  };
}

export function renderCandlestickLayer(layer, context) {
  const { svg, getY, getBand } = context;
  const { data, keys, options } = layer;

  if (!data || data.length === 0) return;

  data.forEach((d, index) => {
    const o = Number(d[keys.open]) || 0;
    const h = Number(d[keys.high]) || 0;
    const l = Number(d[keys.low]) || 0;
    const c = Number(d[keys.close]) || 0;

    const isUp = c >= o;
    const candleColor = isUp ? options.upColor : options.downColor;

    const band = getBand(index);
    const candleWidth = band.width * options.bodyRatio;
    const candleX = band.center - candleWidth / 2;

    const yHigh = getY(h);
    const yLow = getY(l);
    const yOpen = getY(o);
    const yClose = getY(c);

    const bodyY = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));

    // 1. Wick Line (High to Low)
    const wick = document.createElementNS(SVG_NS, 'line');
    wick.setAttribute('x1', band.center);
    wick.setAttribute('x2', band.center);
    wick.setAttribute('y1', yHigh);
    wick.setAttribute('y2', yLow);
    wick.setAttribute('stroke', candleColor);
    wick.setAttribute('stroke-width', options.strokeWidth);
    svg.appendChild(wick);

    // 2. Real Body (Open vs Close)
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', candleX);
    rect.setAttribute('y', bodyY);
    rect.setAttribute('width', Math.max(1, candleWidth));
    rect.setAttribute('height', bodyHeight);
    rect.setAttribute('fill', candleColor);
    rect.setAttribute('stroke', candleColor);
    rect.setAttribute('stroke-width', options.strokeWidth);
    rect.setAttribute('rx', options.rx);
    svg.appendChild(rect);
  });
}