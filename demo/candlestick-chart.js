import { Color, Datum } from '../src/datum.js';
import { 
  ohlcData, 
  salesData, 
  aaplStock, 
  marketShareData, 
  rawDistribution,
  forecast,
  weeklyActivity
} from './data.js';

Datum.chart({
  target: '#chart',
  title: 'Asset Price Action',
  subTitle: 'OHLC Candlestick Overview',
  width: '100%',
  height: 400,
  config: {
    xAxis: { labelAngle: 0 }
  },
  animated: true,
  datum: [
    Datum.candlestick(ohlcData, {
      name: 'Candle data',
      x: 'date',
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      upColor: Color.Green,
      downColor: Color.Red
    })
  ]
});
