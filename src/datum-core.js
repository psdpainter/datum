const SVG_NS = 'http://www.w3.org/2000/svg';

export const Color = Object.freeze({
  // Blues & Cool Hues
  Blue: '#2196f3',       // Material Blue 500
  DarkBlue: '#0d47a1',   // Material Blue 900
  LightBlue: '#03a9f4',  // Material Light Blue 500
  Cyan: '#00bcd4',       // Material Cyan 500
  Teal: '#009688',       // Material Teal 500
  Indigo: '#3f51b5',     // Material Indigo 500

  // Greens & Natural Tones
  Green: '#4caf50',      // Material Green 500
  LightGreen: '#8bc34a', // Material Light Green 500

  // Warms & Accents
  Amber: '#ffc107',      // Material Amber 500
  Orange: '#ff9800',     // Material Orange 500
  DeepOrange: '#ff5722', // Material Deep Orange 500
  Red: '#f44336',        // Material Red 500

  // Pinks, Purples & Magenta
  Pink: '#e91e63',       // Material Pink 500
  Magenta: '#d81b60',    // Material Pink 600 / Magenta
  Purple: '#9c27b0',     // Material Purple 500
  DeepPurple: '#673ab7', // Material Deep Purple 500

  // Neutrals & Surfaces
  Grey: '#9e9e9e',       // Material Grey 500
  BlueGrey: '#607d8b'    // Material Blue Grey 500
});

export const DEFAULT_SERIES_COLORS = [
  Color.Blue,
  Color.DeepOrange,
  Color.Green,
  Color.Magenta,
  Color.Amber,
  Color.Purple,
  Color.Teal,
  Color.DarkBlue,
  Color.Pink
];

export function generateGuid() {
  return 'datum-id-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function createBase(options = {}) {
  const target = typeof options.target === 'string'
    ? document.querySelector(options.target)
    : options.target;

  if (!target) {
    throw new Error(`Datum: Target element "${options.target}" not found.`);
  }

  const container = document.createElement('div');
  container.className = 'datum-container';
  target.appendChild(container);

  if (options.title) {
    const title = document.createElement('h2');
    title.className = 'datum-title datum-ff datum-fs-lg datum-fw-600 datum-color-heading';
    title.setAttribute('data-datum-title', '');
    title.textContent = options.title;
    container.appendChild(title);
  }

  if (options.subtitle || options.subtitle) {
    const subtitleText = options.subtitle || options.subtitle;
    const subtitle = document.createElement('h3');
    subtitle.className = 'datum-subtitle datum-ff datum-fs-base datum-fw-400 datum-color-muted';
    subtitle.setAttribute('data-datum-subtitle', '');
    subtitle.textContent = subtitleText;
    container.appendChild(subtitle);
  }

  let numericWidth = 600;
  if (typeof options.width === 'number' && !isNaN(options.width)) {
    numericWidth = options.width;
  } else {
    const measuredWidth = container.clientWidth || target.clientWidth;
    numericWidth = measuredWidth > 0 ? measuredWidth : 600;
  }

  let numericHeight = 360;
  if (typeof options.height === 'number' && !isNaN(options.height)) {
    numericHeight = options.height;
  } else if (typeof options.height === 'string') {
    const parsed = parseFloat(options.height);
    if (!isNaN(parsed)) numericHeight = parsed;
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'datum-svg');
  svg.setAttribute('height', numericHeight);
  svg.setAttribute('viewBox', `0 0 ${numericWidth} ${numericHeight}`);

  if (options.title) {
    svg.setAttribute('title', options.title);
    const svgTitle = document.createElementNS(SVG_NS, 'title');
    svgTitle.textContent = options.title;
    svg.appendChild(svgTitle);
  }

  container.appendChild(svg);

  if (options.caption) {
    const caption = document.createElement('p');
    caption.className = 'datum-caption datum-ff datum-fs-sm datum-fw-400 datum-color-muted';
    caption.setAttribute('data-datum-caption', '');
    caption.textContent = options.caption;
    container.appendChild(caption);
  }

  return { container, svg, width: numericWidth, height: numericHeight };
}