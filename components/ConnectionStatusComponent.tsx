import * as React from 'react';
import {
  StyleSheet,
  Platform,
  Switch,
} from 'react-native';
import { batch } from 'react-redux';

import { Text, View, WebSocketConnectionStatus, OscConnectionStatus } from './Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';
import { selectSettings } from '../features/settings/settingsSlice';

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

export default function ConnectionStatusComponent({ color }) {
  const network = useAppSelector((state) => selectNetwork(state));
  const settings = useAppSelector((state) => selectSettings(state));
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.subgroup}>
        <Text style={styles.label}>WebSocket</Text>
        <Switch style={styles.item}
          trackColor={ Platform.OS !== "ios"
                       ? (settings.webSocketEnabled ? colors.tint : '#999999')
                       : undefined }
          thumbColor={ Platform.OS !== "ios"
                       ? (settings.webSocketEnabled ? colors.tint : colors.text)
                       : undefined }
          ios_backgroundColor={ settings.webSocketEnabled ? colors.tint : '#999999' }
          value={
            settings.webSocketEnabled && (
              network.webSocketReadyState === 'CONNECTING_REQUEST' ||
              network.webSocketReadyState === 'CONNECTING' ||
              network.webSocketReadyState === 'OPEN'
            )
          }
          onValueChange={(value) => {
            batch(() => {
              dispatch({
                type: 'settings/set',
                payload: { webSocketEnabled: value },
              });

              if (value) {
                dispatch({
                  type: 'network/set',
                  payload: { webSocketReadyState: 'CONNECTING_REQUEST' },
                });
              }
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
        <Switch style={styles.item}
          trackColor={ Platform.OS !== "ios"
                       ? (settings.oscEnabled ? colors.tint : '#999999')
                       : undefined }
          thumbColor={ Platform.OS !== "ios"
                       ? (settings.oscEnabled ? colors.tint : colors.text)
                       : undefined }
          ios_backgroundColor={ settings.oscEnabled ? colors.tint : '#999999' }
          value={
            settings.oscEnabled && (
              network.oscReadyState === 'OPENING_REQUEST' ||
              network.oscReadyState === 'OPENING' ||
              network.oscReadyState === 'OPEN'
            )
          }
          onValueChange={(value) => {
            batch(() => {
              dispatch({
                type: 'settings/set',
                payload: { oscEnabled: value },
              });

              if (value) {
                dispatch({
                  type: 'network/set',
                  payload: { oscReadyState: 'OPENING_REQUEST' },
                });
              }
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

