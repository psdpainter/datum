const SVG_NS = 'http://www.w3.org/2000/svg';

export const Color = {
  Blue: '#2563eb',
  Cyan: '#06b6d4',
  Orange: '#f97316',
  Purple: '#8b5cf6',
  Green: '#10b981',
  Red: '#ef4444',
  Gray: '#6b7280'
};

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

  if (options.subTitle || options.subtitle) {
    const subTitleText = options.subTitle || options.subtitle;
    const subTitle = document.createElement('h3');
    subTitle.className = 'datum-subtitle datum-ff datum-fs-base datum-fw-400 datum-color-muted';
    subTitle.setAttribute('data-datum-subtitle', '');
    subTitle.textContent = subTitleText;
    container.appendChild(subTitle);
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