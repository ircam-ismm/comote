import * as React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { View } from '../components/Themed';
import ConnectionStatusComponent from '../components/ConnectionStatusComponent';
import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import isURL from '../helpers/isURL';

const onLoad = `
  ['touchstart', 'touchend'].forEach(input => {
    document.body.addEventListener(input, (e) => {
      const target = e.target;

      if (target.hasAttribute('comote-key')) {
        if (target.hasAttribute(\`comote-\${input}\`)) {
          const key = target.getAttribute('comote-key');
          const value = target.getAttribute(\`comote-\${input}\`);

          window.ReactNativeWebView.postMessage(JSON.stringify({ [key]: value }));
        }
      }
    });
  });

  window.sendEvent = (key, value) => {
    console.log(key, value);
    window.ReactNativeWebView.postMessage(JSON.stringify({ [key]: value }));
  };
`;

export default function WebViewScreen({ color }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'space-around',
      backgroundColor: colors.background,
      color: colors.text,
    },
    webview: {
      flex: 1,
      minWidth: '100%',
      border: '1px solid green',
      backgroundColor: colors.background,
      color: colors.text,
    },
  });

  // force reload if http error
  const webViewRef = React.useRef();

  const content = settings.webviewContent === null || settings.webviewContent === ''
    ? `<p style="font-size: 40px; margin-top: 150px; text-align: center; color: ${colors.text}">No webview content defined</p>`
    : settings.webviewContent;

  console.log(content);

  const source = isURL(content) ? { uri: content } : { html: content };

  return (
    <View style={styles.container}>
      <ConnectionStatusComponent color={color} />
      <WebView style={styles.webview}
        originWhitelist={['*']}
        source={source}
        onMessage={(event) => {
          const control = JSON.parse(event.nativeEvent.data);
          dispatch({
            type: 'sensors/set',
            payload: { control },
          });
        }}
        injectedJavaScript={onLoad}
        ref={(ref) => webViewRef.current = ref}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('Error loading webview, retry on 2 seconds', nativeEvent);
          setTimeout(() => webViewRef.current.reload(), 2000);
        }}
      />
    </View>
  );
}
