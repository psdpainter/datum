import { Datum, Color } from '@psdpainter/datum-js';

const values = Array.from(
    { length: 12 },
    (_, index) => {
        const average = 60 + Math.sin(index / 2) * 12;
        const spread = 8 + Math.random() * 8;

        return {
            month: index + 1,
            low: Math.round(average - spread),
            high: Math.round(average + spread)
        };
    }
);

Datum.chart({
    target: '#range-example',
    height: 320,
    datum: [
        Datum.range(values, {
            x: 'month',
            yMin: 'low',
            yMax: 'high',
            fill: Color.Blue,
            opacity: 0.25
        })
    ]
});