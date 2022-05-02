const e = {};

export function parseIntSafe(value: any, {
  fallback = 0,
}: { fallback?: number; } = {}) {
  return parseInt(value) || fallback;
}
Object.assign(e, { parseIntSafe });

export default e;
