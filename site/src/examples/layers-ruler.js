import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    14,
    22,
    18,
    30,
    26,
    38,
    34
];

Datum.chart({
    target: '#ruler-example',
    height: 300,

    datum: [
        Datum.line(values, {
            name: 'Sessions',
            stroke: Color.Blue,
            strokeWidth: 2
        }),

        Datum.dot(values, {
            stroke: Color.Blue,
            fill: '#ffffff',
            strokeWidth: 2,
            radius: 4
        }),

        Datum.ruler([], {
            value: 25,
            stroke: Color.Red,
            strokeWidth: 2,
            dashed: true
        })
    ]
});