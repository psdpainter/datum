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
                        <li><a href="/demo/bar-chart.html">Bar chart</a></li>
                        <li><a href="/demo/line-chart.html">Line chart</a></li>
                        <li><a href="/demo/candlestick-chart.html">Candlestick chart</a></li>
                        <li><a href="/demo/pie-chart.html">Pie chart</a></li>
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