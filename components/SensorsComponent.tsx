import * as React from 'react';

import {
  Platform,
  Text,
} from 'react-native';

import {
  Accelerometer,
  // Barometer,
  // Gyroscope,
  // Magnetometer,
  // MagnetometerUncalibrated,
  // Pedometer,
} from 'expo-sensors';

import { useAppSelector, useAppDispatch } from '../hooks';

import { selectSensors } from '../features/sensors/sensorsSlice';
import { selectSettings } from '../features/settings/settingsSlice';


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

export default function SensorsComponent({color}) {
  // console.log('SensorsComponent render');

  const settings = useAppSelector( (state) => {
    return selectSettings(state);
  });
  const sensors = useAppSelector( (state) => {
    return selectSensors(state);
  });
  const dispatch = useAppDispatch();

  const [accelerometerListener, setAccelerometerListener] = React.useState(null);

  const setAccelerometerFrequency = (frequency) => {
    // in milliseconds
    const accelerometerInterval = (frequency > 0
                                   ? 1000 / frequency
                                   : 1000 / 60);
    Accelerometer.setUpdateInterval(accelerometerInterval);
  };

  const accelerometerSubscribe = () => {
    console.log('accelerometer.subscribe');
    setAccelerometerFrequency(settings.accelerometerFrequency);
    setAccelerometerListener(
      Accelerometer.addListener(accelerometer => {
        const normalisedAccelerometer = normaliseAccelerometer(accelerometer);
        dispatch({
          type: 'sensors/set',
          payload: {
            accelerometer,
          },
        });
      })
    );
  };

  const accelerometerUnsubscribe = () => {
    console.log('accelerometer.unsubscribe');
    accelerometerListener && accelerometerListener.remove();
    setAccelerometerListener(null);
  };

  // see https://daveceddia.com/useeffect-hook-examples/

  // run once and callback on unmount
  React.useEffect(() => {
    console.log('run once and (on unmount except first time)');
    accelerometerSubscribe();
    return () => accelerometerUnsubscribe();
  }, []);

  // // run once
  // React.useEffect(() => {
  //   console.log('run once');
  //   accelerometerSubscribe();
  // }, []);


  // // run on unmount
  // React.useEffect(() => {
  //   console.log('run on unmount');
  //   return () => accelerometerUnsubscribe();
  // }, []);

  // run on dependencies update
  React.useEffect(() => {
    console.log('run on settings.accelerometerFrequency');
    setAccelerometerFrequency(settings.accelerometerFrequency);
  }, [settings.accelerometerFrequency]);


  return (
  <Text>
    Sensors Component
  </Text>
  );
}
