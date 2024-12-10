
const backgroundColorLight = '#fafafc';
const backgroundColorDark = '#000000';

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

const textColorLight = '#000000';
const textColorDark = '#ffffff';

const textColorDimLight = '#505050';
const textColorDimDark = '#afafaf';

const tintActiveColorLight = blue;
const tintActiveColorDark =  blue;

// const tintActiveColorLight = '#0060d0';
// const tintActiveColorDark = '#0f7ddf';

const tintInactiveColorLight = highContrastColorLight;
const tintInactiveColorDark = highContrastColorDark;



export default {
  light: {
    text: textColorLight,
    background: backgroundColorLight,
    tint: tintActiveColorLight,
    lowContrast: lowContrastColorLight,
    mediumContrast: mediumContrastColorLight,
    highContrast: highContrastColorLight,
    blue,
    yellow,
    green,
    red,
    tabIconDefault: textColorDimLight,
    tabIconSelected: tintActiveColorLight,
    tabIconBackground: lowContrastColorLight,
    genericButton: tintActiveColorLight,
    inputBackground: lowContrastColorLight,
    inputBorder: highContrastColorLight,
  },
  dark: {
    text: textColorDark,
    background: backgroundColorDark,
    tint: tintActiveColorDark,
    lowContrast: lowContrastColorDark,
    mediumContrast: mediumContrastColorDark,
    highContrast: highContrastColorDark,
    blue,
    yellow,
    green,
    red,
    tabIconDefault: textColorDimDark,
    tabIconSelected: tintActiveColorDark,
    tabIconBackground: lowContrastColorDark,
    genericButton: tintActiveColorLight,
    inputBackground: lowContrastColorDark,
    inputBorder: highContrastColorDark,
  },
};
