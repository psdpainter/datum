# Datum
Data visualization library for web apps.

Datum renders SVG charts in the browser with no runtime dependencies. Combine
layers on a shared canvas, or render standalone charts such as pies and heatmaps.

[View on npm](https://www.npmjs.com/package/@psdpainter/datum-js).

## Installation

With npm and a bundler:

```sh
npm install @psdpainter/datum-js
```

```js
import { Datum, Color } from '@psdpainter/datum-js';
import '@psdpainter/datum-js/style';
```

Or use the CDN example below without installing a package. Include the stylesheet
with either setup; it supplies chart typography, axes, tooltips, and animations.

## Features

* **Zero Dependencies:** Pure vanilla JavaScript—no third-party runtime dependencies.
* **Layer-Based Composability:** Stack and combine lines, areas, bars, dots, rulers, and distributions on a shared coordinate canvas.
* **Native ES Modules:** Designed for modern front-end build pipelines or direct consumption via CDN.
* **Flexible Ingestion:** Accepts primitive number arrays (e.g. `[12, 19, 3, 5]`) as well as structured database objects.
* **Material Design Tokens:** Built-in Material palette tokens and coordinated multi-series color cycling.
* **Interactive Tooltips & Crosshairs:** Coordinated multi-series crosshairs for Cartesian graphs and discrete targeting for polar/heatmaps.

## Browser / CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.css">
<div id="chart"></div>

<script type="module">
  import { Datum, Color } from 'https://cdn.jsdelivr.net/npm/@psdpainter/datum-js/dist/datum.js';

  Datum.chart({
    target: '#chart',
    datum: [Datum.bar([14, 8, 24, 7], { fill: Color.Blue })]
  });
</script>
```

## Quick Start

Create a container element in your HTML

```html
<div id="chart" style="width: 100%; height: 380px;"></div>
```

Render a chart using primitive values. The `datum` array holds layer objects
returned by `Datum.area()`, `Datum.line()`, and the other layer constructors.

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
  resize: true,
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

## Chart background and axes

Use `clean: true` to render a transparent chart without gridlines or either axis:

```js
Datum.chart({
  target: '#chart',
  clean: true,
  datum: [Datum.line([14, 8, 24, 7])]
});
```

Or control each option independently (all default to `true`):

```js
Datum.chart({
  target: '#chart',
  config: {
    background: false,
    xAxis: false,
    yAxis: false
  },
  datum: [Datum.line([14, 8, 24, 7])]
});
```

`background: false` removes gridlines and makes the chart container and SVG
transparent. Hiding an axis removes its line, ticks, and labels, and releases
its automatic label padding. Explicit `config.padding` values are preserved.
Axis configuration objects remain supported. `clean: true` takes precedence
over these three config options. Titles, legends, and tooltips remain available;
use `config.legend: false` to hide the legend separately.

Set `config.includeAxisLines: false` to hide the y-axis vertical boundary line
and x-axis horizontal boundary line while keeping labels, ticks, gridlines, and
padding. It defaults to `true`.

```js
config: {
  includeAxisLines: false
}
```

## Bar charts, gradients, and opacity

Pass `gradient: true` to a bar or area layer to fade its fill vertically from the
configured opacity at the top to transparent at the bottom. For bars, one shared
fade spans the entire layer's vertical bounds, including grouped bars and stacked
segments. Shorter bars begin partway through the fade instead of restarting it.

```js
Datum.chart({
  target: '#chart',
  title: 'Weekly sales',
  config: { includeAxisLines: false },
  datum: [
    Datum.bar([14, 8, 24, 7], {
      name: 'Sales',
      fill: Color.Blue,
      gradient: true,
      opacity: 0.6,
      rx: 3
    })
  ]
});
```

Use opacity values from `0` (transparent) to `1` (opaque). Bars default to
`opacity: 1`; areas default to `opacity: 0.25`. Both default to `gradient: false`.
Without a gradient, opacity applies uniformly.

Bar options:

| Option | Default | Purpose |
| --- | --- | --- |
| `x`, `y` | `'x'`, `'y'` | Object keys for categories and values. |
| `name` | Unset | Series label in the legend and tooltip. |
| `fill` | Series color | A color string or `(item, index, data) => color`. |
| `gradient` | `false` | Enable the vertical fade. |
| `opacity` | `1` | Fill opacity, or opacity at the top of the gradient. |
| `rx` | `2` | Corner radius in SVG units. |
| `stroke` | `null` | Optional outline color. |
| `strokeWidth` | `0` | Outline width. |
| `stackId` | `null` | Mark a bar layer for stacking. |

Use a callback to color individual bars, with or without a gradient:

```js
const stockData = [
  { day: 'Mon', open: 100, close: 108 },
  { day: 'Tue', open: 108, close: 104 }
];

Datum.chart({
  target: '#chart',
  datum: [
    Datum.bar(stockData, {
      x: 'day',
      y: 'close',
      fill: item => item.close >= item.open ? Color.Green : Color.Red,
      gradient: true,
      opacity: 0.8
    })
  ]
});
```

## Composing Structured Data

Datum accepts structured datasets and custom key mappings across mixed visual types:

```js
const data = [
  { quarter: 'Q1', revenue: 140, expenses: 90, target: 120 },
  { quarter: 'Q2', revenue: 190, expenses: 110, target: 160 },
  { quarter: 'Q3', revenue: 230, expenses: 140, target: 200 },
  { quarter: 'Q4', revenue: 280, expenses: 160, target: 250 }
];

Datum.chart({
  target: '#chart',
  title: 'Financial Performance',
  datum: [

    Datum.bar(data, {
      x: 'quarter',
      y: 'revenue',
      fill: Color.Blue,
      name: 'Revenue'
    }),

    Datum.bar(data, {
      x: 'quarter',
      y: 'expenses',
      fill: Color.DeepOrange,
      name: 'Expenses'
    }),

    Datum.ruler(data, {
      direction: 'horizontal',
      value: Datum.mean(data, 'target'),
      stroke: Color.Grey,
      dashed: true
    })
  ]
});
```

Multiple bar layers render side by side by default. To stack them, give every
bar layer a nonempty `stackId`, such as `stackId: 'total'`. The current renderer
stacks all bar layers together when every bar layer has a `stackId`; different
IDs do not create separate stacks. Use matching category order across layers.

## Chart options and responsive sizing

| Option | Default | Purpose |
| --- | --- | --- |
| `target` | Required | CSS selector or DOM element to append the chart to. |
| `datum` | `[]` | Array of layer objects. |
| `title`, `subtitle`, `caption` | Unset | Text displayed around the SVG. Use lowercase `subtitle`. |
| `width` | Measured, falling back to `600` | Numeric SVG coordinate width, or a value such as `'100%'` to measure the container. |
| `height` | `360` | SVG height. A number is recommended. |
| `resize` | `false` | Observe container width and redraw when it changes. |
| `animated` | `false` | Animate the initial render. |
| `animationDelay` | `'40ms'` | Animation delay as a millisecond string, such as `'80ms'`. |
| `clean` | `false` | Hide background, gridlines, and both axes. |
| `tooltip` | Enabled | Set to `false` to disable tooltips and crosshairs. |
| `config` | `{}` | Axis, background, padding, legend, and tooltip settings. |

`width: '100%'` measures the initial width. Add `resize: true` to recalculate
layout as the container changes width. Height stays fixed. The returned object
contains `container`, `svg`, `width`, and `height`. With `resize: true`, it also
has `destroy()` to disconnect the observer and remove the chart:

```js
const chart = Datum.chart({
  target: '#chart',
  width: '100%',
  height: 320,
  resize: true,
  datum: [Datum.line([10, 18, 12, 25])]
});

// When the component is unmounted:
// chart.destroy();
```

Each call appends a new chart to the target.

## Axis bounds and labels

```js
Datum.chart({
  target: '#chart',
  config: {
    xAxis: { labelAngle: -45, interval: 2 },
    yAxis: { min: 0, max: 100 },
    includeAxisLines: false,
    padding: { top: 24, right: 24, bottom: 70, left: 48 },
    legend: false
  },
  datum: [Datum.bar([20, 40, 60, 80])]
});
```

X labels are spaced automatically unless `interval` is supplied. The first and
last labels are retained. Padding is calculated from axis labels unless you
supply explicit sides.

For nonnegative data, the automatic y-axis starts at zero. Negative values
expand the automatic domain. Use `yAxis.min` and `yAxis.max` to override it;
values outside explicit bounds are clipped to the plot. Bounds must be finite
numbers, with `min < max` when both are supplied.

`xAxis.min` and `xAxis.max` also support numeric bounds. Scatter charts use their
numeric x values. Other charts use numeric categories when available, otherwise
zero-based category indices.

## Available layers

Pass these constructors inside `Datum.chart({ datum: [...] })`:

| Constructor | Input and common options |
| --- | --- |
| `Datum.line(data, options)` | Number arrays or objects; `x`, `y`, `stroke`, `strokeWidth`, `smooth`, `tension`. |
| `Datum.area(data, options)` | Number arrays or objects; `x`, `y`, `fill`, `opacity`, `gradient`, `smooth`, `tension`. |
| `Datum.dot(data, options)` | Number arrays or objects; `x`, `y`, `fill`, `stroke`, `radius`. |
| `Datum.bar(data, options)` | Number arrays or objects; see the bar options above. |
| `Datum.histogram(data, options)` | Raw numbers or objects with `value` or `y`; `bins`, `fill`, `opacity`. |
| `Datum.scatter(data, options)` | Numeric x/y points; `x`, `y`, `fill`, `radius`, `opacity`. |
| `Datum.candlestick(data, options)` | OHLC objects; `x`, `open`, `high`, `low`, `close`, `upColor`, `downColor`. |
| `Datum.range(data, options)` | Objects with `x`, `yMin`, `yMax`, or `[min, max]` tuples; `fill`, `opacity`. |
| `Datum.ruler(data, options)` | Reference line; `value`, `direction`, `stroke`, `dashed`, `dashArray`. |
| `Datum.pie(data, options)` | Numbers or objects; `label`, `value`, `colors`, `innerRadius`, `showLabels`. |
| `Datum.heatmap(data, options)` | Numeric matrix or objects; `x`, `y`, `value`, `minColor`, `maxColor`, `showValues`. |

Lines and areas accept `smooth: true` and a `tension` value (default `0.2`).
Use pies and heatmaps as standalone charts; Cartesian layers can share a canvas.

For example, render a donut:

```js
Datum.chart({
  target: '#chart',
  datum: [
    Datum.pie([
      { label: 'Desktop', value: 65 },
      { label: 'Mobile', value: 35 }
    ], { innerRadius: 0.6 })
  ]
});
```

Or a heatmap from a matrix:

```js
Datum.chart({
  target: '#chart',
  datum: [
    Datum.heatmap([[2, 8, 4], [6, 3, 9]], {
      minColor: '#e0f2fe',
      maxColor: Color.Blue,
      showValues: true
    })
  ]
});
```

## Legends, tooltips, and styling

Legends are enabled by default for charts other than heatmaps. Give layers a
`name` to label their series. Click a legend item to toggle its visibility, or
set `config.legend: false` to hide the legend.

Tooltips and Cartesian crosshairs are enabled by default. Set `tooltip: false`
on the chart to disable them. You can also set `config.tooltip: false`, or pass
a style object such as `tooltip: { background: '#111827', color: '#ffffff' }`.

Use the exported `Color` palette or CSS color strings for series colors.
Override CSS custom properties on a chart's parent to customize its theme:

```css
#chart {
  --datum-font-family: Arial, sans-serif;
  --datum-axis-color: #94a3b8;
  --datum-grid-color: #e2e8f0;
  --datum-color-heading: #0f172a;
  --datum-tooltip-bg: #0f172a;
  --datum-tooltip-color: #ffffff;
}
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

`mode()` returns an array when multiple values tie for the highest frequency,
and `null` when there is no mode. For empty input, `mean()` and `median()` return
`0`, and `mode()` returns `null`.

## Local development

```sh
npm install
node --test tests/*.test.js
npm run build
npm run dev
```

Open a page from [`demo/`](demo/) through the local server to try the examples.
`npm run build` produces the ES module bundle, browser IIFE bundle, and minified
stylesheet in `dist/`.

## License

[MIT](LICENSE)
