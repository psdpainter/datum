import { Color, Datum } from '../src/datum.js';

const numbers = Array.from(
  { length: 30 }, 
  (_, i) => {
    return {
      x: i,
      y: Math.floor(Math.random() * 30) + 1
    }
  });


Datum.chart({
  target: '#chart',
  title: 'Clean area chart',
  subTitle: 'Sample chart using the `clean` property to remove background and x/y axes',
  width: '100%',
  height: 360,
  clean: true,
  animated: true,
  datum: [
    Datum.area(numbers, {
    x: 'x',
    y: 'y',
      fill: Color.Teal,
      gradient: true
    }),
    Datum.line(numbers, {
      x: 'x',
      y: 'y',
        fill: Color.Teal,
        gradient: true
      })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Clean background area chart',
  subTitle: 'Sample chart removing only the background',
  width: '100%',
  height: 360,
  config: {
    background: false,
    includeAxisLines: false
  },
  animated: true,
  datum: [
    Datum.area(numbers, {
    x: 'x',
    y: 'y',
      fill: Color.Green,
      gradient: true
    }),
    Datum.line(numbers, {
      x: 'x',
      y: 'y',
        stroke: Color.Blue
      })
  ]
});

Datum.chart({
  target: '#chart',
  title: 'Clean axes area chart',
  subTitle: 'Sample chart removing only the axes',
  width: '100%',
  height: 360,
  config: {
    xAxis: false,
    yAxis: false
  },
  animated: true,
  datum: [
    Datum.area(numbers, {
    x: 'x',
    y: 'y',
      fill: Color.Orange,
      gradient: true
    }),
    Datum.line(numbers, {
      x: 'x',
      y: 'y',
        stroke: Color.DeepOrange
      })
  ]
});
