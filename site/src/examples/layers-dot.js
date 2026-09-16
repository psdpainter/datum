import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    { x: 'Mon', y: 14 },
    { x: 'Tue', y: 22 },
    { x: 'Wed', y: 18 },
    { x: 'Thu', y: 30 },
    { x: 'Fri', y: 26 },
    { x: 'Sat', y: 38 },
    { x: 'Sun', y: 34 }
];

Datum.chart({
    target: '#dot-example',
    height: 300,

    datum: [
        Datum.dot(values, {
            x: 'x',
            y: 'y',
            stroke: Color.Blue,
            strokeWidth: 2,
            fill: '#ffffff',
            radius: 6
        })
    ]
});