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
  title: 'This a bar chart',
  subtitle: 'First example',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  height: 380,
  animated: true,
  datum: [
    Datum.bar(aaplStock, { 
      x: 'day', 
      y: 'open', 
      fill: (d) => {
        return d.close > d.open ? Color.Green : Color.Red
      }
    }),
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Stacked bar chart',
  subtitle: 'This chart also includes a ruler - a distinct line at a key/value',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  height: 380,
  animated: true,
  datum: [
    Datum.bar(salesData, { x: 'quarter', y: 'online', stackId: 'total', fill: Color.Blue }),
    Datum.bar(salesData, { x: 'quarter', y: 'retail', stackId: 'total', fill: Color.Cyan }),
    Datum.ruler(salesData, { y: 'target', direction: 'horizontal', dashed: true, stroke: Color.Red })
  ]
});

Datum.chart({
  target: '#chart2',
  title: 'Gradient bar chart',
  config: {
    xAxis: {
      labelAngle: -45
    }
  },
  width: '100%',
  animated: true,
  datum: [

    Datum.bar(aaplStock, { 
      x: 'day', 
      y: 'open', 
      fill: (d) => {
        return d.close > d.open ? Color.Green : Color.Red
      },
      gradient: true
    }),
  ]
});