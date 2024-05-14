import * as React from 'react';
import { StyleSheet, Button } from 'react-native';

import { View } from '../components/Themed';

import { WebView } from 'react-native-webview';
import { RootTabScreenProps } from '../types';

import * as Linking from 'expo-linking';

import { useAppSelector, useAppDispatch } from '../hooks';

function propagateEvent(event) {
  console.log(event);
}

const onLoad = `
  // ['touchstart', 'touchend'].forEach(input => {
  //   document.addEventListener(input => {
  //     const target = event.target;

  //     if (target.hasAttribute('comote-key')) {
  //       if (button.hasAttribute(\`comote-\${input}\`)) {
  //         const key = button.getAttribute('comote-key');
  //         const value = button.getAttribute(\`comote-\${input}\`);

  //         window.ReactNativeWebView.postMessage(JSON.stringify({ [key]: value }));
  //       }
  //     }
  //   });
  // });

  const buttons = document.querySelectorAll('[comote-key]');
  Array.from(buttons).forEach(button => {
    ['touchstart', 'touchend'].forEach(input => {
      button.addEventListener(input, () => {
        if (button.hasAttribute(\`comote-\${input}\`)) {
          const key = button.getAttribute('comote-key');
          const value = button.getAttribute(\`comote-\${input}\`);

          window.ReactNativeWebView.postMessage(JSON.stringify({ [key]: value }));
        }
      });
    });
  });

  window.sendEvent = (key, value) => {
    window.ReactNativeWevView.postMessage(JSON.stringify({ [key]: value }));
  };
`;

export default function DebugScreen({color}) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: 'green',
    },
    webview: {
      flex: 1,
      minWidth: '100%',
      backgroundColor: 'red',
      border: '1px solid green',
    },
  });

  return (
    <View style={styles.container}>
      <WebView style={styles.webview}
        originWhitelist={['*']}
        source={{
          // uri: 'https://github.com/react-native-webview/react-native-webview',
          html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title></title>
</head>
<body>
    <button comote-key="coucou-1" comote-touchstart="1" comote-touchend="0">Coucou</button>
    <button comote-key="coucou-2" comote-touchstart="1" comote-touchend="0">Coucou</button>
    <button comote-key="coucou-3" comote-touchstart="1" comote-touchend="0">Coucou</button>
</body>
</html>
          `
        }}
        onMessage={(event) => {
          console.log(JSON.parse(event.nativeEvent.data));
        }}
        injectedJavaScript={onLoad}
      />
    </View>
  );
}
