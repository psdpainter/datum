import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    18,
    24,
    21,
    32,
    28,
    38,
    42
];

Datum.chart({
    target: '#charts-basic',
    title: 'Weekly activity',
    subtitle: 'Sessions over the last seven days',
    caption: 'Example data',
    height: 320,

    datum: [
        Datum.area(values, {
            fill: Color.LightBlue,
            opacity: 0.2
        }),

        Datum.line(values, {
            stroke: Color.Blue,
            strokeWidth: 2
        }),

        Datum.dot(values, {
            stroke: Color.Blue,
            fill: '#ffffff',
            radius: 4
        })
    ]
});