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
  contentContainer: {
    flex: 1,
  },

  innerContainer: {
    padding: 16,
    flex: 1,
  },

  groupContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  groupTitle: {
    marginVertical: 10,
    borderBottomColor: '#989898',
    borderBottomWidth: 1,
    width: '100%', // we want the border to be full width
    fontSize: 16,
  },

  itemContainer: {
    flexDirection: 'row',
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 8,
  },

  item: {
    fontSize: 14,
  },

  label: {
    width: 80,
  },

  input: {
    flex: 1,
    fontSize: 14,
    borderColor: '#ababab',
    paddingVertical: 4,
    paddingHorizontal: 7,
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
  }
});

export default function SettingsScreen({ color, navigation }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const network = useAppSelector((state) => selectNetwork(state));
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
    <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>

      <View style={styles.innerContainer}>

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.genericButton }]}
            onPress={() => navigation.navigate('QR')}
          >
            <Text style={{color: 'white'}}>Scan config from QRCode</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>
            WebSocket
          </Text>

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
                  payload: {
                    webSocketEnabled: value,
                  },
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
                  payload: {
                    webSocketUrl,
                  },
                });
              }}
            />
          </View>
        </View>


        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Accelerometer</Text>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>Frequency</Text>
            <TextInput
              style={[styles.input, styles.smallInput]}
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
            <Text style={styles.item}> Hz</Text>
          </View>

        </View>

      </View>
    </KeyboardAwareScrollView>
  );
}
