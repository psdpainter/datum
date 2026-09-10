// Helper to extract a sorted, numeric array from either numbers or object arrays
function extractNumbers(data = [], key = null) {
  if (!Array.isArray(data)) return [];

  return data
    .map(item => {
      const val = key && typeof item === 'object' && item !== null ? item[key] : item;
      return Number(val);
    })
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b);
}

// Calculate the arithmetic mean
export function mean(data = [], key = null) {
  const nums = extractNumbers(data, key);
  if (nums.length === 0) return 0;

  const total = nums.reduce((sum, n) => sum + n, 0);
  return total / nums.length;
}

// Calculate the median (middle value or average of two middle values)
export function median(data = [], key = null) {
  const nums = extractNumbers(data, key);
  if (nums.length === 0) return 0;

  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 !== 0 
    ? nums[mid] 
    : (nums[mid - 1] + nums[mid]) / 2;
}

// Calculate the mode (returns single value or array if multimodal)
export function mode(data = [], key = null) {
  const nums = extractNumbers(data, key);
  if (nums.length === 0) return null;

  const frequency = new Map();
  let maxCount = 0;

  for (const n of nums) {
    const count = (frequency.get(n) || 0) + 1;
    frequency.set(n, count);
    if (count > maxCount) {
      maxCount = count;
    }
  }

  const modes = [];
  frequency.forEach((count, val) => {
    if (count === maxCount) modes.push(val);
  });

  if (modes.length === frequency.size && frequency.size > 1) {
    return null;
  }

  return modes.length === 1 ? modes[0] : modes;
}