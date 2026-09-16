import {
    Datum,
    Color
} from '@psdpainter/datum-js';

const values = [
    { x: 'Mon', open: 142, high: 151, low: 139, close: 148 },
    { x: 'Tue', open: 148, high: 153, low: 144, close: 146 },
    { x: 'Wed', open: 146, high: 156, low: 145, close: 154 },
    { x: 'Thu', open: 154, high: 158, low: 149, close: 151 },
    { x: 'Fri', open: 151, high: 160, low: 150, close: 158 },
    { x: 'Mon', open: 158, high: 163, low: 154, close: 156 },
    { x: 'Tue', open: 156, high: 166, low: 155, close: 164 }
];

Datum.chart({
    target: '#candlestick-example',
    width: '100%',
    height: 320,
    datum: [
        Datum.candlestick(values, {
            x: 'x',
            open: 'open',
            high: 'high',
            low: 'low',
            close: 'close',
            upColor: Color.Green,
            downColor: Color.Red,
            strokeWidth: 1,
            rx: 1
        })
    ]
});