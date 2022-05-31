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
  TouchableOpacity,
} from 'react-native';
import { Text, View, ConnectionStatus } from '../components/Themed';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import { selectNetwork } from '../features/network/networkSlice';


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  groupContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  groupTitle: {
    marginBottom: 3,
    fontSize: Platform.OS === 'ios' ? 18 : 16,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#989898',
    width: '100%', // we want the border to be full width
    marginVertical: 10,
  },

  itemContainer: {
    flexDirection: 'row',
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 8,
  },

  item: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },

  label: {
    width: 80,
  },

  input: {
    flex: 1,
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    borderColor: '#ababab',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 7,
    paddingRight: 7,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#efefef',
  },

  smallInput: {
    maxWidth: 50,
    textAlign: 'center',
  },

  button: {
    alignItems: "center",
    padding: 16,
    borderRadius: 4,
    alignSelf: 'stretch'
  },
});

export default function SettingsScreen({ color, navigation }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const network = useAppSelector((state) => selectNetwork(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // temporary value for editing
  const [webSocketUrl, setWebSocketUrl]
    = React.useState(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');

  // update local value for coercion by store
  React.useEffect( () => {
    setWebSocketUrl(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');
  }, [settings.webSocketUrl]);

  // temporary value for editing
  const [oscUrl, setOscUrl]
    = React.useState(settings.oscUrl ? `${settings.oscUrl}` : '');

  // update local value for coercion by store
  React.useEffect( () => {
    setOscUrl(settings.oscUrl ? `${settings.oscUrl}` : '');
  }, [settings.oscUrl]);

    // temporary value for editing
  const [deviceMotionInterval, setDeviceMotionInterval]
    = React.useState(`${settings.deviceMotionInterval}`);

  // update local value for coercion by store
  React.useEffect(() => {
    setDeviceMotionInterval(`${settings.deviceMotionInterval}`);
  }, [settings.deviceMotionInterval]);

    // temporary value for editing
  const [id, setId] = React.useState(`${settings.id}`);

  // update local value for coercion by store (...not really sure what this does)
  React.useEffect(() => {
    setId(`${settings.id}`);
  }, [settings.id]);

  return (
    <KeyboardAwareScrollView>

      <View style={styles.container}>

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.genericButton }]}
            onPress={() => navigation.navigate('QR')}
          >
            <Text style={{color: 'white'}}>Scan config from QRCode</Text>
          </TouchableOpacity>
        </View>

        {/* MISC SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              General
            </Text>
          </View>
          <View style={styles.separator}></View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              Id
            </Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder='Enter Id here'
              value={id}
              onChange={e => {
                setId(e.nativeEvent.text);
              }}
              onBlur={e => {
                if (id !== '') {
                  dispatch({
                    type: 'settings/set',
                    payload: { id },
                  });
                } else {
                  setId(`${settings.id}`);
                }
              }}
            />
          </View>

          {/* ACC - TO REVIEW, WE NEED A GLOBAL FRAME RATE */}
          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              Period
            </Text>
            <TextInput
              style={[styles.input, styles.smallInput]}
              keyboardType='numeric'
              returnKeyType='done'
              selectTextOnFocus={true}
              placeholder='Enter period (in ms) here'
              value={deviceMotionInterval}
              onChange={e => {
                setDeviceMotionInterval(e.nativeEvent.text);
              }}
              onBlur={e => {
                if (Number.isInteger(parseInt(deviceMotionInterval))) {
                  dispatch({
                    type: 'settings/set',
                    payload: {
                      deviceMotionInterval: parseInt(deviceMotionInterval),
                    },
                  });
                } else {
                  setDeviceMotionInterval(`${settings.deviceMotionInterval}`);
                }
              }}
            />
            <Text style={styles.item}> ms</Text>
          </View>

        </View>

        {/* WEBSOCKET SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              WebSocket
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>Activate</Text>
            <Switch style={styles.item}
              trackColor={ Platform.OS !== "ios"
                           ? (settings.webSocketEnabled ? colors.tint : '#999999')
                           : undefined }
              thumbColor={ Platform.OS !== "ios"
                           ? (settings.webSocketEnabled ? colors.tint : colors.text)
                           : undefined }
              ios_backgroundColor={ settings.webSocketEnabled ? colors.tint : '#999999' }
              value={settings.webSocketEnabled}
              onValueChange={(value) => {
                dispatch({
                  type: 'settings/set',
                  payload: { webSocketEnabled: value },
                });
              }}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              Status
            </Text>
            <ConnectionStatus style={styles.item} status={network.webSocketReadyState} />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>URL</Text>
            <TextInput
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
                  payload: { webSocketUrl },
                });
              }}
            />
          </View>
        </View>

        {/* OSC SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              OSC
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>Activate</Text>
            <Switch style={styles.item}
              trackColor={ Platform.OS !== "ios"
                           ? (settings.oscEnabled ? colors.tint : '#999999')
                           : undefined }
              thumbColor={ Platform.OS !== "ios"
                           ? (settings.oscEnabled ? colors.tint : colors.text)
                           : undefined }
              ios_backgroundColor={ settings.oscEnabled ? colors.tint : '#999999' }
              value={settings.oscEnabled}
              onValueChange={(value) => {
                dispatch({
                  type: 'settings/set',
                  payload: { oscEnabled: value },
                });
              }}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              Status
            </Text>
            <ConnectionStatus style={styles.item} status={network.oscReadyState} />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>URL</Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder='Enter URL here'
              value={oscUrl}
              onChange={(e) => {
                setOscUrl(e.nativeEvent.text);
              } }
              onBlur={(e) => {
                dispatch({
                  type: 'settings/set',
                  payload: { oscUrl },
                });
              }}
            />
          </View>
        </View>

      </View>
    </KeyboardAwareScrollView>
  );
}
