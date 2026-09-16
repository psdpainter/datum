import {
    Datum,
    Color
} from '@psdpainter/datum-js';

// const values = [
//     12,
//     20,
//     16,
//     28,
//     24,
//     36,
//     32
// ];
const values = [
    { month: 'Jan', value: 20 },
    { month: 'Feb', value: 22 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 24 },
    { month: 'May', value: 26 },
    { month: 'Jun', value: 90 },
    { month: 'Jul', value: 28 },
    { month: 'Aug', value: 30 }
];

Datum.chart({
    target: '#line-example',
    width: '100%',
    height: 300,

    datum: [
        Datum.line(values, {
            name: 'Sessions',
            x: 'month',
            y: 'value',
            stroke: Color.Blue,
            strokeWidth: 3,
            smooth: true
        })
    ]
});