# Getting Started with Datum

Datum is a lightweight, zero-dependency SVG charting library designed for speed, flexibility, and minimal footprint. It outputs clean, semantic nodes directly into the DOM using pure JavaScript.

- [Getting started](./docs/getting-started.md)
- [Chart types](./docs/chart-types.md)
- [API reference](./docs/api-reference.md)

## Installation

You can pull Datum into your project via npm or link it directly through a CDN.

### Via npm

```bash
npm install @psdpainter/datum-js
```

### Via CDN

Drop the script and stylesheet into your HTML document:

```html
<link rel="stylesheet" href="[https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.css](https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.css)">

<script src="[https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.min.js](https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.min.js)"></script>
``` 

### Basic Setup

Create a container element in your HTML where the chart should render:

```html
<div id="my-chart" style="width: 100%; height: 400px;"></div>
```

## Your First Chart
### Using ES Modules

If you are using a modern bundler (like Vite, Webpack, or Rollup) or native browser ES Modules:

```js
import { Datum } from '@psdpainter/datum-js';
import '@psdpainter/datum-js/style';

const data = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 19 },
  { month: 'Mar', value: 8 },
  { month: 'Apr', value: 15 },
  { month: 'May', value: 24 }
];

Datum.chart({
  target: '#my-chart',
  data: data,
  x: 'month',
  layers: [
    { type: 'line', y: 'value' }
  ]
});
```

### Using a ```script``` tag

If you imported ```datum.min.js``` via the CDN, the library exposes a ```Datum``` object on the window: 

```js
<script>
  const data = [
    { x: 1, y: 10 },
    { x: 2, y: 25 },
    { x: 3, y: 18 }
  ];

  Datum.chart({
    target: '#my-chart',
    data: data,
    x: 'x',
    layers: [
      { type: 'line', y: 'y' }
    ]
  });
</script>
```