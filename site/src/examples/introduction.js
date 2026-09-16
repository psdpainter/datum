import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    14,
    8,
    24,
    7,
    10,
    18,
    15,
    2,
    6,
    16,
    18,
    28
];

Datum.chart({
    target: '#getting-started-chart',
    height: 300,

    datum: [
        Datum.area(values, {
            fill: Color.LightGreen,
            opacity: 0.3
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