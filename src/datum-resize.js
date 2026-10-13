// Observe the chart's own width, leaving its chosen SVG height unchanged.
export function observeChartResize(base, redraw) {
  base.container.style.minWidth = '0';
  base.svg.style.width = '100%';
  base.svg.style.display = 'block';
  let observer;
  let frame = null;
  let pendingWidth = base.width;
  let stopped = false;

  base.destroy = () => {
    stopped = true;
    observer?.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    base.container.remove();
  };

  if (typeof ResizeObserver === 'undefined') return;

  observer = new ResizeObserver(entries => {
    const entry = entries.find(item => item.target === base.container);
    if (!entry || stopped) return;
    const width = Math.round(entry.contentRect.width);
    // Ignore hidden containers and subpixel layout noise.
    if (width <= 0 || !Number.isFinite(width)) return;
    pendingWidth = width;
    if (pendingWidth === base.width || frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (stopped || pendingWidth === base.width) return;
      base.width = pendingWidth;
      redraw();
    });
  });
  observer.observe(base.container);
}
