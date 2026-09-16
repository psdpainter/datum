import {
    Datum,
    Color,
    mean
} from '@psdpainter/datum-js';

const values = [
    18,
    26,
    22,
    34,
    31,
    42,
    38
];

Datum.chart({
    target: '#layers-composition',
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
        }),

        Datum.ruler([], {
            value: mean(values),
            stroke: Color.Red,
            dashed: true
        })
    ]
});