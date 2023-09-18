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
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    tabIconBackground: '#f7f7f7',
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
    blue: blue,
    yellow,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    tabIconBackground: '#272727',
    genericButton: tintColorLight,
    inputBackground: lowContrastColorDark,
    inputBorder: highContrastColorDark,
  },
};
