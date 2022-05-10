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
  Button,
} from 'react-native';
import { Text, View } from '../components/Themed';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import { selectNetwork } from '../features/network/networkSlice';

// import engine from '../engine';

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
          <Text style={styles.groupTitle}>Network</Text>
          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>Activate</Text>
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
            {/*<Text
              style={[
                styles.item,
                {color: settings.webSocketEnabled ? colors.tint : colors.text},
              ]}
              onPress={() => {
                dispatch({
                  type: 'settings/set',
                  payload: {
                    webSocketEnabled: !settings.webSocketEnabled,
                  },
                });
              }}
            >
              {settings.webSocketEnabled ? 'Enabled' : 'Disabled'}
            </Text>*/}
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              Status
            </Text>
            <Text style={[
              styles.item,
              (network.webSocketReadyState === 'OPEN'
                ? styles.webSocketOpen
                : styles.webSocketNotOpen)
              ]}>
              {settings.webSocketEnabled ? network.webSocketReadyState : 'DISCONNECTED' }
            </Text>
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

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}></Text>
            <Button
              title="Scan URL from QRCode"
              onPress={() => navigation.navigate('QR')}
            />
          </View>
        </View>


        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Accelerometer</Text>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>Frequency</Text>
            <TextInput
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
            <Text style={styles.item}> Hz</Text>
          </View>

        </View>

      </View>
    </KeyboardAwareScrollView>
  );
}

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
    width: '100%',
    borderBottomColor: '#989898',
    borderBottomWidth: 1,
    fontSize: 16,
  },

  itemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 8,
    flex: 1,
  },

  item: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    marginRight: 5,
    fontSize: 14,
  },

  label: {
    display: 'inline-block',
    width: 80,
  },

  webSocketNotOpen: {
    color: '#ff2266',
  },

  input: {
    flex: 1,
    fontSize: 16,
    borderColor: '#ababab',
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderStyle: 'solid',
    paddingHorizontal: 7,
    backgroundColor: '#efefef',
  },

  frequencyInput: {
    maxWidth: 50,
    textAlign: 'center',
  },
});
