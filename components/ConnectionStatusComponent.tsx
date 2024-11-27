import * as React from 'react';
import {
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import { batch } from 'react-redux';

import { Text, View, WebSocketConnectionStatus, OscConnectionStatus } from './Themed';
import ColouredSwitch from '../screens/ColouredSwitch';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';
import { selectSettings } from '../features/settings/settingsSlice';

export default function ConnectionStatusComponent({ color, compact, invisible }) {
  const network = useAppSelector((state) => selectNetwork(state));
  const settings = useAppSelector((state) => selectSettings(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'space-evenly',
      borderRadius: 2,
    },

    subgroup: {
      flexDirection: 'row',
      flexWrap: "wrap",
      alignItems: 'center',
      justifyContent: 'flex-start',
    },

    label: {
      width: 90,
      fontWeight: 'bold',
    },

    containerCompact: {
      flexDirection: 'row',
      flexWrap: "wrap",
      alignItems: 'center',
      justifyContent: 'space-evenly',
      flex: 700,
      verticalAlign: 'middle',
    },

    labelCompact: {
      fontWeight: 'bold',
    },
  });

  if (compact) {
    return (
      <View style={styles.containerCompact}>
        <Text style={styles.labelCompact}>WebSocket</Text>
        <WebSocketConnectionStatus
          status={network.webSocketReadyState}
        />
        <Text style={styles.labelCompact}>OSC</Text>
        <OscConnectionStatus
          status={network.oscReadyState}
        />
      </View>
    )
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.subgroup}>
          <Text style={styles.label}>WebSocket</Text>

          <ColouredSwitch
            styles={styles}
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
          <WebSocketConnectionStatus
            style={{ marginLeft: 'auto' }}
            status={network.webSocketReadyState}
          />
        </View>
        <View style={styles.subgroup}>
          <Text style={styles.label}>OSC</Text>

          <ColouredSwitch
            styles={styles}
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

          <OscConnectionStatus
            style={{ marginLeft: 'auto' }}
            status={network.oscReadyState}
          />
        </View>
      </View>
    );
  }
}

