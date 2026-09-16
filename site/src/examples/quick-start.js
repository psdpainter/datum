import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    12,
    18,
    14,
    24,
    20,
    28,
    25
];

Datum.chart({
    target: '#quick-start-chart',
    height: 300,

    datum: [
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