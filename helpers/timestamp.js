const timestampOrigin = global.performance.now();

export function timestampGet() {
    return Math.round(global.performance.now() - timestampOrigin);
}
