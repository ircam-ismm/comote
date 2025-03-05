const e = {};

export function parseIntSafe(value: any, {
  fallback = 0,
}: { fallback?: number; } = {}) {
  const parsed = parseInt(value, 10);
  if (typeof parsed === 'number' && !Number.isNaN(parsed)) {
    return parsed;
  } else {
    return fallback;
  }
}
Object.assign(e, { parseIntSafe });

export default e;
