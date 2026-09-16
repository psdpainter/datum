import { Datum, Color } from '@psdpainter/datum-js';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'];

const values = Array.from(
    { length: days.length * hours.length },
    (_, index) => ({
        day: days[index % days.length],
        hour: hours[Math.floor(index / days.length)],
        activity: Math.floor(Math.random() * 80) + 10
    })
);

Datum.chart({
    target: '#heatmap-example',
    height: 320,
    datum: [
        Datum.heatmap(values, {
            x: 'day',
            y: 'hour',
            value: 'activity',
            minColor: '#e0f2fe',
            maxColor: Color.Blue,
            showValues: true
        })
    ]
});