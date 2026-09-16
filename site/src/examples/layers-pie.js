import { Datum, Color } from '@psdpainter/datum-js';

const values = [
    { category: 'Desktop', value: 48 },
    { category: 'Mobile', value: 32 },
    { category: 'Tablet', value: 14 },
    { category: 'Other', value: 6 }
];

Datum.chart({
    target: '#pie-example',
    height: 320,
    datum: [
        Datum.pie(values, {
            label: 'category',
            value: 'value',
            colors: [
                Color.Blue,
                Color.Green,
                Color.Orange,
                Color.Red
            ]
        })
    ]
});