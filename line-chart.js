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

const numbers2 = Array.from(
  { length: 30 }, 
  () => ({
    x: Math.floor(Math.random() * 30) + 1,
    y: Math.floor(Math.random() * 30) + 1
  }));

  console.log(numbers2);

Datum.chart({
  target: '#chart',
  title: 'Line chart (normalized)',
  subtitle: 'A line chart using an array of primitive integers',
  width: '100%',
  height: 500,
  animated: true,
  animationDelay: '20ms',
  datum: [
    Datum.line(numbers, {
      stroke: Color.Green,
      strokeWidth: 2
    }),
    Datum.area(numbers, {
        fill: Color.Purple,
        gradient: true
    })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Weekly Temperature Range (°F)',
  subTitle: 'Expected Bounds & Median',
  width: '100%',
  height: 380,
  animated: true,
  datum: [
    // Range corridor rendered first (in background)
    Datum.range(forecast, {
      x: 'day',
      yMin: 'tempMin',
      yMax: 'tempMax',
      fill: Color.Cyan,
      opacity: 0.2
    }),

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