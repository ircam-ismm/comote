import * as React from 'react';

import {
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import { Text, View, ConnectionStatus } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';
import { selectSettings } from '../features/settings/settingsSlice';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    height: 100,
  },

  subgroup: {
    flexDirection: 'row',
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 12,
  },

  label: {
    width: 120,
  },
});

export default function ConnectionStatusComponent({ color }) {
  const network = useAppSelector((state) => selectNetwork(state));
  const settings = useAppSelector((state) => selectSettings(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.subgroup}>
        <Text style={styles.label}>WebSocket: </Text>
        <Switch
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
        <ConnectionStatus
          style={{ marginLeft: 'auto' }}
          status={network.webSocketReadyState}
        />
      </View>
      <View style={styles.subgroup}>
        <Text style={styles.label}>OSC: </Text>
        <Switch
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
              payload: {
                oscEnabled: value,
              },
            });
          }}
        />
      </View>
    </View>
  );
}

