import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Pressable, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { View, Text } from '../components/Themed';
import ConnectionStatusComponent from '../components/ConnectionStatusComponent';
import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import isURL from '../helpers/isURL';

// this is extended later with variable to pass some state to the webview
const injectJavascript = `
  ['touchstart', 'touchend'].forEach(input => {
    document.body.addEventListener(input, (e) => {
      const target = e.target;

      if (target.hasAttribute('comote-key')) {
        if (target.hasAttribute(\`comote-\${input}\`)) {
          const key = target.getAttribute('comote-key');
          const value = target.getAttribute(\`comote-\${input}\`);

          window.sendEvent(key, value);
        }
      }
    });
  });

  window.sendEvent = (key, value) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: 'control', data: { [key]: value } }));
  };

  window.toggleModal = () => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: 'toggleModal' }));
  };

  window.log = (...value) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: 'log', data: value }));
  };
`;

export default function WebViewScreen({ color }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'space-around',
      backgroundColor: colors.background,
      color: colors.text,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 50,
      backgroundColor: colors.highContrast,
    },
    buttonText: {
      fontSize: 24,
      lineHeight: 24,
      textAlign: 'center',
    },
    webview: {
      flex: 1,
      minWidth: '100%',
      backgroundColor: colors.background,
      color: colors.text,
    },
    modal: {
      height: '100%',
      flex: 1,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      alignContent: 'space-around',
      backgroundColor: colors.lowContrast,
    },
  });

  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => selectSettings(state));
  const [modalVisible, setModalVisible] = useState(false);

  // prevent sleep when tab is focused
  useFocusEffect(
    useCallback(() => {
      // prevent sleep when tab is focused
      const keepAwakeTag = 'comote:play';
      activateKeepAwakeAsync(keepAwakeTag);

      return () => {
        deactivateKeepAwake(keepAwakeTag);
      };
    }, [])
  );

  // force reload if http error
  const webViewRef = useRef();

  const content = settings.webviewContent === null || settings.webviewContent === ''
    ? `<p style="font-size: 40px; margin-top: 150px; text-align: center; color: ${colors.text}">No webview content defined</p>`
    : settings.webviewContent;

  const source = isURL(content) ? { uri: content } : { html: content };

  const onWebViewMessage = event => {
    event = JSON.parse(event.nativeEvent.data);

    switch(event.cmd) {
      case 'control': {
        dispatch({
            type: 'sensors/set',
            payload: { control: event.data },
        });
        break;
      }
      case 'toggleModal': {
        setModalVisible(!modalVisible);
        break;
      }

      // debug
      case 'log': {
        console.log(...event.data);
        break;
      }
    }
  };

  const onWebViewError = syntheticEvent => {
    const { nativeEvent } = syntheticEvent;
    console.log('Error loading webview, retry in 2 seconds', nativeEvent);
    setTimeout(() => webViewRef.current.reload(), 2000);
  };

  return (
    <View style={styles.container}>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
      >
        <View style={styles.modal}>
          <WebView style={styles.webview}
            originWhitelist={['*']}
            source={source}
            onMessage={onWebViewMessage}
            injectedJavaScript={injectJavascript}
            ref={(ref) => webViewRef.current = ref}
            onError={onWebViewError}
          />
        </View>
      </Modal>

      <View style={styles.header}>
        <ConnectionStatusComponent color={color} compact={true} />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed ? { opacity: 0.5 } : {},
          ]}
          onPressOut={() => {
            webViewRef.current.reload();
          }}
        >
          <Text style={styles.buttonText} selectable={false}>⟳</Text>
        </Pressable>
      </View>

      {!modalVisible ?
        <WebView style={styles.webview}
          originWhitelist={['*']}
          source={source}
          onMessage={onWebViewMessage}
          injectedJavaScript={injectJavascript}
          ref={(ref) => webViewRef.current = ref}
          onError={onWebViewError}
        />
        : <View style={styles.webview}></View>
      }

    </View>
  );
}
