class DemoLayout extends HTMLElement {
  connectedCallback() {
    const pageTitle = this.getAttribute('page-title') || 'Datum Demo';
    this.innerHTML = `
        <div class="container">
            <div class="layout">
                <aside class="sidebar">
                    <h1>Datum</h1>
                    <ul class="sidebar-list">
                        <li><a href="/demo">Home</a></li>
                        <li><a href="/demo/area-chart.html">Area</a></li>
                        <li><a href="/demo/bar-chart.html">Bar</a></li>
                        <li><a href="/demo/histogram-chart.html">Histogram</a></li>
                        <li><a href="/demo/line-chart.html">Line</a></li>
                        <li><a href="/demo/candlestick-chart.html">Candlestick</a></li>
                        <li><a href="/demo/pie-chart.html">Pie</a></li>
                        <li><a href="/demo/dot-chart.html">Dot</a></li>
                        <li><a href="/demo/scatterplot-chart.html">Scatterplot</a></li>
                        <li><a href="/demo/heatmap-chart.html">Heatmap</a></li>
                        <li><a href="/demo/range-chart.html">Range</a></li>
                        <li><a href="/demo/waffle-chart.html">Waffle</a></li>
                    </ul>
                </aside>
                <div class="main-wrapper">
                    <main class="main">
                        <h1>${pageTitle}</h1>
                        ${this.innerHTML}
                    </main>
                </div>
            </div>
        </div>
    `;
  }
}
customElements.define('demo-layout', DemoLayout);