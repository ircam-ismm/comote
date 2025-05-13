export function apiStringToVersion(apiString) {
  if (typeof apiString === 'string' && apiString.length > 0) {
    return parseInt(apiString.slice(1), 10);
  }
  return 0;
}
