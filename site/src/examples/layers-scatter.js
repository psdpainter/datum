import {
    Datum,
    Color
} from '@psdpainter/datum-js';

// const values = [
//     { x: 0, y: 18 },
//     { x: 1, y: 24 },
//     { x: 2, y: 21 },
//     { x: 3, y: 32 },
//     { x: 4, y: 28 },
//     { x: 5, y: 39 },
//     { x: 6, y: 35 },
//     { x: 7, y: 46 }
// ];
const values = [
    { x: 5,   y: 18 },
    { x: 12,  y: 24 },
    { x: 18,  y: 21 },
    { x: 35,  y: 32 },
    { x: 42,  y: 28 },
    { x: 68,  y: 39 },
    { x: 74,  y: 35 },
    { x: 100, y: 46 }
];

Datum.chart({
    target: '#scatter-example',
    width: '100%',
    height: 320,

    datum: [
        Datum.scatter(values, {
            x: 'x',
            y: 'y',
            radius: 6,
            fill: Color.Blue,
            stroke: '#ffffff',
            strokeWidth: 1,
            opacity: 0.85
        })
    ]
});