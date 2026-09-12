# Datum
Data visualization library for enterprise web apps

# Instructions
No installation. Include from [https://www.npmjs.com/package/@psdpainter/datum-js](https://www.npmjs.com/package/@psdpainter/datum-js).

## Features

* **Zero Dependencies:** Pure vanilla JavaScript—no third-party runtime dependencies.
* **Layer-Based Composability:** Stack and combine lines, areas, bars, dots, rulers, and distributions on a shared coordinate canvas.
* **Native ES Modules:** Designed for modern front-end build pipelines or direct consumption via CDN.
* **Flexible Ingestion:** Accepts primitive number arrays (e.g. `[12, 19, 3, 5]`) as well as structured database objects.
* **Material Design Tokens:** Built-in Material palette tokens and coordinated multi-series color cycling.
* **Interactive Tooltips & Crosshairs:** Coordinated multi-series crosshairs for Cartesian graphs and discrete targeting for polar/heatmaps.

## Javascript

```js
import { Datum, Color } from '@psdpainter/datum-js';
```

## HTML

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.css">

<script type="module">
  import { Datum, Color } from 'https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.js';
</script>
```

## Quick Start

Create a container element in your HTML

```html
<div id="chart" style="width: 100%; height: 380px;"></div>
```

Render a chart using primitive values. Datum's ```datum``` property accepts any number of arrays.

```js
import { Datum, Color } from '@psdpainter/datum-js';

const values = [14, 8, 24, 7, 10, 18, 15, 2, 6, 16, 18, 28];

Datum.chart({
  target: '#chart',
  title: 'Monthly Velocity',
  subtitle: 'Sprint completion rate',
  width: '100%',
  height: 380,
  animated: true,
  datum: [
    Datum.area(values, {
      fill: Color.LightGreen,
      opacity: 0.3,
      gradient: true
    }),
    Datum.line(values, {
      stroke: Color.Green,
      strokeWidth: 2
    }),
    Datum.dot(values, {
      stroke: Color.Green,
      fill: '#ffffff',
      radius: 4
    })
  ]
});
```

## Composing Structured Data

Datum accepts structured datasets and custom key mappings across mixed visual types:

```js
const quarterlyReport = [
  { quarter: 'Q1', revenue: 140, expenses: 90, target: 120 },
  { quarter: 'Q2', revenue: 190, expenses: 110, target: 160 },
  { quarter: 'Q3', revenue: 230, expenses: 140, target: 200 },
  { quarter: 'Q4', revenue: 280, expenses: 160, target: 250 }
];

Datum.chart({
  target: '#chart',
  title: 'Financial Performance',
  datum: [
    Datum.bar(quarterlyReport, {
      x: 'quarter',
      y: 'revenue',
      fill: Color.Blue,
      name: 'Revenue'
    }),
    Datum.bar(quarterlyReport, {
      x: 'quarter',
      y: 'expenses',
      fill: Color.DeepOrange,
      name: 'Expenses'
    }),
    Datum.ruler(quarterlyReport, {
      direction: 'horizontal',
      value: Datum.mean(quarterlyReport, 'target'),
      stroke: Color.Grey,
      dashed: true
    })
  ]
});
```

## Extensions

Datum includes built-in statistical extensions that compute metrics over numbers or dataset keys:

```js
import { Datum } from '@psdpainter/datum-js';

const scores = [12, 18, 18, 24, 30];

Datum.mean(scores);              // 20.4
Datum.median(scores);            // 18
Datum.mode(scores);              // 18

// Using object arrays with keys
const avgPrice = Datum.mean(stockData, 'close');
```

## License

MIT