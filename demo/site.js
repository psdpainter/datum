import { Color, Datum } from '../src/datum.js';
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
      labelAngle: -60
    }
  },
  width: '100%',
  height: 380,
  animated: true,
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
      stroke: Color.Teal,
      strokeWidth: 2
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