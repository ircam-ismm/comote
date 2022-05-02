import * as React from 'react';

import {
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Text, View } from '../components/Themed';

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectNetwork } from '../features/network/networkSlice';
import { selectSettings } from '../features/settings/settingsSlice';

export default function NetworkScreen({color}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const settings = useAppSelector( (state) => {
    return selectSettings(state);
  });
  const network = useAppSelector( (state) => {
    return selectNetwork(state);
  });
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>

      <Text style={{color: colors.text }}>
        {network.webSocketReady
         ? 'WebSocket ready'
         : 'WebSocket disconnected'}
     </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 60,
  },
  buttonA: {
    backgroundColor: '#ffc20a',
  },
  buttonB: {
    backgroundColor: '#0c7bdc',
  },
});
