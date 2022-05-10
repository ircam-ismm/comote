import * as React from 'react';

import {
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Text, View } from '../components/Themed';

import {
  Accelerometer,
  // Barometer,
  Gyroscope,
  // Magnetometer,
  // MagnetometerUncalibrated,
  // Pedometer,
} from 'expo-sensors';

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

if(global.performance == null) {
    global.performance = {
      now: global._chronoNow,
    };
}

export default function PlayScreen({color}) {
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // @TODO: allow for multitouch

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Pressable
            style={({pressed}) => [
              styles.button,
              styles.buttonA,
              pressed ? {opacity: 0.5} : {},
            ]}
            onPressIn={ () => {
              dispatch({
                type: 'sensors/set',
                payload: {
                  buttonA: 1,
                },
              })
            } }
            onPressOut={ () => {
              dispatch({
                type: 'sensors/set',
                payload: {
                  buttonA: 0,
                },
              })
            } }
        >
          <Text style={styles.buttonText}
            selectable={false}
          >
            A
          </Text>
        </Pressable>

        <Pressable
            style={({pressed}) => [
              styles.button,
              styles.buttonB,
              pressed ? {opacity: 0.5} : {},
            ]}
            onPressIn={ () => {
              dispatch({
                type: 'sensors/set',
                payload: {
                  buttonB: 1,
                },
              })
            } }
            onPressOut={ () => {
              dispatch({
                type: 'sensors/set',
                payload: {
                  buttonB: 0,
                },
              })
            } }
        >
          <Text style={styles.buttonText}
            selectable={false}
          >
            B
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 16,
  },

  network: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
  },

  buttonsContainer: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-around',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
  },

  buttonA: {
    backgroundColor: '#ffc20a',
  },

  buttonB: {
    backgroundColor: '#0c7bdc',
  },

  buttonText: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 60,
    color: 'white',
  },
});
