import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    12, 14, 15, 16, 17,
    18, 18, 19, 19, 20,
    20, 20, 21, 21, 21,
    22, 22, 22, 23, 23,
    23, 24, 24, 24, 25,
    25, 26, 26, 27, 28,
    29, 30, 31, 33, 35
];

Datum.chart({
    target: '#histogram-example',
    height: 300,

    datum: [
        Datum.histogram(values, {
            bins: 6,
            fill: Color.Blue,
            rx: 2,
            opacity: 0.9
        })
    ]
});