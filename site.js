import { Color, Datum } from './src/datum.js';
import { 
  ohlcData, 
  salesData, 
  aaplStock, 
  marketShareData, 
  rawDistribution,
  forecast,
  weeklyActivity
} from './data.js';

const numbers = Array.from(
  { length: 30 }, 
  () => Math.floor(Math.random() * 30) + 1);

Datum.chart({
  target: '#chart',
  title: 'This is the title',
  subtitle: 'This is the subtitle',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  height: 380,
  datum: [
    Datum.area(aaplStock, { 
      x: 'day', 
      y: 'high', 
      fill: Color.Blue, 
      opacity: 0.25,
      gradient: true
    }),
    Datum.line(aaplStock, { x: 'day', y: 'close' }),
    Datum.line(aaplStock, { x: 'day', y: 'open' }),
    Datum.dot(aaplStock, { 
      x: 'day', 
      y: 'open', 
      radius: 4, 
      stroke: Color.Blue, 
      strokeWidth: 2 }),
    Datum.ruler([{ target: 240 }], { 
      y: 'target', 
      direction: 'horizontal',
      stroke: Color.Cyan,
      strokeWidth: 2,
      dashed: true
    }),
    // Datum.ruler([{ day: '2025-09-23'}], { 
    //   x: 'day', 
    //   direction: 'vertical',
    //   stroke: Color.Orange 
    // })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Line chart (normalized)',
  subtitle: 'A line chart using an array of primitive integers',
  width: '100%',
  height: 380,
  datum: [
    Datum.line(numbers, {
      stroke: Color.Green,
      strokeWidth: 2
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'This a bar chart',
  subtitle: 'First example',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  height: 380,
  datum: [
    Datum.bar(aaplStock, { 
      x: 'day', 
      y: 'open', 
      fill: Color.Grey, 
      opacity: 0.4 
    }),
  ]
});

Datum.chart({
  target: '#chart',
  title: 'This a bar chart',
  subtitle: 'First example',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  height: 380,
  datum: [
    Datum.bar(salesData, { x: 'quarter', y: 'online', stackId: 'total', fill: Color.Blue }),
    Datum.bar(salesData, { x: 'quarter', y: 'retail', stackId: 'total', fill: Color.Cyan }),
    Datum.ruler(salesData, { y: 'target', direction: 'horizontal', dashed: true, stroke: Color.Red })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Quarterly Sales Channels',
  subTitle: 'Online vs Retail (Grouped)',
  width: '100%',
  height: 380,
  datum: [
    Datum.bar(salesData, { x: 'quarter', y: 'online', fill: Color.Blue }),
    Datum.bar(salesData, { x: 'quarter', y: 'retail', fill: Color.Cyan })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Bar chart (v3)',
  subTitle: 'Sample chart using an array of random integers only',
  width: '100%',
  height: 360,
  config: {
    xAxis: { labelAngle: 0 }
  },
  datum: [
    Datum.bar(numbers, {
      fill: Color.Cyan
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Scatterplot',
  subTitle: 'Sample chart using an array of random integers for scatterplot',
  width: '100%',
  height: 360,
  config: {
    xAxis: { interval: 5 }
  },
  datum: [
    Datum.scatter(numbers, {
      fill: 'none',
      stroke: Color.Purple,
      strokeWidth: 2
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Asset Price Action',
  subTitle: 'OHLC Candlestick Overview',
  width: '100%',
  height: 400,
  config: {
    xAxis: { labelAngle: -45 }
  },
  datum: [
    Datum.candlestick(ohlcData, {
      name: 'Candle data',
      x: 'date',
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      upColor: Color.Green,
      downColor: Color.Red
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Traffic by Device',
  subTitle: 'Q3 Analytics',
  width: 400,
  height: 360,
  datum: [
    Datum.pie(marketShareData, {
      name: 'Pie data',
      value: 'share',
      label: 'device'
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Budget Split',
  subTitle: 'Donut View',
  width: 400,
  height: 360,
  datum: [
    Datum.pie(rawDistribution, {
      innerRadius: 0.6,
      labelPosition: 'outside'
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Weekly Temperature Range (°F)',
  subTitle: 'Expected Bounds & Median',
  width: '100%',
  height: 380,
  datum: [
    // Range corridor rendered first (in background)
    Datum.range(forecast, {
      x: 'day',
      yMin: 'tempMin',
      yMax: 'tempMax',
      fill: Color.Cyan,
      opacity: 0.2
    }),
    // you can also pass in a tuple range
    // [[50, 70], [55, 75], [60, 80], [58, 77]]
  
    // Median line overlaid on top
    Datum.line(forecast, {
      x: 'day',
      y: 'median',
      stroke: Color.Blue,
      strokeWidth: 2
    }),
    // Point markers
    Datum.dot(forecast, {
      x: 'day',
      y: 'median',
      fill: 'none',
      stroke: Color.Purple,
      radius: 6
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Platform Activity Heatmap',
  subTitle: 'Hourly engagement density',
  width: '100%',
  height: 300,
  datum: [
    Datum.heatmap(weeklyActivity, {
      x: 'day',
      y: 'slot',
      value: 'activeUsers',
      minColor: '#e0f2fe',
      maxColor: Color.Blue,
      showValues: true
    })
  ]
});

const matrix = [
  [12, 45, 80, 24],
  [55, 90, 32, 60],
  [20, 15, 75, 98]
];

Datum.chart({
  target: '#chart',
  title: 'Simple Matrix Heatmap',
  width: '100%',
  height: 360,
  datum: [
    Datum.heatmap(matrix, {
      minColor: '#fef3c7', // Warm amber-50
      maxColor: '#d97706', // Deep amber-600
      showValues: true
    })
  ]
});