import { Color, Datum } from '../src/datum.js';
import { marketShareData, rawDistribution } from './data.js';

Datum.chart({
  target: '#chart',
  title: 'Traffic by Device',
  subtitle: 'Q3 Analytics',
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
  subtitle: 'Donut View',
  width: 400,
  height: 360,
  datum: [
    Datum.pie(rawDistribution, {
      innerRadius: 0.5,
      labelPosition: 'outside'
    })
  ]
});