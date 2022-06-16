/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import i18n from 'i18n-js';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function WebSocketConnectionStatus(props: ViewProps) {
  let { status, style, lightColor, darkColor, ...otherProps } = props;

  if (!status) {
    status = 'CLOSED';
  }

  const statusMap = {
    CLOSED: i18n.t('connectionStatus.ws.closed'),
    CLOSING: i18n.t('connectionStatus.ws.closing'),
    CONNECTING_REQUEST: i18n.t('connectionStatus.ws.connectingRequest'),
    CONNECTING: i18n.t('connectionStatus.ws.connecting'),
    OPEN: i18n.t('connectionStatus.ws.open'),
  };

  const colors = {
    CLOSED: '#dc3545',
    CLOSING: '#dc3545',
    CONNECTING_REQUEST: '#ffc107',
    CONNECTING: '#ffc107',
    OPEN: '#28a745',
  }

  return (
    <Text style={[{ color: colors[status] }, style]} {...otherProps}>
      {statusMap[status]}
    </Text>
  );
}

export function OscConnectionStatus(props: ViewProps) {
  let { status, style, lightColor, darkColor, ...otherProps } = props;

  if (!status) {
    status = 'CLOSED';
  }

  const statusMap = {
    CLOSED: i18n.t('connectionStatus.osc.closed'),
    OPENING_REQUEST: i18n.t('connectionStatus.osc.openingRequest'),
    OPENING: i18n.t('connectionStatus.osc.opening'),
    OPEN: i18n.t('connectionStatus.osc.open'),
  };

  const colors = {
    CLOSED: '#dc3545',
    OPENING_REQUEST: '#ffc107',
    OPENING: '#ffc107',
    OPEN: '#28a745',
  }

  return (
    <Text style={[{ color: colors[status] }, style]} {...otherProps}>
      {statusMap[status]}
    </Text>
  );
}
