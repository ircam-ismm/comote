// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

console.log('config', config);

// expo (49) over-rides metro's default
// i18n-js needs '.mjs'
config.watcher.additionalExts.push('mjs', 'cjs');

module.exports = config;
