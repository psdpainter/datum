export const ohlcData = [
  { date: 'Sep 01', open: 182, high: 188, low: 180, close: 187 },
  { date: 'Sep 02', open: 187, high: 191, low: 184, close: 185 },
  { date: 'Sep 03', open: 185, high: 186, low: 178, close: 179 },
  { date: 'Sep 04', open: 179, high: 184, low: 176, close: 183 },
  { date: 'Sep 05', open: 183, high: 192, low: 182, close: 190 },
  { date: 'Sep 08', open: 190, high: 195, low: 188, close: 194 },
  { date: 'Sep 09', open: 194, high: 196, low: 189, close: 191 },
  { date: 'Sep 10', open: 191, high: 193, low: 182, close: 184 },
  { date: 'Sep 11', open: 184, high: 189, low: 183, close: 188 },
  { date: 'Sep 12', open: 188, high: 198, low: 187, close: 196 }
];

export const salesData = [
  { quarter: 'Q1', online: 120, retail: 80, target: 180 },
  { quarter: 'Q2', online: 150, retail: 95, target: 220 },
  { quarter: 'Q3', online: 180, retail: 70, target: 210 },
  { quarter: 'Q4', online: 240, retail: 130, target: 300 }
];

export const stockData = [
  { day: '2025-09-22', open: 210, close: 215, volume: 45 },
  { day: '2025-09-23', open: 216, close: 212, volume: 60 },
  { day: '2025-09-24', open: 213, close: 228, volume: 85 },
  { day: '2025-09-25', open: 227, close: 224, volume: 40 },
  { day: '2025-09-26', open: 225, close: 235, volume: 95 }
];

const randomDecimal = (range, min = 0) =>
  Number((Math.random() * range + min).toFixed(2));

const randomDay = (startDate, endDate) => {
  const dayMs = 24 * 60 * 60 * 1000;
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const days = Math.floor((end - start) / dayMs);
  const offset = Math.floor(Math.random() * (days + 1));

  return new Date(start + offset * dayMs).toISOString().slice(0, 10);
};

export const aaplStock = Array.from({ length: 30 }, () => ({
  day: randomDay("2025-08-01", "2025-09-11"),
  open: Math.random() * 200 + 200,
  close: Math.random() * 200 + 200,
  high: Math.random() * 300 + 300,
  low: Math.random() * 200 + 200
}));

// export const aaplStock = [{
//     "day": "2025-09-08",
//     "open": 239.3,
//     "high": 240.15,
//     "low": 236.34,
//     "close": 237.88
//   },
//   {
//     "day": "2025-09-09",
//     "open": 237,
//     "high": 238.78,
//     "low": 233.36,
//     "close": 234.35
//   },
//   {
//     "day": "2025-09-10",
//     "open": 232.19,
//     "high": 232.42,
//     "low": 225.95,
//     "close": 226.79
//   },
//   {
//     "day": "2025-09-11",
//     "open": 226.88,
//     "high": 230.45,
//     "low": 226.65,
//     "close": 230.03
//   },
//   {
//     "day": "2025-09-12",
//     "open": 229.22,
//     "high": 234.51,
//     "low": 229.02,
//     "close": 234.07
//   },
//   {
//     "day": "2025-09-15",
//     "open": 237,
//     "high": 238.19,
//     "low": 235.03,
//     "close": 236.7
//   },
//   {
//     "day": "2025-09-16",
//     "open": 237.18,
//     "high": 241.22,
//     "low": 236.32,
//     "close": 238.15
//   },
//   {
//     "day": "2025-09-17",
//     "open": 238.97,
//     "high": 240.1,
//     "low": 237.73,
//     "close": 238.99
//   },
//   {
//     "day": "2025-09-18",
//     "open": 239.97,
//     "high": 241.2,
//     "low": 236.65,
//     "close": 237.88
//   },
//   {
//     "day": "2025-09-19",
//     "open": 241.23,
//     "high": 246.3,
//     "low": 240.21,
//     "close": 245.5
//   },
//   {
//     "day": "2025-09-22",
//     "open": 248.3,
//     "high": 256.64,
//     "low": 248.12,
//     "close": 256.08
//   },
//   {
//     "day": "2025-09-23",
//     "open": 255.88,
//     "high": 257.34,
//     "low": 253.58,
//     "close": 254.43
//   },
//   {
//     "day": "2025-09-24",
//     "open": 255.22,
//     "high": 255.74,
//     "low": 251.04,
//     "close": 252.31
//   },
//   {
//     "day": "2025-09-25",
//     "open": 253.21,
//     "high": 257.17,
//     "low": 251.71,
//     "close": 256.87
//   },
//   {
//     "day": "2025-09-26",
//     "open": 254.1,
//     "high": 257.6,
//     "low": 253.78,
//     "close": 255.46
//   },
//   {
//     "day": "2025-09-29",
//     "open": 254.56,
//     "high": 255,
//     "low": 253.01,
//     "close": 254.43
// }];

export const marketShareData = [
  { device: 'Desktop', share: 45 },
  { device: 'Mobile', share: 38 },
  { device: 'Tablet', share: 12 },
  { device: 'Other', share: 5 }
];

export const rawDistribution = [55, 25, 15, 5];

export const forecast = [
  { day: 'Mon', tempMin: 52, tempMax: 68, median: 60 },
  { day: 'Tue', tempMin: 55, tempMax: 72, median: 63 },
  { day: 'Wed', tempMin: 58, tempMax: 76, median: 67 },
  { day: 'Thu', tempMin: 60, tempMax: 79, median: 70 },
  { day: 'Fri', tempMin: 54, tempMax: 71, median: 62 },
  { day: 'Sat', tempMin: 50, tempMax: 65, median: 58 },
  { day: 'Sun', tempMin: 48, tempMax: 62, median: 55 }
];

export const weeklyActivity = [
  { day: 'Mon', slot: 'Morning', activeUsers: 14 },
  { day: 'Mon', slot: 'Afternoon', activeUsers: 45 },
  { day: 'Mon', slot: 'Evening', activeUsers: 82 },
  { day: 'Tue', slot: 'Morning', activeUsers: 22 },
  { day: 'Tue', slot: 'Afternoon', activeUsers: 58 },
  { day: 'Tue', slot: 'Evening', activeUsers: 95 },
  { day: 'Wed', slot: 'Morning', activeUsers: 30 },
  { day: 'Wed', slot: 'Afternoon', activeUsers: 64 },
  { day: 'Wed', slot: 'Evening', activeUsers: 70 },
  { day: 'Thu', slot: 'Morning', activeUsers: 18 },
  { day: 'Thu', slot: 'Afternoon', activeUsers: 50 },
  { day: 'Thu', slot: 'Evening', activeUsers: 88 },
  { day: 'Fri', slot: 'Morning', activeUsers: 40 },
  { day: 'Fri', slot: 'Afternoon', activeUsers: 78 },
  { day: 'Fri', slot: 'Evening', activeUsers: 110 }
];