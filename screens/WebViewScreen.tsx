import { useCallback, useRef, useState } from 'react';
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

import { timestampGet } from '../helpers/timestamp';
import { engine } from '../engine';

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

  window.setModal = (value) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: 'setModal', data: value}));
  };


  window.log = (...value) => {
    window.ReactNativeWebView.postMessage(JSON.stringify({ cmd: 'log', data: value }));
  };

  // parse and propagate unified event across platforms
  // https://github.com/react-native-webview/react-native-webview/issues/3776
  function unpackAndPropagateMessage(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.source === 'comote') {
        // do not propagate control events
        if (data.control !== undefined) {
          return;
        }

        const comoteEvent = new CustomEvent('comote', {
          bubbles: true,
          composed: true,
          detail: data,
        });

        window.dispatchEvent(comoteEvent);
      }
    } catch (err) {
      console.error("Failed to parse and send comote frame from React Native:", error);
    }
  }

  // listen for both document and window to workaround platform inconsistencies
  // cf. https://github.com/react-native-webview/react-native-webview/issues/3776#issuecomment-3251753403
  document.addEventListener("message", unpackAndPropagateMessage);
  window.addEventListener("message", unpackAndPropagateMessage);
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
  // force reload if http error
  const webViewRef = useRef();

  // prevent sleep when tab is focused
  useFocusEffect(
    useCallback(() => {
      // prevent sleep when tab is focused
      const keepAwakeTag = 'comote:webview';
      activateKeepAwakeAsync(keepAwakeTag);
      // propagate sensors to
      engine.addListener(propagateSensors);

      return () => {
        deactivateKeepAwake(keepAwakeTag);
        engine.removeListener(propagateSensors)
      };
    }, [])
  );

  const content = settings.webviewContent === null || settings.webviewContent === ''
    ? `<p style="font-size: 40px; margin-top: 150px; text-align: center; color: ${colors.text}">No webview content defined</p>`
    : settings.webviewContent;

  const source = isURL(content) ? { uri: content } : { html: content };

  // propagate sensors stream to webview, see injected JS for how it is processed then
  // client code should listen for `window.addEventListener('comote', e => console.log(e.data))`
  function propagateSensors(values) {
    webViewRef.current?.postMessage(JSON.stringify(values));
  }

  const onWebViewMessage = (event) => {
    event = JSON.parse(event.nativeEvent.data);

    switch(event.cmd) {
      case 'control': {
        const timestamp = timestampGet();
        const controls = {};
        Object.entries(event.data).forEach( ([key, value]) => {
          controls[key] = value;
        });

        dispatch({
            type: 'sensors/set',
            payload: { control: {
                ...controls,
                timestamp,
              }
            },
        });
        break;
      }
      case 'toggleModal': {
        setModalVisible(!modalVisible);
        break;
      }

      case 'setModal': {
        setModalVisible(event.data);
        break;
      }

      // debug
      case 'log': {
        console.log(...event.data);
        break;
      }
    }
  };

  const onWebViewError = (syntheticEvent) => {
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
          {modalVisible ?
            <WebView style={styles.webview}
              originWhitelist={['*']}
              source={source}
              onMessage={onWebViewMessage}
              injectedJavaScript={injectJavascript}
              ref={(ref) => webViewRef.current = ref}
              onError={onWebViewError}
            />
            : null
          }
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
        : null
      }

    </View>
  );
}
