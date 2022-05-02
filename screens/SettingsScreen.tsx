import * as React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { Text, View } from '../components/Themed';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import { selectNetwork } from '../features/network/networkSlice';

// import engine from '../engine';

export default function SettingsScreen({color}) {
  const settings = useAppSelector( (state) => selectSettings(state) );
  const network = useAppSelector( (state) => selectNetwork(state) );
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // temporary value for editing
  const [accelerometerFrequency, setAccelerometerFrequency]
    = React.useState(`${settings.accelerometerFrequency}`);

  // update local value for coercion by store
  React.useEffect( () => {
    setAccelerometerFrequency(`${settings.accelerometerFrequency}`);
  }, [settings.accelerometerFrequency]);

  // temporary value for editing
  const [webSocketUrl, setWebSocketUrl]
    = React.useState(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');

  // update local value for coercion by store
  React.useEffect( () => {
    setWebSocketUrl(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');
  }, [settings.webSocketUrl]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>

        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Accelerometer</Text>

          <View style={styles.itemContainer}>
            <Text style={styles.item}>Frequency</Text>
            <TextInput
              color={colors.text} // why should we apply again the default style?
              style={[styles.input, styles.frequencyInput]}
              keyboardType='numeric'
              returnKeyType='done'
              selectTextOnFocus={true}
              placeholder='Enter frequency here '
              value={accelerometerFrequency}
              onChange={(e) => {
                setAccelerometerFrequency(e.nativeEvent.text);
              } }
              onBlur={(e) => {
                dispatch({
                  type: 'settings/set',
                  payload: {
                    accelerometerFrequency: parseFloat(accelerometerFrequency),
                  },
                });
                if(accelerometerFrequency === '') {
                  setAccelerometerFrequency(`${settings.accelerometerFrequency}`);
                }
              } }
            />
            <Text style={styles.item}>Hz</Text>
          </View>

        </View>

        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>WebSocket</Text>
          <View style={styles.itemContainer}>
            <Switch style={styles.item}
              trackColor={ Platform.OS !== "ios"
                           ? (settings.webSocketEnabled ? colors.tint : '#999999')
                           : undefined }
              thumbColor={ Platform.OS !== "ios"
                           ? (settings.webSocketEnabled ? colors.tint : colors.text)
                           : undefined }
              ios_backgroundColor={ settings.webSocketEnabled ? colors.tint : '#999999' }
              value={settings.webSocketEnabled}
              onValueChange={ (value) => {
                console.log('switch value', value);
                dispatch({
                  type: 'settings/set',
                  payload: {
                    webSocketEnabled: value,
                  },
                });
              } }
            />
      <Text
        style={[
          styles.item,
          {color: settings.webSocketEnabled ? colors.tint : colors.text},
        ]}
        onPress={ () => {
          dispatch({
            type: 'settings/set',
            payload: {
              webSocketEnabled: !settings.webSocketEnabled,
            },
          });
      }

    }
      >{settings.webSocketEnabled ? 'Enabled' : 'Disabled'}</Text>
      <Text style={[
        styles.item,
        (network.webSocketReadyState === 'OPEN'
         ? styles.webSocketOpen
         : styles.webSocketNotOpen)
        ]}>
        {settings.webSocketEnabled ? network.webSocketReadyState : '' }
      </Text>

        </View>

          <View style={styles.itemContainer}>
            <Text style={styles.item}>URL</Text>
            <TextInput
              color={colors.text} // why should we apply again the default style?
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder='Enter URL here'
              value={webSocketUrl}
              onChange={(e) => {
                setWebSocketUrl(e.nativeEvent.text);
              } }
              onBlur={(e) => {
                dispatch({
                  type: 'settings/set',
                  payload: {
                    webSocketUrl,
                  },
                });
              } }
            />
          </View>
        </View>


      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  },
  groupContainer: {
    padding: 10,
    fontSize: 24,
    fontWeight: 'bold',
    alignItems: 'flex-start',
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    flexWrap: "wrap",
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  item: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    fontSize: 20,
    marginHorizontal: 5,
  },
  webSocketNotOpen: {
    color: '#ff2266',
  },
  input: {
    flex: 1,
    fontSize: 20,
    borderColor: '#777777',
    borderWidth: 2,
    borderRadius: 2,
    borderStyle: 'solid',
    paddingLeft: 5,
    paddingRight: 5,
  },
  frequencyInput: {
    maxWidth: 45,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
  },
});
