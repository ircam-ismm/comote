import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { batch } from 'react-redux';
import * as Linking from 'expo-linking';

import i18n from '../constants/i18n';

import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { Text, View, WebSocketConnectionStatus, OscConnectionStatus } from '../components/Themed';
import ColouredSwitch from './ColouredSwitch';

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSettings } from '../features/settings/settingsSlice';
import { selectNetwork } from '../features/network/networkSlice';

import urlParse from 'url-parse';

import { engine } from '../engine';

import stringIsNumeric from '../helpers/stringIsNumeric.js';
import isURL from '../helpers/isURL';

export default function SettingsScreen({ color, navigation }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const network = useAppSelector((state) => selectNetwork(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.background,
    },

    groupContainer: {
      alignItems: 'flex-start',
      marginBottom: 20,
    },

    groupTitle: {
      marginBottom: 3,
      fontSize: Platform.OS === 'ios' ? 18 : 16,
    },

    description: {
      marginVertical: 10,
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

    labelLarge: {
      width: 140,
    },

    input: {
      flex: 1,
      fontSize: Platform.OS === 'ios' ? 16 : 14,
      borderColor: colors.inputBorder,
      paddingVertical: Platform.OS === 'ios' ? 8 : 4,
      paddingHorizontal: Platform.OS === 'ios' ? 10 : 7,
      paddingRight: 7,
      color: colors.text,
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 4,
      backgroundColor: colors.inputBackground,
    },

    smallInput: {
      flex: 0,
      width: 50,
      textAlign: 'center',
    },

    mediumInput: {
      flex: 0,
      width: 80,
      textAlign: 'center',
    },

    bigInput: {
      flex: 0,
      width: 110,
      textAlign: 'center',
    },

    button: {
      alignItems: "center",
      padding: 16,
      borderRadius: 4,
      alignSelf: 'stretch',
      backgroundColor: colors.genericButton,
    },

    switch: {

    },

    sensorAvailable: {
      color: colors.green,
    },

    sensorNotAvailable: {
      color: colors.red,
    },

  });

  // local value for display
  const [sensorsMultipleAvailable, setSensorsMultipleAvailable] = React.useState({});
  React.useEffect(() => {
    // before async mount

    (async () => {
      const sensorsMultipleAvailable = await engine.sensors.sensorsAvailable();
      setSensorsMultipleAvailable(sensorsMultipleAvailable);
    })();

  }, []);


  // temporary value for editing
  const [webSocketUrl, setWebSocketUrl]
    = React.useState(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');

  // update local value for coercion by store
  React.useEffect(() => {
    setWebSocketUrl(settings.webSocketUrl ? `${settings.webSocketUrl}` : '');
  }, [settings.webSocketUrl]);

  // temporary value for editing
  const [oscUrl, setOscUrl]
    = React.useState(settings.oscUrl ? `${settings.oscUrl}` : '');

  // update local value for coercion by store
  React.useEffect(() => {
    const url = settings.oscUrl ? `${settings.oscUrl}` : '';
    setOscUrl(url);
    const { hostname, port } = urlParse(url);
    setOscHostname(hostname);
    setOscPort(port);
  }, [settings.oscUrl]);

  const [oscHostname, setOscHostname] = React.useState('');
  const [oscPort, setOscPort] = React.useState('');

  React.useEffect(() => {
    setOscUrl(`udp://${oscHostname}:${oscPort}`);
  }, [oscHostname, oscPort])

  // temporary value for editing
  const [sensorsInterval, setSensorsInterval]
    = React.useState(`${settings.sensorsInterval}`);

  // update local value for coercion by store
  React.useEffect(() => {
    setSensorsInterval(`${settings.sensorsInterval}`);
  }, [settings.sensorsInterval]);

  // temporary value for editing
  const [webviewContent, setWebviewContent] = React.useState(`${settings.webviewContent}`);

  // update local value for coercion by store (...not really sure what this does)
  React.useEffect(() => {
    let sanitized;

    if (isURL(settings.webviewContent)) {
      sanitized = settings.webviewContent;
    } else if (settings.webviewContent === '') {
      sanitized = '';
    } else {
      sanitized = '[HTML]';
    }

    setWebviewContent(sanitized);
  }, [settings.webviewContent]);

  // temporary value for editing
  const [id, setId] = React.useState(`${settings.id}`);

  // update local value for coercion by store (...not really sure what this does)
  React.useEffect(() => {
    setId(`${settings.id}`);
  }, [settings.id]);

  // local value for display
  const [sensorsIntervalEstimate, setSensorsIntervalEstimate] = React.useState({});
  // declare callback in main render function
  const setSensorsIntervalEstimateFromEngine = React.useCallback(() => {
    setSensorsIntervalEstimate(engine.sensors.intervalEstimate)
  }, []);

  React.useEffect(() => {
    // mount
    return () => {
      // unmount
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // prevent sleep when tab is focused
      const keepAwakeTag = 'comote:settings';
      activateKeepAwakeAsync(keepAwakeTag);
      // update sensors interval estimate only when tab is focused
      const sensorsIntervalEstimateUpdateId = setInterval(() => {
        setSensorsIntervalEstimateFromEngine();
      }, 1000);

      return () => {
        deactivateKeepAwake(keepAwakeTag);
        clearInterval(sensorsIntervalEstimateUpdateId);
      };
    }, [])
  );


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { flex: 1 }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >

      <ScrollView style={styles.container}>

        {/* INFO SECTION */}
        <View style={styles.groupContainer}>

          <Text style={styles.description}>
            {i18n.t('settings.outputApiChange')}
          </Text>

          {/* V2 MODE SECTION */}
          <View style={styles.groupContainer}>
            <View style={styles.borderBottom}>
              <Text style={styles.groupTitle}>
                {i18n.t('settings.outputApi.header')}
              </Text>
            </View>

            <View style={styles.itemContainer}>

              <Text style={[styles.label, styles.item]}>
                {i18n.t('settings.outputApi.activate')}
              </Text>

              <ColouredSwitch styles={styles}
                colors={colors}
                value={settings.outputApi === 'v2'}
                onValueChange={(value) => {
                  batch(() => {
                    dispatch({
                      type: 'settings/set',
                      payload: { outputApi: value ? 'v2' : 'v3' },
                    });

                  });
                }}
              />

            </View>

          </View>

          <TouchableOpacity
            style={[styles.button, styles.item]}
            onPress={() => {
              Linking.openURL('https://apps.ismm.ircam.fr/comote');
            }}>
            <Text style={{ color: 'white' }}>{i18n.t('about.comoteWebsite')}</Text>
          </TouchableOpacity>

        </View>

        {/* SENSORS SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              {i18n.t('settings.sensors.header')}
            </Text>
          </View>

          <View style={styles.separator}></View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.labelLarge]}>
              {i18n.t('settings.sensors.accelerometer')}
            </Text>
            <Text style={[
              styles.item,
              sensorsMultipleAvailable.accelerometerAvailable
                ? styles.sensorAvailable
                : styles.sensorNotAvailable
            ]}>
              {sensorsMultipleAvailable.accelerometerAvailable
                ? i18n.t('settings.sensors.isAvailable')
                : i18n.t('settings.sensors.isNotAvailable')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.labelLarge]}>
              {i18n.t('settings.sensors.gyroscope')}
            </Text>
            <Text style={[
              styles.item,
              sensorsMultipleAvailable.gyroscopeAvailable
                ? styles.sensorAvailable
                : styles.sensorNotAvailable
            ]}>
              {sensorsMultipleAvailable.gyroscopeAvailable
                ? i18n.t('settings.sensors.isAvailable')
                : i18n.t('settings.sensors.isNotAvailable')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.labelLarge]}>
              {i18n.t('settings.sensors.magnetometer')}
            </Text>
            <Text style={[
              styles.item,
              sensorsMultipleAvailable.magnetometerAvailable
                ? styles.sensorAvailable
                : styles.sensorNotAvailable
            ]}>
              {sensorsMultipleAvailable.magnetometerAvailable
                ? i18n.t('settings.sensors.isAvailable')
                : i18n.t('settings.sensors.isNotAvailable')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.labelLarge]}>
              {i18n.t('settings.sensors.heading')}
            </Text>
            <Text style={[
              styles.item,
              sensorsMultipleAvailable.headingAvailable
                ? styles.sensorAvailable
                : styles.sensorNotAvailable
            ]}>
              {sensorsMultipleAvailable.headingAvailable
                ? i18n.t('settings.sensors.isAvailable')
                : i18n.t('settings.sensors.isNotAvailable')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}
          >
            <Text style={{ color: 'white' }}>{i18n.t('settings.sensors.openSettings')}</Text>
          </TouchableOpacity>

        </View>

        {/* MISC SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              {i18n.t('settings.general.header')}
            </Text>
          </View>
          <View style={styles.separator}></View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              {i18n.t('settings.general.id')}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder='Enter Id here'
              placeholderTextColor="#676767"
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
              {i18n.t('settings.general.period')}
            </Text>
            <TextInput
              style={[styles.input, styles.mediumInput]}
              keyboardType='numeric'
              returnKeyType='done'
              selectTextOnFocus={true}
              placeholder='Enter period (in ms) here'
              placeholderTextColor="#676767"
              value={sensorsInterval}
              onChange={e => {
                setSensorsInterval(e.nativeEvent.text);
              }}
              onBlur={e => {
                if (stringIsNumeric(sensorsInterval)) {
                  batch(() => {
                    dispatch({
                      type: 'settings/set',
                      payload: {
                        sensorsInterval: parseFloat(sensorsInterval),
                      },
                    });
                  });
                } else {
                  setSensorsInterval(`${settings.sensorsInterval}`);
                }
              }}
            />
            <Text style={styles.item}
            > ms </Text>

            {/* new line */}
            {/* <Text style={[styles.item, {width: '100%'}]}></Text>
            <Text style={[styles.item, styles.label]}></Text> */}

            <Text style={styles.item}
            >({i18n.t('settings.general.estimated')}: {Math.round(sensorsIntervalEstimate * 10) / 10}
              ms)
            </Text>
          </View>

        </View>

        {/* WEBSOCKET SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              {i18n.t('settings.websocket.header')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              {i18n.t('settings.websocket.activate')}
            </Text>

            <ColouredSwitch styles={styles}
              colors={colors}
              value={settings.webSocketEnabled}
              onValueChange={(value) => {
                batch(() => {
                  dispatch({
                    type: 'settings/set',
                    payload: { webSocketEnabled: value },
                  });

                });
              }}
            />

          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              {i18n.t('settings.websocket.status')}
            </Text>
            <WebSocketConnectionStatus style={styles.item} status={network.webSocketReadyState} />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              {i18n.t('settings.websocket.url')}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder={i18n.t('settings.websocket.urlPlaceholder')}
              placeholderTextColor="#676767"
              value={webSocketUrl}
              onChange={(e) => {
                setWebSocketUrl(e.nativeEvent.text);
              }}
              onBlur={(e) => {
                batch(() => {
                  dispatch({
                    type: 'settings/set',
                    payload: { webSocketUrl },
                  });
                });
              }}
            />
          </View>
        </View>

        {/* OSC SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              {i18n.t('settings.osc.header')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              {i18n.t('settings.osc.activate')}
            </Text>

            <ColouredSwitch styles={styles}
              colors={colors}
              value={settings.oscEnabled}
              onValueChange={(value) => {
                batch(() => {
                  dispatch({
                    type: 'settings/set',
                    payload: { oscEnabled: value },
                  });

                });
              }}
            />

          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.label, styles.item]}>
              {i18n.t('settings.osc.status')}
            </Text>
            <OscConnectionStatus style={styles.item} status={network.oscReadyState} />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              {i18n.t('settings.osc.hostname')}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder={i18n.t('settings.osc.hostnamePlaceholder')}
              placeholderTextColor="#676767"
              value={oscHostname}
              onChange={(e) => {
                setOscHostname(e.nativeEvent.text);
              }}
              onBlur={(e) => {
                batch(() => {
                  dispatch({
                    type: 'settings/set',
                    payload: { oscUrl: `udp://${oscHostname}:${oscPort}` },
                  });
                });
              }}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              {i18n.t('settings.osc.port')}
            </Text>
            <TextInput
              style={[styles.input, styles.mediumInput]}
              keyboardType='numeric'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder={i18n.t('settings.osc.portPlaceholder')}
              placeholderTextColor="#676767"
              value={oscPort}
              onChange={(e) => {
                setOscPort(e.nativeEvent.text);
              }}
              onBlur={(e) => {
                if (stringIsNumeric(oscPort)) {
                  batch(() => {
                    dispatch({
                      type: 'settings/set',
                      payload: { oscUrl: `udp://${oscHostname}:${oscPort}` },
                    });
                  });
                } else {
                  const url = `${settings.oscUrl}`;
                  setOscUrl(url);
                  const { hostname, port } = urlParse(url);
                  setOscPort(port);
                }
              }}
            />
          </View>
        </View>

        {/* WEBVIEW SECTION */}
        <View style={styles.groupContainer}>
          <View style={styles.borderBottom}>
            <Text style={styles.groupTitle}>
              {i18n.t('settings.webview.header')}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <Text style={[styles.item, styles.label]}>
              {i18n.t('settings.webview.url')}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType='default'
              returnKeyType='done'
              selectTextOnFocus={false}
              placeholder={i18n.t('settings.webview.urlPlaceholder')}
              placeholderTextColor="#676767"
              value={webviewContent}
              onChange={(e) => {
                setWebviewContent(e.nativeEvent.text);
              }}
              onBlur={(e) => {
                batch(() => {
                  dispatch({
                    type: 'settings/set',
                    payload: { webviewContent },
                  });
                });
              }}
            />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
