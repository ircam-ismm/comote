const tintColorLight = '#2f95dc';
const tintColorDark = '#2f95dc';

const lowContrastColorLight = '#efefef';
const lowContrastColorDark = '#202020';

const mediumContrastColorLight = '#cccccc';
const mediumContrastColorDark = '#222222';

const highContrastColorLight = '#aaaaaa';
const highContrastColorDark = '#666666';

const blue = '#0c7bdc';
const yellow = '#ffc20a';
const green = '#28a745';
const red = '#dc3545';


export default {
  light: {
    text: '#000000',
    background: '#fafafc',
    tint: tintColorLight,
    lowContrast: lowContrastColorLight,
    mediumContrast: mediumContrastColorLight,
    highContrast: highContrastColorLight,
    blue,
    yellow,
    green,
    red,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    tabIconBackground: '#efefef',
    genericButton: tintColorLight,
    inputBackground: lowContrastColorLight,
    inputBorder: highContrastColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    tint: tintColorDark,
    lowContrast: lowContrastColorDark,
    mediumContrast: mediumContrastColorDark,
    highContrast: highContrastColorDark,
    blue,
    yellow,
    green,
    red,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    tabIconBackground: '#101010',
    genericButton: tintColorLight,
    inputBackground: lowContrastColorDark,
    inputBorder: highContrastColorDark,
  },
};
