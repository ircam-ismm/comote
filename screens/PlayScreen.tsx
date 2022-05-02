import * as React from 'react';

import {
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Text, View } from '../components/Themed';

import {
  Accelerometer,
  Barometer,
  Gyroscope,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';

import { useAppSelector, useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { selectSensors } from '../features/sensors/sensorsSlice';

// see https://w3c.github.io/accelerometer/
const g = 9.80665;
const normaliseAccelerometer
  = (Platform.OS === 'android'
     ? (data) => {
       return {
         x: -data.x * g,
         y: -data.y * g,
         z: -data.z * g,
       };
     }
     : (data) => {
       return {
         x: data.x * g,
         y: data.y * g,
         z: data.z * g,
       };
     }
    );

// const accelerometer = {
//     x: 0,
//     y: 0,
//     z: 0,
// };
// function setAccelerometerData(data) {
//   Object.assign(accelerometer, data);
// }

if(global.performance == null) {
    global.performance = {
      now: global._chronoNow,
    };
}

export default function PlayScreen({color}) {
  // const [accelerometer, setAccelerometerData] = React.useState({
  //   x: 0,
  //   y: 0,
  //   z: 0,
  // });

  const sensors = useAppSelector( (state) => {
    return selectSensors(state);
  });
  const dispatch = useAppDispatch();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const {accelerometer} = sensors;

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

function coucou(msg) {
  console.log(msg);
}

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  network: {
    // display: 'none',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
  },

  buttonsContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '90%',
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
