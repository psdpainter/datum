import { Datum, Color } from '../src/datum.js';

const surveyResults = [
  { status: 'Completed', count: 42 },
  { status: 'In Progress', count: 18 },
  { status: 'Failed', count: 6 }
];

Datum.chart({
  target: '#chart',
  title: 'Survey Participation (10x7 Waffle)',
  subtitle: 'Each square represents 1 participant',
  width: 320,
  height: 240,
  animated: true,
  datum: [
    Datum.unit(surveyResults, {
      value: 'count',
      label: 'status',
      unitValue: 1,
      columns: 10,
      shape: 'rect',
      size: 16,
      gap: 4,
      rx: 3
    })
  ]
});