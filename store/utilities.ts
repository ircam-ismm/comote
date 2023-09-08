const e = {};

export function parseIntSafe(value: any, {
  fallback = 0,
}: { fallback?: number; } = {}) {
  return parseInt(value, 10) || fallback;
}
Object.assign(e, { parseIntSafe });

export default e;
