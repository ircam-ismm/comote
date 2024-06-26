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

export default function ConnectionStatusComponent({ color, invisible }) {
  const network = useAppSelector((state) => selectNetwork(state));
  const settings = useAppSelector((state) => selectSettings(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'space-evenly',
      height: 100,
      borderRadius: 2,
    },

    subgroup: {
      flexDirection: 'row',
      flexWrap: "wrap",
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginHorizontal: 12,
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },

    label: {
      width: 90,
      fontWeight: 'bold',
    },
  });
  
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

