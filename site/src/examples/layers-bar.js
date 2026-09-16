import {
    Datum,
    Color
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
    target: '#bar-example',
    width: '100%',
    height: 300,

    datum: [
        Datum.bar(values, {
            fill: Color.Blue,
            rx: 4,
            opacity: 0.9
        })
    ]
});