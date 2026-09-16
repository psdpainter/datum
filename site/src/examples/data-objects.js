import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const sales = [
    { month: 'Jan', revenue: 18 },
    { month: 'Feb', revenue: 26 },
    { month: 'Mar', revenue: 22 },
    { month: 'Apr', revenue: 34 },
    { month: 'May', revenue: 31 },
    { month: 'Jun', revenue: 42 }
];

Datum.chart({
    target: '#data-objects',
    height: 300,

    datum: [
        Datum.line(sales, {
            x: 'month',
            y: 'revenue',
            stroke: Color.Blue,
            strokeWidth: 2
        }),

        Datum.dot(sales, {
            x: 'month',
            y: 'revenue',
            stroke: Color.Blue,
            fill: '#ffffff',
            radius: 4
        })
    ]
});