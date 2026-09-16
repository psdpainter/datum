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
    target: '#area-example',
    height: 300,

    datum: [
        Datum.area(values, {
            name: 'Sessions',
            fill: Color.Blue,
            opacity: 0.35,
            gradient: true,
            smooth: true,
            tension: 0.2
        })
    ]
});